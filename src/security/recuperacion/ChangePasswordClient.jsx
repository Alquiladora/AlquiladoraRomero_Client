/* eslint-disable */
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  IconButton,
  LinearProgress,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import Swal from 'sweetalert2';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import zxcvbn from 'zxcvbn';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash, faKey } from '@fortawesome/free-solid-svg-icons';
import CryptoJS from 'crypto-js';
import { useAuth } from '../../hooks/ContextAuth';
import api from '../../utils/AxiosConfig';

const ChangePasswordClient = ({ idUsuario }) => {
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [passwordStrengthScore, setPasswordStrengthScore] = useState(0);
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const { csrfToken } = useAuth();
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isCompromised, setIsCompromised] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // ===================== MANTENEMOS TU FUNCIÓN =====================
  const checkPasswordCompromised = async (password) => {
    try {
      const hash = CryptoJS.SHA1(password).toString().toUpperCase();
      const prefix = hash.slice(0, 5);
      const suffix = hash.slice(5);
      const response = await axios.get(
        `https://api.pwnedpasswords.com/range/${prefix}`
      );
      const hashes = response.data.split('\n');
      const isFound = hashes.some((line) => {
        const [returnedHash] = line.split(':');
        return returnedHash.toLowerCase() === suffix.toLowerCase();
      });
      setIsCompromised(isFound);
      return isFound;
    } catch (error) {
      console.error('Error verificando la contraseña comprometida:', error);
      setIsCompromised(false);
      return false;
    }
  };

  // ===================== USE EFFECT PARA VALIDACIONES =====================
  useEffect(() => {
    const validatePasswords = async () => {
      let isValid = true;
      let validationError = '';

      // Validación de longitud
      if (!newPassword || newPassword.length < 8) {
        validationError = 'La contraseña debe tener al menos 8 caracteres.';
        isValid = false;
      }
      // Validación de complejidad
      else if (!/(?=.*[a-z])/.test(newPassword)) {
        validationError =
          'La contraseña debe contener al menos una letra minúscula.';
        isValid = false;
      } else if (!/(?=.*[A-Z])/.test(newPassword)) {
        validationError =
          'La contraseña debe contener al menos una letra mayúscula.';
        isValid = false;
      } else if (!/(?=.*\d)/.test(newPassword)) {
        validationError = 'La contraseña debe contener al menos un número.';
        isValid = false;
        // eslint-disable-next-line no-useless-escape
      } else if (
        !/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(newPassword)
      ) {
        validationError =
          'La contraseña debe contener al menos un carácter especial.';
        isValid = false;
      } else {
        // Verificar si la contraseña está comprometida y si es muy fuerte
        const passwordScore = zxcvbn(newPassword).score;
        if (await checkPasswordCompromised(newPassword)) {
          validationError = 'Esta contraseña ha sido comprometida. Elige otra.';
          isValid = false;
        } else if (passwordScore < 4) {
          validationError = 'La contraseña debe ser muy fuerte.';
          isValid = false;
        }
      }

      // Validar coincidencia de contraseñas
      if (newPassword !== confirmPassword) {
        validationError = 'Las contraseñas no coinciden.';
        isValid = false;
      }

      setError(validationError);
      setIsButtonDisabled(!isValid);
    };

    validatePasswords();
  }, [newPassword, confirmPassword]);

  // ===================== CÁLCULO INMEDIATO DEL SCORE =====================
  // Esto actualiza la barra de fortaleza apenas el usuario escribe.
  const handleNewPasswordChange = (e) => {
    const value = e.target.value;
    setNewPassword(value);
    // Calcula el score en tiempo real
    const localScore = zxcvbn(value).score;
    setPasswordStrengthScore(localScore);
  };

  // ===================== FUNCIÓN DE COLOR =====================
  const getStrengthColor = (score) => {
    switch (score) {
      case 0:
        return 'red';
      case 1:
        return 'orange';
      case 2:
        return 'yellow';
      case 3:
        return 'lightgreen';
      case 4:
        return 'green';
      default:
        return 'gray';
    }
  };

  // ===================== CAMBIO DE CONTRASEÑA =====================
  const handlePasswordChange = async () => {
    setIsLoading(true);
    try {
      const response = await api.post(
        '/api/usuarios/change-password',
        { idUsuario, newPassword },
        {
          headers: {
            'X-CSRF-Token': csrfToken,
          },
          withCredentials: true,
        }
      );

      if (response.data.success) {
        Swal.fire({
          icon: 'success',
          title: '¡Contraseña actualizada!',
          text: 'Tu contraseña ha sido cambiada correctamente.',
          timer: 2000,
          showConfirmButton: false,
        });
        setIsLoading(false);
        navigate('/login');
      } else {
        setError('Error al cambiar la contraseña.');
        setIsLoading(false);
      }
    } catch (err) {
      setIsLoading(false);
      if (err.response) {
        if (err.response.status === 409 && err.response.data.usedBefore) {
          setError(err.response.data.message);
        } else if (err.response.status === 400) {
          setError(err.response.data.message);
        } else if (err.response.status === 403) {
          setError(
            'No tienes permiso para cambiar la contraseña de este usuario.'
          );
        } else if (err.response.status === 500) {
          setError(
            'Error interno del servidor. Por favor, inténtalo más tarde.'
          );
        } else {
          setError(
            err.response.data.message || 'Error al cambiar la contraseña.'
          );
        }
      } else if (err.request) {
        setError('No se recibió respuesta del servidor. Verifica tu conexión.');
      } else {
        setError(
          'Error al realizar la solicitud. Por favor, inténtalo de nuevo.'
        );
      }
    }
  };

  // ===================== RENDERIZADO =====================
  return (
    <div className="max-w-[500px] mx-auto my-20 p-8 bg-white dark:bg-gray-900 shadow-lg rounded-lg relative border-t-4 border-t-yellow-400 min-h-[300px]">
      {/* Elemento decorativo: moño */}
      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-16 h-16 bg-yellow-400 rounded-full shadow-lg flex items-center justify-center">
        <FontAwesomeIcon icon={faKey} className="text-white text-2xl" />
      </div>

      {/* Botón de cerrar */}
      <button
        onClick={() => navigate('/cliente/perfil')}
        className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:text-gray-300"
      >
        <CloseIcon />
      </button>

      {/* Título */}
      <h2 className="text-xl font-bold text-center mb-4">Cambiar Contraseña</h2>

      {/* Mensaje de error */}
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}

      {/* Instrucción */}
      <p className="text-center mb-4 text-gray-600 dark:text-gray-300">
        Ahora puedes ingresar tu nueva contraseña.
      </p>

      {/* Campo de nueva contraseña */}
      <div className="mb-4">
        <label className="block text-gray-700 dark:text-gray-300 mb-2">
          Nueva Contraseña
        </label>
        <div className="relative">
          <input
            type={showNewPassword ? 'text' : 'password'}
            value={newPassword}
            onChange={handleNewPasswordChange} // <-- CAMBIO A ESTA FUNCIÓN
            className="w-full p-2 border rounded-lg pr-10 bg-gray-50 dark:bg-gray-800"
          />
          <button
            onClick={() => setShowNewPassword(!showNewPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <FontAwesomeIcon
              icon={showNewPassword ? faEyeSlash : faEye}
              className="text-gray-500"
            />
          </button>
        </div>
      </div>

      {/* Barra de fortaleza de contraseña */}
      <LinearProgress
        variant="determinate"
        value={(passwordStrengthScore / 4) * 100}
        className="mb-4 h-2 rounded-full bg-gray-200"
        sx={{
          '& .MuiLinearProgress-bar': {
            backgroundColor: getStrengthColor(passwordStrengthScore),
          },
        }}
      />
      <p
        className="text-center mb-4 font-medium"
        style={{ color: getStrengthColor(passwordStrengthScore) }}
      >
        Fortaleza de contraseña:{' '}
        {
          ['Muy débil', 'Débil', 'Aceptable', 'Fuerte', 'Muy fuerte'][
            passwordStrengthScore
          ]
        }
      </p>

      {/* Mensaje si está comprometida */}
      {isCompromised && (
        <p className="text-center text-red-500 text-sm mb-4">
          Esta contraseña ha sido comprometida. Elige otra.
        </p>
      )}

      {/* Campo de confirmar contraseña */}
      <div className="mb-4">
        <label className="block text-gray-700 dark:text-gray-300 mb-2">
          Confirmar Nueva Contraseña
        </label>
        <div className="relative">
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full p-2 border rounded-lg pr-10 bg-gray-50 dark:bg-gray-800"
          />
          <button
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <FontAwesomeIcon
              icon={showConfirmPassword ? faEyeSlash : faEye}
              className="text-gray-500"
            />
          </button>
        </div>
      </div>

      {/* Botón para cambiar contraseña */}
      <button
        onClick={handlePasswordChange}
        disabled={isButtonDisabled || isLoading}
        className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 disabled:bg-blue-300 transition-colors"
      >
        {isLoading ? (
          <CircularProgress size={24} className="text-white" />
        ) : (
          'Cambiar Contraseña'
        )}
      </button>
    </div>
  );
};

export default ChangePasswordClient;
