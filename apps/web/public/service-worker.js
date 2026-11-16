const CACHE = 'mindcommons-public-v1';
const ASSETS = [
  '/',
  '/manifest.webmanifest',
  '/mindcommons-icon.svg',
  '/mindcommons-192.png',
  '/mindcommons-512.png',
  '/offline.html',
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))),
      ),
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin || url.pathname.startsWith('/api/')) return;
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).catch(() => caches.match('/offline.html')));
    return;
  }
  if (event.request.method === 'GET') {
    event.respondWith(
      caches.open(CACHE).then(async (cache) => {
        const cached = await cache.match(event.request);
        if (cached) return cached;
        const response = await fetch(event.request);
        if (
          response.ok &&
          (url.pathname.startsWith('/assets/') ||
            url.pathname === '/vision' ||
            url.pathname === '/vision/')
        ) {
          await cache.put(event.request, response.clone());
        }
        return response;
      }),
    );
  }
});
