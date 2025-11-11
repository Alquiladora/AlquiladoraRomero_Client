/* eslint-disable */
import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useRef,
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

  const fetchCsrfToken = async () => {
    if (csrfToken) return;
    try {
      const response = await api.get('/api/get-csrf-token', {
        withCredentials: true,
      });
      setCsrfToken(response.data.csrfToken);
    } catch (error) {
      console.error('⚠️ Error obteniendo el token CSRF:', error);
    }
  };

  const checkAuth = async () => {
    if (!csrfToken) {
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
          navigate('/login');
        }
      }
    } catch (error) {
      console.error('⚠️ Error verificando autenticación:', error);
      if (isMounted.current) {
        setUser(null);
        navigate('/login');
        if (!error.response) {
          setError('No se pudo conectar con el servidor.');
        } else if (error.response.data?.message) {
          setError(error.response.data.message);
        }
      }
    } finally {
      if (isMounted.current) setIsLoading(false);
    }
  };

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
      if (!csrfToken) await fetchCsrfToken();
      if (csrfToken) {
        await unsubscribeUserFromPush(csrfToken);
        console.log('🔗 Suscripción Push desvinculada del usuario actual.');
      }
      sessionStorage.removeItem(SESSION_KEY);
      console.log(
        `🗑️ Flag de bienvenida (${SESSION_KEY}) limpiado de sessionStorage.`
      );
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

          await Promise.all(CACHES_TO_DELETE.map(cacheName => {
            return caches.delete(cacheName).then(deleted => {
              if (deleted) {
                console.log(`🗑️ Caché: ${cacheName} limpiada.`);
              }
            });
          }));
        } catch (cacheError) {
          console.error(
            '⚠️ Error al limpiar el caché del Service Worker:',
            cacheError
          );
        }
      }

      setUser(null);
      navigate('/login');
    } catch (error) {
      console.error('⚠️ Error al cerrar sesión:', error);
      if (error.response?.data?.message) {
        setError(error.response.data.message);
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
    const userId = user?.id || user?.idUsuarios;
    if (!isLoading && userId && csrfToken) {
      console.log('🔥 Disparando suscripción Push para el usuario:', userId);

      const timer = setTimeout(() => {
        console.log('-> Suscripción iniciada con token:', csrfToken);
        subscribeUserToPush(userId, csrfToken);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [isLoading, user, csrfToken]);

  return (
    <AuthContext.Provider
      value={{ user, setUser, isLoading, checkAuth, logout, csrfToken, error }}
    >
      {isLoading ? <SpinerCarga /> : children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
