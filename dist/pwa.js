// Registers the service worker so the site can be installed and used offline, and tells the visitor
// when a new version has been downloaded in the background.
// The ?v= value (taken from this script's own URL) makes the CDN fetch a fresh sw.js after each deploy.
if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  const script = new URL(document.currentScript.src);
  const version = script.searchParams.get('v') || '';
  let notified = false;
  // sw.js posts 'updated' when a file refreshed in the background differs from the copy it served
  navigator.serviceWorker.addEventListener('message', event => {
    if (event.data?.type !== 'updated' || notified) return;
    notified = true;
    const bar = document.createElement('div');
    bar.className = 'update-bar';
    bar.setAttribute('role', 'status');
    bar.innerHTML = '<span>A new version is available.</span><button class="btn btn-sm btn-primary" type="button">Reload</button><button class="btn btn-sm btn-invisible" type="button" aria-label="Dismiss">Later</button>';
    const [reload, later] = bar.querySelectorAll('button');
    reload.addEventListener('click', () => location.reload());
    later.addEventListener('click', () => bar.remove());
    document.body.append(bar);
  });
  // sw.js sits next to this script, so the pages in pedal folders (ms-50g/) share the same worker
  window.addEventListener('load', () => navigator.serviceWorker.register(new URL(`sw.js?v=${version}`, script)).catch(() => {}));
}
