import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faCheckCircle, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { AlertSuccess, AlertError, AlertInfo } from "../../components/alerts/Alerts"; // Importar los componentes de alerta
import axios from "axios";
import { useAuth } from "../../hooks/ContextAuth";


const Paso1 = ({ onValidationSuccess, setGuardarCorreo }) => {
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const {csrfToken} = useAuth();
  const [alert, setAlert] = useState(null); 
  const recaptchaRef = useRef(null);
  const { executeRecaptcha } = useGoogleReCaptcha();
  

  const BASE_URL = "http://localhost:3001";



  // Obtener lista de usuarios cuando el token CSRF esté disponible
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

  // Validar formato de correo usando el servidor
  const isValidEmail = async (email) => {
  

    try {
      const response = await axios.post(
        "http://localhost:3001/api/email/validate-email",
        { email },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': csrfToken,
          },
          withCredentials: true,
        }
      );

      console.log("Respuesta del servidor:", response.data);
      console.log("Respuesta del data", response.data.isValid);

      return response.data.isValid ?? false;
    } catch (error) {
      console.error("Error validando el correo:", error.response?.data || error.message);
      return false;
    }
  };

  // Manejo del formulario
  const handleValidation = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");
    setAlert(null); // Limpiar alertas anteriores

    if (!executeRecaptcha) {
      setAlert(<AlertError message="reCAPTCHA no cargado correctamente. Intenta nuevamente." />);
      return;
    }

    try {
      // Validar correo
      if (!(await isValidEmail(email))) {
        setAlert(<AlertError message="Correo inválido." />);
        return;
      }

      // Obtener token de reCAPTCHA
      const captchaToken = await executeRecaptcha("validate_email");

      if (!captchaToken) throw new Error("Error al obtener el token de reCAPTCHA.");
      // Optimización: Usar un Set para validar si el correo ya existe
      let listaUsuarios = Array.isArray(usuarios) && usuarios.length > 0 ? usuarios : [];

      const correosExistentes = new Set(
        listaUsuarios
          .filter((usuario) => usuario && usuario.correo) 
          .map((usuario) => usuario.correo.toLowerCase().trim()) 
      );
   
      if (correosExistentes.has(email.toLowerCase().trim())) {
        setAlert(<AlertError message="Utiliza otro correo." />);
        return;
      }
      // Enviar correo
      await axios.post(
        `${BASE_URL}/api/email/send`,
        { correo: email,  captchaToken: captchaToken, mensaje: "Bienvenido", nombreR: "cliente" },
        { headers: { "X-CSRF-Token": csrfToken }, withCredentials: true }
      );
      console.log("cORREO ENVIADO ")

      setGuardarCorreo(email);

      // Mostrar alerta de éxito
      setAlert(<AlertSuccess message="¡Token enviado al correo!" />);

      // Ejecutar callback de éxito si existe
      onValidationSuccess?.();
    } catch (error) {
      console.error("Error al procesar la solicitud:", error);
      setAlert(<AlertError message="Lo sentimos, vuelve a intentar más tarde." />);
      recaptchaRef.current?.reset();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-md rounded-lg dark:bg-gray-950 dark:text-white">
      <h2 className="text-2xl font-bold mb-4 text-center">Paso 1: Ingresa tu correo</h2>
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
  );
};

export default Paso1;