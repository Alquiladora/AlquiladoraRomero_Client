import axios from 'axios';

const api = axios.create({
  baseURL: "http://localhost:3001",
  timeout: 16000,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Si no hay respuesta, puede ser error de red o de timeout.
    if (!error.response) {
      if (!navigator.onLine) {
        // No hay conexión a Internet.
        console.error("❌ Offline: No hay conexión a Internet.");
        window.dispatchEvent(new Event("network-error"));
      } else {
        // Problema de red (el endpoint no respondió o no se pudo alcanzar).
        console.error("❌ Network Error: No se pudo conectar al servidor.", error.message);
        window.dispatchEvent(new Event("network-error"));
      }
    } else {
      // Hay respuesta, diferenciamos según el código de estado.
      const { status, data } = error.response;

      switch (status) {
        case 400:
          console.error("❌ Error 400: Solicitud incorrecta.", data);
          break;
        case 401:
          console.error("❌ Error 401: No autorizado.", data);
          window.location.href = '/login';
          break;
        case 500:
          console.error("❌ Error 500: Error interno del servidor.", data);
          if (window.location.pathname !== '/error500') {
            window.location.href = '/error500';
          }
          break;
        case 503:
          console.error("❌ Error 503: Servicio no disponible.", data);
          break;
        default:
          console.error("❌ Error inesperado:", status, data);
      }
    }
    if (error.code === 'ECONNABORTED') {
      console.error("❌ Timeout: La solicitud excedió el tiempo de espera.");
      window.dispatchEvent(new Event("server-error"));
    }
    return Promise.reject(error);
  }
);

export default api;
