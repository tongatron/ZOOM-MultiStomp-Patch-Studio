// Service worker: makes the site work offline (e.g. at rehearsals).
// Pages and scripts are fetched from the network first so a deploy shows up straight away;
// the cached copy is used when the network is unavailable. Effect images are served from the cache first.
// Cache keys ignore the ?v= query string so old versions do not pile up.

const CACHE = 'ms60b-v1';
const CORE = [
  './', 'index.html', 'builder.html', 'styles.css', 'favicon.svg', 'manifest.webmanifest',
  'effects-data.js', 'firmware-data.js', 'zptc.js', 'advice-engine.js', 'advice-rules.js', 'app.js', 'builder.js', 'pwa.js',
  ...Array.from({ length: 97 }, (_, i) => `assets/effects/fx-${String(i).padStart(3, '0')}.png`)
];

const keyFor = request => { const url = new URL(request.url); url.search = ''; return url.href; };

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', event => {
  const { request } = event;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;
  const key = keyFor(request);
  const isImage = request.destination === 'image';
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    if (isImage) {
      const hit = await cache.match(key);
      if (hit) return hit;
    }
    try {
      const response = await fetch(request);
      if (response.ok) cache.put(key, response.clone());
      return response;
    } catch (error) {
      const hit = await cache.match(key);
      if (hit) return hit;
      throw error;
    }
  })());
});
