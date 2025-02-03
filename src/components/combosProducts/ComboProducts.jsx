import { motion, useAnimation } from "framer-motion";
import { useState, useEffect } from "react";
import { useInView } from "react-intersection-observer";

const ComboProducts = ({ products = [] }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [subtitle, setSubtitle] = useState("¡Porque somos los mejores en lo que hacemos!");
  const itemsPerPage = 8;

  const validProducts = Array.isArray(products) ? products : [];

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = validProducts.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  useEffect(() => {
    const interval = setInterval(() => {
      setSubtitle((prev) =>
        prev === "¡Porque somos los mejores en lo que hacemos!"
          ? "¡Calidad y servicio garantizado!"
          : "¡Alquiladora Romero!"
      );
    }, 2000); // Cambia cada 2 segundos
    return () => clearInterval(interval);
  }, []);

  const controls = useAnimation();
  const [ref, inView] = useInView({ triggerOnce: true });

  useEffect(() => {
    if (inView) {
      controls.start({ opacity: 1, y: 0 });
    }
  }, [controls, inView]);

  useEffect(() => {
    controls.start({ opacity: 0, y: 50 }).then(() => {
      controls.start({ opacity: 1, y: 0 });
    });
  }, [currentPage, controls]);

  return (
    <div className="w-full py-6  dark:bg-gray-950 dark:text-white">
      <div className="text-center mb-8">
        <motion.h2
          className="text-4xl font-bold text-[#fcb900] mb-2"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
         Paquetes Mobiliarios para Eventos
        </motion.h2>
        <motion.div
          key={subtitle}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-lg text-gray-700 dark:text-gray-300">
            {subtitle}
          </p>
        </motion.div>
      </div>

      {currentItems.length > 0 ? (
        <div
          ref={ref}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-4"
        >
          {currentItems.map((product, index) => (
            <motion.div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden p-4 transition-all hover:shadow-xl relative"
              initial={{ opacity: 0, y: 50 }}
              animate={controls}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ scale: 1.05 }}
            >
              <motion.img
                src={product.image}
                alt={product.name}
                className="w-full h-32 object-cover rounded-lg mb-4"
                whileHover={{ opacity: 0.8 }}
                transition={{ duration: 0.3 }}
              />
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                {product.name}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {product.description}
              </p>

              <motion.div
                className="absolute inset-0 bg-black bg-opacity-80 flex flex-col justify-center items-center p-4 rounded-xl opacity-0 hover:opacity-100 transition-opacity duration-300"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
              >
                <h3 className="text-xl font-bold text-white mb-2">
                  {product.name}
                </h3>
                <p className="text-gray-300 text-center mb-4">
                  {product.details || "Detalles adicionales del producto."}
                </p>
                <button
                  className="mt-2 py-2 px-4 bg-[#fcb900] text-white font-semibold rounded-lg hover:bg-[#e0a800] transition-all"
                >
                  Ver más detalles
                </button>
              </motion.div>
            </motion.div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-600 dark:text-gray-300">
          No hay productos disponibles.
        </p>
      )}

      <div className="flex justify-center items-center mt-8 space-x-2">
        {Array.from({ length: Math.ceil(validProducts.length / itemsPerPage) }).map(
          (_, pageIndex) => (
            <button
              key={pageIndex}
              onClick={() => paginate(pageIndex + 1)}
              className={`py-2 px-4 rounded-full transition-all ${
                currentPage === pageIndex + 1
                  ? "bg-[#fcb900] text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-[#fcb900] hover:text-white"
              }`}
            >
              {pageIndex + 1}
            </button>
          )
        )}
      </div>
    </div>
  );
};

export default ComboProducts;