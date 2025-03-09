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
        `}
      </style>

      {/* Encabezado de bienvenida */}
      <div className="bg-gradient-to-r from-[#fcb900] to-[#fcb900cc] rounded-xl shadow-lg p-8 mb-8 text-center">
        <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-3">
          ¡Bienvenido al Panel de Control!
        </h2>
        <p className="text-lg md:text-xl text-yellow-200 fadeInOut">
          Gestiona tu negocio de manera eficiente y segura.
        </p>
      </div>

      {/* Grid de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div
            key={index}
            onClick={() => stat.tabToNavigate && onNavigate(stat.tabToNavigate)}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 
                       hover:shadow-lg transition-all duration-200 
                       cursor-pointer transform hover:scale-105"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-3xl">{stat.icon}</span>
            </div>
            <h3 className="text-gray-600 dark:text-gray-300 font-medium">
              {stat.title}
            </h3>
            <p className="text-3xl font-bold text-gray-800 dark:text-white mt-2">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

    
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
          Actividad Reciente
        </h3>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {activities.map((activity, index) => (
            <div
              key={index}
              className="flex items-center space-x-4 py-4 px-2 
                         hover:bg-gray-50 dark:hover:bg-gray-700 
                         rounded-lg transition-all duration-200"
            >
              <span className="text-3xl">{activity.icon}</span>
              <div>
                <p className="text-gray-800 dark:text-gray-200 font-medium">
                  {activity.text}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
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
