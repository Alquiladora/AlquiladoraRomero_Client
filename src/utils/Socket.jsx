import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../hooks/ContextAuth';

//const SOCKET_SERVER_URL = 'http://localhost:3001';
const SOCKET_SERVER_URL = 'https://alquiladora-romero-server.onrender.com';

export const useSocket = () => {
  const socketRef = useRef(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user || socketRef.current) return;

    const userId = user?.id || user?.idUsuarios || user?.idUsuario;

    if (!userId) {
      console.error('❌ No user ID available for socket connection');
      return;
    }
    const socketIo = io(SOCKET_SERVER_URL, {
      withCredentials: true,
      query: { idUsuario: userId },
      transports: ['websocket'],
      upgrade: false,
    });

    socketRef.current = socketIo;
    socketIo.on('connect', () => {
      console.log(
        `✅ Socket conectado con ID: ${socketIo.id} en URL: ${SOCKET_SERVER_URL}`
      );
      socketIo.emit('usuarioAutenticado', userId);
      console.log(
        `✅ Usuario ${userId} registrado con evento usuarioAutenticado`
      );
    });

    socketIo.on('connect_error', (err) => {
      console.error(
        `❌ Error de conexión al socket en ${SOCKET_SERVER_URL}:`,
        err.message,
        err.description
      );
    });

    socketIo.on('disconnect', (reason) => {
      console.log(`🔌 Socket desconectado. Razón: ${reason}`);
      if (reason === 'io server disconnect') {
        socketIo.connect();
      }
    });

    socketIo.on('productoAgregadoCarrito', (data) => {
      console.log("Evento 'productoAgregadoCarrito' recibido:", data);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.removeAllListeners();
        socketRef.current.disconnect();
        console.log(`🔌 Socket desconectado y limpiado para usuario ${userId}`);
        socketRef.current = null;
      }
    };
  }, [user?.id, user?.idUsuarios, user?.idUsuario]);

  return socketRef.current;
};
