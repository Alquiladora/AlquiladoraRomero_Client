import React from 'react';
import { motion } from 'framer-motion';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const PoliticaPrivacidad = () => {
  return (
    <section className="bg-gray-50 dark:bg-gray-900 py-16 px-4 md:px-20">
      <motion.div
        className="max-w-6xl mx-auto space-y-16"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeIn}
      >
        {/* ENCABEZADO PRINCIPAL */}
        <motion.div
          className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-10 border border-gray-200 dark:border-gray-700"
          variants={fadeIn}
        >
          <div className="flex items-center mb-8">
            <div className="bg-[#FFF4CC] dark:bg-[#3D2E00] p-4 rounded-full mr-4 shadow-md">
              <svg
                className="w-12 h-12 text-[#FFC700] dark:text-[#FFD84D]"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M12 11v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-4xl font-black text-gray-800 dark:text-white tracking-tight">
              Política de Privacidad y Protección de Datos
            </h2>
          </div>

          {/* INTRODUCCIÓN */}
          <motion.div
            className="space-y-4 text-lg text-gray-600 dark:text-gray-300 leading-relaxed"
            variants={fadeIn}
          >
            <p>
              En <span className="font-bold">Alquiladora Romero</span>, es una
              empresa dedicada a la renta de mobiliario y equipo para eventos
              (mesas, sillas, carpas, mantelería, equipo de sonido y
              decoración), estamos comprometidos con la protección y
              confidencialidad de los datos personales de nuestros clientes y
              usuarios.
            </p>
            <p>
              Esta política describe cómo recolectamos, usamos, tratamos y
              protegemos la información que nos proporcionas al registrarte y al
              agregar productos a tu carrito y completar tu compra en nuestra
              plataforma.
            </p>
          </motion.div>

          {/* SECCIONES DE POLÍTICA */}
          <motion.div className="mt-10 space-y-10" variants={fadeIn}>
            {[
              {
                title: '1. Datos Recabados',
                content: [
                  'Nombre completo, dirección de entrega y correo electrónico.',
                  'Número de teléfono y datos de facturación (para emisión de facturas).',
                  'Historial de pedidos, fechas y condiciones de entrega y devolución.',
                ],
              },
              {
                title: '2. Finalidades del Tratamiento',
                content: [
                  'Procesar y confirmar compras en línea.',
                  'Coordinar entregas, devoluciones y atención al cliente.',
                  'Enviar notificaciones y actualizaciones del pedido.',
                  'Realizar análisis internos para mejorar la experiencia del usuario.',
                ],
              },
              {
                title: '3. Seguridad y Confidencialidad',
                content: [
                  'Cifrado TLS (HTTPS) en todas las comunicaciones.',
                  'Encriptación de datos en reposo (AES-256) en nuestros servidores.',
                  'Infraestructura segura y accesos limitados.',
                  'Autenticación multifactor para administradores.',
                  'Firewalls, monitoreo de amenazas y auditorías frecuentes.',
                ],
              },
              {
                title: '4. Derechos ARCO y Portabilidad',
                content: [
                  'Acceso: conocer qué datos tenemos y cómo los usamos.',
                  'Rectificación: corregir datos erróneos.',
                  'Cancelación: solicitar la eliminación de tus datos.',
                  'Oposición: negarte al tratamiento por causas legítimas.',
                  'Portabilidad: recibir tus datos en formato estructurado.',
                ],
              },
              {
                title: '5. Conservación de Datos',
                content: [
                  'Tus datos se conservarán mientras tengas una cuenta activa.',
                  'Una vez terminada la relación comercial, serán eliminados en un plazo máximo de 30 días, incluyendo respaldos seguros.',
                ],
              },
              {
                title: '6. Uso de Cookies y Tecnologías de Seguimiento',
                content: [
                  'Analizar la interacción con nuestra plataforma.',
                  'Personalizar contenido, promociones y recomendaciones.',
                  'Medir la efectividad de campañas publicitarias.',
                ],
              },
            ].map(({ title, content }) => (
              <div key={title}>
                <h3 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-3">
                  {title}
                </h3>
                <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300">
                  {content.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </motion.div>

          <motion.div
            className="flex flex-col sm:flex-row sm:justify-between text-sm text-gray-500 dark:text-gray-400 mt-10"
            variants={fadeIn}
          >
            <span>Actualizado el 27 de junio de 2025</span>
            <a
              href="mailto:contacto@alquiladoraromero.com"
              className="mt-2 sm:mt-0 font-medium text-[#FFC700] hover:underline dark:text-[#FFD84D]"
            >
              contacto@alquiladoraromero.com
            </a>
          </motion.div>
        </motion.div>

        {/* POLÍTICAS ADICIONALES */}
        <motion.div className="space-y-10" variants={fadeIn}>
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-4">
            Políticas Adicionales
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                title: 'Análisis de Impacto en la Privacidad (PIA)',
                text: 'Antes de implementar nuevas funciones (como notificaciones, pagos, reportes), evaluamos riesgos mediante un Análisis de Impacto en la Privacidad para definir medidas de control.',
              },
              {
                title: 'Responsabilidad Proactiva',
                text: 'Revisamos periódicamente nuestras políticas, capacitamos al personal y auditamos nuestros procesos para asegurar cumplimiento normativo.',
              },
            ].map((item) => (
              <motion.div
                key={item.title}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-all duration-500"
                whileHover={{ scale: 1.02 }}
                variants={fadeIn}
              >
                <h4 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-3">
                  {item.title}
                </h4>
                <p className="text-gray-600 dark:text-gray-300 mb-3 leading-relaxed">
                  {item.text}
                </p>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Actualizado el 27 de junio de 2025
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default PoliticaPrivacidad;
