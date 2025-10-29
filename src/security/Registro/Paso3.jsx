/* eslint-disable */
import React, { useState, useEffect, useRef } from 'react';
import {
  TextField,
  Box,
  Button,
  Alert,
  Typography,
  InputAdornment,
  IconButton,
  CircularProgress,
} from '@mui/material';
import zxcvbn from 'zxcvbn';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import CryptoJS from 'crypto-js';
import anime from 'animejs';
import { useAuth } from '../../hooks/ContextAuth';
import api from '../../utils/AxiosConfig';
import axios from 'axios';

const Paso3 = ({ guardarCorreo }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    telefono: '',
    contrasena: '',
    confirmarContrasena: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});
  const [passwordStrengthScore, setPasswordStrengthScore] = useState(0);
  const [isFormValid, setIsFormValid] = useState(false);
  const [usuarios, setUsuarios] = useState([]);
  const navigate = useNavigate();
  const passwordStrengthBarRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);

  const { csrfToken } = useAuth();
  const [isCompromised, setIsCompromised] = useState(false);

  const BASE_URL = 'http://localhost:3001';

  useEffect(() => {
    const fetchUsuariosYCsrf = async () => {
      try {
        const response = await api.get(`/api/usuarios`);
        setUsuarios(response.data);
      } catch (error) {
        console.error('Error al cargar los usuarios o el token CSRF', error);
      }
    };

    fetchUsuariosYCsrf();
  }, [csrfToken]);

  useEffect(() => {
    if (passwordStrengthBarRef.current) {
      anime({
        targets: passwordStrengthBarRef.current,
        width: `${(passwordStrengthScore / 4) * 100}%`,
        backgroundColor: getPasswordStrengthColor(passwordStrengthScore),
        duration: 800,
        easing: 'easeOutQuad',
      });
    }
  }, [passwordStrengthScore]);

  // Animación de entrada del formulario
  useEffect(() => {
    anime({
      targets:
        '.registro-form1 .MuiTextField-root, .registro-form1 .MuiButton-root',
      opacity: [0, 1],
      translateY: [20, 0],
      delay: anime.stagger(100),
      duration: 800,
      easing: 'easeOutQuad',
    });
  }, []);

  const validateField = (name, value) => {
    let error = '';
    if (
      name === 'nombre' ||
      name === 'apellidoPaterno' ||
      name === 'apellidoMaterno'
    ) {
      if (!value.trim()) {
        error = 'El dato es requerido';
      } else if (!/^[a-zA-Z\u00C0-\u00FF\s]+$/.test(value)) {
        error =
          'Por favor, use solo letras (incluidos acentos y ü) y espacios.';
      } else if (value.length < 3) {
        error = 'El dato debe tener al menos 3 caracteres';
      } else if (value.length > 30) {
        error = 'El dato no puede tener más de 30 caracteres';
      }
    } else if (name === 'telefono') {
      if (!/^\d{10}$/.test(value)) {
        error = 'El teléfono debe tener 10 dígitos.';
      }
    } else if (name === 'contrasena') {
      if (!value) {
        error = 'La contraseña es requerida.';
      } else if (value.length < 8) {
        error = 'La contraseña debe tener al menos 8 caracteres.';
      }
      const missing = [];
      if (!/(?=.*[a-z])/.test(value)) {
        missing.push('una letra minúscula');
      }
      if (!/(?=.*[A-Z])/.test(value)) {
        missing.push('una letra mayúscula');
      }
      if (!/(?=.*\d)/.test(value)) {
        missing.push('un número');
      }
      // eslint-disable-next-line no-useless-escape
      if (!/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(value)) {
        missing.push('un carácter especial');
      }
      if (missing.length > 0) {
        error =
          'La contraseña debe contener al menos ' + missing.join(', ') + '.';
      }
      const passwordScore = zxcvbn(value).score;
      setPasswordStrengthScore(passwordScore);
    } else if (name === 'confirmarContrasena') {
      if (value !== formData.contrasena) {
        error = 'Las contraseñas no coinciden.';
      }
    }
    return error;
  };

  const checkPassword = async (password) => {
    try {
      const sha1Hash = CryptoJS.SHA1(password).toString().toUpperCase();

      const prefix = sha1Hash.slice(0, 5);
      const suffix = sha1Hash.slice(5);

      const { data } = await axios.get(
        `https://api.pwnedpasswords.com/range/${prefix}`
      );

      const compromisedList = data.split('\r\n');

      for (const line of compromisedList) {
        const [returnedSuffix, count] = line.split(':');
        if (returnedSuffix === suffix) {
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error(
        'Error al verificar la contraseña en Have I Been Pwned:',
        error
      );
      return false;
    }
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0 && passwordStrengthScore === 4;
  };

  const handleChange = async (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    if (name === 'contrasena' && value) {
      const compromised = await checkPassword(value);
      setIsCompromised(compromised);
    }

    if (touchedFields[name]) {
      const error = validateField(name, value);
      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: error,
      }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouchedFields((prevTouched) => ({
      ...prevTouched,
      [name]: true,
    }));

    const error = validateField(name, formData[name]);
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: error,
    }));
  };

  useEffect(() => {
    (async () => {
      const isValid = await validateForm();
      setIsFormValid(isValid);
    })();
  }, [formData, passwordStrengthScore]);

  //Registro en la base de datos

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (validateForm()) {
      if (isCompromised) {
        setErrors({
          ...errors,
          contrasena: 'Esta contraseña ha sido comprometida. Elige otra.',
        });
        setIsLoading(false);
        return;
      }

      const usuariosArray = Object.values(usuarios);
      const usuarioCorreo = usuariosArray.some(
        (usuario) => usuario && usuario.Correo === guardarCorreo
      );
      console.log('usuarios correo repetido', usuarioCorreo);

      if (usuarioCorreo) {
        setErrors('Correo ya existe');
        setIsLoading(false);
      } else {
        try {
          const response = await api.post(
            `/api/usuarios/registro`,
            {
              nombre: formData.nombre,
              apellidoP: formData.apellidoPaterno,
              apellidoM: formData.apellidoMaterno,
              correo: guardarCorreo,
              telefono: formData.telefono,
              password: formData.contrasena,
            },

            {
              headers: {
                'X-CSRF-Token': csrfToken,
              },
              withCredentials: true,
            }
          );
          console.log('respuesta del servidor', response);

          if (response.status == 201) {
            Swal.fire({
              title: '¡Registro Correcto!',
              text: 'Gracias por ser parte de la familia alquiladora romero.',
              icon: 'success',
              timer: 2000,
              showConfirmButton: false,
            });
            navigate('/login');
          }
        } catch (error) {
          console.error('Error en el registro:', error);
          setErrors({
            api: 'Hubo un error al registrar el usuario, intente más tarde.',
          });
        } finally {
          setIsLoading(false);
        }
      }
    } else {
      setIsLoading(false);
    }
  };

  const getPasswordStrengthColor = (score) => {
    switch (score) {
      case 0:
        return '#ef4444';
      case 1:
        return '#f97316';
      case 2:
        return '#eab308';
      case 3:
        return '#84cc16';
      case 4:
        return '#22c55e';
      default:
        return '#d1d5db';
    }
  };

  const getPasswordStrengthText = (score) => {
    switch (score) {
      case 0:
        return 'Muy débil';
      case 1:
        return 'Débil';
      case 2:
        return 'Regular';
      case 3:
        return 'Fuerte';
      case 4:
        return 'Muy fuerte';
      default:
        return 'No disponible';
    }
  };

  return (
    <div className="px-4 py-6 max-w-xl mx-auto  dark:text-white">
      <Typography
        variant="h5"
        className="login-title"
        textAlign="center"
        marginBottom="15px"
        sx={{ color: 'dark:text-white' }}
      >
        Paso 4: Completa tu registro
      </Typography>

      <Alert
        severity="info"
        sx={{ marginBottom: '15px', textAlign: 'left', fontSize: '0.875rem' }}
      >
        El número de teléfono proporcionado será utilizado para recuperar o
        cambiar la contraseña. Asegúrate de que sea un número real y accesible.
      </Alert>

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          maxWidth: '600px',
          margin: '0 auto',
        }}
        className=" dark:text-white [&_input]:dark:text-white"
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
            width: '100%',
          }}
          className=" dark:text-white [&_input]:dark:text-white"
        >
          <TextField
            label="Nombre *"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            onBlur={handleBlur}
            required
            fullWidth
            error={!!errors.nombre && touchedFields.nombre}
            helperText={touchedFields.nombre && errors.nombre}
            className=" dark:text-white [&_input]:dark:text-white   [&_label]:dark:text-[#fcb900]"
          />
          <TextField
            label="Apellido Paterno *"
            name="apellidoPaterno"
            value={formData.apellidoPaterno}
            onChange={handleChange}
            onBlur={handleBlur}
            required
            fullWidth
            error={!!errors.apellidoPaterno && touchedFields.apellidoPaterno}
            helperText={touchedFields.apellidoPaterno && errors.apellidoPaterno}
            className="[&_input]:dark:text-white  [&_label]:dark:text-[#fcb900]"
          />
          <TextField
            label="Apellido Materno"
            name="apellidoMaterno"
            value={formData.apellidoMaterno}
            onChange={handleChange}
            onBlur={handleBlur}
            fullWidth
            error={!!errors.apellidoMaterno && touchedFields.apellidoMaterno}
            helperText={touchedFields.apellidoMaterno && errors.apellidoMaterno}
            className=" dark:text-white [&_input]:dark:text-white  [&_label]:dark:text-[#fcb900]"
          />
          <TextField
            label="Teléfono *"
            name="telefono"
            value={formData.telefono}
            onChange={(e) => {
              const onlyNums = e.target.value.replace(/[^0-9]/g, '');
              setFormData({
                ...formData,
                telefono: onlyNums.slice(0, 10),
              });
            }}
            onBlur={handleBlur}
            required
            fullWidth
            type="tel"
            inputProps={{
              maxLength: 10,
              pattern: '[0-9]{10}',
              title: 'Ingresa un número de teléfono válido de 10 dígitos',
            }}
            error={!!errors.telefono && touchedFields.telefono}
            helperText={touchedFields.telefono && errors.telefono}
            className=" dark:text-white [&_input]:dark:text-white [&_label]:dark:text-[#fcb900]"
          />
          <TextField
            label="Contraseña *"
            name="contrasena"
            type={showPassword ? 'text' : 'password'}
            value={formData.contrasena}
            onChange={handleChange}
            onBlur={handleBlur}
            required
            fullWidth
            error={!!errors.contrasena && touchedFields.contrasena}
            helperText={touchedFields.contrasena && errors.contrasena}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    className="dark:text-white [&_input]:dark:text-white [&_label]:dark:text-[#fcb900]"
                  >
                    <FontAwesomeIcon icon={showPassword ? faEye : faEyeSlash} />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            className=" dark:text-white [&_input]:dark:text-white [&_label]:dark:text-[#fcb900]"
          />
          <TextField
            label="Confirmar Contraseña *"
            name="confirmarContrasena"
            type={showConfirmPassword ? 'text' : 'password'}
            value={formData.confirmarContrasena}
            onChange={handleChange}
            onBlur={handleBlur}
            required
            className=" dark:text-white [&_input]:dark:text-white [&_label]:dark:text-[#fcb900]"
            fullWidth
            error={
              !!errors.confirmarContrasena && touchedFields.confirmarContrasena
            }
            helperText={
              touchedFields.confirmarContrasena && errors.confirmarContrasena
            }
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    edge="end"
                    className=" dark:text-white [&_input]:dark:text-white"
                  >
                    <FontAwesomeIcon
                      icon={showConfirmPassword ? faEye : faEyeSlash}
                    />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {/* Mostrar si la contraseña está comprometida */}
        {isCompromised && (
          <Typography
            sx={{
              color: 'red',
              fontSize: '0.8rem',
              fontStyle: 'italic',
            }}
          >
            Error: Contraseña comprometida
          </Typography>
        )}

        {/* Medidor de seguridad de la contraseña */}
        {formData.contrasena && (
          <Box sx={{ marginBottom: '1px', textAlign: 'center' }}>
            {passwordStrengthScore < 4 && (
              <Typography
                sx={{
                  color: 'red',
                  fontSize: '0.8rem',
                  fontStyle: 'italic',
                  marginBottom: '8px',
                }}
              >
                La contraseña debe ser "Muy fuerte" para poder registrarte.
              </Typography>
            )}
            <Typography
              sx={{
                fontWeight: 'bold',
                fontSize: '0.9rem',
                marginBottom: '8px',
                color: 'inherit',
              }}
            >
              Seguridad de la contraseña:
              <span
                style={{
                  color: getPasswordStrengthColor(passwordStrengthScore),
                  marginLeft: '6px',
                }}
              >
                {getPasswordStrengthText(passwordStrengthScore)}
              </span>
            </Typography>
            <Box
              sx={{
                position: 'relative',
                height: '8px',
                borderRadius: '8px',
                backgroundColor: '#f0f0f0',
                overflow: 'hidden',
              }}
            >
              <Box
                ref={passwordStrengthBarRef}
                sx={{
                  position: 'absolute',
                  height: '100%',
                  width: `${(passwordStrengthScore / 4) * 100}%`,
                  transition: 'width 0.4s ease',
                  backgroundImage: `linear-gradient(to right, ${getPasswordStrengthColor(
                    passwordStrengthScore
                  )}, ${getPasswordStrengthColor(passwordStrengthScore)})`,
                  borderRadius: '8px',
                }}
              />
            </Box>
          </Box>
        )}

        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          disabled={!isFormValid || isCompromised || isLoading}
          className="dark:text-white [&_input]:dark:text-white [&_label]:dark:text-[#fcb900]"
        >
          {isLoading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            'Completar Registro'
          )}
        </Button>
      </Box>
    </div>
  );
};

export default Paso3;
