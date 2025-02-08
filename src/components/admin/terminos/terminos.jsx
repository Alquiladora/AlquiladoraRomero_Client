import React, { useEffect, useState, useContext, useRef } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
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

const MySwal = withReactContent(Swal);


//==============================fUNCION PAR AOBTENER EL TIRMPO ACTUAL
const getMexico=()=>{
  const options={
    timeZone: 'America/Mexico_City',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }
  const formatear= new Intl.DateTimeFormat([], options);
  const parts= formatear.formatToParts(new Date());
  const dateParts={};
  parts.forEach(({type, value})=>{
    dateParts[type]= value;
  });
  return `${dateParts.year}-${dateParts.month}-${dateParts.day}`;
}

//====================================VALIDACIONES==============================================
const validationSchema = yup.object().shape({
  titulo: yup.string().required('El título es obligatorio').max(50, 'Máximo 50 caracteres'),
  contenido: yup.string().required('El contenido es obligatorio'),
  fechaVigencia: yup
    .date()
    .required('La fecha de vigencia es obligatoria')
    .min(new Date(getMexico()), 'La fecha de vigencia no puede ser pasada'),
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
//===============================================================================

const Terminos = () => {
  const [terminos, setTerminos] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [currentVersion, setCurrentVersion] = useState(null);
  const [csrfToken, setCsrfToken] = useState('');
  const { theme } = useContext(ThemeContext);
  const [error, setError]= useState(null);
  const [snackbar, setSnackbar]=useState({open: false, message:'', severity: 'success'});
  const toast= useRef(null);
  const navigate= useNavigate();
  //Pagination
  const [page, setPage]= useState(0);
  const [rowsPerPage, setRowsPerPage]=useState(5);
  const [loading, setLoading] = useState(true);

  //Api 
  const apiUrl = 'https://alquiladora-romero-backed-1.onrender.com/api/terminos';
  

  useEffect(() => {
    fetchCsrfToken();
    fetchTerminos();
  }, []);

  const fetchCsrfToken = async () => {
    try {
      const response = await axios.get('https://alquiladora-romero-backed-1.onrender.com/api/get-csrf-token', {
        withCredentials: true,
      });
      setCsrfToken(response.data.csrfToken);
    } catch (error) {
      console.error('Error al obtener el token CSRF', error);
    }
  };


  //EXTRAEMOS EL VALOR
  const extractValue=(versionField)=>{
    if(typeof versionField ==='object' && versionField !==null ){
      return versionField || versionField.value || '';
    }
    return versionField;
  }

  //===============================================================================
  const fetchTerminos = async () => {
    try {
      const response = await axios.get(apiUrl, {
        withCredentials: true,
      });

      //EStructuramo slo datos a enviar
      const parseDate= response .data.map((termino)=>{
        const originalDate= termino.fechaVigencia
        ?new Date(termino.fechaVigencia)
        : new Date(getMexico());

        originalDate.setDate(originalDate.getDate()+1)
        return {
          ...termino,
          versio: extractValue(termino.versio),
          fechaVigencia: originalDate.toISOString().split('T')[0],
          secciones:
          typeof termino.secciones=== "string"
          ? JSON.parse(termino.secciones)
          : termino.secciones || [],
        }
      });

      setTerminos(parseDate);
      setLoading(false);
    } catch (error) {
      console.error('Error al obtener términos:', error);
     setError("No se pudieron cargar los terminos");
     setLoading(false);
    }
  };

  //vALIDACIONES
  const formik = useFormik({
    initialValues: {
      titulo: '',
      contenido: '',
      fechaVigencia: '',
      secciones: [{ titulo: '', contenido: '' }],
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      if (editMode) {
        await createNewVersion(currentVersion.id, values);
      } else {
        await createTermino(values);
      }
      resetForm();
      setEditMode(false);
      setCurrentVersion(null);
      fetchTerminos();
      setPage(0);
    },
  });
  const { values, errors, touched, handleChange, handleSubmit, handleReset, setFieldValue , setFieldTouched} = formik;
  //=======================================================================
    //Funcion par acontrolar ña paginacion
    const handleChangePage=(event, newPage)=>{
      setPage(newPage);
    }
  //Funcion para manejar el cambio de filas por pagina
  const handleChangeRowsPerPage= (event)=>{
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  }

  //Creamos un nuevo termino version 1.0
  const createTermino = async (data) => {
    try {
      await axios.post(apiUrl, data, {
        headers: { 'X-CSRF-Token': csrfToken },
        withCredentials: true,
      });
      toast.current.show({severity:'success', sumary: 'Exito', detail: 'Se creo el termino correctamente'});
     
    } catch (error) {
      console.log('Error al crear el termino:', error);
      toast.current.show({ severity: 'error', summary: 'Error', detail: 'No se pudo crar el termino', life: 3000 });
    }
  };

  //=========================================================================
  //Creamos una nueva versión de  termino existente osea actualizar pero como nueva version
  const createNewVersion = async (id, data) => {
    try {
      await axios.post(`${apiUrl}/${id}/nueva-version`, data, {
        headers: { 'X-CSRF-Token': csrfToken },
        withCredentials: true,
      });
      toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Se creó una nueva versión de termino', life: 3000 });

    } catch (error) {
      console.error('Error al crear nueva versión:', error);
      toast.current.show({ severity: 'error', summary: 'Error', detail: 'No se pudo crear la nueva versión', life: 3000 });

    }
  };

  //Marcamos Termino como eliminado solo lógicamente
  const deleteTermino = async (id) => {
    confirmDialog({
      message: 'Esta acción marcará el termino como eliminada.',
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
          toast.current.show({ severity: 'success', summary: 'Eliminado', detail: 'Terminoa eliminado correctamente', life: 3000 });
          fetchTerminos();
        } catch (error) {
          console.error('Error al eliminar termino:', error);
          toast.current.show({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar el termino', life: 3000 });
        }
      },
    });
  };


  //====Función para Editar término
  const editTermino = (termino) => {
    setCurrentVersion(termino);
    setFieldValue('titulo', termino.titulo);
    setFieldValue('contenido', termino.contenido);
    setFieldValue('fechaVigencia', termino.fechaVigencia ? termino.fechaVigencia.substring(0, 10) : '');
    setFieldValue('secciones', termino.secciones || [{ titulo: '', contenido: '' }]);
    setEditMode(true);
  };
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

  const paginatedPoliticas = terminos.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);


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
      <Toast ref={toast} />
      <ConfirmDialog />


      <Typography
        variant="h4"
        align="center"
        gutterBottom
        sx={{ fontWeight: 'bold', color: theme === 'dark' ? '#fff' : '#333' }}
      >
        Gestión de Términos y Condiciones
      </Typography>

      <FormikProvider value={formik}>
        <form onSubmit={handleSubmitWrapper}>
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
            sx={{
              bgcolor: theme === 'dark' ? '#1e1e1e' : '#fff',
            }}
          />

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
            InputLabelProps={{
              shrink: true,
            }}
            inputProps={{ min: getMexico()}}

           variant="outlined"
            sx={{
              bgcolor: theme === 'dark' ? '#1e1e1e' : '#fff',
            }}
          />
           {touched.secciones && errors.secciones && typeof errors.secciones === 'string' && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errors.secciones}
            </Alert>
          )}

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
                'Agregar Termino'
              )}
            </Button>
          </Box>
        </form>
      </FormikProvider>




      <Typography
        variant="h5"
        gutterBottom
        sx={{ mt: 5, color: theme === 'dark' ? '#ddd' : '#333' }}
      >
        Lista de Términos y Condiciones
      </Typography>
      <Paper sx={{ bgcolor: theme === 'dark' ? '#1e1e1e' : '#fff', boxShadow: 1 }}>
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

            {paginatedPoliticas.map((termino) => (
              <TableRow key={termino.id}>
                <TableCell>{termino.titulo}</TableCell>
                <TableCell>{termino.versio}</TableCell>
                <TableCell>
                  {new Date(termino.fechaVigencia).toLocaleDateString('es-MX', {
                    timeZone: 'America/Mexico_City',
                  })}

                </TableCell>

                <TableCell>
                <Typography
                    variant="body2"
                    sx={{
                      color:
                        termino.estado === 'vigente'
                          ? 'green'
                          : termino.estado === 'no vigente'
                          ? 'orange'
                          : 'red',
                      fontWeight: 'bold',
                    }}
                  >
                    {termino.estado.charAt(0).toUpperCase() + termino.estado.slice(1)}
                  </Typography>

                  </TableCell>

                 <TableCell>
                  {termino.estado !== 'eliminado' && (
                    <>
                      <IconButton
                        onClick={() => editTermino(termino)}
                        color="warning"
                        aria-label={`Editar política ${termino.titulo}`}
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        onClick={() => deleteTermino(termino.id)}
                        color="error"
                        aria-label={`Eliminar política ${termino.titulo}`}
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
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="outlined"
          color="primary"
          startIcon={<History />}
          onClick={() => navigate('/Administrador/historialTerminos')}
        >
          Ver Historial
        </Button>
      </Box>


    </Container>
  );
};

export default Terminos;
