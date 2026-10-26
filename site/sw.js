// Service worker: makes the site work offline (e.g. at rehearsals).
// Everything is served from the cache first and refreshed in the background (stale-while-revalidate).
// Cache keys ignore the ?v= query string so old versions do not pile up.

const CACHE = 'ms60b-v6';
const CORE = [
  './', 'index.html', 'builder.html', 'tones.html', 'styles.css', 'stage.css', 'favicon.svg', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png', 'manifest.webmanifest',
  'effects-data.js', 'firmware-data.js', 'zptc.js', 'advice-engine.js', 'advice-rules.js', 'library-merge.js', 'rule-packs.js', 'rule-pack-editor.js', 'patch-link.js', 'tone-ideas.js', 'tones.js', 'app.js', 'builder.js', 'pwa.js',
  ...Array.from({ length: 97 }, (_, i) => `assets/effects/fx-${String(i).padStart(3, '0')}.png`)
];

const stamp = response => response.headers.get('etag') || response.headers.get('last-modified') || '';
const notifyUpdate = async () => (await self.clients.matchAll()).forEach(client => client.postMessage({ type: 'updated' }));
const keyFor = request => { const url = new URL(request.url); url.search = ''; return url.href; };

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin || url.pathname.startsWith('/api/')) return;
  const key = keyFor(request);
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const hit = await cache.match(key);
    // Stale-while-revalidate: answer from the cache at once and refresh it in the background,
    // so switching pages never waits for the network. A new deploy shows from the next visit on.
    const refresh = fetch(request).then(response => {
      if (response.ok) {
        cache.put(key, response.clone());
        // A different copy than the one just served means a new deploy: tell the open pages
        if (hit && stamp(hit) !== stamp(response)) notifyUpdate();
      }
      return response;
    });
    if (hit) { event.waitUntil(refresh.catch(() => {})); return hit; }
    return refresh;
  })());
});
