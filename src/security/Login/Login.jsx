import React, { useState, useRef, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useAnimation } from 'framer-motion';

import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import { useAuth } from '../../hooks/ContextAuth';
import api from '../../utils/AxiosConfig';
import axios from 'axios';

export const Login = () => {
  const [captchaValid, setCaptchaValid] = useState(false);

  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [usuraioC, setUsuarioC] = useState([]);
  const recaptchaRef = useRef(null);
  const { executeRecaptcha } = useGoogleReCaptcha();
  const controls = useAnimation();
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaToken, setMfaToken] = useState('');
  const [userId, setUserId] = useState('');

  const { setUser, csrfToken } = useAuth();
  useEffect(() => {
    controls.start({ opacity: 1, y: 0 });
  }, [controls]);

  const togglePasswordVisibility = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };

  //=======================================================================

  const getDeviceType = () => {
    const { userAgent } = navigator;

    const devicePatterns = [
      { pattern: /windows phone/i, type: 'Windows Phone' },
      { pattern: /android/i, type: 'Android' },
      { pattern: /iPad|iPhone|iPod/i, type: 'iOS', exclude: /windowssstream/i },
      { pattern: /Windows NT/i, type: 'Windows' },
    ];

    const matchedDevice = devicePatterns.find(
      ({ pattern, exclude }) =>
        pattern.test(userAgent) && (!exclude || !exclude.test(userAgent))
    );

    return matchedDevice ? matchedDevice.type : 'Unknown';
  };

  const obtenerIPUsuario = async () => {
    const serviciosIP = [
      'https://api64.ipify.org?format=json',
      'https://api.ipify.org?format=json',
      'https://ipinfo.io/json',

    ];

    // Función para validar una dirección IP
    const esIPValida = (ip) => {
      const regexIPv4 = /^(?:\d{1,3}\.){3}\d{1,3}$/;
      return regexIPv4.test(ip);
    };
    // Función para hacer la solicitud con timeout
    const fetchIP = (url, timeout = 3000) => {
      return axios.get(url, { timeout: timeout });
    };


    for (const servicio of serviciosIP) {
      try {
       const response = await fetchIP(servicio, 4000);
       let ip = response.data.ip || response.data.ipAddress || response.data.ipv4;
       if (typeof ip === 'string') {
            ip = ip.trim();
        }

        if (ip && esIPValida(ip)) {
          return ip; 
        }
      } catch (error) {
    
        const errorMsg = error.message.includes('timeout')
          ? 'Timeout'
          : (error.code === 'ERR_BLOCKED_BY_CLIENT' ? 'Bloqueado por cliente' : 'Error de red');

        console.warn(`Error al obtener IP desde ${servicio}: ${errorMsg}. Intentando con el siguiente...`);
      }
    }

    console.error('No se pudo obtener una IP válida de ningún servicio.');
    return 'Desconocido';
  };

  //=====================================================================AUDITORIA DE LOGUEO=========
  const registrarAuditoria = async (
    usuario,
    correo,
    accion,
    dispositivo,
    detalles
  ) => {
    const ip = await obtenerIPUsuario();

    try {
      await api.post(
        `/api/auditoria/auditoria`,
        {
          usuario,
          correo,
          accion,
          dispositivo,
          ip,
          detalles,
        },
        {
          headers: {
            'X-CSRF-Token': csrfToken,
          },
          withCredentials: true,
          timeout: 30000,
        }
      );
    } catch (error) {
      console.error('Error al enviar datos de auditoría:', error);
    }
  };

  //======================================================================================

  //================================Enviar datos a back=================================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const deviceType = getDeviceType();

    if (!executeRecaptcha) {
      setErrorMessage('Completa el captcha');
      await registrarAuditoria(
        'Desconocido',
        correo,
        'Intento fallido: CAPTCHA no completado',
        deviceType,
        'CAPTCHA no completado por el usuario'
      );
      return;
    }

    //oBTENEMOS EL TOKEN DE RECAPCHAT
    const captchaToken = await executeRecaptcha('login');

    if (!captchaToken)
      throw new Error('Error al obtener el token de reCAPTCHA.');

    if (isBlocked) {
      setErrorMessage('Cuenta bloqueada. Espera 10 minutos.');
      await registrarAuditoria(
        'Desconocido',
        correo,
        'Intento fallido: cuenta bloqueada',
        deviceType,
        'Cuenta bloqueada por múltiples intentos'
      );
      return;
    }

    if (!correo.trim() || !contrasena.trim()) {
      setErrorMessage('Completa todos los campos');

      await registrarAuditoria(
        'Desconocido',
        correo,
        'Intento fallido: campos vacíos',
        deviceType,
        'Campos de inicio de sesión incompletos'
      );
      return;
    }

    try {
      setIsLoading(true);

      const ip = await obtenerIPUsuario();
      console.log('Datos de mfa', mfaToken);

      // Hacemos una solicitud POST
      const response = await api.post(
        `/api/usuarios/login`,
        {
          email: correo,
          contrasena: contrasena,
          tokenMFA: mfaToken,
          deviceType: deviceType,
          captchaToken,
          ip,
        },
        {
          headers: {
            'X-CSRF-Token': csrfToken,
          },
          withCredentials: true,
          timeout: 30000,
        }
      );
      const user = response.data?.user;
      setUserId(response.data.userId);
      setUsuarioC(user);
      if (response.data.mfaRequired) {
        setMfaRequired(true);

        await registrarAuditoria(
          user ? user.nombre : 'Desconocido',
          correo,
          'MFA requerido',
          deviceType,
          'Autenticación multifactor requerida'
        );
        return;
      }

      if (user) {
        setUser({ id: user.idUsuarios, nombre: user.nombre, rol: user.rol });
        setIsLoggedIn(true);
        await registrarAuditoria(
          user.nombre,
          correo,
          'Inicio de sesión exitoso',
          deviceType,
          'Usuario autenticado correctamente'
        );

        // Redirigir según el rol del usuario
        if (user.rol === 'administrador') {
          Swal.fire({
            title: '¡Inicio de sesión correcto!',
            text: 'Bienvenido.',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false,
            customClass: {
              popup: 'small-swal',
            },
            willClose: () => {
              console.log('Dirigiendo a administrador');
              navigate('/administrador');
            },
          });
        } else if (user.rol === 'cliente') {
          Swal.fire({
            title: '¡Inicio de sesión correcto!',
            text: 'Bienvenido.',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false,
            customClass: {
              popup: 'small-swal',
            },
            willClose: () => {
              console.log('Dirigiendo a cliente');
              navigate('/cliente');
            },
          });
        } else if (user.rol === 'repartidor') {
          Swal.fire({
            title: '¡Inicio de sesión correcto!',
            text: 'Bienvenido.',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false,
            customClass: {
              popup: 'small-swal',
            },
            willClose: () => {
              console.log('Dirigiendo a repartidor');
              navigate('/repartidor');
            },
          });
        } else {
          setErrorMessage('Rol no reconocido.');
        }
      } else {
        setErrorMessage('No se pudo obtener el usuario.');
      }
    } catch (error) {
      console.error('Error durante el login:', error);

      // Manejo de errores
      if (error.code === 'ECONNABORTED') {
        console.error('Error durante el login:', error.code);
        setErrorMessage('La solicitud tardó demasiado. Inténtalo de nuevo.');
        await registrarAuditoria(
          'Desconocido',
          correo,
          'Error: Tiempo de solicitud excedido',
          deviceType,
          'La solicitud de inicio de sesión tardó demasiado'
        );
      } else if (error.response) {
        const status = error.response.status;
        const serverMessage =
          error.response.data.message || 'Error desconocido.';

        switch (status) {
          case 400:
            setErrorMessage(serverMessage);
            await registrarAuditoria(
              'Desconocido',
              correo,
              `Error 400: ${serverMessage}`,
              deviceType,
              'Solicitud inválida'
            );
            break;
          case 401:
            setErrorMessage(serverMessage);
            await registrarAuditoria(
              'Desconocido',
              correo,
              `Error 401: ${serverMessage}`,
              deviceType,
              'Credenciales incorrectas o autenticación requerida'
            );
            break;
          case 403:
            setIsBlocked(true);

            setErrorMessage(serverMessage);

            await registrarAuditoria(
              'Desconocido',
              correo,
              `Error 403: ${serverMessage}`,
              deviceType,
              'Acceso denegado o dispositivo bloqueado'
            );
            break;
          case 500:
            navigate('/error500');
            setErrorMessage(
              'Error del servidor. Por favor, intenta más tarde.'
            );
            await registrarAuditoria(
              'Desconocido',
              correo,
              'Error 500: Error interno del servidor',
              deviceType,
              'Error en el servidor'
            );
            break;
          default:
            setErrorMessage(serverMessage);
            await registrarAuditoria(
              'Desconocido',
              correo,
              `Error ${status}: ${serverMessage}`,
              deviceType,
              'Error desconocido'
            );
            break;
        }
      } else {
        navigate('/error500');
        setErrorMessage('Error de conexión. Inténtalo de nuevo más tarde.');
        await registrarAuditoria(
          'Desconocido',
          correo,
          'Error de conexión',
          deviceType,
          'No se pudo conectar al servidor'
        );
      }

      if (recaptchaRef.current) {
        recaptchaRef.current?.reset();
        setCaptchaValid(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  //=================================================================================================
  // Función para enviar el código MFA
  const handleMfaSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    const ip = await obtenerIPUsuario();

    const deviceType = getDeviceType();
    try {
      setIsLoading(true);
      const captchaToken = await executeRecaptcha('login');

      if (!captchaToken)
        throw new Error('Error al obtener el token de reCAPTCHA.');
      console.log('Datos de mfa-1', mfaToken);
      const response = await api.post(
        `/api/usuarios/login`,
        {
          email: correo,
          contrasena: contrasena,
          tokenMFA: mfaToken,
          deviceType: deviceType,
          captchaToken: captchaToken,
          ip,
        },

        {
          headers: {
            'X-CSRF-Token': csrfToken,
          },
          withCredentials: true,
          timeout: 30000,
        }
      );
      const user = response.data?.user;

      if (user) {
        setUser({ id: user.idUsuarios, nombre: user.nombre, rol: user.rol });
        setIsLoggedIn(true);
        if (user.rol === 'administrador') {
          Swal.fire({
            title: '¡Código MFA correcto!',
            text: 'Bienvenido.',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false,
            willClose: () => navigate('/administrador'),
          });
        } else if (user.rol === 'cliente') {
          Swal.fire({
            title: '¡Código MFA correcto!',
            text: 'Bienvenido.',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false,
            willClose: () => navigate('/cliente'),
          });
        }
      } else {
        setErrorMessage('Código MFA incorrecto o vencido.');
      }
    } catch (error) {
      console.error('Error durante la verificación MFA:', error);

      if (error.code === 'ECONNABORTED') {
        setErrorMessage('La solicitud tardó demasiado. Inténtalo de nuevo.');
      } else if (error.response) {
        setErrorMessage('Código MFA incorrecto o vencido.');
      } else {
        navigate('/error500');
        setErrorMessage('Error de conexión. Inténtalo de nuevo más tarde.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-full  dark:from-gray-800 dark:to-gray-900 py-8  relative overflow-hidden">
      {/* Efecto de lluvia de meteoritos */}
      <div className="meteor-shower absolute inset-0 z-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="meteor"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 8}s`,
            }}
          ></div>
        ))}
      </div>
      {mfaRequired ? (
        <>
          {mfaRequired && (
            <div className="flex justify-center   px-4 sm:px-6 lg:px-8  to-gray-100 dark:from-gray-900 dark:to-gray-800">
              <div className="w-full max-w-md p-6 sm:p-8 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700">
                {/* Título */}
                <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-800 dark:text-white mb-6">
                  Autenticación MFA
                </h2>

                {/* Mensaje de error */}
                {errorMessage && (
                  <div className="mb-4">
                    <div className="flex items-center justify-center px-4 py-3 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-200 rounded-lg">
                      <span className="mr-2">⚠️</span>
                      {errorMessage}
                    </div>
                  </div>
                )}

                {/* Formulario */}
                <form onSubmit={handleMfaSubmit} className="space-y-5">
                  {/* Campo de entrada para el código MFA */}
                  <div>
                    <label
                      htmlFor="mfaToken"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      Código MFA
                    </label>
                    <input
                      id="mfaToken"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]{6}"
                      maxLength={6}
                      value={mfaToken}
                      onChange={(e) => setMfaToken(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-600 dark:focus:border-blue-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white placeholder-gray-400"
                      placeholder="Ingresa tu código de 6 dígitos"
                      required
                    />
                  </div>

                  {/* Botón de verificación */}
                  <button
                    type="submit"
                    disabled={isLoading || isBlocked}
                    whileHover={
                      !(isLoading || isBlocked) ? { scale: 1.05 } : {}
                    }
                    whileTap={!(isLoading || isBlocked) ? { scale: 0.95 } : {}}
                    className={`w-full px-4 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 
        ${isLoading || isBlocked
                        ? 'bg-gray-400 dark:bg-gray-500 text-gray-200 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500'
                      }`}
                  >
                    {isLoading ? (
                      <>
                        <span>Verificando...</span>
                        <svg
                          className="animate-spin ml-2 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                      </>
                    ) : (
                      'Verificar Código'
                    )}
                  </button>
                </form>

                {/* Nota adicional */}
                <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                  Usa tu aplicación de autenticación (como Google Authenticator)
                  para obtener el código.
                </p>
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={controls}
            transition={{ duration: 0.5 }}
            className={`w-full max-w-md p-8 bg-white dark:bg-gray-900 shadow-2xl rounded-2xl mx-4 
            }`}
          >
            {/* Título */}
            <h2 className="text-3xl font-bold text-center text-[#fcb900]  mb-6">
              Bienvenido
            </h2>

            {/* Mensaje de error */}
            {errorMessage && (
              <div className="mb-6 text-center">
                <div className="inline-flex items-center px-4 py-2 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 rounded-md">
                  <span className="mr-2">⚠️</span>
                  {errorMessage}
                </div>
              </div>
            )}

            {/* Formulario de inicio de sesión */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Campo de correo electrónico */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Correo electrónico
                </label>
                <input
                  type="email"
                  id="email"
                  placeholder="Ingresa tu correo"
                  value={correo}
                  disabled={isBlocked || isLoading}
                  onChange={(e) => setCorreo(e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-800 dark:text-white transition-all duration-300"
                  required
                />
              </div>

              {/* Campo de contraseña */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    placeholder="Ingresa tu contraseña"
                    value={contrasena}
                    disabled={isBlocked || isLoading}
                    onChange={(e) => setContrasena(e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-800 dark:text-white transition-all duration-300"
                    required
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 dark:text-gray-400"
                  >
                    <FontAwesomeIcon icon={showPassword ? faEye : faEyeSlash} />
                  </button>
                </div>
              </div>

              {/* Enlace para recuperar contraseña */}
              <div className="text-right">
                <Link
                  to="/cambiarPass"
                  className="text-sm  text-yellow-500 hover:text-yellow-600 dark:text-yellow-500 hover:text-yellow-600 dark:hover:text-yellow-300 transition-all duration-300"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>

              {/* Botón de inicio de sesión */}
              <motion.button
                disabled={isLoading || isBlocked}
                whileHover={!(isLoading || isBlocked) ? { scale: 1.05 } : {}}
                whileTap={!(isLoading || isBlocked) ? { scale: 0.95 } : {}}
                type="submit"
                className={`w-full py-3 rounded-md font-semibold shadow-md transition-all duration-300 flex items-center justify-center focus:outline-none focus:ring-2 
        ${isLoading || isBlocked
                    ? 'bg-gray-400 dark:bg-gray-500 text-gray-200 cursor-not-allowed'
                    : 'bg-yellow-500 hover:bg-yellow-600 dark:bg-yellow-500 text-white hover:bg-yellow-600 dark:hover:bg-yellow-600 focus:ring-yellow-500 dark:focus:ring-yellow-400'
                  }`}
              >
                {isLoading ? (
                  <>
                    Cargando...
                    <svg
                      className="animate-spin ml-2 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  </>
                ) : (
                  'Iniciar Sesión'
                )}
              </motion.button>
            </form>

            {/* Enlace para registro */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                ¿No tienes una cuenta?{' '}
                <Link
                  to="/registro"
                  className="text-yellow-500 hover:text-yellow-600 dark:text-yellow-500 hover:text-yellow-600 dark:hover:text-yellow-300 transition-all duration-300"
                >
                  Regístrate aquí
                </Link>
              </p>
            </div>
          </motion.div>
        </>
      )}

      <style jsx>{`
        .meteor-shower {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          z-index: -1;
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
