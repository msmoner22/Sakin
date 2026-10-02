/* =========================================================
   SAKIN QURAN SERVICE WORKER
   Offline-first cache for Quran module
   ========================================================= */

const CACHE_NAME = "sakin-quran-v1";

const APP_SHELL = [
  "./",
  "./index.html",
  "./quran.html",
  "./quran-mushaf.js",
  "./quran-reader.css",
  "./quran-offline.js"
];

/* ---------------------------------------------------------
   INSTALL
   --------------------------------------------------------- */

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

/* ---------------------------------------------------------
   ACTIVATE
   --------------------------------------------------------- */

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

/* ---------------------------------------------------------
   FETCH
   --------------------------------------------------------- */

self.addEventListener("fetch", event => {
  const request = event.request;

  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);

  /*
   Same-origin files:
   Cache first, then network.
  */
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(request)
          .then(networkResponse => {

            if (
              networkResponse &&
              networkResponse.status === 200 &&
              networkResponse.type === "basic"
            ) {
              const copy = networkResponse.clone();

              caches.open(CACHE_NAME).then(cache => {
                cache.put(request, copy);
              });
            }

            return networkResponse;
          })
          .catch(() => {
            return caches.match("./quran.html");
          });
      })
    );

    return;
  }

  /*
   External Quran resources:
   Network first.
   Previously cached resources can still be used offline.
  */
  if (
    url.hostname.includes("quran.foundation") ||
    url.hostname.includes("quran.com") ||
    url.hostname.includes("audio")
  ) {
    event.respondWith(
      fetch(request)
        .then(networkResponse => {

          if (
            networkResponse &&
            networkResponse.status === 200
          ) {
            const copy = networkResponse.clone();

            caches.open(CACHE_NAME).then(cache => {
              cache.put(request, copy);
            });
          }

          return networkResponse;
        })
        .catch(() => {
          return caches.match(request);
        })
    );

    return;
  }

  /*
   Other requests:
   Normal browser behaviour.
  */
});

/* ---------------------------------------------------------
   MESSAGE HANDLER
   --------------------------------------------------------- */

self.addEventListener("message", event => {

  if (!event.data) {
    return;
  }

  /*
   Force service-worker update.
  */
  if (event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }

  /*
   Clear Quran cache.
  */
  if (event.data.type === "CLEAR_QURAN_CACHE") {

    event.waitUntil(
      caches.delete(CACHE_NAME).then(() => {
        return caches.open(CACHE_NAME);
      })
    );
  }
});

/* ---------------------------------------------------------
   ONLINE / OFFLINE STATUS
   --------------------------------------------------------- */

self.addEventListener("online", () => {
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({
        type: "SAKIN_ONLINE"
      });
    });
  });
});

self.addEventListener("offline", () => {
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({
        type: "SAKIN_OFFLINE"
      });
    });
  });
});
