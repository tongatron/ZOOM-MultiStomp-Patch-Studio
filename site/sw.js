// Service worker: makes the site work offline (e.g. at rehearsals).
// Everything is served from the cache first and refreshed in the background (stale-while-revalidate).
// Cache keys ignore the ?v= query string so old versions do not pile up.

const CACHE = 'ms60b-v2';
const CORE = [
  './', 'index.html', 'builder.html', 'styles.css', 'stage.css', 'favicon.svg', 'manifest.webmanifest',
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
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const hit = await cache.match(key);
    // Stale-while-revalidate: answer from the cache at once and refresh it in the background,
    // so switching pages never waits for the network. A new deploy shows from the next visit on.
    const refresh = fetch(request).then(response => {
      if (response.ok) cache.put(key, response.clone());
      return response;
    });
    if (hit) { event.waitUntil(refresh.catch(() => {})); return hit; }
    return refresh;
  })());
});
