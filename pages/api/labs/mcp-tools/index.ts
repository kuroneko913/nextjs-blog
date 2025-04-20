// pages/api/labs/mcp-tools.ts
import type { NextApiRequest, NextApiResponse } from 'next';

type JsonRpcRequest = {
  jsonrpc: string;
  method: string;
  params?: any;
  id?: number | string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: {
        code: -32600,
        message: "Method not found"
      }
    });
  }
  const body: JsonRpcRequest = req.body;

  // initialize method
  if (body.method === 'initialize') {
    res.status(200).json(createInitializeResponse(body));
    return;
  }
  if (body.method === 'tools/list') {
    res.status(200).json(createToolsListResponse(body));
    return;
  }

  // method not found error
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
    id: body.id, 
    result: {
      protocolVersion: "2024-11-05",
      capabilities: {
        tools: true,
        resources: false,
        prompts: false,
      },
      serverInfo: {
        name: "kuroneko-mcp-tools",
        version: "0.0.1",
        description: "https://myblackcat913.com MCP tools",
      },
      instructions: "kuroneko-mcp-tools is a experimental tools for learning by kuroneko913.",
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

//       res.setHeader('Access-Control-Allow-Origin', '*');

//       // 初期化レスポンスを送信
//       const initResponse = {
//         jsonrpc: "2.0",
//         id: 0,
//         result: {
//           protocolVersion: "2024-11-05",
//           capabilities: {
//             tools: {}
//           },
//           serverInfo: {
//             name: "kuroneko-mcp-tools",
//             version: "1.0.0"
//           }
//         }
//       };
//       res.write(`data: ${JSON.stringify(initResponse)}\n\n`);

//       // initialized通知を送信
//       const initializedNotification = {
//         method: "notifications/initialized",
//         jsonrpc: "2.0"
//       };
//       res.write(`data: ${JSON.stringify(initializedNotification)}\n\n`);

//       // ツール一覧を送信
//       const toolsResponse = {
//         jsonrpc: "2.0",
//         id: 2,
//         result: {
//           tools: getTools().tools
//         }
//       };
//       res.write(`data: ${JSON.stringify(toolsResponse)}\n\n`);

//       // 20秒に1度コメント行で心拍を送る
//       const keepAlive = setInterval(() => {
//         res.write(': ping\n\n');
//       }, 20000);

//       req.on('close', () => {
//         clearInterval(keepAlive);
//         res.end();
//       });

//     } catch (error) {
//       console.error('Error in SSE handler:', error);
//       const errorResponse = {
//         jsonrpc: "2.0",
//         id: null,
//         error: {
//           code: -32603,
//           message: "Internal error",
//           data: error instanceof Error ? error.message : "Unknown error"
//         }
//       };
//       res.write(`data: ${JSON.stringify(errorResponse)}\n\n`);
//       res.status(500).end();
//     }
//   } else if (req.method === 'POST') {
//     // tools/callメソッドの処理
//     try {
//       const { method, params, id } = req.body;
      
//       if (method === 'tools/call') {
//         const { name, arguments: args } = params;
//         if (name === 'get_weather') {
//           const response = {
//             jsonrpc: "2.0",
//             id,
//             result: {
//               content: [
//                 {
//                   type: "text",
//                   text: `天気情報: ${args.location}は晴れです。`
//                 }
//               ]
//             }
//           };
//           return res.json(response);
//         }
//       }

//       return res.status(400).json({
//         jsonrpc: "2.0",
//         id,
//         error: {
//           code: -32601,
//           message: "Method not found"
//         }
//       });
//     } catch (error) {
//       return res.status(500).json({
//         jsonrpc: "2.0",
//         id: null,
//         error: {
//           code: -32603,
//           message: "Internal error",
//           data: error instanceof Error ? error.message : "Unknown error"
//         }
//       });
//     }
//   } else {
//     res.setHeader('Allow', ['GET', 'POST']);
//     res.status(405).end(`Method ${req.method} Not Allowed`);
//   }
// }
