import React, { useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartBar,
  faDollarSign,
  faBox,
} from "@fortawesome/free-solid-svg-icons";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { classNames } from "primereact/utils";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const DashboardPedidos = ({ orders = [] }) => {
  console.log("Datos recibidos de orders", orders);

  const colors = {
    confirmado: "rgba(34, 197, 94, 0.8)",
    enalquiler: "rgba(59, 130, 246, 0.8)",
    entregado: "rgba(20, 184, 166, 0.8)",
    devuelto: "rgba(107, 114, 128, 0.8)",
    incompleto: "rgba(234, 179, 8, 0.8)",
    incidente: "rgba(239, 68, 68, 0.8)",
    perdido: "rgba(220, 38, 38, 0.8)",
    finalizado: "rgba(147, 51, 234, 0.8)",
    cancelado: "rgba(31, 41, 55, 0.8)",
  };

  const estadosCount = useMemo(() => {
    const counts = {};
    orders.forEach((order) => {
      counts[order.estado] = (counts[order.estado] || 0) + 1;
    });
    return counts;
  }, [orders]);

  const totalPorEstado = useMemo(() => {
    const totals = {};
    orders.forEach((order) => {
      const total = Number(order.pago?.total) || 0;
      totals[order.estado] = (totals[order.estado] || 0) + total;
    });
    return totals;
  }, [orders]);

  const formasPagoCount = useMemo(() => {
    const counts = {};
    orders.forEach((order) => {
      counts[order.pago?.formaPago || "Desconocido"] =
        (counts[order.pago?.formaPago || "Desconocido"] || 0) + 1;
    });
    return counts;
  }, [orders]);

  const pedidosPorTipoCliente = useMemo(() => {
    const counts = {
      "Cliente registrado": 0,
      "No cliente": 0,
      "Cliente convertido": 0,
    };
    orders.forEach((order) => {
      counts[order.cliente?.tipoCliente] = (counts[order.cliente?.tipoCliente] || 0) + 1;
    });
    return counts;
  }, [orders]);

  const ingresosGanados = useMemo(() => {
    return orders.reduce((sum, order) => {
      const estado = order.estado.toLowerCase();
      if (!["incompleto", "incidente", "perdido", "cancelado"].includes(estado)) {
        return sum + (Number(order.pago?.total) || 0);
      }
      return sum;
    }, 0);
  }, [orders]);

  const ingresosPerdidos = useMemo(() => {
    return orders.reduce((sum, order) => {
      const estado = order.estado.toLowerCase();
      if (["incompleto", "incidente", "perdido", "cancelado"].includes(estado)) {
        return sum + (Number(order.pago?.total) || 0);
      }
      return sum;
    }, 0);
  }, [orders]);

  const barData = {
    labels: Object.keys(estadosCount),
    datasets: [
      {
        label: "Cantidad de Pedidos",
        data: Object.values(estadosCount),
        backgroundColor: Object.keys(estadosCount).map(
          (estado) =>
            colors[estado.toLowerCase().replace(" ", "")] || "rgba(75, 192, 192, 0.8)"
        ),
        yAxisID: "y",
      },
      {
        label: "Ingresos ($)",
        data: Object.values(totalPorEstado),
        backgroundColor: Object.keys(estadosCount).map(
          (estado) =>
            colors[estado.toLowerCase().replace(" ", "")]?.replace("0.8", "0.5") ||
            "rgba(75, 192, 192, 0.5)"
        ),
        yAxisID: "y1",
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1000,
      easing: "easeInOutQuad",
    },
    plugins: {
      legend: {
        position: "bottom",
        labels: { color: "text-gray-800 dark:text-white" },
      },
      title: {
        display: true,
        text: "Pedidos e Ingresos por Estado swwe",
        font: { size: 18 },
        color: "text-gray-800 dark:text-white",
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "#fff",
        bodyColor: "#fff",
        callbacks: {
          label: (context) =>
            `${context.dataset.label}: ${
              context.dataset.label.includes("$")
                ? "$" + context.raw.toFixed(2)
                : context.raw
            }`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: "Cantidad", color: "text-gray-800 dark:text-white" },
        ticks: { color: "dark:text-white " },
      },
      y1: {
        beginAtZero: true,
        position: "right",
        title: { display: true, text: "Ingresos ($)", color: "dark:text-white " },
        grid: { drawOnChartArea: false },
        ticks: { color: "dark:text-white " },
      },
      x: {
        ticks: { color: "dark:text-white " },
      },
    },
  };

  const formasPagoData = {
    labels: Object.keys(formasPagoCount),
    datasets: [
      {
        label: "Formas de Pago",
        ticks: { color: " dark:text-white" },
        
        data: Object.values(formasPagoCount),
        backgroundColor: [
          "rgba(255, 99, 132, 0.8)",
          "rgba(54, 162, 235, 0.8)",
          "rgba(255, 206, 86, 0.8)",
        ],
        borderColor: "#fff",
        borderWidth: 1,
      },
    ],
  };

  const formasPagoOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1200,
      easing: "easeOutBounce",
    },
    plugins: {
      legend: {
        position: "right",
        ticks: { color: "dark:text-white" },
        labels: { color: "text-gray-800 dark:text-white" },
      },
      title: {
        display: true,
        text: "Formas de Pago ",
        font: { size: 16 },
        color: "text-gray-800 dark:text-white",
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "#fff",
        bodyColor: "#fff",
      },
    },
  };

  const tipoClienteData = {
    labels: Object.keys(pedidosPorTipoCliente),
    datasets: [
      {
        label: "Porcentaje de Pedidos",
        data: Object.values(pedidosPorTipoCliente),
        backgroundColor: [
          "rgba(34, 197, 94, 0.8)",
          "rgba(239, 68, 68, 0.8)",
          "rgba(59, 130, 246, 0.8)",
        ],
        borderColor: "#fff",
        borderWidth: 1,
      },
    ],
  };

  const tipoClienteOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1500,
      easing: "easeInOutQuart",
    },
    plugins: {
      legend: {
        position: "top",
        labels: { color: "text-gray-800 dark:text-white" },
      },
      title: {
        display: true,
        text: "Pedidos por Tipo de Cliente (%)",
        font: { size: 16 },
        color: "text-gray-800 dark:text-white",
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "#fff",
        bodyColor: "#fff",
        callbacks: {
          label: (context) => {
            const total = Object.values(pedidosPorTipoCliente).reduce((a, b) => a + b, 0);
            const percentage = ((context.raw / total) * 100).toFixed(1);
            return `${context.label}: ${percentage}% (${context.raw} pedidos)`;
          },
        },
      },
    },
  };

  const totalPedidos = orders.length || 0;

  

  return (
    <div className="p-8  min-h-screen">
      <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-10 flex items-center animate-fade-in-down">
        <FontAwesomeIcon icon={faChartBar} className="mr-4 text-yellow-500" />
        Dashboard de Pedidos Activos
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 animate-fade-in-up">
          <FontAwesomeIcon icon={faBox} className="text-yellow-500 text-3xl mr-4" />
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Pedidos Activos</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">{totalPedidos}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
          <FontAwesomeIcon icon={faDollarSign} className="text-green-500 text-3xl mr-4" />
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Ingresos Ganados</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">${ingresosGanados.toFixed(2)}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
          <FontAwesomeIcon icon={faDollarSign} className="text-red-500 text-3xl mr-4" />
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Ingresos Perdidos</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">${ingresosPerdidos.toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart (Pedidos por Tipo de Cliente) */}
        <div
          className="bg-white dark:bg-gray-800  p-3 shadow-2xl hover:shadow-2xl transition-all duration-300 animate-fade-in"
          style={{ maxHeight: "1000px" }}
        >
          <Pie data={tipoClienteData} options={tipoClienteOptions} />
        </div>

        {/* Pie Chart (Formas de Pago) */}
        <div
          className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 animate-fade-in"
          style={{ maxHeight: "500px" }}
        >
          <Pie data={formasPagoData} options={formasPagoOptions} />
        </div>

  
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 lg:col-span-2 animate-fade-in flex justify-center items-center">
          <div style={{ maxHeight: "900px", width: "70%" }}>
            <Bar data={barData} options={barOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPedidos;