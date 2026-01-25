import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCheck, FaHome, FaShoppingBag } from 'react-icons/fa';
import { motion } from 'framer-motion';
import Confetti from 'react-confetti';

const MensajeCompraExitosa = () => {
  const navigate = useNavigate();

  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    window.addEventListener('resize', handleResize);

    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 6000);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, []);

  const handleVolverInicio = () => {
    navigate('/cliente');
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 20,
        duration: 0.6,
      },
    },
  };

  const checkVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: {
      scale: 1,
      rotate: 0,
      transition: { delay: 0.3, type: 'spring', stiffness: 200 },
    },
  };

  return (
    <div className="relative min-h-screen w-full bg-gray-50 dark:bg-gray-900 overflow-hidden flex items-center justify-center p-4">
      <Confetti
        width={windowSize.width}
        height={windowSize.height}
        recycle={showConfetti}
        numberOfPieces={500}
        gravity={0.15}
        colors={['#EAB308', '#3B82F6', '#10B981', '#F43F5E']}
      />

      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-yellow-300/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-blue-300/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-pink-300/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-md bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700 p-8 text-center"
      >
        <div className="flex justify-center mb-6">
          <motion.div
            className="relative flex items-center justify-center w-24 h-24 rounded-full bg-green-100 dark:bg-green-900/30 shadow-inner"
            variants={checkVariants}
          >
            <div className="absolute inset-0 rounded-full border-4 border-green-500/20 animate-ping"></div>

            <FaCheck className="text-5xl text-green-500 dark:text-green-400" />
          </motion.div>
        </div>

        {/* Textos */}
        <h1 className="text-3xl sm:text-4xl font-black text-gray-800 dark:text-white mb-2 tracking-tight">
          ¡Pedido Exitoso!
        </h1>

        <p className="text-gray-600 dark:text-gray-300 text-base sm:text-lg mb-6 leading-relaxed">
          Tu alquiler ha sido confirmado correctamente.{' '}
          <br className="hidden sm:block" />
          ¡Estamos listos para tu evento!
        </p>

        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mb-8 border border-gray-100 dark:border-gray-600">
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <FaShoppingBag />
            <span>Gracias por tu confianza</span>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleVolverInicio}
          className="w-full py-4 px-6 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-white text-lg font-bold rounded-2xl shadow-lg shadow-yellow-500/30 flex items-center justify-center gap-2 transition-all duration-300"
        >
          <FaHome className="text-xl" />
          Volver al Inicio
        </motion.button>
      </motion.div>
    </div>
  );
};

export default MensajeCompraExitosa;
