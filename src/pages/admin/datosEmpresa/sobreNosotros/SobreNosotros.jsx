import React, { useState, useEffect, memo } from 'react';
import api from '../../../../utils/AxiosConfig';
import { useAuth } from '../../../../hooks/ContextAuth';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { Pencil, Save, X, ChevronDown, Home, Loader } from 'lucide-react';

const AccordionSection = memo(function AccordionSection({
  title,
  text,
  label,
  isEditing,
  onEdit,
  onCancel,
  onUpdate,
  draft,
  setDraft,
  isOpen,
  toggleOpen,
  isUpdating,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="mb-6 rounded-2xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
    >
      <button
        onClick={toggleOpen}
        className="w-full flex justify-between items-center p-4 sm:p-6 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-300"
      >
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-100 tracking-tight">
          {title}
        </h2>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          <ChevronDown
            size={20}
            className="sm:size-6 text-gray-500 dark:text-gray-400"
          />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            className="px-4 sm:px-6 pb-6"
          >
            {!isEditing ? (
              <div className="flex flex-col gap-4">
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line text-sm sm:text-base">
                  {text || (
                    <span className="italic text-gray-400 dark:text-gray-500">
                      No hay información disponible
                    </span>
                  )}
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onEdit}
                  className="self-end flex items-center gap-2 px-3 sm:px-4 py-2 text-sm font-medium rounded-lg bg-yellow-100 dark:bg-yellow-900/50 text-yellow-600 dark:text-yellow-300 hover:bg-yellow-200 dark:hover:bg-yellow-900 transition-all duration-300"
                >
                  <Pencil size={16} /> Editar
                </motion.button>
              </div>
            ) : (
              <div className="space-y-5">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {label}
                </label>
                <textarea
                  rows={4}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  className="w-full p-3 text-sm rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-all duration-300 resize-none"
                  placeholder={`Escribe aquí ${label.toLowerCase()} (mínimo 6 caracteres)...`}
                />
                <div className="flex justify-end gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onCancel}
                    disabled={isUpdating}
                    className="flex items-center gap-2 px-3 sm:px-4 py-2 text-sm font-medium rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <X size={16} /> Cancelar
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onUpdate}
                    disabled={isUpdating || !draft?.trim()}
                    className="flex items-center gap-2 px-3 sm:px-4 py-2 text-sm font-medium rounded-lg bg-yellow-600 text-white hover:bg-yellow-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUpdating ? (
                      <Loader size={16} className="animate-spin" />
                    ) : (
                      <Save size={16} />
                    )}
                    Guardar
                  </motion.button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

export default function SobreNosotros() {
  const [sections, setSections] = useState({
    id: null,
    quienesSomos: '',
    nuestraHistoria: '',
    mision: '',
    vision: '',
  });
  const [editing, setEditing] = useState({
    quienesSomos: false,
    nuestraHistoria: false,
    mision: false,
    vision: false,
  });
  const [drafts, setDrafts] = useState({
    quienesSomos: '',
    nuestraHistoria: '',
    mision: '',
    vision: '',
  });
  const [openSection, setOpenSection] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const { csrfToken } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await api.get('/api/sobrenosotros', {
          withCredentials: true,
        });
        setSections({
          id: data.id || null,
          quienesSomos: data.quienesSomos || '',
          nuestraHistoria: data.nuestraHistoria || '',
          mision: data.mision || '',
          vision: data.vision || '',
        });
        setDrafts({
          quienesSomos: data.quienesSomos || '',
          nuestraHistoria: data.nuestraHistoria || '',
          mision: data.mision || '',
          vision: data.vision || '',
        });
      } catch (error) {
        console.error('Error al obtener datos:', error);
        toast.error('Error al cargar la información');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleEdit = (key) => {
    setDrafts((prev) => ({ ...prev, [key]: sections[key] || '' }));
    setEditing((prev) => ({ ...prev, [key]: true }));
    setOpenSection(key);
  };

  const handleCancel = (key) => {
    setEditing((prev) => ({ ...prev, [key]: false }));
    setDrafts((prev) => ({ ...prev, [key]: sections[key] || '' }));
    setOpenSection(null);
  };

  const handleUpdate = async (key) => {
    const trimmedDraft = drafts[key]?.trim();

    if (!trimmedDraft || trimmedDraft.length < 6) {
      toast.warning('El contenido debe tener al menos 6 caracteres');
      return;
    }

    const hasVowel = /[aeiouáéíóú]/i.test(trimmedDraft);
    if (!hasVowel) {
      toast.warning(
        'El contenido debe incluir al menos una vocal para ser significativo'
      );
      return;
    }

    const isGibberish = /^[^aeiouáéíóú\s]{6,}$/i.test(trimmedDraft);
    if (isGibberish) {
      toast.warning('El contenido no debe ser una secuencia sin sentido');
      return;
    }

    setIsUpdating(true);

    try {
      const updatedSections = { ...sections, [key]: trimmedDraft };
      await api.put(`/api/sobrenosotros/${sections.id || 1}`, updatedSections, {
        withCredentials: true,
        headers: { 'X-CSRF-Token': csrfToken },
      });

      setSections(updatedSections);
      setEditing((prev) => ({ ...prev, [key]: false }));
      setOpenSection(null);
      toast.success('Información actualizada correctamente');
    } catch (error) {
      console.error('Error al actualizar:', error);
      toast.error('No se pudo actualizar la información');
    } finally {
      setIsUpdating(false);
    }
  };

  const toggleSection = (key) => {
    setOpenSection((prev) => (prev === key ? null : key));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  const sectionData = [
    { key: 'quienesSomos', title: '¿Quiénes Somos?', label: 'quiénes somos' },
    {
      key: 'nuestraHistoria',
      title: 'Nuestra Historia',
      label: 'nuestra historia',
    },
    { key: 'mision', title: 'Misión', label: 'nuestra misión' },
    { key: 'vision', title: 'Visión', label: 'nuestra visión' },
  ];

  return (
    <div className="max-w-full sm:max-w-4xl mx-auto px-4 py-8 sm:py-12 sm:px-6 lg:px-8  dark:from-gray-900 dark:to-gray-800">
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="text-center mb-10 sm:mb-12"
      >
        <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 mb-4 sm:mb-6 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 shadow-lg">
          <Home size={24} className="sm:size-7 text-white" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          Sobre Nosotros
        </h1>
        <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-300 max-w-md mx-auto">
          Descubre nuestra historia, misión y visión para el futuro.
        </p>
      </motion.div>

      <div className="space-y-6">
        {sectionData.map((section) => (
          <AccordionSection
            key={section.key}
            title={section.title}
            text={sections[section.key]}
            label={section.label}
            isEditing={editing[section.key]}
            onEdit={() => handleEdit(section.key)}
            onCancel={() => handleCancel(section.key)}
            onUpdate={() => handleUpdate(section.key)}
            draft={drafts[section.key]}
            setDraft={(val) =>
              setDrafts((prev) => ({ ...prev, [section.key]: val }))
            }
            isOpen={openSection === section.key}
            toggleOpen={() => toggleSection(section.key)}
            isUpdating={isUpdating}
          />
        ))}
      </div>
    </div>
  );
}
