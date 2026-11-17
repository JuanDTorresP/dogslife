// Service worker: permite abrir la app sin señal y que cargue rápido.
// Cambia VERSION cada vez que subas cambios para que los teléfonos tomen la nueva versión.
const VERSION = 'v5';
const CACHE = 'perros-' + VERSION;
const BASE = [
  './', './index.html', './manifest.webmanifest',
  './styles.css', './app.js', './store.js', './firebase-config.js',
  './icon-192.png', './icon-512.png', './icon-maskable-512.png', './apple-touch-icon.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(BASE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k.startsWith('perros-') && k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Archivos propios: primero la red (para ver cambios), y si no hay señal, la copia guardada.
  if (url.origin === location.origin) {
    e.respondWith(
      fetch(req).then(res => {
        if (res.ok) { const copia = res.clone(); caches.open(CACHE).then(c => c.put(req, copia)); }
        return res;
      }).catch(() => caches.match(req, { ignoreSearch: true }).then(r => r || caches.match('./index.html')))
    );
    return;
  }

  // Librerías de Firebase (versión fija) y tipografía: primero la copia guardada.
  if (url.href.startsWith('https://www.gstatic.com/firebasejs/') ||
      url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    e.respondWith(
      caches.match(req).then(r => r || fetch(req).then(res => {
        if (res.ok || res.type === 'opaque') { const copia = res.clone(); caches.open(CACHE).then(c => c.put(req, copia)); }
        return res;
      }))
    );
  }
  // Todo lo demás (Firestore, inicio de sesión) va directo a la red.
});
