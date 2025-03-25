import React, { useEffect, useRef, useState, useCallback } from "react";
import PropTypes from "prop-types";
import api from "../../../utils/AxiosConfig";

// Reusable Card Component
const Card = ({ title, content, isLoading }) => {
  const cardRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={cardRef}
      className="card  dark:bg-gray-800/80 backdrop-blur-md rounded-2xl shadow-lg p-6 sm:p-8 border-2 border-yellow-400/50 dark:border-yellow-300/50 transform hover:shadow-2xl hover:shadow-yellow-300/40 dark:hover:shadow-yellow-200/30 hover:-translate-y-2 transition-all duration-500 opacity-0"
    >
      <div className="flex items-center justify-center mb-6">
        <div className={`w-12 h-12 ${isLoading ? "animate-pulse" : ""}`}>
          <i
            className={`fas fa-${title === "Misión" ? "bullseye" : "eye"} text-4xl sm:text-5xl text-yellow-400 dark:text-yellow-300 hover:scale-110 transition-transform duration-300`}
            aria-hidden="true"
          ></i>
        </div>
      </div>
      <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white text-center mb-4">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-300 text-center text-sm sm:text-base leading-relaxed">
        {content}
      </p>
    </div>
  );
};

Card.propTypes = {
  title: PropTypes.string.isRequired,
  content: PropTypes.string.isRequired,
  isLoading: PropTypes.bool.isRequired,
};

// Skeleton Loader Component
const SkeletonCard = () => (
  <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-md rounded-2xl shadow-lg p-6 sm:p-8 animate-pulse">
    <div className="flex items-center justify-center mb-6">
      <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
    </div>
    <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-1/3 mx-auto mb-4"></div>
    <div className="space-y-2">
      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-full"></div>
      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mx-auto"></div>
      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-5/6"></div>
    </div>
  </div>
);

const MissionVision = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const headerRef = useRef(null);

  // Memoized fetch function with AbortController
  const fetchData = useCallback(async (signal) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/api/sobrenosotros", {
        withCredentials: true,
        signal,
      });
      if (response.data) {
        setData(response.data);
      } else {
        throw new Error("Datos vacíos");
      }
    } catch (err) {
      if (err.name !== "AbortError") {
        setError("No se pudo cargar la información de misión y visión.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchData(controller.signal);

    return () => controller.abort();
  }, [fetchData]);

  // Intersection Observer for the header
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );

    if (headerRef.current) {
      observer.observe(headerRef.current);
    }

    return () => {
      if (headerRef.current) {
        observer.unobserve(headerRef.current);
      }
    };
  }, []);

  return (
    <section className="relative py-16 sm:py-24 overflow-hidden">
      {/* Animated Background Gradient */}
      <div className="absolute inset-0  dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 opacity-90 animate-gradient"></div>
      <div className="absolute inset-0 bg-gray-100 dark:bg-gray-900 opacity-20"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <div ref={headerRef} className="text-center mb-12 sm:mb-16 opacity-0">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight font-sans">
            Nuestra Misión y Visión
          </h2>
          <div className="mt-2 w-24 h-1 bg-yellow-400 dark:bg-yellow-300 mx-auto rounded-full"></div>
          <p className="mt-4 text-base sm:text-lg lg:text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
            En Alquiladora Romero, nos dedicamos a transformar tus eventos con soluciones innovadoras y un servicio excepcional.
          </p>
        </div>

        {/* Loading State with Skeleton */}
        {loading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        )}

        {/* Error State with Retry Button */}
        {error && !loading && (
          <div className="text-center">
            <p className="text-red-500 dark:text-red-400 mb-4">{error}</p>
            <button
              onClick={() => fetchData(new AbortController().signal)}
              className="px-4 py-2 bg-yellow-400 text-white rounded-lg hover:bg-yellow-500 transition-all duration-300"
              aria-label="Reintentar carga de datos"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Mission and Vision Cards */}
        {!loading && !error && data && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12">
            <Card
              title="Misión"
              content={data.mision || "No se proporcionó una misión."}
              isLoading={loading}
            />
            <Card
              title="Visión"
              content={data.vision || "No se proporcionó una visión."}
              isLoading={loading}
            />
          </div>
        )}
      </div>

      {/* CSS for Animations */}
      <style jsx>{`
        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translateY(30px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes gradientShift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        .opacity-0 {
          opacity: 0;
        }

        .is-visible {
          opacity: 1 !important;
          animation: fadeInUp 0.8s ease-out forwards;
        }

        .animate-gradient {
          background-size: 200% 200%;
          animation: gradientShift 10s ease infinite;
        }

        .card {
          animation-delay: 0.3s;
        }

        .card:nth-child(2) {
          animation-delay: 0.6s;
        }
      `}</style>
    </section>
  );
};

export default React.memo(MissionVision);