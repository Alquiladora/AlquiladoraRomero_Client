import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ClockIcon,
  CheckCircleIcon,
  PaperAirplaneIcon,
  TruckIcon,
  RefreshIcon,
  ExclamationCircleIcon,
  ExclamationIcon,
  FlagIcon,
  BanIcon,
  ClipboardCopyIcon,
  ChevronDownIcon,
} from "@heroicons/react/outline";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserPlus, faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import api from "../../utils/AxiosConfig";

const RastrearPedido = () => {
  const [idRastreo, setIdRastreo] = useState("");
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const statusConfig = {
    Procesando: { icon: ClockIcon, color: "text-orange-500", label: "Procesando" },
    Confirmado: { icon: CheckCircleIcon, color: "text-green-500", label: "Confirmado" },
    Enviando: { icon: PaperAirplaneIcon, color: "text-blue-500", label: "Enviando" },
    En_alquiler: { icon: TruckIcon, color: "text-purple-500", label: "En Alquiler" },
    Recogiendo: { icon: ClockIcon, color: "text-gray-500", label: "Recogiendo" },
    Devuelto: { icon: RefreshIcon, color: "text-gray-300", label: "Devuelto" },
    Incompleto: { icon: ExclamationCircleIcon, color: "text-yellow-500", label: "Incompleto" },
    Incidente: { icon: ExclamationIcon, color: "text-red-500", label: "Incidente" },
    Cancelado: { icon: BanIcon, color: "text-gray-900", label: "Cancelado" },
    Finalizado: { icon: FlagIcon, color: "text-green-700", label: "Finalizado" },
  };

  const handleTrackOrder = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const checkResponse = await api.get(`/api/pedidos/rastrear/${idRastreo.trim()}`);
      console.log("Resultado de rastreo", checkResponse.data);
      if (!checkResponse.data.success) {
        setError(checkResponse.data.message || "No se encontró un pedido con ese ID de rastreo.");
        setIsLoading(false);
        return;
      }
      setOrder(checkResponse.data);
    } catch (err) {
      setError(err.response?.data?.message || "Error al rastrear el pedido. Intenta de nuevo más tarde.");
      console.error("Error en la solicitud:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (order && order.status === "Incompleto") {
      setShowNotification(true);
      const timer = setTimeout(() => setShowNotification(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [order]);

  const handleCopyId = () => {
    navigator.clipboard.writeText(order.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const enhancedHistory = order
    ? [
        {
          estadoNuevo: "Confirmado",
          estadoAnterior: "Inicio",
          fecha: order.fechaInicio,
          descripcion: "El pedido fue creado y está confirmado",
        },
        ...(order.history || []),
      ]
    : [];

  return (
    <div className="min-h-screen to-gray-200 dark:from-gray-800 dark:to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl font-extrabold text-gray-900 dark:text-white text-center mb-8"
        >
          Rastreo de Pedidos
        </motion.h1>

        {!order && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sm:p-8 border border-gray-200 dark:border-gray-700"
          >
            <p className="text-center text-gray-600 dark:text-gray-300 mb-6">
              Ingresa tu ID de rastreo para seguir el estado de tu pedido en tiempo real.
            </p>
            <form onSubmit={handleTrackOrder} className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                value={idRastreo}
                onChange={(e) => setIdRastreo(e.target.value)}
                placeholder="Ingresa tu ID de rastreo (ej. ROMERO-12345)"
                className="w-full sm:w-3/4 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 transition"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !idRastreo.trim()}
                className="w-full sm:w-auto px-6 py-3 bg-yellow-500 text-white rounded-lg font-semibold hover:bg-yellow-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                ) : (
                  <>
                    <span>Rastrear</span>
                    <PaperAirplaneIcon className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg p-3 text-center text-sm text-red-600 dark:text-red-300"
              >
                {error}
              </motion.div>
            )}
          </motion.div>
        )}

        <AnimatePresence>
          {order && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sm:p-8 border border-gray-200 dark:border-gray-700 mt-8"
            >
              <AnimatePresence>
                {showNotification && order.status === "Incompleto" && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 rounded-lg p-4 mb-6 flex items-center gap-3"
                  >
                    <FontAwesomeIcon icon={faExclamationTriangle} className="text-yellow-600 w-5 h-5" />
                    <p className="text-sm text-gray-900 dark:text-gray-100">
                      Por favor, regresa el producto faltante para completar el pedido.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  Detalles del Pedido
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      ID de Rastreo:
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                      {order.id}
                      <button
                        onClick={handleCopyId}
                        className="text-yellow-500 hover:text-yellow-600 transition"
                        title="Copiar ID"
                      >
                        <ClipboardCopyIcon className="w-5 h-5" />
                      </button>
                      {copied && (
                        <span className="text-xs text-green-500">¡Copiado!</span>
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Estado:
                    </span>
                    <span
                      className={`${statusConfig[order.status]?.color || "text-gray-600"} text-sm font-medium`}
                    >
                      {statusConfig[order.status]?.label || order.status || "Desconocido"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Fecha de entrega:
                    </span>
                    <span className="text-sm text-gray-900 dark:text-white">
                      {new Date(order.fechaInicio).toLocaleDateString("es-ES", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  {order.fechaEntrega && (
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                         Fecha de devolución :
                      </span>
                      <span className="text-sm text-gray-900 dark:text-white">
                        {new Date(order.fechaEntrega).toLocaleDateString("es-ES", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  )}
                  {order.totalPagar && (
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Total a Pagar:
                      </span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        ${parseFloat(order.totalPagar).toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="relative">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Progreso del Pedido
                </h3>
                <div className="flex items-center justify-between relative">
                  {enhancedHistory.map((step, index) => {
                    const stateKey = step.estadoNuevo.replace(" ", "_");
                    const config =
                      statusConfig[stateKey] ||
                      { icon: ClockIcon, color: "text-gray-600", label: "Desconocido" };
                    const Icon = config.icon;
                    const isCurrent = step.estadoNuevo === order.status;
                    const isCompleted = index < enhancedHistory.findIndex((s) => s.estadoNuevo === order.status);
                    return (
                      <div key={index} className="flex-1 flex flex-col items-center relative z-10">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: index * 0.1 }}
                          className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            isCurrent
                              ? "bg-yellow-500 shadow-lg"
                              : isCompleted
                              ? "bg-green-500"
                              : "bg-gray-300 dark:bg-gray-600"
                          }`}
                        >
                          <Icon
                            className={`w-6 h-6 ${isCurrent || isCompleted ? "text-white" : config.color}`}
                          />
                        </motion.div>
                        <span className="text-xs text-gray-600 dark:text-gray-400 mt-2 text-center">
                          {config.label}
                        </span>
                        {index < enhancedHistory.length - 1 && (
                          <div
                            className={`absolute top-6 left-1/2 w-full h-1 ${
                              isCompleted ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"
                            }`}
                            style={{ transform: "translateX(50%)", zIndex: -1 }}
                          ></div>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="mt-6">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowDetails(!showDetails)}
                    className="w-full sm:w-auto px-6 py-2 bg-yellow-500 text-white rounded-lg font-semibold hover:bg-yellow-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <span>{showDetails ? "Ocultar Detalles" : "Ver Detalles"}</span>
                    {showDetails ? <RefreshIcon className="w-5 h-5" /> : <ChevronDownIcon className="w-5 h-5" />}
                  </motion.button>
                  <AnimatePresence>
                    {showDetails && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-4 space-y-6"
                      >
                        {enhancedHistory.map((step, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-start gap-4"
                          >
                            <div className="w-3 h-3 rounded-full bg-yellow-500 mt-1.5"></div>
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {step.descripcion}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {new Date(step.fecha).toLocaleString("es-ES", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            </div>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setOrder(null);
                  setIdRastreo("");
                }}
                className="mt-8 w-full sm:w-auto px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
              >
                <span>Nuevo Rastreo</span>
                <RefreshIcon className="w-5 h-5" />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          whileHover={{ scale: 1.02, boxShadow: "0 8px 20px rgba(252, 185, 0, 0.2)" }}
          transition={{ duration: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sm:p-8 text-center mt-8 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex justify-center mb-4">
            <FontAwesomeIcon icon={faUserPlus} className="w-8 h-8 text-yellow-500 dark:text-yellow-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
            ¡Únete a Alquiladora Romero!
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            Regístrate para gestionar tus pedidos y recibir notificaciones en tiempo real.
          </p>
          <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.3 }}>
            <Link
              to="/registro"
              className="inline-block bg-yellow-500 text-white font-semibold py-3 px-8 rounded-lg hover:bg-yellow-600 transition-colors"
            >
              Regístrate
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default RastrearPedido;