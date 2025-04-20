// pages/api/labs/mcp-tools.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-store',
      'Connection': 'keep-alive',
    })
  
    const tools = {
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
    res.write(`event: tools\ndata: ${JSON.stringify(tools)}\n\n`);

    // 20秒に1度コメント行で心拍を送る
    const keepAlive = setInterval(() => res.write(': ping\n\n'), 20_000);

    req.socket.on('close', () => {
      clearInterval(keepAlive);
      res.end();
    });
  }
}
