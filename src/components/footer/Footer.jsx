import React from "react";
import { FaFacebook, FaInstagram, FaTwitter } from "react-icons/fa";
import '../../style/components/navHeader.css'
import Seccion5 from '../ubicacion_Horario/Secion5'
import { FooterDatos } from "./FooterDatos";

const Footer = () => {
  return (
    <div className="flex flex-col min-h-screen"> {/* Se asegura de que la página ocupe toda la altura */}
      <div className="flex-grow"> {/* Esto hace que el contenido principal ocupe el espacio disponible */}
        {/* Aquí puedes agregar más contenido si es necesario */}
      </div>
      
      <footer className="px-6 dark:bg-gray-950 dark:text-white py-0">
        <Seccion5 />
        <FooterDatos />
      </footer>
    </div>
  );
};

export default Footer;
