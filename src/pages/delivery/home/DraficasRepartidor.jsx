import { Clock, Package, Truck, CheckCircle, BarChart2, Target, User } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, Legend, RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts';

const Dashboard = ({ estadisticas }) => {
  // Ensure estadisticas is defined and provide fallback values
  const safeEstadisticas = estadisticas || {
    totalRecogiendo: 0,
    totalEnAlquiler: 0,
    totalEnviando: 0,
    totalFinalizado: 0,
    promedioValoracion: "0.00000",
    pedidosFinalizadosPorMes: [],
    nombre: "Sin nombre",
    apellidoP: "",
    apellidoM: "",
    correo: "Sin correo",
    telefono: "Sin teléfono",
    idRepartidor: "N/A",
    cuentaActiva: 0,
    fechaAlta: null,
  };

  // Sample data for pie chart
  const pieData = [
    { name: 'Recogiendo', value: safeEstadisticas.totalRecogiendo || 0, color: '#3B82F6' },
    { name: 'En Alquiler', value: safeEstadisticas.totalEnAlquiler || 0, color: '#F59E0B' },
    { name: 'Enviando', value: safeEstadisticas.totalEnviando || 0, color: '#EF4444' },
    { name: 'Finalizado', value: safeEstadisticas.totalFinalizado || 0, color: '#10B981' },
  ];

  // Handle radial data with a check for undefined or null pedidosFinalizadosPorMes
  const radialData = Array.isArray(safeEstadisticas.pedidosFinalizadosPorMes) && safeEstadisticas.pedidosFinalizadosPorMes.length > 0
    ? safeEstadisticas.pedidosFinalizadosPorMes.map((item, index) => ({
        name: item.mes || `Mes ${index + 1}`,
        value: item.cantidad || 0,
        fill: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
      }))
    : [{ name: 'Sin datos', value: 0, fill: '#D1D5DB' }];

  const valoracionData = [
    { name: 'Puntuación', value: parseFloat(safeEstadisticas.promedioValoracion) || 0, fill: '#10B981' },
  ];

  const hasDataForCharts = pieData.some(item => item.value > 0) || radialData.some(item => item.value > 0) || parseFloat(safeEstadisticas.promedioValoracion) > 0;

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
     

      {/* Estadísticas */}
      <section className="max-w-7xl mx-auto p-6 md:p-8">
        <h2 className="text-xl font-semibold mb-6 text-gray-800 dark:text-gray-200 flex items-center md:text-2xl">
          <BarChart2 className="w-6 h-6 mr-3" />
          Resumen de Desempeño
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Recogiendo', value: safeEstadisticas.totalRecogiendo, icon: Clock, color: 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300' },
            { label: 'En Alquiler', value: safeEstadisticas.totalEnAlquiler, icon: Package, color: 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300' },
            { label: 'Enviando', value: safeEstadisticas.totalEnviando, icon: Truck, color: 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300' },
            { label: 'Finalizado', value: safeEstadisticas.totalFinalizado, icon: CheckCircle, color: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300' },
          ].map((item, index) => (
            <div
              key={index}
              className="bg-white p-5 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-300 dark:bg-gray-800 dark:border-gray-700"
            >
              <div className="flex flex-col items-center">
                <div className={`w-14 h-14 ${item.color} rounded-full flex items-center justify-center mb-4`}>
                  <item.icon className="w-6 h-6" />
                </div>
                <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {item.value || '0'}
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">{item.label}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Gráficos */}
      <section className="max-w-7xl mx-auto p-6 md:p-8">
        <h2 className="text-xl font-semibold mb-6 text-gray-800 dark:text-gray-200 flex items-center md:text-2xl">
          <BarChart2 className="w-6 h-6 mr-3" />
          Análisis de Rendimiento
        </h2>
        {!hasDataForCharts ? (
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 dark:bg-gray-800 dark:border-gray-700 text-center">
            <p className="text-gray-500 dark:text-gray-400 text-base md:text-lg">
              No hay datos disponibles para mostrar los gráficos. Por favor, registra actividad para generar estadísticas.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Gráfico circular - Distribución de pedidos */}
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
              <h3 className="text-lg font-medium mb-4 text-gray-700 dark:text-gray-300">Distribución de Pedidos</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={90}
                      paddingAngle={3}
                      dataKey="value"
                      labelLine={false}
                      label={({ name, percent }) =>
                        percent > 0.05 ? `${name}: ${(percent * 100).toFixed(1)}%` : null
                      }
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '14px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                      }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={48}
                      iconType="circle"
                      wrapperStyle={{ fontSize: '14px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Gráfico radial - Pedidos finalizados por mes */}
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
              <h3 className="text-lg font-medium mb-4 text-gray-700 dark:text-gray-300">Pedidos Finalizados por Mes</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart
                    cx="50%"
                    cy="50%"
                    innerRadius="20%"
                    outerRadius="80%"
                    data={radialData}
                    startAngle={0}
                    endAngle={360}
                  >
                    <RadialBar
                      minAngle={15}
                      label={{ position: 'inside', fill: '#fff', fontSize: 12 }}
                      background={{ fill: '#e5e7eb' }}
                      dataKey="value"
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '14px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                      }}
                    />
                  </RadialBarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Gráfico radial - Valoración promedio */}
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
              <h3 className="text-lg font-medium mb-4 text-gray-700 dark:text-gray-300">Puntuación Promedio</h3>
              {safeEstadisticas.promedioValoracion > 0 ? (
                <div className="h-64 flex items-center justify-center">
                  <ResponsiveContainer width="80%" height="80%">
                    <RadialBarChart
                      cx="50%"
                      cy="50%"
                      innerRadius="30%"
                      outerRadius="80%"
                      data={valoracionData}
                    >
                      <RadialBar
                        label={{ fill: '#fff', position: 'inside', fontSize: 14 }}
                        background={{ fill: '#e5e7eb' }}
                        dataKey="value"
                        cornerRadius={15}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          fontSize: '14px',
                          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                        }}
                      />
                      <text
                        x="50%"
                        y="50%"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="text-gray-900 font-bold dark:text-gray-100"
                        style={{ fontSize: '20px' }}
                      >
                        {safeEstadisticas.promedioValoracion.toFixed(1)}
                      </text>
                    </RadialBarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-center text-gray-500 dark:text-gray-400 text-base md:text-lg">Sin datos de valoración</p>
              )}
            </div>
          </div>
        )}
      </section>

      {/* Métricas Adicionales */}
      <section className="max-w-7xl mx-auto p-6 md:p-8">
        <h2 className="text-xl font-semibold mb-6 text-gray-800 dark:text-gray-200 flex items-center md:text-2xl">
          <Target className="w-6 h-6 mr-3" />
          Indicadores de Rendimiento
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-300 dark:bg-gray-800 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-base font-medium text-gray-600 dark:text-gray-400">Promedio Semanal</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                  {(safeEstadisticas.totalFinalizado / 7).toFixed(1) || '0.0'}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Entregas por día</p>
              </div>
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center dark:bg-blue-900/50">
                <Target className="w-8 h-8 text-blue-700 dark:text-blue-300" />
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-300 dark:bg-gray-800 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-base font-medium text-gray-600 dark:text-gray-400">Tiempo Activo</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                  {safeEstadisticas.fechaAlta
                    ? `${Math.floor((new Date() - new Date(safeEstadisticas.fechaAlta)) / (1000 * 60 * 60 * 24))} días`
                    : 'Sin datos'}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Desde la fecha de alta</p>
              </div>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center dark:bg-green-900/50">
                <Clock className="w-8 h-8 text-green-700 dark:text-green-300" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;