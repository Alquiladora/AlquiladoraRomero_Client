import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlusCircle, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import { buildGroupedData } from "./BuildGroupedData";

const calcularDiasAlquiler = (fechaInicio, fechaEntrega) => {
  if (!fechaInicio || !fechaEntrega) return 0;
  const inicio = new Date(fechaInicio);
  const fin = new Date(fechaEntrega);
  let dias = Math.floor((fin - inicio) / (1000 * 60 * 60 * 24));
  return dias < 1 ? 1 : dias;
};

const obtenerFechaHoy = () => new Date().toISOString().split("T")[0];

const obtenerFechaMasMeses = (fecha, meses) => {
  const date = fecha ? new Date(fecha) : new Date();
  date.setMonth(date.getMonth() + meses);
  return date.toISOString().split("T")[0];
};

const StepThree = ({
  fechaInicio,
  setFechaInicio,
  fechaEntrega,
  setFechaEntrega,
  horaAlquiler,
  setHoraAlquiler,
  formaPago,
  setFormaPago,
  detallesPago,
  setDetallesPago,
  productosDisponibles,
  onChangeData,
}) => {
  // Se agrupan los productos con buildGroupedData (ya debe incluir idProductoColores en cada colorOption)
  const groupedCategories = buildGroupedData(productosDisponibles);
  
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [showTicket, setShowTicket] = useState(false);
  const [lineItems, setLineItems] = useState([]);
  const [ticketTotal, setTicketTotal] = useState(0);

  const MAX_PRODUCTS = 40;

  // Función que devuelve los colores que aún no han sido seleccionados para un producto dado
  const getAvailableColorsForProduct = (product) => {
    const selectedColorsForProduct = selectedProducts
      .filter((sp) => sp.productId === product.productId && sp.selectedColor)
      .map((sp) => sp.selectedColor);
    return product.colorOptions.filter(
      (co) => !selectedColorsForProduct.includes(co.color)
    );
  };

  const handleAddNewProduct = () => {
    if (selectedProducts.length >= MAX_PRODUCTS) {
      toast.error(`Máximo ${MAX_PRODUCTS} productos.`);
      return;
    }
    setIsAddingProduct(true);
  };

  const handleSelectProduct = (catId, product) => {
    // Filtramos los colores disponibles para este producto según lo que ya se haya seleccionado.
    const availableColors = getAvailableColorsForProduct(product);
    if (availableColors.length === 0) {
      toast.error("Ya has seleccionado todos los colores disponibles para este producto.");
      return;
    }
    // Creamos un nuevo item con las opciones filtradas
    const newItem = {
      categoryId: catId,
      productId: product.productId,
      // Tomamos el idProductoColores del primer color disponible (se actualizará cuando el usuario seleccione otro)
      idProductoColores: availableColors[0].idProductoColores,
      productName: product.productName,
      details: product.details,
      price: product.price,
      // Solo dejamos los colores que aún no se han seleccionado
      colorOptions: availableColors,
      selectedColor: "",
      unitsToRent: "",
    };

    setSelectedProducts((prev) => [...prev, newItem]);
    setIsAddingProduct(false);
    setSearchTerm("");
  };

  const handleRemoveProduct = (index) => {
    setSelectedProducts((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSelectColor = (index, color) => {
    setSelectedProducts((prev) => {
      const newProds = [...prev];
      newProds[index].selectedColor = color;
      const selectedOption = newProds[index].colorOptions.find(
        (option) => option.color === color
      );
      if (selectedOption && selectedOption.idProductoColores !== undefined) {
        newProds[index].idProductoColores = selectedOption.idProductoColores;
      } else {
        console.warn("La opción de color no tiene idProductoColores definido.");
        newProds[index].idProductoColores = null;
      }
      return newProds;
    });
  };

  const handleUnitsChange = (index, value) => {
    setSelectedProducts((prev) => {
      const newProds = [...prev];
      const item = { ...newProds[index] };
      const chosenColor = item.selectedColor;
      const colorObj = item.colorOptions.find((c) => c.color === chosenColor);
      const stockAvailable = colorObj ? colorObj.stock : 0;
      let newValue = parseInt(value, 10);
      if (isNaN(newValue) || newValue < 0) {
        newValue = 0;
      }
      if (newValue > stockAvailable) {
        toast.error(`No puedes exceder el stock (${stockAvailable}).`);
        item.unitsToRent = String(stockAvailable);
      } else {
        item.unitsToRent = String(newValue);
      }
      newProds[index] = item;
      return newProds;
    });
  };

  const handleCotizar = () => {
    if (selectedProducts.length === 0) {
      toast.error("Debes seleccionar al menos un producto.");
      return;
    }
    if (!fechaInicio) {
      toast.error("Debes ingresar la fecha de inicio.");
      return;
    }
    if (!fechaEntrega) {
      toast.error("Debes ingresar la fecha de entrega.");
      return;
    }
    for (const sp of selectedProducts) {
      if (!sp.selectedColor) {
        toast.error(`Selecciona un color para el producto: ${sp.productName}`);
        return;
      }
      const qty = parseInt(sp.unitsToRent, 10);
      if (!qty || qty < 1) {
        toast.error(`Ingresa una cantidad válida para el producto: ${sp.productName}`);
        return;
      }
    }
    const dias = calcularDiasAlquiler(fechaInicio, fechaEntrega);
    const items = selectedProducts.map((sp) => {
      const price = parseFloat(sp.price) || 0;
      const qty = parseInt(sp.unitsToRent, 10) || 0;
      const subtotal = price * qty * dias;
      return {
        idProducto: sp.productId,
        productName: sp.productName,
        color: sp.selectedColor,
        quantity: qty,
        unitPrice: price,
        days: dias,
        subtotal,
        cantidad: qty,
        idProductoColores: sp.idProductoColores,
      };
    });
    const total = items.reduce((acc, i) => acc + i.subtotal, 0);
    setLineItems(items);
    setTicketTotal(total);
    setShowTicket(true);
  };

  useEffect(() => {
    onChangeData?.({
      isValid:
        selectedProducts.length > 0 &&
        fechaInicio &&
        fechaEntrega &&
        formaPago &&
        detallesPago &&
        selectedProducts.every((sp) => sp.selectedColor && sp.unitsToRent > 0),
      selectedProducts,
      lineItems,
      ticketTotal,
    });
  }, [fechaInicio, fechaEntrega, horaAlquiler, formaPago, detallesPago, selectedProducts, lineItems, ticketTotal]);

  // Render de productos ya seleccionados
  const renderSelectedProducts = () => {
    return selectedProducts.map((item, index) => {
      const chosenColorObj = item.colorOptions.find((c) => c.color === item.selectedColor);
      const stockAvailable = chosenColorObj ? chosenColorObj.stock : 0;
      return (
        <div key={index} className="border p-3 mb-3 rounded bg-gray-50 relative dark:bg-gray-800 dark:border-gray-700">
          <button
            type="button"
            onClick={() => handleRemoveProduct(index)}
            className="absolute top-2 right-2 text-red-500 hover:text-red-700"
          >
            <FontAwesomeIcon icon={faTrashAlt} />
          </button>
          <details open className="border rounded dark:border-gray-700">
            <summary className="px-2 py-1 cursor-pointer font-semibold">{item.productName}</summary>
            <div className="p-2">
              <p className="text-sm text-gray-600 mb-2 dark:text-gray-300">{item.details}</p>
              <p className="text-sm mb-2">
                Precio unitario: <strong>${item.price.toFixed(2)}</strong>
              </p>
              {item.colorOptions.length > 0 && (
                <div className="mb-2">
                  <label className="block mb-1 text-sm font-medium">Color</label>
                  <select
                    className="border p-2 rounded w-full dark:border-gray-600 dark:bg-gray-700"
                    value={item.selectedColor}
                    onChange={(e) => handleSelectColor(index, e.target.value)}
                  >
                    <option value="">-- Selecciona un color --</option>
                    {item.colorOptions.map((c, idx) => (
                      <option
                        key={idx}
                        value={c.color}
                        disabled={c.stock === 0}
                        className={`${c.stock === 0 ? "bg-red-50 dark:bg-red-50 text-red-600 cursor-not-allowed" : ""}`}
                      >
                        {c.color} (Stock: {c.stock})
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="block mb-1 text-sm font-medium">Unidades a rentar:</label>
                <input
                  type="number"
                  min="0"
                  className="border p-2 w-full dark:border-gray-600 dark:bg-gray-700"
                  value={item.unitsToRent}
                  onChange={(e) => handleUnitsChange(index, e.target.value)}
                  disabled={!item.selectedColor}
                  placeholder={item.selectedColor ? `Máx: ${stockAvailable}` : "Selecciona un color primero"}
                />
              </div>
            </div>
          </details>
        </div>
      );
    });
  };

  // Render del selector de productos filtrando aquellos que ya tengan todos sus colores seleccionados
  const renderProductSelector = () => {
    if (!isAddingProduct) return null;
    const term = searchTerm.toLowerCase().trim();

    // Filtramos las categorías y productos
    const filteredCategories = groupedCategories.map((cat) => {
      const productosFiltrados = cat.productos.filter((p) => {
        // Obtenemos los colores disponibles considerando los ya seleccionados para este producto
        const availableColors = getAvailableColorsForProduct(p);
        // Se muestra el producto solo si tiene al menos un color disponible y además coincide con el término de búsqueda
        const nameMatch = p.productName.toLowerCase().includes(term);
        const detailsMatch = p.details.toLowerCase().includes(term);
        return availableColors.length > 0 && (nameMatch || detailsMatch);
      }).map((p) => {
        // Actualizamos las opciones de color del producto a los que aun no han sido usados
        return { ...p, colorOptions: getAvailableColorsForProduct(p) };
      });
      return { ...cat, productos: productosFiltrados };
    });

    const anyProductFound = filteredCategories.some((cat) => cat.productos.length > 0);

    return (
      <div className="border p-3 mb-3 rounded bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
        <div className="mb-4">
          <label className="block mb-1 text-sm font-medium">Buscar producto:</label>
          <input
            type="text"
            className="border p-2 w-full dark:border-gray-600 dark:bg-gray-700"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filtra por nombre o detalles..."
          />
        </div>
        {!anyProductFound && (
          <div className="text-red-600 dark:text-red-400">
            No existe ningún producto con este nombre/detalles.
          </div>
        )}
        {filteredCategories.map((cat) => {
          if (cat.productos.length === 0) return null;
          return (
            <details key={cat.idCategoria} className="mb-2 border rounded dark:border-gray-700">
              <summary className="px-2 py-1 cursor-pointer font-semibold bg-gray-200 dark:bg-gray-700">
                {cat.nombreCategoria}
              </summary>
              <div className="p-2">
                {cat.productos.map((product) => (
                  <div key={product.productId} className="flex items-center justify-between p-2 border-b dark:border-gray-700">
                    <div>
                      <div className="font-medium">{product.productName}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">{product.details}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Colores disponibles: {product.colorOptions.length} | Stock total:{" "}
                        {product.colorOptions.reduce((sum, c) => sum + c.stock, 0)}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSelectProduct(cat.idCategoria, product)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                    >
                      Seleccionar
                    </button>
                  </div>
                ))}
              </div>
            </details>
          );
        })}
      </div>
    );
  };

  return (
    <div className="dark:bg-gray-900 dark:text-white">
      <h2 className="text-xl font-bold mb-4">Paso 3: Selección de Producto</h2>

      <div className="mb-4">
        <button
          type="button"
          onClick={handleAddNewProduct}
          className="bg-yellow-500 text-white px-3 py-2 rounded inline-flex items-center"
        >
          <FontAwesomeIcon icon={faPlusCircle} className="mr-2" />
          Agregar nuevo producto
        </button>
        <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
          (Máximo {MAX_PRODUCTS} productos)
        </span>
      </div>

      {renderProductSelector()}
      {renderSelectedProducts()}

      <hr className="my-4 border-gray-300 dark:border-gray-700" />

      <div className="mt-4">
        <div className="flex flex-col md:flex-row md:space-x-4">
          <div className="flex-1 mb-3">
            <label className="block mb-1 text-sm font-medium">Fecha de Inicio:</label>
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              min={obtenerFechaHoy()}
              max={obtenerFechaMasMeses(obtenerFechaHoy(), 10)}
              className="border p-2 w-full dark:border-gray-600 dark:bg-gray-700"
            />
          </div>
          <div className="flex-1 mb-3">
            <label className="block mb-1 text-sm font-medium">Fecha de Entrega:</label>
            <input
              type="date"
              value={fechaEntrega}
              onChange={(e) => setFechaEntrega(e.target.value)}
              min={fechaInicio ? fechaInicio : obtenerFechaHoy()}
              max={fechaInicio ? obtenerFechaMasMeses(fechaInicio, 10) : obtenerFechaMasMeses(obtenerFechaHoy(), 10)}
              className="border p-2 w-full dark:border-gray-600 dark:bg-gray-700"
            />
          </div>
        </div>
        <div className="mb-3">
          <label className="block mb-1 text-sm font-medium">Hora de Alquiler:</label>
          <input
            type="time"
            value={horaAlquiler}
            onChange={(e) => setHoraAlquiler(e.target.value)}
            className="border p-2 w-full dark:border-gray-600 dark:bg-gray-700"
          />
        </div>
      </div>

      <button
        type="button"
        onClick={handleCotizar}
        disabled={selectedProducts.length === 0}
        className={`px-4 py-2 rounded text-white ${
          selectedProducts.length === 0 ? "bg-gray-400 dark:bg-gray-600" : "bg-blue-500 hover:bg-blue-600"
        }`}
      >
        Cotizar
      </button>

      {showTicket && (
        <div className="mt-6 p-4 border border-gray-300 rounded dark:border-gray-700">
          <h3 className="text-lg font-bold mb-2">Detalles de Pago (Ticket)</h3>
          <table className="w-full text-sm mb-4">
            <thead>
              <tr>
                <th className="border px-2 py-1 dark:border-gray-700">Producto</th>
                <th className="border px-2 py-1 dark:border-gray-700">Color</th>
                <th className="border px-2 py-1 dark:border-gray-700">Cantidad</th>
                <th className="border px-2 py-1 dark:border-gray-700">Precio Unit.</th>
                <th className="border px-2 py-1 dark:border-gray-700">Días</th>
                <th className="border px-2 py-1 dark:border-gray-700">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {lineItems.map((item, idx) => (
                <tr key={idx}>
                  <td className="border px-2 py-1 dark:border-gray-700">{item.productName}</td>
                  <td className="border px-2 py-1 text-center dark:border-gray-700">{item.color}</td>
                  <td className="border px-2 py-1 text-center dark:border-gray-700">{item.quantity}</td>
                  <td className="border px-2 py-1 text-right dark:border-gray-700">${item.unitPrice.toFixed(2)}</td>
                  <td className="border px-2 py-1 text-center dark:border-gray-700">{item.days}</td>
                  <td className="border px-2 py-1 text-right dark:border-gray-700">${item.subtotal.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="text-right font-bold mb-4">Total: ${ticketTotal.toFixed(2)}</div>
          <div className="mt-4">
            <label className="block mb-1 font-semibold">Forma de Pago:</label>
            <select
              value={formaPago}
              onChange={(e) => setFormaPago(e.target.value)}
              className="border p-2 w-full mb-3 dark:border-gray-600 dark:bg-gray-700"
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
              maxLength={40}
              className="border p-2 w-full mb-1 dark:border-gray-600 dark:bg-gray-700"
            />
            <div className="text-right text-xs text-gray-500 dark:text-gray-400">{detallesPago.length}/40</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StepThree;
