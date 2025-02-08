
import React, { useEffect, useState, useContext, useRef } from 'react';
import axios from 'axios';
import { useFormik, FieldArray, FormikProvider } from 'formik';
import * as yup from 'yup';
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
  Snackbar,
  TablePagination, 
} from '@mui/material';
import { Add, Delete, Edit, History } from '@mui/icons-material'; 
import { ThemeContext } from '../../shared/layaouts/ThemeContext';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { useNavigate } from 'react-router-dom'; 

// Función para obtener la fecha actual en la zona horaria de México
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
  titulo: yup
    .string()
    .required('El título es obligatorio')
    .max(50, 'Máximo 50 caracteres'),
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

const Politicas = () => {
  const [politicas, setPoliticas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [csrfToken, setCsrfToken] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [currentVersion, setCurrentVersion] = useState(null);
  const { theme } = useContext(ThemeContext);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const toast = useRef(null);
  const navigate = useNavigate(); 

  // Estados para la paginación
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5); 

  const apiUrl = 'https://alquiladora-romero-backed-1.onrender.com/api/politicas';

  useEffect(() => {
    fetchCsrfToken();
    fetchPoliticas();
  }, []);

  // Función para cerrar el Snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const fetchCsrfToken = async () => {
    try {
      const response = await axios.get('https://alquiladora-romero-backed-1.onrender.com/api/get-csrf-token', {
        withCredentials: true,
      });
      setCsrfToken(response.data.csrfToken);
    } catch (error) {
      console.error('Error al obtener el token CSRF', error);
      toast.current.show({ severity: 'error', summary: 'Error', detail: 'Error al obtener el token CSRF', life: 3000 });
    }
  };

  const extractValue = (versioField) => {
    if (typeof versioField === 'object' && versioField !== null) {
      return versioField.data || versioField.value || '';
    }
    return versioField;
  };

  const fetchPoliticas = async () => {
    try {
      const response = await axios.get(apiUrl, { withCredentials: true });
  
      const parsedData = response.data.map((politica) => {
        const originalDate = politica.fechaVigencia
          ? new Date(politica.fechaVigencia)
          : new Date(getMexicoDate());
  
        // Sumar un día a la fecha original
        originalDate.setDate(originalDate.getDate() + 1);
  
        return {
          ...politica,
          versio: extractValue(politica.versio),
          fechaVigencia: originalDate.toISOString().split("T")[0],
          secciones:
            typeof politica.secciones === "string"
              ? JSON.parse(politica.secciones)
              : politica.secciones || [],
        };
      });
  
      setPoliticas(parsedData);
      setLoading(false);
    } catch (error) {
      console.error("Error al obtener políticas:", error);
      setError("No se pudieron cargar las políticas");
      setLoading(false);
    }
  };
  


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
        await createPolitica(values);
      }
      resetForm();
      setEditMode(false);
      setCurrentVersion(null);
      fetchPoliticas();
      // Reiniciar la paginación después de agregar/editar
      setPage(0);
    },
  });

  const { values, errors, touched, handleChange, handleSubmit, handleReset, setFieldValue, setFieldTouched } = formik;

  // Función para manejar el cambio de página
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Función para manejar el cambio de filas por página
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const createPolitica = async (data) => {
    try {
      await axios.post(apiUrl, data, {
        headers: { 'X-CSRF-Token': csrfToken },
        withCredentials: true,
      });
      toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Se creó la política correctamente', life: 3000 });
    } catch (error) {
      console.log('Error al crear la política:', error);
      toast.current.show({ severity: 'error', summary: 'Error', detail: 'No se pudo crear la política', life: 3000 });
    }
  };

  const createNewVersion = async (id, data) => {
    try {
      await axios.post(`${apiUrl}/${id}/nueva-version`, data, {
        headers: { 'X-CSRF-Token': csrfToken },
        withCredentials: true,
      });
      toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Se creó una nueva versión de la política', life: 3000 });
    } catch (error) {
      console.error('Error al crear nueva versión:', error);
      toast.current.show({ severity: 'error', summary: 'Error', detail: 'No se pudo crear la nueva versión', life: 3000 });
    }
  };

  const deletePolitica = async (id) => {
    confirmDialog({
      message: 'Esta acción marcará la política como eliminada.',
      header: 'Confirmación de Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      acceptClassName: 'p-button-danger',
      accept: async () => {
        try {
          await axios.delete(`${apiUrl}/${id}`, {
            headers: { 'X-CSRF-Token': csrfToken },
            withCredentials: true,
          });
          toast.current.show({ severity: 'success', summary: 'Eliminado', detail: 'Política eliminada correctamente', life: 3000 });
          fetchPoliticas();
        } catch (error) {
          console.error('Error al eliminar política:', error);
          toast.current.show({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar la política', life: 3000 });
        }
      },
    });
  };

  const editPolitica = (politica) => {
    setCurrentVersion(politica);
    setFieldValue('titulo', politica.titulo);
    setFieldValue('contenido', politica.contenido);
    setFieldValue('fechaVigencia', politica.fechaVigencia ? politica.fechaVigencia.substring(0, 10) : '');
    setFieldValue('secciones', politica.secciones || [{ titulo: '', contenido: '' }]);
    setEditMode(true);
  };

  // Función para manejar el envío del formulario y marcar "secciones" como tocado si está vacío
  const handleSubmitWrapper = (e) => {
    if (values.secciones.length === 0) {
      setFieldTouched('secciones', true);
    }
    handleSubmit(e);
  };

  if (loading)
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  if (error) return <Alert severity="error">{error}</Alert>;

  // Datos a mostrar en la tabla según la paginación
  const paginatedPoliticas = politicas.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

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
      {/* Toast y ConfirmDialog */}
      <Toast ref={toast} />
      <ConfirmDialog />

      {/* Título */}
      <Typography
        variant="h4"
        align="center"
        gutterBottom
        sx={{ fontWeight: 'bold', color: theme === 'dark' ? '#fff' : '#333' }}
      >
        Gestión de Políticas de Privacidad
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
            inputProps={{ min: getMexicoDate() }}
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
                'Agregar Política'
              )}
            </Button>
          </Box>
        </form>
      </FormikProvider>

      {/* Tabla de Políticas */}
      <Typography
        variant="h5"
        gutterBottom
        sx={{ mt: 5, color: theme === 'dark' ? '#ddd' : '#333' }}
      >
        Lista de Políticas de Privacidad
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
              <TableCell sx={{ color: theme === 'dark' ? '#ddd' : '#fff' }}>Título</TableCell>
              <TableCell sx={{ color: theme === 'dark' ? '#ddd' : '#fff' }}>Versión</TableCell>
              <TableCell sx={{ color: theme === 'dark' ? '#ddd' : '#fff' }}>Fecha de Vigencia</TableCell>
              <TableCell sx={{ color: theme === 'dark' ? '#ddd' : '#fff' }}>Estado</TableCell>
              <TableCell sx={{ color: theme === 'dark' ? '#ddd' : '#fff' }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedPoliticas.map((politica) => (
              <TableRow key={politica.id}>
                <TableCell>{politica.titulo}</TableCell>
                <TableCell>{politica.versio}</TableCell>
                <TableCell>
                  {new Date(politica.fechaVigencia).toLocaleDateString('es-MX', {
                    timeZone: 'America/Mexico_City',
                  })}

                </TableCell>

                <TableCell>

                  <Typography
                    variant="body2"
                    sx={{
                      color:
                        politica.estado === 'vigente'
                          ? 'green'
                          : politica.estado === 'no vigente'
                          ? 'orange'
                          : 'red',
                      fontWeight: 'bold',
                    }}
                  >
                    {politica.estado.charAt(0).toUpperCase() + politica.estado.slice(1)}
                  </Typography>

                </TableCell>

                <TableCell>
                  {politica.estado !== 'eliminado' && (
                    <>
                      <IconButton
                        onClick={() => editPolitica(politica)}
                        color="warning"
                        aria-label={`Editar política ${politica.titulo}`}
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        onClick={() => deletePolitica(politica.id)}
                        color="error"
                        aria-label={`Eliminar política ${politica.titulo}`}
                      >
                        <Delete />
                      </IconButton>
                    </>
                  )}
                </TableCell>
                
              </TableRow>
            ))}
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

      {/* Botón "Ver Historial" */}
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="outlined"
          color="primary"
          startIcon={<History />}
          onClick={() => navigate('/Administrador/historialPoliticas')}
        >
          Ver Historial
        </Button>
      </Box>
    </Container>
  );
};

export default Politicas;
