/* eslint-disable */
import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle, faSpinner } from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

import api from "../../utils/AxiosConfig";
import { useAuth } from "../../hooks/ContextAuth";
import { TokenValidation } from "./TokenValidation";
import ChangePasswordClient from "./ChangePasswordClient";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";

const CambiarPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { csrfToken } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
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
              "X-CSRF-Token": csrfToken,
              "Content-Type": "application/json",
            },
            withCredentials: true,
          });
          setUsuarios(response.data);
        } catch (error) {
          console.error("Error al cargar los usuarios:", error);
        }
      };
      fetchUsuarios();
    }
  }, [csrfToken]);

  const verificarCambiosContrasena = async (idUsuario) => {
    if (!idUsuario) {
      console.warn(
        "⚠️ ID de usuario no disponible, no se verificará cambios de contraseña."
      );
      return;
    }
    try {
      const response = await api.get(`/api/usuarios/vecesCambioPass`, {
        params: { idUsuario },
        headers: { "X-CSRF-Token": csrfToken },
        withCredentials: true,
      });
      console.log("Respuesta de vecesCambioPass:", response.data);
      setCambiosContrasena(response.data.cambiosRealizados);
      setBloqueado(response.data.cambiosRealizados >= 20);
    } catch (error) {
      console.error("Error al verificar los cambios de contraseña:", error);
    }
  };

  const validateEmail = (email) => {
    // Expresión regular simple para validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const getErrorColor = (message) => {
    if (message.includes("válido")) return "bg-yellow-100 text-yellow-700";
    if (message.includes("registrado") || message.includes("problema"))
      return "bg-red-100 text-red-700";
    return "bg-red-100 text-red-700";
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    if (!validateEmail(email)) {
      setErrorMessage("Por favor ingresa un correo electrónico válido.");
      setLoading(false);
      return;
    }

    // Ejecuta reCAPTCHA
    if (!executeRecaptcha) {
      console.error("Execute recaptcha no está disponible");
      setLoading(false);
      return;
    }
    //Integrar despues
    const recaptchaToken = await executeRecaptcha("cambiar_password");

    const usuarioEncontrado = usuarios.find(
      (usuario) =>
        usuario.correo.toLowerCase().trim() === email.toLowerCase().trim()
    );
    if (!usuarioEncontrado) {
      setErrorMessage("Este correo no está registrado.");
      setLoading(false);
      return;
    }

    const isBloqueado = await verificarCambiosContrasena(
      usuarioEncontrado.idUsuarios
    );
    if (isBloqueado) {
      setErrorMessage(
        "Has alcanzado el límite de cambios de contraseña para este mes. Por favor, intenta el próximo mes."
      );
      setLoading(false);
      return;
    }

    setUsuarioE(usuarioEncontrado);

    try {
      await api.post(
        "/api/email/cambiarpass",
        {
          correo: email,
          nombreU: usuarioEncontrado.nombre,
          rol: usuarioEncontrado.rol,
        },
        {
          headers: {
            "X-CSRF-Token": csrfToken,
          },
          withCredentials: true,
        }
      );
      Swal.fire({
        icon: "success",
        title: "¡Token enviado al correo!",
        showConfirmButton: true,
        customClass: { popup: "small-swal" },
      });
      setStep(2);
    } catch (error) {
      console.error("Error al enviar token:", error);
      setErrorMessage("Lo sentimos, vuelve a intentar más tarde.");
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
            <div className="relative  shadow-lg rounded-2xl w-full max-w-md p-8 transform transition-all duration-500 hover:scale-105 border-t-8 border-yellow-500">
              {/* Banner animado extra debajo del moño */}
              <div className="absolute -top-4 left-0 right-0 mx-auto flex justify-center z-10">
                <div className="bg-yellow-200 text-yellow-800 px-4 py-1 rounded-full text-sm font-medium shadow-lg animate-bounce">
                  Verifica tu correo para el token
                </div>
              </div>
              <div className="max-w-md mx-auto p-6 dark:bg-gray-900 dark:text-white">
                <h2 className="text-2xl font-bold mb-4 text-center">
                  Cambiar Contraseña
                </h2>
                {errorMessage && (
                  <div
                    className={`mb-4 p-3 rounded-md text-sm ${getErrorColor(
                      errorMessage
                    )}`}
                  >
                    {errorMessage}
                  </div>
                )}
                <form onSubmit={handleEmailSubmit} className="space-y-4">
                  <div className="form-group">
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Correo Electrónico
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`block w-full p-2 border rounded-md bg-gray-50 text-gray-900 dark:bg-gray-800 dark:text-white dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        loading ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                      required
                      disabled={loading}
                    />
                  </div>
                  <button
                    type="submit"
                    className={`w-full flex justify-center items-center bg-blue-600 text-white py-2 px-4 rounded-md transition-colors ${
                      loading || bloqueado
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:bg-blue-700"
                    }`}
                    disabled={loading || bloqueado}
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
