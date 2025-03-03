import React, { useState, useEffect } from "react";
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
import Logo from '../../../img/Logos/logo.jpg'
import { useLocation, useNavigate } from "react-router-dom";
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


const MenuHomeAdmin = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Inicio");
  const { user, logout,csrfToken } = useAuth();
  const [loading, setLoading] = useState(true);
   const [usuariosC, setUsuariosC] = useState([]);
   const [isPageLoading, setIsPageLoading] = useState(true);
   const location = useLocation();
   const navigate = useNavigate();
   const [totalUsuarios, setTotalUsuarios]=useState([]);
   const [fotoEmpresa, setFotoEmpresa]=useState('');


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




  const navItems = [
    { icon: "🏠", label: "Inicio" },
    { icon: "👥", label: "Usuarios",  count: totalUsuarios },
    { icon: "⚙️", label: "Dasboard Usuarios" },
    { icon: "🏢", label: "Datos de la Empresa" },
    { icon: "🛒", label: "Productos" },
    { icon: "📦", label: "Inventario" },
    { icon: "💲", label: "Actualizacion Precios" },
    { icon: "📂", label: "Subcategorias" },
    { icon: "🏬", label: "Bodegas" },
    { icon: "🚨", label: "Errores de Sistema", count: 3 },
    { icon: "🚪", label: "Cerrar Sesión" },
   
  ];
  

  const renderContent = () => {
    switch (activeTab) {
      case "Inicio":
        return <HomeAdmin totalUsuarios={totalUsuarios} onNavigate={handleNavigate} />;
      case "Perfil":
        return <PerfilAdmin />;
      case "Usuarios":
        return <Usuarios />;
      case "Productos":
        return <ProductTable />;
      case "Inventario":
        return <Inventory />;
      case "Usuarios Sospechosos":
        return < UsuariosSospechosos />;
      case "Datos de la Empresa":
        return <DashboardModulosEmpresa onNavigate={handleNavigate} />;
      case "Dasboard Usuarios":
        return <DasboardUsuarios onNavigate={handleNavigate} />;
      case "Auditoría de Sesiones":
        return <Auditoria></Auditoria>
        case "Perfilempresa":


        return <CrudEmpresa  setFotoEmpresa={ setFotoEmpresa}/>
        case "Sobre Nosotros":
          return <SobreNosotros  />

        case "Politicas":
          return <Politicas  onNavigate={handleNavigate} />
          case "Terminos":
            return <Terminos  onNavigate={handleNavigate} />
            case "Deslin":
          return <DeslindeLegal  onNavigate={handleNavigate} />
          case "historialPoliticas":
          return <HistorialPoliticas  onNavigate={handleNavigate}/>
          case "historialTerminos":
            return <HistorialTerminos onNavigate={handleNavigate}/>
            case "historialDeslinde":
              return <HistorialDeslindeLegal onNavigate={handleNavigate}/>
      case "Cerrar Sesión":
        return <div>Cerrando sesión...</div>;
      default:
        return null;
    }
  };
 
  

  if (isPageLoading) {
    return (
      
        <SpinerCarga />
      
    );
  }


  return (
   
    <div className="min-h-screen dark:bg-gray-900 dark:text-white flex relative">
   
    {isOpen && (
      <div
        className="fixed inset-0 bg-black bg-opacity-40 z-40 lg:hidden"
        onClick={() => setIsOpen(false)}
      />
    )}
  
   
    <aside
      className={`bg-white dark:bg-gray-800 shadow-lg w-64 fixed top-0 left-0 bottom-0 transform transition-transform duration-300 ease-in-out z-50
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0 lg:static`}
    >
      <div className="bg-gradient-to-r from-[#fcb900] to-[#fcb900cc] dark:from-[#fcb900cc] dark:to-[#fcb90099] p-5 shadow-sm">
        <div className="flex justify-center mb-2">
          <img
           src={
            usuariosC.fotoPerfil ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(
              usuariosC.nombre ? usuariosC.nombre.charAt(0) : "U"
            )}&background=0D6EFD&color=fff`
          }
           alt="Foto de Perfil"
            className="h-16 w-16 rounded-full object-cover border-2 border-white dark:border-gray-300 hover:scale-105 transition-transform duration-200"
            onClick={() => setActiveTab("Perfil")}
         />
         
        </div>
        
        <h2 className="text-white font-semibold text-lg text-center">
          Panel de Administración
        </h2>
      </div>
  
      {/* Menú de navegación */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-rounded-full scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
        {navItems.map((item, index) => (
          <button
            key={index}
            onClick={() => {
              setActiveTab(item.label);
              setIsOpen(false);
            }}
            className={`w-full flex items-center p-3 mb-1 rounded-md transition-all duration-200 text-left
              ${
                activeTab === item.label
                  ? "bg-[#fcb90033] text-[#fcb900] dark:bg-[#fcb90066] dark:text-[#fcb900] shadow-sm"
                  : "text-gray-600 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
          >
            <span className="text-xl mr-3">{item.icon}</span>
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
      </nav>
    </aside>
  
    {/* Contenido principal */}
      <div className="flex-1 flex flex-col">
    
        <div className="bg-gradient-to-r from-[#fcb900] to-[#fcb900cc] dark:from-[#fcb900cc] dark:to-[#fcb90099] text-white px-2 py-1 sm:px-4 sm:py-2 flex items-center justify-between shadow-md">
          {/* IZQUIERDA: LOGO y Botón de hamburguesa */}
          <div className="flex items-center">
            <button
              className="lg:hidden p-2 rounded-md hover:bg-[#fcb90033] transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Abrir menú"
            >
              {/* Icono de hamburguesa */}
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16m-7 6h7"
                />
              </svg>
            </button>
            <img
              src={fotoEmpresa || Logo}
              alt="Logo"
              className="h-8 w-8 sm:h-10 sm:w-10 object-contain ml-4 rounded-full hover:scale-105 transition-transform duration-200"
            />
          </div>


  
        {/* CENTRO: NOMBRE DE LA EMPRESA */}
        <h1 className="text-sm sm:text-2xl font-bold flex-1 text-center mx-2 sm:mx-4">
          Alquiladora Romero
        </h1>
  
        {/* DERECHA: BOTÓN DE TEMA Y NOTIFICACIONES */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          <ToggleThemeButton />
          <button className="p-1 sm:p-2 rounded-full hover:bg-[#fcb90033] transition duration-200">
            {/* Icono de notificaciones */}
            <svg
              className="w-4 h-4 sm:w-6 sm:h-6"
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
      </div>
  
      {/* Contenido principal */}
      <main className="p-6 max-w-7xl w-full mx-auto flex-1 dark:bg-gray-900 dark:text-white transition-colors">
        {renderContent()}
      </main>
    </div>
  </div>
  );
};

export default MenuHomeAdmin;
