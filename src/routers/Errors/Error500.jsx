import React from "react";
import { motion } from "framer-motion";
import { RefreshCw, PlugZap } from "lucide-react";


const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      staggerChildren: 0.2,
      type: "spring",
      stiffness: 100,
      damping: 12
    }
  }
};


const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};


const plugVariants = {
  animate: {
    rotate: [0, -15, 15, 0],
    transition: {
      repeat: Infinity,
      duration: 3,
      ease: "easeInOut"
    }
  }
};

const Error500 = () => {
  const handleReload = () => {
    window.location.reload();
  };

  return (
    <motion.div
      className="flex flex-col items-center justify-center   dark:bg-black-800"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      
      <motion.div
        className="flex flex-col items-center text-center max-w-4xl mx-auto"
        variants={itemVariants}
      >
      
        <motion.h1
          className="flex items-center gap-3 mb-4"
          variants={itemVariants}
        >
         
          <motion.span variants={plugVariants} animate="animate">
            <PlugZap className="w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 text-yellow-500" />
          </motion.span>

          <span className="text-red-600 font-bold text-5xl md:text-6xl lg:text-8xl">
            500
          </span>

          {/* Ícono de enchufe derecho, rotado */}
          <motion.span variants={plugVariants} animate="animate">
            <PlugZap className="w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 text-yellow-500 rotate-180" />
          </motion.span>
        </motion.h1>

        {/* Subtítulo */}
        <motion.h2
          className="text-xl md:text-2xl lg:text-3xl text-gray-600 dark:text-gray-300 mb-6"
          variants={itemVariants}
        >
          Internal Server Error
        </motion.h2>

        {/* Mensaje descriptivo */}
        <motion.p
          className="max-w-2xl text-base md:text-lg lg:text-xl text-gray-700 dark:text-gray-300 mb-8"
          variants={itemVariants}
        >
          Nuestro servidor encontró un problema inesperado. Por favor, intenta
          recargar la página o vuelve más tarde. Estamos trabajando para
          solucionarlo.
        </motion.p>

        {/* Botón para recargar */}
        <motion.button
          onClick={handleReload}
          className="flex items-center gap-2 px-6 py-3 rounded-lg bg-blue-500 text-white
                     hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2
                     focus:ring-blue-400 focus:ring-offset-2 dark:focus:ring-offset-black
                     text-base md:text-lg lg:text-xl"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          variants={itemVariants}
        >
          <RefreshCw className="w-5 h-5" />
          Recargar Página
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default Error500;
