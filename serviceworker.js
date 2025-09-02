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
    '/icons/icon-512.png',
    'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@latest/dist/tf.min.js',
    'https://cdn.jsdelivr.net/npm/@tensorflow-models/mobilenet@latest/dist/mobilenet.min.js'
];

// Install event: cache all essential assets
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                // Use addAll for atomic operation
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .catch(err => {
                console.error('Failed to cache assets during install:', err);
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
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Fetch event: serve from cache first (Cache-First strategy)
self.addEventListener('fetch', event => {
    // For external CDN requests, use a "stale-while-revalidate" strategy
    if (event.request.url.startsWith('https://')) {
        event.respondWith(
            caches.open(CACHE_NAME).then(cache => {
                return cache.match(event.request).then(cachedResponse => {
                    const fetchPromise = fetch(event.request).then(networkResponse => {
                        cache.put(event.request, networkResponse.clone());
                        return networkResponse;
                    });
                    return cachedResponse || fetchPromise;
                })
            })
        );
        return;
    }
    
    // For local assets, use "cache-first"
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Cache hit - return response
                if (response) {
                    return response;
                }
                // Not in cache - fetch from network
                return fetch(event.request);
            }
        )
    );
});