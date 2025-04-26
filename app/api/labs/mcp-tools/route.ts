export const runtime = 'edge';
const encoder = new TextEncoder();

// 共通で使う util
function streamResponse(send: (writer: WritableStreamDefaultWriter) => void) {
  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();
  send(writer);                 // SSE データを書き込む
  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}

/* ---------- GET ＝ SSE 接続 ---------- */
export async function GET(req: Request) {
  const accept = req.headers.get('accept') || '';
  if (!accept.includes('text/event-stream')) {
    return new Response('Bad Request', { status: 400 });
  }

  return streamResponse(writer => {
    const serverInfo = {
      jsonrpc: "2.0",
      id: "server_info",
      result: {
        name: "mcp_tools",
        version: "0.0.1",
        capabilities: { tools: true },
        instructions: "Use get_weather(location) to get today's weather."
      }
    };

    writer.write(encoder.encode(`data: ${JSON.stringify(serverInfo)}\n\n`));

    setTimeout(() => writer.close(), 1000);
  });
}

/* ---------- POST ＝ JSON‑RPC メッセージ ---------- */
export async function POST(req: Request) {
  const rpc = await req.json();

  // 簡易ルータ
  switch (rpc.method) {
    case 'initialize':
      return Response.json({
        jsonrpc: '2.0',
        id: rpc.id ?? null,
        result: {
          protocolVersion: '2024-11-05',
          capabilities: { tools: true },
          serverInfo: { name: 'mcp_tools', version: '0.0.1' },
        },
      });

    case 'tools/list':
      return Response.json({
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
      });

    case 'tools/invoke':
      // 実際には OpenWeatherMap 等を呼ぶ
      const weather = { location: rpc.params.args.location, temp: 18, cond: 'Cloudy' };
      return Response.json({
        jsonrpc: '2.0',
        id: rpc.id ?? null,
        result: { tool_response: { name: 'get_weather', result: weather } },
      });

    default:
      return Response.json({
        jsonrpc: '2.0',
        id: rpc.id ?? null,
        error: { code: -32601, message: `Unknown method ${rpc.method}` },
      });
  }
}