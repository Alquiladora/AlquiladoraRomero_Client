import React from "react";
import Logo from "../img/Logos/logo192.png"; 

const SpinerCarga = () => {
  return (
    <div  className="flex flex-col items-center justify-center h-screen transition-all duration-500 dark:bg-gray-800 dark:text-white">
      {/* Contenedor del Spinner */}
    <div className="relative flex items-center justify-center w-48 h-48">
      {/* Spinner giratorio */}
      <div className="absolute w-48 h-48 border-t-4 border-yellow-400 border-solid rounded-full animate-spin"></div>

      {/* Círculo central con el logo (NO gira) */}
      <div className="absolute w-40 h-40 bg-white dark:bg-gray-800 rounded-full shadow-lg flex items-center justify-center border-4 border-yellow-400">
        <img
          src={Logo}
          alt="Logo animado"
          className="w-28 h-28 object-contain rounded-full shadow-md animate-floating"
        />
      </div>
    </div>

    {/* Texto de carga con animación */}
    <div className="mt-8">
      <span className="text-gray-800 text-xl font-bold dark:text-yellow-400 animate-pulse">
        Cargando, por favor espera...
      </span>
    </div>
  </div>
  );
};

export default SpinerCarga;
