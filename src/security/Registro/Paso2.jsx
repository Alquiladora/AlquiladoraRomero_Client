import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faExclamationCircle,
  faCheckCircle,
  faClock,
} from '@fortawesome/free-solid-svg-icons';

import { motion } from 'framer-motion';
import api from '../../utils/AxiosConfig';

const Paso2 = ({ onValidationSuccess, guardarCorreo }) => {
  const [tokens, setTokens] = useState(Array(6).fill(''));
  const [errorMessage, setErrorMessage] = useState('');
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [timeLeft, setTimeLeft] = useState(600);
  const [tokenRecuperado, setTokenRecuperado] = useState(null);

  const inputRefs = useRef([]);

  //======================================================================================
  // Obtenemos el token del correo registrado
  useEffect(() => {
    if (!guardarCorreo) return;

    console.log('Valor de guardarCorreo:', guardarCorreo);

    api
      .get(`/api/token/correo/${guardarCorreo}`)
      .then((response) => {
        if (response.data && response.data.token) {
          setTokenRecuperado(response.data.token);
          console.log('Token recuperado:', response.data.token);
        } else {
          console.error('El token ha expirado o no existe.');
        }
      })
      .catch((error) => {
        console.error('Error al cargar los datos:', error);
      });
  }, [guardarCorreo]);

  //======================================================================================
  // Maneja el cambio de valor en los inputs de tokens (letras y números permitidos)
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

  const handleSubmit = () => {
    if (tokens.join('') === tokenRecuperado) {
      setErrorMessage('');
      showAlert(
        '¡Token Correcto!',
        'El token ha sido validado correctamente.',
        'success'
      );
      if (onValidationSuccess) {
        onValidationSuccess();
      }
    } else {
      setErrorMessage('Token inválido, vuelve a intentarlo.');
    }

    // >>>> LÍNEA AÑADIDA: Habilita de nuevo el botón tras cada intento <<<<
    setIsButtonDisabled(false);
  };

  const showAlert = (title, message, type) => {
    const alertClass =
      type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white';
    const icon = type === 'success' ? faCheckCircle : faExclamationCircle;

    return (
      <div
        className={`animate__animated animate__fadeIn ${alertClass} p-4 rounded-lg shadow-md mb-4 flex items-center`}
      >
        <FontAwesomeIcon icon={icon} className="mr-3 text-xl" />
        <div>
          <strong>{title}</strong>
          <p>{message}</p>
        </div>
      </div>
    );
  };

  // Función para calcular el tiempo restante en minutos y segundos
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
    <>
      <div className="max-w-lg mx-auto p-4">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-2xl font-semibold text-center mb-4"
        >
          Paso 2: Validar Token
        </motion.h2>

        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-red-500 text-white p-4 rounded-lg shadow-md mb-4 flex items-center"
          >
            <FontAwesomeIcon
              icon={faExclamationCircle}
              className="mr-3 text-xl"
            />
            <div>
              <strong>Error:</strong>
              <p>{errorMessage}</p>
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex justify-center gap-2 mb-4 flex-wrap"
        >
          {tokens.map((token, index) => (
            <motion.input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              value={token}
              onChange={(e) => handleTokenChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              maxLength={1}
              className="text-center text-xl p-2 w-12 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-950 dark:text-white transition-all duration-200 ease-in-out hover:scale-105"
              autoFocus={index === 0}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            />
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="flex items-center text-sm mb-4"
        >
          <FontAwesomeIcon icon={faClock} className="mr-2" />
          {formatTime(timeLeft)}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="flex items-center justify-between"
        >
          <motion.button
            className={`flex-grow p-2 bg-blue-500 text-white rounded-md font-bold transition-all duration-200 ease-in-out ${
              isButtonDisabled
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:bg-blue-600 hover:scale-105'
            }`}
            onClick={handleSubmit}
            disabled={isButtonDisabled}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Validar Token
          </motion.button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="text-center mt-3 text-sm text-red-500"
        >
          El token es válido por 10 minutos.{' '}
          {timeLeft === 0 && 'El token ha expirado.'}
        </motion.p>
      </div>
    </>
  );
};

export default Paso2;
