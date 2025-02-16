import React, { createContext, useEffect, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { useAuth } from "./ContextAuth"; 

export const InactivityContext = createContext();

const INACTIVITY_LIMIT = 10 * 60 * 1000;
const TOKEN_RENEW_THRESHOLD = 2 * 60 * 1000; 

export const InactivityProvider = ({ children }) => {
  const { user, logout, csrfToken } = useAuth(); 
  const navigate = useNavigate();
  const [lastActivity, setLastActivity] = useState(Date.now());

  useEffect(() => {
    if (!csrfToken || !user) return; 

    let inactivityTimer;
    let tokenRenewTimer;

   
    const renewTokenIfNeeded = async () => {
      try {
        const response = await fetch("https://alquiladora-romero-server.onrender.com/api/usuarios/refresh-session", {
          method: "POST",
          credentials: "include",
          headers: { "X-CSRF-Token": csrfToken },
        });

        if (response.status === 401) {
          handleSessionExpired();
        } else {
          console.log("🔄 Token renovado exitosamente.");
        }
      } catch (error) {
        console.error("⚠️ Error renovando token:", error);
      }
    };

    const handleSessionExpired = async () => {
      await logout();
      Swal.fire({
        icon: "warning",
        title: "Sesión cerrada por inactividad",
        text: "Tu sesión ha expirado por inactividad. Por favor, inicia sesión nuevamente.",
        confirmButtonText: "Ir al Login",
        allowOutsideClick: false,
      }).then(() => {
        navigate("/login");
      });
    };

  
    const resetInactivityTimer = () => {
      clearTimeout(inactivityTimer);
      setLastActivity(Date.now()); 

      inactivityTimer = setTimeout(() => {
        handleSessionExpired();
      }, INACTIVITY_LIMIT);
    };

   
    tokenRenewTimer = setInterval(async () => {
      const timeElapsed = Date.now() - lastActivity;
      
      if (timeElapsed < INACTIVITY_LIMIT - TOKEN_RENEW_THRESHOLD) {
        console.log("🔍 Usuario activo, verificando expiración del token...",  timeElapsed);
        await renewTokenIfNeeded();
      }
    }, 60 * 1000); // Revisar cada 1 minuto

    // 🔹 Agregar eventos de actividad
    document.addEventListener("mousemove", resetInactivityTimer);
    document.addEventListener("keydown", resetInactivityTimer);
    document.addEventListener("click", resetInactivityTimer);

    // Iniciar temporizador de inactividad
    resetInactivityTimer();

    return () => {
      clearTimeout(inactivityTimer);
      clearInterval(tokenRenewTimer);
      document.removeEventListener("mousemove", resetInactivityTimer);
      document.removeEventListener("keydown", resetInactivityTimer);
      document.removeEventListener("click", resetInactivityTimer);
    };
  }, [csrfToken, user, logout, navigate, lastActivity]);

  return <InactivityContext.Provider value={{ user }}>{children}</InactivityContext.Provider>;
};
