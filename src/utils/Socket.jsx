
import { useEffect, useState } from "react";
import { io } from "socket.io-client";


const SOCKET_SERVER_URL = process.env.REACT_APP_SOCKET_SERVER_URL ||  "http://localhost:3001";    
// const SOCKET_SERVER_URL = process.env.REACT_APP_SOCKET_SERVER_URL ||  "https://alquiladora-romero-server.onrender.com";

export const useSocket = () => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const socketIo = io(SOCKET_SERVER_URL, {
      withCredentials: true,
    });

    setSocket(socketIo);

    return () => {
      socketIo.disconnect();
    };
  }, []);

  return socket;
};
