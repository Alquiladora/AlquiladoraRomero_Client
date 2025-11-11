import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Alert, 
  AlertTitle, 
  IconButton, 
  Box,
  Typography
} from '@mui/material';
import {
  Close as CloseIcon,
  Warning as WarningIcon,
  WifiOff as WifiOffIcon,
  Schedule as ScheduleIcon,
  CloudOff as CloudOffIcon
} from '@mui/icons-material';

const ServerErrorModal = () => {
  const [visible, setVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [alertType, setAlertType] = useState('error');

  useEffect(() => {
    const errorMap = {
      'offline-error': {
        title: 'Sin Conexión',
        message: 'No hay conexión a Internet. Algunas funciones no están disponibles.',
        type: 'warning',
        icon: <WifiOffIcon />
      },
      'timeout-error': {
        title: 'Conexión Lenta',
        message: 'La solicitud está tardando más de lo esperado.',
        type: 'warning',
        icon: <ScheduleIcon />
      },
      'server-unreachable': {
        title: 'Servidor No Disponible',
        message: 'No se puede conectar con el servidor en este momento.',
        type: 'error',
        icon: <CloudOffIcon />
      },
    };

    const handleErrorEvent = (event) => {
      const errorConfig = errorMap[event.type];
      if (errorConfig) {
        setModalTitle(errorConfig.title);
        setModalMessage(errorConfig.message);
        setAlertType(errorConfig.type);
        setVisible(true);
        
        // Auto-ocultar después de 6 segundos
        setTimeout(() => {
          setVisible(false);
        }, 6000);
      }
    };

    Object.keys(errorMap).forEach((eventName) =>
      window.addEventListener(eventName, handleErrorEvent)
    );

    return () => {
      Object.keys(errorMap).forEach((eventName) =>
        window.removeEventListener(eventName, handleErrorEvent)
      );
    };
  }, []);

  const handleClose = () => setVisible(false);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.8 }}
          transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
          style={{
            position: 'fixed',
            top: 20,
            right: 20,
            zIndex: 9999,
            minWidth: 300,
            maxWidth: 400
          }}
        >
          <Alert
            severity={alertType}
            variant="filled"
            icon={false}
            action={
              <IconButton
                aria-label="close"
                color="inherit"
                size="small"
                onClick={handleClose}
              >
                <CloseIcon fontSize="inherit" />
              </IconButton>
            }
            sx={{
              borderRadius: 2,
              boxShadow: 3,
              '& .MuiAlert-message': {
                width: '100%'
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <WarningIcon sx={{ mt: 0.25 }} />
              <Box sx={{ flex: 1 }}>
                <AlertTitle sx={{ mb: 0.5, fontWeight: 'bold' }}>
                  {modalTitle}
                </AlertTitle>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {modalMessage}
                </Typography>
              </Box>
            </Box>
          </Alert>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ServerErrorModal;