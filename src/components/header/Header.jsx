import NavEncabezado from "./navHeader/NavHeader"
import HeaderChild1 from "./headerChild/HeaderChil1";
import { useAuth } from "../../hooks/ContextAuth";
import React, { useState, useEffect, useContext, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

const Header=()=>{
  const { user,isLoading} = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading && user) {
      const rutasPrivadas = {
        cliente: "/cliente",
        administrador: "/administrador",
        repartidor: "/repartidor",
      };

      const rutaDestino = rutasPrivadas[user.rol] || "/";
      if (!location.pathname.startsWith(rutaDestino)) {
        navigate(rutaDestino, { replace: true });
      }
    }
  }, [navigate, location.pathname, user, isLoading]);



   return(
    <>
      <NavEncabezado />
      {user?.rol !== "administrador" && <HeaderChild1 />}

    
    </>
   )
}

export default Header;