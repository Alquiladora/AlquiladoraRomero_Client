
//EVENTO DE NOTIFICACIONES
self.addEventListener('push', e => {
//  console.log('[SW] Push Received');
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
 // console.log('[SW] Notification Clicked');
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