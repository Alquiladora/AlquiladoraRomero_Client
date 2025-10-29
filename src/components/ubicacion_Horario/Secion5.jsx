import Map from './Map';
import Horario from './Horario';

const Seccion5 = () => {
  return (
    <>
      <div className="flex flex-col md:flex-row max-w-full max-w-6xl mx-auto my-8 p-6  rounded-xl  items-center justify-center  ">
        <Map></Map>
        <Horario></Horario>
      </div>
    </>
  );
};

export default Seccion5;
