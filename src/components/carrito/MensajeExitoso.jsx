import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaCheckCircle, FaArrowLeft, FaBoxOpen } from "react-icons/fa";
import { IoIosArrowForward } from "react-icons/io";

const MensajeCompraExitosa = () => {
  const { trackingId } = useParams(); // Obtener el trackingId de los parámetros de la URL
  const navigate = useNavigate();

  const handleVolverInicio = () => {
    navigate("/"); // Redirigir a la página principal
  };

  const handleVerMisAlquileres = () => {
    navigate("/mis-alquileres"); // Redirigir a la página de alquileres del usuario
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col items-center py-6 px-4 transition-colors duration-300">
      {/* Encabezado inspirado en Mercado Libre */}
      <header className="w-full max-w-5xl flex items-center justify-between mb-6 px-4">
        <button
          onClick={handleVolverInicio}
          className="flex items-center text-gray-600 dark:text-gray-300 hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors"
        >
          <FaArrowLeft className="mr-2" />
          Volver
        </button>
        <div className="text-gray-600 dark:text-gray-300 text-sm">
          <span>Alquiler #{trackingId}</span>
        </div>
      </header>

      {/* Contenedor principal */}
      <div className="w-full max-w-5xl bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 sm:p-8">
        {/* Mensaje de éxito */}
        <div className="text-center mb-8">
          <FaCheckCircle size={60} className="text-yellow-500 dark:text-yellow-400 mx-auto mb-4" />
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-gray-100 mb-2">
            ¡Alquiler Confirmado!
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Tu alquiler ha sido procesado correctamente. ¡Gracias por elegirnos!
          </p>
        </div>

        {/* Detalles del alquiler */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-center mb-4">
            <FaBoxOpen size={30} className="text-yellow-500 dark:text-yellow-400 mr-2" />
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
              Detalles de tu alquiler
            </h3>
          </div>
          <div className="text-gray-700 dark:text-gray-300 space-y-2">
            <p>
              <strong>Número de seguimiento:</strong> #{trackingId}
            </p>
            <p>
              <strong>Dirección de entrega:</strong> Calle Benito Juarez S/N
            </p>
            <p>
              <strong>Fecha de inicio:</strong> 31 de marzo
            </p>
            <p>
              <strong>Fecha de devolución:</strong> 4 de abril
            </p>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button
            onClick={handleVerMisAlquileres}
            className="flex items-center justify-center bg-yellow-500 dark:bg-yellow-400 hover:bg-yellow-600 dark:hover:bg-yellow-500 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-300"
          >
            Ver mis alquileres
            <IoIosArrowForward className="ml-2" />
          </button>
          <button
            onClick={handleVolverInicio}
            className="flex items-center justify-center bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-100 font-semibold py-3 px-6 rounded-lg transition-colors duration-300"
          >
            Volver al inicio
          </button>
        </div>
      </div>

      {/* Sección de recomendaciones (inspirada en Mercado Libre) */}
      <div className="w-full max-w-5xl mt-8">
        <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
          Otros productos que podrían interesarte
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Tarjeta de producto 1 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
            <img
              src="https://http2.mlstatic.com/D_NQ_NP_2X_614606-MLM75509369781_042024-F.webp"
              alt="Vestido rojo"
              className="w-full h-48 object-cover rounded-lg mb-4"
            />
            <p className="text-gray-700 dark:text-gray-300 font-semibold">$199</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Vestido rojo elegante</p>
          </div>
          {/* Tarjeta de producto 2 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
            <img
              src="https://http2.mlstatic.com/D_NQ_NP_2X_614606-MLM75509369781_042024-F.webp"
              alt="Traje gris"
              className="w-full h-48 object-cover rounded-lg mb-4"
            />
            <p className="text-gray-700 dark:text-gray-300 font-semibold">$263</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Traje gris formal</p>
          </div>
          {/* Tarjeta de producto 3 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
            <img
              src="https://http2.mlstatic.com/D_NQ_NP_2X_614606-MLM75509369781_042024-F.webp"
              alt="Perfume"
              className="w-full h-48 object-cover rounded-lg mb-4"
            />
            <p className="text-gray-700 dark:text-gray-300 font-semibold">$368</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Perfume de lujo</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MensajeCompraExitosa;