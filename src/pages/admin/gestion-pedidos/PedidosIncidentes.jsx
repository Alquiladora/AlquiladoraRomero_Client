import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTasks,
  faFilter,
  faFrown,
  faImage,
  faSearch,
  faFileExport,
  faFileInvoice,
  faMapMarkerAlt,
  faEye,
  faMoneyCheckAlt,
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
  faBox,
  faCalendar,
  faUserShield,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import TicketCompra from "./Ticket";
import api from "../../../utils/AxiosConfig";
import { useAuth } from "../../../hooks/ContextAuth";
import CustomLoading from "../../../components/spiner/SpinerGlobal";

// Función para capitalizar estados
const capitalizeStatus = (status) => {
  if (!status || typeof status !== "string") return "Desconocido";
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
};

// Componente para el modal de actualización de estado
const UpdateStatusModal = ({ pedido, onClose, onUpdateStatus }) => {
  const [newStatus, setNewStatus] = useState(pedido.estado);
  const [productStatuses, setProductStatuses] = useState(
    pedido.productos.map((prod) => ({
      idProductoColores: prod.idProductoColores,
      estadoProducto: prod.estadoProducto,
    }))
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const estadosProducto = ["Disponible", "Incidente", "Incompleto"];
  const estadosCambioPedido = [
    "Seleciona un estado",
    "Enviando",
    "Recogiendo",
    "En alquiler",
    "Devuelto",
    "Cancelado",
    "Finalizado",
  ];

  const handleProductStatusChange = (idProductoColores, newEstado) => {
    setProductStatuses((prev) =>
      prev.map((prod) =>
        prod.idProductoColores === idProductoColores
          ? { ...prod, estadoProducto: newEstado }
          : prod
      )
    );
  };


const handleSubmit = async () => {
  const hasNonCompletedProducts = productStatuses.some(
    (prod) => prod.estadoProducto !== "Disponible"
  );

  // Estado original de productos
  const productosOriginales = pedido.productos.map((p) => ({
    id: p.idProductoColores,
    estadoProducto: p.estadoProducto,
  }));

  // Detectar productos cuyo estado cambió
  const productosCambiados = productStatuses.filter((prod) => {
    const original = productosOriginales.find((p) => p.id === prod.idProductoColores);
    return original && original.estadoProducto !== prod.estadoProducto;
  });

  const pedidoCambio = newStatus !== pedido.estado;

  // Productos con estado original "Incidente" o "Incompleto"
  const productosIncOInc = pedido.productos.filter(
    (p) => p.estadoProducto === "Incidente" || p.estadoProducto === "Incompleto"
  );

  // ¿Se actualizó alguno de esos productos?
  const algunoIncOIncModificado = productosIncOInc.some((prod) => {
    const actualizado = productStatuses.find((p) => p.idProductoColores === prod.idProductoColores);
    return actualizado && actualizado.estadoProducto !== prod.estadoProducto;
  });

  // ❌ Si no cambió ni el pedido ni algún producto, no permitir enviar
  if (!pedidoCambio && productosCambiados.length === 0) {
    toast.error("Debes modificar al menos el estado del pedido o el de algún producto para actualizar.");
    return;
  }

  // ❌ Cambió producto pero no cambió estado del pedido, y ya no quedan productos en incidente
  const quedanIncidentes = productStatuses.some(
    (p) =>
      (pedido.productos.find((x) => x.idProductoColores === p.idProductoColores)?.estadoProducto !==
        "Disponible") &&
      p.estadoProducto !== "Disponible"
  );

  if (productosCambiados.length > 0 && !pedidoCambio && !quedanIncidentes) {
    toast.error(
      "Has cambiado el estado de uno o más productos, pero no el estado del pedido. Actualízalo también."
    );
    return;
  }

  // ❌ Cambió pedido pero no se actualizó ningún producto en incidente/incompleto
  if (pedidoCambio && productosIncOInc.length > 0 && !algunoIncOIncModificado) {
    toast.error(
      "Has cambiado el estado del pedido, pero no actualizaste productos con incidente o incompleto."
    );
    return;
  }

  // ❌ No finalizar si hay productos que no estén disponibles
  if (newStatus === "Finalizado" && hasNonCompletedProducts) {
    toast.error(
      "No se puede finalizar el pedido: todos los productos deben estar en estado 'Disponible'."
    );
    return;
  }

  setIsSubmitting(true);
  try {
    await onUpdateStatus(pedido.idPedido, newStatus, productStatuses);

    if (newStatus === "Finalizado" || newStatus === "Cancelado") {
      toast.success("Estado actualizado y stock de productos restaurado en el inventario.");
    } else {
      toast.success("Estado actualizado correctamente.");
    }
  } catch (error) {
    toast.error("Error al actualizar el estado");
  } finally {
    setIsSubmitting(false);
  }
};



  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 space-y-6 dark:bg-gray-900">
        {/* Header */}
        <div className="flex justify-between items-center bg-gradient-to-r from-amber-400 to-orange-500 p-4 rounded-t-2xl">
          <h2 className="text-xl font-extrabold text-white flex items-center space-x-3">
            <FontAwesomeIcon icon={faTasks} />
            <span>Actualizar Estado del Pedido</span>
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:text-yellow-200 transition"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        {/* Estado del pedido actual y nuevo */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
            Estado actual del pedido:
          </label>
          <p className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-2">
            {pedido.estado}
          </p>
        </div>
        <div>
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Cambiar estado del Pedido
          </label>
          <select
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            className="p-2 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 w-full focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all duration-200"
          >
            {estadosCambioPedido.map((estado) => (
              <option key={estado} value={estado}>
                {estado}
              </option>
            ))}
          </select>
        </div>

        {/* Productos con incidente o incompleto */}
        <div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">
            Productos con Incidentes o Incompletos
          </h3>
          {pedido.productos
            .filter(
              (producto) =>
                producto.estadoProducto === "Incidente" ||
                producto.estadoProducto === "Incompleto"
            )
            .map((producto, i) => {
              const currentStatus =
                productStatuses.find(
                  (p) => p.idProductoColores === producto.idProductoColores
                )?.estadoProducto || producto.estadoProducto;

              return (
                <div
                  key={i}
                  className="flex flex-col gap-3 py-3 border-b dark:border-gray-700"
                >
                  {/* Imagen y descripción */}
                  <div className="flex items-center gap-3">
                    {producto.imagen && (
                      <img
                        src={producto.imagen}
                        alt={producto.nombre}
                        className="w-12 h-12 rounded object-cover border border-gray-300 dark:border-gray-600"
                      />
                    )}
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                      {producto.cantidad}x {producto.nombre} ({producto.color})
                    </div>
                  </div>

                  {/* Selector de estado */}
                  <div className="w-full">
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                      Estado del producto
                    </label>
                    <select
                      value={currentStatus}
                      onChange={(e) =>
                        handleProductStatusChange(
                          producto.idProductoColores,
                          e.target.value
                        )
                      }
                      className="w-full p-2 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all duration-200"
                    >
                      <option value={currentStatus}>{currentStatus}</option>
                      {currentStatus !== "Disponible" && (
                        <option value="Disponible">Disponible</option>
                      )}
                    </select>
                  </div>

                  {/* Observaciones desde backend */}
                  {producto.observaciones && (
                    <div className="w-full">
                      <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                        Observaciones
                      </label>
                      <p className="text-sm text-gray-800 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 p-2 rounded-md border border-gray-300 dark:border-gray-600 whitespace-pre-line">
                        {producto.observaciones}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
        </div>

        {/* Botones de acción */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 transition-all duration-200"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`px-4 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-md hover:from-yellow-600 hover:to-yellow-700 transition-all duration-200 flex items-center ${
              isSubmitting ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
            ) : (
              <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />
            )}
            Actualizar
          </button>
        </div>
      </div>
    </div>
  );
};


const GestionPedidosIncidentes = ({ onNavigate }) => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterEstado, setFilterEstado] = useState("Todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [showTimelineModal, setShowTimelineModal] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(null);
  const [showTicketModal, setShowTicketModal] = useState(null);
  const [showUpdateStatusModal, setShowUpdateStatusModal] = useState(null);
  const [timelineData, setTimelineData] = useState([]);
  const [timelineLoading, setTimelineLoading] = useState(false);
  const [timelineError, setTimelineError] = useState(null);
  const [repartidorData, setRepartidorData] = useState(null);
  const { csrfToken } = useAuth();
  const ordersPerPage = 10;

  const estadosDisponibles = ["Todos", "Incidente", "Incompleto"];
  const estadosProducto = ["Completado", "Incidente", "Incompleto"];
  const estadosCambioPedido = [
    "Procesando",
    "Enviando",
    "Recogiendo",
    "En alquiler",
    "Devuelto",
    "Incompleto",
    "Incidente",
    "Cancelado",
    "Finalizado",
  ];

  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        setLoading(true);
        const response = await api.get("/api/pedidos/pedidos-incidentes", {
          headers: { "X-CSRF-Token": csrfToken },
          withCredentials: true,
        });
        const result = response.data;
        console.log("Resultados obtenidos-incidentes", result);

        if (result.success) {
          const filteredPedidos = result.data
            .filter((pedido) =>
              ["Incidente", "Incompleto"].includes(pedido.estado)
            )
            .map((pedido) => ({
              ...pedido,
              estado: capitalizeStatus(pedido.estado),
              productos: pedido.productos.map((prod) => ({
                ...prod,
                estado: prod.estado
                  ? capitalizeStatus(prod.estado)
                  : "Completado",
              })),
            }));
          setPedidos(filteredPedidos);
          // eslint-disable-next-line no-useless-escape
        } else {
          
        }
      } catch (error) {
       
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchPedidos();
  }, [csrfToken]);

  useEffect(() => {
    const fetchTimelineData = async () => {
      if (!showTimelineModal) return;

      try {
        setTimelineLoading(true);
        setTimelineError(null);
        const response = await api.get(
          `/api/pedidos/historial/${showTimelineModal.idPedido}`,
          {
            headers: { "X-CSRF-Token": csrfToken },
            withCredentials: true,
          }
        );
        const result = response.data;
        console.log("historial de peido", result);

        if (result.success) {
          const historial = result.data.map((entry) => ({
            estado: capitalizeStatus(entry.estadoNuevo),
            fecha: new Date(entry.fechaActualizacion).toLocaleString("es-MX", {
              day: "2-digit",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            }),
            descripcion: `Pedido actualizado a ${capitalizeStatus(
              entry.estadoNuevo
            ).toLowerCase()}${
              entry.estadoAnterior
                ? ` desde ${capitalizeStatus(
                    entry.estadoAnterior
                  ).toLowerCase()}`
                : ""
            }`,
          }));
          setTimelineData(historial);
        } else {
          throw new Error("Error al cargar el historial del pedido");
        }
      } catch (error) {
        setTimelineError(error.message || "Error al cargar el historial");
        toast.error("No se pudo cargar el historial del pedido");
      } finally {
        setTimelineLoading(false);
      }
    };

    //Auno no existe ese enpoit
    const fetchRepartidorData = async () => {
      if (!showDetailsModal) return;
      try {
        const response = await api.get(
          `/api/pedidos/asignacion/${showDetailsModal.idPedido}`,
          {
            headers: { "X-CSRF-Token": csrfToken },
            withCredentials: true,
          }
        );
        const result = response.data;
        console.log("Repartidor asignacion ---", result);
        if (result.success && result.data) {
          setRepartidorData(result.data);
        } else {
          setRepartidorData(null);
        }
      } catch (error) {
        setRepartidorData(null);
        console.error("Error al obtener datos del repartidor:", error);
      }
    };

    fetchTimelineData();
    fetchRepartidorData();
  }, [showTimelineModal, showDetailsModal, csrfToken]);

const handleUpdateStatus = async (idPedido, newStatus, productUpdates = []) => {
  try {
    const response = await api.put(
      "/api/pedidos/pedidos/actualizar-estado",
      { idPedido, newStatus, productUpdates },
      {
        headers: { "X-CSRF-Token": csrfToken },
        withCredentials: true,
      }
    );

    const result = response.data;

    if (result.success) {
      setPedidos((prev) =>
        prev.map((pedido) =>
          pedido.idPedido === idPedido
            ? {
                ...pedido,
                estado: capitalizeStatus(newStatus),
                productos: pedido.productos.map((prod) => {
                  const updated = productUpdates.find(
                    (p) => p.idProductoColores === prod.idProductoColores
                  );
                  return updated
                    ? {
                        ...prod,
                        estadoProducto: capitalizeStatus(updated.estadoProducto),
                      }
                    : prod;
                }),
              }
            : pedido
        )
      );

      toast.success("Estado actualizado correctamente");
      setShowUpdateStatusModal(null);
    } else {
      toast.error(result.message || "Error al actualizar el estado");
    }
  } catch (error) {
    toast.error("Error al actualizar el estado");
    console.error(error);
  }
};

  const filteredPedidos = pedidos
    .filter(
      (pedido) => filterEstado === "Todos" || pedido.estado === filterEstado
    )
    .filter((pedido) => {
      const search = searchTerm.toLowerCase();
      return (
        pedido.idRastreo.toLowerCase().includes(search) ||
        pedido.cliente?.nombre?.toLowerCase().includes(search) ||
        pedido.cliente?.direccion?.toLowerCase().includes(search) ||
        ""
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
  const currentPedidos = filteredPedidos.slice(
    indexOfFirstOrder,
    indexOfLastOrder
  );
  const totalPages = Math.ceil(filteredPedidos.length / ordersPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const handleGenerateReport = () =>
    toast.info("Funcionalidad de generar reporte en desarrollo");
  const handleExportCSV = () =>
    toast.info("Funcionalidad de exportar a CSV en desarrollo");
  const handleGenerateInvoice = (pedido) =>
    toast.info(
      `Generando factura para el pedido ${pedido.idRastreo}... (en desarrollo)`
    );
  const handleShowTimeline = (pedido) => {
    setShowTimelineModal(pedido);
  };
  const handleShowDetails = (pedido) => setShowDetailsModal(pedido);

  const handleShowTicketModal = (pedido) => setShowTicketModal(pedido);
  const handleShowUpdateStatusModal = (pedido) =>
    setShowUpdateStatusModal(pedido);
  const handleSendTicket = (email, pdfBlob) => {
    toast.success(`Ticket enviado al correo ${email} en formato PDF.`);
    setShowTicketModal(null);
  };
  const handleNavigateDashboard = (dashboard) =>
    toast.info(`Navegando al Dashboard de ${dashboard}... (en desarrollo)`);

  const renderTimelineModal = () => {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 p-4 animate-fade-in">
        <div className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-2xl shadow-2xl max-h-[80vh] overflow-y-auto transform transition-all duration-300 scale-95">
          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 p-5 rounded-t-2xl flex justify-between items-center">
            <h2 className="text-xl font-bold text-white flex items-center">
              <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-3" />
              Seguimiento del Pedido
            </h2>
            <button
              onClick={() => setShowTimelineModal(null)}
              className="text-white hover:text-red-300 transition"
            >
              <FontAwesomeIcon icon={faTimes} size="lg" />
            </button>
          </div>
          <div className="p-6 space-y-5">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              ID de Rastreo:{" "}
              <span className="font-semibold">
                {showTimelineModal.idRastreo}
              </span>
            </p>
            {timelineLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : timelineError ? (
              <p className="text-red-600 dark:text-red-400 text-sm text-center">
                {timelineError}
              </p>
            ) : timelineData.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-400 text-sm text-center">
                No hay historial disponible para este pedido.
              </p>
            ) : (
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-green-500 to-teal-500 rounded-full"></div>
                {timelineData.map((evento, index) => (
                  <div key={index} className="relative mb-6">
                    <div className="flex items-start">
                      <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center z-10 shadow-md">
                        <FontAwesomeIcon
                          icon={
                            evento.estado === "Procesando"
                              ? faClock
                              : evento.estado === "Enviando"
                              ? faTruck
                              : evento.estado === "Confirmado"
                              ? faCheckCircle
                              : evento.estado === "En alquiler"
                              ? faCheckCircle
                              : evento.estado === "Recogiendo"
                              ? faTruck
                              : evento.estado === "Devuelto"
                              ? faUndo
                              : evento.estado === "Incompleto"
                              ? faExclamationTriangle
                              : evento.estado === "Incidente"
                              ? faExclamationCircle
                              : evento.estado === "Cancelado"
                              ? faBan
                              : evento.estado === "Finalizado"
                              ? faCheckCircle
                              : faQuestionCircle
                          }
                          className="text-white"
                        />
                      </div>
                      <div className="ml-6">
                        <p className="text-md font-semibold text-gray-800 dark:text-gray-100">
                          {evento.estado}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {evento.fecha}
                        </p>
                        <p className="text-sm text-gray-700 dark:text-gray-200">
                          {evento.descripcion}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  console.log("Parametro enviado de peiddo detalles", showDetailsModal);

  const renderDetailsModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6 dark:bg-gray-800">
        {/* Header */}
        <div className="flex justify-between items-center bg-[#fcb900] p-4 rounded-t-xl">
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <FontAwesomeIcon icon={faTicketAlt} />
            <span>Detalles del Pedido #{showDetailsModal.idPedido}</span>
          </h2>
          <button
            onClick={() => setShowDetailsModal(null)}
            className="text-white hover:text-gray-200 transition"
            aria-label="Cerrar modal"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        {/* Sección ID y Estado */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-4 flex items-center space-x-3 dark:bg-gray-700">
            <div className="bg-[#fcb900] text-white p-2 rounded-full">
              <FontAwesomeIcon icon={faTruck} />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium dark:text-gray-300">
                ID de Rastreo
              </p>
              <p className="text-lg font-bold text-gray-900 break-all dark:text-gray-100">
                {showDetailsModal.idRastreo}
              </p>
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 flex items-center space-x-3 dark:bg-gray-700">
            <div className="bg-[#fcb900] text-white p-2 rounded-full">
              <FontAwesomeIcon
                icon={
                  showDetailsModal.estado === "Incidente"
                    ? faExclamationCircle
                    : showDetailsModal.estado === "Incompleto"
                    ? faExclamationTriangle
                    : faQuestionCircle
                }
              />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Estado del Pedido
              </p>
              <p
                className={`font-bold text-lg ${
                  showDetailsModal.estado === "Incidente"
                    ? "text-red-600 dark:text-red-400"
                    : showDetailsModal.estado === "Incompleto"
                    ? "text-[#fcb900] dark:text-yellow-400"
                    : "text-gray-600 dark:text-gray-400"
                }`}
              >
                {showDetailsModal.estado}
              </p>
            </div>
          </div>
        </div>

        {/* Sección Repartidor */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-3 dark:bg-gray-700">
          <h3 className="text-lg font-bold text-gray-900 flex items-center space-x-2 dark:text-gray-100">
            <FontAwesomeIcon icon={faUserShield} className="text-[#fcb900]" />
            <span>Repartidor Asignado</span>
          </h3>
          {showDetailsModal ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-700 dark:text-gray-300">
              <div>
                <p className="font-semibold">Nombre</p>
                <p>{showDetailsModal.repartidor.nombre}</p>
              </div>
              <div>
                <p className="font-semibold">Teléfono</p>
                <p>{showDetailsModal.repartidor.telefono}</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400 italic">
              No hay repartidor asignado.
            </p>
          )}
        </div>

        {/* Sección Información del Cliente */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-3 dark:bg-gray-700">
          <h3 className="text-lg font-bold text-gray-900 flex items-center space-x-2 dark:text-gray-100">
            <FontAwesomeIcon icon={faUser} className="text-[#fcb900]" />
            <span>Información del Cliente</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-700 dark:text-gray-300">
            <div>
              <p className="font-semibold">Nombre</p>
              <p>{showDetailsModal.cliente.nombre}</p>
            </div>
            <div>
              <p className="font-semibold">Teléfono</p>
              <p>{showDetailsModal.cliente.telefono}</p>
            </div>
            <div>
              <p className="font-semibold">Dirección</p>
              <p>{showDetailsModal.cliente.direccion}</p>
            </div>
          </div>
        </div>

        {/* Sección Programación del Alquiler */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-3 dark:bg-gray-700">
          <h3 className="text-lg font-bold text-gray-900 flex items-center space-x-2 dark:text-gray-100">
            <FontAwesomeIcon icon={faCalendarAlt} className="text-[#fcb900]" />
            <span>Programación del Alquiler</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center text-sm text-gray-700 dark:text-gray-300">
            <div className="bg-white rounded-lg p-3 shadow-sm dark:bg-gray-800">
              <p className="font-semibold mb-1 text-gray-600 dark:text-gray-400">
                Fecha Inicio
              </p>
              <p>
                {new Date(showDetailsModal.fechas.inicio).toLocaleDateString(
                  "es-ES",
                  {
                    weekday: "short",
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  }
                )}
              </p>
            </div>
            <div className="bg-white rounded-lg p-3 shadow-sm dark:bg-gray-800">
              <p className="font-semibold mb-1 text-gray-600 dark:text-gray-400">
                Fecha Entrega
              </p>
              <p>
                {new Date(showDetailsModal.fechas.entrega).toLocaleDateString(
                  "es-ES",
                  {
                    weekday: "short",
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  }
                )}
              </p>
            </div>
            <div className="bg-white rounded-lg p-3 shadow-sm dark:bg-gray-800">
              <p className="font-semibold mb-1 flex items-center justify-center space-x-1 text-gray-600 dark:text-gray-400">
                <FontAwesomeIcon icon={faClock} />
                <span>Hora</span>
              </p>
              <p>{showDetailsModal.fechas.horaAlquiler}</p>
            </div>
            <div className="bg-white rounded-lg p-3 shadow-sm dark:bg-gray-800">
              <p className="font-semibold mb-1 text-gray-600 dark:text-gray-400">
                Días Totales
              </p>
              <p>{showDetailsModal.fechas.diasAlquiler} días</p>
            </div>
          </div>
        </div>

        {/* Sección Productos del Pedido */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-4 dark:bg-gray-700 shadow-lg">
          <h3 className="text-lg font-bold text-gray-900 flex items-center space-x-2 mb-4 dark:text-gray-100">
            <FontAwesomeIcon icon={faBox} className="text-[#fcb900]" />
            <span>Productos del Pedido</span>
          </h3>
          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-600">
            <table className="min-w-full text-sm text-left text-gray-700 dark:text-gray-300">
              <thead className="bg-gradient-to-r from-[#fcb900] to-gray-200 dark:from-gray-800 dark:to-gray-900 sticky top-0">
                <tr>
                  <th className="px-2 sm:px-4 py-2 font-semibold border-b border-gray-200 dark:border-gray-600">
                    <FontAwesomeIcon icon={faImage} className="mr-1" /> Imagen
                  </th>
                  <th className="px-2 sm:px-4 py-2 font-semibold border-b border-gray-200 dark:border-gray-600">
                    Producto
                  </th>
                  <th className="px-2 sm:px-4 py-2 font-semibold border-b border-gray-200 dark:border-gray-600">
                    Precio
                  </th>
                  <th className="px-2 sm:px-4 py-2 font-semibold border-b border-gray-200 dark:border-gray-600">
                    Cantidad
                  </th>
                  <th className="px-2 sm:px-4 py-2 font-semibold border-b border-gray-200 dark:border-gray-600">
                    Subtotal
                  </th>
                  <th className="px-2 sm:px-4 py-2 font-semibold border-b border-gray-200 dark:border-gray-600">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                {showDetailsModal.productos.map((producto, i) => (
                  <>
                    <tr
                      key={i}
                      className={
                        i % 2 === 0
                          ? "bg-white dark:bg-gray-800"
                          : "bg-gray-50 dark:bg-gray-900"
                      }
                    >
                      <td className="px-2 sm:px-4 py-2 border-b border-gray-200 dark:border-gray-600">
                        {producto.imagen ? (
                          <img
                            src={producto.imagen}
                            alt={producto.nombre}
                            className="w-12 h-12 object-cover rounded-md"
                          />
                        ) : (
                          <span className="text-gray-400 dark:text-gray-500">
                            Sin imagen
                          </span>
                        )}
                      </td>
                      <td className="px-2 sm:px-4 py-2 border-b border-gray-200 dark:border-gray-600">
                        {producto.nombre} (ID: {i + 244})
                      </td>
                      <td className="px-2 sm:px-4 py-2 border-b border-gray-200 dark:border-gray-600">
                        ${producto.precioUnitario}
                      </td>
                      <td className="px-2 sm:px-4 py-2 border-b border-gray-200 dark:border-gray-600">
                        {producto.cantidad}
                      </td>
                      <td className="px-2 sm:px-4 py-2 border-b border-gray-200 dark:border-gray-600">
                        ${producto.subtotal}
                      </td>
                      <td className="px-2 sm:px-4 py-2 border-b border-gray-200 dark:border-gray-600">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                            producto.estadoProducto === "Incidente"
                              ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                              : producto.estadoProducto === "Incompleto"
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                              : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                          }`}
                        >
                          {producto.estadoProducto === "Sin estado" ||
                          producto.estadoProducto === ""
                            ? "Disponible"
                            : producto.estadoProducto}
                        </span>
                      </td>
                    </tr>
                    {producto.observaciones && (
                      <tr className="bg-gray-50 dark:bg-gray-900">
                        <td
                          colSpan="6"
                          className="px-4 py-1 text-sm text-gray-600 dark:text-gray-300 italic"
                        >
                          Observaciones: {producto.observaciones}
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 text-right">
            <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
              Total: ${showDetailsModal.totalPagar || 0}
            </p>
          </div>
        </div>

        {/* Sección Información de Pago */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-6 dark:bg-gray-700">
          <h3 className="text-lg font-bold text-gray-900 flex items-center space-x-2 dark:text-gray-100">
            <FontAwesomeIcon icon={faCreditCard} className="text-[#fcb900]" />
            <span>Información de Pago</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                Forma de Pago
              </p>
              <p className="text-base font-bold text-gray-900 dark:text-gray-100">
                {showDetailsModal.pago.formaPago || "No especificado"}
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                Total Pagado
              </p>
              <p className="text-base font-bold text-gray-900 dark:text-gray-100">
                ${showDetailsModal.pago.totalPagado || 0}
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                Estado de Pago
              </p>
              <p
                className={`text-base font-bold ${
                  showDetailsModal.pago.estadoPago === "completado"
                    ? "text-green-600 dark:text-green-400"
                    : showDetailsModal.pago.estadoPago === "parcial"
                    ? "text-yellow-600 dark:text-yellow-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {showDetailsModal.pago.estadoPago || "Pendiente"}
              </p>
            </div>
          </div>
          {showDetailsModal.pago.pagosRealizados &&
            showDetailsModal.pago.pagosRealizados.length > 0 && (
              <div className="space-y-3 max-h-40 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800 rounded-md border border-gray-200 dark:border-gray-600 p-4 bg-gray-50 dark:bg-gray-900">
                {showDetailsModal.pago.pagosRealizados.map((pago, idx) => (
                  <div
                    key={idx}
                    className="bg-white dark:bg-gray-800 rounded-lg p-3 text-sm border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between"
                  >
                    <div className="flex items-center space-x-2 mb-1 sm:mb-0">
                      <FontAwesomeIcon
                        icon={
                          pago.estadoPago === "completado"
                            ? faCheckCircle
                            : faExclamationTriangle
                        }
                        className={`text-sm ${
                          pago.estadoPago === "completado"
                            ? "text-green-600 dark:text-green-400"
                            : "text-yellow-600 dark:text-yellow-400"
                        }`}
                      />
                      <span className="font-semibold capitalize">
                        {pago.formaPago || "Forma no especificada"}
                      </span>
                      {pago.metodoPago && <span>- {pago.metodoPago}</span>}
                    </div>
                    <div className="text-right text-gray-700 dark:text-gray-300 font-mono">
                      <span>${pago.monto || "0.00"}</span>
                      <br />
                      <span className="text-xs italic">
                        {new Date(pago.fechaPago).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          {showDetailsModal.pago.estadoPago === "pendiente" && (
            <p className="text-yellow-600 dark:text-yellow-400 font-semibold text-center">
              ⚠️ El cliente aún tiene un saldo pendiente por pagar.
            </p>
          )}
        </div>

        {/* Botón para Cambiar Estado */}
        <div className="flex justify-end">
          <button
            onClick={() => handleShowUpdateStatusModal(showDetailsModal)}
            className="flex items-center px-4 py-2 bg-[#fcb900] text-white rounded-md hover:bg-[#e0a900] transition-all duration-200"
          >
            <FontAwesomeIcon icon={faTasks} className="mr-2" />
            Cambiar Estado
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-800 dark:text-gray-100 mb-6 sm:mb-8 flex items-center justify-center">
          <FontAwesomeIcon
            icon={faExclamationTriangle}
            className="mr-2 sm:mr-3 text-red-500"
          />
          <span>Gestión de Pedidos con Incidencias</span>
        </h2>

        {loading ? (
          <CustomLoading />
        ): currentPedidos.length === 0 ? (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 text-center border border-gray-300 dark:border-gray-700">
            <FontAwesomeIcon
              icon={faFrown}
              className="text-4xl text-yellow-500 dark:text-yellow-400 mb-4"
            />
            <p className="text-lg font-semibold text-gray-700 dark:text-gray-200">
              No hay pedidos con incidentes
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              ¡Crea un nuevo pedido usando el botón "Realizar un Pedido"!
            </p>
          </div>
        ) : (
          <>
            <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-md">
              <div className="overflow-x-auto">
                <div className="flex flex-col sm:flex-row gap-3 items-center w-full min-w-[600px] sm:min-w-0">
                  <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <div className="flex items-center space-x-2 w-full sm:w-auto min-w-[180px]">
                      <FontAwesomeIcon
                        icon={faFilter}
                        className="text-[#fcb900]"
                      />
                      <select
                        value={filterEstado}
                        onChange={(e) => {
                          setFilterEstado(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="p-2 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 w-full sm:w-40 focus:outline-none focus:ring-2 focus:ring-[#fcb900] transition-all duration-200"
                      >
                        {estadosDisponibles.map((estado) => (
                          <option key={estado} value={estado}>
                            {estado}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center space-x-2 w-full sm:w-auto min-w-[220px]">
                      <FontAwesomeIcon
                        icon={faSearch}
                        className="text-[#fcb900]"
                      />
                      <input
                        type="text"
                        placeholder="Buscar por ID, cliente o dirección..."
                        value={searchTerm}
                        onChange={(e) => {
                          setSearchTerm(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="p-2 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-[#fcb900] transition-all duration-200"
                      />
                    </div>
                    <div className="flex items-center space-x-2 w-full sm:w-auto min-w-[260px]">
                      <FontAwesomeIcon
                        icon={faCalendarAlt}
                        className="text-[#fcb900]"
                      />
                      <input
                        type="date"
                        value={dateRange.start}
                        onChange={(e) =>
                          setDateRange({ ...dateRange, start: e.target.value })
                        }
                        className="p-2 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 w-full sm:w-36 focus:outline-none focus:ring-2 focus:ring-[#fcb900] transition-all duration-200"
                      />
                      <span className="text-gray-500 dark:text-gray-400 hidden sm:inline mx-1">
                        -
                      </span>
                      <input
                        type="date"
                        value={dateRange.end}
                        onChange={(e) =>
                          setDateRange({ ...dateRange, end: e.target.value })
                        }
                        className="p-2 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 w-full sm:w-36 focus:outline-none focus:ring-2 focus:ring-[#fcb900] transition-all duration-200"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto mt-6 rounded-xl shadow-lg">
              <table className="min-w-full bg-white dark:bg-gray-800">
                <thead className="bg-[#fcb900]">
                  <tr>
                    <th className="px-2 sm:px-4 py-2 text-left text-xs sm:text-sm font-semibold uppercase tracking-tight text-white">
                      <FontAwesomeIcon icon={faTruck} className="mr-1" />
                      <span className="hidden sm:inline">ID Rastreo</span>
                      <span className="sm:hidden">ID</span>
                    </th>
                    <th className="px-2 sm:px-4 py-2 text-left text-xs sm:text-sm font-semibold uppercase tracking-tight text-white">
                      <FontAwesomeIcon icon={faUser} className="mr-1" /> Cliente
                    </th>
                    <th className="px-2 sm:px-4 py-2 text-left text-xs sm:text-sm font-semibold uppercase tracking-tight text-white hidden sm:table-cell">
                      <FontAwesomeIcon icon={faPhone} className="mr-1" />
                      Teléfono
                    </th>
                    <th className="px-2 sm:px-4 py-2 text-left text-xs sm:text-sm font-semibold uppercase tracking-tight text-white hidden md:table-cell">
                      <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-1" />
                      Dirección
                    </th>
                    <th className="px-2 sm:px-4 py-2 text-left text-xs sm:text-sm font-semibold uppercase tracking-tight text-white hidden sm:table-cell">
                      <FontAwesomeIcon icon={faClock} className="mr-1" /> Días
                    </th>
                    <th className="px-2 sm:px-4 py-2 text-left text-xs sm:text-sm font-semibold uppercase tracking-tight text-white">
                      <FontAwesomeIcon icon={faDollarSign} className="mr-1" />
                      Total
                    </th>
                    <th className="px-2 sm:px-4 py-2 text-left text-xs sm:text-sm font-semibold uppercase tracking-tight text-white">
                      <FontAwesomeIcon icon={faCheckCircle} className="mr-1" />
                      Estado
                    </th>
                    <th className="px-2 sm:px-4 py-2 text-left text-xs sm:text-sm font-semibold uppercase tracking-tight text-white">
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
                      <td className="px-2 sm:px-4 py-2 text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                        {pedido.idRastreo}
                      </td>
                      <td className="px-2 sm:px-4 py-2 text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                        {pedido.cliente.nombre || "No especificado"}
                      </td>
                      <td className="px-2 sm:px-4 py-2 text-sm font-medium text-gray-800 dark:text-gray-200 truncate hidden sm:table-cell">
                        {pedido.cliente.telefono || "N/A"}
                      </td>
                      <td className="px-2 sm:px-4 py-2 text-sm font-medium text-gray-800 dark:text-gray-200 truncate hidden md:table-cell">
                        {pedido.cliente.direccion?.slice(0, 20) || "N/A"}...
                      </td>
                      <td className="px-2 sm:px-4 py-2 text-sm font-medium text-gray-800 dark:text-gray-200 truncate hidden sm:table-cell">
                        {pedido.fechas.diasAlquiler}
                      </td>
                      <td className="px-2 sm:px-4 py-2 text-sm font-medium text-gray-800 dark:text-gray-200">
                        <span className="text-green-600 dark:text-green-400">
                          ${pedido.totalPagar}
                        </span>
                      </td>
                      <td className="px-2 sm:px-4 py-2 text-sm text-gray-800 dark:text-gray-200">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold shadow-sm select-none ${
                            pedido.estado === "Incidente"
                              ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                              : pedido.estado === "Incompleto"
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
                          }`}
                        >
                          <FontAwesomeIcon
                            icon={
                              pedido.estado === "Incidente"
                                ? faExclamationCircle
                                : pedido.estado === "Incompleto"
                                ? faExclamationTriangle
                                : faQuestionCircle
                            }
                            className="mr-1"
                          />
                          {pedido.estado}
                        </span>
                      </td>
                      <td className="px-2 sm:px-4 py-2 text-sm flex space-x-2">
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
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

           <div className="flex flex-col sm:flex-row justify-between items-center mt-4 sm:mt-6 gap-4">
    <p className="text-sm text-gray-600 dark:text-gray-300">
      Mostrando {indexOfFirstOrder + 1} - {Math.min(indexOfLastOrder, filteredPedidos.length)} de {filteredPedidos.length} pedidos
    </p>
    <div className="flex space-x-2 flex-wrap justify-center">
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`px-2 sm:px-3 py-1 rounded-lg ${
          currentPage === 1
            ? "bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-600"
            : "bg-[#fcb900] text-white hover:bg-[#e0a900] dark:hover:bg-[#e0a900] transition-all duration-200"
        }`}
      >
        <FontAwesomeIcon icon={faChevronLeft} />
      </button>
      {(() => {
        const maxVisiblePages = 5;
        const halfVisible = Math.floor(maxVisiblePages / 2);
        let startPage = Math.max(1, currentPage - halfVisible);
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage + 1 < maxVisiblePages) {
          startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        const pages = [];
        for (let i = startPage; i <= endPage; i++) {
          pages.push(
            <button
              key={i}
              onClick={() => handlePageChange(i)}
              className={`px-2 sm:px-3 py-1 rounded-lg ${
                currentPage === i
                  ? "bg-[#fcb900] text-white dark:bg-[#fcb900]"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-all duration-200"
              }`}
            >
              {i}
            </button>
          );
        }
        return pages;
      })()}
      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`px-2 sm:px-3 py-1 rounded-lg ${
          currentPage === totalPages
            ? "bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-600"
            : "bg-[#fcb900] text-white hover:bg-[#e0a900] dark:hover:bg-[#e0a900] transition-all duration-200"
        }`}
      >
        <FontAwesomeIcon icon={faChevronRight} />
      </button>
    </div>
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
            {showUpdateStatusModal && (
              <UpdateStatusModal
                pedido={showUpdateStatusModal}
                onClose={() => setShowUpdateStatusModal(null)}
                onUpdateStatus={handleUpdateStatus}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default GestionPedidosIncidentes;
