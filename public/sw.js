const CACHE_NAME = "voxshare-v1";
// These will be replaced or managed manually if needed,
// but for a simple "always-isolated" SW, we focus on the fetch wrapper.
const ASSETS_TO_CACHE = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png",
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE)));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Standard PWA caching strategy (Network first, then Cache)
  // But always wrap the response to add COOP/COEP headers
  event.respondWith(
    (async () => {
      try {
        // Try network first
        let response;
        try {
          response = await fetch(request);
        } catch (_e) {
          // Fallback to cache
          response = await caches.match(request);
        }

        if (!response) {
          return new Response("Not found", { status: 404 });
        }

        // Status 0 is for opaque responses (cross-origin without CORS)
        // We cannot modify headers on these.
        if (response.status === 0) {
          return response;
        }

        const newHeaders = new Headers(response.headers);
        newHeaders.set("Cross-Origin-Embedder-Policy", "require-corp");
        newHeaders.set("Cross-Origin-Opener-Policy", "same-origin");
        newHeaders.set("Cross-Origin-Resource-Policy", "cross-origin");

        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: newHeaders,
        });
      } catch (_e) {
        return fetch(request);
      }
    })(),
  );
});
