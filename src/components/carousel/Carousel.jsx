import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Typewriter from 'typewriter-effect';

const Carousel = ({
  images,
  margin = '1rem',
  height = '100%',
  headerText = ['Optimiza tus eventos', 'Soluciones de calidad'],
  autoPlayInterval = 7000,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0); 

  const goToPrevious = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  }, [images.length]);

  const goToNext = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  }, [images.length]);

  const goToSlide = useCallback((index) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  }, [currentIndex]);

  
  const imageVariants = {
    enter: (direction) => ({
      opacity: 0,
      x: direction > 0 ? 300 : -300,
      scale: 0.95,
    }),
    center: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94], 
      }
    },
    exit: (direction) => ({
      opacity: 0,
      x: direction > 0 ? -300 : 300,
      scale: 1.05,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94],
      }
    }),
  };

 
  useEffect(() => {
    images.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, [images]);

  useEffect(() => {
    const interval = setInterval(goToNext, autoPlayInterval);
    return () => clearInterval(interval);
  }, [autoPlayInterval, goToNext]);

  return (
    <div
      className="relative w-full dark:bg-gray-900 overflow-hidden"
      style={{ height, margin }}
    >
     
      <div className="absolute inset-0 z-20 flex items-center justify-center bg-gradient-to-b from-black/70 to-transparent pointer-events-none">
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


      <div className="relative w-full h-full rounded-lg">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.img
            key={currentIndex}
            src={images[currentIndex]}
            alt={`Slide ${currentIndex + 1}`}
            custom={direction}
            variants={imageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="w-full h-full object-cover absolute inset-0"
            loading="lazy"
            onContextMenu={(e) => e.preventDefault()} 
          />
        </AnimatePresence>
      </div>


      <button
        onClick={goToPrevious}
        className="absolute top-1/2 left-2 sm:left-4 transform -translate-y-1/2 bg-black/50 text-white p-2 sm:p-3 rounded-full hover:bg-black/70 transition-all duration-300 z-20 backdrop-blur-sm hover:scale-110"
        aria-label="Previous slide"
      >
        <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={goToNext}
        className="absolute top-1/2 right-2 sm:right-4 transform -translate-y-1/2 bg-black/50 text-white p-2 sm:p-3 rounded-full hover:bg-black/70 transition-all duration-300 z-20 backdrop-blur-sm hover:scale-110"
        aria-label="Next slide"
      >
        <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <div className="absolute bottom-2 sm:bottom-4 left-1/2 transform -translate-x-1/2 z-20 flex space-x-1 sm:space-x-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
              currentIndex === index
                ? 'bg-blue-500 scale-125'
                : 'bg-gray-400 hover:bg-gray-500 hover:scale-110'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

    
      <div className="absolute inset-0 bg-black/10 z-10 pointer-events-none" />
    </div>
  );
};

export default Carousel;