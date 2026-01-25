/* eslint-disable */
import React, { useState, useEffect } from 'react';
import {
  TrashIcon,
  PlusIcon,
  MinusIcon,
  ColorSwatchIcon,
  CogIcon,
  ClockIcon,
} from '@heroicons/react/outline';
import { useSocket } from '../../utils/Socket';
import { useAuth } from '../../hooks/ContextAuth';
import api from '../../utils/AxiosConfig';
import { toast } from 'react-toastify';
import { useCart } from './ContextCarrito';
import DetallesPago from './DetallesPago';
import { useRecomendaciones } from './ContextRecomendaciones';
import { ShoppingCart } from 'lucide-react';
import './carrito.css';
import { Link } from 'react-router-dom';


const SeccionRecomendaciones = ({ productos, onAgregar, addingProductId }) => {
  if (!productos || productos.length === 0) return null;

 // console.log("datos recibidos de recomnedacion", productos, onAgregar, addingProductId)
  return (
    <div className="w-full max-w-7xl mx-auto px-4 mt-16 animate-fadeIn">
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <h3 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100">
          Recomendaciones para ti
        </h3>
      </div>

      <div className="relative">
        <div className="flex gap-5 overflow-x-auto no-scrollbar pb-4 snap-x snap-mandatory scroll-smooth">
          {productos.map((prod) => {

            const productId = prod.idProductoColores;
            if (!productId) {
              console.warn("Recomendación omitida por falta de idProductoColores:", prod);
              return null;
            }


            const isAdding = addingProductId === productId;


            return (
              <Link
                key={productId}
                to={`/cliente/${prod.nombreCategoria}/${prod.idProducto}`}
                className="flex-shrink-0 w-[250px] sm:w-[260px] bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 overflow-hidden snap-start"
              >
                <div className="relative overflow-hidden bg-gray-50 dark:bg-gray-700 h-40 sm:h-44">
                  <img
                    src={
                      prod.imagenProducto ||
                      'https://via.placeholder.com/300x200?text=Sin+Imagen'
                    }
                    alt={prod.nombre}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-0.5 rounded-full text-[11px] font-semibold">
                    Disponible
                  </div>
                </div>

                <div className="p-3">
                  {prod.stockDisponible && (
                    <span className="text-xs text-green-600 dark:text-green-400 font-semibold bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded mb-2 inline-block">
                      {prod.stockDisponible} disponibles
                    </span>
                  )}

                  <h4 className="font-semibold text-gray-800 dark:text-gray-200 text-sm line-clamp-2 mb-1 min-h-[2.5rem]">
                    {prod.nombre}
                  </h4>

                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 line-clamp-2 min-h-[2rem]">
                    {prod.detalles || prod.coloresDisponibles}
                  </p>

                  <p className="text-base font-bold text-blue-600 dark:text-blue-400 mb-3">
                    {isNaN(Number(prod.precioAlquiler))
                      ? 'Precio no disponible'
                      : `$${Number(prod.precioAlquiler).toFixed(2)}`}
                  </p>


                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      if (!isAdding) {
                        onAgregar(productId, 1, prod.precioAlquiler);
                      }
                    }}

                    disabled={isAdding}
                    className={`w-full font-semibold py-2 px-4 rounded-xl transition-all duration-300 text-sm flex justify-center items-center gap-2 shadow-sm 
                      ${isAdding
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                  >
                    {isAdding ? (

                      <>
                        <div className="spinner !w-4 !h-4 !border-white" />
                        <span>Agregando...</span>
                      </>
                    ) : (

                      <>
                        <ShoppingCart size={14} />
                        <span>Agregar</span>
                      </>
                    )}
                  </button>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};



function CarritoRentaSheinStyle() {
  const socket = useSocket();
  const { user, csrfToken } = useAuth();
  const idUsuario = user?.idUsuarios || user?.id;
  const { removeFromCart: removeFromCartContext, addToCart } = useCart();
  const [cartItems, setCartItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [rentalDate, setRentalDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [totalCalculated, setTotalCalculated] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [itemLoading, setItemLoading] = useState({});
  const [showDetallesPago, setShowDetallesPago] = useState(false);
  const allSelected = selectedItems.length === cartItems.length;
  const { recomendaciones, actualizarRecomendaciones } = useRecomendaciones();
  const [addingProductId, setAddingProductId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorNivel, setErrorNivel] = useState(null);
  const [nivelData, setNivelData] = useState({
    name: 'Invitado',
    discount: 0.00,
    benefitText: 'Acceso al programa de Puntos y Logros'
  });
  const [puntos, setPuntos]= useState({});

  const MINIMUM_TOTAL = 150;
  const STRIPE_FEE_PERCENT = 0.041;
  const STRIPE_FEE_FIXED = 3;

  const getMexicoCityDate = () => {
    const date = new Date().toLocaleString('en-US', {
      timeZone: 'America/Mexico_City',
    });
    return new Date(date);
  };

  const getTodayDate = () => {
    const today = new Date(getMexicoCityDate());
    return today.toISOString().split('T')[0];
  };


  const getNextDay = (date) => {
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);
    return nextDay.toISOString().split('T')[0];
  };

  const isSunday = (dateStr) => {
    const date = new Date(`${dateStr}T00:00:00-06:00`); 
  //  console.log(`Fecha: ${dateStr}, Día: ${date.getUTCDay()}`);
    return date.getUTCDay() === 0; 
  };

  const isTodaySunday = () => {
    const today = new Date(getMexicoCityDate());
    return today.getDay() === 0; 
  };

  const fetchCartItems = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get(`/api/carrito/carrito/${idUsuario}`, {
        withCredentials: true,
        headers: {
          'X-CSRF-Token': csrfToken,
          'Content-Type': 'application/json',
        },
      });

      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al obtener el carrito');
      }

      const mappedItems = response.data.carrito.map((item) => ({
        id: item.idCarrito,
        nombre: item.nombreProducto,
        imagen:
          item.imagenProducto || 'https://via.placeholder.com/80?text=Producto',
        precioPorDia: parseFloat(item.precioProducto),
        cantidad: item.cantidad,
        disponible: item.stockDisponible > 0,
        stockDisponible: item.stockDisponible || 0,
        idProducto: item.idProducto,
        idProductoColor: item.idProductoColores,
        color: item.color,
        detalles: item.detalles,
        material: item.material,
        fechaAgregado: item.fechaAgregado,
        remainingTime: getRemainingTime(item.fechaAgregado),
      }));

      if (response.data.expiredCount > 0) {
        toast.info(
          `${response.data.expiredCount} producto(s) fueron eliminados del carrito porque excedieron el límite de 1 año.`
        );
      }

      setCartItems(mappedItems);
      setSelectedItems(
        mappedItems
          .filter(
            (item) =>
              item.stockDisponible > 0 && item.cantidad <= item.stockDisponible
          )
          .map((item) => item.id)
      );
    } catch (err) {
      console.error('Error fetching cart items:', err);
      setError('No se pudo cargar el carrito. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (idUsuario) {
      fetchCartItems();
    } else {
      setError('No se pudo identificar al usuario. Por favor, inicia sesión.');
    }
  }, [idUsuario]);

  useEffect(() => {
    if (!socket || !idUsuario) return;

    const handleCartUpdate = (data) => {
      if (data.idUsuario === idUsuario) fetchCartItems();
    };

    const handleInventoryUpdate = (data) => {
      setCartItems((prevItems) =>
        prevItems.map((item) => {
          if (item.idProductoColor === data.idProductoColor) {
            const newStockDisponible = data.stockDisponible;
            if (
              (newStockDisponible === 0 ||
                item.cantidad > newStockDisponible) &&
              selectedItems.includes(item.id)
            ) {
              setSelectedItems((prev) => prev.filter((id) => id !== item.id));
              if (newStockDisponible === 0) {
                toast.warn(
                  `El producto "${item.nombre}" se ha quedado sin stock y ha sido deseleccionado.`
                );
              } else {
                toast.warn(
                  `La cantidad del producto "${item.nombre}" (${item.cantidad}) es mayor al stock disponible (${newStockDisponible}). Por favor, disminuye la cantidad.`
                );
              }
            }
            return {
              ...item,
              stockDisponible: newStockDisponible,
              disponible: newStockDisponible > 0,
            };
          }
          return item;
        })
      );
    };

    socket.on('Agregalo Carrito', handleCartUpdate);
    socket.on('Inventario Actualizado', handleInventoryUpdate);

    return () => {
      socket.off('Agregalo Carrito', handleCartUpdate);
      socket.off('Inventario Actualizado', handleInventoryUpdate);
    };
  }, [socket, idUsuario, selectedItems]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCartItems((prevItems) =>
        prevItems.map((item) => ({
          ...item,
          remainingTime: getRemainingTime(item.fechaAgregado),
        }))
      );
    }, 60000);
    return () => clearInterval(interval);
  }, [cartItems]);

  const addToCartt = async (idProductoColor, cantidad, precioAlquiler) => {
   // console.log("Datos recibido de carrito", idProductoColor, cantidad, precioAlquiler)
    setAddingProductId(idProductoColor);

    if (!idUsuario) {
      toast.error(
        'Por favor, inicia sesión para agregar productos al carrito.'
      );
      setAddingProductId(null);
      return;
    }

    try {
      const response = await api.post(
        '/api/carrito/agregar',
        { idUsuario, idProductoColor, cantidad, precioAlquiler },
        {
          withCredentials: true,
          headers: {
            'X-CSRF-Token': csrfToken,
            'Content-Type': 'application/json',
          },
        }
      );
      actualizarRecomendaciones(response.data.recomendaciones);
      //console.log("Recomendaciones ", response.data.recomendaciones)
      await addToCart();


      if (!response.data.success) {
        throw new Error(
          response.data.message || 'No se pudo agregar el producto al carrito'
        );
      }

      toast.success('Producto agregado al carrito correctamente');
      fetchCartItems();
    } catch (err) {
      console.error('Error adding item to cart:', err);
      toast.error(
        err.message ||
        'No se pudo agregar el producto al carrito. Intenta de nuevo.'
      );
    } finally {
      setAddingProductId(null);
    }
  };

  const removeFromCart = async (idCarrito) => {
    setItemLoading((prev) => ({ ...prev, [idCarrito]: true }));
    const idUser = user?.id || user?.idUsuarios;
    try {
      const response = await api.delete(`/api/carrito/eliminar/${idCarrito}`, {
        withCredentials: true,
        headers: {
          'X-CSRF-Token': csrfToken,
          'Content-Type': 'application/json',
        },
        data: { idUsuario: idUser },
      });
      actualizarRecomendaciones(response.data.recomendaciones);

      if (!response.data.success) {
        throw new Error(
          response.data.message || 'No se pudo eliminar el producto del carrito'
        );
      }

      const updatedCartItems = cartItems.filter((item) => item.id !== idCarrito);
      const updatedSelectedItems = selectedItems.filter((id) => id !== idCarrito);

      setCartItems(updatedCartItems);
      setSelectedItems(updatedSelectedItems);
      toast.success('Producto eliminado del carrito correctamente');
      await removeFromCartContext();


      if (totalCalculated !== null && rentalDate && returnDate) {
        const nuevoTotal = calcularTotalCentralizado(
          updatedCartItems,
          updatedSelectedItems,
          rentalDate,
          returnDate,
          nivelData
        );
        setTotalCalculated(nuevoTotal);
      }


    } catch (err) {
      console.error('Error removing item from cart:', err);
      toast.error(
        err.message ||
        'No se pudo eliminar el producto del carrito. Intenta de nuevo.'
      );
      fetchCartItems();
    } finally {
      setItemLoading((prev) => ({ ...prev, [idCarrito]: false }));
    }
  };

  const updateQuantity = async (idCarrito, newCantidad) => {
    if (newCantidad <= 0) {
      toast.error('La cantidad debe ser al menos 1.');
      return;
    }

    setItemLoading((prev) => ({ ...prev, [idCarrito]: true }));
    try {
      const response = await api.put(
        `/api/carrito/actualizar/${idCarrito}`,
        { cantidad: newCantidad },
        {
          withCredentials: true,
          headers: {
            'X-CSRF-Token': csrfToken,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.data.success) {
        throw new Error(
          response.data.message || 'No se pudo actualizar la cantidad'
        );
      }

      setCartItems((prev) =>
        prev.map((item) =>
          item.id === idCarrito
            ? {
              ...item,
              cantidad: newCantidad,
            }
            : item
        )
      );
      const updatedCartItems = cartItems.map((item) =>
        item.id === idCarrito ? { ...item, cantidad: newCantidad } : item
      );
      setCartItems(updatedCartItems);

    
      let updatedSelectedItems = [...selectedItems];
      const updatedItem = updatedCartItems.find((item) => item.id === idCarrito);
      if (updatedItem && newCantidad <= updatedItem.stockDisponible) {
        if (!updatedSelectedItems.includes(idCarrito)) {
          updatedSelectedItems.push(idCarrito);
          setSelectedItems(updatedSelectedItems);
        }
      }

      if (totalCalculated !== null && rentalDate && returnDate) {
        const nuevoTotal = calcularTotalCentralizado(
          updatedCartItems,
          updatedSelectedItems,
          rentalDate,
          returnDate,
          nivelData
        );
        setTotalCalculated(nuevoTotal);
      }

    } catch (err) {
      console.error('Error updating quantity:', err);
      toast.error(err.message || 'No se pudo actualizar la cantidad.');
      fetchCartItems();
    } finally {
      setItemLoading((prev) => ({ ...prev, [idCarrito]: false }));
    }
  };





  const handleToggleItem = (id) => {
    const newSelectedItems = selectedItems.includes(id)
      ? selectedItems.filter((itemId) => itemId !== id)
      : [...selectedItems, id];

    setSelectedItems(newSelectedItems);

   
    if (totalCalculated !== null && rentalDate && returnDate) {
      const nuevoTotal = calcularTotalCentralizado(
        cartItems,
        newSelectedItems,
        rentalDate,
        returnDate,
        nivelData
      );
      setTotalCalculated(nuevoTotal);
    }
  };



  const handleToggleAll = () => {
    let newSelectedItems = [];
    if (!allSelected) {

      newSelectedItems = cartItems
        .filter(item => item.stockDisponible > 0 && item.cantidad <= item.stockDisponible)
        .map(item => item.id);
    }

    setSelectedItems(newSelectedItems);


    if (totalCalculated !== null && rentalDate && returnDate) {
      const nuevoTotal = calcularTotalCentralizado(
        cartItems,
        newSelectedItems,
        rentalDate,
        returnDate,
        nivelData
      );
      setTotalCalculated(nuevoTotal);
    }
  };



  const handleChangeQuantity = (id, newCantidad) => {
    updateQuantity(id, Math.max(1, newCantidad));
  };

  const handleRemoveItem = (id) => {
    removeFromCart(id);
  };

  const calcularSubtotal = (item) => item.precioPorDia * item.cantidad;

  const subtotalAproximado = cartItems.reduce((acc, item) => {
    return selectedItems.includes(item.id) ? acc + calcularSubtotal(item) : acc;
  }, 0);

  const calculateTotalToPay = (montoBase) => {
    const stripeFee = montoBase * STRIPE_FEE_PERCENT + STRIPE_FEE_FIXED;
    const total = montoBase + stripeFee;
    return { subtotal: montoBase, stripeFee, total };
  };




  const calcularTotalCentralizado = (items, seleccionadosIds, fechaInicio, fechaFin, datosNivel) => {
    if (!fechaInicio || !fechaFin) return null;

    const start = new Date(fechaInicio);
    const end = new Date(fechaFin);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;

 
    const subtotalReal = items.reduce((acc, item) => {
      if (seleccionadosIds.includes(item.id)) {
        return acc + item.precioPorDia * item.cantidad * diffDays;
      }
      return acc;
    }, 0);

   
    if (subtotalReal === 0) return 0;


    const descuentoDinero = subtotalReal * (datosNivel.discount || 0);
    let baseParaCobrar = subtotalReal - descuentoDinero;

   
    if (datosNivel.name !== 'Embajador de Fiesta') {
      if (baseParaCobrar < 150) { 
        baseParaCobrar = 150;
      }
    }


    const stripeFee = baseParaCobrar * 0.041 + 3; 
    const totalFinal = baseParaCobrar + stripeFee;

    return totalFinal;
  };




  const handleCotizar = () => {
    if (!rentalDate || !returnDate) {
      toast.error('Por favor selecciona las fechas de renta y devolución.');
      return;
    }
    if (isTodaySunday() && isSunday(rentalDate)) {
      toast.error('Los domingos no trabajamos.');
      return;
    }

 
    const total = calcularTotalCentralizado(cartItems, selectedItems, rentalDate, returnDate, nivelData);

    setTotalCalculated(total);
    toast.success('Cotización realizada correctamente');
  };


  const getRemainingTime = (fechaAgregado) => {
    const fechaAgregadoDate = new Date(fechaAgregado);
    const expirationDate = new Date(fechaAgregadoDate);
    expirationDate.setFullYear(fechaAgregadoDate.getFullYear() + 1);

    const currentDate = new Date(getMexicoCityDate());
    const diffTime = expirationDate - currentDate;

    if (diffTime <= 0) return { timeString: 'Expirado', showTimer: false };

    const days = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));
    const timeString = `${days}d ${hours}h ${minutes}m`;
    const showTimer = days <= 2;

    return { timeString, showTimer };
  };

  const handleRentalDateChange = (e) => {
    const newRentalDate = e.target.value;

    if (isTodaySunday() && isSunday(newRentalDate)) {
      toast.error(
        'Los domingos no trabajamos. Por favor, selecciona otro día.'
      );
      setRentalDate('');
      return;
    }

    setRentalDate(newRentalDate);

    if (returnDate && new Date(newRentalDate) >= new Date(returnDate)) {
      setReturnDate('');
      toast.warn(
        'La fecha de devolución ha sido reseteada porque debe ser posterior a la fecha de renta.'
      );
    }

    if (totalCalculated !== null) {
      setTotalCalculated(null);
    }
  };

  const handleReturnDateChange = (e) => {
    const newReturnDate = e.target.value;
    const rentalDateObj = new Date(rentalDate);
    const returnDateObj = new Date(newReturnDate);

    if (!rentalDate) {
      toast.error('Por favor selecciona primero la fecha de renta.');
      setReturnDate('');
      return;
    }

    if (returnDateObj <= rentalDateObj) {
      toast.error(
        'La fecha de devolución debe ser posterior a la fecha de renta.'
      );
      setReturnDate('');
      return;
    }

    setReturnDate(newReturnDate);

    if (totalCalculated !== null) {
      setTotalCalculated(null);
    }
  };

  const handleProceedToPayment = () => {
    if (selectedItems.length === 0) {
      toast.error(
        'Por favor, selecciona al menos un producto para proceder al pago.'
      );
      return;
    }
    if (!rentalDate || !returnDate) {
      toast.error('Por favor, selecciona las fechas de renta y devolución.');
      return;
    }
    if (isTodaySunday() && isSunday(rentalDate)) {
      toast.error(
        'Los domingos no trabajamos. Por favor, selecciona otro día para la renta.'
      );
      return;
    }
    if (totalCalculated === null) {
      toast.error(
        'Por favor, realiza la cotización antes de proceder al pago.'
      );
      return;
    }
    setShowDetallesPago(true);
  };

  const handleBackToCart = () => {
    setShowDetallesPago(false);
  };

  let displayDays = 1;
  if (rentalDate && returnDate) {
    const start = new Date(rentalDate);
    const end = new Date(returnDate);
    const diffTime = Math.abs(end - start);
    displayDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
  }


  const { subtotal, stripeFee, total } =
    totalCalculated !== null
      ? calculateTotalToPay(totalCalculated)
      : { subtotal: 0, stripeFee: 0, total: 0 };

  const cartProductIds = cartItems.map(item => item.idProducto);

  const filteredRecomendaciones = recomendaciones.filter(rec =>
    !cartProductIds.includes(rec.idProducto)
  );

  //_____________________________DATOS PARA LOS DESCUENTSO DE ACUERDO A NIVEL_____________________________________
  useEffect(() => {

    if (!csrfToken) return;

    const fetchGamificacionData = async () => {
      setLoading(true);
      setErrorNivel(null);
      try {

        const response = await api.get('/api/pedidos/Nivelesypuntos', {
          headers: { 'X-CSRF-Token': csrfToken },
          withCredentials: true,
        });

        if (response.data.success && response.data.data) {
          const levelName = response.data.data.currentLevelName;
         setPuntos(response.data.data)
          const info = getLevelInfo(levelName);
         
          setNivelData(info);

        } else {
          setErrorNivel(response.data.message || "Error al cargar datos de nivel.");
        }
      } catch (err) {
        console.error("Error al obtener datos de gamificación:", err);
        setErrorNivel(err.message || "Error de conexión al cargar nivel.");
      } finally {
        setLoading(false);
      }
    };

    fetchGamificacionData();
  }, [csrfToken]);

  const LEVEL_DISCOUNTS = {
    'Invitado': 0.00,
    'Anfitrión': 0.05,
    'Organizador Pro': 0.10,
    'Embajador de Fiesta': 0.12,
  };

  const getLevelInfo = (levelName) => {
    const discount = LEVEL_DISCOUNTS[levelName] || 0.00;
    const name = levelName || 'Invitado';
    let benefitText = 'Sin descuento de nivel';

    if (discount === 0.05) benefitText = '5% de descuento en todas tus rentas';
    if (discount === 0.10) benefitText = '10% de descuento + Prioridad en entregas';
    if (discount === 0.12) benefitText = '12% de descuento + Envío gratuito';

    return { discount, name, benefitText };
  };





  //__________________________________________________________________



  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 text-gray-900 dark:text-gray-100">
      <style jsx>{`
      @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      @keyframes spin { to { transform: rotate(360deg); } }
      .spinner { display: inline-block; width: 1.25rem; height: 1.25rem; border: 2px solid #d1d5db; border-top: 2px solid #4b5563; border-radius: 50%; animation: spin 0.8s linear infinite; }
      .animate-fadeIn { animation: fadeIn 0.5s ease-out forwards; }

      .bubble {
        display: inline-flex; align-items: center; background: linear-gradient(90deg, #e0f7fa, #bae6fd);
        color: #1e88e5; padding: 6px 14px; border-radius: 9999px; font-size: 0.875rem; font-weight: 500;
        transition: background-color 0.3s ease;
      }
      .bubble:hover { background: linear-gradient(90deg, #bae6fd, #93c5fd); }

      @keyframes glowBlink { 0%,100% { opacity: 1; box-shadow: 0 0 10px rgba(239,68,68,0.5); } 50% { opacity: 0.7; box-shadow: 0 0 15px rgba(239,68,68,0.8); } }
      .timer {
        display: inline-flex; align-items: center; background: linear-gradient(90deg, #ef4444, #f87171);
        color: #fff; padding: 8px 16px; border-radius: 9999px; font-size: 0.875rem; font-weight: 600;
        animation: glowBlink 3s ease-in-out infinite;
      }
      .timer.dark { background: linear-gradient(90deg, #b91c1c, #dc2626); color: #fee2e2; }

      .out-of-stock {
        background: linear-gradient(90deg, #fee2e2, #fecaca); color: #b91c1c; padding: 6px 14px;
        border-radius: 9999px; font-size: 0.875rem; font-weight: 500; display: inline-flex; align-items: center;
      }
      .out-of-stock.dark { background: linear-gradient(90deg, #7f1d1d, #991b1b); color: #fee2e2; }

      /* RESPONSIVIDAD PERFECTA SIN ROMPER NADA */
      @media (max-width: 1024px) {
        .summary { position: static !important; margin-top: 2rem; }
      }
      @media (max-width: 640px) {
        .cart-item { flex-direction: column !important; text-align: center; gap: 1rem; padding: 1rem !important; }
        .cart-item img { width: 100px !important; height: 100px !important; margin: 0 auto; }
        .quantity-controls { justify-content: center !important; }
        .price-remove { text-align: center; width: 100%; }
      }
    `}</style>

      {showDetallesPago ? (
        <DetallesPago
          cartItems={cartItems.filter(item => selectedItems.includes(item.id))}
          puntos={puntos}
                                      
          total={totalCalculated.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          rentalDate={rentalDate}
          returnDate={returnDate}
          onBack={handleBackToCart}
        />
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold flex items-center gap-3">
              <svg className="w-7 h-7 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Carrito de Renta
              <span className="bg-indigo-100 text-indigo-800 text-lg font-semibold px-3 py-1 rounded-full dark:bg-indigo-900 dark:text-indigo-200">
                {cartItems.length}
              </span>
            </h2>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={handleToggleAll}
                disabled={cartItems.length === 0}
                className="w-5 h-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500 dark:border-gray-600"
              />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Seleccionar todo</span>
            </label>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Productos */}
            <div className="lg:col-span-2 space-y-6">
              {isLoading ? (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 text-center">
                  <div className="spinner mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400 text-lg">Cargando carrito...</p>
                </div>
              ) : error ? (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-10 text-center">
                  <p className="text-red-500 dark:text-red-400 text-lg mb-6">{error}</p>
                  <button onClick={fetchCartItems} className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-6 py-3 rounded-lg hover:from-indigo-700 hover:to-indigo-800 transition shadow-md">
                    Reintentar
                  </button>
                </div>
              ) : cartItems.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-16 text-center">
                  <p className="text-gray-500 dark:text-gray-400 text-lg">Tu carrito está vacío.</p>
                  <a href="/cliente" className="mt-6 inline-block bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-6 py-3 rounded-lg hover:from-indigo-700 hover:to-indigo-800 transition shadow-md">
                    Explorar productos
                  </a>
                </div>
              ) : (
                cartItems.map((item, index) => {
                  const isChecked = selectedItems.includes(item.id);
                  const subtotal = calcularSubtotal(item);
                  const isOutOfStock = item.stockDisponible === 0;
                  const isOverStock = item.cantidad > item.stockDisponible && item.stockDisponible > 0;
                  const canIncrease = !isOutOfStock && !isOverStock && item.cantidad < item.stockDisponible;
                  const canDecrease = item.cantidad > 1;
                  const canSelect = !isOutOfStock && !isOverStock;
                  const isItemLoading = itemLoading[item.id] || false;
                  const remainingTime = item.remainingTime || getRemainingTime(item.fechaAgregado);

                  return (
                    <div
                      key={item.id}
                      className={`cart-item bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 sm:p-6 flex flex-col sm:flex-row items-center gap-5 border ${isOutOfStock || isOverStock ? 'border-red-200 dark:border-red-800 opacity-80' : 'border-gray-100 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600'} transition-all`}
                    >
                      <input type="checkbox" checked={isChecked} onChange={() => handleToggleItem(item.id)} disabled={!canSelect} className="w-5 h-5 text-indigo-600 rounded" />

                      <img src={item.imagen} alt={item.nombre} className={`w-24 h-24 sm:w-28 sm:h-28 object-cover rounded-lg border ${isOutOfStock || isOverStock ? 'opacity-60' : ''}`} />

                      <div className="flex-1 space-y-3 text-center sm:text-left">
                        {isOutOfStock ? <span className="out-of-stock text-sm">Producto sin stock</span> : isOverStock ? <span className="out-of-stock text-sm">La cantidad es mayor a la disponible. Por favor, disminuye la cantidad.</span> : null}
                        {remainingTime.showTimer && !isOutOfStock && !isOverStock && (
                          <span className="timer text-sm"><ClockIcon className="h-5 w-5 mr-2" /> Tiempo restante: {remainingTime.timeString}</span>
                        )}
                        <p className="font-semibold text-lg sm:text-xl text-gray-900 dark:text-gray-100">{item.nombre}</p>

                        <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                          <span className="bubble text-sm"><ColorSwatchIcon className="h-4 w-4 mr-1" /> Color: {item.color}</span>
                          <span className="bubble text-sm"><CogIcon className="h-4 w-4 mr-1" /> Material: {item.material}</span>
                        </div>

                        <p className="text-sm text-gray-600 dark:text-gray-400"><span className="font-medium">Detalles:</span> {item.detalles}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400"><span className="font-medium">Precio por día:</span> <span className="font-semibold text-indigo-600 dark:text-indigo-400">${item.precioPorDia.toLocaleString()}</span></p>

                        <div className="quantity-controls flex items-center justify-center sm:justify-start gap-4 mt-3">
                          <button onClick={() => handleChangeQuantity(item.id, item.cantidad - 1)} disabled={!canDecrease || isItemLoading}
                            className={`p-2 rounded-full ${canDecrease && !isItemLoading ? 'bg-gradient-to-r from-indigo-100 to-indigo-200 text-indigo-600 hover:from-indigo-200 hover:to-indigo-300 dark:from-indigo-700 dark:to-indigo-800 dark:text-indigo-200' : 'bg-gray-200 text-gray-400 dark:bg-gray-600 dark:text-gray-500 cursor-not-allowed'}`}>
                            {isItemLoading ? <span className="spinner" /> : <MinusIcon className="h-5 w-5" />}
                          </button>
                          <span className={`px-4 py-1 rounded-full font-medium text-sm ${isOutOfStock || isOverStock ? 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400' : 'bg-indigo-50 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'}`}>
                            {item.cantidad} unidades
                          </span>
                          <button onClick={() => handleChangeQuantity(item.id, item.cantidad + 1)} disabled={!canIncrease || isItemLoading}
                            className={`p-2 rounded-full ${canIncrease && !isItemLoading ? 'bg-gradient-to-r from-indigo-100 to-indigo-200 text-indigo-600 hover:from-indigo-200 hover:to-indigo-300 dark:from-indigo-700 dark:to-indigo-800 dark:text-indigo-200' : 'bg-gray-200 text-gray-400 dark:bg-gray-600 dark:text-gray-500 cursor-not-allowed'}`}>
                            {isItemLoading ? <span className="spinner" /> : <PlusIcon className="h-5 w-5" />}
                          </button>
                        </div>
                      </div>

                      <div className="price-remove text-center sm:text-right space-y-3">
                        <p className="text-xl font-bold text-gray-900 dark:text-gray-100">${subtotal.toLocaleString()}</p>
                        <button onClick={() => handleRemoveItem(item.id)} disabled={isItemLoading}
                          className="text-gray-500 hover:text-red-500 p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/50 transition">
                          {isItemLoading ? <span className="spinner" /> : <TrashIcon className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            
            <div className="lg:col-span-1">
              <div className="summary bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 sticky top-6">
                {cartItems.length === 0 ? (
                  <p className="text-center text-gray-600 dark:text-gray-300 text-lg">Aquí verás los importes de la renta de los productos<br /><span className="block text-sm text-gray-500 dark:text-gray-400 mt-1">Una vez que agregues productos, los detalles aparecerán en esta sección.</span></p>
                ) : (
                  <>
                    <h3 className="text-xl font-semibold mb-6 text-center">Resumen de Renta</h3>

                    <div className="space-y-4 text-sm">
                      <div className="flex justify-between text-gray-600 dark:text-gray-300">
                        <span>Subtotal ({selectedItems.length} {selectedItems.length === 1 ? 'producto' : 'productos'}):</span>
                        <span className="font-medium">${subtotalAproximado.toLocaleString()}</span>
                      </div>

                      <div className="space-y-3">
                        <label className="block text-sm font-medium">Día de renta:</label>
                        <input type="date" value={rentalDate} onChange={handleRentalDateChange} min={getTodayDate()}
                          className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800" />
                        <p className="text-xs text-yellow-600 dark:text-yellow-400">
                          Nota: Si hoy es domingo, no puedes seleccionar ese día. Si es viernes o sábado, puedes elegir domingo.
                        </p>
                      </div>

                      <div className="space-y-3">
                        <label className="block text-sm font-medium">Día de devolución:</label>
                        <input type="date" value={returnDate} onChange={handleReturnDateChange}
                          min={rentalDate ? getNextDay(rentalDate) : getTodayDate()} disabled={!rentalDate}
                          className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800" />
                      </div>

                      <button onClick={handleCotizar} disabled={selectedItems.length === 0}
                        className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-semibold py-3 rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition shadow-md disabled:opacity-50">
                        Cotizar
                      </button>

                      {totalCalculated !== null && (
                        <div className="mt-6 border-t pt-4 dark:border-gray-700">

                          <div class="my-4 p-3 bg-white dark:bg-gray-800 rounded-md shadow-sm border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 text-center text-sm transition-colors duration-200">
                            <div class="flex items-center justify-center gap-1 mb-0.5">
                              <svg class="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.953a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.953c.3.921-.755 1.688-1.538 1.118l-3.37-2.448a1 1 0 00-1.175 0L6.41 18.067c-.783.57-1.838-.197-1.538-1.118l1.287-3.953a1 1 0 00-.364-1.118L2.425 9.38c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.953z" />
                              </svg>
                              <span class="font-medium">¡Gana puntos con tu pedido!</span>
                            </div>
                            <p class="text-xs">
                              Obtén{' '}
                              <span class="text-xl font-bold text-blue-600 dark:text-blue-400">
                                {Math.floor(totalCalculated / 10)}
                              </span>{' '}
                              puntos
                            </p>
                            <p class="text-[0.65rem] text-gray-500 dark:text-gray-400 mt-0.5">
                              (10 puntos por cada $10 de renta)
                            </p>
                          </div>

                          <div className="space-y-3 text-sm">

                            
                            {(() => {
                          
                              let displayDays = 1;
                              if (rentalDate && returnDate) {
                                const start = new Date(rentalDate);
                                const end = new Date(returnDate);
                                displayDays = Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24)) || 1;
                              }
                              const rawSubtotalDisplay = subtotalAproximado * displayDays;
                              const discountAmountDisplay = rawSubtotalDisplay * nivelData.discount;
                              const netAfterDiscount = rawSubtotalDisplay - discountAmountDisplay;

                              const feeDisplay = totalCalculated - netAfterDiscount;

                              const showBreakdown = (netAfterDiscount >= 150) || (nivelData.name === 'Embajador de Fiesta');

                              return (
                                <>
                                 
                                  {nivelData.discount > 0 && showBreakdown && (
                                    <>
                                      <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-300">
                                          Subtotal (antes de descuentos):
                                        </span>
                                        <span className="font-medium text-gray-800 dark:text-gray-200 line-through">
                                          ${rawSubtotalDisplay.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </span>
                                      </div>

                                      <div className="flex justify-between text-green-600 dark:text-green-400 font-medium border-b border-dashed pb-2">
                                        <span>Descuento de Nivel ({(nivelData.discount * 100).toFixed(0)}%) :</span>
                                        <span>
                                          -${discountAmountDisplay.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </span>
                                      </div>
                                    </>
                                  )}

                               
                                  {!showBreakdown && rawSubtotalDisplay > 0 && (
                                    <div className="flex justify-between text-indigo-600 dark:text-indigo-400 text-xs italic mb-2">
                                      <span>* Tarifa mínima de servicio aplicada</span>
                                      <span>(Ajuste a ${MINIMUM_TOTAL})</span>
                                    </div>
                                  )}

                             
                                  {nivelData.discount > 0 && showBreakdown && (
                                    <div className="flex justify-between text-gray-500 dark:text-gray-400 text-sm mb-1">
                                      <span>Subtotal con descuento:</span>
                                      <span>${netAfterDiscount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                    </div>
                                  )}

                                  {showBreakdown && feeDisplay > 0 && (
                                    <div className="flex justify-between text-gray-500 dark:text-gray-400 text-sm border-b border-gray-200 dark:border-gray-700 pb-2 mb-2">
                                      <span className="flex items-center gap-1">
                                        Tarifa de servicio y gestión
                                       
                                      </span>
                                      <span>+${feeDisplay.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                    </div>
                                  )}
                               
                                  <div className="flex justify-between font-semibold">
                                    <span className="text-gray-800 dark:text-gray-200">
                                      Subtotal:
                                    </span>
                                    <span className="text-gray-900 dark:text-white">
                                    
                                      ${totalCalculated.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </span>
                                  </div>

                                  
                                  <div className="flex justify-between font-semibold text-lg border-t pt-4 dark:border-gray-700">
                                    <span className="text-gray-800 dark:text-gray-200">
                                      Total a pagar:
                                    </span>
                                    <span className="text-green-600 dark:text-green-400 text-xl">
                                      ${totalCalculated.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </span>
                                  </div>
                                </>
                              );
                            })()}

                            <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
                              ¡Paga con confianza! Precios con IVA incluido.
                            </p>
                          </div>

                        
                          <button
                            onClick={handleProceedToPayment}
                            className="w-full mt-6 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white text-xl font-bold py-4 rounded-xl shadow-xl transition transform hover:scale-105"
                          >
                            Proceder al pago
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="mt-8 text-center">
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">Métodos de pago:</p>
                      <div className="flex justify-center gap-4">
                        <img src="https://img.icons8.com/color/48/visa.png" alt="Visa" className="h-10" />
                        <img src="https://img.icons8.com/color/48/mastercard-logo.png" alt="Mastercard" className="h-10" />
                        <img src="https://img.icons8.com/color/48/amex.png" alt="Amex" className="h-10" />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>


          </div>

          <SeccionRecomendaciones productos={filteredRecomendaciones} onAgregar={addToCartt} addingProductId={addingProductId} />
        </div>
      )}
    </div>
  );


}

export default CarritoRentaSheinStyle;
