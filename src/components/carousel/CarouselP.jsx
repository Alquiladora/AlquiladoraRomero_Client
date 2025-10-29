//Importamos Carousel
import Carousel from './Carousel';
//Importamos las imagens
import imagen1 from '../../img/Logos/logo.jpg';
import imagen3 from '../../img/Logos/logo3.jpg';
import imagen4 from '../../img/Logos/logo4.jpg';
import imagen5 from '../../img/Logos/logo7.jpg';
import imagen6 from '../../img/Logos/logo6.jpg';

const CarouselP = () => {
  const images = [imagen1, imagen5, imagen3, imagen4, imagen6];

  return (
    <>
      <Carousel
        images={images}
        margin="0"
        height="400px"
        headerText={['Bienvenidos a', 'Alquiladora Romero']}
        headerColor="yellow-400"
      />
    </>
  );
};

export default CarouselP;
