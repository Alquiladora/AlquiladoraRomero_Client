import React, { useState, useEffect } from "react";
import {
  HomeIcon,
  ClipboardListIcon,
  BriefcaseIcon,
  MenuIcon,
  XIcon,
  ShoppingCartIcon,
  TruckIcon,
} from "@heroicons/react/outline";
import { LoginLink, IconoPerfil } from "../btnLogin/LoginClient";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeadset } from "@fortawesome/free-solid-svg-icons";
import SearchBar from "./Seach";
import ToggleThemeButton from "../../btnTheme/ToggleThemeButton";
import Logo from "../../../img/Logos/LogoOriginal.jpg";
import { Link, useLocation } from "react-router-dom";
import Chatbox from "../../chabox/Chabox";
import { useAuth } from "../../../hooks/ContextAuth";
import api from "../../../utils/AxiosConfig";
import { useSocket } from "../../../utils/Socket";
import { useCart } from "../../carrito/ContextCarrito";

const HeaderChil1 = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [isChatboxOpen, setIsChatboxOpen] = useState(false);
  const { user, csrfToken } = useAuth();
  const { cartCount, isLoading } = useCart();
  const [categorias, setCategorias] = useState([]);
  const socket = useSocket();
  const location = useLocation();
  const [showMessage, setShowMessage] = useState(false);

 
  const isCliente = user && user.rol === "cliente";
  const isCartPage = location.pathname === (isCliente ? "/cliente/carrito" : "/carrito");

  useEffect(() => {
    fetchCategorias();
  }, []);


  const handleCartClick = (e) => {
    if (!isCliente) {
      e.preventDefault(); 
      setShowMessage(true); 
      setTimeout(() => setShowMessage(false), 3000); 
    }

  };
  


  const fetchCategorias = async () => {
    try {
      const response = await api.get("/api/productos/subcategorias", {
        withCredentials: true,
        headers: { "X-CSRF-Token": csrfToken },
      });
      setCategorias(response.data.subcategories);
    } catch (error) {
      console.error("Error al obtener categorías:", error);
    }
  };

  const handleCategoryClick = () => {
    setIsCategoriesOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 shadow-lg transition-all duration-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <Link to="/" className="hover:text-blue-500 transition-transform duration-300">
            <img
              src={Logo}
              alt="Logo"
              className="h-14 w-auto rounded-full border-2 border-gray-200 dark:border-gray-700 shadow-md hover:scale-105 transition-transform duration-300"
            />
          </Link>
        </div>

        {/* Desktop Menu */}
        <nav className="hidden lg:flex items-center space-x-12 flex-grow justify-center">
          <Link
            to="/"
            className="flex items-center space-x-2 text-lg font-medium text-gray-900 dark:text-gray-100 hover:text-blue-500 transition-all duration-300 hover:scale-105"
          >
            <HomeIcon className="w-5 h-5" />
            <span>Inicio</span>
          </Link>
          <div className="relative">
            <button
              className="flex items-center space-x-2 text-lg font-medium text-gray-900 dark:text-gray-100 hover:text-blue-500 transition-all duration-300 hover:scale-105 focus:outline-none"
              onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
            >
              <ClipboardListIcon className="w-5 h-5" />
              <span>Categorías</span>
              <svg
                className={`w-4 h-4 transition-transform duration-300 ${isCategoriesOpen ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {isCategoriesOpen && (
              <div className="absolute left-0 mt-4 w-72 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl z-20 animate-fade-in">
                <div className="p-4">
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                    Categorías de Productos
                  </p>
                  <ul className="space-y-2">
                    {categorias && categorias.length > 0 ? (
                      categorias.map((cat) => (
                        <li key={cat.categoryName}>
                          <Link
                            to={
                              isCliente
                                ? `/cliente/categoria/${cat.categoryName}`
                                : `/categoria/${cat.categoryName}`
                            }
                            className="block py-2 px-4 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200 hover:text-blue-500"
                            onClick={handleCategoryClick}
                          >
                            {cat.categoryName}
                          </Link>
                        </li>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400 px-4">
                        Cargando categorías...
                      </p>
                    )}
                  </ul>
                </div>
              </div>
            )}
          </div>
          <Link
              to={isCliente ? "/cliente/SobreNosotros" : "/SobreNosotros"}
            className="flex items-center space-x-2 text-lg font-medium text-gray-900 dark:text-gray-100 hover:text-blue-500 transition-all duration-300 hover:scale-105"
          >
            <BriefcaseIcon className="w-5 h-5" />
            <span>Sobre Nosotros</span>
          </Link>
          {!isCliente && (
            <Link
              to="/rastrear-pedido"
              className="flex items-center space-x-2 text-lg font-medium text-gray-900 dark:text-gray-100 hover:text-blue-500 transition-all duration-300 hover:scale-105"
            >
              <TruckIcon className="w-5 h-5" />
              <span>Rastrear Pedido</span>
            </Link>
          )}
        </nav>

        {/* Right Section */}
        <div className="flex items-center space-x-5">
          <div className="hidden md:block">
            <SearchBar />
          </div>
          {user ? (
            user?.rol && user.rol !== "Administrador" ? (
              user?.rol === "cliente" ? (
                <IconoPerfil />
              ) : null
            ) : (
              <LoginLink />
            )
          ) : (
            <LoginLink />
          )}

<div className="relative">
      <Link
        to={isCliente ? "/cliente/carrito" : "#"} 
        onClick={handleCartClick}
        className="relative group flex items-center text-gray-900 dark:text-gray-100 hover:text-blue-500 transition-all duration-300"
      >
        <ShoppingCartIcon className="w-6 h-6" />
        {isLoading ? (
          <span className="absolute -top-2 -right-2 w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        ) : cartCount > 0 ? (
          <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full shadow-md">
            {cartCount}
          </span>
        ) : null}
        <span className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 text-xs bg-white dark:bg-gray-800 px-2 py-1 rounded-md shadow-md border border-gray-200 dark:border-gray-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          Carrito
        </span>
      </Link>

      {/* Mensaje condicional */}
      {showMessage && (
        <div className="absolute top-full mt-10 left-1/2 transform -translate-x-1/2 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-4 py-2 rounded-md shadow-lg border border-red-300 dark:border-red-700 animate-fade-in-out">
          Debes ser cliente para acceder al carrito. <Link to="/registro" className="underline hover:text-red-600">Regístrate aquí</Link>.
        </div>
      )}

      {/* Estilos para la animación */}
      <style jsx>{`
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translateY(-10px); }
          10% { opacity: 1; transform: translateY(0); }
          90% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-10px); }
        }
        .animate-fade-in-out {
          animation: fadeInOut 3s ease-in-out forwards;
        }
      `}</style>
    </div>
          <button
            onClick={() => setIsChatboxOpen(!isChatboxOpen)}
            className="hidden lg:flex items-center group text-gray-900 dark:text-gray-100 hover:text-blue-500 transition-all duration-300"
          >
            <FontAwesomeIcon icon={faHeadset} className="w-6 h-6" />
            <span className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 text-xs bg-white dark:bg-gray-800 px-2 py-1 rounded-md shadow-md border border-gray-200 dark:border-gray-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              Ayuda
            </span>
          </button>

          <div className="hidden md:flex items-center">
            <ToggleThemeButton />
          </div>
          <button
            className="lg:hidden p-2 rounded-md text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <XIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 animate-slide-down">
          <nav className="flex flex-col space-y-5 p-6">
            <Link
              to="/"
              className="flex items-center space-x-3 text-lg font-medium text-gray-900 dark:text-gray-100 hover:text-blue-500 transition-all duration-300"
              onClick={() => setIsMenuOpen(false)}
            >
              <HomeIcon className="w-5 h-5" />
              <span>Inicio</span>
            </Link>
            <Link
              to={isCliente ? "/cliente/SobreNosotros" : "/SobreNosotros"}
              className="flex items-center space-x-3 text-lg font-medium text-gray-900 dark:text-gray-100 hover:text-blue-500 transition-all duration-300"
              onClick={() => setIsMenuOpen(false)}
            >
              <BriefcaseIcon className="w-5 h-5" />
              <span>Sobre Nosotros</span>
            </Link>
            {!isCliente && (
              <Link
                to="/rastrear-pedido"
                className="flex items-center space-x-3 text-lg font-medium text-gray-900 dark:text-gray-100 hover:text-blue-500 transition-all duration-300"
                onClick={() => setIsMenuOpen(false)}
              >
                <TruckIcon className="w-5 h-5" />
                <span>Rastrear Pedido</span>
              </Link>
            )}
            <button
              className="flex items-center space-x-3 text-lg font-medium text-gray-900 dark:text-gray-100 hover:text-blue-500 transition-all duration-300"
              onClick={() => setIsChatboxOpen(!isChatboxOpen)}
            >
              <FontAwesomeIcon icon={faHeadset} className="w-5 h-5" />
              <span>Ayuda</span>
            </button>
            <div className="flex items-center space-x-3">
              <ToggleThemeButton />
              <span className="text-lg font-medium text-gray-900 dark:text-gray-100">Tema</span>
            </div>
          </nav>
        </div>
      )}

    
      {isChatboxOpen && <Chatbox onClose={() => setIsChatboxOpen(false)} />}
    </header>
  );
};

export default HeaderChil1;