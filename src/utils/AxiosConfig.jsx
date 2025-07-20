import axios from 'axios';
import { useNavigate } from "react-router-dom";

const api = axios.create({
// baseURL:  "http://localhost:3001",    
 baseURL:"https://alquiladora-romero-server.onrender.com",
  timeout: 16000,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      if (!navigator.onLine) {
        console.error("❌ Offline: No hay conexión a Internet.");
        window.dispatchEvent(new Event("slow-connection-error"));
      } else {
        console.error("❌ Network Error: No se pudo conectar al servidor.", error.message);
        window.dispatchEvent(new Event("server-error"));
      }
    } else {
      const { status, data } = error.response;

      switch (status) {
        case 400:
          console.error("❌ Error 400: Solicitud incorrecta.", data);
          break;
          case 401:
            console.error("❌ Error 401: No autorizado.", data);
            window.dispatchEvent(new Event("session-expired")); 
         
            break;
        case 500:
          console.error("❌ Error 500: Error interno del servidor.", data);
        
            window.dispatchEvent(new Event("server-error"));
          
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
      window.dispatchEvent(new Event("slow-connection-error"));
    }
    return Promise.reject(error);
  }
);

export default api;
