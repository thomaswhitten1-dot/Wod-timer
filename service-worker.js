const CACHE_NAME = 'wod-timer-v1';
const ASSETS = [
  './',
  './index.html',
  './workout.html',
  './styles.css',
  './app.js',
  './workout.js',
  './workouts.json',
  './manifest.json',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  // page images:
  './assets/pages/page-1.png',
  './assets/pages/page-2.png',
  './assets/pages/page-3.png',
  './assets/pages/page-4.png',
  './assets/pages/page-5.png',
  './assets/pages/page-6.png',
  './assets/pages/page-7.png',
  './assets/pages/page-8.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    ))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
