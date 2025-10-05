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
  faEdit,
  faQuestionCircle,
  faStar,
  faShoppingCart,
  faShippingFast,
} from "@fortawesome/free-solid-svg-icons";

// SUBCOMPONENTE: Skeleton Loader mejorado
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

// COMPONENTE PRINCIPAL: Historial de Pedidos mejorado
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
  const { user } = useAuth();

  const fetchOrders = useCallback(
    async (page, signal) => {
      setLoading(true);
      setError(null);
      const idUser = user?.id || user?.idUsuarios;
      if (!idUser) {
        setError("No se pudo identificar al usuario.");
        setLoading(false);
        return;
      }

      try {
        const response = await api.get(`/api/pedidos/pedidos-cliente/${idUser}`, {
          params: { page, limit: 10 },
          withCredentials: true,
          signal,
        });
        if (response.data.success) {
          const data = response.data.data || [];
          if (data.length > 10) {
            console.warn("API returned more than 10 orders, slicing to 10.");
            setOrders(data.slice(0, 10));
          } else {
            setOrders(data);
          }
          setPagination({
            currentPage: page,
            totalPages: Math.max(1, Math.ceil((response.data.pagination?.totalItems || data.length) / 10)),
            totalItems: response.data.pagination?.totalItems || data.length,
            itemsPerPage: 10,
          });
        } else {
          throw new Error(response.data.message || "Error al cargar pedidos.");
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          setError("Error al cargar el historial de pedidos: " + (err.message || "Error desconocido."));
        }
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchOrders(pagination.currentPage, controller.signal);
    return () => controller.abort();
  }, [pagination.currentPage, fetchOrders]);

  // Funciones de paginación
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

  const handlePageInputSubmit = (e) => {
    if (e.key === "Enter" && pageInput) {
      const newPage = parseInt(pageInput);
      handlePageChange(newPage);
    }
  };

  // Funciones de acción
  const handleTrackPackage = (orderId) => {
    // Implementar seguimiento de paquete
    console.log("Seguimiento del pedido:", orderId);
    // window.location.href = `/seguimiento/${orderId}`;
  };

  const handleViewDetails = (orderId) => {
    // Implementar vista de detalles
    console.log("Ver detalles del pedido:", orderId);
    // window.location.href = `/pedido/${orderId}`;
  };

  const handleViewInvoice = (orderId) => {
    // Implementar vista de factura
    console.log("Ver factura del pedido:", orderId);
    // window.location.href = `/factura/${orderId}`;
  };

  const handleEditOrder = (orderId) => {
    // Implementar edición de pedido
    console.log("Editar pedido:", orderId);
    // window.location.href = `/editar-pedido/${orderId}`;
  };

  const handleAskProduct = (productId) => {
    // Implementar pregunta sobre producto
    console.log("Preguntar sobre producto:", productId);
    // window.location.href = `/pregunta-producto/${productId}`;
  };

  const handleWriteReview = (productId) => {
    // Implementar escritura de reseña
    console.log("Escribir reseña del producto:", productId);
    // window.location.href = `/reseña/${productId}`;
  };

  const handleBuyAgain = (productId) => {
    // Implementar comprar nuevamente
    console.log("Comprar nuevamente producto:", productId);
    // window.location.href = `/producto/${productId}`;
  };

  // Filtrado de pedidos
  const filteredOrders = orders.filter(order => {
    const matchesSearch = searchTerm === "" || 
      order.idRastreo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.productos?.[0]?.nombre?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTab = activeTab === "todos" || 
      (activeTab === "pendiente" && (order.estado === "Recogiendo" || order.estado === "Procesando")) ||
      (activeTab === "entregados" && order.estado === "Finalizado");

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
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                page === currentPage
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
    <section className="py-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Mis Pedidos</h1>
          <p className="text-gray-600 dark:text-gray-400">Gestiona y revisa el historial de tus pedidos</p>
        </div>

        {/* Filtros y Búsqueda */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Tabs de navegación */}
            <div className="flex flex-wrap gap-2">
              {[
                { id: "todos", label: "Todos los pedidos", count: orders.length },
                { id: "pendiente", label: "Pendientes", count: orders.filter(o => o.estado === "Recogiendo" || o.estado === "Procesando").length },
                { id: "entregados", label: "Entregados", count: orders.filter(o => o.estado === "Finalizado").length },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? "bg-indigo-600 text-white shadow-md"
                      : "text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  {tab.label}
                  <span className="ml-2 px-2 py-1 text-xs bg-white dark:bg-gray-800 rounded-full">
                    {tab.count}
                  </span>
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
                placeholder="Buscar por número de pedido o producto..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="space-y-4">
          {loading && [...Array(3)].map((_, idx) => <OrderCardSkeleton key={idx} />)}
          
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
                const showTrackButton = order.estado === "Recogiendo" || order.estado === "Procesando";

                return (
                  <div key={order.idPedido} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
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
                          Realizado el {format(new Date(order.fechas.registro), "dd 'de' MMMM 'de' yyyy", { locale: es })}
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
                              {format(new Date(order.fechas.registro), "dd/MM/yyyy")}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <FontAwesomeIcon icon={faDollarSign} className="text-gray-400 text-lg" />
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
                            <p className="font-medium text-gray-900 dark:text-white">
                              ${order.pago.total.toFixed(2)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <FontAwesomeIcon icon={faMapMarkerAlt} className="text-gray-400 text-lg" />
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Enviar a</p>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {order.cliente.nombre}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <FontAwesomeIcon icon={faBoxOpen} className="text-gray-400 text-lg" />
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Productos</p>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {order.productos?.length || 0} items
                            </p>
                          </div>
                        </div>
                      </div>

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
                          onClick={() => handleViewInvoice(order.idPedido)}
                          className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
                        >
                          <FontAwesomeIcon icon={faFileInvoice} className="w-4 h-4" />
                          <span>Factura</span>
                        </button>
                        
                        {showTrackButton && (
                          <button
                            onClick={() => handleTrackPackage(order.idPedido)}
                            className="flex items-center space-x-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors duration-200"
                          >
                            <FontAwesomeIcon icon={faShippingFast} className="w-4 h-4" />
                            <span>Seguimiento</span>
                          </button>
                        )}
                      </div>

                      {/* Productos del pedido */}
                      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                        {order.productos?.map((producto, index) => (
                          <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <img 
                              src={producto.imagen || "https://via.placeholder.com/80"} 
                              alt={producto.nombre}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 dark:text-white">
                                {producto.nombre}
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Color: {producto.color} | Cantidad: {producto.cantidad || 1}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleBuyAgain(producto.idProducto)}
                                className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 text-sm"
                              >
                                <FontAwesomeIcon icon={faShoppingCart} className="w-4 h-4" />
                                <span>Comprar otra vez</span>
                              </button>
                              
                              <button
                                onClick={() => handleAskProduct(producto.idProducto)}
                                className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm"
                              >
                                <FontAwesomeIcon icon={faQuestionCircle} className="w-4 h-4" />
                                <span>Preguntar</span>
                              </button>
                              
                              <button
                                onClick={() => handleWriteReview(producto.idProducto)}
                                className="flex items-center space-x-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200 text-sm"
                              >
                                <FontAwesomeIcon icon={faStar} className="w-4 h-4" />
                                <span>Opinar</span>
                              </button>
                            </div>
                          </div>
                        ))}
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
    </section>
  );
};

export default HistorialPedidos;