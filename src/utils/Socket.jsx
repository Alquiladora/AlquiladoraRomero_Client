/* eslint-disable */
import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../hooks/ContextAuth';

// Detecta entorno y configura la URL del socket
const SOCKET_SERVER_URL =
  process.env.REACT_APP_SOCKET_SERVER_URL ||
  (window.location.hostname === 'localhost'
    ? 'http://localhost:3001'
    : 'https://alquiladora-romero-server.onrender.com');

export const useSocket = () => {
  const socketRef = useRef(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    if (socketRef.current) return;

    const userId = user?.id || user?.idUsuarios || user?.idUsuario;
    if (!userId) {
      console.error('No user ID available for socket connection');
      return;
    }

    const socketIo = io(SOCKET_SERVER_URL, {
      withCredentials: true,
      transports: ['websocket'], // 🔧 fuerza WebSocket puro (evita polling)
      query: { idUsuario: userId },
    });

    socketRef.current = socketIo;

    socketIo.on('connect', () => {
      console.log(`✅ Socket conectado con ID: ${socketIo.id}`);
      socketIo.emit('usuarioAutenticado', userId);
      console.log(`✅ Usuario ${userId} registrado en socket`);
    });

    socketIo.on('connect_error', (err) => {
      console.error('❌ Error de conexión al socket:', err.message);
    });

    socketIo.on('productoAgregadoCarrito', (data) => {
      console.log("🛒 Evento 'productoAgregadoCarrito' recibido:", data);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        console.log(`🔌 Socket desconectado para usuario ${userId}`);
        socketRef.current = null;
      }
    };
  }, [user?.id, user?.idUsuarios, user?.idUsuario]);

  return socketRef.current;
};
