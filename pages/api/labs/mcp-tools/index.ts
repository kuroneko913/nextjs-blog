// pages/api/labs/mcp-tools.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('Access-Control-Allow-Origin', '*');

      // 初期化レスポンスを送信
      const initResponse = {
        jsonrpc: "2.0",
        id: 0,
        result: {
          protocolVersion: "2024-11-05",
          capabilities: {
            tools: {}
          },
          serverInfo: {
            name: "kuroneko-mcp-tools",
            version: "1.0.0"
          }
        }
      };
      res.write(`data: ${JSON.stringify(initResponse)}\n\n`);

      // initialized通知を送信
      const initializedNotification = {
        method: "notifications/initialized",
        jsonrpc: "2.0"
      };
      res.write(`data: ${JSON.stringify(initializedNotification)}\n\n`);

      // ツール一覧を送信
      const toolsResponse = {
        jsonrpc: "2.0",
        id: 2,
        result: {
          tools: getTools().tools
        }
      };
      res.write(`data: ${JSON.stringify(toolsResponse)}\n\n`);

      // 20秒に1度コメント行で心拍を送る
      const keepAlive = setInterval(() => {
        res.write(': ping\n\n');
      }, 20000);

      req.on('close', () => {
        clearInterval(keepAlive);
        res.end();
      });

    } catch (error) {
      console.error('Error in SSE handler:', error);
      const errorResponse = {
        jsonrpc: "2.0",
        id: null,
        error: {
          code: -32603,
          message: "Internal error",
          data: error instanceof Error ? error.message : "Unknown error"
        }
      };
      res.write(`data: ${JSON.stringify(errorResponse)}\n\n`);
      res.status(500).end();
    }
  } else if (req.method === 'POST') {
    // tools/callメソッドの処理
    try {
      const { method, params, id } = req.body;
      
      if (method === 'tools/call') {
        const { name, arguments: args } = params;
        if (name === 'get_weather') {
          const response = {
            jsonrpc: "2.0",
            id,
            result: {
              content: [
                {
                  type: "text",
                  text: `天気情報: ${args.location}は晴れです。`
                }
              ]
            }
          };
          return res.json(response);
        }
      }

      return res.status(400).json({
        jsonrpc: "2.0",
        id,
        error: {
          code: -32601,
          message: "Method not found"
        }
      });
    } catch (error) {
      return res.status(500).json({
        jsonrpc: "2.0",
        id: null,
        error: {
          code: -32603,
          message: "Internal error",
          data: error instanceof Error ? error.message : "Unknown error"
        }
      });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
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
        method: "POST",
        url: "https://myblackcat913.com/api/labs/mcp-tools/get_weather",
        requestSchema: {
          type: "object",
          properties: {
            arguments: {
              type: "object",
              properties: {
                location: { type: "string" }
              },
              required: ["location"]
            }
          },
          required: ["arguments"]
        },
        responseSchema: {
          type: "object",
          properties: {
            tool_response: {
              type: "object",
              properties: {
                name: { type: "string" },
                result: { type: "string" }
              },
              required: ["name", "result"]
            }
          },
          required: ["tool_response"]
        }
      }
    ]
  };
}
