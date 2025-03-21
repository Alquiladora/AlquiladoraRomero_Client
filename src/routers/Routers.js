import { BrowserRouter as Router, Routes, Route,useNavigate } from 'react-router-dom';
import { useContext, useEffect } from "react";
//----------------------LAYOUTS--------------------------------------------
import LayoutHeader from "../components/layout/LayHeader";
import RoutePrivate from './RoutePrivate';
import RoutePublic from './RoutePublic';

import ErrorBoundary from './Errors/ErrorBoundary';
import ServerErrorModal from './Errors/ErrorTime';
import AuthRedirector from '../components/layout/UrlDirrecion';
import CarritoCompras from '../components/carrito/CarritoCompras';







import Error404 from './Errors/Error404';
import Error500 from './Errors/Error500';


//-------------------PUBLIC------------------------
import Home from "../pages/public/home/Home";
import { Login } from '../security/Login/Login';
import Registro from '../security/Registro/Registro';
import Catalogo from '../pages/public/catalog/Catalogo';
import CambiarPassword from '../security/recuperacion/CambiarPasswor';
import ProductosCategoria from '../components/productosCategoria/ProductosCatgeoria';
import PoliticasPrivacidad from '../components/footer/foter-empresa/Politicas';
import RastrearPedido from '../components/rastreo-pedido/RastreoPedido';


//-------------------CLIENT------------------------
import PerfilUsuarioPrime from '../pages/client/perfil/PerfilClient';
import TokenModal from '../pages/client/perfil/componetsPerfil/TokenModal';
import ChangePassword from '../pages/client/perfil/componetsPerfil/ChangePassword';
import DetalleProducto from '../components/productosCategoria/productosDetalles';


//-------------------ADMIN------------------------
import MenuHomeAdmin from '../pages/admin/home/MenuAdmin';







const Routerss = () => {
 




  return (
    <>
      <ErrorBoundary>

      <div className="dark:bg-gray-950 dark:text-white">
      <ServerErrorModal />
      
       

        <Routes>
     
          
        <Route path="/" element={<RoutePublic><LayoutHeader> <Home /></LayoutHeader> </RoutePublic>} />
        <Route path="/login" element={<RoutePublic><LayoutHeader><Login /></LayoutHeader></RoutePublic>} />
        <Route path="/registro" element={<RoutePublic><LayoutHeader><Registro /></LayoutHeader></RoutePublic>} />
        <Route path="/cambiarPass" element={<RoutePublic><LayoutHeader><CambiarPassword /></LayoutHeader></RoutePublic>} />
        <Route path="/categoria/:categori" element={<RoutePublic> <LayoutHeader>< ProductosCategoria /></LayoutHeader></RoutePublic>} />
        <Route path="/:categori/:idProducto" element={<RoutePublic> <LayoutHeader>< DetalleProducto /></LayoutHeader></RoutePublic>} />
        <Route path="/politicas-privacidad" element={<RoutePublic> <LayoutHeader>< PoliticasPrivacidad /></LayoutHeader></RoutePublic>} />
        <Route path="/deslin-legal" element={<RoutePublic> <LayoutHeader>< PoliticasPrivacidad /></LayoutHeader></RoutePublic>} />
        <Route path="/terminos-condiciones" element={<RoutePublic> <LayoutHeader>< PoliticasPrivacidad /></LayoutHeader></RoutePublic>} />

        <Route path="/rastrear-pedido" element={<RoutePublic> <LayoutHeader>< RastrearPedido /></LayoutHeader></RoutePublic>} />
       



          {/**=====================CLIENTE============================= */}
          <Route path="/cliente" element={<RoutePrivate rolesPermitidos={['cliente']}> <LayoutHeader>< Home /></LayoutHeader></RoutePrivate>} />
          <Route path="/cliente/carrito" element={<RoutePrivate rolesPermitidos={['cliente']}> <LayoutHeader>< CarritoCompras /></LayoutHeader></RoutePrivate>} />
          <Route path="/cliente/perfil" element={<RoutePrivate rolesPermitidos={['cliente']}> <LayoutHeader><PerfilUsuarioPrime  /></LayoutHeader></RoutePrivate>} />
          <Route path="/cliente/cambiarPassword" element={<RoutePrivate rolesPermitidos={['cliente']}> <LayoutHeader><TokenModal  /></LayoutHeader></RoutePrivate>} />
          <Route path="/cliente/updatePass" element={<RoutePrivate rolesPermitidos={['cliente']}> <LayoutHeader><ChangePassword  /></LayoutHeader></RoutePrivate>} />
          <Route path="/cliente/categoria/:categori" element={<RoutePrivate rolesPermitidos={['cliente']}> <LayoutHeader>< ProductosCategoria /></LayoutHeader></RoutePrivate>} />
          <Route path="/cliente/:categori/:idProducto" element={<RoutePrivate rolesPermitidos={['cliente']}> <LayoutHeader>< DetalleProducto /></LayoutHeader></RoutePrivate>} />
          <Route path="/cliente/politicas-privacidad" element={<RoutePrivate rolesPermitidos={['cliente']}> <LayoutHeader>< PoliticasPrivacidad /></LayoutHeader></RoutePrivate>} />
          <Route path="/cliente/deslin-legal" element={<RoutePrivate rolesPermitidos={['cliente']}> <LayoutHeader>< PoliticasPrivacidad /></LayoutHeader></RoutePrivate>} />
          <Route path="/cliente/terminos-condiciones" element={<RoutePrivate rolesPermitidos={['cliente']}> <LayoutHeader>< PoliticasPrivacidad /></LayoutHeader></RoutePrivate>} />



          {/**=====================ADMINISTRADOR============================= */}
          <Route path="/administrador" element={<RoutePrivate rolesPermitidos={['administrador']}> <LayoutHeader><MenuHomeAdmin  /></LayoutHeader></RoutePrivate>} />
          <Route path="/administrador/cambiarPassword" element={<RoutePrivate rolesPermitidos={['administrador']}> <LayoutHeader><TokenModal /></LayoutHeader></RoutePrivate>} />
          <Route path="/administrador/updatePass" element={<RoutePrivate rolesPermitidos={['administrador']}> <LayoutHeader><ChangePassword /></LayoutHeader></RoutePrivate>} />
       



          {/**=====================REPARTIDOR============================= */}

          {/**===================== ERROR 404 (Cualquier ruta no encontrada) ============================= */}
          <Route path="*" element={<LayoutHeader><Error404 /></LayoutHeader>} />

          <Route path="/error500" element={<LayoutHeader><Error500 /></LayoutHeader>} />
        

        </Routes>
       

      </div>


      </ErrorBoundary>

    </>
  )
}

export default Routerss;


