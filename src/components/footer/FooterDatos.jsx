export const FooterDatos = () => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
        {/* Información Section */}
        <div className="flex flex-col items-center mb-6 md:mb-0">
          <h4 className="text-xl font-bold text-white mb-3">Información</h4>
          <a href="#" className="text-sm text-white transition-colors mb-1 hover:text-gray-400">
            Política de Privacidad
          </a>
          <a href="#" className="text-sm text-white transition-colors mb-1 hover:text-gray-400">
            Políticas
          </a>
          <a href="#" className="text-sm text-white transition-colors mb-1 hover:text-gray-400">
            Términos y Condiciones
          </a>
          <a href="#" className="text-sm text-white transition-colors mb-1 hover:text-gray-400">
            Yect
          </a>
        </div>

        {/* Redes Sociales Section */}
        <div className="flex flex-col items-center mb-6 md:mb-0">
          <h4 className="text-xl font-bold text-white mb-3">Redes Sociales</h4>
          <div className="flex justify-center space-x-6">
            <a href="#" className="text-white hover:text-gray-400 text-3xl transition-all duration-300">
              <i className="fab fa-facebook"></i>
            </a>
            <a href="#" className="text-white hover:text-gray-400 text-3xl transition-all duration-300">
              <i className="fab fa-instagram"></i>
            </a>
            <a href="#" className="text-white hover:text-gray-400 text-3xl transition-all duration-300">
              <i className="fab fa-twitter"></i>
            </a>
            <a href="#" className="text-white hover:text-gray-400 text-3xl transition-all duration-300">
              <i className="fab fa-whatsapp"></i>
            </a>
          </div>
        </div>

        {/* Otras Compañías Section */}
        <div className="flex flex-col items-center">
          <h4 className="text-xl font-bold text-white mb-3">Otras Compañías</h4>
          <a href="#" className="text-sm text-white transition-colors mb-1 hover:text-gray-400">
            Compañía 1
          </a>
          <a href="#" className="text-sm text-white transition-colors mb-1 hover:text-gray-400">
            Compañía 2
          </a>
          <a href="#" className="text-sm text-white transition-colors mb-1 hover:text-gray-400">
            Compañía 3
          </a>
        </div>
      </div>

      {/* Enlace para la APK */}
      <div className="text-center mt-4">
        <a href="#" className="text-sm text-white bg-blue-500 px-4 py-2 rounded-md hover:bg-blue-600 transition-colors">
          Descarga nuestra App
        </a>
      </div>

      {/* "Hecho por Alquiladora Romero" con fondo amarillo y estilo representativo */}
      <div className="relative bg-yellow-500 py-4 mt-8">
        <div className="absolute inset-0 bg-black opacity-30"></div> {/* Filtro oscuro para contraste */}
        <p className="text-white text-lg font-bold z-10 text-center">
          Hecho por <strong>Alquiladora Romero</strong>
        </p>
      </div>
    </>
  );
};
