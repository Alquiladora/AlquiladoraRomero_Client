import React, { useState, useEffect, memo } from 'react';
import api from '../../../../utils/AxiosConfig';
import { useAuth } from '../../../../hooks/ContextAuth';
import { toast } from "react-toastify";


function HomeIconSvg() {
  return (
    <svg
      className="w-5 h-5 text-yellow-500"
      fill="currentColor"
      viewBox="0 0 20 20"
    >
      <path d="M10.707 1.293a1 1 0 00-1.414 0L2 8.586V18a1 1 0 001 1h14a1 1 0 001-1V8.586l-7.293-7.293zM13 17v-5h-2v5H5v-6H3l7-7 7 7h-2v6h-2z" />
    </svg>
  );
}

function PencilSvg() {
  return (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M15.232 5l3.536 3.536-10.607 10.607L4.625 15.607 15.232 5z" />
    </svg>
  );
}

function SaveSvg() {
  return (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M19 21H5V3h11l3 3v15z" />
      <path d="M17 21V9H7v12" />
      <path d="M7 3v6h8" />
    </svg>
  );
}

function CancelSvg() {
  return (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

const SectionCard = memo(function SectionCard({
  title,
  text,
  label,
  isEditing,
  onEdit,
  onCancel,
  onUpdate,
  draft,
  setDraft,
  errorField, 
}) {
  const handleDraftChange = (e) => {
    if (e.target.value.length <= 1000) {
      setDraft(e.target.value);
    }
  };

  return (
    <div className="mb-8">
      {!isEditing && (
        <div className="p-6 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 relative">
          <h2 className="font-semibold mb-4 text-gray-800 dark:text-gray-100 text-lg">
            {title}
          </h2>
          <p className="whitespace-pre-line text-gray-600 dark:text-gray-200 leading-relaxed">
            {text || "Sin datos"}
          </p>
          <button
            onClick={onEdit}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-200"
            title="Editar"
          >
            <PencilSvg />
          </button>
        </div>
      )}

      {isEditing && (
        <div className="p-6 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 relative">
          <h2 className="font-semibold mb-4 text-gray-800 dark:text-gray-100 text-lg">
            Editar {title}
          </h2>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
            {label}
          </label>
          <textarea
            rows={6}
            value={draft}
            onChange={handleDraftChange}
            placeholder="Escribe aquí..."
            className="mb-2 w-full p-2 rounded bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <p className="text-right text-gray-500 dark:text-gray-300 mb-2">
            {draft.length}/1000
          </p>
          {errorField && (
            <p className="text-sm text-red-600 dark:text-red-400 mb-2">
              {errorField}
            </p>
          )}
          <div className="flex justify-end space-x-2">
            <button
              onClick={onUpdate}
              className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-3 rounded shadow-sm"
            >
              <SaveSvg />
              <span className="ml-1">Guardar</span>
            </button>
            <button
              onClick={onCancel}
              className="inline-flex items-center border border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-gray-600 text-sm font-medium py-2 px-3 rounded shadow-sm"
            >
              <CancelSvg />
              <span className="ml-1">Cancelar</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
});

export default function SobreNosotros() {
  const [recordId, setRecordId] = useState(null);
  const [isEditingQuienes, setIsEditingQuienes] = useState(false);
  const [isEditingHistoria, setIsEditingHistoria] = useState(false);
  const [quienesText, setQuienesText] = useState("");
  const [historiaText, setHistoriaText] = useState("");
  const [draftQuienes, setDraftQuienes] = useState("");
  const [draftHistoria, setDraftHistoria] = useState("");
  const [errorQuienes, setErrorQuienes] = useState("");
  const [errorHistoria, setErrorHistoria] = useState("");
  const { csrfToken } = useAuth();

 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSobreNosotros = async () => {
      try {
        const { data } = await api.get("/api/sobrenosotros", {
          withCredentials: true,
        });
        if (Object.keys(data).length > 0) {
          setRecordId(data.id);
          setQuienesText(data.quienesSomos);
          setHistoriaText(data.nuestraHistoria);
        }
      } catch (error) {
        console.error("Error al obtener la información:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSobreNosotros();
  }, []);

  function isValidInput(text, setError) {
    const trimmed = text.trim();
    if (trimmed.length < 1) {
      setError("El texto no puede estar vacío ni solo contener espacios.");
      return false;
    }
    if (trimmed.length < 10) {
      setError("El texto debe tener al menos 10 caracteres.");
      return false;
    }
    setError("");
    return true;
  }

  const handleEditQuienes = () => {
    setDraftQuienes(quienesText);
    setIsEditingQuienes(true);
    setErrorQuienes("");
  };
  const handleUpdateQuienes = async () => {
    if (!isValidInput(draftQuienes, setErrorQuienes)) return;
    setQuienesText(draftQuienes);
    setIsEditingQuienes(false);
    await saveData(draftQuienes, historiaText);
  };
  const handleCancelQuienes = () => {
    setIsEditingQuienes(false);
    setErrorQuienes("");
  };

  const handleEditHistoria = () => {
    setDraftHistoria(historiaText);
    setIsEditingHistoria(true);
    setErrorHistoria("");
  };
  const handleUpdateHistoria = async () => {
    if (!isValidInput(draftHistoria, setErrorHistoria)) return;
    setHistoriaText(draftHistoria);
    setIsEditingHistoria(false);
    await saveData(quienesText, draftHistoria);
  };
  const handleCancelHistoria = () => {
    setIsEditingHistoria(false);
    setErrorHistoria("");
  };

  const saveData = async (quienesSomos, nuestraHistoria) => {
    try {
      if (!recordId) {
        await api.post(
          "/api/sobrenosotros",
          { quienesSomos, nuestraHistoria },
          {
            withCredentials: true,
            headers: { "X-CSRF-Token": csrfToken },
          }
        );
        const { data } = await api.get("/api/sobrenosotros", {
          withCredentials: true,
        });
        if (Object.keys(data).length > 0) {
          setRecordId(data.id);
        }
      } else {
        await api.put(
          `/api/sobrenosotros/${recordId}`,
          { quienesSomos, nuestraHistoria },
          {
            withCredentials: true,
            headers: { "X-CSRF-Token": csrfToken },
          }
        );
      }
      toast.success('Éxito: Se Actualizó correctamente');
    } catch (error) {
      console.error("Error en saveData:", error);
      toast.error('No se pudo Actualizar');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="relative max-w-4xl mx-auto p-6 md:p-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border-4 border-yellow-500">
      <div className="absolute -top-7 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 p-3 rounded-full border-4 border-yellow-500">
        <HomeIconSvg />
      </div>
      <h1 className="font-bold mb-8 text-gray-800 dark:text-gray-100 text-center mt-4 text-2xl">
        Sobre Nosotros
      </h1>
      <SectionCard
        title="¿Quiénes Somos?"
        text={quienesText || ""}
        label="¿Quiénes Somos?"
        isEditing={isEditingQuienes}
        onEdit={handleEditQuienes}
        onCancel={handleCancelQuienes}
        onUpdate={handleUpdateQuienes}
        draft={draftQuienes}
        setDraft={setDraftQuienes}
        errorField={errorQuienes}
      />
      <SectionCard
        title="Nuestra Historia"
        text={historiaText || ""}
        label="Nuestra Historia"
        isEditing={isEditingHistoria}
        onEdit={handleEditHistoria}
        onCancel={handleCancelHistoria}
        onUpdate={handleUpdateHistoria}
        draft={draftHistoria}
        setDraft={setDraftHistoria}
        errorField={errorHistoria}
      />
    </div>
  );
}
