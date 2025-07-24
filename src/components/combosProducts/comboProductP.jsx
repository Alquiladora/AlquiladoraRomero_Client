import React, { useEffect, useState, useCallback } from "react";
import api from "../../utils/AxiosConfig";
import ComboProducts from "./ComboProducts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
  faSpinner,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../../hooks/ContextAuth";

// Skeleton loader for products
const ProductCardSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-4 sm:p-5 animate-pulse">
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
      </div>
      <div>
        <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
      </div>
    </div>
  </div>
);

const ComboProdutsP = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { csrfToken, user } = useAuth();
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 8,
  });
  const [pageInput, setPageInput] = useState("");

  const fetchProducts = useCallback(
    async (page, signal) => {
      setLoading(true);
      setError(null);
      try {
        const headers = {};
        if (csrfToken) {
          headers["X-CSRF-Token"] = csrfToken;
        }
        if (user?.token) {
          headers["Authorization"] = `Bearer ${user.token}`;
        }

        const response = await api.get("/api/pedidos/productos/selecion", {
          params: { page, limit: 8 }, // Fixed: Added page and limit parameters
          headers,
          withCredentials: true,
          signal,
        });

        if (response.data.success) {
          const data = response.data.data || [];
          const formattedProducts = data.map((product) => ({
            id: product.idProducto,
            name: product.nombre,
            description: product.detalles || "Sin descripción",
            image: product.urlFoto === "Sin imagen" ? null : product.urlFoto,
          }));
          setProducts(formattedProducts.slice(0, 8));
          setPagination({
            currentPage: page,
            totalPages: response.data.pagination?.totalPages || 1,
            totalItems: response.data.pagination?.totalItems || data.length,
            itemsPerPage: 8,
          });
        } else {
          throw new Error(response.data.message || "Error al cargar productos.");
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          const errorMessage = err.response?.data?.message || err.message || "Error desconocido.";
          setError(`Error al cargar los productos: ${errorMessage}`);
          console.error("Error fetching products:", {
            message: err.message,
            status: err.response?.status,
            data: err.response?.data,
            stack: err.stack,
          });
        }
      } finally {
        setLoading(false);
      }
    },
    [csrfToken, user]
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchProducts(pagination.currentPage, controller.signal);
    return () => controller.abort();
  }, [pagination.currentPage, fetchProducts]);

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, currentPage: newPage }));
      setPageInput("");
    }
  };

  const handlePageInputChange = (e) => {
    const value = e.target.value;
    if (/^\d*$/.test(value) && (value === "" || (parseInt(value) >= 1 && parseInt(value) <= pagination.totalPages))) {
      setPageInput(value);
    }
  };

  const handlePageInputSubmit = (e) => {
    if (e.key === "Enter" && pageInput) {
      const newPage = parseInt(pageInput);
      handlePageChange(newPage);
    }
  };

  const renderPagination = () => {
    const { currentPage, totalPages } = pagination;
    const pageNumbers = [];
    const maxPagesToShow = 5;
    const startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-200"
            aria-label="Página anterior"
          >
            <FontAwesomeIcon icon={faChevronLeft} className="w-4 h-4" />
          </button>
          {startPage > 1 && (
            <>
              <button
                onClick={() => handlePageChange(1)}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-indigo-100 dark:hover:bg-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-200"
              >
                1
              </button>
              {startPage > 2 && <span className="text-gray-500 dark:text-gray-400">...</span>}
            </>
          )}
          {pageNumbers.map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                page === currentPage
                  ? "bg-indigo-600 text-white"
                  : "text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-indigo-100 dark:hover:bg-indigo-900"
              } focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-200`}
              aria-current={page === currentPage ? "page" : undefined}
            >
              {page}
            </button>
          ))}
          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && <span className="text-gray-500 dark:text-gray-400">...</span>}
              <button
                onClick={() => handlePageChange(totalPages)}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-indigo-100 dark:hover:bg-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-200"
              >
                {totalPages}
              </button>
            </>
          )}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-200"
            aria-label="Página siguiente"
          >
            <FontAwesomeIcon icon={faChevronRight} className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">Ir a página:</span>
          <input
            type="text"
            value={pageInput}
            onChange={handlePageInputChange}
            onKeyDown={handlePageInputSubmit}
            className="w-16 px-2 py-1 text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder={currentPage.toString()}
            aria-label="Ir a página específica"
          />
        </div>
      </div>
    );
  };

  return (
    <section className="py-12 bg-gray-100 dark:bg-gray-900 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
     

        {loading && (
          <div className="space-y-4">
            {[...Array(8)].map((_, idx) => (
              <ProductCardSkeleton key={idx} />
            ))}
          </div>
        )}

        {/* {error && (
          <div className="text-center text-red-600 dark:text-red-400 py-10">
            <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2" />
            {error}
          </div>
        )} */}

      
          <>
            <div className="space-y-4">
              {products.length === 0 ? (
                <p className="text-center text-gray-600 dark:text-gray-400 py-10">No hay productos disponibles.</p>
              ) : (
                <ComboProducts products={products} />
              )}
            </div>
            {pagination.totalItems > 0 && (
              <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                Mostrando {Math.min(products.length, 8)} de {pagination.totalItems} productos
              </div>
            )}
            {/* {pagination.totalPages > 1 && renderPagination()} */}
          </>
      
      </div>
    </section>
  );
};

export default ComboProdutsP;