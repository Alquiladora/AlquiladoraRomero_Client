import React, { useState, useEffect } from 'react';

import { Plus, Edit2, Trash, X, Loader2 } from 'lucide-react';
import api from '../../../utils/AxiosConfig';
import { useAuth } from '../../../hooks/ContextAuth';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';

function BodegaSecundaria({ bodega, onEdit, onDelete, onToggle }) {
  const iconColor =
    bodega.estado === 'activa'
      ? 'bg-green-200 text-green-700'
      : 'bg-red-200 text-red-700';

  const btnClass =
    bodega.estado === 'activa'
      ? 'px-3 py-1 rounded-full border border-red-300 text-red-700 dark:text-red-200 hover:bg-red-100 dark:hover:bg-red-700 transition-colors'
      : 'px-3 py-1 rounded-full border border-green-300 text-green-700 dark:text-green-200 hover:bg-green-100 dark:hover:bg-green-700 transition-colors';

  return (
    <div className="relative p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transform hover:-translate-y-1 transition duration-300 flex flex-col gap-3 max-w-sm mx-auto">
      <p className="absolute top-2 right-2 text-xs text-gray-500 dark:text-gray-400">
        {bodega.fechaRegistro
          ? new Date(bodega.fechaRegistro).toLocaleDateString()
          : ''}
      </p>
      <div className="flex flex-col items-center">
        <div
          className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-3xl ${iconColor}`}
        >
          🏚
        </div>
        <h3 className="mt-2 text-xl text-gray-800 dark:text-gray-200 font-semibold text-center truncate w-full">
          {bodega.nombre}
        </h3>
        <div className="flex items-center mt-1 w-full justify-center">
          <FontAwesomeIcon
            icon={faMapMarkerAlt}
            className="text-gray-500 dark:text-gray-400 mr-1 flex-shrink-0"
          />
          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
            {bodega.ubicacion || 'Ubicación desconocida'}
          </p>
        </div>
      </div>
      <div className="flex items-center justify-center gap-2 flex-wrap">
        <button
          onClick={() => onToggle(bodega.idBodega, !bodega.activo)}
          className={btnClass}
        >
          {bodega.estado === 'activa' ? 'Desactivar' : 'Activar'}
        </button>
        <button
          onClick={() => onEdit(bodega)}
          className="px-3 py-1 rounded-full bg-yellow-200 text-yellow-800 hover:bg-yellow-300 transition-colors text-sm flex items-center gap-1"
        >
          <Edit2 className="w-4 h-4" />
          <span>Editar</span>
        </button>
        <button
          onClick={() => onDelete(bodega.idBodega)}
          className="px-3 py-1 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors text-sm flex items-center gap-1"
        >
          <Trash className="w-4 h-4" />
          <span>Eliminar</span>
        </button>
      </div>
    </div>
  );
}

export default function Bodegas() {
  const { csrfToken } = useAuth();
  const [bodegasSecundarias, setBodegasSecundarias] = useState([]);
  const [bodegaPrincipal, setBodegaPrincipal] = useState(null);
  const [isModalAddOpen, setIsModalAddOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [nombre, setNombre] = useState('');
  const [ubicacion, setUbicacion] = useState('');
  const [isModalEditOpen, setIsModalEditOpen] = useState(false);
  const [editBodega, setEditBodega] = useState(null);
  const [editNombre, setEditNombre] = useState('');
  const [editUbicacion, setEditUbicacion] = useState('');
  const [filterName, setFilterName] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');

  // Estados para manejo de carga en creación y actualización
  const [createLoading, setCreateLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);

  useEffect(() => {
    fetchBodegas();
  }, []);

  const fetchBodegas = async () => {
    setLoading(true);
    try {
      const resp = await api.get('/api/bodegas/bodegas/', {
        withCredentials: true,
      });
      const { bodegas } = resp.data;
      const principal = bodegas.find((b) => b.es_principal === 1);
      const secundarias = bodegas.filter((b) => b.es_principal === 0);
      if (principal) {
        setBodegaPrincipal(principal);
      }
      setBodegasSecundarias(secundarias);
    } catch (error) {
      console.error('Error al obtener bodegas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShowAddModal = () => setIsModalAddOpen(true);
  const handleCloseAddModal = () => {
    setIsModalAddOpen(false);
    setNombre('');
    setUbicacion('');
  };

  const locationPattern = /^([\w\s]+),\s*([\w\s]+),\s*([\w\s]+)$/;

  const handleAddBodega = async (e) => {
    e.preventDefault();
    if (!nombre.trim() || nombre.trim().length < 4) {
      toast.warning('El nombre debe tener al menos 4 caracteres.');
      return;
    }

    if (!ubicacion.trim() || ubicacion.trim().length < 2) {
      toast.warning('La ubicación debe tener al menos 2 caracteres.');
      return;
    }
    if (!locationPattern.test(ubicacion.trim())) {
      toast.warning(
        "El formato de ubicación no es válido. Utiliza: 'colonia, municipio, estado'."
      );
      return;
    }

    try {
      setCreateLoading(true);
      const response = await api.post(
        '/api/bodegas/bodegas/crear',
        {
          nombre: nombre.trim(),
          ubicacion: ubicacion.trim(),
        },
        {
          headers: { 'X-CSRF-Token': csrfToken },
          withCredentials: true,
        }
      );
      if (response.data.success) {
        toast.success('Bodega secundaria creada exitosamente.');
        fetchBodegas();
        handleCloseAddModal();
      } else {
        toast.error(response.data.message || 'Error al crear la bodega.');
      }
    } catch (error) {
      console.error('Error al crear la bodega secundaria:', error);
      toast.error('Ocurrió un error al crear la bodega.');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleDeleteBodega = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar esta bodega?')) {
      return;
    }
    try {
      await api.delete(`/api/bodegas/delete/${id}`, {
        headers: { 'X-CSRF-Token': csrfToken },
        withCredentials: true,
      });
      setBodegasSecundarias((prev) =>
        prev.filter((bodega) => bodega.id !== id)
      );
      toast.success('Bodega eliminada correctamente.');
      fetchBodegas();
    } catch (error) {
      toast.error('Error al eliminar la bodega.');
      console.error('Error al eliminar bodega:', error);
    }
  };

  const handleToggleBodega = async (id) => {
    try {
      const response = await api.patch(`/api/bodegas/toggle/${id}`, null, {
        withCredentials: true,
        headers: { 'X-CSRF-Token': csrfToken },
      });
      if (response.data.success) {
        setBodegasSecundarias((prev) =>
          prev.map((b) =>
            b.id === id || b.idBodega === id
              ? {
                  ...b,
                  estado: response.data.estado,
                  activa: response.data.estado === 'activa',
                }
              : b
          )
        );

        fetchBodegas();
        toast.success(response.data.message);
      } else {
        toast.error('Error al actualizar el estado de la bodega');
      }
    } catch (error) {
      console.error('Error al actualizar el estado de la bodega:', error);
      toast.error('Error al actualizar el estado de la bodega');
    }
  };

  const openEditModal = (bodega) => {
    setEditBodega(bodega);
    setEditNombre(bodega.nombre);
    setEditUbicacion(bodega.ubicacion);
    setIsModalEditOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsModalEditOpen(false);
    setEditBodega(null);
    setEditNombre('');
    setEditUbicacion('');
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editNombre.trim() || editNombre.trim().length < 4) {
      toast.warning('El nombre debe tener al menos 4 caracteres.');
      return;
    }
    if (!editUbicacion.trim() || editUbicacion.trim().length < 2) {
      toast.warning('La ubicación debe tener al menos 2 caracteres.');
      return;
    }
    if (!locationPattern.test(editUbicacion.trim())) {
      toast.warning(
        "El formato de ubicación no es válido. Utiliza: 'colonia, municipio, estado'."
      );
      return;
    }

    setUpdateLoading(true);
    if (editBodega.es_principal === 1) {
      try {
        const response = await api.patch(
          `/api/bodegas/update/${editBodega.idBodega}`,
          {
            nombre: editNombre.trim(),
            ubicacion: editUbicacion.trim(),
          },
          {
            headers: { 'X-CSRF-Token': csrfToken },
            withCredentials: true,
          }
        );
        if (response.data.success) {
          toast.success('Bodega principal actualizada correctamente.');
          setBodegaPrincipal((prev) => ({
            ...prev,
            nombre: editNombre.trim(),
            ubicacion: editUbicacion.trim(),
          }));
          handleCloseEditModal();
        } else {
          toast.error(
            response.data.message || 'Error al actualizar la bodega.'
          );
        }
      } catch (error) {
        console.error('Error al actualizar la bodega principal:', error);
        toast.error('Ocurrió un error al actualizar la bodega.');
      } finally {
        setUpdateLoading(false);
      }
    } else {
      // Bodega secundaria
      try {
        const response = await api.patch(
          `/api/bodegas/update/${editBodega.idBodega}`,
          {
            nombre: editNombre.trim(),
            ubicacion: editUbicacion.trim(),
          },
          {
            headers: { 'X-CSRF-Token': csrfToken },
            withCredentials: true,
          }
        );
        if (response.data.success) {
          toast.success('Bodega actualizada correctamente.');
          setBodegasSecundarias((prev) =>
            prev.map((b) =>
              b.idBodega === editBodega.idBodega
                ? {
                    ...b,
                    nombre: editNombre.trim(),
                    ubicacion: editUbicacion.trim(),
                  }
                : b
            )
          );
          handleCloseEditModal();
        } else {
          toast.error(
            response.data.message || 'Error al actualizar la bodega.'
          );
        }
      } catch (error) {
        console.error('Error al actualizar la bodega:', error);
        toast.error('Ocurrió un error al actualizar la bodega.');
      } finally {
        setUpdateLoading(false);
      }
    }
  };

  const filteredBodegas = bodegasSecundarias.filter((bodega) => {
    const matchesName = bodega.nombre
      .toLowerCase()
      .includes(filterName.toLowerCase());
    let matchesStatus = true;
    if (filterStatus === 'activos') {
      matchesStatus = bodega.estado === 'activa';
    } else if (filterStatus === 'desactivados') {
      matchesStatus = bodega.estado !== 'activa';
    }
    return matchesName && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center dark:bg-gray-900">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
        <span className="ml-4 text-xl text-gray-700 dark:text-gray-200">
          Cargando datos...
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen dark:bg-gray-900 p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-gray-800 dark:text-gray-200 mb-10">
          Gestión de Bodegas
        </h1>

        <div className="flex justify-center mb-10">
          <div
            className="w-64 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg 
                       hover:shadow-2xl transform transition duration-300
                       hover:-translate-y-1 flex flex-col items-center relative"
          >
            <button
              onClick={() => openEditModal(bodegaPrincipal)}
              className="absolute top-2 right-2 text-blue-500 hover:text-blue-700 
                         transition-colors p-1 rounded-full hover:bg-gray-100 
                         dark:hover:bg-gray-700"
              title="Editar Bodega Principal"
            >
              <Edit2 className="w-5 h-5" />
            </button>

            {bodegaPrincipal && bodegaPrincipal.fechaRegistro && (
              <span className="absolute top-2 right-14 text-xs text-gray-500 dark:text-gray-400">
                {new Date(bodegaPrincipal.fechaRegistro).toLocaleDateString()}
              </span>
            )}

            <div
              className="w-16 h-16 bg-green-200 rounded-full 
                         flex items-center justify-center 
                         text-2xl font-extrabold text-green-800 mb-4"
            >
              🏠
            </div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 text-center">
              {bodegaPrincipal ? bodegaPrincipal.nombre : ''}
            </h2>
            <div className="flex items-center mt-1 w-full justify-center">
              <FontAwesomeIcon
                icon={faMapMarkerAlt}
                className="text-gray-500 dark:text-gray-400 mr-1 flex-shrink-0"
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                {bodegaPrincipal
                  ? bodegaPrincipal.ubicacion || 'Ubicación desconocida'
                  : 'Ubicación desconocida'}
              </p>
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-2">
              (No eliminable)
            </p>
          </div>
        </div>

        {/* Filtros de búsqueda */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-8">
          <input
            type="text"
            placeholder="Buscar por nombre..."
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
          >
            <option value="todos">Todos</option>
            <option value="activos">Activos</option>
            <option value="desactivados">Desactivados</option>
          </select>
        </div>

        <div className="flex justify-center mb-8">
          <button
            onClick={handleShowAddModal}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-full 
                       shadow-lg hover:bg-blue-700 active:scale-95 transform transition 
                       duration-200"
          >
            <Plus className="w-6 h-6" />
            <span className="text-lg">Agregar bodega</span>
          </button>
        </div>

        {filteredBodegas.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 text-lg mt-10">
            No hay bodegas secundarias creadas aún.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredBodegas.map((bodega) => (
              <BodegaSecundaria
                key={bodega.id}
                bodega={bodega}
                onEdit={openEditModal}
                onDelete={handleDeleteBodega}
                onToggle={handleToggleBodega}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal para agregar Bodega Secundaria */}
      {isModalAddOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg max-w-md w-full shadow-xl transform transition-all duration-300 relative">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-gray-100 transition-colors"
              onClick={handleCloseAddModal}
            >
              <X className="w-6 h-6" />
            </button>
            <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-6">
              Agregar Bodega Secundaria
            </h3>
            <form onSubmit={handleAddBodega} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Nombre de la bodega
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                  placeholder="Ej: Bodega Costa"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                />
              </div>

              {/* Campo Ubicación */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Ubicación
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                  placeholder="Ej: Av. Principal #123"
                  value={ubicacion}
                  onChange={(e) => setUbicacion(e.target.value)}
                />
              </div>

              {/* Botones */}
              <div className="flex justify-end gap-4 mt-8">
                <button
                  type="button"
                  className="px-6 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 transition-colors duration-200 dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-gray-200"
                  onClick={handleCloseAddModal}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  {createLoading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    'Agregar'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de edición (único para principal y secundarias) */}
      {isModalEditOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg max-w-md w-full shadow-xl transform transition-all duration-300 relative">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-gray-100 transition-colors"
              onClick={handleCloseEditModal}
            >
              <X className="w-6 h-6" />
            </button>
            <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-6">
              Editar Bodega
            </h3>
            <form onSubmit={handleSaveEdit} className="space-y-6">
              {/* Campo Nombre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Nombre de la bodega
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                  value={editNombre}
                  onChange={(e) => setEditNombre(e.target.value)}
                />
              </div>

              {/* Campo Ubicación */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Ubicación
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                  value={editUbicacion}
                  onChange={(e) => setEditUbicacion(e.target.value)}
                />
              </div>

              {/* Botones */}
              <div className="flex justify-end gap-4 mt-8">
                <button
                  type="button"
                  className="px-6 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 transition-colors duration-200 dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-gray-200"
                  onClick={handleCloseEditModal}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={updateLoading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  {updateLoading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    'Guardar'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
