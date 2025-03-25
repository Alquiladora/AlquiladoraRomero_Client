import React, { useState, useEffect } from "react";
import Chart from "react-apexcharts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartBar, faChartLine, faUsers, faUserPlus, faUserMinus, faTable, faClock, faDollarSign,
  faList, faMoneyBillWave, faShoppingCart
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import api from "../../../utils/AxiosConfig";
import { useAuth } from "../../../hooks/ContextAuth";

const PedidosGeneralesDashboard = () => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedStatus, setSelectedStatus] = useState("Todos");
  const [clientData, setClientData] = useState([]);
  const [clientTypesData, setClientTypesData] = useState({ newClients: 0, existingClients: 0, nonClients: 0 });
  const [statusData, setStatusData] = useState({});
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [averageOrderValue, setAverageOrderValue] = useState(0);
  const { csrfToken } = useAuth();

  const estadosDisponibles = [
    "Todos", "Procesando", "Enviando", "Confirmado", "En alquiler", "Entregado",
    "Devuelto", "Incompleto", "Incidente", "Cancelado", "Finalizado"
  ];

  // Fetch pedidos data
  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        setLoading(true);
        const response = await api.get("/api/pedidos/pedidos-general", {
          headers: { "X-CSRF-Token": csrfToken },
          withCredentials: true,
        });
        const result = response.data;

        if (result.success) {
          setPedidos(result.data);
          processClientData(result.data);
          processStatusData(result.data);
          calculateSummaryMetrics(result.data);
        } else {
          toast.error("Error al cargar los pedidos");
        }
      } catch (error) {
        toast.error("Error de conexión al servidor");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchPedidos();
  }, []);

  // Process client data for top clients and client types
  const processClientData = (pedidosData) => {
    const clientsMap = {};
    let newClients = 0, existingClients = 0, nonClients = 0;

    pedidosData.forEach((pedido) => {
      const clientName = pedido.cliente?.nombre || "Desconocido";
      const clientType = pedido.cliente?.tipo || "non-client";

      if (clientsMap[clientName]) {
        clientsMap[clientName].orders += 1;
      } else {
        clientsMap[clientName] = { orders: 1, type: clientType };
      }

      if (clientType === "new") newClients++;
      else if (clientType === "existing") existingClients++;
      else nonClients++;
    });

    const topClients = Object.entries(clientsMap)
      .map(([name, data]) => ({ name, orders: data.orders }))
      .sort((a, b) => b.orders - a.orders)
      .slice(0, 5);

    setClientData(topClients);
    setClientTypesData({ newClients, existingClients, nonClients });
  };

  // Process pedidos by status
  const processStatusData = (pedidosData) => {
    const statusCounts = {};
    estadosDisponibles.forEach((status) => {
      if (status !== "Todos") {
        statusCounts[status] = pedidosData.filter((pedido) => pedido.estado === status).length;
      }
    });
    setStatusData(statusCounts);
  };

  // Calculate summary metrics
  const calculateSummaryMetrics = (pedidosData) => {
    // Ensure total is a number by converting each pedido.pago.total to a number with a fallback of 0
    const total = pedidosData.reduce((sum, pedido) => {
      const amount = Number(pedido.pago?.total) || 0; // Convert to number, default to 0 if invalid
      return sum + amount;
    }, 0);

    // Ensure totalRevenue is a number
    setTotalRevenue(isNaN(total) ? 0 : total);

    // Calculate average order value
    const avg = pedidosData.length > 0 ? total / pedidosData.length : 0;
    setAverageOrderValue(isNaN(avg) ? 0 : avg);
  };

  // Monthly Orders Chart Data
  const getMonthlyOrders = (year, status) => {
    const monthlyData = Array(12).fill(0);
    pedidos.forEach((pedido) => {
      const date = new Date(pedido.fechas.inicio);
      if (date.getFullYear() === year && (status === "Todos" || pedido.estado === status)) {
        monthlyData[date.getMonth()]++;
      }
    });
    return monthlyData;
  };

  const monthlyChartOptions = {
    chart: { type: "bar", height: 350, toolbar: { show: true } },
    xaxis: {
      categories: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"],
      labels: { style: { colors: "#616161", fontSize: "12px", fontFamily: "inherit" } },
    },
    yaxis: { labels: { style: { colors: "#616161", fontSize: "12px", fontFamily: "inherit" } } },
    colors: ["#f59e0b"],
    title: { text: `Pedidos por Mes en ${selectedYear} (${selectedStatus})`, style: { color: "#1f2937" } },
    dataLabels: { enabled: false },
    grid: { borderColor: "#dddddd", strokeDashArray: 5 },
    tooltip: { theme: "dark" },
  };

  const monthlyChartSeries = [{ name: "Pedidos", data: getMonthlyOrders(selectedYear, selectedStatus) }];

  // Market Analysis Prediction (1 to 5 Years)
  const predictFutureOrders = () => {
    const yearlyOrders = {};
    pedidos.forEach((pedido) => {
      const year = new Date(pedido.fechas.inicio).getFullYear();
      yearlyOrders[year] = (yearlyOrders[year] || 0) + 1;
    });

    const years = Object.keys(yearlyOrders).map(Number).sort();
    const orders = years.map((year) => yearlyOrders[year]);

    const n = years.length;
    const sumX = years.reduce((a, b) => a + b, 0);
    const sumY = orders.reduce((a, b) => a + b, 0);
    const sumXY = years.reduce((a, b, i) => a + b * orders[i], 0);
    const sumXX = years.reduce((a, b) => a + b * b, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    const futureYears = Array.from({ length: 5 }, (_, i) => years[years.length - 1] + i + 1);
    const predictedOrders = futureYears.map((year) => Math.round(slope * year + intercept));

    return { years: [...years, ...futureYears], orders: [...orders, ...predictedOrders] };
  };

  const predictionData = predictFutureOrders();
  const predictionChartOptions = {
    chart: { type: "line", height: 350, toolbar: { show: true } },
    xaxis: {
      categories: predictionData.years,
      labels: { style: { colors: "#616161", fontSize: "12px", fontFamily: "inherit" } },
    },
    yaxis: { labels: { style: { colors: "#616161", fontSize: "12px", fontFamily: "inherit" } } },
    colors: ["#f59e0b"],
    title: { text: "Predicción de Pedidos (1-5 Años)", style: { color: "#1f2937" } },
    stroke: { curve: "smooth" },
    markers: { size: 5 },
    grid: { borderColor: "#dddddd", strokeDashArray: 5 },
    tooltip: { theme: "dark" },
  };

  const predictionChartSeries = [{ name: "Pedidos", data: predictionData.orders }];

  // Top Clients Chart
  const topClientsChartOptions = {
    chart: { type: "bar", height: 350, toolbar: { show: true } },
    xaxis: {
      categories: clientData.map((client) => client.name),
      labels: { style: { colors: "#616161", fontSize: "12px", fontFamily: "inherit" } },
    },
    yaxis: { labels: { style: { colors: "#616161", fontSize: "12px", fontFamily: "inherit" } } },
    colors: ["#f59e0b"],
    title: { text: `Top Clientes por Pedidos en ${selectedYear}`, style: { color: "#1f2937" } },
    dataLabels: { enabled: false },
    grid: { borderColor: "#dddddd", strokeDashArray: 5 },
    tooltip: { theme: "dark" },
  };

  const topClientsChartSeries = [{ name: "Pedidos", data: clientData.map((client) => client.orders) }];

  // Client Types Comparison Chart
  const clientTypesChartOptions = {
    chart: { type: "pie", height: 350, toolbar: { show: true } },
    labels: ["Clientes Nuevos", "Clientes Existentes", "No Clientes"],
    colors: ["#f59e0b", "#10b981", "#ef4444"],
    title: { text: "Comparación de Tipos de Clientes", style: { color: "#1f2937" } },
    dataLabels: { enabled: true },
    legend: { position: "bottom" },
    tooltip: { theme: "dark" },
  };

  const clientTypesChartSeries = [
    clientTypesData.newClients,
    clientTypesData.existingClients,
    clientTypesData.nonClients,
  ];

  // Pedidos by Status Chart
  const statusChartOptions = {
    chart: { type: "bar", height: 350, toolbar: { show: true } },
    xaxis: {
      categories: Object.keys(statusData),
      labels: { style: { colors: "#616161", fontSize: "12px", fontFamily: "inherit" } },
    },
    yaxis: { labels: { style: { colors: "#616161", fontSize: "12px", fontFamily: "inherit" } } },
    colors: ["#f59e0b"],
    title: { text: "Pedidos por Estado", style: { color: "#1f2937" } },
    dataLabels: { enabled: false },
    grid: { borderColor: "#dddddd", strokeDashArray: 5 },
    tooltip: { theme: "dark" },
  };

  const statusChartSeries = [{ name: "Pedidos", data: Object.values(statusData) }];

  // Scatter Chart for Order Distribution
  const scatterChartOptions = {
    chart: { type: "scatter", height: 350, toolbar: { show: true } },
    xaxis: {
      type: "datetime",
      labels: { style: { colors: "#616161", fontSize: "12px", fontFamily: "inherit" } },
    },
    yaxis: {
      title: { text: "Monto Total ($)" },
      labels: { style: { colors: "#616161", fontSize: "12px", fontFamily: "inherit" } },
    },
    colors: ["#f59e0b"],
    title: { text: "Distribución de Pedidos por Fecha y Monto", style: { color: "#1f2937" } },
    grid: { borderColor: "#dddddd", strokeDashArray: 5 },
    tooltip: { theme: "dark" },
  };

  const scatterChartSeries = [
    {
      name: "Pedidos",
      data: pedidos.map((pedido) => ({
        x: new Date(pedido.fechas.inicio).getTime(),
        y: pedido.pago?.total || 0, // Ensure y-value is a number
      })),
    },
  ];

  // Timeline of Orders
  const getTimelineData = () => {
    return pedidos.slice(0, 5).map((pedido) => ({
      date: new Date(pedido.fechas.inicio).toLocaleDateString(),
      description: `Pedido #${pedido.idRastreo} - ${pedido.cliente?.nombre || "Desconocido"}`,
    }));
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen  dark:bg-gray-900 dark:text-white">
      <h1 className="text-2xl sm:text-3xl font-extrabold mb-8 text-gray-800 dark:text-white flex items-center">
        <FontAwesomeIcon icon={faChartBar} className="mr-3 text-yellow-500" />
        Dashboard de Análisis de Pedidos
      </h1>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="space-y-12">
          {/* Summary Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl flex items-center space-x-4 hover:shadow-2xl transition-shadow duration-300">
              <FontAwesomeIcon icon={faShoppingCart} className="text-4xl text-yellow-500" />
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Total Pedidos</h3>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{pedidos.length}</p>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl flex items-center space-x-4 hover:shadow-2xl transition-shadow duration-300">
              <FontAwesomeIcon icon={faMoneyBillWave} className="text-4xl text-yellow-500" />
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Ingresos Totales</h3>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  ${Number(totalRevenue).toFixed(2)}
                </p>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl flex items-center space-x-4 hover:shadow-2xl transition-shadow duration-300">
              <FontAwesomeIcon icon={faDollarSign} className="text-4xl text-yellow-500" />
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Valor Promedio por Pedido</h3>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  ${Number(averageOrderValue).toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* Monthly Orders Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-4 sm:space-y-0">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center">
                <FontAwesomeIcon icon={faChartBar} className="mr-3 text-yellow-500" />
                Pedidos por Mes
              </h2>
              <div className="flex space-x-4">
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
                >
                  {[...new Set(pedidos.map((p) => new Date(p.fechas.inicio).getFullYear()))].map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
                >
                  {estadosDisponibles.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <Chart options={monthlyChartOptions} series={monthlyChartSeries} type="bar" height={350} />
          </div>

          {/* Pedidos by Status */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6 flex items-center">
              <FontAwesomeIcon icon={faList} className="mr-3 text-yellow-500" />
              Pedidos por Estado
            </h2>
            <Chart options={statusChartOptions} series={statusChartSeries} type="bar" height={350} />
            <table className="min-w-full mt-6">
              <thead className="bg-yellow-500 text-white">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Estado</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Número de Pedidos</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(statusData).map(([status, count], index) => (
                  <tr
                    key={status}
                    className={`border-b dark:border-gray-700 ${
                      index % 2 === 0 ? "bg-gray-50 dark:bg-gray-900" : "bg-white dark:bg-gray-800"
                    } hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200`}
                  >
                    <td className="px-6 py-4 text-sm dark:text-gray-200">{status}</td>
                    <td className="px-6 py-4 text-sm dark:text-gray-200">{count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Market Analysis Prediction */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6 flex items-center">
              <FontAwesomeIcon icon={faChartLine} className="mr-3 text-yellow-500" />
              Predicción de Pedidos (1-5 Años)
            </h2>
            <Chart options={predictionChartOptions} series={predictionChartSeries} type="line" height={350} />
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              La predicción se basa en un modelo de regresión lineal simple utilizando datos históricos. Se espera un crecimiento constante si las condiciones del mercado permanecen similares.
            </p>
          </div>

          {/* Top Clients by Orders */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6 flex items-center">
              <FontAwesomeIcon icon={faUsers} className="mr-3 text-yellow-500" />
              Top Clientes por Pedidos
            </h2>
            <Chart options={topClientsChartOptions} series={topClientsChartSeries} type="bar" height={350} />
            <table className="min-w-full mt-6">
              <thead className="bg-yellow-500 text-white">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Cliente</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Número de Pedidos</th>
                </tr>
              </thead>
              <tbody>
                {clientData.map((client, index) => (
                  <tr
                    key={client.name}
                    className={`border-b dark:border-gray-700 ${
                      index % 2 === 0 ? "bg-gray-50 dark:bg-gray-900" : "bg-white dark:bg-gray-800"
                    } hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200`}
                  >
                    <td className="px-6 py-4 text-sm dark:text-gray-200">{client.name}</td>
                    <td className="px-6 py-4 text-sm dark:text-gray-200">{client.orders}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Client Types Comparison */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6 flex items-center">
              <FontAwesomeIcon icon={faUserPlus} className="mr-3 text-yellow-500" />
              Comparación de Tipos de Clientes
            </h2>
            <Chart options={clientTypesChartOptions} series={clientTypesChartSeries} type="pie" height={350} />
          </div>

          {/* Scatter Chart for Order Distribution */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6 flex items-center">
              <FontAwesomeIcon icon={faDollarSign} className="mr-3 text-yellow-500" />
              Distribución de Pedidos por Fecha y Monto
            </h2>
            <Chart options={scatterChartOptions} series={scatterChartSeries} type="scatter" height={350} />
          </div>

          {/* Timeline of Recent Orders */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6 flex items-center">
              <FontAwesomeIcon icon={faClock} className="mr-3 text-yellow-500" />
              Línea de Tiempo de Pedidos Recientes
            </h2>
            <ol className="relative border-l border-gray-200 dark:border-gray-700">
              {getTimelineData().map((item, index) => (
                <li key={index} className="mb-10 ml-6">
                  <span className="absolute flex items-center justify-center w-6 h-6 bg-yellow-100 rounded-full -left-3 ring-8 ring-white dark:ring-gray-900 dark:bg-yellow-700">
                    <FontAwesomeIcon icon={faTable} className="text-yellow-500" />
                  </span>
                  <h3 className="flex items-center mb-1 text-lg font-semibold text-gray-900 dark:text-white">
                    {item.date}
                  </h3>
                  <p className="mb-4 text-base font-normal text-gray-500 dark:text-gray-400">
                    {item.description}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </div>
  );
};

export default PedidosGeneralesDashboard;