import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { format, isSameDay, startOfMonth, endOfMonth, isBefore, isAfter } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTruck, faUser, faPhone, faMapMarkerAlt, faClock, faCreditCard, faDollarSign,
  faCheckCircle, faBan, faExclamationCircle, faExclamationTriangle, faTimes,
  faBoxOpen, faUndo, faQuestionCircle, faCalendarAlt, faBox, faClipboardCheck,
  faHourglassStart, faShippingFast, faEye
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import api from "../../../utils/AxiosConfig";
import { useAuth } from "../../../hooks/ContextAuth";
import "./CalendarCustom.css";

const CalendarioGeneralPedidos = ({ onNavigate }) => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [viewMode, setViewMode] = useState("day");
  const [currentPage, setCurrentPage] = useState(1);
  const [showDetailsModal, setShowDetailsModal] = useState(null);
  const [minDate, setMinDate] = useState(null);
  const [maxDate, setMaxDate] = useState(null);
  const [monthPedidosCount, setMonthPedidosCount] = useState(0);
  const { csrfToken } = useAuth();
  const ordersPerPage = 5;

  const estadosDisponibles = [
    "Procesando", "Enviando", "Confirmado", "En alquiler", "Entregado",
    "Devuelto", "Incompleto", "Incidente", "Cancelado", "Finalizado"
  ];

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
          const pedidosData = result.data;
          setPedidos(pedidosData);

          if (pedidosData.length > 0) {
         
            const dates = pedidosData.map(p => new Date(p.fechas.inicio));
            const earliestDate = new Date(Math.min(...dates));
            const latestDate = new Date(Math.max(...dates));

            setMinDate(toZonedTime(earliestDate, "America/Mexico_City"));
            setMaxDate(toZonedTime(latestDate, "America/Mexico_City"));
            setSelectedDate(toZonedTime(earliestDate, "America/Mexico_City"));
          }
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

  useEffect(() => {
    if (selectedDate) {
      filterPedidosByDate(selectedDate, viewMode);
      // Calculate the number of pedidos in the current month
      const monthStart = startOfMonth(selectedDate);
      const monthEnd = endOfMonth(selectedDate);
      const count = pedidos.filter(pedido => {
        const pedidoDate = new Date(pedido.fechas.inicio);
        return pedidoDate >= monthStart && pedidoDate <= monthEnd;
      }).length;
      setMonthPedidosCount(count);
    }
  }, [selectedDate, pedidos, viewMode]);

  const filterPedidosByDate = (date, mode) => {
    let filtered = [];
    if (mode === "day") {
      filtered = pedidos.filter((pedido) =>
        isSameDay(new Date(pedido.fechas.inicio), date)
      );
    } else if (mode === "month") {
      const start = startOfMonth(date);
      const end = endOfMonth(date);
      filtered = pedidos.filter((pedido) => {
        const inicioDate = new Date(pedido.fechas.inicio);
        return inicioDate >= start && inicioDate <= end;
      });
    }
    setFilteredPedidos(filtered);
    setCurrentPage(1);
  };

  const [filteredPedidos, setFilteredPedidos] = useState([]);

  const handleDateChange = (date) => {
    const zonedDate = toZonedTime(date, "America/Mexico_City");
    setSelectedDate(zonedDate);
    filterPedidosByDate(zonedDate, viewMode);
  };

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    filterPedidosByDate(selectedDate, mode);
  };

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentPedidos = filteredPedidos.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredPedidos.length / ordersPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const handleViewDetails = (pedido) => {
    setShowDetailsModal(pedido);
  };

  const tileContent = ({ date, view }) => {
    if (view === "month") {
      const hasPedidos = pedidos.some((pedido) =>
        isSameDay(new Date(pedido.fechas.inicio), date)
      );
      return hasPedidos ? (
        <div className="flex justify-center">
          <FontAwesomeIcon icon={faBox} className="text-yellow-500 text-xs" />
        </div>
      ) : null;
    }
    return null;
  };

  const tileDisabled = ({ date, view }) => {
    if (view === "month") {
      const zonedDate = toZonedTime(date, "America/Mexico_City");
      return (
        (minDate && isBefore(zonedDate, startOfMonth(minDate))) ||
        (maxDate && isAfter(zonedDate, endOfMonth(maxDate)))
      );
    }
    return false;
  };

  const renderDetailsModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 w-full max-w-3xl rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto relative">
        <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 dark:from-yellow-500 dark:to-yellow-700 p-4 rounded-t-xl flex justify-between items-center">
          <h2 className="text-xl font-bold text-white flex items-center">
            <FontAwesomeIcon icon={faClipboardCheck} className="mr-2" />
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
                <div className="flex justify-between items-center">
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
                    <p className={`text-lg font-semibold ${
                      showDetailsModal.estado === "Procesando" ? "text-orange-600 dark:text-orange-400" :
                      showDetailsModal.estado === "Enviando" ? "text-indigo-600 dark:text-indigo-400" :
                      showDetailsModal.estado === "Confirmado" ? "text-green-600 dark:text-green-400" :
                      showDetailsModal.estado === "En alquiler" ? "text-blue-600 dark:text-blue-400" :
                      showDetailsModal.estado === "Entregado" ? "text-teal-600 dark:text-teal-400" :
                      showDetailsModal.estado === "Devuelto" ? "text-gray-600 dark:text-gray-400" :
                      showDetailsModal.estado === "Incompleto" ? "text-yellow-600 dark:text-yellow-400" :
                      showDetailsModal.estado === "Incidente" ? "text-red-600 dark:text-red-400" :
                      showDetailsModal.estado === "Finalizado" ? "text-purple-600 dark:text-purple-400" :
                      showDetailsModal.estado === "Cancelado" ? "text-gray-600 dark:text-gray-400" : "text-gray-600 dark:text-gray-400"
                    }`}>
                      {showDetailsModal.estado}
                    </p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    {showDetailsModal.cliente.telefono || "N/A"}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                    <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2 text-yellow-500" />
                    Dirección
                  </p>
                  <p className="font-semibold dark:text-white">
                    {showDetailsModal.cliente.direccion || "No especificado"}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t dark:border-gray-700 pt-4">
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t dark:border-gray-700 pt-4">
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
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen dark:from-gray-800 dark:to-gray-900 dark:text-white">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 space-y-4 sm:space-y-0">
        <h1 className="text-xl sm:text-3xl font-extrabold flex items-center text-gray-800 dark:text-white">
          <FontAwesomeIcon icon={faTruck} className="mr-3 text-yellow-500" />
          Todos Los Pedidos 
        </h1>
        <div className="flex space-x-4">
          <button
            onClick={() => handleViewModeChange("day")}
            className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-all duration-300 ${
              viewMode === "day"
                ? "bg-yellow-500 text-white shadow-lg"
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            Por Día
          </button>
          <button
            onClick={() => handleViewModeChange("month")}
            className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-all duration-300 ${
              viewMode === "month"
                ? "bg-yellow-500 text-white shadow-lg"
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            Por Mes
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6 mb-8">
          {/* Calendar Section */}
          <div className="w-full lg:w-1/3 bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 transition-all duration-300">
            <h2 className="text-xl sm:text-2xl font-semibold mb-6 flex items-center text-gray-800 dark:text-white">
              <FontAwesomeIcon icon={faCalendarAlt} className="mr-3 text-yellow-500" />
              Seleccionar Fecha
            </h2>
            <div className="relative">
              <Calendar
                onChange={handleDateChange}
                value={selectedDate}
                minDate={minDate}
                maxDate={maxDate}
                tileDisabled={tileDisabled}
                tileContent={tileContent}
                className="border-none rounded-xl dark:bg-gray-800 dark:text-white w-full"
                tileClassName={({ date, view }) =>
                  view === "month" &&
                  pedidos.some((pedido) =>
                    isSameDay(new Date(pedido.fechas.inicio), date)
                  )
                    ? "relative bg-yellow-100 dark:bg-yellow-700 rounded-full"
                    : ""
                }
              />
            </div>
          </div>

          {/* Pedidos Table */}
          <div className="w-full lg:w-2/3 bg-white dark:bg-gray-800 shadow-xl p-6 sm:p-8 overflow-x-auto transition-all duration-300">
            <h2 className="text-xl sm:text-2xl font-semibold mb-6 flex items-center text-gray-800 dark:text-white">
              <FontAwesomeIcon icon={faTruck} className="mr-3 text-yellow-500" />
              {selectedDate ? (
                viewMode === "day"
                  ? `Pedidos para ${format(selectedDate, "dd/MM/yyyy")}`
                  : `Este mes tienes ${monthPedidosCount} pedidos`
              ) : (
                "Selecciona una fecha"
              )}
            </h2>
            {filteredPedidos.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-6 text-lg">
                No hay pedidos para la fecha seleccionada.
              </p>
            ) : (
              <>
                <table className="min-w-full">
                  <thead className="bg-yellow-500 text-white rounded-t-xl">
                    <tr>
                      <th className="px-4 sm:px-6 py-4 text-left text-xs sm:text-sm font-semibold uppercase tracking-wider">
                        <FontAwesomeIcon icon={faTruck} className="mr-2" />
                        ID Rastreo
                      </th>
                      <th className="px-4 sm:px-6 py-4 text-left text-xs sm:text-sm font-semibold uppercase tracking-wider">
                        <FontAwesomeIcon icon={faUser} className="mr-2" />
                        Cliente
                      </th>
                      <th className="px-4 sm:px-6 py-4 text-left text-xs sm:text-sm font-semibold uppercase tracking-wider">
                        <FontAwesomeIcon icon={faPhone} className="mr-2" />
                        Teléfono
                      </th>
                      <th className="px-4 sm:px-6 py-4 text-left text-xs sm:text-sm font-semibold uppercase tracking-wider">
                        <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2" />
                        Dirección
                      </th>
                      <th className="px-4 sm:px-6 py-4 text-left text-xs sm:text-sm font-semibold uppercase tracking-wider">
                        <FontAwesomeIcon icon={faClock} className="mr-2" />
                        Días
                      </th>
                      <th className="px-4 sm:px-6 py-4 text-left text-xs sm:text-sm font-semibold uppercase tracking-wider">
                        <FontAwesomeIcon icon={faCreditCard} className="mr-2" />
                        Pago
                      </th>
                      <th className="px-4 sm:px-6 py-4 text-left text-xs sm:text-sm font-semibold uppercase tracking-wider">
                        <FontAwesomeIcon icon={faDollarSign} className="mr-2" />
                        Total
                      </th>
                      <th className="px-4 sm:px-6 py-4 text-left text-xs sm:text-sm font-semibold uppercase tracking-wider">
                        <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />
                        Estado
                      </th>
                   
                    </tr>
                  </thead>
                  <tbody>
                    {currentPedidos.map((pedido, index) => (
                      <tr
                        key={pedido.idPedido}
                        className={`border-b dark:border-gray-700 transition-all duration-300 ${
                          index % 2 === 0
                            ? "bg-gray-50 dark:bg-gray-900"
                            : "bg-white dark:bg-gray-800"
                        } hover:bg-gray-100 dark:hover:bg-gray-700`}
                      >
                        <td className="px-4 sm:px-6 py-4 text-sm font-medium dark:text-gray-200">
                          {pedido.idRastreo}
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-sm font-medium dark:text-gray-200">
                          {pedido.cliente.nombre || "No especificado"}
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-sm font-medium dark:text-gray-200">
                          {pedido.cliente.telefono || "N/A"}
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-sm font-medium dark:text-gray-200">
                          {pedido.cliente.direccion
                            ? pedido.cliente.direccion.slice(0, 30)
                            : "Sin dirección"}
                          ...
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-sm font-medium dark:text-gray-200">
                          {pedido.fechas.diasAlquiler}
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-sm font-medium dark:text-gray-200">
                          {pedido.pago.formaPago}
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-sm font-medium dark:text-gray-200">
                          <span className="text-green-600 dark:text-green-400">
                            ${pedido.pago.total}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-sm dark:text-gray-200">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${
                              pedido.estado === "Procesando"
                                ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
                                : pedido.estado === "Enviando"
                                ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300"
                                : pedido.estado === "Confirmado"
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
                                : pedido.estado === "Finalizado"
                                ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
                                : pedido.estado === "Cancelado"
                                ? "bg-gray-200 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                                : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
                            }`}
                          >
                            <FontAwesomeIcon
                              icon={
                                pedido.estado === "Procesando"
                                  ? faHourglassStart
                                  : pedido.estado === "Enviando"
                                  ? faShippingFast
                                  : pedido.estado === "Confirmado"
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
                      
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Pagination */}
                <div className="flex flex-col sm:flex-row justify-between items-center mt-6 space-y-4 sm:space-y-0">
                  <p className="text-sm dark:text-gray-300">
                    Mostrando {indexOfFirstOrder + 1} -{" "}
                    {Math.min(indexOfLastOrder, filteredPedidos.length)} de{" "}
                    {filteredPedidos.length} pedidos
                  </p>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                        currentPage === 1
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-600"
                          : "bg-yellow-500 text-white hover:bg-yellow-600 dark:bg-yellow-500 dark:hover:bg-yellow-600 shadow-md"
                      }`}
                    >
                      Anterior
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                            currentPage === page
                              ? "bg-yellow-600 text-white dark:bg-yellow-600 shadow-lg"
                              : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                          }`}
                        >
                          {page}
                        </button>
                      )
                    )}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                        currentPage === totalPages
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-600"
                          : "bg-yellow-500 text-white hover:bg-yellow-600 dark:bg-yellow-500 dark:hover:bg-yellow-600 shadow-md"
                      }`}
                    >
                      Siguiente
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {showDetailsModal && renderDetailsModal()}
    </div>
  );
};

export default CalendarioGeneralPedidos;