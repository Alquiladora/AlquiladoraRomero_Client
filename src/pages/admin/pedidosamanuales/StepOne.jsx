import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faAddressCard,
  faUser,
  faPhone,
  faEnvelope,
} from '@fortawesome/free-solid-svg-icons';

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
  const [nombreError, setNombreError] = useState('');
  const [apellidoError, setApellidoError] = useState('');
  const [telefonoError, setTelefonoError] = useState('');
  const [correoError, setCorreoError] = useState('');

  const validarNombre = (valor) => {
    if (valor.trim().length < 3) {
      return 'El nombre debe tener al menos 3 caracteres.';
    }
    const regexSoloLetras = /^[a-zA-ZÁÉÍÓÚÑáéíóúñ\s]+$/;
    if (!regexSoloLetras.test(valor.trim())) {
      return 'El nombre solo puede contener letras y espacios.';
    }
    return '';
  };

  const validarApellido = (valor) => {
    if (valor.trim().length < 3) {
      return 'El apellido debe tener al menos 3 caracteres.';
    }
    const regexSoloLetras = /^[a-zA-ZÁÉÍÓÚÑáéíóúñ\s]+$/;
    if (!regexSoloLetras.test(valor.trim())) {
      return 'El apellido solo puede contener letras y espacios.';
    }
    return '';
  };

  const validarTelefono = (valor) => {
    const regexTelefono = /^[0-9]{10}$/;
    if (!regexTelefono.test(valor.trim())) {
      return 'El teléfono debe tener exactamente 10 dígitos numéricos.';
    }
    return '';
  };

  const validarCorreo = (valor) => {
    if (!valor.trim()) return '';
    const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regexCorreo.test(valor.trim())) {
      return 'Ingresa un correo electrónico válido (ej: usuario@dominio.com).';
    }
    return '';
  };

  const handleNombreChange = (e) => {
    setNombre(e.target.value);
  };
  const handleNombreBlur = () => {
    setNombreError(validarNombre(nombre));
  };

  const handleApellidoChange = (e) => {
    setApellido(e.target.value);
  };
  const handleApellidoBlur = () => {
    setApellidoError(validarApellido(apellido));
  };

  const handleTelefonoChange = (e) => {
    setTelefono(e.target.value.replace(/\D/g, ''));
  };
  const handleTelefonoBlur = () => {
    setTelefonoError(validarTelefono(telefono));
  };

  const handleCorreoChange = (e) => {
    setCorreo(e.target.value);
  };
  const handleCorreoBlur = () => {
    setCorreoError(validarCorreo(correo));
  };

  useEffect(() => {
    if (validarNombre(nombre) === '') {
      setNombreError('');
    }
  }, [nombre]);

  useEffect(() => {
    if (validarApellido(apellido) === '') {
      setApellidoError('');
    }
  }, [apellido]);

  useEffect(() => {
    if (validarTelefono(telefono) === '') {
      setTelefonoError('');
    }
  }, [telefono]);

  useEffect(() => {
    if (validarCorreo(correo) === '') {
      setCorreoError('');
    }
  }, [correo]);

  return (
    <div className="space-y-6 dark:text-gray-200">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center">
        <FontAwesomeIcon
          icon={faAddressCard}
          className="mr-2 text-yellow-500"
        />
        Paso 1: Datos Personales
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-300">
        ¿Ya eres cliente?{' '}
        <button
          onClick={handleAbrirSubmodalCorreo}
          className="text-blue-500 underline"
          type="button"
        >
          Verificar con correo
        </button>
      </p>

      {/* Nombre */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Nombre*
        </label>
        <div className="relative">
          <FontAwesomeIcon
            icon={faUser}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            className="w-full pl-10 p-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-yellow-200 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
            placeholder="Ej: Juan"
            value={nombre}
            onChange={handleNombreChange}
            onBlur={handleNombreBlur}
          />
        </div>
        {nombreError && (
          <p className="text-red-500 dark:text-red-400 text-sm mt-1">
            {nombreError}
          </p>
        )}
      </div>

      {/* Apellido */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Apellido*
        </label>
        <div className="relative">
          <FontAwesomeIcon
            icon={faUser}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            className="w-full pl-10 p-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-yellow-200 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
            placeholder="Ej: Pérez"
            value={apellido}
            onChange={handleApellidoChange}
            onBlur={handleApellidoBlur}
          />
        </div>
        {apellidoError && (
          <p className="text-red-500 dark:text-red-400 text-sm mt-1">
            {apellidoError}
          </p>
        )}
      </div>

      {/* Teléfono */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Teléfono (10 dígitos)*
        </label>
        <div className="relative">
          <FontAwesomeIcon
            icon={faPhone}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            className="w-full pl-10 p-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-yellow-200 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
            placeholder="1234567890"
            maxLength={10}
            value={telefono}
            onChange={handleTelefonoChange}
            onBlur={handleTelefonoBlur}
          />
        </div>
        {telefonoError && (
          <p className="text-red-500 dark:text-red-400 text-sm mt-1">
            {telefonoError}
          </p>
        )}
      </div>

      {/* Correo (opcional) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Correo
        </label>
        <div className="relative">
          <FontAwesomeIcon
            icon={faEnvelope}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          />
          <input
            type="email"
            className="w-full pl-10 p-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-yellow-200 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
            placeholder="tu_correo@ejemplo.com"
            value={correo}
            onChange={handleCorreoChange}
            onBlur={handleCorreoBlur}
          />
        </div>
        {correoError && (
          <p className="text-red-500 dark:text-red-400 text-sm mt-1">
            {correoError}
          </p>
        )}
      </div>
    </div>
  );
}

export default StepOne;
