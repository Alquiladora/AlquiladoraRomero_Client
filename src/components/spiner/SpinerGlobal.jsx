import React from 'react';
import Logo from '../../img/Logos/LogoOriginal.png';

const CustomLoading = ({ progress = 0 }) => {
  return (
    <div className="flex flex-col items-center py-16 transition-all duration-500 dark:bg-gray-800 dark:text-white">
      <div className="relative flex items-center justify-center w-48 h-48">
        <div className="absolute w-48 h-48 border-t-4 border-yellow-500 border-solid rounded-full animate-spin"></div>
        <div className="absolute w-40 h-40 bg-white dark:bg-gray-800 rounded-full shadow-lg flex items-center justify-center border-4 border-yellow-400">
          <img
            src={Logo}
            alt="Logo animado"
            className="w-28 h-28 object-contain rounded-full shadow-md animate-floating"
          />
        </div>
      </div>
      <div className="mt-8">
        <span className="text-gray-800 text-xl font-bold dark:text-yellow-400 animate-pulse">
          Cargando, por favor espera...
        </span>
      </div>
    </div>
  );
};

export default CustomLoading;
