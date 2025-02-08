import React, { useEffect, useState, useContext, useRef } from "react";
import axios from "axios";
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  Box,
  CircularProgress,
  Alert,
  TablePagination,
  Dialog,
  Grid,
  DialogTitle,
  DialogContent,
  Chip,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { Visibility, ArrowBack } from "@mui/icons-material";
import { ThemeContext } from "../../shared/layaouts/ThemeContext";
import { Toast } from "primereact/toast";
import { useNavigate } from "react-router-dom";

const HistorialTerminos = () => {
  const [terminos, setTerminos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { theme } = useContext(ThemeContext);
  const toast = useRef(null);
  const navigate = useNavigate();

  // Estados para la paginación
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Estados para el modal
  const [openModal, setOpenModal] = useState(false);
  const [selectedTermino, setSelectedTermino] = useState(null);

  // API URL
  const apiUrl = "https://alquiladora-romero-backed-1.onrender.com/api/terminos";

  useEffect(() => {
    fetchTerminos();
  }, []);

  const fetchTerminos = async () => {
    try {
      const response = await axios.get(apiUrl, { withCredentials: true });
      setTerminos(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Error al obtener los términos:", err);
      setError("No se pudieron cargar los términos.");
      setLoading(false);
    }
  };

  // Funciones para manejar la paginación
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Función para formatear fechas
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("es-MX", {
      timeZone: "America/Mexico_City",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  // Datos a mostrar según la paginación
  const paginatedTerminos = terminos.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // Funciones para manejar el modal
  const handleOpenModal = (termino) => {
    setSelectedTermino(termino);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setSelectedTermino(null);
    setOpenModal(false);
  };

  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );

  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Container
      maxWidth="lg"
      sx={{
        mt: 4,
        bgcolor: theme === "dark" ? "#121212" : "#f9f9f9",
        p: 3,
        borderRadius: "8px",
        boxShadow: 3,
      }}
    >
      {/* Toast para notificaciones */}
      <Toast ref={toast} />

      {/* Botón de Regreso */}
      <Box sx={{ display: "flex", justifyContent: "flex-start", mb: 2 }}>
        <IconButton
          onClick={() => navigate("/Administrador")}
          color="primary"
          aria-label="Regresar a la página principal"
        >
          <ArrowBack />
        </IconButton>
      </Box>

      {/* Título */}
      <Typography
        variant="h4"
        align="center"
        gutterBottom
        sx={{ fontWeight: "bold", color: theme === "dark" ? "#fff" : "#333" }}
      >
        Historial de Términos y Condiciones
      </Typography>

      {/* Tabla de Términos */}
      <Paper
        sx={{
          bgcolor: theme === "dark" ? "#1e1e1e" : "#fff",
          boxShadow: 1,
          overflowX: "auto",
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: theme === "dark" ? "#333" : "#0277bd" }}>
              <TableCell sx={{ color: theme === "dark" ? "#ddd" : "#fff" }}>Título</TableCell>
              <TableCell sx={{ color: theme === "dark" ? "#ddd" : "#fff" }}>Versión</TableCell>
              <TableCell sx={{ color: theme === "dark" ? "#ddd" : "#fff" }}>Fecha de Vigencia</TableCell>
              <TableCell sx={{ color: theme === "dark" ? "#ddd" : "#fff" }}>Estado</TableCell>
              <TableCell sx={{ color: theme === "dark" ? "#ddd" : "#fff" }}>Creado El</TableCell>
              <TableCell sx={{ color: theme === "dark" ? "#ddd" : "#fff" }}>Actualizado El</TableCell>
              <TableCell sx={{ color: theme === "dark" ? "#ddd" : "#fff" }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedTerminos.map((termino) => (
              <TableRow key={termino.id}>
                <TableCell>{termino.titulo}</TableCell>
                <TableCell>{termino.versio}</TableCell>
                <TableCell>{formatDate(termino.fechaVigencia)}</TableCell>
                <TableCell>
                  <Chip
                    label={termino.estado.charAt(0).toUpperCase() + termino.estado.slice(1)}
                    color={
                      termino.estado === "vigente"
                        ? "success"
                        : termino.estado === "no vigente"
                        ? "warning"
                        : termino.estado === "eliminado"
                        ? "error"
                        : "default"
                    }
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>{formatDate(termino.created_at)}</TableCell>
                <TableCell>{formatDate(termino.updated_at)}</TableCell>
                <TableCell>
                  <IconButton
                    onClick={() => handleOpenModal(termino)}
                    color="primary"
                    aria-label={`Ver detalles de término ${termino.titulo}`}
                  >
                    <Visibility />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {paginatedTerminos.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No hay términos para mostrar.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Paginación */}
        <TablePagination
          component="div"
          count={terminos.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </Paper>

      {/* Modal para Detalles del Término */}
      <Dialog open={openModal} onClose={handleCloseModal} fullWidth maxWidth="md">
        <DialogTitle>Detalles del Término</DialogTitle>
        <DialogContent dividers>
          {selectedTermino && (
            <Box>
              <Typography variant="h6">Título: {selectedTermino.titulo}</Typography>
              <Typography>Versión: {selectedTermino.versio}</Typography>
              <Typography>Fecha de Vigencia: {formatDate(selectedTermino.fechaVigencia)}</Typography>
              <Typography>Estado: {selectedTermino.estado}</Typography>
              <Typography>Contenido:</Typography>
              <Typography>{selectedTermino.contenido}</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} variant="contained" color="primary">
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default HistorialTerminos;
