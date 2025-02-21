import React, { useContext, useEffect, useState } from "react";
import { ServerStatusContext } from "../../utils/ServerStatusContext";
import { RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Error500 = () => {
  const { isServerOnline } = useContext(ServerStatusContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (isServerOnline) {
      navigate("/login");
    }
  }, [isServerOnline, navigate]);

  const goHome = () => {
    navigate("/");
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-white">
      <h1 className="text-6xl font-bold text-red-500">500</h1>
      <p className="mt-4 text-xl">No se puede conectar con el servidor.</p>

      {isServerOnline ? (
        <p className="text-green-500 mt-2">Servidor en línea, redirigiendo...</p>
      ) : (
        <p className="text-red-500 mt-2">Intentando reconectar...</p>
      )}

      <button
        onClick={() => window.location.reload()}
        className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
      >
        <RefreshCw className="w-5 h-5" />
        Recargar Página
      </button>
    </div>
  );
};

export default Error500;
