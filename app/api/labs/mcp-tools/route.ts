export const runtime = 'edge';
const encoder = new TextEncoder();

// グローバルでSSEのwriterを管理
let streamWriter: WritableStreamDefaultWriter | null = null;

/* ---------- GET ＝ SSE 接続 ---------- */
export async function GET(req: Request) {
  const accept = req.headers.get('accept') || '';
  if (!accept.includes('text/event-stream')) {
    return new Response('Bad Request', { status: 400 });
  }

  const { readable, writable } = new TransformStream();
  streamWriter = writable.getWriter();

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

  // Send server_info immediately upon connection
  await streamWriter.write(encoder.encode(`data: ${JSON.stringify(serverInfo)}\n\n`));

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

/* ---------- POST ＝ JSON‑RPC メッセージ ---------- */
export async function POST(req: Request) {
  if (!streamWriter) {
    return new Response('Bad Request', { status: 400 });
  }
  const rpc = await req.json();

  // 簡易ルータ
  switch (rpc.method) {
    case 'initialize':
      const serverInfo = {
        jsonrpc: "2.0",
        id: rpc.id ?? null,
        result: {
          name: "mcp_tools",
          version: "0.0.1", 
          capabilities: { tools: true },
          instructions: "Use get_weather(location) to get today's weather.",
        },
      };
      await streamWriter.write(encoder.encode(`data: ${JSON.stringify(serverInfo)}\n\n`));
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      });

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
      await streamWriter.write(encoder.encode(`data: ${JSON.stringify(tools)}\n\n`));
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      });

    case 'tools/invoke':
      // 実際には OpenWeatherMap 等を呼ぶ
      const weather = { location: rpc.params.args.location, temp: 18, cond: 'Cloudy' };
      const result = {
        jsonrpc: '2.0',
        id: rpc.id ?? null,
        result: { tool_response: { name: 'get_weather', result: weather } },
      };
      await streamWriter.write(encoder.encode(`data: ${JSON.stringify(result)}\n\n`));
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      });

    default:
      const error = {
        jsonrpc: '2.0',
        id: rpc.id ?? null,
        error: { code: -32601, message: `Unknown method ${rpc.method}` },
      };
      await streamWriter.write(encoder.encode(`data: ${JSON.stringify(error)}\n\n`));
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      });
  }
}