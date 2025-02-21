import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useRef,
} from "react";
import axios from "axios";
import SpinerCarga from "../utils/SpinerCarga";
import { useNavigate } from "react-router-dom";
import api from "../utils/AxiosConfig";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [csrfToken, setCsrfToken] = useState("");
  const [error, setError] = useState(null);
  const BASE_URL = "http://localhost:3001";
  const navigate = useNavigate();
  const isMounted = useRef(true);

  const fetchCsrfToken = async () => {
    console.log("csrftoke no existe", csrfToken);
    if (csrfToken) return;

    try {
      const response = await api.get(`/api/get-csrf-token`, {
        withCredentials: true,
      });
      setCsrfToken(response.data.csrfToken);
      console.log("Registro ontenido", response.data.csrfToken);
    } catch (error) {
      console.error("⚠️ Error obteniendo el token CSRF:", error);
      setError("Error en el servidor - 500.");
    }
  };

  // 🔹 Verificar autenticación
  const checkAuth = async () => {
    if (!navigator.onLine) {
      console.warn("No hay conexión a Internet. Revisa tu conexión.");
      if (isMounted.current) {
        setError("No se pudo conectar con el servidor. Revisa tu conexión.");
        setIsLoading(false);
      }
      return;
    }

    try {
      const response = await api.get(`/api/usuarios/perfil`, {
        withCredentials: true,
        headers: { "X-CSRF-Token": csrfToken },
      });

      if (isMounted.current) {
        if (response.data?.user) {
          setUser(response.data.user);
          console.log("Usuario obtenido:", response.data.user);
        } else {
          setUser(null);
        }
      }
    } catch (error) {
      console.error("⚠️ Error verificando la autenticación:", error);
      if (error.response) {
        if (error.response.status === 500) {
          console.error("🔥 Error 500: Problema en el servidor.");
        } else if (
          error.response.status === 401 ||
          error.response.status === 403
        ) {
          console.warn(
            "⚠️ Usuario no autenticado. Sesión expirada o inválida."
          );
          setUser(null);
        } else {
          setError(
            error.response?.data?.message ||
              "Error desconocido al verificar autenticación."
          );
        }
      } else {
        setError("No se pudo conectar con el servidor. Revisa tu conexión.");
      }

      setUser(null);
    } finally {
      if (isMounted.current) setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (!csrfToken) await fetchCsrfToken();

      const response = await api.post(
        `/api/usuarios/Delete/login`,
        { userId: user?.idUsuarios },
        {
          withCredentials: true,
          headers: {
            "X-CSRF-Token": csrfToken,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200 || response.status === 401) {
        console.log("✅ Sesión cerrada exitosamente o ya expirada.");
        setUser(null);
        navigate("/login");
      } else {
        console.warn(
          "⚠️ No se pudo cerrar sesión correctamente, recargando..."
        );
        window.location.reload();
      }
    } catch (error) {
      console.error("⚠️ Error al cerrar sesión:", error);

      if (error.response?.status === 401 || error.response?.status === 403) {
        console.warn("⚠️ La sesión ya estaba cerrada, recargando...");
        window.location.reload();
      } else {
        setError(error.response?.data?.message || "Error al cerrar sesión.");
      }
    }
  };

  useEffect(() => {
    isMounted.current = true;
    fetchCsrfToken();
    checkAuth();
    return () => {
      isMounted.current = false;
    };
  }, [csrfToken]);

   useEffect(() => {
    if (user && navigator.onLine) {
      const intervalId = setInterval(() => {
        checkAuth();
      }, 30000);
      return () => clearInterval(intervalId);
    }
  }, [user, csrfToken]);

  if (isLoading) return <SpinerCarga />;

  return (
    <AuthContext.Provider
      value={{ user, setUser, isLoading, checkAuth, logout, csrfToken, error }}
    >
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
