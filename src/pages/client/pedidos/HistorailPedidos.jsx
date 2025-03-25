import React, { useEffect, useState, useCallback, useRef } from "react";
import api from "../../../utils/AxiosConfig";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useAuth } from "../../../hooks/ContextAuth";

// Order Card Component
const OrderCard = ({ order, index, onTrackOrder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-in");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) observer.observe(cardRef.current);
    return () => {
      if (cardRef.current) observer.unobserve(cardRef.current);
    };
  }, []);

  const statusStyles = {
    Entregado: { icon: "fas fa-check", color: "text-green-600", bg: "bg-green-50" },
    Pendiente: { icon: "fas fa-clock", color: "text-yellow-600", bg: "bg-yellow-50" },
    Cancelado: { icon: "fas fa-ban", color: "text-red-600", bg: "bg-red-50" },
  };

  const status = statusStyles[order.estado] || {
    icon: "fas fa-info",
    color: "text-gray-500",
    bg: "bg-gray-50",
  };

  // Convertir total a número si es necesario
  const total = typeof order.pago.total === "string" ? parseFloat(order.pago.total) : order.pago.total;

  return (
    <div
      ref={cardRef}
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-5 mb-6 transition-all duration-300 hover:shadow-lg order-card`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-full ${status.bg} flex items-center justify-center ${status.color}`}>
            <i className={`${status.icon} text-lg`}></i>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Pedido #{order.idPedido}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{order.idRastreo}</p>
          </div>
        </div>
        <span className={`px-3 py-1 text-sm font-medium rounded-full ${status.bg} ${status.color}`}>
          {order.estado}
        </span>
      </div>

      <div className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
        <p><strong>Fecha:</strong> {format(new Date(order.fechas.registro), "dd 'de' MMMM 'de' yyyy", { locale: es })}</p>
        <p><strong>Periodo:</strong> {format(new Date(order.fechas.inicio), "dd/MM/yyyy")} - {format(new Date(order.fechas.entrega), "dd/MM/yyyy")}</p>
        <p><strong>Total:</strong> ${isNaN(total) ? "0.00" : total.toFixed(2)} ({order.pago.formaPago || "N/A"})</p>
      </div>

      <div className="mt-4 flex space-x-4">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline flex items-center"
        >
          <i className={`fas fa-box mr-2 ${isOpen ? "rotate-180" : ""} transition-transform duration-200`}></i>
          {isOpen ? "Ocultar" : "Productos"}
        </button>
        <button
          onClick={() => onTrackOrder(order.idRastreo)}
          className="text-teal-600 dark:text-teal-400 font-medium hover:underline flex items-center"
        >
          <i className="fas fa-truck mr-2"></i>Rastrear
        </button>
      </div>

      {isOpen && (
        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Productos</h4>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
            {order.productos.map((producto, idx) => (
              <li key={idx} className="flex justify-between">
                <span>{producto.cantidad}x {producto.nombre} ({producto.color})</span>
                <span>${(typeof producto.subtotal === "string" ? parseFloat(producto.subtotal) : producto.subtotal).toFixed(2)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// Tracking Modal Component
const TrackingModal = ({ orderId, onClose }) => {
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTracking = async () => {
      try {
        const response = await api.get(`/api/pedidos/rastreo/${orderId}`, { withCredentials: true });
        setTrackingData(response.data.data || { steps: [] });
      } catch (err) {
        console.error("Error fetching tracking:", err);
        setTrackingData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchTracking();
  }, [orderId]);

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Rastreo #{orderId}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-white">
            <i className="fas fa-times text-lg"></i>
          </button>
        </div>

        {loading ? (
          <div className="text-center py-4">
            <i className="fas fa-spinner animate-spin text-3xl text-indigo-500"></i>
          </div>
        ) : (
          <div className="space-y-4">
            {trackingData && trackingData.steps.length > 0 ? (
              <ul className="space-y-4">
                {trackingData.steps.map((step, idx) => (
                  <li key={idx} className="flex items-start space-x-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${step.completed ? "bg-green-500" : "bg-gray-300"}`}>
                      <i className={`fas fa-${step.completed ? "check" : "dot-circle"} text-white text-sm`}></i>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{step.status}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{step.date}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-300">{step.location}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-600 dark:text-gray-300 text-center">Sin datos de rastreo.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Main Component
const HistorialPedidos = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const { user } = useAuth();

  const fetchOrders = useCallback(async (signal) => {
    setLoading(true);
    setError(null);
    const idUser = user?.id || user?.idUsuarios;
    try {
      const response = await api.get(`/api/pedidos/pedidos-cliente/${idUser}`, { withCredentials: true, signal });
      if (response.data.success) setOrders(response.data.data);
      else throw new Error(response.data.message || "Error al cargar pedidos.");
    } catch (err) {
      if (err.name !== "AbortError") setError("Error al cargar el historial.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    const controller = new AbortController();
    fetchOrders(controller.signal);
    return () => controller.abort();
  }, [fetchOrders]);

  const handleTrackOrder = (orderId) => setSelectedOrder(orderId);

  return (
    <section className="py-12 bg-gradient-to-b from-gray-100 to-white dark:from-gray-900 dark:to-gray-800 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Mis Pedidos</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Consulta el estado y detalles de tus pedidos</p>
          <div className="mt-3 w-20 h-1 bg-indigo-500 mx-auto rounded-full"></div>
        </div>

        {loading && (
          <div className="text-center py-10">
            <i className="fas fa-spinner animate-spin text-4xl text-indigo-500"></i>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Cargando...</p>
          </div>
        )}

        {error && !loading && (
          <div className="text-center py-10">
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={() => fetchOrders(new AbortController().signal)}
              className="px-6 py-2 bg-indigo-500 text-white rounded-full hover:bg-indigo-600 transition-all"
            >
              Reintentar
            </button>
          </div>
        )}

        {!loading && !error && (
          <div className="space-y-6">
            {orders.length === 0 ? (
              <p className="text-center text-gray-600 dark:text-gray-400 py-10">No hay pedidos registrados.</p>
            ) : (
              orders.map((order, index) => (
                <OrderCard key={order.idPedido} order={order} index={index} onTrackOrder={handleTrackOrder} />
              ))
            )}
          </div>
        )}

        {selectedOrder && <TrackingModal orderId={selectedOrder} onClose={() => setSelectedOrder(null)} />}
      </div>

      <style jsx>{`
        .order-card {
          opacity: 0;
          transform: translateY(20px);
        }
        .animate-in {
          animation: slideIn 0.5s ease-out forwards;
        }
        @keyframes slideIn {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
};

export default HistorialPedidos;