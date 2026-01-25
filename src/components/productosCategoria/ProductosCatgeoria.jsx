import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../utils/AxiosConfig';
import { useAuth } from '../../hooks/ContextAuth';
import { toast } from 'react-toastify';
import CustomLoading from '../spiner/SpinerGlobal';

const ProductosCategoria = () => {
  const { categori } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { csrfToken, user } = useAuth();
  const [subcategorias, setSubcategorias] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubcat, setSelectedSubcat] = useState('Todas');
  const [availableOnly, setAvailableOnly] = useState(false);

  useEffect(() => {
    const fetchSubcategorias = async () => {
      try {
        const response = await api.get(
          `/api/productos/subcategorias/${categori}`,
          {
            withCredentials: true,
            headers: { 'X-CSRF-Token': csrfToken },
          }
        );

        if (
          response.data.subcategories &&
          response.data.subcategories.length > 0
        ) {
          setSubcategorias(response.data.subcategories[0].subcats);
        } else {
          setSubcategorias([]);
        }
      } catch (error) {
        toast.error('Falló la carga de subcategorías. 😔 Intenta recargar la página para reintentar la conexión.');
      }
    };

    fetchSubcategorias();
  }, [categori, csrfToken]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get(`/api/productos/categoria/${categori}`, {
          withCredentials: true,
          headers: { 'X-CSRF-Token': csrfToken },
        });

        setProducts(response.data.products);
      } catch (error) {
        console.error('Error al cargar productos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categori, csrfToken]);

  const aggregatedProducts = useMemo(() => {
    const groups = {};
    products.forEach((product) => {
      if (!product.precioAlquiler) return;
      if (!groups[product.idProducto]) {
        groups[product.idProducto] = {
          ...product,
          stock: 0,
          activeCount: 0,
        };
      }

      if (product.estadoProducto === 'activo') {
        groups[product.idProducto].stock += Number(product.stock) || 0;
        groups[product.idProducto].activeCount += 1;
      }
    });

    return Object.values(groups).filter((prod) => prod.activeCount > 0);
  }, [products]);

  const filteredProducts = aggregatedProducts.filter((product) => {
    const stockNumber = product.stock || 0;
    const matchesSearch = product.nombreProducto
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesSubcat =
      selectedSubcat === 'Todas' ||
      product.nombreSubcategoria === selectedSubcat;
    const matchesAvailability = !availableOnly || stockNumber > 0;
    return matchesSearch && matchesSubcat && matchesAvailability;
  });

  const fallbackImage = 'https://via.placeholder.com/400x300?text=Sin+Imagen';

  const slideUpFadeStyle = {
    animation: 'slideUpFade 3s ease-in-out infinite',
  };

  const isNewProduct = (fechaCreacion, diasConsiderados = 30) => {
    const creationDate = new Date(fechaCreacion);
    const currentDate = new Date();
    const diffTime = currentDate - creationDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays < diasConsiderados;
  };

  return (
    <>
      <style>
        {`
          @keyframes slideUpFade {
            0% {
              opacity: 0;
              transform: translateY(100%);
            }
            20% {
              opacity: 1;
              transform: translateY(0);
            }
            80% {
              opacity: 1;
              transform: translateY(0);
            }
            100% {
              opacity: 0;
              transform: translateY(-100%);
            }
          }
        `}
      </style>

      <div className="min-h-screen py-6 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl xs:text-3xl sm:text-4xl font-extrabold text-center text-gray-800 dark:text-white mb-6 sm:mb-8">
            Productos en la categoría:{' '}
            <span className="text-blue-600 dark:text-blue-400">{categori}</span>
          </h1>

          <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
            <div className="flex items-center space-x-2">
              <select
                value={selectedSubcat}
                onChange={(e) => setSelectedSubcat(e.target.value)}
                className="px-2 xs:px-3 py-1.5 xs:py-2 text-xs xs:text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 transition duration-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="Todas">Todas</option>
                {subcategorias.map((subcat) => (
                  <option key={subcat.id} value={subcat.label}>
                    {subcat.label}
                  </option>
                ))}
              </select>

              <label className="flex items-center space-x-1">
                <input
                  type="checkbox"
                  checked={availableOnly}
                  onChange={(e) => setAvailableOnly(e.target.checked)}
                  className="form-checkbox h-4 w-4 text-blue-600 transition duration-200 dark:bg-gray-700"
                />
                <span className="text-xs text-gray-700 dark:text-gray-300">
                  Disponibles
                </span>
              </label>
            </div>

            <div className="flex-1 flex justify-center w-full sm:w-auto">
              <div className="relative w-full max-w-xs xs:max-w-sm sm:max-w-md">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <svg
                    className="h-4 w-4 xs:h-5 xs:w-5 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 21l-4.35-4.35M16.65 16.65A7.5 7.5 0 1116.65 2a7.5 7.5 0 010 14.65z"
                    />
                  </svg>
                </span>
                <input
                  type="text"
                  placeholder="Buscar producto..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 xs:pl-10 pr-4 py-1.5 xs:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-300 ease-in-out transform focus:scale-105 focus:shadow-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white text-xs xs:text-sm"
                />
              </div>
            </div>
          </div>

          {loading ? (
            <CustomLoading />
          ) : filteredProducts.length > 0 ? (
            <div className="grid gap-4 xs:gap-6 sm:gap-8 grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3">
              {filteredProducts.map((product) => {
                const stockNumber = product.stock || 0;
                const isOutOfStock = stockNumber === 0;
                const isLowStock = stockNumber > 0 && stockNumber <= 10;
                const imageUrl = product.imagenes
                  ? product.imagenes.split(',')[0]
                  : fallbackImage;
                const nuevo = isNewProduct(product.fechaCreacion);

                return (
                  <Link
                    key={product.idProducto}
                    to={
                      user && user.rol === 'cliente'
                        ? `/cliente/${categori}/${product.idProducto}`
                        : `/${categori}/${product.idProducto}`
                    }
                    className="block relative"
                  >
                    <div
                      className={`relative bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden transform transition-all duration-500 
                      ${
                        isOutOfStock
                          ? 'opacity-70 saturate-50 cursor-not-allowed'
                          : 'hover:scale-105 hover:shadow-2xl hover:shadow-blue-300 dark:hover:shadow-blue-700'
                      }`}
                    >
                      <div className="relative h-40 xs:h-48 sm:h-56 w-full overflow-hidden">
                        {nuevo && (
                          <div className="absolute top-1 xs:top-2 left-1 xs:left-2 z-10 bg-gradient-to-r from-green-500 to-green-700 text-white px-2 xs:px-3 py-0.5 xs:py-1 text-[10px] xs:text-xs font-bold rounded-full animate-pulse shadow-lg">
                            Nuevo
                          </div>
                        )}

                        <img
                          src={imageUrl}
                          alt={product.nombreProducto}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = fallbackImage;
                          }}
                          className="h-full w-full object-cover transition-transform duration-700 ease-in-out transform hover:scale-110"
                        />

                        {isOutOfStock && (
                          <div className="absolute inset-0 bg-red-600 bg-opacity-40 flex items-center justify-center">
                            <p className="text-white font-bold text-sm xs:text-base sm:text-xl animate-bounce">
                              Producto Agotado
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="p-4 xs:p-5 sm:p-6 transition-colors duration-500 hover:bg-gray-50 dark:hover:bg-gray-700">
                        <h2 className="text-lg xs:text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-1 xs:mb-2 text-center">
                          {product.nombreProducto}
                        </h2>
                        <p className="text-gray-600 dark:text-gray-300 mb-3 xs:mb-4 text-center text-xs xs:text-sm sm:text-base line-clamp-2">
                          {product.detalles}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="text-sm xs:text-base sm:text-lg font-semibold text-gray-800 dark:text-white">
                            ${product.precioAlquiler}
                          </div>
                          <div className="ml-2 xs:ml-4 text-xs xs:text-sm text-gray-700 dark:text-gray-300">
                            Stock: {stockNumber}
                          </div>
                        </div>

                        {!isOutOfStock && isLowStock && (
                          <div
                            className="mt-2 text-[14px] xs:text-sm text-yellow-600 font-semibold animate-pulse"
                            style={slideUpFadeStyle}
                          >
                            ¡Alquila este producto antes de que se agote!
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-gray-600 dark:text-gray-300 text-sm xs:text-base">
              No se encontraron productos con esos filtros.
            </p>
          )}
        </div>
      </div>
    </>
  );
};

export default ProductosCategoria;
