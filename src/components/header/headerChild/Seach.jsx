import { useState } from "react";
import { SearchIcon, XIcon } from "@heroicons/react/outline";

const SearchBar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSearch = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Campo de búsqueda en pantallas grandes */}
      <div className="hidden md:flex relative w-72 ml-4">
        <input
          type="text"
          placeholder="Buscar..."
          className="w-full border border-gray-300 rounded-full pl-4 pr-12 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-300 ease-in-out
                   dark:bg-gray-950 dark:border-gray-700 dark:text-white dark:placeholder-gray-400"
        />
        <button className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full text-gray-500 hover:text-blue-600 transition-all
                          dark:text-gray-400 dark:hover:text-blue-400">
          <SearchIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Campo de búsqueda en pantallas pequeñas */}
      <div className="flex md:hidden relative">
        <button
          onClick={toggleSearch}
          className="text-gray-500 hover:text-blue-600 focus:ring-2 focus:ring-blue-600 rounded-full p-2 transition-all
                   dark:text-gray-400 dark:hover:text-blue-400"
        >
          <SearchIcon className="w-6 h-6" />
        </button>

        {isOpen && (
          <div className="absolute top-14 left-1/2 transform -translate-x-1/2 z-50">
            <div className="bg-white border border-gray-300 p-4 rounded-lg shadow-lg w-72 relative
                           dark:bg-gray-950 dark:border-gray-700">
              {/* Botón cerrar en la esquina superior derecha */}
              <button
                onClick={toggleSearch}
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-600
                           dark:text-gray-400 dark:hover:text-gray-300"
              >
                <XIcon className="w-5 h-5" />
              </button>

              <div className="relative flex items-center mt-2">
                <input
                  type="text"
                  placeholder="Buscar..."
                  className="w-full border border-gray-300 rounded-full pl-4 pr-12 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-300 ease-in-out
                             dark:bg-gray-950 dark:border-gray-700 dark:text-white dark:placeholder-gray-400"
                />
                <button className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-600 p-2 rounded-full transition-all
                                  dark:text-gray-400 dark:hover:text-blue-400">
                  <SearchIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default SearchBar;