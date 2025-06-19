import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/ContextAuth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faBoxOpen,
  faHistory,
  faSignOutAlt,
  faChevronRight,
  faTasks,
} from "@fortawesome/free-solid-svg-icons";

const Breadcrumbs = ({ activeTab }) => {
  return (
    <nav className="flex items-center space-x-2 text-sm font-medium mb-6 px-2 sm:px-0">
      <span className="text-amber-600 dark:text-amber-400 truncate">{activeTab}</span>
    </nav>
  );
};

const MenuRepartidor = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Perfil");
  const { logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");
    if (tab) setActiveTab(tab);
  }, [location.search]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const handleNavigate = (tabName) => {
    setActiveTab(tabName);
    navigate(`?tab=${tabName}`);
  };

  const navItems = [
    { icon: faUser, label: "Perfil" },
    { icon: faBoxOpen, label: "Pedidos Asignados" },
    { icon: faTasks, label: "Reportar Problemas" },
    { icon: faHistory, label: "Historial de Entregas" },
    { icon: faSignOutAlt, label: "Cerrar Sesion", action: handleLogout },
  ];

  return (
    <div className="min-h-screen flex flex-col sm:flex-row dark:bg-gray-900 text-gray-800 dark:text-white relative">
      {/* Overlay para mobile cuando el sidebar está abierto */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 sm:hidden"
          onClick={() => setIsOpen(false)}
          aria-label="Cerrar menú"
        />
      )}

      {/* Sidebar / Drawer */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 bg-white dark:bg-gray-800 shadow-xl transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"} 
          sm:relative sm:translate-x-0 sm:w-64
          w-4/5 max-w-xs
        `}
        aria-label="Menú de navegación"
      >
        <div className="bg-gradient-to-r from-[#fcb900] to-[#fcb900cc] p-5 shadow-sm flex flex-col items-center">
          <h2 className="text-white font-semibold text-lg text-center select-none">
            Menú Repartidor
          </h2>
          {/* Botón cerrar en móvil */}
          <button
            className="absolute top-4 right-4 sm:hidden p-2 rounded-full bg-white/70 dark:bg-gray-700/70 hover:bg-white dark:hover:bg-gray-600 transition"
            onClick={() => setIsOpen(false)}
            aria-label="Cerrar menú"
          >
            <FontAwesomeIcon icon={faChevronRight} className="text-amber-600" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-none">
          {navItems.map(({ icon, label, action }, index) => (
            <button
              key={index}
              onClick={() => {
                if (action) action();
                else handleNavigate(label);
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 text-base font-medium
                ${
                  activeTab === label
                    ? "bg-amber-50/90 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 shadow-inner"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }
              `}
            >
              <FontAwesomeIcon
                icon={icon}
                className={`text-lg ${
                  activeTab === label ? "text-amber-600 dark:text-amber-400" : "text-gray-500 dark:text-gray-400"
                }`}
              />
              <span className="truncate">{label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-3 flex items-center justify-between z-30 shadow-sm">
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Botón hamburguesa móvil */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="sm:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Abrir menú"
            >
              <svg
                className="w-6 h-6 text-gray-600 dark:text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>

            <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white truncate">
              Alquiladora Romero - Repartidor
            </h1>
          </div>
        </header>

        <main className="p-4 sm:p-6 max-w-7xl w-full mx-auto flex-1 overflow-auto">
          <Breadcrumbs activeTab={activeTab} />
          <div className="text-center text-gray-500 dark:text-gray-400 mt-20">
            <p>Contenido del menú aún no implementado.</p>
          </div>
        </main>
      </div>

      <style jsx>{`
        .scrollbar-none {
          -ms-overflow-style: none; /* IE 10+ */
          scrollbar-width: none; /* Firefox */
        }
        .scrollbar-none::-webkit-scrollbar {
          display: none; /* Chrome, Safari, and Opera */
        }
      `}</style>
    </div>
  );
};

export default MenuRepartidor;
