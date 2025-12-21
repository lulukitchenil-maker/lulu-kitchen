const CACHE_VERSION = 'v5';
const CACHE_NAME = `lulu-kitchen-${CACHE_VERSION}`;
const RUNTIME_CACHE = `lulu-runtime-${CACHE_VERSION}`;

const urlsToCache = [
  '/',
  '/menu',
  '/about',
  '/contact',
  '/reviews',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache).catch((err) => {
          console.error('Cache addAll failed:', err);
        });
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') {
    return;
  }

  if (url.origin === location.origin) {
    event.respondWith(
      caches.match(request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }

          return fetch(request)
            .then((response) => {
              if (!response || response.status !== 200 || response.type !== 'basic') {
                return response;
              }

              const responseToCache = response.clone();

              caches.open(RUNTIME_CACHE)
                .then((cache) => {
                  cache.put(request, responseToCache);
                });

              return response;
            })
            .catch(() => {
              if (request.destination === 'document') {
                return caches.match('/');
              }
            });
        })
    );
  } else {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const responseToCache = response.clone();
          caches.open(RUNTIME_CACHE)
            .then((cache) => {
              cache.put(request, responseToCache);
            });
          return response;
        })
        .catch(() => {
          return caches.match(request);
        })
    );
  }
});
