import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faClock,
  faSun,
  faMoon,
  faTimesCircle,
  faEdit,
  faSave,
  faTimes,
  faToggleOn,
  faToggleOff,
} from '@fortawesome/free-solid-svg-icons';
import api from '../../../utils/AxiosConfig';
import { useAuth } from '../../../hooks/ContextAuth';

const Horario = () => {
  const { csrfToken } = useAuth();
  const [scheduleData, setScheduleData] = useState([]);
  const [currentDay, setCurrentDay] = useState('');
  const [editingDay, setEditingDay] = useState(null);
  const [editForm, setEditForm] = useState({
    open: '',
    close: '',
    isClosed: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Get the current day dynamically based on the actual current date
    const date = new Date(); // Use current date instead of hardcoded "2025-03-25"
    const daysInSpanish = [
      'Domingo',
      'Lunes',
      'Martes',
      'Miércoles',
      'Jueves',
      'Viernes',
      'Sábado',
    ];
    setCurrentDay(daysInSpanish[date.getDay()]);

    // Fetch schedule data on component mount
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/api/horario');
      if (response.data.success) {
        setScheduleData(response.data.data);
      } else {
        setError(response.data.message || 'Error al obtener el horario.');
      }
    } catch (err) {
      setError(
        'Error al conectar con el servidor. Por favor, intenta de nuevo.'
      );
      console.error('Error fetching schedule:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (schedule) => {
    setEditingDay(schedule.day);
    setEditForm({
      open: schedule.open || '',
      close: schedule.close || '',
      isClosed: !schedule.open && !schedule.close,
    });
  };

  const handleCancelEdit = () => {
    setEditingDay(null);
    setEditForm({ open: '', close: '', isClosed: false });
  };

  const handleSaveEdit = async (day) => {
    if (!editForm.isClosed && (!editForm.open || !editForm.close)) {
      setError(
        'Por favor, completa las horas de apertura y cierre, o marca el día como cerrado.'
      );
      return;
    }

    // Validate that close is after open
    if (!editForm.isClosed && editForm.open && editForm.close) {
      const openTime = new Date(`1970-01-01T${editForm.open}:00`);
      const closeTime = new Date(`1970-01-01T${editForm.close}:00`);
      if (closeTime <= openTime) {
        setError('La hora de cierre debe ser posterior a la hora de apertura.');
        return;
      }
    }

    setLoading(true);
    setError(null);
    try {
      const response = await api.put(
        `/api/horario/${day}`,
        {
          open: editForm.isClosed ? null : editForm.open,
          close: editForm.isClosed ? null : editForm.close,
        },
        {
          withCredentials: true,
          headers: { 'X-CSRF-Token': csrfToken },
        }
      );

      if (response.data.success) {
        setScheduleData(
          scheduleData.map((schedule) =>
            schedule.day === day ? response.data.data : schedule
          )
        );
        setEditingDay(null);
        setEditForm({ open: '', close: '', isClosed: false });
      } else {
        setError(response.data.message || 'Error al actualizar el horario.');
      }
    } catch (err) {
      setError('Error al actualizar el horario. Por favor, intenta de nuevo.');
      console.error('Error updating schedule:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm({ ...editForm, [name]: value });
  };

  const toggleClosed = () => {
    setEditForm({ ...editForm, isClosed: !editForm.isClosed });
  };

  return (
    <div className="p-4 sm:p-6 max-w-md mx-auto  dark:from-gray-800 dark:to-gray-900 rounded-3xl  border border-gray-200 dark:border-gray-700">
      <h1 className="text-2xl sm:text-3xl font-extrabold mb-6 text-gray-900 dark:text-gray-100 flex items-center justify-center">
        <FontAwesomeIcon
          icon={faClock}
          className="mr-3 text-yellow-600 animate-spin-slow"
        />
        Horario de Atención
      </h1>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/50 text-red-700 dark:text-red-200 rounded-lg shadow-md border border-red-200 dark:border-red-700 animate-fade-in">
          {error}
        </div>
      )}

      {/* Loading Indicator */}
      {loading && (
        <div className="mb-4 flex justify-center">
          <FontAwesomeIcon
            icon={faClock}
            className="text-yellow-600 text-2xl animate-spin"
          />
        </div>
      )}

      {/* Schedule List */}
      <div className="space-y-3">
        {scheduleData.length > 0
          ? scheduleData.map((schedule, index) => (
              <div
                key={schedule.day}
                className={`relative bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 transform animate-slide-up delay-${
                  index * 100
                } ${
                  schedule.day === currentDay
                    ? 'border-l-4 border-yellow-600 bg-yellow-50 dark:bg-yellow-900/20'
                    : ''
                }`}
              >
                {editingDay === schedule.day ? (
                  <div className="animate-fade-in">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                        Editando {schedule.day}
                      </h3>
                      <button
                        onClick={toggleClosed}
                        className="flex items-center text-sm text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-200 transition-colors duration-300"
                        disabled={loading}
                      >
                        <FontAwesomeIcon
                          icon={editForm.isClosed ? faToggleOff : faToggleOn}
                          className="mr-1"
                        />
                        {editForm.isClosed ? 'Abrir Día' : 'Cerrar Día'}
                      </button>
                    </div>
                    {!editForm.isClosed && (
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Apertura
                          </label>
                          <input
                            type="time"
                            name="open"
                            value={editForm.open}
                            onChange={handleInputChange}
                            className="w-full px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-600 transition-all duration-300 border border-gray-300 dark:border-gray-600 text-sm"
                            disabled={loading}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Cierre
                          </label>
                          <input
                            type="time"
                            name="close"
                            value={editForm.close}
                            onChange={handleInputChange}
                            min={editForm.open} // Restrict closing time to be after opening time
                            className="w-full px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-600 transition-all duration-300 border border-gray-300 dark:border-gray-600 text-sm"
                            disabled={loading || !editForm.open} // Disable if no opening time is selected
                          />
                        </div>
                      </div>
                    )}
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleSaveEdit(schedule.day)}
                        className="px-3 py-1.5 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-all duration-300 flex items-center shadow-md hover:shadow-lg transform hover:scale-105 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={loading}
                      >
                        <FontAwesomeIcon icon={faSave} className="mr-1" />
                        Guardar
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="px-3 py-1.5 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all duration-300 flex items-center shadow-md hover:shadow-lg transform hover:scale-105 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={loading}
                      >
                        <FontAwesomeIcon icon={faTimes} className="mr-1" />
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <FontAwesomeIcon
                        icon={schedule.open ? faSun : faMoon}
                        className={`text-lg ${
                          schedule.open ? 'text-yellow-600' : 'text-gray-400'
                        } animate-bounce`}
                      />
                      <div>
                        <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                          {schedule.day}
                          {schedule.day === currentDay && (
                            <span className="ml-2 text-xs text-yellow-600 dark:text-yellow-400 font-medium bg-yellow-100 dark:bg-yellow-800/50 px-2 py-1 rounded-full">
                              Hoy
                            </span>
                          )}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {schedule.open && schedule.close ? (
                            <>
                              {schedule.open} - {schedule.close}
                            </>
                          ) : (
                            <span className="flex items-center">
                              <FontAwesomeIcon
                                icon={faTimesCircle}
                                className="mr-1 text-red-500"
                              />
                              Cerrado
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div
                        className={`text-sm font-medium px-2 py-1 rounded-lg ${
                          schedule.open
                            ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200'
                            : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200'
                        }`}
                      >
                        {schedule.open ? 'Abierto' : 'Cerrado'}
                      </div>
                      <button
                        onClick={() => handleEditClick(schedule)}
                        className="p-1 text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-200 transition-colors duration-300"
                        disabled={loading}
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          : !loading && (
              <div className="text-center text-gray-500 dark:text-gray-400">
                No se encontraron datos de horario.
              </div>
            )}
      </div>
    </div>
  );
};

export default Horario;
