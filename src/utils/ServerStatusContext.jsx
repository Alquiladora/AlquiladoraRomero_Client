import React, { createContext, useState, useEffect, useRef } from "react";
import api from "./AxiosConfig";

export const ServerStatusContext = createContext();

export const ServerStatusProvider = ({ children }) => {
  const [isServerOnline, setIsServerOnline] = useState(true);
  const [serverError, setServerError] = useState(null);

  // Guardamos la referencia del intervalo para poder limpiarlo
  const intervalRef = useRef(null);

  const checkServerStatus = async () => {
    try {
      await api.get("/api/status", { withCredentials: true });
      // Si todo va bien, se asume que el servidor está en línea
      setIsServerOnline(true);
      setServerError(null);
    } catch (error) {
      // Si ocurre un error al consultar el servidor
      if (error.response && error.response.status === 500) {
        // Error interno del servidor
        setIsServerOnline(false);
        setServerError("Error interno del servidor.");
        // Detenemos el intervalo para que no siga consultando
        clearInterval(intervalRef.current);
      } else {
        // Otros tipos de error
        // Si deseas ignorar otros errores, simplemente no hagas nada extra
        // Por ejemplo, no guardes "No se puede conectar al servidor."
        // Si prefieres mostrar algo, descomenta lo siguiente:
        // setIsServerOnline(false);
        // setServerError("No se puede conectar al servidor.");
      }
    }
  };

  useEffect(() => {
    // Ejecutamos la primera verificación
    checkServerStatus();

    // Configuramos el intervalo de 10 segundos
    intervalRef.current = setInterval(() => {
      checkServerStatus();
    }, 60000);

    return () => {
      // Limpiamos el intervalo al desmontar
      clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <ServerStatusContext.Provider value={{ isServerOnline, serverError }}>
      {children}
    </ServerStatusContext.Provider>
  );
};
