import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ToggleThemeButton from "../../../components/btnTheme/ToggleThemeButton";
import { useAuth } from "../../../hooks/ContextAuth";
import { useSocket } from "../../../utils/Socket";
import api from "../../../utils/AxiosConfig";
import SpinerCarga from "../../../utils/SpinerCarga";
import Logo from "../../../img/Logos/LogoOriginal.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faUser,
  faTruck,
  faHistory,
  faCalendarAlt,
  faSignOutAlt,
  faChevronRight,
  faArrowUp,
  faBell,
} from "@fortawesome/free-solid-svg-icons";

// Placeholder components for delivery-specific features
import PerfilRepartidor from "../perfil/perfilRepartidor";
import InicioRepartidor from "./inicioRepartidor";
import AssignedOrders from "../pedidos/PedidosAsignados";
import OrderHistoryModal from "../pedidos/HistorialPedidos";

const Breadcrumbs = ({ activeTab, onNavigate }) => {
  const pageHierarchy = {
    Inicio: [],
    Perfil: ["Inicio"],
    "Pedidos Asignados": ["Inicio"],
    "Historial de Entregas": ["Inicio"],
    Horario: ["Inicio"],
    "Cerrar Sesión": ["Inicio"],
  };

  const displayNames = {
    "Pedidos Asignados": "Pedidos Asignados",
    "Historial de Entregas": "Historial de Entregas",
    Horario: "Horario",
    "Cerrar Sesión": "Cerrar Sesión",
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

const MenuHomeDelivery = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Inicio");
  const [loading, setLoading] = useState(true);
  const [deliveryData, setDeliveryData] = useState({});
  const [isPageLoading, setIsPageLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const [totalDeliveries, setTotalDeliveries] = useState(0);
  const [fotoEmpresa, setFotoEmpresa] = useState("");
  const socket = useSocket();
  const [totalUsuarios, setTotalUsuarios] = useState(0);
  const [totalRentas, setTotalRentas] = useState(0);
  const [totalFinalizado, setTotalFinalizado] = useState(0);
  const { user, logout, csrfToken } = useAuth();
  const [showScrollButton, setShowScrollButton] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");
    if (tab) {
      setActiveTab(tab);
    }
  }, [location.search]);

  const handleLogout = () => {
    // Perform immediate state cleanup and navigation
    setDeliveryData({});
    setTotalDeliveries(0);
    setFotoEmpresa("");
    navigate("/login");
    // Call logout in the background
    logout().catch((error) => {
      console.error("Error during logout:", error);
    });
  };

  useEffect(() => {
    if (activeTab === "Cerrar Sesión") {
      handleLogout();
    }
  }, [activeTab]);

  const fetchDeliveryData = async () => {
    try {
      setLoading(true);
      const profileResponse = await api.get("api/usuarios/perfil-simple", {
        withCredentials: true,
        headers: { "X-CSRF-Token": csrfToken },
      });

      const user = profileResponse.data.user;
      setDeliveryData(user);
      console.log("PANEL DE REPARTIDOR FOTO", user);
      setTotalDeliveries(profileResponse.data.total || 0);
    } catch (error) {
      console.error("❌ Error al obtener datos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDeliveryData().finally(() => setIsPageLoading(false));
    } else {
      setIsPageLoading(false);
    }
  }, [user]);

  const handleNavigate = (tabName) => {
    setActiveTab(tabName);
    navigate(`?tab=${tabName}`);
  };

  // Handle scroll to show/hide button
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollButton(true);
      } else {
        setShowScrollButton(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const navSections = [
    {
      title: "General",
      items: [
        { icon: faHome, label: "Inicio" },
        { icon: faUser, label: "Perfil" },
      ],
    },
    {
      title: "Gestión de Entregas",
      items: [
        { icon: faTruck, label: "Pedidos Asignados"},
        { icon: faHistory, label: "Historial de Entregas" },
      ],
    },
    {
      title: "Salida",
      items: [{ icon: faSignOutAlt, label: "Cerrar Sesión" }],
    },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "Inicio":
        return <InicioRepartidor />;
      case "Perfil":
        return (
          <PerfilRepartidor
            totalUsuarios={totalUsuarios}
            totalRentas={totalRentas}
            totalFinalizado={totalFinalizado}
          />
        );
      case "Pedidos Asignados":
        return <AssignedOrders />;
      case "Historial de Entregas":
        return <OrderHistoryModal />;
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
            onClick={() => handleNavigate("Perfil")}
          >
            <img
              src={
                deliveryData.fotoPerfil ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  deliveryData.nombre ? deliveryData.nombre.charAt(0) : "D"
                )}&background=0D6EFD&color=fff`
              }
              alt="Foto de Perfil"
              className="h-16 w-16 rounded-full object-cover border-2 border-white dark:border-gray-300 hover:scale-105 transition-transform duration-200"
            />
          </div>
          <h2 className="text-white font-semibold text-lg text-center">
            Panel de Repartidor
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
                      handleNavigate(item.label);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center p-3 rounded-lg transition-all duration-200 text-sm ${
                      activeTab === item.label
                        ? "bg-amber-50/80 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 font-medium shadow-inner"
                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-700/50"
                    }`}
                    aria-label={item.label}
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
        <header className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-3 sm:px-4 lg:px-6 py-3 flex items-center justify-between z-30 shadow-sm">
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex-shrink-0"
              aria-label="Toggle menu"
            >
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 dark:text-gray-300"
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
            <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
              <img
                src={fotoEmpresa || Logo}
                alt="Logo"
                className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 object-contain rounded-lg bg-white p-1 shadow-sm flex-shrink-0"
              />
              <h1 className="text-base sm:text-lg lg:text-xl xl:text-2xl font-bold text-gray-800 dark:text-white truncate">
                Alquiladora Romero
              </h1>
            </div>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0 ml-2">
            <ToggleThemeButton />
            <button
              className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex-shrink-0"
              aria-label="Notifications"
            >
              <FontAwesomeIcon
                icon={faBell}
                className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 dark:text-gray-300"
              />
              <span className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-red-500 text-white text-xs font-semibold rounded-full flex items-center justify-center">
                {totalDeliveries}
              </span>
            </button>
          </div>
        </header>

        <main className="p-3 sm:p-4 lg:p-6 max-w-7xl w-full mx-auto flex-1">
          <Breadcrumbs activeTab={activeTab} onNavigate={handleNavigate} />
          {renderContent()}
        </main>

        {/* Scroll to Top Button */}
        {showScrollButton && (
          <button
            onClick={scrollToTop}
            className="fixed bottom-16 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 text-white flex items-center justify-center shadow-xl hover:shadow-2xl hover:scale-110 transition-transform duration-300"
            aria-label="Volver arriba"
          >
            <FontAwesomeIcon icon={faArrowUp} className="w-6 h-6" />
          </button>
        )}
      </div>

      <style jsx>{`
        .scrollbar-none {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-none::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default MenuHomeDelivery;
