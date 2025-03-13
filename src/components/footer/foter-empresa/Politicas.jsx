import React from "react";

/**
 * Componente de Políticas de Privacidad con diseño atractivo,
 * modo oscuro, animaciones y responsive.
 */
const PoliticasPrivacidad = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 px-4 py-8 sm:px-6 lg:px-8">
      {/* Definición de animación fadeIn */}
      <style>
        {`
          @keyframes fadeInUp {
            0% {
              opacity: 0;
              transform: translateY(20px);
            }
            100% {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-fadeInUp {
            animation: fadeInUp 0.8s ease-out forwards;
          }
        `}
      </style>

      <div className="max-w-4xl mx-auto animate-fadeInUp">
        {/* Título principal */}
        <h1 className="text-4xl sm:text-5xl font-extrabold text-center mb-6 bg-gradient-to-r from-indigo-500 via-blue-500 to-green-400 bg-clip-text text-transparent">
          Términos y Condiciones de Uso
        </h1>

        {/* Fecha de vigencia */}
        <p className="text-center text-sm text-gray-600 dark:text-gray-300 mb-10">
          <span className="font-medium">Versión vigente:</span> 23 de Septiembre, 2024
        </p>

        {/* Sección de resumen */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8 transition-all duration-300">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            Resumen de términos y condiciones
          </h2>
          <p className="text-gray-700 dark:text-gray-200 leading-relaxed">
            En esta sección se describe, de manera resumida, el contenido principal
            de nuestros términos y condiciones. Te invitamos a leer la versión
            completa para conocer todos los detalles.
          </p>
        </div>

        {/* Sección principal de políticas */}
        <div className="space-y-6 text-gray-700 dark:text-gray-200 leading-relaxed">
          <p>
            <strong>1. Objeto de la política:</strong> Lorem ipsum dolor sit amet,
            consectetur adipiscing elit. Vivamus a tincidunt nunc, nec tempus
            metus. Pellentesque habitant morbi tristique senectus et netus et
            malesuada fames ac turpis egestas.
          </p>
          <p>
            <strong>2. Datos recopilados:</strong> Suspendisse molestie, libero
            vitae venenatis gravida, tellus lectus lobortis enim, ac elementum
            velit neque vel quam. Curabitur eget sapien libero. Fusce interdum,
            nisi non pulvinar dictum, velit lacus viverra magna, non varius nunc
            est a orci.
          </p>
          <p>
            <strong>3. Derechos del usuario:</strong> Proin suscipit metus augue,
            in ullamcorper urna vestibulum at. Vivamus luctus risus et orci
            vulputate, quis fringilla tortor finibus. Suspendisse laoreet massa
            sapien, ac laoreet purus cursus sed.
          </p>
          <p>
            <strong>4. Responsabilidades:</strong> Nullam vehicula tristique
            pellentesque. Mauris ultricies risus quis leo placerat, vel varius
            quam vestibulum. Integer eu dui bibendum, bibendum ante eu, rutrum
            neque.
          </p>
          <p>
            <strong>5. Modificaciones:</strong> Sed euismod lobortis turpis quis
            ornare. In fermentum turpis lorem, quis blandit quam posuere id. Nulla
            consequat est eu nulla vulputate, at hendrerit sapien lacinia.
          </p>
          <p>
            <strong>6. Contacto:</strong> Si tienes dudas, comentarios o
            sugerencias acerca de estos términos, por favor contáctanos a
            <span className="text-indigo-600 dark:text-indigo-400 font-medium"> info@empresa.com</span>.
          </p>
        </div>

        {/* Nota final */}
        <div className="mt-8 p-4 border-l-4 border-indigo-500 bg-indigo-50 dark:bg-gray-800 dark:border-indigo-400">
          <p className="text-gray-700 dark:text-gray-200">
            Al continuar usando este sitio, aceptas cumplir con nuestros términos
            y condiciones. Te recomendamos revisarlos periódicamente, ya que
            podrían cambiar sin previo aviso.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PoliticasPrivacidad;
