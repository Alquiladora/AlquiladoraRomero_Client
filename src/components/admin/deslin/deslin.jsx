// src/components/admin/deslin/DeslindeLegal.jsx

import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { useFormik, FieldArray, FormikProvider } from 'formik';
import * as yup from 'yup';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import {
  Container,
  TextField,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Box,
  Grid,
  CircularProgress,
  Alert,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  List,
  ListItem,
  ListItemText,
  Tooltip,
} from '@mui/material';
import { Add, Delete, Edit, History } from '@mui/icons-material';
import { ThemeContext } from '../../shared/layaouts/ThemeContext';
import { useNavigate } from 'react-router-dom'; 

const MySwal = withReactContent(Swal);

// Función para obtener la fecha actual en México
const getMexicoDate = () => {
  const options = {
    timeZone: 'America/Mexico_City',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  };
  const formatter = new Intl.DateTimeFormat([], options);
  const parts = formatter.formatToParts(new Date());
  const dateParts = {};
  parts.forEach(({ type, value }) => {
    dateParts[type] = value;
  });
  return `${dateParts.year}-${dateParts.month}-${dateParts.day}`;
};

// Validaciones con Yup
const validationSchema = yup.object().shape({
  titulo: yup.string().required('El título es obligatorio').max(255, 'Máximo 255 caracteres'),
  contenido: yup.string().required('El contenido es obligatorio'),
  fechaVigencia: yup
    .date()
    .required('La fecha de vigencia es obligatoria')
    .min(new Date(getMexicoDate()), 'La fecha de vigencia no puede ser pasada'),
  secciones: yup
    .array()
    .of(
      yup.object().shape({
        titulo: yup.string().required('El título de la sección es obligatorio'),
        contenido: yup.string().required('El contenido de la sección es obligatorio'),
      })
    )
    .min(1, 'Debe haber al menos una sección'),
});

const DeslindeLegal = () => {
  const [documentos, setDocumentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [csrfToken, setCsrfToken] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [currentVersion, setCurrentVersion] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const { theme } = useContext(ThemeContext);
  const navigate = useNavigate(); 

  const apiUrl = 'https://alquiladora-romero-backed-1.onrender.com/api/deslin';

  useEffect(() => {
    fetchCsrfToken();
    fetchDocumentos();
   
  }, []);

  // Función para obtener el token CSRF
  const fetchCsrfToken = async () => {
    try {
      const response = await axios.get('https://alquiladora-romero-backed-1.onrender.com/api/get-csrf-token', {
        withCredentials: true,
      });
      setCsrfToken(response.data.csrfToken);
    } catch (error) {
      console.error('Error al obtener el token CSRF:', error);
      MySwal.fire({
        title: 'Error',
        text: 'Error al obtener el token CSRF.',
        icon: 'error',
        confirmButtonText: 'Aceptar',
      });
    }
  };

  // Función para obtener y procesar los documentos
  const fetchDocumentos = async () => {
    try {
      const response = await axios.get(apiUrl, { withCredentials: true });

      const parsedData = response.data.map((documento) => {
        const originalDate = documento.fechaVigencia
          ? new Date(documento.fechaVigencia)
          : new Date(getMexicoDate());

        // Sumar un día a la fecha original
        originalDate.setDate(originalDate.getDate() + 1);

        return {
          ...documento,
          fechaVigencia: originalDate.toISOString().split('T')[0],
          secciones:
            typeof documento.secciones === 'string'
              ? JSON.parse(documento.secciones)
              : documento.secciones || [],
        };
      });

      setDocumentos(parsedData);
      setLoading(false);
    } catch (error) {
      console.error('Error al obtener documentos:', error);
      setError('No se pudieron cargar los documentos.');
      setLoading(false);
    }
  };

  // Configuración de Formik
  const formik = useFormik({
    initialValues: {
      titulo: '',
      contenido: '',
      fechaVigencia: getMexicoDate(),
      secciones: [{ titulo: '', contenido: '' }],
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      if (editMode) {
        await createNewVersion(currentVersion.id, values);
      } else {
        await createDocumento(values);
      }
      resetForm();
      setEditMode(false);
      setCurrentVersion(null);
      fetchDocumentos();
      setPage(0);
    },
  });

  const { values, errors, touched, handleChange, handleSubmit, handleReset, setFieldValue, setFieldTouched } = formik;

  // Función para crear un nuevo documento
  const createDocumento = async (data) => {
    try {
      await axios.post(apiUrl, data, {
        headers: { 'X-CSRF-Token': csrfToken },
        withCredentials: true,
      });
      Swal.fire('Éxito', 'Se creó el documento correctamente', 'success');
    } catch (error) {
      Swal.fire('Error', 'No se pudo crear el documento', 'error');
    }
  };

  // Función para crear una nueva versión de un documento
  const createNewVersion = async (id, data) => {
    try {
      await axios.post(`${apiUrl}/${id}/nueva-version`, data, {
        headers: { 'X-CSRF-Token': csrfToken },
        withCredentials: true,
      });
      Swal.fire('Éxito', 'Se creó una nueva versión del documento', 'success');
    } catch (error) {
      Swal.fire('Error', 'No se pudo crear la nueva versión', 'error');
    }
  };

  // Función para eliminar un documento
  const deleteDocumento = async (id) => {
    const confirm = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción marcará el documento como eliminado.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#4caf50',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });
    if (confirm.isConfirmed) {
      try {
        await axios.delete(`${apiUrl}/${id}`, {
          headers: { 'X-CSRF-Token': csrfToken },
          withCredentials: true,
        });
        Swal.fire('Eliminado', 'Documento eliminado correctamente', 'success');
        fetchDocumentos();
      } catch (error) {
        Swal.fire('Error', 'No se pudo eliminar el documento', 'error');
      }
    }
  };

  // Función para editar un documento
  const editDocumento = (documento) => {
    setCurrentVersion(documento);
    setFieldValue('titulo', documento.titulo);
    setFieldValue('contenido', documento.contenido);
    setFieldValue('fechaVigencia', documento.fechaVigencia ? documento.fechaVigencia.substring(0, 10) : '');
    setFieldValue('secciones', documento.secciones || [{ titulo: '', contenido: '' }]);
    setEditMode(true);
  };

  // Función para manejar el envío del formulario y marcar "secciones" como tocado si está vacío
  const handleSubmitWrapper = (e) => {
    if (values.secciones.length === 0) {
      setFieldTouched('secciones', true);
    }
    handleSubmit(e);
  };

  // Funciones para manejar la paginación
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (loading)
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );

  if (error) return <Alert severity="error">{error}</Alert>;

  // Datos a mostrar en la tabla según la paginación
  const paginatedDocumentos = documentos.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Container
      maxWidth="md"
      sx={{
        mt: 4,
        bgcolor: theme === 'dark' ? '#121212' : '#f9f9f9',
        p: 3,
        borderRadius: '8px',
        boxShadow: 3,
      }}
    >
      {/* Título */}
      <Typography
        variant="h4"
        align="center"
        gutterBottom
        sx={{ fontWeight: 'bold', color: theme === 'dark' ? '#fff' : '#333' }}
      >
        Gestión de Deslinde Legal
      </Typography>

      {/* Formulario */}
      <FormikProvider value={formik}>
        <form onSubmit={handleSubmitWrapper}>
          {/* Resumen de errores */}
          {Object.keys(errors).length > 0 && Object.keys(touched).length > 0 && (
            <Alert severity="error" sx={{ mb: 2 }}>
              <Typography variant="subtitle1">Por favor corrige los siguientes errores:</Typography>
              <ul>
                {Object.entries(errors).map(([key, value]) => {
                  if (typeof value === 'string') {
                    return <li key={key}>{value}</li>;
                  } else if (Array.isArray(value)) {
                    return value
                      .map((err, index) => {
                        const erroresSeccion = Object.values(err).filter(Boolean);
                        return erroresSeccion.map((mensajeError, idx) => (
                          <li key={`${key}-${index}-${idx}`}>{`Sección ${index + 1}: ${mensajeError}`}</li>
                        ));
                      })
                      .flat();
                  }
                  return null;
                })}
              </ul>
            </Alert>
          )}

          {/* Campo Título */}
          <TextField
            fullWidth
            label="Título"
            name="titulo"
            value={values.titulo}
            onChange={handleChange}
            error={touched.titulo && Boolean(errors.titulo)}
            helperText={touched.titulo && errors.titulo}
            margin="normal"
            variant="outlined"
            sx={{
              bgcolor: theme === 'dark' ? '#1e1e1e' : '#fff',
            }}
          />

          {/* Campo Contenido */}
          <TextField
            fullWidth
            label="Contenido"
            name="contenido"
            value={values.contenido}
            onChange={handleChange}
            error={touched.contenido && Boolean(errors.contenido)}
            helperText={touched.contenido && errors.contenido}
            margin="normal"
            multiline
            rows={4}
            variant="outlined"
            sx={{
              bgcolor: theme === 'dark' ? '#1e1e1e' : '#fff',
            }}
          />

          {/* Campo Fecha de Vigencia */}
          <TextField
            fullWidth
            label="Fecha de Vigencia"
            name="fechaVigencia"
            type="date"
            value={values.fechaVigencia}
            onChange={handleChange}
            error={touched.fechaVigencia && Boolean(errors.fechaVigencia)}
            helperText={touched.fechaVigencia && errors.fechaVigencia}
            margin="normal"
            InputLabelProps={{ shrink: true }}
            inputProps={{
              min: getMexicoDate(), // Restringir fechas pasadas
            }}
            variant="outlined"
            sx={{
              bgcolor: theme === 'dark' ? '#1e1e1e' : '#fff',
            }}
          />

          {/* Mostrar error si no hay al menos una sección */}
          {touched.secciones && errors.secciones && typeof errors.secciones === 'string' && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errors.secciones}
            </Alert>
          )}

          {/* Campo Dinámico Secciones */}
          <FieldArray name="secciones">
            {({ push, remove }) => (
              <Box>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ mt: 2, color: theme === 'dark' ? '#ccc' : '#666' }}
                >
                  Secciones
                </Typography>
                {Array.isArray(values.secciones) &&
                  values.secciones.map((section, index) => (
                    <Paper
                      key={index}
                      sx={{
                        p: 2,
                        mb: 2,
                        bgcolor: theme === 'dark' ? '#333' : '#fff',
                        boxShadow: 1,
                      }}
                    >
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={11}>
                          {/* Título de la Sección */}
                          <TextField
                            fullWidth
                            label={`Título de la Sección ${index + 1}`}
                            name={`secciones[${index}].titulo`}
                            value={section.titulo}
                            onChange={handleChange}
                            error={
                              touched.secciones?.[index]?.titulo &&
                              Boolean(errors.secciones?.[index]?.titulo)
                            }
                            helperText={
                              touched.secciones?.[index]?.titulo &&
                              errors.secciones?.[index]?.titulo
                            }
                            margin="normal"
                            variant="outlined"
                            sx={{
                              bgcolor: theme === 'dark' ? '#2e2e2e' : '#fafafa',
                            }}
                          />

                          {/* Contenido de la Sección */}
                          <TextField
                            fullWidth
                            label={`Contenido de la Sección ${index + 1}`}
                            name={`secciones[${index}].contenido`}
                            value={section.contenido}
                            onChange={handleChange}
                            error={
                              touched.secciones?.[index]?.contenido &&
                              Boolean(errors.secciones?.[index]?.contenido)
                            }
                            helperText={
                              touched.secciones?.[index]?.contenido &&
                              errors.secciones?.[index]?.contenido
                            }
                            margin="normal"
                            multiline
                            rows={3}
                            variant="outlined"
                            sx={{
                              bgcolor: theme === 'dark' ? '#2e2e2e' : '#fafafa',
                            }}
                          />
                        </Grid>
                        <Grid item xs={1}>
                          {/* Botón para eliminar sección */}
                          <IconButton
                            color="error"
                            onClick={() => remove(index)}
                            aria-label={`Eliminar sección ${index + 1}`}
                          >
                            <Delete />
                          </IconButton>
                        </Grid>
                      </Grid>
                    </Paper>
                  ))}

                {/* Botón para agregar nueva sección */}
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<Add />}
                  onClick={() => push({ titulo: '', contenido: '' })}
                  sx={{ mt: 2 }}
                >
                  Agregar Sección
                </Button>
              </Box>
            )}
          </FieldArray>

          {/* Botones de envío */}
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            {editMode && (
              <Button
                type="button"
                variant="outlined"
                color="inherit"
                onClick={() => {
                  handleReset();
                  setEditMode(false);
                  setCurrentVersion(null);
                }}
              >
                Cancelar
              </Button>
            )}
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={formik.isSubmitting}
              sx={{
                bgcolor: theme === 'dark' ? '#1976d2' : '#1976d2',
                '&:hover': {
                  bgcolor: theme === 'dark' ? '#1565c0' : '#1565c0',
                },
              }}
            >
              {formik.isSubmitting ? (
                <CircularProgress size={24} color="inherit" />
              ) : editMode ? (
                'Crear Nueva Versión'
              ) : (
                'Agregar Documento'
              )}
            </Button>
          </Box>
        </form>
      </FormikProvider>

      {/* Tabla de Documentos */}
      <Typography
        variant="h5"
        gutterBottom
        sx={{ mt: 5, color: theme === 'dark' ? '#ddd' : '#333' }}
      >
        Lista de Documentos
      </Typography>
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
              <TableCell sx={{ color: theme === 'dark' ? '#ddd' : '#fff' }}><strong>Título</strong></TableCell>
              <TableCell sx={{ color: theme === 'dark' ? '#ddd' : '#fff' }}><strong>Versión</strong></TableCell>
              <TableCell sx={{ color: theme === 'dark' ? '#ddd' : '#fff' }}><strong>Fecha de Vigencia</strong></TableCell>
              <TableCell sx={{ color: theme === 'dark' ? '#ddd' : '#fff' }}><strong>Estado</strong></TableCell>
              <TableCell sx={{ color: theme === 'dark' ? '#ddd' : '#fff' }}><strong>Acciones</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedDocumentos.map((documento) => (
              <TableRow key={documento.id}>
                <TableCell>{documento.titulo}</TableCell>
                <TableCell>{documento.version}</TableCell>
                <TableCell>
                  {new Date(documento.fechaVigencia).toLocaleDateString('es-MX', {
                    timeZone: 'America/Mexico_City',
                  })}
                </TableCell>
                <TableCell>
                  <Typography
                    variant="body2"
                    sx={{
                      color:
                        documento.estado === 'vigente'
                          ? 'green'
                          : documento.estado === 'no vigente'
                          ? 'orange'
                          : documento.estado === 'eliminado'
                          ? 'red'
                          : 'grey',
                      fontWeight: 'bold',
                    }}
                  >
                    {documento.estado.charAt(0).toUpperCase() + documento.estado.slice(1)}
                  </Typography>
                </TableCell>
                <TableCell>
                  {/* Solo mostrar Editar y Eliminar si el estado no es 'eliminado' */}
                  {documento.estado !== 'eliminado' && (
                    <>
                      <Tooltip title="Editar Documento">
                        <IconButton
                          color="warning"
                          onClick={() => editDocumento(documento)}
                          aria-label={`Editar documento ${documento.titulo}`}
                        >
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Eliminar Documento">
                        <IconButton
                          color="error"
                          onClick={() => deleteDocumento(documento.id)}
                          aria-label={`Eliminar documento ${documento.titulo}`}
                        >
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </>
                  )}
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
        open={editMode}
        onClose={() => {
          handleReset();
          setEditMode(false);
          setCurrentVersion(null);
        }}
        fullWidth
        maxWidth="md"
        aria-labelledby="detalles-documento-title"
      >
        <DialogTitle>Detalles del Documento</DialogTitle>
        <DialogContent dividers>
          {currentVersion ? (
            <Box sx={{ padding: 2 }}>
              {/* Información Básica */}
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1" color="textSecondary">
                    <strong>Título:</strong>
                  </Typography>
                  <Typography variant="body1">{currentVersion.titulo}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1" color="textSecondary">
                    <strong>Versión:</strong>
                  </Typography>
                  <Typography variant="body1">{currentVersion.version}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1" color="textSecondary">
                    <strong>Fecha de Vigencia:</strong>
                  </Typography>
                  <Typography variant="body1">
                    {new Date(currentVersion.fechaVigencia).toLocaleDateString('es-MX', {
                      timeZone: 'America/Mexico_City',
                    })}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1" color="textSecondary">
                    <strong>Estado:</strong>
                  </Typography>
                  <Chip
                    label={currentVersion.estado.charAt(0).toUpperCase() + currentVersion.estado.slice(1)}
                    color={
                      currentVersion.estado === 'vigente'
                        ? 'success'
                        : currentVersion.estado === 'no vigente'
                        ? 'warning'
                        : currentVersion.estado === 'eliminado'
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
                  {currentVersion.contenido}
                </Typography>
              </Box>

              {/* Secciones */}
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Secciones
                </Typography>
                {currentVersion.secciones && currentVersion.secciones.length > 0 ? (
                  <List>
                    {currentVersion.secciones.map((seccion, index) => (
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
            <Typography variant="body1">Cargando detalles...</Typography>
          )}
        </DialogContent>

        {/* Acciones del Modal */}
        <DialogActions>
          <Button
            onClick={() => {
              handleReset();
              setEditMode(false);
              setCurrentVersion(null);
            }}
            variant="contained"
            color="primary"
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default DeslindeLegal;
