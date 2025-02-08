import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  TextField,
  Box,
  CircularProgress,
  Alert,
  Chip,
} from "@mui/material";
import { Lock, LockOpen } from "@mui/icons-material";
import { ThemeContext } from "../../shared/layaouts/ThemeContext";
import Swal from "sweetalert2";

const UsuariosSospechosos = () => {
  const [usuarios, setUsuarios] = useState([]);
  const { theme } = useContext(ThemeContext);
  const [csrfToken, setCsrfToken] = useState("");
  const [minIntentosReales, setMinIntentosReales] = useState(5); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);


  useEffect(() => {
    const fetchCsrfToken = async () => {
      try {
        const response = await axios.get(
          "https://alquiladora-romero-backed-1.onrender.com/api/get-csrf-token",
          {
            withCredentials: true,
            timeout: 10000, 
          }
        );
        setCsrfToken(response.data.csrfToken);
      } catch (error) {
        console.error("Error al obtener el token CSRF:", error);
        setError("Error al obtener el token CSRF.");
      }
    };

    fetchCsrfToken();
  }, []);

  useEffect(() => {
    if (!csrfToken) return;

    const fetchUsuariosSospechosos = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(
          `https://alquiladora-romero-backed-1.onrender.com/api/usuarios/usuarios-sospechosos?minIntentos=${minIntentosReales}`,
          {
            headers: {
              "X-CSRF-Token": csrfToken,
            },
            withCredentials: true,
            timeout: 10000,
          }
        );
        setUsuarios(response.data);
      } catch (error) {
        console.error("Error al obtener usuarios sospechosos:", error);
        setError("Error al obtener usuarios sospechosos.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsuariosSospechosos();
  }, [csrfToken, minIntentosReales]);

  // Función para bloquear/desbloquear usuario
  const handleToggleBlock = async (idUsuario, bloqueado) => {
    const url = bloqueado
      ? `https://alquiladora-romero-backed-1.onrender.com/api/usuarios/desbloquear/${idUsuario}`
      : `https://alquiladora-romero-backed-1.onrender.com/api/usuarios/bloquear/${idUsuario}`;

    try {
      await axios.post(
        url,
        {},
        {
          headers: {
            "X-CSRF-Token": csrfToken,
          },
          withCredentials: true,
          timeout: 10000,
        }
      );
      Swal.fire({
        icon: "success",
        title: bloqueado ? "Usuario desbloqueado" : "Usuario bloqueado",
        showConfirmButton: false,
        timer: 1500,
      });
      // Refrescar la lista de usuarios después de bloquear/desbloquear
      fetchUsuariosActualizados();
    } catch (error) {
      console.error("Error al cambiar el estado de bloqueo:", error);
      Swal.fire({
        icon: "error",
        title: "Error al cambiar el estado de bloqueo",
        text: error.response?.data?.message || "Intenta de nuevo",
      });
    }
  };

  // Función para obtener la lista actualizada de usuarios
  const fetchUsuariosActualizados = async () => {
    if (!csrfToken) return;
    try {
      const response = await axios.get(
        `https://alquiladora-romero-backed-1.onrender.com/api/usuarios/usuarios-sospechosos?minIntentos=${minIntentosReales}`,
        {
          headers: {
            "X-CSRF-Token": csrfToken,
          },
          withCredentials: true,
          timeout: 10000, 
        }
      );
      setUsuarios(response.data);
    } catch (error) {
      console.error("Error al actualizar usuarios sospechosos:", error);
      setError("Error al actualizar usuarios sospechosos.");
    }
  };

  // Manejar cambios en el input de 'minIntentosReales'
  const handleChangeMinIntentosReales = (event) => {
    const value = parseInt(event.target.value);
    setMinIntentosReales(isNaN(value) ? 0 : value);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box mt={4}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <TableContainer
      component={Paper}
      sx={{
        backgroundColor: theme === "light" ? "#fff" : "#333",
        color: theme === "light" ? "#000" : "#fff",
        padding: 2,
      }}
    >
      <Typography
        variant="h4"
        align="center"
        sx={{ color: theme === "light" ? "#000" : "#fff", marginBottom: 2 }}
      >
        Usuarios Sospechosos
      </Typography>

      {/* Campo para ingresar el mínimo de intentos reales */}
      <Box sx={{ display: "flex", justifyContent: "center", marginBottom: 2 }}>
        <TextField
          label="Mínimo de Intentos Reales"
          type="number"
          value={minIntentosReales}
          onChange={handleChangeMinIntentosReales}
          sx={{ width: 200 }}
        />
      </Box>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Nombre</TableCell>
            <TableCell>Apellido Paterno</TableCell>
            <TableCell align="center">Intentos</TableCell>
            <TableCell align="center">Intentos Reales</TableCell>
            <TableCell>Correo</TableCell>
            <TableCell>Acción</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {usuarios.length > 0 ? (
            usuarios.map((usuario) => (
              <TableRow
                key={usuario.idUsuarios}
                sx={{
                  backgroundColor:
                    theme === "light"
                      ? usuario.bloqueado
                        ? "#ffebee" 
                        : "#e8f5e9" 
                      : usuario.bloqueado
                      ? "#3e2723" 
                      : "#1b5e20", 
                }}
              >
                <TableCell>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {usuario.Nombre}
                  </Typography>
                </TableCell>
                <TableCell>{usuario.ApellidoP}</TableCell>
                <TableCell align="center">
                  <Chip
                    label={usuario.Intentos}
                    color="warning"
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell align="center">
                  <Chip
                    label={usuario.IntentosReales}
                    color="error"
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>{usuario.Correo}</TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color={usuario.bloqueado ? "success" : "error"}
                    startIcon={usuario.bloqueado ? <LockOpen /> : <Lock />}
                    onClick={() =>
                      handleToggleBlock(usuario.idUsuarios, usuario.bloqueado)
                    }
                  >
                    {usuario.bloqueado ? "Desbloquear" : "Bloquear"}
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} align="center">
                No hay usuarios sospechosos.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default UsuariosSospechosos;
