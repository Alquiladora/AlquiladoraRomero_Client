import React, { useState, useEffect, useRef,useContext  } from 'react';
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
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { Edit as EditIcon, CameraAlt as CameraAltIcon, Add as AddIcon } from '@mui/icons-material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebook, faInstagram, faTwitter } from '@fortawesome/free-brands-svg-icons';
import { faGlobe } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { Toast } from 'primereact/toast';
import { ThemeContext } from '../../shared/layaouts/ThemeContext';

// Expresiones regulares para validación
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^\d{10}$/;
const urlRegex = /^(https?:\/\/)/;

const CrudEmpresa = () => {
  const { theme } = useContext(ThemeContext);
  const isDarkMode = theme === 'dark';
  const [empresaData, setEmpresaData] = useState({
    logo: '',
    direccion: '',
    correo: '',
    telefono: '',
    slogan: '',
    redes_sociales: {}, 
  });
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [openModal, setOpenModal] = useState(false);
  const [currentField, setCurrentField] = useState('');
  const [newValue, setNewValue] = useState('');
  const [csrfToken, setCsrfToken] = useState(''); 
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedIcon, setSelectedIcon] = useState(faGlobe);
  const [currentSocialKey, setCurrentSocialKey] = useState(''); // Para identificar la red social
  const toast = useRef(null);

  // Opciones de íconos para las redes sociales
  const iconOptions = [
    { name: 'Facebook', icon: faFacebook },
    { name: 'Instagram', icon: faInstagram },
    { name: 'Twitter', icon: faTwitter },
    { name: 'Other', icon: faGlobe }
  ];

  useEffect(() => {
    const fetchCsrfToken = async () => {
      try {
        const response = await axios.get("https://alquiladora-romero-backed-1.onrender.com/api/get-csrf-token", {
          withCredentials: true,
        });
        setCsrfToken(response.data.csrfToken);
      } catch (error) {
        console.error("Error al obtener el token CSRF", error);
      }
    };
    fetchCsrfToken();
  }, []);

  const fetchEmpresaData = async () => {
    try {
      const response = await axios.get("https://alquiladora-romero-backed-1.onrender.com/api/empresa", {
        headers: { "X-CSRF-Token": csrfToken },
        withCredentials: true,
      });
      console.log("date.correo", response.data.logo_url);
      setEmpresaData({
        logo: response.data.logo_url || '',
        direccion: response.data.direccion || '',
        correo: response.data.correo || '',
        telefono: response.data.telefono || '',
        slogan: response.data.slogan || '',
        redes_sociales: JSON.parse(response.data.redes_sociales || '{}'),
      });
    } catch (error) {
      console.error("Error al obtener datos de la empresa", error);
    }
  };

  useEffect(() => {
    fetchEmpresaData();
  }, [csrfToken]);

  // Validación de formato de imagen
  const validateFile = (file) => {
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/jpg',
      'image/gif',
      'image/webp',
      'image/svg+xml'
    ];
    
    const maxSize = 5 * 1024 * 1024; // Tamaño máximo permitido: 5 MB
    
    if (!allowedTypes.includes(file.type)) {
      showToast("error", "Formato inválido", "Solo se permiten imágenes JPG, PNG, JPEG, GIF, WEBP o SVG.");
      return false;
    }
    
    if (file.size > maxSize) {
      showToast("error", "Archivo demasiado grande", "El tamaño máximo permitido es de 5 MB.");
      return false;
    }
    
    return true;
  };
  

  // Mostrar mensajes Toast
  const showToast = (severity, summary, detail) => {
    toast.current.show({ severity, summary, detail, life: 3000 });
  };

  const handleUploadImage = async (e) => {
    const file = e.target.files[0];

    // Verificar si se ha seleccionado un archivo y si es del formato permitido
    if (!file || !validateFile(file)) return;

    const formData = new FormData();
    formData.append("imagen", file); // Imagen a subir

    setUploading(true); // Estado de subida
    setUploadProgress(0); // Progreso inicial
    showToast("info", "Subiendo Imagen", "Espera mientras se sube la imagen...");

    try {
      // Subir la imagen
      const response = await axios.post(
        "https://alquiladora-romero-backed-1.onrender.com/api/imagenes/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            "X-CSRF-Token": csrfToken,
          },
          withCredentials: true, // Para enviar las cookies
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentCompleted); // Actualiza el progreso
          },
        }
      );

      const imageUrl = response.data.url; // La URL de la imagen subida
      console.log("URL de la imagen subida:", imageUrl);

      // Actualizar el logo de la empresa con la URL obtenida
      const updatedData = { ...empresaData, logo_url: imageUrl };
      console.log("Este es updateData", updatedData)

      await axios.post(`https://alquiladora-romero-backed-1.onrender.com/api/empresa/actualizar`, updatedData, {
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
        withCredentials: true,
      });

      setEmpresaData(updatedData); 
      showToast("success", "Imagen Subida", "El logo se ha subido correctamente.");
      setUploading(false); 
      setOpenModal(false);
      fetchEmpresaData();

    } catch (error) {
      showToast("error", "Error al subir", "No se pudo subir la imagen, intenta de nuevo.");
      setUploading(false); 
      console.error("Error al subir la imagen:", error);
    }
  };

  const handleOpenModal = (field, socialKey = '') => {
    setCurrentField(field);
    setNewValue(socialKey ? empresaData.redes_sociales[socialKey] : empresaData[field]);
    setCurrentSocialKey(socialKey);
    setSelectedIcon(getSocialIcon(socialKey ? empresaData.redes_sociales[socialKey] : empresaData[field]));
    setErrorMessage('');
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const validateField = () => {
    if (['correo'].includes(currentField) && !emailRegex.test(newValue)) {
      setErrorMessage('Por favor, ingresa un correo electrónico válido.');
      return false;
    } else if (['telefono'].includes(currentField) && !phoneRegex.test(newValue)) {
      setErrorMessage('El teléfono debe contener exactamente 10 dígitos numéricos.');
      return false;
    } else if (['redes_sociales'].includes(currentField) && !urlRegex.test(newValue)) {
      setErrorMessage('Por favor, ingresa una URL válida que comience con http o https.');
      return false;
    } else if (['direccion'].includes(currentField) && (newValue.trim().length < 5 || newValue.trim().length > 40)) {
      setErrorMessage('La dirección debe tener entre 5 y 40 caracteres.');
      return false;
    }else if (['slogan'].includes(currentField) && (newValue.trim().length < 4 || newValue.trim().length > 30)) {
      setErrorMessage('El slogan debe tener entre 4 y 30 caracteres.');
      return false;
    }

    setErrorMessage('');
    return true;
  };

  const handleSave = async () => {
    if (!validateField()) return;

    const updatedData = { ...empresaData };
    
    if (currentField === 'redes_sociales') {
      if (newValue.trim() === '') {
        setErrorMessage('Por favor, introduce una URL válida antes de guardar.');
        return;
      }
      updatedData.redes_sociales[currentSocialKey] = newValue;
    } else {
      updatedData[currentField] = newValue;
    }

    try {
      await axios.post(`https://alquiladora-romero-backed-1.onrender.com/api/empresa/actualizar`, updatedData, {
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
        withCredentials: true,
      });

      setEmpresaData(updatedData);
      handleCloseModal();
      showToast('success', 'Actualización exitosa', `El campo ${currentField} se actualizó correctamente.`);
    } catch (error) {
      showToast('error', 'Error', `El campo ${currentField} no se actualizó.`);
      console.error(`Error al actualizar el campo ${currentField}`, error);
    }
  };

  const addNewSocial = () => {
    const newSocialKey = `new_social_${Object.keys(empresaData.redes_sociales).length + 1}`;
    handleOpenModal('redes_sociales', newSocialKey);
  };

  const getSocialIcon = (url = '') => {
    if (!url || typeof url !== 'string') {
      return faGlobe;
    }
    if (url.includes('facebook.com')) return faFacebook;
    if (url.includes('instagram.com')) return faInstagram;
    if (url.includes('twitter.com')) return faTwitter;
    return faGlobe;
  };

  return (
    <Box
      sx={{
        padding: { xs: 2, md: 4 },
        maxWidth: '900px',
        margin: 'auto',
        color: isDarkMode ? '#fff' : '#000',
        backgroundColor: isDarkMode ? '#333' : '#f9f9f9',
        borderRadius: 2,
      }}
    >
      <Box display="flex" justifyContent="center" alignItems="center" position="relative" mb={4}>
        <Avatar
          alt="Logo de la empresa"
          src={empresaData.logo}
          sx={{ width: { xs: 100, md: 150 }, height: { xs: 100, md: 150 }, boxShadow: 3 }}
        />
        <IconButton
          sx={{
            position: 'absolute',
            bottom: 0,
            right: 'calc(50% - 50px)',
            backgroundColor: 'white',
            borderRadius: '50%',
          }}
          component="label"
        >
          <CameraAltIcon />
          <input type="file" hidden accept="image/*" onChange={handleUploadImage} />
        </IconButton>
      </Box>

      <Grid container spacing={3} sx={{ justifyContent: 'center' }}>
        {['correo', 'direccion', 'telefono'].map((field, index) => (
          <Grid item xs={12} sm={6} key={index}>
            <Box
              sx={{
                border: '1px solid #ddd',
                padding: 2,
                borderRadius: 2,
                textAlign: 'center',
                position: 'relative',
                boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                '&:hover': {
                  boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
                },
              }}
            >
              <Typography variant="h6" fontWeight="bold">{field.charAt(0).toUpperCase() + field.slice(1)}</Typography>
              <Typography>{empresaData[field]}</Typography>
              <IconButton
                sx={{ position: 'absolute', top: 8, right: 8 }}
                onClick={() => handleOpenModal(field)}
              >
                <EditIcon />
              </IconButton>
            </Box>
          </Grid>
        ))}
        <Grid item xs={12} sm={6}>
  <Box
    sx={{
      border: '1px solid #ddd',
      padding: 2,
      borderRadius: 2,
      textAlign: 'center',
      position: 'relative',
      boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
      '&:hover': {
        boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
      },
    }}
  >
    <Typography variant="h6" fontWeight="bold">Slogan</Typography>
    <Typography>{empresaData.slogan}</Typography>
    <IconButton
      sx={{ position: 'absolute', top: 8, right: 8 }}
      onClick={() => handleOpenModal('slogan')}
    >
      <EditIcon />
    </IconButton>
  </Box>
</Grid>



        <Grid item xs={12}>
          <Box
            sx={{
              border: '1px solid #ddd',
              padding: 2,
              borderRadius: 2,
              textAlign: 'center',
              position: 'relative',
              boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
              '&:hover': {
                boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
              },
            }}
          >
            <Typography variant="h6" fontWeight="bold">Redes Sociales</Typography>
            
            {Object.keys(empresaData.redes_sociales).length > 0 && (
              <List>
                {Object.keys(empresaData.redes_sociales).map((socialKey, index) => (
                  <ListItem
                    key={index}
                    sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  >
                    <Box display="flex" alignItems="center">
                      <FontAwesomeIcon icon={getSocialIcon(empresaData.redes_sociales[socialKey])} style={{ marginRight: 10 }} />
                      <ListItemText primary={empresaData.redes_sociales[socialKey]} />
                    </Box>
                    <IconButton onClick={() => handleOpenModal('redes_sociales', socialKey)}>
                      <EditIcon />
                    </IconButton>
                  </ListItem>
                ))}
              </List>
            )}

            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={addNewSocial}
              sx={{ mt: 2 }}
            >
              Añadir Red Social
            </Button>
          </Box>
        </Grid>
      </Grid>

      <Modal open={openModal} onClose={handleCloseModal}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '90%',
            maxWidth: '400px',
            bgcolor: 'background.paper',
            p: 4,
            borderRadius: 2,
            boxShadow: 24,
          }}
        >
          <Typography variant="h6" mb={2}>
            Editar {typeof currentField === 'string' ? currentField.charAt(0).toUpperCase() + currentField.slice(1) : ''}
          </Typography>
          <TextField
            fullWidth
            label={`Nuevo ${currentField}`}
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            margin="normal"
            error={!!errorMessage}
            helperText={errorMessage}
          />
          {currentField === 'redes_sociales' && (
            <FormControl fullWidth margin="normal">
              <InputLabel>Selecciona un icono</InputLabel>
              <Select
                value={selectedIcon.icon}
                onChange={(e) => setSelectedIcon(iconOptions.find(option => option.icon === e.target.value))}
              >
                {iconOptions.map(option => (
                  <MenuItem key={option.name} value={option.icon}>
                    <FontAwesomeIcon icon={option.icon} style={{ marginRight: 10 }} />
                    {option.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          <Button variant="contained" color="primary" onClick={handleSave} fullWidth>
            Guardar
          </Button>
        </Box>
      </Modal>
      <Toast ref={toast} /> {/* Componente Toast */}
    </Box>
  );
};

export default CrudEmpresa;
