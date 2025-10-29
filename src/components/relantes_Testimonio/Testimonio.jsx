/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const Testimonios=()=>
{
    const [indiceTestimonio, setIndiceTestimonio] = useState(0);

    const testimonios = [
        { texto: "¡Excelente producto! Lo recomiendo.", icono: "🛒" },
        { texto: "Muy buena calidad y atención al cliente.", icono: "🌟" },
        { texto: "El mejor servicio que he recibido.", icono: "👍" },
        { texto: "Productos de alta calidad, volveré a comprar.", icono: "🔄" },
        { texto: "Totalmente satisfecho con mi compra.", icono: "✅" },
        { texto: "Entrega rápida y productos de calidad.", icono: "🚚" },
        { texto: "Muy contento con la compra, lo recomiendo.", icono: "😊" },
      ];

   useEffect(() => {
      const intervaloTestimonios = setInterval(() => {
        setIndiceTestimonio((prev) => (prev + 1) % testimonios.length);
      }, 3000);
  

  
      return () => {
        clearInterval(intervaloTestimonios);
      };
    }, []);

    return(
        <>
         {/* Sección de testimonios tipo chat */}
      <div className="w-full md:w-1/2 flex flex-col items-center">
        <h2 className="text-4xl text-[#fcb900] font-bold mb-5 text-center">Testimonios de clientes</h2>
        <div className="relative h-60 overflow-hidden w-full max-w-lg flex flex-col gap-3">
          <AnimatePresence>
            {testimonios.slice(indiceTestimonio, indiceTestimonio + 4).map((testimonio, index) => (
              <motion.div
                key={testimonio.texto}
                className="flex items-center p-3 bg-gray-100 rounded-lg shadow-md gap-3 dark:bg-gray-950 dark:text-white"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
              >
                <span className="text-2xl">{testimonio.icono}</span>
                <p className="text-left">{testimonio.texto}</p>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
        </>
    )
}

export default Testimonios;