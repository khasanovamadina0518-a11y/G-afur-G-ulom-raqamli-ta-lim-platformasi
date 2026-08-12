// Service Worker for G'afur G'ulom Platform
const CACHE_NAME = 'gafur-gulom-v1';
const OFFLINE_URL = 'offline.html';

// Files to cache
const CACHE_URLS = [
  './',
  './index.html',
  './pages/hayot.html',
  './pages/asarlar.html',
  './pages/ilmiy.html',
  './pages/talim.html',
  './pages/interaktiv.html',
  './pages/multimedia.html',
  './pages/hamjamiyat.html',
  './assets/css/main.css',
  './assets/css/components.css',
  './assets/css/responsive.css',
  './assets/js/app.js',
  './assets/js/data.js',
  './assets/js/router.js',
  './components/header.js',
  './components/footer.js',
  './data/sherlar.json',
  './data/hayot.json',
  './data/quiz.json',
  './data/ilmiy.json',
  './data/dostonlar.json',
  './data/qissalar.json',
  './assets/images/gafur-gulom.jpg',
  './offline.html',
  './404.html'
];

// Install event - cache files
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Install');
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Caching app shell');
      return cache.addAll(CACHE_URLS);
    })
  );
  
  self.skipWaiting();
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activate');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[ServiceWorker] Removing old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  return self.clients.claim();
});

// Fetch event - cache first strategy
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        console.log('[ServiceWorker] Found in cache:', event.request.url);
        return response;
      }
      
      return fetch(event.request).then((response) => {
        // Check if we received a valid response
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        
        // Clone the response
        const responseToCache = response.clone();
        
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        
        return response;
      }).catch(() => {
        // If both cache and network fail, show offline page
        if (event.request.destination === 'document') {
          return caches.match(OFFLINE_URL);
        }
      });
    })
  );
});
