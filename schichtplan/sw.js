const APP_PREFIX = 'schichtplan-offline-';
const CACHE_NAME = `${APP_PREFIX}v018b1`; // HIER BEI JEDEM UPDATE DIE NUMMER ÄNDERN!

// 1. INSTALL-EVENT: Wichtige Start-Dateien sofort beim Installieren cachen
const CACHE_URLS = [
  '/schicht/schichtplan/',
  '/schicht/schichtplan/index.html',
  '/schicht/schichtplan/manifest.json',
  '/schicht/schichtplan/icon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(CACHE_URLS);
    })
  );
});

// 2. ACTIVATE-EVENT: Alte Caches NUR dieser spezifischen App aufräumen
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Löscht nur alte Caches, die zum Schichtplan gehören
          if (cacheName.startsWith(APP_PREFIX) && cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. FETCH-EVENT: Netzwerk-Anfragen abfangen (Network First)
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  if (url.origin !== location.origin) return;

  // SICHERHEIT: Nur Dateien aus dem eigenen Ordner abfangen und cachen!
  if (!url.pathname.startsWith('/schicht/schichtplan/')) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        const resClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, resClone);
        });

        return response;
      })
      .catch(() => {
        // Wenn offline: Lade die Datei aus dem Cache
        return caches.match(event.request);
      })
  );
});

// 4. MESSAGE-EVENT: Empfängt das Signal vom Update-Button aus der App
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
