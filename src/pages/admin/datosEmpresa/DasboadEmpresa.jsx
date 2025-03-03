import React, { useState } from "react";

const modulesData = [
  {
    key: "perfil",
    title: "Perfilempresa",
    description:
      "Administra los datos y la configuración del perfil de la empresa.",
    logo: true,
    logoSrc: "/ruta/al/logo.jpg", 
  },
  {
    key: "Sobre Nosotros",
    title: "Sobre Nosotros",
    route: "/empresa/sobre",
    description: "Conoce nuestra historia, misión y visión.",
  },
  {
    key: "Deslin",
    title: "Deslin",
    route: "/empresa/disclaimer",
    description: "Aviso legal y limitaciones de responsabilidad.",
  },
  {
    key: "Politicas",
    title: "Politicas",
    route: "/empresa/politicas",
    description:
      "Nuestras políticas y lineamientos internos y externos.",
  },
  {
    key: "Terminos",
    title: "Terminos",
    route: "/empresa/terminos",
    description:
      "Términos y condiciones de uso de nuestros servicios.",
  },
];

const atomicKeyframes = `
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
`;

function DashboardModulosEmpresa({ onNavigate }) {
  const [selectedModule, setSelectedModule] = useState(null);

  const handleModuleClick = (mod) => {
    onNavigate(mod.title);
  };

  return (
    <div className=" dark:bg-gray-900 py-10 min-h-screen">
      <style>{atomicKeyframes}</style>

      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl md:text-4xl font-extrabold text-center text-gray-800 dark:text-white mb-8">
          Módulos de Datos de la Empresa
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {modulesData.map((mod) => (
            <div
              key={mod.key}
              onClick={() => handleModuleClick(mod)}
              className="
                relative bg-white dark:bg-gray-800
                border-l-4 border-yellow-500 dark:border-yellow-400
                rounded-lg shadow hover:shadow-xl
                transition-transform hover:scale-105
                overflow-hidden p-4 cursor-pointer flex flex-col
              "
            >
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                {mod.title}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 flex-grow">
                {mod.description}
              </p>
              <div className="mt-3 self-end">
                <span
                  className="
                    animate-atomic inline-block bg-yellow-100 dark:bg-yellow-200
                    text-yellow-700 dark:text-yellow-800
                    px-3 py-1 rounded-full text-sm font-semibold
                  "
                >
                  Ver más
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default DashboardModulosEmpresa;
