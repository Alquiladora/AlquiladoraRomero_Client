import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaHome } from 'react-icons/fa'; // Cambiado FaArrowLeft por FaHome para un sentido más claro
import { motion } from 'framer-motion'; // Para añadir animaciones sutiles

const MensajeCompraExitosa = () => {
  const navigate = useNavigate();

  const handleVolverInicio = () => {
    navigate('/'); // Redirigir a la página principal
  };

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
  };

  const iconVariants = {
    hidden: { scale: 0 },
    visible: {
      scale: 1,
      transition: { duration: 0.6, type: 'spring', stiffness: 100 },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-950 dark:to-gray-800 flex flex-col items-center justify-center py-10 px-4 sm:px-6 lg:px-8">
      {/* Contenedor principal con animaciones */}
      <motion.div
        className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 sm:p-10 lg:p-12 text-center border-t-4 border-yellow-500 dark:border-yellow-400 transform transition-all duration-300"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Icono de éxito con animación */}
        <motion.div variants={iconVariants}>
          <FaCheckCircle
            size={80}
            className="text-yellow-500 dark:text-yellow-400 mx-auto mb-6 drop-shadow-lg"
          />
        </motion.div>

        {/* Título */}
        <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-gray-100 mb-3 leading-tight">
          ¡Alquiler Confirmado!
        </h2>

        {/* Mensaje principal */}
        <p className="text-lg sm:text-xl text-gray-700 dark:text-gray-300 mb-8 leading-relaxed">
          Tu alquiler ha sido procesado con éxito.
        </p>

        <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 mb-8">
          ¡Gracias por elegirnos para tus eventos! Esperamos verte pronto.
        </p>

        {/* Botón de acción mejorado */}
        <button
          onClick={handleVolverInicio}
          className="inline-flex items-center justify-center mx-auto bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-yellow-300 dark:focus:ring-yellow-600"
        >
          <FaHome className="mr-3 text-lg" /> {/* Icono de casa */}
          Volver al Inicio
        </button>
      </motion.div>
    </div>
  );
};

export default MensajeCompraExitosa;
