import React, { useEffect, useState } from "react";
import api from "../../utils/AxiosConfig";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../hooks/ContextAuth";
import { toast } from "react-toastify";

const ProductosRelacionados = ({ idSubCategoria }) => {
  const [productosRelacionados, setProductosRelacionados] = useState([]);
  const [loading, setLoading] = useState(true);
  const { csrfToken } = useAuth();

  useEffect(() => {
    const fetchProductosRelacionados = async () => {
      try {
        const response = await api.get(
          `/api/productos/productosRelacionado/${idSubCategoria}`,
          {
            withCredentials: true,
            headers: { "X-CSRF-Token": csrfToken },
          }
        );
        console.log("Productos relacionados", response.data.products);
        if (response.data.success) {
          setProductosRelacionados(response.data.products);
        } else {
          setProductosRelacionados([]);
        }
      } catch (error) {
        console.error("Error al cargar productos relacionados:", error);
        toast.error("Error al cargar productos relacionados");
      } finally {
        setLoading(false);
      }
    };

    if (idSubCategoria) {
      fetchProductosRelacionados();
    }
  }, [idSubCategoria, csrfToken]);

  return (
    <div className="mt-12">
      <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 text-center">
        Productos Relacionados
      </h3>
      {loading ? (
        <p className="text-center text-gray-600 dark:text-gray-300">Cargando productos...</p>
      ) : productosRelacionados.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {productosRelacionados.map((producto) => {
            // Se usa imagen de placeholder si no hay imágenes (puedes ajustarlo)
            const imageUrl = producto.imagenes
              ? producto.imagenes.split(",")[0]
              : "https://via.placeholder.com/300x300?text=Sin+Imagen";
            return (
              <div
                key={producto.idProducto}
                className="bg-white dark:bg-gray-800 p-4 rounded-md shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              >
                <img
                  src={imageUrl}
                  alt={producto.nombre}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://via.placeholder.com/300x300?text=Sin+Imagen";
                  }}
                  className="w-full h-40 object-cover rounded-md mb-4"
                />
                <h4 className="text-lg font-semibold text-gray-800 dark:text-white">
                  {producto.nombre}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  {producto.detalles}
                </p>
                <p className="text-sm text-gray-800 dark:text-gray-200 mt-2">
                  Subcategoría:{" "}
                  <span className="font-medium">{producto.nombreSubcategoria}</span>
                </p>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-center text-gray-600 dark:text-gray-300">
          No hay productos relacionados.
        </p>
      )}
    </div>
  );
};

export default ProductosRelacionados;
