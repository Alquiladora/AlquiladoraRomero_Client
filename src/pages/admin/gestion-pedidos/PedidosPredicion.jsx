import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faExclamationTriangle, faCheckCircle, faBrain, faSync } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import api from "../../../utils/AxiosConfig";
import { useAuth } from "../../../hooks/ContextAuth";

// Componente para la barra de probabilidad, para una mejor visualización
const ProbabilityBar = ({ probability }) => {
    const percentage = (probability * 100).toFixed(1);
    let barColor = "bg-green-500";
    let textColor = "text-white";
    if (probability > 0.75) {
        barColor = "bg-red-500";
    } else if (probability > 0.4) {
        barColor = "bg-yellow-500";
        textColor = "text-black";
    }

    return (
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-6 relative my-2">
            <div
                className={`h-6 rounded-full transition-all duration-500 ${barColor}`}
                style={{ width: `${percentage}%` }}
            ></div>
            <span className={`absolute inset-0 flex items-center justify-center text-sm font-bold ${textColor}`}>
                {percentage}%
            </span>
        </div>
    );
};


const PredictCancelModal = ({ pedido, onClose }) => {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { csrfToken } = useAuth();

  // La función ahora se llama con un evento de clic, no en useEffect
  const handleFetchPrediction = async () => {
    if (!pedido || !pedido.idRastreo) return;

    try {
      setLoading(true);
      setError(null);
      setPrediction(null); // Limpiar predicción anterior

      // Usamos el endpoint que ya funciona para todos los pedidos
      // y filtramos el resultado para este pedido en específico.
      // O, si tienes un endpoint para un solo pedido, úsalo aquí.
      // Por ahora, asumiré que el endpoint es /api/pedidos/predict-cancel
      const response = await api.post(
        "/api/pedidos/predecir-pedidos-activos", // Asegúrate de que este endpoint exista y funcione para un solo pedido
        { idRastreo: pedido.idRastreo },
        {
          headers: { "X-CSRF-Token": csrfToken },
          withCredentials: true,
          timeout: 30000, // Timeout de 30 segundos
        }
      );
      const result = response.data;

      if (result.success && result.prediction) {
        setPrediction(result.prediction);
      } else {
        throw new Error(result.error || "No se recibió una predicción válida.");
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || "Error al conectar con el servidor";
      setError(errorMessage);
      toast.error("No se pudo obtener la predicción");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-2xl shadow-2xl p-6 transform transition-all duration-300 scale-100">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center">
            <FontAwesomeIcon icon={faBrain} className="mr-3 text-purple-500" />
            Análisis Predictivo
          </h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-red-500 dark:text-gray-300 dark:hover:text-red-400 transition"
            aria-label="Cerrar modal"
          >
            <FontAwesomeIcon icon={faTimes} size="lg" />
          </button>
        </div>
        <div className="space-y-4 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Pedido ID: <span className="font-semibold bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{pedido?.idRastreo || "N/A"}</span>
          </p>
          
          {/* Área de resultados */}
          <div className="min-h-[120px] flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            {!loading && !error && !prediction && (
              <div className="text-center">
                 <p className="text-gray-600 dark:text-gray-400 mb-4">Haz clic en el botón para analizar el riesgo de cancelación del pedido.</p>
                 <button
                    onClick={handleFetchPrediction}
                    disabled={loading}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:scale-105 transform transition-all duration-300 flex items-center justify-center w-full"
                >
                    <FontAwesomeIcon icon={faBrain} className="mr-2" />
                    Predecir Cancelación
                </button>
              </div>
            )}
            {loading && (
              <div className="flex flex-col items-center justify-center">
                <FontAwesomeIcon icon={faSync} className="text-purple-500 text-4xl animate-spin" />
                <p className="mt-3 text-purple-600 dark:text-purple-300">Analizando...</p>
              </div>
            )}
            {error && (
              <div className="text-red-600 dark:text-red-400">
                <FontAwesomeIcon icon={faExclamationTriangle} className="text-4xl mb-2" />
                <p className="font-semibold">Error</p>
                <p className="text-sm">{error}</p>
              </div>
            )}
            {prediction && (
              <div className="w-full text-center animate-fade-in">
                <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                  Probabilidad de Cancelación:
                </p>
                <ProbabilityBar probability={prediction.probabilidad_de_cancelacion} />
                <div className={`mt-2 text-xl font-bold ${
                    prediction.prediccion_clase === 1 ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"
                }`}>
                  <FontAwesomeIcon
                    icon={prediction.prediccion_clase === 1 ? faExclamationTriangle : faCheckCircle}
                    className="mr-2"
                  />
                  {prediction.prediccion_texto}
                </div>
              </div>
            )}
          </div>

          {/* Botón para cerrar */}
          <button
            onClick={onClose}
            className="w-full mt-4 bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-200 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default PredictCancelModal;
