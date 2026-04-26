const CACHE_NAME = 'dhiab-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  'https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap'
];

// Install — cache all assets
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS.map(u => new Request(u, { cache: 'reload' }))))
      .then(() => self.skipWaiting())
  );
});

// Activate — delete old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch — cache first, network fallback
self.addEventListener('fetch', e => {
  // Skip non-GET and chrome-extension requests
  if (e.request.method !== 'GET') return;
  if (!e.request.url.startsWith('http')) return;

  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request)
        .then(response => {
          if (!response || response.status !== 200 || response.type === 'opaque') return response;
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
          return response;
        })
        .catch(() => caches.match('./index.html'));
    })
  );
});
