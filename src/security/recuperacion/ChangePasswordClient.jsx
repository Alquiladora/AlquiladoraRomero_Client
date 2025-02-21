import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  IconButton,
  LinearProgress,
  InputAdornment,
  CircularProgress,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import Swal from "sweetalert2";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import zxcvbn from "zxcvbn";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import CryptoJS from "crypto-js";
import { useAuth } from "../../hooks/ContextAuth";
import api from "../../utils/AxiosConfig";

const ChangePasswordClient = ({ idUsuario }) => {
  const navigate = useNavigate();
  
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [passwordStrengthScore, setPasswordStrengthScore] = useState(0);
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const { csrfToken } = useAuth();
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isCompromised, setIsCompromised] = useState(null);
  const [isLoading, setIsLoading] = useState(false);


  const checkPasswordCompromised = async (password) => {
    try {
      const hash = CryptoJS.SHA1(password).toString();
      const prefix = hash.slice(0, 5);
      const suffix = hash.slice(5);
      const response = await axios.get(`https://api.pwnedpasswords.com/range/${prefix}`);
      const hashes = response.data.split("\n");
      const isFound = hashes.some((line) => {
        const [returnedHash] = line.split(":");
        return returnedHash.toLowerCase() === suffix;
      });

      setIsCompromised(isFound);
      return isFound;
    } catch (error) {
      console.error("Error verificando la contraseña comprometida:", error);
      setIsCompromised(false);
      return false;
    }
  };

  
  useEffect(() => {
    const validatePasswords = async () => {
      let isValid = true;
      let validationError = "";

      if (!newPassword || newPassword.length < 8) {
        validationError = "La contraseña debe tener al menos 8 caracteres.";
        isValid = false;
      } else {
        const passwordScore = zxcvbn(newPassword).score;
        setPasswordStrengthScore(passwordScore);

        if (await checkPasswordCompromised(newPassword)) {
          validationError = "Esta contraseña ha sido comprometida. Elige otra.";
          isValid = false;
        } else if (passwordScore < 3) {
          validationError = "La contraseña debe ser más fuerte.";
          isValid = false;
        } else {
          validationError = "";
        }
      }

      if (newPassword !== confirmPassword) {
        validationError = "Las contraseñas no coinciden.";
        isValid = false;
      }

      setError(validationError);
      setIsButtonDisabled(!isValid);
    };

    validatePasswords();
  }, [newPassword, confirmPassword]); 

  // Función para obtener el color según la fortaleza de la contraseña
  const getStrengthColor = (score) => {
    switch (score) {
      case 0:
        return "red";
      case 1:
        return "orange";
      case 2:
        return "yellow";
      case 3:
        return "lightgreen";
      case 4:
        return "green";
      default:
        return "gray";
    }
  };

  // Cambiar la contraseña
  const handlePasswordChange = async () => {
    setIsLoading(true);
    try {
      const response = await api.post(
        "/api/usuarios/change-password",
        { idUsuario, newPassword },
        {
          headers: {
            "X-CSRF-Token": csrfToken,
          },
          withCredentials: true,
        }
      );

      if (response.data.success) {
        Swal.fire({
          icon: "success",
          title: "¡Contraseña actualizada!",
          text: "Tu contraseña ha sido cambiada correctamente.",
          timer: 2000,
          showConfirmButton: false,
        });
        setIsLoading(false);
        navigate("/login");
      } else {
        setError("Error al cambiar la contraseña.");
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
          setError("No tienes permiso para cambiar la contraseña de este usuario.");
        } else if (err.response.status === 500) {
          setError("Error interno del servidor. Por favor, inténtalo más tarde.");
        } else {
          setError(err.response.data.message || "Error al cambiar la contraseña.");
        }
      } else if (err.request) {
        setError("No se recibió respuesta del servidor. Verifica tu conexión.");
      } else {
        setError("Error al realizar la solicitud. Por favor, inténtalo de nuevo.");
      }
    }
  };

  
  return (
    <Box
      sx={{
        maxWidth: "500px",
        margin: "80px auto",
        padding: "2rem",
        bgcolor: "background.paper",
        boxShadow: 2,
        borderRadius: 2,
        minHeight: "300px",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h6">Cambiar Contraseña</Typography>
        <IconButton onClick={() => navigate("/cliente/perfil")}>
          <CloseIcon />
        </IconButton>
      </Box>

      {error && (
        <Typography sx={{ color: "red", mb: 2 }}>{error}</Typography>
      )}

      <Typography sx={{ mb: 2 }}>Ahora puedes ingresar tu nueva contraseña.</Typography>

      <TextField
        label="Nueva Contraseña"
        type={showNewPassword ? "text" : "password"}
        name="newPassword"
        fullWidth
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        margin="normal"
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={() => setShowNewPassword(!showNewPassword)}>
                <FontAwesomeIcon icon={showNewPassword ? faEye : faEyeSlash} />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      <LinearProgress
        variant="determinate"
        value={(passwordStrengthScore / 4) * 100}
        sx={{
          mb: 2,
          bgcolor: "lightgray",
          "& .MuiLinearProgress-bar": {
            backgroundColor: getStrengthColor(passwordStrengthScore),
          },
        }}
      />
      <Typography sx={{ color: getStrengthColor(passwordStrengthScore) }}>
        Fortaleza de contraseña: {["Muy débil", "Débil", "Aceptable", "Fuerte", "Muy fuerte"][passwordStrengthScore]}
      </Typography>

      {isCompromised && (
        <Typography sx={{ color: "red", fontSize: "0.875rem", mt: 1 }}>
          Esta contraseña ha sido comprometida. Elige otra.
        </Typography>
      )}

      <TextField
        label="Confirmar Nueva Contraseña"
        type={showConfirmPassword ? "text" : "password"}
        name="confirmPassword"
        fullWidth
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        margin="normal"
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                <FontAwesomeIcon icon={showConfirmPassword ? faEye : faEyeSlash} />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      <Button
        variant="contained"
        color="primary"
        fullWidth
        onClick={handlePasswordChange}
        disabled={isButtonDisabled || isLoading}
        sx={{ mt: 2 }}
      >
        {isLoading ? <CircularProgress size={24} /> : "Cambiar Contraseña"}
      </Button>
    </Box>
  );
};

export default ChangePasswordClient;
