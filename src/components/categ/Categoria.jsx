import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/ContextAuth";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/solid";

const CategoryCard = ({ category }) => {
  const { user } = useAuth();
  const isCliente = user?.rol === "cliente";
  const categoryLink = isCliente
    ? `/cliente/categoria/${category.name}`
    : `/categoria/${category.name}`;

  return (
    <motion.div
      className="relative flex-shrink-0 w-[160px] sm:w-[200px] h-[220px] sm:h-[260px] rounded-2xl overflow-hidden shadow-lg group snap-start"
      whileHover={{ y: -8 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <img
        src={category.image}
        alt={category.name}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>

      <div className="relative h-full flex flex-col justify-end p-4 text-white">
        <h3 className="text-base sm:text-lg font-bold drop-shadow-lg mb-2">
          {category.name}
        </h3>
        <Link to={categoryLink}>
          <button className="w-full py-2 bg-yellow-500 text-slate-900 font-bold text-xs sm:text-sm rounded-lg hover:bg-yellow-400 transition-all duration-300 transform group-hover:scale-105 shadow-md">
            Ver catálogo
          </button>
        </Link>
      </div>
    </motion.div>
  );
};


const Categoria = ({ categories }) => {
  const carouselRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollability = () => {
    const el = carouselRef.current;
    if (el) {
      setCanScrollLeft(el.scrollLeft > 0);
      setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 1); // -1 for precision
    }
  };

  useEffect(() => {
    const el = carouselRef.current;
    if (el) {
      el.addEventListener("scroll", checkScrollability);
      checkScrollability(); // Initial check
    }
    window.addEventListener("resize", checkScrollability);

    return () => {
      if (el) el.removeEventListener("scroll", checkScrollability);
      window.removeEventListener("resize", checkScrollability);
    };
  }, [categories]);

  const scroll = (direction) => {
    if (carouselRef.current) {
      const scrollAmount = carouselRef.current.clientWidth * 0.8; // Scroll 80% of the visible width
      carouselRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (!categories || categories.length === 0) {
    // Estado de carga mejorado
    return (
      <div className="w-full py-12 bg-white dark:bg-slate-900 flex justify-center items-center h-64">
        <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white dark:bg-slate-900 py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight text-center">
            <span className="text-yellow-500">Nuestras Categorías</span>
          </h2>

          <div className="hidden sm:flex items-center space-x-2">
            <button
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-300 dark:hover:bg-slate-700 transition-all"
            >
              <ChevronLeftIcon className="w-6 h-6" />
            </button>
            <button
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-300 dark:hover:bg-slate-700 transition-all"
            >
              <ChevronRightIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

    
        <motion.div
          ref={carouselRef}
          className="flex overflow-x-auto space-x-6 pb-4 scroll-smooth snap-x snap-mandatory"
          style={{ scrollbarWidth: "none", "-ms-overflow-style": "none" }}
        >
          {categories.map((category) => (
            <CategoryCard key={category.name} category={category} />
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default Categoria;