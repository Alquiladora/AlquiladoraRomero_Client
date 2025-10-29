import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import api from '../../../utils/AxiosConfig';

// --- COMPONENTE DE TARJETA REUTILIZABLE (DISEÑO MEJORADO) ---
const Card = ({ title, content, icon, delay }) => {
  const cardRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 } // Aparece un poco antes
    );

    const currentRef = cardRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  return (
    <div
      ref={cardRef}
      className="card group relative bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-2xl shadow-lg p-8 ring-1 ring-slate-900/5 transition-all duration-500 opacity-0 transform-gpu"
      style={{ transitionDelay: delay }}
    >
      <div className="absolute top-0 right-0 -m-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white dark:bg-slate-900 shadow-md ring-1 ring-slate-900/5 dark:ring-white/10 group-hover:bg-yellow-300 dark:group-hover:bg-yellow-400 transition-colors duration-300">
          <i
            className={`fas fa-${icon} text-2xl text-yellow-500 dark:text-yellow-400 group-hover:text-slate-900 transition-colors duration-300`}
          ></i>
        </div>
      </div>
      <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">
        {title}
      </h3>
      <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
        {content}
      </p>
    </div>
  );
};

Card.propTypes = {
  title: PropTypes.string.isRequired,
  content: PropTypes.string.isRequired,
  icon: PropTypes.string.isRequired,
  delay: PropTypes.string,
};

// --- COMPONENTE SKELETON (ACTUALIZADO AL NUEVO DISEÑO) ---
const SkeletonCard = () => (
  <div className="bg-white/50 dark:bg-slate-800/50 rounded-2xl shadow-md p-8 animate-pulse">
    <div className="h-8 bg-slate-300 dark:bg-slate-700 rounded w-1/3 mb-6"></div>
    <div className="space-y-3">
      <div className="h-4 bg-slate-300 dark:bg-slate-700 rounded w-full"></div>
      <div className="h-4 bg-slate-300 dark:bg-slate-700 rounded w-5/6"></div>
      <div className="h-4 bg-slate-300 dark:bg-slate-700 rounded w-3/4"></div>
    </div>
  </div>
);

// --- COMPONENTE PRINCIPAL (DISEÑO Y RESPONSIVIDAD MEJORADOS) ---
const MissionVision = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/api/sobrenosotros');
      if (response.data && response.data.mision && response.data.vision) {
        setData(response.data);
      } else {
        throw new Error(
          'La respuesta de la API no contiene los datos esperados.'
        );
      }
    } catch (err) {
      setError('No se pudo cargar la información. Inténtalo de nuevo.');
      console.error('Error fetching Misión y Visión:', err);
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <section className="relative bg-slate-50 dark:bg-gray-900 py-20 sm:py-28 overflow-hidden">
      {/* Fondo decorativo - Gradiente en modo claro y oscuro */}
      <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 opacity-20 dark:opacity-10">
        <div className="w-96 h-96 rounded-full bg-gradient-to-tr from-yellow-400 to-amber-200 dark:from-yellow-500/50 dark:to-amber-300/50 blur-3xl"></div>
      </div>
      <div className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 opacity-20 dark:opacity-10 hidden sm:block">
        <div className="w-[40rem] h-[40rem] rounded-full bg-gradient-to-tl from-amber-400 to-yellow-200 dark:from-amber-500/50 dark:to-yellow-300/50 blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tighter">
            Nuestra Filosofía
          </h2>
          <div className="mt-3 w-20 h-1.5 bg-yellow-400 dark:bg-yellow-300 mx-auto rounded-full"></div>
          <p className="mt-6 text-lg text-slate-600 dark:text-gray-300 max-w-3xl mx-auto">
            En Alquiladora Romero, nos dedicamos a transformar tus eventos con
            soluciones innovadoras y un servicio excepcional.
          </p>
        </div>

        {/* Contenedor de Tarjetas, Skeleton y Error */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {loading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : error ? (
            <div className="md:col-span-2 text-center bg-red-100/50 dark:bg-red-900/30 p-8 rounded-xl border border-red-300 dark:border-red-700/50">
              <p className="text-red-700 dark:text-red-300 mb-4">{error}</p>
              <button
                onClick={fetchData}
                className="px-6 py-2 bg-yellow-400 dark:bg-yellow-500 text-slate-900 dark:text-gray-900 font-semibold rounded-lg hover:bg-yellow-500 dark:hover:bg-yellow-600 transition-all duration-300 shadow-md hover:shadow-lg"
              >
                Reintentar
              </button>
            </div>
          ) : (
            <>
              <Card
                title="Misión"
                content={data.mision}
                icon="bullseye"
                delay="0s"
              />
              <Card
                title="Visión"
                content={data.vision}
                icon="eye"
                delay="0.2s"
              />
            </>
          )}
        </div>
      </div>

      {/* Estilos para la animación de entrada */}
      <style jsx>{`
        .card {
          opacity: 0;
          transform: translateY(30px) scale(0.95);
        }
        .card.is-visible {
          opacity: 1;
          transform: translateY(0) scale(1);
          transition:
            transform 0.6s cubic-bezier(0.23, 1, 0.32, 1),
            opacity 0.6s cubic-bezier(0.23, 1, 0.32, 1);
        }
      `}</style>
    </section>
  );
};

export default React.memo(MissionVision);
