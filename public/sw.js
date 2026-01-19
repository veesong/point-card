const PRECACHE_VERSION = 'v1';
const PRECACHE_LIST = [
  '/point-card/',
  '/point-card/manifest.json',
];

// Cache strategies
const RUNTIME_CACHE_STRATEGIES = {
  images: 'CacheFirst',
  api: 'NetworkFirst',
  static: 'StaleWhileRevalidate',
  fonts: 'CacheFirst',
};

// Install event - precache app shell
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Install event triggered');

  event.waitUntil(
    caches.open(`precache-${PRECACHE_VERSION}`).then((cache) => {
      console.log('[Service Worker] Precaching app shell');
      return cache.addAll(PRECACHE_LIST);
    })
  );

  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activate event triggered');

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName.startsWith('precache-') && cacheName !== `precache-${PRECACHE_VERSION}`) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );

  // Take control of all pages immediately
  return self.clients.claim();
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome extensions and other protocols
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Handle different resource types with different strategies
  let strategy = 'NetworkFirst'; // default

  if (url.origin === location.origin) {
    // Same origin - serve from cache with network fallback
    strategy = 'StaleWhileRevalidate';
  } else if (request.destination === 'image') {
    strategy = 'CacheFirst';
  } else if (request.destination === 'font') {
    strategy = 'CacheFirst';
  }

  event.respondWith(handleRequest(request, strategy));
});

async function handleRequest(request, strategy) {
  const cache = await caches.open(`runtime-cache-${PRECACHE_VERSION}`);

  switch (strategy) {
    case 'CacheFirst':
      return cacheFirst(request, cache);
    case 'NetworkFirst':
      return networkFirst(request, cache);
    case 'StaleWhileRevalidate':
      return staleWhileRevalidate(request, cache);
    default:
      return networkFirst(request, cache);
  }
}

async function cacheFirst(request, cache) {
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error('[Service Worker] CacheFirst failed:', error);
    throw error;
  }
}

async function networkFirst(request, cache) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('[Service Worker] Network failed, trying cache:', error);
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

async function staleWhileRevalidate(request, cache) {
  const cachedResponse = await cache.match(request);
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  });

  return cachedResponse || fetchPromise;
}

// Message event - handle messages from clients
self.addEventListener('message', (event) => {
  console.log('[Service Worker] Message received:', event.data);

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(`runtime-cache-${PRECACHE_VERSION}`).then((cache) => {
        return cache.addAll(event.data.urls);
      })
    );
  }
});
