import { useState, useRef, useEffect } from "react";
import { SearchIcon, XIcon } from "@heroicons/react/outline";

const SearchBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);
  const mobileInputRef = useRef(null);

  const toggleSearch = () => {
    setIsOpen(!isOpen);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      console.log("Buscando:", searchTerm);
      // Aquí puedes agregar tu lógica de búsqueda
      // navigate(`/buscar?q=${encodeURIComponent(searchTerm.trim())}`);
      setIsOpen(false); // Cierra la búsqueda al enviar
    }
  };

  const handleClear = () => {
    setSearchTerm("");
    if (inputRef.current) inputRef.current.focus();
    if (mobileInputRef.current) mobileInputRef.current.focus();
  };

  // Cierra el cuadro de búsqueda si se hace clic fuera de él
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Usamos una clase personalizada 'search-container' para identificar los elementos de la búsqueda
      if (isOpen && !event.target.closest('.search-container')) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);


  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      setIsOpen(false);
      setSearchTerm("");
    }
  };

  useEffect(() => {
    if (isOpen && mobileInputRef.current) {
      setTimeout(() => mobileInputRef.current.focus(), 100); // Pequeño delay para asegurar que el input sea visible
    }
  }, [isOpen]);

  return (
    // Agregamos la clase 'search-container' al contenedor principal
    <div className="relative search-container">
      {/* Campo de búsqueda en pantallas grandes */}
      <div className="hidden md:flex relative w-72 ml-4">
        <form onSubmit={handleSearch} className="w-full relative">
          <div className={`
            relative flex items-center w-full
            ${isFocused || searchTerm ?
              'bg-white dark:bg-gray-800 shadow-lg ring-2 ring-blue-500/50' :
              'bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800'
            }
            border border-gray-300 dark:border-gray-600
            hover:border-gray-400 dark:hover:border-gray-500
            focus-within:border-blue-500 dark:focus-within:border-blue-400
            rounded-full transition-all duration-300 ease-in-out
          `}>
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onKeyDown={handleKeyDown}
              placeholder="Buscar productos..."
              className="w-full bg-transparent border-none outline-none pl-4 pr-12 py-2.5 text-sm
                         text-gray-900 dark:text-gray-100
                         placeholder-gray-500 dark:placeholder-gray-400
                         transition-all duration-300 ease-in-out"
            />

            {/* Clear Button */}
            {searchTerm && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-12 top-1/2 transform -translate-y-1/2 p-1.5
                           text-gray-400 dark:text-gray-500
                           hover:text-gray-600 dark:hover:text-gray-300
                           hover:bg-gray-100 dark:hover:bg-gray-700
                           rounded-full transition-all duration-200"
              >
                <XIcon className="w-4 h-4" />
              </button>
            )}

            {/* Search Button */}
            <button
              type="submit"
              className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full
                         transition-all duration-300 ease-in-out
                         ${isFocused || searchTerm ?
                           'text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30' :
                           'text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                         }`}
            >
              <SearchIcon className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>

      {/* Botón y campo de búsqueda en pantallas pequeñas */}
      <div className="flex md:hidden">
        <button
          onClick={toggleSearch}
          className={`
            text-gray-500 dark:text-gray-400
            hover:text-blue-600 dark:hover:text-blue-400
            hover:bg-gray-100 dark:hover:bg-gray-800
            focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-400
            rounded-full p-2 transition-all duration-300
            ${isOpen ? 'text-blue-600 dark:text-blue-400 bg-gray-100 dark:bg-gray-800' : ''}
          `}
        >
          <SearchIcon className="w-6 h-6" />
        </button>

        {/* --- MEJORAS DE RESPONSIVIDAD AQUÍ --- */}
        {isOpen && (
          // El overlay ahora está fijo para cubrir toda la pantalla y centrar el contenido
          <div
            className="fixed inset-0 bg-black bg-opacity-30 dark:bg-opacity-50 z-40 animate-fade-in-fast"
            onClick={() => setIsOpen(false)} // Cierra al hacer clic en el fondo
          >
            <div
              className="absolute top-0 left-0 right-0 z-50 p-2"
              onClick={(e) => e.stopPropagation()} // Evita que el clic en el modal se propague al fondo
            >
              <div
                className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600
                           p-4 rounded-xl shadow-xl w-full relative backdrop-blur-sm
                           bg-white/95 dark:bg-gray-900/95 animate-slide-down"
              >

                <button
                  onClick={toggleSearch}
                  className="absolute top-3 right-3 text-gray-500 dark:text-gray-400
                             hover:text-gray-700 dark:hover:text-gray-300
                             hover:bg-gray-100 dark:hover:bg-gray-800
                             p-1.5 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-600
                             dark:focus:ring-blue-400 transition-all duration-200"
                >
                  <XIcon className="w-5 h-5" />
                </button>

                <form onSubmit={handleSearch} className="mt-2">
                  <div className={`
                    relative flex items-center
                    ${isFocused || searchTerm ?
                      'bg-white dark:bg-gray-800 shadow-md ring-2 ring-blue-500/50' :
                      'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }
                    border border-gray-300 dark:border-gray-600
                    hover:border-gray-400 dark:hover:border-gray-500
                    focus-within:border-blue-500 dark:focus-within:border-blue-400
                    rounded-full transition-all duration-300 ease-in-out
                  `}>
                    <input
                      ref={mobileInputRef}
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onFocus={() => setIsFocused(true)}
                      onBlur={() => setIsFocused(false)}
                      onKeyDown={handleKeyDown}
                      placeholder="Buscar productos..."
                      className="w-full bg-transparent border-none outline-none pl-4 pr-12 py-3 text-sm
                                 text-gray-900 dark:text-gray-100
                                 placeholder-gray-500 dark:placeholder-gray-400
                                 transition-all duration-300 ease-in-out"
                    />

                    {searchTerm && (
                      <button
                        type="button"
                        onClick={handleClear}
                        className="absolute right-12 top-1/2 transform -translate-y-1/2 p-1.5
                                   text-gray-400 dark:text-gray-500
                                   hover:text-gray-600 dark:hover:text-gray-300
                                   hover:bg-gray-100 dark:hover:bg-gray-700
                                   rounded-full transition-all duration-200"
                      >
                        <XIcon className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      type="submit"
                      className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full
                                 transition-all duration-300 ease-in-out
                                 ${isFocused || searchTerm ?
                                   'text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30' :
                                   'text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                                 }`}
                    >
                      <SearchIcon className="w-5 h-5" />
                    </button>
                  </div>
                </form>

                {searchTerm && (
                  <div className="mt-4 space-y-2">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      Sugerencias
                    </p>
                    <div className="space-y-1">
                      <div className="p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg cursor-pointer transition-colors">
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          Buscar "{searchTerm}" en productos
                        </p>
                      </div>
                      <div className="p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg cursor-pointer transition-colors">
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          Buscar "{searchTerm}" en categorías
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Estilos personalizados para animaciones */}
      <style jsx>{`
        @keyframes fadeInFast {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideDown {
          0% {
            opacity: 0;
            transform: translateY(-20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-fast {
          animation: fadeInFast 0.2s ease-out forwards;
        }
        .animate-slide-down {
          animation: slideDown 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default SearchBar;