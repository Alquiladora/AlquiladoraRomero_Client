import ComboProducts from "./ComboProducts";

import imagen1 from "../../img/Logos/logo.jpg";
import imagen3 from "../../img/Logos/logo3.jpg";
import imagen4 from "../../img/Logos/logo4.jpg";
import imagen5 from "../../img/Logos/logo7.jpg";



const  ComboProdutsP=()=>{

    const products = [
        {
          id: 1,
          name: "Silla de lujo",
          description: "Silla elegante y cómoda para eventos especiales.",
          image: imagen1,
        },
        {
          id: 2,
          name: "Mesa redonda",
          description: "Mesa espaciosa para 8 personas, ideal para banquetes.",
          image: imagen3,
        },
        {
          id: 3,
          name: "Carpa grande",
          description: "Carpa resistente al clima, perfecta para exteriores.",
          image: imagen4,
        },
        {
          id: 4,
          name: "Iluminación LED",
          description: "Luces LED para dar un toque especial a tu evento.",
          image: imagen5,
        },
        {
          id: 5,
          name: "Mesa redonda",
          description: "Mesa espaciosa para 8 personas, ideal para banquetes.",
          image: imagen3,
        },
        {
          id: 6,
          name: "Carpa grande",
          description: "Carpa resistente al clima, perfecta para exteriores.",
          image: imagen4,
        },
        {
          id: 7,
          name: "Iluminación LED",
          description: "Luces LED para dar un toque especial a tu evento.",
          image: imagen5,
        },
        {
          id: 8,
          name: "Iluminación LED",
          description: "Luces LED para dar un toque especial a tu evento.",
          image: imagen5,
        },
        {
          id: 9,
          name: "Mesa redonda",
          description: "Mesa espaciosa para 8 personas, ideal para banquetes.",
          image: imagen3,
        },
        {
          id: 10,
          name: "Carpa grande",
          description: "Carpa resistente al clima, perfecta para exteriores.",
          image: imagen4,
        },
        {
          id: 11,
          name: "Iluminación LED",
          description: "Luces LED para dar un toque especial a tu evento.",
          image: imagen5,
        },
        {
          id: 12,
          name: "Mesa redonda",
          description: "Mesa espaciosa para 8 personas, ideal para banquetes.",
          image: imagen3,
        },
        {
          id: 13,
          name: "Carpa grande",
          description: "Carpa resistente al clima, perfecta para exteriores.",
          image: imagen4,
        },
        {
          id: 14,
          name: "Iluminación LED",
          description: "Luces LED para dar un toque especial a tu evento.",
          image: imagen5,
        },
     
      ];
    
      return (
        <div>
          <ComboProducts products={products} />
        </div>
      );


}

export default ComboProdutsP;