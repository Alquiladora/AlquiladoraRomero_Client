import React, { useState, useEffect } from 'react';
import { FaPhoneAlt, FaMapMarkerAlt, FaEnvelope } from 'react-icons/fa';
import '../../../style/components/navHeader.css';
import api from '../../../utils/AxiosConfig';

const NavEncabezado = () => {
  const [empresa, setEmpresa] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);


  const defaultData = {
    nombreEmpresa: "Alquiladora Romero",
    ubicacion: "Tahuitzan, huejutla, Hidalgo, Mexico",
    correo: "alquiladoraRomero@gmail.com",
    telefono: "7712635027",
    slogan: "La mejor alquiladora"
  };

  useEffect(() => {
    const fetchEmpresaData = async () => {
      try {
        setLoading(true);
     
        const response = await  api.get('api/empresa');
        setEmpresa(response.data);
      } catch (err) {
        console.error('Error fetching empresa data:', err);
        setError(true);
        setEmpresa(defaultData);
      } finally {
        setTimeout(() => setLoading(false), 800);
      }
    };

    fetchEmpresaData();
  }, []);

  if (loading) {
    return (
      <header className="py-2 dark:bg-gray-950 dark:text-white">
        <div className="max-w-7xl mx-auto px-9 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="animate-pulse flex space-x-4">
              <div className="h-3 w-24 bg-gray-400 rounded"></div>
              <div className="h-3 w-32 bg-gray-400 rounded"></div>
              <div className="h-3 w-40 bg-gray-400 rounded"></div>
            </div>
            <p className="text-xs mt-1 text-gray-300">Cargando información...</p>
          </div>
        </div>
      </header>
    );
  }

 
  return (
    <header className="py-2 dark:bg-gray-950 dark:text-white">
      <div className="max-w-7xl mx-auto px-9 flex flex-col md:flex-row items-center">
        <div className="flex items-center space-x-1">
          <FaPhoneAlt className="text-white" />
          <p className="text-xs font-semibold">+52 {empresa?.telefono || defaultData.telefono}</p>
        </div>
        
        <div className="mt-2 md:mt-0 text-center flex-1">
          <p className="text-sm">"{empresa?.slogan || defaultData.slogan}"</p>
        </div>
        
        <div className="flex items-center space-x-2 mt-2 md:mt-0">
          <FaMapMarkerAlt className="text-white" />
          <p className="text-xs">{empresa?.ubicacion || defaultData.ubicacion}</p>
        </div>
      </div>
    </header>
  );
};

export default NavEncabezado;