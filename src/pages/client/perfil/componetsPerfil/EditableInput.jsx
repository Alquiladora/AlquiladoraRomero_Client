/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faSave, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { useSpring, animated } from '@react-spring/web';

// 1. Importa react-datepicker y su CSS
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const EditableInput = ({
  label,
  value,
  onSave,
  validate,
  showHint,
  hintMessage,
}) => {
  const [isEditable, setIsEditable] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [tempValue, setTempValue] = useState(value);
  const [error, setError] = useState('');
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [saving, setSaving] = useState(false);

  // Calcula la fecha máxima permitida para el DatePicker: hoy - 15 años
  const maxSelectableDate = new Date(
    new Date().getFullYear() - 15,
    new Date().getMonth(),
    new Date().getDate()
  );

  const fadeStyles = useSpring({
    opacity: isEditable ? 1 : 0,
    transform: isEditable ? 'translateY(0)' : 'translateY(-10px)',
    config: { duration: 300 },
  });

  useEffect(() => {
    if (isEditable) {
      setError('');
      setIsValid(false);
    }
  }, [isEditable]);

  const handleInputChange = (e) => {
    let newValue = e.target.value;

    if (label === 'Teléfono') {
      newValue = newValue.replace(/\D/g, '').slice(0, 10);
    }

    setTempValue(newValue);
    setHasInteracted(true);

    const validationError = validate(newValue);
    setError(validationError);
    setIsValid(!validationError);
  };

  const handleIconClick = async () => {
    const previousValue = inputValue;
    if (isEditable) {
      const validationError = validate(tempValue);
      if (validationError) {
        setError(validationError);
        return;
      }

      setSaving(true);
      try {
        setInputValue(tempValue);
        await onSave(tempValue);
        setIsEditable(false);
      } catch (error) {
        console.error('Error al guardar:', error);
        setError('Error al guardar en la base de datos.');

        setInputValue(previousValue);
        setTempValue(previousValue);
      } finally {
        setSaving(false);
      }
    } else {
      setIsEditable(true);
    }
  };

  // Función para cancelar la edición y restablecer el valor original
  const handleCancel = () => {
    setIsEditable(false);
    setTempValue(inputValue);
    setError('');
    setIsValid(false);
    setHasInteracted(false);
  };

  return (
    <div className="mb-4">
      {error && (
        <p className="text-sm text-red-500 dark:text-red-400 mb-2">{error}</p>
      )}

      {showHint && isEditable && (
        <animated.div style={fadeStyles}>
          <div className="bg-blue-50 text-blue-800 dark:bg-blue-900 dark:text-blue-200 p-3 rounded-lg mb-3">
            {hintMessage}
          </div>
        </animated.div>
      )}

      <div className="relative">
        {/* Bloque para react-datepicker si es "Fecha de Nacimiento" y estamos en modo edición */}
        {label === 'Fecha de Nacimiento' && isEditable ? (
          <DatePicker
            selected={
              tempValue
                ? new Date(tempValue) // convertir string (YYYY-MM-DD) a Date
                : null
            }
            onChange={(date) => {
              setHasInteracted(true);
              const isoDate = date ? date.toISOString().split('T')[0] : '';
              setTempValue(isoDate);
              // Validamos
              const validationError = validate(isoDate);
              setError(validationError);
              setIsValid(!validationError);
            }}
            className={`
              w-full p-3 rounded-lg border
              ${
                error
                  ? 'border-red-500 focus:border-red-500 dark:border-red-400'
                  : 'border-gray-300 focus:border-blue-500 dark:border-gray-600'
              }
              focus:ring-2
              ${
                error
                  ? 'focus:ring-red-500 dark:focus:ring-red-400'
                  : 'focus:ring-blue-500 dark:focus:ring-blue-400'
              }
              bg-white dark:bg-gray-800
              text-gray-900 dark:text-gray-100
              transition-colors duration-200
            `}
            placeholderText="Selecciona tu fecha de nacimiento"
            dateFormat="dd/MM/yyyy"
            minDate={new Date('1800-01-01')}
            maxDate={maxSelectableDate}
            showYearDropdown
            scrollableYearDropdown
          />
        ) : (
          <input
            type={label === 'Fecha de Nacimiento' ? 'date' : 'text'}
            value={isEditable ? tempValue : inputValue}
            onChange={handleInputChange}
            readOnly={!isEditable}
            className={`
              w-full p-3 rounded-lg border
              ${
                error
                  ? 'border-red-500 focus:border-red-500 dark:border-red-400'
                  : 'border-gray-300 focus:border-blue-500 dark:border-gray-600'
              }
              focus:ring-2
              ${
                error
                  ? 'focus:ring-red-500 dark:focus:ring-red-400'
                  : 'focus:ring-blue-500 dark:focus:ring-blue-400'
              }
              bg-white dark:bg-gray-800
              text-gray-900 dark:text-gray-100
              transition-colors duration-200
            `}
            placeholder={label}
            max={new Date().toISOString().split('T')[0]}
          />
        )}

        <button
          onClick={handleIconClick}
          disabled={saving || (!isValid && isEditable)}
          className={`
            absolute right-2 top-1/2 transform -translate-y-1/2
            p-2 rounded-full
            ${
              isEditable
                ? isValid
                  ? 'text-green-500 hover:bg-green-50 dark:hover:bg-green-900'
                  : 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900'
                : 'text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900'
            }
            transition-colors duration-200
            focus:outline-none focus:ring-2 focus:ring-offset-2
            ${
              isEditable
                ? isValid
                  ? 'focus:ring-green-500'
                  : 'focus:ring-red-500'
                : 'focus:ring-blue-500'
            }
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        >
          {saving ? (
            <FontAwesomeIcon
              icon={faSpinner}
              className="w-5 h-5 animate-spin"
            />
          ) : isEditable ? (
            <FontAwesomeIcon icon={faSave} className="w-5 h-5" />
          ) : (
            <FontAwesomeIcon icon={faEdit} className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Botón Cancelar en modo edición */}
      {isEditable && (
        <button
          onClick={handleCancel}
          disabled={saving}
          className="mt-2 px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 transition-colors duration-200"
        >
          Cancelar
        </button>
      )}
    </div>
  );
};

export default EditableInput;
