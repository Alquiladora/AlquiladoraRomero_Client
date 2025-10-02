import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/ContextAuth";

const GlobalErrores = () => {
  const navigate = useNavigate();
  const { user } = useAuth(); 

  console.log("Datos recibidos", user)

  useEffect(() => {
    const handleServerError = () => {
      if (!user?.rol) {
        navigate("/error500");
        return;
      }

      switch (user.rol.toLowerCase()) {
        case "cliente":
          navigate("/cliente/error500");
          break;
        case "administrador":
          navigate("/administrador/error500");
          break;
        case "repartidor":
          navigate("/repartidor/error500");
          break;
        default:
          navigate("/error500");
          break;
      }
    };


    
    window.addEventListener("server-error", handleServerError);

    return () => {
      window.removeEventListener("server-error", handleServerError);
    };
  }, [navigate, user]);

  return null;
};

export default GlobalErrores;
