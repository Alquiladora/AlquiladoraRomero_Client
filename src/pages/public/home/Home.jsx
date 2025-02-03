//Importamos Carousel
import CarouselP from "../../../components/carousel/CarouselP";
//iMPORTAMOS LAS CATEGORIAS
import CategoryP from "../../../components/categ/CategoryP";
//Importamos el combop
import ComboProdutsP from "../../../components/combosProducts/comboProductP";
import Informacion from "./Informacion";

const Home=()=>{

  


    return (

        <>
        
        <div className="dark:bg-gray-950 dark:text-white">
        <CarouselP/>
        <CategoryP/>
        <ComboProdutsP/>
        <Informacion/>
        </div>
      
      
        </>
    )
}


export default Home;