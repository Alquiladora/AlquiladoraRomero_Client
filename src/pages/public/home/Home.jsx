//Importamos Carousel
import CarouselP from '../../../components/carousel/CarouselP';
//iMPORTAMOS LAS CATEGORIAS
import CategoryP from '../../../components/categ/CategoryP';
//Importamos el combop
import ComboProdutsP from '../../../components/combosProducts/comboProductP';
import Informacion from './Informacion';
import PaymentMethods from './MetodosPago';

const Home = () => {
  return (
    <>
      <div className="dark:bg-gray-950 dark:text-white">
        <CarouselP />
        <CategoryP />
        <ComboProdutsP />
        <Informacion />
        <PaymentMethods />
      </div>
    </>
  );
};

export default Home;
