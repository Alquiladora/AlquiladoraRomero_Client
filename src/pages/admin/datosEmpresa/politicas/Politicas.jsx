
import React, { useEffect, useState, useContext, useRef } from 'react';
import DetalleProducto from '../../../../components/productosCategoria/productosDetalles';
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
import api from '../../../../utils/AxiosConfig';

import { toast } from "react-toastify";
import { useNavigate } from 'react-router-dom'; 
import { useAuth } from '../../../../hooks/ContextAuth';


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

const Politicas = ({ onNavigate }) => {
  const [politicas, setPoliticas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
 
  const [editMode, setEditMode] = useState(false);
  const [currentVersion, setCurrentVersion] = useState(null);

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const navigate = useNavigate(); 
  const { user, csrfToken } = useAuth();

  // Estados para la paginación
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5); 

 

  useEffect(() => {
    fetchPoliticas();
  }, []);

  // Función para cerrar el Snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  

  const extractValue = (versioField) => {
    if (typeof versioField === 'object' && versioField !== null) {
      return versioField.data || versioField.value || '';
    }
    return versioField;
  };

  const fetchPoliticas = async () => {
    try {
      const response = await api.get("/api/politicas", { withCredentials: true });
     
  
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
      console.log("Poliitcas obtenidos",parsedData)
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
      await api.post('/api/politicas', data, {
        headers: { 'X-CSRF-Token': csrfToken },
        withCredentials: true,
      });
      toast.success( 'Éxito Se creó la política correctamente');
    } catch (error) {
      console.log('Error al crear la política:', error);
      toast.error( 'No se pudo crear la política');
    }
  };

  const createNewVersion = async (id, data) => {
    try {
      await api.post(`/api/politicas/${id}/nueva-version`, data, {
        headers: { 'X-CSRF-Token': csrfToken },
        withCredentials: true,
      });
      toast.success( 'Se creó una nueva versión de la política');
    } catch (error) {
      console.error('Error al crear nueva versión:', error);
      toast.error( 'No se pudo crear la nueva versión');
    }
  };

  const deletePolitica = async (id) => {
    const confirmDeletion = window.confirm(
      "Esta acción marcará la política como eliminada. ¿Desea continuar?"
    );
    if (confirmDeletion) {
      try {
        await api.delete(`/api/politicas/${id}`, {
          headers: { 'X-CSRF-Token': csrfToken },
          withCredentials: true,
        });
        toast.success("Política eliminada correctamente");
        fetchPoliticas();
      } catch (error) {
        console.error("Error al eliminar la política:", error);
        toast.error("No se pudo eliminar la política");
      }
    }
  };
  

  const editPolitica = (politica) => {
    setCurrentVersion(politica);
    setFieldValue('titulo', politica.titulo);
    setFieldValue('contenido', politica.contenido);
    setFieldValue('fechaVigencia', politica.fechaVigencia ? politica.fechaVigencia.substring(0, 10) : '');
    setFieldValue('secciones', politica.secciones || [{ titulo: '', contenido: '' }]);
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

  
  const paginatedPoliticas = politicas.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <div className="max-w-3xl mx-auto p-8 mt-8 bg-white dark:bg-gray-900 transition-colors duration-300">
      
      <h1 className="text-3xl font-extrabold text-center mb-8 text-gray-800 dark:text-gray-100">
        Gestión de Políticas de Privacidad
      </h1>
  
      <FormikProvider value={formik}>
        <form onSubmit={handleSubmitWrapper} className="space-y-8">
          
          {Object.keys(errors).length > 0 && Object.keys(touched).length > 0 && (
            <div className="bg-red-100 dark:bg-red-200 border border-red-400 text-red-700 dark:text-red-900 px-5 py-3 rounded shadow-sm transition-colors duration-300">
              <p className="font-semibold">
                Por favor corrige los siguientes errores:
              </p>
              <ul className="list-disc ml-6">
                {Object.entries(errors).map(([key, value]) => {
                  if (typeof value === 'string') {
                    return <li key={key}>{value}</li>;
                  } else if (Array.isArray(value)) {
                    return value
                      .map((err, index) => {
                        const erroresSeccion = Object.values(err).filter(Boolean);
                        return erroresSeccion.map((mensajeError, idx) => (
                          <li key={`${key}-${index}-${idx}`}>
                            {`Sección ${index + 1}: ${mensajeError}`}
                          </li>
                        ));
                      })
                      .flat();
                  }
                  return null;
                })}
              </ul>
            </div>
          )}
  
          {/* Campo Título */}
          <div>
            <label htmlFor="titulo" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Título
            </label>
            <input
              type="text"
              id="titulo"
              name="titulo"
              value={values.titulo}
              onChange={handleChange}
              className={`mt-1 w-full p-3 rounded-md border shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-colors duration-300 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 ${
                touched.titulo && errors.titulo ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
              }`}
            />
            {touched.titulo && errors.titulo && (
              <p className="text-red-500 text-sm mt-1">{errors.titulo}</p>
            )}
          </div>
  
          <div>
            <label htmlFor="contenido" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Contenido
            </label>
            <textarea
              id="contenido"
              name="contenido"
              value={values.contenido}
              onChange={handleChange}
              rows={4}
              className={`mt-1 w-full p-3 rounded-md border shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-colors duration-300 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 ${
                touched.contenido && errors.contenido ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
              }`}
            />
            {touched.contenido && errors.contenido && (
              <p className="text-red-500 text-sm mt-1">{errors.contenido}</p>
            )}
          </div>
  
        
          <div>
            <label htmlFor="fechaVigencia" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Fecha de Vigencia
            </label>
            <input
              type="date"
              id="fechaVigencia"
              name="fechaVigencia"
              value={values.fechaVigencia}
              onChange={handleChange}
              min={getMexicoDate()}
              className={`mt-1 w-full p-3 rounded-md border shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-colors duration-300 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 ${
                touched.fechaVigencia && errors.fechaVigencia ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
              }`}
            />
            {touched.fechaVigencia && errors.fechaVigencia && (
              <p className="text-red-500 text-sm mt-1">{errors.fechaVigencia}</p>
            )}
          </div>
  
        
          {touched.secciones &&
            errors.secciones &&
            typeof errors.secciones === 'string' && (
              <div className="bg-red-100 dark:bg-red-200 border border-red-400 text-red-700 dark:text-red-900 px-5 py-3 rounded shadow transition-colors duration-300">
                {errors.secciones}
              </div>
            )}
  
        
          <FieldArray name="secciones">
            {({ push, remove }) => (
              <div>
                <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
                  Secciones
                </h2>
                {Array.isArray(values.secciones) &&
                  values.secciones.map((section, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 dark:bg-gray-800 p-5 rounded-md shadow-sm mb-4 transition-colors duration-300"
                    >
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-lg font-medium text-gray-800 dark:text-gray-100">
                          Sección {index + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="text-red-500 hover:text-red-600 transition-colors duration-300"
                          aria-label={`Eliminar sección ${index + 1}`}
                        >
                          Eliminar
                        </button>
                      </div>
                      <div className="mb-3">
                        <label htmlFor={`secciones[${index}].titulo`} className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                          Título de la Sección
                        </label>
                        <input
                          type="text"
                          id={`secciones[${index}].titulo`}
                          name={`secciones[${index}].titulo`}
                          value={section.titulo}
                          onChange={handleChange}
                          className={`mt-1 w-full p-3 rounded-md border shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-colors duration-300 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 ${
                            touched.secciones?.[index]?.titulo && errors.secciones?.[index]?.titulo
                              ? 'border-red-500'
                              : 'border-gray-300 dark:border-gray-700'
                          }`}
                        />
                        {touched.secciones?.[index]?.titulo &&
                          errors.secciones?.[index]?.titulo && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors.secciones[index].titulo}
                            </p>
                          )}
                      </div>
                      <div>
                        <label htmlFor={`secciones[${index}].contenido`} className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                          Contenido de la Sección
                        </label>
                        <textarea
                          id={`secciones[${index}].contenido`}
                          name={`secciones[${index}].contenido`}
                          value={section.contenido}
                          onChange={handleChange}
                          rows="3"
                          className={`mt-1 w-full p-3 rounded-md border shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-colors duration-300 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 ${
                            touched.secciones?.[index]?.contenido && errors.secciones?.[index]?.contenido
                              ? 'border-red-500'
                              : 'border-gray-300 dark:border-gray-700'
                          }`}
                        />
                        {touched.secciones?.[index]?.contenido &&
                          errors.secciones?.[index]?.contenido && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors.secciones[index].contenido}
                            </p>
                          )}
                      </div>
                    </div>
                  ))}
                <button
                  type="button"
                  onClick={() => push({ titulo: '', contenido: '' })}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-5 py-3 rounded-md transition-colors duration-300"
                >
                  Agregar Sección
                </button>
              </div>
            )}
          </FieldArray>
  
       
          <div className="flex justify-end space-x-4">
            {editMode && (
              <button
                type="button"
                onClick={() => {
                  handleReset();
                  setEditMode(false);
                  setCurrentVersion(null);
                }}
                className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-3 rounded-md transition-colors duration-300"
              >
                Cancelar
              </button>
            )}
            <button
              type="submit"
              disabled={formik.isSubmitting}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-5 py-3 rounded-md transition-colors duration-300"
            >
              {formik.isSubmitting
                ? 'Cargando...'
                : editMode
                ? 'Crear Nueva Versión'
                : 'Agregar Política'}
            </button>
          </div>
        </form>
      </FormikProvider>
  
      <h2 className="text-2xl font-bold mt-10 mb-6 text-gray-800 dark:text-gray-100">
        Lista de Políticas de Privacidad
      </h2>
      <div className="overflow-x-auto bg-white dark:bg-gray-800 shadow rounded-lg transition-colors duration-300">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-200 dark:bg-gray-700">
            <tr>
              <th className="px-4 py-3 border">Título</th>
              <th className="px-4 py-3 border">Versión</th>
              <th className="px-4 py-3 border">Fecha de Vigencia</th>
              <th className="px-4 py-3 border">Estado</th>
              <th className="px-4 py-3 border">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {paginatedPoliticas.map((politica) => (
              <tr
                key={politica.id}
                className="border-t transition-colors duration-300"
              >
                <td className="px-4 py-3">{politica.titulo}</td>
                <td className="px-4 py-3">{politica.versio}</td>
                <td className="px-4 py-3">
                  {new Date(politica.fechaVigencia).toLocaleDateString('es-MX', {
                    timeZone: 'America/Mexico_City',
                  })}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`font-bold ${
                      politica.estado === 'vigente'
                        ? 'text-green-600'
                        : politica.estado === 'no vigente'
                        ? 'text-orange-600'
                        : 'text-red-600'
                    }`}
                  >
                    {politica.estado.charAt(0).toUpperCase() +
                      politica.estado.slice(1)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {politica.estado !== 'eliminado' && (
                    <div className="flex space-x-3">
                      <button
                        onClick={() => editPolitica(politica)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors duration-300"
                        aria-label={`Editar política ${politica.titulo}`}
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => deletePolitica(politica.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition-colors duration-300"
                        aria-label={`Eliminar política ${politica.titulo}`}
                      >
                        Eliminar
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex justify-end items-center p-4">
          <span className="mr-4 text-gray-800 dark:text-gray-100">
            Página {page + 1} de {Math.ceil(politicas.length / rowsPerPage)}
          </span>
          <button
            onClick={handleChangePage}
            disabled={page === 0}
            className="px-4 py-2 border rounded mr-3 disabled:opacity-50 transition-colors duration-300"
          >
            Anterior
          </button>
          <button
            onClick={handleChangePage}
            disabled={(page + 1) * rowsPerPage >= politicas.length}
            className="px-4 py-2 border rounded disabled:opacity-50 transition-colors duration-300"
          >
            Siguiente
          </button>
        </div>
      </div>
  
      <div className="flex justify-end mt-8">
        <button
         onClick={(e) => {
          e.stopPropagation();
          onNavigate("historialPoliticas");
        }}
          className="flex items-center border border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-white px-5 py-3 rounded-md transition-colors duration-300"
        >
          <span className="mr-3">Ver Historial</span>
        </button>
      </div>
    </div>
  );
  

}

export default Politicas;
