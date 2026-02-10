// Enhanced Service Worker for offline caching and performance
const CACHE_NAME = 'asturias-v2';
const STATIC_CACHE = 'asturias-static-v2';
const RUNTIME_CACHE = 'asturias-runtime-v2';
const API_CACHE = 'asturias-api-v2';

// Static assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/index.css',
  '/assets/hero-mountains-Cll5CtuY.jpg',
  '/assets/llastres-tOR0wO6q.jpg',
  '/assets/picos-BfaS7STt.jpg',
  '/assets/cares-CeXANorh.jpg',
  '/assets/covadonga-BubZKFDZ.jpg',
  '/assets/nextgen-eu-Dt9X_OTM.png',
  '/assets/ministerio-turismo-BgR0-Eya.png',
  '/assets/principado-asturias-BNMpUPxL.png',
  '/assets/plan-recuperacion-pqe1Pdoh.png'
];

// API endpoints to cache for offline
const API_ENDPOINTS = [
  '/items/routes',
  '/items/pois',
  '/items/categories',
  '/items/tours_360',
  '/items/ar_scenes'
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

// Fetch event - enhanced caching strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  // Skip non-GET requests
  if (request.method !== 'GET') return;
  
  // Handle API requests with network-first strategy
  if (API_ENDPOINTS.some(endpoint => request.url.includes(endpoint))) {
    event.respondWith(
      fetch(request)
        .then(networkResponse => {
          if (networkResponse.ok) {
            const responseClone = networkResponse.clone();
            caches.open(API_CACHE).then(cache => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Fallback to cache if network fails
          return caches.match(request);
        })
    );
    return;
  }
  
  // Skip external requests (except images for optimization)
  if (!request.url.startsWith(self.location.origin) && 
      !request.url.includes('directus') && 
      request.destination !== 'image') return;
  
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

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Sync any queued requests
      caches.open(API_CACHE).then(cache => {
        return cache.keys().then(keys => {
          return Promise.all(
            keys.map(key => {
              // Attempt to re-fetch and update cache
              return fetch(key.url).then(response => {
                if (response.ok) {
                  return cache.put(key, response);
                }
              });
            })
          );
        });
      })
    );
  }
});
