/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTimes,
  faCreditCard,
  faMoneyCheckAlt,
  faSpinner,
  faPlus,
  faCheckCircle,
  faExclamationCircle,
} from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import api from '../../../utils/AxiosConfig';
import { useAuth } from '../../../hooks/ContextAuth';
import CustomLoading from '../../../components/spiner/SpinerGlobal';

const PaymentModal = ({ selectedOrder, onClose, onPaymentRegistered }) => {
  const { csrfToken } = useAuth();
  const [payments, setPayments] = useState([]);
  const [isLoadingPayments, setIsLoadingPayments] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNewPaymentForm, setShowNewPaymentForm] = useState(false);
  const [newPayment, setNewPayment] = useState({
    formaPago: '',
    metodoPago: '',
    monto: '',
    detallesPago: '',
  });

  // Depuración: Inspeccionar selectedOrder
  useEffect(() => {
    console.log('selectedOrder:', selectedOrder);
  }, [selectedOrder]);

  const fetchPayments = async () => {
    setIsLoadingPayments(true);
    try {
      const response = await api.get(
        `/api/pagos/pedido/${selectedOrder.idPedido}`,
        {
          withCredentials: true,
          headers: { 'X-CSRF-Token': csrfToken },
        }
      );
      if (response.data.success) {
        setPayments(response.data.data || []);
        console.log('Pagos cargados:', response.data.data);
      } else {
        toast.error('No se encontraron pagos para este pedido.');
        setPayments([]);
      }
    } catch (error) {
      setPayments([]);
    } finally {
      setIsLoadingPayments(false);
    }
  };

  useEffect(() => {
    if (selectedOrder?.idPedido) {
      fetchPayments();
    }
  }, [selectedOrder]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPayment((prev) => ({ ...prev, [name]: value }));
  };

  const isNewPaymentValid = () => {
    return (
      newPayment.formaPago.trim() !== '' &&
      newPayment.metodoPago.trim() !== '' &&
      newPayment.monto > 0 &&
      !isNaN(newPayment.monto)
    );
  };

  const handleSubmitNewPayment = async (e) => {
    e.preventDefault();
    if (!isNewPaymentValid()) {
      toast.error(
        'Por favor, completa todos los campos requeridos correctamente.'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        idPedido: selectedOrder.idPedido,
        formaPago: newPayment.formaPago,
        metodoPago: newPayment.metodoPago,
        monto: parseFloat(newPayment.monto),
        detallesPago: newPayment.detallesPago.trim() || null,
      };

      const response = await api.post('/api/pagos/crear', payload, {
        headers: { 'X-CSRF-Token': csrfToken },
        withCredentials: true,
      });

      if (response.data.success) {
        toast.success('¡Pago registrado con éxito!');
        setNewPayment({
          formaPago: '',
          metodoPago: '',
          monto: '',
          detallesPago: '',
        });
        setShowNewPaymentForm(false);
        fetchPayments();
        onPaymentRegistered();
      } else {
        toast.error('Error al registrar el pago.');
      }
    } catch (error) {
      console.error('Error creating payment:', error);
      toast.error(
        error.response?.data?.message || 'Error al registrar el pago.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalPagar = parseFloat(selectedOrder?.totalPagar || '0') || 0;

  const totalPagado = parseFloat(selectedOrder?.pagos?.totalPagado || '0') || 0;

  const remainingBalance = totalPagar - totalPagado;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4 dark:bg-black dark:bg-opacity-70 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 w-full max-w-3xl rounded-xl shadow-2xl relative border border-gray-300 dark:border-gray-700 max-h-[90vh] overflow-hidden">
        <div className="bg-gradient-to-r from-green-400 to-emerald-500 dark:from-green-600 dark:to-emerald-600 px-4 py-3 flex justify-between items-center sticky top-0 z-10 rounded-t-xl">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 rounded-full p-2">
              <FontAwesomeIcon icon={faMoneyCheckAlt} className="text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">
              Pagos del Pedido #{selectedOrder?.idRastreo || 'N/A'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="bg-white/20 hover:bg-white/30 rounded-full p-2 text-white transition"
            aria-label="Cerrar modal"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
        <div className="p-6 max-h-[calc(90vh-64px)] overflow-y-auto scrollbar-thin scrollbar-thumb-green-500 dark:scrollbar-thumb-green-600">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6 border border-gray-200 dark:border-gray-600">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
              <FontAwesomeIcon
                icon={faCreditCard}
                className="mr-2 text-green-500"
              />
              Resumen del Pedido
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Cliente
                </p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {selectedOrder?.cliente?.nombre || 'No especificado'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Contacto
                </p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {selectedOrder?.cliente?.contacto || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total del Pedido
                </p>
                <p className="font-semibold text-green-600 dark:text-green-400">
                  ${totalPagar.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total Pagado
                </p>
                <p className="font-semibold text-green-600 dark:text-green-400">
                  ${' '}
                  {Number(selectedOrder?.pagos?.totalPagado).toFixed(2) ??
                    '0.00'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Saldo Pendiente
                </p>
                <p
                  className={`font-semibold ${
                    remainingBalance <= 0
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  ${remainingBalance.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Estado del Pago
                </p>
                <p
                  className={`font-semibold capitalize ${
                    selectedOrder?.pagos?.estadoPago === 'completado'
                      ? 'text-green-600 dark:text-green-400'
                      : selectedOrder?.pagos?.estadoPago === 'parcial'
                        ? 'text-yellow-600 dark:text-yellow-400'
                        : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {selectedOrder?.pagos?.estadoPago || 'pendiente'}
                </p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <FontAwesomeIcon
                  icon={faMoneyCheckAlt}
                  className="mr-2 text-green-500"
                />
                Historial de Pagos
              </h3>
            </div>

            {/* Aseguramos que selectedOrder y listaPagos existan antes de intentar iterar */}
            {isLoadingPayments ? (
              <CustomLoading />
            ) : selectedOrder?.pagos?.listaPagos?.length === 0 ||
              !selectedOrder ? (
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 text-center border border-gray-200 dark:border-gray-600">
                <FontAwesomeIcon
                  icon={faExclamationCircle}
                  className="text-4xl text-yellow-500 dark:text-yellow-400 mb-2"
                />
                <p className="text-gray-600 dark:text-gray-300">
                  No hay pagos registrados para este pedido.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-600">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-green-100 dark:bg-green-800">
                    <tr>
                      {[
                        'Fecha',
                        'Forma de Pago',
                        'Método de Pago',
                        'Monto',
                        'Estado',
                        // "Detalles", <-- Columna eliminada si no se usa
                      ].map((header, idx) => (
                        <th
                          key={idx}
                          className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wide"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    {/* CORRECCIÓN CLAVE: Iterar sobre selectedOrder.pagos.listaPagos.
            Cada 'payment' ahora es un objeto individual de la lista de pagos. 
          */}
                    {selectedOrder.pagos.listaPagos.map((payment) => (
                      <tr
                        key={payment.idPago} // Usamos idPago como clave única
                        className="hover:bg-green-50 dark:hover:bg-green-900/20 transition"
                      >
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                          {/* Formateamos la fecha, usando encadenamiento opcional si es necesario, 
                  aunque el error más común era el acceso incorrecto 
                */}
                          {payment.fechaPago
                            ? new Date(payment.fechaPago).toLocaleDateString(
                                'es-ES',
                                {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                }
                              )
                            : 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                          {payment.formaPago || 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                          {payment.metodoPago || 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-sm text-green-600 dark:text-green-400 font-semibold">
                          {/* Convertimos a número y aplicamos toFixed(2) */}$
                          {Number(payment.monto || 0).toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                              payment.estadoPago === 'completado'
                                ? 'bg-green-200 text-green-800 dark:bg-green-700 dark:text-green-200'
                                : payment.estadoPago === 'parcial'
                                  ? 'bg-yellow-200 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-200'
                                  : 'bg-red-200 text-red-800 dark:bg-red-700 dark:text-red-200'
                            }`}
                          >
                            <FontAwesomeIcon
                              icon={faCheckCircle}
                              className="mr-1"
                            />
                            {payment.estadoPago || 'pendiente'}
                          </span>
                        </td>
                        {/* <td className="px-4 py-3 text-sm">... Detalles (si es necesario) ...</td> */}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
