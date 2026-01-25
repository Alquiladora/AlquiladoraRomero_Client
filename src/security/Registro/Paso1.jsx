import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import api from '../../utils/AxiosConfig';
import { useAuth } from '../../hooks/ContextAuth';
import { showAlert } from '../../components/alerts/Alert'; // Importa la función de alertas

const Paso1 = ({ onValidationSuccess, setGuardarCorreo }) => {
  const [email, setEmail] = useState('');
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const { csrfToken } = useAuth();
  const { executeRecaptcha } = useGoogleReCaptcha();

  useEffect(() => {
    if (csrfToken) {
      const ConsultarUsuarios = async () => {
        try {
          const response = await api.get(`/api/usuarios`);
          setUsuarios(response.data);
        } catch (error) {
          console.error('Error al cargar los usuarios:', error);
        }
      };
      ConsultarUsuarios();
    }
  }, [csrfToken]);

  const isValidEmail = async (email) => {
    try {
      const response = await api.post(
        `/api/emails/validate-email`,
        { email },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': csrfToken,
          },
          withCredentials: true,
        }
      );

      return response.data.isValid ?? false;
    } catch (error) {
      console.error('Error validando el correo:', error);
      return false;
    }
  };

  const handleValidation = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!executeRecaptcha) {
      showAlert(
        'error',
        'reCAPTCHA no cargado correctamente. Intenta nuevamente.'
      );
      setLoading(false);
      return;
    }

    try {
      if (!(await isValidEmail(email))) {
        showAlert('error', 'Correo inválido.');
        setLoading(false);
        return;
      }

      const captchaToken = await executeRecaptcha('validate_email');
      if (!captchaToken)
        throw new Error('Error al obtener el token de reCAPTCHA.');

      const usuarioCorreo = usuarios.some(
        (usuario) =>
          usuario.correo.toLowerCase().trim() === email.toLowerCase().trim()
      );

      if (usuarioCorreo) {
        showAlert('error', 'Este correo ya está registrado. Utiliza otro.');
        setLoading(false);
        return;
      }

      await api.post(
        `/api/emails/send`,
        {
          correo: email,
          captchaToken,
          mensaje: 'Bienvenido',
          nombreR: 'cliente',
        },
        { headers: { 'X-CSRF-Token': csrfToken }, withCredentials: true }
      );

      setGuardarCorreo(email);
      showAlert('success', '¡Token enviado al correo!');
      onValidationSuccess?.();
    } catch (error) {
      console.error('Error al procesar la solicitud:', error);
      showAlert('error', 'Lo sentimos, vuelve a intentar más tarde.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 dark:bg-gray-950 dark:text-white relative">
      <h2 className="text-2xl font-bold mb-4 text-center">
        Paso 1: Ingresa tu correo
      </h2>

      <form onSubmit={handleValidation} className="space-y-4">
        <div className="form-group dark:bg-gray-950 dark:text-white">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 dark:text-white"
          >
            Correo Electrónico
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`block w-full p-2 border border-gray-300 rounded-md dark:bg-gray-950 dark:text-white ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            required
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          className={`w-full flex justify-center items-center bg-blue-600 text-white py-2 px-4 rounded-md ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          disabled={loading}
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
