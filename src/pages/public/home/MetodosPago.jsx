import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaCcVisa, FaCcMastercard, FaCcAmex, FaCcPaypal } from "react-icons/fa";
import { SiMercadopago } from "react-icons/si";

const paymentOptions = [
  { icon: <FaCcVisa className="text-blue-600" />, name: "Visa" },
  { icon: <FaCcMastercard className="text-red-600" />, name: "Mastercard" },
  { icon: <FaCcAmex className="text-blue-400" />, name: "American Express" },
  { icon: <FaCcPaypal className="text-blue-700" />, name: "PayPal" },
  { icon: <SiMercadopago className="text-blue-500" />, name: "Mercado Pago" },
];

const PaymentMethods = () => {
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
        className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-8"
      >
        Aceptamos Pagos Con Tarjeta
      </motion.h2>
      
      <motion.div 
        className="flex flex-wrap justify-center gap-6 max-w-4xl mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ staggerChildren: 0.2 }}
      >
        {paymentOptions.map((option, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 flex flex-col items-center w-28 sm:w-32 hover:shadow-xl transition-shadow duration-300"
          >
            <div className="text-3xl sm:text-4xl mb-3">{option.icon}</div>
            <p className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-white text-center">
              {option.name}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default PaymentMethods;
