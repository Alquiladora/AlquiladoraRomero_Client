import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserCheck, faArrowRight, faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import Paso1 from './Paso1';
import Paso2 from './Paso2'
import Paso3 from './Paso3'


const Registro = () => {
  const [step, setStep] = useState(1);
  const [animate, setAnimate] = useState(false);
  const [guardarCorreo, setGuardarCorreo] = useState("");


  const handleNextStep = () => {
    console.log("Este es el valor de guardar correo", guardarCorreo);
    setAnimate(true);
    setTimeout(() => {
      setStep(step + 1);
      setAnimate(false);
    }, 100);
  };
  

  return (
    <div className={`min-h-full flex justify-center items-center bg-gray-100 dark:bg-gray-900 transition-all p-8 relative overflow-hidden`}>
      {/* Efecto de lluvia de meteoritos */}
      <div className="meteor-shower">
        {[...Array(20)].map((_, i) => (
          <div key={i} className="meteor" style={{ left: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 5}s` }}></div>
        ))}
      </div>

      <div
        className={`login-box ${animate ? "fade-out" : "slide-in"} w-full max-w-2xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white border rounded-lg shadow-lg p-6 transition-all duration-300 flex flex-col md:flex-row md:items-center md:justify-between relative z-10`}
      >
        {/* Barra de progreso */}
        {step >= 2 && (
          <div className="progress-bar flex justify-between items-center mb-4 md:mb-0 md:flex-col md:space-y-4">
            {/* Paso 1 */}
            <div
              className={`circle ${step > 2 ? "bg-green-500 text-white" : "bg-gray-300 text-gray-800"} rounded-full w-8 h-8 flex justify-center items-center`}
            >
              {step >= 2 ? (
                <FontAwesomeIcon icon={faCheckCircle} className="text-white" />
              ) : (
                "1"
              )}
            </div>
            <div
              className={`line ${step >= 2 ? "bg-green-500" : "bg-gray-300"} w-16 h-1 md:w-1 md:h-16`}
            ></div>

            {/* Paso 2 */}
            <div
              className={`circle ${step > 2 ? "bg-green-500 text-white" : "bg-gray-300 text-gray-800"} rounded-full w-8 h-8 flex justify-center items-center`}
            >
              {step >= 3 ? (
                <FontAwesomeIcon icon={faCheckCircle} className="text-white" />
              ) : (
                "2"
              )}
            </div>
            <div
              className={`line ${step >= 3 ? "bg-green-500" : "bg-gray-300"} w-16 h-1 md:w-1 md:h-16`}
            ></div>

            {/* Paso 3 */}
            <div
              className={`circle ${step > 3 ? "bg-green-500 text-white" : "bg-gray-300 text-gray-800"} rounded-full w-8 h-8 flex justify-center items-center`}
            >
              {step >= 4 ? (
                <FontAwesomeIcon icon={faCheckCircle} className="text-white" />
              ) : (
                "3"
              )}
            </div>
          </div>
        )}

        {/* Paso 1 - Introducción y comenzar */}
        {step === 1 && (
          <div className="flex-1 md:ml-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center justify-center text-[#fcb900]">
              <FontAwesomeIcon icon={faUserCheck} className="mr-2 text-[#fcb900]" />
              Proceso de Registro
            </h2>
            <p className="text-lg mb-4 text-gray-700 dark:text-gray-300">
              Regístrate en la plataforma y obtén los beneficios de ser parte de la familia Alquiladora Romero. Sigue estos sencillos pasos para completar tu registro:
            </p>
            <ul className="list-decimal pl-6 mb-6 text-gray-700 dark:text-gray-300">
              <li><strong></strong> Ingresa tu correo.</li>
              <li><strong></strong> Recibe un código en tu correo e ingrésalo para continuar.</li>
              <li><strong></strong> Completa tus datos personales y finaliza el registro.</li>
            </ul>
            {/* Botón "Siguiente" */}
            <button
              onClick={handleNextStep}
              className="w-auto py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-md font-semibold transition-all duration-300 mx-auto block"
            >
              Comenzar <FontAwesomeIcon icon={faArrowRight} />
            </button>
          </div>
        )}

        {/* Paso 2 - Validación del correo */}
         {step === 2 && (
          <Paso1
            onValidationSuccess={handleNextStep}
            setGuardarCorreo={setGuardarCorreo}
          />
        )} 

        {/* Paso 3 - Validación del token */}
        {step === 3 && <Paso2 onValidationSuccess={handleNextStep}  guardarCorreo={guardarCorreo} />}

        {/* Paso 4 - Registro final */}
        {step === 4 && <Paso3 guardarCorreo={guardarCorreo} />}
      </div>

      {/* Estilos para la lluvia de meteoritos */}
      <style jsx>{`
        .meteor-shower {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          z-index: 10;
        }

        .meteor {
          position: absolute;
          top: -50px;
          width: 2px;
          height: 50px;
          background: linear-gradient(to bottom, rgba(252, 185, 0, 0), rgba(252, 185, 0, 0.8));
          animation: meteor-fall 5s linear infinite;
        }

        @keyframes meteor-fall {
          0% {
            transform: translateY(0) rotate(45deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(45deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default Registro;
