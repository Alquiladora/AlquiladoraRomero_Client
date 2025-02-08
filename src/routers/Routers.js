import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from "react";
//----------------------LAYOUTS--------------------------------------------
import LayoutHeader from "../components/layout/LayHeader";
import RoutePrivate from './RoutePrivate';




// import RoutePrivate from "./RoutePrivate";

import Error404 from './Errors/Error404';
import Error500 from './Errors/Error500';


//-------------------PUBLIC------------------------
import Home from "../pages/public/home/Home";
import { Login } from '../security/Login/Login';
import Registro from '../security/Registro/Registro';
import Catalogo from '../pages/public/catalog/Catalogo';
import CambiarPassword from '../security/recuperacion/CambiarPasswor';


//-------------------CLIENT------------------------
import PerfilUsuarioPrime from '../pages/client/perfil/PerfilClient';


const Routerss = () => {





  return (
    <>

      <div className="dark:bg-gray-950 dark:text-white">
        <Routes>
          <Route path="/" element={<LayoutHeader><Home /></LayoutHeader>} />

          <Route path="/login" element={<LayoutHeader><Login /></LayoutHeader>} />
          <Route path="/registro" element={<LayoutHeader><Registro /></LayoutHeader>} />
          <Route path="/cambiarPass" element={<LayoutHeader><CambiarPassword /></LayoutHeader>} />
          <Route path="/categorias/sillas" element={<LayoutHeader><Catalogo /></LayoutHeader>} />




          {/**=====================CLIENTE============================= */}
          <Route path="/cliente" element={<RoutePrivate rolesPermitidos={['cliente']}> <LayoutHeader>< Home /></LayoutHeader></RoutePrivate>} />
          <Route path="/cliente/perfil" element={<RoutePrivate rolesPermitidos={['cliente']}> <LayoutHeader><PerfilUsuarioPrime  /></LayoutHeader></RoutePrivate>} />




          {/**=====================ADMINISTRADOR============================= */}




          {/**=====================REPARTIDOR============================= */}

          {/**===================== ERROR 404 (Cualquier ruta no encontrada) ============================= */}
          <Route path="*" element={<LayoutHeader><Error404 /></LayoutHeader>} />
          <Route path="/error500" element={<LayoutHeader><Error500 /></LayoutHeader>} />
        

        </Routes>

      </div>




    </>
  )
}

export default Routerss;


