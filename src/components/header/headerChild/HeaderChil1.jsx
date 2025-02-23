import React, { useState,useEffect } from "react";
import {
  HomeIcon,
  ClipboardListIcon,
  ReceiptTaxIcon,
  TicketIcon,
  MenuIcon,
  XIcon,
  UserIcon,
  ShoppingCartIcon,
  BriefcaseIcon,
} from "@heroicons/react/outline";
import { LoginLink, IconoPerfil } from "../btnLogin/LoginClient";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeadset } from "@fortawesome/free-solid-svg-icons";
import SearchBar from "./Seach";
import ToggleThemeButton from "../../btnTheme/ToggleThemeButton";
import Logo from "../../../img/Logos/logo.jpg";
import { Link } from "react-router-dom";
import Chatbox from "../../chabox/Chabox";
import { useAuth } from "../../../hooks/ContextAuth";

const HeaderChil1 = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [isChatboxOpen, setIsChatboxOpen] = useState(false);
  const { user } = useAuth();




  return (
    <div className="shadow-md sticky top-0 z-50 bg-white dark:bg-gray-950 dark:text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between py-2">
        {/* Logo */}
        <div className="text-xl font-bold flex items-center">
          <Link to="/" className="hover:text-blue-600">
            <img
              src={Logo}
              alt="Logo"
              className="max-h-20 w-auto rounded-full border-2 transition-transform duration-300 ease-in-out hover:scale-110"
            />
          </Link>
        </div>

        {/* Desktop Menu */}
        <nav className="hidden lg:flex items-center justify-end flex-grow space-x-8">
          <Link
            to="/"
            className="flex items-center space-x-2 hover:text-blue-600 transition-all duration-300 ease-in-out hover:scale-105"
          >
            <HomeIcon className="w-6 h-6" />
            <span>Home</span>
          </Link>
          <div className="relative">
            <button
              className="flex items-center space-x-2 hover:text-blue-600 transition-all duration-300 ease-in-out hover:scale-105"
              onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
            >
              <ClipboardListIcon className="w-6 h-6" />
              <span>Categorías</span>
              <svg
                className={`w-5 h-5 ml-1 transition-transform duration-300 ease-in-out ${
                  isCategoriesOpen ? "transform rotate-180" : ""
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
                ></path>
              </svg>
            </button>

            {isCategoriesOpen && (
              <div className="absolute left-0 mt-2 bg-white text-gray-700 border rounded-md shadow-lg w-56 dark:bg-gray-950 dark:text-white">
                <div className="p-4">
                  <p className="font-bold text-gray-900 dark:text-white">
                    Categorías de productos
                  </p>
                  <div className="text-sm mt-2">
                    {/* Categoría de Sillas */}
                    <Link
                      to="/categorias/sillas"
                      className="block py-1 hover:text-blue-600 flex items-center space-x-2 transition-all duration-300 ease-in-out hover:scale-105"
                    >
                      {/* <ChairIcon className="w-4 h-4" /> */}
                      <span>Sillas</span>
                    </Link>

                    {/* Categoría de Mesas */}
                    <Link
                      to="/categoria/mesas"
                      className="block py-1 hover:text-blue-600 flex items-center space-x-2 transition-all duration-300 ease-in-out hover:scale-105"
                    >
                      {/* <TableIcon className="w-4 h-4" /> */}
                      <span>Mesas</span>
                    </Link>

                    {/* Categoría de Carpas */}
                    <Link
                      to="/categoria/carpas"
                      className="block py-1 hover:text-blue-600 flex items-center space-x-2 transition-all duration-300 ease-in-out hover:scale-105"
                    >
                      {/* <TentIcon className="w-4 h-4" /> */}
                      <span>Carpas</span>
                    </Link>

                    {/* Categoría de Otros productos */}
                    <Link
                      to="/categoria/otros"
                      className="block py-1 hover:text-blue-600 flex items-center space-x-2 transition-all duration-300 ease-in-out hover:scale-105"
                    >
                      {/* <BoxIcon className="w-4 h-4" /> */}
                      <span>Otros productos</span>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          <Link
            to="/about"
            className="flex items-center space-x-2 hover:text-blue-600 transition-all duration-300 ease-in-out hover:scale-105"
          >
            <BriefcaseIcon className="w-6 h-6" />
            <span>Sobre Nosotros</span>
          </Link>
        </nav>

        {/* Right Side: Search Bar, Login, and Cart */}
        <div className="flex items-center space-x-4">
          {/* Search Bar */}
          <div className="hidden md:block">
            <SearchBar />
          </div>

          {/* Login Button */}
          {user ? (
            user?.rol && user.rol !== "Administrador" ? (
              user?.rol === "cliente" ? (
                <IconoPerfil />
              ) : (
                <></>
               
              )
            ) : (
              <LoginLink />
            )
          ) : (
            <LoginLink />
          )}

          {/* Shopping Cart */}
          <Link
            to="/cart"
            className="relative group flex items-center font-semibold hover:text-blue-600"
          >
            <ShoppingCartIcon className="w-7 h-7" />
            <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              3
            </span>
            <span className="hover:text-blue-600 absolute top-full mt-2 left-1/2 transform -translate-x-1/2 whitespace-normal text-xs text-gray-700 bg-white px-2 py-1 rounded-lg shadow border border-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 sm:text-xs sm:px-2 sm:py-1 max-w-[90vw] sm:max-w-[70vw]">
              Carrito
            </span>
          </Link>

          {/* Atención al Cliente */}
          <button
            onClick={() => setIsChatboxOpen(!isChatboxOpen)}
            className="relative group hidden lg:flex items-center font-semibold hover:text-blue-600"
          >
            <FontAwesomeIcon icon={faHeadset} className="w-6 h-6" />
            <span className="hover:text-blue-600 absolute top-full mt-2 left-1/2 transform -translate-x-1/2 whitespace-normal text-xs text-gray-700 bg-white px-2 py-1 rounded-lg shadow border border-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 sm:text-xs sm:px-2 sm:py-1 max-w-[90vw] sm:max-w-[70vw]">
              Ayuda
            </span>
          </button>

          {/* Toggle Theme Button */}
          <div className="hidden md:flex items-center">
            <ToggleThemeButton />
          </div>

          {/* Hamburger Menu Button */}
          <button
            className="lg:hidden focus:outline-none transition-transform duration-300 ease-in-out"
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

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white text-gray-700 border-t dark:bg-gray-950 dark:text-white">
          <nav className="flex flex-col space-y-2 py-4 px-6">
            <Link
              to="/"
              className="flex items-center space-x-2 hover:text-blue-600 transition-all duration-300 ease-in-out hover:scale-105"
            >
              <HomeIcon className="w-5 h-5" />
              <span>Home</span>
            </Link>
            <Link
              to="/categories"
              className="flex items-center space-x-2 hover:text-blue-600 transition-all duration-300 ease-in-out hover:scale-105"
            >
              <ClipboardListIcon className="w-5 h-5" />
              <span>Categorías</span>
            </Link>
            <Link
              to="/about"
              className="flex items-center space-x-2 hover:text-blue-600 transition-all duration-300 ease-in-out hover:scale-105"
            >
              <BriefcaseIcon className="w-5 h-5" />
              <span>Sobre Nosotros</span>
            </Link>
            <Link
              to="/contact"
              className="flex items-center space-x-2 hover:text-blue-600 transition-all duration-300 ease-in-out hover:scale-105"
            >
              <FontAwesomeIcon icon={faHeadset} className="w-5 h-5" />
              <span>Ayuda</span>
            </Link>
            <div className="flex items-center space-x-2 hover:text-blue-600 transition-all duration-300 ease-in-out hover:scale-105">
              <ToggleThemeButton />
              <span>Tema</span>
            </div>
          </nav>
        </div>
      )}
      {/* Chatbox */}
      {isChatboxOpen && <Chatbox onClose={() => setIsChatboxOpen(false)} />}
    </div>
  );
};

export default HeaderChil1;
