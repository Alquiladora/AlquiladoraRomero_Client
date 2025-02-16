import React, { useMemo } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/ContextAuth";
import SpinerCarga from "../utils/SpinerCarga";

const RoutePrivate = ({ children, rolesPermitidos = [] }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  // Asegurar que rolesPermitidos siempre sea un array
  const rolesValidos = Array.isArray(rolesPermitidos) ? rolesPermitidos : [];

  // Verificar si el usuario tiene permiso (useMemo siempre debe ejecutarse)
  const tienePermiso = useMemo(() => user?.rol && rolesValidos.includes(user.rol), [user?.rol, rolesValidos]);

  // Mostrar spinner mientras se carga la autenticación
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-gray-900">
        <SpinerCarga />
      </div>
    );
  }

  // Si no hay usuario autenticado, redirigir al login
  if (!user) {
    console.warn("Acceso denegado: Usuario no autenticado.");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si el usuario no tiene el rol permitido, redirigir a inicio
  if (!tienePermiso) {
    console.warn(`Acceso denegado: El rol (${user?.rol}) no tiene permisos para acceder.`);
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
};

export default RoutePrivate;
