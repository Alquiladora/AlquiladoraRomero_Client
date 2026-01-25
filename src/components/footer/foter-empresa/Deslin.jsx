import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../../../utils/AxiosConfig';

const fadeIn = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: 'easeOut',
    },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const DeslindeResponsabilidad = () => {
  const [deslindeData, setDeslindeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDeslinde = async () => {
      try {
        const response = await api.get('/api/deslin/vigente');
        const data = response.data;

        const parsedData = {
          ...data,
          secciones:
            typeof data.secciones === 'string'
              ? JSON.parse(data.secciones)
              : data.secciones,
        };

        setDeslindeData(parsedData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching deslinde:', err);
        setError('No se pudo cargar el deslinde de responsabilidad');
        setLoading(false);
      }
    };

    fetchDeslinde();
  }, []);

  const compromisosAdicionales = [
    {
      icon: '⚖️',
      title: 'Cumplimiento Legal',
      description:
        'Garantizamos el cumplimiento de todas las normativas y regulaciones aplicables en materia de responsabilidad civil.',
      features: [
        'Normativas vigentes',
        'Protección al consumidor',
        'Responsabilidad civil',
      ],
    },
    {
      icon: '🛡️',
      title: 'Seguridad Contractual',
      description:
        'Establecemos contratos claros que definen los límites de responsabilidad y protegen los derechos de ambas partes.',
      features: ['Contratos claros', 'Límites definidos', 'Protección mutua'],
    },
  ];

  const gradients = [
    'from-blue-500 to-cyan-500',
    'from-green-500 to-emerald-500',
    'from-purple-500 to-indigo-500',
    'from-orange-500 to-red-500',
    'from-gray-600 to-gray-800',
    'from-pink-500 to-rose-500',
    'from-yellow-500 to-amber-500',
    'from-teal-500 to-cyan-500',
  ];

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // --- Renderizado de Estados (Loading, Error, No Data) ---

  if (loading) {
    return (
      <section className="min-h-screen bg-gray-50 dark:bg-gray-900 flex justify-center items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#FFC700]"></div>
      </section>
    );
  }

  if (error || !deslindeData) {
    return (
      <section className="bg-gray-50 dark:bg-gray-900 py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div
            className={`${error ? 'bg-red-100 dark:bg-red-900/20 border-red-400 text-red-700' : 'bg-yellow-100 dark:bg-yellow-900/20 border-yellow-400 text-yellow-700'} border p-6 rounded-xl text-center`}
          >
            <p className="font-semibold">
              {error ||
                'No hay deslinde de responsabilidad disponible en este momento.'}
            </p>
          </div>
        </div>
      </section>
    );
  }

  // --- Renderizado Principal ---

  return (
    <section className="bg-white dark:bg-gray-900 py-16 px-4 md:px-8 lg:px-12 min-h-screen">
      <motion.div
        className="max-w-7xl mx-auto"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={staggerContainer}
      >
        {/* ENCABEZADO PRINCIPAL Y INTRODUCCIÓN */}
        <motion.div
          className="bg-gray-50 dark:bg-gray-800 rounded-2xl shadow-lg p-8 md:p-12 mb-12 border border-[#FFC700]/50 relative"
          variants={fadeIn}
        >
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8">
            <div className="bg-gradient-to-br from-[#FFC700] to-[#FFA000] p-4 rounded-xl shadow-xl flex-shrink-0">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight">
                {deslindeData.titulo || 'Deslinde de Responsabilidad'}
              </h1>
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1 block">
                Vigente hasta: {formatDate(deslindeData.fechaVigencia)} |
                Versión: {deslindeData.versio || '1.0'}
              </span>
            </div>
          </div>

          {/* CONTENIDO INTRODUCTORIO DINÁMICO */}
          <motion.div
            className="space-y-4 text-lg text-gray-700 dark:text-gray-300 leading-relaxed border-l-4 border-[#FFC700] pl-4"
            variants={fadeIn}
          >
            <p className="font-semibold text-gray-800 dark:text-gray-200">
              En{' '}
              <span className="font-bold text-[#FFC700]">
                Alquiladora Romero
              </span>
              , priorizamos la claridad y transparencia en nuestras
              responsabilidades.
            </p>
            <p>{deslindeData.contenido}</p>
          </motion.div>
        </motion.div>

        {/* SECCIONES DE DESLINDE (Contenido dinámico en dos columnas) */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">
            Alcances y Limitaciones de Responsabilidad
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-[#FFC700] to-[#FFA000] rounded-full mx-auto"></div>
        </div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16"
          variants={staggerContainer}
        >
          {deslindeData.secciones.map((seccion, index) => (
            <motion.div
              key={seccion.titulo}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-2xl hover:scale-[1.01]"
              variants={fadeIn}
            >
              <div className="flex items-start gap-4 mb-4">
                <div
                  className={`bg-gradient-to-br ${gradients[index % gradients.length]} p-3 rounded-lg text-white font-bold shadow-md flex-shrink-0`}
                >
                  {index + 1}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                  {seccion.titulo || `Sección ${index + 1}`}
                </h3>
              </div>
              <div className="space-y-3 pl-12">
                {seccion.contenido &&
                  seccion.contenido.split(' / ').map((item, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2 text-gray-700 dark:text-gray-400 text-base"
                    >
                      <svg
                        className="w-4 h-4 text-[#FFC700] mt-1.5 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586L7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                      </svg>
                      <p className="leading-relaxed">{item.trim()}</p>
                    </div>
                  ))}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* COMPROMISOS ADICIONALES (Estático) */}
        <motion.div
          className="bg-gray-100 dark:bg-gray-800 rounded-2xl shadow-inner p-8 md:p-10 border border-gray-200 dark:border-gray-700"
          variants={fadeIn}
        >
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Garantías y Compromisos
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Estamos comprometidos con establecer relaciones claras y
              transparentes con nuestros clientes.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {compromisosAdicionales.map((item) => (
              <motion.div
                key={item.title}
                className="bg-white dark:bg-gray-700 rounded-lg p-5 border border-gray-200 dark:border-gray-600"
                variants={fadeIn}
              >
                <span className="text-3xl mb-3 block">{item.icon}</span>
                <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {item.title}
                </h4>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                  {item.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {item.features.map((feature, i) => (
                    <span
                      key={i}
                      className="bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full text-xs font-medium"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* FOOTER - Contacto y Versiones */}
        <motion.div
          className="flex flex-col sm:flex-row justify-between items-center py-6 mt-8 border-t border-gray-300 dark:border-gray-700"
          variants={fadeIn}
        >
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-4 sm:mb-0">
            <span className="font-semibold">
              Última actualización: {formatDate(deslindeData.updated_at)}
            </span>
          </div>
          <a
            href="mailto:contacto@alquiladoraromero.com"
            className="bg-gradient-to-r from-[#FFC700] to-[#FFA000] text-gray-900 px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105 flex items-center gap-2 text-sm"
          >
            <svg
              className="w-4 h-4 text-gray-900"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            Contacto Legal
          </a>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default DeslindeResponsabilidad;
