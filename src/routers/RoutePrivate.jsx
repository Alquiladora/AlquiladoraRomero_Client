import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/ContextAuth';
import Spinner from './Spiner';

const RoutePrivate = ({ children, rolesPermitidos }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (!Array.isArray(rolesPermitidos)) {
    console.error("rolesPermitidos debe ser un arreglo.");
    return <Navigate to="/*" replace />;
  }

  // Mientras se verifica la autenticación
  if (isLoading) {
    console.log("Verificando autenticación...");
    return <div> <Spinner/> </div>; 
  }

  // Si no hay usuario autenticado, redirigir al login
  if (!user) {
    console.warn("Acceso no autorizado: Usuario no autenticado.");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Verificar si el usuario tiene uno de los roles permitidos
  const tienePermiso = rolesPermitidos.includes(user?.rol);

  // Si tiene permiso, renderizar el contenido; si no, redirigir a la página principal o error
  if (tienePermiso) {
    return children;
  } else {
    console.warn(`Acceso denegado: El rol del usuario (${user?.rol}) no tiene permisos para acceder.`);
    return <Navigate to="/" state={{ from: location }} replace />;
  }
};

export default RoutePrivate;
