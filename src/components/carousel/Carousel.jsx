import { useState, useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import { useSpring, animated } from "react-spring";
import Typewriter from "typewriter-effect";

const Carousel = ({
  images,
  margin = "1",
  height = "100%",
  headerText = ["Optimiza tus eventos", "Soluciones de calidad"],
  autoPlayInterval = 5000,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Función para ir a la imagen anterior
  const goToPrevious = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  // Función para ir a la siguiente imagen
  const goToNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  // Animación de fade para las imágenes
  const fade = useSpring({
    opacity: 1,
    from: { opacity: 0 },
    config: { tension: 250, friction: 30 },
  });

  // Animación para el texto
  const textVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
  };

  const imageControls = useAnimation();
  useEffect(() => {
    imageControls.start({
      opacity: 1,
      transition: { duration: 1 },
    });
  }, [currentIndex, imageControls]);


  // Cambiar automáticamente la imagen después de un intervalo
  useEffect(() => {
    const interval = setInterval(() => {
      goToNext();
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [autoPlayInterval]);

  return (
    <div
      className="relative dark:bg-gray-900"
      style={{
        width: "100%",
        height: height,
        margin: margin,
      }}
    >
      {/* Texto animado con efecto de máquina de escribir */}
      <div className="absolute inset-0 z-20 flex justify-center items-center bg-gradient-to-b from-black/80 to-transparent dark:from-black/90 w-full h-full">
        <motion.h1
          variants={textVariants}
          initial="hidden"
          animate="visible"
          className="text-4xl md:text-6xl font-extrabold text-white drop-shadow-2xl text-center"
        >
          <Typewriter
            options={{
              strings: headerText,
              autoStart: true,
              loop: true,
              deleteSpeed: 30,
            }}
          />
        </motion.h1>
      </div>

      {/* Imágenes del Carousel */}
      <animated.div
        style={fade}
        className="relative overflow-hidden rounded-xl shadow-2xl w-full h-full"
      >
        <motion.img
          key={currentIndex}
          src={images[currentIndex]}
          alt={`Slide ${currentIndex + 1}`}
          className="w-full h-full object-cover"
          initial={{ opacity: 0 }}
          animate={imageControls}
          transition={{ duration: 1 }}
        />
      </animated.div>

      {/* Botones de navegación */}
      <button
        onClick={goToPrevious}
        className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-black/60 text-white p-4 rounded-full shadow-xl hover:bg-black/80 focus:outline-none z-20 transition-all"
      >
        &#9664;
      </button>
      <button
        onClick={goToNext}
        className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-black/60 text-white p-4 rounded-full shadow-xl hover:bg-black/80 focus:outline-none z-20 transition-all"
      >
        &#9654;
      </button>

      {/* Indicadores dinámicos */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 flex space-x-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-4 h-4 rounded-full transition-all transform hover:scale-125 ${
              currentIndex === index
                ? "bg-blue-600 scale-150 shadow-xl"
                : "bg-gray-400 hover:bg-gray-500"
            }`}
          ></button>
        ))}
      </div>
    </div>
  );
};

export default Carousel;