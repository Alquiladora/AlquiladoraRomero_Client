import React, { useState, useEffect, useRef } from "react";
import { IdleTimerProvider } from "react-idle-timer";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { useAuth } from "./ContextAuth";

const InactivityHandler = ({ children }) => {
  const navigate = useNavigate();
  const TIMEOUT_INACTIVIDAD = 10 *60* 1000; 
  const AVISO_ANTES_MS = 50 * 1000; 
  const { user, isLoading, logout } = useAuth();
  const [showWarning, setShowWarning] = useState(false);
  const idleTimerRef = useRef(null);

  const handleOnIdle = async () => {
    if (!user || isLoading) return;

    console.log("⏳ Inactividad detectada: Cerrando sesión...");
    try {
      await logout();
      console.log("✅ Sesión cerrada por inactividad.");
    } catch (error) {
      console.error("❌ Error al cerrar sesión:", error);
    }

    navigate("/login");
  };

 
  const handleOnPrompt = () => {
    if (!user || isLoading) return;

    console.log("⚠️ Aviso de inactividad: La sesión está por caducar.");
    setShowWarning(true);
    Swal.fire({
      icon: "warning",
      title: "⚠️ Aviso de Inactividad",
      text: "Tu sesión se cerrará en menos de 10 segundos por inactividad.",
      timer: AVISO_ANTES_MS,
      showConfirmButton: false,
      toast: true,
      position: "top-end",
    });
  };


  const resetTimer = () => {
    if (!user || isLoading || !idleTimerRef.current) return;

    console.log("🔄 Usuario activo: Reiniciando temporizador.");
    idleTimerRef.current.reset(); 
    setShowWarning(false);
  };

 
  useEffect(() => {
    if (!user || isLoading) return;

    const resetActivity = () => {
      resetTimer();
    };

    window.addEventListener("mousemove", resetActivity);
    window.addEventListener("keydown", resetActivity);
    window.addEventListener("click", resetActivity);

    return () => {
      window.removeEventListener("mousemove", resetActivity);
      window.removeEventListener("keydown", resetActivity);
      window.removeEventListener("click", resetActivity);
    };
  }, [user]);

  
  useEffect(() => {
    if (!user || isLoading) return;
    console.log("🟢 Detección de inactividad activada para el usuario:");
  }, [user, isLoading]);

 
  if (!user || isLoading) {
    return <>{children}</>;
  }

  return (
    <IdleTimerProvider
      ref={idleTimerRef}
      timeout={TIMEOUT_INACTIVIDAD}
      onIdle={handleOnIdle}
      onPrompt={handleOnPrompt}
      promptBeforeIdle={AVISO_ANTES_MS} 
      debounce={2000} 
    >
      {children}
    </IdleTimerProvider>
  );
};

export default InactivityHandler;
