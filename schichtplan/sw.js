const CACHE_NAME = 'schicht-offline-cache-v1';

self.addEventListener('fetch', (event) => {
  // Nur GET-Anfragen cachen (Google Drive Sync/POST ausnehmen)
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Wenn online: Lade die neueste Version und speichere eine Kopie im Cache
        const resClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, resClone);
        });
        return response;
      })
      .catch(() => {
        // Wenn offline (fetch schlägt fehl): Lade die Datei aus dem Cache
        return caches.match(event.request);
      })
  );
});
