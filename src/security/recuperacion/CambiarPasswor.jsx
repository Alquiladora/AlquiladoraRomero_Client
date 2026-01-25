/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faSpinner, faEnvelope, faKey } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

import api from '../../utils/AxiosConfig';
import { useAuth } from '../../hooks/ContextAuth';
import { TokenValidation } from './TokenValidation';
import ChangePasswordClient from './ChangePasswordClient';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';

const CambiarPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { csrfToken } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [usuarioE, setUsuarioE] = useState(null);
  const navigate = useNavigate();
  const { executeRecaptcha } = useGoogleReCaptcha();
  const [cambiosContrasena, setCambiosContrasena] = useState(0);
  const [bloqueado, setBloqueado] = useState(false);

  useEffect(() => {
    if (csrfToken) {
      const fetchUsuarios = async () => {
        try {
          const response = await api.get(`/api/usuarios`, {
            headers: {
              'X-CSRF-Token': csrfToken,
              'Content-Type': 'application/json',
            },
            withCredentials: true,
          });
          setUsuarios(response.data);
        } catch (error) {
          console.error('Error al cargar los usuarios:', error);
        }
      };
      fetchUsuarios();
    }
  }, [csrfToken]);

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

      setCambiosContrasena(response.data.cambiosRealizados);
      setBloqueado(response.data.cambiosRealizados >= 20);
    } catch (error) {
      console.error('Error al verificar los cambios de contraseña:', error);
    }
  };

  const validateEmail = (email) => {
    // Expresión regular simple para validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const getErrorColor = (message) => {
    if (message.includes('válido')) return 'bg-yellow-100 text-yellow-700';
    if (message.includes('registrado') || message.includes('problema'))
      return 'bg-red-100 text-red-700';
    return 'bg-red-100 text-red-700';
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    if (!validateEmail(email)) {
      setErrorMessage('Por favor ingresa un correo electrónico válido.');
      setLoading(false);
      return;
    }

    // Ejecuta reCAPTCHA
    if (!executeRecaptcha) {
      console.error('Execute recaptcha no está disponible');
      setLoading(false);
      return;
    }
    //Integrar despues
    const recaptchaToken = await executeRecaptcha('cambiar_password');

    const usuarioEncontrado = usuarios.find(
      (usuario) =>
        usuario.correo.toLowerCase().trim() === email.toLowerCase().trim()
    );
    if (!usuarioEncontrado) {
      setErrorMessage('Este correo no está registrado.');
      setLoading(false);
      return;
    }

    const isBloqueado = await verificarCambiosContrasena(
      usuarioEncontrado.idUsuarios
    );
    if (isBloqueado) {
      setErrorMessage(
        'Has alcanzado el límite de cambios de contraseña para este mes. Por favor, intenta el próximo mes.'
      );
      setLoading(false);
      return;
    }

    setUsuarioE(usuarioEncontrado);

    try {
      await api.post(
        '/api/emails/cambiarpass',
        {
          correo: email,
          nombreU: usuarioEncontrado.nombre,
          rol: usuarioEncontrado.rol,
        },
        {
          headers: {
            'X-CSRF-Token': csrfToken,
          },
          withCredentials: true,
        }
      );
      Swal.fire({
        icon: 'success',
        title: '¡Token enviado al correo!',
        showConfirmButton: true,
        customClass: { popup: 'small-swal' },
      });
      setStep(2);
    } catch (error) {
      console.error('Error al enviar token:', error);
      setErrorMessage('Lo sentimos, vuelve a intentar más tarde.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="m-10 flex items-center justify-center p-4">
      <div className="meteor-shower">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="meteor"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          ></div>
        ))}
      </div>

      <div className="p-8 rounded-2xl w-full max-w-md transform transition-all duration-500 hover:scale-105 dark:bg-gray-900 dark:text-white">
        {step === 1 && (
          <>

            <div className="relative bg-white dark:bg-gray-800 shadow-lg rounded-2xl  mx-auto p-6 border-t-4 border-yellow-500">
              {/* Banner compacto */}
              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 z-10">
                <div className="bg-yellow-400 text-yellow-900 px-4 py-1 rounded-full text-xs font-semibold shadow-md">
                  <FontAwesomeIcon icon={faEnvelope} className="mr-1" />
                  Verifica tu correo
                </div>
              </div>

              {/* Contenido compacto */}
              <div className="w-full pt-3">
                {/* Header mínimo */}
                <div className="text-center mb-4">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-2">
                    <FontAwesomeIcon
                      icon={faKey}
                      className="text-blue-600 dark:text-blue-400 text-lg"
                    />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-1">
                    Cambiar Contraseña
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 text-xs">
                    Ingresa tu correo para el token
                  </p>
                </div>

                {/* Mensaje de error compacto */}
                {errorMessage && (
                  <div className={`mb-3 p-2 rounded-lg text-xs ${getErrorColor(errorMessage)} bg-opacity-10`}>
                    <div className="flex items-center">
                      <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2" />
                      <span>{errorMessage}</span>
                    </div>
                  </div>
                )}

                {/* Formulario compacto */}
                <form onSubmit={handleEmailSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Correo Electrónico
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`w-full p-3 pl-10 text-sm border rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500 ${loading ? 'opacity-50' : ''
                          }`}
                        placeholder="tu@correo.com"
                        required
                        disabled={loading}
                      />
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                        <FontAwesomeIcon icon={faEnvelope} className="text-gray-400" />
                      </div>
                    </div>
                  </div>

                  {/* Botón compacto */}
                  <button
                    type="submit"
                    className={`w-full flex justify-center items-center gap-2 bg-blue-600 text-white py-3 px-4 rounded-lg text-sm font-medium transition-colors ${loading || bloqueado ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
                      }`}
                    disabled={loading || bloqueado}
                  >
                    {loading ? (
                      <>
                        <FontAwesomeIcon icon={faSpinner} spin />
                        <span>Validando...</span>
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faCheckCircle} />
                        <span>Validar Correo</span>
                      </>
                    )}
                  </button>
                </form>

                {/* Texto pequeño al final */}
                <div className="text-center mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Te enviaremos un token de verificación
                  </p>
                </div>
              </div>
            </div>

          </>
        )}

        {step === 2 && (
          <>
            <TokenValidation correo={usuarioE.correo} setStep={setStep} />
          </>
        )}

        {step === 3 && (
          <>
            <ChangePasswordClient idUsuario={usuarioE.idUsuarios} />
          </>
        )}
      </div>

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
          background: linear-gradient(
            to bottom,
            rgba(252, 185, 0, 0),
            rgba(252, 185, 0, 0.8)
          );
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
