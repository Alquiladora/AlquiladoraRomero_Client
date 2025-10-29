/* eslint-disable jsx-a11y/anchor-is-valid, react-hooks/exhaustive-deps */
import Swal from "sweetalert2";
import React, {
  useState,
  useEffect,
} from "react";
import { useIdleTimer } from "react-idle-timer";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./ContextAuth";

const InactivityHandler = ({ children }) => {
  const navigate = useNavigate();
  const TIMEOUT_INACTIVIDAD = 10 * 60 * 1000;
  const AVISO_ANTES_MS = 50 * 1000;
  const { user, isLoading, logout } = useAuth();
  const [ setShowWarning] = useState(false);

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

  const { reset } = useIdleTimer({
    timeout: TIMEOUT_INACTIVIDAD,
    onIdle: handleOnIdle,
    onPrompt: handleOnPrompt,
    onAction: () => Swal.close(),
    promptBeforeIdle: AVISO_ANTES_MS,
    debounce: 2000,
  });

  const resetTimer = () => {
    if (!user || isLoading) return;
 
    reset();
    Swal.close()
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

  if (!user || isLoading) {
    return <>{children}</>;
  }

  return <>{children}</>;
};

export default InactivityHandler;
