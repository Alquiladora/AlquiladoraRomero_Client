import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FaRegCalendarCheck, FaSun, FaMoon, FaClock, FaRegHandPointRight } from 'react-icons/fa';

const Horario = () => {
  const [inView, setInView] = useState(false);

  const handleScroll = () => {
    const element = document.getElementById('horarios');
    const rect = element.getBoundingClientRect();
    if (rect.top <= window.innerHeight && rect.bottom >= 0) {
      setInView(true); // Cuando el panel entra en el viewport
    } else {
      setInView(false); // Cuando sale del viewport
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* Panel de horarios */}
      <motion.div
        id="horarios"
        className="w-full md:w-3/4 p-6 text-white rounded-3xl  md:ml-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: inView ? 1 : 0 }} // Cambia la opacidad cuando entra o sale
        transition={{ duration: 1 }}
      >
        <h2 className="text-3xl font-extrabold mb-6 text-center text-white">Horarios de Atención</h2>

        {/* Calendario de horarios */}
        <div className="overflow-x-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 dark:bg-gray-950 dark:text-white">
            {/* Día de la semana */}
            {["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"].map((day, index) => {
              // Iconos según el día
              let icon;
              switch (day) {
                case "Lunes":
                case "Martes":
                case "Miércoles":
                case "Jueves":
                case "Viernes":
                  icon = <FaRegCalendarCheck className="text-xl" />;
                  break;
                case "Sábado":
                  icon = <FaSun className="text-xl" />;
                  break;
                case "Domingo":
                  icon = <FaMoon className="text-xl" />;
                  break;
                default:
                  icon = <FaRegHandPointRight className="text-xl" />;
              }

              return (
                <motion.div
                  key={day}
                  className="bg-white text-gray-900 p-4 rounded-lg border-2 border-gray-300 transition-all duration-300 ease-in-out hover:shadow-2xl dark:bg-gray-950 dark:text-white"
                  initial={{ opacity: 0, y: 50 }} // Inicia desde abajo
                  animate={{
                    opacity: inView ? 1 : 0, // Opacidad que aparece o desaparece según scroll
                    y: inView ? 0 : 50, // Se mueve hacia arriba o abajo
                  }}
                  exit={{ opacity: 0, y: 50 }}    // Se mueve hacia abajo al salir
                  transition={{
                    duration: 0.8,
                    delay: index * 0.2, // Añadir retraso para la animación en secuencia
                  }}
                >
                  <div className="flex justify-center items-center mb-2">
                    {icon}
                  </div>
                  <h3 className="font-semibold text-lg text-center">{day}</h3>
                  <p className="text-center">
                    {day === "Sábado" ? "10:00 AM - 4:00 PM" : day === "Domingo" ? "Cerrado" : "9:00 AM - 6:00 PM"}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default Horario;
