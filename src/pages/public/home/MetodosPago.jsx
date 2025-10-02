import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

import { FaCcVisa, FaCcMastercard, FaCcAmex, FaCcDiscover, FaCcJcb, FaCcDinersClub } from "react-icons/fa";


const stripeCardBrands = [
  { icon: <FaCcVisa className="text-blue-600" />, name: "Visa" },
  { icon: <FaCcMastercard className="text-red-600" />, name: "Mastercard" },
  { icon: <FaCcAmex className="text-blue-400" />, name: "American Express" },
  { icon: <FaCcDiscover className="text-orange-500" />, name: "Discover" },
  { icon: <FaCcJcb className="text-indigo-600" />, name: "JCB" },
  { icon: <FaCcDinersClub className="text-yellow-600" />, name: "Diners Club" },
];

const StripePaymentMethods = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center py-12 dark:bg-gray-950 text-center px-4">
      <motion.h2 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-2xl sm:text-3xl font-extrabold text-gray-800 dark:text-white mb-4"
      >
        Pagos Seguros Procesados por Stripe
      </motion.h2>

      <p className="text-sm text-gray-600 dark:text-gray-400 mb-8">
        Aceptamos las principales tarjetas de crédito y débito a nivel mundial.
      </p>
      
      <motion.div 
        className="flex flex-wrap justify-center gap-4 sm:gap-6 max-w-4xl mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ staggerChildren: 0.1, duration: 0.5 }}
      >
        {stripeCardBrands.map((option, index) => (
          <motion.div
            key={index}
            // Efecto de elevación sutil al pasar el mouse
            whileHover={{ y: -5, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-5 flex flex-col items-center justify-center w-28 h-28 border border-gray-200 dark:border-gray-700 transition-shadow duration-300 transform"
          >
            {/* Ícono de la tarjeta: más grande y visible */}
            <div className="text-5xl sm:text-6xl mb-2">
              {option.icon}
            </div>
            {/* Nombre de la tarjeta: más discreto pero claro */}
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-widest">
              {option.name}
            </p>
          </motion.div>
        ))}
      </motion.div>

      <div className="mt-8 text-sm text-gray-500 dark:text-gray-400 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        Tu información de pago está segura con el cifrado de Stripe.
      </div>

    </div>
  );
};

export default StripePaymentMethods;