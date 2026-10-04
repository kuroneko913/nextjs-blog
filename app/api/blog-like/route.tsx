import { NextRequest, NextResponse } from 'next/server';
import { getLikeCounts, toggleLike, validLikeSlug } from '@/src/blogLikes';
import { LikeLimitError } from '@/src/security/likeBudget';
import { limitedJson, RequestBodyError } from '@/src/security/requestJson';

const failure = (error: unknown) => error instanceof LikeLimitError
  ? NextResponse.json({ error: 'しばらく待ってからお試しください。' }, { status: 429, headers: { 'Retry-After': '60', 'Cache-Control': 'no-store' } })
  : NextResponse.json({ error: 'いいねを取得・更新できませんでした。' }, { status: 503 });

export async function POST(req: NextRequest) {
  const origin = req.headers.get('origin');
  if (origin !== 'https://myblackcat913.com' && !(process.env.NODE_ENV !== 'production' && origin === req.nextUrl.origin)) {
    return NextResponse.json({ error: 'Invalid origin' }, { status: 403 });
  }
  let body;
  try { body = await limitedJson(req, 2048); }
  catch (error) { return NextResponse.json({ error: 'Invalid request body' }, { status: error instanceof RequestBodyError ? error.status : 400 }); }
  if (!validLikeSlug(body?.slug)) return NextResponse.json({ error: 'Unknown article' }, { status: 400 });
  // Global limits remain effective even if a client identity/header changes.
  const identity = req.headers.get('x-nf-client-connection-ip') || req.ip || req.headers.get('x-forwarded-for');
  if (!identity || identity.length > 100) return NextResponse.json({ error: 'Client unavailable' }, { status: 503 });
  try { return NextResponse.json({ liked: await toggleLike(body.slug, identity) }); }
  catch (error) { return failure(error); }
}

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug');
  if (slug !== null && !validLikeSlug(slug)) return NextResponse.json({ error: 'Unknown article' }, { status: 400 });
  try {
    const result = await getLikeCounts();
    return NextResponse.json({ result: slug === null ? result : result[slug] || 0 }, { headers: { 'Cache-Control': 'public, max-age=60' } });
  } catch (error) { return failure(error); }
}
