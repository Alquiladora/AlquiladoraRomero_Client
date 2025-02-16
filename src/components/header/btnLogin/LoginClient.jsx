import React, { useState, useEffect, useContext, useRef } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { motion } from "framer-motion";
import { faUser, faSignOutAlt, faCog } from "@fortawesome/free-solid-svg-icons";
import {
  Avatar,
  Menu,
  MenuItem,
  Divider,
  IconButton,
  ClickAwayListener,
  Typography,
  Box,
} from "@mui/material";
import Swal from "sweetalert2";
import axios from "axios";

import { useNavigate } from "react-router-dom";

import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { useAuth } from "../../../hooks/ContextAuth";
import {
  UserIcon,
} from "@heroicons/react/outline";

const LoginLink = () => {
  return (
    <Link
      to="/login"
      className="relative group flex items-center font-semibold hover:text-blue-600"
    >
      <UserIcon className="w-6 h-6" />
      <span className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 whitespace-normal text-xs text-gray-700 bg-white px-2 py-1 rounded-lg shadow border border-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 sm:text-xs sm:px-2 sm:py-1 max-w-[90vw] sm:max-w-[70vw] hover:text-blue-600">
        Login
      </span>
    </Link>
  );
};




const IconoPerfil = () => {
  const { user, isLoading, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const [foto, setFoto]=useState("");
    const BASE_URL = "https://alquiladora-romero-server.onrender.com";

  const fetchProfileData = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/usuarios/perfil`, {
        withCredentials: true,
      });
      setFoto(response.data.user.fotoPerfil);


    } catch (error) {
      
      console.error("Error al obtener los datos del perfil:", error);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);
 
 
  const handleLogout = async () => {
    try {
      await logout();
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
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      Swal.fire({
        title: "Error",
        text: "No se pudo cerrar sesión. Intenta de nuevo.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  const username = user?.nombre?.charAt(0).toUpperCase() || "U";
  const fotoPerfil =foto ;

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  if (isLoading)
    return <div className="text-center text-gray-500">Cargando...</div>;

  return (
    <div className="relative">
      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
        <IconButton onClick={handleMenuOpen} className="focus:outline-none">
          <Avatar
            src={fotoPerfil}
            alt={username}
            className="cursor-pointer shadow-lg border-2 border-blue-500"
            sx={{
              bgcolor: !fotoPerfil ? "#3B82F6" : "transparent", 
              color: "white",
              width: 40,
              height: 40,
              fontSize: "1.2rem",
              fontWeight: "bold",
            }}
          >
            {!fotoPerfil && username}
          </Avatar>
        </IconButton>
      </motion.div>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          className:
            "bg-white shadow-xl rounded-xl p-2 w-48 transition-all duration-300 dark:bg-gray-950 dark:text-white",
        }}
      >
        <MenuItem
          onClick={handleMenuClose}
          component={Link}
          to="/cliente/perfil"
          className="hover:bg-gray-100 p-3 rounded-lg flex items-center transition-all duration-200"
        >
          <FontAwesomeIcon icon={faUser} className="mr-3 text-blue-500" />
          <span className="text-gray-700 font-medium dark:bg-gray-950 dark:text-white">Mi Perfil</span>
        </MenuItem>

        <Divider className="my-2" />

        <motion.div whileHover={{ scale: 1.05 }}>
          <MenuItem
            onClick={handleLogout}
            className="hover:bg-red-100 p-3 rounded-lg flex items-center transition-all duration-200"
          >
            <FontAwesomeIcon
              icon={faSignOutAlt}
              className="mr-3 text-red-500"
            />
            <span className="text-red-600 font-medium dark:bg-gray-950 dark:text-white">Cerrar Sesión</span>
          </MenuItem>
        </motion.div>
      </Menu>
    </div>
  );
};

export { LoginLink, IconoPerfil };
