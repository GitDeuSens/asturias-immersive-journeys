// Service Worker for offline caching and performance
const CACHE_NAME = 'asturias-v1';
const STATIC_CACHE = 'asturias-static-v1';
const RUNTIME_CACHE = 'asturias-runtime-v1';

// Static assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/index.css',
  '/assets/hero-mountains-Cll5CtuY.jpg',
  '/assets/llastres-tOR0wO6q.jpg',
  '/assets/picos-BfaS7STt.jpg',
  '/assets/cares-CeXANorh.jpg',
  '/assets/covadonga-BubZKFDZ.jpg'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== STATIC_CACHE && name !== RUNTIME_CACHE)
          .map(name => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  // Skip non-GET requests
  if (request.method !== 'GET') return;
  
  // Skip Directus API requests
  if (request.url.includes('/directus-api/') || request.url.includes('/items/')) return;
  
  // Skip external requests
  if (!request.url.startsWith(self.location.origin)) return;
  
  event.respondWith(
    caches.match(request)
      .then(response => {
        // Return cached version if available
        if (response) {
          // For HTML files, try network first (stale-while-revalidate)
          if (request.destination === 'document') {
            fetch(request).then(networkResponse => {
              if (networkResponse.ok) {
                caches.open(RUNTIME_CACHE).then(cache => {
                  cache.put(request, networkResponse.clone());
                });
              }
            }).catch(() => {});
          }
          return response;
        }
        
        // For static assets, cache on first request
        if (request.destination === 'image' || 
            request.destination === 'font' || 
            request.destination === 'style' ||
            request.destination === 'script') {
          return fetch(request).then(networkResponse => {
            if (networkResponse.ok) {
              const responseClone = networkResponse.clone();
              caches.open(RUNTIME_CACHE).then(cache => {
                cache.put(request, responseClone);
              });
            }
            return networkResponse;
          });
        }
        
        // For everything else, fetch from network
        return fetch(request);
      })
  );
});
