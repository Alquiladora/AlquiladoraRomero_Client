import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { RefreshCw } from "lucide-react"; // Ícono de recarga

const Error404 = () => {
  const refreshPage = () => {
    window.location.reload();
  };

  return (
    <div className="flex justify-center min-h-screen bg-white dark:bg-gray-950 dark:text-white">
      <div className="text-center px-6 py-10 max-w-screen-md w-full">
        {/* Ícono personalizado (error 404) */}
        <motion.div
          className="flex justify-center mb-6"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
        >
          {/* Usando una imagen de error 404 */}
          <img
            src="https://image.freepik.com/free-vector/404-error-page-found_24908-50943.jpg"
            alt="Error 404"
            className="w-64 h-64 md:w-80 md:h-80"
          />
        </motion.div>

        {/* Título 404 con animación y color actualizado */}
        <motion.h1
          className="text-6xl md:text-8xl font-extrabold text-[#fcb900] drop-shadow-lg"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          404
        </motion.h1>

        {/* Subtítulo descriptivo con color negro */}
        <motion.p
          className="mt-2 text-xl md:text-2xl text-black dark:text-gray-300 font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          ¡Oops! Página no encontrada.
        </motion.p>

        {/* Mensaje adicional */}
        <motion.p
          className="mt-4 text-lg text-gray-600 dark:text-gray-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          Parece que la página que buscas no existe o ha sido movida.
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
            className="px-6 py-3 text-sm font-semibold text-[#fcb900] bg-white border-2 border-[#fcb900] rounded-full shadow-md hover:bg-[#fcb900] hover:text-white transition-all"
          >
            Volver al Inicio
          </Link>
          <button
            onClick={refreshPage}
            className="px-6 py-3 text-sm font-semibold text-[#fcb900] bg-white border-2 border-[#fcb900] rounded-full shadow-md hover:bg-[#fcb900] hover:text-white transition-all"
          >
            <RefreshCw className="inline-block mr-2" /> Refrescar Página
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default Error404;