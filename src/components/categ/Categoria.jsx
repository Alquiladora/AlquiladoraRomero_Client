import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/ContextAuth";

const Categoria = ({ categories, borderRadius = "12px" }) => {
  const { user } = useAuth();

  if (!categories || categories.length === 0) {
    return (
      <div className="w-full py-4 px-4 dark:bg-gray-950 dark:text-white flex justify-center items-center h-40">
        <div className="w-10 h-10 xs:w-12 xs:h-12 sm:w-16 sm:h-16 border-4 border-t-4 border-gray-200 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="w-full py-4 px-4 dark:bg-gray-950 dark:text-white">
  
      <h2 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl font-bold text-[#fcb900] text-center mb-3 xs:mb-4 sm:mb-6">
        Categorías
      </h2>


      <div className="overflow-x-auto flex space-x-3 xs:space-x-4 sm:space-x-6 py-3 xs:py-4 px-1 xs:px-2 sm:px-4 rounded-lg dark:bg-gray-950 justify-start sm:justify-center">
        {categories.map((category, index) => (
          <motion.div
            key={index}
            className="flex-none shadow-lg overflow-hidden transform transition-all hover:shadow-xl"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 600, damping: 20 }}
            style={{ borderRadius: borderRadius }}
          >
         
            <div className="relative">
              <img
                src={category.image}
                alt={category.name}
                className="w-24 h-16 xs:w-32 xs:h-20 sm:w-40 sm:h-24 object-cover rounded-t-xl mx-auto"
              />

              <motion.div
                className="absolute inset-0 bg-black/50 flex justify-center items-center rounded-t-xl"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-xs xs:text-sm sm:text-lg text-yellow-500 font-bold text-center px-1 xs:px-2">
                  {category.name}
                </h3>
              </motion.div>
            </div>

       
            <Link
              to={
                user && user.rol === "cliente"
                  ? `/cliente/categoria/${category.name}`
                  : `/categoria/${category.name}`
              }
            >
              <button className="w-full py-1 xs:py-1.5 sm:py-2 bg-yellow-500 text-white font-semibold rounded-b-xl hover:bg-yellow-600 transition-all text-[10px] xs:text-xs sm:text-sm">
                Ver catálogo
              </button>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Categoria;