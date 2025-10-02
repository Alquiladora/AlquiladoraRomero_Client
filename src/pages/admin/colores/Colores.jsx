import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faEdit,
  faTrash,
  faSave,
  faTimes,
  faPalette,
  faSpinner,
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import api from "../../../utils/AxiosConfig";
import { useAuth } from "../../../hooks/ContextAuth";
import { toast } from "react-toastify";
import Swal from 'sweetalert2';

const ColorManager = () => {
  const { user, csrfToken } = useAuth();

  const [colors, setColors] = useState([]);
  const [newColor, setNewColor] = useState({ name: "", hex: "#000000" });
  const [editingColor, setEditingColor] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const colorsPerPage = 10;

  useEffect(() => {
    fetchColors();
  }, []);

  const fetchColors = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`api/colores/colores`);
      if (response.data.success) {
        if (Array.isArray(response.data.data)) {
          setColors(response.data.data);
        } else {
          toast.error("Los datos recibidos no son válidos.");
          setColors([]);
        }
      } else {
       
      }
    } catch (err) {
      toast.error("Error al conectar con el servidor. Por favor, intenta de nuevo.");
      
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (editingColor) {
      setEditingColor({ ...editingColor, [name]: value });
    } else {
      setNewColor({ ...newColor, [name]: value });
    }
  };

  const handleAddColor = async (e) => {
    e.preventDefault();
    if (!newColor.name || !newColor.hex) {
      toast.error("Por favor, completa todos los campos.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await api.post(
        `api/colores/colores`,
        { color: newColor.name, codigoH: newColor.hex },
        {
          withCredentials: true,
          headers: { "X-CSRF-Token": csrfToken },
        }
      );

      if (response.data.success) {
        setColors([...colors, response.data.data]);
        setNewColor({ name: "", hex: "#000000" });
        setIsAdding(false);
        // Reset to the last page if a new color is added
        setCurrentPage(Math.ceil((colors.length + 1) / colorsPerPage));
      } else {
          toast.error(response.data.message || "Error al agregar el color.");
      }
    } catch (err) {
         toast.error("Error al agregar el color. Por favor, intenta de nuevo.");
     
    } finally {
      setLoading(false);
    }
  };

  const handleEditColor = (color) => {
    setEditingColor({ id: color.idColores, name: color.color, hex: color.codigoH || "#000000" });
    setIsAdding(false);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingColor.name || !editingColor.hex) {
       toast.error("Por favor, completa todos los campos.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await api.put(
        `api/colores/colores/${editingColor.id}`,
        { color: editingColor.name, codigoH: editingColor.hex },
        {
          withCredentials: true,
          headers: { "X-CSRF-Token": csrfToken },
        }
      );

      if (response.data.success) {
        setColors(
          colors.map((color) =>
            color.idColores === editingColor.id ? response.data.data : color
          )
        );
        setEditingColor(null);
      } else {
           toast.error(response.data.message || "Error al actualizar el color.");
      }
    } catch (err) {
        toast.error("Error al actualizar el color. Por favor, intenta de nuevo.");
     
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingColor(null);
    setError(null);
  };


  const handleDeleteColor = async (id) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este color?")) {
      return;
    }

    setLoading(true);
   
    try {
      const response = await api.delete(`api/colores/colores/${id}`, {
        withCredentials: true,
        headers: { "X-CSRF-Token": csrfToken },
      });

      if (response.data.success) {
         toast.success("Color eliminado exitosamente.");
        const updatedColors = colors.filter((color) => color.idColores !== id);
        setColors(updatedColors);
      
        const totalPages = Math.ceil(updatedColors.length / colorsPerPage);
        if (currentPage > totalPages && totalPages > 0) {
          setCurrentPage(totalPages);
        }
      } else {
          toast.error(response.data.message || "Error al eliminar el color.");
      }
    } catch (err) {
         const errorMessage = err.response?.data?.message || "Ocurrió un error inesperado. Intenta de nuevo.";
        toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };


  const totalPages = Math.ceil(colors.length / colorsPerPage);
  const indexOfLastColor = currentPage * colorsPerPage;
  const indexOfFirstColor = indexOfLastColor - colorsPerPage;
  const currentColors = colors.slice(indexOfFirstColor, indexOfLastColor);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen  from-gray-50 to-gray-200 dark:from-gray-800 dark:to-gray-900 dark:text-white">
    
      <h1 className="text-3xl sm:text-4xl font-extrabold mb-10 text-gray-900 dark:text-white flex items-center justify-center sm:justify-start">
        <FontAwesomeIcon icon={faPalette} className="mr-3 text-indigo-500" />
        Gestión de Colores
      </h1>

   
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/50 text-red-700 dark:text-red-200 rounded-xl shadow-md border border-red-200 dark:border-red-700 animate-fade-in">
          {error}
        </div>
      )}

    
      {loading && (
        <div className="mb-6 flex justify-center">
          <FontAwesomeIcon icon={faSpinner} className="text-indigo-500 text-3xl animate-spin" />
        </div>
      )}

   
      <div className="mb-8 flex justify-center sm:justify-start">
        <button
          onClick={() => {
            setIsAdding(!isAdding);
            setEditingColor(null);
            setNewColor({ name: "", hex: "#000000" });
            setError(null);
          }}
          className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all duration-300 flex items-center shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
          disabled={loading}
        >
          <FontAwesomeIcon icon={isAdding ? faTimes : faPlus} className="mr-2" />
          {isAdding ? "Cancelar" : "Agregar Color"}
        </button>
      </div>

    
      {(isAdding || editingColor) && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 mb-8 shadow-2xl border border-gray-200 dark:border-gray-700 animate-slide-down">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
            <FontAwesomeIcon icon={editingColor ? faEdit : faPlus} className="mr-3 text-indigo-500" />
            {editingColor ? "Editar Color" : "Agregar Nuevo Color"}
          </h2>
          <form onSubmit={editingColor ? handleSaveEdit : handleAddColor}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nombre del Color
                </label>
                <input
                  type="text"
                  name="name"
                  value={editingColor ? editingColor.name : newColor.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300 border border-gray-300 dark:border-gray-600"
                  placeholder="Ej. Rojo Vibrante"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Código Hexadecimal
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    name="hex"
                    value={editingColor ? editingColor.hex : newColor.hex}
                    onChange={handleInputChange}
                    className="w-12 h-12 rounded-lg cursor-pointer border border-gray-300 dark:border-gray-600"
                    disabled={loading}
                  />
                  <input
                    type="text"
                    name="hex"
                    value={editingColor ? editingColor.hex : newColor.hex}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300 border border-gray-300 dark:border-gray-600"
                    placeholder="Ej. #ff0000"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>
            <div className="mt-8 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <button
                type="submit"
                className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all duration-300 flex items-center shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                disabled={loading}
              >
                <FontAwesomeIcon icon={faSave} className="mr-2" />
                {editingColor ? "Guardar Cambios" : "Agregar Color"}
              </button>
              <button
                type="button"
                onClick={editingColor ? handleCancelEdit : () => setIsAdding(false)}
                className="px-5 py-2.5 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-all duration-300 flex items-center shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                disabled={loading}
              >
                <FontAwesomeIcon icon={faTimes} className="mr-2" />
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {currentColors.length === 0 && !loading ? (
          <p className="text-gray-500 dark:text-gray-400 col-span-full text-center text-lg">
            No hay colores registrados. ¡Agrega uno para comenzar!
          </p>
        ) : (
          currentColors.map((color) => (
            <div
              key={color.idColores}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 transform hover:scale-105"
            >
              <div className="flex items-center space-x-4">
                <div
                  className="w-16 h-16 rounded-lg border border-gray-300 dark:border-gray-600"
                  style={{ backgroundColor: color.codigoH || "#000000" }}
                ></div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                    {color.color}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {color.codigoH || "Sin código"}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex space-x-3">
                <button
                  onClick={() => handleEditColor(color)}
                  className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-all duration-300 flex items-center shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                  disabled={loading}
                >
                  <FontAwesomeIcon icon={faEdit} className="mr-2" />
                  Editar
                </button>
                <button
                  onClick={() => handleDeleteColor(color.idColores)}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-300 flex items-center shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                  disabled={loading}
                >
                  <FontAwesomeIcon icon={faTrash} className="mr-2" />
                  Eliminar
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all duration-300 flex items-center disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
          >
            <FontAwesomeIcon icon={faChevronLeft} className="mr-2" />
            Anterior
          </button>
          <div className="flex space-x-2">
            {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-4 py-2 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg ${
                  currentPage === page
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                }`}
              >
                {page}
              </button>
            ))}
          </div>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all duration-300 flex items-center disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
          >
            Siguiente
            <FontAwesomeIcon icon={faChevronRight} className="ml-2" />
          </button>
        </div>
      )}
    </div>
  );
};

export default ColorManager;