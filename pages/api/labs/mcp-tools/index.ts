import type { NextApiRequest, NextApiResponse } from 'next';

type JsonRpcRequest = {
  jsonrpc: string;
  method: string;
  params?: any;
  id?: number | string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // デバッグログ
  console.log('[MCP] Received request:', {
    method: req.method,
    url: req.url,
    headers: req.headers,
    body: req.body
  });
  
  if (req.method === 'GET' && req.headers.accept?.includes('text/event-stream')) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    // 最初の接続確認用データを送信
    const ready = {
      jsonrpc: "2.0",
      method: "event",
      params: {
        type: "ready",
        message: "MCP tools initialized"
      }
    }
    res.write(`data: ${JSON.stringify(ready)}\n\n`);
    console.log('[SSE] ready:', ready);

    let count = 0;
    const interval = setInterval(() => {
      if (count >= 1) {
        clearInterval(interval);
        res.end();
        return;
      }
      const heartbeat = {
        jsonrpc: "2.0",
        method: "event",
        params: {
          type: "heartbeat",
          message: "still alive"
        }
      }
      res.write(`data: ${JSON.stringify(heartbeat)}\n\n`);
      console.log('[SSE] heartbeat:', heartbeat);
      count++;
    }, 5000);
  }
  console.log('[MCP] Connection established');

  if (req.method !== 'POST') {
    const methodNotFound = {
      jsonrpc: "2.0",
      id: null,
      error: {
        code: -32600,
        message: "Method not found"
      }
    }
    res.setHeader('Content-Type', 'application/json');
    res.write(`data: ${JSON.stringify(methodNotFound)}\n\n`);
    console.log('[MCP] methodNotFound:', methodNotFound);
    return;
  }
  const body: JsonRpcRequest = req.body;
  console.log('[MCP] body:', body);

  // initialize method
  if (body.method === 'initialize') {
    const initialize = {
      jsonrpc: "2.0",
      id: body.id ?? null,
      result: createInitializeResponse(body)
    }
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(initialize);
    console.log('[MCP] Handling initialize request:', body);
    return;
  }
  // tools/list method
  if (body.method === 'tools/list') {
    const toolsList = {
      jsonrpc: "2.0",
      id: body.id ?? null,
      result: createToolsListResponse(body)
    }
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(toolsList);
    console.log('[MCP] Handling tools/list request:', body);
    return;
  }
  // tools/invoke method
  if (body.method === 'tools/invoke') {
    console.log('[MCP] Handling tools/invoke request:', body);
    res.setHeader('Content-Type', 'application/json');
    await invokeTool(body, res);
    return;
  }

  // method not found error
  console.log('[MCP] Method not found:', body.method);
  res.setHeader('Content-Type', 'application/json');
  res.status(400).json(createMethodNotFoundErrorResponse(body));
}

/**
 * 初期化レスポンスを作成する
 * @param body リクエストボディ
 * @returns 初期化レスポンス
 */
const createInitializeResponse = (body: JsonRpcRequest) => {
  return { 
    jsonrpc: "2.0", 
    id: body.id ?? null,
    result: {
      protocolVersion: "2024-11-05",
      capabilities: {
        tools: true,
        resources: false,
        prompts: false,
      },
      serverInfo: {
        name: "mcp_tools",
        version: "0.0.1",
        description: "https://myblackcat913.com MCP tools",
      },
      instructions: "This server provides tools like 'get_weather'. Try asking about the weather in a city!",
      _meta: {
        version: "0.0.1",
        description: "https://myblackcat913.com MCP tools",
      }
    } 
  }
}

const createToolsListResponse = (body: JsonRpcRequest) => {
  return {
    jsonrpc: "2.0",
    id: body.id ?? null,
    result: getTools().tools
  }
}

/**
 * ツールを呼び出す
 * /api/labs/mcp-tools/{tool} にPOSTリクエストを送信する
 * @param body リクエストボディ
 * @param res レスポンス
 */
const invokeTool = async (body: JsonRpcRequest, res: NextApiResponse) => {
  const {tool, args} = body.params || {};
    if (!tool) {
      res.status(400).json(createMethodInvokeErrorResponse(body));
      return;
    }
    try {
      console.log(`[TOOL] invokeTool: ${tool}`);
      console.log(`[TOOL] args: ${JSON.stringify(args)}`);
      console.log(`[TOOL] endpoint: ${process.env.NEXT_PUBLIC_API_URL}/api/labs/mcp-tools/${tool}`);
      console.log(`[TOOL] body: ${JSON.stringify(body)}`);
      const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/labs/mcp-tools/${tool}`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ arguments: args }),
      });
      const data = await response.json();
      console.log(`[TOOL] data: ${JSON.stringify(data)}`);
      res.status(200).json({
        jsonrpc: "2.0",
        id: body.id ?? null,
        result: {
          tool_response: {
            name: tool,
            result: data.tool_response?.result ?? "No result returned",
          },
        }
      });
    } catch (error) {
      console.error(`[ERROR] tools/invoke error:`, error);
      return res.status(200).json({
        jsonrpc: "2.0",
        id: body.id,
        error: {
          code: -32000,
          message: `Tool "${tool}" invocation failed: ${error}`,
        }
      });
    }
}

/**
 * ツールのリストを取得する
 * @returns {Object} ツールのリスト
 */
const getTools = () => {
  return {
    tools: [
      {
        name: "get_weather",
        description: "都市の天気を取得します。",
        parameters: {
          type: "object",
          properties: {
            location: { type: "string", description: "都市名(Ex. Tokyo,JP)" }
          },
          required: ["location"]
        }
      }
    ]
  };
}

/**
 * メソッドが見つからないエラーレスポンスを作成する
 * @param body リクエストボディ
 * @returns メソッドが見つからないエラーレスポンス
 */
const createMethodNotFoundErrorResponse = (body: JsonRpcRequest) => {
  return {
    jsonrpc: "2.0",
    id: body.id ?? null,
    error: {
      code: -32601,
      message: `Method ${body.method} not found`
    }
  }
}

const createMethodInvokeErrorResponse = (body: JsonRpcRequest) => {
  return {
    jsonrpc: "2.0",
    id: body.id ?? null,
    error: {
      code: -32602,
      message: `Tool ${body.params?.tool} not found`
    }
  }
}
