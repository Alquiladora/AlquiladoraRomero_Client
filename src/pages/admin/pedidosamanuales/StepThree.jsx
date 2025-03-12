// StepThree.jsx
import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlusCircle, faTrashAlt } from "@fortawesome/free-solid-svg-icons";

const calcularDiasAlquiler = (fechaInicio, fechaEntrega) => {
  if (!fechaInicio || !fechaEntrega) return 0;
  const inicio = new Date(fechaInicio);
  const fin = new Date(fechaEntrega);
  let dias = Math.floor((fin - inicio) / (1000 * 60 * 60 * 24));
  if (dias < 1) dias = 1;
  return dias;
};

const StepThree = ({
  fechaInicio, setFechaInicio,
  fechaEntrega, setFechaEntrega,
  horaAlquiler, setHoraAlquiler,
  formaPago, setFormaPago,
  detallesPago, setDetallesPago,
  productosDisponibles,

  // NUEVO: callback para avisar al Wizard
  onChangeData,
}) => {
  const [selectedProducts, setSelectedProducts] = useState([
    {
      productId: "",
      productName: "",
      stock: "",
      price: "",
      colorOptions: [],
      selectedColor: "",
      unitsToRent: "",
    },
  ]);
  const MAX_PRODUCTS = 40;

  // Ticket local
  const [showTicket, setShowTicket] = useState(false);
  const [lineItems, setLineItems] = useState([]);
  const [ticketTotal, setTicketTotal] = useState(0);

  // --- 1) Agrupar productos
  const groupedProducts = productosDisponibles.reduce((acc, prod) => {
    if (prod.stock > 0 && prod.precioAlquiler > 0) {
      if (!acc[prod.idcategoria]) {
        acc[prod.idcategoria] = {
          categoria: prod.nombreCategoria,
          productos: [],
        };
      }
      acc[prod.idcategoria].productos.push(prod);
    }
    return acc;
  }, {});
  const groupedProductsArray = Object.keys(groupedProducts).map((idCat) => ({
    idCategoria: parseInt(idCat, 10),
    nombreCategoria: groupedProducts[idCat].categoria,
    productos: groupedProducts[idCat].productos,
  }));

  // --- 2) Agregar/eliminar bloque
  const handleAddNewProduct = () => {
    if (selectedProducts.length < MAX_PRODUCTS) {
      setSelectedProducts((prev) => [
        ...prev,
        {
          productId: "",
          productName: "",
          stock: "",
          price: "",
          colorOptions: [],
          selectedColor: "",
          unitsToRent: "",
        },
      ]);
    } else {
      alert(`Máximo ${MAX_PRODUCTS} productos.`);
    }
  };
  const handleRemoveProduct = (index) => {
    setSelectedProducts((prev) => prev.filter((_, i) => i !== index));
  };

  // --- 3) Manejo cambio de producto
  const handleSelectProducto = (index, productId) => {
    const idSeleccionado = parseInt(productId, 10);
    const productoEncontrado = productosDisponibles.find(
      (p) => p.idProducto === idSeleccionado
    );
    setSelectedProducts((prev) => {
      const newProds = [...prev];
      const item = { ...newProds[index] };
      if (productoEncontrado) {
        item.productId = productId;
        item.productName = productoEncontrado.nombre;
        item.stock = String(productoEncontrado.stock || "");
        item.price = String(productoEncontrado.precioAlquiler || "");
        item.colorOptions = productoEncontrado.color
          ? productoEncontrado.color.split(",").map((c) => c.trim())
          : [];
        item.selectedColor = "";
        item.unitsToRent = "";
      } else {
        // Limpia
        item.productId = "";
        item.productName = "";
        item.stock = "";
        item.price = "";
        item.colorOptions = [];
        item.selectedColor = "";
        item.unitsToRent = "";
      }
      newProds[index] = item;
      return newProds;
    });
  };

  // --- 4) Manejo de color (+evitar duplicado)
  const handleSelectColor = (index, color) => {
    setSelectedProducts((prev) => {
      const newProds = [...prev];
      const current = newProds[index];
      const duplicated = newProds.some(
        (p, i) =>
          i !== index &&
          p.productId === current.productId &&
          p.selectedColor === color &&
          p.productId !== "" &&
          color !== ""
      );
      if (duplicated) {
        alert("Ya seleccionaste este producto con el mismo color.");
        return prev;
      }
      newProds[index] = { ...newProds[index], selectedColor: color };
      return newProds;
    });
  };

  // --- 5) Manejo de unidades
  const handleUnitsChange = (index, value) => {
    setSelectedProducts((prev) => {
      const newProds = [...prev];
      const item = { ...newProds[index] };
      const stockNumber = parseInt(item.stock, 10) || 0;
      const newValue = parseInt(value, 10) || 0;
      if (newValue > stockNumber) {
        alert(`No puedes exceder el stock (${stockNumber}).`);
        item.unitsToRent = String(stockNumber);
      } else {
        item.unitsToRent = String(newValue);
      }
      newProds[index] = item;
      return newProds;
    });
  };

  // --- 6) Validar si está todo lleno
  const isFormValid = () => {
    if (!fechaInicio || !fechaEntrega) return false;
    for (const sp of selectedProducts) {
      if (!sp.productId) return false;
      if (sp.colorOptions.length > 0 && !sp.selectedColor) return false;
      const qty = parseInt(sp.unitsToRent, 10);
      if (!qty || qty < 1) return false;
    }
    return true;
  };

  // --- 7) Calcular ticket
  const handleCotizar = () => {
    const dias = calcularDiasAlquiler(fechaInicio, fechaEntrega);
    const items = selectedProducts.map((sp) => {
      const price = parseFloat(sp.price) || 0;
      const qty = parseInt(sp.unitsToRent, 10) || 0;
      const subtotal = price * qty * dias;
      return {
        productName: sp.productName,
        quantity: qty,
        unitPrice: price,
        days: dias,
        subtotal,
      };
    });
    const total = items.reduce((acc, i) => acc + i.subtotal, 0);
    setLineItems(items);
    setTicketTotal(total);
    setShowTicket(true);
  };

  // --- 8) “Efecto” para informar al Wizard cada vez que algo cambia
  useEffect(() => {
    // Cada que cambie cualquier estado, mandamos info al Wizard
    onChangeData?.({
      isValid: isFormValid(),
      selectedProducts, // toda la data de productos
      lineItems,
      ticketTotal,
      // Podrías agregar más campos si gustas
    });
  }, [
    fechaInicio,
    fechaEntrega,
    horaAlquiler,
    formaPago,
    detallesPago,
    selectedProducts,
    lineItems,
    ticketTotal,
    onChangeData,
  ]);

  // --- 9) Renderizar cada bloque
  const renderProductBlock = (item, index) => (
    <div key={index} className="mb-6 border p-3 rounded bg-gray-50 relative">
      {selectedProducts.length > 1 && (
        <button
          type="button"
          onClick={() => handleRemoveProduct(index)}
          className="absolute top-2 right-2 text-red-500 hover:text-red-700"
        >
          <FontAwesomeIcon icon={faTrashAlt} />
        </button>
      )}

      <label className="block mb-1 text-sm font-medium">
        Selecciona Producto
      </label>
      <select
        className="border p-2 rounded w-full mb-2"
        onChange={(e) => handleSelectProducto(index, e.target.value)}
        value={item.productId || ""}
      >
        <option value="" disabled>
          -- Selecciona un producto --
        </option>
        {groupedProductsArray.map((group) => (
          <optgroup key={group.idCategoria} label={group.nombreCategoria}>
            {group.productos.map((prod) => {
              const isDisabled = prod.estado !== "activo";
              const tooltip = isDisabled ? `Estado: ${prod.estado}` : "";
              return (
                <option
                  key={prod.idProducto}
                  value={prod.idProducto}
                  disabled={isDisabled}
                  title={tooltip}
                >
                  {prod.nombre} (Stock: {prod.stock})
                </option>
              );
            })}
          </optgroup>
        ))}
      </select>

      {/* Color */}
      {item.colorOptions.length > 0 && (
        <div className="mb-2">
          <label className="block mb-1 text-sm font-medium">Color</label>
          <select
            className="border p-2 rounded w-full"
            value={item.selectedColor || ""}
            onChange={(e) => handleSelectColor(index, e.target.value)}
          >
            <option value="">-- Selecciona un color --</option>
            {item.colorOptions.map((c, idx) => (
              <option key={idx} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Unidades */}
      <div>
        <label>Unidades a rentar:</label>
        <input
          type="number"
          className="border p-2 w-full"
          value={item.unitsToRent || ""}
          onChange={(e) => handleUnitsChange(index, e.target.value)}
        />
      </div>
    </div>
  );

  // --- 10) Render principal
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Paso 3: Selección de Producto</h2>

      <div className="mb-4 flex items-center space-x-2">
        <button
          type="button"
          onClick={handleAddNewProduct}
          className="bg-yellow-500 text-white px-3 py-2 rounded inline-flex items-center"
        >
          <FontAwesomeIcon icon={faPlusCircle} className="mr-2" />
          Agregar nuevo producto
        </button>
        <span className="text-sm text-gray-500">
          (Máximo {MAX_PRODUCTS} productos)
        </span>
      </div>

      {selectedProducts.map((item, index) => renderProductBlock(item, index))}

      <hr className="my-4" />
      <div className="mt-4">
        <div className="flex flex-col md:flex-row md:space-x-4">
          <div className="flex-1 mb-3">
            <label>Fecha de Inicio:</label>
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="border p-2 w-full"
            />
          </div>
          <div className="flex-1 mb-3">
            <label>Fecha de Entrega:</label>
            <input
              type="date"
              value={fechaEntrega}
              onChange={(e) => setFechaEntrega(e.target.value)}
              className="border p-2 w-full"
            />
          </div>
        </div>
        <div className="mb-3">
          <label>Hora de Alquiler:</label>
          <input
            type="time"
            value={horaAlquiler}
            onChange={(e) => setHoraAlquiler(e.target.value)}
            className="border p-2 w-full"
          />
        </div>
      </div>

      {/* Botón COTIZAR */}
      <button
        type="button"
        onClick={handleCotizar}
        disabled={!isFormValid()}
        className={`px-4 py-2 rounded text-white ${
          isFormValid() ? "bg-blue-500 hover:bg-blue-600" : "bg-gray-400"
        }`}
      >
        Cotizar
      </button>

      {/* Ticket */}
      {showTicket && (
        <div className="mt-6 p-4 border border-gray-300 rounded">
          <h3 className="text-lg font-bold mb-2">Detalles de Pago (Ticket)</h3>
          <table className="w-full text-sm mb-4">
            <thead>
              <tr>
                <th className="border px-2 py-1">Nombre Producto</th>
                <th className="border px-2 py-1">Cantidad</th>
                <th className="border px-2 py-1">Precio Unitario</th>
                <th className="border px-2 py-1">Días de Alquiler</th>
                <th className="border px-2 py-1">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {lineItems.map((item, idx) => (
                <tr key={idx}>
                  <td className="border px-2 py-1">{item.productName}</td>
                  <td className="border px-2 py-1 text-center">
                    {item.quantity}
                  </td>
                  <td className="border px-2 py-1 text-right">
                    ${item.unitPrice.toFixed(2)}
                  </td>
                  <td className="border px-2 py-1 text-center">
                    {item.days}
                  </td>
                  <td className="border px-2 py-1 text-right">
                    ${item.subtotal.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="text-right font-bold mb-4">
            Total: ${ticketTotal.toFixed(2)}
          </div>

          <div className="mt-4">
            <label className="block mb-1 font-semibold">Forma de Pago:</label>
            <select
              value={formaPago}
              onChange={(e) => setFormaPago(e.target.value)}
              className="border p-2 w-full mb-3"
            >
              <option value="">-- Selecciona una forma de pago --</option>
              <option value="efectivo">Efectivo</option>
              <option value="tarjeta">Tarjeta</option>
              <option value="transferencia">Transferencia</option>
            </select>

            <label className="block mb-1 font-semibold">Detalles de Pago:</label>
            <input
              type="text"
              value={detallesPago}
              onChange={(e) => setDetallesPago(e.target.value)}
              className="border p-2 w-full mb-3"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default StepThree;
