const CACHE_NAME = 'strategos-shell-v0.46.2-invisible-organism-phase-1';
const STATIC_ASSETS = [
  './manifest.webmanifest',
  './icons/delta-180.png',
  './icons/delta-192.png',
  './icons/delta-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(fetch(request, {cache:'no-store'}).catch(() => caches.match('./index.html')));
    return;
  }

  if (url.pathname.endsWith('.js') || url.pathname.endsWith('.css') || url.pathname.endsWith('.html')) {
    event.respondWith(fetch(request, {cache:'no-store'}));
    return;
  }

  event.respondWith(caches.match(request).then(cached => cached || fetch(request)));
});
