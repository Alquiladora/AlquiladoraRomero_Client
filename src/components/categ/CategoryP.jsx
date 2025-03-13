import React, { useEffect, useState } from "react";
import Categoria from "./Categoria";
import api from "../../utils/AxiosConfig"; 

const fallbackImage = "https://via.placeholder.com/300x300?text=Sin+Imagen";

const CategoryP = () => {
  
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
    
        const response = await api.get("/api/productos/categrias/disponibles");
     
        if (response.data.success && response.data.categorias) {
        
          const mappedCategories = response.data.categorias.map((cat) => ({
            name: cat.nombreCategoria,

            image: cat.fotoAleatoria || fallbackImage,
          }));
          console.log("Mapeado de categoriras", mappedCategories)

          setCategories(mappedCategories);
        } else {
          console.error("No se pudo obtener la lista de categorías.");
        }
      } catch (error) {
        console.error("Error al obtener categorías disponibles:", error);
      }
    };

    fetchCategories();
  }, []);

  return (
    <>
     
      <Categoria categories={categories} />
    </>
  );
};

export default CategoryP;
