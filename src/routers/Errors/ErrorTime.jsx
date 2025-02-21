import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react'; 

const ServerErrorModal = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleServerError = () => {
      setVisible(true);
    };

    window.addEventListener('server-error', handleServerError);
    return () => window.removeEventListener('server-error', handleServerError);
  }, []);

  const handleClose = () => {
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="relative bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-sm w-full mx-4"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Botón de cerrar en la esquina superior derecha */}
            <button 
              onClick={handleClose} 
              className="absolute top-2 right-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center">
              {/* Ícono de advertencia */}
              <div className="mb-4">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-16 w-16 text-red-500" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M5.121 19.364A9 9 0 1118.879 4.636 9 9 0 015.121 19.364z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold mb-2 text-gray-800 dark:text-white">
                Lo sentimos...
              </h2>
              <p className="text-gray-700 dark:text-gray-300 text-center mb-4">
                La página tardó en responder. Verifica que tu conexión a Internet esté activa.
              </p>
              <button
                onClick={handleClose}
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
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
