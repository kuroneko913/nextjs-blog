import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest): NextResponse {
    const url = req.nextUrl.clone();
    const pathname = url.pathname;
    const accept = req.headers.get('accept') || '';
    const ua = req.headers.get('user-agent')?.toLowerCase() || '';

    // CursorやAIエージェントからのMCPっぽいアクセス判定
    const isRootPath = pathname === '/'
    const isJsonRequest = accept.includes('application/json')
    const isFromCursor = ua.includes('cursor')
    const isFromClaude = ua.includes('anthropic') || ua.includes('claude')
    const isFromOpenAI = ua.includes('openai') || ua.includes('gpt')

    const isMCPClient = isJsonRequest && (isFromCursor || isFromClaude || isFromOpenAI)

    // MCPクライアントがルートに来たときのみ、MCP情報を返す
    if (isRootPath && isMCPClient) {
      return new NextResponse(
        JSON.stringify({
          name: 'My BlackCat MCP Server',
          description: 'Hybrid blog & MCP server (weather tool available)',
          version: '0.1.0',
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
    }

    if (pathname === "/") {
      return NextResponse.next();
    }

    // 既に `/blog` で始まっている場合は処理を続行（リダイレクトしない）
    if (pathname.startsWith("/blog")) {
      return NextResponse.next();
    }

    // リダイレクト: /xxxx -> /blog/xxxx
    url.pathname = `/blog${pathname}`;
    return NextResponse.redirect(url);
}

export const config = {
    matcher: [
      /*
         * 除外パスの条件を適用し、残りをリダイレクト対象とする
         * - 除外: api,about,lab,_next/static, _next/image, favicon.ico, sitemap.xml, robots.txt,/ 
         */
      '/((?!api|about|lab|_next/static|_next/image|images|favicon.ico|sitemap.xml|robots.txt).*)',
    ],
}
