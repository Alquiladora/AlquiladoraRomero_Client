import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/ContextAuth";

const RoutePublic = ({ children }) => {
  const { user } = useAuth(); 
  
  console.log("Usuario autenticado en RoutePublic:", user);

  if (user) {
    const rutasPrivadas = {
      admin: "/administrador",
      cliente: "/cliente",
      repartidor: "/repartidor",
    };

    const rutaDestino = rutasPrivadas[user.rol] || "/"; 
    return <Navigate to={rutaDestino} replace />;
  }

  return children; 
};

export default RoutePublic;
