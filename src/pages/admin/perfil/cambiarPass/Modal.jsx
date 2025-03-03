import React, { useState, useEffect } from "react";
import { Modal, Box, Typography, Button, IconButton, TextField } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";
import { v4 as uuidv4 } from "uuid"; 
import { useAuth } from "../../../../hooks/ContextAuth";
import api from "../../../../utils/AxiosConfig";
 




const ModalPassword = ({open, onClose, usuario}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [tokenValido, setTokenValido] = useState(""); 
  const navigate = useNavigate(); 
  const { csrfToken } = useAuth();
  

  const handlePasswordChange = async () => {
    setIsProcessing(true);
    try { 
      const response = await api.post(`/api/email/cambiarpass`, 
      { 
        correo: usuario.correo,  
        nombreU: usuario.nombre,
        rol: usuario.rol
      }, {
        headers: {
          'X-CSRF-Token': csrfToken,  
          'Content-Type': 'application/json',
        },
        withCredentials: true, 
      });

    
      if (response.status === 200) {
        Swal.fire({
          icon: "success",
          title: "Token Enviado",
          text: "Se ha enviado un token a tu correo para cambiar tu contraseña.",
        });

        let ruta = "/";
        switch (usuario.rol) {
          case "cliente":
            ruta = "/cliente/cambiarPassword";
            break;
          case "administrador":
            ruta = "/administrador/cambiarPassword";
            break;
          case "repartidor":
            ruta = "/repartidor/cambiarPassword";
            break;
          default:
            ruta = "/login"; 
            break;
        }
        navigate(ruta, { state: { correo: usuario.correo } });

      } else {
        throw new Error("Error al enviar el token.");
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Hubo un problema al enviar el token. Inténtalo nuevamente.",
      });
    } finally {
      setIsProcessing(false);
      onClose(); 
    }
  };

 

  return (
    <Modal open={open} onClose={onClose} aria-labelledby="modal-modal-title">
    <Box className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg w-full max-w-md mx-auto relative">
      <IconButton
        aria-label="close"
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
      >
        <CloseIcon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
      </IconButton>
  
    
      <Typography
        id="modal-modal-title"
        variant="h6"
        component="h2"
        className="text-center text-xl font-bold text-gray-800 dark:text-white"
      >
        Cambiar Contraseña
      </Typography>
  
      {/* Mensaje */}
      <Typography
        variant="body1"
        className="text-center text-gray-600 dark:text-gray-300 mt-3"
      >
        Pulsa el botón para realizar el proceso de cambio de contraseña.
      </Typography>
  
      {/* Campo de correo solo lectura */}
      <TextField
        label="Correo Electrónico"
        value={usuario.correo}
        fullWidth
        margin="normal"
        InputProps={{ readOnly: true }}
        className="mt-4 bg-gray-100 dark:bg-gray-800 rounded-lg"
        InputLabelProps={{
          className: "text-gray-700 dark:text-gray-300",
        }}
        inputProps={{
          className: "text-gray-900 dark:text-white",
        }}
      />
  
      {/* Botón para enviar el token */}
      <div className="mt-6">
        <Button
          variant="contained"
          onClick={handlePasswordChange}
          disabled={isProcessing}
          className={`w-full py-3 rounded-lg font-semibold text-white transition-all ${
            isProcessing
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
          }`}
        >
          {isProcessing ? "Procesando..." : "Enviar Token"}
        </Button>
      </div>
    </Box>
  </Modal>
);
};

export default ModalPassword;
