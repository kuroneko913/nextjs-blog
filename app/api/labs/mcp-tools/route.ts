export const runtime = 'edge';
const encoder = new TextEncoder();

/* ---------- POST ＝ JSON‑RPC メッセージ ---------- */
export async function POST(req: Request) {
  const rpc = await req.json();

  const stream = new ReadableStream({
    async start(controller) {
      // ここでswitch文でメソッドごとにレスポンスを返す
      switch (rpc.method) {
        case 'initialize':
          const serverInfo = {
            jsonrpc: "2.0",
            id: rpc.id,
            result: {
              name: "mcp_tools",
              version: "0.0.1",
              capabilities: { tools: true },
              instructions: "Use get_weather(location) to get today's weather.",
            },
          };
          controller.enqueue(encoder.encode(JSON.stringify(serverInfo) + "\n"));
          break;

        case 'tools/list':
          const tools = {
            jsonrpc: '2.0',
            id: rpc.id ?? null,
            result: [
              {
                name: 'get_weather',
                description: '都市の天気を取得します',
                parameters: {
                  type: 'object',
                  properties: {
                    location: { type: 'string', description: '都市名 (例: Tokyo,JP)' },
                  },
                  required: ['location'],
                },
              },
            ],
          };
          controller.enqueue(encoder.encode(JSON.stringify(tools) + "\n"));
          break;

        case 'tools/invoke':
          const weather = { location: rpc.params.args.location, temp: 18, cond: 'Cloudy' };
          const result = {
            jsonrpc: '2.0',
            id: rpc.id ?? null,
            result: { tool_response: { name: 'get_weather', result: weather } },
          };
          controller.enqueue(encoder.encode(JSON.stringify(result) + "\n"));
          break;

        default:
          const error = {
            jsonrpc: '2.0',
            id: rpc.id ?? null,
            error: { code: -32601, message: `Unknown method ${rpc.method}` },
          };
          controller.enqueue(encoder.encode(JSON.stringify(error) + "\n"));
      }
      controller.close();
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/json+stream",
      "Access-Control-Allow-Origin": "*",
    },
  });
}