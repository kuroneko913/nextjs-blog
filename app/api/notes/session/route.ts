import { NextRequest } from "next/server";
import { authenticated, consumeLoginAttempt, correctKey, createSession, requireSameOrigin, resetLoginAttempts, SESSION_COOKIE, SESSION_SECONDS } from "@/src/notes/auth";
import { failure, json, readJson } from "@/src/notes/http";
import { NoteError } from "@/src/notes/model";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest) { return json({ authenticated: authenticated(req) }); }

export async function POST(req: NextRequest) {
  try {
    requireSameOrigin(req);
    const body = await readJson(req, 2048) as { key?: unknown } | null;
    await consumeLoginAttempt();
    if (!correctKey(body?.key)) throw new NoteError(401, "投稿キーが違うようです。もう一度確認してください。");
    await resetLoginAttempts();
    const response = json({ authenticated: true });
    response.cookies.set(SESSION_COOKIE, createSession(), { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/api/notes", maxAge: SESSION_SECONDS });
    return response;
  } catch (error) { return failure(error); }
}

export async function DELETE(req: NextRequest) {
  try {
    requireSameOrigin(req);
    const response = json({ authenticated: false });
    response.cookies.set(SESSION_COOKIE, "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/api/notes", maxAge: 0 });
    return response;
  } catch (error) { return failure(error); }
}
