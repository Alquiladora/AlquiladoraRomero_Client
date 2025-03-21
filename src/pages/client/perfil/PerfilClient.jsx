import React, { useState, useEffect, useRef, useContext } from "react";
import {
  Tabs,
  Tab,
  Box,
  TextField,
  Grid,
  Typography,
  CircularProgress,
} from "@mui/material";
import ComputerIcon from "@mui/icons-material/Computer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { toast } from "react-toastify";
import AddressBook from "./componetsPerfil/ListaDirecciones";

import "primereact/resources/themes/saga-blue/theme.css";
import "primereact/resources/primereact.min.css";
import {
  validateName,
  validatePhone,
  validateFechaNacimiento,
} from "./componetsPerfil/validaciones";
import EditableInput from "./componetsPerfil/EditableInput";
import CambiarContrasenaModal from "./componetsPerfil/CambiarPass";
import MFAComponent from "./componetsPerfil/Mfa";
import "primereact/resources/themes/saga-blue/theme.css";
import "primereact/resources/primereact.min.css"
import {
  Camera,
  User,
  FileText,
  Clock,
  Calendar,
  CreditCard,
  Key,
  Shield,
  MapPin,
  Phone,
  Mail,
  Edit2,
  Lock,
  ShieldCheck,
  LogOut,
  Edit3,
  ChartNoAxesColumnDecreasing,
} from "lucide-react";

import {
  faWindows,
  faAndroid,
  faLinux,
  faApple,
} from "@fortawesome/free-brands-svg-icons";
import { motion, useAnimation } from "framer-motion";
import PhoneIphoneIcon from "@mui/icons-material/PhoneIphone";
import TabletMacIcon from "@mui/icons-material/TabletMac";
import { useAuth } from "../../../hooks/ContextAuth";
import api from "../../../utils/AxiosConfig";


const PerfilUsuarioPrime = () => {
 
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [isMfaEnabled, setIsMfaEnabled] = useState(false);
  const [profileData, setProfileData] = useState([]);
  const [usuariosC, setUsuariosC] = useState([]);
  const [alert, setAlert] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const { csrfToken, user } = useAuth();
  const [openMfaModal, setOpenMfaModal] = useState(false);
  const [activo, setActivo] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const BASE_URL = "http://localhost:3001";
  const [activeTab, setActiveTab] = useState("personal");
  const isMounted = useRef(true);
  const controls = useAnimation();
  const [cambiosContrasena, setCambiosContrasena] = useState(0);
  const [bloqueado, setBloqueado] = useState(false);

  useEffect(() => {
    isMounted.current = true;
    if (user) {
      fetchProfileData();
      verificarCambiosContrasena(user.idUsuarios);
    }
    return () => {
      isMounted.current = false;
    };
  }, [controls]);

  
  const fetchProfileData = async () => {
    if (!isMounted.current) return;

    try {
      setLoading(true);
      const response = await api.get(`api/usuarios/perfil`, {
        withCredentials: true,
        headers: { "X-CSRF-Token": csrfToken },
      });

      if (isMounted.current) {
        setUsuariosC(response.data.user);
        console.log("datos de perfil cliente", response.data.user.idUsuarios)

        setActivo(!!response.data.user.multifaltor);
        setLastUpdated(new Date(response.data.user.fechaActualizacionF));
        setLoading(false);
        controls.start({ opacity: 1, y: 0 });
        console.log("✅ Datos de usuario obtenidos:", response.data.user);
      }
    } catch (error) {
      if (isMounted.current) {
        setLoading(false);
      }
      console.error("❌ Error al obtener los datos del perfil:", error);
    }
  };

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



  const handleOpenModal = () => {
    if (!bloqueado) {
      setOpenModal(true);
    }
  };


  const handleCloseModal = () => {
    setOpenModal(false);
    fetchProfileData();
  };

  //=======================================================================================
  //Function para actualizar el foto de perfil
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const now = new Date();
    if (file) {
      const lastUpdatedTime = lastUpdated?.getTime();
      const twoMonths = 60 * 60 * 24 * 1000 * 30 * 2;
      if (lastUpdated && now - lastUpdatedTime < twoMonths) {
        console.log("Solo puedes cambiar tu foto de perfil cada dos meses.");
       toast.error(
        "Solo puedes cambiar tu foto de perfil cada dos meses."
        );
        return;
      }
      if (
        ![
          "image/png",
          "image/jpeg",
          "image/jpg",
          "image/gif",
          "image/webp",
          "image/svg+xml",
        ].includes(file.type)
      ) {
        console.log("Error Formato de imagen inválido");
        toast.error(
          "Solo se aceptan imágenes en formatos PNG, JPG, JPEG, GIF, WEBP, o SVG."
        );
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        console.log("El tamaño de la imagen debe ser menor a 10 MB.");
        toast.error(
       
          "El tamaño de la imagen debe ser menor a 2MB."
        );
        return;
      }
      console.log("Imagen enviado  handleImagenChange", file);
      handleImageChange(file);
    }
  };

  const handleImageChange = async (file) => {
    const now = new Date();

    const formData = new FormData();
    formData.append("imagen", file);

    setUploading(true);
    setIsBlocked(true);
    console.log("Subiendo imagen");
   toast.warning(
     
      "Espera mientras se sube la imagen..."
    );

    try {
      const response = await api.post(`/api/imagenes/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          "X-CSRF-Token": csrfToken,
        },
        withCredentials: true,
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        },
      });

      const imageUrl = response.data.url;
    

      
      await api.patch(
        `/api/usuarios/perfil/${usuariosC.idUsuarios}/foto`,
        {
          fotoPerfil: imageUrl,
          fechaActualizacionF: now.toISOString(),
        },
        { headers: { "X-CSRF-Token": csrfToken }, withCredentials: true }
      );

     
      setUsuariosC((prevProfile) => ({
        ...prevProfile,
        fotoPerfil: imageUrl,
      }));

      setLastUpdated(now);
      fetchProfileData();
      console.log("Imagen subido correctamente");
      toast.success(
    
        "Foto de perfil actualizada correctamente."
      );
    } catch (error) {
      console.error("Error al actualizar la foto de perfil:", error);
      toast.error("Error al actualizar la foto de perfil.");
    } finally {
      setUploading(false);
      setIsBlocked(false);
      setUploadProgress(0);
    }
  };

  //===================GUARDAR EN LA BASE DE DATOS=======================================================================
  const saveField = async (field, value) => {
    try {
     
      const response = await api.patch(
        `/api/usuarios/perfil/${usuariosC.idUsuarios}/${field}`,
        { value },
        {
          headers: { "X-CSRF-Token": csrfToken },
          withCredentials: true,
        }
      );
      fetchProfileData();

      toast.success(
        `El ${field} ha sido guardado correctamente.`
      );
    } catch (error) {
      toast.error(
        `Hubo un error al guardar el ${field}.`
      );
      console.error(`Error al guardar el ${field}:`, error);
    }
  };

  //==========================================================================================
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleOpenMfaModal = () => {
    setOpenMfaModal(true);
  };

  // Función para cerrar el modal
  const handleCloseMfaModal = () => {
    setOpenMfaModal(false);
  };

  //===================SESIONES=======================================================================
  const fetchSessions = async () => {
    try {
      const response = await api.post(
        `/api/usuarios/sesiones`,
        { userId: usuariosC.idUsuarios },
        {
          headers: { "X-CSRF-Token": csrfToken },
          withCredentials: true,
          timeout: 10000,
        }
      );
      setSessions(response.data);
      
    } catch (error) {
      console.error("Error al obtener las sesiones activas:", error);
    }
  };

  const closeAllSessions = async () => {
    try {
      const response = await api.post(
        `/api/usuarios/Delete/login/all-except-current`,
        {},
        {
          headers: { "X-CSRF-Token": csrfToken },
          withCredentials: true,
          timeout: 10000,
        }
      );
      setSessions((prevSessions) =>
        prevSessions.filter((session) => session.isCurrent)
      );

     toast.success({
        severity: "success",
        summary: "Sesiones cerradas",
        detail:
          response.data.message ||
          "Todas las sesiones excepto la actual han sido cerradas.",
        life: 3000,
      });
    } catch (error) {
      console.error("Error al cerrar todas las sesiones:", error);
      toast.error({
        severity: "error",
        summary: "Error",
        detail:
          error.response?.data?.message ||
          "Hubo un problema al cerrar las sesiones.",
        life: 3000,
      });
    }
  };

  useEffect(() => {
    let intervalId;

    if (usuariosC.idUsuarios) {
      fetchSessions();
      intervalId = setInterval(() => {
        fetchSessions();
      }, 8000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [usuariosC]);

  const getDeviceIcon = (deviceType) => {
    if (deviceType === "Windows") return <FontAwesomeIcon icon={faWindows} />;
    if (deviceType === "Android") return <FontAwesomeIcon icon={faAndroid} />;
    if (deviceType === "Linux") return <FontAwesomeIcon icon={faLinux} />;
    if (deviceType === "Mac") return <FontAwesomeIcon icon={faApple} />;
    if (deviceType === "iOS") return <PhoneIphoneIcon />;
    if (deviceType === "iPad") return <TabletMacIcon />;
    return <ComputerIcon />;
  };
  const formatDateForDisplay = (dateString, format = "dd-MM-yyyy") => {
    if (!dateString) return "";

    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      console.error("Fecha inválida:", dateString);
      return "";
    }

    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();

    if (format === "yyyy-MM-dd") {
      return `${year}-${month}-${day}`;
    }

    return `${day}-${month}-${year}`;
  };

 
  const fields = [
    {
      label: "Nombre",
      value: usuariosC?.nombre || "",
      icon: User,
      validate: (value) => validateName(value, "nombre"),
      field: "nombre",
      editable: true,
    },
    {
      label: "Apellido Paterno",
      value: usuariosC?.apellidoP || "",
      icon: User,
      validate: (value) => validateName(value, "apellido paterno"),
      field: "apellidoP",
      editable: true,
    },
    {
      label: "Apellido Materno",
      value: usuariosC?.apellidoM || "",
      icon: User,
      validate: (value) => validateName(value, "apellido materno"),
      field: "apellidoM",
      editable: true,
    },
    {
      label: "Teléfono",
      value: usuariosC?.telefono || "",
      icon: Phone,
      validate: validatePhone,
      field: "telefono",
      editable: true,
    },
    {
      label: "Correo",
      value: usuariosC?.correo || "",
      icon: Mail,
      field: "correo",
      editable: false,
    },
    {
      label: "Fecha de Nacimiento",
      value: formatDateForDisplay(usuariosC.fechaNacimiento, "yyyy-MM-dd"),
      icon: Calendar,
      validate: validateFechaNacimiento,
      field: "fechaNacimiento",
      editable: true,
    },
  ];

  function formatDate(dateString) {
    const dateObj = new Date(dateString);
    const day = String(dateObj.getDate()).padStart(2, "0");
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const year = String(dateObj.getFullYear()).slice(-2);
    return `${day}/${month}/${year}`;
  }
  //==========================================================================================

  if (loading) {
    return (
      <Grid
        container
        justifyContent="center dark:bg-gray-950 dark:text-white"
        sx={{ mt: 4, mb: 4 }}
      >
        <CircularProgress size={50} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Cargando datos del perfil...
        </Typography>
      </Grid>
    );
  }

  if (!usuariosC) {
    return (
      <Grid container justifyContent="center" sx={{ mt: 4, mb: 4 }}>
        <CircularProgress size={50} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          No hay datos de usuario.
        </Typography>
      </Grid>
    );
  }

  return (
    <div className="dark:bg-gray-950 dark:text-white">
      {loading && (
        <div className="absolute inset-0 flex justify-center items-center bg-black bg-opacity-50">
          <div className="flex flex-col items-center space-y-4">
            <CircularProgress size={60} sx={{ color: "#1976d2" }} />
            <Typography variant="h6" color="white">
              Cargando datos del perfil...
            </Typography>
          </div>
        </div>
      )}

      <div className="min-h-screen from-blue-50 to-white p-4 dark:bg-gray-950 dark:text-white">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden dark:bg-gray-800">
          
            <div className="h-32 bg-[#fcb900] relative dark:bg-gray-900">
              <div className="absolute top-4 right-4 bg-white/90 rounded-lg px-4 py-2 shadow-sm dark:bg-gray-700 dark:text-white">
                <span className="text-blue-600 font-medium dark:text-blue-300">
                  Cliente desde:{" "}
                  {new Date(usuariosC.fechaCreacion).toLocaleString("es-ES", {
                    day: "2-digit",
                    month: "long",
                  })}
                </span>
              </div>
            </div>

            <div className="px-4 sm:px-6 pb-6">
           
              <div className="flex flex-col items-center -mt-16 space-y-6">
              

                <div className="relative">
                  <div className="w-28 h-28 md:w-32 md:h-32 rounded-full border-4 border-white bg-white overflow-hidden shadow-lg dark:border-gray-700 dark:bg-gray-700">
                    <img
                      src={
                        usuariosC.fotoPerfil ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          usuariosC.nombre ? usuariosC.nombre.charAt(0) : "U"
                        )}&background=0D6EFD&color=fff`
                      }
                      alt="Foto de Perfil"
                      className="w-full h-full object-cover"
                    />

                    <button
                      className="absolute bottom-1 right-1 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-all dark:bg-gray-600 dark:hover:bg-gray-500"
                      onClick={() => fileInputRef.current.click()}
                    >
                      <Camera className="w-4 h-4 text-gray-600 dark:text-gray-200" />
                    </button>
                  </div>

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                    accept="image/*"
                  />
                </div>

              
                <div className="text-center">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white">
                    {`${usuariosC.nombre} ${usuariosC.apellidoP}`}
                  </h2>
                </div>

                {/* Resumen de Alquileres */}
                <div className="w-full max-w-md mx-auto">
                  <div className="grid grid-cols-2 gap-2 md:gap-4">
                    <div className="bg-blue-50 p-3 md:p-4 rounded-xl shadow-sm text-center dark:bg-gray-700">
                      <div className="text-xs md:text-sm text-gray-600 dark:text-gray-300">
                        Alquileres Activos
                      </div>
                      <div className="text-xl md:text-2xl font-bold text-blue-600 dark:text-blue-300">
                        2
                      </div>
                    </div>
                    <div className="bg-green-50 p-3 md:p-4 rounded-xl shadow-sm text-center dark:bg-gray-700">
                      <div className="text-xs md:text-sm text-gray-600 dark:text-gray-300">
                        Completados
                      </div>
                      <div className="text-xl md:text-2xl font-bold text-green-600 dark:text-green-300">
                        15
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-2 overflow-x-auto dark:bg-gray-800">
            <div className="flex justify-start md:justify-center space-x-2">
              {[
                { id: "personal", icon: User, label: "Datos Personales" },
                { id: "Seguridad", icon: Shield, label: "Seguridad" },
                { id: "direccion", icon: MapPin, label: "Dirección" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all whitespace-nowrap ${activeTab === tab.id
                      ? "bg-blue-600 text-white dark:bg-blue-700 dark:text-white"
                      : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                    }`}
                >
                  <tab.icon className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="text-sm md:text-base">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 dark:bg-gray-800">
            {activeTab === "personal" && (
              <>
                <div className=" dark:bg-gray-800 rounded-2xl  p-6">
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">
                    Información Personal
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {fields.map((field, index) => (
                      <div
                        key={index}
                        className="group flex items-center dark:bg-gray-700 rounded-lg p-4 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                      >
                        <div className="p-3 bg-blue-200 dark:bg-blue-300 rounded-lg">
                          <field.icon className="w-6 h-6 text-blue-700 dark:text-blue-800" />
                        </div>

                        <div className="flex-1 ml-4 min-w-0">
                          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1 truncate">
                            {field.label}
                          </h3>
                          {field.editable === false ? (
                            <p className="text-gray-800 dark:text-white font-medium truncate">
                              {field.value}
                            </p>
                          ) : (
                            <div className="w-full">
                              <EditableInput
                                label={field.label}
                                value={field.value}
                                validate={field.validate || (() => "")}
                                onSave={(newValue) =>
                                  saveField(field.field, newValue)
                                }
                                showHint={field.label === "Teléfono"}
                                hintMessage="Ingrese su número real para recuperación de cuenta."
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {openMfaModal && (
              <motion.div
                className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl max-w-md w-full relative"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* ❌ Botón de cierre */}
                  <button
                    onClick={handleCloseMfaModal}
                    className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white transition"
                  >
                    ❌
                  </button>

                  {/* 🔹 Título */}
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 text-center">
                    Configuración de Autenticación Multifactor
                  </h3>

                  {/* 🔹 Componente MFA */}
                  <MFAComponent
                    userId={usuariosC.idUsuarios}
                    setActivo={setActivo}
                  />
                </motion.div>
              </motion.div>
            )}

            {activeTab === "Seguridad" && (
              <div className="p-4 sm:p-6 space-y-8 max-w-full overflow-hidden">
                {/* 🔹 Título de la sección */}
                <motion.h2
                  className="text-2xl font-bold text-gray-800 dark:text-white text-center sm:text-left"
                  initial={{ opacity: 0 }}
                  animate={controls}
                  transition={{ duration: 0.5 }}
                >
                  🔐 Seguridad
                </motion.h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <CambiarContrasenaModal
                    open={openModal}
                    onClose={handleCloseModal}
                    usuario={usuariosC}
                  />
                  {/* 🔹 Cambiar Contraseña */}
                  <motion.div
                    className=" dark:bg-gray-800 p-5 sm:p-6 rounded-xl  hover:shadow-lg transition-all"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    {bloqueado && (
                      <div className="bg-red-100 border border-red-300 text-red-800 p-4 rounded-md mb-6 text-center">
                        <strong>🚨 Atención:</strong> Límite de cambios alcanzado. Espera hasta el próximo mes.
                      </div>

                    )}

                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-3 flex items-center space-x-2">
                      <Lock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      <span>Cambiar Contraseña</span>
                    </h3>

                    <div className="relative">
                      <input
                        type="password"
                        value="************"
                        readOnly
                        disabled={bloqueado}
                        className="w-full p-4 pr-12 border border-gray-300 rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600"
                      />
                      <button
                        onClick={handleOpenModal}
                        disabled={bloqueado}
                        className="absolute inset-y-0 right-0 flex items-center justify-center px-4 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 transition-all disabled:opacity-50"
                      >
                        <Edit3 className="w-5 h-5" />
                      </button>
                    </div>
                  </motion.div>

                  <motion.div
                    className="bg-white dark:bg-gray-800 p-5 sm:p-6 rounded-xl  hover:shadow-lg transition-all"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center space-x-2">
                      <ShieldCheck className="w-5 h-5 text-green-600 dark:text-green-400" />
                      <span>Autenticación Multifactor (MFA)</span>
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                      Añade una capa extra de seguridad para proteger tu cuenta.
                    </p>
                    <button
                      onClick={handleOpenMfaModal}
                      className={`px-4 py-2 w-full sm:w-auto rounded-lg transition-all ${activo
                          ? "bg-red-600 hover:bg-red-700"
                          : "bg-blue-600 hover:bg-blue-700"
                        } text-white`}
                    >
                      {activo ? "Desactivar MFA" : "Activar MFA"}
                    </button>
                  </motion.div>
                </div>

                <motion.div
                  className="bg-white dark:bg-gray-800 p-5 sm:p-6 rounded-xl shadow-md hover:shadow-xl transition-all mt-8"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <h3 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6 text-center sm:text-left">
                    🌐 Sesiones Activas
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6 text-center sm:text-left">
                    Consulta tus sesiones activas y cierra las innecesarias.
                  </p>

                  {/* Sesión Actual */}
                  {sessions.some((session) => session.isCurrent) && (
                    <>
                      <motion.div
                        className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center space-x-2 text-center sm:text-left"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6 }}
                      >
                        ✅ <span>Sesión Actual</span>
                      </motion.div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {sessions
                          .filter((session) => session.isCurrent)
                          .map((session, index) => (
                            <motion.div
                              key={`current-${index}`}
                              className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-800 
                 rounded-lg shadow-md hover:shadow-lg transition-all overflow-hidden 
                 border border-blue-300 dark:border-blue-700"
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.3 }}
                            >
                              {/* Icono del dispositivo */}
                              <div className="flex items-center space-x-3">
                                <div className="text-blue-600 dark:text-blue-300 text-3xl">
                                  {getDeviceIcon(session.tipoDispositivo)}
                                </div>
                                <div>
                                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                    {session.tipoDispositivo}
                                  </p>
                                  <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center space-x-2">
                                    <span className="text-blue-500 dark:text-blue-300">
                                      <i className="fas fa-calendar-alt"></i>{" "}
                                      {/* Icono de calendario */}
                                    </span>
                                    <span>
                                      Fecha de inicio:{" "}
                                      {formatDate(session.horaInicio)}
                                    </span>
                                  </p>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                      </div>
                    </>
                  )}

                  {sessions.filter((session) => !session.isCurrent).length >
                    0 && (
                      <>
                        <motion.h4
                          className="text-xl font-semibold text-gray-800 dark:text-white mt-8 mb-4 text-center sm:text-left"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.5 }}
                        >
                          🔄 Otras Sesiones Activas
                        </motion.h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                          {sessions
                            .filter((session) => !session.isCurrent)
                            .map((session, index) => (
                              <motion.div
                                key={`other-${index}`}
                                className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-800 
                 rounded-lg shadow-md hover:shadow-lg transition-all overflow-hidden 
                 border border-gray-300 dark:border-gray-700"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3 }}
                              >
                                <div className="flex items-center space-x-3">
                                  <div className="text-blue-600 dark:text-blue-300 text-3xl">
                                    {getDeviceIcon(session.tipoDispositivo)}
                                  </div>
                                  <div>
                                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                      {session.tipoDispositivo}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center space-x-2">
                                      <span className="text-blue-500 dark:text-blue-300">
                                        <i className="fas fa-calendar-alt"></i>{" "}
                                      </span>
                                      <span>
                                        Fecha de inicio:{" "}
                                        {formatDate(session.horaInicio)}
                                      </span>
                                    </p>
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                        </div>
                      </>
                    )}

                  {/* Botón para cerrar otras sesiones */}
                  {sessions.filter((session) => !session.isCurrent).length >
                    0 && (
                      <motion.button
                        onClick={closeAllSessions}
                        className="mt-6 px-6 py-3 w-full sm:w-auto bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all transform hover:scale-105 flex items-center justify-center space-x-2"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <LogOut className="w-5 h-5" />
                        <span>Cerrar otras sesiones</span>
                      </motion.button>
                    )}
                </motion.div>
              </div>
            )}



            {activeTab === "historial" && (
              <div className="space-y-6">
                <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-4 dark:text-white">
                  Historial de Pedidos
                </h3>
                <div className="space-y-4">
                  {[
                    {
                      producto: "Carpa 6x6m",
                      cantidad: 1,
                      fecha: "15/01/2024",
                      total: "$1,200",
                    },
                    {
                      producto: "Mesas Redondas",
                      cantidad: 8,
                      fecha: "10/01/2024",
                      total: "$960",
                    },
                  ].map((historial, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 rounded-xl p-3 sm:p-4 shadow-sm dark:bg-gray-700"
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-2 sm:gap-4">
                        <div>
                          <h4 className="text-sm md:text-base font-medium text-gray-800 dark:text-white">
                            {historial.producto}
                          </h4>
                          <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">
                            Cantidad: {historial.cantidad}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-xs md:text-sm text-gray-600 dark:text-gray-300">
                            {historial.fecha}
                          </div>
                          <div className="text-sm md:text-base font-medium text-gray-800 dark:text-white">
                            {historial.total}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "direccion" && (
              <div className="space-y-6">

                <AddressBook  idUsuarios={usuariosC.idUsuarios}/>

              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerfilUsuarioPrime;
