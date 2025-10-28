import React, { useEffect, useMemo } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/ContextAuth";
import SpinerCarga from "../utils/SpinerCarga";

const RoutePrivate = ({ children, rolesPermitidos = [] }) => {
  const { user, isLoading, checkAuth } = useAuth();
  const location = useLocation();
  const rolesValidos = Array.isArray(rolesPermitidos) ? rolesPermitidos : [];
  const tienePermiso = useMemo(() => user?.rol && rolesValidos.includes(user.rol), [user?.rol, rolesValidos]);
 useEffect(()=>{
   if (window.Cypress) return;
  checkAuth();
}, [checkAuth, window.Cypress]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-gray-900">
        <SpinerCarga />
      </div>
    );
  }

 
  if (!user) {
    console.warn("Acceso denegado: Usuario no autenticado.");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  
  if (!tienePermiso) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
};

export default RoutePrivate;
