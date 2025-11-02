import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001',
  //baseURL:"https://alquiladora-romero-server.onrender.com",
  timeout: 20000,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Conexion lento

    //Sin respuesta del servidor
    if (!error.response) {
      console.log('No response from server. Online check:', navigator.onLine);

      if (!navigator.onLine) {
        console.error('❌ Offline: No hay conexión a Internet.');
        window.dispatchEvent(new Event('offline-error'));
      } else if (error.code === 'ECONNABORTED') {
        console.error('❌ Timeout: La solicitud excedió el tiempo de espera.');
        window.dispatchEvent(new Event('timeout-error'));
      } else {
        console.error(
          '❌ Network Error: No se pudo conectar al servidor.',
          error.message
        );
        window.dispatchEvent(new Event('server-unreachable'));
      }

      return Promise.reject(error);
    }

    // Errores del servidor
    const { status, data } = error.response;

    switch (status) {
      case 400:
        console.error('❌ Error 400: Solicitud incorrecta.', data);
        window.dispatchEvent(new Event('bad-request'));
        break;
      case 401:
        console.log('Error 401: No autorizado. Redirigiendo a login.');
        window.dispatchEvent(new Event('unauthorized'));
        break;
      case 403:
        console.log('Error 403: Prohibido. Redirigiendo a login.');
        window.dispatchEvent(new Event('forbidden'));
        break;
      case 404:
        console.error('❌ Error 404: Recurso no encontrado.', data);
        window.dispatchEvent(new Event('not-found'));
        break;
      case 500:
        console.error('❌ Error 500: Error interno del servidor.', data);
        setTimeout(() => window.dispatchEvent(new Event('server-error')), 100);
        break;
      case 503:
        console.error('❌ Error 503: Servicio no disponible.', data);
        window.dispatchEvent(new Event('service-unavailable'));
        break;
      default:
        console.error(`❌ Error ${status}:`, data);
        window.dispatchEvent(new Event('unknown-error'));
    }
    return Promise.reject(error);
  }
);

export default api;
