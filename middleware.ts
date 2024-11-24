import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest): NextResponse {
    const url = req.nextUrl.clone();
    const pathname = url.pathname;

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
