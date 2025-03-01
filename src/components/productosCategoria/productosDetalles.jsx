import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ProductosRelacionados from "./ProductosRelacionados";
import { toast } from "react-toastify";
import { useAuth } from "../../hooks/ContextAuth";
import api from "../../utils/AxiosConfig";

function DetalleProducto() {
  const { idProducto } = useParams();
  const { csrfToken, user } = useAuth();
  const [producto, setProducto] = useState(null);
  const [showModal, setShowModal] = useState(false);
  
  const fallbackImage = "https://via.placeholder.com/600x600?text=Sin+Imagen";
  
  // Mapa opcional de nombres de color a hex (puedes extenderlo a tu gusto)
  const colorMap = {
    Azul: "#0000FF",
    Rojo: "#FF0000",
    Verde: "#00FF00",
    Negro: "#000000",
    Blanco: "#FFFFFF",
    // Agrega más según tus necesidades...
  };

  // Estados para la renta
  const [dias, setDias] = useState(1);
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  // Estado para el color seleccionado
  const [colorSeleccionado, setColorSeleccionado] = useState("");
  // Estado para la imagen principal
  const [imagenPrincipal, setImagenPrincipal] = useState(fallbackImage);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchProductoDetalle = async () => {
      try {
        const response = await api.get(`/api/productos/producto/${idProducto}`, {
          withCredentials: true,
          headers: { "X-CSRF-Token": csrfToken },
        });
        console.log("Detalle del producto:", response.data);
        if (response.data.success && response.data.product) {
          const prod = response.data.product;
          setProducto(prod);

          // Imagen principal (primera del array de imágenes, si existe)
          setImagenPrincipal(prod.imagenes?.split(",")[0] || fallbackImage);

          // Si 'colores' existe, usamos el primer color; si no, usamos 'color'
          if (prod.colores && prod.colores.length > 0) {
            setColorSeleccionado(prod.colores[0]);
          } else if (prod.color) {
            setColorSeleccionado(prod.color);
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

  const handleImagenClick = (url) => {
    setImagenPrincipal(url);
    setShowModal(true);
  };

  // Lógica para calcular fechaFin automáticamente según los días seleccionados
  const handleFechaInicioChange = (e) => {
    setFechaInicio(e.target.value);
    if (dias > 0 && e.target.value) {
      const fecha = new Date(e.target.value);
      fecha.setDate(fecha.getDate() + parseInt(dias, 10));
      setFechaFin(fecha.toISOString().split("T")[0]);
    }
  };

  const handleDiasChange = (e) => {
    const newDias = e.target.value;
    setDias(newDias);
    if (fechaInicio) {
      const fecha = new Date(fechaInicio);
      fecha.setDate(fecha.getDate() + parseInt(newDias, 10));
      setFechaFin(fecha.toISOString().split("T")[0]);
    }
  };

  const handleRentar = () => {
    if (!fechaInicio || !fechaFin) {
      alert("Por favor selecciona fecha de inicio y la duración (días).");
      return;
    }
    alert(
      `¡Producto rentado por ${dias} día(s), desde ${fechaInicio} hasta ${fechaFin}!\nColor seleccionado: ${colorSeleccionado}`
    );
  };

  // Animación para banner
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

  if (!producto) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6">
        <p className="text-center text-gray-600 dark:text-gray-300">
          Cargando producto...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 py-6 relative overflow-hidden">
      {/* Definición de keyframes para animación */}
      <style>{slideUpDownKeyframes}</style>
      {/* Banner animado */}
      <div className="bg-yellow-400 text-black font-bold text-sm py-2 text-center uppercase tracking-wider shadow animate-slideUpDown">
        ¡Renta hoy y obtén un descuento en días extra!
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-4">
        {/* Encabezado */}
        <h1 className="text-3xl md:text-4xl font-extrabold mb-6 text-gray-800 dark:text-white text-center">
          Detalle del producto:{" "}
          <span className="text-blue-600">{producto.nombreProducto}</span>
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Sección de imágenes */}
          <div>
            {/* Imagen principal con modal */}
            <div
              className="border-2 border-gray-200 dark:border-gray-700 rounded-md overflow-hidden mb-4 shadow-lg cursor-pointer"
              onClick={() => handleImagenClick(imagenPrincipal)}
            >
              <img
                src={imagenPrincipal}
                alt={producto.nombreProducto}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = fallbackImage;
                }}
                className="w-full h-96 object-cover transform transition-transform duration-300 hover:scale-105"
              />
            </div>
            {/* Miniaturas */}
            <div className="flex space-x-3">
              {producto.imagenes &&
                producto.imagenes.split(",").map((img, index) => (
                  <div
                    key={index}
                    className={`w-20 h-20 border-2 rounded-md overflow-hidden cursor-pointer shadow-sm transform transition-all hover:scale-105 ${
                      img === imagenPrincipal ? "ring-2 ring-blue-500" : ""
                    }`}
                    onClick={() => handleImagenClick(img)}
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

          {/* Sección de detalles */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-md shadow-lg relative">
            <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs px-2 py-1 rounded-bl-md uppercase">
              Nuevo
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-3">
              {producto.nombreProducto}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-2">
              Categoría:{" "}
              <span className="font-medium text-blue-600">
                {producto.nombreCategoria}
              </span>
            </p>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {producto.detalles}
            </p>
            <p className="text-gray-800 dark:text-white text-2xl font-bold mb-4">
  Precio por día: {(producto.precioAlquiler === null || producto.precioAlquiler === "0.00") 
    ? "0" 
    : `$${producto.precioAlquiler}`}
</p>

            <p className="text-sm mb-6">
              Stock disponible:{" "}
              <span
                className={`font-bold ${
                  producto.stock === 0 ? "text-red-500" : "text-green-600"
                }`}
              >
                {producto.stock === 0 ? "Agotado" : producto.stock}
              </span>
            </p>

            {producto.colores && producto.colores.length > 0 ? (
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Selecciona color:
                </label>
                {producto.colores.length === 1 ? (
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-6 h-6 rounded-full border-2 border-white shadow"
                      style={{
                        backgroundColor:
                          colorMap[producto.colores[0]] || "#CCCCCC",
                      }}
                      title={`Color: ${producto.colores[0]}`}
                    ></div>
                  </div>
                ) : (
                  <div className="flex space-x-2">
                    {producto.colores.map((color) => (
                      <div
                        key={color}
                        className={`w-6 h-6 rounded-full border-2 cursor-pointer shadow ${
                          colorSeleccionado === color
                            ? "ring-2 ring-blue-500"
                            : ""
                        }`}
                        style={{
                          backgroundColor: colorMap[color] || "#CCCCCC",
                        }}
                        title={`Color: ${color}`}
                        onClick={() => setColorSeleccionado(color)}
                      ></div>
                    ))}
                  </div>
                )}
              </div>
            ) : producto.color ? (
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Color:
                </label>
                <div className="flex items-center space-x-2">
                  <div
                    className="w-6 h-6 rounded-full border-2 border-white shadow"
                    style={{
                      backgroundColor: colorMap[producto.color] || "#CCCCCC",
                    }}
                    title={`Color: ${producto.color}`}
                  ></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {producto.color}
                  </span>
                </div>
              </div>
            ) : null}

            {/* Formulario de renta */}
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Fecha de inicio
                </label>
                <input
                  type="date"
                  value={fechaInicio}
                  onChange={handleFechaInicioChange}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Días de renta
                </label>
                <input
                  type="number"
                  min="1"
                  value={dias}
                  onChange={handleDiasChange}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Fecha de devolución
                </label>
                <input
                  type="date"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                  readOnly
                />
              </div>

              <button
                onClick={handleRentar}
                disabled={producto.stock === 0}
                className={`w-full py-3 mt-2 font-semibold rounded-md text-white tracking-wider uppercase transition-all ${
                  producto.stock === 0
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {producto.stock === 0 ? "Agotado" : "Alquilar producto"}
              </button>
            </div>
          </div>
        </div>

        {/* Productos relacionados */}
        <ProductosRelacionados idSubCategoria={producto.idSubCategoria} />
      </div>

      {/* Modal para ver imagen en grande */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50">
          <div className="relative bg-white dark:bg-gray-800 rounded-lg p-4 max-w-3xl mx-auto">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-2 right-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              Cerrar
            </button>
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
