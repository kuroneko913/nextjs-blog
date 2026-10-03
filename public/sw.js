const CACHE_NAME = "kuroneko-blog-v3";
const PRECACHE_ASSETS = ["/icons/icon-192x192.png", "/icons/icon-512x512.png"];

async function cacheComposer(cache) {
  try {
    const response = await fetch("/notes/new");
    if (!response.ok || response.redirected || response.headers.get("cache-control")?.includes("no-store")) return;
    const html = await response.clone().text();
    // Include the shell's JS/CSS so its very first offline launch can hydrate.
    const assets = [...html.matchAll(/\b(?:src|href)="(\/_next\/static\/[^\"]+)"/g)].map(match => match[1]);
    await Promise.all([...new Set(assets)].map(url => cache.add(url)));
    await cache.put("/notes/new", response);
  } catch { /* An offline update must not break the currently open page. */ }
}

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => Promise.all(
    [...PRECACHE_ASSETS.map(url => cache.add(url).catch(() => {})), cacheComposer(cache)]
  )).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then(names => Promise.all(
    names.filter(name => name.startsWith("kuroneko-blog-") && name !== CACHE_NAME).map(name => caches.delete(name))
  )).then(() => self.clients.claim()));
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin) return;
  // Never cache credentials, API responses, RSC payloads, or development bundles.
  if (url.pathname.startsWith("/api/") || request.headers.has("RSC") || url.searchParams.has("_rsc") || (url.pathname.startsWith("/_next/") && !url.pathname.startsWith("/_next/static/"))) return;
  const staticAsset = url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icons/") || url.pathname.startsWith("/images/");
  const navigation = request.mode === "navigate";
  if (!staticAsset && !navigation) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cacheKey = url.pathname === "/notes/new" && navigation ? "/notes/new" : request;
    const cached = await cache.match(cacheKey);
    if (staticAsset && cached) return cached;
    try {
      const response = await fetch(request);
      // The composer is a public shell; its draft lives only in localStorage.
      if (response.ok && response.type === "basic" && !response.redirected && !response.headers.get("cache-control")?.includes("no-store")) {
        await cache.put(cacheKey, response.clone());
      }
      return response;
    } catch {
      if (cached) return cached;
      if (navigation) return new Response('<!doctype html><html lang="ja"><meta name="viewport" content="width=device-width,initial-scale=1"><meta charset="utf-8"><title>オフラインです</title><body style="font-family:sans-serif;padding:32px;background:#f6f5f0;color:#243a32"><h1>いまはオフラインです</h1><p>一度開いた投稿画面では、書きかけを残せます。</p><a href="/notes/new">実験メモを書く</a><p>初めて開くときは、インターネットに接続してください。</p></body></html>', { status: 503, headers: { "Content-Type": "text/html;charset=utf-8" } });
      return Response.error();
    }
  })());
});
