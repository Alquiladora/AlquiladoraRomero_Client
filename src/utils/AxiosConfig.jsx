import axios from 'axios';

const api = axios.create({
  baseURL: "http://localhost:3001",
  timeout: 15000,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      console.error("❌ Timeout: La solicitud excedió el tiempo de espera.");
      window.dispatchEvent(new Event("server-error"));
    } else if (error.response && error.response.status === 500) {
      console.error("❌ Error 500: Servidor con problemas.");
      window.location.href = '/error500';
    }
    return Promise.reject(error);
  }
);

export default api;
