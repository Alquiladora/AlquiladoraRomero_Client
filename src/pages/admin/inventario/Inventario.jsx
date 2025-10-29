/* eslint-disable */
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
  FaWarehouse,
  FaMapMarkerAlt,
  FaSortNumericDown,
  FaLock,
  FaMoneyBillAlt,
  FaTags,
  FaStickyNote,
  FaUser,
  FaCalendarAlt,
   FaFilePdf,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import CustomLoading from "../../../components/spiner/SpinerGlobal";
import ReportGenerator from "./reporteInventario";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Logo from "../../../img/Logos/LogoOriginal.png";

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
  const [showPreview, setShowPreview] = useState(false);
const [previewData, setPreviewData] = useState(null);

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


const generatePreview = () => {
  if (inventory.length > 0) {
    // Agrupar por idProducto para consolidar colores y stocks
    const groupedByProduct = inventory.reduce((acc, item) => {
      if (!acc[item.idProducto]) {
        acc[item.idProducto] = {
          idProducto: item.idProducto,
          nombre: item.nombre,
          detalles: item.detalles || 'Sin descripción',
          colores: [],
          stockTotal: 0,
          stockRealTotal: 0,
          stockReservadoTotal: 0,
          precioAlquiler: item.precioAlquiler,
          fechaRegistro: item.fechaRegistro,
          categoria: item.nombreCategoria
        };
      }
      // Agregar color solo si no está duplicado
      if (!acc[item.idProducto].colores.some(c => c.color === (item.colores || 'Sin color'))) {
        acc[item.idProducto].colores.push({
          color: item.colores || 'Sin color',
          stock: item.stock,
          stockReal: item.stockReal,
          stockReservado: item.stockReservado,
          idInventario: item.idInventario
        });
      }
      acc[item.idProducto].stockTotal += item.stock || 0;
      acc[item.idProducto].stockRealTotal += item.stockReal || 0;
      acc[item.idProducto].stockReservadoTotal += item.stockReservado || 0;
      return acc;
    }, {});

    const preview = `
      <div style="text-align: center; margin-bottom: 20px; display: flex; justify-content: center; align-items: center; gap: 20px;">
        <img src="${Logo}" alt="Logo Alquiladora Romero" style="max-width: 150px; height: auto;" />
        <div>
          <h2 style="font-size: 24px; font-weight: bold; color: #333; margin: 0;">Alquiladora Romero</h2>
          <p style="font-size: 12px; color: #666; margin: 5px 0;">Tel: 771 300 0849 | 709 600 5949</p>
          <p style="font-size: 12px; color: #666; margin: 0;">Av. San Luis Potosí #58, Col. Tahuizan, Huejutla de Reyes Hidalgo - México</p>
        </div>
      </div>
      <hr style="border: 1px solid #333; margin: 15px 0;" />
      <h3 style="text-align: center; font-size: 18px; font-weight: bold; color: #444; margin: 10px 0;">Reporte de Inventario</h3>
      <hr style="border: 1px solid #333; margin: 15px 0;" />
      <p><strong>Fecha:</strong> ${new Date().toLocaleString('es-MX', { timeZone: 'America/Mexico_City', hour12: true }).replace(/,/g, '')}</p>
      <table style="width: 100%; border-collapse: collapse; margin-top: 20px; background-color: #fff; box-shadow: 0 4px 6px rgba(0,0,0,0.1); border-radius: 8px; overflow: hidden;">
        <thead>
          <tr style="background-color: #ffeb3b; color: #333;">
            <th style="border: 1px solid #ddd; padding: 15px; text-align: left; font-size: 14px;">ID Producto</th>
            <th style="border: 1px solid #ddd; padding: 15px; text-align: left; font-size: 14px;">Producto</th>
            <th style="border: 1px solid #ddd; padding: 15px; text-align: left; font-size: 14px;">Descripción</th>
            <th style="border: 1px solid #ddd; padding: 15px; text-align: left; font-size: 14px;">Colores</th>
            <th style="border: 1px solid #ddd; padding: 15px; text-align: left; font-size: 14px;">Stock Disponible</th>
            <th style="border: 1px solid #ddd; padding: 15px; text-align: left; font-size: 14px;">Cantidad Física Total</th>
            <th style="border: 1px solid #ddd; padding: 15px; text-align: left; font-size: 14px;">Reservado Total</th>
            <th style="border: 1px solid #ddd; padding: 15px; text-align: left; font-size: 14px;">Precio</th>
            <th style="border: 1px solid #ddd; padding: 15px; text-align: left; font-size: 14px;">Fecha Registro</th>
          </tr>
        </thead>
        <tbody>
          ${Object.entries(groupedByProduct).map(([idProducto, product]) => `
            <tr style="border: 1px solid #ddd;">
              <td style="padding: 12px; font-size: 13px;">${product.idProducto}</td>
              <td style="padding: 12px; font-size: 13px;">${product.nombre}</td>
              <td style="padding: 12px; font-size: 13px;">${product.detalles}</td>
              <td style="padding: 12px; font-size: 13px;">${product.colores.length === 1 ? product.colores[0].color : product.colores.map(c => c.color).join(', ')}</td>
              <td style="padding: 12px; font-size: 13px;">${product.stockTotal}</td>
              <td style="padding: 12px; font-size: 13px;">${product.stockRealTotal}</td>
              <td style="padding: 12px; font-size: 13px;">${product.stockReservadoTotal}</td>
              <td style="padding: 12px; font-size: 13px;">${product.precioAlquiler ? `$${product.precioAlquiler}` : 'N/A'}</td>
              <td style="padding: 12px; font-size: 13px;">${new Date(product.fechaRegistro).toLocaleDateString('es-MX', { timeZone: 'America/Mexico_City' })}</td>
            </tr>
          `).join('')}
          <tr style="background-color: #e0e0e0; font-weight: bold;">
            <td colspan="6" style="border: 1px solid #ddd; padding: 15px; text-align: right; font-size: 14px;">Total</td>
            <td colspan="3" style="border: 1px solid #ddd; padding: 15px; font-size: 14px;">${mainInventoryFiltered
              .reduce((sum, item) => sum + (item.stockReal * (item.precioAlquiler || 0)), 0)
              .toFixed(2)} MXN</td>
          </tr>
        </tbody>
      </table>
      <p style="margin-top: 20px; font-size: 12px; color: #666;"><strong>Notas:</strong> Este reporte refleja el estado del inventario al ${new Date().toLocaleString('es-MX', { timeZone: 'America/Mexico_City', hour12: true }).replace(/,/g, '')}.</p>
      <p style="font-size: 12px; color: #666;"><strong>Importe con letra:</strong> ${numberToWords(mainInventoryFiltered
        .reduce((sum, item) => sum + (item.stockReal * (item.precioAlquiler || 0)), 0)
        .toFixed(2))} pesos (la suma de la cantidad física multiplicada por el precio de todos los productos).</p>
    `;
    setPreviewData(preview);
    setShowPreview(true);
  }
};

// Función auxiliar para convertir números a palabras
const numberToWords = (number) => {
  const units = ['', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve'];
  const teens = ['diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve'];
  const tens = ['', '', 'veinte', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'];

  const num = Math.floor(number);
  if (num === 0) return 'cero';
  if (num < 10) return units[num];
  if (num < 20) return teens[num - 10];
  if (num < 100) {
    const ten = Math.floor(num / 10);
    const unit = num % 10;
    return tens[ten] + (unit > 0 ? ' y ' + units[unit] : '');
  }
  if (num < 1000) {
    const hundred = Math.floor(num / 100);
    const rest = num % 100;
    return units[hundred] + ' cien' + (rest > 0 ? ' ' + numberToWords(rest) : '');
  }
  return num.toString();
};



const generatePDF = () => {
  if (!inventory || inventory.length === 0) {
    toast.error("No hay inventario disponible para generar el reporte.");
    return;
  }

  const doc = new jsPDF();

  const imgData = typeof Logo === 'string' ? Logo : Logo;
  const currentDate = new Date().toLocaleString('es-MX', {
    timeZone: 'America/Mexico_City',
    hour12: true,
  }).replace(/,/g, '');

  // --- Encabezado alineado (logo izquierda, texto derecha sin empalme) ---
  const logoX = 20;
  const logoY = 15;
  const logoWidth = 20;
  const logoHeight = 20;
  const textStartX = logoX + logoWidth + 5; // separación de 5mm

  doc.addImage(imgData, 'PNG', logoX, logoY, logoWidth, logoHeight);

  doc.setFontSize(16);
  doc.setTextColor(33, 33, 33);
  doc.text('Alquiladora Romero', textStartX, 20);

  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text('Tel: 771 300 0849 | 709 600 5949', textStartX, 26);
  doc.text('Av. San Luis Potosí #58, Col. Tahuizan, Huejutla de Reyes Hidalgo - México', textStartX, 32);

  // Línea divisoria
  doc.setLineWidth(0.4);
  doc.setDrawColor(180, 180, 180);
  doc.line(20, 38, 190, 38);

  // Título del reporte
  doc.setFontSize(14);
  doc.setTextColor(50, 50, 50);
  doc.text('Reporte de Inventario', 105, 46, { align: 'center' });
  doc.line(20, 50, 190, 50);

  // Fecha
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.text(`Fecha: ${currentDate}`, 20, 58);

  // --- Agrupar por producto ---
  const groupedByProduct = inventory.reduce((acc, item) => {
    const precio = Number(item.precioAlquiler);
    if (!acc[item.idProducto]) {
      acc[item.idProducto] = {
        idProducto: item.idProducto,
        nombre: item.nombre,
        detalles: item.detalles || 'Sin descripción',
        colores: [],
        stockTotal: 0,
        stockRealTotal: 0,
        stockReservadoTotal: 0,
        precioAlquiler: !isNaN(precio) ? precio : 0,
        fechaRegistro: item.fechaRegistro,
        categoria: item.nombreCategoria,
      };
    }

    if (!acc[item.idProducto].colores.some(c => c.color === (item.colores || 'Sin color'))) {
      acc[item.idProducto].colores.push({
        color: item.colores || 'Sin color',
        stock: item.stock,
        stockReal: item.stockReal,
        stockReservado: item.stockReservado,
        idInventario: item.idInventario,
      });
    }

    acc[item.idProducto].stockTotal += item.stock || 0;
    acc[item.idProducto].stockRealTotal += item.stockReal || 0;
    acc[item.idProducto].stockReservadoTotal += item.stockReservado || 0;
    return acc;
  }, {});

  // --- Preparar tabla ---
  const tableData = Object.values(groupedByProduct).map(product => [
    product.idProducto,
    product.nombre,
    product.detalles,
    product.colores.length === 1
      ? product.colores[0].color
      : product.colores.map(c => c.color).join(', '),
    product.stockTotal,
    product.stockRealTotal,
    product.stockReservadoTotal,
    product.precioAlquiler ? `$${Number(product.precioAlquiler).toFixed(2)}` : 'N/A',
    new Date(product.fechaRegistro).toLocaleDateString('es-MX', { timeZone: 'America/Mexico_City' }),
  ]);

  // --- Calcular total ---
  const total = mainInventoryFiltered.reduce((sum, item) => {
    const precio = !isNaN(Number(item.precioAlquiler)) ? Number(item.precioAlquiler) : 0;
    return sum + ((item.stockReal || 0) * precio);
  }, 0).toFixed(2);



  let pageCount = 0;

autoTable(doc, {
  startY: 64,
  head: [[
    'ID Producto',
    'Producto',
    'Descripción',
    'Colores',
    'Stock Disponible',
    'Cantidad Física',
    'Reservado',
    'Precio',
    'Fecha Registro'
  ]],
  body: tableData,
  theme: 'grid',
  headStyles: {
    fillColor: [255, 235, 59],
    textColor: [0, 0, 0],
    fontSize: 10,
    fontStyle: 'bold',
    halign: 'center'
  },
  bodyStyles: {
    textColor: [33, 33, 33],
    fontSize: 9,
    halign: 'left',
    cellPadding: 2
  },
  alternateRowStyles: { fillColor: [245, 245, 245] },
  foot: [['', '', '', '', '', '', '', 'Total', `${total} MXN`]],
  footStyles: {
    fillColor: [230, 230, 230],
    textColor: [0, 0, 0],
    fontStyle: 'bold',
    halign: 'right'
  },
  margin: { left: 20, right: 20 },
  tableWidth: 'auto',

  /** ✅ ENCABEZADO y PAGINACIÓN EN CADA PÁGINA **/
  didDrawPage: (data) => {
    pageCount++;

    // Encabezado simple (sin logo para ahorrar espacio)
    doc.setFontSize(10);
    doc.setTextColor(120);
    doc.text('Reporte de Inventario - Alquiladora Romero', 20, 14);

    // Paginación: Pie de página
    const pageSize = doc.internal.pageSize;
    const pageHeight = pageSize.height || pageSize.getHeight();
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text(`Página ${doc.internal.getNumberOfPages()}`, pageSize.width - 40, pageHeight - 10);
  }
});


  // --- Notas finales ---
  const finalY = doc.lastAutoTable.finalY + 10;
  doc.setFontSize(10);
  doc.setTextColor(90, 90, 90);
  doc.text(`Notas: Este reporte refleja el estado del inventario al ${currentDate}.`, 20, finalY);
  doc.text(`Importe con letra: ${numberToWords(total)} pesos (valor total de la cantidad física x precio).`, 20, finalY + 8);

  // --- Guardar PDF ---
  const fileName = `Reporte_Inventario_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
  setShowPreview(false);
  toast.success(`PDF "${fileName}" generado y descargado correctamente.`);
};





  if (loading) {
    return (
      <CustomLoading />
    );
  }




  return (
    <div className="container mx-auto p-4 bg-gray-50 dark:bg-gray-900 min-h-screen">
      


      <div className="mb-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
  <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 flex items-center gap-3">
      <FaFilePdf className="text-yellow-600" />
      Generar Reportes
    </h2>
    <button
      onClick={generatePreview}
      disabled={loading || inventory.length === 0}
      className={`group flex items-center gap-2 text-sm font-semibold text-white bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 ${
        loading || inventory.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      <FaEye className="w-5 h-5 group-hover:rotate-12 transition-transform duration-200" />
      <span>Previsualizar</span>
    </button>
  </div>
</div>
      {/* Header con filtros mejorado */}
      <div className="mb-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          {/* Filtros */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex flex-col">
              <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                📅 Filtrar por Mes:
              </label>
              <select
                value={filterMonth}
                onChange={handleFilterMonth}
                className="border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
              >
                <option value="all">🗓️ Todos los meses</option>
                <option value="01">🌟 Enero</option>
                <option value="02">💝 Febrero</option>
                <option value="03">🌸 Marzo</option>
                <option value="04">🌿 Abril</option>
                <option value="05">🌺 Mayo</option>
                <option value="06">☀️ Junio</option>
                <option value="07">🏖️ Julio</option>
                <option value="08">🌾 Agosto</option>
                <option value="09">🍂 Septiembre</option>
                <option value="10">🎃 Octubre</option>
                <option value="11">🍁 Noviembre</option>
                <option value="12">🎄 Diciembre</option>
              </select>
            </div>
            
            <div className="flex flex-col">
              <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                📆 Filtrar por Año:
              </label>
              <select
                value={filterYear}
                onChange={handleFilterYear}
                className="border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
              >
                <option value="all">📅 Todos los años</option>
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Botón agregar productos */}
          <div className="flex items-center">
            <button
              onClick={() => onNavigate("Agregar Productos a subodegas")}
              className="group flex items-center gap-3 text-sm font-semibold text-white bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <FaPlus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
              <span>Agregar a Bodegas Secundarias</span>
            </button>
          </div>
        </div>
      </div>

      {/* Inventario Principal */}
      <div className="mb-12">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          {/* Header del inventario principal */}
          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 px-6 py-4">
            <h2 className="text-3xl font-bold text-white text-center flex items-center justify-center gap-3">
              <FaBoxOpen className="text-4xl" />
              Inventario Principal
            </h2>
          </div>

          {aggregatedMainInventory.length === 0 ? (
            <div className="flex flex-col justify-center items-center py-16 animate-fade-in-up">
              <div className="bg-gray-100 dark:bg-gray-700 rounded-full p-8 mb-6">
                <FaBoxOpen className="text-6xl text-gray-400" />
              </div>
              <p className="text-2xl text-gray-500 dark:text-gray-400 font-medium">
                Sin productos en el inventario principal
              </p>
              <p className="text-gray-400 dark:text-gray-500 mt-2">
                Agrega productos para comenzar a gestionar tu inventario
              </p>
            </div>
          ) : (
            <div className="p-6">
              <div className="overflow-x-auto animate-fade-in-up">
                <table className="w-full">
                  <thead>
                    <tr className="bg-yellow-50 dark:bg-yellow-900/20 border-b-2 border-yellow-200 dark:border-yellow-700">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-yellow-800 dark:text-yellow-200 uppercase tracking-wider">
                        ID Inventario
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-yellow-800 dark:text-yellow-200 uppercase tracking-wider">
                        Producto
                      </th>
                     
                      <th className="px-4 py-3 text-left text-xs font-semibold text-yellow-800 dark:text-yellow-200 uppercase tracking-wider">
                        Cantidad
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-yellow-800 dark:text-yellow-200 uppercase tracking-wider">
                        Stock
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-yellow-800 dark:text-yellow-200 uppercase tracking-wider">
                        Reservado
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-yellow-800 dark:text-yellow-200 uppercase tracking-wider">
                        Precio
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-yellow-800 dark:text-yellow-200 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-yellow-800 dark:text-yellow-200 uppercase tracking-wider">
                        Notas
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-yellow-800 dark:text-yellow-200 uppercase tracking-wider">
                        Fecha
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-yellow-800 dark:text-yellow-200 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {mainInventoryPage.map((row, index) => {
                      if (row.type === "category") {
                        return (
                          <tr
                            key={`cat-${row.cat}-${index}`}
                            className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600"
                          >
                            <td
                              colSpan={11}
                              className="px-4 py-4 text-lg font-bold text-gray-800 dark:text-gray-200"
                            >
                              📂 Categoría: {row.cat}
                            </td>
                          </tr>
                        );
                      } else {
                        const item = row.item;
                        return (
                          <tr
                            key={item.idInventario}
                            className="hover:bg-yellow-50 dark:hover:bg-yellow-900/10 transition-colors duration-200"
                          >
                            <td className="px-4 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                              #{item.idInventario}
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-900 dark:text-gray-100 font-medium">
                              {item.nombre}
                            </td>
                           
                            <td className="px-4 py-4 text-sm text-gray-900 dark:text-gray-100">
                              <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full text-xs font-medium">
                                {item.stockReal}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-sm">
                              {renderStock(item.stock)}
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-900 dark:text-gray-100">
                              <span className="bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 px-2 py-1 rounded-full text-xs font-medium">
                                {item.stockReservado}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-900 dark:text-gray-100">
                              {item.precioAlquiler == null
                                ? <span className="text-gray-400 italic">Sin precio</span>
                                : <span className="text-green-600 dark:text-green-400 font-semibold">${item.precioAlquiler}</span>}
                            </td>
                            <td className="px-4 py-4 text-sm">
                              <button
                                onClick={() => confirmDesactivar(item)}
                                className="hover:underline transition-all duration-200"
                              >
                                {renderEstado(item.estado)}
                              </button>
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate">
                              {item.notas || <span className="italic">Sin notas</span>}
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">
                              <div className="flex items-center gap-2">
                                <FaClock className="text-gray-400" />
                                {formatDate(item.fechaRegistro)}
                              </div>
                            </td>
                            <td className="px-4 py-4 text-sm">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => openEditModal(item)}
                                  className="group flex items-center gap-1 bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-3 rounded-lg transition-all duration-200 transform hover:scale-105"
                                >
                                  <FaEdit className="group-hover:rotate-12 transition-transform duration-200" />
                                  <span className="hidden sm:inline">Editar</span>
                                </button>
                                <button
                                  onClick={() => openDetailModal(item)}
                                  className="group flex items-center gap-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 rounded-lg transition-all duration-200 transform hover:scale-105"
                                >
                                  <FaEye className="group-hover:scale-110 transition-transform duration-200" />
                                  <span className="hidden sm:inline">Ver</span>
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

              {/* Paginación mejorada */}
              {totalMainPages > 1 && (
                <div className="flex justify-center items-center mt-6 gap-4">
                  <button
                    onClick={() => handlePageChangeMain(currentPageMain - 1)}
                    disabled={currentPageMain === 1}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    ← Anterior
                  </button>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-700 dark:text-gray-300 font-medium">
                      Página {currentPageMain} de {totalMainPages}
                    </span>
                  </div>
                  <button
                    onClick={() => handlePageChangeMain(currentPageMain + 1)}
                    disabled={currentPageMain === totalMainPages}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    Siguiente →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Inventarios Secundarios */}
      {Object.keys(aggregatedSecondaryByBodega).length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg">
          <div className="flex flex-col justify-center items-center py-16 animate-fade-in-up">
            <div className="bg-gray-100 dark:bg-gray-700 rounded-full p-8 mb-6">
              <FaBoxOpen className="text-6xl text-gray-400" />
            </div>
            <p className="text-2xl text-gray-500 dark:text-gray-400 font-medium">
              Sin productos en inventarios secundarios
            </p>
            <p className="text-gray-400 dark:text-gray-500 mt-2">
              Los inventarios secundarios aparecerán aquí cuando agregues productos
            </p>
          </div>
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
            <div key={bodega} className="mb-12">
              <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden ${bodegaInactiva ? 'opacity-75' : ''}`}>
                {/* Header del inventario secundario */}
                <div className={`px-6 py-4 relative ${bodegaInactiva ? 'bg-gradient-to-r from-red-500 to-red-600' : 'bg-gradient-to-r from-blue-500 to-blue-600'}`}>
                  <h2 className="text-3xl font-bold text-white text-center flex items-center justify-center gap-3">
                    <FaWarehouse className="text-4xl" />
                    Inventario: {bodega}
                  </h2>
                  {bodegaInactiva && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-6xl font-bold text-white opacity-30 transform rotate-12">
                        INACTIVA
                      </span>
                    </div>
                  )}
                </div>

                <div className={`p-6 ${bodegaInactiva ? 'bg-red-50 dark:bg-red-900/10' : ''}`}>
                  <div className="overflow-x-auto animate-fade-in-up">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-blue-50 dark:bg-blue-900/20 border-b-2 border-blue-200 dark:border-blue-700">
                          <th className="px-4 py-3 text-left text-xs font-semibold text-blue-800 dark:text-blue-200 uppercase tracking-wider">
                            ID Inventario
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-blue-800 dark:text-blue-200 uppercase tracking-wider">
                            Producto
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-blue-800 dark:text-blue-200 uppercase tracking-wider">
                            Cantidad
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-blue-800 dark:text-blue-200 uppercase tracking-wider">
                            Stock
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-blue-800 dark:text-blue-200 uppercase tracking-wider">
                            Reservado
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-blue-800 dark:text-blue-200 uppercase tracking-wider">
                            Precio
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-blue-800 dark:text-blue-200 uppercase tracking-wider">
                            Estado
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-blue-800 dark:text-blue-200 uppercase tracking-wider">
                            Notas
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-blue-800 dark:text-blue-200 uppercase tracking-wider">
                            Fecha
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-blue-800 dark:text-blue-200 uppercase tracking-wider">
                            Acciones
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {pageData.map((row, idx) => {
                          if (row.type === "category") {
                            return (
                              <tr
                                key={`cat-${row.cat}-${idx}`}
                                className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600"
                              >
                                <td
                                  colSpan={10}
                                  className="px-4 py-4 text-lg font-bold text-gray-800 dark:text-gray-200"
                                >
                                  📂 Categoría: {row.cat}
                                </td>
                              </tr>
                            );
                          } else {
                            const item = row.item;
                            return (
                              <tr
                                key={item.idInventario}
                                className="hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors duration-200"
                              >
                                <td className="px-4 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                                  #{item.idInventario}
                                </td>
                                <td className="px-4 py-4 text-sm text-gray-900 dark:text-gray-100 font-medium">
                                  {item.nombre}
                                </td>
                                <td className="px-4 py-4 text-sm text-gray-900 dark:text-gray-100">
                                  <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full text-xs font-medium">
                                    {item.stockReal}
                                  </span>
                                </td>
                                <td className="px-4 py-4 text-sm">
                                  {renderStock(item.stock)}
                                </td>
                                <td className="px-4 py-4 text-sm text-gray-900 dark:text-gray-100">
                                  <span className="bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 px-2 py-1 rounded-full text-xs font-medium">
                                    {item.stockReservado}
                                  </span>
                                </td>
                                <td className="px-4 py-4 text-sm text-gray-900 dark:text-gray-100">
                                  {item.precioAlquiler == null
                                    ? <span className="text-gray-400 italic">Sin precio</span>
                                    : <span className="text-green-600 dark:text-green-400 font-semibold">${item.precioAlquiler}</span>}
                                </td>
                                <td className="px-4 py-4 text-sm">
                                  <button
                                    onClick={() => confirmDesactivar(item)}
                                    className="hover:underline transition-all duration-200"
                                  >
                                    {renderEstado(item.estado)}
                                  </button>
                                </td>
                                <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate">
                                  {item.notas || <span className="italic">Sin notas</span>}
                                </td>
                                <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">
                                  <div className="flex items-center gap-2">
                                    <FaClock className="text-gray-400" />
                                    {formatDate(item.fechaRegistro)}
                                  </div>
                                </td>
                                <td className="px-4 py-4 text-sm">
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => openEditModal(item)}
                                      disabled={bodegaInactiva}
                                      className={`group flex items-center gap-1 py-2 px-3 rounded-lg transition-all duration-200 transform hover:scale-105 ${
                                        bodegaInactiva
                                          ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                                          : "bg-yellow-500 hover:bg-yellow-600 text-white"
                                      }`}
                                    >
                                      <FaEdit className="group-hover:rotate-12 transition-transform duration-200" />
                                      <span className="hidden sm:inline">Editar</span>
                                    </button>
                                    <button
                                      onClick={() => openDetailModal(item)}
                                      disabled={bodegaInactiva}
                                      className={`group flex items-center gap-1 py-2 px-3 rounded-lg transition-all duration-200 transform hover:scale-105 ${
                                        bodegaInactiva
                                          ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                                          : "bg-blue-500 hover:bg-blue-600 text-white"
                                      }`}
                                    >
                                      <FaEye className="group-hover:scale-110 transition-transform duration-200" />
                                      <span className="hidden sm:inline">Ver</span>
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

                  {/* Paginación para inventario secundario */}
                  {totalPages > 1 && (
                    <div className="flex justify-center items-center mt-6 gap-4">
                      <button
                        onClick={() =>
                          handlePageChangeSecondary(
                            bodega,
                            currentPage - 1,
                            totalPages
                          )
                        }
                        disabled={currentPage === 1}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                      >
                        ← Anterior
                      </button>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-700 dark:text-gray-300 font-medium">
                          Página {currentPage} de {totalPages}
                        </span>
                      </div>
                      <button
                        onClick={() =>
                          handlePageChangeSecondary(
                            bodega,
                            currentPage + 1,
                            totalPages
                          )
                        }
                        disabled={currentPage === totalPages}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                      >
                        Siguiente →
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })
      )}




      {/* ===== MODAL DE EDICIÓN ===== */}
   {showEditModal && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md shadow-2xl transform transition-all duration-300 ease-in-out hover:shadow-3xl">
      <h3 className="text-2xl font-bold mb-6 text-yellow-600 flex items-center gap-2">
        <FaEdit className="text-yellow-500" />
        Editar Stock
      </h3>

      {/* Si el producto tiene varias variantes (por color), mostramos una entrada por variante */}
      {selectedItem &&
      selectedItem.variants &&
      selectedItem.variants.length > 1 ? (
        selectedItem.variants.map((variant) => (
          <div key={variant.idInventario} className="mb-5 last:mb-0">
            <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">
              {variant.colores || "Sin color"} - Stock:
            </label>
            <input
              type="number"
              min="0"
              value={editStock[variant.idInventario] || 0}
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
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 transition-all duration-200"
            />
          </div>
        ))
      ) : (
        // Si es un único registro, se muestra el input original con color
        <div className="mb-5">
          <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">
            {selectedItem?.colores ? `${selectedItem.colores} - ` : ""}Nuevo Stock:
          </label>
          <input
            type="number"
            min="0"
            value={editStock || 0}
            onChange={(e) => {
              const val = e.target.value;
              if (Number(val) < 0) {
                toast.warning("No se permiten números negativos");
                return;
              }
              setEditStock(val);
            }}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 transition-all duration-200"
          />
        </div>
      )}

      <div className="flex justify-end gap-4 mt-6">
        <button
          onClick={updateStock}
          disabled={isUpdating || (typeof editStock === "number" && editStock < 0)}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-white transition-all duration-200 ${
            isUpdating
              ? "bg-yellow-400 cursor-not-allowed"
              : "bg-yellow-500 hover:bg-yellow-600 active:bg-yellow-700"
          }`}
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
          className="px-6 py-3 rounded-lg font-semibold bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 hover:bg-gray-400 dark:hover:bg-gray-500 active:bg-gray-500 dark:active:bg-gray-700 transition-all duration-200"
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
              <strong>Stock:</strong> {selectedItem?.colores ? `${selectedItem.colores} - ` : ""}{selectedItem.stock}
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

{showPreview && previewData && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-h-[80vh] overflow-y-auto w-full max-w-4xl">
      <h3 className="text-2xl font-bold mb-4 text-yellow-600">Previsualización del Reporte</h3>
      <div dangerouslySetInnerHTML={{ __html: previewData }} />
      <div className="mt-4 flex justify-end gap-4">
        <button
          onClick={generatePDF}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
        >
          Guardar PDF
        </button>
        <button
          onClick={() => setShowPreview(false)}
          className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400"
        >
          Cerrar
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  );


};

export default Inventatio;
