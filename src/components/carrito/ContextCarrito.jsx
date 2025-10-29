import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "../../hooks/ContextAuth";
import api from "../../utils/AxiosConfig";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user, csrfToken } = useAuth();
  const isCliente = user && user.rol === "cliente";
  const [cartCount, setCartCount] = useState(0); 
  const [isLoading, setIsLoading] = useState(true); 


  const userId = user?.id || user?.idUsuarios;

  const fetchCartCount = async () => {
    setIsLoading(true); 
    if (!isCliente || !userId) {
      setCartCount(0);
      setIsLoading(false);
      return;
    }

    try {
      const response = await api.get(`/api/carrito/count/${userId}`, {
        withCredentials: true,
        headers: { "X-CSRF-Token": csrfToken },
      });
      const count = response.data.count || 0;
      console.log("Conteo del carrito desde el backend:", count);
      setCartCount(count);
    } catch (error) {
      console.error("Error al obtener el conteo del carrito:", error);
      setCartCount(0);
    } finally {
      setIsLoading(false); 
    }
  };

  useEffect(() => {
    fetchCartCount();
  }, [fetchCartCount,user, csrfToken, isCliente]); 

  const addToCart = async () => {
    if (isCliente && userId) {
      await fetchCartCount(); 
    }
  };

  const removeFromCart = async () => {
    if (isCliente && userId) {
      await fetchCartCount(); 
    }
  };

  const value = isCliente
    ? { cartCount, addToCart, removeFromCart, isLoading }
    : { cartCount: 0, addToCart: () => {}, removeFromCart: () => {}, isLoading: false };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  return useContext(CartContext);
};