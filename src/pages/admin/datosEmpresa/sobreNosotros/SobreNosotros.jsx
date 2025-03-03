import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert
} from "@mui/material";
import { useAuth } from "../../../../hooks/ContextAuth";
import api from "../../../../utils/AxiosConfig";

// Función para contar palabras
const countWords = (text) => {
  return text.trim().split(/\s+/).filter(Boolean).length;
};

// Validación con Yup
const SobreNosotrosSchema = Yup.object().shape({
  quienesSomos: Yup.string()
    .required("El campo 'Quienes Somos' es obligatorio")
    .test(
      "maxWords",
      "No puede exceder 1000 palabras",
      (value) => countWords(value || "") <= 1000
    ),
  nuestraHistoria: Yup.string()
    .required("El campo 'Nuestra Historia' es obligatorio")
    .test(
      "maxWords",
      "No puede exceder 1000 palabras",
      (value) => countWords(value || "") <= 1000
    ),
});

export default function SobreNosotros({ onNavigate }) {
  const [loading, setLoading] = useState(true);
  const [errorFetch, setErrorFetch] = useState(null);
  const [sobreNosotrosId, setSobreNosotrosId] = useState(null); 

  const { csrfToken } = useAuth();

  // Formik
  const formik = useFormik({
    initialValues: {
      quienesSomos: "",
      nuestraHistoria: "",
    },
    validationSchema: SobreNosotrosSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        if (sobreNosotrosId) {
          await api.put(`/api/sobrenosotros/${sobreNosotrosId}`, values, {
            headers: { "X-CSRF-Token": csrfToken },
            withCredentials: true,
          });
          alert("Información actualizada con éxito.");
        } else {
          await api.post(`/api/sobrenosotros`, values, {
            headers: { "X-CSRF-Token": csrfToken },
            withCredentials: true,
          });
          alert("Información creada con éxito.");
        }

        setLoading(false);
      } catch (error) {
        setLoading(false);
        console.error(error);
        alert("Ocurrió un error al guardar la información.");
      }
    },
  });


  useEffect(() => {
    const fetchSobreNosotros = async () => {
      try {
        const { data } = await api.get(`/api/sobrenosotros`, {
          withCredentials: true,
        });
        if (data && data.id) {
          // Llenamos el form con lo que viene de la BD
          setSobreNosotrosId(data.id);
          formik.setFieldValue("quienesSomos", data.quienesSomos || "");
          formik.setFieldValue("nuestraHistoria", data.nuestraHistoria || "");
        }
      } catch (error) {
        console.error(error);
        setErrorFetch("No se pudo cargar la información de 'Sobre Nosotros'.");
      } finally {
        setLoading(false);
      }
    };

    fetchSobreNosotros();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Contadores de palabras
  const quienesSomosWordCount = countWords(formik.values.quienesSomos);
  const nuestraHistoriaWordCount = countWords(formik.values.nuestraHistoria);

  if (loading) {
    return (
      <Box className="flex justify-center mt-10">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container
      maxWidth="md"
      className="bg-white dark:bg-gray-900 transition-colors duration-300 p-6 rounded-md shadow-lg"
    >
      {/* Botón de regreso, si fuese necesario */}
      {onNavigate && (
        <Box className="mb-4">
          <Button
            variant="outlined"
            onClick={() => onNavigate("home")} // Ajusta la ruta/acción
            className="border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white"
          >
            Volver
          </Button>
        </Box>
      )}

      <Typography
        variant="h4"
        className="text-gray-800 dark:text-gray-100 font-extrabold text-center mb-6"
      >
        Sobre Nosotros
      </Typography>

      {errorFetch && <Alert severity="error">{errorFetch}</Alert>}

      <form onSubmit={formik.handleSubmit} className="space-y-6">
        {/* Campo: Quienes Somos */}
        <div>
          <label
            htmlFor="quienesSomos"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Quienes Somos
          </label>
          <textarea
            id="quienesSomos"
            name="quienesSomos"
            rows={6}
            value={formik.values.quienesSomos}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={`w-full p-3 rounded-md border shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 ${
              formik.touched.quienesSomos && formik.errors.quienesSomos
                ? "border-red-500"
                : "border-gray-300 dark:border-gray-700"
            }`}
          />
          <div className="flex justify-between text-sm mt-1">
            <span className="text-red-500">
              {formik.touched.quienesSomos && formik.errors.quienesSomos}
            </span>
            <span
              className={`${
                quienesSomosWordCount > 1000
                  ? "text-red-500 font-bold"
                  : "text-gray-500"
              }`}
            >
              {quienesSomosWordCount} / 1000 palabras
            </span>
          </div>
        </div>

        {/* Campo: Nuestra Historia */}
        <div>
          <label
            htmlFor="nuestraHistoria"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Nuestra Historia
          </label>
          <textarea
            id="nuestraHistoria"
            name="nuestraHistoria"
            rows={6}
            value={formik.values.nuestraHistoria}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={`w-full p-3 rounded-md border shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 ${
              formik.touched.nuestraHistoria && formik.errors.nuestraHistoria
                ? "border-red-500"
                : "border-gray-300 dark:border-gray-700"
            }`}
          />
          <div className="flex justify-between text-sm mt-1">
            <span className="text-red-500">
              {formik.touched.nuestraHistoria && formik.errors.nuestraHistoria}
            </span>
            <span
              className={`${
                nuestraHistoriaWordCount > 1000
                  ? "text-red-500 font-bold"
                  : "text-gray-500"
              }`}
            >
              {nuestraHistoriaWordCount} / 1000 palabras
            </span>
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            variant="contained"
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-md shadow-md"
            disabled={formik.isSubmitting}
          >
            {sobreNosotrosId ? "Actualizar Información" : "Crear Información"}
          </Button>
        </div>
      </form>
    </Container>
  );
}
