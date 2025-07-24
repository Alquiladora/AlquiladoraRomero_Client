import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaCheckCircle, FaArrowLeft } from "react-icons/fa";

const MensajeCompraExitosa = () => {
  const { trackingId } = useParams(); // Obtener el trackingId de los parámetros de la URL
  const navigate = useNavigate();

  const handleVolverInicio = () => {
    navigate("/"); // Redirigir a la página principal
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col items-center justify-center py-6 px-4 transition-colors duration-300">
      {/* Contenedor principal */}
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 sm:p-8 text-center">
        {/* Mensaje de éxito */}
        <FaCheckCircle size={60} className="text-yellow-500 dark:text-yellow-400 mx-auto mb-4" />
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-gray-100 mb-2">
          ¡Alquiler Confirmado!
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
          Tu alquiler #{trackingId} ha sido procesado correctamente. ¡Gracias por elegirnos!
        </p>

        {/* Botón de acción */}
        <button
          onClick={handleVolverInicio}
          className="flex items-center justify-center mx-auto bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-100 font-semibold py-3 px-6 rounded-lg transition-colors duration-300"
        >
          <FaArrowLeft className="mr-2" />
          Volver
        </button>
      </div>
    </div>
  );
};

export default MensajeCompraExitosa;