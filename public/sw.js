/**
 * RADIO GUERREROS DE LA LUZ - Service Worker (Cache-First para UI estática)
 */
const CACHE_NAME = "rgl-cache-v2.0";
const ASSETS_TO_CACHE = [
  "./",
  "./index.html",
  "./manifest.webmanifest"
];

// Instalación: Precarga interfaz
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// Activación: Purga versiones anteriores de caché
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Estrategia de Fetch:
// 1. Si es llamada a Google Drive, Google APIs o Firebase -> Ir directo a la red (no almacenar audio pesado)
// 2. Si son recursos estáticos de la app -> Cache First con recuperación de Red
self.addEventListener("fetch", (e) => {
  const url = e.request.url;

  if (
    url.includes("googleapis.com") ||
    url.includes("script.google.com") ||
    url.includes("googleusercontent.com") ||
    url.includes("drive.google.com") ||
    url.includes("firebase") ||
    url.includes("identitytoolkit")
  ) {
    return;
  }

  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(e.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== "basic") {
          return networkResponse;
        }
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(e.request, responseToCache);
        });
        return networkResponse;
      });
    }).catch(() => {
      if (e.request.mode === "navigate") {
        return caches.match("./index.html");
      }
    })
  );
});
