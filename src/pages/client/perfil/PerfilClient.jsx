import React, { useState, useEffect, useRef, useContext } from "react";
import {
  Tabs,
  Tab,
  Box,
  TextField,
  Grid,
  Typography,
  Divider,
  IconButton,
  Avatar,
  Paper,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  Switch,
  FormControlLabel,
  Snackbar,
  CircularProgress,
  Alert,
  Modal,
  Button,
  useTheme,
  ListItemIcon,
} from "@mui/material";
import ComputerIcon from "@mui/icons-material/Computer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import PersonIcon from "@mui/icons-material/Person";
import SecurityIcon from "@mui/icons-material/Security";
import axios from "axios";
import SettingsIcon from "@mui/icons-material/Settings";
import { Toast } from "primereact/toast";

import "primereact/resources/themes/saga-blue/theme.css";
import "primereact/resources/primereact.min.css";
import { validateName, validatePhone } from "./componetsPerfil/validaciones";
import EditableInput from "./componetsPerfil/EditableInput";
import CambiarContrasenaModal from "./componetsPerfil/CambiarPass";
import MFAComponent from "./componetsPerfil/Mfa";
import "primereact/resources/themes/saga-blue/theme.css";
import "primereact/resources/primereact.min.css";
import { Camera, User, FileText, Clock, Calendar, CreditCard, Key, MapPin, Phone, Mail, AlertCircle, Edit2 } from 'lucide-react';


import {
  faWindows,
  faAndroid,
  faLinux,
  faApple,
} from "@fortawesome/free-brands-svg-icons";
import PhoneIphoneIcon from "@mui/icons-material/PhoneIphone";
import TabletMacIcon from "@mui/icons-material/TabletMac";
import { useAuth } from "../../../hooks/ContextAuth";

const PerfilUsuarioPrime = () => {
  // const [activeTab, setActiveTab] = useState(0);
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [isMfaEnabled, setIsMfaEnabled] = useState(false); // Estado de MFA
  const [profileData, setProfileData] = useState([]);
  //Constatnte s para actualizar el foto de perfil
  const [usuariosC, setUsuariosC] = useState([]);
  const toast = useRef(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [loading, setLoading] = useState(true);
   const {csrfToken} = useAuth();
  const [openMfaModal, setOpenMfaModal] = useState(false);
  const theme = useTheme();
  const [activo, setActivo] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const BASE_URL = "http://localhost:3001";
  const [activeTab, setActiveTab] = useState('personal');




  const fetchProfileData = async () => {
    try {
      const response = await axios.get(
       `${BASE_URL}/api/usuarios/perfil`,
        {
          withCredentials: true,
        }
      );
      setUsuariosC(response.data.user);

      console.log("Usuarios obtenidos 5", response.data.user)

      setActivo(!!response.data.user.multifaltor);
      console.log("response.data.user.multifaltor", response.data.user.multifaltor)
      setLastUpdated(new Date(response.data.user.fechaActualizacionF));
      setLoading(false);
      console.log("Esto e sloque obtengo de usuarioC", response.data.user);
    } catch (error) {
      setLoading(false);
      console.error("Error al obtener los datos del perfil:", error);
    }
  };
  //LLAMAMOS LA FUNCION
  useEffect(() => {
    fetchProfileData();
  }, []);

  // Función para mostrar alertas con PrimeReact
  const showToast = (severity, summary, detail) => {
    toast.current.show({
      severity: severity,
      summary: summary,
      detail: detail,
      life: 4000,
      sticky: false,
      className:
        severity === "success"
          ? "toast-success"
          : severity === "error"
          ? "toast-error"
          : "toast-info",
    });
  };

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  // Función para cerrar el modal
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
        showToast(
          "error",
          "Acción no permitida",
          "Solo puedes cambiar tu foto de perfil cada dos meses."
        );
        return;
      }
      if (!["image/png", "image/jpeg", "image/jpg", "image/gif", "image/webp", "image/svg+xml"].includes(file.type)) {
        showToast(
          "error",
          "Formato de imagen inválido",
          "Solo se aceptan imágenes en formatos PNG, JPG, JPEG, GIF, WEBP, o SVG."
        );
        return;
      }
      
      if (file.size > 2 * 1024 * 1024) {
        showToast(
          "error",
          "Tamaño Excesivo",
          "El tamaño de la imagen debe ser menor a 2MB."
        );
        return;
      }
      handleImageChange(file);
    }
  };

  const handleImageChange = async (file) => {
    const now = new Date();

    const formData = new FormData();
    formData.append("imagen", file);

    setUploading(true);
    setIsBlocked(true);
    showToast(
      "info",
      "Subiendo Imagen",
      "Espera mientras se sube la imagen..."
    );

    try {
      const response = await axios.post(
        `${BASE_URL}/api/imagenes/upload`,
        formData,
        {
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
        }
      );

      const imageUrl = response.data.url;
      console.log("URL de la imagen subida:", imageUrl);

      // Actualizar el perfil con la nueva URL de la imagen en MySQL
      await axios.patch(
       `${BASE_URL}/api/usuarios/perfil/${usuariosC.idUsuarios}/foto`,
        {
          fotoPerfil: imageUrl,
          fechaActualizacionF: now.toISOString(),
        },
        { headers: { "X-CSRF-Token": csrfToken }, withCredentials: true }
      );

      // Actualizar el estado del frontend con la nueva imagen
      setUsuariosC((prevProfile) => ({
        ...prevProfile,
        fotoPerfil: imageUrl,
      }));

      setLastUpdated(now);
      fetchProfileData();
      showToast(
        "success",
        "Imagen Subida",
        "Foto de perfil actualizada correctamente."
      );
    } catch (error) {
      console.error("Error al actualizar la foto de perfil:", error);
      showToast("error", "Error", "Error al actualizar la foto de perfil.");
    } finally {
      setUploading(false);
      setIsBlocked(false);
      setUploadProgress(0);
    }
  };

  //===================GUARDAR EN LA BASE DE DATOS=======================================================================
  const saveField = async (field, value) => {
    console.log("VALOR DE FILE, VALUE", field, value);
    try {
      // Asegúrate de que el valor se envíe correctamente en el cuerpo de la solicitud
      const response = await axios.patch(
       `${BASE_URL}/api/usuarios/perfil/${usuariosC.idUsuarios}/${field}`,
        { value },
        {
          headers: { "X-CSRF-Token": csrfToken },
          withCredentials: true,
        }
      );
      fetchProfileData();

      showToast(
        "success",
        `${field} actualizado`,
        `El ${field} ha sido guardado correctamente.`
      );
    } catch (error) {
      showToast(
        "error",
        "Error al guardar",
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
    console.log("Este es el id de sesiones abiertas", usuariosC.id);
    try {
      const response = await axios.post(
        `${BASE_URL}/api/usuarios/sesiones`,
        { userId: usuariosC.idUsuarios },
        { headers: { "X-CSRF-Token": csrfToken }, withCredentials: true , timeout: 10000 }
      );
      setSessions(response.data);
      console.log("Sesiones abiertas:", response.data);
    } catch (error) {
      console.error("Error al obtener las sesiones activas:", error);
    }
  };

  const closeAllSessions = async () => {
    const deviceTime = new Date().toISOString();

    try {
      await axios.post(
        `${BASE_URL}/api/usuarios/cerrar-todas-sesiones `,
        { userId: usuariosC.idUsuarios, deviceTime },
        { headers: { "X-CSRF-Token": csrfToken }, withCredentials: true, timeout: 10000 }
      );
      setSessions(sessions.filter((session) => session.isCurrent));
      toast.current.show({
        severity: "success",
        summary: "Sesiones cerradas",
        detail: "Todas las sesiones excepto la actual han sido cerradas.",
        life: 3000, 
      });
    } catch (error) {
      console.error("Error al cerrar todas las sesiones:", error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Error al cerrar todas las sesiones.",
        life: 3000,
      });
    }
  };

  useEffect(() => {
    let intervalId;

    if (usuariosC.id) {
      fetchSessions(); 
      intervalId = setInterval(() => {
        fetchSessions();
      },100000); 
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

  //==========================================================================================

  // Renderizamos el contenido solo si ya tenemos los datos cargados
  if (loading) {
    return (
      <Grid container justifyContent="center dark:bg-gray-950 dark:text-white" sx={{ mt: 4, mb: 4 }}>
        <CircularProgress size={50} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Cargando datos del perfil...
        </Typography>
      </Grid>
    );
  }

  return (
    <div className="dark:bg-gray-950 dark:text-white">

      {isBlocked && (
        <>
          <div className="blocked-overlay dark:text-white"></div>
          <div className="overlay">
            <CircularProgress
              size={120}
              thickness={6}
              sx={{ color: "#1976d2" }}
            />
            <Typography variant="h6" color="white" sx={{ mt: 2 }}>
              Actualizando Imagen.....
            </Typography>
          </div>
        </>
      )}

<div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4 dark:bg-gray-950 dark:text-white">
  <div className="max-w-6xl mx-auto space-y-6">
    {/* Cabecera del Perfil */}
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden dark:bg-gray-800">
      {/* Fondo amarillo sólido */}
      <div className="h-32 bg-[#fcb900] relative dark:bg-gray-900">
        <div className="absolute top-4 right-4 bg-white/90 rounded-lg px-4 py-2 shadow-sm dark:bg-gray-700 dark:text-white">
          <span className="text-blue-600 font-medium dark:text-blue-300">Cliente desde: Enero 2024</span>
        </div>
      </div>

      <div className="px-4 sm:px-6 pb-6">
        {/* Contenedor principal */}
        <div className="flex flex-col items-center -mt-16 space-y-6">
          {/* Foto de Perfil */}
          <div className="relative">
            <div className="w-28 h-28 md:w-32 md:h-32 rounded-full border-4 border-white bg-white overflow-hidden shadow-lg dark:border-gray-700 dark:bg-gray-700">
              <img
                src="/api/placeholder/128/128"
                alt="Foto de Perfil"
                className="w-full h-full object-cover"
              />
              <button className="absolute bottom-1 right-1 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-all dark:bg-gray-600 dark:hover:bg-gray-500">
                <Camera className="w-4 h-4 text-gray-600 dark:text-gray-200" />
              </button>
            </div>
          </div>

          {/* Información Principal */}
          <div className="text-center">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white">Carlos Ramírez</h2>
            <p className="text-sm md:text-base text-gray-500 dark:text-gray-300">ID: ROM-2024-0123</p>
          </div>

          {/* Resumen de Alquileres */}
          <div className="w-full max-w-md mx-auto">
            <div className="grid grid-cols-2 gap-2 md:gap-4">
              <div className="bg-blue-50 p-3 md:p-4 rounded-xl shadow-sm text-center dark:bg-gray-700">
                <div className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Alquileres Activos</div>
                <div className="text-xl md:text-2xl font-bold text-blue-600 dark:text-blue-300">2</div>
              </div>
              <div className="bg-green-50 p-3 md:p-4 rounded-xl shadow-sm text-center dark:bg-gray-700">
                <div className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Completados</div>
                <div className="text-xl md:text-2xl font-bold text-green-600 dark:text-green-300">15</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Navegación */}
    <div className="bg-white rounded-xl shadow-md p-2 overflow-x-auto dark:bg-gray-800">
      <div className="flex justify-start md:justify-center space-x-2">
        {[
          { id: 'personal', icon: User, label: 'Datos Personales' },
          { id: 'alquileres', icon: Box, label: 'Mis Alquileres' },
          { id: 'documentos', icon: FileText, label: 'Documentos' },
          { id: 'historial', icon: Clock, label: 'Historial de Pedidos' },
          { id: 'direccion', icon: MapPin, label: 'Dirección' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white dark:bg-blue-700 dark:text-white'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            <tab.icon className="w-4 h-4 md:w-5 md:h-5" />
            <span className="text-sm md:text-base">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>

    {/* Contenido Principal */}
    <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 dark:bg-gray-800">
      {activeTab === 'personal' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { label: 'Nombre Completo', value: 'Carlos Ramírez López', icon: User },
            { label: 'Teléfono', value: '555-123-4567', icon: Phone },
            { label: 'Correo', value: 'carlos@email.com', icon: Mail },
            { label: 'Dirección', value: 'Calle Principal 123, Ciudad', icon: MapPin },
            { label: 'INE', value: 'RAML850123HDFXXX01', icon: FileText },
            { label: 'Teléfono Adicional', value: '555-987-6543', icon: Phone }
          ].map((field, index) => (
            <div
              key={index}
              className="group bg-gray-50 rounded-xl p-3 sm:p-4 hover:shadow-md transition-all dark:bg-gray-700"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg dark:bg-blue-200">
                  <field.icon className="w-4 h-4 md:w-5 md:h-5 text-blue-600 dark:text-blue-700" />
                </div>
                <div className="flex-1">
                  <label className="text-xs md:text-sm text-gray-600 dark:text-gray-300">{field.label}</label>
                  <div className="text-sm md:text-base font-medium text-gray-800 dark:text-white">{field.value}</div>
                </div>
                <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <Edit2 className="w-4 h-4 text-gray-400 hover:text-blue-600 dark:hover:text-blue-300" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'alquileres' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-4 dark:text-white">Alquileres Activos</h3>
            <div className="space-y-4">
              {[
                { producto: 'Mesa Rectangular 2x1m', cantidad: 4, inicio: '05/02/2024', fin: '07/02/2024', total: '$800' },
                { producto: 'Sillas Plegables', cantidad: 20, inicio: '05/02/2024', fin: '07/02/2024', total: '$600' }
              ].map((alquiler, index) => (
                <div key={index} className="bg-blue-50 rounded-xl p-3 sm:p-4 shadow-sm dark:bg-gray-700">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-2 sm:gap-4">
                    <div>
                      <h4 className="text-sm md:text-base font-medium text-gray-800 dark:text-white">{alquiler.producto}</h4>
                      <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Cantidad: {alquiler.cantidad}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-xs md:text-sm text-gray-600 dark:text-gray-300">
                        {alquiler.inicio} - {alquiler.fin}
                      </div>
                      <div className="text-sm md:text-base font-medium text-blue-600 dark:text-blue-300">{alquiler.total}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-4 dark:text-white">Historial de Alquileres</h3>
            <div className="space-y-4">
              {[
                { producto: 'Carpa 6x6m', cantidad: 1, fecha: '15/01/2024', total: '$1,200' },
                { producto: 'Mesas Redondas', cantidad: 8, fecha: '10/01/2024', total: '$960' }
              ].map((historial, index) => (
                <div key={index} className="bg-gray-50 rounded-xl p-3 sm:p-4 shadow-sm dark:bg-gray-700">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-2 sm:gap-4">
                    <div>
                      <h4 className="text-sm md:text-base font-medium text-gray-800 dark:text-white">{historial.producto}</h4>
                      <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Cantidad: {historial.cantidad}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-xs md:text-sm text-gray-600 dark:text-gray-300">{historial.fecha}</div>
                      <div className="text-sm md:text-base font-medium text-gray-800 dark:text-white">{historial.total}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'documentos' && (
        <div className="space-y-6">
          <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-4 dark:text-white">Documentos Registrados</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { nombre: 'Identificación Oficial (INE)', fecha: '15/01/2024' },
              { nombre: 'Comprobante de Domicilio', fecha: '15/01/2024' },
              { nombre: 'Contrato de Alquiler', fecha: '05/02/2024' }
            ].map((doc, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-3 sm:p-4 shadow-sm dark:bg-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm md:text-base font-medium text-gray-800 dark:text-white">{doc.nombre}</h4>
                    <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Subido: {doc.fecha}</p>
                  </div>
                  <button className="text-blue-600 hover:text-blue-700 text-sm md:text-base dark:text-blue-300 dark:hover:text-blue-200">
                    Ver
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'historial' && (
        <div className="space-y-6">
          <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-4 dark:text-white">Historial de Pedidos</h3>
          <div className="space-y-4">
            {[
              { producto: 'Carpa 6x6m', cantidad: 1, fecha: '15/01/2024', total: '$1,200' },
              { producto: 'Mesas Redondas', cantidad: 8, fecha: '10/01/2024', total: '$960' }
            ].map((historial, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-3 sm:p-4 shadow-sm dark:bg-gray-700">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-2 sm:gap-4">
                  <div>
                    <h4 className="text-sm md:text-base font-medium text-gray-800 dark:text-white">{historial.producto}</h4>
                    <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Cantidad: {historial.cantidad}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xs md:text-sm text-gray-600 dark:text-gray-300">{historial.fecha}</div>
                    <div className="text-sm md:text-base font-medium text-gray-800 dark:text-white">{historial.total}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'direccion' && (
        <div className="space-y-6">
          <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-4 dark:text-white">Dirección</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: 'Calle', value: 'Calle Principal 123', icon: MapPin },
              { label: 'Colonia', value: 'Centro', icon: MapPin },
              { label: 'Ciudad', value: 'Ciudad de México', icon: MapPin },
              { label: 'Código Postal', value: '12345', icon: MapPin }
            ].map((field, index) => (
              <div
                key={index}
                className="group bg-gray-50 rounded-xl p-3 sm:p-4 hover:shadow-md transition-all dark:bg-gray-700"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg dark:bg-blue-200">
                    <field.icon className="w-4 h-4 md:w-5 md:h-5 text-blue-600 dark:text-blue-700" />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs md:text-sm text-gray-600 dark:text-gray-300">{field.label}</label>
                    <div className="text-sm md:text-base font-medium text-gray-800 dark:text-white">{field.value}</div>
                  </div>
                  <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <Edit2 className="w-4 h-4 text-gray-400 hover:text-blue-600 dark:hover:text-blue-300" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  </div>
</div>


    </div>
  );
};

export default PerfilUsuarioPrime;
