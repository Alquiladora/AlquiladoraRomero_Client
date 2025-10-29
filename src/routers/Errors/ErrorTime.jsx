import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle } from 'lucide-react';

const ServerErrorModal = () => {
  const [visible, setVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');

  useEffect(() => {
    // Mapea eventos a mensajes y títulos
    const errorMap = {
      'offline-error': {
        title: 'Sin Conexión a Internet',
        message:
          'Parece que tu dispositivo no tiene conexión a Internet. Por favor, verifica tu red e inténtalo de nuevo.',
      },
      'timeout-error': {
        title: 'Conexión Lenta',
        message:
          'La solicitud tardó demasiado en responder. Tu conexión podría ser lenta o el servidor está tardando en responder.',
      },
      'server-unreachable': {
        title: 'Servidor No Disponible',
        message:
          'No se pudo conectar con el servidor. Intenta nuevamente más tarde.',
      },
    };

    // Función genérica para mostrar modal según evento
    const handleErrorEvent = (event) => {
      const { title, message } = errorMap[event.type] || {};
      if (title && message) {
        setModalTitle(title);
        setModalMessage(message);
        setVisible(true);
      }
    };

    // Agrega listeners
    Object.keys(errorMap).forEach((eventName) =>
      window.addEventListener(eventName, handleErrorEvent)
    );

    // Limpia listeners al desmontar
    return () => {
      Object.keys(errorMap).forEach((eventName) =>
        window.removeEventListener(eventName, handleErrorEvent)
      );
    };
  }, []);

  const handleClose = () => setVisible(false);

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
                {modalTitle}
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
