import React, { useState, useEffect, useRef,useCallback } from "react";
import Chart from "react-apexcharts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faShoppingCart,
  faUsers,
  faMoneyBillWave,
  faHistory,
  faClock,
  faBoxOpen,
  faPlayCircle,
  faCheckCircle,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import api from "../../../utils/AxiosConfig";
import { useAuth } from "../../../hooks/ContextAuth";
import CustomLoading from "../../../components/spiner/SpinerGlobal";

// Tarjeta de resumen mejorada para light/dark y fully responsive, permitiendo wrap en labels
const SummaryCard = ({ icon, label, value, className = "" }) => (
  <div className={`dark:text-gray-200 dark:bg-gray-800 dark:border-gray-700 border border-gray-200 p-3 sm:p-4 md:p-5 rounded-lg sm:rounded-xl shadow-sm hover:shadow-md transition-all duration-200 flex items-center space-x-3 sm:space-x-4 overflow-hidden ${className}`}>
    <FontAwesomeIcon icon={icon} className="text-lg sm:text-xl md:text-2xl text-blue-500 flex-shrink-0" />
    <div className="min-w-0 flex-1">
      <p className="text-xs sm:text-sm font-medium uppercase text-gray-500 dark:text-gray-400 leading-tight break-words">{label}</p>
      <p className="text-base sm:text-lg md:text-xl font-bold text-gray-900 dark:text-white leading-tight break-words">{value}</p>
    </div>
  </div>
);

const PedidosGeneralesDashboard = () => {
  const defaultStats = {
    totalOrders: 0,
    activeOrders: 0,
    totalRevenue: 0,
    totalRevenueFinalized: 0,
    uniqueClients: 0,
    avgDuration: 0,
    cancelled: 0,
    clientTypeCounts: { "Cliente registrado": 0, "Cliente convertido": 0, "No cliente": 0 },
    revenueByMonth: Array(12).fill(0),
    topProducts: [],
    payCounts: { pendiente: 0, completado: 0 },
    statusCounts: {},
    durationBins: { "1 día": 0, "2–3 días": 0, "4–7 días": 0, "8+ días": 0 },
    topClients: [],
  };

  const [stats, setStats] = useState(defaultStats);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedStatus, setSelectedStatus] = useState("Todos");
  const { csrfToken } = useAuth();
  const chartContainerRef = useRef(null);

  // Detectar tema dark/light
  const isDark = document.documentElement.classList.contains("dark");

  const fetchStats = useCallback(async () =>{
    try {
      setLoading(true);
      const params = new URLSearchParams({ year: selectedYear });

      if (selectedStatus !== "Todos") {
        params.append("estado", selectedStatus.toLowerCase());
      }

      const response = await api.get(`/api/pedidos/dashboard-stats?${params.toString()}`, {
        headers: { "X-CSRF-Token": csrfToken },
        withCredentials: true,
      });

      const result = response.data;
      console.log("Datos recibidos del servidor:", result);

      if (result.success && result.stats) {
        const fetchedStats = result.stats;
        setStats({
          ...defaultStats,
          ...fetchedStats,
          totalOrders: Number(fetchedStats.totalOrders) || 0,
          activeOrders: Number(fetchedStats.activeOrders) || 0,
          totalRevenue: Number(fetchedStats.totalRevenue) || 0,
          totalRevenueFinalized: Number(fetchedStats.totalRevenueFinalized) || 0,
          uniqueClients: Number(fetchedStats.uniqueClients) || 0,
          avgDuration: Number(fetchedStats.avgDuration) || 0,
          cancelled: Number(fetchedStats.cancelled) || 0,
          clientTypeCounts: fetchedStats.clientTypeCounts || defaultStats.clientTypeCounts,
          revenueByMonth: Array.isArray(fetchedStats.revenueByMonth)
            ? fetchedStats.revenueByMonth.map((v) => Number(v) || 0)
            : defaultStats.revenueByMonth,
          topProducts: Array.isArray(fetchedStats.topProducts) ? fetchedStats.topProducts : [],
          payCounts: fetchedStats.payCounts || defaultStats.payCounts,
          statusCounts: fetchedStats.statusCounts || {},
          durationBins: fetchedStats.durationBins || defaultStats.durationBins,
          topClients: Array.isArray(fetchedStats.topClients) ? fetchedStats.topClients : [],
        });
      } else {
        toast.error("No se encontraron datos para el año seleccionado o hubo un error.");
        setStats(defaultStats);
      }
    } catch (error) {
      toast.error("Error de conexión con el servidor");
      console.error("Error en fetchStats:", error);
      setStats(defaultStats);
    } finally {
      setLoading(false);
    }
  },[csrfToken, defaultStats, selectedStatus, selectedYear]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats,csrfToken, selectedYear, selectedStatus]);

  const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

  const chartCommon = {
    chart: { toolbar: { show: false }, background: "transparent", zoom: { enabled: false } },
    dataLabels: { enabled: false },
    grid: { strokeDashArray: 3, borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)" },
    theme: { mode: isDark ? "dark" : "light" },
    tooltip: { 
      theme: isDark ? "dark" : "light", 
      style: { fontSize: "12px" },
      x: { formatter: (val) => val }
    },
    xaxis: {
      labels: { 
        style: { colors: isDark ? "#e2e8f0" : "#374151", fontSize: "11px" }, 
        rotate: -45, 
        rotateAlways: false, 
        trim: true 
      },
      axisBorder: { color: isDark ? "#475569" : "#d1d5db" },
      axisTicks: { color: isDark ? "#475569" : "#d1d5db" },
    },
    yaxis: {
      labels: { 
        style: { colors: isDark ? "#e2e8f0" : "#374151", fontSize: "11px" }
      },
      axisBorder: { color: isDark ? "#475569" : "#d1d5db" },
      axisTicks: { color: isDark ? "#475569" : "#d1d5db" },
    },
    title: { 
      style: { color: isDark ? "#f1f5f9" : "#111827", fontSize: "12px", fontWeight: 600 } 
    },
    legend: { 
      show: true, 
      position: "top", 
      horizontalAlign: "left",
      labels: { colors: isDark ? "#e2e8f0" : "#374151" },
      markers: { width: 10, height: 10, radius: 2 }
    },
    responsive: [{
      breakpoint: 480,
      options: {
        legend: { position: "bottom" },
        xaxis: { labels: { rotate: -45 } }
      }
    }]
  };

  // Verificar si hay datos
  const hasData = stats.totalOrders > 0 || stats.totalRevenue > 0 || stats.uniqueClients > 0;

  if (loading) {
    return <CustomLoading />;
  }

  const averageValue = stats.totalOrders ? (stats.totalRevenue / stats.totalOrders).toFixed(2) : 0;

  return (
    <div ref={chartContainerRef} className="min-h-screen p-2 sm:p-4 md:p-6 lg:p-8 bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-gray-900 dark:text-white mb-4 sm:mb-6 tracking-tight">
        Dashboard de Pedidos Generales
      </h1>

      {/* Filtros - Responsive row */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center mb-6 sm:mb-8">
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(+e.target.value)}
          className="px-4 py-2.5 rounded-lg bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 focus:border-blue-500 focus:outline-none transition-colors w-full sm:w-auto text-sm sm:text-base"
        >
          {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-4 py-2.5 rounded-lg bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 focus:border-blue-500 focus:outline-none transition-colors w-full sm:w-auto text-sm sm:text-base"
        >
          {["Todos", "Cancelado", "Confirmado", "En alquiler", "Enviando", "Finalizado", "Incidente", "Incompleto", "Procesando", "Recogiendo"].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>



      {/* Tarjetas de Resumen - Grid responsive, ahora con wrap para labels */}
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
  {/* VOLUMEN DE PEDIDOS */}
  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
    <h3 className="font-semibold text-blue-800 mb-3 text-sm uppercase tracking-wide">Volumen de Pedidos</h3>
    <div className="space-y-3">
      <SummaryCard 
        icon={faShoppingCart} 
        label="Total Pedidos" 
        value={stats.totalOrders.toLocaleString()}
        className="bg-white"
      />
      <SummaryCard 
        icon={faPlayCircle} 
        label="Pedidos Activos" 
        value={stats.activeOrders.toLocaleString()}
        className="bg-white"
      />
      <SummaryCard 
        icon={faBoxOpen} 
        label="Cancelados" 
        value={stats.cancelled.toLocaleString()}
        className="bg-white"
      />
    </div>
  </div>

  {/* CLIENTES */}
  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
    <h3 className="font-semibold text-green-800 mb-3 text-sm uppercase tracking-wide">Clientes</h3>
    <div className="space-y-3">
      <SummaryCard 
        icon={faUsers} 
        label="Clientes Únicos" 
        value={stats.uniqueClients.toLocaleString()}
        className="bg-white"
      />
    </div>
  </div>

  {/* INGRESOS */}
  <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-4 border border-purple-100">
    <h3 className="font-semibold text-purple-800 mb-3 text-sm uppercase tracking-wide">Ingresos</h3>
    <div className="space-y-3">
      <SummaryCard
        icon={faMoneyBillWave}
        label="Total Ingresos"
        value={`$${stats.totalRevenue.toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
        className="bg-white"
      />
      <SummaryCard
        icon={faCheckCircle}
        label="Ingresos Finalizados"
        value={`$${stats.totalRevenueFinalized.toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
        className="bg-white"
      />
    </div>
  </div>

  {/* MÉTRICAS PROMEDIO */}
  <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-100">
    <h3 className="font-semibold text-amber-800 mb-3 text-sm uppercase tracking-wide">Métricas Promedio</h3>
    <div className="space-y-3">
      <SummaryCard
        icon={faHistory}
        label="Valor Medio"
        value={`$${averageValue}`}
        className="bg-white"
      />
      <SummaryCard
        icon={faClock}
        label="Duración Media"
        value={`${stats.avgDuration.toFixed(1)} días`}
        className="bg-white"
      />
    </div>
  </div>
</div>


      {/* Mensaje sin datos */}
      {!hasData && (
        <div className="col-span-full text-center py-8 text-gray-500 dark:text-gray-400 text-sm sm:text-base font-medium">
          No hay datos disponibles para el año {selectedYear} y estado "{selectedStatus}".
        </div>
      )}

      {/* Sección 1: Gráficas Principales - Grid responsive */}
      {hasData && (
        <>
          <section className="mb-6 sm:mb-8">
            <h2 className="text-sm sm:text-base md:text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 sm:mb-6 px-2">Métricas Mensuales e Insights</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Ingresos por Mes - Bar */}
              <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <h3 className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3 break-words">Ingresos por Mes ({selectedYear})</h3>
                <Chart
                  options={{
                    ...chartCommon,
                    chart: { type: "bar", height: 250 },
                    title: { text: "Distribución Mensual", align: "left" },
                    xaxis: { ...chartCommon.xaxis, categories: months },
                    yaxis: {
                      ...chartCommon.yaxis,
                      labels: {
                        ...chartCommon.yaxis.labels,
                        formatter: (val) => `$${Number(val || 0).toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
                      }
                    },
                    plotOptions: { bar: { horizontal: false, columnWidth: "55%", borderRadius: 4 } },
                    colors: ["#3b82f6"]
                  }}
                  series={[{ name: "Ingresos", data: stats.revenueByMonth }]}
                  type="bar"
                  height={250}
                />
              </div>

              {/* Estado de Pago - Pie */}
              <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden md:col-span-1 lg:col-span-1">
                <h3 className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3 break-words">Estado de Pagos</h3>
                <Chart
                  options={{
                    ...chartCommon,
                    title: { text: "Pendiente vs Completado", align: "left" },
                    labels: ["Pendiente", "Completado"],
                    legend: { position: "bottom" },
                    colors: ["#ef4444", "#10b981"]
                  }}
                  series={[stats.payCounts.pendiente, stats.payCounts.completado]}
                  type="pie"
                  height={250}
                />
              </div>

              {/* Tipo de Cliente - Pie */}
              <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden md:col-span-1 lg:col-span-1">
                <h3 className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3 break-words">Distribución por Tipo de Cliente</h3>
                <Chart
                  options={{
                    ...chartCommon,
                    title: { text: "Tipos de Clientes", align: "left" },
                    labels: Object.keys(stats.clientTypeCounts),
                    legend: { position: "bottom" },
                    colors: ["#8b5cf6", "#06b6d4", "#f59e0b"]
                  }}
                  series={Object.values(stats.clientTypeCounts).map(v => Number(v))}
                  type="pie"
                  height={250}
                />
              </div>
            </div>
          </section>

          {/* Sección 2: Análisis Detallado */}
          <section className="mb-6 sm:mb-8">
            <h2 className="text-sm sm:text-base md:text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 sm:mb-6 px-2">Análisis Detallado</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
              {/* Estado de Pedidos - Donut */}
              <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <h3 className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3 break-words">Estados de Pedidos</h3>
                <Chart
                  options={{
                    ...chartCommon,
                    title: { text: "Por Estado", align: "left" },
                    labels: Object.keys(stats.statusCounts),
                    legend: { position: "bottom" },
                    colors: ["#f97316", "#eab308", "#84cc16", "#22c55e", "#10b981", "#059669", "#047857"]
                  }}
                  series={Object.values(stats.statusCounts).map(v => Number(v))}
                  type="donut"
                  height={250}
                />
              </div>

              {/* Distribución de Duración - Bar */}
              <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <h3 className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3 break-words">Distribución de Duración</h3>
                <Chart
                  options={{
                    ...chartCommon,
                    chart: { type: "bar", height: 250 },
                    title: { text: "Días de Alquiler", align: "left" },
                    xaxis: { 
                      ...chartCommon.xaxis, 
                      categories: Object.keys(stats.durationBins),
                      labels: { ...chartCommon.xaxis.labels, rotate: 0 }
                    },
                    yaxis: {
                      ...chartCommon.yaxis,
                      labels: {
                        ...chartCommon.yaxis.labels,
                        formatter: (val) => Number(val || 0).toString()
                      }
                    },
                    plotOptions: { bar: { horizontal: false, columnWidth: "45%", borderRadius: 4 } },
                    colors: ["#6366f1"]
                  }}
                  series={[{ name: "Pedidos", data: Object.values(stats.durationBins).map(v => Number(v)) }]}
                  type="bar"
                  height={250}
                />
              </div>

              {/* Top Productos - Horizontal Bar */}
              <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden lg:col-span-2 xl:col-span-1">
                <h3 className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3 break-words">Top 5 Productos (Cantidad)</h3>
                <Chart
                  options={{
                    ...chartCommon,
                    chart: { type: "bar", height: 250 },
                    title: { text: "Productos Más Vendidos", align: "left" },
                    xaxis: { 
                      ...chartCommon.xaxis, 
                      categories: stats.topProducts.slice(0, 5).map(p => p?.nombre?.substring(0, 30) || "N/A"),
                      labels: { ...chartCommon.xaxis.labels, rotate: 0 }
                    },
                   
                    plotOptions: { bar: { horizontal: true, dataLabels: { position: "end" } } },
                    dataLabels: { enabled: true, style: { colors: ["#fff"] }, offsetX: -10 },
                    colors: ["#ec4899"]
                  }}
                  series={[{ name: "Cantidad", data: stats.topProducts.slice(0, 5).map(p => Number(p?.qty || 0)) }]}
                  type="bar"
                  height={250}
                />
              </div>
              
            </div>
          </section>

          {/* Sección 3: Top Clientes */}
          <section>
            <h2 className="text-sm sm:text-base md:text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 sm:mb-6 px-2">Top Clientes por Facturación</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <Chart
                  options={{
                    ...chartCommon,
                    chart: { type: "bar", height: 300 },
                    title: { text: "Facturación por Cliente", align: "left" },
                    xaxis: { 
                      ...chartCommon.xaxis, 
                      categories: stats.topClients.slice(0, 5).map(c => c?.clientName?.substring(0, 25) || "N/A"),
                      labels: { ...chartCommon.xaxis.labels, rotate: -30, trim: true }
                    },
                    yaxis: {
                      ...chartCommon.yaxis,
                      labels: {
                        ...chartCommon.yaxis.labels,
                        formatter: (val) => `$${Number(val || 0).toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
                      }
                    },
                    plotOptions: { bar: { horizontal: false, columnWidth: "50%", borderRadius: 4 } },
                    colors: ["#8b5cf6"]
                  }}
                  series={[{ name: "Facturación (MXN)", data: stats.topClients.slice(0, 5).map(c => Number(c?.revenue || 0)) }]}
                  type="bar"
                  height={300}
                />
              </div>
              {stats.topClients.length > 5 && (
                <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden lg:col-span-1">
                  <h3 className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3 break-words">Otros Clientes Destacados</h3>
                  <ul className="space-y-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 max-h-48 overflow-y-auto">
                    {stats.topClients.slice(5, 10).map((client, idx) => (
                      <li key={idx} className="flex justify-between break-words">
                        <span className="truncate max-w-[60%]">{client?.clientName?.substring(0, 30) || "N/A"}</span>
                        <span className="font-medium min-w-[40%] text-right">${Number(client?.revenue || 0).toLocaleString('es-MX')}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default PedidosGeneralesDashboard;