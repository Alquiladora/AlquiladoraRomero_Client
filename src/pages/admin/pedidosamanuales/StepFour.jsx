import React, { useState, useEffect } from "react";
// IMPORTAMOS ÍCONOS
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faMapMarkerAlt,
  faCalendarCheck,
  faCartArrowDown,
  faMoneyBillWave,
  faHashtag,
} from "@fortawesome/free-solid-svg-icons";

const StepFour = ({
  // Datos de Paso 1
  nombre,
  apellido,
  telefono,
  correo,

  // Datos de Paso 2
  esClienteExistente,
  direccionesCliente,
  selectedDireccionId,
  codigoPostal,
  pais,
  estado,
  municipio,
  localidad,
  direccion,

  // Datos de Paso 3 (traídos desde step3Data en Wizard)
  step3Data,

  // Otras variables sueltas
  fechaInicio,
  fechaEntrega,
  horaAlquiler,
  formaPago,
  detallesPago,
}) => {
  // ----------------------------------------------------------------
  // 1. Generar ID de rastreo solo si el cliente NO existe
  // ----------------------------------------------------------------
  const [trackingId, setTrackingId] = useState("");

  useEffect(() => {
    if (!esClienteExistente) {
      // Generar un ID simple. Ejemplo: "PED1687975123457"
      const newId = "PED" + Date.now();
      setTrackingId(newId);
    } else {
      setTrackingId(""); // No hay ID de rastreo para clientes existentes
    }
  }, [esClienteExistente]);

  // ----------------------------------------------------------------
  // 2. Buscar la dirección seleccionada en caso de cliente existente
  // ----------------------------------------------------------------
  let direccionSeleccionada = null;
  if (esClienteExistente && selectedDireccionId) {
    direccionSeleccionada = direccionesCliente.find(
      (dir) => dir.idDireccion === selectedDireccionId
    );
  }

  // ----------------------------------------------------------------
  // 3. Render
  // ----------------------------------------------------------------
  return (
    <div className="space-y-4">
      {/* Encabezado */}
      <h2 className="text-xl font-bold">
        Paso 4: Confirmación
      </h2>

      {/* ID de RASTREO (si existe) */}
      {trackingId && (
        <div className="flex items-center text-sm bg-gray-100 p-2 rounded border border-gray-300">
          <FontAwesomeIcon icon={faHashtag} className="text-gray-500 mr-2" />
          <span className="font-semibold text-gray-700">
            ID de Rastreo: {trackingId}
          </span>
        </div>
      )}

      {/* Datos del Cliente */}
      <div className="bg-white p-4 rounded shadow-sm border">
        <h3 className="text-lg font-semibold flex items-center mb-2">
          <FontAwesomeIcon icon={faUser} className="text-yellow-500 mr-2" />
          Datos del Cliente
        </h3>
        <p>
          <span className="font-semibold">Nombre:</span> {nombre} {apellido}
        </p>
        <p>
          <span className="font-semibold">Teléfono:</span> {telefono}
        </p>
        <p>
          <span className="font-semibold">Correo:</span> {correo}
        </p>
      </div>

      {/* Dirección */}
      <div className="bg-white p-4 rounded shadow-sm border">
        <h3 className="text-lg font-semibold flex items-center mb-2">
          <FontAwesomeIcon
            icon={faMapMarkerAlt}
            className="text-yellow-500 mr-2"
          />
          Dirección
        </h3>

        {esClienteExistente ? (
          direccionSeleccionada ? (
            <div className="text-sm text-gray-700">
              <p>Código Postal: {direccionSeleccionada.codigoPostal}</p>
              <p>País: {direccionSeleccionada.pais}</p>
              <p>Estado: {direccionSeleccionada.estado}</p>
              <p>Municipio: {direccionSeleccionada.municipio}</p>
              <p>Localidad: {direccionSeleccionada.localidad}</p>
              <p>Dirección: {direccionSeleccionada.direccion}</p>
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              No se encontró la dirección seleccionada en la BD.
            </p>
          )
        ) : (
          <div className="text-sm text-gray-700">
            <p>Código Postal: {codigoPostal}</p>
            <p>País: {pais}</p>
            <p>Estado: {estado}</p>
            <p>Municipio: {municipio}</p>
            <p>Localidad: {localidad}</p>
            <p>Dirección: {direccion}</p>
          </div>
        )}
      </div>

      {/* Detalles de Alquiler */}
      <div className="bg-white p-4 rounded shadow-sm border">
        <h3 className="text-lg font-semibold flex items-center mb-2">
          <FontAwesomeIcon
            icon={faCalendarCheck}
            className="text-yellow-500 mr-2"
          />
          Detalles de Alquiler
        </h3>
        <p className="text-sm">
          <span className="font-semibold">Fecha Inicio:</span> {fechaInicio}
        </p>
        <p className="text-sm">
          <span className="font-semibold">Fecha Entrega:</span> {fechaEntrega}
        </p>
        <p className="text-sm">
          <span className="font-semibold">Hora Alquiler:</span> {horaAlquiler}
        </p>
      </div>

      {/* Productos Seleccionados */}
      <div className="bg-white p-4 rounded shadow-sm border">
        <h3 className="text-lg font-semibold flex items-center mb-2">
          <FontAwesomeIcon
            icon={faCartArrowDown}
            className="text-yellow-500 mr-2"
          />
          Productos Seleccionados
        </h3>

        {step3Data.lineItems && step3Data.lineItems.length > 0 ? (
          <table className="w-full text-sm mb-4 border border-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-2 py-1">Producto</th>
                <th className="border px-2 py-1">Cant.</th>
                <th className="border px-2 py-1">Precio</th>
                <th className="border px-2 py-1">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {step3Data.lineItems.map((item, i) => (
                <tr key={i}>
                  <td className="border px-2 py-1">{item.productName}</td>
                  <td className="border px-2 py-1 text-center">
                    {item.quantity}
                  </td>
                  <td className="border px-2 py-1 text-right">
                    ${item.unitPrice.toFixed(2)}
                  </td>
                  <td className="border px-2 py-1 text-right">
                    ${item.subtotal.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-sm text-gray-500">No hay productos seleccionados.</p>
        )}

        <p className="text-right font-bold text-gray-800 mt-2">
          Total: ${step3Data.ticketTotal.toFixed(2)}
        </p>
      </div>

      {/* Forma de Pago */}
      <div className="bg-white p-4 rounded shadow-sm border">
        <h3 className="text-lg font-semibold flex items-center mb-2">
          <FontAwesomeIcon icon={faMoneyBillWave} className="text-yellow-500 mr-2" />
          Forma de Pago
        </h3>
        <p className="text-sm">
          <span className="font-semibold">Tipo:</span>{" "}
          {formaPago || "No especificada"}
        </p>
        <p className="text-sm">
          <span className="font-semibold">Detalles:</span>{" "}
          {detallesPago || "N/A"}
        </p>
      </div>
    </div>
  );
};

export default StepFour;
