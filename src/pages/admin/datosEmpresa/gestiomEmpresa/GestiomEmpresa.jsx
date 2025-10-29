/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Typography,
  Avatar,
  IconButton,
  Modal,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  List,
  ListItem,
  CircularProgress,
  ListItemText,
} from "@mui/material";
import {
  Edit as EditIcon,
  CameraAlt as CameraAltIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFacebook,
  faInstagram,
  faTwitter,
  faLinkedin,
  faYoutube,
  faPinterest,
  faSnapchatGhost,
  faTiktok,
  faDiscord,
  faWhatsapp,
  faTelegramPlane,
} from "@fortawesome/free-brands-svg-icons";
import { FaGlobe,  FaTimes } from "react-icons/fa";
import { toast } from "react-toastify";
import api from "../../../../utils/AxiosConfig";
import { useAuth } from "../../../../hooks/ContextAuth";
import {
  faDatabase,
  faUser,
  faHandPointer,
} from "@fortawesome/free-solid-svg-icons";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^\d{10}$/;
const urlRegex = /^(https?:\/\/)/;
const direccionRegex =
  /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{3,},\s*[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{3,},\s*[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{3,}$/;

const CrudEmpresa = ({ setFotoEmpresa }) => {
  const [empresaData, setEmpresaData] = useState({
    nombreEmpresa: "",
    logoUrl: "",
    slogan: "",
    telefono: "",
    correo: "",
    ubicacion: "",
    redesSociales: {},
  });
  const {  csrfToken } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [openModal, setOpenModal] = useState(false);
  const [currentField, setCurrentField] = useState("");
  const [newValue, setNewValue] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedIcon, setSelectedIcon] = useState(FaGlobe);
  const [currentSocialKey, setCurrentSocialKey] = useState("");
  const [fechaA, setFechaA] = useState("");
  const [saving, setSaving] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState("");

  const iconOptions = [
    { name: "Facebook", icon: faFacebook },
    { name: "Instagram", icon: faInstagram },
    { name: "Twitter", icon: faTwitter },
    { name: "LinkedIn", icon: faLinkedin },
    { name: "YouTube", icon: faYoutube },
    { name: "Pinterest", icon: faPinterest },
    { name: "Snapchat", icon: faSnapchatGhost },
    { name: "TikTok", icon: faTiktok },
    { name: "Discord", icon: faDiscord },
    { name: "WhatsApp", icon: faWhatsapp },
    { name: "Telegram", icon: faTelegramPlane },
    { name: "Other", icon: FaGlobe },
  ];

  // Fetch company data
  const fetchEmpresaData = async () => {
    setDataLoading(true);
    setDataError("");
    try {
      const response = await api.get("/api/empresa", {
        headers: { "X-CSRF-Token": csrfToken },
        withCredentials: true,
      });
      setEmpresaData({
        nombreEmpresa: response.data.nombreEmpresa || "",
        ubicacion: response.data.ubicacion || "",
        correo: response.data.correo || "",
        telefono: response.data.telefono || "",
        slogan: response.data.slogan || "",
        logoUrl: response.data.logoUrl || "",
        redesSociales: JSON.parse(response.data.redesSociales || "{}"),
      });
      setFechaA(response.data.actualizadoEn || "{}");
      setFotoEmpresa(response.data.logoUrl);
    } catch (error) {
      console.error("Error al obtener datos de la empresa", error);
      setDataError("No se pudieron cargar los datos de la empresa.");
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    if (csrfToken) {
      fetchEmpresaData();
    }
  }, [csrfToken]);

  const validateFile = (file) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "image/gif",
      "image/webp",
      "image/svg+xml",
    ];
    const maxSize = 5 * 1024 * 1024;
    if (!allowedTypes.includes(file.type)) {
      toast.error(
        "Formato inválido. Solo se permiten imágenes JPG, PNG, JPEG, GIF, WEBP o SVG."
      );
      return false;
    }
    if (file.size > maxSize) {
      toast.error("El tamaño máximo permitido es de 5 MB.");
      return false;
    }
    return true;
  };

  const handleUploadImage = async (e) => {
    const file = e.target.files[0];
    if (!file || !validateFile(file)) return;
    const formData = new FormData();
    formData.append("imagen", file);
    setUploading(true);
    setUploadProgress(0);
    toast.info("Espera mientras se sube la imagen...");
    try {
      const response = await api.post("/api/imagenes/upload", formData, {
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
      const updatedData = { ...empresaData, logoUrl: imageUrl };
      await api.post("/api/empresa/actualizar", updatedData, {
        headers: { "X-CSRF-Token": csrfToken },
        withCredentials: true,
      });
      setEmpresaData(updatedData);
      toast.success("El logo se ha subido correctamente.");
      setUploading(false);
      setOpenModal(false);
      fetchEmpresaData();
    } catch (error) {
      toast.error("No se pudo subir la imagen, intenta de nuevo.");
      setUploading(false);
      console.error("Error al subir la imagen:", error);
    }
  };

  const handleOpenModal = (field, socialKey = "") => {
    setCurrentField(field);
    setNewValue(
      socialKey ? empresaData.redesSociales[socialKey] : empresaData[field]
    );
    setCurrentSocialKey(socialKey);
    setSelectedIcon(
      getSocialIcon(
        socialKey ? empresaData.redesSociales[socialKey] : empresaData[field]
      )
    );
    setErrorMessage("");
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const validateDireccion = (direccion) => {
    if (!direccionRegex.test(direccion)) {
      setErrorMessage(
        "La dirección debe tener el formato 'Municipio, Ciudad, Estado' (ejemplo: tahuitzal, huejutla, hidalgo) y cada parte debe tener al menos 3 caracteres."
      );
      return false;
    }
    return true;
  };

  const validateField = () => {
    if (currentField === "correo") {
      if (!emailRegex.test(newValue)) {
        setErrorMessage("Por favor, ingresa un correo electrónico válido.");
        return false;
      }
    } else if (currentField === "telefono") {
      if (!phoneRegex.test(newValue)) {
        setErrorMessage(
          "El teléfono debe contener exactamente 10 dígitos numéricos."
        );
        return false;
      }
    } else if (currentField === "redesSociales") {
      if (!urlRegex.test(newValue)) {
        setErrorMessage(
          "Ingresa una URL válida que comience con http o https."
        );
        return false;
      }
      const redes = empresaData.redesSociales || {};
      const duplicate = Object.keys(redes).some(
        (key) => key !== currentSocialKey && redes[key] === newValue.trim()
      );
      if (duplicate) {
        setErrorMessage("Esta red social ya está registrada.");
        return false;
      }
    } else if (currentField === "ubicacion") {
      if (!validateDireccion(newValue)) {
        return false;
      }
    } else if (currentField === "slogan") {
      if (newValue.trim().length < 4 || newValue.trim().length > 30) {
        setErrorMessage("El slogan debe tener entre 4 y 30 caracteres.");
        return false;
      }
    } else if (currentField === "nombreEmpresa") {
      if (!/^[A-Za-z]/.test(newValue)) {
        setErrorMessage("El nombre de la empresa debe comenzar con una letra.");
        return false;
      }
      if (newValue.trim().length < 2) {
        setErrorMessage("El nombre de la empresa es demasiado corto.");
        return false;
      }
    }
    setErrorMessage("");
    return true;
  };

  const handleSave = async () => {
    if (!validateField()) return;
    const updatedData = { ...empresaData };

    if (currentField === "redesSociales") {
      if (newValue.trim() === "") {
        setErrorMessage(
          "Por favor, introduce una URL válida antes de guardar."
        );
        return;
      }
      updatedData.redesSociales = updatedData.redesSociales || {};
      updatedData.redesSociales[currentSocialKey] = newValue;
    } else {
      updatedData[currentField] = newValue;
    }

    try {
      setSaving(true);
      await api.post("/api/empresa/actualizar", updatedData, {
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
        withCredentials: true,
      });
      setEmpresaData(updatedData);
      setFotoEmpresa(updatedData.logoUrl);
      handleCloseModal();
      toast.success(`El campo ${currentField} se actualizó correctamente.`);
    } catch (error) {
      toast.error(`El campo ${currentField} no se actualizó.`);
      console.error(`Error al actualizar el campo ${currentField}`, error);
    } finally {
      setSaving(false);
    }
  };

  const addNewSocial = () => {
    const socialObj = empresaData.redesSociales || {};
    const newSocialKey = `Red_Social_${Object.keys(socialObj).length + 1}`;
    handleOpenModal("redesSociales", newSocialKey);
  };

  const getSocialIcon = (url = "") => {
    if (!url || typeof url !== "string") return FaGlobe;
    if (url.includes("facebook.com")) return faFacebook;
    if (url.includes("instagram.com")) return faInstagram;
    if (url.includes("x.com") || url.includes("twitter.com")) return faTwitter;
    if (url.includes("linkedin.com")) return faLinkedin;
    if (url.includes("youtube.com")) return faYoutube;
    if (url.includes("pinterest.com")) return faPinterest;
    if (url.includes("snapchat.com")) return faSnapchatGhost;
    if (url.includes("tiktok.com")) return faTiktok;
    if (url.includes("discord.com")) return faDiscord;
    if (url.includes("whatsapp.com")) return faWhatsapp;
    if (url.includes("telegram.org") || url.includes("t.me"))
      return faTelegramPlane;
    return FaGlobe;
  };

  if (dataLoading) {
    return (
      <Box className="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-gray-900">
        <CircularProgress size={60} className="text-blue-500 mb-4" />
        <Typography variant="h6" className="text-gray-900 dark:text-white">
          Cargando datos de la empresa...
        </Typography>
      </Box>
    );
  }

  if (
    dataError ||
    (!empresaData.logoUrl &&
      !empresaData.ubicacion &&
      !empresaData.correo &&
      !empresaData.telefono &&
      !empresaData.slogan)
  ) {
    return (
      <Box className="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-gray-900 p-4 sm:p-8">
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="mb-4"
        >
          <FontAwesomeIcon
            icon={faUser}
            size="3x"
            className="text-gray-500 dark:text-gray-300 mb-2"
          />
          <FontAwesomeIcon
            icon={faHandPointer}
            size="2x"
            className="text-gray-500 dark:text-gray-300 absolute transform -translate-x-6 translate-y-6"
          />
          <FontAwesomeIcon
            icon={faDatabase}
            size="4x"
            className="text-gray-500 dark:text-gray-300"
          />
        </motion.div>
        <Typography
          variant="h5"
          className="text-red-500 dark:text-red-400 font-bold mb-2"
        >
          Sin datos registrados de la empresa.
        </Typography>
        <Typography
          variant="body1"
          className="text-gray-700 dark:text-gray-300"
        >
          Contacta con el administrador de la base de datos.
        </Typography>
      </Box>
    );
  }

  return (
    <Box className="max-w-6xl mx-auto p-4 sm:p-6 bg-white dark:bg-gray-900 min-h-screen  animate-fade-in-up">
      <Paper
        elevation={3}
        className="p-4 sm:p-6 mb-6 relative bg-white dark:bg-gray-800 rounded-lg transition-all hover:shadow-lg hover:-translate-y-1"
      >
        <Typography
          variant="body2"
          sx={{
            position: "absolute",
            top: { xs: 8, sm: 12 },
            right: { xs: 8, sm: 16 },
            fontSize: { xs: "0.75rem", sm: "0.875rem" },
            color: "text.secondary",
          }}
          className="dark:text-gray-300"
        >
          Actualizado el:{" "}
          {fechaA
            ? new Date(fechaA).toLocaleString("es-ES", {
                day: "2-digit",
                month: "long",
              })
            : ""}
        </Typography>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            mt: 2,
          }}
        >
          <Box sx={{ position: "relative" }}>
            <Avatar
              alt="Logo de la empresa"
              src={
                empresaData.logoUrl ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  empresaData.nombreEmpresa.charAt(0) || "U"
                )}&background=0D6EFD&color=fff`
              }
              sx={{
                width: { xs: 80, sm: 100 },
                height: { xs: 80, sm: 100 },
                boxShadow: 3,
                transition: "transform 0.3s ease",
                "&:hover": { transform: "scale(1.05)" },
              }}
            />
            <IconButton
              component="label"
              sx={{
                position: "absolute",
                bottom: 0,
                left: "50%",
                transform: "translateX(-50%)",
                bgcolor: "background.paper",
                boxShadow: 2,
                "&:hover": {
                  transform: "translateX(-50%) scale(1.1)",
                  bgcolor: "background.default",
                },
              }}
              className="dark:bg-gray-700 dark:hover:bg-gray-600"
            >
              <CameraAltIcon sx={{ color: "primary.main" }} />
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleUploadImage}
              />
            </IconButton>
          </Box>

          <Box
            sx={{
              mt: 2,
              position: "relative",
              width: "100%",
              maxWidth: { xs: "250px", sm: "300px" },
              textAlign: "center",
            }}
          >
            <Typography
              variant="h5"
              fontWeight="bold"
              sx={{
                fontSize: { xs: "1.25rem", sm: "1.5rem" },
                color: "text.primary",
              }}
              className="dark:text-white"
            >
              {empresaData.nombreEmpresa || "Nombre de la Empresa"}
            </Typography>
            <IconButton
              onClick={() => handleOpenModal("nombreEmpresa")}
              sx={{
                position: "absolute",
                top: 0,
                right: 0,
                color: "primary.main",
              }}
              className="dark:text-white"
            >
              <EditIcon />
            </IconButton>
          </Box>
        </Box>
      </Paper>

      <Grid container spacing={{ xs: 1, sm: 2, md: 3 }} justifyContent="center">
        {["correo", "ubicacion", "telefono", "slogan"].map((field, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Paper
              elevation={2}
              sx={{
                p: { xs: 1, sm: 2 },
                textAlign: "center",
                position: "relative",
                bgcolor: "background.paper",
                borderRadius: 2,
                transition: "box-shadow 0.3s ease, transform 0.3s ease",
                "&:hover": { boxShadow: 6, transform: "translateY(-2px)" },
              }}
              className="dark:bg-gray-800"
            >
              <Typography
                variant="h6"
                fontWeight="medium"
                sx={{
                  mb: 1,
                  fontSize: { xs: "0.9rem", sm: "1rem" },
                  color: "text.primary",
                }}
                className="dark:text-white"
              >
                {field.charAt(0).toUpperCase() + field.slice(1)}
              </Typography>
              <Typography
                sx={{
                  color: "text.secondary",
                  wordWrap: "break-word",
                  px: 1,
                  fontSize: { xs: "0.85rem", sm: "0.95rem" },
                }}
                className="dark:text-gray-300"
              >
                {empresaData[field] || "N/A"}
              </Typography>
              <IconButton
                sx={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  color: "primary.main",
                }}
                className="dark:text-white"
                onClick={() => handleOpenModal(field)}
              >
                <EditIcon />
              </IconButton>
            </Paper>
          </Grid>
        ))}

        <Grid item xs={12}>
          <Paper
            elevation={2}
            sx={{
              p: { xs: 1, sm: 2, md: 3 },
              textAlign: "center",
              bgcolor: "background.paper",
              borderRadius: 2,
              transition: "box-shadow 0.3s ease, transform 0.3s ease",
              "&:hover": { boxShadow: 6, transform: "translateY(-2px)" },
            }}
            className="dark:bg-gray-800 dark:text-white"
          >
            <Typography
              variant="h6"
              fontWeight="medium"
              sx={{ mb: 2, fontSize: { xs: "1rem", sm: "1.25rem" } }}
            >
              Redes Sociales
            </Typography>
            {Object.keys(empresaData.redesSociales || {}).length > 0 ? (
              <List sx={{ maxHeight: "300px", overflowY: "auto" }}>
                {Object.keys(empresaData.redesSociales || {}).map(
                  (socialKey, index) => (
                    <ListItem
                      key={index}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        bgcolor:
                          index % 2 === 0
                            ? "background.paper"
                            : "background.default",
                        borderRadius: 1,
                        mb: 0.5,
                      }}
                      className="dark:bg-gray-700"
                    >
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <FontAwesomeIcon
                          icon={getSocialIcon(
                            empresaData.redesSociales[socialKey]
                          )}
                          className="dark:text-gray-300"
                          style={{ marginRight: 10, fontSize: "1.2rem" }}
                        />
                        <ListItemText
                          primary={
                            <Typography
                              sx={{
                                fontSize: { xs: "0.85rem", sm: "0.95rem" },
                                color: "text.primary",
                                wordBreak: "break-word",
                              }}
                              className="dark:text-white"
                            >
                              {empresaData.redesSociales[socialKey]}
                            </Typography>
                          }
                        />
                      </Box>
                      <IconButton
                        onClick={() =>
                          handleOpenModal("redesSociales", socialKey)
                        }
                        sx={{ color: "primary.main" }}
                      >
                        <EditIcon className="dark:text-white" />
                      </IconButton>
                    </ListItem>
                  )
                )}
              </List>
            ) : (
              <Typography
                className="dark:text-gray-300"
                sx={{ color: "text.secondary", mb: 2 }}
              >
                No se han agregado redes sociales.
              </Typography>
            )}
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={addNewSocial}
              sx={{
                mt: 2,
                bgcolor: "primary.main",
                color: "white",
                "&:hover": {
                  bgcolor: "primary.dark",
                  transform: "scale(1.05)",
                },
                transition: "transform 0.3s ease",
                borderRadius: 2,
                fontWeight: "bold",
                fontSize: { xs: "0.75rem", sm: "0.875rem" },
                px: { xs: 2, sm: 3 },
              }}
              className="dark:bg-blue-600 dark:hover:bg-blue-700"
            >
              Añadir Red Social
            </Button>
          </Paper>
        </Grid>
      </Grid>

      <Modal open={openModal} onClose={handleCloseModal}>
        <Box
          sx={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: "90%", sm: "400px" },
            bgcolor: "background.paper",
            p: { xs: 2, sm: 3 },
            borderRadius: 2,
            boxShadow: 24,
            outline: "none",
            maxHeight: "90vh",
            overflowY: "auto",
          }}
          className="dark:bg-gray-800"
        >
          <IconButton
            onClick={handleCloseModal}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              color: "text.secondary",
              "&:hover": { color: "text.primary" },
            }}
            className="dark:text-white"
          >
            <FaTimes />
          </IconButton>
          <Typography
            variant="h6"
            sx={{
              mb: 2,
              color: "text.primary",
              fontSize: { xs: "1rem", sm: "1.25rem" },
            }}
            className="dark:text-white"
          >
            Editar{" "}
            {typeof currentField === "string"
              ? currentField.charAt(0).toUpperCase() + currentField.slice(1)
              : ""}
          </Typography>
          <TextField
            fullWidth
            label={`Nuevo ${currentField}`}
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            margin="normal"
            sx={{
              "& .MuiInputBase-root": { bgcolor: "background.default" },
              "& .MuiInputLabel-root": { color: "text.secondary" },
              "& .MuiInputBase-input": { color: "text.primary" },
            }}
            className="dark:bg-gray-700 dark:text-white"
            error={!!errorMessage}
            helperText={errorMessage}
          />
          {currentField === "redesSociales" && (
            <FormControl fullWidth margin="normal">
              <InputLabel
                sx={{ color: "text.secondary" }}
                className="dark:text-gray-300"
              >
                Selecciona un icono
              </InputLabel>
              <Select
                value={selectedIcon ? selectedIcon.icon : ""}
                onChange={(e) =>
                  setSelectedIcon(
                    iconOptions.find((option) => option.icon === e.target.value)
                  )
                }
                sx={{
                  bgcolor: "background.default",
                  color: "text.primary",
                  "& .MuiSvgIcon-root": { color: "text.secondary" },
                }}
                className="dark:bg-gray-700 dark:text-white"
                label="Selecciona un icono"
              >
                {iconOptions.map((option) => (
                  <MenuItem
                    key={option.name}
                    value={option.icon}
                    className="dark:bg-gray-800 dark:text-white"
                  >
                    <FontAwesomeIcon
                      icon={option.icon}
                      style={{ marginRight: 10, color: "text.secondary" }}
                      className="dark:text-gray-300"
                    />
                    {option.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          <Button
            variant="contained"
            onClick={handleSave}
            fullWidth
            disabled={saving}
            sx={{
              mt: 2,
              bgcolor: "primary.main",
              color: "white",
              "&:hover": {
                bgcolor: "primary.dark",
                transform: "scale(1.02)",
              },
              transition: "transform 0.3s ease",
              fontWeight: "bold",
              fontSize: { xs: "0.75rem", sm: "0.875rem" },
              py: 1,
            }}
            className="dark:bg-blue-600 dark:hover:bg-blue-700"
          >
            {saving ? (
              <CircularProgress size={24} sx={{ color: "white" }} />
            ) : (
              "Guardar"
            )}
          </Button>
        </Box>
      </Modal>
    </Box>
  );
};

export default CrudEmpresa;
