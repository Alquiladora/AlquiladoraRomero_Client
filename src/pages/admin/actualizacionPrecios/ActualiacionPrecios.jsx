import React, { useState, useEffect } from 'react';
import {
  Plus,
  Trash,
  Edit2,
  Search,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import api from '../../../utils/AxiosConfig';
import { toast } from 'react-toastify';
import { useAuth } from '../../../hooks/ContextAuth';

function ListaPrecios({ items, onDelete, onEdit }) {
  return (
    <ul className="space-y-2 mt-3">
      {items.map((item) => (
        <li
          key={item.idPrecio} // Usar idPrecio como clave en lugar de idProducto
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center dark:bg-gray-700 p-6 rounded-xl hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
        >
          <div>
            <p className="text-gray-800 dark:text-gray-200 font-semibold font-bold text-x">
              {item.nombreProducto}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Categoría: {item.nombreCategoria} – Subcategoría:{' '}
              {item.nombreSubcategoria}
            </p>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-gray-700 dark:text-gray-200 mb-2">
              <strong>${item.precioAlquiler}</strong>
            </span>
            <div className="flex items-center gap-2">
              <button
                className="text-blue-500 hover:text-blue-700 dark:hover:text-blue-400 transition-colors duration-200"
                onClick={() => onEdit(item)}
              >
                <Edit2 className="w-5 h-5" />
              </button>
              <button
                className="text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors duration-200"
                onClick={() => onDelete(item.idPrecio)} // Usar idPrecio para eliminar
              >
                <Trash className="w-5 h-5" />
              </button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

function ListaProductosSinPrecio({ items }) {
  const grouped = items.reduce((acc, prod) => {
    const key = prod.nombreCategoria || 'Sin categoría';
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(prod);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {Object.keys(grouped).map((cat) => (
        <div key={cat} className="dark:bg-gray-800">
          <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100 mb-2 border-b pb-1">
            {cat}
          </h3>
          <div className="flex flex-wrap gap-2">
            {grouped[cat].map((prod) => (
              <div
                key={prod.idProducto}
                className="bg-gray-50 dark:bg-gray-700 rounded-full px-3 py-1 inline-flex items-center transition-transform duration-300 hover:scale-105"
              >
                <span className="text-gray-900 dark:text-gray-200 whitespace-nowrap">
                  {prod.nombre}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function ActualizacionPrecios() {
  const [precios, setPrecios] = useState([]);
  const [productos, setProductos] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('');
  const [precioAlquiler, setPrecioAlquiler] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [editItem, setEditItem] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchValue, setSearchValue] = useState('');
  const itemsPerPage = 5;
  const [currentPageUnassigned, setCurrentPageUnassigned] = useState(1);
  const [searchValueUnassigned, setSearchValueUnassigned] = useState('');
  const itemsPerPageUnassigned = 5;
  const [isLoading, setIsLoading] = useState(true);
  const { csrfToken } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/api/precios/precios', {
        withCredentials: true,
      });
      const datos = response.data.precios || [];
      setPrecios(datos);

      const productosDerivados = datos.map((item) => ({
        idProducto: item.idProducto,
        nombre: item.nombreProducto,
        idSubcategoria: item.idSubcategoria,
        nombreSubcategoria: item.nombreSubcategoria,
        idCategoria: item.idCategoria,
        nombreCategoria: item.nombreCategoria,
        precioAlquiler: item.precioAlquiler || null,
      }));
      setProductos(productosDerivados);
    } catch (error) {
      console.error('Error al obtener precios/productos:', error);
      toast.error('Error al cargar datos.');
    } finally {
      setIsLoading(false);
    }
  };

  const validatePrecioInput = () => {
    if (!selectedProduct) {
      return 'Selecciona un producto.';
    }
    const numPrecioAlquiler = parseFloat(precioAlquiler);
    if (!precioAlquiler || isNaN(numPrecioAlquiler) || numPrecioAlquiler <= 0) {
      return 'Ingresa un precio de alquiler válido (mayor que 0).';
    }
    return { numPrecioAlquiler };
  };

  const openAddModal = () => {
    setModalType('add');
    setEditItem(null);
    setPrecioAlquiler('');
    setSelectedProduct('');
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setModalType('edit');
    setEditItem(item);
    setPrecioAlquiler(item.precioAlquiler || '');
    setSelectedProduct(item.idProducto);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalType('');
    setPrecioAlquiler('');
    setSelectedProduct('');
    setEditItem(null);
  };

  const handleAddPrecio = async () => {
    const validationResult = validatePrecioInput();
    if (typeof validationResult === 'string') {
      toast.warning(validationResult);
      return;
    }
    const { numPrecioAlquiler } = validationResult;

    try {
      const response = await api.post(
        '/api/precios/',
        {
          idProducto: selectedProduct,
          precioAlquiler: numPrecioAlquiler,
        },
        {
          headers: { 'X-CSRF-Token': csrfToken },
          withCredentials: true,
        }
      );

      setPrecios([...precios, response.data.nuevoPrecio]);
      toast.success('Precio asignado correctamente.');
      fetchData();
      closeModal();
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        toast.error(error.response.data.message);
      } else {
        console.error('Error al asignar precio:', error);
        toast.error('Error al asignar precio.');
      }
    }
  };

  const handleEditPrecio = async () => {
    const validationResult = validatePrecioInput();
    if (typeof validationResult === 'string') {
      toast.warning(validationResult);
      return;
    }
    const { numPrecioAlquiler } = validationResult;

    try {
      const response = await api.put(
        `/api/precios/${editItem.idPrecio}`,
        {
          idProducto: selectedProduct,
          precioAlquiler: numPrecioAlquiler,
        },
        {
          headers: { 'X-CSRF-Token': csrfToken },
          withCredentials: true,
        }
      );
      console.log('Correcto actualizado precio', response);

      toast.success('Precio actualizado correctamente.');
      fetchData();
      closeModal();
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        toast.error(error.response.data.message);
      } else {
        console.error('Error al actualizar precio:', error);
        toast.error('Error al actualizar precio.');
      }
    }
  };

  const handleSave = () => {
    if (modalType === 'add') handleAddPrecio();
    else if (modalType === 'edit') handleEditPrecio();
  };

  const handleDeletePrecio = async (idPrecio) => {
    if (!window.confirm('¿Estás seguro de eliminar este precio?')) return;
    try {
      await api.delete(`/api/precios/delete/${idPrecio}`, {
        headers: { 'X-CSRF-Token': csrfToken },
        withCredentials: true,
      });
      toast.success('Precio eliminado correctamente.');
      fetchData();
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        toast.error(error.response.data.message);
      } else {
        console.error('Error al eliminar precio:', error);
        toast.error('Error al eliminar precio.');
      }
    }
  };

  const filteredPrecios = precios.filter(
    (p) =>
      p.nombreProducto?.toLowerCase().includes(searchValue.toLowerCase()) &&
      p.precioAlquiler &&
      parseFloat(p.precioAlquiler) > 0
  );

  const totalPages = Math.ceil(filteredPrecios.length / itemsPerPage);
  const safeCurrentPage = Math.min(currentPage, totalPages || 1);
  const startIndex = (safeCurrentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPreciosPage = filteredPrecios.slice(startIndex, endIndex);

  const productosConPrecio = new Set(
    precios
      .filter((p) => p.precioAlquiler && parseFloat(p.precioAlquiler) > 0)
      .map((p) => p.idProducto)
  );
  const productosSinPrecio = productos.filter(
    (prod) => !productosConPrecio.has(prod.idProducto)
  );

  const filteredUnassigned = productosSinPrecio.filter((prod) =>
    prod.nombre?.toLowerCase().includes(searchValueUnassigned.toLowerCase())
  );

  const totalPagesUnassigned = Math.ceil(
    filteredUnassigned.length / itemsPerPageUnassigned
  );
  const safeCurrentPageUnassigned = Math.min(
    currentPageUnassigned,
    totalPagesUnassigned || 1
  );
  const startIndexUnassigned =
    (safeCurrentPageUnassigned - 1) * itemsPerPageUnassigned;
  const endIndexUnassigned = startIndexUnassigned + itemsPerPageUnassigned;
  const currentUnassignedPage = filteredUnassigned.slice(
    startIndexUnassigned,
    endIndexUnassigned
  );

  useEffect(() => {
    if (isModalOpen) {
      const input = document.getElementById('modal-precioAlquiler');
      if (input) input.focus();
    }
  }, [isModalOpen]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center  dark:bg-gray-900">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-700 dark:text-gray-300">
          Cargando datos...
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 max-w-screen-xl mx-auto dark:bg-gray-900 ">
      <div className="  rounded-xl p-6 text-center transform transition-all duration-300 hover:scale-[1.01]">
        <h1 className="text-3xl font-extrabold dark:text-white tracking-tight">
          Actualización de Precios
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 border-l-4 border-green-500 transition-all duration-300 hover:shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-4 gap-4">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
              Precios Asignados
            </h2>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchValue}
                  onChange={(e) => {
                    setSearchValue(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-10 pr-4 py-2 w-full sm:w-64 border border-gray-300 dark:border-gray-600 rounded-lg 
                             focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent 
                             transition-all duration-300 dark:bg-gray-700 dark:text-gray-200 placeholder-gray-400"
                />
              </div>
              <button
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-all duration-300 flex items-center gap-2 shadow-md"
                onClick={openAddModal}
              >
                <Plus className="w-5 h-5" />
                <span className="text-sm font-medium">Agregar</span>
              </button>
            </div>
          </div>

          <div className="mt-6">
            <ListaPrecios
              items={currentPreciosPage}
              onDelete={handleDeletePrecio}
              onEdit={openEditModal}
            />

            {currentPreciosPage.length === 0 && (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                No hay precios asignados o no coinciden con la búsqueda.
              </p>
            )}

            {/* Paginación */}
            <div className="flex items-center justify-center mt-6 gap-3">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={safeCurrentPage === 1}
                className="flex items-center px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 
                           hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-300 
                           disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                <ChevronLeft className="w-5 h-5" />
                <span className="ml-2 text-sm font-medium">Anterior</span>
              </button>
              <span className="text-gray-700 dark:text-gray-300 font-medium">
                Página {safeCurrentPage} de {totalPages || 1}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={safeCurrentPage === totalPages || totalPages === 0}
                className="flex items-center px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 
                           hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-300 
                           disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                <span className="mr-2 text-sm font-medium">Siguiente</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Sección de Productos sin Precio */}
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 border-l-4 border-blue-500 transition-all duration-300 hover:shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-4 gap-4">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
              Productos sin Precio
            </h2>
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchValueUnassigned}
                onChange={(e) => {
                  setSearchValueUnassigned(e.target.value);
                  setCurrentPageUnassigned(1);
                }}
                className="pl-10 pr-4 py-2 w-full sm:w-64 border border-gray-300 dark:border-gray-600 rounded-lg 
                           focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent 
                           transition-all duration-300 dark:bg-gray-700 dark:text-gray-200 placeholder-gray-400"
              />
            </div>
          </div>

          <div className="mt-6">
            <ListaProductosSinPrecio items={currentUnassignedPage} />

            {currentUnassignedPage.length === 0 && (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                No hay productos sin precio o no coinciden con la búsqueda.
              </p>
            )}

            {/* Paginación */}
            <div className="flex items-center justify-center mt-6 gap-3">
              <button
                onClick={() =>
                  setCurrentPageUnassigned((prev) => Math.max(prev - 1, 1))
                }
                disabled={safeCurrentPageUnassigned === 1}
                className="flex items-center px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 
                           hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-300 
                           disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                <ChevronLeft className="w-5 h-5" />
                <span className="ml-2 text-sm font-medium">Anterior</span>
              </button>
              <span className="text-gray-700 dark:text-gray-300 font-medium">
                Página {safeCurrentPageUnassigned} de{' '}
                {totalPagesUnassigned || 1}
              </span>
              <button
                onClick={() =>
                  setCurrentPageUnassigned((prev) =>
                    Math.min(prev + 1, totalPagesUnassigned)
                  )
                }
                disabled={
                  safeCurrentPageUnassigned === totalPagesUnassigned ||
                  totalPagesUnassigned === 0
                }
                className="flex items-center px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 
                           hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-300 
                           disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                <span className="mr-2 text-sm font-medium">Siguiente</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal para Agregar/Editar Precio */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50 transition-opacity duration-300">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl max-w-md w-full shadow-2xl transform transition-all duration-300 scale-100">
            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">
              {modalType === 'add' ? 'Agregar Precio' : 'Editar Precio'}
            </h3>

            {/* Precio de Alquiler */}
            <label className="block text-gray-700 dark:text-gray-200 text-sm font-medium mb-2">
              Precio de Alquiler
            </label>
            <input
              id="modal-precioAlquiler"
              type="number"
              step="0.01"
              min="0.01"
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-200 placeholder-gray-400 transition-all duration-300"
              placeholder="Ej: 50.00"
              value={precioAlquiler}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '' || parseFloat(value) > 0) {
                  setPrecioAlquiler(value);
                }
              }}
            />

            {/* Producto */}
            <label className="block text-gray-700 dark:text-gray-200 text-sm font-medium mt-4 mb-2">
              Producto
            </label>
            {modalType === 'edit' ? (
              <input
                type="text"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 cursor-not-allowed"
                value={
                  productos.find((prod) => prod.idProducto === selectedProduct)
                    ?.nombre || ''
                }
                readOnly
              />
            ) : (
              <select
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-200 transition-all duration-300"
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
              >
                <option value="">-- Selecciona un producto --</option>
                {productosSinPrecio.map((prod) => (
                  <option key={prod.idProducto} value={prod.idProducto}>
                    {prod.nombre}
                  </option>
                ))}
              </select>
            )}

            {/* Botones del Modal */}
            <div className="mt-8 flex justify-end gap-4">
              <button
                className="px-5 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-all duration-300 shadow-sm"
                onClick={closeModal}
              >
                Cancelar
              </button>
              <button
                className={`px-5 py-2 ${
                  modalType === 'add'
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-yellow-500 hover:bg-yellow-600'
                } text-white rounded-lg transition-all duration-300 shadow-sm`}
                onClick={handleSave}
              >
                {modalType === 'add' ? 'Agregar' : 'Editar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ActualizacionPrecios;
