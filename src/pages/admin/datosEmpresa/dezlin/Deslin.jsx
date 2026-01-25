import React, { useEffect, useState } from 'react';
import { useFormik, FieldArray, FormikProvider } from 'formik';
import * as yup from 'yup';

import {
  Box,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Pagination,
  Grid,
  Divider,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Stack,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  History as HistoryIcon,
  MoreVert as MoreVertIcon,
  Visibility as ViewIcon,
  Cancel as CancelIcon,
  Save as SaveIcon,
  Article as DocumentIcon,
} from '@mui/icons-material';
import api from '../../../../utils/AxiosConfig';
import { useAuth } from '../../../../hooks/ContextAuth';
import { toast } from 'react-toastify';

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

const validationSchema = yup.object().shape({
  titulo: yup
    .string()
    .required('El título es obligatorio')
    .max(255, 'Máximo 255 caracteres'),
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
        contenido: yup
          .string()
          .required('El contenido de la sección es obligatorio'),
      })
    )
    .min(1, 'Debe haber al menos una sección'),
});

const DeslindeLegal = ({ onNavigate }) => {
  const [documentos, setDocumentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [currentVersion, setCurrentVersion] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(5);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const { csrfToken } = useAuth();

  useEffect(() => {
    fetchDocumentos();
  }, []);

  // Función para obtener y procesar los documentos
  const fetchDocumentos = async () => {
    try {
      const response = await api.get('/api/deslin', { withCredentials: true });

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

  const {
    values,
    errors,
    touched,
    handleChange,
    handleSubmit,
    handleReset,
    setFieldValue,
    setFieldTouched,
    isSubmitting,
  } = formik;

  // Función para crear un nuevo documento
  const createDocumento = async (data) => {
    try {
      await api.post('/api/deslin', data, {
        headers: { 'X-CSRF-Token': csrfToken },
        withCredentials: true,
      });
      toast.success('Se creó el documento correctamente');
    } catch (error) {
      toast.error('No se pudo crear el documento');
    }
  };

  // Función para crear una nueva versión de un documento
  const createNewVersion = async (id, data) => {
    try {
      await api.post(`/api/deslin/${id}/nueva-version`, data, {
        headers: { 'X-CSRF-Token': csrfToken },
        withCredentials: true,
      });
      toast.success('Se creó una nueva versión del documento');
    } catch (error) {
      toast.error('No se pudo crear la nueva versión');
    }
  };

  // Función para eliminar un documento
  const deleteDeslinde = async (id) => {
    try {
      await api.delete(`/api/deslin/${id}`, {
        headers: { 'X-CSRF-Token': csrfToken },
        withCredentials: true,
      });
      toast.success('Deslinde eliminado correctamente');
      fetchDocumentos();
      setDeleteDialogOpen(false);
      setDocumentToDelete(null);
    } catch (error) {
      console.error('Error al eliminar el deslinde:', error);
      toast.error('No se pudo eliminar el deslinde');
    }
  };

  // Función para editar un documento
  const editDeslinde = (documento) => {
    setCurrentVersion(documento);
    setFieldValue('titulo', documento.titulo);
    setFieldValue('contenido', documento.contenido);
    setFieldValue(
      'fechaVigencia',
      documento.fechaVigencia ? documento.fechaVigencia.substring(0, 10) : ''
    );
    setFieldValue(
      'secciones',
      documento.secciones || [{ titulo: '', contenido: '' }]
    );
    setEditMode(true);
    setMenuAnchorEl(null);
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

  // Funciones para el menú de acciones
  const handleMenuOpen = (event, documento) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedDocument(documento);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedDocument(null);
  };

  const handleDeleteClick = (documento) => {
    setDocumentToDelete(documento);
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const getStatusColor = (estado) => {
    switch (estado) {
      case 'vigente':
        return 'success';
      case 'no vigente':
        return 'warning';
      case 'eliminado':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = (estado) => {
    switch (estado) {
      case 'vigente':
        return 'Vigente';
      case 'no vigente':
        return 'No Vigente';
      case 'eliminado':
        return 'Eliminado';
      default:
        return estado;
    }
  };

  if (loading)
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );

  if (error) return <Alert severity="error">{error}</Alert>;

  // Datos a mostrar en la tabla según la paginación
  const paginatedDeslindes = documentos.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3, mt: 2 }}>
      {/* Header */}
      <Card sx={{ mb: 4, bgcolor: 'background.paper' }}>
        <CardContent>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2,
            }}
          >
            <Typography
              variant="h4"
              component="h1"
              fontWeight="bold"
              color="primary"
            >
              Gestión de Deslinde Legal
            </Typography>
            <Button
              variant="outlined"
              startIcon={<HistoryIcon />}
              onClick={() => onNavigate('historialDeslinde')}
            >
              Ver Historial
            </Button>
          </Box>
          <Typography variant="body1" color="text.secondary">
            Administre los documentos de deslinde de responsabilidad legal
          </Typography>
        </CardContent>
      </Card>

      <Grid container spacing={4}>
        {/* Formulario */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <DocumentIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h5" component="h2" fontWeight="bold">
                  {editMode ? 'Editar Documento' : 'Nuevo Documento'}
                </Typography>
              </Box>

              <FormikProvider value={formik}>
                <form onSubmit={handleSubmitWrapper}>
                  <Stack spacing={3}>
                    {/* Mensajes de error */}
                    {Object.keys(errors).length > 0 &&
                      Object.keys(touched).length > 0 && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" gutterBottom>
                            Por favor corrige los siguientes errores:
                          </Typography>
                          <Box component="ul" sx={{ pl: 2, mb: 0 }}>
                            {Object.entries(errors).map(([key, value]) => {
                              if (typeof value === 'string') {
                                return (
                                  <Typography
                                    component="li"
                                    variant="body2"
                                    key={key}
                                  >
                                    {value}
                                  </Typography>
                                );
                              } else if (Array.isArray(value)) {
                                return value
                                  .map((err, index) => {
                                    const erroresSeccion =
                                      Object.values(err).filter(Boolean);
                                    return erroresSeccion.map(
                                      (mensajeError, idx) => (
                                        <Typography
                                          component="li"
                                          variant="body2"
                                          key={`${key}-${index}-${idx}`}
                                        >
                                          {`Sección ${index + 1}: ${mensajeError}`}
                                        </Typography>
                                      )
                                    );
                                  })
                                  .flat();
                              }
                              return null;
                            })}
                          </Box>
                        </Alert>
                      )}

                    {/* Campo Título */}
                    <TextField
                      label="Título"
                      name="titulo"
                      value={values.titulo}
                      onChange={handleChange}
                      error={touched.titulo && Boolean(errors.titulo)}
                      helperText={touched.titulo && errors.titulo}
                      fullWidth
                      variant="outlined"
                    />

                    {/* Campo Contenido */}
                    <TextField
                      label="Contenido"
                      name="contenido"
                      value={values.contenido}
                      onChange={handleChange}
                      error={touched.contenido && Boolean(errors.contenido)}
                      helperText={touched.contenido && errors.contenido}
                      fullWidth
                      multiline
                      rows={4}
                      variant="outlined"
                    />

                    {/* Fecha de Vigencia */}
                    <TextField
                      label="Fecha de Vigencia"
                      name="fechaVigencia"
                      type="date"
                      value={values.fechaVigencia}
                      onChange={handleChange}
                      error={
                        touched.fechaVigencia && Boolean(errors.fechaVigencia)
                      }
                      helperText={touched.fechaVigencia && errors.fechaVigencia}
                      fullWidth
                      variant="outlined"
                      InputLabelProps={{ shrink: true }}
                      inputProps={{ min: getMexicoDate() }}
                    />

                    {/* Secciones */}
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        Secciones
                      </Typography>

                      {touched.secciones &&
                        errors.secciones &&
                        typeof errors.secciones === 'string' && (
                          <Alert severity="error" sx={{ mb: 2 }}>
                            {errors.secciones}
                          </Alert>
                        )}

                      <FieldArray name="secciones">
                        {({ push, remove }) => (
                          <Box>
                            {Array.isArray(values.secciones) &&
                              values.secciones.map((section, index) => (
                                <Card
                                  key={index}
                                  variant="outlined"
                                  sx={{ mb: 2 }}
                                >
                                  <CardContent>
                                    <Box
                                      sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        mb: 2,
                                      }}
                                    >
                                      <Typography
                                        variant="subtitle1"
                                        fontWeight="bold"
                                      >
                                        Sección {index + 1}
                                      </Typography>
                                      <IconButton
                                        onClick={() => remove(index)}
                                        color="error"
                                        size="small"
                                      >
                                        <DeleteIcon />
                                      </IconButton>
                                    </Box>

                                    <TextField
                                      label="Título de la Sección"
                                      name={`secciones[${index}].titulo`}
                                      value={section.titulo}
                                      onChange={handleChange}
                                      error={
                                        touched.secciones?.[index]?.titulo &&
                                        Boolean(
                                          errors.secciones?.[index]?.titulo
                                        )
                                      }
                                      helperText={
                                        touched.secciones?.[index]?.titulo &&
                                        errors.secciones?.[index]?.titulo
                                      }
                                      fullWidth
                                      sx={{ mb: 2 }}
                                      variant="outlined"
                                    />

                                    <TextField
                                      label="Contenido de la Sección"
                                      name={`secciones[${index}].contenido`}
                                      value={section.contenido}
                                      onChange={handleChange}
                                      error={
                                        touched.secciones?.[index]?.contenido &&
                                        Boolean(
                                          errors.secciones?.[index]?.contenido
                                        )
                                      }
                                      helperText={
                                        touched.secciones?.[index]?.contenido &&
                                        errors.secciones?.[index]?.contenido
                                      }
                                      fullWidth
                                      multiline
                                      rows={3}
                                      variant="outlined"
                                    />
                                  </CardContent>
                                </Card>
                              ))}

                            <Button
                              startIcon={<AddIcon />}
                              onClick={() =>
                                push({ titulo: '', contenido: '' })
                              }
                              variant="outlined"
                              fullWidth
                            >
                              Agregar Sección
                            </Button>
                          </Box>
                        )}
                      </FieldArray>
                    </Box>

                    {/* Botones de acción */}
                    <Box
                      sx={{
                        display: 'flex',
                        gap: 2,
                        justifyContent: 'flex-end',
                        pt: 2,
                      }}
                    >
                      {editMode && (
                        <Button
                          startIcon={<CancelIcon />}
                          onClick={() => {
                            handleReset();
                            setEditMode(false);
                            setCurrentVersion(null);
                          }}
                          variant="outlined"
                          color="inherit"
                        >
                          Cancelar
                        </Button>
                      )}
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        startIcon={
                          isSubmitting ? (
                            <CircularProgress size={20} />
                          ) : (
                            <SaveIcon />
                          )
                        }
                        variant="contained"
                        color="primary"
                      >
                        {isSubmitting
                          ? 'Guardando...'
                          : editMode
                            ? 'Crear Nueva Versión'
                            : 'Crear Documento'}
                      </Button>
                    </Box>
                  </Stack>
                </form>
              </FormikProvider>
            </CardContent>
          </Card>
        </Grid>

        {/* Lista de Documentos */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography
                variant="h5"
                component="h2"
                fontWeight="bold"
                gutterBottom
              >
                Documentos Existentes
              </Typography>

              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Título</TableCell>
                      <TableCell>Versión</TableCell>
                      <TableCell>Estado</TableCell>
                      <TableCell align="center">Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedDeslindes.map((deslinde) => (
                      <TableRow
                        key={deslinde.id}
                        sx={{
                          '&:last-child td, &:last-child th': { border: 0 },
                          bgcolor:
                            deslinde.estado === 'eliminado'
                              ? 'action.hover'
                              : 'background.paper',
                        }}
                      >
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {deslinde.titulo}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Vigente hasta:{' '}
                            {new Date(
                              deslinde.fechaVigencia
                            ).toLocaleDateString('es-MX')}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={`v${deslinde.versio}`}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={getStatusText(deslinde.estado)}
                            color={getStatusColor(deslinde.estado)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="center">
                          {deslinde.estado !== 'eliminado' && (
                            <Tooltip title="Acciones">
                              <IconButton
                                size="small"
                                onClick={(e) => handleMenuOpen(e, deslinde)}
                              >
                                <MoreVertIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Paginación */}
              {documentos.length > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                  <Pagination
                    count={Math.ceil(documentos.length / rowsPerPage)}
                    page={page + 1}
                    onChange={(event, value) => setPage(value - 1)}
                    color="primary"
                  />
                </Box>
              )}

              {documentos.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    No hay documentos de deslinde registrados
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Menú de Acciones */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => editDeslinde(selectedDocument)}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Editar</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleDeleteClick(selectedDocument)}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Eliminar</ListItemText>
        </MenuItem>
      </Menu>

      {/* Diálogo de Confirmación de Eliminación */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Está seguro de que desea eliminar el documento "
            {documentToDelete?.titulo}"? Esta acción marcará el deslinde como
            eliminado.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
          <Button
            onClick={() => deleteDeslinde(documentToDelete?.id)}
            color="error"
            variant="contained"
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DeslindeLegal;
