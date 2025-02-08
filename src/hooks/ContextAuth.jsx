import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [csrfToken, setCsrfToken] = useState("");
  const [error, setError] = useState(null);  
  const BASE_URL = "http://localhost:3001";

  // Obtener el token CSRF al montar el componente
  const fetchCsrfToken = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/get-csrf-token`, { withCredentials: true });
      setCsrfToken(response.data.csrfToken);
      console.log("CSRF Token:", response.data.csrfToken);
    } catch (error) {
      setError(" Error En EL Servidor-500.");
      console.error('Error obteniendo el token CSRF:', error);
    }
  };

  // Verificar la autenticación
  const checkAuth = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/usuarios/perfil`, { withCredentials: true });
      console.log("Perfil de usuario:", response);
      if (response.data && response.data.user) {
        setUser(response.data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error verificando la autenticación:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Cerrar sesión
  const logout = async () => {
    try {
      if (!csrfToken) {
        console.log("CSRF Token no encontrado, obteniendo uno nuevo...");
        await fetchCsrfToken(); 
      }
  
      console.log("CSRF Token obtenido:", csrfToken);
  
      const response = await axios.post(`${BASE_URL}/api/usuarios/Delete/login`, {}, {
        withCredentials: true,
        headers: { 'X-CSRF-Token': csrfToken },
      });
  
      console.log("Respuesta del servidor al cerrar sesión:", response);
  
      if (response.status === 200) {
        console.log("Sesión cerrada correctamente.");
        setUser(null);
      } else {
        console.error("Error inesperado al cerrar sesión. Código:", response.status);
        setError("Error inesperado al cerrar sesión.");
      }
  
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
  
      if (error.response) {
        // El servidor respondió con un código de error
        console.error("Respuesta del servidor:", error.response.data);
        setError(`Error del servidor: ${error.response.data.message || "Error desconocido"}`);
      } else if (error.request) {
        // La petición se hizo, pero no hubo respuesta
        console.error("No se recibió respuesta del servidor.");
        setError("No se pudo conectar con el servidor.");
      } else {
        // Otro error ocurrió al configurar la solicitud
        console.error("Error en la configuración de la solicitud:", error.message);
        setError("Error al cerrar sesión.");
      }
    }
  };
  


  useEffect(() => {
    fetchCsrfToken(); 
    checkAuth();
  }, []);

 
  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, setUser, isLoading, checkAuth, logout, csrfToken, error }}>
      {error && <div className="error">{error}</div>} 
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
