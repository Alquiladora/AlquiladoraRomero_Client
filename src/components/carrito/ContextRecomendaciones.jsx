import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from '../../hooks/ContextAuth'; // <-- 1. Importa el hook de autenticación

// Crear el contexto
const RecomendacionesContext = createContext();

// Crear el Proveedor (Provider) que manejará el estado
export const RecomendacionesProvider = ({ children }) => {
  const { user } = useAuth(); // <-- 2. Obtén la información del usuario actual
  const userId = user?.idUsuarios || user?.id;

  // --- MEJORA CLAVE: La clave de localStorage ahora es única para cada usuario ---
  const storageKey = userId ? `recomendacionesApp_${userId}` : null;

  const [recomendaciones, setRecomendaciones] = useState(() => {
    if (!storageKey) return []; // Si no hay usuario, no hay recomendaciones guardadas
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

  // Cada vez que las recomendaciones o el usuario cambien, se actualiza localStorage
  useEffect(() => {
    // Solo guarda si hay un usuario logueado
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
    // También limpia el localStorage para el usuario actual
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

// Crear un hook personalizado para usar el contexto fácilmente
export const useRecomendaciones = () => {
  return useContext(RecomendacionesContext);
};
