import { NextRequest } from "next/server";
import { cookieOptions, createSession, LEGACY_SESSION_COOKIE, OWNER_GITHUB_ID, SESSION_COOKIE, SESSION_SECONDS } from "@/src/notes/auth";
import { AUTH_ORIGIN, githubOwner, loginRedirect, oauthVerifier } from "@/src/notes/oauth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    if (req.nextUrl.origin !== AUTH_ORIGIN) return loginRedirect(req, "production");
    const verifier = oauthVerifier(req);
    if (!verifier) return loginRedirect(req, "expired");
    if (req.nextUrl.searchParams.has("error")) return loginRedirect(req, "cancelled");
    const code = req.nextUrl.searchParams.get("code");
    if (!code || code.length > 512) return loginRedirect(req, "failed");
    if (!await githubOwner(code, verifier)) return loginRedirect(req, "denied");
    const token = await createSession(OWNER_GITHUB_ID);
    const response = loginRedirect(req, "success");
    response.cookies.set(SESSION_COOKIE, token, { ...cookieOptions, maxAge: SESSION_SECONDS });
    response.cookies.set(LEGACY_SESSION_COOKIE, "", { ...cookieOptions, maxAge: 0 });
    return response;
  } catch {
    // Never put a provider error, OAuth code or token in a log or redirect URL.
    return loginRedirect(req, "failed");
  }
}
