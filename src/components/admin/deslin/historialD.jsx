// src/components/admin/deslin/HistorialDeslindeLegal.jsx

import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
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
  Tooltip,
} from '@mui/material';
import { Visibility, ArrowBack, History } from '@mui/icons-material';
import { ThemeContext } from '../../shared/layaouts/ThemeContext';
import { useNavigate } from 'react-router-dom';

const HistorialDeslindeLegal = () => {
  const [documentos, setDocumentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { theme } = useContext(ThemeContext);
  const navigate = useNavigate();

  // Estados para la paginación
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Estados para el modal
  const [openModal, setOpenModal] = useState(false);
  const [selectedDocumento, setSelectedDocumento] = useState(null);

  // API URL
  const apiUrl = 'https://alquiladora-romero-backed-1.onrender.com/api/deslin';

  useEffect(() => {
    fetchDocumentos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchDocumentos = async () => {
    try {
      const response = await axios.get(apiUrl, { withCredentials: true });
      // Parsear las secciones desde JSON string a array de objetos
      const parsedData = response.data.map((documento) => ({
        ...documento,
        secciones: documento.secciones ? JSON.parse(documento.secciones) : [],
      }));
      setDocumentos(parsedData);
      setLoading(false);
    } catch (err) {
      console.error('Error al obtener los documentos:', err);
      setError('No se pudieron cargar los documentos.');
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
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-MX', {
      timeZone: 'America/Mexico_City',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  // Datos a mostrar según la paginación
  const paginatedDocumentos = documentos.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // Funciones para manejar el modal
  const handleOpenModal = (documento) => {
    setSelectedDocumento(documento);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setSelectedDocumento(null);
    setOpenModal(false);
  };

  if (loading)
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );

  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Container
      maxWidth="lg"
      sx={{
        mt: 4,
        bgcolor: theme === 'dark' ? '#121212' : '#f9f9f9',
        p: 3,
        borderRadius: '8px',
        boxShadow: 3,
      }}
    >
      {/* Botón de Regreso */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
        <IconButton
          onClick={() => navigate('/Administrador')}
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
        sx={{ fontWeight: 'bold', color: theme === 'dark' ? '#fff' : '#333' }}
      >
        Historial de Deslinde Legal
      </Typography>

      {/* Tabla de Documentos */}
      <Paper
        sx={{
          bgcolor: theme === 'dark' ? '#1e1e1e' : '#fff',
          boxShadow: 1,
          overflowX: 'auto',
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: theme === 'dark' ? '#333' : '#0277bd' }}>
              <TableCell sx={{ color: theme === 'dark' ? '#ddd' : '#fff' }}>Título</TableCell>
              <TableCell sx={{ color: theme === 'dark' ? '#ddd' : '#fff' }}>Versión</TableCell>
              <TableCell sx={{ color: theme === 'dark' ? '#ddd' : '#fff' }}>Fecha de Vigencia</TableCell>
              <TableCell sx={{ color: theme === 'dark' ? '#ddd' : '#fff' }}>Estado</TableCell>
              <TableCell sx={{ color: theme === 'dark' ? '#ddd' : '#fff' }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedDocumentos.map((documento) => (
              <TableRow key={documento.id}>
                <TableCell>{documento.titulo}</TableCell>
                <TableCell>{documento.version}</TableCell>
                <TableCell>{formatDate(documento.fecha_vigencia)}</TableCell>
                <TableCell>
                  <Chip
                    label={documento.estado.charAt(0).toUpperCase() + documento.estado.slice(1)}
                    color={
                      documento.estado === 'vigente'
                        ? 'success'
                        : documento.estado === 'no vigente'
                        ? 'warning'
                        : documento.estado === 'eliminado'
                        ? 'error'
                        : 'default'
                    }
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <Tooltip title="Ver Detalles">
                    <IconButton
                      onClick={() => handleOpenModal(documento)}
                      color="primary"
                      aria-label={`Ver detalles del documento ${documento.titulo}`}
                    >
                      <Visibility />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {paginatedDocumentos.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No hay documentos para mostrar.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Paginación */}
        <TablePagination
          component="div"
          count={documentos.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </Paper>

      {/* Icono de Historial debajo de la tabla */}
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Tooltip title="Ver Historial de Todos los Documentos">
          <IconButton
            onClick={() => navigate('/Administrador/historialDeslindeLegal')}
            color="primary"
            aria-label="Ver historial de todos los documentos"
            size="large"
          >
            <History fontSize="large" />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Modal para Detalles del Documento */}
      <Dialog
        open={openModal}
        onClose={handleCloseModal}
        fullWidth
        maxWidth="md"
        aria-labelledby="detalles-documento-title"
      >
        <DialogTitle>Detalles del Documento</DialogTitle>
        <DialogContent dividers>
          {selectedDocumento ? (
            <Box sx={{ padding: 2 }}>
              {/* Información Básica */}
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1" color="textSecondary">
                    <strong>Título:</strong>
                  </Typography>
                  <Typography variant="body1">{selectedDocumento.titulo}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1" color="textSecondary">
                    <strong>Versión:</strong>
                  </Typography>
                  <Typography variant="body1">{selectedDocumento.version}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1" color="textSecondary">
                    <strong>Fecha de Vigencia:</strong>
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(selectedDocumento.fecha_vigencia)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1" color="textSecondary">
                    <strong>Estado:</strong>
                  </Typography>
                  <Chip
                    label={selectedDocumento.estado.charAt(0).toUpperCase() + selectedDocumento.estado.slice(1)}
                    color={
                      selectedDocumento.estado === 'vigente'
                        ? 'success'
                        : selectedDocumento.estado === 'no vigente'
                        ? 'warning'
                        : selectedDocumento.estado === 'eliminado'
                        ? 'error'
                        : 'default'
                    }
                    variant="outlined"
                  />
                </Grid>
              </Grid>

              {/* Contenido */}
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Contenido
                </Typography>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                  {selectedDocumento.contenido}
                </Typography>
              </Box>

              {/* Secciones */}
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Secciones
                </Typography>
                {selectedDocumento.secciones && selectedDocumento.secciones.length > 0 ? (
                  <List>
                    {selectedDocumento.secciones.map((seccion, index) => (
                      <ListItem
                        key={index}
                        sx={{
                          bgcolor: theme === 'dark' ? '#2e2e2e' : '#f5f5f5',
                          borderRadius: '4px',
                          mb: 1,
                        }}
                      >
                        <ListItemText
                          primary={
                            <Typography variant="subtitle1" color="textPrimary">
                              {`Sección ${index + 1}: ${seccion.titulo}`}
                            </Typography>
                          }
                          secondary={
                            <Typography variant="body2" color="textSecondary" sx={{ whiteSpace: 'pre-wrap' }}>
                              {seccion.contenido}
                            </Typography>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="textSecondary">
                    No hay secciones disponibles.
                  </Typography>
                )}
              </Box>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <CircularProgress />
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

export default HistorialDeslindeLegal;
