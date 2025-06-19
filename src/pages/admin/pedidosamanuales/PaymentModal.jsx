import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faMoneyCheckAlt, 
  faTimes, 
  faCreditCard,
  faMoneyBillWave,
  faExclamationTriangle,
  faCheckCircle,
  faInfoCircle,
  faCalendarCheck,
  faReceipt
} from "@fortawesome/free-solid-svg-icons";
import api from "../../../utils/AxiosConfig";
import { useAuth } from "../../../hooks/ContextAuth";

function PaymentModal({ selectedOrder, onClose, onPaymentRegistered }) {
  const [montoPago, setMontoPago] = useState("");
  const [formaPago, setFormaPago] = useState("");
  const [metodoPago, setMetodoPago] = useState("");
  const [detallesPago, setDetallesPago] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const { csrfToken } = useAuth();

  const total = Number(selectedOrder.totalPagar) || 0;
  const totalPagado = Number(selectedOrder.pago.totalPagado) || 0;
  const pendiente = total - totalPagado;

  const validateMonto = (value) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue <= 0) {
      return "El monto debe ser mayor a 0";
    }
    if (numValue > pendiente) {
      return `El monto no puede exceder $${pendiente.toFixed(2)}`;
    }
    return null;
  };

  const handleMontoChange = (e) => {
    let value = e.target.value;
    if (value.startsWith("-")) {
      value = value.substring(1);
    }
    if (value.includes(".")) {
      const parts = value.split(".");
      if (parts[1] && parts[1].length > 2) {
        value = parts[0] + "." + parts[1].substring(0, 2);
      }
    }
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue > pendiente) {
      value = pendiente.toString();
    }
    setMontoPago(value);
    setError(null);
  };

  const handlePagoCompleto = () => {
    setMontoPago(pendiente.toString());
    setError(null);
  };

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const montoError = validateMonto(montoPago);
    if (montoError) {
      setError(montoError);
      return;
    }

    if (!formaPago || !metodoPago.trim()) {
      setError("Por favor completa todos los campos requeridos");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/api/pedidos/pagos/registrar", {
        idPedido: selectedOrder.idPedido,
        monto: parseFloat(montoPago),
        formaPago,
        metodoPago: metodoPago.trim(),
        detallesPago: detallesPago.trim(),
      },
      {
        headers: {
          "X-CSRF-Token": csrfToken,
        },
        withCredentials: true,
      });

      if (!response.data.success) {
        setError(response.data.message || "Error al registrar el pago");
      } else {
        setSuccess(true);
        setTimeout(() => {
          onPaymentRegistered();
          onClose();
        }, 1500);
      }
    } catch (error) {
      setError("Error de conexión. Verifica tu internet e intenta nuevamente.");
      console.error("Error al registrar pago:", error);
    } finally {
      setLoading(false);
    }
  };

  const getPaymentIcon = (forma) => {
    switch ((forma || "").toLowerCase()) {
      case "tarjeta":
        return faCreditCard;
      case "efectivo":
        return faMoneyBillWave;
      default:
        return faMoneyCheckAlt;
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black bg-opacity-60 p-4 backdrop-blur-sm transition-all duration-300">
      <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-lg sm:max-w-xl md:max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-700 transform transition-all duration-300 scale-100 hover:scale-[1.02]">
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 px-4 sm:px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="text-white">
              <h3 className="text-lg sm:text-xl font-bold">Registrar Pago</h3>
              <p className="text-yellow-100 text-sm sm:text-base">
                Pedido #{selectedOrder.idPedido}
              </p>
            </div>
            <button
              onClick={onClose}
              disabled={loading}
              className="text-white hover:text-yellow-200 transition-colors text-lg p-2 rounded-full hover:bg-white/10"
              aria-label="Cerrar modal"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* Si hay pendiente mostrar formulario */}
          {pendiente > 0 ? (
            <>
              {/* Información del pendiente */}
              <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-3">
                  <FontAwesomeIcon
                    icon={faInfoCircle}
                    className="text-blue-600 dark:text-blue-400 text-lg"
                  />
                  <div>
                    <p className="text-blue-800 dark:text-blue-200 font-medium text-sm sm:text-base">
                      Monto total:{" "}
                      <span className="font-bold">${total.toFixed(2)}</span>
                    </p>
                    <p className="text-blue-800 dark:text-blue-200 font-medium text-sm sm:text-base">
                      Ya pagado:{" "}
                      <span className="font-bold">${totalPagado.toFixed(2)}</span>
                    </p>
                    <p className="text-blue-900 dark:text-blue-100 font-bold text-base sm:text-lg">
                      Pendiente:{" "}
                      <span className="text-red-600 dark:text-red-400">
                        ${pendiente.toFixed(2)}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Mensajes de error o éxito */}
              {error && (
                <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <FontAwesomeIcon
                      icon={faExclamationTriangle}
                      className="text-red-600 dark:text-red-400"
                    />
                    <p className="text-red-800 dark:text-red-200 font-medium text-sm sm:text-base">
                      {error}
                    </p>
                  </div>
                </div>
              )}

              {success && (
                <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <FontAwesomeIcon
                      icon={faCheckCircle}
                      className="text-green-600 dark:text-green-400"
                    />
                    <p className="text-green-800 dark:text-green-200 font-medium text-sm sm:text-base">
                      ¡Pago registrado exitosamente!
                    </p>
                  </div>
                </div>
              )}

              {/* Formulario de pago */}
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                {/* Monto a pagar */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                    Monto a Pagar *
                  </label>
                  <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0">
                    <div className="flex-1 relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 font-semibold">
                        $
                      </span>
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        max={pendiente}
                        value={montoPago}
                        onChange={handleMontoChange}
                        placeholder="0.00"
                        required
                        disabled={loading}
                        className="w-full pl-8 pr-4 py-2 sm:py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white text-base sm:text-lg font-medium focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handlePagoCompleto}
                      disabled={loading}
                      className="px-4 py-2 sm:py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                    >
                      Pago Completo
                    </button>
                  </div>
                  {montoPago && validateMonto(montoPago) && (
                    <p className="text-red-600 dark:text-red-400 text-xs sm:text-sm mt-1">
                      {validateMonto(montoPago)}
                    </p>
                  )}
                </div>

                {/* Forma de Pago */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                    Forma de Pago *
                  </label>
                  <select
                    value={formaPago}
                    onChange={(e) => setFormaPago(e.target.value)}
                    required
                    disabled={loading}
                    className="w-full p-2 sm:p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white text-base sm:text-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">Selecciona una forma de pago</option>
                    <option value="efectivo">💵 Efectivo</option>
                    <option value="transferencia">🏦 Transferencia Bancaria</option>
                  </select>
                </div>

                {/* Método de Pago */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                    Detalles del Pago *
                  </label>
                  <input
                    type="text"
                    value={metodoPago}
                    onChange={(e) => setMetodoPago(e.target.value)}
                    placeholder="Ej: Visa terminada en 1234, Transferencia BBVA, etc."
                    required
                    disabled={loading}
                    className="w-full p-2 sm:p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white text-base sm:text-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                {/* Botones */}
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={loading}
                    className="px-4 sm:px-6 py-2 sm:py-3 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={
                      loading ||
                      !montoPago ||
                      validateMonto(montoPago) ||
                      !formaPago ||
                      !metodoPago.trim()
                    }
                    className="px-4 sm:px-6 py-2 sm:py-3 rounded-lg bg-yellow-500 text-white hover:bg-yellow-600 transition-colors font-medium text-sm sm:text-base flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        <span>Procesando...</span>
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faMoneyCheckAlt} />
                        <span>Registrar Pago</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <>
              {/* Mensaje cuando no hay saldo pendiente */}
              <div className="bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-6 mb-6 flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
                <div className="bg-green-200 dark:bg-green-800 p-3 rounded-full text-green-700 dark:text-green-300 text-3xl sm:text-5xl flex items-center justify-center shadow-lg">
                  <FontAwesomeIcon icon={faCalendarCheck} />
                </div>
                <div className="text-center sm:text-left">
                  <h3 className="text-lg sm:text-xl font-bold text-green-900 dark:text-green-100 mb-1">
                    ¡Pago Completado!
                  </h3>
                  <p className="text-green-800 dark:text-green-300 text-sm sm:text-base max-w-lg">
                    Este pedido ya fue completamente pagado. No hay saldo pendiente por cobrar.
                  </p>
                </div>
              </div>

              {/* Historial de pagos */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6 sm:pt-8 max-h-[30vh] overflow-y-auto">
                <h4 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center space-x-3">
                  <FontAwesomeIcon
                    icon={getPaymentIcon(formaPago)}
                    className="text-yellow-500"
                  />
                  <span>Historial de Pagos</span>
                </h4>

                {selectedOrder.pago.resumen.length > 0 ? (
                  <div className="space-y-3 pr-2">
                    {selectedOrder.pago.resumen.map((pago, idx) => (
                      <div
                        key={idx}
                        className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 sm:p-4 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors"
                      >
                        <div className="flex items-start space-x-3">
                          <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-2 mt-1">
                            <FontAwesomeIcon
                              icon={faCheckCircle}
                              className="text-green-600 dark:text-green-400 text-sm"
                            />
                          </div>
                          <div className="flex-1">
                            <p className="text-gray-800 dark:text-gray-200 font-medium text-sm sm:text-base break-words">
                              {pago}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FontAwesomeIcon
                      icon={faInfoCircle}
                      className="text-gray-400 dark:text-gray-600 text-3xl mb-3"
                    />
                    <p className="text-gray-500 dark:text-gray-400 italic text-sm sm:text-base">
                      No hay pagos registrados aún para este pedido.
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default PaymentModal;
