import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import Typewriter from "typewriter-effect";

const Carousel = ({
  images,
  margin = "1rem",
  height = "100%",
  headerText = ["Optimiza tus eventos", "Soluciones de calidad"],
  autoPlayInterval = 7000,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Memoize navigation functions
  const goToPrevious = useCallback(() => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  }, [images.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  }, [images.length]);

  // Simplified image animation
  const imageVariants = {
    enter: { opacity: 0 },
    center: { opacity: 1 },
    exit: { opacity: 0 },
  };

  // Optimized auto-play
  useEffect(() => {
    const interval = setInterval(goToNext, autoPlayInterval);
    return () => clearInterval(interval);
  }, [autoPlayInterval, goToNext]);

  return (
    <div
      className="relative w-full dark:bg-gray-900"
      style={{ height, margin }}
    >
      {/* Overlay with text */}
      <div className="absolute inset-0 z-20 flex items-center justify-center bg-gradient-to-b from-black/70 to-transparent">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white text-center px-4 drop-shadow-lg"
        >
          <Typewriter
            options={{
              strings: headerText,
              autoStart: true,
              loop: true,
              deleteSpeed: 50,
              delay: 75,
            }}
          />
        </motion.h1>
      </div>

      {/* Image container */}
      <div className="relative w-full h-full overflow-hidden rounded-lg">
        <motion.img
          key={currentIndex}
          src={images[currentIndex]}
          alt={`Slide ${currentIndex + 1}`}
          variants={imageVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.5 }}
          className="w-full h-full object-cover"
          loading="lazy" // Lazy load images
        />
      </div>

      {/* Navigation buttons */}
      <button
        onClick={goToPrevious}
        className="absolute top-1/2 left-2 sm:left-4 transform -translate-y-1/2 bg-black/50 text-white p-2 sm:p-3 rounded-full hover:bg-black/70 transition-colors z-20"
        aria-label="Previous slide"
      >
        ◀
      </button>
      <button
        onClick={goToNext}
        className="absolute top-1/2 right-2 sm:right-4 transform -translate-y-1/2 bg-black/50 text-white p-2 sm:p-3 rounded-full hover:bg-black/70 transition-colors z-20"
        aria-label="Next slide"
      >
        ▶
      </button>

      {/* Indicators */}
      <div className="absolute bottom-2 sm:bottom-4 left-1/2 transform -translate-x-1/2 z-20 flex space-x-1 sm:space-x-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-colors ${
              currentIndex === index ? "bg-blue-500" : "bg-gray-400 hover:bg-gray-500"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default Carousel;