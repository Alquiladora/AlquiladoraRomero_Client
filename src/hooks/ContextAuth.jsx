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
      setError("Error obteniendo el token CSRF.");
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
        await fetchCsrfToken(); 
      }

      await axios.post(`${BASE_URL}/api/usuarios/Delete/login`, {}, {
        withCredentials: true,
        headers: { 'X-CSRF-Token': csrfToken },
      });

      setUser(null);
    } catch (error) {
      setError("Error al cerrar sesión.");
      console.error('Error al cerrar sesión', error);
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
