/* eslint-disable */
import React, { useState, useEffect } from 'react';
import {
  HomeIcon,
  ClipboardListIcon,
  BriefcaseIcon,
  MenuIcon,
  XIcon,
  ShoppingCartIcon,
  TruckIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/outline';
import { LoginLink, IconoPerfil } from '../btnLogin/LoginClient';

import ToggleThemeButton from '../../btnTheme/ToggleThemeButton';
import Logo from '../../../img/Logos/LogoOriginal--.png';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../hooks/ContextAuth';
import api from '../../../utils/AxiosConfig';

import { useCart } from '../../carrito/ContextCarrito';

const HeaderChil1 = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const { user, csrfToken } = useAuth();
  const { cartCount, isLoading } = useCart();
  const [categorias, setCategorias] = useState([]);
  const [logoData, setLogoData] = useState(null);

  const [showMessage, setShowMessage] = useState(false);

  const isCliente = user && user.rol === 'cliente';

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
      const response = await api.get('/api/productos/subcategorias', {
        withCredentials: true,
        headers: { 'X-CSRF-Token': csrfToken },
      });
      setCategorias(response.data.subcategories);
    } catch (error) {
      console.error('Error al obtener categorías:', error);
    }
  };


   const getLogo = async () => {
    try {
      const response = await api.get('/api/empresa/logo', {
        withCredentials: true,
      });
      setLogoData(response.data);
    } catch (error) {
      console.error('Error al obtener el logo de la empresa:', error);

      setLogoData(null);
    }
  };

  useEffect(() => {
    getLogo();
  }, []);

  const handleCategoryClick = () => {
    setIsCategoriesOpen(false);
  };
 const logoUrl = logoData && logoData.logoUrl ? logoData.logoUrl : Logo;
  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-lg transition-all duration-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Header Row */}
        <div className="flex items-center justify-between py-3 md:py-4">
          {/* Logo Section */}
          <div className="flex items-center flex-shrink-0">
            <Link
              to="/"
              className="group hover:text-blue-600 transition-transform duration-300"
            >
              <div className="relative">
                <img
                 src={logoUrl}
                  alt="Logo"
                  className="h-10 sm:h-12 w-auto object-contain border-2 border-transparent hover:border-blue-500 transition-all duration-300 transform hover:scale-110 z-10 relative"
                />
                <div className="absolute inset-0 bg-white dark:bg-white rounded-lg shadow-md -z-10 hidden dark:block"></div>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden xl:flex items-center space-x-8 flex-grow justify-center">
            <Link
              to="/"
              className="flex items-center space-x-2 text-base font-medium text-gray-900 dark:text-gray-100 hover:text-blue-500 transition-all duration-300 hover:scale-105 whitespace-nowrap"
            >
              <HomeIcon className="w-5 h-5" />
              <span>Inicio</span>
            </Link>

            <div className="relative">
              <button
                className="flex items-center space-x-2 text-base font-medium text-gray-900 dark:text-gray-100 hover:text-blue-500 transition-all duration-300 hover:scale-105 focus:outline-none whitespace-nowrap"
                onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
              >
                <ClipboardListIcon className="w-5 h-5" />
                <span>Categorías</span>
                <svg
                  className={`w-4 h-4 transition-transform duration-300 ${
                    isCategoriesOpen ? 'rotate-180' : ''
                  }`}
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
                    <ul className="space-y-2 max-h-64 overflow-y-auto">
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
              to={isCliente ? '/cliente/SobreNosotros' : '/SobreNosotros'}
              className="flex items-center space-x-2 text-base font-medium text-gray-900 dark:text-gray-100 hover:text-blue-500 transition-all duration-300 hover:scale-105 whitespace-nowrap"
            >
              <BriefcaseIcon className="w-5 h-5" />
              <span>Sobre Nosotros</span>
            </Link>

            {!isCliente && (
              <Link
                to="/rastrear-pedido"
                className="flex items-center space-x-2 text-base font-medium text-gray-900 dark:text-gray-100 hover:text-blue-500 transition-all duration-300 hover:scale-105 whitespace-nowrap"
              >
                <TruckIcon className="w-5 h-5" />
                <span>Rastrear Pedido</span>
              </Link>
            )}
          </nav>

          {/* Right Section */}
          <div className="flex items-center space-x-3 lg:space-x-5">
            {/* Search Bar - Hidden on mobile */}
            {/* <div className="hidden lg:block">
            <SearchBar />
          </div> */}

            {/* User Profile/Login */}
            <div className="hidden sm:block">
              {user ? (
                user?.rol && user.rol !== 'Administrador' ? (
                  user?.rol === 'cliente' ? (
                    <IconoPerfil />
                  ) : null
                ) : (
                  <LoginLink />
                )
              ) : (
                <LoginLink />
              )}
            </div>

            {/* Cart */}
            <div className="relative">
              <Link
                to={isCliente ? '/cliente/carrito' : '#'}
                onClick={handleCartClick}
                className="relative group flex items-center text-gray-900 dark:text-gray-100 hover:text-blue-500 transition-all duration-300"
              >
                <ShoppingCartIcon className="w-6 h-6" />
                {isLoading ? (
                  <span className="absolute -top-2 -right-2 w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                ) : cartCount > 0 ? (
                  <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full shadow-md min-w-[1.25rem] text-center">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                ) : null}
                <span className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 text-xs bg-white dark:bg-gray-800 px-2 py-1 rounded-md shadow-md border border-gray-200 dark:border-gray-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                  Carrito
                </span>
              </Link>

              {/* Cart Message */}
              {showMessage && (
                <div className="absolute top-full mt-4 -right-4 sm:left-1/2 sm:-translate-x-1/2 bg-white dark:bg-slate-800 p-4 rounded-lg shadow-2xl border dark:border-slate-700 animate-fade-in-down w-[calc(100vw-5rem)] max-w-xs sm:w-72 z-30">
                  <div className="absolute bottom-full right-6 sm:left-1/2 sm:-translate-x-1/2 w-4 h-4">
                    <div className="w-4 h-4 bg-white dark:bg-slate-800 transform rotate-45 border-l border-t border-transparent dark:border-l-slate-700 dark:border-t-slate-700"></div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <ExclamationCircleIcon className="w-6 h-6 text-red-500 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-sm text-slate-800 dark:text-white">
                        Acceso Restringido
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                        Debes ser cliente para ver el carrito.{' '}
                        <Link
                          to="/registro"
                          className="text-blue-500 hover:underline"
                        >
                          Regístrate aquí
                        </Link>
                        .
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Help Button */}
            {/* <button
            onClick={() => setIsChatboxOpen(!isChatboxOpen)}
            className="hidden lg:flex items-center group text-gray-900 dark:text-gray-100 hover:text-blue-500 transition-all duration-300"
          >
            <FontAwesomeIcon icon={faHeadset} className="w-6 h-6" />
            <span className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 text-xs bg-white dark:bg-gray-800 px-2 py-1 rounded-md shadow-md border border-gray-200 dark:border-gray-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
              Ayuda
            </span>
          </button> */}

            {/* Theme Toggle */}
            <div className="hidden md:flex items-center">
              <ToggleThemeButton />
            </div>

            {/* Mobile Menu Button */}
            <button
              className="xl:hidden p-2 rounded-md text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <XIcon className="w-6 h-6" />
              ) : (
                <MenuIcon className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {/* <div className="lg:hidden pb-3">
        <SearchBar />
      </div> */}
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="xl:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 animate-slide-down">
          <nav className="flex flex-col space-y-4 p-6">
            {/* Mobile User Profile */}
            <div className="sm:hidden pb-2 border-b border-gray-200 dark:border-gray-700">
              {user ? (
                user?.rol && user.rol !== 'Administrador' ? (
                  user?.rol === 'cliente' ? (
                    <IconoPerfil />
                  ) : null
                ) : (
                  <LoginLink />
                )
              ) : (
                <LoginLink />
              )}
            </div>

            <Link
              to="/"
              className="flex items-center space-x-3 text-base font-medium text-gray-900 dark:text-gray-100 hover:text-blue-500 transition-all duration-300 py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              <HomeIcon className="w-5 h-5" />
              <span>Inicio</span>
            </Link>

            {/* Mobile Categories */}

            <div className="border-l-4 border-blue-500 pl-4">
              <button
                className="flex items-center justify-between w-full text-left text-sm sm:text-base font-medium text-gray-900 dark:text-gray-100 hover:text-blue-500 transition-all duration-300 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg px-2"
                onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
              >
                <div className="flex items-center space-x-3">
                  <ClipboardListIcon className="w-5 h-5" />
                  <span>Categorías</span>
                </div>
                <svg
                  className={`w-4 h-4 transition-transform duration-300 ${
                    isCategoriesOpen ? 'rotate-180' : ''
                  }`}
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
                <div className="mt-2 space-y-1 sm:space-y-2 max-h-40 sm:max-h-48 overflow-y-auto animate-slide-down">
                  {categorias && categorias.length > 0 ? (
                    categorias.map((cat) => (
                      <Link
                        key={cat.categoryName}
                        to={
                          isCliente
                            ? `/cliente/categoria/${cat.categoryName}`
                            : `/categoria/${cat.categoryName}`
                        }
                        className="block py-2 px-3 sm:px-4 ml-2 text-xs sm:text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200 hover:text-blue-500 border-l-2 border-gray-200 dark:border-gray-600 hover:border-blue-500"
                        onClick={() => {
                          setIsMenuOpen(false);
                          setIsCategoriesOpen(false);
                        }}
                      >
                        {cat.categoryName}
                      </Link>
                    ))
                  ) : (
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 px-3 sm:px-4 py-2">
                      Cargando categorías...
                    </p>
                  )}
                </div>
              )}
            </div>

            <Link
              to={isCliente ? '/cliente/SobreNosotros' : '/SobreNosotros'}
              className="flex items-center space-x-3 text-base font-medium text-gray-900 dark:text-gray-100 hover:text-blue-500 transition-all duration-300 py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              <BriefcaseIcon className="w-5 h-5" />
              <span>Sobre Nosotros</span>
            </Link>

            {!isCliente && (
              <Link
                to="/rastrear-pedido"
                className="flex items-center space-x-3 text-base font-medium text-gray-900 dark:text-gray-100 hover:text-blue-500 transition-all duration-300 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                <TruckIcon className="w-5 h-5" />
                <span>Rastrear Pedido</span>
              </Link>
            )}

            {/* <button
            className="flex items-center space-x-3 text-base font-medium text-gray-900 dark:text-gray-100 hover:text-blue-500 transition-all duration-300 py-2"
            onClick={() => {
              setIsChatboxOpen(!isChatboxOpen);
              setIsMenuOpen(false);
            }}
          >
            <FontAwesomeIcon icon={faHeadset} className="w-5 h-5" />
            <span>Ayuda</span>
          </button> */}

            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <ToggleThemeButton />
                <span className="text-base font-medium text-gray-900 dark:text-gray-100">
                  Tema
                </span>
              </div>
            </div>
          </nav>
        </div>
      )}

      {/* Chatbox */}
      {/* {isChatboxOpen && <Chatbox onClose={() => setIsChatboxOpen(false)} />} */}

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes fadeInOut {
          0% {
            opacity: 0;
            transform: translateY(-10px);
          }
          10% {
            opacity: 1;
            transform: translateY(0);
          }
          90% {
            opacity: 1;
            transform: translateY(0);
          }
          100% {
            opacity: 0;
            transform: translateY(-10px);
          }
        }

        @keyframes fadeIn {
          0% {
            opacity: 0;
            transform: translateY(-10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideDown {
          0% {
            opacity: 0;
            transform: translateY(-10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-out {
          animation: fadeInOut 3s ease-in-out forwards;
        }

        .animate-fade-in {
          animation: fadeIn 0.2s ease-out forwards;
        }

        .animate-slide-down {
          animation: slideDown 0.3s ease-out forwards;
        }
      `}</style>
    </header>
  );
};

export default HeaderChil1;
