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
import { useAuth } from '../../../../hooks/ContextAuth';
import api from '../../../../utils/AxiosConfig';

const MFAComponent = ({ userId, setActivo }) => {
  const [isMfaEnabled, setIsMfaEnabled] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [verificationError, setVerificationError] = useState('');
  const { csrfToken } = useAuth();

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('info');

  useEffect(() => {
    const checkMfaStatus = async () => {
      try {
        const response = await api.get(`/api/mfa/mfa-status/${userId}`, {
          headers: { 'X-CSRF-Token': csrfToken },
          withCredentials: true,
        });

        setIsMfaEnabled(response.data.mfaEnabled);
      } catch (error) {
        console.error('Error al obtener el estado MFA:', error);
      }
    };
    checkMfaStatus();
  }, [userId, csrfToken]);

  const showSnackbar = (message, severity = 'info') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbarOpen(false);
  };

  const handleEnableMFA = async () => {
    setLoading(true);
    try {
      const response = await api.post(
        `/api/mfa/enable-mfa`,
        { userId },
        {
          headers: { 'X-CSRF-Token': csrfToken },
          withCredentials: true,
        }
      );
      setQrCodeUrl(response.data.qrCode);

      setOpenModal(true);
      showSnackbar(
        'QR generado. Escanea el código con tu app de autenticación.',
        'info'
      );
    } catch (error) {
      console.error('Error al habilitar MFA:', error);
      showSnackbar('No se pudo habilitar MFA.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Verificar el código MFA para activar MFA
  const handleVerifyMFA = async () => {
    try {
      const response = await api.post(
        `/api/mfa/verify-mfa`,
        {
          userId,
          token: verificationCode,
        },
        {
          headers: { 'X-CSRF-Token': csrfToken },
          withCredentials: true,
        }
      );

      if (response.data.message === 'Código MFA verificado correctamente.') {
        setIsMfaEnabled(true);
        setActivo(true); // Activamos MFA solo si la verificación es exitosa.
        showSnackbar('MFA activado correctamente.', 'success');
        handleCloseModal();
      } else {
        setVerificationError('Código incorrecto. Intenta nuevamente.');
      }
    } catch (error) {
      console.error('Error al verificar MFA:', error);
      setVerificationError('Error al verificar el código. Intenta nuevamente.');
    }
  };

  // Desactivar MFA: primero verifica el código, luego lo desactiva.
  const handleDisableMFA = async () => {
    if (!verificationCode) {
      setVerificationError(
        'Es necesario ingresar el código para desactivar MFA.'
      );
      return;
    }
    try {
      const response = await api.post(
        `/api/mfa/verify-mfa`,
        {
          userId,
          token: verificationCode,
        },
        {
          headers: { 'X-CSRF-Token': csrfToken },
          withCredentials: true,
        }
      );
      if (response.data.message === 'Código MFA verificado correctamente.') {
        await api.post(
          `/api/mfa/disable-mfa`,
          { userId },
          {
            headers: { 'X-CSRF-Token': csrfToken },
            withCredentials: true,
          }
        );
        setIsMfaEnabled(false);
        setActivo(false);
        showSnackbar('MFA desactivado correctamente.', 'info');
        handleCloseModal();
      } else {
        setVerificationError('Código incorrecto. Intenta nuevamente.');
      }
    } catch (error) {
      console.error('Error al deshabilitar MFA:', error);
      setVerificationError('Error al deshabilitar MFA.');
    }
  };

  const handleCloseModal = () => {
    if (verificationCode.trim() === '') return;
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

      <Modal
        open={openModal}
        onClose={(event, reason) => {
          if (verificationCode.trim() !== '') {
            handleCloseModal();
          }
        }}
        disableEscapeKeyDown
      >
        <Box
          sx={{
            bgcolor: 'background.paper',
            p: 4,
            borderRadius: 2,
            maxWidth: '500px',
            mx: 'auto',
            my: '10%',
            textAlign: 'center',
            width: { xs: '90%', sm: '500px' },
            position: 'relative',
          }}
        >
          <Button
            onClick={handleCloseModal}
            disabled={verificationCode.trim() === ''}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              minWidth: 'auto',
              p: 0,
              color: 'text.secondary',
            }}
          >
            X
          </Button>
          <Typography variant="h6" gutterBottom>
            Protege tu cuenta
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            {isMfaEnabled
              ? 'Ingresa el código desde tu aplicación para desactivar MFA.'
              : 'Escanea el código QR con tu aplicación de autenticación y luego ingresa el código generado. El multifactor no se activará hasta que verifiques el código.'}
          </Typography>
          {loading ? (
            <CircularProgress />
          ) : qrCodeUrl && !isMfaEnabled ? (
            <img
              src={qrCodeUrl}
              alt="Código QR"
              style={{ width: '200px', height: '200px', marginBottom: '16px' }}
            />
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
            disabled={loading || !verificationCode.trim()}
            sx={{ mt: 2 }}
          >
            {isMfaEnabled ? 'Desactivar MFA' : 'Verificar MFA'}
          </Button>
        </Box>
      </Modal>

      {/* Snackbar para mensajes */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>

      {isMfaEnabled && (
        <Typography variant="body2" color="success.main">
          MFA activado exitosamente.
        </Typography>
      )}
    </div>
  );
};

export default MFAComponent;
