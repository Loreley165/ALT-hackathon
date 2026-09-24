
const CACHE = "alt-passport-bc44a2a52632";
const ASSETS = ["./assets/index-C4arHAX_.css","./assets/index-C8EGB663.js","./brand/alt-app-icon.png","./brand/alt-brand-board.png","./icons/apple-touch-icon.png","./icons/icon-192.png","./icons/icon-512.png","./index.html","./manifest.webmanifest"];
self.addEventListener('install', event => { event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS))); });
self.addEventListener('activate', event => { event.waitUntil((async () => { for (const key of await caches.keys()) if (key.startsWith('alt-passport-') && key !== CACHE) await caches.delete(key); await self.clients.claim(); })()); });
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;
  if (event.request.mode === 'navigate') { event.respondWith(caches.open(CACHE).then(cache => cache.match(new URL('index.html', self.registration.scope).href)).then(cached => cached || fetch(event.request))); return; }
  event.respondWith(caches.open(CACHE).then(async cache => (await cache.match(event.request, { ignoreVary: true })) || fetch(event.request)));
});
