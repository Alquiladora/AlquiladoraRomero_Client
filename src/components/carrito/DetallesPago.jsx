import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/ContextAuth";
import { useCart } from "./ContextCarrito";
import api from "../../utils/AxiosConfig";
import { toast } from "react-toastify";
import { FaCreditCard, FaMoneyBillWave, FaLock, FaPlus, FaEdit } from "react-icons/fa";
import inconoMercadoPago from '../../img/pagos/Mercado-Pago-Logo-Vector.svg-1-1.png';
import inconoOxxo from '../../img/pagos/oxxo-pay-1024x225.png';
import inconoSpei from '../../img/pagos/icono-spei.png';
import AddressBook from '../../pages/client/perfil/componetsPerfil/ListaDirecciones'

const DetallesPago = ({ cartItems, total, rentalDate, returnDate, onBack }) => {
  const { user, csrfToken } = useAuth();
  const { cartCount, clearCart } = useCart();
  const navigate = useNavigate();
  const [direcciones, setDirecciones] = useState([]);
  const [direccionSeleccionada, setDireccionSeleccionada] = useState(null);
  const [mostrarListaDirecciones, setMostrarListaDirecciones] = useState(false);
  const [metodoPago, setMetodoPago] = useState("debito");
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editAddressId, setEditAddressId] = useState(null);
  const [updaDirrecion, setUpdaDirrecion]= useState([]);
 ;
  

 
  const itemsPerPage = 10;
  const totalPages = Math.ceil(cartItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedItems = cartItems.slice(startIndex, endIndex);

 
  useEffect(() => {
    const cargarDirecciones = async () => {
       const idUser= user?.id || user?.idUsuarios
      try {
        setIsLoading(true);
        const response = await api.get(`/api/direccion/listar`, {
        params: { idUsuarios: idUser },
          withCredentials: true,
          headers: { "X-CSRF-Token": csrfToken },
        });
        const direccionesObtenidas = response.data|| [];

        if(updaDirrecion.length>0){
          
            setDirecciones(updaDirrecion);

        }else{
           
            setDirecciones(direccionesObtenidas);
    
        }
       
        console.log("Direccion obtenido de detalles pago ", direccionesObtenidas)
        const predeterminada = direccionesObtenidas.find(dir => dir.predeterminado === 1);
        if (predeterminada) {
          setDireccionSeleccionada(predeterminada);
          setMostrarListaDirecciones(false);
        } else {
          setMostrarListaDirecciones(true);
        }
      } catch (error) {
        console.error("Error al obtener las direcciones:", error);
        toast.error("No se pudieron cargar las direcciones. Intenta de nuevo.");
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.idUsuarios || user?.id) {
      cargarDirecciones();
    }
  }, [updaDirrecion]);

  console.log("Datos recibidos de productos")

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
  
    if (!direccionSeleccionada) {
      toast.error("Por favor, selecciona una dirección de entrega.");
      setIsLoading(false);
      return;
    }
  
    try {
      const pedidoData = {
        userId: user?.idUsuarios || user?.id,
        total: total,
        direccion: direccionSeleccionada,
        metodoPago: metodoPago,
        rentalDate: rentalDate,
        returnDate: returnDate,
        items: cartItems,
        
      };
  
      const response = await api.post("/api/carrito/procesar", pedidoData, {
        withCredentials: true,
        headers: { "X-CSRF-Token": csrfToken },
      });
  
      if (response.status === 201) {
        const { idPedido, idPago, estadoPago, detallesPago, trackingId } = response.data;
  
        if (estadoPago === "pendiente") {
          toast.info(
            "Tu pedido ha sido registrado, pero el pago está pendiente. Sigue las instrucciones para completar el pago.",
            { autoClose: false }
          );
          navigate(`/instrucciones-pago/${trackingId}`);
        } else if (estadoPago === "completado") {
          toast.success("¡Pedido y pago completados exitosamente!");
        
          navigate(`/cliente/compra-exitosa/${idPedido}`);
        } else {
          toast.error("El pago falló. Por favor, intenta de nuevo.");
        }
      }
    } catch (error) {
      console.error("Error al procesar el pedido:", error);
      toast.error(error.response?.data?.message || "Hubo un error al procesar tu pedido. Intenta de nuevo.");
    } finally {
      setIsLoading(false);
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
    const idUsuarios= user?.id || user?.idUsuarios
   
    try {
      setIsLoading(true);
      const response = await api.get(`/api/direccion/listar`, {
      params: { idUsuarios:idUsuarios },
        withCredentials: true,
        headers: { "X-CSRF-Token": csrfToken },
      });
      const direccionesObtenidas = response.data || [];
      setDirecciones(direccionesObtenidas);
      const predeterminada = direccionesObtenidas.find(dir => dir.predeterminado === 1);
      if (predeterminada) {
        setDireccionSeleccionada(predeterminada);
        setMostrarListaDirecciones(false);
      } else if (direccionesObtenidas.length > 0) {
        setMostrarListaDirecciones(true);
      }
    } catch (error) {
      console.error("Error al actualizar las direcciones:", error);
      toast.error("No se pudieron actualizar las direcciones. Intenta de nuevo.");
    } finally {
        setIsLoading(false); 
      }
    };



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
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
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
          {/* Sección izquierda: Dirección y Forma de Pago */}
          <div className="lg:col-span-2 space-y-6">
            {/* Dirección de Entrega */}
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
                        direccionSeleccionada?.idDireccion === dir.idDireccion
                          ? "selected border-indigo-500 dark:border-indigo-400"
                          : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                      }`}
                      onClick={() => handleSeleccionarDireccion(dir)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
                            {dir.nombre} {dir.apellido}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {dir.direccion}, {dir.localidad}, {dir.municipio}, {dir.estado}, {dir.pais}
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
                    {direccionSeleccionada.nombre} {direccionSeleccionada.apellido}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {direccionSeleccionada.direccion}, {direccionSeleccionada.localidad}, {direccionSeleccionada.municipio}, {direccionSeleccionada.estado}, {direccionSeleccionada.pais}
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
                {/* PayPal */}
                <label
                  className={`payment-option border cursor-pointer ${
                    metodoPago === "paypal"
                      ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/50"
                      : "border-gray-200 dark:border-gray-700"
                  }`}
                >
                  <input
                    type="radio"
                    name="metodoPago"
                    value="paypal"
                    checked={metodoPago === "paypal"}
                    onChange={(e) => setMetodoPago(e.target.value)}
                    className="form-radio h-4 w-4 text-indigo-600 dark:text-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                  />
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg"
                    alt="PayPal"
                    className="payment-icon"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-100">
                      PayPal
                    </span>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Paga de forma segura con tu cuenta de PayPal.
                    </p>
                  </div>
                </label>

                {/* Tarjeta de débito */}
                <label
                  className={`payment-option border cursor-pointer ${
                    metodoPago === "debito"
                      ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/50"
                      : "border-gray-200 dark:border-gray-700"
                  }`}
                >
                  <input
                    type="radio"
                    name="metodoPago"
                    value="debito"
                    checked={metodoPago === "debito"}
                    onChange={(e) => setMetodoPago(e.target.value)}
                    className="form-radio h-4 w-4 text-indigo-600 dark:text-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                  />
                  <FaCreditCard className="payment-icon text-indigo-600 dark:text-indigo-400" />
                  <div className="flex-1">
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-100">
                      Tarjeta de débito
                    </span>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Usa tu tarjeta para un pago rápido y seguro.
                    </p>
                    {metodoPago === "debito" && (
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
                        <img
                          src="https://img.ltwebstatic.com/images2_pi/2018/06/06/15282731141226198327.png"
                          alt="Carnet"
                          className="h-5 object-contain"
                        />
                      </div>
                    )}
                  </div>
                </label>

                {/* SPEI */}
                <label
                  className={`payment-option border cursor-pointer ${
                    metodoPago === "spei"
                      ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/50"
                      : "border-gray-200 dark:border-gray-700"
                  }`}
                >
                  <input
                    type="radio"
                    name="metodoPago"
                    value="spei"
                    checked={metodoPago === "spei"}
                    onChange={(e) => setMetodoPago(e.target.value)}
                    className="form-radio h-4 w-4 text-indigo-600 dark:text-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                  />
                  <img src={inconoSpei} alt="SPEI" className="payment-icon" />
                  <div className="flex-1">
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-100">
                      SPEI
                    </span>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Realiza una transferencia bancaria rápida con SPEI.
                    </p>
                  </div>
                </label>

                {/* Mercado Pago */}
                <label
                  className={`payment-option border cursor-pointer ${
                    metodoPago === "mercadoPago"
                      ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/50"
                      : "border-gray-200 dark:border-gray-700"
                  }`}
                >
                  <input
                    type="radio"
                    name="metodoPago"
                    value="mercadoPago"
                    checked={metodoPago === "mercadoPago"}
                    onChange={(e) => setMetodoPago(e.target.value)}
                    className="form-radio h-4 w-4 text-indigo-600 dark:text-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                  />
                  <img
                    src={inconoMercadoPago}
                    alt="Mercado Pago"
                    className="payment-icon"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-100">
                      Mercado Pago
                    </span>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Paga con Mercado Pago de forma sencilla.
                    </p>
                  </div>
                </label>

                {/* Pago en OXXO */}
                <label
                  className={`payment-option border cursor-pointer ${
                    metodoPago === "oxxo"
                      ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/50"
                      : "border-gray-200 dark:border-gray-700"
                  }`}
                >
                  <input
                    type="radio"
                    name="metodoPago"
                    value="oxxo"
                    checked={metodoPago === "oxxo"}
                    onChange={(e) => setMetodoPago(e.target.value)}
                    className="form-radio h-4 w-4 text-indigo-600 dark:text-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                  />
                  <img src={inconoOxxo} alt="OXXO" className="payment-icon" />
                  <div className="flex-1">
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-100">
                      Pago en OXXO
                    </span>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Genera un código para pagar en cualquier OXXO.
                    </p>
                  </div>
                </label>

                {/* Depósito bancario */}
                <label
                  className={`payment-option border cursor-pointer ${
                    metodoPago === "deposito"
                      ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/50"
                      : "border-gray-200 dark:border-gray-700"
                  }`}
                >
                  <input
                    type="radio"
                    name="metodoPago"
                    value="deposito"
                    checked={metodoPago === "deposito"}
                    onChange={(e) => setMetodoPago(e.target.value)}
                    className="form-radio h-4 w-4 text-indigo-600 dark:text-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                  />
                  <FaMoneyBillWave className="payment-icon text-indigo-600 dark:text-indigo-400" />
                  <div className="flex-1">
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-100">
                      Depósito bancario
                    </span>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Realiza un depósito directo a nuestra cuenta bancaria.
                    </p>
                    {metodoPago === "deposito" && (
                      <div className="mt-3 p-4 bg-indigo-50 dark:bg-indigo-900/50 rounded-lg">
                        <p className="text-xs text-gray-700 dark:text-gray-300">
                          Realiza tu depósito a la siguiente cuenta:
                        </p>
                        <p className="text-xs font-medium text-gray-800 dark:text-gray-100 mt-1">
                          Banco: Banco Ejemplo
                          <br />
                          Cuenta: 1234-5678-9012-3456
                          <br />
                          CLABE: 012345678901234567
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                          Envía tu comprobante de pago a pagos@alquiladora.com para procesar tu pedido.
                        </p>
                      </div>
                    )}
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Sección derecha: Resumen de Renta */}
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
                    src={item.imagen || "https://via.placeholder.com/80?text=Producto"}
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
                      ? "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                      : "bg-indigo-600 dark:bg-indigo-700 text-white hover:bg-indigo-700 dark:hover:bg-indigo-800"
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
                      ? "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                      : "bg-indigo-600 dark:bg-indigo-700 text-white hover:bg-indigo-700 dark:hover:bg-indigo-800"
                  } transition-all`}
                >
                  Siguiente
                </button>
              </div>
            )}

            {/* Resumen de costos */}
            <div className="space-y-3 text-sm border-t pt-4 dark:border-gray-700">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">
                  Subtotal ({cartItems.length} productos):
                </span>
                <span className="font-medium text-gray-800 dark:text-gray-100">
                  ${total.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between font-semibold text-lg border-t pt-3 dark:border-gray-700">
                <span className="text-gray-800 dark:text-gray-100">
                  Total a pagar:
                </span>
                <span className="text-gray-900 dark:text-white">
                  ${total.toLocaleString()}
                </span>
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Día de renta:</span>{" "}
                  {new Date(rentalDate).toLocaleDateString("es-MX", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Día de devolución:</span>{" "}
                  {new Date(returnDate).toLocaleDateString("es-MX", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>

            {/* Botón Continuar */}
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className={`mt-6 w-full bg-indigo-600 dark:bg-indigo-700 text-white px-4 py-3 rounded-lg flex justify-center items-center transition-all ${
                isLoading
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-indigo-700 dark:hover:bg-indigo-800"
              }`}
            >
              {isLoading ? (
                <span className="spinner" />
              ) : (
                <span>Confirmar y Pagar</span>
              )}
            </button>

            {/* Sección de Seguridad para Alquiladora Romero */}
            <div className="security-section dark:bg-gray-800">
              <div className="flex items-center space-x-2">
                <FaLock className="text-indigo-600 dark:text-indigo-400" />
                <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                  Seguridad de Pago
                </h4>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                Alquiladora Romero está comprometida a proteger tu información de pago. Solo compartimos los datos necesarios con nuestros proveedores de servicios de pago que cuentan con las certificaciones de seguridad más estrictas.
              </p>
              <div className="flex justify-center space-x-3 mt-3">
                <img
                  src="https://img.ltwebstatic.com/images3_acp/2023/03/01/1677662501ancir14r1.png"
                  alt="Visa Secure"
                  className="h-5 object-contain transition-transform transform hover:scale-110"
                />
                <img
                  src="https://img.ltwebstatic.com/images3_acp/2023/03/01/1677662501ancir14r2.png"
                  alt="Mastercard"
                  className="h-5 object-contain transition-transform transform hover:scale-110"
                />
                <img
                  src="https://img.ltwebstatic.com/images3_acp/2023/03/01/1677662501ancir14r6.png"
                  alt="Verified by Visa"
                  className="h-5 object-contain transition-transform transform hover:scale-110"
                />
                <img
                  src="https://img.ltwebstatic.com/images3_acp/2023/03/01/1677662501ancir14r7.png"
                  alt="Mastercard SecureCode"
                  className="h-5 object-contain transition-transform transform hover:scale-110"
                />
              </div>
            </div>

            {/* Sección de Privacidad */}
            <div className="security-section dark:bg-gray-800 mt-3">
              <div className="flex items-center space-x-2">
                <FaLock className="text-indigo-600 dark:text-indigo-400" />
                <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                  Seguridad y Privacidad
                </h4>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                En Alquiladora Romero respetamos la privacidad de nuestros usuarios y visitantes. Nos comprometemos a proteger tus datos personales conforme a los estándares más altos de la industria, garantizando que tu información personal no será compartida sin tu consentimiento.
              </p>
            </div>
          </div>
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