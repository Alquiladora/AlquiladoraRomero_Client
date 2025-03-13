import React from 'react';
import { FaPhoneAlt, FaMapMarkerAlt } from 'react-icons/fa';
import '../../../style/components/navHeader.css'; 

const NavEncabezado = () => {
    return (
      <header className="py-2 dark:bg-gray-950 dark:text-white ">
        <div className="max-w-7xl mx-auto px-9 flex flex-col md:flex-row items-center">
        
          <div className="flex items-center space-x-1">
            <FaPhoneAlt className="text-white" />
            <p className="text-xs font-semibold">+52 7712635027</p>
          </div>
  
        
          <div className="mt-2 md:mt-0 text-center flex-1">
            <p className="text-sm">"La mejor alquiladora"</p>
          </div>
  
       
          <div className="flex items-center space-x-2 mt-2 md:mt-0">
            <FaMapMarkerAlt className="text-white" />
            <p className="text-xs ">Tahuitzan, huejutla,Hidalgo,Mexico</p>
          </div>
        </div>
      </header>
    );
  };

export default NavEncabezado;

