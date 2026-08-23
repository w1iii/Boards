const CACHE_NAME = "boards-static-v1"
const STATIC_ASSETS = ["/offline"]

// Precache app shell on install
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  )
  self.skipWaiting()
})

// Clean old caches on activate
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  )
  self.clients.claim()
})

self.addEventListener("fetch", (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Only handle GET
  if (request.method !== "GET") return

  // Skip cross-origin (Clerk, Google Fonts handled below)
  if (url.origin !== self.location.origin && !isGoogleFont(url)) return

  // Skip non-safe browser requests
  if (request.cache === "only-if-cached" && request.mode !== "same-origin")
    return

  // Navigation: network-first, offline fallback
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => caches.match("/offline"))
    )
    return
  }

  // Static assets (_next/static/): cache-first (immutable hashed URLs)
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(cacheFirst(request))
    return
  }

  // Images: stale-while-revalidate
  if (
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".jpg") ||
    url.pathname.endsWith(".svg") ||
    url.pathname.endsWith(".ico") ||
    url.pathname.endsWith(".webp") ||
    url.pathname.startsWith("/_next/image/")
  ) {
    event.respondWith(staleWhileRevalidate(request))
    return
  }

  // Google Fonts: cache-first
  if (isGoogleFont(url)) {
    event.respondWith(cacheFirst(request))
    return
  }
})

function isGoogleFont(url) {
  return (
    url.hostname === "fonts.googleapis.com" ||
    url.hostname === "fonts.gstatic.com"
  )
}

async function cacheFirst(request) {
  const cached = await caches.match(request)
  if (cached) return cached
  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME)
      cache.put(request, response.clone())
    }
    return response
  } catch {
    return new Response("", { status: 408 })
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME)
  const cached = await cache.match(request)
  const networkFetch = fetch(request).then((response) => {
    if (response.ok) cache.put(request, response.clone())
    return response
  })
  return cached || networkFetch
}
