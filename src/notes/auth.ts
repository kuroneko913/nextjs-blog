import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { NextRequest } from "next/server";
import { NoteError } from "./model";
import { getNotesDb } from "./db";

export const SESSION_COOKIE = "blackcat-notes-session";
export const SESSION_SECONDS = 60 * 60 * 24 * 90;

function secret() {
  const key = process.env.NOTES_ADMIN_KEY;
  if (!key || key.length < 32) throw new NoteError(503, "投稿の準備中です。しばらくしてからお試しください。");
  return key;
}

function sign(value: string) { return createHmac("sha256", secret()).update(value).digest("hex"); }
function equal(a: string, b: string) { return a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b)); }

export function correctKey(value: unknown) {
  if (typeof value !== "string" || value.length > 512) return false;
  return equal(sign(`login:${value}`), sign(`login:${secret()}`));
}

export function createSession() {
  const payload = `${Math.floor(Date.now() / 1000) + SESSION_SECONDS}.${randomBytes(16).toString("hex")}`;
  return `${payload}.${sign(`session:${payload}`)}`;
}

export function authenticated(req: NextRequest) {
  const value = req.cookies.get(SESSION_COOKIE)?.value;
  if (!value || !/^\d{10}\.[0-9a-f]{32}\.[0-9a-f]{64}$/.test(value)) return false;
  const [expires, nonce, signature] = value.split(".");
  if (Number(expires) <= Date.now() / 1000) return false;
  try { return equal(signature, sign(`session:${expires}.${nonce}`)); } catch { return false; }
}

export function requireOwner(req: NextRequest) {
  if (!authenticated(req)) throw new NoteError(401, "投稿するにはログインしてください。入力したメモはこの端末に残っています。");
}

export function requireSameOrigin(req: NextRequest) {
  if (req.headers.get("origin") !== req.nextUrl.origin) throw new NoteError(403, "投稿画面を開き直してお試しください。");
}

// Persist the limit across serverless instances; never trust a caller-supplied IP.
// A single-owner app uses one bucket. A successful login resets it.
export async function consumeLoginAttempt() {
  secret();
  const db = getNotesDb();
  const ref = db.collection("experiment-notes-private").doc("login-rate-limit");
  await db.runTransaction(async transaction => {
    const snapshot = await transaction.get(ref);
    const previous = snapshot.data();
    const now = Date.now();
    const active = previous && previous.resetAt > now;
    const count = active ? previous.count : 0;
    if (count >= 10) throw new NoteError(429, "ログインを何度か試したため、15分ほど待ってからお試しください。");
    transaction.set(ref, { count: count + 1, resetAt: active ? previous.resetAt : now + 15 * 60 * 1000 });
  });
}

export async function resetLoginAttempts() {
  await getNotesDb().collection("experiment-notes-private").doc("login-rate-limit").delete();
}
