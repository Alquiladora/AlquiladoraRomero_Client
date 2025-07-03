import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import HomeAdmin from "./HomeAdmin";
import Usuarios from "../usuarios/usuarios";
import ProductTable from "../productos/Productos";
import ToggleThemeButton from "../../../components/btnTheme/ToggleThemeButton";
import { useAuth } from "../../../hooks/ContextAuth";
import Inventory from "../inventario/Inventario";
import DashboardModulosEmpresa from "../datosEmpresa/DasboadEmpresa";
import api from "../../../utils/AxiosConfig";
import SpinerCarga from "../../../utils/SpinerCarga";
import PerfilAdmin from "../perfil/PerilAdmin";
import Logo from "../../../img/Logos/logo.jpg";
import DasboardUsuarios from "../usuarios/usuariosSospechosos/DasboardUsuariso";
import UsuariosSospechosos from "../usuarios/usuariosSospechosos/UsuariosSospechosos";
import Auditoria from "../usuarios/usuariosSospechosos/AuditoriaLogin";
import CrudEmpresa from "../datosEmpresa/gestiomEmpresa/GestiomEmpresa";
import Politicas from "../datosEmpresa/politicas/Politicas";
import HistorialPoliticas from "../datosEmpresa/politicas/HistorialPoliticas";
import Terminos from "../datosEmpresa/terminos/Terminos";
import HistorialTerminos from "../datosEmpresa/terminos/HistorialTerminos";
import DeslindeLegal from "../datosEmpresa/dezlin/Deslin";
import HistorialDeslindeLegal from "../datosEmpresa/dezlin/historialDeslin";
import SobreNosotros from "../datosEmpresa/sobreNosotros/SobreNosotros";
import CrudSubcategorias from "../categorias-subcategorias/SubCatego-Catego";
import ActualizacionPrecios from "../actualizacionPrecios/ActualiacionPrecios";
import Bodegas from "../bodegas/Bodegas";
import PedidosManuales from "../pedidosamanuales/PedidosManuales";
import { useSocket } from "../../../utils/Socket";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faUser,
  faUsers,
  faBuilding,
  faLayerGroup,
  faDollarSign,
  faWarehouse,
  faBoxOpen,
  faShoppingCart,
  faClipboardList,
  faChartLine,
  faExclamationTriangle,
  faSignOutAlt,
  faChevronRight,
  faClock,
  faTasks,
  faPalette,
  faCalendarAlt,
  faTruck,           // Para gestión de repartidores
  faMoneyCheckAlt,   // Para gestión de pagos
  faBell,            // Para gestión de notificaciones
  faDatabase,        // Para resguardo de datos
  faHeadset,         // Para atención al cliente
  faClipboardCheck,  // Para auditoría de datos
} from "@fortawesome/free-solid-svg-icons";

import AgregarProductosSubbodegas from "../inventario/AgregarProductosSubbodegas";
import DashboardPedidos from "../dashboard/DashboardPedidos";
import GestionPedidos from "../gestion-pedidos/GestionPedidos";
import PedidosCalendario from "../pedidosamanuales/PedidosCalentario";
import CalendarioGeneralPedidos from "../gestion-pedidos/PedidosGeneralCalendario";
import PedidosGeneralesDashboard from "../gestion-pedidos/DashboardGeneralPedidos";
import ProductosDashboard from "../gestion-pedidos/DasboardProductos";
import ColorManager from "../colores/Colores";
import Horario from "../horario/Horario";
import AsignacionPedidosV2 from "../repartidores/asignacionPedidos";
import GestionRepartidores from "../repartidores/gestionRepartidor";
import WearOsLogin from "../../../components/wearOs/WearOsLogin";

const Breadcrumbs = ({ activeTab, onNavigate }) => {
  const pageHierarchy = {
    Inicio: [],
    Perfil: ["Inicio"],
    Usuarios: ["Inicio"],
    "Actualizacion Precios": ["Inicio"],
    Bodegas: ["Inicio"],
    Productos: ["Inicio"],
    "Pedidos Manuales": ["Inicio"],
    Inventario: ["Inicio"],
    "Agregar Productos a subodegas": ["Inicio", "Inventario"],
    "Usuarios Sospechosos": ["Dasboard Usuarios"],
    "Subcategorias-Categorias": ["Inicio"],
    "Datos de la Empresa": ["Inicio"],
    "Dashboard-pedidos": ["Inicio", "Pedidos Manuales"],
    "pedidos-calendario": ["Inicio", "Pedidos Manuales"],
    "Gestion Pedidos": ["Inicio"],
    "Pedidos General Calendario": ["Inicio", "Gestion Pedidos"],
    "Pedidos General Dashboard": ["Inicio", "Gestion Pedidos"],
    "Dasboard Productos": ["Inicio", "Gestion Pedidos"],

    "Dasboard Usuarios": ["Inicio"],

    "Auditoría de Sesiones": ["Inicio", "Dasboard Usuarios"],
    Perfilempresa: ["Inicio", "Datos de la Empresa"],
    "Sobre Nosotros": ["Inicio", "Datos de la Empresa"],
    Politicas: ["Inicio", "Datos de la Empresa"],
    Terminos: ["Inicio", "Datos de la Empresa"],
    Deslin: ["Inicio", "Datos de la Empresa"],
    historialPoliticas: ["Inicio", "Datos de la Empresa", "Politicas"],
    historialTerminos: ["Inicio", "Datos de la Empresa", "Terminos"],
    historialDeslinde: ["Inicio", "Datos de la Empresa", "Deslin"],
    "Cerrar Sesion": ["Inicio"],
    Horario: ["Inicio"],
  };

  const displayNames = {
    "Subcategorias-Categorias": "Subcategorías y Categorías",
    "Actualizacion Precios": "Actualización de Precios",
    "Pedidos Manuales": "Pedidos Manuales",
    "Gestion Pedidos": "Gestión de Pedidos",
    "Dasboard Usuarios": "Dashboard de Usuarios",
    "Auditoría de Sesiones": "Auditoría de Sesiones",
    Perfilempresa: "Perfil de Empresa",
    "Sobre Nosotros": "Sobre Nosotros",
    Politicas: "Políticas",
    Terminos: "Términos",
    Deslin: "Deslinde Legal",
    historialPoliticas: "Historial de Políticas",
    historialTerminos: "Historial de Términos",
    historialDeslinde: "Historial de Deslinde Legal",
    "Agregar Productos a subodegas": "Agregar Productos a Subbodegas",
    "Usuarios Sospechosos": "Usuarios Sospechosos",
    "Dashboard-pedidos": "Dashboard de Pedidos",
    "Cerrar Sesion": "Cerrar Sesión",
    Horario: "Horario",
  };

  const breadcrumbItems = pageHierarchy[activeTab] || [];
  const items = [
    ...breadcrumbItems.map((label) => ({ label, path: label })),
    { label: activeTab, path: activeTab },
  ];

  return (
    <nav className="flex items-center space-x-2 text-sm font-medium mb-6">
      {items.map((item, index) => (
        <div key={index} className="flex items-center">
          {index > 0 && (
            <FontAwesomeIcon
              icon={faChevronRight}
              className="text-gray-500 dark:text-gray-400 mx-2"
            />
          )}
          {index === items.length - 1 ? (
            <span className="text-amber-600 dark:text-amber-400">
              {displayNames[item.label] || item.label}
            </span>
          ) : (
            <button
              onClick={() => onNavigate(item.path)}
              className="text-gray-700 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
            >
              {displayNames[item.label] || item.label}
            </button>
          )}
        </div>
      ))}
    </nav>
  );
};

const MenuHomeAdmin = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Inicio");
  const { user, logout, csrfToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [usuariosC, setUsuariosC] = useState([]);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const [totalUsuarios, setTotalUsuarios] = useState(0);
  const [totalRentas, setTotalRentas] = useState(0);
  const [totalFinalizado, setTotalFinalizado] = useState(0);
  const [totalIngresos, setTotalIngresos] = useState(0);
  const [fotoEmpresa, setFotoEmpresa] = useState("");
  const [datosInventario, setDatosInventario] = useState([]);
  const [pedidos, setPedidos] = useState([]);

  const socket = useSocket();

  useEffect(() => {
    if (socket) {
      socket.on("totalUsuarios", (data) => {
        console.log("Total de usuarios actualizado:", data.totalUsuarios);
        setTotalUsuarios(data.totalUsuarios);
      });

      return () => {
        socket.off("totalUsuarios");
      };
    }
  }, [socket]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");
    if (tab) {
      setActiveTab(tab);
    }
  }, [location.search]);

  const handleLogout = async () => {
    try {
      await logout();
      setUsuariosC([]);
      setTotalUsuarios(0);
      setFotoEmpresa("");
      setDatosInventario([]);
      setPedidos([]);
      navigate("/login");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  useEffect(() => {
    if (activeTab === "Cerrar Sesion") {
      handleLogout();
    }
  }, [activeTab]);

  const fetchDataEnParalelo = async () => {
    try {
      setLoading(true);
      const [perfilResponse, totalUsuariosResponse] = await Promise.all([
        api.get("api/usuarios/perfil-simple", {
          withCredentials: true,
          headers: { "X-CSRF-Token": csrfToken },
        }),
        api.get("api/usuarios/totalUsuarios", {
          withCredentials: true,
          headers: { "X-CSRF-Token": csrfToken },
        }),
      ]);
      setUsuariosC(perfilResponse.data.user);

      setTotalUsuarios(totalUsuariosResponse.data[0]?.totalUsuarios ?? 0);
      setTotalRentas(totalUsuariosResponse.data[0]?.totalRentasActivas ?? 0);
      setTotalIngresos(parseFloat(totalUsuariosResponse.data[0]?.ingresosMes ?? 0));
      setTotalFinalizado(totalUsuariosResponse.data[0]?.totalPedidosFinalizados ?? 0)
      console.log("Total de ingresos ",parseFloat(totalUsuariosResponse.data[0]?.ingresosMes ?? 0))
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("❌ Error al obtener datos:", error);
    }
  };

  const handleNavigate = (tabName) => {
    setActiveTab(tabName);
    navigate(`?tab=${tabName}`);
  };

  useEffect(() => {
    if (user) {
      fetchDataEnParalelo().finally(() => setIsPageLoading(false));
    } else {
      setIsPageLoading(false);
    }
  }, [user]);

  const navSections = [
    {
      title: "General",
      items: [
        { icon: faHome, label: "Inicio" },
        { icon: faUser, label: "Perfil" },
        { icon: faUsers, label: "Usuarios", count: totalUsuarios },
        { icon: faBuilding, label: "Datos de la Empresa" },
      ],
    },
    {
      title: "Gestión de Productos",
      items: [
        { icon: faLayerGroup, label: "Subcategorias-Categorias" },
        { icon: faBoxOpen, label: "Productos" },
        { icon: faPalette, label: "Colores" },
        { icon: faWarehouse, label: "Bodegas" },
        { icon: faClipboardList, label: "Inventario" },
       
      ],
    },
    {
      title: "Gestión de Pedidos",
      items: [
        { icon: faShoppingCart, label: "Pedidos Manuales" },
        { icon: faTasks, label: "Gestion Pedidos" },
      ],
    },
     {
    title: "Gestión de Repartidores",
    items: [
      { icon: faTruck, label: "Repartidores" },               // Gestión de repartidores
      { icon: faClipboardList, label: "Asignación de Pedidos" }, 
    ],
  },
    {
      title: "Gestión Financiera",
      items: [
        { icon: faMoneyCheckAlt, label: "Gestión de Pagos" },  // Gestión de pagos
        { icon: faDollarSign, label: "Actualizacion Precios" },
      ],
    },
     {
    title: "Notificaciones y Soporte",
    items: [
      { icon: faBell, label: "Gestión de Notificaciones" },  // Notificaciones
      { icon: faHeadset, label: "Atención al Cliente" },     // Atención al cliente
    ],
  },

    {
      title: "Horarios",
      items: [
        { icon: faClock, label: "Horario" },
      ],
    },
   
    {
      title: "Seguridad",
     items: [
      { icon: faDatabase, label: "Resguardo de Datos" },   
      { icon: faClipboardCheck, label: "Auditoría de Datos" },
      { icon: faUsers, label: "Dasboard Usuarios" },
    ],
  },
  {
    title: "Wear OS",
    items: [
       { icon: faClock, label: "Dispositivos Wear OS" },  // Aquí tu nueva opción
    ],
  },
    {
      title: "Salida",
      items: [
        { icon: faSignOutAlt, label: "Cerrar Sesion" },
      ],
    },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "Inicio":
        return (
          <HomeAdmin
            totalUsuarios={totalUsuarios}
             totalRentas={totalRentas}
              totalIngresos={totalIngresos}
            onNavigate={handleNavigate}
          />
        );
      case "Perfil":
        return <PerfilAdmin    totalUsuarios={totalUsuarios}    totalRentas={totalRentas}  totalFinalizado={totalFinalizado} />;
      case "Usuarios":
        return <Usuarios />;
      case "Actualizacion Precios":
        return <ActualizacionPrecios />;
      case "Colores":
        return <ColorManager />;
      case "Horario":
        return <Horario />;
      case "Bodegas":
        return <Bodegas />;
        case "Dispositivos Wear OS":
        return <WearOsLogin />;

          case "Asignación de Pedidos":
        return <AsignacionPedidosV2 />;
      case "Productos":
        return <ProductTable />;
      case "Pedidos Manuales":
        return (
          <PedidosManuales onNavigate={handleNavigate} setPedidos={setPedidos} />
        );
      case "Inventario":
        return (
          <Inventory
            onNavigate={handleNavigate}
            setDatosInventario={setDatosInventario}
          />
        );
      case "Agregar Productos a subodegas":
        return <AgregarProductosSubbodegas datosInventario={datosInventario} />;
      case "Usuarios Sospechosos":
        return <UsuariosSospechosos />;
      case "Subcategorias-Categorias":
        return <CrudSubcategorias />;
      case "Datos de la Empresa":
        return (
          <DashboardModulosEmpresa
            onNavigate={handleNavigate}
            fotoEmpresa={fotoEmpresa}
          />
        );
        //Daboar de peidodos manueles
      case "Dashboard-pedidos":
        return <DashboardPedidos orders={pedidos} />;
      case "pedidos-calendario":
        return <PedidosCalendario />;
        
        //Daboar de PEDIDOS GENERAL
      case "Pedidos General Dashboard":
        return <PedidosGeneralesDashboard  />;
      case "Dasboard Productos":
        return <ProductosDashboard  orders={pedidos}/>;
      case "Gestion Pedidos":
        return <GestionPedidos onNavigate={handleNavigate} />;
      case "Pedidos General Calendario":
        return <CalendarioGeneralPedidos />;
      case "Dasboard Usuarios":
        return <DasboardUsuarios onNavigate={handleNavigate} />;
      case "Auditoría de Sesiones":
        return <Auditoria />;
      case "Perfilempresa":
        return <CrudEmpresa setFotoEmpresa={setFotoEmpresa} />;
      case "Sobre Nosotros":
        return <SobreNosotros />;
      case "Politicas":
        return <Politicas onNavigate={handleNavigate} />;
      case "Terminos":
        return <Terminos onNavigate={handleNavigate} />;
      case "Deslin":
        return <DeslindeLegal onNavigate={handleNavigate} />;
         case "privacidad":
        return <DeslindeLegal onNavigate={handleNavigate} />;
      case "historialPoliticas":
        return <HistorialPoliticas onNavigate={handleNavigate} />;
      case "historialTerminos":
        return <HistorialTerminos onNavigate={handleNavigate} />;
      case "historialDeslinde":
        return <HistorialDeslindeLegal onNavigate={handleNavigate} />;
         case "Repartidores":
        return <GestionRepartidores/>;
      case "Cerrar Sesion":
        return <div>Cerrando sesión...</div>;
      default:
        return null;
    }
  };

  if (isPageLoading) {
    return <SpinerCarga />;
  }

  return (
    <div className="min-h-screen flex dark:bg-gray-900 text-gray-800 dark:text-white relative">
      {/* Sidebar Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 lg:hidden z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 bottom-0 w-64 z-50 bg-white dark:bg-gray-800 shadow-xl transform transition-transform duration-300 ease-in-out 
        ${isOpen ? "translate-x-0" : "-translate-x-full"} 
        lg:translate-x-0 lg:static lg:shadow-none`}
      >
        <div className="bg-gradient-to-r from-[#fcb900] to-[#fcb900cc] p-5 shadow-sm flex flex-col items-center">
          <div
            className="flex justify-center mb-3 cursor-pointer"
            onClick={() => setActiveTab("Perfil")}
          >
            <img
              src={
                usuariosC.fotoPerfil ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  usuariosC.nombre ? usuariosC.nombre.charAt(0) : "U"
                )}&background=0D6EFD&color=fff`
              }
              alt="Foto de Perfil"
              className="h-16 w-16 rounded-full object-cover border-2 border-white dark:border-gray-300 hover:scale-105 transition-transform duration-200"
            />
          </div>
          <h2 className="text-white font-semibold text-lg text-center">
            Panel de Administración
          </h2>
        </div>

        <nav className="flex-1 h-[calc(100vh-12rem)] overflow-y-auto p-4 scrollbar-none">
          {navSections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="mb-6 last:mb-0">
              {section.title && (
                <h3 className="px-3 py-1.5 text-xs font-semibold text-gray-800 dark:text-gray-200 uppercase tracking-wider bg-amber-100/80 dark:bg-amber-900/30 rounded-md shadow-sm">
                  {section.title}
                </h3>
              )}
              <div className="space-y-1 mt-2">
                {section.items.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setActiveTab(item.label);
                      setIsOpen(false);
                      if (item.label === "Cerrar Sesion") {
                        handleLogout();
                      }
                    }}
                    className={`w-full flex items-center p-3 rounded-lg transition-all duration-200 text-sm ${
                      activeTab === item.label
                        ? "bg-amber-50/80 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 font-medium shadow-inner"
                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-700/50"
                    }`}
                  >
                    <span
                      className={`text-lg w-8 ${
                        activeTab === item.label
                          ? "text-amber-600 dark:text-amber-400"
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      <FontAwesomeIcon
                        icon={item.icon}
                        className="inline-block align-middle"
                      />
                    </span>
                    <span className="flex-1 text-left truncate">
                      {item.label}
                    </span>
                    {item.count && (
                      <span
                        className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                          activeTab === item.label
                            ? "bg-amber-600 text-white"
                            : "bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200"
                        }`}
                      >
                        {item.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-3 flex items-center justify-between z-30 shadow-sm">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <svg
                className="w-6 h-6 text-gray-600 dark:text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>

            <div className="flex items-center space-x-3">
              <img
                src={fotoEmpresa || Logo}
                alt="Logo"
                className="h-10 w-10 sm:h-12 sm:w-12 object-contain rounded-lg bg-white p-1 shadow-sm"
              />
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white truncate">
                Alquiladora Romero
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-3 sm:space-x-4">
            <ToggleThemeButton />
            <button className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <svg
                className="w-6 h-6 text-gray-600 dark:text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs font-semibold rounded-full flex items-center justify-center">
                3
              </span>
            </button>
          </div>
        </header>

        <main className="p-4 sm:p-6 max-w-7xl w-full mx-auto flex-1">
          <Breadcrumbs activeTab={activeTab} onNavigate={handleNavigate} />
          {renderContent()}
        </main>
      </div>

    
      <style jsx>{`
        .scrollbar-none {
          -ms-overflow-style: none; /* Internet Explorer 10+ */
          scrollbar-width: none; /* Firefox */
        }
        .scrollbar-none::-webkit-scrollbar {
          display: none; /* Chrome, Safari, and Opera */
        }
      `}</style>
    </div>
  );
};

export default MenuHomeAdmin;