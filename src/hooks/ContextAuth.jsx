import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import SpinerCarga from "../utils/SpinerCarga";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [csrfToken, setCsrfToken] = useState("");
  const [error, setError] = useState(null);
  const BASE_URL = "http://localhost:3001";
  const CHECK_COOKIE_INTERVAL = 2 * 1000; 
  const navigate = useNavigate();

 const fetchCsrfToken = async () => {
    if (csrfToken) return;
    try {
      const response = await axios.get(`${BASE_URL}/api/get-csrf-token`, { withCredentials: true });
      setCsrfToken(response.data.csrfToken);
    } catch (error) {
      console.error("⚠️ Error obteniendo el token CSRF:", error);
      setError("Error en el servidor - 500.");
    }
  };

  // 🔹 Verificar autenticación
  const checkAuth = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/usuarios/perfil`, { withCredentials: true });
      if (response.data?.user) {
        setUser(response.data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("⚠️ Error verificando la autenticación:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (!csrfToken) await fetchCsrfToken();

      const response = await axios.post(
        `${BASE_URL}/api/usuarios/Delete/login`,
        { userId: user?.idUsuarios },
        {
          withCredentials: true,
          headers: { "X-CSRF-Token": csrfToken, "Content-Type": "application/json" },
        }
      );
        setUser(null);
        navigate("/login");
    } catch (error) {
      console.error("⚠️ Error al cerrar sesión:", error);
      setError(error.response?.data?.message || "Error al cerrar sesión.");
    }
  };


  const checkSessionCookie = async () => {
    if (!user) {
      console.log("Error usaurio no existe")
      return;
    }
     
    try {
      await axios.get(`${BASE_URL}/api/usuarios/perfil`, { withCredentials: true });
    } catch (error) {
   
      if (error.response?.status === 401 || error.response?.status === 403 || error.response?.status===404) {
        console.log("⚠️ Sesión inválida. La cookie fue eliminada manualmente o expiró.");
       navigate("/login");
      }
    }
  };
  
  useEffect(() => {
    fetchCsrfToken();
    checkAuth();

    if (user && !isLoading) {
     
      const interval = setInterval(checkSessionCookie, CHECK_COOKIE_INTERVAL);

      return () => clearInterval(interval);
    }
  }, [user, isLoading]); 

  if (isLoading) return <SpinerCarga />;

  return (
    <AuthContext.Provider value={{ user, setUser, isLoading, checkAuth, logout, csrfToken, error }}>
      {error && (
        <div className="border border-red-400 text-red-700 px-4 py-3 rounded dark:bg-gray-900 relative mb-4">
          <span className="block sm:inline">{error}</span>
        </div>    
      )}
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
