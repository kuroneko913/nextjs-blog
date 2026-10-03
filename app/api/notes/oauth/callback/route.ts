import { NextRequest } from "next/server";
import { cookieOptions, createSession, LEGACY_SESSION_COOKIE, OWNER_GITHUB_ID, SESSION_COOKIE, SESSION_SECONDS } from "@/src/notes/auth";
import { githubOwner, loginRedirect, oauthVerifier } from "@/src/notes/oauth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    // GitHub's redirect URI is fixed. A signed host-only state cookie and PKCE
    // bind the callback to that browser's login; the proxy's URL is not a signal.
    const verifier = oauthVerifier(req);
    if (!verifier) return loginRedirect("expired");
    if (req.nextUrl.searchParams.has("error")) return loginRedirect("cancelled");
    const code = req.nextUrl.searchParams.get("code");
    if (!code || code.length > 512) return loginRedirect("failed");
    if (!await githubOwner(code, verifier)) return loginRedirect("denied");
    const token = await createSession(OWNER_GITHUB_ID);
    const response = loginRedirect("success");
    response.cookies.set(SESSION_COOKIE, token, { ...cookieOptions, maxAge: SESSION_SECONDS });
    response.cookies.set(LEGACY_SESSION_COOKIE, "", { ...cookieOptions, maxAge: 0 });
    return response;
  } catch {
    // Never put a provider error, OAuth code or token in a log or redirect URL.
    return loginRedirect("failed");
  }
}
