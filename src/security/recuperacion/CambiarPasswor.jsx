import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faCheckCircle, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { AlertSuccess, AlertError, AlertInfo } from "../../components/alerts/Alerts"; 
import axios from "axios";
import { useAuth } from "../../hooks/ContextAuth";

const CambiarPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const {csrfToken} = useAuth();
  const [alert, setAlert] = useState(null); 
  const recaptchaRef = useRef(null);
  const [usuarios, setUsuarios] = useState([]);
  const { executeRecaptcha } = useGoogleReCaptcha();
  const BASE_URL = "http://localhost:3001";

  useEffect(() => {
    if (csrfToken) {
      const ConsultarUsuarios = async () => {
        try {
          const response = await axios.get(`${BASE_URL}/api/usuarios`);
          console.log("Usuarios ", response)
        
          setUsuarios(response.data);
        } catch (error) {
          console.error("Error al cargar los usuarios:", error);
        }
      };

      ConsultarUsuarios();
    }
  }, [csrfToken]);


  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí iría la lógica para enviar los datos al servidor
    console.log({ email, token, newPassword, confirmPassword });
  };

  const handleValidation = async (e) => {

  }


  
  return (
    <div className="m-10 flex items-center justify-center p-4">
       {/* Efecto de lluvia de meteoritos */}
       <div className="meteor-shower">
        {[...Array(20)].map((_, i) => (
          <div key={i} className="meteor" style={{ left: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 5}s` }}></div>
        ))}
      </div>

      <div className=" p-8 rounded-2xl  w-full max-w-md transform transition-all duration-500 hover:scale-105 dark:bg-gray-900 dark:text-white">
        
        
          {/* Paso 1: Ingresa tu correo */}
          {step === 1 && (
           <div className="max-w-md mx-auto p-6 bg-white shadow-md rounded-lg dark:bg-gray-900 dark:text-white">
                 <h2 className="text-2xl font-bold mb-4 text-center">Cambiar Contraseña</h2>
                 {alert} {/* Mostrar la alerta actual */}

                 <form onSubmit={handleValidation} className="space-y-4">
                   <div className="form-group dark:bg-gray-950 dark:text-white">
                     <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:bg-gray-950 dark:text-white">
                       Correo Electrónico
                     </label>
                     <input
                       type="email"
                       id="email"
                       value={email}
                       onChange={(e) => setEmail(e.target.value)}
                       className={`block w-full p-2 border border-gray-300 rounded-md dark:bg-gray-950 dark:text-white ${
                         loading ? "opacity-50 cursor-not-allowed" : ""
                       }`}
                       required
                       disabled={loading} // Desactiva el input cuando loading es true
                     />
                   </div>
           
                   <button
                     type="submit"
                     className={`w-full flex justify-center items-center bg-blue-600 text-white py-2 px-4 rounded-md ${
                       loading ? "opacity-50 cursor-not-allowed" : ""
                     }`}
                     disabled={loading} // Desactiva el botón cuando loading es true
                   >
                     {loading ? (
                       <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                     ) : (
                       <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />
                     )}
                     Validar
                   </button>
                 </form>
               </div>
          )}

          {/* Paso 2: Ingresa el token */}
          {step === 2 && (
           <>
           
           
           </>
          )}

          {/* Paso 3: Cambia tu contraseña */}
          {step === 3 && (
            <>
            
            
            </>
          )}

      
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
          z-index: -10;
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

export default CambiarPassword;