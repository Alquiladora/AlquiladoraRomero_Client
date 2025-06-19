import React, { useState, useEffect, useMemo, useContext } from "react";
import Chart from "react-apexcharts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faShoppingCart,
  faUsers,
  faMoneyBillWave,
  faHistory,
  faClock,
  faBoxOpen,
  faChartBar,
  faChartLine,
  faChartPie
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import api from "../../../utils/AxiosConfig";
import { useAuth } from "../../../hooks/ContextAuth";
import { ThemeContext } from "@emotion/react";

// Tarjeta de resumen adaptada a light/dark y full responsive
const SummaryCard = ({ icon, label, value }) => (
  <div className=" dark:text-gray-200 dark:bg-gray-800 dark:border-gray-700 border border-gray-200 p-6 rounded-2xl shadow hover:shadow-lg transition-shadow flex items-center space-x-4">
    <FontAwesomeIcon icon={icon} className="text-3xl text-yellow-500" />
    <div>
      <p className="text-xs font-medium uppercase text-gray-500  dark:text-gray-200 ">{label}</p>
      <p className="text-2xl  font-semibold text-gray-900 dark:text-gray-200">{value}</p>
    </div>
  </div>
);

const PedidosGeneralesDashboard = () => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedStatus, setSelectedStatus] = useState("Todos");
  const { csrfToken } = useAuth();

    const { theme } = useContext(ThemeContext);
  const isDark = theme === "dark";

  useEffect(() => {
    api
      .get("/api/pedidos/pedidos-general", {
        headers: { "X-CSRF-Token": csrfToken },
        withCredentials: true,
      })
      .then((res) => {
        if (res.data.success) setPedidos(res.data.data);
        else toast.error("Error al cargar pedidos");
      })
      .catch(() => toast.error("Error de conexión"))
      .finally(() => setLoading(false));
  }, [csrfToken]);

  // Cálculo memoizado de métricas
  const stats = useMemo(() => {
    const totalOrders = pedidos.length;
    const totalRevenue = pedidos.reduce((sum, p) => sum + Number(p.pago.total || 0), 0);
    const avgOrder = totalOrders ? totalRevenue / totalOrders : 0;
    const uniqueClients = new Set(pedidos.map((p) => p.cliente.nombre)).size;
    const avgDuration = totalOrders
      ? pedidos.reduce((sum, p) => sum + p.fechas.diasAlquiler, 0) / totalOrders
      : 0;
    const cancelled = pedidos.filter((p) => p.estado === "Cancelado").length;

    // Conteo por tipo de cliente
    const clientTypeCounts = pedidos.reduce(
      (acc, p) => {
        const type = p.cliente.tipoCliente;
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      },
      { "Cliente registrado": 0, "Cliente convertido": 0, "No cliente": 0 }
    );

    // Ingresos por mes (para línea de ingresos)
    const revenueByMonth = Array(12).fill(0);
    pedidos.forEach((p) => {
      const d = new Date(p.fechas.inicio);
      revenueByMonth[d.getMonth()] += Number(p.pago.total || 0);
    });

    // Top 5 productos (para barras)
    const prodMap = {};
    pedidos.forEach((p) =>
      p.productos.forEach((item) => {
        prodMap[item.nombre] = (prodMap[item.nombre] || 0) + item.cantidad;
      })
    );
    const topProducts = Object.entries(prodMap)
      .map(([name, qty]) => ({ name, qty }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);

    // Pago completado vs pendiente
    const payCounts = pedidos.reduce(
      (acc, p) => {
        const pend = p.pago.pagosRealizados?.some((pg) => pg.estadoPago === "pendiente");
        if (pend) acc.pendiente++;
        else acc.completado++;
        return acc;
      },
      { completado: 0, pendiente: 0 }
    );

    // Conteo por estado de pedido
    const statusCounts = pedidos.reduce((acc, p) => {
      acc[p.estado] = (acc[p.estado] || 0) + 1;
      return acc;
    }, {});

    // Histograma de duración (bins: 1d, 2–3d, 4–7d, 8+d)
    const durationBins = { "1día": 0, "2–3 días": 0, "4–7 días": 0, "8+ días": 0 };
    pedidos.forEach((p) => {
      const d = p.fechas.diasAlquiler;
      if (d === 1) durationBins["1día"]++;
      else if (d <= 3) durationBins["2–3 días"]++;
      else if (d <= 7) durationBins["4–7 días"]++;
      else durationBins["8+ días"]++;
    });

    // Top 5 clientes por facturación
    const clientRevenue = {};
    pedidos.forEach((p) => {
      const n = p.cliente.nombre;
      clientRevenue[n] = (clientRevenue[n] || 0) + Number(p.pago.total || 0);
    });
    const topClients = Object.entries(clientRevenue)
      .map(([name, rev]) => ({ name, rev }))
      .sort((a, b) => b.rev - a.rev)
      .slice(0, 5);

    return {
      totalOrders,
      totalRevenue,
      avgOrder,
      uniqueClients,
      avgDuration,
      cancelled,
      clientTypeCounts,
      revenueByMonth,
      topProducts,
      payCounts,
      statusCounts,
      durationBins,
      topClients,
    };
  }, [pedidos]);

  // Pedidos filtrados por mes/estado
  const months = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
  const monthlyData = useMemo(() => {
    const arr = Array(12).fill(0);
    pedidos.forEach((p) => {
      const d = new Date(p.fechas.inicio);
      if (
        d.getFullYear() === selectedYear &&
        (selectedStatus === "Todos" || p.estado === selectedStatus)
      ) {
        arr[d.getMonth()]++;
      }
    });
    return arr;
  }, [pedidos, selectedYear, selectedStatus]);

 

const chartCommon = {
  chart: { toolbar: { show: false }, background: "transparent" },
  dataLabels: { enabled: false, style: { colors: ["#eee"] } },
  grid: { strokeDashArray: 5, borderColor: isDark ? "rgba(255,255,255,0.12)" : "#e0e0e0" },
  theme: { mode: isDark ? "dark" : "light" },
  tooltip: { theme: isDark ? "dark" : "light", style: { fontSize: "12px", color: isDark ? "#eee" : "#333" } },
  xaxis: {
    labels: { style: { colors: isDark ? "#ddd" : "#333" } },
    axisBorder: { color: isDark ? "#666" : "#ccc" },
    axisTicks: { color: isDark ? "#666" : "#ccc" },
  },
  yaxis: {
    labels: { style: { colors: isDark ? "#ddd" : "#333" } },
    axisBorder: { color: isDark ? "#666" : "#ccc" },
    axisTicks: { color: isDark ? "#666" : "#ccc" },
  },
  title: { style: { color: isDark ? "#eee" : "#111", fontSize: "16px", fontWeight: "bold" } },
  legend: { show: true, labels: { colors: isDark ? "#eee" : "#333" }, markers: { width: 12, height: 12, radius: 6 } },
};




  if (loading)
    return (
      <div className="flex justify-center items-center h-64 text-gray-500 dark:text-gray-400">
        Cargando...
      </div>
    );

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8 bg-gray-50 dark:bg-gray-900 transition-colors">
      <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-gray-100 mb-6">
        Dashboard de Pedidos
      </h1>

      {/* Resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <SummaryCard icon={faShoppingCart} label="Total Pedidos" value={stats.totalOrders} />
        <SummaryCard icon={faUsers} label="Clientes Únicos" value={stats.uniqueClients} />
        <SummaryCard
          icon={faMoneyBillWave}
          label="Ingresos"
          value={`$${stats.totalRevenue.toFixed(2)}`}
        />
        <SummaryCard
          icon={faHistory}
          label="Valor Medio"
          value={`$${stats.avgOrder.toFixed(2)}`}
        />
        <SummaryCard
          icon={faClock}
          label="Duración Media"
          value={`${stats.avgDuration.toFixed(1)}d`}
        />
        <SummaryCard icon={faBoxOpen} label="Cancelados" value={stats.cancelled} />
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center mt-6">
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(+e.target.value)}
          className="px-4 py-2 rounded bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300"
        >
          {[...new Set(pedidos.map((p) => new Date(p.fechas.inicio).getFullYear()))].map((y) => (
            <option key={y}>{y}</option>
          ))}
        </select>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-4 py-2 rounded bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300"
        >
          {["Todos", ...new Set(pedidos.map((p) => p.estado))].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Gráficas principales */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        {/* Pedidos por Mes */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
            Pedidos por Mes ({selectedStatus})
          </h2>
          <Chart
            {...chartCommon}
            options={{ xaxis: { categories: months }, title: { text: "Pedidos/Mes", align: "left" } }}
            series={[{ name: "Pedidos", data: monthlyData }]}
            type="bar"
            height={300}
          />
        </div>

        {/* Ingresos por Mes */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
            Ingresos por Mes
          </h2>
          <Chart
            {...chartCommon}
            options={{ xaxis: { categories: months }, title: { text: "Ingresos/Mes", align: "left" } }}
            series={[{ name: "Ingresos", data: stats.revenueByMonth }]}
            type="line"
            
            height={300}
          />
        </div>

        {/* Estado de Pago */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
            Estado de Pago
          </h2>
          <Chart
            {...chartCommon}
            options={{
              labels: ["Completado", "Pendiente"],
              legend: { position: "bottom" },
              title: { text: "Pagos", align: "left" }
            }}
            series={[stats.payCounts.completado, stats.payCounts.pendiente]}
            type="pie"
            height={300}
          />
        </div>

        {/* Tipo de Cliente */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
            Tipo de Cliente
          </h2>
          <Chart
  {...chartCommon}
  options={{
    labels: Object.keys(stats.clientTypeCounts),
    legend: { position: "bottom" },
    title: { text: "Clientes", align: "left" },
  }}
  series={Object.values(stats.clientTypeCounts)}
  type="pie"
  height={300}
/>

        </div>

        {/* Top Productos */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow lg:col-span-2">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
            Top Productos
          </h2>
          <Chart
            {...chartCommon}
            options={{
              xaxis: { categories: stats.topProducts.map((p) => p.name) },
              title: { text: "Cantidad", align: "left" }
            }}
            series={[{ name: "Cant.", data: stats.topProducts.map((p) => p.qty) }]}
            type="bar"
            height={300}
          />
        </div>
      </div>

      {/* Gráficas adicionales */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        {/* Estado de Pedidos */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
            Estado de Pedidos
          </h2>
          <Chart
            {...chartCommon}
            options={{
              labels: Object.keys(stats.statusCounts),
              legend: { position: "bottom" },
              title: { text: "Por Estado", align: "left" }
            }}
            series={Object.values(stats.statusCounts)}
            type="pie"
            height={300}
          />
        </div>

        {/* Histograma Duración */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
            Duración de Alquiler
          </h2>
          <Chart
            {...chartCommon}
            options={{
              xaxis: { categories: Object.keys(stats.durationBins) },
              title: { text: "Distribución Días", align: "left" }
            }}
            series={[{ name: "Pedidos", data: Object.values(stats.durationBins) }]}
            type="bar"
            height={300}
          />
        </div>

        {/* Top Clientes */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
            Top Clientes
          </h2>
          <Chart
            {...chartCommon}
            options={{
              xaxis: { categories: stats.topClients.map((c) => c.name) },
              title: { text: "Facturación", align: "left" }
            }}
            series={[{ name: "MXN", data: stats.topClients.map((c) => c.rev) }]}
            type="bar"
            height={300}
          />
        </div>
      </div>
    </div>
  );
};

export default PedidosGeneralesDashboard;
