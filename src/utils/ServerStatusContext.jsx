import React, { createContext, useState, useEffect } from "react";
import api from "./AxiosConfig";

export const ServerStatusContext = createContext();

export const ServerStatusProvider = ({ children }) => {
  const [isServerOnline, setIsServerOnline] = useState(true);
  const [serverError, setServerError] = useState(null);

  const checkServerStatus = async () => {
    try {
      await api.get("/api/status", 
       { withCredentials: true}
      ); 
      setIsServerOnline(true);
      setServerError(null);
    } catch (error) {
      setIsServerOnline(false);
      setServerError("No se puede conectar al servidor.");
    }
  };

  useEffect(() => {
    checkServerStatus();
    const interval = setInterval(checkServerStatus, 10000); 
    return () => clearInterval(interval);
  }, []);

  return (
    <ServerStatusContext.Provider value={{ isServerOnline, serverError }}>
      {children}
    </ServerStatusContext.Provider>
  );
};
