import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { RefreshCw } from "lucide-react"; // Ícono de recarga

const Error500 = () => {
  const refreshPage = () => {
    window.location.reload();
  };

  return (
    <div className="flex justify-center min-h  bg-white dark:bg-gray-950 dark:text-white">
      <div className="text-center px-6 py-10 max-w-screen-md w-full">
        {/* Ícono personalizado (error 500) */}
        <motion.div
          className="flex justify-center mb-6"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
        >
          {/* Usando una imagen de error 500 */}
          <img
            src="https://image.freepik.com/free-vector/500-internal-server-error-concept-illustration_114360-1924.jpg"
            alt="Error 500"
            className="w-44 h-44 md:w-50 md:h-50"
          />
        </motion.div>

        {/* Título 500 con animación y color actualizado */}
        <motion.h1
          className="text-6xl md:text-8xl font-extrabold text-[#ff4d4f] drop-shadow-lg"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          500
        </motion.h1>

        {/* Subtítulo descriptivo con color negro */}
        <motion.p
          className="mt-2 text-xl md:text-2xl text-black dark:text-gray-300 font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          ¡Ups! Algo salió mal en el servidor.
        </motion.p>

        {/* Mensaje adicional */}
        <motion.p
          className="mt-4 text-lg text-gray-600 dark:text-gray-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          Estamos trabajando para solucionarlo. Por favor, inténtalo de nuevo más tarde.
        </motion.p>

        {/* Botones de navegación */}
        <motion.div
          className="mt-8 flex flex-col sm:flex-row justify-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          <Link
            to="/"
            className="px-6 py-3 text-sm font-semibold text-[#ff4d4f] bg-white border-2 border-[#ff4d4f] rounded-full shadow-md hover:bg-[#ff4d4f] hover:text-white transition-all"
          >
            Volver al Inicio
          </Link>
          <button
            onClick={refreshPage}
            className="px-6 py-3 text-sm font-semibold text-[#ff4d4f] bg-white border-2 border-[#ff4d4f] rounded-full shadow-md hover:bg-[#ff4d4f] hover:text-white transition-all"
          >
            <RefreshCw className="inline-block mr-2" /> Refrescar Página
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default Error500;