import React, { useState } from "react";
import HomeAdmin from "./HomeAdmin";
import Usuarios from "../usuarios/usuarios";
import ToggleThemeButton from "../../../components/btnTheme/ToggleThemeButton";
import ProductTable from "../productos/Productos";

const MenuHomeAdmin = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Usuarios");

  const toggleMenu = () => setIsOpen(!isOpen);

  
  const navItems = [
    { icon: "🏠", label: "Inicio" },
    { icon: "👥", label: "Usuarios", count: 23 },
    { icon: "⚠️", label: "Usuarios Sospechosos", count: 5 },
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
        return <HomeAdmin />;

      case "Usuarios":
        return <Usuarios />;
      case "Productos":
      return < ProductTable />;
      case "Inventario":
      // return <Inventario />;
      case "Actualizacion Precios":
      // return <ActualizacionPrecios />;
      default:
      // return <Dashboard />;
    }
  };

  return (
    <div className="">
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`bg-white shadow-lg w-64 fixed top-0 left-0 bottom-0 transform transition-transform duration-300 z-40 ${
            isOpen ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0 lg:static`}
        >
          <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 p-5">
            <div className="flex justify-center mb-2">
              <img
                src="https://via.placeholder.com/64"
                alt="Foto de Perfil"
                className="h-16 w-16 rounded-full object-cover border-2 border-white"
              />
            </div>
            <h2 className="text-white font-semibold text-lg text-center">
              Panel de Administración
            </h2>
          </div>

          {/* Menú de navegación */}
          <nav className="flex-1 overflow-y-auto">
            {navItems.map((item, index) => (
              <button
                key={index}
                onClick={() => setActiveTab(item.label)}
                className={`w-full flex items-center p-3 mb-1 rounded-md transition-colors duration-200 ${
                  activeTab === item.label
                    ? "bg-yellow-100 text-yellow-800 shadow-sm"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="ml-3 font-medium">{item.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        <div className="flex-1 flex flex-col">

          {/* Barra superior */}
          <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-white 
             px-2 py-1 sm:px-4 sm:py-2 
             flex items-center justify-between">

  {/* IZQUIERDA: LOGO */}
  <div className="flex items-center">
    <img 
      src="/path/to/logo.png" 
      alt="Logo" 
      className="h-6 w-6 sm:h-8 sm:w-8 object-contain"
    />
  </div>

  {/* CENTRO: NOMBRE DE LA EMPRESA */}
  <h1 className="text-sm sm:text-2xl font-bold flex-1 text-center mx-2 sm:mx-4">
    Alquiladora Romero
  </h1>

  {/* DERECHA: BOTÓN DE TEMA Y NOTIFICACIONES */}
  <div className="flex items-center space-x-2 sm:space-x-4">
    {/* Botón de tema */}
    <div className="flex items-center space-x-1 sm:space-x-2 
                    hover:text-blue-600 transition-transform duration-300 
                    hover:scale-105">
      <ToggleThemeButton />
      <span className="text-xs sm:text-sm">Tema</span>
    </div>

    {/* Botón de notificaciones */}
    <button className="p-1 sm:p-2 rounded-full hover:bg-yellow-500 transition duration-200">
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
          1.055-.595 1.436L4 17h5m6 
          0v1a3 3 0 11-6 0v-1m6 
          0H9"
        />
      </svg>
    </button>
  </div>
</div>


          {/* 🌟 Aquí cambiamos dinámicamente el contenido */}
          <main className="p-6 max-w-7xl w-full mx-auto flex-1">
            {renderContent()}
          </main>
        </div>
      </div>
    </div>
  );
};

export default MenuHomeAdmin;
