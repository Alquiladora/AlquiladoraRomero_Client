import React, { useEffect, useState, useCallback } from "react";
import api from "../../../utils/AxiosConfig";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useAuth } from "../../../hooks/ContextAuth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronDown,
  faBoxOpen,
  faChevronLeft,
  faChevronRight,
  faSpinner,
  faExclamationTriangle,
  faTruck,
  faSearch,
  faCalendarAlt,
  faDollarSign,
  faMapMarkerAlt,
  faEye,
  faFileInvoice,
  faQuestionCircle,
  faStar,
  faShoppingCart,
  faShippingFast,
  faTimes,
  faClock,
  faCheckCircle,
  faUndo,
  faExclamationCircle,
  faBan,
  faPlus,
  faMinus,
  faChevronUp,
  faBox,
  faClipboardList,
  faUpload, // Nuevo ícono para subir fotos
  faTrash, // Nuevo ícono para eliminar archivos

} from "@fortawesome/free-solid-svg-icons";
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { toast } from "react-toastify";

const numeroWhatsApp = "521234567890";


const OrderCardSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-4 animate-pulse">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-4">
      {[...Array(4)].map((_, idx) => (
        <div key={idx} className="space-y-2">
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-20"></div>
          <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-28"></div>
        </div>
      ))}
    </div>
    <div className="flex items-center justify-between py-3 border-t border-gray-200 dark:border-gray-700">
      <div className="flex items-center space-x-4">
        <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded w-32"></div>
        <div className="flex space-x-2">
          {[...Array(4)].map((_, idx) => (
            <div key={idx} className="h-10 bg-gray-300 dark:bg-gray-700 rounded-full w-32"></div>
          ))}
        </div>
      </div>
    </div>
    <div className="flex items-center space-x-4 pt-4">
      <div className="w-20 h-20 bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
      <div className="space-y-2">
        <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-48"></div>
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-32"></div>
      </div>
    </div>
  </div>
);

const DetailItem = ({ label, value, isBadge = false, colorClass = "" }) => (
  <div>
    <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
    {isBadge ? (
      <span className={`px-2 py-1 mt-1 inline-block rounded-full text-xs font-medium border ${colorClass}`}>
        {value}
      </span>
    ) : (
      <p className="font-medium text-gray-900 dark:text-white truncate mt-0.5">{value}</p>
    )}
  </div>
);

const OrderDetailsModal = ({ modalState, onClose, getStatusColor, onRetry }) => {
  const { isOpen, details, isLoading, error, orderId } = modalState;
  console.log("Datos recibidos de deatlles ", details, orderId)


  if (!isOpen) return null;


  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex justify-center items-center p-4 transition-opacity duration-300"
      onClick={onClose}
    >
      {/* Contenido del Modal */}
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-3xl transform transition-all duration-300 scale-100 opacity-100 max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header del Modal */}
        <div className="flex justify-between items-center p-5 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            {details ? `Detalles del Pedido #${details.pedido.idPedido}` : `Detalles del Pedido (ID: ${orderId})`}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors text-2xl"
            aria-label="Cerrar"
          >
            <FontAwesomeIcon icon={faChevronLeft} className="rotate-90" />
          </button>
        </div>

        {/* Body del Modal */}
        <div className="p-6 overflow-y-auto flex-grow">
          {isLoading && (
            <div className="text-center py-8">
              <FontAwesomeIcon icon={faSpinner} spin className="text-indigo-600 text-3xl mb-3" />
              <p className="text-indigo-600 dark:text-indigo-400">Cargando detalles del pedido...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-500 text-3xl mb-3" />
              <p className="text-red-500 dark:text-red-400 mb-4">{error}</p>
              <button
                onClick={onRetry}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Reintentar
              </button>
            </div>
          )}

          {/* Renderizar detalles una vez cargados */}
          {details && !isLoading && !error && (
            <div className="space-y-6">


              {/* Información principal */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <DetailItem label="ID de Rastreo" value={details.pedido.idRastreo} />
                <DetailItem label="Estado" value={details.pedido.estado} colorClass={getStatusColor(details.pedido.estado)} isBadge />

                <DetailItem
                  label="Total Pagado"
                  value={`$${parseFloat(details.pedido.totalPagar).toFixed(2)}`}
                />
                <DetailItem label="Total Pagado" value={`$${parseFloat(details.pedido.totalPagar).toFixed(2)}`} />
              </div>

              {/* Detalles de Envío */}
              <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center text-lg">
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2 text-indigo-500" /> Información de Envío
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <DetailItem label="Recibe" value={details.pedido.direccionEnvio.nombre + " " + details.pedido.direccionEnvio.apellido} />
                  <DetailItem label="Teléfono" value={details.pedido.direccionEnvio.telefono || 'N/A'} />
                  <div className="md:col-span-2">
                    <DetailItem
                      label="Dirección Completa"
                      value={`${details.pedido.direccionEnvio.direccion || 'N/A'}, ${details.pedido.direccionEnvio.direccion || 'N/A'}, ${details.pedido.direccionEnvio.localidad || 'N/A'} ${details.pedido.direccionEnvio.municipio || ''}, ${details.pedido.direccionEnvio.estado || 'N/A'}, ${details.pedido.direccionEnvio.pais || 'N/A'},  C.P. ${details.pedido.direccionEnvio.codigoPostal || 'N/A'}`}
                    />

                  </div>
                </div>
              </div>

              {/* Productos */}
              <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center text-lg">
                  <FontAwesomeIcon icon={faShoppingCart} className="mr-2 text-indigo-500" />
                  Productos ({details?.pedido?.productos?.length || 0})
                </h4>

                {details?.pedido?.productos && details.pedido.productos.length > 0 ? (
                  <div className="space-y-3">
                    {details.pedido.productos.map((item, index) => {
                      const esIncompleto = item.estadoProducto === "Incompleto";
                      const esIncidente = item.estadoProducto === "Incidente";

                      // Estilo condicional para el borde según el estado
                      const borderColor = esIncompleto
                        ? "border-yellow-400"
                        : esIncidente
                          ? "border-red-500"
                          : "border-gray-200 dark:border-gray-600";

                      // Procesar observaciones para productos incompletos
                      let cantidadIncompleta = null;
                      let textoObservacion = null;
                      if (esIncompleto && item.observaciones) {
                        const match = item.observaciones.match(/^(\d+)\s*[-:]?\s*(.*)$/);
                        if (match) {
                          cantidadIncompleta = match[1];
                          textoObservacion = match[2];
                        } else {
                          textoObservacion = item.observaciones;
                        }
                      }

                      return (
                        <div
                          key={index}
                          className={`flex items-start space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700 border ${borderColor}`}
                        >
                          <img
                            src={
                              item.fotoProducto ||
                              "https://placehold.co/60x60/f3f4f6/374151?text=Prod"
                            }
                            alt={item.producto}
                            className="w-16 h-16 object-cover rounded-md flex-shrink-0 border border-gray-200 dark:border-gray-600"
                          />
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 dark:text-white">
                              {item.producto}
                            </p>

                            {/* Etiquetas de estado */}
                            {esIncompleto && (
                              <span className="inline-block text-xs font-semibold bg-yellow-100 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-100 px-2 py-1 rounded mt-1">
                                Producto incompleto
                              </span>
                            )}
                            {esIncidente && (
                              <span className="inline-block text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-100 px-2 py-1 rounded mt-1">
                                Producto con incidente
                              </span>
                            )}

                            {/* Información base */}
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Cantidad: {item.cantidad}
                            </p>

                            {/* Observaciones */}
                            {esIncompleto && (
                              <p className="text-xs mt-1 text-yellow-700 dark:text-yellow-300 italic">
                                {cantidadIncompleta
                                  ? `Faltan ${cantidadIncompleta} unidades. ${textoObservacion || ""}`
                                  : item.observaciones}
                              </p>
                            )}
                            {esIncidente && item.observaciones && (
                              <p className="text-xs mt-1 text-red-600 dark:text-red-400 italic">
                                {item.observaciones}
                              </p>
                            )}
                          </div>

                          <div className="text-right flex-shrink-0">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Precio Unitario: ${parseFloat(item.precioUnitario).toFixed(2)}
                            </p>
                            <p className="font-semibold text-indigo-600 dark:text-indigo-400">
                              Subtotal: ${parseFloat(item.subtotal).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">
                    No hay detalles de productos disponibles.
                  </p>
                )}
              </div>



            </div>
          )}
        </div>

        {/* Footer del Modal */}
        <div className="p-5 border-t border-gray-200 dark:border-gray-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors duration-200"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

const RatingStars = ({ rating, setRating }) => {
  const stars = [1, 2, 3, 4, 5];
  return (
    <div className="flex justify-center space-x-1">
      {stars.map((star) => (
        <FontAwesomeIcon
          key={star}
          data-testid={`star-${star}`}
          icon={faStar}
          onClick={() => setRating(star)}
          className={`text-2xl cursor-pointer transition-colors duration-200 ${star <= rating ? 'text-yellow-500' : 'text-gray-300 dark:text-gray-600 hover:text-yellow-400'
            }`}
        />
      ))}
    </div>
  );
};


const ReviewModal = ({ isOpen, orderId, onClose,onSuccess }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [photos, setPhotos] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const maxPhotos = 3;
  const { csrfToken, user } = useAuth();

  useEffect(() => {
    if (isOpen) {
      setRating(0);
      setComment('');
      setPhotos([]);
      setSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files).slice(0, maxPhotos - photos.length);
    setPhotos(prev => [...prev, ...files]);
  };

  const handleRemovePhoto = (index) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };


  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Por favor, selecciona una calificación.");
      return;
    }
    if (comment.trim().length < 10) {
      toast.info("Tu comentario debe tener al menos 10 caracteres.");
      return;
    }

    setSubmitting(true);

    try {
      let fotosUrls = [];

      if (photos.length > 0) {
        const formData = new FormData();
        photos.forEach(file => formData.append("imagenes", file));

        const uploadRes = await api.post(
          "/api/imagenes/calificar-pedido",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              "X-CSRF-Token": csrfToken,
            },
          }
        );

        fotosUrls = uploadRes.data.urls || [];
      }

      // 2️⃣ Enviar la evaluación al backend
      const res = await api.post(
        "/api/pedidos/calificar",
        {
          idPedido: orderId,
          calificacionEstrellas: rating,
          comentarios: comment,
          fotosUrls: fotosUrls,
        },
        {
          headers: {
            "Content-Type": "application/json",
            "X-CSRF-Token": csrfToken,
          },
          withCredentials: true,
        }
      );

      if (res.data.success) {
       toast.success(res.data.message); 

       if (onSuccess) {
          onSuccess(orderId);
        }
      } else {
        toast.error(res.data.message || "No se pudo registrar la evaluación.");
      }
    } catch (error) {
      console.error("Error al enviar evaluación:", error);
      toast.error(error.response?.data?.message || "Error al enviar la evaluación.");
    } finally {
      setSubmitting(false);
    }
  };


  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex justify-center items-center p-4 transition-opacity duration-300"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg transform transition-all duration-300 scale-100 opacity-100"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-gray-200 dark:border-gray-700 bg-indigo-600 rounded-t-2xl">
          <h3 className="text-xl font-bold text-white">
            Evaluar Servicio de Alquiler
          </h3>
          <button onClick={onClose} className="text-white hover:text-gray-300 transition-colors">&times;</button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          <div className="text-center">
            <p className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              ¿Qué tan satisfecho estás con el Pedido #{orderId}?
            </p>
            <RatingStars rating={rating} setRating={setRating} />
          </div>

          {/* Comentarios */}
          <div>
            <label htmlFor="comment" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Comentarios sobre la experiencia:
            </label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Cuéntanos sobre la entrega, el estado del producto, etc."
            />
          </div>

      
          <div>
          
            <div className="mb-3 p-2 bg-yellow-100 dark:bg-yellow-900/40 rounded-lg border border-yellow-300 dark:border-yellow-700 flex items-center space-x-2">
              <FontAwesomeIcon icon={faStar} className="text-yellow-600 text-lg" />
              <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-300">
                ¡Sube una foto y gana 30 Puntos Fiesta adicionales!
              </p>
            </div>
            {/* FIN INCENTIVO */}

            <p className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Subir Fotos (Opcional, máx. {maxPhotos}):
            </p>

            <div className="flex flex-wrap gap-3 mb-3">
              {photos.map((file, index) => (
                <div key={index} className="relative">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Preview ${index}`}
                    className="w-20 h-20 object-cover rounded-lg border border-gray-300"
                  />
                  <button
                    onClick={() => handleRemovePhoto(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 text-xs hover:bg-red-600 transition"
                  >
                    <FontAwesomeIcon icon={faTimes} className="w-3 h-3" />
                  </button>
                </div>
              ))}

              {photos.length < maxPhotos && (
                <label className="w-20 h-20 border-2 border-dashed border-gray-400 dark:border-gray-500 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 transition-colors duration-200">
                  <FontAwesomeIcon icon={faUpload} className="text-gray-500 dark:text-gray-400 text-xl" />
                  <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">Añadir</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-gray-200 dark:border-gray-700 flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={submitting || rating === 0}
            className={`px-6 py-2 text-sm font-medium rounded-lg transition-colors duration-200 flex items-center space-x-2 ${(submitting || rating === 0)
              ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
              : 'bg-green-600 text-white hover:bg-green-700'
              }`}
          >
            {submitting && <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />}
            <span>{submitting ? 'Enviando...' : 'Enviar Evaluación'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};


const HistorialPedidos = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });
  const [pageInput, setPageInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("todos");
  const { user, isLoading: isLoadingAuth, csrfToken } = useAuth();
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [modal, setModal] = useState({
    isOpen: false,
    orderId: null,
    details: null,
    isLoading: false,
    error: null,
  })
  const [timelineModal, setTimelineModal] = useState(null);
  const [timelineData, setTimelineData] = useState([]);
  const [timelineLoading, setTimelineLoading] = useState(false);
  const [timelineError, setTimelineError] = useState(null);
  const [showMoreTimeline, setShowMoreTimeline] = useState(false);
  const [reviewModal, setReviewModal] = useState({ isOpen: false, orderId: null });
  const [ratedOrders, setRatedOrders] = useState([]);


  const fetchOrders = useCallback(
    async (page, signal) => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get("api/pedidos/historial-pedidos", {
          params: { pagina: page, limite: 10 },
          withCredentials: true,
          signal,
        });
        if (response.data.success) {
          const backendData = response.data.data || [];
          const backendPagination = response.data.paginacion;

          const ordersWithParsedPhotos = backendData.map((order) => ({
            ...order,
            fotosProductos: order.fotosProductos ? JSON.parse(order.fotosProductos) : [],
          }));

          setOrders(ordersWithParsedPhotos);
          setPagination({
            currentPage: backendPagination.paginaActual,
            totalPages: backendPagination.totalPaginas,
            totalItems: backendPagination.totalPedidos,
            itemsPerPage: 10,
          });
        } else {
          throw new Error(response.data.error || "Error al cargar pedidos.");
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          setError("Error al cargar el historial de pedidos: " + (err.message || "Error desconocido."));
        }
      } finally {
        setLoading(false);
      }
    },
    []
  );


  const fetchOrdetDetails = useCallback(async (orderId, signal) => {
    setModal(prev => ({ ...prev, isLoading: true, error: null, details: null }));
    try {
      const response = await api.get(`api/pedidos/detalles-pedido/${orderId}`, {
        withCredentials: true,
        signal,
      });
      console.log("Datos recubudos", response)

      if (response.data.success) {
        const detailedOrder = response.data;
        console.log("Datos finales 1", detailedOrder)

        if (detailedOrder.detallesProductos && typeof detailedOrder.detallesProductos === 'string') {
          detailedOrder.detallesProductos = JSON.parse(detailedOrder.detallesProductos);
        }
        if (detailedOrder.fotosProductos && typeof detailedOrder.fotosProductos === 'string') {
          detailedOrder.fotosProductos = JSON.parse(detailedOrder.fotosProductos);
        }

        console.log("Datos finales 2", detailedOrder)


        setModal(prev => ({
          ...prev,
          details: detailedOrder,
          isLoading: false,
          error: null,
        }));
      } else {
        throw new Error(response.data.error || "No se pudo cargar el detalle del pedido.");
      }
    } catch (err) {
      if (err.name !== "AbortError") {
        setModal(prev => ({
          ...prev,
          isLoading: false,
          error: "Error al cargar los detalles: " + (err.message || "Error desconocido."),
        }));
      }
    }

  }, []);

  //Funcion para verificar si el pedido ya esat calificado
  const fetchRatedOrders = useCallback(async (signal) => {
    try {
      const response = await api.get("/api/pedidos/calificados", {
        withCredentials: true,
        signal,
      });
      if (response.data.success) {
        setRatedOrders(response.data.pedidosCalificados || []);
        console.log("pedido id calificados", response.data.pedidosCalificados)
      }
    } catch (err) {
      console.error("Error al obtener pedidos calificados:", err);
    }
  }, []);


  useEffect(() => {
    const controller = new AbortController();
    if (!isLoadingAuth) {
      const timer = setTimeout(() => {
        fetchOrders(pagination.currentPage, controller.signal);
        fetchRatedOrders(controller.signal);
      }, isFirstLoad ? 150 : 0);

      if (isFirstLoad) {
        setIsFirstLoad(false);
      }
      return () => {
        clearTimeout(timer);
        controller.abort();
      };
    }
  }, [pagination.currentPage, fetchOrders, fetchRatedOrders, isLoadingAuth]);


  useEffect(() => {
    if (modal.isOpen && modal.orderId && modal.isLoading && !modal.details && !modal.error) {
      const controller = new AbortController();
      fetchOrdetDetails(modal.orderId, controller.signal);
      return () => {
        controller.abort();
      };
    }
  }, [modal.isOpen, modal.orderId, modal.isLoading, fetchOrdetDetails]);



  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, currentPage: newPage }));
      setPageInput("");
    }
  };

  const handlePageInputChange = (e) => {
    const value = e.target.value;
    if (/^\d*$/.test(value) && (value === "" || (parseInt(value) >= 1 && parseInt(value) <= pagination.totalPages))) {
      setPageInput(value);
    }
  };


  const mensaje = encodeURIComponent(`Hola, tengo una pregunta sobre mi pedido: `);


  const handlePageInputSubmit = (e) => {
    if (e.key === "Enter" && pageInput) {
      const newPage = parseInt(pageInput);
      handlePageChange(newPage);
    }
  };

  // Funciones de acción
  const handleTrackPackage = (orderId) => {
    const order = orders.find(o => o.idPedido === orderId);
    if (order) {
      setTimelineModal(order);
      setShowMoreTimeline(false);
    }
  };

  //=============================FUNCIONALIDAD DE DETALLES--------------

  const handleViewDetails = (orderId) => {
    setModal({
      isOpen: true,
      orderId: orderId,
      details: null,
      isLoading: true,
      error: null,
    });
  };


  const handleCloseModal = () => {
    setModal({
      isOpen: false,
      orderId: null,
      details: null,
      isLoading: false,
      error: null,
    });
  };


  //------------------FUNCION DE SEGUIMIENTO---------------
  const capitalizeStatus = (status) => {
    if (!status) return '';
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  };


  //Funcion de vakloracion osea califcacion 
const handleReviewSuccess = (ratedOrderId) => {
    setRatedOrders(prevRatedOrders => [...prevRatedOrders, ratedOrderId]);
    setReviewModal({ isOpen: false, orderId: null });
  };




  useEffect(() => {
    const fetchTimelineData = async () => {
      if (!timelineModal) return;

      try {
        setTimelineLoading(true);
        setTimelineError(null);

        // Aquí usamos csrfToken de useAuth
        const response = await api.get(`/api/pedidos/historial/${timelineModal.idPedido}`, {
          headers: { "X-CSRF-Token": csrfToken },
          withCredentials: true,
        });
        const result = response.data;

        if (result.success && result.data && Array.isArray(result.data)) {
          const historial = result.data.map((entry) => ({
            estado: capitalizeStatus(entry.estadoNuevo),
            fecha: new Date(entry.fechaActualizacion).toLocaleString("es-MX", {
              day: "2-digit",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            }),
            descripcion: `Pedido actualizado a ${capitalizeStatus(entry.estadoNuevo).toLowerCase()}${entry.estadoAnterior ? ` desde ${capitalizeStatus(entry.estadoAnterior).toLowerCase()}` : ''}`,
          }));
          setTimelineData(historial);
        } else {
          throw new Error(result.error || "Error al cargar el historial del pedido");
        }
      } catch (error) {
        setTimelineError(error.message || "Error al cargar el historial");

        console.error("Error al cargar el historial:", error);
      } finally {
        setTimelineLoading(false);
      }
    };

    fetchTimelineData();
  }, [timelineModal, csrfToken]);



  const TimelineModal = ({ pedido, data, loading, error, showMore, toggleShowMore, onClose }) => {
    if (!pedido) return null;

    const visibleEvents = showMore ? data : data.slice(0, 2);

    const getTimelineIcon = (estado) => {
      switch (estado) {
        case "Procesando":
          return faClock;
        case "Enviando":
        case "En alquiler":
          return faTruck;
        case "Confirmado":
          return faCheckCircle;
        case "Devuelto":
          return faUndo;
        case "Incompleto":
          return faExclamationTriangle;
        case "Incidente":
          return faExclamationCircle;
        case "Cancelado":
          return faBan;
        case "Finalizado":
          return faCheckCircle;
        default:
          return faQuestionCircle;
      }
    };

    const getTimelineColor = (estado) => {
      switch (estado) {
        case "Procesando":
          return "bg-amber-500";
        case "Enviando":
        case "En alquiler":
          return "bg-blue-500";
        case "Confirmado":
        case "Finalizado":
          return "bg-green-500";
        case "Devuelto":
          return "bg-teal-500";
        case "Incompleto":
          return "bg-yellow-500";
        case "Incidente":
          return "bg-red-500";
        case "Cancelado":
          return "bg-gray-500";
        default:
          return "bg-indigo-500";
      }
    };

    return (
      <div className="fixed inset-0  flex items-center justify-center  p-4 ">
        <div className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-2xl shadow-2xl max-h-[80vh] overflow-y-auto transition-all duration-300 scale-100 border border-gray-100 dark:border-gray-700">

          {/* Header Mejorado */}
          <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-6 rounded-t-2xl flex justify-between items-center shadow-lg relative overflow-hidden">
            {/* Capa de brillo sutil */}
            <div className="absolute inset-0 bg-gradient-to-r from-amber-100/20 to-orange-600/20"></div>

            {/* Sección izquierda (icono + texto) */}
            <div className="relative z-10 flex items-center">
              <div className="bg-white/25 p-2 rounded-lg mr-3 backdrop-blur-sm shadow-sm">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="text-white text-lg drop-shadow-sm" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white tracking-wide drop-shadow-md">
                  Seguimiento del Pedido
                </h2>
                <p className="text-amber-100 text-sm mt-1">
                  Historial completo de estados
                </p>
              </div>
            </div>

            {/* Botón de cierre */}
            <button
              onClick={onClose}
              className="relative z-10 bg-white/25 hover:bg-white/40 p-2 rounded-full transition-all duration-200 backdrop-blur-sm shadow-sm"
              aria-label="Cerrar"
            >
              <FontAwesomeIcon icon={faTimes} className="text-white text-lg drop-shadow-sm" />
            </button>
          </div>


          {/* Body Mejorado */}
          <div className="p-6 space-y-6">
            {/* Información del pedido */}
            <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-4 border border-indigo-100 dark:border-indigo-800">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-indigo-700 dark:text-indigo-300 font-medium">
                    ID de Rastreo
                  </p>
                  <p className="text-lg font-bold text-indigo-900 dark:text-white mt-1">
                    {pedido.idRastreo}
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-700 p-2 rounded-lg shadow-sm">
                  <FontAwesomeIcon
                    icon={faBox}
                    className="text-indigo-600 dark:text-indigo-400 text-xl"
                  />
                </div>
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center h-32 space-y-3">
                <FontAwesomeIcon
                  icon={faSpinner}
                  spin
                  className="text-indigo-600 text-3xl"
                />
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Cargando historial...
                </p>
              </div>
            ) : error ? (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-center">
                <FontAwesomeIcon
                  icon={faExclamationTriangle}
                  className="text-red-500 text-xl mb-2"
                />
                <p className="text-red-700 dark:text-red-300 font-medium">
                  {error}
                </p>
              </div>
            ) : data.length === 0 ? (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 text-center">
                <FontAwesomeIcon
                  icon={faClipboardList}
                  className="text-gray-400 text-2xl mb-3"
                />
                <p className="text-gray-600 dark:text-gray-400 font-medium">
                  No hay historial disponible
                </p>
                <p className="text-gray-500 dark:text-gray-500 text-sm mt-1">
                  El historial de este pedido aparecerá aquí
                </p>
              </div>
            ) : (
              <div className="relative">
                {/* Línea de tiempo mejorada */}
                <div className="absolute left-6 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-200 via-indigo-400 to-indigo-200 rounded-full"></div>

                {visibleEvents.map((evento, index) => (
                  <div
                    key={index}
                    className="relative mb-6 flex items-start group"
                  >
                    {/* Punto e ícono mejorado */}
                    <div className="relative z-10">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg ${getTimelineColor(
                          evento.estado
                        )} text-white group-hover:scale-110 transform transition-all duration-300`}
                      >
                        <FontAwesomeIcon icon={getTimelineIcon(evento.estado)} />
                      </div>
                      {index === 0 && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center shadow-md">
                          <FontAwesomeIcon icon={faStar} className="text-white text-xs" />
                        </div>
                      )}
                    </div>

                    {/* Tarjeta de evento mejorada */}
                    <div className="ml-6 flex-1 bg-white dark:bg-gray-700 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 dark:border-gray-600 group-hover:border-indigo-200 dark:group-hover:border-indigo-800">
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-base font-bold text-gray-900 dark:text-white">
                          {evento.estado}
                        </p>
                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200">
                          {evento.fecha}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                        {evento.descripcion || "Sin descripción disponible."}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Botón Ver más mejorado */}
            {data.length > 2 && (
              <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={toggleShowMore}
                  className="w-full flex items-center justify-center py-3 px-4 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-xl font-medium transition-all duration-200 group"
                >
                  <FontAwesomeIcon
                    icon={showMore ? faChevronUp : faChevronDown}
                    className="mr-2 transition-transform duration-300 group-hover:scale-110"
                  />
                  {showMore ? "Ver menos eventos" : `Ver más eventos (${data.length - 2})`}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };



  const handleWriteReview = (orderId) => {
    setReviewModal({ isOpen: true, orderId });

  };


  // Filtrado de pedidos
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      searchTerm === "" || order.idRastreo?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTab =
      activeTab === "todos" ||

      (activeTab === "pendiente" && (order.estado === "Enviando" || order.estado === "Confirmado" || order.estado === "Procesando")) ||

      (activeTab === "incidentes" && order.estado === "Incidente") ||

      (activeTab === "incompletos" && order.estado === "Incompelto") ||

      (activeTab === "entregados" && (order.estado === "En alquiler" || order.estado === 'Devuelto' || order.estado === 'Finalizado'));

    return matchesSearch && matchesTab;
  });

  const renderPagination = () => {
    const { currentPage, totalPages } = pagination;
    const pageNumbers = [];
    const maxPagesToShow = 5;
    const startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 transform hover:scale-105"
            aria-label="Página anterior"
          >
            <FontAwesomeIcon icon={faChevronLeft} className="w-4 h-4" />
          </button>

          {startPage > 1 && (
            <>
              <button
                onClick={() => handlePageChange(1)}
                className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
              >
                1
              </button>
              {startPage > 2 && <span className="text-gray-500 dark:text-gray-400 px-2">...</span>}
            </>
          )}

          {pageNumbers.map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${page === currentPage
                ? "bg-indigo-600 text-white shadow-md"
                : "text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-indigo-50 dark:hover:bg-indigo-900"
                } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
            >
              {page}
            </button>
          ))}

          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && <span className="text-gray-500 dark:text-gray-400 px-2">...</span>}
              <button
                onClick={() => handlePageChange(totalPages)}
                className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
              >
                {totalPages}
              </button>
            </>
          )}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 transform hover:scale-105"
            aria-label="Página siguiente"
          >
            <FontAwesomeIcon icon={faChevronRight} className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-600 dark:text-gray-400">Ir a página:</span>
          <input
            type="text"
            value={pageInput}
            onChange={handlePageInputChange}
            onKeyDown={handlePageInputSubmit}
            className="w-16 px-3 py-2 text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder={currentPage.toString()}
          />
        </div>
      </div>
    );
  };

  const getStatusColor = (status) => {
    const colors = {
      Confirmado: "bg-blue-100 text-blue-800 border-blue-200",
      Pagado: "bg-green-100 text-green-800 border-green-200",
      "En alquiler": "bg-purple-100 text-purple-800 border-purple-200",
      Recogiendo: "bg-orange-100 text-orange-800 border-orange-200",
      Devuelto: "bg-indigo-100 text-indigo-800 border-indigo-200",
      Finalizado: "bg-gray-100 text-gray-800 border-gray-200",
      Cancelado: "bg-red-100 text-red-800 border-red-200",
      Incidente: "bg-yellow-100 text-yellow-800 border-yellow-200",
      Procesando: "bg-cyan-100 text-cyan-800 border-cyan-200",
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  return (
    <section className="dark:bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 data-testid="page-title" className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Mis Pedidos</h1>
          <p className="text-gray-600 dark:text-gray-400">Gestiona y revisa el historial de tus pedidos</p>
        </div>

        {/* Filtros y Búsqueda */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Tabs de navegación */}
            <div className="flex flex-wrap gap-2">
              {[
                { id: "todos", label: "Todos los pedidos", count: orders.length },
                {
                  id: "pendiente",
                  label: "Pendientes",
                  count: orders.filter((o) => o.estado === "Enviando" || o.estado === "Confirmado").length,
                },
                {
                  id: "incidentes",
                  label: "Incidentes",
                  count: orders.filter((o) => o.estado === "Incidente").length,
                },
                {
                  id: "incompletos",
                  label: "Incompletos",
                  count: orders.filter((o) => o.estado === "Incompelto").length,
                },
                { id: "entregados", label: "Entregados", count: orders.filter((o) => o.estado === "En alquiler" || o.estado === 'Devuelto' || o.estado === 'Finalizado').length },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${activeTab === tab.id
                    ? "bg-indigo-600 text-white shadow-md"
                    : "text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                    }`}
                >
                  {tab.label}
                  <span className="ml-2 px-2 py-1 text-x dark:bg-gray-800 rounded-full">{tab.count}</span>
                </button>
              ))}
            </div>

            {/* Barra de búsqueda */}
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FontAwesomeIcon icon={faSearch} className="text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por número de pedido..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="space-y-4">
          {loading && !isLoadingAuth && [...Array(3)].map((_, idx) => <OrderCardSkeleton key={idx} />)}

          {error && (
            <div className="text-center py-12">
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-8 max-w-md mx-auto">
                <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-500 text-4xl mb-4" />
                <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">Error al cargar pedidos</h3>
                <p className="text-red-600 dark:text-red-300 text-sm">{error}</p>
                <button
                  onClick={() => fetchOrders(pagination.currentPage)}
                  className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                >
                  Reintentar
                </button>
              </div>
            </div>
          )}

          {!loading && !error && filteredOrders.length > 0 && (
            <div className="space-y-4">

              {filteredOrders.map((order) => {

                const showReviewButton = order.estado === "Devuelto" || order.estado === "Finalizado";
                const isRated = ratedOrders.includes(order.idPedido);



                return (
                  <div
                  data-testid="order-card"
                    key={order.idPedido}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
                  >
                    {/* Header del pedido */}
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="flex items-center space-x-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.estado)}`}>
                            {order.estado}
                          </span>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Pedido #: <strong className="text-gray-900 dark:text-white">{order.idRastreo}</strong>
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Realizado el {format(new Date(order.fechaInicio), "dd 'de' MMMM 'de' yyyy", { locale: es })}
                        </div>
                      </div>
                    </div>

                    {/* Información del pedido */}
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                        <div className="flex items-center space-x-3">
                          <FontAwesomeIcon icon={faCalendarAlt} className="text-gray-400 text-lg" />
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Fecha</p>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {format(new Date(order.fechaInicio), "dd/MM/yyyy")}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <FontAwesomeIcon icon={faDollarSign} className="text-gray-400 text-lg" />
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
                            <p className="font-medium text-gray-900 dark:text-white">${parseFloat(order.totalPagar).toFixed(2)}</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <FontAwesomeIcon icon={faMapMarkerAlt} className="text-gray-400 text-lg" />
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Enviar a</p>
                            <p className="font-medium text-gray-900 dark:text-white">{order.nombreCliente}</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <FontAwesomeIcon icon={faBoxOpen} className="text-gray-400 text-lg" />
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Productos</p>
                            <p className="font-medium text-gray-900 dark:text-white">{order.numeroDeProductos} items</p>
                          </div>
                        </div>
                      </div>


                      {!isRated && showReviewButton && (
                        <div className="w-full flex justify-end mb-4">
                          <div className="flex items-center space-x-2 px-3 py-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-xl shadow-md border-l-4 border-l-yellow-600 transition-all duration-300 hover:shadow-lg">
                            <FontAwesomeIcon icon={faStar} className="text-yellow-600 text-xl animate-pulse" />
                            <span className="text-sm font-bold text-yellow-800 dark:text-yellow-300">
                              ¡Gana Puntos Fiesta! Evalúa tu experiencia.
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Acciones del pedido */}
                      <div className="flex flex-wrap gap-3 mb-6">
                        <button
                          onClick={() => handleViewDetails(order.idPedido)}
                          className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200"
                        >
                          <FontAwesomeIcon icon={faEye} className="w-4 h-4" />
                          <span>Ver detalles</span>
                        </button>

                        <button
                          onClick={() => handleTrackPackage(order.idPedido)}
                          className="flex items-center space-x-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors duration-200"
                        >
                          <FontAwesomeIcon icon={faShippingFast} className="w-4 h-4" />
                          <span>Seguimiento</span>
                        </button>

                        {isRated ? (

                          <div className="flex items-center space-x-2 px-4 py-2 bg-green-500/10 text-green-700 rounded-lg font-medium">
                            <FontAwesomeIcon icon={faCheckCircle} className="w-4 h-4" />
                            <span>Pedido Evaluado ✅</span>
                          </div>
                        ) : showReviewButton ? (

                          <button
                            onClick={() => handleWriteReview(order.idPedido)}
                            className="flex items-center space-x-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors duration-200"
                          >
                            <FontAwesomeIcon icon={faStar} className="w-4 h-4" />
                            <span>Evaluar Pedido</span>
                          </button>
                        ) : null}



                      </div>

                      {/* Productos del pedido */}
                      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                        {/* Información del pedido (idRastreo) fuera del bucle de fotos */}
                        <div className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-800 rounded-lg mb-4">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            Pedido: <strong className="text-gray-900 dark:text-white">{order.idRastreo}</strong>
                          </h4>
                          {/* Aquí puedes mantener el botón de preguntar, si aplica al pedido en general */}

                          <a
                            href={`https://wa.me/${numeroWhatsApp}?text=${mensaje}`}
                            target="_blank"
                            rel="noopener noreferrer" // Buena práctica de seguridad para enlaces externos
                            className="flex items-center space-x-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200 text-sm no-underline"
                          >
                            <FontAwesomeIcon icon={faWhatsapp} className="w-4 h-4" />
                            <span>Preguntar por WhatsApp</span>
                          </a>

                        </div>

                        {/* Contenedor principal para las fotos */}
                        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg mb-4 last:mb-0">
                          {order.fotosProductos && order.fotosProductos.length > 0 ? (
                            <div className="flex items-center space-x-2">
                              {order.fotosProductos.slice(0, 2).map((fotoUrl, index) => (
                                <img
                                  key={index}
                                  src={fotoUrl || "https://via.placeholder.com/80"}
                                  alt={`Producto del pedido ${order.idRastreo}`}
                                  className="w-16 h-16 object-cover rounded-lg"
                                />
                              ))}
                              {order.fotosProductos.length > 2 && (
                                <span className="text-gray-600 dark:text-gray-300 text-sm">
                                  +{order.fotosProductos.length - 2} más
                                </span>
                              )}
                            </div>
                          ) : (
                            <img
                              src="https://via.placeholder.com/80"
                              alt="Sin imagen de producto"
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {!loading && !error && filteredOrders.length === 0 && (
            <div className="text-center py-16">
              <FontAwesomeIcon icon={faBoxOpen} className="text-gray-400 text-6xl mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                {searchTerm || activeTab !== "todos" ? "No se encontraron pedidos" : "No tienes pedidos registrados"}
              </h3>
              <p className="text-gray-500 dark:text-gray-500 mb-6">
                {searchTerm || activeTab !== "todos"
                  ? "Intenta con otros términos de búsqueda o filtros"
                  : "Cuando realices tu primer pedido, aparecerá aquí"}
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200"
                >
                  Limpiar búsqueda
                </button>
              )}
            </div>
          )}
        </div>

        {/* Paginación y estadísticas */}
        {!loading && !error && filteredOrders.length > 0 && (
          <>
            <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
              Mostrando {filteredOrders.length} de {pagination.totalItems} pedidos
            </div>
            {pagination.totalPages > 1 && renderPagination()}
          </>
        )}
      </div>
      <OrderDetailsModal
        modalState={modal}
        onClose={handleCloseModal}
        getStatusColor={getStatusColor}
        onRetry={() => setModal(prev => ({ ...prev, isLoading: true, error: null }))}
      />
      <TimelineModal
        pedido={timelineModal}
        data={timelineData}
        loading={timelineLoading}
        error={timelineError}
        showMore={showMoreTimeline}
        toggleShowMore={() => setShowMoreTimeline(prev => !prev)}
        onClose={() => setTimelineModal(null)}
      />
      <ReviewModal
      key={reviewModal.orderId}
       isOpen={reviewModal.isOpen}
        orderId={reviewModal.orderId}
        onClose={() => setReviewModal({ isOpen: false, orderId: null })}
        onSuccess={handleReviewSuccess}
      />
    </section>
  );
};

export default HistorialPedidos;