import React, { useEffect, useState, useContext } from "react";

import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Box,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
// import { ThemeContext } from "../../shared/layaouts/ThemeContext";
import InfoIcon from "@mui/icons-material/Info";
import api from "../../../utils/AxiosConfig";

const Usuarios = () => {
  // Estados para almacenar usuarios, estados de carga y errores
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Estados para el manejo del modal de detalles de sesiones
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUserSessions, setSelectedUserSessions] = useState([]);
  const [selectedUserName, setSelectedUserName] = useState("");

  // const { theme } = useContext(ThemeContext);

  // Obtener lista de usuarios al cargar el componente
  useEffect(() => {
    fetchUsuarios();
  }, []);

  // Función para obtener los usuarios desde la API
  const fetchUsuarios = async () => {
    try {
      const response = await api.get(
        "/api/usuarios/lista",
        {
          withCredentials: true,
        }
      );
      setUsuarios(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
      setError(true);
      setLoading(false);
    }
  };

  const handleOpenDialog = async (usuario) => {
    setSelectedUserName(
      `${usuario.Nombre} ${usuario.ApellidoP} ${usuario.ApellidoM}`
    );

    try {
      const response = await api.get(
        `/api/usuarios/${usuario.idUsuarios}/sesiones`,
        {
          withCredentials: true,
          timeout: 10000,
        }
      );
      setSelectedUserSessions(response.data);
    } catch (error) {
      console.error("Error al obtener detalles de sesiones:", error);
      setSelectedUserSessions([]);
    }

    // Abre el modal después de configurar el nombre y las sesiones
    setOpenDialog(true);
  };

  // Función para cerrar el modal y limpiar los estados de sesión y nombre de usuario
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUserSessions([]);
    setSelectedUserName("");
  };

  // Filtra usuarios por su rol
  const administradores = usuarios.filter(
    (usuario) => usuario.rol === "administrador"
  );
  const clientes = usuarios.filter((usuario) => usuario.rol === "cliente");

  // Muestra un indicador de carga mientras se obtienen los datos
  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Muestra un mensaje de error si no se pudieron obtener los datos
  if (error) {
    return (
      <Alert severity="error">No se pudo obtener la lista de usuarios.</Alert>
    );
  }

  return (
    <Container
      maxWidth="lg"
      sx={{
        mt: 4,
       
        p: 3,
        borderRadius: "8px",
        boxShadow: 3,
      }}
    >
      <Typography
        variant="h4"
        align="center"
        gutterBottom
       
      >
        Gestión de Usuarios
      </Typography>

      {/* Tabla de Administradores */}
      <Typography
        variant="h5"
        gutterBottom
       
      >
        Administradores
      </Typography>
      <Paper
        sx={{
         
          boxShadow: 1,
          overflowX: "auto",
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ }}>
              <TableCell sx={{ }}>
                Nombre
              </TableCell>
              <TableCell sx={{ }}>
                Veces Bloqueado
              </TableCell>
              <TableCell sx={{ }}>
                Cambios de Contraseña
              </TableCell>
              <TableCell sx={{ }}>
                Inicios de Sesión
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {administradores.map((usuario) => (
              <TableRow key={usuario.idUsuarios}>
                <TableCell>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ fontWeight: "bold" }}>{usuario.correo}</span>
                    <span>{`${usuario.nombre} ${usuario.apellidoP} ${usuario.apellidoM}`}</span>
                  </div>
                </TableCell>

                <TableCell>{usuario.veces_bloqueado}</TableCell>
                <TableCell>{usuario.cambios_contrasena}</TableCell>
                <TableCell>
                  {usuario.veces_sesion}
                  <Tooltip title="Más detalles de inicio de sesión">
                    <IconButton onClick={() => handleOpenDialog(usuario)}>
                      <InfoIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      {/* Tabla de Clientes */}
      <Typography
        variant="h5"
        gutterBottom
       
      >
        Clientes
      </Typography>
      <Paper
        sx={{
         
          boxShadow: 1,
          overflowX: "auto",
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ }}>
              <TableCell sx={{ }}>
                Nombre
              </TableCell>
              <TableCell sx={{ }}>
                Veces Bloqueado
              </TableCell>
              <TableCell sx={{ }}>
                Cambios de Contraseña
              </TableCell>
              <TableCell sx={{ }}>
                Inicios de Sesión
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {clientes.map((usuario) => (
              <TableRow key={usuario.idUsuarios}>
               <TableCell>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ fontWeight: "bold" }}>{usuario.Correo}</span>
                    <span>{`${usuario.nombre} ${usuario.apellidoP} ${usuario.apellidoM}`}</span>
                  </div>
                </TableCell>
                <TableCell>{usuario.veces_bloqueado}</TableCell>
                <TableCell>{usuario.cambios_contrasena}</TableCell>
                <TableCell>
                  {usuario.veces_sesion}
                  <Tooltip title="Más detalles de inicio de sesión">
                    <IconButton onClick={() => handleOpenDialog(usuario)}>
                      <InfoIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      {/* Diálogo de Detalles de Sesiones */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Detalles de Sesiones de {selectedUserName}</DialogTitle>
        <DialogContent>
          {selectedUserSessions.length > 0 ? (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Inicio de Sesión</TableCell>
                  <TableCell>Fin de Sesión</TableCell>
                  <TableCell>Dirección IP</TableCell>
                  <TableCell>Dispositivo</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {selectedUserSessions.map((sesion) => (
                  <TableRow key={sesion.id}>
                    <TableCell>
                      {sesion.horaInicio
                        ? new Date(sesion.horaInicio).toLocaleString()
                        : "N/A"}
                    </TableCell>
                    <TableCell>
                      {sesion.horaFin
                        ? new Date(sesion.horaFin).toLocaleString()
                        : "Sesión Activa"}
                    </TableCell>
                    <TableCell>{sesion.direccionIP || "N/A"}</TableCell>
                    <TableCell>{sesion.tipoDispositivo || "N/A"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Typography>No hay sesiones disponibles.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Usuarios;
