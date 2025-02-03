import Categoria from "./Categoria";
import imagen1 from "../../img/Logos/logo.jpg";
import imagen3 from "../../img/Logos/logo3.jpg";
import imagen4 from "../../img/Logos/logo4.jpg";
import imagen5 from "../../img/Logos/logo7.jpg";
import imagen6 from "../../img/Logos/logo6.jpg";
import Catalogo from "../../pages/public/catalog/Catalogo";


const CategoryP=()=>{
    const categories = [
        {
          name: "Sillas",
          image: imagen1,
        },
        {
          name: "Mesas",
          image: imagen3,
        },
        {
            name: "Platos",
            image: imagen3,
          },
          {
            name: "Carpas",
            image: imagen4,
          },
          {
            name: "Botacas",
            image: imagen5,
          },
          {
            name: "Cucharas",
            image: imagen6,
          }
      ];

      const products = [
        { name: "Smartphone", category: "Electrónica", image: "path_to_product_1.jpg", description: "Descripción del producto", price: 100 },
        { name: "Camisa", category: "Ropa", image: "path_to_product_2.jpg", description: "Descripción de la camisa", price: 20 },
        // Agrega más productos
      ];


    return(
        <>
          <Categoria categories={categories} />;
          
        </>
    )
}

export default CategoryP;

  
