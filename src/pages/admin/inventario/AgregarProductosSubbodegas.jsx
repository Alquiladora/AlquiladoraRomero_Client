import React, { useState, useEffect } from "react";
import { FaPlus, FaCalendarAlt, FaImage, FaTimesCircle, FaSpinner } from "react-icons/fa";
import { toast } from "react-toastify";
import api from "../../../utils/AxiosConfig";
import { useAuth } from "../../../hooks/ContextAuth";

const AgregarProductosSubbodegas = ({ datosInventario }) => {
  const [filterDisponibilidad, setFilterDisponibilidad] = useState("all");
  const [filterMonth, setFilterMonth] = useState("all");
  const [filterYear, setFilterYear] = useState("all");

  const [loading, setLoading] = useState(true);
  const [groupedData, setGroupedData] = useState([]);
  const { csrfToken } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [selectedBodega, setSelectedBodega] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [bodegasSecundarias, SetBodegasSecundarias] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchBodegas();
  }, []);

  const fetchBodegas = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/inventario/bodegas", {
        withCredentials: true,
      });
      console.log("DATOS RECIBIDOS", res.data.bodegas);

      if (res.data && Array.isArray(res.data.bodegas)) {
        const secundarias = res.data.bodegas.filter((b) => b.es_principal === 0);
        SetBodegasSecundarias(secundarias);
      } else {
        SetBodegasSecundarias([]);
      }
    } catch (error) {
      console.error("Error fetching bodegas:", error);
    } finally {
      setLoading(false);
    }
  };

  const currentYear = new Date().getFullYear();
  const years = [];
  for (let y = currentYear - 5; y <= currentYear + 5; y++) {
    years.push(y);
  }

  useEffect(() => {
    groupByCategoria(datosInventario);
  }, [datosInventario, filterDisponibilidad, filterMonth, filterYear, currentPage]);

  const groupByCategoria = (productos) => {
    const filtrados = productos.filter((item) => applyFilters(item));

    const total = filtrados.length;
    setTotalPages(Math.ceil(total / itemsPerPage) || 1);

    const start = (currentPage - 1) * itemsPerPage;
    const paginated = filtrados.slice(start, start + itemsPerPage);

    const grouped = {};
    paginated.forEach((item) => {
      const cat = item.nombreCategoria || "Sin Categoría";
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(item);
    });

    setGroupedData(grouped);
  };

  const applyFilters = (item) => {
    // Mostrar únicamente productos de la tabla principal
    if (!item.es_principal) return false;

    if (filterDisponibilidad === "disponible") {
      if (item.estado?.toLowerCase() !== "activo" || item.stockReal <= 0) {
        return false;
      }
    } else if (filterDisponibilidad === "nodisponible") {
      if (item.estado?.toLowerCase() === "activo" && item.stockReal > 0) {
        return false;
      }
    }

    if (filterMonth !== "all" || filterYear !== "all") {
      const fecha = new Date(item.fechaRegistro);
      const mes = String(fecha.getMonth() + 1).padStart(2, "0");
      const anio = String(fecha.getFullYear());

      if (filterMonth !== "all" && filterMonth !== mes) {
        return false;
      }
      if (filterYear !== "all" && filterYear !== anio) {
        return false;
      }
    }

    return true;
  };

  const handleFilterDisponibilidad = (e) => {
    setFilterDisponibilidad(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterMonth = (e) => {
    setFilterMonth(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterYear = (e) => {
    setFilterYear(e.target.value);
    setCurrentPage(1);
  };

  const handleOpenModal = (producto) => {
    setSelectedProduct(producto);
    setSelectedBodega("");
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedProduct(null);
  };

  const handleAddToBodega = async () => {
    if (!selectedProduct || !selectedBodega) return;
    setIsAdding(true);
    try {
      const body = {
        idProducto: selectedProduct.idProducto,
        idBodega: selectedBodega,
        stockReal: 0,
        stock: 0,
        stockReservado: 0,
      };

      const resp = await api.post("/api/inventario/agregar-subbodega", body, {
        headers: { "X-CSRF-Token": csrfToken },
        withCredentials: true,
      });
      if (resp.data.success) {
        toast.success("Producto agregado correctamente a la bodega secundaria.");
        handleCloseModal();
      } else {
        toast.error(resp.data.message || "Error al agregar producto a la bodega.");
      }
    } catch (error) {
      console.error("Error al agregar producto a la bodega secundaria:", error);
      if (error.response && error.response.data) {
        toast.error(error.response.data.message || "Ocurrió un error al agregar el producto.");
      } else {
        toast.error("Ocurrió un error al agregar el producto.");
      }
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-3xl font-bold mb-6 text-yellow-600 text-center">
        Agregar Productos a Sub-Bodegas
      </h2>

      <div className="mb-4 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 p-3 bg-white dark:bg-gray-800 rounded shadow">
        <div className="flex flex-col sm:flex-row gap-4">
          <div>
            <label className="block text-sm font-semibold mb-1 dark:text-gray-300">
              Disponibilidad:
            </label>
            <select
              value={filterDisponibilidad}
              onChange={handleFilterDisponibilidad}
              className="border border-gray-300 dark:border-gray-700 rounded p-1 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
            >
              <option value="all">Todos</option>
              <option value="disponible">Disponible</option>
              <option value="nodisponible">No disponible</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1 dark:text-gray-300">
              Mes:
            </label>
            <select
              value={filterMonth}
              onChange={handleFilterMonth}
              className="border border-gray-300 dark:border-gray-700 rounded p-1 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
            >
              <option value="all">Todos</option>
              <option value="01">Enero</option>
              <option value="02">Febrero</option>
              <option value="03">Marzo</option>
              <option value="04">Abril</option>
              <option value="05">Mayo</option>
              <option value="06">Junio</option>
              <option value="07">Julio</option>
              <option value="08">Agosto</option>
              <option value="09">Septiembre</option>
              <option value="10">Octubre</option>
              <option value="11">Noviembre</option>
              <option value="12">Diciembre</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1 dark:text-gray-300">
              Año:
            </label>
            <select
              value={filterYear}
              onChange={handleFilterYear}
              className="border border-gray-300 dark:border-gray-700 rounded p-1 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
            >
              <option value="all">Todos</option>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {Object.keys(groupedData).length === 0 ? (
        <div className="flex flex-col justify-center items-center py-8">
          <FaImage className="text-4xl text-gray-500" />
          <p className="text-xl text-gray-600 dark:text-gray-300 mt-4">
            No hay productos que coincidan con los filtros
          </p>
        </div>
      ) : (
        Object.keys(groupedData).map((categoria) => (
          <div key={categoria} className="mb-8">
            <h3 className="bg-gray-200 dark:bg-gray-700 p-2 font-semibold text-gray-700 dark:text-gray-200 rounded-t">
              Categoría: {categoria}
            </h3>
            <div className="overflow-x-auto">
              <table className="table-auto w-full border border-gray-300 dark:border-gray-700">
                <thead className="bg-yellow-500 text-white text-sm">
                  <tr>
                    <th className="border border-gray-300 dark:border-gray-700 px-3 py-2 text-left">ID Producto</th>
                    <th className="border border-gray-300 dark:border-gray-700 px-3 py-2 text-left">Nombre</th>
                    <th className="border border-gray-300 dark:border-gray-700 px-3 py-2 text-left">Imagen</th>
                    <th className="border border-gray-300 dark:border-gray-700 px-3 py-2 text-left">Subcategoría</th>
                    <th className="border border-gray-300 dark:border-gray-700 px-3 py-2 text-left">Acción</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {groupedData[categoria].map((producto) => (
                    <tr
                      key={producto.idProducto}
                      className="hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-300 ease-in-out"
                    >
                      <td className="border border-gray-300 dark:border-gray-700 px-3 py-2">
                        {producto.idProducto}
                      </td>
                      <td className="border border-gray-300 dark:border-gray-700 px-3 py-2">
                        {producto.nombre}
                      </td>
                      <td className="border border-gray-300 dark:border-gray-700 px-3 py-2">
                        {producto.urlFoto ? (
                          <img
                            src={producto.urlFoto}
                            alt={producto.nombre}
                            className="w-16 h-auto object-contain rounded"
                          />
                        ) : (
                          <span className="text-gray-400 italic">Sin imagen</span>
                        )}
                      </td>
                      <td className="border border-gray-300 dark:border-gray-700 px-3 py-2">
                        {producto.nombreSubcategoria || "N/A"}
                      </td>
                      <td className="border border-gray-300 dark:border-gray-700 px-3 py-2">
                        <button
                          onClick={() => handleOpenModal(producto)}
                          className="flex items-center gap-1 bg-yellow-500 text-white py-1 px-3 rounded hover:bg-yellow-600 text-sm"
                        >
                          <FaPlus />
                          Agregar a Bodega
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4 flex-wrap">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded bg-gray-300 dark:bg-gray-600 text-black dark:text-white disabled:opacity-50"
          >
            Anterior
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-1 rounded ${
                currentPage === page
                  ? "bg-yellow-500 text-white"
                  : "bg-gray-300 dark:bg-gray-600 text-black dark:text-white"
              }`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded bg-gray-300 dark:bg-gray-600 text-black dark:text-white disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>
      )}

      {showModal && selectedProduct && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96 max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold mb-4 text-yellow-600">Agregar a Bodega Secundaria</h3>

            <div className="mb-4 text-gray-700 dark:text-gray-300">
              <strong>Producto:</strong> {selectedProduct.nombre}
            </div>

            <div className="mb-4">
              <label className="block mb-2 text-gray-700 dark:text-gray-300">
                Selecciona la bodega secundaria:
              </label>
              <select
                value={selectedBodega}
                onChange={(e) => setSelectedBodega(e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-700 p-2 rounded bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
              >
                <option value="">-- Selecciona una bodega --</option>
                {bodegasSecundarias
                  .filter((bod) => bod.estado !== "inactiva")
                  .map((bod) => (
                    <option key={bod.idBodega} value={bod.idBodega}>
                      {bod.nombre}
                    </option>
                  ))}
              </select>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleAddToBodega}
                disabled={!selectedBodega || isAdding}
                className={`py-2 px-4 rounded mr-2 flex items-center gap-2 ${
                  isAdding ? "bg-yellow-400" : "bg-yellow-500 hover:bg-yellow-600"
                } text-white`}
              >
                {isAdding ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Guardando...
                  </>
                ) : (
                  "Agregar"
                )}
              </button>
              <button
                onClick={handleCloseModal}
                disabled={isAdding}
                className="bg-gray-300 dark:bg-gray-600 text-black dark:text-white py-2 px-4 rounded hover:bg-gray-400 dark:hover:bg-gray-500"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgregarProductosSubbodegas;
