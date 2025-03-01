import React from "react";
import { Link } from "react-router-dom";

// Definimos la animación personalizada con keyframes en un <style> dentro del componente
// Puedes mover esto a tu CSS/Tailwind config si prefieres.
function DashboardModulosEmpresa() {
  return (
    <div className="bg-gray-50 dark:bg-gray-900 py-10 min-h-screen">
      {/* Definimos la animación “atómica en movimiento” */}
      <style>
        {`
          @keyframes atomicMovement {
            0%, 100% {
              transform: scale(1) rotate(0deg);
            }
            50% {
              transform: scale(1.05) rotate(3deg);
            }
          }
          .animate-atomic {
            animation: atomicMovement 3s infinite;
          }
        `}
      </style>

      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl md:text-4xl font-extrabold text-center text-gray-800 dark:text-white mb-8">
          Módulos de Datos de la Empresa
        </h1>

        {/* Contenedor principal de los módulos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {/* Módulo: Misión */}
          <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-xl transition-shadow overflow-hidden p-6 flex flex-col">
            <div className="absolute top-0 left-0 w-2 h-full bg-blue-600 dark:bg-blue-500"></div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-3">
              Misión
            </h2>
            <p className="text-gray-600 dark:text-gray-300 flex-grow">
              Nuestra misión es ofrecer productos y servicios de la más alta calidad,
              satisfaciendo las necesidades de nuestros clientes y contribuyendo al desarrollo
              sostenible.
            </p>
            {/* Animación atómica en movimiento */}
            <div className="mt-4 self-end animate-atomic inline-block bg-blue-100 dark:bg-blue-200 text-blue-600 dark:text-blue-700 px-3 py-1 rounded-full text-sm font-semibold cursor-pointer">
              <Link to="/empresa/mision">
                Ver más
              </Link>
            </div>
          </div>

          {/* Módulo: Visión */}
          <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-xl transition-shadow overflow-hidden p-6 flex flex-col">
            <div className="absolute top-0 left-0 w-2 h-full bg-green-600 dark:bg-green-500"></div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-3">
              Visión
            </h2>
            <p className="text-gray-600 dark:text-gray-300 flex-grow">
              Convertirnos en líderes del mercado, innovando constantemente y
              superando las expectativas de nuestros clientes a nivel global.
            </p>
            <div className="mt-4 self-end animate-atomic inline-block bg-green-100 dark:bg-green-200 text-green-600 dark:text-green-700 px-3 py-1 rounded-full text-sm font-semibold cursor-pointer">
              <Link to="/empresa/vision">
                Ver más
              </Link>
            </div>
          </div>

          {/* Módulo: Políticas */}
          <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-xl transition-shadow overflow-hidden p-6 flex flex-col">
            <div className="absolute top-0 left-0 w-2 h-full bg-yellow-500 dark:bg-yellow-400"></div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-3">
              Políticas
            </h2>
            <p className="text-gray-600 dark:text-gray-300 flex-grow">
              Nos regimos por la transparencia, la integridad y la ética profesional.
              Respetamos el medio ambiente y los derechos de nuestros colaboradores.
            </p>
            <div className="mt-4 self-end animate-atomic inline-block bg-yellow-100 dark:bg-yellow-200 text-yellow-700 px-3 py-1 rounded-full text-sm font-semibold cursor-pointer">
              <Link to="/empresa/politicas">
                Ver más
              </Link>
            </div>
          </div>

          {/* Módulo: Valores */}
          <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-xl transition-shadow overflow-hidden p-6 flex flex-col">
            <div className="absolute top-0 left-0 w-2 h-full bg-red-600 dark:bg-red-500"></div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-3">
              Valores
            </h2>
            <p className="text-gray-600 dark:text-gray-300 flex-grow">
              Honestidad, responsabilidad, respeto y pasión por la excelencia.
              Son la base de nuestras relaciones con clientes y colaboradores.
            </p>
            <div className="mt-4 self-end animate-atomic inline-block bg-red-100 dark:bg-red-200 text-red-600 dark:text-red-700 px-3 py-1 rounded-full text-sm font-semibold cursor-pointer">
              <Link to="/empresa/valores">
                Ver más
              </Link>
            </div>
          </div>

          {/* Módulo: Políticas de Privacidad */}
          <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-xl transition-shadow overflow-hidden p-6 flex flex-col">
            <div className="absolute top-0 left-0 w-2 h-full bg-purple-600 dark:bg-purple-500"></div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-3">
              Políticas de Privacidad
            </h2>
            <p className="text-gray-600 dark:text-gray-300 flex-grow">
              Conoce cómo manejamos tus datos, cumplimos con la normativa de protección
              y resguardamos tu información personal de manera segura.
            </p>
            <div className="mt-4 self-end animate-atomic inline-block bg-purple-100 dark:bg-purple-200 text-purple-700 px-3 py-1 rounded-full text-sm font-semibold cursor-pointer">
              <Link to="/empresa/privacidad">
                Ver más
              </Link>
            </div>
          </div>

          {/* Módulo: Disclaimer Legal */}
          <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-xl transition-shadow overflow-hidden p-6 flex flex-col">
            <div className="absolute top-0 left-0 w-2 h-full bg-orange-600 dark:bg-orange-500"></div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-3">
              Disclaimer Legal
            </h2>
            <p className="text-gray-600 dark:text-gray-300 flex-grow">
              Avisos y disclaimers que establecen los términos y condiciones de uso,
              así como la responsabilidad limitada de la empresa.
            </p>
            <div className="mt-4 self-end animate-atomic inline-block bg-orange-100 dark:bg-orange-200 text-orange-700 px-3 py-1 rounded-full text-sm font-semibold cursor-pointer">
              <Link to="/empresa/disclaimer">
                Ver más
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardModulosEmpresa;
