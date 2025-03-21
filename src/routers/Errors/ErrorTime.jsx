import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle } from 'lucide-react';

const ServerErrorModal = () => {
  const [visible, setVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  useEffect(() => {
    const handleSlowConnectionError = () => {
      setModalMessage("La red está muy lenta o no hay conexión a Internet.");
      setVisible(true);
    };

    const handleTimeoutError = () => {
      setModalMessage("El servidor no respondió a tiempo.");
      setVisible(true);
    };

    window.addEventListener("slow-connection-error", handleSlowConnectionError);
    window.addEventListener("timeout-error", handleTimeoutError);

    // Limpiar los listeners al desmontar el componente.
    return () => {
      window.removeEventListener("slow-connection-error", handleSlowConnectionError);
      window.removeEventListener("timeout-error", handleTimeoutError);
    };
  }, []);

  // Cierra el modal.
  const handleClose = () => {
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="relative max-w-sm w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <button
              onClick={handleClose}
              className="absolute top-3 right-3 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition"
              aria-label="Cerrar"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="flex flex-col items-center">
              <div className="mb-4">
                <AlertTriangle className="w-16 h-16 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                Problema de Conexión
              </h2>
              <p className="text-center text-gray-700 dark:text-gray-300 mb-4">
                {modalMessage}
              </p>
              <button
                onClick={handleClose}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition"
              >
                Cerrar
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ServerErrorModal;
