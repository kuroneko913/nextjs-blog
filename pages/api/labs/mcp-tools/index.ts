// pages/api/labs/mcp-tools.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('Access-Control-Allow-Origin', '*');

      const response = {
        jsonrpc: "2.0",
        id: 2,
        result: {
          tools: getTools().tools
        }
      };

      // データを送信
      res.write(`data: ${JSON.stringify(response)}\n\n`);

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
      res.status(500).end('Internal Server Error');
    }
  } else {
    res.setHeader('Allow', ['GET']);
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
