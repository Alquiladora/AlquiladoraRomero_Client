/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser,
  faMapMarkerAlt,
  faCalendarCheck,
  faCartArrowDown,
  faMoneyBillWave,
  faHashtag,
} from '@fortawesome/free-solid-svg-icons';

const StepFour = ({
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
  referencia,

  step3Data,
  fechaInicio,
  fechaEntrega,
  horaAlquiler,
  formaPago,
  detallesPago,
  setTrackingId,
  trackingId,
}) => {
  const generateNumericTrackingId = () => {
    const timestamp = Date.now().toString();
    const randomDigits = Math.floor(Math.random() * 100)
      .toString()
      .padStart(2, '0');
    return 'ROMERO-' + timestamp + randomDigits;
  };

  useEffect(() => {
    const newId = generateNumericTrackingId();
    setTrackingId(newId);
  }, [setTrackingId]);

  let direccionSeleccionada = null;
  if (esClienteExistente && selectedDireccionId) {
    direccionSeleccionada = direccionesCliente.find(
      (dir) => dir.idDireccion === selectedDireccionId
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold dark:text-white">
        Paso 4: Confirmación
      </h2>

      {!esClienteExistente && trackingId && (
        <div className="flex items-center text-sm bg-gray-100 dark:bg-gray-700 p-2 rounded border border-gray-300 dark:border-gray-600">
          <FontAwesomeIcon icon={faHashtag} className="text-gray-500 mr-2" />
          <span className="font-semibold text-gray-700 dark:text-white">
            ID de Rastreo: {trackingId}
          </span>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 p-4 rounded shadow-sm border dark:border-gray-600">
        <h3 className="text-lg font-semibold flex items-center mb-2 dark:text-white">
          <FontAwesomeIcon icon={faUser} className="text-yellow-500 mr-2" />
          Datos del Cliente
        </h3>
        <p className="text-gray-700 dark:text-gray-300">
          <span className="font-semibold">Nombre:</span> {nombre} {apellido}
        </p>
        <p className="text-gray-700 dark:text-gray-300">
          <span className="font-semibold">Teléfono:</span> {telefono}
        </p>
        <p className="text-gray-700 dark:text-gray-300">
          <span className="font-semibold">Correo:</span> {correo}
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded shadow-sm border dark:border-gray-600">
        <h3 className="text-lg font-semibold flex items-center mb-2 dark:text-white">
          <FontAwesomeIcon
            icon={faMapMarkerAlt}
            className="text-yellow-500 mr-2"
          />
          Dirección
        </h3>
        {esClienteExistente ? (
          direccionSeleccionada ? (
            <div className="text-sm text-gray-700 dark:text-gray-300">
              <p>Código Postal: {direccionSeleccionada.codigoPostal}</p>
              <p>País: {direccionSeleccionada.pais}</p>
              <p>Estado: {direccionSeleccionada.estado}</p>
              <p>Municipio: {direccionSeleccionada.municipio}</p>
              <p>Localidad: {direccionSeleccionada.localidad}</p>
              <p>Dirección: {direccionSeleccionada.direccion}</p>
              <p>Detalles: {direccionSeleccionada.referencias}</p>
            </div>
          ) : (
            <div className="text-sm text-gray-700 dark:text-gray-300">
              <p>Código Postal: {codigoPostal}</p>
              <p>País: {pais}</p>
              <p>Estado: {estado}</p>
              <p>Municipio: {municipio}</p>
              <p>Localidad: {localidad}</p>
              <p>Dirección: {direccion}</p>
              <p>Detalles: {referencia}</p>
            </div>
          )
        ) : (
          <div className="text-sm text-gray-700 dark:text-gray-300">
            <p>Código Postal: {codigoPostal}</p>
            <p>País: {pais}</p>
            <p>Estado: {estado}</p>
            <p>Municipio: {municipio}</p>
            <p>Localidad: {localidad}</p>
            <p>Dirección: {direccion}</p>
            <p>Detalles: {referencia}</p>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded shadow-sm border dark:border-gray-600">
        <h3 className="text-lg font-semibold flex items-center mb-2 dark:text-white">
          <FontAwesomeIcon
            icon={faCalendarCheck}
            className="text-yellow-500 mr-2"
          />
          Detalles de Alquiler
        </h3>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          <span className="font-semibold">Fecha Inicio:</span> {fechaInicio}
        </p>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          <span className="font-semibold">Fecha Entrega:</span> {fechaEntrega}
        </p>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          <span className="font-semibold">Hora Alquiler:</span> {horaAlquiler}
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded shadow-sm border dark:border-gray-600">
        <h3 className="text-lg font-semibold flex items-center mb-2 dark:text-white">
          <FontAwesomeIcon
            icon={faCartArrowDown}
            className="text-yellow-500 mr-2"
          />
          Productos Seleccionados
        </h3>
        {step3Data.lineItems && step3Data.lineItems.length > 0 ? (
          <table className="w-full text-sm mb-4 border border-gray-200 dark:border-gray-600">
            <thead className="bg-gray-100 dark:bg-gray-700">
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
                  <td className="border px-2 py-1 text-gray-700 dark:text-gray-300">
                    {item.productName}
                  </td>
                  <td className="border px-2 py-1 text-center text-gray-700 dark:text-gray-300">
                    {item.quantity}
                  </td>
                  <td className="border px-2 py-1 text-right text-gray-700 dark:text-gray-300">
                    ${item.unitPrice.toFixed(2)}
                  </td>
                  <td className="border px-2 py-1 text-right text-gray-700 dark:text-gray-300">
                    ${item.subtotal.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No hay productos seleccionados.
          </p>
        )}
        <p className="text-right font-bold text-gray-800 dark:text-gray-200 mt-2">
          Total: ${step3Data.ticketTotal.toFixed(2)}
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded shadow-sm border dark:border-gray-600">
        <h3 className="text-lg font-semibold flex items-center mb-2 dark:text-white">
          <FontAwesomeIcon
            icon={faMoneyBillWave}
            className="text-yellow-500 mr-2"
          />
          Forma de Pago
        </h3>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          <span className="font-semibold">Tipo:</span>{' '}
          {formaPago || 'No especificada'}
        </p>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          <span className="font-semibold">Detalles:</span>{' '}
          {detallesPago || 'N/A'}
        </p>
      </div>
    </div>
  );
};

export default StepFour;
