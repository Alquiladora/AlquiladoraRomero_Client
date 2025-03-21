import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTasks,
  faFilter,
  faSearch,
  faFileExport,
  faFileInvoice,
  faMapMarkerAlt,
  faEye,
  faChevronLeft,
  faChevronRight,
  faCalendarAlt,
  faTruck,
  faUser,
  faPhone,
  faClock,
  faCreditCard,
  faDollarSign,
  faCheckCircle,
  faBoxOpen,
  faUndo,
  faExclamationTriangle,
  faExclamationCircle,
  faTimes,
  faBan,
  faQuestionCircle,
  faPlus,
  faMinus,
  faTicketAlt,
  faChartBar,
  faMoneyBillWave,
  faUsers,
  faBox,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import TicketCompra from "./Ticket";
import api from "../../../utils/AxiosConfig";
import { useAuth } from "../../../hooks/ContextAuth";

const GestionPedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterEstado, setFilterEstado] = useState("Todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [showTimelineModal, setShowTimelineModal] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(null);
  const [showTicketModal, setShowTicketModal] = useState(null);
  const [showMoreTimeline, setShowMoreTimeline] = useState(false);
  const { csrfToken } = useAuth();
  const ordersPerPage = 10;

  const estadosDisponibles = [
    "Todos",
    "Confirmado",
    "En alquiler",
    "Entregado",
    "Devuelto",
    "Incompleto",
    "Incidente",
    "Perdido",
    "Finalizado",
    "Cancelado",
  ];

  const estadoTimeline = {
    Confirmado: ["Confirmado"],
    "En alquiler": ["Confirmado", "En alquiler"],
    Entregado: ["Confirmado", "En alquiler", "Entregado"],
    Devuelto: ["Confirmado", "En alquiler", "Entregado", "Devuelto"],
    Finalizado: ["Confirmado", "En alquiler", "Entregado", "Devuelto", "Finalizado"],
    Incompleto: ["Confirmado", "Incompleto"],
    Incidente: ["Confirmado", "Incidente"],
    Perdido: ["Confirmado", "Perdido"],
    Cancelado: ["Confirmado", "Cancelado"],
  };

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
          const transformedPedidos = result.data.map((pedido) => {
            const timeline = estadoTimeline[pedido.estado] || [pedido.estado];
            const historialEstados = timeline.map((estado, index) => ({
              estado,
              fecha: new Date(pedido.fechas.registro).toLocaleString("es-MX", {
                day: "2-digit",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              }),
              descripcion: `Pedido ${estado.toLowerCase()} ${index === 0 ? "registrado en el sistema" : "actualizado"}`,
            }));
            return { ...pedido, historialEstados };
          });
          setPedidos(transformedPedidos);
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

  const filteredPedidos = pedidos
    .filter((pedido) => {
      if (filterEstado === "Todos") return true;
      return pedido.estado === filterEstado;
    })
    .filter((pedido) => {
      const search = searchTerm.toLowerCase();
      return (
        pedido.idRastreo.toLowerCase().includes(search) ||
        (pedido.cliente.nombre?.toLowerCase().includes(search) || "") ||
        (pedido.cliente.direccion?.toLowerCase().includes(search) || "")
      );
    })
    .filter((pedido) => {
      if (!dateRange.start || !dateRange.end) return true;
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);
      const pedidoDate = new Date(pedido.fechas.inicio);
      return pedidoDate >= startDate && pedidoDate <= endDate;
    });

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentPedidos = filteredPedidos.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredPedidos.length / ordersPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const handleGenerateReport = () => {
    toast.info("Funcionalidad de generar reporte en desarrollo");
  };

  const handleExportCSV = () => {
    toast.info("Funcionalidad de exportar a CSV en desarrollo");
  };

  const handleGenerateInvoice = (pedido) => {
    toast.info(`Generando factura para el pedido ${pedido.idRastreo}... (en desarrollo)`);
  };

  const handleShowTimeline = (pedido) => {
    setShowTimelineModal(pedido);
    setShowMoreTimeline(false);
  };

  const handleShowDetails = (pedido) => {
    setShowDetailsModal(pedido);
  };

  const handleShowTicketModal = (pedido) => {
    setShowTicketModal(pedido);
  };

  const handleSendTicket = (email, pdfBlob) => {
    toast.success(`Ticket enviado al correo ${email} en formato PDF.`);
    setShowTicketModal(null);
  };

  const handleNavigateDashboard = (dashboard) => {
    toast.info(`Navegando al Dashboard de ${dashboard}... (en desarrollo)`);
  };

  const renderTimelineModal = () => {
    const visibleEvents = showMoreTimeline
      ? showTimelineModal.historialEstados
      : showTimelineModal.historialEstados.slice(0, 2);

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4 animate-fade-in">
        <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-xl shadow-2xl max-h-[80vh] overflow-y-auto relative">
          <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 dark:from-yellow-500 dark:to-yellow-700 p-4 rounded-t-xl flex justify-between items-center">
            <h2 className="text-xl font-bold text-white flex items-center">
              <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2" />
              Seguimiento del Pedido
            </h2>
            <button
              onClick={() => setShowTimelineModal(null)}
              className="text-white hover:text-red-200 transition"
            >
              <FontAwesomeIcon icon={faTimes} size="lg" />
            </button>
          </div>
          <div className="p-6 space-y-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              ID de Rastreo: {showTimelineModal.idRastreo}
            </p>
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-green-500"></div>
              {visibleEvents.map((evento, index) => (
                <div key={index} className="relative mb-6">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center z-10">
                      <FontAwesomeIcon
                        icon={
                          evento.estado === "Confirmado"
                            ? faCheckCircle
                            : evento.estado === "En alquiler"
                            ? faTruck
                            : evento.estado === "Entregado"
                            ? faBoxOpen
                            : evento.estado === "Devuelto"
                            ? faUndo
                            : evento.estado === "Incompleto"
                            ? faExclamationTriangle
                            : evento.estado === "Incidente"
                            ? faExclamationCircle
                            : evento.estado === "Perdido"
                            ? faTimes
                            : evento.estado === "Finalizado"
                            ? faCheckCircle
                            : evento.estado === "Cancelado"
                            ? faBan
                            : faQuestionCircle
                        }
                        className="text-white"
                      />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-semibold dark:text-white">{evento.estado}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{evento.fecha}</p>
                      <p className="text-sm dark:text-gray-200">{evento.descripcion}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {showTimelineModal.historialEstados.length > 2 && (
              <button
                onClick={() => setShowMoreTimeline(!showMoreTimeline)}
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center mx-auto mt-4"
              >
                <FontAwesomeIcon
                  icon={showMoreTimeline ? faMinus : faPlus}
                  className="mr-2"
                />
                {showMoreTimeline ? "Ver menos" : "Ver más detalles"}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderDetailsModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 w-full max-w-3xl rounded-xl shadow-2xl max-h-[80vh] overflow-y-auto relative">
        <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 dark:from-yellow-500 dark:to-yellow-700 p-4 rounded-t-xl flex justify-between items-center">
          <h2 className="text-xl font-bold text-white flex items-center">
            <FontAwesomeIcon icon={faEye} className="mr-2" />
            Detalles del Pedido
          </h2>
          <button
            onClick={() => setShowDetailsModal(null)}
            className="text-white hover:text-red-200 transition"
          >
            <FontAwesomeIcon icon={faTimes} size="lg" />
          </button>
        </div>
        <div className="p-6 space-y-6">
          {showDetailsModal && (
            <>
              <div className="border-b dark:border-gray-700 pb-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                      <FontAwesomeIcon icon={faTruck} className="mr-2 text-yellow-500" />
                      ID Rastreo
                    </p>
                    <p className="text-lg font-semibold dark:text-white">
                      {showDetailsModal.idRastreo}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                      <FontAwesomeIcon icon={faCheckCircle} className="mr-2 text-yellow-500" />
                      Estado
                    </p>
                    <p
                      className={`text-lg font-semibold ${
                        showDetailsModal.estado === "Confirmado"
                          ? "text-green-600 dark:text-green-400"
                          : showDetailsModal.estado === "En alquiler"
                          ? "text-blue-600 dark:text-blue-400"
                          : showDetailsModal.estado === "Entregado"
                          ? "text-teal-600 dark:text-teal-400"
                          : showDetailsModal.estado === "Devuelto"
                          ? "text-gray-600 dark:text-gray-400"
                          : showDetailsModal.estado === "Incompleto"
                          ? "text-yellow-600 dark:text-yellow-400"
                          : showDetailsModal.estado === "Incidente"
                          ? "text-red-600 dark:text-red-400"
                          : showDetailsModal.estado === "Perdido"
                          ? "text-red-600 dark:text-red-400"
                          : showDetailsModal.estado === "Finalizado"
                          ? "text-purple-600 dark:text-purple-400"
                          : showDetailsModal.estado === "Cancelado"
                          ? "text-black dark:text-gray-300"
                          : ""
                      }`}
                    >
                      {showDetailsModal.estado}
                    </p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                    <FontAwesomeIcon icon={faUser} className="mr-2 text-yellow-500" />
                    Cliente
                  </p>
                  <p className="font-semibold dark:text-white">
                    {showDetailsModal.cliente.nombre || "No especificado"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                    <FontAwesomeIcon icon={faPhone} className="mr-2 text-yellow-500" />
                    Teléfono
                  </p>
                  <p className="font-semibold dark:text-white">
                    {showDetailsModal.cliente.telefono || "No especificado"}
                  </p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                    <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2 text-yellow-500" />
                    Dirección
                  </p>
                  <p className="font-semibold dark:text-white">
                    {showDetailsModal.cliente.direccion || "No especificado"}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-t dark:border-gray-700 pt-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                    <FontAwesomeIcon icon={faCalendarAlt} className="mr-2 text-yellow-500" />
                    Fecha Inicio
                  </p>
                  <p className="font-semibold dark:text-white">
                    {new Date(showDetailsModal.fechas.inicio).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                    <FontAwesomeIcon icon={faCalendarAlt} className="mr-2 text-yellow-500" />
                    Fecha Entrega
                  </p>
                  <p className="font-semibold dark:text-white">
                    {new Date(showDetailsModal.fechas.entrega).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                    <FontAwesomeIcon icon={faClock} className="mr-2 text-yellow-500" />
                    Días de Alquiler
                  </p>
                  <p className="font-semibold dark:text-white">
                    {showDetailsModal.fechas.diasAlquiler}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                    <FontAwesomeIcon icon={faCalendarAlt} className="mr-2 text-yellow-500" />
                    Fecha de Registro
                  </p>
                  <p className="font-semibold dark:text-white">
                    {new Date(showDetailsModal.fechas.registro).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-t dark:border-gray-700 pt-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                    <FontAwesomeIcon icon={faCreditCard} className="mr-2 text-yellow-500" />
                    Forma de Pago
                  </p>
                  <p className="font-semibold dark:text-white">
                    {showDetailsModal.pago.formaPago}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                    <FontAwesomeIcon icon={faDollarSign} className="mr-2 text-yellow-500" />
                    Total
                  </p>
                  <p className="font-semibold text-lg dark:text-white">
                    ${showDetailsModal.pago.total}
                  </p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                    <FontAwesomeIcon icon={faBox} className="mr-2 text-yellow-500" />
                    Detalles de Pago
                  </p>
                  <p className="font-semibold dark:text-white">
                    {showDetailsModal.pago.detalles || "Sin detalles adicionales"}
                  </p>
                </div>
              </div>
              <div className="border-t dark:border-gray-700 pt-4">
                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center mb-2">
                  <FontAwesomeIcon icon={faBoxOpen} className="mr-2 text-yellow-500" />
                  Productos
                </p>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-gray-50 dark:bg-gray-700 rounded">
                    <thead>
                      <tr className="bg-gray-200 dark:bg-gray-600">
                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-200">
                          Cantidad
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-200">
                          Nombre
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-200">
                          Color
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-200">
                          Precio Unitario
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-200">
                          Subtotal
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {showDetailsModal.productos.map((producto, index) => (
                        <tr key={index} className="border-b dark:border-gray-600">
                          <td className="px-4 py-2 text-sm dark:text-gray-200">
                            {producto.cantidad}
                          </td>
                          <td className="px-4 py-2 text-sm dark:text-gray-200">
                            {producto.nombre}
                          </td>
                          <td className="px-4 py-2 text-sm dark:text-gray-200">
                            {producto.color}
                          </td>
                          <td className="px-4 py-2 text-sm dark:text-gray-200">
                            ${producto.precioUnitario}
                          </td>
                          <td className="px-4 py-2 text-sm dark:text-gray-200">
                            ${producto.subtotal}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen dark:bg-gray-900 dark:text-white">
      <div className="flex justify-end space-x-2 mb-4">
        <button
          onClick={handleGenerateReport}
          className="flex items-center px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition dark:bg-blue-600 dark:hover:bg-blue-700"
        >
          <FontAwesomeIcon icon={faFileExport} className="mr-2" />
          <span className="hidden sm:inline">Generar Reporte</span>
          <span className="sm:hidden">Reporte</span>
        </button>
        <button
          onClick={handleExportCSV}
          className="flex items-center px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition dark:bg-green-600 dark:hover:bg-green-700"
        >
          <FontAwesomeIcon icon={faFileExport} className="mr-2" />
          <span className="hidden sm:inline">Exportar CSV</span>
          <span className="sm:hidden">CSV</span>
        </button>
      </div>

      <h2 className="text-2xl font-bold mb-6 dark:text-white flex items-center justify-center">
        <FontAwesomeIcon icon={faTasks} className="mr-3 text-yellow-500" />
        Gestión de Pedidos
      </h2>

      {loading ? (
        <div className="text-center">Cargando pedidos...</div>
      ) : (
        <>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <div className="flex items-center space-x-2 w-full sm:w-auto">
                  <FontAwesomeIcon icon={faFilter} className="text-yellow-500" />
                  <select
                    value={filterEstado}
                    onChange={(e) => {
                      setFilterEstado(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 w-full sm:w-40"
                  >
                    {estadosDisponibles.map((estado) => (
                      <option key={estado} value={estado}>
                        {estado}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center space-x-2 w-full sm:w-auto">
                  <FontAwesomeIcon icon={faSearch} className="text-yellow-500" />
                  <input
                    type="text"
                    placeholder="Buscar por ID, cliente o dirección..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 w-full sm:w-64"
                  />
                </div>
                <div className="flex items-center space comentários-x-2 w-full sm:w-auto">
                  <FontAwesomeIcon icon={faCalendarAlt} className="text-yellow-500" />
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) =>
                      setDateRange({ ...dateRange, start: e.target.value })
                    }
                    className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 w-full sm:w-36"
                  />
                  <span className="text-gray-500 dark:text-gray-400">-</span>
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) =>
                      setDateRange({ ...dateRange, end: e.target.value })
                    }
                    className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 w-full sm:w-36"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg shadow-md">
            <table className="min-w-full bg-white dark:bg-gray-800">
              <thead className="bg-[#fcb900]">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-tight text-white">
                    <FontAwesomeIcon icon={faTruck} className="mr-1" />
                    <span className="hidden sm:inline">ID Rastreo</span>
                    <span className="sm:hidden">ID</span>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-tight text-white">
                    <FontAwesomeIcon icon={faUser} className="mr-1" />
                    Cliente
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-tight text-white hidden sm:table-cell">
                    <FontAwesomeIcon icon={faPhone} className="mr-1" />
                    Teléfono
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-tight text-white hidden md:table-cell">
                    <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-1" />
                    Dirección
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-tight text-white hidden sm:table-cell">
                    <FontAwesomeIcon icon={faClock} className="mr-1" />
                    Días
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-tight text-white hidden md:table-cell">
                    <FontAwesomeIcon icon={faCreditCard} className="mr-1" />
                    Pago
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-tight text-white">
                    <FontAwesomeIcon icon={faDollarSign} className="mr-1" />
                    Total
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-tight text-white">
                    <FontAwesomeIcon icon={faCheckCircle} className="mr-1" />
                    Estado
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-tight text-white">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentPedidos.map((pedido, index) => (
                  <tr
                    key={pedido.idPedido}
                    className={`border-b dark:border-gray-700 transition-all duration-200 ${
                      index % 2 === 0
                        ? "bg-gray-50 dark:bg-gray-900"
                        : "bg-white dark:bg-gray-800"
                    } hover:bg-gray-100 dark:hover:bg-gray-700`}
                  >
                    <td className="px-4 py-3 text-sm font-medium dark:text-gray-200">
                      {pedido.idRastreo}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium dark:text-gray-200">
                      {pedido.cliente.nombre || "No especificado"}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium dark:text-gray-200 hidden sm:table-cell">
                      {pedido.cliente.telefono || "N/A"}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium dark:text-gray-200 hidden md:table-cell">
                      {pedido.cliente.direccion?.slice(0, 20) || "N/A"}...
                    </td>
                    <td className="px-4 py-3 text-sm font-medium dark:text-gray-200 hidden sm:table-cell">
                      {pedido.fechas.diasAlquiler}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium dark:text-gray-200 hidden md:table-cell">
                      {pedido.pago.formaPago}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium dark:text-gray-200">
                      <span className="text-green-600 dark:text-green-400">
                        ${pedido.pago.total}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm dark:text-gray-200">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold shadow-sm ${
                          pedido.estado === "Confirmado"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                            : pedido.estado === "En alquiler"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                            : pedido.estado === "Entregado"
                            ? "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300"
                            : pedido.estado === "Devuelto"
                            ? "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
                            : pedido.estado === "Incompleto"
                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                            : pedido.estado === "Incidente"
                            ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                            : pedido.estado === "Perdido"
                            ? "bg-red-200 text-red-800 dark:bg-red-800 dark:text-red-300"
                            : pedido.estado === "Finalizado"
                            ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
                            : pedido.estado === "Cancelado"
                            ? "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                            : ""
                        }`}
                      >
                        <FontAwesomeIcon
                          icon={
                            pedido.estado === "Confirmado"
                              ? faCheckCircle
                              : pedido.estado === "En alquiler"
                              ? faTruck
                              : pedido.estado === "Entregado"
                              ? faBoxOpen
                              : pedido.estado === "Devuelto"
                              ? faUndo
                              : pedido.estado === "Incompleto"
                              ? faExclamationTriangle
                              : pedido.estado === "Incidente"
                              ? faExclamationCircle
                              : pedido.estado === "Perdido"
                              ? faTimes
                              : pedido.estado === "Finalizado"
                              ? faCheckCircle
                              : pedido.estado === "Cancelado"
                              ? faBan
                              : faQuestionCircle
                          }
                          className="mr-1"
                        />
                        {pedido.estado}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm flex space-x-2">
                      <button
                        onClick={() => handleShowDetails(pedido)}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-all duration-200 p-2 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900"
                        title="Ver Detalles"
                      >
                        <FontAwesomeIcon icon={faEye} size="lg" />
                      </button>
                      <button
                        onClick={() => handleShowTimeline(pedido)}
                        className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 transition-all duration-200 p-2 rounded-full hover:bg-green-100 dark:hover:bg-green-900"
                        title="Ver Localización"
                      >
                        <FontAwesomeIcon icon={faMapMarkerAlt} size="lg" />
                      </button>
                   
                      <button
                        onClick={() => handleShowTicketModal(pedido)}
                        className="text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-300 transition-all duration-200 p-2 rounded-full hover:bg-orange-100 dark:hover:bg-orange-900"
                        title="Generar Ticket"
                      >
                        <FontAwesomeIcon icon={faTicketAlt} size="lg" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-4">
            <p className="text-sm dark:text-gray-300">
              Mostrando {indexOfFirstOrder + 1} -{" "}
              {Math.min(indexOfLastOrder, filteredPedidos.length)} de{" "}
              {filteredPedidos.length} pedidos
            </p>
            <div className="flex space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded ${
                  currentPage === 1
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-600"
                    : "bg-yellow-500 text-white hover:bg-yellow-600 dark:bg-yellow-500 dark:hover:bg-yellow-600"
                }`}
              >
                <FontAwesomeIcon icon={faChevronLeft} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-1 rounded ${
                    currentPage === page
                      ? "bg-yellow-600 text-white dark:bg-yellow-600"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded ${
                  currentPage === totalPages
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-600"
                    : "bg-yellow-500 text-white hover:bg-yellow-600 dark:bg-yellow-500 dark:hover:bg-yellow-600"
                }`}
              >
                <FontAwesomeIcon icon={faChevronRight} />
              </button>
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={() => handleNavigateDashboard("Pedidos")}
              className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition dark:bg-blue-600 dark:hover:bg-blue-700"
            >
              <FontAwesomeIcon icon={faChartBar} className="mr-2" />
              Ver Dashboard de Pedidos
            </button>
            <button
              onClick={() => handleNavigateDashboard("Ganancias")}
              className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition dark:bg-green-600 dark:hover:bg-green-700"
            >
              <FontAwesomeIcon icon={faMoneyBillWave} className="mr-2" />
              Ver Dashboard de Ganancias
            </button>
            <button
              onClick={() => handleNavigateDashboard("Clientes")}
              className="flex items-center px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition dark:bg-purple-600 dark:hover:bg-purple-700"
            >
              <FontAwesomeIcon icon={faUsers} className="mr-2" />
              Ver Dashboard de Clientes
            </button>
            <button
              onClick={() => handleNavigateDashboard("Productos")}
              className="flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition dark:bg-orange-600 dark:hover:bg-orange-700"
            >
              <FontAwesomeIcon icon={faBox} className="mr-2" />
              Ver Dashboard de Productos
            </button>
          </div>

          {showTimelineModal && renderTimelineModal()}
          {showDetailsModal && renderDetailsModal()}
          {showTicketModal && (
            <TicketCompra
              pedido={showTicketModal}
              onClose={() => setShowTicketModal(null)}
              onSend={handleSendTicket}
            />
          )}
        </>
      )}
    </div>
  );
};

export default GestionPedidos;