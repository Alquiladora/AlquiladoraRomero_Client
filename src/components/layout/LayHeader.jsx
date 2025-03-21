import React, { useMemo } from "react";
import { useLocation } from "react-router-dom";
import Header from "../header/Header";
import Footer from "../footer/Footer";
import Breadcrumbs from "../../utils/Breadcrumbs";

const LayoutHeader = ({ children }) => {
  const location = useLocation();
  const path = location.pathname.toLowerCase();

  // Rutas donde NO se mostrarán Breadcrumbs
  const ocultarBreadcrumbsPaths = new Set([
    "/", "/home",
    "/cliente", "/cliente/home",
    "/administrador", "/administrador/home",
    "/repartidor", "/repartidor/home"
  ]);

  // Determinar Header y Footer con useMemo para mejorar rendimiento
  const { encabezado, piePagina } = useMemo(() => {
    if (path.startsWith("/administrador")) {
      return { encabezado: <Header administrador />, piePagina: <Footer administrador /> };
    }
    if (path.startsWith("/cliente")) {
      return { encabezado: <Header cliente />, piePagina: <Footer cliente /> };
    }
    return { encabezado: <Header />, piePagina: <Footer /> };
  }, [path]);

  return (
    <>
      {encabezado}
      <div className="p-1">
        {!ocultarBreadcrumbsPaths.has(path) && <Breadcrumbs />}
        {children}
      </div>
      {piePagina}
    </>
  );
};

export default LayoutHeader;
