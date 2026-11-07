const CACHE_NAME = 'zeiterfassung-offline-v0591'; // HIER BEI JEDEM UPDATE DIE NUMMER ÄNDERN!

// Alte Caches aufräumen, damit der Speicher nicht vollläuft
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  // Nur GET-Anfragen cachen (Google Drive Sync/POST ausnehmen)
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Wenn online: Lade neueste Version und speichere im Cache
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

// NEU: Empfängt das Signal vom Update-Button aus der App und überspringt die Warteschlange
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
