/* eslint-disable */
import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useRef,
  useCallback
} from 'react';
import SpinerCarga from '../utils/SpinerCarga';
import { useNavigate } from 'react-router-dom';
import api from '../utils/AxiosConfig';
import {
  subscribeUserToPush,
  unsubscribeUserFromPush,
} from './notificacionesPwa';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [csrfToken, setCsrfToken] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const isMounted = useRef(true);
  const hasFetchedToken = useRef(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const fetchCsrfToken = useCallback(async () => {
    if (csrfToken || hasFetchedToken.current) return csrfToken;
    try {
      const response = await api.get('/api/get-csrf-token', {
        withCredentials: true,
      });
      const newToken = response.data.csrfToken;
      setCsrfToken(newToken);
      hasFetchedToken.current = true;
      return newToken;
    } catch (error) {
      console.error('⚠️ Error obteniendo el token CSRF:', error);
      hasFetchedToken.current = true;
      return null;
    }
  }, [csrfToken]);


  const checkAuth = useCallback(async () => {
    if (!csrfToken) {
      if (isMounted.current) setIsLoading(false);
      return;
    }

    try {
      const response = await api.get('/api/usuarios/perfil', {
        withCredentials: true,
        headers: { 'X-CSRF-Token': csrfToken },
      });

      if (isMounted.current) {

        if (response.data?.user) {
          setUser(response.data.user);
        } else {
          setUser(null);
        }
      }

    } catch (error) {
      console.error('⚠️ Error verificando autenticación:', error);

      if (isMounted.current) {
        setUser(null);



        const publicPaths = ['/', '/login', '/registro', '/cambiarPass', '/categoria', '/deslin-legal', '/terminos-condiciones', '/rastrear-pedido', '/SobreNosotros', '/politicas-privacidad'];
        const isCurrentlyInPublicPath = publicPaths.some(path => window.location.pathname.startsWith(path));

        const isAuthError = error.response?.status === 403 || error.response?.status === 401;
        if (isAuthError && !isCurrentlyInPublicPath) {
          navigate('/login');
          setError('Sesión expirada o acceso no autorizado.');
        }

        else if (!error.response) {
          setError('No se pudo conectar con el servidor.');
        } else if (error.response.data?.message) {
          setError(error.response.data.message);
        }
      }
    } finally {
      if (isMounted.current) setIsLoading(false);
    }
  }, [csrfToken, navigate])

  useEffect(() => {
    isMounted.current = true;
    const initializeAuth = async () => {
      const token = await fetchCsrfToken();
      if (!token) {
        if (isMounted.current) setIsLoading(false);
      }
    };

    if (!hasFetchedToken.current) {
      initializeAuth();
    }

    return () => {
      isMounted.current = false;
    };
  }, [fetchCsrfToken]);


  useEffect(() => {
    if (csrfToken && !user && hasFetchedToken.current) {
      checkAuth();
    }
    const userId = user?.id || user?.idUsuarios;
    if (!isLoading && userId && csrfToken) {
      console.log('🔥 Disparando suscripción Push para el usuario:', userId);

      const timer = setTimeout(() => {
        console.log('-> Suscripción iniciada con token:', csrfToken);
        subscribeUserToPush(userId, csrfToken);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [isLoading, user, csrfToken, checkAuth]);



  const logout = async () => {
    const userId = user?.id || user?.idUsuarios;
    const SESSION_KEY = 'welcome_notified_' + userId;
    const CACHES_TO_DELETE = [
      'critical-user-cache',
      'critical-cart-cache',
      'cart-count-cache',
      'dynamic-api-cache',
    ];

    try {
      const tokenForLogout = csrfToken || await fetchCsrfToken();

      if (tokenForLogout) {
        await unsubscribeUserFromPush(tokenForLogout).catch(e => {
          console.error('⚠️ Error al desvincular Suscripción Push (continuando):', e);
        });
        console.log('🔗 Intento de desvinculación Push realizado.');
      }

      try {

        sessionStorage.removeItem(SESSION_KEY);
        console.log(
          `🗑️ Flag de bienvenida (${SESSION_KEY}) limpiado de sessionStorage.`
        );
        const RECOMENDACIONES_BASE_KEY = 'recomendacionesApp_';
        const RECOMENDACIONES_KEY_DINAMICA = RECOMENDACIONES_BASE_KEY + userId;
        localStorage.removeItem(RECOMENDACIONES_KEY_DINAMICA);
        console.log(`🗑️ Recomendaciones (${RECOMENDACIONES_KEY_DINAMICA}) limpiadas de localStorage.`);

        const keysToRemove = [];
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i);
          if (key && key.includes('previousLevel')) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(key => {
          sessionStorage.removeItem(key);
          console.log(`🗑️ Removido: ${key}`);
        });
        console.log('🗑️ Todos los datos de niveles limpiados de sessionStorage.');
      } catch (e) {
        console.error('⚠️ Error al limpiar sessionStorage (continuando):', e);
      }


      const response = await api.post(
        '/api/usuarios/Delete/login',
        { userId },
        {
          withCredentials: true,
          headers: {
            'X-CSRF-Token': csrfToken,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('✅ Sesión cerrada exitosamente.');

      if ('caches' in window) {
        try {

          await Promise.all(CACHES_TO_DELETE.map(cacheName =>
            caches.delete(cacheName).catch(e => {
              console.error(`⚠️ Error al eliminar caché ${cacheName} (Ignorado):`, e);
              return false;
            })
          ));
          console.log('🗑️ Cachés del Service Worker intentaron limpiarse.');
        } catch (cacheError) {

          console.error('⚠️ Error general al manipular Service Worker Caché (continuando):', cacheError);
        }

      }

      setUser(null);

    } catch (error) {
      console.error('⚠️ Error al cerrar sesión:', error);
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      }
    }
  };

  // useEffect(() => {
  //   isMounted.current = true;
  //   fetchCsrfToken();
  //   checkAuth();
  //   return () => {
  //     isMounted.current = false;
  //   };
  // }, [csrfToken]);


  return (
    <AuthContext.Provider
      value={{ user, setUser, isLoading, checkAuth, logout, csrfToken, error, isLoggingOut, setIsLoading }}
    >
      {isLoading ? <SpinerCarga /> : children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
