import React, { useState, useEffect, memo } from "react";
import {
  Plus,
  Trash,
  Package,
  List,
  X,
  Search,
  ChevronLeft,
  ChevronRight,
  Edit2,
} from "lucide-react";
import api from "../../../utils/AxiosConfig";
import { useAuth } from "../../../hooks/ContextAuth";
import CustomLoading from "../../../components/spiner/SpinerGlobal";
import { toast } from "react-toastify";

function ListaItems({ items, onDelete, onEdit }) {
  return (
    <ul className="space-y-2 mt-3">
      {items.map((item) => (
        <li
          key={item.id}
          className="flex justify-between items-center bg-gray-50 dark:bg-gray-700 p-3 rounded-lg 
                     hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-200"
        >
          <span className="text-gray-700 dark:text-gray-200">
            {item.nombre}
          </span>
          <div className="flex items-center gap-2">
            <button
              className="text-blue-500 hover:text-blue-700 dark:hover:text-blue-400 transition-colors duration-200"
              onClick={() => onEdit(item)}
            >
              <Edit2 className="w-5 h-5" />
            </button>

            {/* <button
              className="text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors duration-200"
              onClick={() => onDelete(item.id)}
            >
              <Trash className="w-5 h-5" />
            </button> */}
          </div>
        </li>
      ))}
    </ul>
  );
}

function CrudSubcategorias() {
  const [subcategorias, setSubcategorias] = useState([]);
  const [categorias, setCategorias] = useState([ ]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const { user, csrfToken } = useAuth();

  
  const [subcatSearch, setSubcatSearch] = useState("");
  const [catSearch, setCatSearch] = useState("")

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;


  const [isLoading, setIsLoading] = useState(true);

  const [isEditMode, setIsEditMode] = useState(false);
  const [editItem, setEditItem] = useState(null);


  useEffect(() => {
    
  
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [subRes, catRes] = await Promise.all([
        api.get("/api/productos/subcategorias", { withCredentials: true }),
        api.get("/api/productos/categorias", { withCredentials: true }),
      ]);
      setSubcategorias(subRes.data.subcategories);
      setCategorias(catRes.data.categorias);
    } catch (error) {
      console.error("Error al obtener la información:", error);
    } finally {
      setIsLoading(false);
    }
  };
  



  const openModal = (type) => {
    setModalType(type);
    if (type === "subcategoria") {
        setInputValue("");
        setSelectedCategory("");
      }
      setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalType("");
    setInputValue("");
    setIsEditMode(false);
    setEditItem(null);
  };


  const handleAdd = async () => {
    if (!inputValue.trim()) {
      toast.warning("Por favor, ingresa un nombre válido.");
      return;
    }
    
    try {
      if (modalType === "categoria") {
        const response = await api.post(
          "/api/productos/categoria",
          { nombre: inputValue },
          {
            headers: { "X-CSRF-Token": csrfToken },
            withCredentials: true,
          }
        );
        setCategorias([...categorias, response.data]);
        fetchData()
        toast.success("Categoría agregada correctamente.");
      } else if (modalType === "subcategoria") {
        console.log("ID de categoría seleccionado:", selectedCategory);

        const response = await api.post(
          "/api/productos/subcategoria",
          {
            nombre: inputValue,
            idCategoria: selectedCategory,
          },
          {
            headers: { "X-CSRF-Token": csrfToken },
            withCredentials: true,
          }
        );
        setSubcategorias([...subcategorias, response.data]);
        fetchData()
        toast.success("Subcategoría agregada correctamente.");
      }
      closeModal();
    } catch (error) {
    if (error.response && error.response.data && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Error al agregar la categoría o subcategoría.");
      }
      console.error("Error al agregar:", error);
    }
  };
  

  const handleUpdate = async () => {
    if (!editItem || !inputValue.trim()) {
      toast.warning("Por favor, ingresa un valor.");
      return;
    }
    try {
      if (modalType === "categoria") {
        await api.put(
            `/api/productos/categoria/${editItem.id}`,
            { nombre: inputValue },
            {
              headers: { "X-CSRF-Token": csrfToken },
              withCredentials: true,
            }
          );
          setCategorias((prev) =>
            prev.map((cat) =>
              cat.id === editItem.id ? { ...cat, nombre: inputValue } : cat
            )
          );
          toast.success("Categoría actualizada correctamente.");
          fetchData()
      } else if (modalType === "subcategoria") {
        await api.put(
            `/api/productos/subcategoria/${editItem.id}`,
            { nombre: inputValue, idCategoria: selectedCategory },
            {
              headers: { "X-CSRF-Token": csrfToken },
              withCredentials: true,
            }
          );
          setSubcategorias((prev) =>
            prev.map((sub) =>
              sub.id === editItem.id
                ? { ...sub, nombre: inputValue, idCategoria: selectedCategory }
                : sub
            )
          );
          fetchData()
          toast.success("Subcategoría actualizada correctamente.");
        }
        closeModal();
    } catch (error) {
        if (error.response && error.response.data && error.response.data.message) {
            toast.error(error.response.data.message);
          } else {
            toast.error("Error al actualizar la categoría o subcategoría.");
          }
      console.error("Error al actualizar:", error);
    }
  };



  const handleEditSubcategoria = (sub, categoryName) => {
    console.log("Datos obtenidos a actualizar ", sub.label, sub.id, sub.idCategoria, categoryName)
    setIsEditMode(true);
    setModalType("subcategoria");
    setEditItem(sub);
    setInputValue(sub.label || "");
    const foundCat = categorias.find(
        (cat) =>
          cat.nombre.trim().toLowerCase() === categoryName.trim().toLowerCase()
      );
      setSelectedCategory(foundCat ? foundCat.id : "");
    setIsModalOpen(true);
  };


  const handleEditCategory = (cat) => {
    setIsEditMode(true);
    setModalType("categoria");
    setEditItem(cat);
    setInputValue(cat.nombre || "");
    setIsModalOpen(true);
  };


  const filteredCategories = categorias.filter((cat) =>
    cat.nombre && cat.nombre.toLowerCase().includes(catSearch.toLowerCase())
  );
  
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);

  const safeCurrentPage = Math.min(currentPage, totalPages || 1);
  const startIndex = (safeCurrentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPageCategories = filteredCategories.slice(startIndex, endIndex);

  const subcategoriasPorCategoria = subcategorias
  .map((group) => ({
    ...group,
    subcats: (group.subcats || []).filter((sub) =>
      sub.label && sub.label.toLowerCase().includes(subcatSearch.toLowerCase())
    ),
  }))
  .filter((group) => group.subcats.length > 0);


  const allFilteredSubcats = subcategorias.reduce((acc, group) => {
    if (group.subcats) {
      return acc.concat(
        group.subcats.filter(
          (sub) => sub.label && sub.label.toLowerCase().includes(subcatSearch.toLowerCase())
        )
      );
    }
    return acc;
  }, []);



  useEffect(() => {
    if (isModalOpen) {
      const input = document.getElementById("modal-input");
      if (input) input.focus();
    }
  }, [isModalOpen]);


  if (isLoading) {
    return (
    
     < CustomLoading/>
     
    );
  }

  return (
    <div className="p-4 space-y-8 max-w-screen-lg mx-auto dark:bg-gray-900 min-h-screen">
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6 border-l-4 border-yellow-500">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
          Administración de Categorías y Subcategorías
        </h1>
      </div>

      {/* Sección Categorías */}
      <div
        className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6 
                   border-l-4 border-green-500"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b pb-4 dark:border-gray-700 gap-4">
          {/* Título con ícono */}
          <div className="flex items-center space-x-2">
            <Package className="w-6 h-6 text-green-500" />
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
              Categorías
            </h2>
          </div>
          {/* Buscador de categorías */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar categorías..."
              value={catSearch}
              onChange={(e) => {
                setCatSearch(e.target.value);
                setCurrentPage(1); 
              }}
              className="pl-9 pr-3 py-2 w-full border border-gray-300 rounded-lg 
                         focus:outline-none focus:ring-2 focus:ring-green-500 
                         transition duration-300 dark:bg-gray-700 dark:border-gray-600 
                         dark:text-gray-200"
            />
          </div>
          {/* Botón Agregar */}
          <button
            className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 
                       transition-colors duration-200 flex items-center"
            onClick={() => {
              setIsEditMode(false);
              openModal("categoria");
            }}
          >
            <Plus className="w-5 h-5" />
            <span className="ml-1 text-sm">Agregar</span>
          </button>
        </div>

        {/* Lista de categorías con paginación */}
        <div className="mt-6">
          {/* Se pasa onEdit al componente ListaItems */}
          <ListaItems
            items={currentPageCategories}
            // onDelete={handleDeleteCategoria}
            onEdit={handleEditCategory}
          />

          {currentPageCategories.length === 0 && (
            <p className="text-gray-600 dark:text-gray-300">
              No hay categorías registradas o no coinciden con la búsqueda.
            </p>
          )}

          {/* Controles de paginación */}
          <div className="flex items-center justify-center mt-4 gap-4">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={safeCurrentPage === 1}
              className="flex items-center px-3 py-1 rounded-md bg-gray-200 dark:bg-gray-700 
                         hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors 
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="ml-1">Anterior</span>
            </button>
            <span className="text-gray-700 dark:text-gray-300">
              Página {safeCurrentPage} de {totalPages || 1}
            </span>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={safeCurrentPage === totalPages || totalPages === 0}
              className="flex items-center px-3 py-1 rounded-md bg-gray-200 dark:bg-gray-700 
                         hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors 
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="mr-1">Siguiente</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Sección Subcategorías */}
      <div
        className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6 
                   border-l-4 border-blue-500"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b pb-4 dark:border-gray-700 gap-4">
          {/* Título con ícono */}
          <div className="flex items-center space-x-2">
            <List className="w-6 h-6 text-blue-500" />
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
              Subcategorías
            </h2>
          </div>
          {/* Filtro subcategorías */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar subcategorías..."
              value={subcatSearch}
              onChange={(e) => setSubcatSearch(e.target.value)}
              className="pl-9 pr-3 py-2 w-full border border-gray-300 rounded-lg 
                         focus:outline-none focus:ring-2 focus:ring-blue-500 
                         transition duration-300 dark:bg-gray-700 dark:border-gray-600 
                         dark:text-gray-200"
            />
          </div>
          {/* Botón Agregar */}
          <button
            className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors 
                       duration-200 flex items-center"
            onClick={() => {
              setIsEditMode(false);
              openModal("subcategoria");
            }}
          >
            <Plus className="w-5 h-5" />
            <span className="ml-1 text-sm">Agregar</span>
          </button>
        </div>

        {/* Agrupación por categoría, mostrando chips de subcategorías */}
        <div className="mt-6 space-y-6">
          {subcategoriasPorCategoria.map(({ categoryName, subcats }) => (
            <div key={categoryName}>
              <h3 className="font-semibold text-gray-700 dark:text-gray-300 text-lg mb-2">
                {categoryName}
              </h3>
              <div className="flex flex-wrap gap-2">
                {subcats.map((sub) => (
                  <div
                    key={sub.id}
                    className="flex items-center bg-blue-100 text-blue-700 
                     px-3 py-1 rounded-full 
                     hover:bg-blue-200 transition-colors duration-200"
                  >
                    <span className="mr-2">{sub.label}</span>
                    <button
                      onClick={() => handleEditSubcategoria(sub, categoryName)}
                      className="text-blue-700 hover:text-green-600 transition-colors mr-2"
                    >
                      <Edit2 size={16} />
                    </button>
                    {/* <button
                      onClick={() => handleDeleteSubcategoria(sub.id)}
                      className="text-blue-700 hover:text-red-600 transition-colors"
                    >
                      <X size={16} />
                    </button> */}
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Si no hay subcategorías, mostrar mensaje */}
          {allFilteredSubcats.length === 0 && (
            <p className="text-gray-600 dark:text-gray-300">
              No hay subcategorías registradas o no coinciden con la búsqueda.
            </p>
          )}
        </div>
      </div>

      {/* Modal (agregar o editar subcategoría/categoría) */}
      {isModalOpen && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
    <div
      className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-sm sm:max-w-md w-full 
                 shadow-lg transform transition-all duration-300"
    >
      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
        {isEditMode
          ? `Editar ${modalType === "subcategoria" ? "Subcategoría" : "Categoría"}`
          : `Agregar ${modalType === "subcategoria" ? "Subcategoría" : "Categoría"}`}
      </h3>

      {/* Campo de texto para nombre */}
      <input
        id="modal-input"
        type="text"
        className="w-full border rounded-lg p-3 mt-2 focus:outline-none 
                   focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 
                   dark:border-gray-600 dark:text-gray-200"
        placeholder={`Nombre de la ${modalType === "subcategoria" ? "subcategoría" : "categoría"}`}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}      
      />

     
      {modalType === "subcategoria" && (
        <select
          className="w-full border rounded-lg p-3 mt-2 focus:outline-none 
                     focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 
                     dark:border-gray-600 dark:text-gray-200"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="" disabled>
            Selecciona una categoría
          </option>
          {categorias.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.nombre}
            </option>
          ))}
        </select>
      )}

      <div className="mt-6 flex justify-end gap-4">
        <button
          className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 
                     transition-colors duration-200 dark:bg-gray-600 
                     dark:hover:bg-gray-500 dark:text-gray-200"
          onClick={closeModal}
        >
          Cancelar
        </button>
        {isEditMode ? (
          <button
            className="px-4 py-2 bg-yellow-500 text-white rounded-lg 
                       hover:bg-yellow-600 transition-colors duration-200"
            onClick={() => {
              if (modalType === "subcategoria" && !selectedCategory) {
                toast.warning("Por favor selecciona una categoría.");
                return;
              }
              handleUpdate();
            }}
          >
            Editar
          </button>
        ) : (
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-lg 
                       hover:bg-blue-700 transition-colors duration-200"
            onClick={() => {
              if (modalType === "subcategoria" && !selectedCategory) {
                toast.warning("Por favor selecciona una categoría.");
                return;
              }
              handleAdd();
            }}
          >
            Agregar
          </button>
        )}
      </div>
    </div>
  </div>
)}


    </div>
  );
}

export default CrudSubcategorias;
