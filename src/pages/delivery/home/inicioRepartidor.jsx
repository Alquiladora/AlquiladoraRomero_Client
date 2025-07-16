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
import {
  Truck,
  Package,
  CheckCircle,
  Clock,
  BarChart2,
  Target,
} from "lucide-react";
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
    { name: "Recogiendo", value: estadisticas.totalRecogiendo, color: "#2563EB" },
    { name: "En Alquiler", value: estadisticas.totalEnAlquiler, color: "#F59E0B" },
    { name: "Enviando", value: estadisticas.totalEnviando, color: "#DC2626" },
    { name: "Finalizado", value: estadisticas.totalFinalizado, color: "#065F46" },
  ];

  // Datos para el gráfico radial de rendimiento mensual
  const radialData = pedidosFinalizadosPorMes.map((item, index) => ({
    name: item.mes,
    value: item.completados || 0,
    fill: `hsl(${(index * 60) % 360}, 70%, 50%)`,
  }));

  // Datos para el gráfico radial de valoración
  const valoracionData = [
    {
      name: "Puntuación",
      value: estadisticas.promedioValoracion * 20,
      color: estadisticas.promedioValoracion >= 4 ? "#065F46" : "#DC2626",
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
    return <CustomLoading />;
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white shadow-xl border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700 p-6 md:p-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex items-center space-x-6">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-700 to-blue-900 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                {repartidor.nombre.charAt(0) || "R"}
              </div>
              <div
                className={`absolute -bottom-2 -right-2 w-6 h-6 rounded-full border-2 border-white dark:border-gray-800 ${
                  repartidor.cuentaActiva ? "bg-emerald-500" : "bg-red-500"
                }`}
              ></div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 md:text-3xl">
                {repartidor.nombre} {repartidor.apellidoP} {repartidor.apellidoM}
              </h1>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 md:text-base">
                Estado: {repartidor.cuentaActiva ? "Activo" : "Desactivado"}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 md:text-sm">
                {repartidor.cuentaActiva
                  ? `Activado desde: ${new Date(repartidor.fechaAlta).toLocaleDateString()}`
                  : repartidor.fechaBaja
                  ? `Desactivado desde: ${new Date(repartidor.fechaBaja).toLocaleDateString()}`
                  : "Sin fecha de baja"}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Estadísticas */}
      <section className="max-w-7xl mx-auto p-6 md:p-8">
        <h2 className="text-xl font-semibold mb-6 text-gray-800 dark:text-gray-200 md:text-2xl">
          Resumen de Desempeño
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-5 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-300 dark:bg-gray-800 dark:border-gray-700">
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mb-4 dark:bg-blue-900/50">
                <Clock className="w-6 h-6 text-blue-700 dark:text-blue-300" />
              </div>
              <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">{estadisticas.totalRecogiendo}</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">Recogiendo</span>
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-300 dark:bg-gray-800 dark:border-gray-700">
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mb-4 dark:bg-amber-900/50">
                <Package className="w-6 h-6 text-amber-700 dark:text-amber-300" />
              </div>
              <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">{estadisticas.totalEnAlquiler}</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">En Alquiler</span>
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-300 dark:bg-gray-800 dark:border-gray-700">
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mb-4 dark:bg-red-900/50">
                <Truck className="w-6 h-6 text-red-700 dark:text-red-300" />
              </div>
              <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">{estadisticas.totalEnviando}</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">Enviando</span>
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-300 dark:bg-gray-800 dark:border-gray-700">
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mb-4 dark:bg-emerald-900/50">
                <CheckCircle className="w-6 h-6 text-emerald-700 dark:text-emerald-300" />
              </div>
              <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">{estadisticas.totalFinalizado}</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">Finalizado</span>
            </div>
          </div>
        </div>
      </section>

      {/* Gráficos */}
      <section className="max-w-7xl mx-auto p-6 md:p-8">
        <h2 className="text-xl font-semibold mb-6 text-gray-800 dark:text-gray-200 flex items-center md:text-2xl">
          <BarChart2 className="w-6 h-6 mr-3" />
          Análisis de Rendimiento
        </h2>
        {!hasDataForCharts && (
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 dark:bg-gray-800 dark:border-gray-700 text-center">
            <p className="text-gray-500 dark:text-gray-400 text-base md:text-lg">No hay datos disponibles para mostrar.</p>
          </div>
        )}
        {hasDataForCharts && (
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
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={2}
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
                        backgroundColor: "#fff",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                        fontSize: "14px",
                        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                      }}
                      wrapperStyle={{ backgroundColor: "transparent" }}
                      className="dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={48}
                      iconType="circle"
                      wrapperStyle={{ fontSize: "14px", color: "#374151" }}
                      className="dark:text-gray-300"
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
                      label={{ position: "inside", fill: "#fff", fontSize: 12 }}
                      background={{ fill: "#e5e7eb", dark: { fill: "#4b5563" } }}
                      dataKey="value"
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                        fontSize: "14px",
                        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                      }}
                      wrapperStyle={{ backgroundColor: "transparent" }}
                      className="dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                    />
                  </RadialBarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Gráfico radial - Valoración promedio */}
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
              <h3 className="text-lg font-medium mb-4 text-gray-700 dark:text-gray-300">Puntuación Promedio</h3>
              {estadisticas.promedioValoracion > 0 ? (
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
                        label={{ fill: "#fff", position: "inside", fontSize: 14 }}
                        background={{ fill: "#e5e7eb", dark: { fill: "#4b5563" } }}
                        dataKey="value"
                        cornerRadius={15}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#fff",
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                          fontSize: "14px",
                          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                        }}
                        wrapperStyle={{ backgroundColor: "transparent" }}
                        className="dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                      />
                      <text
                        x="50%"
                        y="50%"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="text-gray-900 font-bold dark:text-gray-100"
                        style={{ fontSize: "20px" }}
                      >
                        {estadisticas.promedioValoracion.toFixed(1)}
                      </text>
                    </RadialBarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-center text-gray-500 dark:text-gray-400 text-base md:text-lg">Sin datos</p>
              )}
            </div>
          </div>
        )}
      </section>

      {/* Métricas adicionales */}
      <section className="max-w-7xl mx-auto p-6 md:p-8">
        <h2 className="text-xl font-semibold mb-6 text-gray-800 dark:text-gray-200 flex items-center md:text-2xl">
          <Target className="w-6 h-6 mr-3" />
          Indicadores de Rendimiento
        </h2>
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-300 dark:bg-gray-800 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-base font-medium text-gray-600 dark:text-gray-400">Promedio Semanal</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                  {(estadisticas.totalFinalizado / 7).toFixed(1)}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Entregas por día</p>
              </div>
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center dark:bg-blue-900/50">
                <Target className="w-8 h-8 text-blue-700 dark:text-blue-300" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default InicioRepartidor;