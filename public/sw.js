const CACHE_NAME = 'tanamanku-pwa-v1';

const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/figma-assets/logo-fix.svg',
  '/figma-assets/logo-fix-ink.svg',
  '/apple-touch-icon.png'
];

// 1. Install: cache aset
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// 2. Activate: bersihkan cache
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Fetch Event handler
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Jangan cache API/Supabase
  if (
    request.method !== 'GET' ||
    url.pathname.startsWith('/api/') ||
    url.hostname.includes('supabase')
  ) {
    return;
  }

  // Cache aset statis
  if (
    request.destination === 'image' ||
    request.destination === 'font' ||
    request.destination === 'style' ||
    request.destination === 'script' ||
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname.startsWith('/figma-assets/')
  ) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cachedResponse = await cache.match(request);
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(() => cachedResponse);

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // Navigasi HTML network first
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(async () => {
          const cachedResponse = await caches.match(request);
          if (cachedResponse) {
            return cachedResponse;
          }
          const rootCached = await caches.match('/');
          if (rootCached) {
            return rootCached;
          }
          return new Response('Anda sedang offline. Buka kembali saat terhubung internet.', {
            status: 503,
            headers: { 'Content-Type': 'text/html; charset=utf-8' },
          });
        })
    );
    return;
  }

  // Default fallback
  event.respondWith(
    caches.match(request).then((response) => {
      return response || fetch(request);
    })
  );
});

// 4. Push Notification Support
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'TumbuhKita - Pengingat Siram';
  const options = {
    body: data.body || 'Waktunya menyiram tanaman Anda!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/siram',
    },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// 5. Handler pesan client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const { title, options } = event.data;
    const notificationOptions = {
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-192x192.png',
      vibrate: [100, 50, 100],
      ...options,
    };
    event.waitUntil(self.registration.showNotification(title, notificationOptions));
  }
});

// 6. Handler klik notifikasi
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetPath = event.notification.data?.url || '/siram';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url && client.url.includes(targetPath) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetPath);
      }
    })
  );
});
