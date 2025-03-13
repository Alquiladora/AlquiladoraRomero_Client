import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ProductosRelacionados from "./ProductosRelacionados";
import { toast } from "react-toastify";
import { useAuth } from "../../hooks/ContextAuth";
import api from "../../utils/AxiosConfig";
import colorMap from "./Colors";

import { FaMoneyBillWave, FaTimes } from "react-icons/fa";
import { GiMaterialsScience } from "react-icons/gi";

function DetalleProducto() {
  const { idProducto } = useParams();
  const { csrfToken } = useAuth();
  const [producto, setProducto] = useState(null);

  const [showModal, setShowModal] = useState(false);

  const fallbackImage = "https://via.placeholder.com/600x600?text=Sin+Imagen";

  
  const [selectedVariant, setSelectedVariant] = useState(null);

  const [imagenPrincipal, setImagenPrincipal] = useState(fallbackImage);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchProductoDetalle = async () => {
      try {
        const response = await api.get(
          `/api/productos/producto/${idProducto}`,
          {
            withCredentials: true,
            headers: { "X-CSRF-Token": csrfToken },
          }
        );

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
        console.error("Error al obtener el detalle del producto:", error);
        toast.error("Error al cargar el producto");
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
    return diffEnDias < 5; 
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

  const slideUpDownKeyframes = `
    @keyframes slideUpDown {
      0% {
        transform: translateY(100%);
        opacity: 0;
      }
      20% {
        transform: translateY(0);
        opacity: 1;
      }
      80% {
        transform: translateY(0);
        opacity: 1;
      }
      100% {
        transform: translateY(-100%);
        opacity: 0;
      }
    }
    .animate-slideUpDown {
      animation: slideUpDown 5s ease-in-out infinite;
    }
  `;


  const fadeInKeyframes = `
    @keyframes fadeIn {
      0% {
        opacity: 0;
        transform: translateY(10px);
      }
      100% {
        opacity: 1;
        transform: translateY(0);
      }
    }
    .fadeIn {
      animation: fadeIn 0.8s ease-out forwards;
    }
  `;

  if (!producto) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6">
        <p className="text-center text-gray-600 dark:text-gray-300">
          Cargando producto...
        </p>
      </div>
    );
  }


  const selectedStock = selectedVariant
    ? parseInt(selectedVariant.stock, 10)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 py-6 relative overflow-hidden">
    
      <style>{slideUpDownKeyframes}</style>
      <style>{fadeInKeyframes}</style>

 
      <div className="bg-yellow-400 text-black font-bold text-sm py-2 text-center uppercase tracking-wider shadow animate-slideUpDown">
        ¡Renta hoy y obtén un descuento en días extra!
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-4">
        
        <h1 className="text-3xl md:text-4xl font-extrabold mb-6 text-gray-800 dark:text-white text-center">
          Detalle del producto
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
       
          <div>
          
            <div
              className="relative border-2 border-gray-200 dark:border-gray-700 rounded-md overflow-hidden mb-4 shadow-lg cursor-pointer"
              onClick={handleImagenClick}
            >
              <img
                src={imagenPrincipal}
                alt={producto.nombreProducto}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = fallbackImage;
                }}
                className="w-full h-64 md:h-96 object-cover transform transition-transform duration-300 hover:scale-105"
              />
            </div>

            
            <div className="flex space-x-3">
              {producto.imagenes &&
                producto.imagenes.split(",").map((img, index) => (
                  <div
                    key={index}
                    className={`w-16 h-16 md:w-20 md:h-20 border-2 rounded-md overflow-hidden cursor-pointer shadow-sm transform transition-all hover:scale-105 ${
                      img === imagenPrincipal ? "ring-2 ring-blue-500" : ""
                    }`}
                    onClick={() => setImagenPrincipal(img)}
                  >
                    <img
                      src={img}
                      alt={`thumbnail-${index}`}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = fallbackImage;
                      }}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
            </div>
          </div>

         
          <div className="bg-white dark:bg-gray-800 p-6 rounded-md shadow-lg relative max-w-md w-full border-t-4 border-yellow-400 mx-auto md:mx-0 fadeIn">
           
            {esNuevo() && (
              <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs px-2 py-1 rounded-bl-md uppercase">
                Nuevo
              </div>
            )}

          
            <p className="text-center text-gray-800 dark:text-white mb-2 text-xl font-bold uppercase tracking-wide">
              {producto.nombreProducto}
            </p>

  
            <p className=" text-gray-600 dark:text-gray-300 mb-2 text-sm uppercase tracking-wide">
              Subcategoría: {producto.nombreSubcategoria}
            </p>

          
            <div className="fadeIn">
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {producto.detalles}
              </p>
            </div>

          
            {producto.material && (
              <p className="flex  text-gray-600 dark:text-gray-300 mb-2">
                <GiMaterialsScience className="mr-2 text-xl text-blue-500" />
                <span className="font-medium">Material:</span>{" "}
                <span className="ml-1">{producto.material}</span>
              </p>
            )}

          
            <p className="flex  text-gray-800 dark:text-white text-2xl font-bold mb-4">
              <FaMoneyBillWave className="mr-2 text-green-600" />
              <span className="mr-2">Precio por día:</span>
              {producto.precioAlquiler === null ||
              producto.precioAlquiler === "0.00"
                ? "0"
                : `$${producto.precioAlquiler}`}
            </p>

           
            <p className="text-xl mb-6 ">
              Stock disponible:{" "}
              <span
                className={`font-bold ${
                  selectedStock === 0 ? "text-red-500" : "text-green-600"
                }`}
              >
                {selectedStock === 0 ? "Agotado" : selectedStock}
              </span>
            </p>

      
            {producto.variantes && producto.variantes.length > 0 && (
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 text-center">
                  Selecciona color:
                </label>
                <div className="flex justify-center space-x-3">
                  {producto.variantes.map((variant, idx) => {
                    const isOutOfStock = parseInt(variant.stock, 10) === 0;
                    const isSelected =
                      selectedVariant?.nombreColor === variant.nombreColor;

                    return (
                      <div
                        key={idx}
                        className={`
                          relative w-8 h-8 rounded-full border-2 shadow group
                          ${
                            isSelected
                              ? "ring-2 ring-blue-500"
                              : "hover:scale-105"
                          }
                          ${
                            isOutOfStock
                              ? "opacity-50 cursor-not-allowed pointer-events-none"
                              : "cursor-pointer"
                          }
                        `}
                        style={{
                          backgroundColor:
                            colorMap[variant.nombreColor] || "#CCCCCC",
                        }}
                        onClick={() => handleColorSelect(variant)}
                      >
                      
                        {isOutOfStock && (
                          <span className="absolute top-[-2rem] left-1/2 transform -translate-x-1/2 bg-black text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
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
              <div className="mt-4 flex justify-center">
                <button
                  disabled={!anyVariantInStock}
                  className={`
      px-6 py-2 text-white font-semibold rounded 
      ${
        anyVariantInStock
          ? "bg-[#FFCC00] hover:bg-[#FFB300]"
          : "bg-gray-400 cursor-not-allowed"
      }
    `}
                >
                  {anyVariantInStock ? "Alquilar" : "Producto no disponible"}
                </button>
              </div>
            </div>
          </div>
        </div>


        <ProductosRelacionados idSubCategoria={producto.idSubCategoria}  idProducto={producto.idProducto} nombreCategoria={producto.nombreCategoria} />
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
          {/* Estilos y keyframes para animación */}
          <style>
            {`
        @keyframes fadeIn {
          0% {
            opacity: 0;
            transform: scale(0.95);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}
          </style>

          {/* Contenedor del modal con animación */}
          <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden w-11/12 max-w-3xl mx-auto animate-fadeIn">
            {/* Botón para cerrar */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white bg-gray-200 dark:bg-gray-700 rounded-full p-1 transition-colors"
            >
              {/* Ícono “X” */}
              <svg
                className="w-5 h-5"
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

            {/* Imagen ampliada */}
            <img
              src={imagenPrincipal}
              alt="Imagen ampliada"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = fallbackImage;
              }}
              className="w-full h-auto object-contain rounded-md"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default DetalleProducto;
