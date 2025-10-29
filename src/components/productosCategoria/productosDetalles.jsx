import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ProductosRelacionados from "./ProductosRelacionados";
import { toast } from "react-toastify";
import { useAuth } from "../../hooks/ContextAuth";
import api from "../../utils/AxiosConfig";
import { useCart } from "../carrito/ContextCarrito";
import { FaMoneyBillWave, FaTimes } from "react-icons/fa";
import { GiMaterialsScience } from "react-icons/gi";
import { useRecomendaciones } from "../carrito/ContextRecomendaciones";
import CustomLoading from "../spiner/SpinerGlobal";


function DetalleProducto() {
  const { idProducto } = useParams();
  const { csrfToken, user } = useAuth();
  const { addToCart } = useCart()
  const [producto, setProducto] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const fallbackImage = "https://via.placeholder.com/600x600?text=Sin+Imagen";
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [imagenPrincipal, setImagenPrincipal] = useState(fallbackImage);
  const [hoveredColor, setHoveredColor] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { actualizarRecomendaciones } = useRecomendaciones();

  useEffect(() => {
    const fetchProductoDetalle = async () => {
      try {
        const response = await api.get(`/api/productos/producto/${idProducto}`, {
          withCredentials: true,
          headers: { "X-CSRF-Token": csrfToken },
        });

        if (response.data.success && response.data.product) {
          const prod = response.data.product;
          setProducto(prod);

          const primeraImagen = prod.imagenes?.split(",")[0] || fallbackImage;
          setImagenPrincipal(primeraImagen);

          if (prod.variantes && prod.variantes.length > 0) {
            const varianteConStock = prod.variantes.find(
              (v) => parseInt(v.stock, 10) > 0
            );
            setSelectedVariant(varianteConStock || prod.variantes[0]);
          }
        }
      } catch (error) {
        console.log(error)
      }
    };

    if (idProducto) {
      fetchProductoDetalle();
    }
  }, [idProducto, csrfToken]);

  const esNuevo = () => {
    if (!producto?.fechaCreacion) return false;
    const fechaCreacion = new Date(producto.fechaCreacion);
    const hoy = new Date();
    const diffEnMs = hoy - fechaCreacion;
    const diffEnDias = diffEnMs / (1000 * 60 * 60 * 24);
    return diffEnDias < 30;
  };

  const handleImagenClick = () => {
    setShowModal(true);
  };

  const handleColorSelect = (variant) => {
    if (parseInt(variant.stock, 10) > 0) {
      setSelectedVariant(variant);
    }
  };

  const anyVariantInStock =
    producto?.variantes?.some((v) => parseInt(v.stock, 10) > 0) || false;

  const selectedStock = selectedVariant ? parseInt(selectedVariant.stock, 10) : 0;

  const checkIfProductInCart = async (idUsuario, idProductoColor) => {
    try {
      const response = await api.get(`/api/carrito/carrito/${idUsuario}`, {
        withCredentials: true,
        headers: { "X-CSRF-Token": csrfToken },
      });

      if (response.data.success && response.data.carrito) {
        const cartItems = response.data.carrito;
        return cartItems.some((item) => item.idProductoColores === idProductoColor);
      }
      return false;
    } catch (error) {
      console.error("Error al verificar el carrito:", error);
      toast.error("Error al verificar el carrito.");
      return false;
    }
  };

  const handleAddToCart = async () => {
    if (!selectedVariant) {
      toast.error("Por favor selecciona un color antes de añadir al carrito.");
      return;
    }

    if (quantity <= 0) {
      toast.error("La cantidad debe ser mayor a 0.");
      return;
    }

    if (quantity > selectedStock) {
      toast.error(`No hay suficiente stock. Stock disponible: ${selectedStock}`);
      return;
    }

    try {
      const idUsuario = user?.id || user?.idUsuarios;

      if (!idUsuario) {
        toast.error("Debes iniciar sesión para añadir al carrito.");
        return;
      }


      const isProductInCart = await checkIfProductInCart(idUsuario, selectedVariant.idProductoColor);
      if (isProductInCart) {
        toast.error(
          `El producto "${producto.nombreProducto} (${selectedVariant.nombreColor})" ya está en tu carrito.`
        );
        return;
      }

      setIsAddingToCart(true);

      const cartItem = {
        idUsuario,
        precioAlquiler: producto.precioAlquiler,
        idProductoColor: selectedVariant.idProductoColor,
        cantidad: quantity,
      };



      const response = await api.post("/api/carrito/agregar", cartItem, {
        withCredentials: true,
        headers: { "X-CSRF-Token": csrfToken },
      });

      if (response.data.success) {
        toast.success(`${producto.nombreProducto} (${selectedVariant.nombreColor}) añadido al carrito!`);
        actualizarRecomendaciones(response.data.recomendaciones);
        await addToCart()
        setQuantity(1);
      } else {
        toast.error(response.data.mensaje || "Error al añadir el producto al carrito.");
      }
    } catch (error) {
      console.error("Error al añadir al carrito:", error);
      toast.error("Error al añadir el producto al carrito.");
    } finally {
      setIsAddingToCart(false);
    }
  };

  const slideUpDownKeyframes = `
    @keyframes slideUpDown {
      0% { transform: translateY(100%); opacity: 0; }
      20% { transform: translateY(0); opacity: 1; }
      80% { transform: translateY(0); opacity: 1; }
      100% { transform: translateY(-100%); opacity: 0; }
    }
    .animate-slideUpDown {
      animation: slideUpDown 5s ease-in-out infinite;
    }
  `;

  const fadeInKeyframes = `
    @keyframes fadeIn {
      0% { opacity: 0; transform: translateY(10px); }
      100% { opacity: 1; transform: translateY(0); }
    }
    .fadeIn {
      animation: fadeIn 0.8s ease-out forwards;
    }
  `;

  const spinnerKeyframes = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    .spinner {
      display: inline-block;
      width: 1.5rem;
      height: 1.5rem;
      border: 3px solid rgba(255, 255, 255, 0.3);
      border-top: 3px solid white;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
  `;

  if (!producto) {
    return (
      <CustomLoading />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 py-4 relative overflow-hidden">
      <style>{slideUpDownKeyframes}</style>
      <style>{fadeInKeyframes}</style>
      <style>{spinnerKeyframes}</style>

      <div className="bg-yellow-400 text-black font-bold text-xs sm:text-sm py-2 text-center uppercase tracking-wider shadow animate-slideUpDown">
        ¡Alquiladora Romero los mejores de la region!
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-4">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-6 text-gray-800 dark:text-white text-center">
          Detalle del producto
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          <div className="flex flex-col lg:flex-row gap-4">




            <div className="flex lg:flex-col flex-row justify-center lg:justify-start gap-3 sm:gap-4 order-2 lg:order-1">
              {producto.imagenes &&
                producto.imagenes.split(",").map((img, index) => (
                  <div
                    key={index}
                    className={`w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 border-2 border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden cursor-pointer shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg focus:ring-2 focus:ring-blue-500 ${img === imagenPrincipal ? "ring-2 ring-blue-500" : ""
                      }`}
                    onClick={() => setImagenPrincipal(img)}
                    tabIndex={0}
                    role="button"
                    aria-label={`Seleccionar imagen miniatura ${index + 1}`}
                    onKeyDown={(e) => e.key === 'Enter' && setImagenPrincipal(img)}
                  >
                    <img
                      src={img}
                      alt={`Miniatura ${index + 1}`}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = fallbackImage;
                      }}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
            </div>

            <div className="relative border-2 border-gray-300 dark:border-gray-600 rounded-xl overflow-hidden shadow-xl cursor-pointer order-1 lg:order-2 flex-1">
              <img
                src={imagenPrincipal}
                alt={producto.nombreProducto}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = fallbackImage;
                }}
                onClick={handleImagenClick}
                className="w-full h-56 sm:h-72 md:h-96 lg:h-[32rem] object-cover transition-transform duration-300 hover:scale-110"
                role="button"
                tabIndex={0}
                aria-label="Ampliar imagen principal"
                onKeyDown={(e) => e.key === 'Enter' && handleImagenClick()}
              />
            </div>


          </div>

          <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-md shadow-lg relative max-w-md w-full border-t-4 border-yellow-400 mx-auto fadeIn">
            {esNuevo() && (
              <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs px-2 py-1 rounded-bl-md uppercase">
                Nuevo
              </div>
            )}

            <p className="text-center text-gray-800 dark:text-white mb-2 text-lg sm:text-xl font-bold uppercase tracking-wide">
              {producto.nombreProducto}
            </p>

            <p className="text-gray-600 dark:text-gray-300 mb-2 text-xs sm:text-sm uppercase tracking-wide">
              Subcategoría: {producto.nombreSubcategoria}
            </p>

            <div className="fadeIn">
              <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm sm:text-base">
                {producto.detalles}
              </p>
            </div>

            {producto.material && (
              <p className="flex text-gray-600 dark:text-gray-300 mb-2 text-sm sm:text-base">
                <GiMaterialsScience className="mr-2 text-lg sm:text-xl text-blue-500" />
                <span className="font-medium">Material:</span>{" "}
                <span className="ml-1">{producto.material}</span>
              </p>
            )}

            <p className="flex text-gray-800 dark:text-white text-lg sm:text-2xl font-bold mb-4">
              <FaMoneyBillWave className="mr-2 text-green-600" />
              <span className="mr-2">Precio por día:</span>
              {producto.precioAlquiler === null || producto.precioAlquiler === "0.00"
                ? "0"
                : `$${producto.precioAlquiler}`}
            </p>

            <p className="text-base sm:text-xl mb-6">
              Stock disponible:{" "}
              <span
                className={`font-bold ${selectedStock === 0 ? "text-red-500" : "text-green-600"
                  }`}
              >
                {selectedStock === 0 ? "Agotado" : selectedStock}
              </span>
            </p>

            {producto.variantes && producto.variantes.length > 0 && (
              <div className="mb-5">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 text-center">
                  Selecciona color:
                </label>
                <div className="flex justify-center space-x-2 sm:space-x-3">
                  {producto.variantes.map((variant, idx) => {
                    const isOutOfStock = parseInt(variant.stock, 10) === 0;
                    const isSelected =
                      selectedVariant?.nombreColor === variant.nombreColor;
                    const isHovered = hoveredColor === variant.nombreColor;

                    return (
                      <div
                        key={idx}
                        className={`
                          relative w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 shadow group
                          ${isSelected
                            ? "ring-2 ring-blue-500"
                            : "hover:scale-105"
                          }
                          ${isOutOfStock
                            ? "opacity-50 cursor-not-allowed pointer-events-none"
                            : "cursor-pointer"
                          }
                        `}
                        style={{
                          backgroundColor: variant.colorH || "#CCCCCC",
                        }}
                        onClick={() => handleColorSelect(variant)}
                        onMouseEnter={() => setHoveredColor(variant.nombreColor)}
                        onMouseLeave={() => setHoveredColor(null)}
                        onTouchStart={() => setHoveredColor(variant.nombreColor)}
                        onTouchEnd={() =>
                          setTimeout(() => setHoveredColor(null), 1000)
                        }
                      >
                        {(isHovered || isSelected) && (
                          <span
                            className={`
                              absolute top-[-2rem] left-1/2 transform -translate-x-1/2 
                              bg-gray-800 text-white text-xs rounded px-2 py-1 
                              transition-opacity z-10
                              ${isHovered ? "opacity-100" : "opacity-0"}
                            `}
                          >
                            {variant.nombreColor}
                          </span>
                        )}

                        {isOutOfStock && (
                          <span
                            className={`
                              absolute top-[-2rem] left-1/2 transform -translate-x-1/2 
                              bg-black text-white text-xs rounded px-2 py-1 
                              opacity-0 group-hover:opacity-100 transition-opacity z-10
                            `}
                          >
                            Color no disponible
                          </span>
                        )}

                        {isOutOfStock && (
                          <FaTimes className="absolute top-0 right-0 text-white bg-black rounded-full text-xs" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}


            <div className="mt-4">

              <div className="mb-4 flex justify-center items-center">
                <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">
                  Cantidad:
                </label>
                <input
                  type="number"
                  min="1"
                  max={selectedStock}
                  value={quantity}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (value >= 1 && value <= selectedStock) {
                      setQuantity(value);
                    } else if (value < 1) {
                      setQuantity(1);
                    } else if (value > selectedStock) {
                      setQuantity(selectedStock);
                    }
                  }}
                  className="w-16 sm:w-20 p-1 border-2 border-gray-300 dark:border-gray-600 rounded-md text-center text-sm sm:text-base bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!anyVariantInStock || isAddingToCart}
                />
              </div>

              <div className="flex justify-center">
                <button
                  onClick={handleAddToCart}
                  disabled={!anyVariantInStock || isAddingToCart}
                  className={`
                    px-4 sm:px-6 py-2 text-sm sm:text-base text-white font-semibold rounded flex items-center justify-center
                    ${anyVariantInStock && !isAddingToCart
                      ? "bg-[#FFCC00] hover:bg-[#FFB300]"
                      : "bg-gray-400 cursor-not-allowed"
                    }
                  `}
                >
                  {isAddingToCart ? (
                    <>
                      <span className="spinner mr-2" />
                      Agregando...
                    </>
                  ) : anyVariantInStock ? (
                    "Añadir al carrito"
                  ) : (
                    "Producto no disponible"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        <ProductosRelacionados
          idSubCategoria={producto.idSubCategoria}
          idProducto={producto.idProducto}
          nombreCategoria={producto.nombreCategoria}
        />
      </div>



{showModal && (
  <div
    // Contenedor principal: Fondo oscuro, centrado y con efecto de desenfoque.
    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-95 backdrop-blur-md" 
    onClick={() => setShowModal(false)} // Cierra al hacer clic fuera de la imagen
  >
    {/* Estilos de animación (Mantener aquí si no están globales) */}
    <style>
      {`
        @keyframes fadeIn {
          0% { opacity: 0; transform: scale(0.95); }
          100% { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}
    </style>

    <div
      // Contenedor de la imagen: Transparente (sin bg-white/gray), ajusta el tamaño.
      className="relative w-11/12 max-w-5xl mx-auto animate-fadeIn" 
      onClick={(e) => e.stopPropagation()} // Evita que el clic en la imagen cierre el modal
    >
      
      {/* Botón de Cerrar (Posicionado sobre la imagen) */}
      <button
        onClick={() => setShowModal(false)}
        // Estilo limpio: Fondo negro semi-transparente, icono blanco con hover ámbar.
        className="absolute top-6 right-6 text-white hover:text-amber-400 bg-gray-900/50 hover:bg-gray-900 rounded-full p-3 z-10 transition-all duration-300 shadow-xl"
        aria-label="Cerrar imagen ampliada"
      >
        <svg
          className="w-7 h-7" // Ícono más grande para facilitar el cierre
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      {/* Imagen Ampliada */}
      <img
        src={imagenPrincipal}
        alt="Imagen ampliada del producto"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = fallbackImage; 
        }}
        // Estilos de la imagen: Max-height alto, sin bordes internos ni fondo visible.
        className="w-full h-auto max-h-[90vh] object-contain rounded-lg shadow-2xl" 
      />
    </div>
  </div>
)}
      
    </div>
  );
}

export default DetalleProducto;