// The old address of the site (zoom.tongatron.org) after the move to SITE_URL (site-url.mjs). The server answers every
// request for it from here:
//   /sw.js         a service worker that removes the old copy of the site from the browser and reloads the open pages
//   a page         a short page that hands what this browser keeps for the old address (patches, settings, backups:
//                  localStorage belongs to one address) over to SITE_URL/moved, then goes to the same page there
//   anything else  a permanent redirect to the same path on SITE_URL (410 for POST and the like: nothing is sent here)
// SITE_URL/moved (receiverPage) takes data only from the old addresses and only the keys the site itself keeps, and it
// never overwrites what the new address already holds: patches are merged with the same rules as the sync.
// The tunnel has to pass on the Host header it received (cloudflared does by default): that is how the old address is told apart.

const NO_STORE = { 'Cache-Control': 'no-store' };
const escapeHtml = text => String(text).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const WORKER = `// The site moved: remove the old copy from this browser and reload the open pages, which then go to the new address.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event => event.waitUntil((async () => {
  for (const key of await caches.keys()) await caches.delete(key);
  await self.registration.unregister();
  for (const client of await self.clients.matchAll({ type: 'window' })) client.navigate(client.url).catch(() => {});
})()));
`;

function handoffPage(siteUrl) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex" />
<title>ZOOM MultiStomp Studio has moved</title>
<link rel="canonical" href="${escapeHtml(siteUrl)}/" />
<noscript><meta http-equiv="refresh" content="0;url=${escapeHtml(siteUrl)}/" /></noscript>
<style>body { display: grid; place-items: center; height: 100vh; margin: 0; background: #0d1117; color: #e6edf3; font: 16px/1.6 system-ui, sans-serif; text-align: center; } a { color: #58a6ff; }</style>
</head>
<body>
<p>ZOOM MultiStomp Studio has moved to<br /><a id="next" href="${escapeHtml(siteUrl)}/">${escapeHtml(siteUrl)}</a><br />Taking you there…</p>
<script>
(() => {
  const site = ${JSON.stringify(siteUrl)};
  const target = site + location.pathname + location.search + location.hash;
  document.getElementById('next').href = target;
  let left = false;
  const leave = () => { if (!left) { left = true; location.replace(target); } };
  // The old copy of the site is removed from this browser: service workers and their caches
  const clean = () => Promise.all([
    navigator.serviceWorker ? navigator.serviceWorker.getRegistrations().then(list => Promise.all(list.map(r => r.unregister()))) : 0,
    self.caches ? caches.keys().then(keys => Promise.all(keys.map(key => caches.delete(key)))) : 0
  ]).catch(() => {});
  const data = {};
  try { for (let i = 0; i < localStorage.length; i++) data[localStorage.key(i)] = localStorage.getItem(localStorage.key(i)); } catch {}
  if (!Object.keys(data).length) { clean().then(leave); return; }
  // Hand the data over to the receiver page of the new address, then go there (anyway after 5 seconds)
  const frame = document.createElement('iframe');
  frame.hidden = true;
  frame.src = site + '/moved';
  addEventListener('message', event => {
    if (event.origin !== new URL(site).origin) return;
    if (event.data && event.data.type === 'moved-ready') frame.contentWindow.postMessage({ type: 'moved-data', data }, event.origin);
    if (event.data && event.data.type === 'moved-done') clean().then(leave);
  });
  setTimeout(() => clean().then(leave), 5000);
  document.body.append(frame);
})();
</script>
</body>
</html>
`;
}

function receiverPage(origins) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="robots" content="noindex" />
<title>Receiving your data</title>
</head>
<body>
<script src="/library-merge.js"></script>
<script>
(() => {
  const FROM = ${JSON.stringify(origins)};
  const PEDALS = ['ms60b', 'ms50g'];
  const DOCS = ['advice', 'view', 'builder', 'rulepacks', 'usb-backups', 'usb-last-read', 'pedal-edit'];
  const from = (() => { try { return new URL(document.referrer).origin; } catch { return ''; } })();
  if (!FROM.includes(from)) return;
  const parse = text => { try { return JSON.parse(text); } catch { return null; } };
  const patches = value => (Array.isArray(value) ? value : []).filter(p => p && typeof p.id === 'string');
  const record = value => (value && typeof value === 'object' && !Array.isArray(value) ? value : {});
  const store = (key, value) => { try { localStorage.setItem(key, value); return true; } catch { return false; } };
  function bring(data) {
    const text = key => (typeof data[key] === 'string' && data[key].length < 1e6 ? data[key] : null);
    let count = 0;
    for (const pedal of PEDALS) {
      const theirs = { patches: patches(parse(text(pedal + '-library'))), deleted: record(parse(text(pedal + '-deleted'))) };
      if (theirs.patches.length || Object.keys(theirs.deleted).length) {
        const mine = { patches: patches(parse(localStorage.getItem(pedal + '-library'))), deleted: record(parse(localStorage.getItem(pedal + '-deleted'))) };
        const merged = LIBMERGE.merge(mine, theirs);
        if (store(pedal + '-library', JSON.stringify(merged.patches)) && store(pedal + '-deleted', JSON.stringify(merged.deleted))) count++;
      }
      for (const kind of DOCS) {
        const key = pedal + '-' + kind;
        if (text(key) !== null && localStorage.getItem(key) === null && store(key, text(key))) count++;
      }
    }
    if (data['account-welcome'] === 'ignored' && localStorage.getItem('account-welcome') === null) store('account-welcome', 'ignored');
    return count;
  }
  addEventListener('message', event => {
    if (event.origin !== from || !event.data || event.data.type !== 'moved-data') return;
    let count = 0;
    try { count = bring(record(event.data.data)); } catch {}
    parent.postMessage({ type: 'moved-done', count }, from);
  });
  parent.postMessage({ type: 'moved-ready' }, from);
})();
</script>
</body>
</html>
`;
}

export function createLegacyHost({ siteUrl, origins }) {
  const hosts = new Set(origins.map(origin => new URL(origin).host.toLowerCase()));
  const send = (response, status, headers, body = '') => { response.writeHead(status, { 'X-Content-Type-Options': 'nosniff', ...headers }); response.end(body); };
  return {
    enabled: hosts.size > 0,
    // Is this request for an old address?
    isLegacy: request => hosts.has(String(request.headers.host || '').toLowerCase()),
    handle(request, response, url) {
      if (url.pathname === '/sw.js') return send(response, 200, { ...NO_STORE, 'Content-Type': 'text/javascript; charset=utf-8' }, WORKER);
      if (request.method !== 'GET' && request.method !== 'HEAD') {
        return send(response, 410, { ...NO_STORE, 'Content-Type': 'application/json; charset=utf-8' }, JSON.stringify({ error: `The site has moved to ${siteUrl}.` }));
      }
      const page = request.method === 'GET' && (request.headers['sec-fetch-mode'] === 'navigate' || String(request.headers.accept || '').includes('text/html'));
      if (page) return send(response, 200, { ...NO_STORE, 'Content-Type': 'text/html; charset=utf-8', 'Referrer-Policy': 'origin' }, handoffPage(siteUrl));
      return send(response, 301, { Location: siteUrl + url.pathname + url.search, 'Cache-Control': 'public, max-age=86400' });
    },
    // SITE_URL/moved: the page in the hidden frame of the hand-off page
    receiver: response => send(response, 200, { ...NO_STORE, 'Content-Type': 'text/html; charset=utf-8' }, receiverPage(origins.map(origin => new URL(origin).origin)))
  };
}
