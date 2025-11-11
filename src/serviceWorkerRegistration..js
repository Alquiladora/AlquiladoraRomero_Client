/* eslint-disable */
const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
    window.location.hostname === '[::1]' ||
    window.location.hostname.match(
      /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
    )
);

// REGISTRA el Service Worker
export function register(config) {
  if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
    const publicUrl = new URL(process.env.PUBLIC_URL, window.location.href);

    // Evita registrar si el origen del PUBLIC_URL es distinto (por ejemplo, CDN)
    if (publicUrl.origin !== window.location.origin) {
      return;
    }

    window.addEventListener('load', () => {
      const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;

      if (isLocalhost) {
        // Si está en localhost (por ejemplo, puerto 3001)
        checkValidServiceWorker(swUrl, config);

        navigator.serviceWorker.ready.then(() => {
          console.log(
            'Esta aplicación web está siendo servida por un Service Worker (modo localhost). ' +
              'Para más información, visita https://cra.link/PWA'
          );
        });
      } else {
        // En producción (Render, Netlify, etc.)
        registerValidSW(swUrl, config);
      }
    });
  }
}

// Función para registrar el SW válido
function registerValidSW(swUrl, config) {
  navigator.serviceWorker
    .register(swUrl)
    .then((registration) => {
      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (installingWorker == null) return;

        installingWorker.onstatechange = () => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              console.log(
                'Nuevo contenido disponible; se usará cuando todas las pestañas se cierren. ' +
                  'Ver https://cra.link/PWA.'
              );
              if (config && config.onUpdate) config.onUpdate(registration);
            } else {
              console.log('El contenido está cacheado para uso offline.');
              if (config && config.onSuccess) config.onSuccess(registration);
            }
          }
        };
      };
    })
    .catch((error) => {
      console.error('Error durante el registro del Service Worker:', error);
    });
}

// Verifica si existe un SW válido (solo para localhost)
function checkValidServiceWorker(swUrl, config) {
  fetch(swUrl, { headers: { 'Service-Worker': 'script' } })
    .then((response) => {
      const contentType = response.headers.get('content-type');
      if (
        response.status === 404 ||
        (contentType != null && contentType.indexOf('javascript') === -1)
      ) {
        navigator.serviceWorker.ready.then((registration) => {
          registration.unregister().then(() => {
            window.location.reload();
          });
        });
      } else {
        registerValidSW(swUrl, config);
      }
    })
    .catch(() => {
      console.log(
        'Sin conexión a Internet. La aplicación se ejecuta en modo offline.'
      );
    });
}

// Permite desregistrar el SW (por ejemplo, en desarrollo)
export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
      })
      .catch((error) => {
        console.error(error.message);
      });
  }
}
