// StepOne.jsx
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAddressCard } from "@fortawesome/free-solid-svg-icons";

function StepOne({
  nombre,
  setNombre,
  apellido,
  setApellido,
  telefono,
  setTelefono,
  correo,
  setCorreo,
  handleAbrirSubmodalCorreo,
}) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-800 flex items-center">
        <FontAwesomeIcon icon={faAddressCard} className="mr-2 text-yellow-500" />
        Paso 1: Datos Personales
      </h2>
      <p className="text-sm text-gray-500">
        ¿Ya eres cliente?{" "}
        <button
          onClick={handleAbrirSubmodalCorreo}
          className="text-blue-500 underline"
          type="button"
        >
          Verificar con correo
        </button>
      </p>

      <div>
        <label className="block text-sm font-medium text-gray-700">Nombre*</label>
        <input
          type="text"
          className="w-full p-2 border border-gray-300 rounded"
          placeholder="Ej: Juan"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Apellido*</label>
        <input
          type="text"
          className="w-full p-2 border border-gray-300 rounded"
          placeholder="Ej: Pérez"
          value={apellido}
          onChange={(e) => setApellido(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Teléfono (10 dígitos)*
        </label>
        <input
          type="text"
          className="w-full p-2 border border-gray-300 rounded"
          placeholder="1234567890"
          maxLength={10}
          value={telefono}
          onChange={(e) => setTelefono(e.target.value.replace(/\D/g, ""))}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Correo (opcional o auto)
        </label>
        <input
          type="email"
          className="w-full p-2 border border-gray-300 rounded"
          placeholder="tu_correo@ejemplo.com"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
        />
      </div>
    </div>
  );
}

export default StepOne;
