import React, { useState, useEffect ,useContext} from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
    faUser, 
    faBuilding, 
    faShieldAlt, 
    faBalanceScale,  
    faFileSignature, 
    faExclamationTriangle,
    faSignOutAlt, 
    faShoppingCart,
    faMoon,
    faSun,
    faUserSecret 
  } from '@fortawesome/free-solid-svg-icons';
  import { useMediaQuery } from '@mui/material';

import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import Terminos from '../admin/terminos/terminos'
import DatosEmpresa from "../admin/datosEmpresa/datosEmpresa";
import Politicas from "./politicas/politicasP";
// import { useAuth } from "../shared/layaouts/AuthContext";


import { Box, Typography, Button, List, ListItem, Divider ,IconButton} from "@mui/material";
// import { ThemeContext } from "../shared/layaouts/ThemeContext";
import DeslindeLegal from "../../../components/admin/deslin/deslin";
import Usuarios from "../../../components/admin/usuarios/usuarios";
import Auditoria from "../../../components/admin/auditoria/auditoriaLogin"
import UsuariosSospechosos from "../../../components/admin/auditoria/usuarioSospechoso";
import { faBars, faTimes } from '@fortawesome/free-solid-svg-icons';


const MenuHome = () => {
  const [selectedSection, setSelectedSection] = useState("");
  const navigate = useNavigate();
  const [selectedSubSection, setSelectedSubSection] = useState(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [showRestaurantDetails, setShowRestaurantDetails] = useState(false);
  const { user, isLoading, logout } = useAuth();
 





  const renderContent = () => {
    switch (selectedSection) {
      case "perfil":
        // return <CrudPerfil />;
      case "Terminos y Condiciones":
        return <Terminos />;
        case "usuarioS":
          return <UsuariosSospechosos />;
      case "usuarios":
        return <Usuarios />;
        case "auditoriaLogin":
        return <Auditoria />;
      case "datosEmpresa":
        return <DatosEmpresa />;
      case "politicasPrivacidad":
        return <Politicas />;
        case "Errores de sistema":
        return <ErrorLogs />;
      case "Deslinde legal":
        return <DeslindeLegal />;
        case "cerrarSesion":
            logout(); // Llama a la función para cerrar sesión
            Swal.fire({
              title: "Sesión cerrada",
              text: "Has cerrado sesión correctamente.",
              icon: "success",
              confirmButtonText: "OK",
              width: "300px",
              customClass: {
                popup: "small-swal",     
                title: "small-title",
                content: "small-text",
                confirmButton: "small-confirm",
              },
              buttonsStyling: false,     
            }).then(() => {
              navigate("/login");         
            });
        
      
            return null;

      default:
        return (
          <div
    style={{
      textAlign: "center",
      padding: "60px 20px",
     
      borderRadius: "12px",
      boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2)",
      position: "relative",
      overflow: "hidden",
    }}
  >
    {/* Imagen de fondo */}
    <img
      src="../../img/carousel10.jpg" 
      alt="Fondo de bienvenida"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        objectFit: "cover",
        opacity: 0.2,
        zIndex: -1,
      }}
    />
    <h1 style={{ fontSize: "30px", color: theme === "light" ? "#333" : "#fff", marginBottom: "20px" }}>
      Bienvenido a <span style={{ color: "#1976d2" }}>Alquiladora Romero</span>
    </h1>
    <p
      style={{
        fontSize: "18px",
        color: theme === "light" ? "#555" : "#ccc",
        maxWidth: "600px",
        margin: "0 auto",
        lineHeight: "1.6",
      }}
    >
      Gracias por formar parte de nuestro equipo. Disfruta de la mejor experiencia en administración de servicios de alquiler.
    </p>
  
  </div>
        );
    }
  };


  const handleSelectSection = (section) => {
    setSelectedSection(section);
    setShowRestaurantDetails(false);

  }
  


  return (
    <div className="perfil-restaurante">
      <Sidebar onSelect={handleSelectSection}  setShowRestaurantDetails={setShowRestaurantDetails} user={user}/>
      <div className="content">{renderContent()}</div>
    </div>
  );
}



const Sidebar = ({ onSelect, user, setShowRestaurantDetails }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const isSmallScreen = useMediaQuery('(max-width:768px)');
  

  
  const sidebarStyles = {
    width: "250px",
    backgroundColor: theme === "light" ? "#304d6a" : "#222",
    color: theme === "light" ? "#fff" : "#ccc",
    padding: "20px",
    transition: "all 0.3s ease",
    minHeight: "100vh",
    position: isSmallScreen ? 'fixed' : 'relative',
    top: 0,
    left: isSmallScreen ? (isMenuOpen ? 0 : '-250px') : 0,
    zIndex: 1000,
  };

  const hamburgerStyles = {
    display: isSmallScreen ? 'block' : 'none',
    position: 'fixed',
    top: '20px',
    left: '20px',
    zIndex: 2000,
    cursor: 'pointer',
    color: theme === "light" ? "#000" : "#fff",
  };

  

  return (
    <Box sx={sidebarStyles}>
    <div style={hamburgerStyles}>
      <FontAwesomeIcon
        icon={isMenuOpen ? faTimes : faBars}
        size="2x"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      />
    </div>
    <div className={`sidebar-content ${isMenuOpen ? 'open' : ''}`}>

      <div className="profile-info">
        <div className="profile-pic">
          {user?.foto_perfil ? (
            <img src={user.foto_perfil} alt="Profile" />
          ) : (
            <FontAwesomeIcon icon={faUser} size="4x" />
          )}
           <IconButton onClick={toggleTheme}>
                    <FontAwesomeIcon
                    
                     
                    />
                  </IconButton>

        </div>
        <div className="country-flag">
          <div>
            <p>
               {user?.nombre}
            </p>
            <p>Administrador</p>
          </div>
        </div>
      </div>
      <div className="menu">
    <ul>
      <li onClick={() => { onSelect("usuarios"); setShowRestaurantDetails(false);setIsMenuOpen(false); }}>
        <FontAwesomeIcon icon={faUser} className="icon" /> Usuarios
      </li>
      <li onClick={() => { onSelect("usuarioS"); setShowRestaurantDetails(false); }}>
      <FontAwesomeIcon icon={faUserSecret} className="icon" /> Usuario Sospechoso
      </li> 
      <li onClick={() => { onSelect("datosEmpresa"); setShowRestaurantDetails(false); setIsMenuOpen(false);}}>
        <FontAwesomeIcon icon={faBuilding} className="icon" /> Datos de la Empresa
      </li>
      <li onClick={() => { onSelect("auditoriaLogin"); setShowRestaurantDetails(false); setIsMenuOpen(false);}}>
        <FontAwesomeIcon icon={faBuilding} className="icon" /> Auditoria Login
      </li>
      <li onClick={() => { onSelect("politicasPrivacidad"); setShowRestaurantDetails(false); setIsMenuOpen(false);}}>
        <FontAwesomeIcon icon={faShieldAlt} className="icon" /> Políticas y Privacidad
      </li>
      <li onClick={() => { onSelect("Deslinde legal"); setShowRestaurantDetails(false);setIsMenuOpen(false); }}>
        <FontAwesomeIcon icon={faBalanceScale} className="icon" /> Deslinde legal
      </li>
      <li onClick={() => { onSelect("Terminos y Condiciones"); setShowRestaurantDetails(false); setIsMenuOpen(false);}}>
        <FontAwesomeIcon icon={faFileSignature} className="icon" />Términos y Condiciones
      </li>
      <li onClick={() => { onSelect("Errores de sistema"); setShowRestaurantDetails(false); setIsMenuOpen(false);}}>
        <FontAwesomeIcon icon={faExclamationTriangle} className="icon" /> Errores de sistema
      </li>
      
      <li onClick={() => { onSelect("cerrarSesion"); setShowRestaurantDetails(false); setIsMenuOpen(false);}}>
        <FontAwesomeIcon icon={faSignOutAlt} className="icon" /> Cerrar sesión
      </li>
      
    </ul>
  </div>
  </div>
  </Box>
  );
};

export default MenuHome;
