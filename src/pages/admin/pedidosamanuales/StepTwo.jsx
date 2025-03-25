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
  faPlus,
  faMinus,
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
  useNewAddress,
  setUseNewAddress,
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

  const toggleAccordion = () => {
    setAccordionOpen((prev) => !prev);
    if (!accordionOpen) {
      setUseNewAddress(true);
      setSelectedDireccionId(null);
    } else {
      setUseNewAddress(false);
    }
  };

  const handleUseExistingAddress = () => {
    setUseNewAddress(false);
    setAccordionOpen(false);
  };

  // Determine if the "Add New Address" form should be shown by default
  const shouldShowNewAddressForm =
    !esClienteExistente ||
    (esClienteExistente && direccionesValidas.length === 0) ||
    (esClienteExistente && useNewAddress);

  // Debugging: Log the state values to verify they are updating correctly
  console.log({
    useNewAddress,
    cpValido,
    codigoPostal,
    pais,
    estado,
    municipio,
    localidad,
    direccion,
  });

  return (
    <div className="space-y-6 dark:text-gray-100">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center">
        <FontAwesomeIcon
          icon={faLocationArrow}
          className="mr-2 text-yellow-500"
        />
        Paso 2: Ubicación
      </h2>

      {esClienteExistente && direccionesValidas.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Selecciona una dirección existente o agrega una nueva:
            </p>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={handleUseExistingAddress}
                className={`px-3 py-1 rounded-md text-sm font-medium transition ${
                  !useNewAddress
                    ? "bg-yellow-500 text-white"
                    : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                }`}
              >
                Usar Dirección Existente
              </button>
              {permitirAgregarDireccion && (
                <button
                  type="button"
                  onClick={toggleAccordion}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition flex items-center ${
                    useNewAddress
                      ? "bg-yellow-500 text-white"
                      : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                  }`}
                >
                  <FontAwesomeIcon
                    icon={accordionOpen ? faMinus : faPlus}
                    className="mr-2"
                  />
                  Agregar Nueva Dirección
                </button>
              )}
            </div>
          </div>

          {!useNewAddress && (
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {direccionesValidas.map((dir) => (
                <label
                  key={dir.idDir}
                  className={`block border border-gray-300 dark:border-gray-600 rounded-lg p-4 shadow-sm cursor-pointer transition-all duration-200 ${
                    selectedDireccionId === dir.idDireccion
                      ? "border-l-4 border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/30"
                      : "hover:bg-gray-50 dark:hover:bg-gray-800"
                  } relative`}
                >
                  {dir.pais === "México" && (
                    <div className="absolute top-3 right-3">
                      <ReactCountryFlag
                        countryCode="MX"
                        svg
                        className="w-6 h-6"
                        title="México"
                      />
                    </div>
                  )}

                  <div className="flex items-center mb-3">
                    <input
                      type="radio"
                      name="direccionSeleccionada"
                      className="mr-2 h-4 w-4 text-yellow-500 focus:ring-yellow-500"
                      checked={selectedDireccionId === dir.idDireccion}
                      onChange={() => setSelectedDireccionId(dir.idDireccion)}
                    />
                    <span className="font-semibold text-gray-800 dark:text-white text-base">
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

                  <div className="text-sm text-gray-600 dark:text-gray-300 ml-6 space-y-2">
                    <div className="flex items-center">
                      <FontAwesomeIcon
                        icon={faUser}
                        className="text-gray-500 mr-2 dark:text-gray-400"
                      />
                      <span>
                        <strong>Datos:</strong> {dir.nombreDireccion},{" "}
                        {dir.apellidoDireccion}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <FontAwesomeIcon
                        icon={faClipboard}
                        className="text-gray-500 mr-2 dark:text-gray-400"
                      />
                      <span>
                        <strong>Referencias:</strong>{" "}
                        {dir.referencias || "Sin referencias"}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <FontAwesomeIcon
                        icon={faMapMarkerAlt}
                        className="text-gray-500 mr-2 dark:text-gray-400"
                      />
                      <span>
                        <strong>Ubicación:</strong> {dir.localidad},{" "}
                        {dir.municipio}, {dir.estado}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <FontAwesomeIcon
                        icon={faMapPin}
                        className="text-gray-500 mr-2 dark:text-gray-400"
                      />
                      <span>
                        <strong>CP:</strong> {dir.codigoPostal}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <FontAwesomeIcon
                        icon={faMapPin}
                        className="text-gray-500 mr-2 dark:text-gray-400"
                      />
                      <span>
                        <strong>Teléfono:</strong> {dir.telefonoDireccion}
                      </span>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      {permitirAgregarDireccion && shouldShowNewAddressForm && (
        <div className="mt-6 border-t dark:border-gray-700 pt-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            {esClienteExistente && direccionesValidas.length > 0
              ? "Agregar Nueva Dirección"
              : "Ingresa tu Dirección"}
          </h3>
          <div className="space-y-4">
            <div className="flex items-end space-x-3">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Código Postal (5 dígitos)*
                </label>
                <input
                  type="text"
                  className={`w-full p-2 border rounded dark:bg-gray-700 dark:text-white transition-all duration-200 ${
                    codigoPostal.length > 0 && codigoPostal.length < 5
                      ? "border-red-500"
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                  maxLength={5}
                  placeholder="Ej: 12345"
                  value={codigoPostal}
                  onChange={(e) =>
                    setCodigoPostal(e.target.value.replace(/\D/g, ""))
                  }
                />
                {codigoPostal.length > 0 && codigoPostal.length < 5 && (
                  <p className="text-xs text-red-500 mt-1">
                    El código postal debe tener 5 dígitos.
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={handleValidarCP}
                disabled={codigoPostal.length < 5 || cargandoCP}
                className={`px-4 py-2 rounded transition flex items-center ${
                  codigoPostal.length === 5 && !cargandoCP
                    ? "bg-yellow-500 text-white hover:bg-yellow-600"
                    : "bg-gray-400 text-gray-200 cursor-not-allowed"
                }`}
              >
                {cargandoCP ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                    Validando...
                  </>
                ) : (
                  "Validar CP"
                )}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  País*
                </label>
                <input
                  type="text"
                  className={`w-full p-2 border rounded dark:bg-gray-700 dark:text-white ${
                    cpValido
                      ? "border-gray-300 dark:border-gray-600"
                      : "border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
                  }`}
                  value={pais}
                  onChange={(e) => setPais(e.target.value.trim())}
                  disabled={!cpValido}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Estado*
                </label>
                <input
                  type="text"
                  className={`w-full p-2 border rounded dark:bg-gray-700 dark:text-white ${
                    cpValido
                      ? "border-gray-300 dark:border-gray-600"
                      : "border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
                  }`}
                  value={estado}
                  onChange={(e) => setEstado(e.target.value.trim())}
                  disabled={!cpValido}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Municipio*
                </label>
                <input
                  type="text"
                  className={`w-full p-2 border rounded dark:bg-gray-700 dark:text-white ${
                    cpValido
                      ? "border-gray-300 dark:border-gray-600"
                      : "border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
                  }`}
                  value={municipio}
                  onChange={(e) => setMunicipio(e.target.value.trim())}
                  disabled={!cpValido}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Localidad/Colonia*
                </label>
                <div className="flex items-center space-x-3 mb-2">
                  <label className="inline-flex items-center text-gray-700 dark:text-gray-300">
                    <input
                      type="radio"
                      name="modoLocalidad"
                      value="seleccionar"
                      className="mr-1 h-4 w-4 text-yellow-500 focus:ring-yellow-500"
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
                      className="mr-1 h-4 w-4 text-yellow-500 focus:ring-yellow-500"
                      checked={modoLocalidad === "manual"}
                      onChange={() => setModoLocalidad("manual")}
                      disabled={!cpValido}
                    />
                    Manual
                  </label>
                </div>

                {modoLocalidad === "seleccionar" ? (
                  <select
                    className={`w-full p-2 border rounded dark:bg-gray-700 dark:text-white ${
                      cpValido
                        ? "border-gray-300 dark:border-gray-600"
                        : "border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
                    }`}
                    value={localidad}
                    onChange={(e) => setLocalidad(e.target.value.trim())}
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
                ) : (
                  <input
                    type="text"
                    className={`w-full p-2 border rounded dark:bg-gray-700 dark:text-white ${
                      cpValido
                        ? "border-gray-300 dark:border-gray-600"
                        : "border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
                    }`}
                    placeholder="Ingresa tu colonia/localidad"
                    value={localidad}
                    onChange={(e) => setLocalidad(e.target.value.trim())}
                    disabled={!cpValido}
                  />
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Dirección (calle, número)*
              </label>
              <input
                type="text"
                className={`w-full p-2 border rounded dark:bg-gray-700 dark:text-white transition-all duration-200 ${
                  direccion.length > 0 && direccion.length < 5
                    ? "border-red-500"
                    : "border-gray-300 dark:border-gray-600"
                }`}
                placeholder="Calle y número"
                value={direccion}
                onChange={(e) => setDireccion(e.target.value.trim())}
              />
              {direccion.length > 0 && direccion.length < 5 && (
                <p className="text-xs text-red-500 mt-1">
                  La dirección debe tener al menos 5 caracteres.
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Referencia (máx. 50 caracteres)
              </label>
              <textarea
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                placeholder="Ej: Casa blanca, frente a la panadería, etc."
                value={referencia}
                onChange={(e) => setReferencia(e.target.value.trim())}
                maxLength={50}
                rows={3}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 text-right mt-1">
                {referenciaRestante} caracteres restantes
              </p>
            </div>
          </div>
        </div>
      )}

      {esClienteExistente && direccionesValidas.length === 0 && !useNewAddress && (
        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">
            El cliente no tiene ninguna dirección registrada. Por favor, agrega
            una nueva dirección para continuar.
          </p>
        </div>
      )}
    </div>
  );
}

export default StepTwo;