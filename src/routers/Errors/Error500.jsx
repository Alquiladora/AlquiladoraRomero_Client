import React from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, ServerCrash } from 'lucide-react';


const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 100, damping: 12 },
  },
};

const Error500 = () => {
  const handleReload = () => window.location.replace('/');

  return (
    <div className="relative flex items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8 py-10 sm:py-16 bg-slate-100 dark:bg-slate-900 overflow-hidden">
      {/* Fondo animado */}
      <div className="absolute inset-0 z-0">
        <div className="absolute bottom-0 left-0 -translate-x-1/4 translate-y-1/4 w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 rounded-full bg-red-500/10 dark:bg-red-500/5 blur-3xl animate-pulse-slow"></div>
        <div className="absolute top-0 right-0 translate-x-1/4 -translate-y-1/4 w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 rounded-full bg-blue-500/10 dark:bg-blue-500/5 blur-3xl animate-pulse-slow animation-delay-4000"></div>
      </div>

      <motion.div
        className="relative z-10 flex flex-col items-center text-center max-w-2xl w-full p-6 sm:p-8 md:p-10 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-2xl ring-1 ring-slate-900/5"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Ícono Central */}
        <motion.div
          className="relative mb-6 flex items-center justify-center"
          variants={itemVariants}
        >
          <div className="absolute inset-0 bg-red-500/10 rounded-full blur-xl animate-pulse-slow"></div>
          <div className="relative flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 bg-white dark:bg-slate-800 rounded-full shadow-inner ring-1 ring-slate-200 dark:ring-slate-700">
            <ServerCrash
              className="w-10 h-10 sm:w-12 sm:h-12 text-red-500"
              strokeWidth={1.5}
            />
          </div>
        </motion.div>

        {/* Texto */}
        <motion.h1
          className="text-6xl sm:text-7xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-br from-slate-700 to-slate-900 dark:from-slate-200 dark:to-slate-400 mb-2"
          variants={itemVariants}
        >
          500
        </motion.h1>

        <motion.h2
          className="text-lg sm:text-xl md:text-2xl font-bold text-slate-800 dark:text-white mb-4"
          variants={itemVariants}
        >
          Oops, algo salió mal en el servidor.
        </motion.h2>

        <motion.p
          className="max-w-md text-sm sm:text-base md:text-lg text-slate-600 dark:text-slate-300 mb-6 sm:mb-8"
          variants={itemVariants}
        >
          Nuestro equipo ha sido notificado y estamos trabajando para
          solucionarlo. Por favor, intenta regresar al inicio.
        </motion.p>

        {/* Botón */}
        <motion.button
          onClick={handleReload}
          aria-label="Volver al inicio"
          className="flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-full bg-gradient-to-r from-slate-800 to-slate-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-slate-500/50"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          variants={itemVariants}
        >
          <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
          Volver al Inicio
        </motion.button>
      </motion.div>

      {/* Animaciones */}
      <style jsx global>{`
        @keyframes pulse-slow {
          50% {
            opacity: 0.5;
          }
        }
        .animate-pulse-slow {
          animation: pulse-slow 8s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default Error500;
