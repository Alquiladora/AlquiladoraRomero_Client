import React, { useState } from "react";
import { CheckIcon } from "@heroicons/react/outline"; // Ejemplo de ícono (opcional)

function CarritoRentaSheinStyle() {
  // Estado de los productos a rentar
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      nombre: "Silla Vintage",
      imagen: "https://via.placeholder.com/80?text=Silla",
      precioPorDia: 120,
      dias: 3,
      disponible: true,
    },
    {
      id: 2,
      nombre: "Mesa de Madera",
      imagen: "https://via.placeholder.com/80?text=Mesa",
      precioPorDia: 250,
      dias: 2,
      disponible: true,
    },
  ]);

  // Estado para checkboxes (seleccionar todos o individuales)
  const [selectedItems, setSelectedItems] = useState(() =>
    cartItems.map((item) => item.id)
  );
  const allSelected = selectedItems.length === cartItems.length;

  // Funciones de actualización
  const handleToggleItem = (id) => {
    setSelectedItems((prev) =>
      prev.includes(id)
        ? prev.filter((itemId) => itemId !== id)
        : [...prev, id]
    );
  };

  const handleToggleAll = () => {
    if (allSelected) {
      // Deseleccionar todo
      setSelectedItems([]);
    } else {
      // Seleccionar todo
      setSelectedItems(cartItems.map((item) => item.id));
    }
  };

  const handleChangeDias = (id, newDias) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, dias: newDias } : item
      )
    );
  };

  const handleRemoveItem = (id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
    setSelectedItems((prev) => prev.filter((itemId) => itemId !== id));
  };

  // Cálculo de subtotal y total
  const calcularSubtotal = (item) => item.precioPorDia * item.dias;

  const total = cartItems.reduce((acc, item) => {
    if (selectedItems.includes(item.id)) {
      return acc + calcularSubtotal(item);
    }
    return acc;
  }, 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      {/* Barra superior de pasos (estilo Shein) */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto py-3 px-4 flex items-center space-x-2 text-sm">
          <span className="font-semibold">Carrito</span>
          <span className="text-gray-400"> &gt; </span>
          <span>Proceder al pago</span>
          <span className="text-gray-400"> &gt; </span>
          <span>Pago</span>
          <span className="text-gray-400"> &gt; </span>
          <span>Pedido completo</span>
        </div>
      </div>

      {/* Banner tipo “Precio de envío” o “Promoción” */}
      <div className="bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto py-3 px-4 text-sm text-gray-700 dark:text-gray-300 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
          <div>
            <span className="font-semibold">Precio de renta:</span>{" "}
            Renta 3 días y obtén un 10% de descuento en el 4to día.
          </div>
          <div className="text-blue-600 dark:text-blue-400 cursor-pointer hover:underline">
            Ver detalles
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-6xl mx-auto py-6 px-4">
        {/* Título: TODOS LOS ARTÍCULOS */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg sm:text-xl font-semibold">
            TODOS LOS ARTÍCULOS ({cartItems.length})
          </h2>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Categoría: <span className="font-medium">Mobiliario</span>
          </div>
        </div>

        {/* Estructura principal: lista de items (col izquierda) + resumen (col derecha) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sección de Items */}
          <div className="lg:col-span-2 space-y-4">
            {/* Encabezado estilo tabla (solo en desktop) */}
            <div className="hidden md:flex items-center bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm font-semibold">
              <div className="w-1/12 text-center">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={handleToggleAll}
                />
              </div>
              <div className="w-3/12">Producto</div>
              <div className="w-2/12 text-center">Precio/Día</div>
              <div className="w-2/12 text-center">Días</div>
              <div className="w-2/12 text-right">Subtotal</div>
              <div className="w-2/12 text-right">Acciones</div>
            </div>

            {cartItems.map((item) => {
              const isChecked = selectedItems.includes(item.id);
              const subtotal = calcularSubtotal(item);
              return (
                <div
                  key={item.id}
                  className="bg-white dark:bg-gray-800 rounded shadow-sm p-3 md:p-4 flex flex-col md:flex-row items-start md:items-center md:space-x-4"
                >
                  {/* Checkbox (mobile + desktop) */}
                  <div className="md:w-1/12 flex justify-center mb-2 md:mb-0">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleToggleItem(item.id)}
                    />
                  </div>

                  {/* Imagen + Info */}
                  <div className="flex items-center md:w-3/12 space-x-3">
                    <img
                      src={item.imagen}
                      alt={item.nombre}
                      className="w-16 h-16 object-cover rounded-md transform hover:scale-105 transition-transform"
                    />
                    <div className="text-sm">
                      <p className="font-semibold">
                        {item.nombre}
                      </p>
                      <p className="text-gray-500 dark:text-gray-400 text-xs">
                        {item.disponible
                          ? "Disponible"
                          : "No disponible"}
                      </p>
                    </div>
                  </div>

                  {/* Precio / Día */}
                  <div className="md:w-2/12 text-center mt-2 md:mt-0">
                    <p className="text-sm md:text-base font-medium">
                      ${item.precioPorDia}
                    </p>
                  </div>

                  {/* Días */}
                  <div className="md:w-2/12 text-center mt-2 md:mt-0">
                    <input
                      type="number"
                      min="1"
                      value={item.dias}
                      onChange={(e) =>
                        handleChangeDias(item.id, Number(e.target.value))
                      }
                      className="w-16 text-center border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>

                  {/* Subtotal */}
                  <div className="md:w-2/12 text-right mt-2 md:mt-0">
                    <p className="text-sm md:text-base font-medium">
                      ${subtotal}
                    </p>
                  </div>

                  {/* Acciones */}
                  <div className="md:w-2/12 text-right mt-2 md:mt-0">
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-red-500 hover:underline text-xs md:text-sm"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Resumen del pedido (col derecha) */}
          <div className="bg-white dark:bg-gray-800 rounded p-4 shadow-sm self-start">
            <h3 className="text-base md:text-lg font-semibold mb-3">
              Resumen de la Renta
            </h3>
            <div className="space-y-2 text-sm md:text-base">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">
                  Productos seleccionados:
                </span>
                <span className="font-medium text-gray-800 dark:text-gray-100">
                  {selectedItems.length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">
                  Total:
                </span>
                <span className="font-bold text-gray-800 dark:text-gray-100">
                  ${total}
                </span>
              </div>
            </div>

            {/* Botón para continuar o pagar */}
            <button
              onClick={() => alert("Procediendo a la renta...")}
              className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition-all"
            >
              Continuar con la renta
            </button>

            {/* Aceptamos (iconos de pago) */}
            <div className="mt-4">
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                Aceptamos:
              </p>
              <div className="flex items-center space-x-2">
                {/* Ejemplo de íconos de tarjetas/pagos */}
                <img
                  src="https://via.placeholder.com/40x20?text=VISA"
                  alt="Visa"
                />
                <img
                  src="https://via.placeholder.com/40x20?text=MC"
                  alt="Mastercard"
                />
                <img
                  src="https://via.placeholder.com/40x20?text=PayPal"
                  alt="PayPal"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default CarritoRentaSheinStyle;
