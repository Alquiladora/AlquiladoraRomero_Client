// StepThree.jsx
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome } from "@fortawesome/free-solid-svg-icons";

function StepThree({
  producto,
  setProducto,
  fechaInicio,
  setFechaInicio,
  fechaEntrega,
  setFechaEntrega,
  horaAlquiler,
  setHoraAlquiler,
  stock,
  setStock,
  precio,
  setPrecio,
  subPrecio,
  setSubPrecio,
  formaPago,
  setFormaPago,
  detallesPago,
  setDetallesPago,
  unitsToRent,
  setUnitsToRent,
  handleCotizarPrincipal,
  agregarProductoAdicional,
  productosAdicionales,
  actualizarProductoAdicional,
  cotizarProductoAdicional,
}) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-800 flex items-center">
        <FontAwesomeIcon icon={faHome} className="mr-2 text-yellow-500" />
        Paso 3: Producto y Fechas
      </h2>

      {/* Producto principal */}
      <div className="space-y-4 border border-gray-300 p-3 rounded bg-gray-50">
        <h3 className="font-semibold text-gray-700">Producto Principal</h3>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Producto a Alquilar*
          </label>
          <select
            className="w-full p-2 border border-gray-300 rounded"
            value={producto}
            onChange={(e) => setProducto(e.target.value)}
          >
            <option value="">-- Seleccionar --</option>
            <option value="Laptop">Laptop</option>
            <option value="Proyector">Proyector</option>
            <option value="Mueble">Mueble</option>
          </select>
        </div>

        {producto && (
          <p className="text-sm text-gray-600">
            Disponible: <strong>{stock || 0}</strong> unidades para {producto}.
          </p>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Unidades a rentar
          </label>
          <input
            type="number"
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="Ej: 2"
            value={unitsToRent}
            onChange={(e) => setUnitsToRent(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Fecha Inicio*
          </label>
          <input
            type="date"
            className="w-full p-2 border border-gray-300 rounded"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Fecha Entrega*
          </label>
          <input
            type="date"
            className="w-full p-2 border border-gray-300 rounded"
            value={fechaEntrega}
            onChange={(e) => setFechaEntrega(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Hora de Alquiler*
          </label>
          <input
            type="time"
            className="w-full p-2 border border-gray-300 rounded"
            value={horaAlquiler}
            onChange={(e) => setHoraAlquiler(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Stock (ej. total)
          </label>
          <input
            type="number"
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="Ej: 10"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Precio
          </label>
          <input
            type="number"
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="Ej: 500"
            value={precio}
            onChange={(e) => setPrecio(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Subprecio (se actualizará tras Cotizar)
          </label>
          <input
            type="number"
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="Ej: 450"
            value={subPrecio}
            onChange={(e) => setSubPrecio(e.target.value)}
          />
        </div>

        <button
          type="button"
          onClick={handleCotizarPrincipal}
          className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition"
        >
          Cotizar Producto Principal
        </button>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Forma de pago
          </label>
          <select
            className="w-full p-2 border border-gray-300 rounded"
            value={formaPago}
            onChange={(e) => setFormaPago(e.target.value)}
          >
            <option value="">-- Seleccionar --</option>
            <option value="Efectivo">Efectivo</option>
            <option value="Tarjeta">Tarjeta</option>
            <option value="Transferencia">Transferencia</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Detalles de pago
          </label>
          <textarea
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="Ej: número de tarjeta, etc."
            value={detallesPago}
            onChange={(e) => setDetallesPago(e.target.value)}
          />
        </div>
      </div>

      {/* Botón para agregar más productos */}
      <button
        type="button"
        onClick={agregarProductoAdicional}
        className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition"
      >
        + Agregar otro producto
      </button>

      {/* Lista de productos adicionales */}
      {productosAdicionales.map((p, index) => (
        <div key={p.id} className="border border-gray-300 p-3 rounded bg-gray-50 mt-2">
          <h3 className="font-semibold text-gray-700 mb-2">
            Producto Adicional #{index + 1}
          </h3>

          <label className="block text-sm font-medium text-gray-700">
            Producto
          </label>
          <select
            className="w-full p-2 border border-gray-300 rounded mb-2"
            value={p.producto}
            onChange={(e) => actualizarProductoAdicional(p.id, "producto", e.target.value)}
          >
            <option value="">-- Seleccionar --</option>
            <option value="Laptop">Laptop</option>
            <option value="Proyector">Proyector</option>
            <option value="Mueble">Mueble</option>
          </select>

          <label className="block text-sm font-medium text-gray-700">
            Stock
          </label>
          <input
            type="number"
            className="w-full p-2 border border-gray-300 rounded mb-2"
            placeholder="Ej: 10"
            value={p.stock}
            onChange={(e) => actualizarProductoAdicional(p.id, "stock", e.target.value)}
          />

          <label className="block text-sm font-medium text-gray-700">
            Precio
          </label>
          <input
            type="number"
            className="w-full p-2 border border-gray-300 rounded mb-2"
            placeholder="Ej: 500"
            value={p.precio}
            onChange={(e) => actualizarProductoAdicional(p.id, "precio", e.target.value)}
          />

          <label className="block text-sm font-medium text-gray-700">
            Unidades a rentar
          </label>
          <input
            type="number"
            className="w-full p-2 border border-gray-300 rounded mb-2"
            placeholder="Ej: 2"
            value={p.units}
            onChange={(e) => actualizarProductoAdicional(p.id, "units", e.target.value)}
          />

          <label className="block text-sm font-medium text-gray-700">
            Subprecio (cotizado)
          </label>
          <input
            type="number"
            className="w-full p-2 border border-gray-300 rounded mb-2"
            placeholder="0"
            value={p.subPrecio}
            onChange={(e) => actualizarProductoAdicional(p.id, "subPrecio", e.target.value)}
          />

          <button
            type="button"
            onClick={() => cotizarProductoAdicional(p.id)}
            className="px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700 transition"
          >
            Cotizar este producto
          </button>
        </div>
      ))}
    </div>
  );
}

export default StepThree;
