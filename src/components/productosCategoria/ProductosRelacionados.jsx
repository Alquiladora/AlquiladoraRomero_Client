import React, { useEffect, useMemo, useState } from 'react';
import api from '../../utils/AxiosConfig';
import { useAuth } from '../../hooks/ContextAuth';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

const fallbackImage = 'https://via.placeholder.com/300x300?text=Sin+Imagen';

function isNewProduct(fechaCreacion) {
  if (!fechaCreacion) return false;
  const creationDate = new Date(fechaCreacion);
  const currentDate = new Date();
  const diffTime = Math.abs(currentDate - creationDate);
  const diffDays = diffTime / (1000 * 60 * 60 * 24);
  return diffDays < 5;
}

const ProductosRelacionados = ({
  idSubCategoria,
  idProducto,
  nombreCategoria,
}) => {
  const [rawProductos, setRawProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const { csrfToken, user } = useAuth();

  useEffect(() => {
    const fetchProductosRelacionados = async () => {
      try {
        const response = await api.get(
          `/api/productos/productosRelacionado/${idSubCategoria}`,
          {
            withCredentials: true,
            headers: { 'X-CSRF-Token': csrfToken },
          }
        );
        if (response.data.success) {
          setRawProductos(response.data.products);
         
        } else {
          setRawProductos([]);
        }
      } catch (error) {
        console.error('Error al cargar productos relacionados:', error);
        toast.error('Error al cargar productos relacionados');
      } finally {
        setLoading(false);
      }
    };

    if (idSubCategoria) {
      fetchProductosRelacionados();
    }
  }, [idSubCategoria, csrfToken]);

  const aggregatedProducts = useMemo(() => {
    const groups = {};

    rawProductos.forEach((prod) => {
      if (!prod.precioAlquiler) return;

      if (!groups[prod.idProducto]) {
        groups[prod.idProducto] = {
          ...prod,
          stock: 0,
          activeCount: 0,
        };
      }

      if (prod.estadoProducto === 'activo') {
        groups[prod.idProducto].stock += Number(prod.stock) || 0;
        groups[prod.idProducto].activeCount += 1;
      }
    });

    return Object.values(groups).filter(
      (item) => item.activeCount > 0 && item.idProducto !== Number(idProducto)
    );
  }, [rawProductos, idProducto]);

  return (
    <div className="mt-12">
      <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 text-center">
        Productos Relacionados
      </h3>

      {loading ? (
        <p className="text-center text-gray-600 dark:text-gray-300">
          Cargando productos...
        </p>
      ) : aggregatedProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {aggregatedProducts.map((producto) => {
            const imageUrl = producto.imagenes
              ? producto.imagenes.split(',')[0]
              : fallbackImage;
            const stockNumber = producto.stock || 0;
            const nuevo = isNewProduct(producto.fechaCreacion);

            return (
              <div
                key={producto.idProducto}
                className="bg-white dark:bg-gray-800 p-4 rounded-md shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              >
                {user && user.rol === 'cliente' ? (
                  <Link
                    to={`/cliente/${nombreCategoria}/${producto.idProducto}`}
                    className="block"
                  >
                    <div className="relative">
                      {nuevo && (
                        <span className="absolute top-0 right-0 bg-blue-600 text-white text-xs px-2 py-1 rounded-bl-md uppercase">
                          Nuevo
                        </span>
                      )}
                      <img
                        src={imageUrl}
                        alt={producto.nombreProducto}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = fallbackImage;
                        }}
                        className="w-full h-40 object-cover rounded-md mb-4"
                      />
                    </div>

                    <h4 className="text-lg font-semibold text-gray-800 dark:text-white">
                      {producto.nombreProducto}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      {producto.detalles}
                    </p>
                    <p className="text-sm text-gray-800 dark:text-gray-200 mt-2">
                      Subcategoría:{' '}
                      <span className="font-medium">
                        {producto.nombreSubcategoria}
                      </span>
                    </p>

                    <p className="text-sm mt-2">
                      {stockNumber > 0 ? (
                        <span className="text-green-600 font-bold">
                          Stock: {stockNumber}
                        </span>
                      ) : (
                        <span className="text-red-500 font-bold">Agotado</span>
                      )}
                    </p>
                  </Link>
                ) : (
                  <Link
                    to={`/${nombreCategoria}/${producto.idProducto}`}
                    className="block"
                  >
                    <div className="relative">
                      {nuevo && (
                        <span className="absolute top-0 right-0 bg-blue-600 text-white text-xs px-2 py-1 rounded-bl-md uppercase">
                          Nuevo
                        </span>
                      )}
                      <img
                        src={imageUrl}
                        alt={producto.nombreProducto}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = fallbackImage;
                        }}
                        className="w-full h-40 object-cover rounded-md mb-4"
                      />
                    </div>

                    <h4 className="text-lg font-semibold text-gray-800 dark:text-white">
                      {producto.nombreProducto}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      {producto.detalles}
                    </p>
                    <p className="text-sm text-gray-800 dark:text-gray-200 mt-2">
                      Subcategoría:{' '}
                      <span className="font-medium">
                        {producto.nombreSubcategoria}
                      </span>
                    </p>

                    <p className="text-sm mt-2">
                      {stockNumber > 0 ? (
                        <span className="text-green-600 font-bold">
                          Stock: {stockNumber}
                        </span>
                      ) : (
                        <span className="text-red-500 font-bold">Agotado</span>
                      )}
                    </p>
                  </Link>
                )}
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
