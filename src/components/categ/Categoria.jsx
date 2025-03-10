import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const Categoria = ({ categories, borderRadius = "12px" }) => {
  return (
    <div className="w-full py-4 px-4 dark:bg-gray-950 dark:text-white">
      {/* Título */}
      <h2 className="text-4xl font-bold text-[#fcb900] text-center mb-6">
        Categorías
      </h2>

      {/* Contenedor de categorías */}
      <div className="overflow-x-auto flex space-x-6 py-4 px-4 rounded-lg dark:bg-gray-950 justify-center">
        {categories.map((category, index) => (
          <motion.div
            key={index}
            className="flex-none shadow-lg overflow-hidden transform transition-all hover:shadow-xl"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 600, damping: 20 }}
            style={{ borderRadius: borderRadius }}
          >
            <div className="relative">
              {/* Imagen de la categoría */}
              <img
                src={category.image}
                alt={category.name}
                className="w-40 h-24 object-cover rounded-t-xl mx-auto"
              />

              {/* Superposición con el nombre de la categoría */}
              <motion.div
                className="absolute inset-0 bg-black/50 flex justify-center items-center rounded-t-xl"
                initial={{ opacity: 0 }} 
                whileHover={{ opacity: 1 }} 
                transition={{ duration: 0.3 }} 
              >
                <h3 className="text-lg text-yellow-500 font-bold text-center px-2">
                  {category.name}
                </h3>
              </motion.div>
            </div>

            {/* Botón "Ver catálogo" */}
            <Link
              to={`/catalogo/${category.name}`}  // Usamos Link para redirigir
            >
              <button className="w-full py-2 bg-yellow-500 text-white font-semibold rounded-b-xl hover:bg-yellow-600 transition-all text-sm">
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