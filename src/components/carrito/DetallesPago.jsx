/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/ContextAuth';
import { useCart } from './ContextCarrito';
import api from '../../utils/AxiosConfig';
import { toast } from 'react-toastify';
import { FaCreditCard, FaLock, FaPlus, FaEdit } from 'react-icons/fa';
import AddressBook from '../../pages/client/perfil/componetsPerfil/ListaDirecciones';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const DetallesPago = ({ cartItems,puntos, total, rentalDate, returnDate, onBack }) => {
  const { user, csrfToken } = useAuth();
  const { cartCount, clearCart } = useCart();
  const navigate = useNavigate();
  const [direcciones, setDirecciones] = useState([]);
  const [direccionSeleccionada, setDireccionSeleccionada] = useState(null);
  const [mostrarListaDirecciones, setMostrarListaDirecciones] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editAddressId, setEditAddressId] = useState(null);
  const [updaDirrecion] = useState([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const itemsPerPage = 10;
  const totalPages = Math.ceil(cartItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedItems = cartItems.slice(startIndex, endIndex);


  const [usarPuntos, setUsarPuntos] = useState(false);


  const puntosDisponibles = puntos?.currentPoints || 0;
  
  
  const valorMonetarioPuntos = puntosDisponibles / 10;


  const limiteDescuento = total * 0.50;


  const descuentoPuntosAplicable = Math.min(valorMonetarioPuntos, limiteDescuento);

 
  const totalFinal = usarPuntos ? (total - descuentoPuntosAplicable) : total;




  useEffect(() => {
    const cargarDirecciones = async () => {
      const idUser = user?.id || user?.idUsuarios;
      try {
        setIsLoading(true);
        const response = await api.get(`/api/direccion/listar`, {
          params: { idUsuarios: idUser },
          withCredentials: true,
          headers: { 'X-CSRF-Token': csrfToken },
        });
        const direccionesObtenidas = response.data || [];

        if (updaDirrecion.length > 0) {
          setDirecciones(updaDirrecion);
        } else {
          setDirecciones(direccionesObtenidas);
        }

        const predeterminada = direccionesObtenidas.find(
          (dir) => dir.predeterminado === 1
        );
        if (predeterminada) {
          setDireccionSeleccionada(predeterminada);
          setMostrarListaDirecciones(false);
        } else {
          setMostrarListaDirecciones(true);
        }
      } catch (error) {
        console.error('Error al obtener las direcciones:', error);
        toast.error('No se pudieron cargar las direcciones. Intenta de nuevo.');
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.idUsuarios || user?.id) {
      cargarDirecciones();
    }
  }, [updaDirrecion, csrfToken, user?.id, user?.idUsuarios]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!direccionSeleccionada) {
      toast.error('Por favor, selecciona una dirección de entrega.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await api.post(
        '/api/pedidos/pagos/crear-checkout-session',
        {
          amount: Math.round(totalFinal * 100),
          currency: 'mxn',
          successUrl: `${window.location.origin}/cliente/compra-exitosa/{CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}/cliente/carrito`,
          idUsuario: user?.id || user?.idUsuarios,
          idDireccion: direccionSeleccionada.idDireccion,
          fechaInicio: rentalDate,
          fechaEntrega: returnDate,
          cartItems: cartItems,
          //Verifcar ahoprita 
          puntosUsados: usarPuntos ? (descuentoPuntosAplicable * 10) : 0,
          descuentoPuntos: usarPuntos ? descuentoPuntosAplicable : 0,
        },
        {
          withCredentials: true,
          headers: { 'X-CSRF-Token': csrfToken },
        }
      );
    // console.log('datos a aneviar', Math.round(total * 100));

      const stripe = await stripePromise;
      const { error } = await stripe.redirectToCheckout({
        sessionId: response.data.sessionId,
      });

      if (error) {
        toast.error(error.message);
        setIsLoading(false);
      }
    } catch (err) {
      console.error(err);
      toast.error('Error al iniciar el proceso de pago.');
      setIsLoading(false);
    }
  };

  const handlePaymentSuccess = async (sessionId) => {
    try {
      const response = await api.get(
        `/api/pedidos/pagos/verificar/${sessionId}`,
        {
          withCredentials: true,
          headers: { 'X-CSRF-Token': csrfToken },
        }
      );

      if (response.data.success) {
        const { idPago } = response.data;
        clearCart();
        navigate(`/cliente/compra-exitosa/${idPago}`);
      } else {
        toast.error('Error al verificar el pago.');
      }
    } catch (error) {
      console.error('Error al procesar el pago:', error);
      toast.error('Error al procesar el pago.');
    } finally {
      setShowPaymentModal(false);
    }
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleSeleccionarDireccion = (direccion) => {
    setDireccionSeleccionada(direccion);
    setMostrarListaDirecciones(false);
  };

  const handleCambiarDireccion = () => {
    setMostrarListaDirecciones(true);
  };

  const handleCrearNuevaDireccion = () => {
    setEditAddressId(null);
    setShowAddressModal(true);
  };

  const handleEditarDireccion = (id) => {
    setEditAddressId(id);
    setShowAddressModal(true);
  };

  const handleCloseAddressModal = () => {
    setShowAddressModal(false);
    setEditAddressId(null);
  };

  const handleAddressUpdated = async () => {
    const idUsuarios = user?.id || user?.idUsuarios;
    try {
      setIsLoading(true);
      const response = await api.get(`/api/direccion/listar`, {
        params: { idUsuarios: idUsuarios },
        withCredentials: true,
        headers: { 'X-CSRF-Token': csrfToken },
      });
      const direccionesObtenidas = response.data || [];
      setDirecciones(direccionesObtenidas);
      const predeterminada = direccionesObtenidas.find(
        (dir) => dir.predeterminado === 1
      );
      if (predeterminada) {
        setDireccionSeleccionada(predeterminada);
        setMostrarListaDirecciones(false);
      } else if (direccionesObtenidas.length > 0) {
        setMostrarListaDirecciones(true);
      }
    } catch (error) {
      console.error('Error al actualizar las direcciones:', error);
      toast.error(
        'No se pudieron actualizar las direcciones. Intenta de nuevo.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);

   // console.log('Datoa en viados de stripe '.urlParams);
    const sessionId = urlParams.get('session_id');
   // console.log('Datoa en viados de stripe sesion id '.sessionId);
    if (sessionId) {
      handlePaymentSuccess(sessionId, 'success');
    }
  }, []);

  if (cartCount === 0 || cartItems.length === 0) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
          Tu carrito está vacío
        </h2>
        <button
          onClick={onBack}
          className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-all dark:bg-indigo-700 dark:hover:bg-indigo-800"
        >
          Volver al carrito
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-gray-100 transition-colors duration-200">
      <style>{`
        @keyframes fadeIn {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideIn {
          0% { opacity: 0; transform: translateX(20px); }
          100% { opacity: 1; transform: translateX(0); }
        }
        @keyframes cardFlip {
          0% { transform: perspective(1000px) rotateY(0deg); }
          50% { transform: perspective(1000px) rotateY(180deg); }
          100% { transform: perspective(1000px) rotateY(360deg); }
        }
        .spinner {
          display: inline-block;
          width: 1.25rem;
          height: 1.25rem;
          border: 2px solid #ccc;
          border-top: 2px solid #666;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          border-color: #ccc dark:border-gray-500;
          border-top-color: #666 dark:border-top-gray-300;
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
        .animate-slideIn {
          animation: slideIn 0.5s ease-out forwards;
        }
        .payment-option {
          display: flex;
          align-items: center;
          padding: 0.75rem;
          border-radius: 0.5rem;
          transition: all 0.3s ease;
          background-color: #fff dark:bg-gray-800;
        }
        .payment-option:hover {
          background-color: #f3f4f6 dark:bg-gray-700;
        }
        .payment-icon {
          width: 2rem;
          height: 2rem;
          object-fit: contain;
          margin-right: 0.75rem;
        }
        .security-section {
          background-color: #f9fafb dark:bg-gray-800;
          border-radius: 0.5rem;
          padding: 1rem;
          margin-top: 1rem;
        }
        .direccion-card {
          border: 1px solid #e5e7eb dark:border-gray-700;
          border-radius: 0.5rem;
          padding: 1rem;
          margin-bottom: 1rem;
          background-color: #fff dark:bg-gray-800;
          transition: all 0.3s ease;
        }
        .direccion-card:hover {
          border-color: #6366f1 dark:border-indigo-400;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) dark:box-shadow-0-2px-8px-rgba(255,255,255,0.05);
        }
        .direccion-card.selected {
          border-color: #6366f1 dark:border-indigo-400;
          background-color: #f0f5ff dark:bg-indigo-900/30;
        }
        .modal {
          display: flex;
          justify-content: center;
          align-items: center;
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.7);
          z-index: 1000;
          animation: fadeIn 0.3s ease-out;
        }
        .modal-content {
          background: white dark:bg-gray-900;
          padding: 2rem;
          border-radius: 1rem;
          width: 90%;
          max-width: 900px;
          display: flex;
          flex-direction: column lg:flex-row gap-8;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
          overflow-y: auto;
          max-height: 90vh;
        }
        .close-btn {
          position: absolute;
          top: 1.5rem;
          right: 1.5rem;
          background: none;
          border: none;
          font-size: 1.75rem;
          cursor: pointer;
          color: #666 dark:color-gray-400;
          transition: color 0.3s;
        }
        .close-btn:hover {
          color: #ef4444;
        }
        @media (max-width: 1024px) {
          .modal-content {
            flex-direction: column;
            max-width: 600px;
          }
        }
      `}</style>

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100 animate-fadeIn">
            Detalles del Pago
          </h2>
          <button
            onClick={onBack}
            className="mt-2 sm:mt-0 bg-gray-500 dark:bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-600 dark:hover:bg-gray-600 transition-all"
          >
            Volver al carrito
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {!showPaymentModal && (
            <>

              <div className="lg:col-span-2 space-y-6">
             
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 animate-fadeIn">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                      Dirección de Entrega
                    </h3>
                    {direccionSeleccionada && !mostrarListaDirecciones && (
                      <button
                        onClick={handleCambiarDireccion}
                        className="text-indigo-600 dark:text-indigo-400 hover:underline dark:hover:text-indigo-300 text-sm"
                      >
                        Cambiar
                      </button>
                    )}
                  </div>

                  {isLoading ? (
                    <div className="flex justify-center items-center py-4">
                      <span className="spinner" />
                      <span className="ml-2 text-gray-600 dark:text-gray-400">
                        Cargando direcciones...
                      </span>
                    </div>
                  ) : direcciones.length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        No tienes direcciones registradas.
                      </p>
                      <button
                        onClick={handleCrearNuevaDireccion}
                        className="inline-flex items-center px-4 py-2 bg-indigo-600 dark:bg-indigo-700 text-white text-sm font-semibold rounded shadow hover:bg-indigo-700 dark:hover:bg-indigo-800 transition-all"
                      >
                        <FaPlus className="mr-2" />
                        Añadir Dirección Nueva
                      </button>
                    </div>
                  ) : mostrarListaDirecciones ? (
                    <div className="space-y-4">
                      {direcciones.map((dir) => (
                        <div
                          key={dir.idDireccion}
                          className={`direccion-card cursor-pointer border transition-all ${
                            direccionSeleccionada?.idDireccion ===
                            dir.idDireccion
                              ? 'selected border-indigo-500 dark:border-indigo-400'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                          }`}
                          onClick={() => handleSeleccionarDireccion(dir)}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
                                {dir.nombre} {dir.apellido}
                              </p>
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                {dir.direccion}, {dir.localidad},{' '}
                                {dir.municipio}, {dir.estado}, {dir.pais}
                              </p>
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                Código Postal: {dir.codigoPostal}
                              </p>
                              {dir.referencias && (
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                  Referencias: {dir.referencias}
                                </p>
                              )}
                              {dir.predeterminado === 1 && (
                                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                                  Dirección Predeterminada
                                </p>
                              )}
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditarDireccion(dir.idDireccion);
                              }}
                              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
                            >
                              <FaEdit />
                            </button>
                          </div>
                        </div>
                      ))}
                      {direcciones.length < 6 && (
                        <button
                          onClick={handleCrearNuevaDireccion}
                          className="inline-flex items-center px-4 py-2 bg-indigo-600 dark:bg-indigo-700 text-white text-sm font-semibold rounded shadow hover:bg-indigo-700 dark:hover:bg-indigo-800 transition-all mt-4"
                        >
                          <FaPlus className="mr-2" />
                          Añadir Dirección Nueva
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="direccion-card selected border border-gray-200 dark:border-gray-700 rounded-md p-4">
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
                        {direccionSeleccionada.nombre}{' '}
                        {direccionSeleccionada.apellido}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {direccionSeleccionada.direccion},{' '}
                        {direccionSeleccionada.localidad},{' '}
                        {direccionSeleccionada.municipio},{' '}
                        {direccionSeleccionada.estado},{' '}
                        {direccionSeleccionada.pais}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Código Postal: {direccionSeleccionada.codigoPostal}
                      </p>
                      {direccionSeleccionada.referencias && (
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Referencias: {direccionSeleccionada.referencias}
                        </p>
                      )}
                      {direccionSeleccionada.predeterminado === 1 && (
                        <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                          Dirección Predeterminada
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Forma de Pago */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 animate-fadeIn">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">
                    Método de Pago
                  </h3>
                  <div className="space-y-2">
                    <label className="payment-option border cursor-pointer border-indigo-500 bg-indigo-50 dark:bg-indigo-900/50">
                      <FaCreditCard className="payment-icon text-indigo-600 dark:text-indigo-400" />
                      <div className="flex-1">
                        <span className="text-sm font-medium text-gray-800 dark:text-gray-100">
                          Tarjeta de débito/crédito
                        </span>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Usa tu tarjeta para un pago rápido y seguro con
                          Stripe.
                        </p>
                        <div className="mt-2 flex space-x-2">
                          <img
                            src="https://upload.wikimedia.org/wikipedia/commons/0/04/Visa.svg"
                            alt="Visa"
                            className="h-5 object-contain"
                          />
                          <img
                            src="https://upload.wikimedia.org/wikipedia/commons/b/b7/MasterCard_Logo.svg"
                            alt="Mastercard"
                            className="h-5 object-contain"
                          />
                          <img
                            src="https://upload.wikimedia.org/wikipedia/commons/3/30/American_Express_logo.svg"
                            alt="American Express"
                            className="h-5 object-contain"
                          />
                        </div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Sección derecha: Resumen de Renta (siempre visible) */}
              <div className="summary bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md self-start sticky top-4 animate-slideIn border border-gray-100 dark:border-gray-700">
                <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
                  Resumen de Renta
                </h3>

                {/* Lista de productos */}
                <div className="space-y-4 mb-4">
                  {paginatedItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center space-x-4 border-b border-gray-200 dark:border-gray-700 pb-4 last:border-b-0"
                    >
                      <img
                        src={
                          item.imagen ||
                          'https://via.placeholder.com/80?text=Producto'
                        }
                        alt={item.nombre}
                        className="w-16 h-16 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
                          {item.nombre}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Cantidad: {item.cantidad}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Color: {item.color}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Precio por día: ${item.precioPorDia.toLocaleString()}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                        ${(item.precioPorDia * item.cantidad).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Paginación */}
                {cartItems.length > itemsPerPage && (
                  <div className="flex justify-between items-center mt-4">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`px-3 py-1 rounded-lg text-sm ${
                        currentPage === 1
                          ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                          : 'bg-indigo-600 dark:bg-indigo-700 text-white hover:bg-indigo-700 dark:hover:bg-indigo-800'
                      } transition-all`}
                    >
                      Anterior
                    </button>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Página {currentPage} de {totalPages}
                    </span>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`px-3 py-1 rounded-lg text-sm ${
                        currentPage === totalPages
                          ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                          : 'bg-indigo-600 dark:bg-indigo-700 text-white hover:bg-indigo-700 dark:hover:bg-indigo-800'
                      } transition-all`}
                    >
                      Siguiente
                    </button>
                  </div>
                )}
               {/* Resumen de costos */}
                <div className="space-y-3 text-sm border-t pt-4 dark:border-gray-700">
                  
                  {/* 1. Subtotal Normal */}
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">
                      Subtotal ({cartItems.length} productos):
                    </span>
                    <span className="font-medium text-gray-800 dark:text-gray-100">
                      ${total.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                    </span>
                  </div>

             
                  {puntosDisponibles > 0 && (
                    <div className="bg-indigo-50 dark:bg-indigo-900/30 p-3 rounded-lg border border-indigo-100 dark:border-indigo-800 my-2 transition-all duration-300">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex flex-col">
                                <span className="font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-1 text-sm">
                                    💎 Usar mis puntos
                                </span>
                                <span className="text-xs text-gray-600 dark:text-gray-400">
                                    Disponible: {puntosDisponibles} pts (${valorMonetarioPuntos.toFixed(2)})
                                </span>
                            </div>
                            
                            {/* Interruptor (Toggle Switch) */}
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    checked={usarPuntos}
                                    onChange={() => setUsarPuntos(!usarPuntos)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                            </label>
                        </div>
                        {usarPuntos && (
                            <div className="animate-fadeIn">
                                <div className="text-xs text-indigo-600 dark:text-indigo-400 mt-1 pb-1 border-b border-indigo-200 dark:border-indigo-700 mb-2">
                                    {valorMonetarioPuntos > limiteDescuento 
                                        ? `*Límite del 50% aplicado (Máx: $${limiteDescuento.toFixed(2)})`
                                        : `*Se usarán ${descuentoPuntosAplicable * 10} puntos`
                                    }
                                </div>

                               
                                <div className="flex justify-between text-green-600 dark:text-green-400 font-bold text-sm">
                                    <span>Descuento por puntos:</span>
                                    <span>-${descuentoPuntosAplicable.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                                </div>
                            </div>
                        )}
                    </div>
                  )}
                  {/* ----------------------------------------------------------- */}

                  <div className="border-t pt-3 dark:border-gray-700">
                    <div className="flex justify-between font-bold text-xl">
                      <span className="text-gray-900 dark:text-white">
                        Total a pagar:
                      </span>
                      <span className="text-green-600 dark:text-green-400">
                        ${totalFinal.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                      </span>
                    </div>
                    
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-right mt-1 italic">
                      El precio incluye descuentos, tarifa de servicio e IVA.
                    </p>
                  </div>

                  {/* Fechas de Renta */}
                  <div className="mt-4 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-md">
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                      <span className="font-semibold">📅 Renta:</span>{' '}
                      {new Date(rentalDate + 'T00:00:00').toLocaleDateString(
                        'es-MX',
                        { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
                      )}
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <span className="font-semibold">🔄 Devolución:</span>{' '}
                      {new Date(returnDate + 'T00:00:00').toLocaleDateString(
                        'es-MX',
                        { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
                      )}
                    </p>
                  </div>
                </div>



                {/* Botón Continuar */}
                <button
                  onClick={handleSubmit}
                  disabled={isLoading || !direccionSeleccionada}
                  className="mt-6 w-full bg-indigo-600 dark:bg-indigo-700 text-white px-4 py-3 rounded-lg flex justify-center items-center transition-all hover:bg-indigo-700 dark:hover:bg-indigo-800 shadow-md"
                >
                  {isLoading ? (
                    <span className="spinner" />
                  ) : (
                    <span>Confirmar y Pagar</span>
                  )}
                </button>

               
                <div className="security-section dark:bg-gray-800">
                  <div className="flex items-center space-x-2">
                    <FaLock className="text-indigo-600 dark:text-indigo-400" />
                    <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                      Seguridad de Pago
                    </h4>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                    Alquiladora Romero protege tu información con Stripe,
                    cumpliendo los más altos estándares de seguridad.
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal para crear/editar dirección */}
      <AddressBook
        idUsuarios={user?.idUsuarios || user?.id}
        isOpen={showAddressModal}
        onClose={handleCloseAddressModal}
        onAddressUpdated={handleAddressUpdated}
        showList={false}
        editAddressId={editAddressId}
      />
    </div>
  );
};

export default DetallesPago;
