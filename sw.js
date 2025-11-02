/* eslint-disable */
const CACHE_STATIC_NAME = 'alquiladora-static-v1';
const CACHE_DYNAMIC_NAME = 'alquiladora-dynamic-v1';
const CACHE_DATA_NAME = 'alquiladora-data-v1';

const API_ORIGIN_DEV = 'http://localhost:3001';
const API_ORIGIN_PROD = 'https://alquiladora-romero-server.onrender.com';

const ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  '/icons/favicon.ico',
  '/icons/favicon.svg',
  '/icons/favicon-96x96.png',
  '/icons/apple-touch-icon.png',
  '/icons/web-app-manifest-192x192.png',
  '/icons/web-app-manifest-512x512.png',
  '/LogoOriginal.jpg',
  '/logo192.png',
  '/logo512.png'
];


self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_STATIC_NAME).then(cache => {
      console.log('[SW] Pre-caching App Shell');
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  const CACHE_WHITELIST = [
    CACHE_STATIC_NAME,
    CACHE_DYNAMIC_NAME,
    CACHE_DATA_NAME
  ];
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => !CACHE_WHITELIST.includes(k)).map(k => {
        console.log(`[SW] Deleting old cache: ${k}`);
        return caches.delete(k);
      })
    ))
  );
});


self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  
  if (url.origin === API_ORIGIN_DEV || url.origin === API_ORIGIN_PROD) {
  
    if (e.request.method === 'GET') {
      e.respondWith(
        caches.open(CACHE_DATA_NAME).then(cache => {
          return cache.match(e.request).then(response => {
            const fetchPromise = fetch(e.request).then(networkResponse => {
              if (networkResponse && networkResponse.ok) {
                cache.put(e.request, networkResponse.clone());
              }
              return networkResponse;
            });
            return response || fetchPromise; 
          });
        })
      );
    }

    return;
  }


  else {
    e.respondWith(
      caches.match(e.request).then(response => {
  
        if (response) {
          return response;
        }
        
        return fetch(e.request).then(networkResponse => {
          return caches.open(CACHE_DYNAMIC_NAME).then(cache => {
            if (e.request.method === 'GET' && networkResponse.status === 200) {
              cache.put(e.request, networkResponse.clone());
            }
            return networkResponse;
          });
        });
      }).catch(() => {
      
        if (e.request.mode === 'navigate') {
          return caches.match('/offline.html');
        }
      })
    );
  }
});

// --- FASE DE SYNC (COMENTADA PARA DESPUÉS) ---
// self.addEventListener('sync', event => {
//   console.log('[SW] Background sync!', event.tag);
// 
//   if (event.tag === 'sync-new-cart-item') {
//     console.log('[SW] Sincronizando nuevo item del carrito...');
//     event.waitUntil(
//       // Lógica para leer de IndexedDB y hacer el fetch() a tu API
//     );
//   }
// });