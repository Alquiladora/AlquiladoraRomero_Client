// StepTwo.jsx
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLocationArrow,faSpinner } from "@fortawesome/free-solid-svg-icons";

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
}) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-800 flex items-center">
        <FontAwesomeIcon icon={faLocationArrow} className="mr-2 text-yellow-500" />
        Paso 2: Ubicación
      </h2>

      {esClienteExistente ? (
        <div className="space-y-2">
          <p className="text-sm text-gray-500">
            Selecciona una de tus direcciones registradas:
          </p>
          {direccionesCliente.map((dir) => (
            <label
              key={dir.idDir}
              className="block border border-gray-300 p-2 rounded cursor-pointer hover:bg-gray-50"
            >
              <input
                type="radio"
                name="direccionSeleccionada"
                className="mr-2"
                checked={selectedDireccionId === dir.idDir}
                onChange={() => setSelectedDireccionId(dir.idDir)}
              />
              <span className="font-semibold">{dir.alias}:</span>{" "}
              {dir.calle}, {dir.localidad}, {dir.municipio}, {dir.estado}.
              CP: {dir.cp}
            </label>
          ))}
          {direccionesCliente.length === 0 && (
            <p className="text-sm text-red-500">No tienes direcciones registradas.</p>
          )}
        </div>
      ) : (
        <>
          {/* CP + botón Validar */}
          <div className="flex items-end space-x-2">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">
                Código Postal (5 dígitos)*
              </label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded"
                maxLength={5}
                placeholder="Ej: 12345"
                value={codigoPostal}
                onChange={(e) => setCodigoPostal(e.target.value.replace(/\D/g, ""))}
              />
            </div>
            <button
              type="button"
              onClick={handleValidarCP}
              disabled={codigoPostal.length < 5 || cargandoCP}
              className={`px-4 py-2 rounded ${
                codigoPostal.length === 5 && !cargandoCP
                  ? "bg-yellow-500 text-white hover:bg-yellow-600"
                  : "bg-gray-400 text-gray-200 cursor-not-allowed"
              } transition`}
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

          {/* Campos autocompletados */}
          <div>
            <label className="block text-sm font-medium text-gray-700">País</label>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded"
              value={pais}
              onChange={(e) => setPais(e.target.value)}
              disabled={!cpValido}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Estado</label>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded"
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
              disabled={!cpValido}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Municipio</label>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded"
              value={municipio}
              onChange={(e) => setMunicipio(e.target.value)}
              disabled={!cpValido}
            />
          </div>

          <fieldset className="space-y-2">
            <legend className="block text-sm font-medium text-gray-700">
              Localidad/Colonia
            </legend>
            <div className="flex items-center space-x-4">
              <label className="inline-flex items-center">
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
              <label className="inline-flex items-center">
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
                className="w-full p-2 border border-gray-300 rounded"
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
                <label className="block text-sm font-medium text-gray-700 sr-only">
                  Localidad manual
                </label>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded"
                  placeholder="Ingresa tu colonia/localidad"
                  value={localidad}
                  onChange={(e) => setLocalidad(e.target.value)}
                  disabled={!cpValido}
                />
              </div>
            )}
          </fieldset>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Dirección (calle, número)*
            </label>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="Calle y número"
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
            />
          </div>
        </>
      )}
    </div>
  );
}

export default StepTwo;
