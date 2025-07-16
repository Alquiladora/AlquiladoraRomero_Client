import React, { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
} from "recharts";
import { Truck, Package, CheckCircle, Clock, BarChart2, Target } from "lucide-react";
import api from "../../../utils/AxiosConfig";
import { useAuth } from "../../../hooks/ContextAuth";
import CustomLoading from "../../../components/spiner/SpinerGlobal";

const InicioRepartidor = () => {
  const [loading, setLoading] = useState(true);
  const [repartidor, setRepartidor] = useState({
    nombre: "",
    apellidoP: "",
    apellidoM: "",
    cuentaActiva: 0,
    fechaAlta: null,
    fechaBaja: null,
  });
  const [estadisticas, setEstadisticas] = useState({
    totalRecogiendo: 0,
    totalEnAlquiler: 0,
    totalEnviando: 0,
    totalFinalizado: 0,
    promedioValoracion: 0,
  });
  const [pedidosFinalizadosPorMes, setPedidosFinalizadosPorMes] = useState([]);
  const { user, logout, csrfToken } = useAuth();

  // Datos para el gráfico circular de distribución de pedidos
  const pieData = [
    { name: "Recogiendo", value: estadisticas.totalRecogiendo, color: "#3B82F6" },
    { name: "En Alquiler", value: estadisticas.totalEnAlquiler, color: "#F59E0B" },
    { name: "Enviando", value: estadisticas.totalEnviando, color: "#EF4444" },
    { name: "Finalizado", value: estadisticas.totalFinalizado, color: "#10B981" },
  ];

  // Datos para el gráfico radial de rendimiento mensual
  const radialData = pedidosFinalizadosPorMes.map((item) => ({
    name: item.mes,
    value: item.completados || 0,
    fill: `hsl(${Math.random() * 360}, 70%, 50%)`,
  }));

  // Datos para el gráfico radial de valoración
  const valoracionData = [
    {
      name: "Puntuación",
      value: estadisticas.promedioValoracion * 20,
      color: estadisticas.promedioValoracion >= 4 ? "#10B981" : "#EF4444",
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
       

        const response = await api.get("/api/repartidor/repartidor/datos", {
          withCredentials: true,
          headers: { "X-CSRF-Token": csrfToken },
        });

        console.log("Response:", response);
        if (response.data && response.status === 200) {
          const data = response.data;
          setRepartidor({
            nombre: data.nombre || "",
            apellidoP: data.apellidoP || "",
            apellidoM: data.apellidoM || "",
            cuentaActiva: data.cuentaActiva || 0,
            fechaAlta: data.fechaAlta || null,
            fechaBaja: data.fechaBaja || null,
          });

          setEstadisticas({
            totalRecogiendo: data.totalRecogiendo || 0,
            totalEnAlquiler: data.totalEnAlquiler || 0,
            totalEnviando: data.totalEnviando || 0,
            totalFinalizado: data.totalFinalizado || 0,
            promedioValoracion: parseFloat(data.promedioValoracion) || 0,
          });

          setPedidosFinalizadosPorMes(data.pedidosFinalizadosPorMes || []);
        } else {
          console.log("Unexpected response:", response);
        }
      } catch (error) {
        console.error("Error fetching repartidor data:", error.response?.data || error.message || error);
        setRepartidor({
          nombre: user?.nombre || "Sin nombre",
          apellidoP: "",
          apellidoM: "",
          cuentaActiva: 0,
          fechaAlta: null,
          fechaBaja: null,
        });
        setEstadisticas({
          totalRecogiendo: 0,
          totalEnAlquiler: 0,
          totalEnviando: 0,
          totalFinalizado: 0,
          promedioValoracion: 0,
        });
        setPedidosFinalizadosPorMes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, csrfToken]);

  const hasDataForCharts =
    estadisticas.totalRecogiendo > 0 ||
    estadisticas.totalEnAlquiler > 0 ||
    estadisticas.totalEnviando > 0 ||
    estadisticas.totalFinalizado > 0 ||
    (pedidosFinalizadosPorMes && pedidosFinalizadosPorMes.length > 0) ||
    estadisticas.promedioValoracion > 0;

  if (loading) {
    return (
      <CustomLoading/>
    );
  }

  return (
    <div className="min-h-screen  text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700 p-5 md:p-8">
        <div className="flex flex-col items-center md:flex-row md:justify-between">
          <div className="flex items-center space-x-5">
            <div className="relative">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {repartidor.nombre.charAt(0) || "R"}
              </div>
              <div
                className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white dark:border-gray-800 ${
                  repartidor.cuentaActiva ? "bg-green-500" : "bg-red-500"
                }`}
              ></div>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 md:text-2xl">
                {repartidor.nombre} {repartidor.apellidoP} {repartidor.apellidoM}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 md:text-lg">
                Estado: {repartidor.cuentaActiva ? "Activo" : "Desactivado"}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 md:text-base">
                {repartidor.cuentaActiva
                  ? `Repartidor Activado: ${new Date(repartidor.fechaAlta).toLocaleDateString()}`
                  : repartidor.fechaBaja
                  ? `Repartidor Desactivado: ${new Date(repartidor.fechaBaja).toLocaleDateString()}`
                  : "Sin fecha de baja"}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Estadísticas */}
      <section className="p-5 md:p-8">
        <h2 className="text-lg font-semibold mb-5 text-gray-800 dark:text-gray-200 md:text-2xl">Resumen de hoy</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-100 hover:shadow-md transition-shadow dark:bg-gray-800 dark:border-gray-700">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-3 dark:bg-blue-900">
                <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-2xl font-bold text-gray-900 dark:text-gray-100 md:text-4xl">{estadisticas.totalRecogiendo}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400 md:text-base">Recogiendo</span>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-100 hover:shadow-md transition-shadow dark:bg-gray-800 dark:border-gray-700">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center mb-3 dark:bg-amber-900">
                <Clock className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <span className="text-2xl font-bold text-gray-900 dark:text-gray-100 md:text-4xl">{estadisticas.totalEnAlquiler}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400 md:text-base">En Alquiler</span>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-100 hover:shadow-md transition-shadow dark:bg-gray-800 dark:border-gray-700">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-3 dark:bg-red-900">
                <Clock className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <span className="text-2xl font-bold text-gray-900 dark:text-gray-100 md:text-4xl">{estadisticas.totalEnviando}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400 md:text-base">Enviando</span>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-100 hover:shadow-md transition-shadow dark:bg-gray-800 dark:border-gray-700">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mb-3 dark:bg-green-900">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <span className="text-2xl font-bold text-gray-900 dark:text-gray-100 md:text-4xl">{estadisticas.totalFinalizado}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400 md:text-base">Finalizado</span>
            </div>
          </div>
        </div>
      </section>

      {/* Gráficos circulares */}
      <section className="p-5 md:p-8">
        <h2 className="text-lg font-semibold mb-5 text-gray-800 dark:text-gray-200 flex items-center md:text-2xl">
          <BarChart2 className="w-5 h-5 mr-2" />
          Estadísticas y rendimiento
        </h2>
        {!hasDataForCharts && (
          <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-100 dark:bg-gray-800 dark:border-gray-700 text-center">
            <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base">No hay datos disponibles para mostrar.</p>
          </div>
        )}
        {hasDataForCharts && (
          <div className="space-y-5">
            {/* Gráfico circular - Distribución de pedidos */}
            <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
              <h3 className="text-sm font-medium mb-3 text-gray-700 dark:text-gray-300 md:text-lg">Distribución de pedidos</h3>
              <div className="h-48 md:h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={30}
                      outerRadius={60}
                      paddingAngle={2}
                      dataKey="value"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                        fontSize: "12px",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                      }}
                      wrapperStyle={{ backgroundColor: "transparent" }}
                      className="dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      iconType="circle"
                      wrapperStyle={{ fontSize: "12px", color: "#000" }}
                      className="dark:text-gray-100"
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Gráfico radial - Pedidos finalizados por mes */}
            <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
              <h3 className="text-sm font-medium mb-3 text-gray-700 dark:text-gray-300 md:text-lg">Pedidos finalizados por mes</h3>
              <div className="h-48 md:h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart
                    cx="50%"
                    cy="50%"
                    innerRadius="20%"
                    outerRadius="80%"
                    data={radialData}
                    startAngle={90}
                    endAngle={-270}
                  >
                    <RadialBar
                      minAngle={15}
                      label={{ position: "insideStart", fill: "#fff", fontSize: 10 }}
                      background
                      dataKey="value"
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                        fontSize: "12px",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                      }}
                      wrapperStyle={{ backgroundColor: "transparent" }}
                      className="dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                    />
                  </RadialBarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Gráfico radial - Valoración promedio */}
            <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
              <h3 className="text-sm font-medium mb-3 text-gray-700 dark:text-gray-300 md:text-lg">Puntuación promedio</h3>
              {estadisticas.promedioValoracion > 0 ? (
                <div className="h-48 md:h-72 flex items-center justify-center">
                  <ResponsiveContainer width="80%" height="80%">
                    <RadialBarChart
                      cx="50%"
                      cy="50%"
                      innerRadius="30%"
                      outerRadius="80%"
                      data={valoracionData}
                    >
                      <RadialBar
                        label={{ fill: "#fff", position: "inside", fontSize: 12 }}
                        background={{ fill: "#eee", dark: { fill: "#4b5563" } }}
                        dataKey="value"
                        cornerRadius={10}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#fff",
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                          fontSize: "12px",
                          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                        }}
                        wrapperStyle={{ backgroundColor: "transparent" }}
                        className="dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                      />
                      <text
                        x="50%"
                        y="50%"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="text-gray-800 font-bold dark:text-gray-100"
                        style={{ fontSize: "16px" }}
                      >
                        {estadisticas.promedioValoracion.toFixed(1)}
                      </text>
                    </RadialBarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-center text-gray-500 dark:text-gray-400 text-sm md:text-base">Sin datos</p>
              )}
            </div>
          </div>
        )}
      </section>

      {/* Métricas adicionales */}
      <section className="p-5 md:p-8">
        <h2 className="text-lg font-semibold mb-5 text-gray-800 dark:text-gray-200 flex items-center md:text-2xl">
          <Target className="w-5 h-5 mr-2" />
          Métricas de rendimiento
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-1 md:gap-6">
          <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-100 hover:shadow-md transition-shadow dark:bg-gray-800 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 md:text-lg">Promedio semanal</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 md:text-4xl">
                  {(estadisticas.totalFinalizado / 7).toFixed(1)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 md:text-base">entregas/día</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center dark:bg-blue-900">
                <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default InicioRepartidor;