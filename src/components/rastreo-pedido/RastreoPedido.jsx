import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ClockIcon,
  CheckCircleIcon, // For Confirmado
  PaperAirplaneIcon, // For Enviando
  HomeIcon, // For Entregado
  TruckIcon, // For En Alquiler
  RefreshIcon, // For Devuelto
  ExclamationCircleIcon, // For Incompleto
  ExclamationIcon, // For Incidencia
  FlagIcon, // For Finalizado
  BanIcon, // For Cancelado
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

  // Mapping of states to icons and colors
  const statusConfig = {
    Procesando: { icon: ClockIcon, color: "text-gray-500" },
    Confirmado: { icon: CheckCircleIcon, color: "text-green-500" },
    Enviando: { icon: PaperAirplaneIcon, color: "text-blue-500" },
    Entregado: { icon: HomeIcon, color: "text-teal-500" },
    En_Alquiler: { icon: TruckIcon, color: "text-indigo-500" },
    Devuelto: { icon: RefreshIcon, color: "text-purple-500" },
    Incompleto: { icon: ExclamationCircleIcon, color: "text-yellow-500" },
    Incidencia: { icon: ExclamationIcon, color: "text-orange-500" },
    Finalizado: { icon: FlagIcon, color: "text-green-600" },
    Cancelado: { icon: BanIcon, color: "text-red-500" },
  };

  const handleTrackOrder = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Step 1: Check if the idRastreo exists using the new endpoint
      const checkResponse = await api.get(`/api/pedidos/check-id-rastreo/${idRastreo}`);

      if (!checkResponse.data.exists) {
        // If idRastreo does not exist, set an error and stop
        setError("No se encontró un pedido con ese ID de rastreo. Por favor, verifica e intenta de nuevo.");
        setIsLoading(false);
        return;
      }

      // Step 2: If idRastreo exists, proceed to fetch the tracking details
      const trackingResponse = await api.get(`/api/pedidos/rastrear/${idRastreo}`);
      setOrder(trackingResponse.data);
    } catch (err) {
      // Handle errors from either API call
      setError(
        err.response?.data?.message || "Error al rastrear el pedido. Intenta de nuevo más tarde."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (order && order.status === "Incompleto") {
      setShowNotification(true);
      const timer = setTimeout(() => {
        setShowNotification(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [order]);

  return (
    <div className="min-h-screen py-5 px-2 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-2xl sm:text-3xl font-bold text-center text-gray-900 dark:text-white mb-8"
        >
          Rastrear Pedido
        </motion.h1>

        {!order && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sm:p-8 mb-8"
          >
            <form onSubmit={handleTrackOrder} className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                value={idRastreo}
                onChange={(e) => setIdRastreo(e.target.value)}
                placeholder="Ingresa el ID de rastreo (ej. AR-12345)"
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !idRastreo}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <svg
                    className="animate-spin h-5 w-5 text-white mx-auto"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    />
                  </svg>
                ) : (
                  "Rastrear"
                )}
              </button>
            </form>
            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-500 text-sm mt-4 text-center"
              >
                {error}
              </motion.p>
            )}
          </motion.div>
        )}

        <AnimatePresence>
          {order && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.5 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sm:p-8 mb-8 relative"
            >
              <AnimatePresence>
                {showNotification && order.status === "Incompleto" && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                    className="absolute top-4 left-4 right-4 bg-yellow-100 dark:bg-yellow-900/50 border border-yellow-300 dark:border-yellow-700 rounded-lg p-4 flex items-center gap-3 shadow-md"
                  >
                    <FontAwesomeIcon icon={faExclamationTriangle} className="text-yellow-500 w-5 h-5" />
                    <p className="text-sm text-gray-900 dark:text-gray-100">
                      Por favor, regresa el producto faltante para completar el pedido.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Estado Actual: <span className={statusConfig[order.status.replace(" ", "_")].color}>{order.status}</span>
              </h2>

              <div className="relative">
                <div className="absolute left-3 sm:left-4 top-0 bottom-0 w-1 bg-gray-200 dark:bg-gray-700"></div>
                {order.history.map((step, index) => {
                  const Icon = statusConfig[step.state.replace(" ", "_")].icon;
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.2 }}
                      className="relative flex items-start mb-6"
                    >
                      <div className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center z-10">
                        <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${statusConfig[step.state.replace(" ", "_")].color}`} />
                      </div>
                      <div className="ml-4 sm:ml-6 flex-1">
                        <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white">
                          {step.state}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">{step.description}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{step.date}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setOrder(null)}
                className="mt-6 w-full sm:w-auto px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-300"
              >
                Volver a Rastrear
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          whileHover={{ scale: 1.05, boxShadow: "0px 10px 20px rgba(252, 185, 0, 0.4)" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="p-6 text-center dark:text-white transform transition-all"
        >
          <div className="flex justify-center mb-4">
            <FontAwesomeIcon icon={faUserPlus} className="w-8 h-8 sm:w-10 sm:h-10 dark:text-white" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold mb-2">
            ¡Únete a la Familia de Alquiladora Romero!
          </h2>
          <p className="text-sm sm:text-base mb-5">
            Regístrate para gestionar tus pedidos y recibir notificaciones en tiempo real.
          </p>
          <motion.div whileHover={{ scale: 1.1 }} transition={{ duration: 0.3 }}>
            <Link
              to="/registro"
              className="inline-block bg-white text-[#fcb900] font-semibold py-2 px-6 rounded-lg shadow-md hover:bg-gray-200 transition-all duration-300"
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