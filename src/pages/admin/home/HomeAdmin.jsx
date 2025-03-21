import React from "react";

const HomeAdmin = ({ totalUsuarios, onNavigate }) => {
  const stats = [
    {
      title: "Total Usuarios",
      value: totalUsuarios,
      icon: "👥",
      tabToNavigate: "Usuarios",
    },
    { title: "Rentas Activas", value: "1,123", icon: "📦" },
    {
      title: "Ingresos Mensuales",
      value: "$45,678",
      icon: "💰",
    },
  ];

  const activities = [
    { text: "Nueva renta registrada", time: "Hace 5 minutos", icon: "📝" },
    { text: "Usuario actualizado", time: "Hace 12 minutos", icon: "👤" },
    { text: "Pago recibido", time: "Hace 25 minutos", icon: "💳" },
  ];

  return (
    <>
      <style>
        {`
          @keyframes fadeInOut {
            0%, 100% { opacity: 0; transform: translateY(-10px); }
            50% { opacity: 1; transform: translateY(0); }
          }
          .fadeInOut {
            animation: fadeInOut 3s ease-in-out infinite;
          }
          @keyframes slideIn {
            from { transform: translateX(-20px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
          .slideIn {
            animation: slideIn 0.5s ease-out;
          }
        `}
      </style>

      {/* Encabezado de bienvenida */}
      <div className="bg-gradient-to-r from-[#fcb900] to-[#fcb900cc] rounded-xl shadow-lg p-4 sm:p-6 mb-6 text-center slideIn">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white mb-2">
          ¡Bienvenido al Panel de Control!
        </h2>
        <p className="text-sm sm:text-base md:text-lg text-yellow-200 fadeInOut">
          Gestiona tu negocio de manera eficiente y segura.
        </p>
      </div>

      {/* Grid de estadísticas */}
      <div className="overflow-x-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              onClick={() => stat.tabToNavigate && onNavigate(stat.tabToNavigate)}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 sm:p-4 hover:shadow-lg transition-all duration-200 cursor-pointer transform hover:scale-105 min-w-[250px]"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xl sm:text-2xl md:text-3xl">{stat.icon}</span>
              </div>
              <h3 className="text-gray-600 dark:text-gray-300 text-sm sm:text-base font-medium">
                {stat.title}
              </h3>
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mt-1">
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Actividad Reciente */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 sm:p-6">
        <h3 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white mb-4">
          Actividad Reciente
        </h3>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {activities.map((activity, index) => (
            <div
              key={index}
              className="flex items-center space-x-3 py-2 sm:py-3 px-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-all duration-200 slideIn"
            >
              <span className="text-xl sm:text-2xl md:text-3xl">{activity.icon}</span>
              <div>
                <p className="text-gray-800 dark:text-gray-200 text-sm sm:text-base font-medium">
                  {activity.text}
                </p>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  {activity.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default HomeAdmin;