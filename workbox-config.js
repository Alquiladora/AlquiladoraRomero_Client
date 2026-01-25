const { generateSW } = require('workbox-build');
const CRITICAL_API_ORIGIN = 'https://alquiladora-romero-server.onrender.com';

generateSW({
  globDirectory: 'build/',
 globPatterns: ['**/*.{html,js,css,json,ico,woff2,woff,png,jpg,jpeg,svg,webp,gif}'],
  swDest: 'build/service-worker.js',
  maximumFileSizeToCacheInBytes: 30 * 1024 * 1024,

  skipWaiting: true,
  clientsClaim: true,
  cleanupOutdatedCaches: true,

  navigateFallback: '/index.html',
  navigateFallbackDenylist: [/^\/api/, /service-worker\.js$/],

  importScripts: ['sw-push-events.js'],


  additionalManifestEntries: [
    { url: `${CRITICAL_API_ORIGIN}/api/politicas/vigente`, revision: null },
    { url: `${CRITICAL_API_ORIGIN}/api/terminos/vigente`, revision: null },
    { url: `${CRITICAL_API_ORIGIN}/api/deslin/vigente`, revision: null },
    { url: `${CRITICAL_API_ORIGIN}/api/empresa/logo`, revision: null },
    { url: `${CRITICAL_API_ORIGIN}/api/empresa/sobreNosotros`, revision: null },
    { url: `${CRITICAL_API_ORIGIN}/api/empresa/redesociales`, revision: null },
    { url: `${CRITICAL_API_ORIGIN}/api/sobrenosotros`, revision: null },
  ],

  runtimeCaching: [
    {
      urlPattern: new RegExp(`^${CRITICAL_API_ORIGIN}/api/get-csrf-token`), 
      handler: 'NetworkOnly', 
      options: {
        cacheableResponse: { statuses: [0] },
      },
    },

    {
      urlPattern: new RegExp(`^${CRITICAL_API_ORIGIN}/api/empresa/(logo|sobreNosotros|redesociales)$`),
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'empresa-info-cache',
        cacheableResponse: { statuses: [0, 200] },
        expiration: { maxAgeSeconds: 15 * 24 * 60 * 60 },
      },
    },


    {
      urlPattern: new RegExp(`^${CRITICAL_API_ORIGIN}/api/(pedidos/historial-pedidos|pedidos/calificados|pedidos/insignias|pedidos/Nivelesypuntos|empresa/telefonoEmpresa)`),
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'critical-user-cache',
        
        cacheableResponse: { statuses: [0, 200] },
        expiration: { maxEntries: 10, maxAgeSeconds: 6 * 60 * 60 },
        plugins: [
          {
            cacheWillUpdate: async ({ response }) => {

              return response && response.status === 200 ? response : null;
            }
          }
        ]
      },
    },

    {
      urlPattern: new RegExp(`^${CRITICAL_API_ORIGIN}/api/carrito/carrito/.*$`),
      handler: 'NetworkFirst',
      options: {
        cacheName: 'critical-cart-cache',
        
        cacheableResponse: { statuses: [0, 200] },
        expiration: { maxEntries: 10, maxAgeSeconds: 6 * 60 * 60 },
      },
    },

    {
      urlPattern: new RegExp(`^${CRITICAL_API_ORIGIN}/api/carrito/count/.*$`),
      handler: 'NetworkFirst',
      options: {
        cacheName: 'cart-count-cache',
        cacheableResponse: { statuses: [0, 200] },
        expiration: { maxEntries: 20, maxAgeSeconds: 1 * 60 * 60 },
      },
    },




    {
      urlPattern: new RegExp(`^${CRITICAL_API_ORIGIN}/api/(productos/categrias/disponibles|pedidos/productos/seleccion)`),
       handler: 'NetworkFirst',
      options: {
        cacheName: 'dynamic-data-cache',
        cacheableResponse: { statuses: [0, 200] },
        expiration: { maxEntries: 50, maxAgeSeconds: 24 * 60 * 60 },
      },
    },


    {
      urlPattern: /\.(?:png|gif|jpg|jpeg|svg|webp)$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'images-cache',
        cacheableResponse: { statuses: [0, 200] },
        expiration: {
          maxEntries: 60,
          maxAgeSeconds: 7 * 24 * 60 * 60,
        },
      },
    },

    {

      urlPattern: new RegExp(`^${CRITICAL_API_ORIGIN}/api/.*$`),
      handler: 'NetworkFirst',
      options: {
        cacheName: 'dynamic-api-cache',
        networkTimeoutSeconds: 5,
        cacheableResponse: { statuses: [0, 200] },
        expiration: {
          maxEntries: 80,
          maxAgeSeconds: 7 * 24 * 60 * 60,
        },
      },
    }


  ],
}).catch(err => console.error(err));
