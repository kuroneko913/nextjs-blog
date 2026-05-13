const CACHE_NAME = "kuroneko-blog-v1";
// Only precache truly static assets; runtime routes are cached on first visit
const PRECACHE_ASSETS = [
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) =>
        // Use individual adds so one failure doesn't abort the whole install
        Promise.all(
          PRECACHE_ASSETS.map((url) => cache.add(url).catch(() => {}))
        )
      )
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => caches.delete(name))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  // Only handle GET requests for same-origin
  if (
    event.request.method !== "GET" ||
    !event.request.url.startsWith(self.location.origin)
  ) {
    return;
  }

  // Skip Next.js internal requests and API routes
  const url = new URL(event.request.url);
  if (
    url.pathname.startsWith("/_next/") ||
    url.pathname.startsWith("/api/")
  ) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) {
        // Return cached version; keep SW alive while revalidating in background
        const revalidatePromise = fetch(event.request)
          .then((response) => {
            if (response && response.status === 200) {
              return caches.open(CACHE_NAME).then((cache) =>
                cache.put(event.request, response.clone())
              );
            }
          })
          .catch(() => {});
        event.waitUntil(revalidatePromise);
        return cached;
      }

      return fetch(event.request)
        .then((response) => {
          if (!response || response.status !== 200 || response.type !== "basic") {
            return response;
          }
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          return response;
        })
        .catch(() => {
          // Return offline fallback for navigation requests
          if (event.request.mode === "navigate") {
            return caches.match("/");
          }
        });
    })
  );
});
