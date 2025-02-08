// src/components/HistorialPoliticas.jsx
import React, { useEffect, useState, useContext, useRef } from 'react';
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
} from '@mui/material';
import { Visibility, ArrowBack } from '@mui/icons-material'; 
import { ThemeContext } from '../../shared/layaouts/ThemeContext';
import { Toast } from 'primereact/toast';
import { useNavigate } from 'react-router-dom';

const HistorialPoliticas = () => {
  const [politicas, setPoliticas] = useState([]);
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
  const [selectedPolitica, setSelectedPolitica] = useState(null);

  // API URL
  const apiUrl = 'https://alquiladora-romero-backed-1.onrender.com/api/politicas';

  useEffect(() => {
    fetchPoliticas();
   
  }, []);

  const fetchPoliticas = async () => {
    try {
      const response = await axios.get(apiUrl, { withCredentials: true });
      setPoliticas(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error al obtener las políticas:', err);
      setError('No se pudieron cargar las políticas.');
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
  const paginatedPoliticas = politicas.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // Funciones para manejar el modal
  const handleOpenModal = (politica) => {
    setSelectedPolitica(politica);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setSelectedPolitica(null);
    setOpenModal(false);
  };

  // Función para ver detalles de una política (puedes implementarla según tus necesidades)
  const handleViewDetails = (id) => {
   
    toast.current.show({
      severity: 'info',
      summary: 'Detalles',
      detail: `Detalles de la política ID: ${id}`,
      life: 3000,
    });
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
      {/* Toast para notificaciones */}
      <Toast ref={toast} />

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
        Historial de Políticas de Privacidad
      </Typography>

      {/* Tabla de Políticas */}
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
              <TableCell sx={{ color: theme === 'dark' ? '#ddd' : '#fff' }}>Creado El</TableCell>
              <TableCell sx={{ color: theme === 'dark' ? '#ddd' : '#fff' }}>Actualizado El</TableCell>
              <TableCell sx={{ color: theme === 'dark' ? '#ddd' : '#fff' }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedPoliticas.map((politica) => (
              <TableRow key={politica.id}>
                <TableCell>{politica.titulo}</TableCell>
                <TableCell>{politica.versio}</TableCell>
                <TableCell>{formatDate(politica.fechaVigencia)}</TableCell>
                <TableCell>
                  <Typography
                    variant="body2"
                    sx={{
                      color:
                        politica.estado === 'vigente'
                          ? 'green'
                          : politica.estado === 'no vigente'
                          ? 'orange'
                          : politica.estado === 'eliminado'
                          ? 'red'
                          : 'grey',
                      fontWeight: 'bold',
                    }}
                  >
                    {politica.estado.charAt(0).toUpperCase() + politica.estado.slice(1)}
                  </Typography>
                </TableCell>
                <TableCell>{formatDate(politica.created_at)}</TableCell>
                <TableCell>{formatDate(politica.updated_at)}</TableCell>
                <TableCell>
                  <IconButton
                    onClick={() => handleOpenModal(politica)}
                    color="primary"
                    aria-label={`Ver detalles de la política ${politica.titulo}`}
                  >
                    <Visibility />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {paginatedPoliticas.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No hay políticas para mostrar.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Paginación */}
        <TablePagination
          component="div"
          count={politicas.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </Paper>

      {/* Modal para Detalles de la Política */}
      <Dialog
  open={openModal}
  onClose={handleCloseModal}
  fullWidth
  maxWidth="md"
  aria-labelledby="detalles-politica-title"
>
  {/* Encabezado del Modal */}
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      bgcolor: theme === 'dark' ? '#424242' : '#1976d2',
      color: '#fff',
      padding: 2,
      borderTopLeftRadius: '8px',
      borderTopRightRadius: '8px',
    }}
  >
    <Visibility sx={{ marginRight: 1 }} />
    <Typography variant="h6" id="detalles-politica-title">
      Detalles de la Política
    </Typography>
  </Box>

  {/* Contenido del Modal */}
  <DialogContent dividers>
    {selectedPolitica ? (
      <Box sx={{ padding: 2 }}>
        {/* Información Básica */}
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1" color="textSecondary">
              <strong>Título:</strong>
            </Typography>
            <Typography variant="body1">{selectedPolitica.titulo}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1" color="textSecondary">
              <strong>Versión:</strong>
            </Typography>
            <Typography variant="body1">{selectedPolitica.versio}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1" color="textSecondary">
              <strong>Fecha de Vigencia:</strong>
            </Typography>
            <Typography variant="body1">{formatDate(selectedPolitica.fechaVigencia)}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1" color="textSecondary">
              <strong>Estado:</strong>
            </Typography>
            <Chip
              label={selectedPolitica.estado.charAt(0).toUpperCase() + selectedPolitica.estado.slice(1)}
              color={
                selectedPolitica.estado === 'vigente'
                  ? 'success'
                  : selectedPolitica.estado === 'no vigente'
                  ? 'warning'
                  : selectedPolitica.estado === 'eliminado'
                  ? 'error'
                  : 'default'
              }
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1" color="textSecondary">
              <strong>Creado El:</strong>
            </Typography>
            <Typography variant="body1">{formatDate(selectedPolitica.created_at)}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1" color="textSecondary">
              <strong>Actualizado El:</strong>
            </Typography>
            <Typography variant="body1">{formatDate(selectedPolitica.updated_at)}</Typography>
          </Grid>
        </Grid>

        {/* Contenido */}
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Contenido
          </Typography>
          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
            {selectedPolitica.contenido}
          </Typography>
        </Box>

        {/* Secciones */}
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Secciones
          </Typography>
          {selectedPolitica.secciones && selectedPolitica.secciones.length > 0 ? (
            <List>
              {selectedPolitica.secciones.map((seccion, index) => (
                <ListItem key={index} sx={{ bgcolor: theme === 'dark' ? '#2e2e2e' : '#f5f5f5', borderRadius: '4px', mb: 1 }}>
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
      <Typography variant="body1">Cargando detalles...</Typography>
    )}
  </DialogContent>

  {/* Acciones del Modal */}
  <DialogActions sx={{ padding: 2 }}>
    <Button onClick={handleCloseModal} variant="contained" color="primary">
      Cerrar
    </Button>
  </DialogActions>
</Dialog>

 


    </Container>
  );
};

export default HistorialPoliticas;
