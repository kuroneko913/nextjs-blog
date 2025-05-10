import toolsDef from './tools.json';

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
          // クライアントがサポートするバージョンを使用
          const clientProtocolVersion = rpc.params?.protocolVersion;
          if (clientProtocolVersion !== "2024-11-05") {
            console.warn(`[MCP] Unexpected protocolVersion: ${clientProtocolVersion}`);
          }
          const serverInfo = {
            jsonrpc: "2.0",
            id: rpc.id,
            result: {
              protocolVersion: clientProtocolVersion,
              capabilities: {
                tools: {
                  listChanged: true
                },
                logging: {},
                resources: {
                  subscribe: true,
                  listChanged: true
                }
              },
              serverInfo: {
                name: "mcp_tools",
                version: "0.0.1",
                description: "MCP Tools Server"
              },
              instructions: "Use get_weather(location) to get today's weather."
            }
          };
          controller.enqueue(encoder.encode(JSON.stringify(serverInfo) + "\n"));
          break;

        case 'notifications/initialized':
          // initialized通知を受け取った後の処理
          const initializedResponse = {
            jsonrpc: "2.0",
            id: rpc.id,
            result: null
          };
          controller.enqueue(encoder.encode(JSON.stringify(initializedResponse) + "\n"));
          break;

        case 'tools/list':
          const tools = {
            jsonrpc: '2.0',
            id: rpc.id ?? null,
            result: {
              tools: toolsDef.tools
            },
          };
          controller.enqueue(encoder.encode(JSON.stringify(tools) + "\n"));
          break;

        case 'tools/call':
          try {
            const { name: toolName, arguments: args } = rpc.params;
            const tool = toolsDef.tools.find(t => t.name === toolName);
            if (!tool) {
              throw new Error(`Tool ${toolName} not found`);
            }
            const handler = await import(`./${tool.name}/route`);
            console.time("weather");
            try {
              const res = await handler[tool.name](args);
              controller.enqueue(encoder.encode(JSON.stringify({
                jsonrpc: '2.0',
                id: rpc.id ?? null,
                result: res
              }) + "\n"));
            } catch (e) {
              const error = {
                jsonrpc: '2.0',
                id: rpc.id ?? null,
                error: { 
                  code: -32602, 
                  message: (e instanceof Error) ? e.message : 'Invalid params' 
                },
              };
              controller.enqueue(encoder.encode(JSON.stringify(error) + "\n"));
            } finally {
              console.timeEnd("weather");
            }
          } catch (e) {
            const error = {
              jsonrpc: '2.0',
              id: rpc.id ?? null,
              error: { code: -32601, message: `Unknown method ${rpc.method}` },
            };
            controller.enqueue(encoder.encode(JSON.stringify(error) + "\n"));
          }
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
