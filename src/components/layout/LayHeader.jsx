import React from "react";
import { useLocation } from "react-router-dom";
import Header from "../header/Header";
import Footer from "../footer/Footer";
import Breadcrumbs from "../../utils/Breadcrumbs";

const LayoutHeader = ({ children }) => {
  const location = useLocation();
  const path = location.pathname.toLowerCase();
  let encabezado;
  let piePagina;


  if (path.startsWith("/admin")) {
    encabezado = <Header admin={true} />;
    piePagina = <Footer admin={true} />;
  } else if (path.startsWith("/cliente")) {
    encabezado = <Header cliente={true} />;
    piePagina = <Footer cliente={true} />;
  } else {
    encabezado = <Header />;
    piePagina = <Footer />;
  }


  const ocultarBreadcrumbs = [
    "/", "/home", 
    "/cliente", "/cliente/home", 
    "/admin", "/admin/home",
    "/repartidor", "/repartidor/home"
  ].includes(path);

  return (
    <>
      {encabezado}
      <div className="p-4">
        {!ocultarBreadcrumbs && <Breadcrumbs />} 
        {children}
      </div>
      {piePagina}
    </>
  );
};

export default LayoutHeader;
