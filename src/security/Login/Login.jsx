import React, { useState, useRef, useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import ReCAPTCHA from "react-google-recaptcha";
import axios from "axios";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Alert, Box, CircularProgress, TextField, Button } from "@mui/material";
import { IconButton } from "@mui/material";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";
import { useAuth } from "../../hooks/ContextAuth";
const BASE_URL = "http://localhost:3001";



export const Login = () => {
  const [recaptchaValue, setRecaptchaValue] = useState(null);
  const [captchaValid, setCaptchaValid] = useState(false);
  const [captchaToken, setCaptchaToken] = useState("");
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [usuraioC, setUsuarioC] = useState([]);
  const recaptchaRef = useRef(null);
  const { executeRecaptcha } = useGoogleReCaptcha();


  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaToken, setMfaToken] = useState(""); // Para el código MFA
  const [userId, setUserId] = useState(""); //

  //Variables de contexto auto
  const { setUser, csrfToken } = useAuth();

  //funcion para show password or cult
  const togglePasswordVisibility = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };

  //=======================================================================
  //Obtenemos el tipo de dispositivo
  const getDeviceType = () => {
    const { userAgent } = navigator;

    const devicePatterns = [
      { pattern: /windows phone/i, type: "Windows Phone" },
      { pattern: /android/i, type: "Android" },
      { pattern: /iPad|iPhone|iPod/i, type: "iOS", exclude: /windowssstream/i },
      { pattern: /Windows NT/i, type: "Windows" },
    ];

    const matchedDevice = devicePatterns.find(
      ({ pattern, exclude }) =>
        pattern.test(userAgent) && (!exclude || !exclude.test(userAgent))
    );

    return matchedDevice ? matchedDevice.type : "Unknown";
  };
  //=====================================================================AUDITORIA DE LOGUEO=========
  const registrarAuditoria = async (
    usuario,
    correo,
    accion,
    dispositivo,
    detalles
  ) => {
    const fecha_hora = new Date().toISOString();
    const ip = await obtenerIPUsuario();

    try {
      await axios.post(
        "https://alquiladora-romero-backed-1.onrender.com/api/usuarios/auditoria",
        {
          usuario,
          correo,
          accion,
          dispositivo,
          ip,
          fecha_hora,
          detalles,
        },
        {
          headers: {
            "X-CSRF-Token": csrfToken,
          },
          withCredentials: true,
          timeout: 30000,
        }
      );
    } catch (error) {
      console.error("Error al enviar datos de auditoría:", error);
    }
  };

  //======================================================================================
  // Función para obtener la IP del usuario
  const obtenerIPUsuario = async () => {
    const serviciosIP = [
      "https://api64.ipify.org?format=json",
      "https://api.ipify.org?format=json",
      "https://ipinfo.io/json",
      "https://ipapi.co/json/",
    ];

    // Función para validar una dirección IP
    const esIPValida = (ip) => {
      const regexIPv4 = /^(?:\d{1,3}\.){3}\d{1,3}$/;
      const regexIPv6 = /^(?:[A-F0-9]{1,4}:){7}[A-F0-9]{1,4}$/i;
      return regexIPv4.test(ip) || regexIPv6.test(ip);
    };

    // Función para hacer la solicitud con timeout
    const fetchConTimeout = (url, timeout = 5000) => {
      return Promise.race([
        axios.get(url),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Timeout")), timeout)
        ),
      ]);
    };

    for (const servicio of serviciosIP) {
      try {
        const response = await fetchConTimeout(servicio);
        const ip =
          response.data.ip || response.data.ipAddress || response.data.ipv4;

        if (ip && esIPValida(ip)) {
          return ip; // Retornar la IP si es válida
        }
      } catch (error) {
        console.warn(`Error al obtener IP desde ${servicio}:`, error.message);
      }
    }

    console.error("No se pudo obtener una IP válida de ningún servicio.");
    return "Desconocido";
  };

  //================================Enviar datos a back=================================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    //Obtenemos el tipo de dispositivo
    const deviceType = getDeviceType();
    //Obtenemos el tiempo
    const deviceTime = new Date().toISOString();

    if (isBlocked) {
      setErrorMessage("Cuenta bloqueada. Espera 10 minutos.");
      await registrarAuditoria(
        "Desconocido",
        correo,
        "Intento fallido: cuenta bloqueada",
        deviceType,
        "Cuenta bloqueada por múltiples intentos"
      );
      return;
    }

    if (!correo.trim() || !contrasena.trim()) {
      setErrorMessage("Completa todos los campos");
      await registrarAuditoria(
        "Desconocido",
        correo,
        "Intento fallido: campos vacíos",
        deviceType,
        "Campos de inicio de sesión incompletos"
      );
      return;
    }

    if (!executeRecaptcha) {
      setErrorMessage("Completa el captcha");
      await registrarAuditoria(
        "Desconocido",
        correo,
        "Intento fallido: CAPTCHA no completado",
        deviceType,
        "CAPTCHA no completado por el usuario"
      );
      return;
    }

    try {
      setIsLoading(true);
      //oBTENEMOS EL TOKEN DE RECAPCHAT
      const captchaToken = await executeRecaptcha("login");
      if (!captchaToken) throw new Error("Error al obtener el token de reCAPTCHA.");
      // Hacemos una solicitud POST
      const response = await axios.post(
        `${BASE_URL}/api/usuarios/login`,
        {
          email: correo,
          contrasena: contrasena,
          tokenMFA: mfaToken,
          clientTimestamp: deviceTime,
          deviceType: deviceType,
          captchaToken: captchaToken
        },
        {
          headers: {
            "X-CSRF-Token": csrfToken,
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
          user ? user.nombre : "Desconocido",
          correo,
          "MFA requerido",
          deviceType,
          "Autenticación multifactor requerida"
        );
        return;
      }

      if (user) {
        console.log("Usuario obtenido:", user);
        setUser({ id: user.idUsuarios, nombre: user.nombre, rol: user.rol });
        setIsLoggedIn(true);
        await registrarAuditoria(
          user.nombre,
          correo,
          "Inicio de sesión exitoso",
          deviceType,
          "Usuario autenticado correctamente"
        );

        // Redirigir según el rol del usuario
        if (user.rol === "admin") {
          Swal.fire({
            title: "¡Inicio de sesión correcto!",
            text: "Bienvenido.",
            icon: "success",
            timer: 2000,
            showConfirmButton: false,
            customClass: {
              popup: "small-swal",
            },
            willClose: () => {
              console.log("Dirigiendo a administrador");
              navigate("/admin");
            },
          });
        } else if (user.rol === "cliente") {
          Swal.fire({
            title: "¡Inicio de sesión correcto!",
            text: "Bienvenido.",
            icon: "success",
            timer: 2000,
            showConfirmButton: false,
            customClass: {
              popup: "small-swal",
            },
            willClose: () => {
              console.log("Dirigiendo a cliente");
              navigate("/cliente");
            },
          });
        } else if (user.rol === "repartidor"){
          Swal.fire({
            title: "¡Inicio de sesión correcto!",
            text: "Bienvenido.",
            icon: "success",
            timer: 2000,
            showConfirmButton: false,
            customClass: {
              popup: "small-swal",
            },
            willClose: () => {
              console.log("Dirigiendo a repartidor");
              navigate("/repartidor");
            },
          });


          }
          else {
          setErrorMessage("Rol no reconocido.");
        }
      } else {
        setErrorMessage("No se pudo obtener el usuario.");
      }
    } catch (error) {
      console.error("Error durante el login:", error);

      // Manejo de errores
      if (error.code === "ECONNABORTED") {
        console.error("Error durante el login:", error.code);
        setErrorMessage("La solicitud tardó demasiado. Inténtalo de nuevo.");
        await registrarAuditoria(
          "Desconocido",
          correo,
          "Error: Tiempo de solicitud excedido",
          deviceType,
          "La solicitud de inicio de sesión tardó demasiado"
        );
      } else if (error.response) {
        const status = error.response.status;
        const serverMessage =
          error.response.data.message || "Error desconocido.";

        switch (status) {
          case 400:
            setErrorMessage(serverMessage);
            await registrarAuditoria(
              "Desconocido",
              correo,
              `Error 400: ${serverMessage}`,
              deviceType,
              "Solicitud inválida"
            );
            break;
          case 401:
            setErrorMessage(serverMessage);
            await registrarAuditoria(
              "Desconocido",
              correo,
              `Error 401: ${serverMessage}`,
              deviceType,
              "Credenciales incorrectas o autenticación requerida"
            );
            break;
          case 403:
            setIsBlocked(true);

            setErrorMessage(serverMessage);

            await registrarAuditoria(
              "Desconocido",
              correo,
              `Error 403: ${serverMessage}`,
              deviceType,
              "Acceso denegado o dispositivo bloqueado"
            );
            break;
          case 500:
            setErrorMessage(
              "Error del servidor. Por favor, intenta más tarde."
            );
            await registrarAuditoria(
              "Desconocido",
              correo,
              "Error 500: Error interno del servidor",
              deviceType,
              "Error en el servidor"
            );
            break;
          default:
            setErrorMessage(serverMessage);
            await registrarAuditoria(
              "Desconocido",
              correo,
              `Error ${status}: ${serverMessage}`,
              deviceType,
              "Error desconocido"
            );
            break;
        }
      } else {
        setErrorMessage("Error de conexión. Inténtalo de nuevo más tarde.");
        await registrarAuditoria(
          "Desconocido",
          correo,
          "Error de conexión",
          deviceType,
          "No se pudo conectar al servidor"
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
    setErrorMessage("");
    const deviceType = getDeviceType();
    const deviceTime = new Date().toISOString();

    try {
      setIsLoading(true);

      // Realizamos la solicitud al backend para verificar el código MFA
      const response = await axios.post(
       `${BASE_URL}/api/usuarios/login`,
        {
          email: correo,
          contrasena: contrasena,
          tokenMFA: mfaToken,
          clientTimestamp: deviceTime,
          deviceType: deviceType,
          captchaToken: captchaToken
        },
        {
          headers: {
            "X-CSRF-Token": csrfToken,
          },
          withCredentials: true,
          timeout: 30000,
        }
      );

      // Si la verificación del MFA fue exitosa, recibimos el usuario en la respuesta
      const user = response.data?.user;

      if (user) {
        // Guardamos el usuario en el contexto o en el estado global
        setUser({ id: user.idUsuarios, nombre: user.nombre, rol: user.rol });
        setIsLoggedIn(true);

        // Redirigimos según el rol del usuario
        if (user.rol === "admin") {
          Swal.fire({
            title: "¡Código MFA correcto!",
            text: "Bienvenido.",
            icon: "success",
            timer: 2000,
            showConfirmButton: false,
            willClose: () => navigate("/admin"),
          });
        } else if (user.rol === "cliente") {
          // Mostramos un mensaje de éxito y redirigimos al área del cliente
          Swal.fire({
            title: "¡Código MFA correcto!",
            text: "Bienvenido.",
            icon: "success",
            timer: 2000,
            showConfirmButton: false,
            willClose: () => navigate("/cliente"),
          });
        }
      } else {
        setErrorMessage("Código MFA incorrecto o vencido.");
      }
    } catch (error) {
      console.error("Error durante la verificación MFA:", error);

      if (error.code === "ECONNABORTED") {
        setErrorMessage("La solicitud tardó demasiado. Inténtalo de nuevo.");
      } else if (error.response) {
        setErrorMessage("Código MFA incorrecto o vencido.");
      } else {
        setErrorMessage("Error de conexión. Inténtalo de nuevo más tarde.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-full  dark:from-gray-800 dark:to-gray-900 py-8">
      {/* Efecto de lluvia de meteoritos */}
      <div className="meteor-shower">
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
            <div className="login-box flex items-center justify-center min-h-screen bg-gray-100">
              <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
                  Autenticación MFA
                </h2>

                {errorMessage && (
                  <div className="mb-4 text-center">
                    <div className="inline-flex items-center px-4 py-2 bg-red-100 border border-red-400 text-red-700 rounded">
                      <span className="mr-2">⚠️</span>
                      {errorMessage}
                    </div>
                  </div>
                )}

                <form onSubmit={handleMfaSubmit} className="space-y-6">
                  <div>
                    <label
                      htmlFor="mfaToken"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Código MFA
                    </label>
                    <input
                      id="mfaToken"
                      type="text"
                      value={mfaToken}
                      onChange={(e) => setMfaToken(e.target.value)}
                      className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center items-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    {isLoading ? (
                      <>
                        Verificando...
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
                      "Verificar Código"
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}
        </>
      ) : (
        <>
        <motion.div
  initial={{ opacity: 0, y: -50 }} // Animación inicial: invisible y desplazado hacia arriba
  animate={{ opacity: 1, y: 0 }}   // Animación final: visible y en su posición original
  transition={{ duration: 0.5 }}   // Duración de la animación
  className={`w-full max-w-md p-8 bg-white dark:bg-gray-900 shadow-2xl rounded-2xl mx-4 ${
    isBlocked || isLoading ? "opacity-50 pointer-events-none" : ""
  }`}
>
  {/* Título */}
  <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-6">
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
          type={showPassword ? "text" : "password"}
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
          <FontAwesomeIcon icon={showPassword ? faEye: faEyeSlash } />
        </button>
      </div>
    </div>

    {/* Enlace para recuperar contraseña */}
    <div className="text-right">
      <Link
        to="/recuperarPassword"
        className="text-sm text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-all duration-300"
      >
        ¿Olvidaste tu contraseña?
      </Link>
    </div>

    {/* Botón de inicio de sesión */}
    <motion.button
      disabled={isLoading || isBlocked}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      type="submit"
      className="w-full py-3 bg-blue-500 dark:bg-blue-600 text-white rounded-md font-semibold shadow-md hover:bg-blue-600 dark:hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all duration-300 flex items-center justify-center"
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
        "Iniciar Sesión"
      )}
    </motion.button>
  </form>

  {/* Enlace para registro */}
  <div className="mt-6 text-center">
    <p className="text-sm text-gray-700 dark:text-gray-300">
      ¿No tienes una cuenta?{" "}
      <Link
        to="/registro"
        className="text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-all duration-300"
      >
        Regístrate aquí
      </Link>
    </p>
  </div>
</motion.div>
          
        </>
      )}

      {/* Estilos para la lluvia de meteoritos */}
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
