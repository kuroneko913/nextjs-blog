import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { githubConfig, NOTES_ORIGIN, OWNER_GITHUB_ID } from "./auth";

export const AUTH_ORIGIN = NOTES_ORIGIN;
export const CALLBACK_PATH = "/api/notes/oauth/callback";
export const OAUTH_COOKIE = "blackcat-notes-oauth";
export const OAUTH_SECONDS = 10 * 60;
export const oauthCookieOptions = { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" as const, path: "/api/notes/oauth" };
export type LoginResult = "success" | "cancelled" | "denied" | "expired" | "failed" | "unavailable";

function sign(value: string) {
  return createHmac("sha256", githubConfig().clientSecret).update(`blackcat-notes-oauth-v1:${value}`).digest("hex");
}

function equal(a: string, b: string) {
  const first = Buffer.from(a); const second = Buffer.from(b);
  return first.length === second.length && timingSafeEqual(first, second);
}

export function startOAuth() {
  const { clientId } = githubConfig();
  const state = randomBytes(32).toString("base64url");
  const verifier = randomBytes(32).toString("base64url");
  const expires = Math.floor(Date.now() / 1000) + OAUTH_SECONDS;
  const payload = `${expires}.${state}.${verifier}`;
  const cookie = `${payload}.${sign(payload)}`;
  const url = new URL("https://github.com/login/oauth/authorize");
  url.search = new URLSearchParams({ client_id: clientId, redirect_uri: AUTH_ORIGIN + CALLBACK_PATH, state,
    code_challenge: createHash("sha256").update(verifier).digest("base64url"), code_challenge_method: "S256",
    scope: "", allow_signup: "false" }).toString();
  return { url, cookie };
}

export function oauthVerifier(req: NextRequest) {
  const cookie = req.cookies.get(OAUTH_COOKIE)?.value;
  const state = req.nextUrl.searchParams.get("state");
  if (!cookie || !state || !/^\d{10}\.[A-Za-z0-9_-]{43}\.[A-Za-z0-9_-]{43}\.[a-f0-9]{64}$/.test(cookie)) return null;
  const [expires, expectedState, verifier, signature] = cookie.split(".");
  const now = Math.floor(Date.now() / 1000);
  if (Number(expires) <= now || Number(expires) > now + OAUTH_SECONDS || !equal(state, expectedState)) return null;
  if (!equal(signature, sign(`${expires}.${expectedState}.${verifier}`))) return null;
  return verifier;
}

export function loginRedirect(result: LoginResult) {
  const url = new URL("/notes/new", AUTH_ORIGIN);
  url.searchParams.set("login", result);
  const response = NextResponse.redirect(url, 303);
  response.headers.set("Cache-Control", "no-store");
  response.headers.set("Referrer-Policy", "no-referrer");
  response.cookies.set(OAUTH_COOKIE, "", { ...oauthCookieOptions, maxAge: 0 });
  return response;
}

// Tokens stay on the server for this request only. Never persist or log them.
export async function githubOwner(code: string, verifier: string): Promise<boolean> {
  const { clientId, clientSecret } = githubConfig();
  const exchange = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST", headers: { Accept: "application/json", "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ client_id: clientId, client_secret: clientSecret, code, code_verifier: verifier, redirect_uri: AUTH_ORIGIN + CALLBACK_PATH }),
    cache: "no-store", redirect: "error", signal: AbortSignal.timeout(10000),
  });
  if (!exchange.ok) throw new Error("GitHubTokenExchangeFailed");
  const token = await exchange.json();
  if (typeof token.access_token !== "string" || !token.access_token || token.token_type?.toLowerCase() !== "bearer") throw new Error("GitHubTokenMissing");
  // This dedicated app must never acquire repository, email or private-profile scopes.
  if (typeof token.scope !== "string" || token.scope.trim() !== "") throw new Error("UnexpectedGitHubScope");
  const profile = await fetch("https://api.github.com/user", {
    headers: { Accept: "application/vnd.github+json", Authorization: `Bearer ${token.access_token}`, "User-Agent": "blackcat-experiment-notes", "X-GitHub-Api-Version": "2022-11-28" },
    cache: "no-store", redirect: "error", signal: AbortSignal.timeout(10000),
  });
  if (!profile.ok) throw new Error("GitHubIdentityFailed");
  const user = await profile.json();
  return user.id === OWNER_GITHUB_ID;
}
