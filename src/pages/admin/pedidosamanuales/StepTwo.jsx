import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLocationArrow,
  faSpinner,
  faCheckCircle,
  faUser,
  faClipboard,
  faMapMarkerAlt,
  faMapPin,
} from "@fortawesome/free-solid-svg-icons";
import ReactCountryFlag from "react-country-flag";

function StepTwo({
  esClienteExistente,
  direccionesCliente,
  selectedDireccionId,
  setSelectedDireccionId,
  codigoPostal,
  setCodigoPostal,
  handleValidarCP,
  cargandoCP,
  cpValido,
  pais,
  setPais,
  estado,
  setEstado,
  municipio,
  setMunicipio,
  localidad,
  setLocalidad,
  modoLocalidad,
  setModoLocalidad,
  localidadesDisponibles,
  direccion,
  setDireccion,
  referencia = "",
  setReferencia = () => {},
}) {
  const [accordionOpen, setAccordionOpen] = useState(false);

  const permitirAgregarDireccion =
    !esClienteExistente ||
    !direccionesCliente ||
    direccionesCliente.length < 6;

  const direccionesValidas =
    direccionesCliente && Array.isArray(direccionesCliente)
      ? direccionesCliente.filter((dir) => dir.codigoPostal !== null)
      : [];

  const referenciaRestante = 50 - referencia.length;

  return (
    <div className="space-y-4 dark:text-gray-100">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center">
        <FontAwesomeIcon
          icon={faLocationArrow}
          className="mr-2 text-yellow-500"
        />
        Paso 2: Ubicación
      </h2>

      {esClienteExistente && (
        <div className="space-y-2">
          <p className="text-sm text-gray-500 dark:text-gray-300">
            Selecciona la dirección a enviar:
          </p>
          {direccionesValidas.length > 0 ? (
            direccionesValidas.map((dir) => (
              <label
                key={dir.idDir}
                className="block border border-gray-300 dark:border-gray-600 rounded-md p-3 shadow-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 mb-3 relative border-l-4 border-l-yellow-500"
              >
                {dir.pais === "México" && (
                  <div className="absolute top-2 right-2">
                    <ReactCountryFlag
                      countryCode="MX"
                      svg
                      className="w-5 h-5"
                      title="México"
                    />
                  </div>
                )}

                <div className="flex items-center mb-2">
                  <input
                    type="radio"
                    name="direccionSeleccionada"
                    className="mr-2"
                    checked={selectedDireccionId === dir.idDireccion}
                    onChange={() => setSelectedDireccionId(dir.idDireccion)}
                  />
                  <span className="font-semibold text-gray-800 dark:text-white">
                    {dir.alias || "Dirección"}
                  </span>
                  {dir.predeterminado === 1 && (
                    <FontAwesomeIcon
                      icon={faCheckCircle}
                      className="text-green-500 ml-2"
                      title="Dirección predeterminada"
                    />
                  )}
                </div>

                <div className="text-sm text-gray-600 dark:text-gray-300 ml-6 space-y-1">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <FontAwesomeIcon
                        icon={faUser}
                        className="text-gray-500 mr-2 dark:text-gray-400"
                      />
                      <strong>Datos:</strong>&nbsp;
                      {dir.nombreDireccion}, {dir.apellidoDireccion}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      {dir.telefonoDireccion}
                    </div>
                  </div>

                  <p className="flex items-center">
                    <FontAwesomeIcon
                      icon={faClipboard}
                      className="text-gray-500 mr-2 dark:text-gray-400"
                    />
                    <strong>Detalles:</strong>&nbsp;{dir.referencias}
                  </p>
                  <p className="flex items-center">
                    <FontAwesomeIcon
                      icon={faMapMarkerAlt}
                      className="text-gray-500 mr-2 dark:text-gray-400"
                    />
                    <strong>Ubicación:</strong>&nbsp;
                    {dir.localidad}, {dir.municipio}, {dir.estado}
                  </p>
                  <p className="flex items-center">
                    <FontAwesomeIcon
                      icon={faMapPin}
                      className="text-gray-500 mr-2 dark:text-gray-400"
                    />
                    <strong>CP:</strong>&nbsp;{dir.codigoPostal}
                  </p>
                </div>
              </label>
            ))
          ) : (
            <p className="text-sm text-red-500">
              El cliente no tiene ninguna dirección registrada.
            </p>
          )}
        </div>
      )}

      {permitirAgregarDireccion && (
        <div className="mt-6 border-t dark:border-gray-700 pt-4">
          <button
            type="button"
            onClick={() => setAccordionOpen((prev) => !prev)}
            className="w-full text-left flex items-center justify-between focus:outline-none"
          >
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              Agregar Nueva Dirección
            </h3>
            <span className="text-2xl">{accordionOpen ? "−" : "+"}</span>
          </button>
          {accordionOpen && (
            <div className="mt-4 space-y-4">
              <div className="flex items-end space-x-2">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Código Postal (5 dígitos)*
                  </label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded dark:text-white"
                    maxLength={5}
                    placeholder="Ej: 12345"
                    value={codigoPostal}
                    onChange={(e) =>
                      setCodigoPostal(e.target.value.replace(/\D/g, ""))
                    }
                  />
                </div>
                <button
                  type="button"
                  onClick={handleValidarCP}
                  disabled={codigoPostal.length < 5 || cargandoCP}
                  className={`px-4 py-2 rounded transition ${
                    codigoPostal.length === 5 && !cargandoCP
                      ? "bg-yellow-500 text-white hover:bg-yellow-600"
                      : "bg-gray-400 text-gray-200 cursor-not-allowed"
                  }`}
                >
                  {cargandoCP ? (
                    <div className="flex items-center space-x-2">
                      <FontAwesomeIcon icon={faSpinner} spin />
                      <span>Validando...</span>
                    </div>
                  ) : (
                    "Validar CP"
                  )}
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  País
                </label>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded dark:text-white"
                  value={pais}
                  onChange={(e) => setPais(e.target.value)}
                  disabled={!cpValido}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Estado
                </label>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded dark:text-white"
                  value={estado}
                  onChange={(e) => setEstado(e.target.value)}
                  disabled={!cpValido}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Municipio
                </label>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded dark:text-white"
                  value={municipio}
                  onChange={(e) => setMunicipio(e.target.value)}
                  disabled={!cpValido}
                />
              </div>

              <fieldset className="space-y-2">
                <legend className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Localidad/Colonia
                </legend>
                <div className="flex items-center space-x-4">
                  <label className="inline-flex items-center text-gray-700 dark:text-gray-300">
                    <input
                      type="radio"
                      name="modoLocalidad"
                      value="seleccionar"
                      className="mr-1"
                      checked={modoLocalidad === "seleccionar"}
                      onChange={() => setModoLocalidad("seleccionar")}
                      disabled={!cpValido}
                    />
                    Seleccionar
                  </label>
                  <label className="inline-flex items-center text-gray-700 dark:text-gray-300">
                    <input
                      type="radio"
                      name="modoLocalidad"
                      value="manual"
                      className="mr-1"
                      checked={modoLocalidad === "manual"}
                      onChange={() => setModoLocalidad("manual")}
                      disabled={!cpValido}
                    />
                    Manual
                  </label>
                </div>

                {modoLocalidad === "seleccionar" && (
                  <select
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded dark:text-white"
                    value={localidad}
                    onChange={(e) => setLocalidad(e.target.value)}
                    disabled={!cpValido}
                  >
                    {localidadesDisponibles.map((item, idx) => {
                      const nombreColonia =
                        item.d_asenta || item.name || `Opción ${idx + 1}`;
                      return (
                        <option key={idx} value={nombreColonia}>
                          {nombreColonia}
                        </option>
                      );
                    })}
                  </select>
                )}

                {modoLocalidad === "manual" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 sr-only dark:text-gray-300">
                      Localidad manual
                    </label>
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded dark:text-white"
                      placeholder="Ingresa tu colonia/localidad"
                      value={localidad}
                      onChange={(e) => setLocalidad(e.target.value)}
                      disabled={!cpValido}
                    />
                  </div>
                )}
              </fieldset>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Dirección (calle, número)*
                </label>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded dark:text-white"
                  placeholder="Calle y número"
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Referencia (máx. 50 caracteres)
                </label>
                <textarea
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded dark:text-white"
                  placeholder="Ingresa una referencia (ej: casa blanca, frente a la panadería, etc.)"
                  value={referencia}
                  onChange={(e) => setReferencia(e.target.value)}
                  maxLength={50}
                  rows={3}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 text-right">
                  {referenciaRestante} caracteres restantes
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default StepTwo;
