import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useAnimation } from 'framer-motion';

const Error404 = () => {
  const imageControls = useAnimation();
  const titleControls = useAnimation();
  const textControls = useAnimation();
  const buttonControls = useAnimation();

  useEffect(() => {
    imageControls.start({
      opacity: 1,
      scale: 1,
      transition: { duration: 0.8 },
    });
    titleControls.start({
      opacity: 1,
      y: 0,
      transition: { duration: 0.8 },
    });
    textControls.start({
      opacity: 1,
      transition: { delay: 0.3, duration: 0.8 },
    });
    buttonControls.start({
      opacity: 1,
      transition: { delay: 0.6, duration: 0.8 },
    });
  }, [imageControls, titleControls, textControls, buttonControls]);

  return (
    <div className="flex justify-center min-h bg-white dark:bg-gray-950 dark:text-white">
      <div className="text-center px-6 py-10 max-w-screen-md w-full">
        <motion.div
          className="flex justify-center mb-6"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={imageControls}
        >
          <img
            src="https://image.freepik.com/free-vector/404-error-page-found_24908-50943.jpg"
            alt="Error 404"
            className="w-15 h-16"
          />
        </motion.div>

        <motion.h1
          className="text-6xl md:text-8xl font-extrabold text-[#fcb900] drop-shadow-lg"
          initial={{ opacity: 0, y: -50 }}
          animate={titleControls}
        >
          404
        </motion.h1>

        <motion.p
          className="mt-2 text-xl md:text-2xl text-black font-medium"
          initial={{ opacity: 0 }}
          animate={textControls}
        >
          Lo sentimos, la página que buscas no está disponible.
        </motion.p>

        <motion.div
          className="mt-8 flex justify-center gap-4"
          initial={{ opacity: 0 }}
          animate={buttonControls}
        >
          <Link
            to="/"
            className="px-4 py-2 text-sm font-semibold text-[#fcb900] bg-white border-2 border-[#fcb900] rounded-full shadow-md hover:bg-[#fcb900] hover:text-white transition-all"
          >
            Volver al Inicio
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default Error404;
