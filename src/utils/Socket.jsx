
import { useEffect, useMemo } from 'react';
import io from 'socket.io-client';
import api from './AxiosConfig';

const SOCKET_SERVER_URL =  'http://localhost:3001';
export const useSocket = () => {
    const socket = useMemo(() => io(SOCKET_SERVER_URL, {
      withCredentials: true,
    
    }), []);
  
    useEffect(() => {
      return () => {
        socket.disconnect();
      };
    }, [socket]);
  
    return socket;
  };