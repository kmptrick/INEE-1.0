// Service worker minimal — rend l'appli installable (PWA) sur desktop et mobile.
// Stratégie : réseau d'abord (l'appli a besoin de l'API en direct), pas de cache agressif
// pour éviter de servir une version périmée après déploiement.
const VERSION = 'claude-inee-v1';

self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  // On ne touche pas aux appels API ni aux requêtes non-GET : passage direct au réseau.
  if (req.method !== 'GET' || req.url.includes('/api/')) return;
  event.respondWith(
    fetch(req).catch(() => caches.match(req))
  );
});
