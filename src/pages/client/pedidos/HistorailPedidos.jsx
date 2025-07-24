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
} from "@fortawesome/free-solid-svg-icons";

// ===================================================================
// SUBCOMPONENTE: Tarjeta de Pedido
// ===================================================================
const OrderCard = ({ order }) => {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const statusConfig = {
    Confirmado: { color: "blue-500", icon: faSpinner },
    Pagado: { color: "blue-500", icon: faSpinner },
    "En alquiler": { color: "green-500", icon: faBoxOpen },
    Recogiendo: { color: "orange-500", icon: faTruck },
    Devuelto: { color: "purple-500", icon: faBoxOpen },
    Finalizado: { color: "gray-500", icon: faSpinner },
    Cancelado: { color: "red-500", icon: faExclamationTriangle },
    Incidente: { color: "yellow-500", icon: faExclamationTriangle },
    Procesando: { color: "indigo-500", icon: faSpinner },
    default: { color: "gray-400", icon: faSpinner },
  };

  const currentStatus = statusConfig[order.estado] || statusConfig.default;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300 hover:shadow-lg">
      <div className="p-4 sm:p-5 border-b border-gray-200 dark:border-gray-700 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase">Pedido</p>
          <p className="text-sm font-bold text-gray-900 dark:text-white">{order.idRastreo}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase">Fecha</p>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {format(new Date(order.fechas.registro), "dd MMM yyyy", { locale: es })}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase">Total</p>
          <p className="text-sm font-bold text-gray-900 dark:text-white">${order.pago.total.toFixed(2)}</p>
        </div>
        <div>
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-${currentStatus.color}/10 text-${currentStatus.color} capitalize hover:bg-${currentStatus.color}/20 transition-colors duration-200`}
          >
            <FontAwesomeIcon icon={currentStatus.icon} className="mr-1.5 w-3.5 h-3.5" />
            {order.estado}
          </span>
        </div>
      </div>
      <div className="p-4 sm:p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-semibold text-gray-700 dark:text-gray-200">Periodo de Alquiler:</p>
            <p className="text-gray-600 dark:text-gray-300">
              {format(new Date(order.fechas.inicioAlquiler), "EEE, dd 'de' MMMM", { locale: es })} -{" "}
              {format(new Date(order.fechas.entregaAlquiler), "EEE, dd 'de' MMMM, yyyy", { locale: es })}
            </p>
          </div>
          <div>
            <p className="font-semibold text-gray-700 dark:text-gray-200">Dirección:</p>
            <p className="text-gray-600 dark:text-gray-300">{order.cliente.direccion}</p>
          </div>
        </div>
        <button
          onClick={() => setIsDetailsOpen(!isDetailsOpen)}
          className="mt-4 text-indigo-600 dark:text-indigo-400 font-medium text-sm flex items-center hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors duration-200"
          aria-expanded={isDetailsOpen}
        >
          <FontAwesomeIcon icon={faBoxOpen} className="mr-2 w-4 h-4" />
          {isDetailsOpen ? "Ocultar Productos" : "Ver Productos"}
          <FontAwesomeIcon
            icon={faChevronDown}
            className={`ml-2 w-3 h-3 transition-transform duration-300 ${isDetailsOpen ? "rotate-180" : ""}`}
          />
        </button>
      </div>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isDetailsOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="p-4 sm:p-5 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
          <h4 className="font-semibold text-gray-800 dark:text-white mb-3 text-sm">Productos Alquilados ({order.productos.length})</h4>
          <ul className="space-y-2 text-sm">
            {order.productos.map((producto, idx) => (
              <li key={idx} className="flex justify-between items-center text-gray-600 dark:text-gray-300">
                <span>
                  {producto.cantidad}x {producto.nombre} ({producto.color})
                </span>
                <span className="font-medium text-gray-800 dark:text-white">${producto.subtotal.toFixed(2)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

// ===================================================================
// SUBCOMPONENTE: Skeleton Loader
// ===================================================================
const OrderCardSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-4 sm:p-5 animate-pulse">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-28"></div>
      </div>
      <div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-28"></div>
      </div>
      <div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-28"></div>
      </div>
      <div>
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
      </div>
    </div>
    <div className="mt-4">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-36"></div>
    </div>
  </div>
);

// ===================================================================
// COMPONENTE PRINCIPAL: Historial de Pedidos
// ===================================================================
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
          // Ensure no more than 10 orders are displayed
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
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-200"
            aria-label="Página anterior"
          >
            <FontAwesomeIcon icon={faChevronLeft} className="w-4 h-4" />
          </button>
          {startPage > 1 && (
            <>
              <button
                onClick={() => handlePageChange(1)}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-indigo-100 dark:hover:bg-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-200"
              >
                1
              </button>
              {startPage > 2 && <span className="text-gray-500 dark:text-gray-400">...</span>}
            </>
          )}
          {pageNumbers.map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                page === currentPage
                  ? "bg-indigo-600 text-white"
                  : "text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-indigo-100 dark:hover:bg-indigo-900"
              } focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-200`}
              aria-current={page === currentPage ? "page" : undefined}
            >
              {page}
            </button>
          ))}
          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && <span className="text-gray-500 dark:text-gray-400">...</span>}
              <button
                onClick={() => handlePageChange(totalPages)}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-indigo-100 dark:hover:bg-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-200"
              >
                {totalPages}
              </button>
            </>
          )}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-200"
            aria-label="Página siguiente"
          >
            <FontAwesomeIcon icon={faChevronRight} className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">Ir a página:</span>
          <input
            type="text"
            value={pageInput}
            onChange={handlePageInputChange}
            onKeyDown={handlePageInputSubmit}
            className="w-16 px-2 py-1 text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder={currentPage.toString()}
            aria-label="Ir a página específica"
          />
        </div>
      </div>
    );
  };

  return (
    <section className="py-12 bg-gray-100 dark:bg-gray-900 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Historial de Pedidos</h2>

        {loading && (
          <div className="space-y-4">
            {[...Array(10)].map((_, idx) => (
              <OrderCardSkeleton key={idx} />
            ))}
          </div>
        )}

        {error && (
          <div className="text-center text-red-600 dark:text-red-400 py-10">
            <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2" />
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="space-y-4">
              {orders.length === 0 ? (
                <p className="text-center text-gray-600 dark:text-gray-400 py-10">No tienes pedidos registrados.</p>
              ) : (
                orders.slice(0, 10).map((order) => <OrderCard key={order.idPedido} order={order} />)
              )}
            </div>
            {pagination.totalItems > 0 && (
              <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                Mostrando {Math.min(orders.length, 10)} de {pagination.totalItems} pedidos
              </div>
            )}
            {pagination.totalPages > 1 && renderPagination()}
          </>
        )}
      </div>
    </section>
  );
};

export default HistorialPedidos;