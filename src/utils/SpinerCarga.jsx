import React from "react";
import Logo from "../img/Logos/logo.jpg";

const SpinerCarga = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="relative flex items-center justify-center w-32 h-32">
        {/* Spinner circular con animación fluida */}
        <div className="absolute w-32 h-32 animate-spin-slow">
          <svg
            className="w-full h-full"
            viewBox="0 0 100 100"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Círculo de fondo */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#e0e0e0"
              strokeWidth="8"
              strokeDasharray="282"
              className="dark:stroke-gray-700"
            />
            {/* Trayecto animado con efecto de onda */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#20e0d0"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray="90 180"
              className="dark:stroke-[#fcb900] animate-[spin_1.5s_linear_infinite]"
            />
          </svg>
        </div>

        {/* Imagen del logo animada con rebote */}
        <div className="absolute flex items-center justify-center animate-bounce-slow">
          <img
            src={Logo}
            alt="Logo animado"
            className="w-20 h-20 opacity-90 dark:opacity-100 rounded-full shadow-lg"
          />
        </div>
      </div>

      {/* Texto de carga con animación pulsante */}
      <div className="mt-6">
        <span className="text-gray-700 text-lg font-semibold dark:text-[#fcb900] animate-pulse">
          Cargando...
        </span>
      </div>
    </div>
  );
};

export default SpinerCarga;
