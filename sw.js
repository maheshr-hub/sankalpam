const CACHE_NAME = 'sankalpam-v6';
const ASSETS = [
    '/',
    '/index.html',
    '/panchang.js',
    '/manifest.json',
    '/icon-192.png',
    '/icon-512.png',
    '/festivals.html',
    '/festivals-engine.js'
];
/* festival-overrides.json is intentionally NOT precached - it's meant to be
   hand-edited, so it's always fetched fresh over the network below rather
   than served from a potentially stale cache. */

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(ASSETS))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', event => {
    if (event.request.url.endsWith('festival-overrides.json')) {
        event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
        return;
    }
    event.respondWith(
        caches.match(event.request)
            .then(response => response || fetch(event.request))
    );
});
