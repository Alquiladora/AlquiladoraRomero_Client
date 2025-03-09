import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
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
  faClock, // Para "Horario"
  faTasks, // Para "Gestión Pedidos"
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
} from "@fortawesome/free-solid-svg-icons";
import AgregarProductosSubbodegas from "../inventario/AgregarProductosSubbodegas";

const MenuHomeAdmin = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Inicio");
  const { user, logout, csrfToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [usuariosC, setUsuariosC] = useState([]);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const location = useLocation();
  const [totalUsuarios, setTotalUsuarios] = useState(0);
  const [fotoEmpresa, setFotoEmpresa] = useState("");
  const [datosInventario, setDatosInventario]= useState([])


  const socket = useSocket();

  useEffect(() => {
    if (!socket) return;
    socket.on("mensaje", (msg) => {
      console.log("Mensaje de bienvenida:", msg);
    });

    socket.on("eventoServidor", (data) => {
      console.log("Evento del servidor:", data);
    });
    return () => {
      socket.off("mensaje");
      socket.off("eventoServidor");
    };
  }, [socket]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");
    if (tab) {
      setActiveTab(tab);
    }
  }, [location.search]);

  useEffect(() => {
    if (activeTab === "Cerrar Sesión") {
      logout();
    }
  }, [activeTab, logout]);

  const fetchDataEnParalelo = async () => {
    try {
      setLoading(true);
      const [perfilResponse, totalUsuariosResponse] = await Promise.all([
        api.get("api/usuarios/perfil", {
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
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("❌ Error al obtener datos:", error);
    }
  };

  const handleNavigate = (tabName) => {
    setActiveTab(tabName);
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
        { icon: faUsers, label: "Usuarios", count: totalUsuarios },
        { icon: faBuilding, label: "Datos de la Empresa" },
      ],
    },
    {
      title: "Gestión",
      items: [
        { icon: faLayerGroup, label: "Subcategorias-Categorias" },
        { icon: faDollarSign, label: "Actualizacion Precios" },
        { icon: faWarehouse, label: "Bodegas" },
        { icon: faBoxOpen, label: "Productos" },
        { icon: faShoppingCart, label: "Pedidos Manuales" },
        { icon: faClipboardList, label: "Inventario" },
        { icon: faClock, label: "Horario" },
        { icon: faTasks, label: "Gestion Pedidos" },
      ],
    },
    {
      title: "Análisis",
      items: [],
    },
    {
      title: "Seguridad",
      items: [
        { icon: faChartLine, label: "Dasboard Usuarios" },
        { icon: faExclamationTriangle, label: "Errores de Sistema", count: 3 },
      ],
    },
    {
      title: "",
      items: [{ icon: faSignOutAlt, label: "Cerrar Sesión" }],
    },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "Inicio":
        return (
          <HomeAdmin
            totalUsuarios={totalUsuarios}
            onNavigate={handleNavigate}
          />
        );
      case "Perfil":
        return <PerfilAdmin />;
      case "Usuarios":
        return <Usuarios />;
      case "Actualizacion Precios":
        return <ActualizacionPrecios />;
      case "Bodegas":
        return <Bodegas  />;
      case "Productos":
        return <ProductTable />;
      case "Pedidos Manuales":
        return <PedidosManuales />;
      case "Inventario":
        return <Inventory onNavigate={handleNavigate} setDatosInventario={setDatosInventario} />;
        case "Agregar Productos a subodegas":
          return < AgregarProductosSubbodegas  datosInventario={datosInventario}  />;
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
      case "historialPoliticas":
        return <HistorialPoliticas onNavigate={handleNavigate} />;
      case "historialTerminos":
        return <HistorialTerminos onNavigate={handleNavigate} />;
      case "historialDeslinde":
        return <HistorialDeslindeLegal onNavigate={handleNavigate} />;
      case "Cerrar Sesión":
        return <div>Cerrando sesión...</div>;
      default:
        return null;
    }
  };

  if (isPageLoading) {
    return <SpinerCarga />;
  }

  return (
    <div className="min-h-screen flex  dark:bg-gray-900 text-gray-800 dark:text-white relative">
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}


      <aside
        className={`fixed top-0 left-0 bottom-0 w-64 z-50 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out 
        ${isOpen ? "translate-x-0" : "-translate-x-full"} 
        lg:translate-x-0 lg:static`}
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

  
        <nav className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-rounded-full scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 p-3">
          {navSections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="mb-4">
              {section.title && (
                <div className="px-3 py-1 text-xs font-bold text-gray-500 uppercase">
                  {section.title}
                </div>
              )}
              {section.items.map((item, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setActiveTab(item.label);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center p-3 mb-1 rounded-md transition-all duration-200 text-left
            ${
              activeTab === item.label
                ? "bg-[#fcb90033] dark:bg-[#fcb90044] text-[#fcb900] dark:text-[#fcb900] font-semibold shadow-sm"
                : "text-gray-600 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
                >
                  <span className="text-xl mr-3">
                    <FontAwesomeIcon icon={item.icon} />
                  </span>
                  <span className="font-medium flex-1">{item.label}</span>
                  {item.count && (
                    <span
                      className={`ml-auto text-sm font-semibold rounded-full px-2 py-0.5
                ${
                  activeTab === item.label
                    ? "bg-[#fcb900] text-white"
                    : "bg-gray-200 dark:bg-gray-600 dark:text-gray-100"
                }`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          ))}
        </nav>
      </aside>

  
      <div className="flex-1 flex flex-col">
        <header className="bg-gradient-to-r from-[#fcb900] to-[#fcb900cc] text-white px-4 py-3 flex items-center justify-between shadow-md">
      
          <div className="flex items-center space-x-3">
            <button
              className="lg:hidden relative group p-3 rounded-md hover:bg-[#fcb90033] transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transform hover:scale-105"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Abrir menú"
            >
             
              <div className="flex flex-col justify-between w-6 h-5 transform transition-all duration-300 origin-center group-hover:scale-105">
                <span className="block h-[2px] w-full bg-white rounded-sm"></span>
                <span className="block h-[2px] w-full bg-white rounded-sm"></span>
                <span className="block h-[2px] w-full bg-white rounded-sm"></span>
              </div>
            </button>

       
            <img
              src={fotoEmpresa || Logo}
              alt="Logo"
              className="h-12 w-12 object-contain rounded-full transition-transform duration-200 hover:scale-110"
            />
          </div>

          
          <h1 className="text-xl sm:text-2xl font-bold text-center flex-1">
            Alquiladora Romero
          </h1>

   
          <div className="flex items-center space-x-2 sm:space-x-4">
            <ToggleThemeButton />
            <button className="p-3 rounded-full hover:bg-[#fcb90033] transition duration-200 transform hover:scale-105">
          
              <svg
                className="w-6 h-6 sm:w-7 sm:h-7"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 
             2.032 0 0118 14.158V11a6.002 
             6.002 0 00-4-5.659V5a2 
             2 0 10-4 0v.341C7.67 6.165 
             6 8.388 6 11v3.159c0 .538-.214 
             1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </button>
          </div>
        </header>

        <main className="p-2 max-w-7xl w-full mx-auto flex-1 ">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default MenuHomeAdmin;
