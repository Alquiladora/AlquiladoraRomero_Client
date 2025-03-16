import React, { useState, useEffect } from "react";
import axios from "axios";
import api from "../../../utils/AxiosConfig";
import { useAuth } from "../../../hooks/ContextAuth";
import {
  FaEdit,
  FaEye,
  FaPlus,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaSpinner,
  FaBoxOpen,
  FaHashtag,
  FaBox,
  FaImage,
  FaPalette,
  FaCubes,
  FaStore,
  FaMapMarkerAlt,
  FaSortNumericDown,
  FaLock,
  FaMoneyBillAlt,
  FaTags,
  FaStickyNote,
  FaUser,
  FaCalendarAlt,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

const ITEMS_PER_PAGE = 10;

const splitBlock = (block, itemsPerPage) => {
  const pages = [];
  let start = 0;
  pages.push(block.slice(0, itemsPerPage));
  start = itemsPerPage;

  while (start < block.length) {
    const header = block[0];
    const remainingSlots = itemsPerPage - 1;
    const slice = block.slice(start, start + remainingSlots);
    pages.push([header, ...slice]);
    start += remainingSlots;
  }
  return pages;
};

const paginateGroupedInventory = (grouped, itemsPerPage) => {
  const pages = [];
  let currentPage = [];
  for (const cat in grouped) {
    const block = [
      { type: "category", cat },
      ...grouped[cat].map((item) => ({ type: "item", item })),
    ];

    if (block.length > itemsPerPage) {
      if (currentPage.length > 0) {
        pages.push(currentPage);
        currentPage = [];
      }
      const blockPages = splitBlock(block, itemsPerPage);
      pages.push(...blockPages);
    } else {
      if (currentPage.length + block.length > itemsPerPage) {
        pages.push(currentPage);
        currentPage = [...block];
      } else {
        currentPage = currentPage.concat(block);
      }
    }
  }
  if (currentPage.length > 0) {
    pages.push(currentPage);
  }
  return pages;
};

const aggregateInventory = (items) => {
  return Object.values(
    items.reduce((acc, item) => {
      const key = `${item.nombreCategoria || "Sin Categoría"}|${item.nombre}`;
      if (!acc[key]) {
        acc[key] = {
          ...item,
          stock: Number(item.stock),
          stockReal: Number(item.stockReal),
          stockReservado: Number(item.stockReservado),
          variants: [item],
        };
      } else {
        acc[key].stock += Number(item.stock);
        acc[key].stockReal += Number(item.stockReal);
        acc[key].stockReservado += Number(item.stockReservado);
        acc[key].variants.push(item);
      }
      return acc;
    }, {})
  );
};

const Inventatio = ({ onNavigate, setDatosInventario }) => {
  const [inventory, setInventory] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [editStock, setEditStock] = useState(0);
  const [filterEstado, setFilterEstado] = useState("all");
  const [filterMonth, setFilterMonth] = useState("all");
  const [filterYear, setFilterYear] = useState("all");
  const [currentPageMain, setCurrentPageMain] = useState(1);
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentPageSecondary, setCurrentPageSecondary] = useState({});
  const [bodegas, setBodegas] = useState([]);
  const [loading, setLoading] = useState(true);

  const { csrfToken } = useAuth();

  useEffect(() => {
    fetchInventory();
    fetchBodegas();
  }, []);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/inventario/", {
        headers: { "X-CSRF-Token": csrfToken },
        withCredentials: true,
      });
      console.log("DATOS RECIBIDOS", res.data);
      setInventory(res.data);
      setDatosInventario(res.data);
    } catch (error) {
      console.error("Error fetching inventory:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBodegas = async () => {
    try {
      const res = await api.get("/api/inventario/bodegas", {
        headers: { "X-CSRF-Token": csrfToken },
        withCredentials: true,
      });
      console.log("datos ", res.data.bodegas);
      setBodegas(res.data.bodegas);
    } catch (error) {
      console.error("Error fetching bodegas:", error);
    }
  };

  const isSubBodegaInactive = (idBodega) => {
    const subBodega = bodegas.find((b) => b.idBodega === idBodega);
    if (!subBodega) return false;
    return subBodega.estado && subBodega.estado.toLowerCase() === "inactiva";
  };

  const applyFilters = (items) => {
    return items.filter((item) => {
      if (filterEstado !== "all") {
        if (item.estado?.toLowerCase() !== filterEstado) {
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
    });
  };

  const mainInventoryRaw = inventory.filter((item) => item.es_principal === 1);
  const secondaryInventoryRaw = inventory.filter(
    (item) => item.es_principal === 0
  );

  const mainInventoryFiltered = applyFilters(mainInventoryRaw);
  const secondaryInventoryFiltered = applyFilters(secondaryInventoryRaw);

  const aggregatedMainInventory = aggregateInventory(mainInventoryFiltered);
  const mainInventoryGroupedByCategory = aggregatedMainInventory.reduce(
    (acc, item) => {
      const category = item.nombreCategoria || "Sin Categoría";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
      return acc;
    },
    {}
  );

  const mainInventoryPages = paginateGroupedInventory(
    mainInventoryGroupedByCategory,
    ITEMS_PER_PAGE
  );
  const totalMainPages = mainInventoryPages.length;
  const mainInventoryPage = mainInventoryPages[currentPageMain - 1] || [];

  const handlePageChangeMain = (page) => {
    if (page >= 1 && page <= totalMainPages) {
      setCurrentPageMain(page);
    }
  };

  /* ===== AGREGACIÓN PARA INVENTARIO SECUNDARIO =====
     Primero se agrupa por bodega y luego se agrega cada grupo
  */
  const secondaryByBodega = secondaryInventoryFiltered.reduce((acc, item) => {
    const bodega = item.nombreBodega || "Sin Bodega";
    if (!acc[bodega]) {
      acc[bodega] = [];
    }
    acc[bodega].push(item);
    return acc;
  }, {});
  // Se agrega cada grupo de inventario secundario
  const aggregatedSecondaryByBodega = {};
  for (const bodega in secondaryByBodega) {
    aggregatedSecondaryByBodega[bodega] = aggregateInventory(
      secondaryByBodega[bodega]
    );
  }

  // Función para agrupar por categoría (se usa en inventario secundario)
  const groupByCategory = (items) => {
    return items.reduce((acc, item) => {
      const category = item.nombreCategoria || "Sin Categoría";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
      return acc;
    }, {});
  };

  const handlePageChangeSecondary = (bodega, page, totalPages) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPageSecondary((prev) => ({
        ...prev,
        [bodega]: page,
      }));
    }
  };


  const openEditModal = (item) => {
    setSelectedItem(item);
    if (item.variants && item.variants.length > 1) {
      const stocks = {};
      item.variants.forEach((variant) => {
        stocks[variant.idInventario] = variant.stock;
      });
      setEditStock(stocks);
    } else {
      setEditStock(item.stock);
    }
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setSelectedItem(null);
  };

  const openDetailModal = (item) => {
    setSelectedItem(item);
    setShowDetailModal(true);
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedItem(null);
  };

  const updateStock = async () => {
    if (!selectedItem) return;
    setIsUpdating(true);
    try {
      if (selectedItem.variants && selectedItem.variants.length > 1) {
        const updatePromises = selectedItem.variants.map((variant) => {
          const stockToAdd = Number(editStock[variant.idInventario]);
          if (isNaN(stockToAdd) || stockToAdd < 0) {
            toast.error(
              `El valor de stock para la variante ${
                variant.color || "Sin color"
              } debe ser 0 o mayor.`
            );
            return Promise.reject();
          }
          return api.put(
            `/api/inventario/actualizarStock/${variant.idInventario}`,
            { stock: stockToAdd, allowZero: true },
            {
              headers: { "X-CSRF-Token": csrfToken },
              withCredentials: true,
            }
          );
        });

        const responses = await Promise.all(updatePromises);
        let updatedInventory = [...inventory];
        selectedItem.variants.forEach((variant, index) => {
          const resData = responses[index].data;
          if (resData.success) {
            updatedInventory = updatedInventory.map((inv) =>
              inv.idInventario === variant.idInventario
                ? {
                    ...inv,
                    stock: resData.data.stock,
                    stockReal: resData.data.stockReal,
                  }
                : inv
            );
          } else {
            toast.error(
              `Error al actualizar la variante ${variant.color || "Sin color"}`
            );
          }
        });
        setInventory(updatedInventory);
        toast.success(
          "Stock actualizado correctamente para todas las variantes"
        );
      } else {
        const stockToAdd = Number(editStock);
        if (isNaN(stockToAdd) || stockToAdd <= 0) {
          toast.error("El valor de 'stock' debe ser un número mayor que 0.");
          setIsUpdating(false);
          return;
        }
        const response = await api.put(
          `/api/inventario/actualizarStock/${selectedItem.idInventario}`,
          { stock: stockToAdd, allowZero: false },
          {
            headers: { "X-CSRF-Token": csrfToken },
            withCredentials: true,
          }
        );
        const { success, message, data } = response.data;
        if (success) {
          setInventory(
            inventory.map((inv) =>
              inv.idInventario === selectedItem.idInventario
                ? { ...inv, stock: data.stock, stockReal: data.stockReal }
                : inv
            )
          );
          toast.success(message || "Se actualizó correctamente el stock");
        } else {
          toast.error(message || "Error al actualizar el stock");
        }
      }
    } catch (error) {
      console.error("Error updating stock:", error);
      toast.error("Error actualizando el stock");
    } finally {
      setIsUpdating(false);
      closeEditModal();
    }
  };

  const confirmDesactivar = async (item) => {
    if (
      window.confirm(
        "¿Quieres desactivar este producto en tu inventario? Se desactivará todo lo relacionado con esto."
      )
    ) {
      try {
        await axios.put(`/api/inventario/desactivar/${item.idInventario}`);
        setInventory(
          inventory.map((invItem) =>
            invItem.idInventario === item.idInventario
              ? { ...invItem, estado: "inactivo" }
              : invItem
          )
        );
      } catch (error) {
        console.error("Error desactivando el producto:", error);
      }
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleString();
  };

  const renderStock = (stock) => {
    if (stock === 0) {
      return (
        <span className="text-red-500 flex items-center gap-1">
          <FaExclamationTriangle /> {stock}
        </span>
      );
    } else if (stock < 10) {
      return <span className="text-orange-500">{stock}</span>;
    }
    return <span>{stock}</span>;
  };

  const renderEstado = (estado) => {
    if (!estado) return <span>Desconocido</span>;
    if (
      estado.toLowerCase() === "activo" ||
      estado.toLowerCase() === "activa"
    ) {
      return (
        <span className="text-green-500 flex items-center gap-1 transition-all">
          <FaCheckCircle /> {estado}
        </span>
      );
    } else if (
      estado.toLowerCase() === "inactivo" ||
      estado.toLowerCase() === "inactiva"
    ) {
      return (
        <span className="text-red-500 flex items-center gap-1 transition-all">
          <FaTimesCircle /> {estado}
        </span>
      );
    }
    return <span>{estado}</span>;
  };

  // Filtros
  const handleFilterEstado = (e) => {
    setFilterEstado(e.target.value);
    setCurrentPageMain(1);
    setCurrentPageSecondary({});
  };

  const handleFilterMonth = (e) => {
    setFilterMonth(e.target.value);
    setCurrentPageMain(1);
    setCurrentPageSecondary({});
  };

  const handleFilterYear = (e) => {
    setFilterYear(e.target.value);
    setCurrentPageMain(1);
    setCurrentPageSecondary({});
  };

  const years = [];
  const currentYearValue = new Date().getFullYear();
  for (let y = currentYearValue - 5; y <= currentYearValue + 5; y++) {
    years.push(y);
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <FaSpinner className="animate-spin text-4xl text-gray-600" />
        <span className="ml-2 text-xl">Cargando datos de inventario...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-4 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 p-3 rounded">
        <div className="flex flex-col sm:flex-row gap-2">
          <div>
            <label className="block text-sm font-semibold mb-1">Estado:</label>
            <select
              value={filterEstado}
              onChange={handleFilterEstado}
              className="border border-gray-300 dark:border-gray-700 rounded p-1 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
            >
              <option value="all">Todos</option>
              <option value="activo">Activos</option>
              <option value="inactivo">Inactivos</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Mes:</label>
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
            <label className="block text-sm font-semibold mb-1">Año:</label>
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

        <div className="flex items-center">
          <button
            onClick={() => onNavigate("Agregar Productos a subodegas")}
            className="flex items-center gap-2 text-sm font-medium text-yellow-600 bg-yellow-100 hover:bg-yellow-200 dark:bg-yellow-900 dark:hover:bg-yellow-800 dark:text-yellow-300 px-3 py-2 rounded transition-colors shadow"
          >
            <FaPlus className="w-4 h-4" />
            <span>Agregar productos a Bodegas Secundarias</span>
          </button>
        </div>
      </div>

      <div>
        <h2 className="text-3xl font-bold mb-6 text-yellow-600 text-center">
          Inventario Principal esme
        </h2>
        {aggregatedMainInventory.length === 0 ? (
          <div className="flex flex-col justify-center items-center py-8">
            <FaBoxOpen className="text-4xl text-gray-500" />
            <p className="text-xl text-gray-600 dark:text-gray-300 mt-4">
              Sin producto en el inventario principal
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="table-auto w-full border border-gray-300 dark:border-gray-700">
                <thead className="bg-yellow-500 text-white text-sm">
                  <tr>
                    <th className="border border-gray-300 dark:border-gray-700 px-3 py-2 text-left">
                      ID Inventario
                    </th>
                    <th className="border border-gray-300 dark:border-gray-700 px-3 py-2 text-left">
                      Producto
                    </th>
                    <th className="border border-gray-300 dark:border-gray-700 px-3 py-2 text-left">
                      Bodega
                    </th>
                    <th className="border border-gray-300 dark:border-gray-700 px-3 py-2 text-left">
                      Cantidad Productos
                    </th>
                    <th className="border border-gray-300 dark:border-gray-700 px-3 py-2 text-left">
                      Stock
                    </th>
                    <th className="border border-gray-300 dark:border-gray-700 px-3 py-2 text-left">
                      Stock Reservado
                    </th>
                    <th className="border border-gray-300 dark:border-gray-700 px-3 py-2 text-left">
                      Precio Alquiler
                    </th>
                    <th className="border border-gray-300 dark:border-gray-700 px-3 py-2 text-left">
                      Estado
                    </th>
                    <th className="border border-gray-300 dark:border-gray-700 px-3 py-2 text-left">
                      Notas
                    </th>
                    <th className="border border-gray-300 dark:border-gray-700 px-3 py-2 text-left">
                      Fecha Registro
                    </th>
                    <th className="border border-gray-300 dark:border-gray-700 px-3 py-2 text-left">
                      Acción
                    </th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {mainInventoryPage.map((row, index) => {
                    if (row.type === "category") {
                      return (
                        <tr
                          key={`cat-${row.cat}-${index}`}
                          className="bg-gray-100 dark:bg-gray-700 font-semibold transition-all duration-300 ease-in-out"
                        >
                          <td
                            colSpan={11}
                            className="border border-gray-300 dark:border-gray-700 px-3 py-2"
                          >
                            Categoría: {row.cat}
                          </td>
                        </tr>
                      );
                    } else {
                      const item = row.item;
                      return (
                        <tr
                          key={item.idInventario}
                          className="hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-300 ease-in-out"
                        >
                          <td className="border border-gray-300 dark:border-gray-700 px-3 py-2">
                            {item.idInventario}
                          </td>
                          <td className="border border-gray-300 dark:border-gray-700 px-3 py-2">
                            {item.nombre}
                          </td>
                          <td className="border border-gray-300 dark:border-gray-700 px-3 py-2">
                            {item.nombreBodega}
                          </td>
                          <td className="border border-gray-300 dark:border-gray-700 px-3 py-2">
                            {item.stockReal}
                          </td>
                          <td className="border border-gray-300 dark:border-gray-700 px-3 py-2">
                            {renderStock(item.stock)}
                          </td>
                          <td className="border border-gray-300 dark:border-gray-700 px-3 py-2">
                            {item.stockReservado}
                          </td>
                          <td className="border border-gray-300 dark:border-gray-700 px-3 py-2">
                            {item.precioAlquiler == null
                              ? "Sin precio definido"
                              : `$${item.precioAlquiler}`}
                          </td>
                          <td className="border border-gray-300 dark:border-gray-700 px-3 py-2">
                            <button
                              onClick={() => confirmDesactivar(item)}
                              className="hover:underline"
                            >
                              {renderEstado(item.estado)}
                            </button>
                          </td>
                          <td className="border border-gray-300 dark:border-gray-700 px-3 py-2">
                            {item.notas}
                          </td>
                          <td className="border border-gray-300 dark:border-gray-700 px-3 py-2 flex items-center gap-1">
                            <FaClock className="text-gray-500" />{" "}
                            {formatDate(item.fechaRegistro)}
                          </td>
                          <td className="border border-gray-300 dark:border-gray-700 px-3 py-2">
                            <div className="flex gap-2">
                              <button
                                onClick={() => openEditModal(item)}
                                className="flex items-center gap-1 bg-yellow-500 text-white py-1 px-3 rounded hover:bg-yellow-600"
                              >
                                <FaEdit /> Editar
                              </button>
                              <button
                                onClick={() => openDetailModal(item)}
                                className="flex items-center gap-1 bg-yellow-500 text-white py-1 px-3 rounded hover:bg-yellow-600"
                              >
                                <FaEye /> Ver más
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    }
                  })}
                </tbody>
              </table>
            </div>

            {totalMainPages > 1 && (
              <div className="flex justify-center items-center mt-4 gap-2">
                <button
                  onClick={() => handlePageChangeMain(currentPageMain - 1)}
                  className="px-3 py-1 bg-gray-200 dark:bg-gray-600 rounded hover:bg-gray-300 dark:hover:bg-gray-500"
                >
                  Anterior
                </button>
                <span className="text-gray-700 dark:text-gray-300">
                  Página {currentPageMain} de {totalMainPages}
                </span>
                <button
                  onClick={() => handlePageChangeMain(currentPageMain + 1)}
                  className="px-3 py-1 bg-gray-200 dark:bg-gray-600 rounded hover:bg-gray-300 dark:hover:bg-gray-500"
                >
                  Siguiente
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {Object.keys(aggregatedSecondaryByBodega).length === 0 ? (
        <div className="flex flex-col justify-center items-center py-8">
          <FaBoxOpen className="text-4xl text-gray-500" />
          <p className="text-xl text-gray-600 dark:text-gray-300 mt-4">
            Sin producto en el inventario secundario
          </p>
        </div>
      ) : (
        Object.keys(aggregatedSecondaryByBodega).map((bodega) => {
          const firstItemRow = (aggregatedSecondaryByBodega[bodega] || []).find(
            (prod) => prod.idBodega
          );
          let bodegaInactiva = false;
          if (firstItemRow) {
            bodegaInactiva = isSubBodegaInactive(firstItemRow.idBodega);
          }

          const secondaryPages = paginateGroupedInventory(
            groupByCategory(aggregatedSecondaryByBodega[bodega]),
            ITEMS_PER_PAGE
          );
          const totalPages = secondaryPages.length;
          const currentPage = currentPageSecondary[bodega] || 1;
          const pageData = secondaryPages[currentPage - 1] || [];

          return (
            <div key={bodega} className={`mt-10 relative `}>
              <h2 className="text-3xl font-bold mb-6 text-yellow-600 text-center">
                Inventario: {bodega}
              </h2>

              <div className="overflow-x-auto relative">
                {bodegaInactiva && (
                  <div
                    className="absolute flex items-center justify-center w-full pointer-events-none z-10"
                    style={{ top: "0.75rem" }}
                  >
                    <div className="transform ">
                      <span className="text-6xl font-bold text-red-600 opacity-25">
                        INACTIVA
                      </span>
                    </div>
                  </div>
                )}

                <div
                  className={`overflow-x-auto relative  ${
                    bodegaInactiva ? "bg-red-200" : ""
                  }`}
                >
                  <table className="table-auto w-full border border-gray-300 dark:border-gray-700">
                    <thead className="bg-yellow-500 text-white text-sm">
                      <tr>
                        <th className="border border-gray-300 dark:border-gray-700 px-3 py-2 text-left">
                          ID Inventario
                        </th>
                        <th className="border border-gray-300 dark:border-gray-700 px-3 py-2 text-left">
                          Producto
                        </th>
                        <th className="border border-gray-300 dark:border-gray-700 px-3 py-2 text-left">
                          Cantidad Productos
                        </th>
                        <th className="border border-gray-300 dark:border-gray-700 px-3 py-2 text-left">
                          Stock
                        </th>
                        <th className="border border-gray-300 dark:border-gray-700 px-3 py-2 text-left">
                          Stock Reservado
                        </th>
                        <th className="border border-gray-300 dark:border-gray-700 px-3 py-2 text-left">
                          Precio Alquiler
                        </th>
                        <th className="border border-gray-300 dark:border-gray-700 px-3 py-2 text-left">
                          Estado
                        </th>
                        <th className="border border-gray-300 dark:border-gray-700 px-3 py-2 text-left">
                          Notas
                        </th>
                        <th className="border border-gray-300 dark:border-gray-700 px-3 py-2 text-left">
                          Fecha Registro
                        </th>
                        <th className="border border-gray-300 dark:border-gray-700 px-3 py-2 text-left">
                          Acción
                        </th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {pageData.map((row, idx) => {
                        if (row.type === "category") {
                          return (
                            <tr
                              key={`cat-${row.cat}-${idx}`}
                              className="bg-gray-100 dark:bg-gray-700 font-semibold transition-all duration-300 ease-in-out"
                            >
                              <td
                                colSpan={10}
                                className="border border-gray-300 dark:border-gray-700 px-3 py-2"
                              >
                                Categoría: {row.cat}
                              </td>
                            </tr>
                          );
                        } else {
                          const item = row.item;
                          return (
                            <tr
                              key={item.idInventario}
                              className="hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-300 ease-in-out"
                            >
                              <td className="border border-gray-300 dark:border-gray-700 px-3 py-2">
                                {item.idInventario}
                              </td>
                              <td className="border border-gray-300 dark:border-gray-700 px-3 py-2">
                                {item.nombre}
                              </td>
                              <td className="border border-gray-300 dark:border-gray-700 px-3 py-2">
                                {item.stockReal}
                              </td>
                              <td className="border border-gray-300 dark:border-gray-700 px-3 py-2">
                                {renderStock(item.stock)}
                              </td>
                              <td className="border border-gray-300 dark:border-gray-700 px-3 py-2">
                                {item.stockReservado}
                              </td>
                              <td className="border border-gray-300 dark:border-gray-700 px-3 py-2">
                                {item.precioAlquiler == null
                                  ? "Sin precio definido"
                                  : `$${item.precioAlquiler}`}
                              </td>
                              <td className="border border-gray-300 dark:border-gray-700 px-3 py-2">
                                <button
                                  onClick={() => confirmDesactivar(item)}
                                  className="hover:underline"
                                >
                                  {renderEstado(item.estado)}
                                </button>
                              </td>
                              <td className="border border-gray-300 dark:border-gray-700 px-3 py-2">
                                {item.notas}
                              </td>
                              <td className="border border-gray-300 dark:border-gray-700 px-3 py-2 flex items-center gap-1">
                                <FaClock className="text-gray-500" />{" "}
                                {formatDate(item.fechaRegistro)}
                              </td>
                              <td className="border border-gray-300 dark:border-gray-700 px-3 py-2">
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => openEditModal(item)}
                                    disabled={bodegaInactiva}
                                    className={`flex items-center gap-1 py-1 px-3 rounded ${
                                      bodegaInactiva
                                        ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                                        : "bg-yellow-500 text-white hover:bg-yellow-600"
                                    }`}
                                  >
                                    <FaEdit /> Editar
                                  </button>
                                  <button
                                    onClick={() => openDetailModal(item)}
                                    disabled={bodegaInactiva}
                                    className={`flex items-center gap-1 py-1 px-3 rounded ${
                                      bodegaInactiva
                                        ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                                        : "bg-yellow-500 text-white hover:bg-yellow-600"
                                    }`}
                                  >
                                    <FaEye /> Ver más
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        }
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center items-center mt-4 gap-2">
                  <button
                    onClick={() =>
                      handlePageChangeSecondary(
                        bodega,
                        currentPage - 1,
                        totalPages
                      )
                    }
                    className="px-3 py-1 bg-gray-200 dark:bg-gray-600 rounded hover:bg-gray-300 dark:hover:bg-gray-500"
                  >
                    Anterior
                  </button>
                  <span className="text-gray-700 dark:text-gray-300">
                    Página {currentPage} de {totalPages}
                  </span>
                  <button
                    onClick={() =>
                      handlePageChangeSecondary(
                        bodega,
                        currentPage + 1,
                        totalPages
                      )
                    }
                    className="px-3 py-1 bg-gray-200 dark:bg-gray-600 rounded hover:bg-gray-300 dark:hover:bg-gray-500"
                  >
                    Siguiente
                  </button>
                </div>
              )}
            </div>
          );
        })
      )}

      {/* ===== MODAL DE EDICIÓN ===== */}
      {showEditModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96">
            <h3 className="text-2xl font-bold mb-4 text-yellow-600">
              Editar Stock
            </h3>

            {/* Si el producto tiene varias variantes (por color), mostramos una entrada por variante */}
            {selectedItem &&
            selectedItem.variants &&
            selectedItem.variants.length > 1 ? (
              selectedItem.variants.map((variant) => (
                <div key={variant.idInventario} className="mb-4">
                  <label className="block text-gray-700 dark:text-gray-300 mb-2">
                    {variant.colores || "Sin color"} - Stock:
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editStock[variant.idInventario]}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (Number(val) < 0) {
                        toast.warning("No se permiten números negativos");
                        return;
                      }
                      setEditStock((prev) => ({
                        ...prev,
                        [variant.idInventario]: val,
                      }));
                    }}
                    className="w-full border border-gray-300 dark:border-gray-700 p-2 rounded 
                     focus:outline-yellow-500 bg-white dark:bg-gray-700 
                     text-gray-700 dark:text-gray-300"
                  />
                </div>
              ))
            ) : (
              // Si es un único registro, se muestra el input original
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 mb-2">
                  Nuevo Stock:
                </label>
                <input
                  type="number"
                  min="0"
                  value={editStock}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (Number(val) < 0) {
                      toast.warning("No se permiten números negativos");
                      return;
                    }
                    setEditStock(val);
                  }}
                  className="w-full border border-gray-300 dark:border-gray-700 p-2 rounded 
                     focus:outline-yellow-500 bg-white dark:bg-gray-700 
                     text-gray-700 dark:text-gray-300"
                />
              </div>
            )}

            <div className="flex justify-end">
              <button
                onClick={updateStock}
                disabled={
                  isUpdating || (typeof editStock === "number" && editStock < 0)
                }
                className={`py-2 px-4 rounded mr-2 flex items-center gap-2 
                      ${
                        isUpdating
                          ? "bg-yellow-400"
                          : "bg-yellow-500 hover:bg-yellow-600"
                      }
                      text-white
                     `}
              >
                {isUpdating ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Guardando...
                  </>
                ) : (
                  "Guardar"
                )}
              </button>

              <button
                onClick={closeEditModal}
                disabled={isUpdating}
                className="bg-gray-300 dark:bg-gray-600 text-black dark:text-white py-2 px-4 rounded 
                     hover:bg-gray-400 dark:hover:bg-gray-500"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

{showDetailModal && selectedItem && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-2">
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md md:max-w-4xl mx-auto overflow-y-auto max-h-[90vh]">
      <h3 className="text-2xl md:text-3xl font-bold mb-6 text-yellow-600 flex items-center gap-2 border-b pb-2">
        <FaBox className="text-yellow-600" /> Detalle del Producto
      </h3>
      {/* Grid responsive: 1 columna en pantallas pequeñas, 2 columnas en medianas o superiores */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Columna Izquierda */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
            <FaHashtag className="text-gray-500" />
            <span>
              <strong>ID Inventario:</strong> {selectedItem.idInventario}
            </span>
          </div>

          <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
            <FaBox className="text-gray-500" />
            <span>
              <strong>Producto:</strong> {selectedItem.nombre}
            </span>
          </div>

          <div>
            {selectedItem.urlFoto ? (
              <img
                src={selectedItem.urlFoto}
                alt={selectedItem.nombre}
                className="w-32 h-auto object-contain rounded border border-gray-300 dark:border-gray-700"
              />
            ) : (
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <FaImage className="text-gray-500" />
                <span>No hay imagen disponible</span>
              </div>
            )}
          </div>

          {/* Stock Total y Variantes */}
          {selectedItem.variants && selectedItem.variants.length > 1 ? (
            <>
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <FaSortNumericDown className="text-gray-500" />
                <span>
                  <strong>Stock Total:</strong> {selectedItem.stock}
                </span>
              </div>
              <div>
                <strong>Stock por Color:</strong>
                {selectedItem.variants.map((variant) => (
                  <div
                    key={variant.idInventario}
                    className="flex items-center gap-2 text-gray-700 dark:text-gray-300 ml-4 mt-1"
                  >
                    <span>{variant.colores || "Sin color"}:</span>
                    <span>{variant.stock}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <FaSortNumericDown className="text-gray-500" />
              <span>
                <strong>Stock:</strong> {selectedItem.stock}
              </span>
            </div>
          )}
        </div>

        {/* Columna Derecha */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
            <FaLock className="text-gray-500" />
            <span>
              <strong>Stock Reservado:</strong> {selectedItem.stockReservado}
            </span>
          </div>

          <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
            <FaMoneyBillAlt className="text-gray-500" />
            <span>
              <strong>Precio Alquiler:</strong>{" "}
              {selectedItem.precioAlquiler == null
                ? "Sin precio definido"
                : `$${selectedItem.precioAlquiler}`}
            </span>
          </div>

          <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
            <FaTags className="text-gray-500" />
            <span>
              <strong>Subcategoría:</strong>{" "}
              {selectedItem.nombreSubcategoria || "N/A"}
            </span>
          </div>

          <div className="text-gray-700 dark:text-gray-300">
            <strong>Estado:</strong> {renderEstado(selectedItem.estado)}
          </div>

          <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
            <FaStickyNote className="text-gray-500" />
            <span>
              <strong>Notas:</strong> {selectedItem.notas}
            </span>
          </div>

          <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
            <FaUser className="text-gray-500" />
            <span>
              <strong>Creado por:</strong> {selectedItem.correo}
            </span>
          </div>

          <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
            <FaCalendarAlt className="text-gray-500" />
            <span>
              <strong>Fecha Registro:</strong> {formatDate(selectedItem.fechaRegistro)}
            </span>
          </div>
        </div>
      </div>
      <div className="flex justify-end mt-6">
        <button
          onClick={closeDetailModal}
          className="bg-gray-300 dark:bg-gray-700 text-black dark:text-white py-2 px-4 rounded hover:bg-gray-400 dark:hover:bg-gray-600 flex items-center gap-2"
        >
          <FaTimesCircle /> Cerrar
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  );
};

export default Inventatio;
