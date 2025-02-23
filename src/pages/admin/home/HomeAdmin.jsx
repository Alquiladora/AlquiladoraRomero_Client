 
 const HomeAdmin=()=>{

    const stats = [
        { title: "Total Usuarios", value: "2,543", increase: "+12%", icon: "👥" },
        { title: "Rentas Activas", value: "1,123", increase: "+8%", icon: "📦" },
        {
          title: "Ingresos Mensuales",
          value: "$45,678",
          increase: "+15%",
          icon: "💰",
        },
      ];
    
      const activities = [
        { text: "Nueva renta registrada", time: "Hace 5 minutos", icon: "📝" },
        { text: "Usuario actualizado", time: "Hace 12 minutos", icon: "👤" },
        { text: "Pago recibido", time: "Hace 25 minutos", icon: "💳" },
      ];

    return(
        <>
        
        <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-xl shadow-lg p-8 mb-8 text-white text-center">
              <h2 className="text-3xl font-bold mb-3">
                ¡Bienvenido al Panel de Control!
              </h2>
              <p className="text-yellow-100 text-lg">
                Gestiona tu negocio de manera eficiente y segura.
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl">{stat.icon}</span>
                    <span className="text-green-500 text-sm font-medium">
                      {stat.increase}
                    </span>
                  </div>
                  <h3 className="text-gray-600 font-medium">{stat.title}</h3>
                  <p className="text-2xl font-bold text-gray-800 mt-2">
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Actividad Reciente */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-6">
                Actividad Reciente
              </h3>
              <div className="divide-y divide-gray-200">
                {activities.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-4 py-4 px-2 hover:bg-gray-50 rounded-lg transition-all duration-200"
                  >
                    <span className="text-2xl">{activity.icon}</span>
                    <div>
                      <p className="text-gray-800 font-medium">
                        {activity.text}
                      </p>
                      <p className="text-sm text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
        </>
    )
 }

 export default  HomeAdmin;