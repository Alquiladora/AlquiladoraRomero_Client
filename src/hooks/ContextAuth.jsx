import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useRef,
} from "react";
import SpinerCarga from "../utils/SpinerCarga";
import { useNavigate } from "react-router-dom";
import api from "../utils/AxiosConfig";


const AuthContext = createContext();


export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [csrfToken, setCsrfToken] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const isMounted = useRef(true);
 




  const fetchCsrfToken = async () => {
    if (csrfToken) return;
    try {
      const response = await api.get("/api/get-csrf-token", {
        withCredentials: true,
      });
      setCsrfToken(response.data.csrfToken);
    } catch (error) {
      console.error("⚠️ Error obteniendo el token CSRF:", error);
      setError("Error en el servidor - 500.");
    }
  };

  const checkAuth = async () => {
    try {
      const response = await api.get("/api/usuarios/perfil", {
        withCredentials: true,
        headers: { "X-CSRF-Token": csrfToken },
      });
      if (isMounted.current) {
        if (response.data?.user) {
          setUser(response.data.user);
        } else {
          console.warn("⚠️ Respuesta sin usuario, redirigiendo a login.");
          setUser(null);
          navigate("/login");
        }
      }
    } catch (error) {
      console.error("⚠️ Error verificando la autenticación:", error);
      if (error.response) {
        if (error.response.status === 500) {
          navigate("/error500");
        } else if (
          error.response.status === 401 ||
          error.response.status === 403
        ) {
          console.warn(
            "⚠️ Usuario no autenticado (401/403). Sesión expirada o inválida, redirigiendo a login."
          );
          setUser(null);
          navigate("/login");
        } else {
          setError(
            error.response?.data?.message ||
              "Error desconocido al verificar autenticación."
          );
        }
      } else {
        setError("No se pudo conectar con el servidor. Revisa tu conexión.");
      }
    } finally {
      if (isMounted.current) setIsLoading(false);
    }
  };

  const logout = async () => {
    const userId= user?.id || user?.idUsuarios
    try {
      if (!csrfToken) await fetchCsrfToken();
      const response = await api.post(
        "/api/usuarios/Delete/login",
        { userId },
        {
          withCredentials: true,
          headers: {
            "X-CSRF-Token": csrfToken,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        console.log("✅ Sesión cerrada exitosamente o ya expirada.");
        setUser(null);
        navigate("/login");
      } else {
        console.warn("⚠️ No se pudo cerrar sesión correctamente, recargando...");
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

  



  


  return (
    <AuthContext.Provider
      value={{ user, setUser, isLoading, checkAuth, logout, csrfToken, error}}
    >
     {isLoading ? <SpinerCarga /> : children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
