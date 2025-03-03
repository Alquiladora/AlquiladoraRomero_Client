import React from 'react';

const ConfirmDelete = ({ onConfirm, onCancel }) => {
  return (
    <div className="p-4 bg-white dark:bg-gray-800 shadow-lg rounded-md">
      <p className="text-gray-800 dark:text-gray-100">
        ¿Está seguro que desea eliminar la política?
      </p>
      <div className="mt-4 flex justify-end space-x-3">
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-md"
        >
          Cancelar
        </button>
        <button
          onClick={onConfirm}
          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md"
        >
          Eliminar
        </button>
      </div>
    </div>
  );
};

export default ConfirmDelete;
