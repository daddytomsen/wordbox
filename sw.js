// Word Box service worker: lets the app start without internet and picks up new versions on the next launch.
const CACHE = 'wordbox-v1.3';
const CORE = ['./', './index.html', './manifest.webmanifest', './apple-touch-icon.png', './icon-192.png', './icon-512.png', './lists/index.json'];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function store(req, res) {
  if (res && (res.ok || res.type === 'opaque')) {
    const copy = res.clone();
    caches.open(CACHE).then(c => c.put(req, copy));
  }
  return res;
}

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const same = url.origin === self.location.origin;

  // The page itself and the lesson lists: always try the network first, so updates arrive.
  if (same && (req.mode === 'navigate' || url.pathname.endsWith('.html') || url.pathname.includes('/lists/'))) {
    event.respondWith(
      fetch(req).then(res => store(req, res)).catch(() =>
        caches.match(req, { ignoreSearch: true }).then(hit => hit || (req.mode === 'navigate' ? caches.match('./index.html') : Response.error()))
      )
    );
    return;
  }

  // Icons, manifest and web fonts: from the cache, fetched once.
  if (same || /^fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)) {
    event.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => store(req, res))));
  }
});
