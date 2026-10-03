import { createHash, createHmac, randomBytes } from "node:crypto";
import { NextRequest } from "next/server";
import { NoteError } from "./model";
import { getNotesDb } from "./db";

// GitHub's immutable numeric ID, not a renameable login or email address.
export const OWNER_GITHUB_ID = 20674685; // kuroneko913
export const SESSION_COOKIE = "blackcat-notes-github-session";
export const LEGACY_SESSION_COOKIE = "blackcat-notes-session";
export const SESSION_SECONDS = 60 * 60 * 24 * 30;
export const cookieOptions = { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict" as const, path: "/api/notes" };

export function githubConfig() {
  const clientId = process.env.NOTES_GITHUB_CLIENT_ID;
  const clientSecret = process.env.NOTES_GITHUB_CLIENT_SECRET;
  if (!clientId || !clientSecret || clientSecret.length < 32) throw new NoteError(503, "GitHubログインを設定中です。書きかけはこの端末に残せます。");
  return { clientId, clientSecret };
}

function sessionVersion() {
  return createHmac("sha256", githubConfig().clientSecret).update("blackcat-notes-session-version-v1").digest("hex");
}

function sessionRef(token: string) {
  const hash = createHash("sha256").update(token).digest("hex");
  return getNotesDb().collection("experiment-notes-private").doc(`session-${hash}`);
}

export async function createSession(githubId: number) {
  if (githubId !== OWNER_GITHUB_ID) throw new NoteError(403, "このGitHubアカウントでは投稿できません。");
  const version = sessionVersion();
  const token = randomBytes(32).toString("base64url");
  await sessionRef(token).create({ githubId, version, expiresAt: new Date(Date.now() + SESSION_SECONDS * 1000) });
  return token;
}

export async function authenticated(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token || !/^[A-Za-z0-9_-]{43}$/.test(token)) return false;
  // Missing configuration, legacy sessions and rotated credentials all fail closed.
  let version: string;
  try { version = sessionVersion(); } catch { return false; }
  const record = (await sessionRef(token).get()).data();
  const expiresAt = record?.expiresAt?.toDate?.() ?? record?.expiresAt;
  return record?.githubId === OWNER_GITHUB_ID && record?.version === version && expiresAt instanceof Date && expiresAt.getTime() > Date.now();
}

export async function revokeSession(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (token && /^[A-Za-z0-9_-]{43}$/.test(token)) await sessionRef(token).delete();
}

export async function requireOwner(req: NextRequest) {
  if (!await authenticated(req)) throw new NoteError(401, "投稿するにはGitHubでログインしてください。入力したノートはこの端末に残っています。");
}

export function requireSameOrigin(req: NextRequest) {
  if (req.headers.get("origin") !== req.nextUrl.origin) throw new NoteError(403, "投稿画面を開き直してお試しください。");
}
