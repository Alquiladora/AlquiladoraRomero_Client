import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { FaRegCalendarCheck, FaSun, FaMoon } from "react-icons/fa";

const Horario = () => {
  const [inView, setInView] = useState(false);
  const horariosRef = useRef(null); // useRef para referenciar el div

  const handleScroll = () => {
    if (!horariosRef.current) return; // Verifica que el elemento existe
    const rect = horariosRef.current.getBoundingClientRect();
    setInView(rect.top <= window.innerHeight && rect.bottom >= 0);
  };

  useEffect(() => {
    handleScroll(); // Ejecutar al inicio para verificar si ya está visible

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleScroll); // Para manejar cambios de tamaño

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  return (
    <motion.div
      ref={horariosRef} // Usar ref en lugar de id
      className="w-full md:w-3/4 p-6 text-white rounded-3xl md:ml-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: inView ? 1 : 0 }}
      transition={{ duration: 1 }}
    >
      <h2 className="text-3xl font-extrabold mb-6 text-center text-white">
        Horarios de Atención
      </h2>

      <div className="overflow-x-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 dark:bg-gray-950 dark:text-white">
          {["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"].map((day, index) => {
            const icon =
              day === "Sábado" ? <FaSun className="text-xl" /> :
              day === "Domingo" ? <FaMoon className="text-xl" /> :
              <FaRegCalendarCheck className="text-xl" />;

            return (
              <motion.div
                key={day}
                className="bg-white text-gray-900 p-4 rounded-lg border-2 border-gray-300 transition-all duration-300 ease-in-out hover:shadow-2xl dark:bg-gray-950 dark:text-white"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: inView ? 1 : 0, y: inView ? 0 : 50 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
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
  );
};

export default Horario;
