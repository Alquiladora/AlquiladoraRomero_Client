
import Carousel from './Carousel';

import imagen1 from '../../img/Logos/logo.jpg';
import imagen3 from '../../img/Logos/logo3.jpg';
import imagen4 from '../../img/Logos/logo4.jpg';
import imagen5 from '../../img/Logos/logo7.jpg';
import imagen6 from '../../img/Logos/logo6.jpg';
import imagen7 from '../../img/Logos/logo8.jpg';
import imagen8 from '../../img/Logos/logo9.jpg';
import imagen9 from '../../img/Logos/logo10.jpg';
import imagen10 from '../../img/Logos/logo11.jpg';


const CarouselP = () => {
  const images = [imagen1, imagen5, imagen3, imagen4, imagen6, imagen7, imagen8, imagen9, imagen10];

  return (
    <>
      <Carousel
        images={images}
        margin="0"
        height="500px"
        headerText={['Bienvenidos a', 'Alquiladora Romero']}
        headerColor="yellow-400"
      />
    </>
  );
};

export default CarouselP;
