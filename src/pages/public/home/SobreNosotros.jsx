import React from "react";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";
import Img1 from "../../../img/Logos/logo4.jpg";
import Img2 from "../../../img/Logos/logo6.jpg";
import ClientDestacados from "./clientDestacados";

const SobreNosotros = () => {
  
  const controlsLeft = useAnimation();
  const controlsRight = useAnimation();
  const controlsBottomLeft = useAnimation();
  const controlsBottomRight = useAnimation();

  
  const [refLeft, inViewLeft] = useInView({ threshold: 0.2 });
  const [refRight, inViewRight] = useInView({ threshold: 0.2 });
  const [refBottomLeft, inViewBottomLeft] = useInView({ threshold: 0.2 });
  const [refBottomRight, inViewBottomRight] = useInView({ threshold: 0.2 });

 
  const [mounted, setMounted] = React.useState(false);

 
  React.useEffect(() => {
    setMounted(true);
  }, []);

  
  React.useEffect(() => {
    if (!mounted) return; 

    if (inViewLeft) controlsLeft.start({ opacity: 1, y: 0 });
    else controlsLeft.start({ opacity: 0, y: -50 });

    if (inViewRight) controlsRight.start({ opacity: 1, y: 0 });
    else controlsRight.start({ opacity: 0, y: 50 });

    if (inViewBottomLeft) controlsBottomLeft.start({ opacity: 1, y: 0 });
    else controlsBottomLeft.start({ opacity: 0, y: -50 });

    if (inViewBottomRight) controlsBottomRight.start({ opacity: 1, y: 0 });
    else controlsBottomRight.start({ opacity: 0, y: 50 });
  }, [
    mounted,
    controlsLeft,
    controlsRight,
    controlsBottomLeft,
    controlsBottomRight,
    inViewLeft,
    inViewRight,
    inViewBottomLeft,
    inViewBottomRight,
  ]);

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 dark:bg-gray-950 dark:text-white">
    
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <motion.div
          ref={refLeft}
          initial={{ opacity: 0, y: -50 }}
          animate={controlsLeft}
          transition={{ duration: 0.5 }} 
          className="space-y-6 max-w-full break-words dark:bg-gray-950 dark:text-white"
        >
          <h2 className="text-4xl font-bold text-[#fcb900] text-center">
            ¿Quiénes Somos?
          </h2>
          <p className="text-lg text-gray-700 dark:bg-gray-950 dark:text-white">
            Somos un equipo de profesionales apasionados por ofrecer soluciones
            innovadoras y de alta calidad. Nuestra misión es ayudarte a alcanzar
            tus objetivos con herramientas y servicios que marcan la diferencia.
          </p>
          <p className="text-lg text-gray-700 dark:bg-gray-950 dark:text-white">
            Con años de experiencia en el mercado, nos hemos consolidado como
            líderes en nuestro sector, siempre comprometidos con la excelencia
            y la satisfacción de nuestros clientes.
          </p>
        </motion.div>

        <motion.div
          ref={refRight}
          initial={{ opacity: 0, y: 50 }}
          animate={controlsRight}
          transition={{ duration: 0.5 }} 
          className="flex justify-center max-w-full"
        >
          <img
            src={Img1}
            alt="Equipo de trabajo"
            className="rounded-lg shadow-2xl max-w-full h-auto"
          />
        </motion.div>
      </div>

  
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center mt-20">
        <motion.div
          ref={refBottomLeft}
          initial={{ opacity: 0, y: -50 }}
          animate={controlsBottomLeft}
          transition={{ duration: 0.5 }}
          className="flex justify-center order-2 md:order-1 max-w-full"
        >
          <img
            src={Img2}
            alt="Nuestra historia"
            className="rounded-lg shadow-2xl max-w-full h-auto"
          />
        </motion.div>

        <motion.div
          ref={refBottomRight}
          initial={{ opacity: 0, y: 50 }}
          animate={controlsBottomRight}
          transition={{ duration: 0.5 }}
          className="space-y-6 order-1 md:order-2 max-w-full break-words"
        >
          <h2 className="text-4xl font-bold text-[#fcb900] text-center">
            Nuestra Historia
          </h2>
          <p className="text-lg text-gray-700 dark:bg-gray-950 dark:text-white">
            Todo comenzó en un pequeño garaje, donde un grupo de amigos con una
            visión en común decidió crear algo grande. Con esfuerzo, dedicación
            y mucho trabajo en equipo, logramos convertirnos en lo que somos hoy.
          </p>
          <p className="text-lg text-gray-700 dark:bg-gray-950 dark:text-white">
            A lo largo de los años, hemos superado desafíos y celebrado éxitos,
            siempre con el objetivo de crecer y mejorar. Nuestra historia es la
            prueba de que con pasión y perseverancia, todo es posible.
          </p>
        </motion.div>
      </div>

      <br />
      <ClientDestacados />
    </div>
  );
};

export default SobreNosotros;
