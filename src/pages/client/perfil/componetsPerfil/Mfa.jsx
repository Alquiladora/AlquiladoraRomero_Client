import React, { useState, useEffect } from 'react';
import {
  Modal,
  Typography,
  Button,
  Switch,
  FormControlLabel,
  Box,
  TextField,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import axios from 'axios';

const MFAComponent = ({ userId, setActivo }) => {
  const [isMfaEnabled, setIsMfaEnabled] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [verificationError, setVerificationError] = useState('');
  const [csrfToken, setCsrfToken] = useState('');
  const [loadingMfaStatus, setLoadingMfaStatus] = useState(true);

  // Estados para Snackbar
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('info');

  // Obtener el token CSRF y el estado MFA al montar el componente
  useEffect(() => {
    const fetchCsrfToken = async () => {
      try {
        const response = await axios.get("https://alquiladora-romero-backed-1.onrender.com/api/get-csrf-token", {
          withCredentials: true,
        });
        setCsrfToken(response.data.csrfToken);
        checkMfaStatus(response.data.csrfToken); // Mover checkMfaStatus aquí
      } catch (error) {
        console.error("Error al obtener el token CSRF", error);
        setLoadingMfaStatus(false);
      }
    };

    const checkMfaStatus = async (token) => {
      try {
        const response = await axios.get(`https://alquiladora-romero-backed-1.onrender.com/api/mfa/mfa-status/${userId}`, {
          headers: { 'X-CSRF-Token': token },
          withCredentials: true,
        });
        setIsMfaEnabled(response.data.mfaEnabled);
      } catch (error) {
        console.error("Error al obtener el estado MFA:", error);
      }
    };

    fetchCsrfToken();
  }, [userId]);

  const showSnackbar = (message, severity = 'info') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  //Activar MFA
  const handleEnableMFA = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        'https://alquiladora-romero-backed-1.onrender.com/api/mfa/enable-mfa',
        { userId: userId },
        {
          headers: {
            'X-CSRF-Token': csrfToken,
          },
          withCredentials: true,
        }
      );
      setQrCodeUrl(response.data.qrCode);
      setOpenModal(true); 
      setActivo(true);
     
      showSnackbar('QR Generado. Escanea el código QR con tu app de autenticación.', 'info');
    } catch (error) {
      console.error('Error al habilitar MFA:', error);
      showSnackbar('No se pudo habilitar MFA.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Función para verificar el código MFA
  const handleVerifyMFA = async () => {
    try {
      const response = await axios.post(
        'https://alquiladora-romero-backed-1.onrender.com/api/mfa/verify-mfa',
        {
          userId: userId,        
          token: verificationCode 
        },
        {
          headers: {
            'X-CSRF-Token': csrfToken,
          },
          withCredentials: true,
        }
      );
  
      // Si el código es válido, activa MFA
      if (response.data.message === 'Código MFA verificado correctamente.') {
        setIsMfaEnabled(true);
        
        showSnackbar('MFA activado correctamente.', 'success');
        handleCloseModal(); // Cerrar el modal
      } else {
        setVerificationError('Código incorrecto. Intenta nuevamente.');
      }
    } catch (error) {
      console.error('Error al verificar MFA:', error);
      setVerificationError('Error al verificar el código. Intenta nuevamente.');
    }
  };

  const handleDisableMFA = async () => {
    if (!verificationCode) {
      setVerificationError('Es necesario ingresar el código para desactivar MFA.');
      return;
    }

    try {
      const response = await axios.post(
        'https://alquiladora-romero-backed-1.onrender.com/api/mfa/verify-mfa',
        {
          userId: userId,
          token: verificationCode,
        },
        {
          headers: { 'X-CSRF-Token': csrfToken },
          withCredentials: true,
        }
      );

      if (response.data.message === 'Código MFA verificado correctamente.') {
        await axios.post(
          'https://alquiladora-romero-backed-1.onrender.com/api/mfa/disable-mfa',
          { userId: userId },
          {
            headers: { 'X-CSRF-Token': csrfToken },
            withCredentials: true,
          }
        );
        setIsMfaEnabled(false); // Deshabilitar MFA
        setActivo(false)
       
        showSnackbar('MFA desactivado correctamente.', 'info');
        handleCloseModal(); // Cerrar el modal
      } else {
        setVerificationError('Código incorrecto. Intenta nuevamente.');
      }
    } catch (error) {
      console.error('Error al deshabilitar MFA:', error);
      setVerificationError('Error al deshabilitar MFA.');
    }
  };

  // Función para cerrar el modal sin cambiar el estado de MFA si no se verifica
  const handleCloseModal = () => {
    setOpenModal(false);
    setVerificationCode('');  
    setVerificationError(''); 
    setQrCodeUrl('');        
  };

  return (
    <div>
      <Typography variant="h6">Autenticación Multifactor</Typography>

      <FormControlLabel
        control={
          <Switch
            checked={isMfaEnabled}
            onChange={isMfaEnabled ? () => setOpenModal(true) : handleEnableMFA}
            color="primary"
          />
        }
        label={isMfaEnabled ? 'MFA activado' : 'MFA desactivado'}
      />

      {/* Modal para mostrar el código QR y verificar MFA */}
      <Modal
        open={openModal}
        onClose={handleCloseModal} 
        disableBackdropClick={true} 
      >
        <Box sx={{ bgcolor: 'background.paper', p: 4, borderRadius: 2, maxWidth: '500px', mx: 'auto', my: '10%', textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>Protege tu cuenta</Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            {isMfaEnabled
              ? 'Ingresa el código desde tu aplicación para desactivar MFA.'
              : 'Escanea el código QR con tu aplicación de autenticación y luego ingresa el código de verificación generado. El multifactor ya está activo, pero debes validar el código para completar la configuración.'}
          </Typography>

          {loading ? (
            <CircularProgress />
          ) : qrCodeUrl && !isMfaEnabled ? (
            <img src={qrCodeUrl} alt="Código QR" style={{ width: '200px', height: '200px' }} />
          ) : null}

          <TextField
            fullWidth
            label="Ingresa el código único"
            variant="outlined"
            margin="normal"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            error={!!verificationError}
            helperText={verificationError}
          />

          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={isMfaEnabled ? handleDisableMFA : handleVerifyMFA}
            disabled={loading || !verificationCode}  // Solo habilitar si hay código y no está cargando
          >
            {isMfaEnabled ? 'Desactivar MFA' : 'Verificar MFA'}
          </Button>
        </Box>
      </Modal>

      {/* Snackbar para mostrar mensajes */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>

      {isMfaEnabled && <Typography variant="body2" color="success.main">MFA activado exitosamente.</Typography>}
    </div>
  );
};

export default MFAComponent;
