// Voc a Bit service worker: lets the app start without internet and picks up new versions.
// The page and the lesson lists are asked from the network first, with a short time limit so a poor
// connection never keeps the app from starting. Icons, manifest and fonts come from the cache.
const CACHE = 'wordbox-v2.0';
const PREFIX = 'wordbox-v';          // other apps live on the same address; only our own caches are touched
const CORE = ['./', './index.html', './manifest.webmanifest', './apple-touch-icon.png', './icon-192.png', './icon-512.png', './lists/index.json'];
const FONTS = /^fonts\.(googleapis|gstatic)\.com$/;
const WAIT = 3500;                   // ms before a cached copy answers instead of a slow network

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(CORE.map(u => new Request(u, { cache: 'reload' }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const fresh = await caches.open(CACHE);
    for (const key of await caches.keys()) {
      if (key === CACHE || key.indexOf(PREFIX) !== 0) continue;
      // Fonts move over to the new cache, so the first offline start after an update still has them.
      const old = await caches.open(key);
      try {
        for (const req of await old.keys()) {
          if (!FONTS.test(new URL(req.url).hostname)) continue;
          const res = await old.match(req);
          if (res && res.ok && !(await fresh.match(req))) await fresh.put(req, res);
        }
      } catch (e) {}                       // a font that cannot be moved must not keep the old version alive
      await caches.delete(key);
    }
    await self.clients.claim();
  })());
});

function put(req, res) { return caches.open(CACHE).then(c => c.put(req, res)).catch(() => {}) }
// A response that followed a redirect may not answer a page load; a clean copy may.
function clean(res) { return res.redirected ? new Response(res.body, { status: res.status, statusText: res.statusText, headers: res.headers }) : res }

// Network first, fresh from the server (no HTTP cache), with the cache as fallback after WAIT ms or on failure.
function networkFirst(event, url, exact) {
  const cached = caches.match(url, { ignoreSearch: !exact });
  const net = fetch(url, { cache: 'no-cache', credentials: 'same-origin' }).then(res => {
    if (!res.ok) throw new Error('status ' + res.status);
    event.waitUntil(put(url, clean(res.clone())));
    return clean(res);
  });
  event.waitUntil(net.catch(() => {}));
  const slow = new Promise(resolve => setTimeout(resolve, WAIT)).then(() => cached);
  return Promise.race([net.catch(() => cached), slow.then(hit => hit || net.catch(() => undefined))]);
}

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const same = url.origin === self.location.origin;
  if (same && /\/sw\.js$/.test(url.pathname)) return;        // the version check must always see the server's copy

  if (same && (req.mode === 'navigate' || url.pathname.endsWith('.html'))) {
    event.respondWith(networkFirst(event, req.url, false).then(res => res || caches.match('./index.html')).then(res => res || Response.error()));
    return;
  }
  if (same && url.pathname.includes('/lists/')) {
    // The lesson index may come from the cache; a lesson file only under its exact address (it carries ?rev=),
    // so an old copy is never mistaken for a new revision.
    const isIndex = /\/lists\/index\.json$/.test(url.pathname);
    event.respondWith(networkFirst(event, req.url, !isIndex).then(res => res || Response.error()));
    return;
  }
  if (same || FONTS.test(url.hostname)) {
    event.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => { if (res.ok) event.waitUntil(put(req, res.clone())); return res })));
  }
});
