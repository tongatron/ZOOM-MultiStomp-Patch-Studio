// Service worker: makes the site work offline (e.g. at rehearsals).
// Pages and images are served from the cache first and refreshed in the background (stale-while-revalidate).
// Scripts and stylesheets are loaded with a ?v= version, so each version is cached under its own URL: a page always
// gets the files of its own version and never mixes a new page with old scripts. Older versions of a file are dropped
// when a newer one is stored.

const CACHE = 'ms60b-v17';
const CORE = [
  // No './' and no old-address pages here: they only send the visitor on to /ms-60b/
  'ms-60b/index.html', 'ms-60b/builder.html', 'ms-60b/tones.html', 'ms-60b/pedal-manager.html', 'ms-60b/resources.html', 'ms-60b/technical-notes.html', 'ms-60b/technical-notes.md', 'ms-60b/guide.html', 'privacy.html', 'favicon.svg', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png', 'manifest.webmanifest',
  ...Array.from({ length: 97 }, (_, i) => `ms-60b/assets/effects/fx-${String(i).padStart(3, '0')}.png`)
];

// Sign-in and account pages are always asked to the server (they depend on the session); so is /moved, which receives
// the data of the old address of the site (deploy/legacy-host.mjs)
const ACCOUNT_PAGES = /^\/(login|register|forgot|reset|verify|logout|account|admin|moved)(\/|$)/;

const stamp = response => response.headers.get('etag') || response.headers.get('last-modified') || '';
const notifyUpdate = async () => (await self.clients.matchAll()).forEach(client => client.postMessage({ type: 'updated' }));

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

// A versioned file never changes: use the cached copy of that exact version, or fetch it and drop older versions.
async function versioned(request, url) {
  const cache = await caches.open(CACHE);
  const hit = await cache.match(request);
  if (hit) return hit;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const older = await cache.keys(request, { ignoreSearch: true });
      await Promise.all(older.filter(old => old.url !== url.href).map(old => cache.delete(old)));
      await cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    // Offline and this version was never stored: any cached version of the file beats a broken page
    return (await cache.match(request, { ignoreSearch: true })) || Promise.reject(error);
  }
}

// Stale-while-revalidate: answer from the cache at once and refresh it in the background,
// so switching pages never waits for the network. A new deploy shows from the next visit on.
async function staleWhileRevalidate(event) {
  const cache = await caches.open(CACHE);
  const hit = await cache.match(event.request);
  const refresh = fetch(event.request).then(response => {
    if (response.ok) {
      cache.put(event.request, response.clone());
      // A different copy than the one just served means a new deploy: tell the open pages
      if (hit && stamp(hit) !== stamp(response)) notifyUpdate();
    }
    return response;
  });
  if (hit) { event.waitUntil(refresh.catch(() => {})); return hit; }
  return refresh;
}

self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin || url.pathname.startsWith('/api/') || ACCOUNT_PAGES.test(url.pathname)) return;
  event.respondWith(url.searchParams.has('v') ? versioned(request, url) : staleWhileRevalidate(event));
});
