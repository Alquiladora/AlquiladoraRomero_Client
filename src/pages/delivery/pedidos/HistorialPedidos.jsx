/* eslint-disable */
import React, { useState, useEffect, useMemo } from "react";
import {
  Package,
  CheckCircle,
  X,
  User,
  Clock,
  MapPin,
  Calendar,
  CreditCard,
  AlertCircle,
  Truck,
  ShoppingCart,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  Info,
} from "lucide-react";
import api from "../../../utils/AxiosConfig";
import { useAuth } from "../../../hooks/ContextAuth";
import CustomSpinner from "../../../components/spiner/SpinerGlobal";
import { toast } from "react-toastify";

// Loading Component
const Loading = () => <CustomSpinner />;

// No Data Component
const NoDataDisplay = ({ message }) => (
  <div className="flex items-center justify-center p-4 bg-gray-50 rounded-xl border-2 border-gray-200 dark:bg-gray-800 dark:border-gray-700">
    <span className="text-sm text-gray-600 dark:text-gray-300">{message}</span>
  </div>
);

// OrderDetailsModal Component (Sin cambios, solo se usa para detalles)
const OrderDetailsModal = ({ isOpen, onClose, order }) => {
  if (!isOpen || !order) return null;

  const statusStyles = {
    Disponible: {
      color: "text-green-600",
      bg: "bg-green-100",
      border: "border-green-200",
    },
    Incompleto: {
      color: "text-yellow-700",
      bg: "bg-yellow-200",
      border: "border-yellow-300",
    },
    Incidente: {
      color: "text-red-600",
      bg: "bg-red-100",
      border: "border-red-200",
    },
    Faltante: {
      color: "text-orange-600",
      bg: "bg-orange-100",
      border: "border-orange-200",
    },
    Default: {
      color: "text-gray-600",
      bg: "bg-gray-100",
      border: "border-gray-200",
    },
  };

  return (
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">
            Detalles del Pedido #{order.id}
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-orange-700 rounded-full p-2"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Descripción
              </p>
              <p className="font-semibold text-slate-900 dark:text-white">
                {order.description}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Ubicación
              </p>
              <p className="font-semibold text-slate-900 dark:text-white">
                {order.locality}, {order.municipality}, {order.state}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Fecha
              </p>
              <p className="font-semibold text-slate-900 dark:text-white">
                {new Date(order.deliveryDate).toLocaleDateString("es-MX")}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Dirección
              </p>
              <p className="font-semibold text-slate-900 dark:text-white">
                {order.address}
              </p>
            </div>
            {order.observaciones && (
              <div className="col-span-1 sm:col-span-2">
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Observaciones del Pedido
                </p>
                <p className="font-semibold bg-red-100 dark:bg-red-900 p-2 rounded-lg text-slate-900 dark:text-white">
                  {order.observaciones}
                </p>
              </div>
            )}
          </div>
          <div className="border-t pt-4 border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              Productos
            </h3>
            {order.products.map((product) => (
              <div
                key={product.id}
                className={`border rounded-lg p-3 mb-2 ${
                  statusStyles[product.status]?.border ||
                  statusStyles.Default.border
                } bg-slate-50 dark:bg-slate-800`}
              >
                <div className="flex justify-between items-center mb-2">
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {product.name}
                  </p>
                  <p className="text-green-600 dark:text-green-400 font-bold">
                    ${product.subtotal.toFixed(2)}
                  </p>
                </div>
                <div className="text-sm space-y-1">
                  <p className="text-slate-600 dark:text-slate-300">
                    Cantidad: {product.quantity}
                  </p>
                  <p className="text-slate-600 dark:text-slate-300">
                    Precio Unitario: ${product.unitPrice.toFixed(2)}
                  </p>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">
                    Color: {product.color}
                  </p>
                  <p>
                    Estado:{" "}
                    <span
                      className={`${
                        statusStyles[product.status]?.bg ||
                        statusStyles.Default.bg
                      } ${
                        statusStyles[product.status]?.color ||
                        statusStyles.Default.color
                      } px-2 py-1 rounded-full font-semibold`}
                    >
                      {capitalizeStatus(product.status)}
                    </span>
                  </p>
                  {(product.status === "Incompleto" ||
                    product.status === "Incidente" ||
                    product.status === "Faltante") && (
                    <>
                      
                      <p className="text-slate-600 dark:text-slate-300">
                        Observaciones:{" "}
                        <span className="font-semibold">
                          {product.observations || "Ninguna"}
                        </span>
                      </p>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-slate-50 dark:bg-slate-800 p-3 flex justify-end border-t border-slate-200 dark:border-slate-700">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

// OrderCard Component (Solo para detalles)
const OrderCard = ({ order, onViewDetails }) => {
  const statusStyles = {
    Enviando: {
      color: "text-blue-700 dark:text-blue-300",
      icon: <Truck className="h-4 w-4" />,
      bg: "bg-blue-50 dark:bg-blue-900 border-blue-200 dark:border-blue-600",
      dot: "bg-blue-500",
    },
    Recogiendo: {
      color: "text-amber-700 dark:text-amber-300",
      icon: <ShoppingCart className="h-4 w-4" />,
      bg: "bg-amber-50 dark:bg-amber-900 border-amber-200 dark:border-amber-600",
      dot: "bg-amber-500",
    },
    Devuelto: {
      color: "text-slate-600 dark:text-slate-300",
      icon: <RotateCcw className="h-4 w-4" />,
      bg: "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-600",
      dot: "bg-slate-400",
    },
    Incompleto: {
      color: "text-orange-700 dark:text-orange-300",
      icon: <AlertTriangle className="h-4 w-4" />,
      bg: "bg-orange-50 dark:bg-orange-900 border-orange-200 dark:border-orange-600",
      dot: "bg-orange-500",
    },
    Incidente: {
      color: "text-red-700 dark:text-red-300",
      icon: <AlertCircle className="h-4 w-4" />,
      bg: "bg-red-50 dark:bg-red-900 border-red-200 dark:border-red-600",
      dot: "bg-red-500",
    },
    "En alquiler": {
      color: "text-emerald-700 dark:text-emerald-300",
      icon: <Package className="h-4 w-4" />,
      bg: "bg-emerald-50 dark:bg-emerald-900 border-emerald-200 dark:border-emerald-600",
      dot: "bg-emerald-500",
    },
    Cancelado: {
      color: "text-red-600 dark:text-red-400",
      icon: <X className="h-4 w-4" />,
      bg: "bg-red-50 dark:bg-red-900 border-red-200 dark:border-red-600",
      dot: "bg-red-400",
    },
    Pendiente: {
      color: "text-slate-600 dark:text-slate-300",
      icon: <Package className="h-4 w-4" />,
      bg: "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-600",
      dot: "bg-slate-400",
    },
  };

  const isFullyPaid = order.totalToPay === order.totalPaid;
  const paymentProgress =
    order.totalToPay > 0 ? (order.totalPaid / order.totalToPay) * 100 : 0;

  const normalizedStatus = order.status?.toLowerCase() || "pendiente";
  const displayStatus = capitalizeStatus(normalizedStatus);
  const statusStyle = statusStyles[displayStatus] || statusStyles.Pendiente;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
      <div
        className={`h-1 ${
          order.type === "entrega" ? "bg-emerald-500" : "bg-blue-500"
        }`}
      />
      <div className="p-4 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-2 mb-4">
          <div className="flex items-center flex-wrap gap-3">
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium ${statusStyle.bg} ${statusStyle.color}`}
            >
              <div className={`w-2 h-2 rounded-full ${statusStyle.dot}`} />
              {statusStyle.icon}
              {displayStatus}
            </div>
            {order.isUrgent && (
              <div className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 text-xs font-semibold px-2 py-1 rounded-full border border-red-200 dark:border-red-600">
                URGENTE
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
              #{order.id}
            </span>
            <button
              onClick={() => onViewDetails(order)}
              className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium"
            >
              Ver detalles
            </button>
          </div>
        </div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 line-clamp-2">
          {order.description}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-slate-400" />
              <span className="truncate">
                {order.locality}, {order.municipality}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-slate-400" />
              <span>
                Ocupación:{" "}
                {new Date(order.deliveryDate).toLocaleDateString("es-MX")}
              </span>
            </div>
          </div>
          <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-slate-400" />
              <span>Días de alquiler: {order.diasAlquiler}</span>
            </div>
            <div className="truncate">{order.address}</div>
          </div>
        </div>
        <div className="mb-4">
          {isFullyPaid ? (
            <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-900 border border-emerald-200 dark:border-emerald-600 rounded-lg">
              <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <span className="font-semibold text-emerald-800 dark:text-emerald-300">
                PAGADO COMPLETO
              </span>
              <span className="ml-auto text-emerald-700 dark:text-emerald-300 font-bold">
                ${order.totalToPay.toFixed(2)}
              </span>
            </div>
          ) : (
            <div className="p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <CreditCard className="h-4 w-4 text-slate-400" />
                  <span className="text-sm font-medium">Estado de pago</span>
                </div>
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  ${order.totalPaid.toFixed(2)} / ${order.totalToPay.toFixed(2)}
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2 mb-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(paymentProgress, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>
                  Restante: ${(order.totalToPay - order.totalPaid).toFixed(2)}
                </span>
                <span>{paymentProgress.toFixed(1)}% completado</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Main Component
const OrderHistoryModa = () => {
  const [orders, setOrders] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { csrfToken, user } = useAuth();
  const [openMunicipality, setOpenMunicipality] = useState({});

  const toggleMunicipality = (state, municipality) => {
    setOpenMunicipality((prev) => ({
      ...prev,
      [state]: {
        ...prev[state],
        [municipality]: !prev[state]?.[municipality],
      },
    }));
  };

const fetchOrders = async () => {
  try {
    setLoading(true);
    setError(null);

    const response = await api.get("/api/repartidor/repartidor/pedidos-historico", {
      withCredentials: true,
      headers: { "X-CSRF-Token": csrfToken },
    });

    const data = response.data;

    const mappedOrders = data.pedidos
      .filter((order) => order.id && order.descripcion)
      .map((order) => ({
        id: order.id || 0,
        diasAlquiler: order.diasAlquiler || 0,
        type: order.tipo_pedido || "entrega",
        status: capitalizeStatus(order.estado_pedido || "Pendiente"),
        description: order.descripcion || "Sin descripción",
        locality: order.localidad || "Desconocido",
        municipality: order.municipio || "Desconocido",
        state: order.estado || "Desconocido",
        deliveryDate: order.fecha_entrega
          ? new Date(order.fecha_entrega).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        address: order.direccion || "Sin dirección",
        totalToPay: parseFloat(order.total_a_pagar) || 0,
        totalPaid: parseFloat(order.total_pagado) || 0,
        isUrgent: order.urgente || false,
        observaciones: order.observaciones || "",
        products: order.productos
          ? order.productos
              .filter((product) => product.id && product.nombre)
              .map((product) => ({
                id: product.id || 0,
                name: product.nombre || "Sin nombre",
                quantity: product.cantidad || 0,
                unitPrice: parseFloat(product.precio) || 0,
                subtotal: parseFloat(product.subtotal) || 0,
                color: product.color || "N/A",
                status: capitalizeStatus(product.estado || "Disponible"),
                observations: product.nota || "",
                fotoProducto: product.foto || "",
              }))
          : [],
      }));

    setOrders(mappedOrders);
  } catch (err) {
    setError(err?.response?.data?.error || err.message);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchOrders();
  }, [csrfToken]);

  const groupedOrders = useMemo(() => {
    const groupedByState = orders.reduce((acc, order) => {
      if (!acc[order.state]) acc[order.state] = {};
      if (!acc[order.state][order.municipality])
        acc[order.state][order.municipality] = [];
      acc[order.state][order.municipality].push(order);
      return acc;
    }, {});

    Object.keys(groupedByState).forEach((state) => {
      Object.keys(groupedByState[state]).forEach((municipality) => {
        groupedByState[state][municipality].sort((a, b) => {
          if (a.isUrgent && !b.isUrgent) return -1;
          if (!a.isUrgent && b.isUrgent) return 1;
          return 0;
        });
      });
    });

    return groupedByState;
  }, [orders]);

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen dark:from-gray-900 dark:via-amber-900/20 dark:to-orange-900/20 transition-colors duration-300">
      <div className="max-w-full mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
        <div className="mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold flex items-center text-gray-900 dark:text-white">
              <div className="p-1.5 sm:p-2 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl mr-2 sm:mr-3 shadow-lg">
                <User className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
              </div>
              <span className="text-base sm:text-xl lg:text-2xl bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                Historial de Pedidos
              </span>
            </h2>
            <div className="self-start sm:self-auto">
              <div className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 rounded-full shadow-md border border-amber-300 dark:border-amber-700">
                <span className="text-xs sm:text-sm font-bold text-amber-800 dark:text-amber-200">
                  {Object.keys(groupedOrders).length} Estados
                </span>
              </div>
            </div>
          </div>
          <div className="mt-2 h-0.5 sm:h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 rounded-full shadow-sm"></div>
        </div>

        {loading ? (
          <Loading />
        ) : error ? (
          <NoDataDisplay message={`Error: ${error}`} />
        ) : Object.keys(groupedOrders).length > 0 ? (
          <div className="space-y-4 sm:space-y-6">
            {Object.keys(groupedOrders).map((state, stateIndex) => (
              <div key={state} className="group">
                <div className="flex items-center mb-3 sm:mb-4">
                  <div className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-xs sm:text-sm">
                      {stateIndex + 1}
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-bold ml-2 sm:ml-3 text-gray-900 dark:text-white">
                    {state}
                  </h3>
                  <div className="flex-grow ml-2 sm:ml-3 h-px bg-gradient-to-r from-amber-300 to-transparent dark:from-amber-600"></div>
                </div>
                <div className="space-y-2 sm:space-y-3 pl-2 sm:pl-4">
                  {Object.keys(groupedOrders[state]).map(
                    (municipality, municipalityIndex) => (
                      <div
                        key={municipality}
                        className="backdrop-blur-sm bg-white/90 dark:bg-gray-800/90 border border-amber-200 dark:border-gray-700 rounded-xl shadow-lg hover:shadow-xl hover:border-amber-300 dark:hover:border-amber-600 transition-all duration-300 overflow-hidden"
                      >
                        <button
                          onClick={() =>
                            toggleMunicipality(state, municipality)
                          }
                          className="w-full flex justify-between items-center p-3 sm:p-4 lg:p-5 to-orange-50 dark:from-gray-800 dark:to-gray-700 hover:from-amber-100 hover:to-orange-100 dark:hover:from-gray-700 dark:hover:to-gray-600 transition-all duration-300 group active:scale-98 hover:shadow-md"
                        >
                          <div className="flex items-center min-w-0 flex-1">
                            <div className="w-4 h-4 sm:w-5 sm:h-5 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-full flex items-center justify-center mr-2 sm:mr-3 shadow-md flex-shrink-0 ring-2 ring-amber-200 dark:ring-amber-700">
                              <span className="text-white font-bold text-xs">
                                {municipalityIndex + 1}
                              </span>
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4 className="text-sm sm:text-base lg:text-lg font-bold text-gray-900 dark:text-white truncate">
                                {municipality}
                              </h4>
                              <div className="mt-1 sm:mt-0 sm:ml-2 inline-flex">
                                <div className="px-2 py-0.5 sm:px-3 sm:py-1 bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900 dark:to-orange-900 text-amber-800 dark:text-amber-200 rounded-full text-xs font-bold shadow-sm">
                                  {groupedOrders[state][municipality].length}{" "}
                                  pedidos
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center ml-2 flex-shrink-0">
                            <div className="w-6 h-6 sm:w-7 sm:h-7 bg-gradient-to-r from-amber-200 to-orange-200 dark:from-gray-600 dark:to-gray-500 rounded-full flex items-center justify-center group-hover:from-amber-300 group-hover:to-orange-300 dark:group-hover:from-gray-500 dark:group-hover:to-gray-400 transition-all duration-300 shadow-md">
                              <span className="text-amber-700 dark:text-gray-200 font-bold text-sm">
                                {openMunicipality[state]?.[municipality]
                                  ? "−"
                                  : "+"}
                              </span>
                            </div>
                          </div>
                        </button>
                        {openMunicipality[state]?.[municipality] && (
                          <div className="p-3 sm:p-4 lg:p-5 dark:from-gray-900/80 dark:to-amber-900/20 border-t border-amber-200 dark:border-gray-700">
                            {groupedOrders[state][municipality].length > 0 ? (
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
                                {groupedOrders[state][municipality].map(
                                  (order) => (
                                    <div
                                      key={order.id}
                                      className="transform hover:scale-105 active:scale-98 transition-transform duration-200 hover:z-10"
                                    >
                                      <OrderCard
                                        order={order}
                                        onViewDetails={handleViewDetails}
                                      />
                                    </div>
                                  )
                                )}
                              </div>
                            ) : (
                              <div className="text-center py-8 sm:py-10">
                                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-amber-200 to-orange-200 dark:from-gray-700 dark:to-gray-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg">
                                  <span className="text-amber-600 dark:text-gray-300 text-lg sm:text-2xl">
                                    📦
                                  </span>
                                </div>
                                <NoDataDisplay
                                  message={`No hay pedidos en ${municipality}`}
                                />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 sm:py-16 lg:py-20">
            <div className="max-w-sm mx-auto px-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gradient-to-r from-amber-200 to-orange-300 dark:from-gray-700 dark:to-gray-600 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-xl ring-4 ring-amber-100 dark:ring-gray-600">
                <span className="text-amber-600 dark:text-gray-300 text-2xl sm:text-3xl lg:text-4xl">
                  📋
                </span>
              </div>
              <NoDataDisplay message="No hay pedidos disponibles" />
              <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm sm:text-base font-medium">
                El historial aparecerá aquí una vez que haya pedidos
              </p>
            </div>
          </div>
        )}

        <OrderDetailsModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          order={selectedOrder}
        />
      </div>
    </div>
  );
};

// Función para capitalizar estados
const capitalizeStatus = (status) => {
  if (!status || typeof status !== "string") return "Disponible";
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
};

export default OrderHistoryModa;