const CACHE_NAME = "voxshare-v3";

// Workbox replaces this placeholder at build time with the full list of
// current-deployment assets (URLs + revision hashes). Falls back to [] in dev.
const PRECACHE_ASSETS = self.__WB_MANIFEST ?? [];

const SHELL_ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png",
];

// Vite content-hashes everything under /assets/, making those chunks immutable.
// WASM/ONNX/worker scripts are large binaries that don't change per deployment.
// Cache-first is safe for all of these.
function isCacheFirst(pathname) {
  return (
    pathname.includes("/assets/") ||
    pathname.endsWith(".wasm") ||
    pathname.endsWith(".onnx") ||
    pathname.endsWith(".mjs") ||
    pathname.endsWith("vad.worklet.bundle.min.js")
  );
}

function withIsolationHeaders(response) {
  if (!response || response.status === 0) return response;
  const headers = new Headers(response.headers);
  headers.set("Cross-Origin-Embedder-Policy", "require-corp");
  headers.set("Cross-Origin-Opener-Policy", "same-origin");
  headers.set("Cross-Origin-Resource-Policy", "cross-origin");
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

self.addEventListener("install", (event) => {
  self.skipWaiting();
  // Pre-cache the shell only; large WASM/ONNX assets are populated lazily
  // by serveCacheFirst on first use so the install doesn't block on ~12 MB.
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_ASSETS)));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // 1. Delete caches left by older SW versions (different CACHE_NAME).
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)));

      // 2. Evict stale entries within the current cache.
      //    Any URL that is neither a shell asset nor in the current build's
      //    manifest belongs to a previous deployment and can be deleted.
      const scope = self.registration.scope;
      const currentUrls = new Set([
        ...SHELL_ASSETS.map((a) => new URL(a, scope).href),
        ...PRECACHE_ASSETS.map((e) => new URL(e.url, scope).href),
      ]);
      const cache = await caches.open(CACHE_NAME);
      const stale = (await cache.keys()).filter((req) => !currentUrls.has(req.url));
      await Promise.all(stale.map((req) => cache.delete(req)));

      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Let cross-origin requests (fonts, CDN, etc.) pass through unmodified —
  // we can't set headers on opaque responses and CORS resources don't need it.
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    isCacheFirst(url.pathname) ? serveCacheFirst(request) : serveNetworkFirst(request),
  );
});

async function serveCacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return withIsolationHeaders(cached);
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return withIsolationHeaders(response);
  } catch {
    return new Response("Offline", { status: 503 });
  }
}

async function serveNetworkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return withIsolationHeaders(response);
  } catch {
    const cached = await caches.match(request);
    if (cached) return withIsolationHeaders(cached);
    return new Response("Offline", { status: 503 });
  }
}
