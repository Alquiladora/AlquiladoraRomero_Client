import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUserCheck,
  faArrowRight,
  faCheckCircle,
  faEnvelope,
  faKey,
  faUserEdit,
} from '@fortawesome/free-solid-svg-icons';
import Paso1 from './Paso1';
import Paso2 from './Paso2';
import Paso3 from './Paso3';

const Registro = () => {
  const [step, setStep] = useState(0);

  const [animate, setAnimate] = useState(false);
  const [guardarCorreo, setGuardarCorreo] = useState('');

  const handleNextStep = () => {
    console.log('Este es el valor de guardar correo', guardarCorreo);
    setAnimate(true);
    setTimeout(() => {
      setStep(step + 1);
      setAnimate(false);
    }, 300);
  };

  const steps = [
    { label: 'Verificar Correo', icon: faEnvelope },
    { label: 'Validar Código', icon: faKey },
    { label: 'Datos Personales', icon: faUserEdit },
  ];

  return (
    <div className="min-h-full flex justify-center items-center transition-all p-4 md:p-8 relative overflow-hidden">
      {/* Efecto de lluvia de meteoritos */}
      <div className="meteor-shower">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="meteor"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
            }}
          ></div>
        ))}
      </div>

      <div
        className={`login-box ${animate ? 'fade-out' : 'slide-in'} w-full max-w-2xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white border rounded-lg shadow-xl p-6 transition-all duration-300 flex flex-col relative z-10`}
      >
        {/* Progress Steps - Only visible after instructions */}
        {step > 0 && (
          <div className="progress-steps mb-8">
            <div className="flex items-center justify-between w-full">
              {steps.map((stepItem, index) => (
                <React.Fragment key={index}>
                  {/* Step Circle */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`
                        step-circle w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500
                        ${step > index + 1 ? 'bg-green-500' : step === index + 1 ? 'bg-[#fcb900]' : 'bg-gray-300'}
                        text-white font-semibold transform hover:scale-105
                      `}
                    >
                      {step > index + 1 ? (
                        <FontAwesomeIcon
                          icon={faCheckCircle}
                          className="text-lg"
                        />
                      ) : (
                        <FontAwesomeIcon
                          icon={stepItem.icon}
                          className="text-lg"
                        />
                      )}
                    </div>
                    <span
                      className={`text-sm mt-2 font-medium ${step === index + 1 ? 'text-[#fcb900]' : ''}`}
                    >
                      {stepItem.label}
                    </span>
                  </div>

                  {/* Connection Line */}
                  {index < steps.length - 1 && (
                    <div className="flex-1 mx-4">
                      <div
                        className={`h-1.5 ${step > index + 1 ? 'bg-green-500' : 'bg-gray-300'} rounded-full transition-all duration-500 progress-line`}
                      ></div>
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        {/* Paso 0 - Introducción y comenzar (not counted in progress) */}
        {step === 0 && (
          <div className="flex-1 intro-container">
            <div className="flex justify-center mb-6">
              <div className="logo-container p-3 rounded-full bg-[#fcb900]/10 animate-pulse">
                <FontAwesomeIcon
                  icon={faUserCheck}
                  className="text-4xl text-[#fcb900]"
                />
              </div>
            </div>

            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center text-[#fcb900]">
              Proceso de Registro
            </h2>

            <p className="text-lg mb-6 text-gray-700 dark:text-gray-300 text-center px-4">
              Regístrate en la plataforma y obtén los beneficios de ser parte de
              la familia Alquiladora Romero.
            </p>

            <div className="steps-overview bg-gray-100 dark:bg-gray-700 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold mb-4 text-center">
                Pasos a seguir
              </h3>
              <ul className="space-y-4">
                <li className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-[#fcb900] flex items-center justify-center text-white mr-3">
                    1
                  </div>
                  <span className="text-gray-800 dark:text-gray-200">
                    Ingresa y verifica tu correo electrónico
                  </span>
                </li>
                <li className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-[#fcb900] flex items-center justify-center text-white mr-3">
                    2
                  </div>
                  <span className="text-gray-800 dark:text-gray-200">
                    Recibe e ingresa el código de validación
                  </span>
                </li>
                <li className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-[#fcb900] flex items-center justify-center text-white mr-3">
                    3
                  </div>
                  <span className="text-gray-800 dark:text-gray-200">
                    Completa tus datos personales y finaliza
                  </span>
                </li>
              </ul>
            </div>

            {/* Botón "Comenzar" */}
            <button
              onClick={handleNextStep}
              className="start-button py-3 px-6 bg-[#fcb900] hover:bg-[#e0a500] text-white rounded-lg font-semibold transition-all duration-300 mx-auto block shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Comenzar ahora{' '}
              <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
            </button>
          </div>
        )}

        {/* Paso 1 - Validación del correo (First actual step) */}
        {step === 1 && (
          <Paso1
            onValidationSuccess={handleNextStep}
            setGuardarCorreo={setGuardarCorreo}
          />
        )}

        {/* Paso 2 - Validación del token */}
        {step === 2 && (
          <Paso2
            onValidationSuccess={handleNextStep}
            guardarCorreo={guardarCorreo}
          />
        )}

        {/* Paso 3 - Registro final */}
        {step === 3 && <Paso3 guardarCorreo={guardarCorreo} />}
      </div>

      {/* Estilos mejorados */}
     <style jsx>{`
        .meteor-shower {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          z-index: 0;
          pointer-events: none;
        }

        .meteor {
          position: absolute;
          top: -100px;
          width: 1px;
          height: 40px;
          background: linear-gradient(
            to bottom,
            rgba(252, 185, 0, 0),
            rgba(252, 185, 0, 0.8)
          );
          animation: meteor-fall 5s linear infinite;
          opacity: 0.7;
        }

        @keyframes meteor-fall {
          0% {
            transform: translateY(0) rotate(45deg);
            opacity: 1;
          }
          100% {
            transform: translateY(120vh) rotate(45deg);
            opacity: 0;
          }
        }

        .step-circle {
          box-shadow: 0 0 0 3px rgba(252, 185, 0, 0.15);
          transition: all 0.4s ease;
        }

        @media (min-width: 640px) {
          .step-circle {
            box-shadow: 0 0 0 4px rgba(252, 185, 0, 0.15);
          }
        }

        @media (min-width: 768px) {
          .step-circle {
            box-shadow: 0 0 0 5px rgba(252, 185, 0, 0.15);
          }
        }

        .fade-out {
          opacity: 0;
          transform: translateY(-20px);
        }

        .slide-in {
          opacity: 1;
          transform: translateY(0);
          animation: appear 0.5s ease-out;
        }

        @keyframes appear {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .progress-line {
          position: relative;
          overflow: hidden;
        }

        .progress-line::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            rgba(252, 185, 0, 0) 0%,
            rgba(252, 185, 0, 0.3) 50%,
            rgba(252, 185, 0, 0) 100%
          );
          animation: shimmer 2s infinite;
          transform: translateX(-100%);
        }

        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }

        .intro-container {
          animation: fadeIn 0.8s ease-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.98);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .logo-container {
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(252, 185, 0, 0.4);
          }
          70% {
            box-shadow: 0 0 0 15px rgba(252, 185, 0, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(252, 185, 0, 0);
          }
        }

        @media (min-width: 640px) {
          @keyframes pulse {
            0% {
              box-shadow: 0 0 0 0 rgba(252, 185, 0, 0.4);
            }
            70% {
              box-shadow: 0 0 0 20px rgba(252, 185, 0, 0);
            }
            100% {
              box-shadow: 0 0 0 0 rgba(252, 185, 0, 0);
            }
          }
        }

        .start-button {
          position: relative;
          overflow: hidden;
        }

        .start-button::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.2) 50%,
            rgba(255, 255, 255, 0) 100%
          );
          animation: shine 3s infinite;
          transform: translateX(-100%);
        }

        @keyframes shine {
          100% {
            transform: translateX(100%);
          }
        }

        /* Ajustes específicos para móviles muy pequeños */
        @media (max-width: 380px) {
          .login-box {
            margin: 0 0.5rem;
            padding: 0.75rem;
          }
          
          .steps-overview {
            padding: 0.75rem;
          }
          
          .step-circle {
            width: 8px;
            height: 8px;
          }
          
          h2 {
            font-size: 1.25rem;
          }
          
          p {
            font-size: 0.8rem;
          }
        }

        /* Ajustes para tablets */
        @media (min-width: 768px) and (max-width: 1024px) {
          .login-box {
            max-width: 90%;
          }
        }
      `}</style>

    </div>
  );
};

export default Registro;
