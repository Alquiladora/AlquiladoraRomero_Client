import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { useAuth } from "../hooks/ContextAuth";


// const SOCKET_SERVER_URL = process.env.REACT_APP_SOCKET_SERVER_URL ||  "http://localhost:3001";    
const SOCKET_SERVER_URL = process.env.REACT_APP_SOCKET_SERVER_URL ||  "https://alquiladora-romero-server.onrender.com";

export const useSocket = () => {
  const socketRef = useRef(null); 
  const { user } = useAuth() || {};

  useEffect(() => {
    if (!user || socketRef.current) return;

    const socketIo = io(SOCKET_SERVER_URL, {
      withCredentials: true,
    });

    socketRef.current = socketIo;
    const userId = user?.id || user?.idUsuarios;
    socketIo.emit("usuarioAutenticado", userId);  
    console.log(`✅ Socket conectado y usuario ${userId} registrado`);

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null; 
        console.log(`🔌 Socket desconectado para usuario ${userId}`);
      }
    };
  }, [user]);

  return socketRef.current;
};


