/* eslint-disable */
import React, { useState, useEffect } from 'react';
import api from '../../../utils/AxiosConfig';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import {
  faCheckCircle,
  faTimesCircle,
  faLink,
  faBan,
  faTrash,
  faSpinner,
  faSyncAlt,
  faEnvelope,
  faCrown,
  faShieldAlt,
  faExclamationTriangle,
  faClock,
} from '@fortawesome/free-solid-svg-icons';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../../../hooks/ContextAuth';

library.add(
  faCheckCircle,
  faTimesCircle,
  faLink,
  faBan,
  faTrash,
  faSpinner,
  faSyncAlt,
  faEnvelope,
  faCrown,
  faShieldAlt,
  faExclamationTriangle,
  faClock
);

const CuentasReceptoras = () => {
  const [cuentas, setCuentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activatingId, setActivatingId] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    banco: '',
    notas: '',
  });
  const [formError, setFormError] = useState('');
  const { csrfToken } = useAuth();

  const fetchCuentas = async (signal = null) => {
    setLoading(true);
    try {
      const response = await api.get('/api/tarjetas/cuentas', {
        withCredentials: true,
        headers: { 'X-CSRF-Token': csrfToken },
        signal: signal,
      });
      console.log('Datos recibidos de cuentas', response.data);
      setCuentas(response.data || []);
    } catch (err) {
      if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') {
        console.log('Petición cancelada automáticamente');
        return;
      }
    } finally {
      if (signal ? !signal.aborted : true) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchCuentas(controller.signal);
    return () => {
      controller.abort();
    };
  }, []);

  const syncConStripe = async () => {
    setLoading(true);
    try {
      await api.get('/api/tarjetas/sync-cuentas', {
        withCredentials: true,
        headers: { 'X-CSRF-Token': csrfToken },
      });
      toast.success('Cuentas sincronizadas correctamente');
      fetchCuentas();
    } catch (err) {
      toast.error('Error al sincronizar con Stripe');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value.trimStart() }));
  };

  const validateForm = () => {
    // Validación para nombre: debe iniciar con letra y no contener números
    const nameRegex = /^[A-Za-zÁÉÍÓÚáéíóúÜüÑñ][A-Za-zÁÉÍÓÚáéíóúÜüÑñ\s]*$/;
    if (!formData.nombre.trim()) {
      return 'El nombre es requerido';
    } else if (!nameRegex.test(formData.nombre.trim())) {
      return 'El nombre debe iniciar con una letra y no puede contener números';
    }

    // Validación para email: formato válido
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!formData.email.trim()) {
      return 'El email es requerido';
    } else if (!emailRegex.test(formData.email.trim())) {
      return 'El email no tiene un formato válido (ejemplo: usuario@dominio.com)';
    }

    // Validación para banco: debe seleccionar una opción válida
    if (!formData.banco || formData.banco === '') {
      return 'Debes seleccionar un banco';
    }

    // Validación para notas: no vacío y con contenido significativo
    if (!formData.notas.trim()) {
      return 'Las notas son requeridas';
    } else if (formData.notas.trim().length < 5) {
      return 'Las notas deben tener al menos 5 caracteres';
    }

    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const error = validateForm();
    if (error) {
      setFormError(error);
      return;
    }

    setLoading(true);
    setFormError('');
    try {
      const response = await api.post(
        '/api/tarjetas/cuentas',
        {
          ...formData,
          nombre: formData.nombre.trim(),
          email: formData.email.trim(),
          banco: formData.banco.trim(),
          notas: formData.notas.trim(),
        },
        {
          withCredentials: true,
          headers: { 'X-CSRF-Token': csrfToken },
        }
      );
      toast.success(response.data.message);
      if (response.data.onboarding_url) {
        toast.info(
          <div>
            Completa la configuración en Stripe:{' '}
            <a
              href={response.data.onboarding_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-600 underline"
            >
              Hacer clic aquí
            </a>
          </div>,
          { autoClose: false }
        );
      }
      setFormData({ nombre: '', email: '', banco: '', notas: '' });
      fetchCuentas();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al crear cuenta');
    } finally {
      setLoading(false);
    }
  };

  const activarCuenta = async (id) => {
    setActivatingId(id);
    try {
      await api.post(
        `/api/tarjetas/cuentas/activar/${id}`,
        {},
        {
          withCredentials: true,
          headers: { 'X-CSRF-Token': csrfToken },
        }
      );
      toast.success('Cuenta activada correctamente');
      fetchCuentas();
    } catch (err) {
      const errorMessage =
        err.response?.data?.error || 'Error al activar cuenta';
      if (
        errorMessage.includes(
          'link_payments capability without the card_payments capability'
        )
      ) {
        toast.error(
          'No se puede activar la cuenta: se requiere habilitar pagos con tarjeta.'
        );
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setActivatingId(null);
    }
  };

  const eliminarCuenta = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta cuenta?')) {
      try {
        await api.delete(`/api/tarjetas/cuentas/${id}`, {
          withCredentials: true,
          headers: { 'X-CSRF-Token': csrfToken },
        });
        toast.success('Cuenta eliminada correctamente');
        fetchCuentas();
      } catch (err) {
        toast.error(err.response?.data?.error || 'Error al eliminar cuenta');
      }
    }
  };

  const getStatusBadge = (cuenta) => {
    if (cuenta.activa === 1) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
          <FontAwesomeIcon icon={faCheckCircle} className="mr-1" />
          Activado
        </span>
      );
    } else if (cuenta.onboarding_completed === 1) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
          <FontAwesomeIcon icon={faTimesCircle} className="mr-1" />
          Desactivado
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
          <FontAwesomeIcon icon={faExclamationTriangle} className="mr-1" />
          Incompleta
        </span>
      );
    }
  };

  const getStripeStatus = (cuenta) => {
    if (cuenta.onboarding_completed === 1) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
          <FontAwesomeIcon icon={faCheckCircle} className="mr-1" />
          Verificado
        </span>
      );
    } else if (cuenta.details_submitted === 1) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
          <FontAwesomeIcon icon={faClock} className="mr-1" />
          En Verificación
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
          <FontAwesomeIcon icon={faExclamationTriangle} className="mr-1" />
          Faltan Datos
        </span>
      );
    }
  };

  if (loading && !cuentas.length) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <FontAwesomeIcon
            icon={faSpinner}
            spin
            size="2x"
            className="text-amber-500 dark:text-amber-400 mb-4"
          />
          <p className="text-gray-600 dark:text-gray-400">
            Cargando cuentas...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6">
      <ToastContainer position="top-right" />
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
              Gestión de Cuentas Receptoras
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
              Administra las cuentas que reciben pagos
            </p>
          </div>
          <button
            onClick={syncConStripe}
            disabled={loading}
            className="flex items-center px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 text-sm font-medium"
          >
            <FontAwesomeIcon
              icon={faSyncAlt}
              className={`mr-1 ${loading ? 'animate-spin' : ''}`}
            />
            Sincronizar
          </button>
        </div>

        {/* Formulario */}
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-md mb-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center mb-4 gap-3">
            <div className="w-10 h-10 bg-amber-500 rounded-md flex items-center justify-center">
              <FontAwesomeIcon icon={faEnvelope} className="text-white" />
            </div>
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200">
              Nueva Cuenta
            </h2>
          </div>

          {formError && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <p className="text-red-600 dark:text-red-400 text-sm flex items-center">
                <FontAwesomeIcon
                  icon={faExclamationTriangle}
                  className="mr-2"
                />
                {formError}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Nombre *
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-amber-500 dark:bg-gray-700 dark:text-white transition-all"
                  placeholder="Juan Pérez"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-amber-500 dark:bg-gray-700 dark:text-white transition-all"
                  placeholder="juan.perez@email.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Banco *
                </label>
                <select
                  name="banco"
                  value={formData.banco}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-amber-500 dark:bg-gray-700 dark:text-white transition-all"
                  required
                >
                  <option value="">Selecciona un banco</option>
                  <option value="BBVA">BBVA</option>
                  <option value="Banorte">Banorte</option>
                  <option value="Santander">Santander</option>
                  <option value="HSBC">HSBC</option>
                  <option value="Banamex">Banamex</option>
                  <option value="Scotiabank">Scotiabank</option>
                  <option value="Inbursa">Inbursa</option>
                  <option value="Banjercito">Banjercito</option>
                  <option value="Banco Azteca">Banco Azteca</option>
                  <option value="Bancoppel">Bancoppel</option>
                  <option value="Afirme">Afirme</option>
                  <option value="Banco del Bajío">Banco del Bajío</option>
                  <option value="Intercam">Intercam</option>
                  <option value="Banregio">Banregio</option>
                  <option value="Mifel">Mifel</option>
                  <option value="Ve por Más">Ve por Más</option>
                  <option value="Consubanco">Consubanco</option>
                  <option value="ABC Capital">ABC Capital</option>
                  <option value="Klar">Klar</option>
                  <option value="Hey Banco">Hey Banco</option>
                  <option value="Nu México">Nu México</option>
                  <option value="Ualá">Ualá</option>
                  <option value="STP">
                    STP (Sistema de Transferencias y Pagos)
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Notas *
                </label>
                <textarea
                  name="notas"
                  value={formData.notas}
                  onChange={handleInputChange}
                  rows="2"
                  className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-amber-500 dark:bg-gray-700 dark:text-white transition-all resize-none"
                  placeholder="Notas adicionales..."
                  required
                />
              </div>
            </div>

            <div className="flex justify-center">
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 text-sm font-medium"
              >
                {loading ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} spin className="mr-1" />
                    Creando...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faCheckCircle} className="mr-1" />
                    Agregar
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Tabla de cuentas */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-500 rounded-md flex items-center justify-center">
                <FontAwesomeIcon icon={faShieldAlt} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200">
                  Cuentas Registradas
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                  {cuentas.length} cuenta{cuentas.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>

          {cuentas.length === 0 ? (
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                <FontAwesomeIcon
                  icon={faEnvelope}
                  className="text-2xl text-gray-400 dark:text-gray-500"
                />
              </div>
              <h3 className="text-base font-medium text-gray-700 dark:text-gray-200 mb-2">
                No hay cuentas
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Crea tu primera cuenta
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              {/* Vista de tabla */}
              <div className="hidden lg:block">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Información
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Stripe
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Fecha
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {cuentas.map((cuenta) => (
                      <tr
                        key={cuenta.id}
                        className="hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                      >
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2">
                            {cuenta.activa === 1 && (
                              <div className="w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center">
                                <FontAwesomeIcon
                                  icon={faCrown}
                                  className="text-white text-xs"
                                />
                              </div>
                            )}
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {cuenta.nombre}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {cuenta.email || 'Sin email'}
                              </div>
                              {cuenta.banco && (
                                <div className="text-xs text-gray-600 dark:text-gray-400">
                                  {cuenta.banco}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          {getStatusBadge(cuenta)}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          {getStripeStatus(cuenta)}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          {cuenta.fecha_creacion
                            ? new Date(
                                cuenta.fecha_creacion
                              ).toLocaleDateString('es-ES')
                            : 'No registrada'}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm font-medium flex space-x-2">
                          {cuenta.onboarding_completed === 0 && (
                            <button
                              onClick={async () => {
                                try {
                                  const res = await api.get(
                                    `/api/tarjetas/cuentas/onboarding-link/${cuenta.stripe_account_id}`,
                                    {
                                      withCredentials: true,
                                      headers: { 'X-CSRF-Token': csrfToken },
                                    }
                                  );
                                  window.open(res.data.url, '_blank');
                                  toast.info('Completa tu cuenta en Stripe');
                                } catch {
                                  toast.error('Error generando el enlace');
                                }
                              }}
                              className="px-2 py-1 rounded-md text-xs font-medium text-amber-600 bg-amber-100 hover:bg-amber-200 dark:bg-amber-900 dark:text-amber-300 dark:hover:bg-amber-800 transition-colors duration-200"
                            >
                              <FontAwesomeIcon icon={faLink} className="mr-1" />
                              Configurar
                            </button>
                          )}

                          {cuenta.onboarding_completed === 1 &&
                            cuenta.activa === 0 && (
                              <>
                                <button
                                  onClick={() => activarCuenta(cuenta.id)}
                                  disabled={activatingId === cuenta.id}
                                  className="px-2 py-1 rounded-md text-xs font-medium text-amber-600 bg-amber-100 hover:bg-amber-200 dark:bg-amber-900 dark:text-amber-300 dark:hover:bg-amber-800 transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                >
                                  {activatingId === cuenta.id ? (
                                    <>
                                      <FontAwesomeIcon
                                        icon={faSpinner}
                                        spin
                                        className="mr-1"
                                      />
                                      Activando...
                                    </>
                                  ) : (
                                    <>
                                      <FontAwesomeIcon
                                        icon={faCheckCircle}
                                        className="mr-1"
                                      />
                                      Activar
                                    </>
                                  )}
                                </button>
                                <button
                                  onClick={() => eliminarCuenta(cuenta.id)}
                                  className="px-2 py-1 rounded-md text-xs font-medium text-red-600 bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800 transition-colors duration-200"
                                >
                                  <FontAwesomeIcon
                                    icon={faTrash}
                                    className="mr-1"
                                  />
                                  Eliminar
                                </button>
                              </>
                            )}

                          {cuenta.activa === 1 && (
                            <div className="px-2 py-1 rounded-md text-xs font-medium text-amber-600 bg-amber-100 dark:bg-amber-900 dark:text-amber-300">
                              <FontAwesomeIcon
                                icon={faCrown}
                                className="mr-1"
                              />
                              Actual
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Vista de tarjetas */}
              <div className="lg:hidden p-3 space-y-3">
                {cuentas.map((cuenta) => (
                  <div
                    key={cuenta.id}
                    className="bg-white dark:bg-gray-800 rounded-md p-3 border border-gray-200 dark:border-gray-700 shadow-sm"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {cuenta.activa === 1 && (
                          <div className="w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center">
                            <FontAwesomeIcon
                              icon={faCrown}
                              className="text-white text-xs"
                            />
                          </div>
                        )}
                        <div>
                          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {cuenta.nombre}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {cuenta.email || 'Sin email'}
                          </p>
                        </div>
                      </div>
                      {getStatusBadge(cuenta)}
                    </div>

                    <div className="space-y-2 mb-2">
                      {cuenta.banco && (
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          <span className="font-medium mr-1">Banco:</span>
                          {cuenta.banco}
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Stripe:
                        </span>
                        {getStripeStatus(cuenta)}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        <span className="font-medium mr-1">Fecha:</span>
                        {cuenta.fecha_creacion
                          ? new Date(cuenta.fecha_creacion).toLocaleDateString(
                              'es-ES'
                            )
                          : 'No registrada'}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {cuenta.onboarding_completed === 0 && (
                        <button
                          onClick={async () => {
                            try {
                              const res = await api.get(
                                `/api/tarjetas/cuentas/onboarding-link/${cuenta.stripe_account_id}`,
                                {
                                  withCredentials: true,
                                  headers: { 'X-CSRF-Token': csrfToken },
                                }
                              );
                              window.open(res.data.url, '_blank');
                              toast.info('Completa tu cuenta en Stripe');
                            } catch {
                              toast.error('Error generando el enlace');
                            }
                          }}
                          className="px-2 py-1 rounded-md text-xs font-medium text-amber-600 bg-amber-100 hover:bg-amber-200 dark:bg-amber-900 dark:text-amber-300 dark:hover:bg-amber-800 transition-colors duration-200"
                        >
                          <FontAwesomeIcon icon={faLink} className="mr-1" />
                          Configurar
                        </button>
                      )}

                      {cuenta.onboarding_completed === 1 &&
                        cuenta.activa === 0 && (
                          <>
                            <button
                              onClick={() => activarCuenta(cuenta.id)}
                              disabled={activatingId === cuenta.id}
                              className="px-2 py-1 rounded-md text-xs font-medium text-amber-600 bg-amber-100 hover:bg-amber-200 dark:bg-amber-900 dark:text-amber-300 dark:hover:bg-amber-800 transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                              {activatingId === cuenta.id ? (
                                <>
                                  <FontAwesomeIcon
                                    icon={faSpinner}
                                    spin
                                    className="mr-1"
                                  />
                                  Activando...
                                </>
                              ) : (
                                <>
                                  <FontAwesomeIcon
                                    icon={faCheckCircle}
                                    className="mr-1"
                                  />
                                  Activar
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => eliminarCuenta(cuenta.id)}
                              className="px-2 py-1 rounded-md text-xs font-medium text-red-600 bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800 transition-colors duration-200"
                            >
                              <FontAwesomeIcon
                                icon={faTrash}
                                className="mr-1"
                              />
                              Eliminar
                            </button>
                          </>
                        )}

                      {cuenta.activa === 1 && (
                        <div className="px-2 py-1 rounded-md text-xs font-medium text-amber-600 bg-amber-100 dark:bg-amber-900 dark:text-amber-300">
                          <FontAwesomeIcon icon={faCrown} className="mr-1" />
                          Actual
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CuentasReceptoras;
