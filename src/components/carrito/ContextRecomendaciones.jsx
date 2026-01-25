import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from '../../hooks/ContextAuth';


const RecomendacionesContext = createContext();


export const RecomendacionesProvider = ({ children }) => {
  const { user } = useAuth();
  const userId = user?.idUsuarios || user?.id;


  const storageKey = userId ? `recomendacionesApp_${userId}` : null;

  const [recomendaciones, setRecomendaciones] = useState(() => {
    if (!storageKey) return [];
    try {
      const recomendacionesGuardadas = localStorage.getItem(storageKey);
      return recomendacionesGuardadas
        ? JSON.parse(recomendacionesGuardadas)
        : [];
    } catch (error) {
      console.error('Error al leer recomendaciones de localStorage', error);
      return [];
    }
  });

  useEffect(() => {
    if (storageKey) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(recomendaciones));
      } catch (error) {
        console.error(
          'Error al guardar recomendaciones en localStorage',
          error
        );
      }
    }
  }, [recomendaciones, storageKey]);

  const actualizarRecomendaciones = (nuevasRecomendaciones) => {
    setRecomendaciones(nuevasRecomendaciones || []);
  };

  const limpiarRecomendaciones = () => {
    setRecomendaciones([]);
    if (storageKey) {
      localStorage.removeItem(storageKey);
    }
  };

  const value = {
    recomendaciones,
    actualizarRecomendaciones,
    limpiarRecomendaciones,
  };

  return (
    <RecomendacionesContext.Provider value={value}>
      {children}
    </RecomendacionesContext.Provider>
  );
};


export const useRecomendaciones = () => {
  return useContext(RecomendacionesContext);
};
