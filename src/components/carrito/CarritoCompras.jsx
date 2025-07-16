import React, { useState, useEffect } from "react";
import {
  CheckIcon,
  TrashIcon,
  PlusIcon,
  MinusIcon,
  PaintBrushIcon,
  WrenchScrewdriverIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { useSocket } from "../../utils/Socket";
import { useAuth } from "../../hooks/ContextAuth";
import api from "../../utils/AxiosConfig";
import { toast } from "react-toastify";
import { useCart } from "./ContextCarrito";
import DetallesPago from "./DetallesPago";

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

  const MINIMUM_TOTAL = 150; // Mínimo para evitar ajuste
  const STRIPE_FEE_PERCENT = 0.036; // 3.6% comisión de Stripe
  const STRIPE_FEE_FIXED = 3; // $3 MXN fijo por transacción

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
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

  useEffect(() => {
    if (idUsuario) {
      fetchCartItems();
    } else {
      setError("No se pudo identificar al usuario. Por favor, inicia sesión.");
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
              (newStockDisponible === 0 || item.cantidad > newStockDisponible) &&
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
          .filter((item) => item.stockDisponible > 0 && item.cantidad <= item.stockDisponible)
          .map((item) => item.id)
      );
      console.log("Mapeamos intems de carrito ", mappedItems);
    } catch (err) {
      console.error("Error fetching cart items:", err);
      setError("No se pudo cargar el carrito. Intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  const addToCart = async (idProductoColor, cantidad, precioAlquiler) => {
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

        const updatedCartItems = cartItems.filter((item) => item.id !== idCarrito);
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
        .filter((item) => item.stockDisponible > 0 && item.cantidad <= item.stockDisponible)
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
    const adjustedSubtotal = subtotal < MINIMUM_TOTAL ? MINIMUM_TOTAL : subtotal;
    const stripeFee = adjustedSubtotal * STRIPE_FEE_PERCENT + STRIPE_FEE_FIXED;
    const total = adjustedSubtotal + stripeFee;
    return { subtotal: adjustedSubtotal, stripeFee, total };
  };

  const handleCotizar = () => {
    if (!rentalDate || !returnDate) {
      toast.error("Por favor selecciona las fechas de renta y devolución.");
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

    const currentDate = new Date();
    const diffTime = expirationDate - currentDate;

    if (diffTime <= 0) return { timeString: "Expirado", showTimer: false };

    const days = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));
    const timeString = `${days}d ${hours}h ${minutes}m`;
    const showTimer = days <= 2;

    return { timeString, showTimer };
  };

  const handleRentalDateChange = (e) => {
    const newRentalDate = e.target.value;
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
      toast.error("Por favor, selecciona al menos un producto para proceder al pago.");
      return;
    }
    if (!rentalDate || !returnDate) {
      toast.error("Por favor, selecciona las fechas de renta y devolución.");
      return;
    }
    if (totalCalculated === null) {
      toast.error("Por favor, realiza la cotización antes de proceder al pago.");
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
    <div className="min-h-screen bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
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
          border: 2px solid #ccc;
          border-top: 2px solid #666;
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
          background-color: #e0f7fa;
          color: #1e88e5;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.875rem;
          font-weight: 500;
          margin-right: 8px;
        }
        @keyframes glowBlink {
          0% { opacity: 1; box-shadow: 0 0 10px rgba(239, 68, 68, 0.5); }
          50% { opacity: 0.5; box-shadow: 0 0 20px rgba(239, 68, 68, 0.8); }
          100% { opacity: 1; box-shadow: 0 0 10px rgba(239, 68, 68, 0.5); }
        }
        .timer {
          display: inline-flex;
          align-items: center;
          background: linear-gradient(90deg, #ef4444, #f87171);
          color: #ffffff;
          padding: 6px 14px;
          border-radius: 20px;
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
          background-color: #fee2e2;
          color: #b91c1c;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.875rem;
          font-weight: 500;
          margin-bottom: 8px;
          display: inline-flex;
          align-items: center;
        }
        .out-of-stock.dark {
          background-color: #7f1d1d;
          color: #fee2e2;
        }
        @media (max-width: 640px) {
          .cart-item {
            flex-direction: column;
            text-align: center;
          }
          .cart-item img {
            margin: 0 auto;
          }
          .quantity-controls {
            justify-content: center;
          }
          .summary {
            position: static;
          }
        }
      `}</style>

      {showDetallesPago ? (
        <DetallesPago
          cartItems={cartItems.filter((item) => selectedItems.includes(item.id))}
          total={total}
          rentalDate={rentalDate}
          returnDate={returnDate}
          onBack={handleBackToCart}
        />
      ) : (
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 animate-fadeIn dark:text-gray-200">
              Carrito de Renta ({cartItems.length})
            </h2>
            <div className="flex items-center space-x-2 mt-2 sm:mt-0">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={handleToggleAll}
                className="h-5 w-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                disabled={cartItems.length === 0}
              />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Seleccionar todo
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {isLoading ? (
                <div className="bg-white rounded-lg shadow-sm p-6 text-center dark:bg-gray-800">
                  <p className="text-gray-500 dark:text-gray-400">
                    Cargando carrito...
                  </p>
                </div>
              ) : error ? (
                <div className="bg-white rounded-lg shadow-sm p-6 text-center dark:bg-gray-800">
                  <p className="text-red-500 dark:text-red-400">{error}</p>
                  {idUsuario && (
                    <button
                      onClick={fetchCartItems}
                      className="mt-4 inline-block bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-all dark:bg-indigo-700 dark:hover:bg-indigo-800"
                    >
                      Reintentar
                    </button>
                  )}
                  {!idUsuario && (
                    <a
                      href="/login"
                      className="mt-4 inline-block bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-all dark:bg-indigo-700 dark:hover:bg-indigo-800"
                    >
                      Iniciar sesión
                    </a>
                  )}
                </div>
              ) : cartItems.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm p-6 text-center dark:bg-gray-800">
                  <p className="text-gray-500 dark:text-gray-400">
                    Tu carrito está vacío.
                  </p>
                  <a
                    href="/cliente"
                    className="mt-4 inline-block bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-all dark:bg-indigo-700 dark:hover:bg-indigo-800"
                  >
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
                  const remainingTime =
                    item.remainingTime || getRemainingTime(item.fechaAgregado);

                  return (
                    <div
                      key={item.id}
                      className={`cart-item bg-white dark:bg-gray-800 rounded-xl shadow-sm p-2 sm:p-6 flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4 sm:space-x-6 transform transition-all hover:shadow-lg animate-fadeIn border ${
                        (isOutOfStock || isOverStock)
                          ? "border-red-200 dark:border-red-800 opacity-75"
                          : "border-gray-100 dark:border-gray-700 hover:border-indigo-200 dark:hover:border-indigo-500"
                      }`}
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleItem(item.id)}
                        className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-600 rounded border-gray-300 dark:border-gray-600 focus:ring-indigo-500 transition-all"
                        disabled={!canSelect}
                      />

                      <div className="relative">
                        <img
                          src={item.imagen}
                          alt={item.nombre}
                          className={`w-16 h-16 sm:w-20 sm:h-20 md:w-28 md:h-28 object-cover rounded-lg border border-gray-200 dark:border-gray-600 transition-transform transform hover:scale-105 ${
                            (isOutOfStock || isOverStock) ? "opacity-50" : ""
                          }`}
                        />
                      </div>

                      <div className="flex-1 space-y-1 sm:space-y-2">
                        {isOutOfStock ? (
                          <span className="out-of-stock dark:out-of-stock-dark text-xs sm:text-sm">
                            Producto sin stock
                          </span>
                        ) : isOverStock ? (
                          <span className="out-of-stock dark:out-of-stock-dark text-xs sm:text-sm">
                            La cantidad es mayor a la disponible. Por favor, disminuye la cantidad.
                          </span>
                        ) : null}
                        {remainingTime.showTimer && !isOutOfStock && !isOverStock && (
                          <span className="timer dark:timer-dark text-xs sm:text-sm">
                            <ClockIcon className="h-4 w-4 mr-2" />
                            Tiempo restante: {remainingTime.timeString}
                          </span>
                        )}
                        <p
                          className={`font-semibold text-base sm:text-lg md:text-xl text-gray-900 dark:text-gray-100 transition-colors ${
                            (isOutOfStock || isOverStock)
                              ? "text-gray-500 dark:text-gray-400"
                              : "hover:text-indigo-600 dark:hover:text-indigo-400"
                          }`}
                        >
                          {item.nombre}
                        </p>

                        <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                          <span
                            className={`bubble text-xs sm:text-sm ${
                              (isOutOfStock || isOverStock)
                                ? "bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
                                : "bg-indigo-50 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200 hover:bg-indigo-100 dark:hover:bg-indigo-800 transition-colors"
                            }`}
                          >
                            <PaintBrushIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                            Color: {item.color}
                          </span>
                          <span
                            className={`bubble text-xs sm:text-sm ${
                              (isOutOfStock || isOverStock)
                                ? "bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
                                : "bg-indigo-50 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200 hover:bg-indigo-100 dark:hover:bg-indigo-800 transition-colors"
                            }`}
                          >
                            <WrenchScrewdriverIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                            Material: {item.material}
                          </span>
                        </div>

                        <p
                          className={`text-xs sm:text-sm ${
                            (isOutOfStock || isOverStock)
                              ? "text-gray-500 dark:text-gray-400"
                              : "text-gray-600 dark:text-gray-400"
                          }`}
                        >
                          <span className="font-medium">Detalles:</span>{" "}
                          {item.detalles}
                        </p>

                        <p
                          className={`text-xs sm:text-sm ${
                            (isOutOfStock || isOverStock)
                              ? "text-gray-500 dark:text-gray-400"
                              : "text-gray-600 dark:text-gray-400"
                          }`}
                        >
                          <span className="font-medium">Precio por día:</span>{" "}
                          <span
                            className={`font-semibold ${
                              (isOutOfStock || isOverStock)
                                ? "text-gray-500 dark:text-gray-400"
                                : "text-indigo-600 dark:text-indigo-400"
                            }`}
                          >
                            ${item.precioPorDia.toLocaleString()}
                          </span>
                        </p>

                        <div className="quantity-controls flex items-center space-x-2 sm:space-x-3 mt-2 sm:mt-3 justify-center sm:justify-start">
                          <button
                            onClick={() =>
                              handleChangeQuantity(item.id, item.cantidad - 1)
                            }
                            className={`p-1 sm:p-2 rounded-full transition-all ${
                              canDecrease && !isItemLoading
                                ? "bg-indigo-100 text-indigo-600 hover:bg-indigo-200 dark:bg-indigo-700 dark:text-indigo-200 dark:hover:bg-indigo-600"
                                : "bg-gray-200 text-gray-400 dark:bg-gray-600 dark:text-gray-500 cursor-not-allowed"
                            }`}
                            aria-label="Reducir cantidad"
                            disabled={!canDecrease || isItemLoading}
                          >
                            {isItemLoading ? (
                              <span className="spinner" />
                            ) : (
                              <MinusIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                            )}
                          </button>
                          <span
                            className={`px-3 sm:px-4 py-0.5 sm:py-1 rounded-full font-medium text-xs sm:text-sm ${
                              (isOutOfStock || isOverStock)
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
                            className={`p-1 sm:p-2 rounded-full transition-all ${
                              canIncrease && !isItemLoading
                                ? "bg-indigo-100 text-indigo-600 hover:bg-indigo-200 dark:bg-indigo-700 dark:text-indigo-200 dark:hover:bg-indigo-600"
                                : "bg-gray-200 text-gray-400 dark:bg-gray-600 dark:text-gray-500 cursor-not-allowed"
                            }`}
                            aria-label="Aumentar cantidad"
                            disabled={!canIncrease || isItemLoading}
                          >
                            {isItemLoading ? (
                              <span className="spinner" />
                            ) : (
                              <PlusIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="text-center sm:text-right space-y-1 sm:space-y-2">
                        <p
                          className={`text-base sm:text-lg md:text-xl font-bold ${
                            (isOutOfStock || isOverStock)
                              ? "text-gray-500 dark:text-gray-400"
                              : "text-gray-900 dark:text-gray-100"
                          }`}
                        >
                          ${subtotal.toLocaleString()}
                        </p>
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-all p-1 sm:p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/50"
                          aria-label="Eliminar producto del carrito"
                          disabled={isItemLoading}
                        >
                          {isItemLoading ? (
                            <span className="spinner" />
                          ) : (
                            <TrashIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="summary bg-white dark:bg-gray-900 rounded-lg p-6 shadow-md self-start sticky top-4 animate-slideIn border border-gray-100 dark:border-gray-700">
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
                  <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
                    Resumen de Renta
                  </h3>
                  <div className="space-y-4 text-sm">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-300">
                          Subtotal ({selectedItems.length} productos):
                        </span>
                        <span className="font-medium text-gray-800 dark:text-gray-200">
                          ${subtotalAproximado.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Día de renta:
                      </label>
                      <input
                        type="date"
                        value={rentalDate}
                        onChange={handleRentalDateChange}
                        min={getTodayDate()}
                        max={getMaxDate(new Date())}
                        className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all dark:bg-gray-800 dark:text-gray-300"
                        aria-label="Seleccionar día de renta"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Día de devolución:
                      </label>
                      <input
                        type="date"
                        value={returnDate}
                        onChange={handleReturnDateChange}
                        min={rentalDate ? getNextDay(rentalDate) : getTodayDate()}
                        max={
                          rentalDate
                            ? getMaxDate(rentalDate)
                            : getMaxDate(new Date())
                        }
                        className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all dark:bg-gray-800 dark:text-gray-300"
                        aria-label="Seleccionar día de devolución"
                        disabled={!rentalDate}
                      />
                    </div>

                    <button
                      onClick={handleCotizar}
                      className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 rounded-md transition-all animate-pulse dark:bg-yellow-600 dark:hover:bg-yellow-700"
                      disabled={selectedItems.length === 0}
                    >
                      Cotizar
                    </button>

                    {totalCalculated !== null && (
                      <div className="mt-4 border-t pt-3 dark:border-gray-700">
                        <div className="space-y-2">
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
                              Comisión Stripe (IVA incluido):
                            </span>
                            <span className="font-medium text-gray-800 dark:text-gray-200">
                              ${stripeFee.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between font-semibold text-lg border-t pt-3 dark:border-gray-700">
                            <span className="text-gray-800 dark:text-gray-200">
                              Total a Pagar:
                            </span>
                            <span className="text-green-600 dark:text-green-400 text-xl">
                              ${total.toLocaleString()}
                            </span>
                          </div>
                        </div>
                        <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                          {subtotalAproximado < MINIMUM_TOTAL && (
                            <p>
                              El subtotal ha sido ajustado a ${MINIMUM_TOTAL.toLocaleString()} porque no superó el mínimo requerido.
                            </p>
                          )}
                          <p>La comisión de Stripe incluye el IVA.</p>
                        </div>
                      </div>
                    )}

                    {totalCalculated !== null && (
                      <button
                        onClick={handleProceedToPayment}
                        className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-md transition-all dark:bg-indigo-700 dark:hover:bg-indigo-800"
                      >
                        Proceder al pago
                      </button>
                    )}
                  </div>

                  <div className="mt-6">
                    <p className="text-sm text-gray-600 mb-2 dark:text-gray-300">
                      Métodos de pago:
                    </p>
                    <div className="flex space-x-3 justify-center sm:justify-start">
                      <img
                        src="https://upload.wikimedia.org/wikipedia/commons/4/41/Visa_Logo.png"
                        alt="Visa"
                        title="Visa"
                        className="h-6 sm:h-8 object-contain transition-transform transform hover:scale-110"
                      />
                      <img
                        src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg"
                        alt="Mastercard"
                        title="Mastercard"
                        className="h-6 sm:h-8 object-contain transition-transform transform hover:scale-110"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CarritoRentaSheinStyle;