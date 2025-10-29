import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/ContextAuth';
const AuthRedirector = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();

  // Definir rutas privadas por rol
  const rutasPrivadas = {
    administrador: '/administrador',
    cliente: '/cliente',
    repartidor: '/repartidor',
  };

  if (user?.rol) {
    const rutaDestino = rutasPrivadas[user.rol] || '/';

    if (location.pathname !== rutaDestino) {
      return <Navigate to={rutaDestino} replace />;
    }
  }

  return children;
};

export default AuthRedirector;
