import React from 'react';
import logoUrl from '../img/Logos/logo.jpg'

const Spinner = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-100">
    <div className="relative">
      <div className="animate-spin rounded-full border-t-4 border-blue-500 border-8 w-32 h-32 absolute top-0 left-0"></div>
      <img 
        src={logoUrl} 
        alt="Logo de carga"
        className="w-16 h-16 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
      />
    </div>
    <p className="text-center mt-4 text-gray-600">Cargando información, por favor espere...</p>
  </div>
);

export default Spinner;



