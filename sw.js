/* eslint-disable no-undef */
const CACHE_NAME = 'yyc-cube-v3';
const RUNTIME_CACHE = 'yyc-runtime-v3';

// Static assets to pre-cache on install
const PRE_CACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/sw.js',
];

// Build assets are cached at runtime (cache-first), not pre-cached
// to avoid stale hashed filenames on new deployments

// ============================================================
// Install: Pre-cache static assets
// ============================================================
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRE_CACHE_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// ============================================================
// Activate: Clean old caches & claim clients
// ============================================================
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== RUNTIME_CACHE)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// ============================================================
// Fetch: Network-first with cache fallback (stale-while-revalidate for API)
// ============================================================
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip browser extensions and non-http(s)
  if (!url.protocol.startsWith('http')) return;

  // --- API / Data requests: Network-first with runtime cache fallback ---
  if (url.pathname.startsWith('/api/') || url.pathname.includes('/data/')) {
    event.respondWith(networkFirst(request));
    return;
  }

  // --- Static assets (JS/CSS/images/fonts): Cache-first ---
  if (
    request.destination === 'script' ||
    request.destination === 'style' ||
    request.destination === 'image' ||
    request.destination === 'font' ||
    request.destination === 'manifest'
  ) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // --- Navigation / HTML: Network-first ---
  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request));
    return;
  }

  // --- Default: Stale-while-revalidate ---
  event.respondWith(staleWhileRevalidate(request));
});

// ============================================================
// Caching strategies
// ============================================================

/** Cache-first: return cached response, fallback to network */
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    // Offline fallback for navigation
    if (request.mode === 'navigate') {
      return caches.match('/');
    }
    return new Response('Offline', { status: 503 });
  }
}

/** Network-first: try network, fallback to cache */
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;

    // Offline fallback for navigation
    if (request.mode === 'navigate') {
      return caches.match('/');
    }
    return new Response('Offline', { status: 503 });
  }
}

/** Stale-while-revalidate: return cached, update in background */
async function staleWhileRevalidate(request) {
  const cached = await caches.match(request);

  const fetchPromise = fetch(request).then(async (response) => {
    if (response.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  }).catch(() => null);

  // Return cached immediately (or wait for network)
  return cached || fetchPromise;
}