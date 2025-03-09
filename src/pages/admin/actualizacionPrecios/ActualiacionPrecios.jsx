import React, { useState, useEffect } from "react";
import {
  Plus,
  Trash,
  Edit2,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import api from "../../../utils/AxiosConfig";
import { toast } from "react-toastify";
import { useAuth } from "../../../hooks/ContextAuth";

function ListaPrecios({ items, onDelete, onEdit }) {
  return (
    <ul className="space-y-2 mt-3">
      {items.map((item) => (
        <li
        key={item.idProducto}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center  dark:bg-gray-700 p-6 rounded-xl hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
        >
          <div>
            <p className="text-gray-800 dark:text-gray-200 font-semibold font-bold text-x">
              {item.nombreProducto}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 ">
              Categoría: {item.nombreCategoria} – Subcategoría:{" "}
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
                onClick={() => onDelete(item.idProducto)}
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
// Lista de productos sin precio
function ListaProductosSinPrecio({ items }) {
  const grouped = items.reduce((acc, prod) => {
    const key = prod.nombreCategoria || "Sin categoría";
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(prod);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {Object.keys(grouped).map((cat) => (
        <div key={cat} className="dark:bg-gray-800 ">
          <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100 mb-2 border-b pb-1">
            {cat}
          </h3>
          <div className="flex flex-wrap gap-2">
            {grouped[cat].map((prod) => (
              <div
                key={prod.idProducto}
                className="bg-gray-50 dark:bg-gray-700 rounded-full px-3 py-1 inline-flex items-center transition-transform duration-300 hover:scale-105"
              >
                <span className="text-gray-900 dark:text-gray-200  whitespace-nowrap">
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
  const [modalType, setModalType] = useState("");
  const [precioAdquirido, setPrecioAdquirido] = useState("");
  const [diasAmortizacion, setDiasAmortizacion] = useState("");
  const [costoOperativo, setCostoOperativo] = useState("");
  const [margenPorcentaje, setMargenPorcentaje] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [editItem, setEditItem] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchValue, setSearchValue] = useState("");
  const itemsPerPage = 5;
  const [currentPageUnassigned, setCurrentPageUnassigned] = useState(1);
  const [searchValueUnassigned, setSearchValueUnassigned] = useState("");
  const itemsPerPageUnassigned = 5;
  const [isLoading, setIsLoading] = useState(true);
  const { user, logout, csrfToken } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/api/precios/precios", {
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
        precioAdquirido: item.precioAdquirido,
        precioAlquiler: item.precioAlquiler,
      }));
      setProductos(productosDerivados);
    } catch (error) {
      console.error("Error al obtener precios/productos:", error);
      toast.error("Error al cargar datos.");
    } finally {
      setIsLoading(false);
    }
  };

  const validatePrecioInput = () => {
    if (
      precioAdquirido === "" ||
      diasAmortizacion === "" ||
      costoOperativo === "" ||
      margenPorcentaje === "" ||
      !selectedProduct
    ) {
      return "Todos los campos son requeridos.";
    }
    const numPrecio = parseFloat(precioAdquirido);
    const numDias = parseInt(diasAmortizacion);
    const numCosto = parseFloat(costoOperativo);
    const numMargen = parseFloat(margenPorcentaje);

    if (
      !precioAdquirido ||
      isNaN(numPrecio) ||
      numPrecio <= 0 ||
      numPrecio > 1e8
    ) {
      return "Ingresa un precioAdquirido válido (mayor que 0 y menor a 100 millones).";
    }
    if (!diasAmortizacion || isNaN(numDias) || numDias <= 0) {
      return "Ingresa un número válido para Días de Amortización (mayor que 0).";
    }
    if (
      costoOperativo === "" ||
      isNaN(numCosto) ||
      numCosto < 0 ||
      numCosto > 1e8
    ) {
      return "Ingresa un Costo Operativo válido (0 o mayor, menor a 100 millones).";
    }
    if (
      margenPorcentaje === "" ||
      isNaN(numMargen) ||
      numMargen < 1 ||
      numMargen > 100
    ) {
      return "Ingresa un Margen Porcentual válido (entre 1 y 100).";
    }
    if (!selectedProduct) {
      return "Selecciona un producto.";
    }
    return { numPrecio, numDias, numCosto, numMargen };
  };

  const openAddModal = () => {
    setModalType("add");
    setEditItem(null);
    setPrecioAdquirido("");
    setDiasAmortizacion("");
    setCostoOperativo("");
    setMargenPorcentaje("");
    setSelectedProduct("");
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    console.log("Item", item);
    setModalType("edit");
    setEditItem(item);
    setPrecioAdquirido(item.precioAdquirido || "");
    setDiasAmortizacion(item.diasAmortizacion || "");
    setCostoOperativo(item.costoOperativo || "");
    setMargenPorcentaje(item.margenPorcentaje || "");
    setSelectedProduct(item.idProducto);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalType("");
    setPrecioAdquirido("");
    setDiasAmortizacion("");
    setCostoOperativo("");
    setMargenPorcentaje("");
    setSelectedProduct("");
    setEditItem(null);
  };

  const handleAddPrecio = async () => {
    const validationResult = validatePrecioInput();
    if (typeof validationResult === "string") {
      toast.warning(validationResult);
      return;
    }
    const { numPrecio, numDias, numCosto, numMargen } = validationResult;

    const yaAsignado = precios.some((p) => p.idProducto === selectedProduct);
    if (yaAsignado) {
      toast.warning("Este producto ya tiene un precio asignado.");
      return;
    }

    try {
      const response = await api.post(
        "/api/precios/",
        {
          idProducto: selectedProduct,
          precioAdquirido: numPrecio,
          diasAmortizacion: numDias,
          costoOperativo: numCosto,
          margenPorcentaje: numMargen,
        },
        {
          headers: { "X-CSRF-Token": csrfToken },
          withCredentials: true,
        }
      );

      setPrecios([...precios, response.data.nuevoPrecio]);
      toast.success("Precio asignado correctamente.");
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
        console.error("Error al asignar precio:", error);
        toast.error("Error al asignar precio.");
      }
    }
  };

  const handleEditPrecio = async () => {
    const numPrecio = parseFloat(precioAdquirido);
    if (!numPrecio || numPrecio <= 0) {
      toast.warning("Ingresa un precioAdquirido válido.");
      return;
    }
    try {
      await api.put(
        `/api/precios/${editItem.id}`,
        {
          idProducto: selectedProduct,
          precioAdquirido: parseFloat(precioAdquirido),
          diasAmortizacion: parseInt(diasAmortizacion) || 0,
          costoOperativo: parseFloat(costoOperativo) || 0,
          margenPorcentaje: parseFloat(margenPorcentaje) || 0,
        },
        {
          headers: { "X-CSRF-Token": csrfToken },
          withCredentials: true,
        }
      );
      toast.success("Precio actualizado correctamente.");
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
      console.error("Error al actualizar precio:", error);
      toast.error("Error al actualizar precio.");
    }
}
  };

  const handleSave = () => {
    if (modalType === "add") handleAddPrecio();
    else if (modalType === "edit") handleEditPrecio();
  };

  const handleDeletePrecio = async (id) => {
    
    if (!window.confirm("¿Estás seguro de eliminar este precio?")) return;
    try {
      await api.delete(`/api/precios/delete/${id}`, {
        headers: { "X-CSRF-Token": csrfToken },
        withCredentials: true,
      });
      toast.success("Precio eliminado correctamente.");
      fetchData();
    } catch (error) {
        if (
            error.response &&
            error.response.data &&
            error.response.data.message
          ) {
            toast.error(error.response.data.message);
          } else {
      console.error("Error al eliminar precio:", error);
      toast.error("Error al eliminar precio.");
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
    prod.nombre.toLowerCase().includes(searchValueUnassigned.toLowerCase())
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
      const input = document.getElementById("modal-precioAdquirido");
      if (input) input.focus();
    }
  }, [isModalOpen]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-700 dark:text-gray-300">
          Cargando datos...
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-8 max-w-screen-lg mx-auto dark:bg-gray-900 min-h-screen">
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6 border-l-4 border-yellow-500">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
          Actualización de Precios
        </h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6 border-l-4 border-green-500">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b pb-4 dark:border-gray-700 gap-4">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
              Precios Asignados
            </h2>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchValue}
                onChange={(e) => {
                  setSearchValue(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-9 pr-3 py-2 w-full border border-gray-300 rounded-lg 
                           focus:outline-none focus:ring-2 focus:ring-green-500 
                           transition duration-300 dark:bg-gray-700 dark:border-gray-600 
                           dark:text-gray-200"
              />
            </div>
            <button
              className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center"
              onClick={openAddModal}
            >
              <Plus className="w-5 h-5" />
              <span className="ml-1 text-sm">Agregar</span>
            </button>
          </div>

          <div className="mt-6">
            <ListaPrecios
              items={currentPreciosPage}
              onDelete={handleDeletePrecio}
              onEdit={openEditModal}
            />

            {currentPreciosPage.length === 0 && (
              <p className="text-gray-600 dark:text-gray-300">
                No hay precios asignados o no coinciden con la búsqueda.
              </p>
            )}

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

        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6 border-l-4 border-blue-500">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b pb-4 dark:border-gray-700 gap-4">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
              Productos sin precio
            </h2>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchValueUnassigned}
                onChange={(e) => {
                  setSearchValueUnassigned(e.target.value);
                  setCurrentPageUnassigned(1);
                }}
                className="pl-9 pr-3 py-2 w-full border border-gray-300 rounded-lg 
                           focus:outline-none focus:ring-2 focus:ring-blue-500 
                           transition duration-300 dark:bg-gray-700 dark:border-gray-600 
                           dark:text-gray-200"
              />
            </div>
          </div>

          <div className="mt-6">
            <ListaProductosSinPrecio items={currentUnassignedPage} />

            {currentUnassignedPage.length === 0 && (
              <p className="text-gray-600 dark:text-gray-300">
                No hay productos sin precio o no coinciden con la búsqueda.
              </p>
            )}

            {/* Paginación Productos sin precio */}
            <div className="flex items-center justify-center mt-4 gap-4">
              <button
                onClick={() =>
                  setCurrentPageUnassigned((prev) => Math.max(prev - 1, 1))
                }
                disabled={safeCurrentPageUnassigned === 1}
                className="flex items-center px-3 py-1 rounded-md bg-gray-200 dark:bg-gray-700 
                           hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors 
                           disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="ml-1">Anterior</span>
              </button>
              <span className="text-gray-700 dark:text-gray-300">
                Página {safeCurrentPageUnassigned} de{" "}
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
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-sm sm:max-w-md w-full shadow-lg transform transition-all duration-300">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              {modalType === "add" ? "Agregar Precio" : "Editar Precio"}
            </h3>

            {/* Precio Adquirido */}
            <label className="block text-gray-700 dark:text-gray-200 text-sm font-semibold mb-1">
              Precio Adquirido
            </label>
            <input
              id="modal-precioAdquirido"
              type="number"
              step="0.01"
              className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
              placeholder="Ej: 100.00"
              value={precioAdquirido}
              onChange={(e) => setPrecioAdquirido(e.target.value)}
            />

            {/* Días de Amortización */}
            <label className="block text-gray-700 dark:text-gray-200 text-sm font-semibold mt-3 mb-1">
              Días de Amortización
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              (Número de días para recuperar la inversión del producto)
            </p>
            <input
              type="number"
              className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
              placeholder="Ej: 30"
              value={diasAmortizacion}
              onChange={(e) => setDiasAmortizacion(e.target.value)}
            />

            {/* Costo Operativo */}
            <label className="block text-gray-700 dark:text-gray-200 text-sm font-semibold mt-3 mb-1">
              Costo Operativo
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              (Costo de mantenimiento o gastos operativos del producto)
            </p>
            <input
              type="number"
              step="0.01"
              className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
              placeholder="Ej: 20.00"
              value={costoOperativo}
              onChange={(e) => setCostoOperativo(e.target.value)}
            />

            {/* Margen Porcentaje */}
            <label className="block text-gray-700 dark:text-gray-200 text-sm font-semibold mt-3 mb-1">
              Margen Porcentaje
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              (Porcentaje de ganancia deseado, entre 1 y 100%)
            </p>
            <input
              type="number"
              step="0.01"
              className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
              placeholder="Ej: 15.00"
              value={margenPorcentaje}
              onChange={(e) => setMargenPorcentaje(e.target.value)}
            />

            {/* Producto */}
            <label className="block text-gray-700 dark:text-gray-200 text-sm font-semibold mt-3 mb-1">
              Producto
            </label>
            {modalType === "edit" ? (
              <input
                type="text"
                className="w-full border rounded-lg p-2 mt-1 bg-gray-200 text-gray-700 cursor-not-allowed"
                value={
                  productos.find((prod) => prod.idProducto === selectedProduct)
                    ? productos.find(
                        (prod) => prod.idProducto === selectedProduct
                      ).nombre
                    : ""
                }
                readOnly
              />
            ) : (
             
              <select
                className="w-full border rounded-lg p-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
              >
                <option value="">-- Selecciona un producto --</option>
                {productos
                  .filter(
                    (prod) =>
                      !precios.some(
                        (p) =>
                          p.idProducto === prod.idProducto &&
                          p.precioAlquiler &&
                          parseFloat(p.precioAlquiler) > 0
                      )
                  )
                  .map((prod) => (
                    <option key={prod.idProducto} value={prod.idProducto}>
                      {prod.nombre}
                    </option>
                  ))}
              </select>
            )}

            <div className="mt-6 flex justify-end gap-4">
              <button
                className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 transition-colors duration-200 dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-gray-200"
                onClick={closeModal}
              >
                Cancelar
              </button>
              <button
                className={`px-4 py-2 ${
                  modalType === "add"
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-yellow-500 hover:bg-yellow-600"
                } text-white rounded-lg transition-colors duration-200`}
                onClick={handleSave}
              >
                {modalType === "add" ? "Agregar" : "Editar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ActualizacionPrecios;
