import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { format, isSameDay, startOfMonth, endOfMonth, isBefore, addYears } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTruck,
  faUser,
  faPhone,
  faMapMarkerAlt,
  faClock,
  faCreditCard,
  faDollarSign,
  faCheckCircle,
  faEye,
  faBox,
  faTimes,
  faCalendarAlt,
  faHourglassStart,
  faBoxOpen,
  faClipboardCheck,
  faShippingFast,
  faUndo,
  faExclamationTriangle,
  faExclamationCircle,
  faBan,
  faQuestionCircle
} from "@fortawesome/free-solid-svg-icons";
import api from "../../../utils/AxiosConfig";
import { useAuth } from "../../../hooks/ContextAuth";
import { toast } from "react-toastify";
import "./CalendarCustom.css";

function PedidosCalendario({ onNavigate }) {
  const { csrfToken } = useAuth();
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    return toZonedTime(now, "America/Mexico_City");
  });
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [viewMode, setViewMode] = useState("day");
  const [currentPage, setCurrentPage] = useState(1);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const ordersPerPage = 5;

  const currentDateMexico = toZonedTime(new Date(), "America/Mexico_City");
  const minDate = currentDateMexico;
  const maxDate = addYears(currentDateMexico, 1);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get("/api/pedidos/pedidos-manuales", {
        withCredentials: true,
        headers: { "X-CSRF-Token": csrfToken },
      });
      if (response.data.success) {
        setOrders(response.data.data);
        filterOrdersByDate(selectedDate, viewMode);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Error al cargar los pedidos");
    }
  };

  const filterOrdersByDate = (date, mode) => {
    let filtered = [];
    if (mode === "day") {
      filtered = orders.filter((order) =>
        isSameDay(new Date(order.fechas.entrega), date)
      );
    } else if (mode === "month") {
      const start = startOfMonth(date);
      const end = endOfMonth(date);
      filtered = orders.filter((order) => {
        const entregaDate = new Date(order.fechas.entrega);
        return entregaDate >= start && entregaDate <= end;
      });
    }
    setFilteredOrders(filtered);
    setCurrentPage(1);
  };

  const handleDateChange = (date) => {
    const zonedDate = toZonedTime(date, "America/Mexico_City");
    setSelectedDate(zonedDate);
    filterOrdersByDate(zonedDate, viewMode);
  };

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    filterOrdersByDate(selectedDate, mode);
  };

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setShowTicketModal(true);
  };

  const tileContent = ({ date, view }) => {
    if (view === "month") {
      const hasOrders = orders.some((order) =>
        isSameDay(new Date(order.fechas.entrega), date)
      );
      return hasOrders ? (
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
    return isBefore(zonedDate, currentDateMexico); 
  }
  return false;
};


  const renderTicketModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 w-full max-w-3xl rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto relative">
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 dark:from-yellow-500 dark:to-yellow-700 p-4 rounded-t-xl flex justify-between items-center">
          <h2 className="text-xl font-bold text-white flex items-center">
            <FontAwesomeIcon icon={faClipboardCheck} className="mr-2" />
            Ticket del Pedido
          </h2>
          <button
            onClick={() => setShowTicketModal(false)}
            className="text-white hover:text-red-200 transition"
          >
            <FontAwesomeIcon icon={faTimes} size="lg" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {selectedOrder && (
            <>
              {/* Order Summary */}
              <div className="border-b dark:border-gray-700 pb-4">
                <div className="flex justify-between items-center flex-wrap gap-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                      <FontAwesomeIcon
                        icon={faTruck}
                        className="mr-2 text-yellow-500"
                      />
                      ID Rastreo
                    </p>
                    <p className="text-lg font-semibold dark:text-white break-all">
                      {selectedOrder.idRastreo}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                      <FontAwesomeIcon
                        icon={faCheckCircle}
                        className="mr-2 text-yellow-500"
                      />
                      Estado
                    </p>
                    <p
                      className={`text-lg font-semibold flex items-center gap-2 ${
                        selectedOrder.estado === "Confirmado"
                          ? "text-green-600 dark:text-green-400"
                          : selectedOrder.estado === "Pendiente"
                          ? "text-yellow-600 dark:text-yellow-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {selectedOrder.estado}
                      {selectedOrder.estado === "En alquiler" && (
                        <FontAwesomeIcon
                          icon={faShippingFast}
                          className="text-blue-600 dark:text-blue-400"
                        />
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Customer Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                    <FontAwesomeIcon
                      icon={faUser}
                      className="mr-2 text-yellow-500"
                    />
                    Cliente
                  </p>
                  <p className="font-semibold dark:text-white">
                    {selectedOrder.cliente.nombre}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                    <FontAwesomeIcon
                      icon={faPhone}
                      className="mr-2 text-yellow-500"
                    />
                    Teléfono
                  </p>
                  <p className="font-semibold dark:text-white">
                    {selectedOrder.cliente.telefono}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                    <FontAwesomeIcon
                      icon={faMapMarkerAlt}
                      className="mr-2 text-yellow-500"
                    />
                    Dirección
                  </p>
                  <p className="font-semibold dark:text-white break-words">
                    {selectedOrder.cliente.direccion || "Cliente sin dirección"}
                  </p>
                </div>
              </div>

              {/* Dates and Times */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t dark:border-gray-700 pt-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                    <FontAwesomeIcon
                      icon={faCalendarAlt}
                      className="mr-2 text-yellow-500"
                    />
                    Fecha Inicio
                  </p>
                  <p className="font-semibold dark:text-white">
                    {new Date(selectedOrder.fechas.inicio).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                    <FontAwesomeIcon
                      icon={faCalendarAlt}
                      className="mr-2 text-yellow-500"
                    />
                    Fecha Entrega
                  </p>
                  <p className="font-semibold dark:text-white">
                    {new Date(selectedOrder.fechas.entrega).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                    <FontAwesomeIcon
                      icon={faClock}
                      className="mr-2 text-yellow-500"
                    />
                    Hora Alquiler
                  </p>
                  <p className="font-semibold dark:text-white">
                    {selectedOrder.fechas.horaAlquiler}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                    <FontAwesomeIcon
                      icon={faClock}
                      className="mr-2 text-yellow-500"
                    />
                    Días de Alquiler
                  </p>
                  <p className="font-semibold dark:text-white">
                    {selectedOrder.fechas.diasAlquiler}
                  </p>
                </div>
              </div>

              {/* Products */}
              <div className="border-t dark:border-gray-700 pt-4">
                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center mb-2">
                  <FontAwesomeIcon
                    icon={faBox}
                    className="mr-2 text-yellow-500"
                  />
                  Productos
                </p>
                <ul className="list-disc list-inside dark:text-white space-y-1">
                  {selectedOrder.productos.map((producto, index) => (
                    <li key={index} className="text-sm">
                      {producto.nombre} - {producto.cantidad} ({producto.color}) - ${producto.precioUnitario} c/u - Subtotal: ${producto.subtotal}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Payment */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t dark:border-gray-700 pt-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                    <FontAwesomeIcon
                      icon={faCreditCard}
                      className="mr-2 text-yellow-500"
                    />
                    Forma de Pago
                  </p>
                  <p className="font-semibold dark:text-white">
                    {selectedOrder.pago.formaPago || "No especificado"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                    <FontAwesomeIcon
                      icon={faDollarSign}
                      className="mr-2 text-yellow-500"
                    />
                    Total
                  </p>
                  <p className="font-semibold text-lg dark:text-white">
                    ${selectedOrder.pago.total}
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
          Pedidos Activos por Fecha
        </h1>
      </div>

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
              className="border-none rounded-xl dark:bg-gray-800 dark:text-white w-full calendar-smaller"
              tileClassName={({ date, view }) =>
                view === "month" &&
                orders.some((order) =>
                  isSameDay(new Date(order.fechas.entrega), date)
                )
                  ? "relative bg-yellow-100 dark:bg-yellow-700 rounded-full"
                  : ""
              }
            />
          </div>

          <div className="mt-6 flex justify-center space-x-4">
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

        {/* Orders Table */}
        <div className="w-full lg:w-2/3 bg-white dark:bg-gray-800 shadow-xl p-6 sm:p-8 overflow-x-auto transition-all duration-300">
          <h2 className="text-xl sm:text-2xl font-semibold mb-6 flex items-center text-gray-800 dark:text-white">
            <FontAwesomeIcon icon={faTruck} className="mr-3 text-yellow-500" />
            Pedidos para{" "}
            {viewMode === "day"
              ? format(selectedDate, "dd/MM/yyyy")
              : format(selectedDate, "MMMM yyyy")}
          </h2>
          {filteredOrders.length === 0 ? (
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
                  {currentOrders.map((order, index) => (
                    <tr
                      key={order.idPedido}
                      className={`border-b dark:border-gray-700 transition-all duration-300 ${
                        index % 2 === 0
                          ? "bg-gray-50 dark:bg-gray-900"
                          : "bg-white dark:bg-gray-800"
                      } hover:bg-gray-100 dark:hover:bg-gray-700`}
                    >
                      <td className="px-4 sm:px-6 py-4 text-sm font-medium dark:text-gray-200">
                        {order.idRastreo}
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-sm font-medium dark:text-gray-200">
                        {order.cliente.nombre}
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-sm font-medium dark:text-gray-200">
                        {order.cliente.telefono}
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-sm font-medium dark:text-gray-200">
                        {order.cliente.direccion
                          ? order.cliente.direccion.slice(0, 30)
                          : "Sin dirección"}
                        ...
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-sm font-medium dark:text-gray-200">
                        {order.fechas.diasAlquiler}
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-sm font-medium dark:text-gray-200">
                        {order.pago.formaPago}
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-sm font-medium dark:text-gray-200">
                        <span className="text-green-600 dark:text-green-400">
                          ${order.pago.total}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-sm dark:text-gray-200">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${
                            order.estado === "Procesando"
                              ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
                              : order.estado === "Enviando"
                              ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300"
                              : order.estado === "Confirmado"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                              : order.estado === "En alquiler"
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                              : order.estado === "Entregado"
                              ? "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300"
                              : order.estado === "Devuelto"
                              ? "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
                              : order.estado === "Incompleto"
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                              : order.estado === "Incidente"
                              ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                              : order.estado === "Finalizado"
                              ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
                              : order.estado === "Cancelado"
                              ? "bg-gray-200 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
                          }`}
                        >
                          <FontAwesomeIcon
                            icon={
                              order.estado === "Procesando"
                                ? faHourglassStart
                                : order.estado === "Enviando"
                                ? faShippingFast
                                : order.estado === "Confirmado"
                                ? faCheckCircle
                                : order.estado === "En alquiler"
                                ? faTruck
                                : order.estado === "Entregado"
                                ? faBoxOpen
                                : order.estado === "Devuelto"
                                ? faUndo
                                : order.estado === "Incompleto"
                                ? faExclamationTriangle
                                : order.estado === "Incidente"
                                ? faExclamationCircle
                                : order.estado === "Finalizado"
                                ? faCheckCircle
                                : order.estado === "Cancelado"
                                ? faBan
                                : faQuestionCircle
                            }
                            className="mr-1"
                          />
                          {order.estado}
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
                  {Math.min(indexOfLastOrder, filteredOrders.length)} de{" "}
                  {filteredOrders.length} pedidos
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

      {/* Render the modal when showTicketModal is true */}
      {showTicketModal && renderTicketModal()}
    </div>
  );
}

export default PedidosCalendario;
