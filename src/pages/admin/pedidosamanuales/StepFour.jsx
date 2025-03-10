// StepFour.jsx
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClipboardCheck } from "@fortawesome/free-solid-svg-icons";

function StepFour({
  nombre,
  apellido,
  telefono,
  correo,
  esClienteExistente,
  direccionesCliente,
  selectedDireccionId,
  codigoPostal,
  pais,
  estado,
  municipio,
  localidad,
  direccion,
  producto,
  fechaInicio,
  fechaEntrega,
  horaAlquiler,
  stock,
  precio,
  subPrecio,
  formaPago,
  detallesPago,
  productosAdicionales,
}) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-800 flex items-center">
        <FontAwesomeIcon icon={faClipboardCheck} className="mr-2 text-yellow-500" />
        Paso 4: Confirmación
      </h2>
      <div className="bg-gray-100 p-3 rounded text-sm text-gray-700 space-y-2">
        <p>
          <strong>Nombre:</strong> {nombre} {apellido}
        </p>
        <p>
          <strong>Teléfono:</strong> {telefono}
        </p>
        <p>
          <strong>Correo:</strong> {correo || "(No especificado)"}
        </p>

        {esClienteExistente ? (
          <>
            <p>
              <strong>Dirección elegida:</strong>
            </p>
            {direccionesCliente.map((dir) =>
              dir.idDir === selectedDireccionId ? (
                <p key={dir.idDir}>
                  {dir.alias}: {dir.calle}, {dir.localidad}, {dir.municipio}, {dir.estado}. CP:{" "}
                  {dir.cp}
                </p>
              ) : null
            )}
          </>
        ) : (
          <>
            <p>
              <strong>Código Postal:</strong> {codigoPostal}
            </p>
            <p>
              <strong>País:</strong> {pais || "(Sin definir)"}
            </p>
            <p>
              <strong>Estado:</strong> {estado || "(Sin definir)"}
            </p>
            <p>
              <strong>Municipio:</strong> {municipio || "(Sin definir)"}
            </p>
            <p>
              <strong>Localidad:</strong> {localidad || "(Sin definir)"}
            </p>
            <p>
              <strong>Dirección:</strong> {direccion}
            </p>
          </>
        )}

        <p>
          <strong>Producto Principal:</strong> {producto}
        </p>
        <p>
          <strong>Fecha Inicio:</strong> {fechaInicio}
        </p>
        <p>
          <strong>Fecha Entrega:</strong> {fechaEntrega}
        </p>
        <p>
          <strong>Hora Alquiler:</strong> {horaAlquiler}
        </p>
        <p>
          <strong>Stock:</strong> {stock}
        </p>
        <p>
          <strong>Precio:</strong> {precio}
        </p>
        <p>
          <strong>Subprecio:</strong> {subPrecio}
        </p>
        <p>
          <strong>Forma de Pago:</strong> {formaPago || "(No especificada)"}
        </p>
        <p>
          <strong>Detalles de Pago:</strong> {detallesPago || "(Ninguno)"}
        </p>

        {/* Productos adicionales */}
        {productosAdicionales.length > 0 && (
          <>
            <hr className="my-2" />
            <p className="font-semibold">Productos Adicionales:</p>
            {productosAdicionales.map((prod, idx) => (
              <div key={prod.id} className="ml-4 mb-2">
                <p>
                  #{idx + 1}: <strong>{prod.producto}</strong> (Stock: {prod.stock || 0})
                </p>
                <p>
                  Precio: {prod.precio} - Unidades: {prod.units} - Subtotal:{" "}
                  {prod.subPrecio || 0}
                </p>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

export default StepFour;
