/* eslint-disable */
const CACHE_STATIC_NAME = 'alquiladora-static-v1';
const CACHE_DYNAMIC_NAME = 'alquiladora-dynamic-v1';
const CACHE_DATA_NAME = 'alquiladora-data-v1';
const MAX_DYNAMIC_ITEMS = 80;
const API_ORIGIN_DEV = 'http://localhost:3001';
const API_ORIGIN_PROD = 'https://alquiladora-romero-server.onrender.com';

const CRITICAL_API_PATHS = [
  '/api/usuarios/perfil',
  '/api/carrito/carrito',
]

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
  '/logo512.png',
];

const limitCacheSize = (cacheName, maxItems) => {
  caches.open(cacheName).then(cache => {
    cache.keys().then(keys => {
      if (keys.length > maxItems) {
        cache.delete(keys[0]).then(() => limitCacheSize(cacheName, maxItems));
      }
    })
  })
};


self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_STATIC_NAME).then(cache => {
      console.log('[SW] Pre-caching App Shell');
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});


// ... (todo tu código anterior se queda igual) ...

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
    )).then(() => {

      console.log('[SW] Calentando el caché de datos...');


      const DATA_TO_PRECACHE = [
        '/api/empresa/redesociales',
        '/api/empresa',
        '/api/productos/subcategorias',
        '/api/usuarios/perfil',
        '/api/carrito/carrito',
        '/api/pedidos/productos/seleccion',
        '/api/productos/categrias/disponibles',
      ];

      return caches.open(CACHE_DATA_NAME).then(cache => {
        const cachePromises = DATA_TO_PRECACHE.map(relativePath => {
         
          const url = `${API_ORIGIN}${relativePath}`;
         

          return fetch(url) 
            .then(response => {
              if (response.ok) {
                console.log(`[SW] Pre-caching de datos exitoso: ${url}`);
               
                return cache.put(url, response);
              }
              console.warn(`[SW] Respuesta no-ok para pre-cache: ${url}`);
              return Promise.resolve();
            })
            .catch(err => {
              console.warn(
                `[SW] Falló el pre-caching de datos para: ${url}`,
                err
              );
              return Promise.resolve();
            });
        });
        return Promise.all(cachePromises);
      });
    })
  );
});



self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  const path = url.pathname.toLowerCase();

  if (url.origin === API_ORIGIN_DEV || url.origin === API_ORIGIN_PROD) {

    if (e.request.method === 'GET' && CRITICAL_API_PATHS.some(p => path.includes(p))) {
      e.respondWith(
        fetch(e.request)
          .then(networkResponse => {
            return caches.open(CACHE_DATA_NAME).then(cache => {
              if (networkResponse.ok) {
                cache.put(e.request, networkResponse.clone());
              }
              return networkResponse;
            });
          })
          .catch(() => {
            return caches.match(e.request);
          })
      );
    }
    else if (e.request.method === 'GET') {
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

              if (url.protocol.startsWith('http')) {
                cache.put(e.request, networkResponse.clone());
                limitCacheSize(CACHE_DYNAMIC_NAME, MAX_DYNAMIC_ITEMS);

              }

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

//EVENTO DE NOTIFICACIONES
self.addEventListener('push', e => {
  console.log('[SW] Push Received');
  let data;
  try {
    data = e.data.json();
  } catch (err) {
    data = { title: 'Alquiladora Romero', body: e.data?.text() || 'Nueva promoción disponible.' };
  }

  const title = data.title || 'Alerta de Alquiladora Romero';
  const options = {
    body: data.body || 'Nuevo mensaje o actualización disponible.',
    icon: '/icons/favicon-96x96.png',
    badge: '/icons/favicon.ico',
    data: {
      url: data.url || '/'
    }
  };

  e.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', e => {
  console.log('[SW] Notification Clicked');
  e.notification.close();
  const targetUrl = e.notification.data.url || '/';
  e.waitUntil(
    clients.matchAll({ type: 'window' }).then(windowClients => {

      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus().then(() => client.navigate(targetUrl));
        }
      }

      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
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