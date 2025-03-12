import React, { createContext, useState, useEffect, useRef } from "react";
import api from "./AxiosConfig";

export const ServerStatusContext = createContext();

export const ServerStatusProvider = ({ children }) => {
  const [isServerOnline, setIsServerOnline] = useState(true);
  const [serverError, setServerError] = useState(null);

 
  const intervalRef = useRef(null);

  const checkServerStatus = async () => {
    try {
      await api.get("/api/status", { withCredentials: true });
    
      setIsServerOnline(true);
      setServerError(null);
    } catch (error) {
     
      if (error.response && error.response.status === 500) {
      
        setIsServerOnline(false);
        setServerError("Error interno del servidor.");
      
        clearInterval(intervalRef.current);
      } else {
       
      }
    }
  };

  useEffect(() => {
   
    checkServerStatus();

  
    intervalRef.current = setInterval(() => {
      checkServerStatus();
    }, 60000);

    return () => {
    
      clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <ServerStatusContext.Provider value={{ isServerOnline, serverError }}>
      {children}
    </ServerStatusContext.Provider>
  );
};
