export async function GET() {
  const toolList = {
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

  const ssePayload = `data: ${JSON.stringify(toolList)}\n\n`;

  return new Response(ssePayload, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    }
  });
}
