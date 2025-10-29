/* eslint-disable */
import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faExclamationCircle,
  faCheckCircle,
  faClock,
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { useAuth } from '../../../../hooks/ContextAuth';
import api from '../../../../utils/AxiosConfig';
import { showAlert } from '../../../../components/alerts/Alert';

const TokenModal = () => {
  const [tokens, setTokens] = useState(Array(6).fill(''));
  const [errorMessage, setErrorMessage] = useState('');
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [timeLeft, setTimeLeft] = useState(600);
  const inputRefs = useRef([]);
  const location = useLocation();
  const { correo } = location.state || {};
  const navigate = useNavigate();
  const { csrfToken, user } = useAuth();

  // Estados para Snackbar
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('info');

  // Manejo de cambios en cada input del token
  const handleTokenChange = (index, value) => {
    const newTokens = [...tokens];
    if (/^[A-Za-z0-9]$/.test(value)) {
      newTokens[index] = value;
      setTokens(newTokens);
      if (index < tokens.length - 1) {
        inputRefs.current[index + 1].focus();
      }
    }
    const allFilled = newTokens.every((token) => token !== '');
    setIsButtonDisabled(!allFilled || timeLeft <= 0);
  };

  // Manejo de tecla Backspace
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

  // Cerrar el modal y regresar al perfil
  const handleClose = () => {
    if (user) {
      switch (user.rol) {
        case 'cliente':
          navigate('/cliente/perfil');
          break;
        case 'administrador':
          navigate('/administrador/perfil');
          break;
        case 'repartidor':
          navigate('/repartidor/perfil');
          break;
        default:
          navigate('/login');
          break;
      }
    } else {
      navigate('/login');
    }
  };

  // Mostrar Snackbar
  const showSnackbar = (message, severity = 'info') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  // Enviar token a la API para validación
  const handleSubmit = async () => {
    const tokenValido = tokens.join('');
    console.log('Token enviadoa correo', correo);
    try {
      const response = await api.post(
        '/api/usuarios/validarToken/contrasena',
        { correo: correo, token: tokenValido },
        {
          headers: { 'X-CSRF-Token': csrfToken },
          withCredentials: true,
        }
      );

      if (
        response.data.message ===
        'Token válido. Puede proceder con el cambio de contraseña. El token ha sido eliminado.'
      ) {
        showAlert('success', '¡Token correcto! Redirigiendo...', 2000);
        setTimeout(() => {
          if (user && user.rol) {
            switch (user.rol) {
              case 'cliente':
                navigate('/cliente/updatePass', {
                  state: { idUsuario: user.idUsuarios },
                });
                break;
              case 'administrador':
                navigate('/administrador/updatePass', {
                  state: { idUsuario: user.idUsuarios },
                });
                break;
              case 'repartidor':
                navigate('/repartidor/updatePass', {
                  state: { idUsuario: user.idUsuarios },
                });
                break;
              default:
                navigate('/login');
                break;
            }
          } else {
            navigate('/login');
          }
        }, 2000);
      } else {
        setErrorMessage(response.data.message);
        showAlert('error', response.data.message);
      }
    } catch (error) {
      showAlert('error', 'Error al validar el token.');
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const rem = seconds % 60;
    return `${minutes}:${rem < 10 ? '0' : ''}${rem}`;
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsButtonDisabled(true);
          showAlert(
            'error',
            'El token ha expirado. Vuelve a intentarlo más tarde.'
          );
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      className="flex flex-col items-center justify-center  
               dark:from-gray-900 dark:to-gray-800 p-4 
              "
    >
      <div
        className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-2xl 
                 w-full max-w-xs sm:max-w-sm md:max-w-md mx-auto 
                 text-center relative overflow-x-hidden"
      >
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 text-gray-600 dark:text-gray-300 
                   hover:text-gray-800 dark:hover:text-white transition"
        >
          &times;
        </button>

        <h2 className="text-2xl font-extrabold mb-2 text-gray-800 dark:text-white">
          Validar Token
        </h2>
        <p className="text-base text-gray-600 dark:text-gray-300 mb-4">
          Ingresa el token recibido para continuar.
        </p>

        {errorMessage && (
          <div
            className="flex items-center mb-4 p-3 bg-red-100 border border-red-400 
                     text-red-700 rounded"
          >
            <FontAwesomeIcon icon={faExclamationCircle} className="mr-2" />
            <span className="text-sm">{errorMessage}</span>
          </div>
        )}

        <div className="mx-4  flex justify-center gap-1 sm:gap-1 mb-4">
          {tokens.map((token, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              value={token}
              onChange={(e) => handleTokenChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              maxLength={1}
              className="w-10 sm:w-12 md:w-14 h-12 rounded-lg text-center text-xl 
                    bg-gray-50 text-gray-800 dark:bg-gray-700 dark:text-white 
                    focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          ))}
        </div>

        <button
          onClick={handleSubmit}
          disabled={isButtonDisabled}
          className={`w-full py-3 bg-blue-600 text-white rounded-lg 
                    transition duration-300 font-semibold
                    ${
                      isButtonDisabled
                        ? 'opacity-50 cursor-not-allowed'
                        : 'hover:bg-blue-700'
                    }`}
        >
          <div className="flex items-center justify-center gap-2">
            <FontAwesomeIcon icon={faCheckCircle} />
            <span>Validar Token</span>
            <FontAwesomeIcon icon={faClock} />
            <span>{formatTime(timeLeft)}</span>
          </div>
        </button>

        <p className="text-xs text-center text-orange-500 mt-3">
          El token es válido por 10 minutos.{' '}
          {timeLeft === 0 && 'El token ha expirado.'}
        </p>
      </div>
    </div>
  );
};

export default TokenModal;
