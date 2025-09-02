const CACHE_NAME = 'pika-shot-cache-v1';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/style.css',
    '/app.js',
    '/db.js',
    '/camera.js',
    '/manifest.json',
    '/icons/icon-192.png',
    '/icons/icon-512.png'
];

// Install event: cache all essential assets
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(ASSETS_TO_CACHE);
            })
    );
});

// Activate event: clean up old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Service Worker: clearing old cache');
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Fetch event: serve from cache first, then network
self.addEventListener('fetch', event => {
    // For TensorFlow.js models from CDN, use a Network First strategy
    if (event.request.url.includes('cdn.jsdelivr.net')) {
        event.respondWith(
            fetch(event.request).catch(() => {
                // If network fails, there's no offline fallback for the model
                // But this prevents the entire app from failing if offline
                return new Response(null, { status: 503, statusText: 'Service Unavailable' });
            })
        );
        return;
    }

    // For app assets, use Cache First strategy
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Cache hit - return response
                if (response) {
                    return response;
                }

                // Not in cache - fetch from network, then cache it
                return fetch(event.request).then(
                    networkResponse => {
                        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                            return networkResponse;
                        }

                        const responseToCache = networkResponse.clone();
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });
                        
                        return networkResponse;
                    }
                );
            })
    );
});