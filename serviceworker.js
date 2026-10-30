const CACHE_NAME = 'pika-shot-cache-v12';
const LIB_CACHE_NAME = 'pika-shot-libs-v1'; // third-party scanner library, kept for offline scanning
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

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(ASSETS_TO_CACHE);
            })
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME && cacheName !== LIB_CACHE_NAME) {
                        console.log('Service Worker: clearing old cache');
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

self.addEventListener('fetch', event => {
    // The admin dashboard is never kept in this cache, so it is always the latest version.
    if (/^\/admin(\.html|\.js|\.css)?$/.test(new URL(event.request.url).pathname)) return;

    // Scanner fallback library: serve the cached copy when there is one, refresh it in the background.
    if (event.request.url.includes('cdn.jsdelivr.net/npm/@zxing/library')) {
        event.respondWith(
            caches.open(LIB_CACHE_NAME).then(cache =>
                cache.match(event.request).then(cached => {
                    const network = fetch(event.request).then(response => {
                        if (response && response.status === 200) cache.put(event.request, response.clone());
                        return response;
                    }).catch(() => null);
                    return cached || network.then(response => response || new Response(null, { status: 503, statusText: 'Service Unavailable' }));
                })
            )
        );
        return;
    }

    // For external CDN resources, try network first, but don't cache or fail.
    if (event.request.url.includes('cdn.jsdelivr.net') || event.request.url.includes('cdnjs.cloudflare.com')) {
        event.respondWith(
            fetch(event.request).catch(() => {
                // If the network fails (offline), return a simple error response.
                // The app should handle this gracefully (e.g., disable scanning).
                return new Response(null, { status: 503, statusText: 'Service Unavailable' });
            })
        );
        return;
    }

    // For local assets, use cache-first strategy.
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response; // Return from cache
                }
                // If not in cache, fetch from network
                return fetch(event.request).then(
                    networkResponse => {
                        // Check if we received a valid response
                        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                            return networkResponse;
                        }
                        // Clone the response and cache it
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
