import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { useLocation, useNavigate } from "react-router-dom";
import zxcvbn from "zxcvbn";
import CryptoJS from "crypto-js";
import api from "../../../../utils/AxiosConfig";
import { useAuth } from "../../../../hooks/ContextAuth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash, faTimes } from "@fortawesome/free-solid-svg-icons";


const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])(?!.*\s).{8,}$/;

export default function ChangePassword() {
  const navigate = useNavigate();
  const location = useLocation();

  const { idUsuario } = location.state || {};
  const { csrfToken, user } = useAuth();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [passwordStrengthScore, setPasswordStrengthScore] = useState(0);
  const [isVerified, setIsVerified] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isCompromised, setIsCompromised] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  // Validación de la contraseña actual al pulsar el botón
  const handlePasswordVerification = async () => {
    if (!currentPassword) return;
    setIsVerifying(true);
    try {
      const response = await api.post(
        "/api/usuarios/verify-password",
        { currentPassword, idUsuario },
        {
          headers: { "X-CSRF-Token": csrfToken },
          withCredentials: true,
        }
      );
      if (response.data.valid) {
        setIsVerified(true);
        setError("");
        Swal.fire({
          icon: "success",
          title: "Contraseña actual verificada",
          timer: 1200,
          showConfirmButton: false,
        });
      } else {
        setIsVerified(false);
        setError("La contraseña actual es incorrecta.");
      }
    } catch (err) {
      setIsVerified(false);
      setError("La contraseña actual es incorrecta");
    }
    setIsVerifying(false);
  };

  const checkPasswordCompromised = async (password) => {
    try {
      const hash = CryptoJS.SHA1(password).toString();
      const prefix = hash.slice(0, 5);
      const suffix = hash.slice(5);
      const response = await api.get(
        `https://api.pwnedpasswords.com/range/${prefix}`
      );
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
    let validationError = "";
    let isValid = true;

    if (!newPassword) {
      validationError = "";
      isValid = false;
    } else if (!passwordRegex.test(newPassword)) {
      validationError =
        "La contraseña debe tener mínimo 8 caracteres, incluir mayúsculas, minúsculas, dígitos y símbolos.";
      isValid = false;
    } else {

      if (passwordStrengthScore < 4) {
        validationError = "La contraseña debe ser muy fuerte.";
        isValid = false;
      }
    }

    if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      validationError = "Las contraseñas no coinciden.";
      isValid = false;
    }

    setError(validationError);
    setIsButtonDisabled(!isValid);
  }, [newPassword, confirmPassword, passwordStrengthScore]);

  useEffect(() => {
    if (!newPassword) {
      setIsCompromised(null);
      return;
    }
    const checkCompromised = async () => {
      await checkPasswordCompromised(newPassword);
    };
    checkCompromised();
  }, [newPassword]);

  
  const handleNewPasswordChange = (e) => {
    const value = e.target.value;
    setNewPassword(value);

    if (value) {
      const { score } = zxcvbn(value);
      setPasswordStrengthScore(score);
    } else {
      setPasswordStrengthScore(0);
    }

  
    let validationError = "";
    let isValid = true;
    if (!value) {
      isValid = false;
    } else if (!passwordRegex.test(value)) {
      validationError =
        "La contraseña debe tener mínimo 8 caracteres, incluir mayúsculas, minúsculas, dígitos y símbolos.";
      isValid = false;
    } else if (zxcvbn(value).score < 4) {
      validationError = "La contraseña debe ser muy fuerte.";
      isValid = false;
    }

    if (value && confirmPassword && value !== confirmPassword) {
      validationError = "Las contraseñas no coinciden.";
      isValid = false;
    }
    setError(validationError);
    setIsButtonDisabled(!isValid);
  };

  const handlePasswordChange = async () => {
    if (!isVerified) {
      setError("Debes verificar primero la contraseña actual.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post(
        "/api/usuarios/change-password",
        { idUsuario, newPassword },
        {
          headers: { "X-CSRF-Token": csrfToken },
          withCredentials: true,
        }
      );

      if (response.data.success) {
        Swal.fire({
          icon: "success",
          title: "¡Contraseña actualizada!",
          text: "Tu contraseña ha sido cambiada correctamente. Se cerrarán tus sesiones.",
          timer: 2000,
          showConfirmButton: false,
        });
        setIsLoading(false);


        if (user) {
          switch (user.rol) {
            case "cliente":
              navigate("/cliente/perfil");
              break;
            case "administrador":
              navigate("/administrador/perfil");
              break;
            case "repartidor":
              navigate("/repartidor/perfil");
              break;
            default:
              navigate("/login");
              break;
          }
        } else {
          navigate("/login");
        }
      } else if (response.data.usedBefore) {
        setError("Ya has utilizado esta contraseña anteriormente.");
        setIsLoading(false);
      } else {
        setError("Error al cambiar la contraseña.");
        setIsLoading(false);
      }
    } catch (err) {
      setError("Error al cambiar la contraseña.");
      setIsLoading(false);
    }
  };

  const getStrengthColor = (score) => {
    switch (score) {
      case 0:
        return "bg-red-500 text-red-500";
      case 1:
        return "bg-orange-500 text-orange-500";
      case 2:
        return "bg-yellow-400 text-yellow-400";
      case 3:
        return "bg-green-400 text-green-400";
      case 4:
        return "bg-green-600 text-green-600";
      default:
        return "bg-gray-300 text-gray-300";
    }
  };

  const strengthTexts = [
    "Muy débil",
    "Débil",
    "Aceptable",
    "Fuerte",
    "Muy fuerte",
  ];

  return (
    <div
      className="
        max-w-md 
        w-full 
        mx-auto 
        mt-10 
        p-6 
        rounded-md 
        shadow-md 
        min-h-[300px]
        bg-white 
        dark:bg-gray-800 
        text-gray-900 
        dark:text-gray-100
        transition-all 
        duration-300
      "
    >
      {/* Encabezado */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Cambiar Contraseña</h2>
        <button
          onClick={() => navigate("/cliente/perfil")}
          className="
            text-gray-500 
            dark:text-gray-300
            hover:text-gray-700 
            dark:hover:text-gray-100
            transition-colors 
            duration-200
          "
        >
          <FontAwesomeIcon icon={faTimes} />
        </button>
      </div>


      {error && <p className="text-red-600 mb-2">{error}</p>}

      {!isVerified ? (
        <>
          <p className="mb-2">Ingresa tu contraseña actual para continuar.</p>

          <div className="relative mb-4">
            <label className="block text-sm font-medium mb-1">
              Contraseña Actual
            </label>
            <input
              type={showCurrentPassword ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="
                w-full 
                border 
                border-gray-300 
                dark:border-gray-700
                rounded 
                px-3 
                py-2 
                focus:outline-none 
                focus:ring-2 
                focus:ring-blue-500 
                dark:bg-gray-700 
                dark:focus:ring-blue-400
                transition
              "
            />
            <button
              type="button"
              onClick={() =>
                setShowCurrentPassword(!showCurrentPassword)
              }
              className="
                absolute 
                right-3 
                top-9 
                text-gray-500 
                dark:text-gray-300
                hover:text-gray-700
                dark:hover:text-gray-100
                transition-colors
              "
            >
              <FontAwesomeIcon
                icon={showCurrentPassword ? faEye : faEyeSlash}
              />
            </button>
          </div>

          <button
            onClick={handlePasswordVerification}
            disabled={isVerifying}
            className="
              w-full 
              bg-blue-600 
              dark:bg-blue-700
              text-white 
              font-semibold 
              py-2 
              rounded 
              hover:bg-blue-700 
              dark:hover:bg-blue-600
              transition-colors
              mb-2
              flex 
              justify-center 
              items-center
              disabled:opacity-50
              disabled:cursor-not-allowed
            "
          >
            {isVerifying ? (
              <svg
                className="animate-spin h-5 w-5 text-white"
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
                  d="M4 12a8 8 0 018-8v8H4z"
                ></path>
              </svg>
            ) : (
              "Verificar Contraseña Actual"
            )}
          </button>
        </>
      ) : (
        <>
          <p className="mb-2">Ahora puedes ingresar tu nueva contraseña.</p>

          <div className="relative mb-4">
            <label className="block text-sm font-medium mb-1">
              Nueva Contraseña
            </label>
            <input
              type={showNewPassword ? "text" : "password"}
              value={newPassword}
              onChange={handleNewPasswordChange}
              className="
                w-full 
                border 
                border-gray-300 
                dark:border-gray-700
                rounded 
                px-3 
                py-2 
                focus:outline-none 
                focus:ring-2 
                focus:ring-blue-500 
                dark:bg-gray-700 
                dark:focus:ring-blue-400
                transition
              "
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="
                absolute 
                right-3 
                top-9 
                text-gray-500 
                dark:text-gray-300
                hover:text-gray-700
                dark:hover:text-gray-100
                transition-colors
              "
            >
              <FontAwesomeIcon icon={showNewPassword ? faEye : faEyeSlash} />
            </button>
          </div>

          <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-2">
            <div
              className={`
                h-full 
                transition-all 
                duration-300
                ${getStrengthColor(passwordStrengthScore).split(" ")[0]}
              `}
              style={{
                width: `${(passwordStrengthScore / 4) * 100}%`,
              }}
            ></div>
          </div>

          <p
            className={`
              text-sm mb-2 
              ${getStrengthColor(passwordStrengthScore).split(" ")[1]}
            `}
          >
            Fortaleza de contraseña:{" "}
            {strengthTexts[passwordStrengthScore] || "—"}
          </p>


          {isCompromised && (
            <p className="text-red-500 text-sm mt-1">
              Esta contraseña ha sido comprometida. Elige otra.
            </p>
          )}

          <div className="relative mb-4">
            <label className="block text-sm font-medium mb-1">
              Confirmar Nueva Contraseña
            </label>
            <input
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="
                w-full 
                border 
                border-gray-300 
                dark:border-gray-700
                rounded 
                px-3 
                py-2 
                focus:outline-none 
                focus:ring-2 
                focus:ring-blue-500 
                dark:bg-gray-700 
                dark:focus:ring-blue-400
                transition
              "
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="
                absolute 
                right-3 
                top-9 
                text-gray-500 
                dark:text-gray-300
                hover:text-gray-700
                dark:hover:text-gray-100
                transition-colors
              "
            >
              <FontAwesomeIcon
                icon={showConfirmPassword ? faEye : faEyeSlash}
              />
            </button>
          </div>

          <button
            onClick={handlePasswordChange}
            disabled={
              isButtonDisabled ||
              isLoading ||
              !isVerified ||
              isCompromised === true
            }
            className={`
              w-full 
              bg-blue-600 
              dark:bg-blue-700
              text-white 
              font-semibold 
              py-2 
              rounded 
              mt-2
              hover:bg-blue-700 
              dark:hover:bg-blue-600
              transition-colors
              disabled:opacity-50
              disabled:cursor-not-allowed
              flex
              justify-center
            `}
          >
            {isLoading ? (
              <svg
                className="animate-spin h-5 w-5 text-white"
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
                  d="M4 12a8 8 0 018-8v8H4z"
                ></path>
              </svg>
            ) : (
              "Cambiar Contraseña"
            )}
          </button>
        </>
      )}
    </div>
  );
}
