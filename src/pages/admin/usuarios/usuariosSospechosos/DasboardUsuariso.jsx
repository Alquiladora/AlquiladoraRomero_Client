import React from 'react';

const DasboardUsuarios = ({ onNavigate }) => {
  return (
    <div className="min-h-screen  dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-3">
          Panel Administrativo
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Monitorea y gestiona aspectos críticos del sistema de manera
          eficiente.
        </p>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8">
        <div
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 flex flex-col items-center text-center 
                     hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 hover:scale-101"
          onClick={() => onNavigate('Usuarios Sospechosos')}
        >
          <div className="text-5xl mb-6 text-red-500 animate-pulse">
            {/* Ícono moderno */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Usuarios Sospechosos
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Identifica y gestiona a los usuarios con actividad inusual o
            potencialmente peligrosa.
          </p>
          <button
            className="mt-auto bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-3 px-6 rounded-full transition-all duration-300 transform hover:scale-105"
            onClick={(e) => {
              e.stopPropagation();
              onNavigate('Usuarios Sospechosos');
            }}
          >
            Ver Usuarios Sospechosos
          </button>
        </div>

        {/* Tarjeta 2: Auditoría de Inicio de Sesión */}
        <div
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 flex flex-col items-center text-center 
                     hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 hover:scale-101"
          onClick={() => onNavigate('Auditoría de Sesiones')}
        >
          <div className="text-5xl mb-6 text-blue-500 animate-bounce">
            {/* Ícono moderno */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 14v5m0-5V9m0 5l-3-3m3 3l3-3"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Auditoría de Inicio de Sesión
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Revisa el historial de accesos y detecta intentos sospechosos o no
            autorizados.
          </p>
          <button
            className="mt-auto bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 px-6 rounded-full transition-all duration-300 transform hover:scale-105"
            onClick={(e) => {
              e.stopPropagation();
              onNavigate('Auditoría de Sesiones');
            }}
          >
            Ver Auditoría
          </button>
        </div>
      </div>
    </div>
  );
};

export default DasboardUsuarios;
