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
<div className="w-full bg-white dark:bg-gray-950 dark:text-white py-6 px-4">
  <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-yellow-500 text-center mb-8">
    Categorías
  </h2>

  {/* Contenedor centrado */}
  <div className="max-w-6xl mx-auto">
    {/* Scroll horizontal interno */}
    <div className="flex overflow-x-auto no-scrollbar space-x-5 px-2 sm:px-4 scroll-smooth snap-x snap-mandatory">
      {categories.map((category, index) => (
        <motion.div
          key={index}
          className="flex-none w-[140px] sm:w-[180px] bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1 snap-start"
          whileHover={{ scale: 1.04 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
        >
          {/* Imagen */}
          <div className="relative h-24 sm:h-28 overflow-hidden rounded-t-xl">
            <img
              src={category.image}
              alt={category.name}
              className="w-full h-full object-cover"
            />
            <motion.div
              className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-t-xl"
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-xs sm:text-sm text-white font-semibold text-center px-2">
                {category.name}
              </h3>
            </motion.div>
          </div>

          {/* Botón */}
          <Link
            to={
              user?.rol === "cliente"
                ? `/cliente/categoria/${category.name}`
                : `/categoria/${category.name}`
            }
          >
            <button className="w-full py-2 bg-yellow-500 text-white font-medium text-xs sm:text-sm rounded-b-xl hover:bg-yellow-600 transition-colors">
              Ver catálogo
            </button>
          </Link>
        </motion.div>
      ))}
    </div>
  </div>
</div>


  );
};

export default Categoria;