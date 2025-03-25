import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTasks, faFilter, faSearch, faFileExport, faFileInvoice, faMapMarkerAlt, faEye,
  faChevronLeft, faChevronRight, faCalendarAlt, faTruck, faUser, faPhone, faClock,
  faCreditCard, faDollarSign, faCheckCircle, faBoxOpen, faUndo, faExclamationTriangle,
  faExclamationCircle, faTimes, faBan, faQuestionCircle, faPlus, faMinus, faTicketAlt,
  faChartBar, faMoneyBillWave, faUsers, faBox,faCalendar
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import TicketCompra from "./Ticket";
import api from "../../../utils/AxiosConfig";
import { useAuth } from "../../../hooks/ContextAuth";

const GestionPedidos = ({ onNavigate}) => {
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
    "Todos", "Procesando", "Enviando", "Confirmado", "En alquiler", "Entregado",
    "Devuelto", "Incompleto", "Incidente", "Cancelado", "Finalizado"
  ];

  const estadoTimeline = {
    Procesando: ["Procesando"],
    Enviando: ["Procesando", "Enviando"],
    Confirmado: ["Procesando", "Confirmado"],
    "En alquiler": ["Procesando", "Confirmado", "En alquiler"],
    Entregado: ["Procesando", "Confirmado", "En alquiler", "Entregado"],
    Devuelto: ["Procesando", "Confirmado", "En alquiler", "Entregado", "Devuelto"],
    Finalizado: ["Procesando", "Confirmado", "En alquiler", "Entregado", "Devuelto", "Finalizado"],
    Incompleto: ["Procesando", "Incompleto"],
    Incidente: ["Procesando", "Incidente"],
    Cancelado: ["Procesando", "Cancelado"],
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
                day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
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
    .filter((pedido) => filterEstado === "Todos" || pedido.estado === filterEstado)
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

  const handleGenerateReport = () => toast.info("Funcionalidad de generar reporte en desarrollo");
  const handleExportCSV = () => toast.info("Funcionalidad de exportar a CSV en desarrollo");
  const handleGenerateInvoice = (pedido) => toast.info(`Generando factura para el pedido ${pedido.idRastreo}... (en desarrollo)`);
  const handleShowTimeline = (pedido) => { setShowTimelineModal(pedido); setShowMoreTimeline(false); };
  const handleShowDetails = (pedido) => setShowDetailsModal(pedido);
  const handleShowTicketModal = (pedido) => setShowTicketModal(pedido);
  const handleSendTicket = (email, pdfBlob) => {
    toast.success(`Ticket enviado al correo ${email} en formato PDF.`);
    setShowTicketModal(null);
  };
  const handleNavigateDashboard = (dashboard) => toast.info(`Navegando al Dashboard de ${dashboard}... (en desarrollo)`);

  const renderTimelineModal = () => {
    const visibleEvents = showMoreTimeline ? showTimelineModal.historialEstados : showTimelineModal.historialEstados.slice(0, 2);

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 p-4 animate-fade-in">
        <div className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-2xl shadow-2xl max-h-[80vh] overflow-y-auto transform transition-all duration-300 scale-95">
          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 p-5 rounded-t-2xl flex justify-between items-center">
            <h2 className="text-xl font-bold text-white flex items-center">
              <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-3" />
              Seguimiento del Pedido
            </h2>
            <button onClick={() => setShowTimelineModal(null)} className="text-white hover:text-red-300 transition">
              <FontAwesomeIcon icon={faTimes} size="lg" />
            </button>
          </div>
          <div className="p-6 space-y-5">
            <p className="text-sm text-gray-600 dark:text-gray-300">ID de Rastreo: <span className="font-semibold">{showTimelineModal.idRastreo}</span></p>
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-green-500 to-teal-500 rounded-full"></div>
              {visibleEvents.map((evento, index) => (
                <div key={index} className="relative mb-6">
                  <div className="flex items-start">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center z-10 shadow-md">
                      <FontAwesomeIcon
                        icon={
                          evento.estado === "Procesando" ? faClock :
                          evento.estado === "Enviando" ? faTruck :
                          evento.estado === "Confirmado" ? faCheckCircle :
                          evento.estado === "En alquiler" ? faTruck :
                          evento.estado === "Entregado" ? faBoxOpen :
                          evento.estado === "Devuelto" ? faUndo :
                          evento.estado === "Incompleto" ? faExclamationTriangle :
                          evento.estado === "Incidente" ? faExclamationCircle :
                          evento.estado === "Cancelado" ? faBan :
                          evento.estado === "Finalizado" ? faCheckCircle : faQuestionCircle
                        }
                        className="text-white"
                      />
                    </div>
                    <div className="ml-6">
                      <p className="text-md font-semibold text-gray-800 dark:text-gray-100">{evento.estado}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{evento.fecha}</p>
                      <p className="text-sm text-gray-700 dark:text-gray-200">{evento.descripcion}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {showTimelineModal.historialEstados.length > 2 && (
              <button
                onClick={() => setShowMoreTimeline(!showMoreTimeline)}
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center mx-auto mt-4 transition-all duration-200"
              >
                <FontAwesomeIcon icon={showMoreTimeline ? faMinus : faPlus} className="mr-2" />
                {showMoreTimeline ? "Ver menos" : "Ver más detalles"}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderDetailsModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 p-4 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 w-full max-w-4xl rounded-2xl shadow-2xl max-h-[80vh] overflow-y-auto transform transition-all duration-300 scale-95">
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 p-5 rounded-t-2xl flex justify-between items-center">
          <h2 className="text-xl font-bold text-white flex items-center">
            <FontAwesomeIcon icon={faEye} className="mr-3" />
            Detalles del Pedido
          </h2>
          <button onClick={() => setShowDetailsModal(null)} className="text-white hover:text-red-300 transition">
            <FontAwesomeIcon icon={faTimes} size="lg" />
          </button>
        </div>
        <div className="p-6 space-y-6">
          {showDetailsModal && (
            <>
              <div className="border-b dark:border-gray-700 pb-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center">
                      <FontAwesomeIcon icon={faTruck} className="mr-2 text-yellow-500" />
                      ID Rastreo
                    </p>
                    <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">{showDetailsModal.idRastreo}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center">
                      <FontAwesomeIcon icon={faCheckCircle} className="mr-2 text-yellow-500" />
                      Estado
                    </p>
                    <p className={`text-lg font-semibold ${showDetailsModal.estado === "Procesando" ? "text-yellow-600 dark:text-yellow-400" :
                      showDetailsModal.estado === "Enviando" ? "text-blue-600 dark:text-blue-400" :
                      showDetailsModal.estado === "Confirmado" ? "text-green-600 dark:text-green-400" :
                      showDetailsModal.estado === "En alquiler" ? "text-blue-600 dark:text-blue-400" :
                      showDetailsModal.estado === "Entregado" ? "text-teal-600 dark:text-teal-400" :
                      showDetailsModal.estado === "Devuelto" ? "text-gray-600 dark:text-gray-400" :
                      showDetailsModal.estado === "Incompleto" ? "text-yellow-600 dark:text-yellow-400" :
                      showDetailsModal.estado === "Incidente" ? "text-red-600 dark:text-red-400" :
                      showDetailsModal.estado === "Cancelado" ? "text-black dark:text-gray-300" :
                      showDetailsModal.estado === "Finalizado" ? "text-purple-600 dark:text-purple-400" : ""}`}>
                      {showDetailsModal.estado}
                    </p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center">
                    <FontAwesomeIcon icon={faUser} className="mr-2 text-yellow-500" />
                    Cliente
                  </p>
                  <p className="font-semibold text-gray-800 dark:text-gray-100">{showDetailsModal.cliente.nombre || "No especificado"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center">
                    <FontAwesomeIcon icon={faPhone} className="mr-2 text-yellow-500" />
                    Teléfono
                  </p>
                  <p className="font-semibold text-gray-800 dark:text-gray-100">{showDetailsModal.cliente.telefono || "No especificado"}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center">
                    <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2 text-yellow-500" />
                    Dirección
                  </p>
                  <p className="font-semibold text-gray-800 dark:text-gray-100">{showDetailsModal.cliente.direccion || "No especificado"}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-t dark:border-gray-700 pt-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center">
                    <FontAwesomeIcon icon={faCalendarAlt} className="mr-2 text-yellow-500" />
                    Fecha Inicio
                  </p>
                  <p className="font-semibold text-gray-800 dark:text-gray-100">{new Date(showDetailsModal.fechas.inicio).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center">
                    <FontAwesomeIcon icon={faCalendarAlt} className="mr-2 text-yellow-500" />
                    Fecha Entrega
                  </p>
                  <p className="font-semibold text-gray-800 dark:text-gray-100">{new Date(showDetailsModal.fechas.entrega).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center">
                    <FontAwesomeIcon icon={faClock} className="mr-2 text-yellow-500" />
                    Días de Alquiler
                  </p>
                  <p className="font-semibold text-gray-800 dark:text-gray-100">{showDetailsModal.fechas.diasAlquiler}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center">
                    <FontAwesomeIcon icon={faCalendarAlt} className="mr-2 text-yellow-500" />
                    Fecha de Registro
                  </p>
                  <p className="font-semibold text-gray-800 dark:text-gray-100">{new Date(showDetailsModal.fechas.registro).toLocaleString()}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-t dark:border-gray-700 pt-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center">
                    <FontAwesomeIcon icon={faCreditCard} className="mr-2 text-yellow-500" />
                    Forma de Pago
                  </p>
                  <p className="font-semibold text-gray-800 dark:text-gray-100">{showDetailsModal.pago.formaPago}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center">
                    <FontAwesomeIcon icon={faDollarSign} className="mr-2 text-yellow-500" />
                    Total
                  </p>
                  <p className="font-semibold text-lg text-gray-800 dark:text-gray-100">${showDetailsModal.pago.total}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center">
                    <FontAwesomeIcon icon={faBox} className="mr-2 text-yellow-500" />
                    Detalles de Pago
                  </p>
                  <p className="font-semibold text-gray-800 dark:text-gray-100">{showDetailsModal.pago.detalles || "Sin detalles adicionales"}</p>
                </div>
              </div>
              <div className="border-t dark:border-gray-700 pt-4">
                <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center mb-2">
                  <FontAwesomeIcon icon={faBoxOpen} className="mr-2 text-yellow-500" />
                  Productos
                </p>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-gray-50 dark:bg-gray-700 rounded-lg shadow-sm">
                    <thead>
                      <tr className="bg-gray-200 dark:bg-gray-600">
                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-200">Cantidad</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-200">Nombre</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-200">Color</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-200">Precio Unitario</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-200">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {showDetailsModal.productos.map((producto, index) => (
                        <tr key={index} className="border-b dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600">
                          <td className="px-4 py-2 text-sm text-gray-800 dark:text-gray-200">{producto.cantidad}</td>
                          <td className="px-4 py-2 text-sm text-gray-800 dark:text-gray-200">{producto.nombre}</td>
                          <td className="px-4 py-2 text-sm text-gray-800 dark:text-gray-200">{producto.color}</td>
                          <td className="px-4 py-2 text-sm text-gray-800 dark:text-gray-200">${producto.precioUnitario}</td>
                          <td className="px-4 py-2 text-sm text-gray-800 dark:text-gray-200">${producto.subtotal}</td>
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
    <div className="min-h-screen  dark:from-gray-900 dark:to-gray-800 p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-end space-x-2 mb-4">

          <button
            onClick={() => onNavigate("Pedidos General Calendario")}
            className="flex items-center px-3 py-1.5 text-sm bg-teal-500 text-white rounded-md hover:bg-teal-600 transition-all duration-200 dark:bg-teal-600 dark:hover:bg-teal-700"
          >
            <FontAwesomeIcon icon={faCalendar} className="mr-1" />
            <span className="hidden sm:inline">Pedidos Organizado</span>

          </button>

          {/* Botón para Generar Reporte */}
          <button
            onClick={handleGenerateReport}
            className="flex items-center px-3 py-1.5 text-sm bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-md shadow-sm hover:from-blue-700 hover:to-blue-800 transition-all duration-200"
          >
            <FontAwesomeIcon icon={faFileExport} className="mr-1" />
            <span className="hidden sm:inline">Reporte</span>
            <span className="sm:hidden">R</span>
          </button>

          {/* Botón para Exportar CSV */}
          <button
            onClick={handleExportCSV}
            className="flex items-center px-3 py-1.5 text-sm bg-gradient-to-r from-green-600 to-green-700 text-white rounded-md shadow-sm hover:from-green-700 hover:to-green-800 transition-all duration-200"
          >
            <FontAwesomeIcon icon={faFileExport} className="mr-1" />
            <span className="hidden sm:inline">CSV</span>
            <span className="sm:hidden">C</span>
          </button>
        </div>


        <h2 className="text-3xl font-extrabold text-gray-800 dark:text-gray-100 mb-8 flex items-center justify-center">
          <FontAwesomeIcon icon={faTasks} className="mr-3 text-yellow-500" />
          Gestión de Pedidos
        </h2>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl ">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                  <div className="flex items-center space-x-3 w-full sm:w-auto">
                    <FontAwesomeIcon icon={faFilter} className="text-yellow-500" />
                    <select
                      value={filterEstado}
                      onChange={(e) => { setFilterEstado(e.target.value); setCurrentPage(1); }}
                      className="p-2 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 w-full sm:w-40 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all duration-200"
                    >
                      {estadosDisponibles.map((estado) => (
                        <option key={estado} value={estado}>{estado}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center space-x-3 w-full sm:w-auto">
                    <FontAwesomeIcon icon={faSearch} className="text-yellow-500" />
                    <input
                      type="text"
                      placeholder="Buscar por ID, cliente o dirección..."
                      value={searchTerm}
                      onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                      className="p-2 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all duration-200"
                    />
                  </div>
                  <div className="flex items-center space-x-3 w-full sm:w-auto">
                    <FontAwesomeIcon icon={faCalendarAlt} className="text-yellow-500" />
                    <input
                      type="date"
                      value={dateRange.start}
                      onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                      className="p-2 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 w-full sm:w-36 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all duration-200"
                    />
                    <span className="text-gray-500 dark:text-gray-400">-</span>
                    <input
                      type="date"
                      value={dateRange.end}
                      onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                      className="p-2 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 w-full sm:w-36 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all duration-200"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl shadow-lg">
              <table className="min-w-full bg-white dark:bg-gray-800">
                <thead className="bg-gradient-to-r from-yellow-500 to-yellow-600">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-tight text-white">
                      <FontAwesomeIcon icon={faTruck} className="mr-1" /> <span className="hidden sm:inline">ID Rastreo</span><span className="sm:hidden">ID</span>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-tight text-white">
                      <FontAwesomeIcon icon={faUser} className="mr-1" /> Cliente
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-tight text-white hidden sm:table-cell">
                      <FontAwesomeIcon icon={faPhone} className="mr-1" /> Teléfono
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-tight text-white hidden md:table-cell">
                      <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-1" /> Dirección
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-tight text-white hidden sm:table-cell">
                      <FontAwesomeIcon icon={faClock} className="mr-1" /> Días
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-tight text-white hidden md:table-cell">
                      <FontAwesomeIcon icon={faCreditCard} className="mr-1" /> Pago
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-tight text-white">
                      <FontAwesomeIcon icon={faDollarSign} className="mr-1" /> Total
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-tight text-white">
                      <FontAwesomeIcon icon={faCheckCircle} className="mr-1" /> Estado
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-tight text-white">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentPedidos.map((pedido, index) => (
                    <tr key={pedido.idPedido} className={`border-b dark:border-gray-700 transition-all duration-200 ${index % 2 === 0 ? "bg-gray-50 dark:bg-gray-900" : "bg-white dark:bg-gray-800"} hover:bg-gray-100 dark:hover:bg-gray-700`}>
                      <td className="px-4 py-3 text-sm font-medium text-gray-800 dark:text-gray-200">{pedido.idRastreo}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-800 dark:text-gray-200">{pedido.cliente.nombre || "No especificado"}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-800 dark:text-gray-200 hidden sm:table-cell">{pedido.cliente.telefono || "N/A"}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-800 dark:text-gray-200 hidden md:table-cell">{pedido.cliente.direccion?.slice(0, 20) || "N/A"}...</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-800 dark:text-gray-200 hidden sm:table-cell">{pedido.fechas.diasAlquiler}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-800 dark:text-gray-200 hidden md:table-cell">{pedido.pago.formaPago}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-800 dark:text-gray-200"><span className="text-green-600 dark:text-green-400">${pedido.pago.total}</span></td>
                      <td className="px-4 py-3 text-sm text-gray-800 dark:text-gray-200">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold shadow-sm ${
                          pedido.estado === "Procesando" ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300" :
                          pedido.estado === "Enviando" ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300" :
                          pedido.estado === "Confirmado" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" :
                          pedido.estado === "En alquiler" ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300" :
                          pedido.estado === "Entregado" ? "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300" :
                          pedido.estado === "Devuelto" ? "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300" :
                          pedido.estado === "Incompleto" ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300" :
                          pedido.estado === "Incidente" ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300" :
                          pedido.estado === "Cancelado" ? "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300" :
                          pedido.estado === "Finalizado" ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300" : ""}`}>
                          <FontAwesomeIcon
                            icon={
                              pedido.estado === "Procesando" ? faClock :
                              pedido.estado === "Enviando" ? faTruck :
                              pedido.estado === "Confirmado" ? faCheckCircle :
                              pedido.estado === "En alquiler" ? faTruck :
                              pedido.estado === "Entregado" ? faBoxOpen :
                              pedido.estado === "Devuelto" ? faUndo :
                              pedido.estado === "Incompleto" ? faExclamationTriangle :
                              pedido.estado === "Incidente" ? faExclamationCircle :
                              pedido.estado === "Cancelado" ? faBan :
                              pedido.estado === "Finalizado" ? faCheckCircle : faQuestionCircle
                            }
                            className="mr-1"
                          />
                          {pedido.estado}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm flex space-x-3">
                        <button onClick={() => handleShowDetails(pedido)} className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-all duration-200 p-2 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900" title="Ver Detalles">
                          <FontAwesomeIcon icon={faEye} size="lg" />
                        </button>
                        <button onClick={() => handleShowTimeline(pedido)} className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 transition-all duration-200 p-2 rounded-full hover:bg-green-100 dark:hover:bg-green-900" title="Ver Localización">
                          <FontAwesomeIcon icon={faMapMarkerAlt} size="lg" />
                        </button>
                        <button onClick={() => handleShowTicketModal(pedido)} className="text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-300 transition-all duration-200 p-2 rounded-full hover:bg-orange-100 dark:hover:bg-orange-900" title="Generar Ticket">
                          <FontAwesomeIcon icon={faTicketAlt} size="lg" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Mostrando {indexOfFirstOrder + 1} - {Math.min(indexOfLastOrder, filteredPedidos.length)} de {filteredPedidos.length} pedidos
              </p>
              <div className="flex space-x-2">
                <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className={`px-3 py-1 rounded-lg ${currentPage === 1 ? "bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-600" : "bg-yellow-500 text-white hover:bg-yellow-600 dark:hover:bg-yellow-600 transition-all duration-200"}`}>
                  <FontAwesomeIcon icon={faChevronLeft} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button key={page} onClick={() => handlePageChange(page)} className={`px-3 py-1 rounded-lg ${currentPage === page ? "bg-yellow-600 text-white dark:bg-yellow-600" : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-all duration-200"}`}>
                    {page}
                  </button>
                ))}
                <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className={`px-3 py-1 rounded-lg ${currentPage === totalPages ? "bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-600" : "bg-yellow-500 text-white hover:bg-yellow-600 dark:hover:bg-yellow-600 transition-all duration-200"}`}>
                  <FontAwesomeIcon icon={faChevronRight} />
                </button>
              </div>
            </div>

              <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3">
                <button
                 onClick={() => onNavigate("Pedidos General Dashboard")}
                  className="flex items-center px-3 py-1.5 text-sm bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-md shadow-sm hover:from-blue-700 hover:to-blue-800 transition-all duration-200"
                >
                  <FontAwesomeIcon icon={faChartBar} className="mr-1" />
                  <span className="hidden sm:inline">Dashboard Pedidos</span>
                  <span className="sm:hidden">Pedidos</span>
                </button>

                <button
                  onClick={() => handleNavigateDashboard("Ganancias")}
                  className="flex items-center px-3 py-1.5 text-sm bg-gradient-to-r from-green-600 to-green-700 text-white rounded-md shadow-sm hover:from-green-700 hover:to-green-800 transition-all duration-200"
                >
                  <FontAwesomeIcon icon={faMoneyBillWave} className="mr-1" />
                  <span className="hidden sm:inline">Dashboard Ganancias</span>
                  <span className="sm:hidden">Ganancias</span>
                </button>

                <button
                  onClick={() => handleNavigateDashboard("Clientes")}
                  className="flex items-center px-3 py-1.5 text-sm bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-md shadow-sm hover:from-purple-700 hover:to-purple-800 transition-all duration-200"
                >
                  <FontAwesomeIcon icon={faUsers} className="mr-1" />
                  <span className="hidden sm:inline">Dashboard Clientes</span>
                  <span className="sm:hidden">Clientes</span>
                </button>

                <button
                   onClick={() => onNavigate("Dasboard Productos")}
                  className="flex items-center px-3 py-1.5 text-sm bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-md shadow-sm hover:from-orange-700 hover:to-orange-800 transition-all duration-200"
                >
                  <FontAwesomeIcon icon={faBox} className="mr-1" />
                  <span className="hidden sm:inline">Dashboard Productos</span>
                  <span className="sm:hidden">Productos</span>
                </button>
              </div>

            {showTimelineModal && renderTimelineModal()}
            {showDetailsModal && renderDetailsModal()}
            {showTicketModal && <TicketCompra pedido={showTicketModal} onClose={() => setShowTicketModal(null)} onSend={handleSendTicket} />}
          </>
        )}
      </div>
    </div>
  );
};

export default GestionPedidos;