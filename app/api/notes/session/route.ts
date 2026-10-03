import { NextRequest } from "next/server";
import { authenticated, cookieOptions, LEGACY_SESSION_COOKIE, requireSameOrigin, revokeSession, SESSION_COOKIE } from "@/src/notes/auth";
import { failure, json } from "@/src/notes/http";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try { return json({ authenticated: await authenticated(req) }); }
  catch (error) { return failure(error); }
}

export async function POST() {
  // No fallback to the old shared key, including while OAuth is unconfigured.
  return json({ error: "投稿キーでのログインは終了しました。画面を更新し、GitHubでログインしてください。" }, 410);
}

export async function DELETE(req: NextRequest) {
  try {
    requireSameOrigin(req);
    await revokeSession(req);
    const response = json({ authenticated: false });
    response.cookies.set(SESSION_COOKIE, "", { ...cookieOptions, maxAge: 0 });
    response.cookies.set(LEGACY_SESSION_COOKIE, "", { ...cookieOptions, maxAge: 0 });
    return response;
  } catch (error) { return failure(error); }
}
