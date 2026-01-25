import Logo from '../../../img/Logos/LogoOriginal.png';

const modulesData = [
  {
    key: 'perfil',
    title: 'Perfilempresa',
    description:
      'Administra los datos y la configuración del perfil de la empresa.',
    logo: true,
    logoSrc: { Logo },
  },
  {
    key: 'Sobre Nosotros',
    title: 'Sobre Nosotros',
    route: '/empresa/sobre',
    description: 'Conoce nuestra historia, misión y visión.',
  },
  {
    key: 'Deslin',
    title: 'Deslin',
    route: '/empresa/disclaimer',
    description:
      'Aviso legal que limita nuestra responsabilidad por el uso de los equipos alquilados y los riesgos asociados.',
  },
  {
    key: 'Politicas',
    title: 'Politicas',
    route: '/empresa/politicas',
    description:
      'Marco de acción que rige el manejo de la privacidad, devoluciones y calidad del servicio.',
  },
  {
    key: 'Terminos',
    title: 'Terminos',
    route: '/empresa/terminos',
    description:
      'El contrato que establece las reglas de uso de la plataforma y las condiciones de la renta.',
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

function DefaultIcon() {
  return (
    <svg
      className="w-16 h-16 mx-auto text-yellow-500 mb-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <circle cx="12" cy="12" r="10" className="opacity-20" />
      <path d="M12 8v4" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="16" r="1" />
    </svg>
  );
}

function getModuleIcon(key) {
  switch (key) {
    case 'Sobre Nosotros':
      return (
        <svg
          className="w-16 h-16 mx-auto text-blue-500 mb-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <circle cx="12" cy="12" r="10" className="opacity-20" />
          <path d="M12 8v4" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="12" cy="16" r="1" />
        </svg>
      );
    case 'Deslin':
      return (
        <svg
          className="w-16 h-16 mx-auto text-red-500 mb-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
      );
    case 'Politicas':
      return (
        <svg
          className="w-16 h-16 mx-auto text-green-500 mb-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path d="M12 2L2 7v7c0 5 5 9 10 9s10-4 10-9V7L12 2z" />
          <path d="M12 22v-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'Terminos':
      return (
        <svg
          className="w-16 h-16 mx-auto text-purple-500 mb-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <rect x="3" y="4" width="18" height="16" rx="2" ry="2" />
          <path d="M3 10h18" />
        </svg>
      );
    case 'Aviso de privacidad':
      return (
        <svg
          className="w-16 h-16 mx-auto text-red-500 mb-4"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
      );

    default:
      return <DefaultIcon />;
  }
}

function DashboardModulosEmpresa({ onNavigate, fotoEmpresa }) {
  const handleModuleClick = (mod) => {
    onNavigate(mod.title);
  };

  return (
    <div className="dark:bg-gray-900 py-10 min-h-screen">
      <style>{atomicKeyframes}</style>

      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl md:text-4xl font-extrabold text-center text-gray-800 dark:text-white mb-10">
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
                overflow-hidden p-6 cursor-pointer flex flex-col
              "
            >
              {mod.key === 'perfil' ? (
                //...
                fotoEmpresa ? (
                  <img src={fotoEmpresa} alt="Foto de la Empresa" />
                ) : (
                  // Muestra el Logo importado si no hay foto de la empresa
                  <img
                    src={Logo}
                    alt="Logo de la Empresa"
                    className="mx-auto h-16 w-16 object-contain rounded-full mb-4"
                  />
                )
              ) : (
                //...

                getModuleIcon(mod.title)
              )}

              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2 text-center">
                {mod.title}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 flex-grow text-center">
                {mod.description}
              </p>
              <div className="mt-3 self-center">
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
