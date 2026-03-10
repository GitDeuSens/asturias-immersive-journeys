// Service Worker — Network-first API caching + stale-while-revalidate for assets
const CACHE_VERSION = 3;
const STATIC_CACHE = `asturias-static-v${CACHE_VERSION}`;
const RUNTIME_CACHE = `asturias-runtime-v${CACHE_VERSION}`;
const API_CACHE = `asturias-api-v${CACHE_VERSION}`;
const API_CACHE_TTL = 5 * 60 * 1000; // 5 minutes TTL for API responses

const VALID_CACHES = [STATIC_CACHE, RUNTIME_CACHE, API_CACHE];

// API path patterns to cache
const API_PATTERNS = [
  '/items/routes',
  '/items/pois',
  '/items/categories',
  '/items/tours_360',
  '/items/ar_scenes',
  '/directus-api/items/',
];

// Install — skip waiting immediately
self.addEventListener('install', () => self.skipWaiting());

// Activate — clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(names =>
      Promise.all(
        names.filter(n => !VALID_CACHES.includes(n)).map(n => caches.delete(n))
      )
    ).then(() => self.clients.claim())
  );
});

// Is this an API request?
function isAPIRequest(url) {
  return API_PATTERNS.some(pattern => url.includes(pattern));
}

// Is this a Directus asset (image)?
function isDirectusAsset(url) {
  return url.includes('/assets/') && (
    url.includes('directus') ||
    url.includes('digitalmetaverso') ||
    url.includes('/directus-assets/')
  );
}

// Is this a map tile?
function isMapTile(url) {
  return url.includes('tile.openstreetmap.org') ||
         url.includes('tiles.stadiamaps.com') ||
         url.includes('cartodb-basemaps') ||
         url.includes('tile.thunderforest.com') ||
         url.includes('.tile.') ||
         url.includes('/tiles/');
}

// Fetch handler
self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = request.url;

  // === API: Network-first with 5min TTL cache fallback ===
  if (isAPIRequest(url)) {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(API_CACHE).then(cache => {
              // Store with timestamp header for TTL
              const headers = new Headers(clone.headers);
              headers.set('sw-cached-at', String(Date.now()));
              const cachedResponse = new Response(clone.body, {
                status: clone.status,
                statusText: clone.statusText,
                headers,
              });
              cache.put(request, cachedResponse);
            });
          }
          return response;
        })
        .catch(() =>
          caches.match(request).then(cached => {
            if (!cached) return new Response('Offline', { status: 503 });
            // Check TTL
            const cachedAt = Number(cached.headers.get('sw-cached-at') || 0);
            if (Date.now() - cachedAt > API_CACHE_TTL * 6) {
              // Cache too old (30 min), return but don't guarantee freshness
            }
            return cached;
          })
        )
    );
    return;
  }

  // === Directus images: Cache-first (immutable content-addressed) ===
  if (isDirectusAsset(url) || request.destination === 'image') {
    event.respondWith(
      caches.match(request).then(cached => {
        if (cached) return cached;
        return fetch(request).then(response => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(RUNTIME_CACHE).then(cache => cache.put(request, clone));
          }
          return response;
        }).catch(() => new Response('', { status: 404 }));
      })
    );
    return;
  }

  // === Static assets (fonts, CSS, JS): Cache-first with background revalidation ===
  if (
    request.destination === 'font' ||
    request.destination === 'style' ||
    request.destination === 'script'
  ) {
    event.respondWith(
      caches.match(request).then(cached => {
        const networkFetch = fetch(request).then(response => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(RUNTIME_CACHE).then(cache => cache.put(request, clone));
          }
          return response;
        });
        return cached || networkFetch;
      })
    );
    return;
  }

  // === HTML documents: Network-first ===
  if (request.destination === 'document') {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(RUNTIME_CACHE).then(cache => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => caches.match(request) || caches.match('/'))
    );
    return;
  }
});
