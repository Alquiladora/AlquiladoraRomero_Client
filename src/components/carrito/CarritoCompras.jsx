/* eslint-disable */
import React, { useState, useEffect } from "react";
import {
  TrashIcon,
  PlusIcon,
  MinusIcon,
  ColorSwatchIcon,
  CogIcon,
  ClockIcon,
} from "@heroicons/react/outline";
import { useSocket } from "../../utils/Socket";
import { useAuth } from "../../hooks/ContextAuth";
import api from "../../utils/AxiosConfig";
import { toast } from "react-toastify";
import { useCart } from "./ContextCarrito";
import DetallesPago from "./DetallesPago";
import { useRecomendaciones } from "./ContextRecomendaciones";
import { ShoppingCart } from "lucide-react";
import "./carrito.css";
import { Link } from "react-router-dom";


const SeccionRecomendaciones = ({ productos, onAgregar }) => {
  if (!productos || productos.length === 0) return null;
  

  return (
    <div className="w-full max-w-7xl mx-auto px-4 mt-16 animate-fadeIn">
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <h3 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100">
          Recomendaciones para ti
        </h3>
      </div>

      <div className="relative">
        <div className="flex gap-5 overflow-x-auto no-scrollbar pb-4 snap-x snap-mandatory scroll-smooth">
          {productos.map((prod) => (
            <Link
              key={prod.idProductoColores || prod.idProducto}
              to={`/cliente/${prod.nombreCategoria}/${prod.idProducto}`} // ← Asegúrate que este path exista
              className="flex-shrink-0 w-[250px] sm:w-[260px] bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 overflow-hidden snap-start"
            >
              <div className="relative overflow-hidden bg-gray-50 dark:bg-gray-700 h-40 sm:h-44">
                <img
                  src={
                    prod.imagenProducto ||
                    "https://via.placeholder.com/300x200?text=Sin+Imagen"
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
                    ? "Precio no disponible"
                    : `$${Number(prod.precioAlquiler).toFixed(2)}`}
                </p>

                {/* Botón dentro pero que NO propague el clic para evitar navegar */}
                <button
                  onClick={(e) => {
                    e.preventDefault(); // ← evitar que el clic en botón navegue
                    onAgregar(
                      prod.idProductoColores,
                      1,
                      prod.precioAlquiler
                    );
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-300 text-sm flex justify-center items-center gap-2 shadow-sm"
                >
                  <ShoppingCart size={14} />
                  Agregar
                </button>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-4 flex justify-end">
          <button className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition">
            Ver más productos →
          </button>
        </div>
      </div>
    </div>
  );
};




function CarritoRentaSheinStyle() {
  const socket = useSocket();
  const { user, csrfToken } = useAuth();
  const idUsuario = user?.idUsuarios || user?.id;
  const { removeFromCart: removeFromCartContext } = useCart();
  const [cartItems, setCartItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [rentalDate, setRentalDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [totalCalculated, setTotalCalculated] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [itemLoading, setItemLoading] = useState({});
  const [showDetallesPago, setShowDetallesPago] = useState(false);
  const allSelected = selectedItems.length === cartItems.length;
  const { recomendaciones, actualizarRecomendaciones } = useRecomendaciones();

  const MINIMUM_TOTAL = 150;
  const STRIPE_FEE_PERCENT = 0.041;
  const STRIPE_FEE_FIXED = 3;

  const getMexicoCityDate = () => {
    const date = new Date().toLocaleString("en-US", {
      timeZone: "America/Mexico_City",
    });
    return new Date(date); // Convierte a objeto Date para evitar problemas con el formato
  };

  const getTodayDate = () => {
    const today = new Date(getMexicoCityDate());
    return today.toISOString().split("T")[0]; // Asegura formato YYYY-MM-DD
  };

  const getMaxDate = (startDate) => {
    const maxDate = new Date(startDate);
    maxDate.setFullYear(maxDate.getFullYear() + 1);
    return maxDate.toISOString().split("T")[0];
  };

  const getNextDay = (date) => {
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);
    return nextDay.toISOString().split("T")[0];
  };

  const isSunday = (dateStr) => {
    const date = new Date(`${dateStr}T00:00:00-06:00`); // Ajuste para CST (UTC-6)
    console.log(`Fecha: ${dateStr}, Día: ${date.getUTCDay()}`);
    return date.getUTCDay() === 0; // Usamos getUTCDay para consistencia con UTC-6
  };

  const isTodaySunday = () => {
    const today = new Date(getMexicoCityDate());
    return today.getDay() === 0; // Verifica si hoy es domingo
  };

  useEffect(() => {
    if (idUsuario) {
      fetchCartItems();
    } else {
      setError("No se pudo identificar al usuario. Por favor, inicia sesión.");
    }
  }, [idUsuario,fetchCartItems]);

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

    socket.on("Agregalo Carrito", handleCartUpdate);
    socket.on("Inventario Actualizado", handleInventoryUpdate);

    return () => {
      socket.off("Agregalo Carrito", handleCartUpdate);
      socket.off("Inventario Actualizado", handleInventoryUpdate);
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

  const fetchCartItems = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get(`/api/carrito/carrito/${idUsuario}`, {
        withCredentials: true,
        headers: {
          "X-CSRF-Token": csrfToken,
          "Content-Type": "application/json",
        },
      });

      if (!response.data.success) {
        throw new Error(response.data.message || "Error al obtener el carrito");
      }

      const mappedItems = response.data.carrito.map((item) => ({
        id: item.idCarrito,
        nombre: item.nombreProducto,
        imagen:
          item.imagenProducto || "https://via.placeholder.com/80?text=Producto",
        precioPorDia: parseFloat(item.precioProducto),
        cantidad: item.cantidad,
        disponible: item.stockDisponible > 0,
        stockDisponible: item.stockDisponible || 0,
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
      console.error("Error fetching cart items:", err);
      setError("No se pudo cargar el carrito. Intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  const addToCart = async (idProductoColor, cantidad, precioAlquiler) => {


    console.log("Datos recibidso",idProductoColor, cantidad, precioAlquiler )
    if (!idUsuario) {
      toast.error(
        "Por favor, inicia sesión para agregar productos al carrito."
      );
      return;
    }

    try {
      const response = await api.post(
        "/api/carrito/agregar",
        { idUsuario, idProductoColor, cantidad, precioAlquiler },
        {
          withCredentials: true,
          headers: {
            "X-CSRF-Token": csrfToken,
            "Content-Type": "application/json",
          },
        }
      );
       actualizarRecomendaciones(response.data.recomendaciones);

      if (!response.data.success) {
        throw new Error(
          response.data.message || "No se pudo agregar el producto al carrito"
        );
      }

      toast.success("Producto agregado al carrito correctamente");
      fetchCartItems();
    } catch (err) {
      console.error("Error adding item to cart:", err);
      toast.error(
        err.message ||
          "No se pudo agregar el producto al carrito. Intenta de nuevo."
      );
    }
  };

  const removeFromCart = async (idCarrito) => {
    setItemLoading((prev) => ({ ...prev, [idCarrito]: true }));
    const idUser = user?.id || user?.idUsuarios;
    try {
      const response = await api.delete(`/api/carrito/eliminar/${idCarrito}`, {
        withCredentials: true,
        headers: {
          "X-CSRF-Token": csrfToken,
          "Content-Type": "application/json",
        },
        data: { idUsuario: idUser },
      });
       actualizarRecomendaciones(response.data.recomendaciones);

      if (!response.data.success) {
        throw new Error(
          response.data.message || "No se pudo eliminar el producto del carrito"
        );
      }

      setCartItems((prev) => prev.filter((item) => item.id !== idCarrito));
      setSelectedItems((prev) => prev.filter((id) => id !== idCarrito));
      toast.success("Producto eliminado del carrito correctamente");
      await removeFromCartContext();

      if (totalCalculated !== null && rentalDate && returnDate) {
        const start = new Date(rentalDate);
        const end = new Date(returnDate);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;

        const updatedCartItems = cartItems.filter(
          (item) => item.id !== idCarrito
        );
        const total = updatedCartItems.reduce((acc, item) => {
          if (selectedItems.includes(item.id)) {
            return acc + item.precioPorDia * item.cantidad * diffDays;
          }
          return acc;
        }, 0);

        setTotalCalculated(total);
      }
    } catch (err) {
      console.error("Error removing item from cart:", err);
      toast.error(
        err.message ||
          "No se pudo eliminar el producto del carrito. Intenta de nuevo."
      );
      fetchCartItems();
    } finally {
      setItemLoading((prev) => ({ ...prev, [idCarrito]: false }));
    }
  };

  const updateQuantity = async (idCarrito, newCantidad) => {
    if (newCantidad <= 0) {
      toast.error("La cantidad debe ser al menos 1.");
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
            "X-CSRF-Token": csrfToken,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.data.success) {
        throw new Error(
          response.data.message || "No se pudo actualizar la cantidad"
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

      const updatedItem = cartItems.find((item) => item.id === idCarrito);
      if (updatedItem && newCantidad <= updatedItem.stockDisponible) {
        setSelectedItems((prev) => {
          if (!prev.includes(idCarrito)) {
            return [...prev, idCarrito];
          }
          return prev;
        });
      }

      if (totalCalculated !== null && rentalDate && returnDate) {
        const start = new Date(rentalDate);
        const end = new Date(returnDate);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;

        const updatedCartItems = cartItems.map((item) =>
          item.id === idCarrito ? { ...item, cantidad: newCantidad } : item
        );
        const total = updatedCartItems.reduce((acc, item) => {
          if (selectedItems.includes(item.id)) {
            return acc + item.precioPorDia * item.cantidad * diffDays;
          }
          return acc;
        }, 0);

        setTotalCalculated(total);
      }
    } catch (err) {
      console.error("Error updating quantity:", err);
      toast.error(
        err.message || "No se pudo actualizar la cantidad. Intenta de nuevo."
      );
      fetchCartItems();
    } finally {
      setItemLoading((prev) => ({ ...prev, [idCarrito]: false }));
    }
  };

  const handleToggleItem = (id) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );

    if (totalCalculated !== null && rentalDate && returnDate) {
      const start = new Date(rentalDate);
      const end = new Date(returnDate);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;

      const newSelectedItems = selectedItems.includes(id)
        ? selectedItems.filter((itemId) => itemId !== id)
        : [...selectedItems, id];

      const total = cartItems.reduce((acc, item) => {
        if (newSelectedItems.includes(item.id)) {
          return acc + item.precioPorDia * item.cantidad * diffDays;
        }
        return acc;
      }, 0);

      setTotalCalculated(total);
    }
  };

  const handleToggleAll = () => {
    if (allSelected) {
      setSelectedItems([]);

      if (totalCalculated !== null && rentalDate && returnDate) {
        setTotalCalculated(0);
      }
    } else {
      const newSelectedItems = cartItems
        .filter(
          (item) =>
            item.stockDisponible > 0 && item.cantidad <= item.stockDisponible
        )
        .map((item) => item.id);
      setSelectedItems(newSelectedItems);

      if (totalCalculated !== null && rentalDate && returnDate) {
        const start = new Date(rentalDate);
        const end = new Date(returnDate);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;

        const total = cartItems.reduce((acc, item) => {
          if (newSelectedItems.includes(item.id)) {
            return acc + item.precioPorDia * item.cantidad * diffDays;
          }
          return acc;
        }, 0);

        setTotalCalculated(total);
      }
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

  const calculateTotalToPay = (subtotal) => {
    const adjustedSubtotal =
      subtotal < MINIMUM_TOTAL ? MINIMUM_TOTAL : subtotal;
    const stripeFee = adjustedSubtotal * STRIPE_FEE_PERCENT + STRIPE_FEE_FIXED;
    const total = adjustedSubtotal + stripeFee;
    return { subtotal: adjustedSubtotal, stripeFee, total };
  };

  const handleCotizar = () => {
    if (!rentalDate || !returnDate) {
      toast.error("Por favor selecciona las fechas de renta y devolución.");
      return;
    }

    if (isTodaySunday() && isSunday(rentalDate)) {
      toast.error(
        "Los domingos no trabajamos. Por favor, selecciona otro día para la renta."
      );
      return;
    }

    const start = new Date(rentalDate);
    const end = new Date(returnDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;

    const total = cartItems.reduce((acc, item) => {
      if (selectedItems.includes(item.id)) {
        return acc + item.precioPorDia * item.cantidad * diffDays;
      }
      return acc;
    }, 0);

    setTotalCalculated(total);
    toast.success("Cotización realizada correctamente");
  };

  const getRemainingTime = (fechaAgregado) => {
    const fechaAgregadoDate = new Date(fechaAgregado);
    const expirationDate = new Date(fechaAgregadoDate);
    expirationDate.setFullYear(fechaAgregadoDate.getFullYear() + 1);

    const currentDate = new Date(getMexicoCityDate());
    const diffTime = expirationDate - currentDate;

    if (diffTime <= 0) return { timeString: "Expirado", showTimer: false };

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
        "Los domingos no trabajamos. Por favor, selecciona otro día."
      );
      setRentalDate(""); 
      return;
    }

    setRentalDate(newRentalDate);

    if (returnDate && new Date(newRentalDate) >= new Date(returnDate)) {
      setReturnDate("");
      toast.warn(
        "La fecha de devolución ha sido reseteada porque debe ser posterior a la fecha de renta."
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
      toast.error("Por favor selecciona primero la fecha de renta.");
      setReturnDate("");
      return;
    }

    if (returnDateObj <= rentalDateObj) {
      toast.error(
        "La fecha de devolución debe ser posterior a la fecha de renta."
      );
      setReturnDate("");
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
        "Por favor, selecciona al menos un producto para proceder al pago."
      );
      return;
    }
    if (!rentalDate || !returnDate) {
      toast.error("Por favor, selecciona las fechas de renta y devolución.");
      return;
    }
    if (isTodaySunday() && isSunday(rentalDate)) {
      toast.error(
        "Los domingos no trabajamos. Por favor, selecciona otro día para la renta."
      );
      return;
    }
    if (totalCalculated === null) {
      toast.error(
        "Por favor, realiza la cotización antes de proceder al pago."
      );
      return;
    }
    setShowDetallesPago(true);
  };

  const handleBackToCart = () => {
    setShowDetallesPago(false);
  };

  const { subtotal, stripeFee, total } =
    totalCalculated !== null
      ? calculateTotalToPay(totalCalculated)
      : { subtotal: 0, stripeFee: 0, total: 0 };


  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 text-gray-900 dark:text-gray-100">
      <style>{`
        @keyframes fadeIn {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .spinner {
          display: inline-block;
          width: 1.25rem;
          height: 1.25rem;
          border: 2px solid #d1d5db;
          border-top: 2px solid #4b5563;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
        @keyframes slideIn {
          0% { opacity: 0; transform: translateX(20px); }
          100% { opacity: 1; transform: translateX(0); }
        }
        .animate-slideIn {
          animation: slideIn 0.5s ease-out forwards;
        }
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
        .animate-pulse {
          animation: pulse 1.5s infinite;
        }
        .bubble {
          display: inline-flex;
          align-items: center;
          background: linear-gradient(90deg, #e0f7fa, #bae6fd);
          color: #1e88e5;
          padding: 6px 14px;
          border-radius: 9999px;
          font-size: 0.875rem;
          font-weight: 500;
          margin-right: 8px;
          transition: background-color 0.3s ease;
        }
        .bubble:hover {
          background: linear-gradient(90deg, #bae6fd, #93c5fd);
        }
        @keyframes glowBlink {
          0% { opacity: 1; box-shadow: 0 0 10px rgba(239, 68, 68, 0.5); }
          50% { opacity: 0.7; box-shadow: 0 0 15px rgba(239, 68, 68, 0.8); }
          100% { opacity: 1; box-shadow: 0 0 10px rgba(239, 68, 68, 0.5); }
        }
        .timer {
          display: inline-flex;
          align-items: center;
          background: linear-gradient(90deg, #ef4444, #f87171);
          color: #ffffff;
          padding: 8px 16px;
          border-radius: 9999px;
          font-size: 0.875rem;
          font-weight: 600;
          animation: glowBlink 3s ease-in-out infinite;
          margin-bottom: 8px;
        }
        .timer.dark {
          background: linear-gradient(90deg, #b91c1c, #dc2626);
          color: #fee2e2;
        }
        .out-of-stock {
          background: linear-gradient(90deg, #fee2e2, #fecaca);
          color: #b91c1c;
          padding: 6px 14px;
          border-radius: 9999px;
          font-size: 0.875rem;
          font-weight: 500;
          margin-bottom: 8px;
          display: inline-flex;
          align-items: center;
        }
        .out-of-stock.dark {
          background: linear-gradient(90deg, #7f1d1d, #991b1b);
          color: #fee2e2;
        }
        @media (max-width: 640px) {
          .cart-item {
            flex-direction: column;
            text-align: center;
            gap: 1rem;
          }
          .cart-item img {
            margin: 0 auto;
          }
          .quantity-controls {
            justify-content: center;
          }
          .summary {
            position: static;
            margin-top: 1.5rem;
          }
        }
      `}</style>

      {showDetallesPago ? (
        <DetallesPago
          cartItems={cartItems.filter((item) =>
            selectedItems.includes(item.id)
          )}
          total={total}
          rentalDate={rentalDate}
          returnDate={returnDate}
          onBack={handleBackToCart}
        />
      ) : (
        <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
            <h2 className="text-3xl font-extrabold text-gray-800 animate-fadeIn dark:text-gray-100">
              Carrito de Renta ({cartItems.length})
            </h2>
            <div className="flex items-center space-x-3 mt-4 sm:mt-0">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={handleToggleAll}
                className="h-5 w-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500 transition-all dark:border-gray-600"
                disabled={cartItems.length === 0}
              />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Seleccionar todo
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {isLoading ? (
                <div className="bg-white rounded-2xl shadow-lg p-8 text-center dark:bg-gray-800">
                  <p className="text-gray-500 dark:text-gray-400 text-lg">
                    Cargando carrito...
                  </p>
                </div>
              ) : error ? (
                <div className="bg-white rounded-2xl shadow-lg p-8 text-center dark:bg-gray-800">
                  <p className="text-red-500 dark:text-red-400 text-lg">
                    {error}
                  </p>
                  {idUsuario && (
                    <button
                      onClick={fetchCartItems}
                      className="mt-6 inline-block bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-6 py-3 rounded-lg hover:from-indigo-700 hover:to-indigo-800 transition-all duration-300 shadow-md"
                    >
                      Reintentar
                    </button>
                  )}
                  {!idUsuario && (
                    <a
                      href="/login"
                      className="mt-6 inline-block bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-6 py-3 rounded-lg hover:from-indigo-700 hover:to-indigo-800 transition-all duration-300 shadow-md"
                    >
                      Iniciar sesión
                    </a>
                  )}
                </div>
              ) : cartItems.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-lg p-8 text-center dark:bg-gray-800">
                  <p className="text-gray-500 dark:text-gray-400 text-lg">
                    Tu carrito está vacío.
                  </p>
                  <a
                    href="/cliente"
                    className="mt-6 inline-block bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-6 py-3 rounded-lg hover:from-indigo-700 hover:to-indigo-800 transition-all duration-300 shadow-md"
                  >
                    Explorar productos
                  </a>
                </div>
              ) : (
                cartItems.map((item, index) => {
                  const isChecked = selectedItems.includes(item.id);
                  const subtotal = calcularSubtotal(item);
                  const isOutOfStock = item.stockDisponible === 0;
                  const isOverStock =
                    item.cantidad > item.stockDisponible &&
                    item.stockDisponible > 0;
                  const canIncrease =
                    !isOutOfStock &&
                    !isOverStock &&
                    item.cantidad < item.stockDisponible;
                  const canDecrease = item.cantidad > 1;
                  const canSelect = !isOutOfStock && !isOverStock;
                  const isItemLoading = itemLoading[item.id] || false;
                  const remainingTime =
                    item.remainingTime || getRemainingTime(item.fechaAgregado);

                  return (
                    <div
                      key={item.id}
                      className={`cart-item bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 sm:p-6 flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 transform transition-all hover:shadow-xl animate-fadeIn border ${
                        isOutOfStock || isOverStock
                          ? "border-red-200 dark:border-red-800 opacity-80"
                          : "border-gray-100 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600"
                      }`}
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleItem(item.id)}
                        className="h-5 w-5 text-indigo-600 rounded border-gray-300 dark:border-gray-600 focus:ring-indigo-500 transition-all"
                        disabled={!canSelect}
                      />

                      <div className="relative">
                        <img
                          src={item.imagen}
                          alt={item.nombre}
                          className={`w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-600 transition-transform transform hover:scale-105 ${
                            isOutOfStock || isOverStock ? "opacity-60" : ""
                          }`}
                        />
                      </div>

                      <div className="flex-1 space-y-3">
                        {isOutOfStock ? (
                          <span className="out-of-stock dark:out-of-stock-dark text-sm">
                            Producto sin stock
                          </span>
                        ) : isOverStock ? (
                          <span className="out-of-stock dark:out-of-stock-dark text-sm">
                            La cantidad es mayor a la disponible. Por favor,
                            disminuye la cantidad.
                          </span>
                        ) : null}
                        {remainingTime.showTimer &&
                          !isOutOfStock &&
                          !isOverStock && (
                            <span className="timer dark:timer-dark text-sm">
                              <ClockIcon className="h-5 w-5 mr-2" />
                              Tiempo restante: {remainingTime.timeString}
                            </span>
                          )}
                        <p
                          className={`font-semibold text-lg sm:text-xl md:text-2xl text-gray-900 dark:text-gray-100 transition-colors ${
                            isOutOfStock || isOverStock
                              ? "text-gray-500 dark:text-gray-400"
                              : "hover:text-indigo-600 dark:hover:text-indigo-400"
                          }`}
                        >
                          {item.nombre}
                        </p>

                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`bubble text-sm ${
                              isOutOfStock || isOverStock
                                ? "bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
                                : ""
                            }`}
                          >
                            <ColorSwatchIcon className="h-4 w-4 mr-1" />
                            Color: {item.color}
                          </span>
                          <span
                            className={`bubble text-sm ${
                              isOutOfStock || isOverStock
                                ? "bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
                                : ""
                            }`}
                          >
                            <CogIcon className="h-4 w-4 mr-1" />
                            Material: {item.material}
                          </span>
                        </div>

                        <p
                          className={`text-sm ${
                            isOutOfStock || isOverStock
                              ? "text-gray-500 dark:text-gray-400"
                              : "text-gray-600 dark:text-gray-400"
                          }`}
                        >
                          <span className="font-medium">Detalles:</span>{" "}
                          {item.detalles}
                        </p>

                        <p
                          className={`text-sm ${
                            isOutOfStock || isOverStock
                              ? "text-gray-500 dark:text-gray-400"
                              : "text-gray-600 dark:text-gray-400"
                          }`}
                        >
                          <span className="font-medium">Precio por día:</span>{" "}
                          <span
                            className={`font-semibold ${
                              isOutOfStock || isOverStock
                                ? "text-gray-500 dark:text-gray-400"
                                : "text-indigo-600 dark:text-indigo-400"
                            }`}
                          >
                            ${item.precioPorDia.toLocaleString()}
                          </span>
                        </p>

                        <div className="quantity-controls flex items-center space-x-3 mt-3 justify-center sm:justify-start">
                          <button
                            onClick={() =>
                              handleChangeQuantity(item.id, item.cantidad - 1)
                            }
                            className={`p-2 rounded-full transition-all duration-200 ${
                              canDecrease && !isItemLoading
                                ? "bg-gradient-to-r from-indigo-100 to-indigo-200 text-indigo-600 hover:from-indigo-200 hover:to-indigo-300 dark:from-indigo-700 dark:to-indigo-800 dark:text-indigo-200 dark:hover:from-indigo-600 dark:hover:to-indigo-700"
                                : "bg-gray-200 text-gray-400 dark:bg-gray-600 dark:text-gray-500 cursor-not-allowed"
                            }`}
                            aria-label="Reducir cantidad"
                            disabled={!canDecrease || isItemLoading}
                          >
                            {isItemLoading ? (
                              <span className="spinner" />
                            ) : (
                              <MinusIcon className="h-5 w-5" />
                            )}
                          </button>
                          <span
                            className={`px-4 py-1 rounded-full font-medium text-sm ${
                              isOutOfStock || isOverStock
                                ? "bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
                                : "bg-indigo-50 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200"
                            }`}
                          >
                            {item.cantidad} unidades
                          </span>
                          <button
                            onClick={() =>
                              handleChangeQuantity(item.id, item.cantidad + 1)
                            }
                            className={`p-2 rounded-full transition-all duration-200 ${
                              canIncrease && !isItemLoading
                                ? "bg-gradient-to-r from-indigo-100 to-indigo-200 text-indigo-600 hover:from-indigo-200 hover:to-indigo-300 dark:from-indigo-700 dark:to-indigo-800 dark:text-indigo-200 dark:hover:from-indigo-600 dark:hover:to-indigo-700"
                                : "bg-gray-200 text-gray-400 dark:bg-gray-600 dark:text-gray-500 cursor-not-allowed"
                            }`}
                            aria-label="Aumentar cantidad"
                            disabled={!canIncrease || isItemLoading}
                          >
                            {isItemLoading ? (
                              <span className="spinner" />
                            ) : (
                              <PlusIcon className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="text-center sm:text-right space-y-2">
                        <p
                          className={`text-lg sm:text-xl md:text-2xl font-bold ${
                            isOutOfStock || isOverStock
                              ? "text-gray-500 dark:text-gray-400"
                              : "text-gray-900 dark:text-gray-100"
                          }`}
                        >
                          ${subtotal.toLocaleString()}
                        </p>
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-all duration-200 p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/50"
                          aria-label="Eliminar producto del carrito"
                          disabled={isItemLoading}
                        >
                          {isItemLoading ? (
                            <span className="spinner" />
                          ) : (
                            <TrashIcon className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="summary bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg self-start sticky top-6 animate-slideIn border border-gray-100 dark:border-gray-700">
              {cartItems.length === 0 ? (
                <div className="text-center">
                  <p className="text-gray-600 mt-4 text-lg font-medium leading-relaxed dark:text-gray-300">
                    Aquí verás los importes de la renta de los productos
                    <span className="block text-gray-500 text-sm font-normal mt-1 dark:text-gray-400">
                      Una vez que agregues productos, los detalles aparecerán en
                      esta sección.
                    </span>
                  </p>
                </div>
              ) : (
                <>
                  <h3 className="text-xl font-semibold mb-6 text-gray-800 dark:text-gray-200">
                    Resumen de Renta
                  </h3>
                  <div className="space-y-6 text-sm">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-300">
                          Subtotal ({selectedItems.length} productos):
                        </span>
                        <span className="font-medium text-gray-800 dark:text-gray-200">
                          ${subtotalAproximado.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Día de renta:
                      </label>
                      <input
                        type="date"
                        value={rentalDate}
                        onChange={handleRentalDateChange}
                        min={getTodayDate()}
                        max={getMaxDate(new Date(getMexicoCityDate()))}
                        className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 dark:bg-gray-800 dark:text-gray-300"
                        aria-label="Seleccionar día de renta"
                      />
                      <p className="text-sm text-yellow-600 dark:text-yellow-400">
                        Nota: Si hoy es domingo, no puedes seleccionar ese día.
                        Si es viernes o sábado, puedes elegir domingo.
                      </p>
                    </div>
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Día de devolución:
                      </label>
                      <input
                        type="date"
                        value={returnDate}
                        onChange={handleReturnDateChange}
                        min={
                          rentalDate ? getNextDay(rentalDate) : getTodayDate()
                        }
                        max={
                          rentalDate
                            ? getMaxDate(rentalDate)
                            : getMaxDate(new Date(getMexicoCityDate()))
                        }
                        className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 dark:bg-gray-800 dark:text-gray-300"
                        aria-label="Seleccionar día de devolución"
                        disabled={!rentalDate}
                      />
                    </div>

                    <button
                      onClick={handleCotizar}
                      className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-semibold py-3 rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-all duration-300 shadow-md animate-pulse dark:from-yellow-600 dark:to-yellow-700 dark:hover:from-yellow-500 dark:hover:to-yellow-600"
                      disabled={selectedItems.length === 0}
                    >
                      Cotizar
                    </button>

                    {totalCalculated !== null && (
                      <div className="mt-6 border-t pt-4 dark:border-gray-700">
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-300">
                              Subtotal Calculado:
                            </span>
                            <span className="font-medium text-gray-800 dark:text-gray-200">
                              ${subtotal.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-300">
                              Iva:
                            </span>
                            <span className="font-medium text-gray-800 dark:text-gray-200">
                              ${stripeFee.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between font-semibold text-lg border-t pt-4 dark:border-gray-700">
                            <span className="text-gray-800 dark:text-gray-200">
                              Total a Pagar:
                            </span>
                            <span className="text-green-600 dark:text-green-400 text-xl">
                              ${total.toLocaleString()}
                            </span>
                          </div>
                        </div>
                        <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                          {subtotalAproximado < MINIMUM_TOTAL && (
                            <p>
                              El subtotal ha sido ajustado a $
                              {MINIMUM_TOTAL.toLocaleString()} porque no superó
                              el mínimo requerido.
                            </p>
                          )}
                          <p className="text-indigo-600 dark:text-indigo-400 font-medium">
                            ¡Paga con confianza! Iva incluida.
                          </p>
                        </div>
                      </div>
                    )}

                    {totalCalculated !== null && (
                      <button
                        onClick={handleProceedToPayment}
                        className="w-full mt-6 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-semibold py-3 rounded-lg hover:from-indigo-700 hover:to-indigo-800 transition-all duration-300 shadow-md"
                      >
                        Proceder al pago
                      </button>
                    )}
                  </div>
                  <div className="mt-8">
                    <p className="text-sm text-gray-600 mb-4 dark:text-gray-300 text-center">
                      Métodos de pago:
                    </p>
                    <div className="flex space-x-6 justify-center items-center">
                      <img
                        src="https://img.icons8.com/color/48/visa.png"
                        alt="Visa"
                        title="Visa"
                        className="h-12 object-contain transition-transform transform hover:scale-110"
                      />
                      <img
                        src="https://img.icons8.com/color/48/mastercard-logo.png"
                        alt="Mastercard"
                        title="Mastercard"
                        className="h-12 object-contain transition-transform transform hover:scale-110"
                      />
                      <img
                        src="https://img.icons8.com/color/48/amex.png"
                        alt="American Express"
                        title="American Express"
                        className="h-12 object-contain transition-transform transform hover:scale-110"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. RENDERIZA AQUÍ EL COMPONENTE DE RECOMENDACIONES */}
      <SeccionRecomendaciones
        productos={recomendaciones}
        onAgregar={addToCart}
      />
    </div>
  );
}

export default CarritoRentaSheinStyle;
