/* eslint-disable */
import React, { useState, useEffect, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faCheckCircle,
  faExclamationCircle,
  faMoneyCheckAlt,
  faChevronLeft,
  faChevronRight,
  faSearch,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import PaymentModal from "./PagosGeneral";
import api from "../../../utils/AxiosConfig";
import { useAuth } from "../../../hooks/ContextAuth";
import CustomLoading from "../../../components/spiner/SpinerGlobal";

const PagosGeneral = () => {
  const { csrfToken } = useAuth();
  const [allOrders, setAllOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilters, setActiveFilters] = useState(0);

  const pageSize = 15;

  const fetchAllOrders = async () => {
    setIsLoading(true);
    setError(null);
    try {
      let all = [];
      let page = 1;
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const response = await api.get(`/api/pedidos/pedidos/detalles/pagos?page=${page}`, {
          withCredentials: true,
          headers: { "X-CSRF-Token": csrfToken },
        });
        if (!response.data.success) break;
        all = [...all, ...(response.data.data || [])];
        const totalPages = response.data.pagination?.totalPages || 1;
        if (page >= totalPages) break;
        page++;
      }
      setAllOrders(all);
      if (all.length === 0) toast.info("No se encontraron resultados.");
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError(err.message || "Error de conexión");
      toast.error("Error al cargar los pedidos. Verifica tu conexión.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllOrders();
  }, [csrfToken]);

  const filteredOrders = useMemo(() => {
    if (!searchTerm.trim()) {
      setActiveFilters(0);
      return allOrders;
    }
    const lower = searchTerm.toLowerCase().trim();
    const filtered = allOrders.filter(order =>
      (order.idRastreo || '').toLowerCase().includes(lower) ||
      (order.cliente?.nombre || '').toLowerCase().includes(lower)
    );
    setActiveFilters(1);
    return filtered;
  }, [allOrders, searchTerm]);

  const totalItems = filteredOrders.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const orders = filteredOrders.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleViewPayments = (order) => setSelectedOrder(order);
  const handleCloseModal = () => setSelectedOrder(null);

  const handlePaymentRegistered = async () => {
    toast.success("¡Pagos actualizados!");
    fetchAllOrders();
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setActiveFilters(0);
  };

  const removeFilter = () => {
    setSearchTerm("");
  };

  if (error) {
    return (
      <div className="dark:bg-gray-800 min-h-screen py-6">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-6 text-center border border-red-200 dark:border-red-800">
            <FontAwesomeIcon icon={faExclamationCircle} className="text-6xl text-red-500 mb-4" />
            <h3 className="text-xl font-bold text-red-800 dark:text-red-200 mb-2">Error de Conexión</h3>
            <p className="text-red-600 dark:text-red-300 mb-4">{error}</p>
            <button onClick={fetchAllOrders} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dark:bg-gray-800 min-h-screen py-4 sm:py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center justify-between">
            <span className="flex items-center">
              <FontAwesomeIcon icon={faMoneyCheckAlt} className="mr-2 text-green-500" />
              Lista de Pedidos
            </span>
            {activeFilters > 0 && (
              <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded-full text-sm">
                1 filtro activo
              </span>
            )}
          </h2>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            <div className="flex-1 relative">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                <FontAwesomeIcon icon={faSearch} className="mr-1 text-gray-400" />
                Buscar por Nombre o ID Pedido
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Nombre del cliente o ID del pedido..."
                className="w-full px-3 py-2 pr-8 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-800 dark:text-white"
              />
              {searchTerm && (
                <button onClick={removeFilter} className="absolute right-2 top-10 text-gray-400 hover:text-gray-600">
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              )}
            </div>

            <button
              onClick={clearFilters}
              disabled={activeFilters === 0}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 disabled:opacity-50"
            >
              Limpiar
            </button>
          </div>
        </div>

        {isLoading ? (
          <CustomLoading />
        ) : orders.length === 0 ? (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 text-center border border-gray-200 dark:border-gray-600">
            <FontAwesomeIcon icon={faExclamationCircle} className="text-6xl text-yellow-500 mb-4" />
            <p className="text-lg text-gray-600 dark:text-gray-300">No hay pedidos disponibles.</p>
          </div>
        ) : (
          <>
            <div className="mb-4 text-sm text-gray-600 dark:text-gray-300">
              {totalItems} pedidos {activeFilters > 0 && `(filtrados: ${orders.length})`}
            </div>
            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-600">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-green-50 dark:bg-green-900/50">
                  <tr>
                    {["ID Pedido", "Cliente", "Contacto", "Método", "Forma", "Monto", "Tipo Cliente", "Pagos", "Tipo Pedido", "Acciones"].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {orders.map(order => {
                    const metodo = order.pagos?.listaPagos?.[0]?.metodoPago || "N/A";
                    const forma = order.pagos?.listaPagos?.[0]?.formaPago || "N/A";
                    return (
                      <tr key={order.idPedido} className="hover:bg-green-50 dark:hover:bg-green-900/20">
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{order.idRastreo}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{order.cliente?.nombre || "N/A"}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{order.cliente?.contacto || "N/A"}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{metodo}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{forma}</td>
                        <td className="px-4 py-3 text-sm font-bold text-green-600 dark:text-green-400">${order.totalPagar}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{order.cliente?.tipoCliente || "N/A"}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white text-center">{order.pagos?.numeroPagos || 0}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{order.tipoPedido}</td>
                        <td className="px-4 py-3">
                          <button onClick={() => handleViewPayments(order)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-full">
                            <FontAwesomeIcon icon={faEye} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex justify-between items-center mt-6">
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, totalItems)} de {totalItems}
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 rounded bg-green-500 text-white disabled:bg-gray-300"
                  >
                    <FontAwesomeIcon icon={faChevronLeft} />
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = currentPage > 3 ? totalPages - 4 + i : i + 1;
                    return (
                      <button
                        key={i}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-1 rounded ${currentPage === pageNum ? 'bg-green-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 rounded bg-green-500 text-white disabled:bg-gray-300"
                  >
                    <FontAwesomeIcon icon={faChevronRight} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {selectedOrder && (
        <PaymentModal selectedOrder={selectedOrder} onClose={handleCloseModal} onPaymentRegistered={handlePaymentRegistered} />
      )}
    </div>
  );
};

export default PagosGeneral;