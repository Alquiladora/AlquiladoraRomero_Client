import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/ContextAuth';

const ComboProducts = ({ products = [] }) => {
  const { user } = useAuth();

  const validProducts = Array.isArray(products) ? products : [];

  const subtitles = [
    '¡Porque somos los mejores en lo que hacemos!',
    '¡Calidad y servicio garantizado!',
    '¡Alquiladora Romero, tu mejor opción!',
    '¡Precios justos, sin sorpresas!',
    '¡Confianza y puntualidad en cada servicio!',
    '¡Soluciones rápidas para tus eventos!',
    '¡Experiencia que marca la diferencia!',
    '¡Atención personalizada para cada cliente!',
    '¡Seguridad, comodidad y confianza!',
    '¡Todo lo que necesitas en un solo lugar!',
  ];

  const AnimatedSubtitle = () => {
    const [index, setIndex] = useState(0);
    useEffect(() => {
      const interval = setInterval(() => {
        setIndex((prevIndex) => (prevIndex + 1) % subtitles.length);
      }, 2500);

      return () => clearInterval(interval);
    }, []);

    return (
      <AnimatePresence mode="wait">
        <motion.p
          key={subtitles[index]}
          className="text-lg text-gray-700 dark:text-gray-300 h-8" // Altura fija para evitar saltos de layout
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
        >
          {subtitles[index]}
        </motion.p>
      </AnimatePresence>
    );
  };

  const controls = useAnimation();
  const [ref, inView] = useInView({ triggerOnce: true });

  useEffect(() => {
    if (inView) {
      controls.start({ opacity: 1, y: 0 });
    }
  }, [controls, inView]);

  return (
    <div className="w-full py-6 dark:bg-gray-950 dark:text-white">
      <div className="text-center mb-8">
        <motion.h2
          className="text-4xl font-bold text-[#fcb900] mb-2"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          🏆 Top de Productos en Renta
        </motion.h2>
        <AnimatedSubtitle />
      </div>

      {validProducts.length > 0 ? (
        <div
          ref={ref}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-4"
        >
          {validProducts.map((product, index) => (
            <Link
              key={product.id}
              to={
                user && user.rol === 'cliente'
                  ? `/cliente/${product.idSubcategoria}/${product.id}`
                  : `/${product.idSubcategoria}/${product.id}`
              }
              className="block relative"
            >
              <motion.div
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden p-4 transition-all hover:shadow-xl relative"
                initial={{ opacity: 0, y: 50 }}
                animate={controls}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ scale: 1.05 }}
              >
                {/* Etiqueta NUEVO */}
                {product.esNuevo && (
                  <span className="absolute top-3 left-3 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg z-10">
                    Nuevo
                  </span>
                )}

                <motion.img
                  src={product.image || '/images/placeholder.jpg'}
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
                    {product.description ||
                      'Detalles adicionales del producto.'}
                  </p>
                  <button className="mt-2 py-2 px-4 bg-[#fcb900] text-white font-semibold rounded-lg hover:bg-[#e0a800] transition-all">
                    Ver más detalles
                  </button>
                </motion.div>
              </motion.div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-600 dark:text-gray-300">
          No hay productos disponibles.
        </p>
      )}
    </div>
  );
};

export default ComboProducts;
