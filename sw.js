const CACHE_NAME = "jmd-cache-v5";

// ✅ LOCAL FILES ONLY
const urlsToCache = [
  "./",
  "./index.html",
  "./invoice.html",
  "./dashboard.html",
  "./assets/logo.webp",
  "./assets/icon.png",
  "./assets/jmdbadge.png"
];

// 1. INSTALL
self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

// 2. ACTIVATE (old cache delete)
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// 3. FETCH (offline first)
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then(res => {
      return res || fetch(event.request);
    })
  );
});

// 4. NOTIFICATION CLICK
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('./invoice.html')
  );
});

// 5. PUSH NOTIFICATION
self.addEventListener('push', (event) => {
  const options = {
    body: 'JMD Traders: Naya Bill Generate Hua Hai!',
    icon: '/assets/icon.png',
    badge: '/assets/jmdbadge.png',
    vibrate: [200, 100, 200],
    data: { url: './invoice.html' }
  };

  event.waitUntil(
    self.registration.showNotification('JMD Traders Alert', options)
  );
});
