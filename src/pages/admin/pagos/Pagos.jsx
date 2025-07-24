import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faCheckCircle,
  faExclamationCircle,
  faMoneyCheckAlt,
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import PaymentModal from "./PagosGeneral";
import api from "../../../utils/AxiosConfig";
import { useAuth } from "../../../hooks/ContextAuth";
import CustomLoading from "../../../components/spiner/SpinerGlobal";

const PagosGeneral = () => {
  const { csrfToken } = useAuth();
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Fetch orders with pagination
  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      try {
        const response = await api.get(`/api/pedidos/pedidos/detalles/pagos?page=${currentPage}`, {
          withCredentials: true,
          headers: { "X-CSRF-Token": csrfToken },
        });
        if (response.data.success) {
          setOrders(response.data.data || []);
          setTotalPages(response.data.pagination.totalPages || 1);
          setTotalItems(response.data.pagination.totalItems || 0);
          toast.success(response.data.message);
        } else {
          toast.error("No se encontraron pedidos.");
          setOrders([]);
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
        toast.error("Error al cargar los pedidos.");
        setOrders([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, [csrfToken, currentPage]);

  const handleViewPayments = (order) => {
    setSelectedOrder(order);
  };

  const handleCloseModal = () => {
    setSelectedOrder(null);
  };

  const handlePaymentRegistered = async () => {
    toast.success("¡Pagos actualizados!");
    // Refresh orders
    try {
      const response = await api.get(`/api/pedidos/pedidos/detalles/pagos?page=${currentPage}`, {
        withCredentials: true,
        headers: { "X-CSRF-Token": csrfToken },
      });
      if (response.data.success) {
        setOrders(response.data.data || []);
        setTotalPages(response.data.pagination.totalPages || 1);
        setTotalItems(response.data.pagination.totalItems || 0);
      } else {
        toast.error("No se encontraron pedidos.");
      }
    } catch (error) {
      console.error("Error refreshing orders:", error);
      toast.error("Error al actualizar los pedidos.");
    }
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="dark:bg-gray-800 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
          <FontAwesomeIcon icon={faMoneyCheckAlt} className="mr-2 text-green-500" />
          Lista de Pedidos
        </h2>
        {isLoading ? (
          <CustomLoading />
        ) : orders.length === 0 ? (
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 text-center border border-gray-200 dark:border-gray-600">
            <FontAwesomeIcon
              icon={faExclamationCircle}
              className="text-4xl text-yellow-500 dark:text-yellow-400 mb-2"
            />
            <p className="text-gray-600 dark:text-gray-300">
              No hay pedidos disponibles.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-600">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-green-100 dark:bg-green-800">
                  <tr>
                    {[
                      "ID Pedido",
                      "Cliente",
                      "Correo/Teléfono",
                      "Método de Pago",
                      "Forma de Pago",
                      "Monto",
                      "Tipo de Cliente",
                      "Pagos Realizados",
                      "Tipo de Pedido",
                      "Acciones",
                  
                    ].map((header, idx) => (
                      <th
                        key={idx}
                        className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wide"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {orders.map((order) => (
                    <tr
                      key={order.idPedido}
                      className="hover:bg-green-50 dark:hover:bg-green-900/20 transition"
                    >
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                        {order.idRastreo || "N/A"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                        {order.cliente?.nombre || "No especificado"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                        {order.cliente?.contacto || "N/A"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                        {order.pagos?.listaPagos?.length > 0 ? order.pagos.listaPagos[0].metodoPago || "N/A" : "N/A"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                        {order.pagos?.listaPagos?.length > 0 ? order.pagos.listaPagos[0].formaPago || "N/A" : "N/A"}
                      </td>
                      <td className="px-4 py-3 text-sm text-green-600 dark:text-green-400 font-semibold">
                        ${order.totalPagar || "0.00"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                        {order.cliente?.tipoCliente || "Desconocido"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                        {order.pagos?.numeroPagos || 0}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                        {order.tipoPedido || "N/A"}
                      </td>
                     
                    
                    
                      <td className="px-4 py-3 text-sm">
                        <button
                          onClick={() => handleViewPayments(order)}
                          className="p-2 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-600 dark:text-blue-400 transition"
                          title="Ver pagos"
                        >
                          <FontAwesomeIcon icon={faEye} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Paginación */}
            <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Mostrando {(currentPage - 1) * 15 + 1} -{" "}
                {Math.min(currentPage * 15, totalItems)} de {totalItems} pedidos
              </p>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded-l-lg ${
                    currentPage === 1
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-600"
                      : "bg-green-500 text-white hover:bg-green-600 dark:hover:bg-green-600 transition-all duration-200"
                  }`}
                  aria-label="Página anterior"
                >
                  <FontAwesomeIcon icon={faChevronLeft} />
                </button>
                {totalPages <= 7 ? (
                  Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-1 rounded-lg ${
                        currentPage === page
                          ? "bg-green-600 text-white dark:bg-green-600"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-all duration-200"
                      }`}
                      aria-label={`Ir a página ${page}`}
                    >
                      {page}
                    </button>
                  ))
                ) : (
                  <>
                    {Array.from({ length: 3 }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-1 rounded-lg ${
                          currentPage === page
                            ? "bg-green-600 text-white dark:bg-green-600"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-all duration-200"
                        }`}
                        aria-label={`Ir a página ${page}`}
                      >
                        {page}
                      </button>
                    ))}
                    {currentPage > 4 && (
                      <span className="px-3 py-1 text-gray-600 dark:text-gray-300">...</span>
                    )}
                    {currentPage > 3 && currentPage < totalPages - 2 && (
                      <button
                        onClick={() => handlePageChange(currentPage)}
                        className="px-3 py-1 rounded-lg bg-green-600 text-white dark:bg-green-600"
                        aria-label={`Página actual ${currentPage}`}
                      >
                        {currentPage}
                      </button>
                    )}
                    {currentPage < totalPages - 2 && (
                      <span className="px-3 py-1 text-gray-600 dark:text-gray-300">...</span>
                    )}
                    {Array.from({ length: 3 }, (_, i) => totalPages - 2 + i).map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-1 rounded-lg ${
                          currentPage === page
                            ? "bg-green-600 text-white dark:bg-green-600"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-all duration-200"
                        }`}
                        aria-label={`Ir a página ${page}`}
                      >
                        {page}
                      </button>
                    ))}
                  </>
                )}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded-r-lg ${
                    currentPage === totalPages
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-600"
                      : "bg-green-500 text-white hover:bg-green-600 dark:hover:bg-green-600 transition-all duration-200"
                  }`}
                  aria-label="Página siguiente"
                >
                  <FontAwesomeIcon icon={faChevronRight} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
      {selectedOrder && (
        <PaymentModal
          selectedOrder={selectedOrder}
          onClose={handleCloseModal}
          onPaymentRegistered={handlePaymentRegistered}
        />
      )}
    </div>
  );
  
};

export default PagosGeneral;