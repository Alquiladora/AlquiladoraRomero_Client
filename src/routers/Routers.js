import { Routes, Route } from 'react-router-dom';
import React, { lazy, Suspense } from 'react';

//----------------------LAYOUTS--------------------------------------------
import LayoutHeader from '../components/layout/LayHeader';
import RoutePrivate from './RoutePrivate';
import RoutePublic from './RoutePublic';
import { CartProvider } from '../components/carrito/ContextCarrito';

import ErrorBoundary from './Errors/ErrorBoundary';
import ServerErrorModal from './Errors/ErrorTime';

import { RecomendacionesProvider } from '../components/carrito/ContextRecomendaciones';

import Error404 from './Errors/Error404';
import Error500 from './Errors/Error500';

import GlobalErrores from './Errors/GlobalErrores';

//-------------------PUBLIC------------------------
import PoliticasPrivacidad from '../components/footer/foter-empresa/Politicas';
import RastrearPedido from '../components/rastreo-pedido/RastreoPedido';
import MissionVision from '../pages/public/home/MisionVision';
import DeslindeResponsabilidad from '../components/footer/foter-empresa/Deslin';
import TerminosCondiciones from '../components/footer/foter-empresa/terminos';
import TokenModal from '../pages/client/perfil/componetsPerfil/TokenModal';
import ChangePassword from '../pages/client/perfil/componetsPerfil/ChangePassword';

const lazyLoad = (importFunc, componentName) =>
  lazy(() =>
    importFunc().then((module) => ({
      default: module[componentName] || module.default,
    }))
  );

const Home = lazyLoad(() => import('../pages/public/home/Home'), 'Home');
const ProductosCategoria = lazyLoad(
  () => import('../components/productosCategoria/ProductosCatgeoria'),
  'ProductosCategoria'
);
const DetalleProducto = lazyLoad(
  () => import('../components/productosCategoria/productosDetalles'),
  'DetalleProducto'
);
const Login = lazyLoad(() => import('../security/Login/Login'), 'Login');
const Registro = lazyLoad(
  () => import('../security/Registro/Registro'),
  'Registro'
);
const CambiarPassword = lazyLoad(
  () => import('../security/recuperacion/CambiarPasswor'),
  'CambiarPassword'
);
//-------------------CLIENT------------------------
const CarritoCompras = lazyLoad(
  () => import('../components/carrito/CarritoCompras'),
  'CarritoCompras'
);
const PerfilUsuarioPrime = lazyLoad(
  () => import('../pages/client/perfil/PerfilClient'),
  'PerfilUsuarioPrime'
);
const HistorialPedidos = lazyLoad(
  () => import('../pages/client/pedidos/HistorailPedidos'),
  'HistorialPedidos'
);
const GamificacionPerfil = lazyLoad(
  () => import('../pages/client/Puntos/puntos'),
  'GamificacionPerfil'
);
const MensajeCompraExitosa = lazyLoad(
  () => import('../components/carrito/MensajeExitoso'),
  'MensajeCompraExitosa'
);
//-------------------ADMIN------------------------
const MenuHomeAdmin = lazyLoad(
  () => import('../pages/admin/home/MenuAdmin'),
  'MenuHomeAdmin'
);
//================================
//REPARTIDOR
const MenuRepartidor = lazyLoad(
  () => import('../pages/delivery/home/homeRepartidor'),
  'MenuRepartidor'
);
const Routerss = () => {
  return (
    <>
      <ErrorBoundary>
        <div className="dark:bg-gray-950 dark:text-white">
          <GlobalErrores />
          <ServerErrorModal />

          <CartProvider>
            <RecomendacionesProvider>
              <Suspense
                fallback={
                  <div className="flex justify-center items-center h-screen text-xl">
                    Cargando contenido...
                  </div>
                }
              >
                <Routes>
                  <Route
                    path="/"
                    element={
                      <RoutePublic>
                        <LayoutHeader>
                          {' '}
                          <Home />
                        </LayoutHeader>{' '}
                      </RoutePublic>
                    }
                  />
                  <Route
                    path="/login"
                    element={
                      <RoutePublic>
                        <LayoutHeader>
                          <Login />
                        </LayoutHeader>
                      </RoutePublic>
                    }
                  />
                  <Route
                    path="/registro"
                    element={
                      <RoutePublic>
                        <LayoutHeader>
                          <Registro />
                        </LayoutHeader>
                      </RoutePublic>
                    }
                  />
                  <Route
                    path="/cambiarPass"
                    element={
                      <RoutePublic>
                        <LayoutHeader>
                          <CambiarPassword />
                        </LayoutHeader>
                      </RoutePublic>
                    }
                  />
                  <Route
                    path="/categoria/:categori"
                    element={
                      <RoutePublic>
                        {' '}
                        <LayoutHeader>
                          <ProductosCategoria />
                        </LayoutHeader>
                      </RoutePublic>
                    }
                  />
                  <Route
                    path="/:categori/:idProducto"
                    element={
                      <RoutePublic>
                        {' '}
                        <LayoutHeader>
                          <DetalleProducto />
                        </LayoutHeader>
                      </RoutePublic>
                    }
                  />
                  <Route
                    path="/politicas-privacidad"
                    element={
                      <RoutePublic>
                        {' '}
                        <LayoutHeader>
                          <PoliticasPrivacidad />
                        </LayoutHeader>
                      </RoutePublic>
                    }
                  />
                  <Route
                    path="/deslin-legal"
                    element={
                      <RoutePublic>
                        {' '}
                        <LayoutHeader>
                          <DeslindeResponsabilidad />
                        </LayoutHeader>
                      </RoutePublic>
                    }
                  />
                  <Route
                    path="/terminos-condiciones"
                    element={
                      <RoutePublic>
                        {' '}
                        <LayoutHeader>
                          <TerminosCondiciones />
                        </LayoutHeader>
                      </RoutePublic>
                    }
                  />
                  <Route
                    path="/rastrear-pedido"
                    element={
                      <RoutePublic>
                        {' '}
                        <LayoutHeader>
                          <RastrearPedido />
                        </LayoutHeader>
                      </RoutePublic>
                    }
                  />
                  <Route
                    path="/SobreNosotros"
                    element={
                      <RoutePublic>
                        {' '}
                        <LayoutHeader>
                          <MissionVision />
                        </LayoutHeader>
                      </RoutePublic>
                    }
                  />

                  {/**=====================CLIENTE============================= */}
                  <Route
                    path="/cliente"
                    element={
                      <RoutePrivate rolesPermitidos={['cliente']}>
                        {' '}
                        <LayoutHeader>
                          <Home />
                        </LayoutHeader>
                      </RoutePrivate>
                    }
                  />
                  <Route
                    path="/cliente/carrito"
                    element={
                      <RoutePrivate rolesPermitidos={['cliente']}>
                        {' '}
                        <LayoutHeader>
                          <CarritoCompras />
                        </LayoutHeader>
                      </RoutePrivate>
                    }
                  />
                  <Route
                    path="/cliente/perfil"
                    element={
                      <RoutePrivate rolesPermitidos={['cliente']}>
                        {' '}
                        <LayoutHeader>
                          <PerfilUsuarioPrime />
                        </LayoutHeader>
                      </RoutePrivate>
                    }
                  />
                  <Route
                    path="/cliente/cambiarPassword"
                    element={
                      <RoutePrivate rolesPermitidos={['cliente']}>
                        {' '}
                        <LayoutHeader>
                          <TokenModal />
                        </LayoutHeader>
                      </RoutePrivate>
                    }
                  />
                  <Route
                    path="/cliente/updatePass"
                    element={
                      <RoutePrivate rolesPermitidos={['cliente']}>
                        {' '}
                        <LayoutHeader>
                          <ChangePassword />
                        </LayoutHeader>
                      </RoutePrivate>
                    }
                  />
                  <Route
                    path="/cliente/categoria/:categori"
                    element={
                      <RoutePrivate rolesPermitidos={['cliente']}>
                        {' '}
                        <LayoutHeader>
                          <ProductosCategoria />
                        </LayoutHeader>
                      </RoutePrivate>
                    }
                  />
                  <Route
                    path="/cliente/:categori/:idProducto"
                    element={
                      <RoutePrivate rolesPermitidos={['cliente']}>
                        {' '}
                        <LayoutHeader>
                          <DetalleProducto />
                        </LayoutHeader>
                      </RoutePrivate>
                    }
                  />
                  <Route
                    path="/cliente/politicas-privacidad"
                    element={
                      <RoutePrivate rolesPermitidos={['cliente']}>
                        {' '}
                        <LayoutHeader>
                          <PoliticasPrivacidad />
                        </LayoutHeader>
                      </RoutePrivate>
                    }
                  />
                  <Route
                    path="/cliente/deslin-legal"
                    element={
                      <RoutePrivate rolesPermitidos={['cliente']}>
                        {' '}
                        <LayoutHeader>
                          <DeslindeResponsabilidad />
                        </LayoutHeader>
                      </RoutePrivate>
                    }
                  />
                  <Route
                    path="/cliente/terminos-condiciones"
                    element={
                      <RoutePrivate rolesPermitidos={['cliente']}>
                        {' '}
                        <LayoutHeader>
                          <TerminosCondiciones />
                        </LayoutHeader>
                      </RoutePrivate>
                    }
                  />
                  <Route
                    path="/cliente/SobreNosotros"
                    element={
                      <RoutePrivate rolesPermitidos={['cliente']}>
                        {' '}
                        <LayoutHeader>
                          <MissionVision />
                        </LayoutHeader>
                      </RoutePrivate>
                    }
                  />
                  <Route
                    path="/cliente/historial-pedidos"
                    element={
                      <RoutePrivate rolesPermitidos={['cliente']}>
                        {' '}
                        <LayoutHeader>
                          <HistorialPedidos />
                        </LayoutHeader>
                      </RoutePrivate>
                    }
                  />
                  <Route
                    path="/cliente/compra-exitosa/:idPedido"
                    element={
                      <RoutePrivate rolesPermitidos={['cliente']}>
                        {' '}
                        <LayoutHeader>
                          <MensajeCompraExitosa />
                        </LayoutHeader>
                      </RoutePrivate>
                    }
                  />
                  <Route
                    path="/cliente/nivel/logros"
                    element={
                      <RoutePrivate rolesPermitidos={['cliente']}>
                        {' '}
                        <LayoutHeader>
                          <GamificacionPerfil />
                        </LayoutHeader>
                      </RoutePrivate>
                    }
                  />

                  {/**=====================ADMINISTRADOR============================= */}
                  <Route
                    path="/administrador"
                    element={
                      <RoutePrivate rolesPermitidos={['administrador']}>
                        {' '}
                        <LayoutHeader>
                          <MenuHomeAdmin />
                        </LayoutHeader>
                      </RoutePrivate>
                    }
                  />
                  <Route
                    path="/administrador/cambiarPassword"
                    element={
                      <RoutePrivate rolesPermitidos={['administrador']}>
                        {' '}
                        <LayoutHeader>
                          <TokenModal />
                        </LayoutHeader>
                      </RoutePrivate>
                    }
                  />
                  <Route
                    path="/administrador/updatePass"
                    element={
                      <RoutePrivate rolesPermitidos={['administrador']}>
                        {' '}
                        <LayoutHeader>
                          <ChangePassword />
                        </LayoutHeader>
                      </RoutePrivate>
                    }
                  />
                  {/**=====================REPARTIDOR============================= */}
                  <Route
                    path="/repartidor"
                    element={
                      <RoutePrivate rolesPermitidos={['repartidor']}>
                        {' '}
                        <LayoutHeader>
                          <MenuRepartidor />
                        </LayoutHeader>
                      </RoutePrivate>
                    }
                  />
                  <Route
                    path="/repartidor/cambiarPassword"
                    element={
                      <RoutePrivate rolesPermitidos={['repartidor']}>
                        {' '}
                        <LayoutHeader>
                          <TokenModal />
                        </LayoutHeader>
                      </RoutePrivate>
                    }
                  />
                  <Route
                    path="/repartidor/updatePass"
                    element={
                      <RoutePrivate rolesPermitidos={['repartidor']}>
                        {' '}
                        <LayoutHeader>
                          <ChangePassword />
                        </LayoutHeader>
                      </RoutePrivate>
                    }
                  />

                  {/**===================== ERROR 404 (Cualquier ruta no encontrada) ============================= */}
                  <Route
                    path="*"
                    element={
                      <LayoutHeader>
                        <Error404 />
                      </LayoutHeader>
                    }
                  />

                  <Route
                    path="/error500"
                    element={
                      <LayoutHeader>
                        <Error500 />
                      </LayoutHeader>
                    }
                  />
                  <Route
                    path="/repartidor/error500"
                    element={
                      <RoutePrivate rolesPermitidos={['repartidor']}>
                        {' '}
                        <LayoutHeader>
                          <Error500 />
                        </LayoutHeader>
                      </RoutePrivate>
                    }
                  />
                  <Route
                    path="/administrador/error500"
                    element={
                      <RoutePrivate rolesPermitidos={['administrador']}>
                        {' '}
                        <LayoutHeader>
                          <Error500 />
                        </LayoutHeader>
                      </RoutePrivate>
                    }
                  />
                </Routes>
              </Suspense>
            </RecomendacionesProvider>
          </CartProvider>
        </div>
      </ErrorBoundary>
    </>
  );
};

export default Routerss;
