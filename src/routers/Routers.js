import { BrowserRouter as Router, Routes, Route,useNavigate } from 'react-router-dom';
import { useContext, useEffect } from "react";
//----------------------LAYOUTS--------------------------------------------
import LayoutHeader from "../components/layout/LayHeader";
import RoutePrivate from './RoutePrivate';
import RoutePublic from './RoutePublic';
import { ServerStatusContext } from '../utils/ServerStatusContext';
import ErrorBoundary from './Errors/ErrorBoundary';
import ServerErrorModal from './Errors/ErrorTime';





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
import TokenModal from '../pages/client/perfil/componetsPerfil/TokenModal';
import ChangePassword from '../pages/client/perfil/componetsPerfil/ChangePassword';


const Routerss = () => {
  const { isServerOnline } = useContext(ServerStatusContext);
  const navigate = useNavigate();


  useEffect(() => {
    if (!isServerOnline) {
      navigate("/error500");
    }
  }, [isServerOnline, navigate]);

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
        <Route path="/categorias/sillas" element={<LayoutHeader><Catalogo /></LayoutHeader>} />



          {/**=====================CLIENTE============================= */}
          <Route path="/cliente" element={<RoutePrivate rolesPermitidos={['cliente']}> <LayoutHeader>< Home /></LayoutHeader></RoutePrivate>} />
          <Route path="/cliente/perfil" element={<RoutePrivate rolesPermitidos={['cliente']}> <LayoutHeader><PerfilUsuarioPrime  /></LayoutHeader></RoutePrivate>} />
          <Route path="/cliente/cambiarPassword" element={<RoutePrivate rolesPermitidos={['cliente']}> <LayoutHeader><TokenModal  /></LayoutHeader></RoutePrivate>} />
          <Route path="/cliente/updatePass" element={<RoutePrivate rolesPermitidos={['cliente']}> <LayoutHeader><ChangePassword  /></LayoutHeader></RoutePrivate>} />





          {/**=====================ADMINISTRADOR============================= */}




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


