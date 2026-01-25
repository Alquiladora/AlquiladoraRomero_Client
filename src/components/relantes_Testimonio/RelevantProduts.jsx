import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import img1 from './../../img/Logos/logo3.jpg';
import img2 from './../../img/Logos/logo4.jpg';
import img3 from './../../img/Logos/logo6.jpg';
import img4 from './../../img/Logos/logo7.jpg';

const RelevantesProducts = () => {
  const [mounted, setMounted] = useState(false);
  const [imagenes, setImagenes] = useState([
    img1,
    img2,
    img3,
    img4,
    img1,
    img2,
    img3,
    img4,
  ]);
  const [indiceImagen, setIndiceImagen] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  const siguienteImagen = () => {
    setIndiceImagen((prev) => (prev + 1) % imagenes.length);
  };

  const anteriorImagen = () => {
    setIndiceImagen((prev) => (prev - 1 + imagenes.length) % imagenes.length);
  };

  useEffect(() => {
    const intervaloImagenes = setInterval(() => {
      setImagenes((prev) => [...prev.slice(1), prev[0]]);
    }, 4000);

    return () => {
      clearInterval(intervaloImagenes);
    };
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <>
    
      <div className="w-full md:w-1/2">
        <h2 className="text-4xl  text-[#fcb900] font-bold mb-5 text-center">
          Lo más relevante
        </h2>
        <div className="relative overflow-hidden rounded-lg">
        
          <motion.div
            className="relative w-full h-[300px] overflow-hidden rounded-lg"
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.3 }}
          >
            <img
              src={imagenes[indiceImagen]}
              alt={`Producto ${indiceImagen + 1}`}
              className="w-full h-full object-cover"
            />
          </motion.div>

        
          <div className="absolute top-1/2 left-0 right-0 transform -translate-y-1/2 flex justify-between px-4">
            <button
              onClick={anteriorImagen}
              className="bg-white bg-opacity-75 p-2 rounded-full shadow-md hover:bg-opacity-100"
            >
              &#10094; 
            </button>
            <button
              onClick={siguienteImagen}
              className="bg-white bg-opacity-75 p-2 rounded-full shadow-md hover:bg-opacity-100"
            >
              &#10095; 
            </button>
          </div>

        
          <div className="flex justify-center mt-3 space-x-2">
            {imagenes.map((_, index) => (
              <button
                key={index}
                onClick={() => setIndiceImagen(index)}
                className={`w-3 h-3 rounded-full ${
                  index === indiceImagen ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default RelevantesProducts;
