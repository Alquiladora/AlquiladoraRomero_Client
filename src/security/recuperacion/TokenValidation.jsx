/* eslint-disable */
import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faExclamationCircle,
  faCheckCircle,
  faClock,
} from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import { useAuth } from '../../hooks/ContextAuth';
import api from '../../utils/AxiosConfig';

export const TokenValidation = ({ correo, setStep }) => {
  const [tokens, setTokens] = useState(Array(6).fill(''));
  const [errorMessage, setErrorMessage] = useState('');
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [timeLeft, setTimeLeft] = useState(600);
  const inputRefs = useRef([]);
  const location = useLocation();
  const { idUsuario, tokenValido } = location.state || {};
  const navigate = useNavigate();
  const { csrfToken } = useAuth();
  const [cambiosContrasena, setCambiosContrasena] = useState(0);
  const [bloqueado, setBloqueado] = useState(false);

  const handleTokenChange = (index, value) => {
    const newTokens = [...tokens];

    if (/^[A-Za-z0-9]$/.test(value)) {
      newTokens[index] = value;
      setTokens(newTokens);

      if (index < tokens.length - 1) {
        inputRefs.current[index + 1].focus();
      }
    }

    const allTokensFilled = newTokens.every((token) => token !== '');
    setIsButtonDisabled(!allTokensFilled || timeLeft <= 0);
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      const newTokens = [...tokens];
      if (newTokens[index] === '' && index > 0) {
        inputRefs.current[index - 1].focus();
      } else {
        newTokens[index] = '';
        setTokens(newTokens);
      }
    }
  };

  const handleClose = () => {
    navigate('/login');
  };

  const verificarCambiosContrasena = async (idUsuario) => {
    if (!idUsuario) {
      console.warn(
        '⚠️ ID de usuario no disponible, no se verificará cambios de contraseña.'
      );
      return;
    }
    try {
      const response = await api.get(`/api/usuarios/vecesCambioPass`, {
        params: { idUsuario },
        headers: { 'X-CSRF-Token': csrfToken },
        withCredentials: true,
      });
      console.log('Respuesta de vecesCambioPass:', response.data);
      setCambiosContrasena(response.data.cambiosRealizados);
      setBloqueado(response.data.cambiosRealizados >= 20);
    } catch (error) {
      console.error('Error al verificar los cambios de contraseña:', error);
    }
  };

  const handleSubmit = async () => {
    const tokenIngresado = tokens.join('');
    console.log('Token enviado a correo:', correo);

    try {
      const response = await api.post(
        '/api/usuarios/validarToken/contrasena',
        { correo: correo, token: tokenIngresado },
        {
          headers: {
            'X-CSRF-Token': csrfToken,
          },
          withCredentials: true,
        }
      );

      console.log(
        'Este es lo que me contiene de response de validar correo',
        response
      );

      if (
        response.data.message ===
        'Token válido. Puede proceder con el cambio de contraseña. El token ha sido eliminado.'
      ) {
        Swal.fire({
          title: '¡Token Correcto!',
          text: 'El token ha sido validado correctamente.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false,
        }).then(() => {
          setStep(3);
        });
      } else {
        setErrorMessage(response.data.message);
      }
    } catch (error) {
      Swal.fire('Error', 'Hubo un problema al validar el token.', 'error');
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          setIsButtonDisabled(true);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className=" flex  items-center justify-center  dark:bg-gray-900 dark:text-white ">
      <div className="relative   p-6 text-center  dark:bg-gray-900 dark:text-white ">
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-xl font-bold"
          aria-label="Cerrar"
        >
          &times;
        </button>

        <h2 className="text-2xl sm:text-3xl font-bold mb-3">Validar Token</h2>
        <p className="mb-4 text-gray-600 text-sm sm:text-base">
          Paso 2: Ingresa el token recibido para continuar.
        </p>

        {/* Mensaje de error */}
        {errorMessage && (
          <div className="flex items-center justify-center mb-4 text-red-600 bg-red-100 rounded-md p-2">
            <FontAwesomeIcon icon={faExclamationCircle} className="mr-2" />
            <span className="text-sm">{errorMessage}</span>
          </div>
        )}

        {/* Inputs del token (sin wrap, todos en una línea) */}
        <div className="flex flex-nowrap justify-center gap-2 mb-4 overflow-x-auto">
          {tokens.map((token, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              id={`token-${index}`}
              value={token}
              onChange={(e) => handleTokenChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              maxLength="1"
              className={`
                border border-gray-300 rounded-md text-center 
                focus:outline-none focus:ring-2 focus:ring-blue-400
                shrink-0
                w-6 h-6 text-xs
                sm:w-8 sm:h-8 sm:text-sm
                md:w-10 md:h-10 md:text-base
                lg:w-12 lg:h-12 lg:text-lg
                 dark:bg-gray-900 dark:text-white
              `}
            />
          ))}
        </div>

        <button
          onClick={handleSubmit}
          disabled={isButtonDisabled}
          className={`
            w-full flex items-center justify-center 
            bg-blue-600 text-white py-2 px-4 rounded-md font-bold
            hover:bg-blue-700 transition-colors 
            ${isButtonDisabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />
          Validar Token
          <FontAwesomeIcon icon={faClock} className="ml-2" />
          <span className="ml-1">{formatTime(timeLeft)}</span>
        </button>

        <p className="mt-3 text-xs sm:text-sm text-orange-600">
          El token es válido por 10 minutos.{' '}
          {timeLeft === 0 && 'El token ha expirado.'}
        </p>
      </div>
    </div>
  );
};
