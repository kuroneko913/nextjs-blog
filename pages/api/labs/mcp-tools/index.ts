// pages/api/labs/mcp-tools.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Connection', 'keep-alive');
  
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
    res.end();
  } else if (req.method === 'POST') {
    // POST 処理…
  } else {
    res.setHeader('Allow', ['GET','POST']);
    res.status(405).end();
  }
}
