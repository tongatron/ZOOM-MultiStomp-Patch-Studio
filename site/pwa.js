// Registers the service worker so the site can be installed and used offline.
// The ?v= value (taken from this script's own URL) makes the CDN fetch a fresh sw.js after each deploy.
if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  const version = new URL(document.currentScript.src).searchParams.get('v') || '';
  window.addEventListener('load', () => navigator.serviceWorker.register(`sw.js?v=${version}`).catch(() => {}));
}
