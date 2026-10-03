import { NextRequest } from "next/server";
import { requireSameOrigin } from "@/src/notes/auth";
import { failure, json } from "@/src/notes/http";
import { NoteError } from "@/src/notes/model";
import { AUTH_ORIGIN, OAUTH_COOKIE, OAUTH_SECONDS, oauthCookieOptions, startOAuth } from "@/src/notes/oauth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    requireSameOrigin(req);
    if (req.nextUrl.origin !== AUTH_ORIGIN) throw new NoteError(403, "ログインはmyblackcat913.comで利用できます。この画面の書きかけは、移動前にコピーしてください。");
    const { url, cookie } = startOAuth();
    const response = json({ url: url.toString() });
    response.headers.set("Referrer-Policy", "no-referrer");
    response.cookies.set(OAUTH_COOKIE, cookie, { ...oauthCookieOptions, maxAge: OAUTH_SECONDS });
    return response;
  } catch (error) { return failure(error); }
}
