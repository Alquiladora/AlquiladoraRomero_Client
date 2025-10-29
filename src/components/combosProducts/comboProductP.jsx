/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useEffect, useState, useCallback } from "react";
import api from "../../utils/AxiosConfig";
import ComboProducts from "./ComboProducts";

import { useAuth } from "../../hooks/ContextAuth";
import { ArchiveX } from 'lucide-react';

// Skeleton loader for products
const ProductCardSkeleton = () => (
  <div className="">
    <div className="w-full h-40 bg-gray-300 dark:bg-gray-700"> 
      {<div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-600">
        <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-4 4 4 4-4V5h-2l-4 4-4-4H4v10z" clipRule="evenodd"></path></svg>
      </div> }
    </div>
    <div className="p-4">
      <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-4/5 mb-3"></div>
      <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-full mb-2"></div>
      <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
    </div>
  </div>
);

const ComboProdutsP = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ setError] = useState(null);
  const { csrfToken } = useAuth();
  const [pagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 8,
  });


const fetchProducts = useCallback(async () => {
  setLoading(true);
  setError(null);
  try {
    const headers = {};
    if (csrfToken) {
      headers["X-CSRF-Token"] = csrfToken;
    }
    const response = await api.get("/api/pedidos/productos/seleccion", {
      headers,
      withCredentials: true,
    });

    if (response.data.success) {
      const data = response.data.data || [];
      const formattedProducts = data.map((product) => ({
        id: product.idProducto,
        name: product.nombre,
        description: product.detalles || "Sin descripción",
        image: product.urlFoto === "Sin imagen" ? null : product.urlFoto,
        esNuevo: product.esNuevo
      }));
      setProducts(formattedProducts);
    } else {
      throw new Error(response.data.message || "Error al cargar productos.");
    }
  } catch (err) {
    const errorMessage =
      err.response?.data?.message || err.message || "Error desconocido.";
    setError(`Error al cargar los productos: ${errorMessage}`);
    console.error("Error fetching products:", err);
  } finally {
    setLoading(false);
  }
}, [csrfToken]);



  useEffect(() => {
    const controller = new AbortController();
    fetchProducts(pagination.currentPage, controller.signal);
    return () => controller.abort();
  }, [pagination.currentPage, fetchProducts]);


  return (
    <section className="py-12  dark:bg-gray-900 min-h-screen">
      <div className=" mx-auto  sm:px-6 lg:px-8">
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-4">
            {[...Array(8)].map((_, idx) => (
              <ProductCardSkeleton key={idx} />
            ))}
          </div>
        )}
          <>
            <div className="space-y-1">
              {products.length === 0 ? (
               <div className="text-center text-gray-500 dark:text-gray-400 py-20 flex flex-col items-center">
          <ArchiveX className="w-16 h-16 mb-2 text-gray-400" />
          <h3 className="text-2xl font-semibold">No se encontraron productos</h3>
          <p className="mt-2">Intenta de nuevo más tarde.</p>
        </div>
              ) : (
                <ComboProducts products={products} />
              )}
            </div>
          </>
      
      </div>
    </section>
  );
};

export default ComboProdutsP;