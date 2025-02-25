import React, { useContext } from "react";
import { ServerStatusContext } from "../../utils/ServerStatusContext";
import { useNavigate } from "react-router-dom";
import { RefreshCw, Settings } from "lucide-react";

const Error500 = () => {
  const { isServerOnline } = useContext(ServerStatusContext);
  const navigate = useNavigate();

  // useEffect(() => {
  //   if (isServerOnline) {
  //     navigate("/login");
  //   }
  // }, [isServerOnline, navigate]);

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="flex flex-col justify-center items-center dark:bg-gray-950 dark:text-white h-screen">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-red-500 mb-2">500</h1>
        <h2 className="text-2xl font-semibold mb-2">
          Lo sentimos, ha ocurrido un error en el servidor.
        </h2>
        <p className="text-lg">
          Estamos trabajando para solucionar este problema. Por favor, intenta de nuevo más tarde.
        </p>
      </div>

      <div className="mt-8">
        <Settings className="w-20 h-20 text-blue-500 animate-spin" />
      </div>

      {isServerOnline ? (
        <p className="text-green-500 mt-6">
          Servidor en línea. Puedes recargar la página para continuar.
        </p>
      ) : (
        <p className="text-red-500 mt-6">
          Intentando reconectar con el servidor...
        </p>
      )}

      <button
        onClick={handleReload}
        className="mt-8 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
      >
        <RefreshCw className="w-5 h-5" />
        Recargar Página
      </button>
    </div>
  );
};

export default Error500;
