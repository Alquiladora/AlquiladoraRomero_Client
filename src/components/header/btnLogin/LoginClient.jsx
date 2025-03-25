import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { motion, useAnimation } from "framer-motion";
import {
  Avatar,
  Menu,
  MenuItem,
  Divider,
  IconButton,
  CircularProgress,
} from "@mui/material";
import {
  faUser,
  faSignOutAlt,
  faHistory,
  faBell,
  faComments,
} from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";
import axios from "axios";
import { useAuth } from "../../../hooks/ContextAuth";
import { UserIcon } from "@heroicons/react/outline";


const LoginLink = () => (
  <Link
    to="/login"
    className="relative group flex items-center text-gray-700 dark:text-gray-200 hover:text-blue-600 transition-colors duration-300"
  >
    <UserIcon className="w-6 h-6 transition-transform duration-300 group-hover:scale-110" />
    <span className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-800 px-3 py-1.5 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 opacity-0 group-hover:opacity-100 transition-all duration-300 ease-in-out pointer-events-none whitespace-nowrap">
      Iniciar Sesión
    </span>
  </Link>
);




const IconoPerfil = () => {
  const { user, isLoading, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const [foto, setFoto] = useState("");
  const navigate = useNavigate();
  const isMounted = useRef(false);
  const controls = useAnimation();

  useEffect(() => {
    isMounted.current = true;

    const fetchProfileData = async () => {
      try {
        if (isMounted.current && user) {
          setFoto(user.fotoPerfil || "");
          controls.start({ opacity: 1, scale: 1 });
        }
      } catch (error) {
        console.error("⚠️ Error al obtener los datos del perfil:", error);
        if (isMounted.current) navigate("/error500");
      }
    };

    if (user) {
      fetchProfileData();
    } else {
      navigate("/login");
    }

    return () => {
      isMounted.current = false;
    };
  }, [user, controls, navigate]);

  const handleLogout = async () => {
    try {
      await logout();
      Swal.fire({
        title: "Sesión cerrada",
        text: "Has cerrado sesión correctamente.",
        icon: "success",
        confirmButtonText: "OK",
        width: "350px",
        customClass: {
          popup: "small-swal",
          title: "text-lg font-semibold",
          content: "text-sm",
          confirm肆Button: "bg-blue-500 text-white px-4 py-2 rounded-lg",
        },
        buttonsStyling: false,
      }).then(() => navigate("/login"));
    } catch (error) {
      console.error("❌ Error al cerrar sesión:", error);
      Swal.fire({
        title: "Error",
        text: "No se pudo cerrar sesión. Intenta de nuevo.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  const username = user?.nombre ? user.nombre.charAt(0).toUpperCase() : "U";
  const fotoPerfil = foto || "";

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center">
        <CircularProgress size={28} color="primary" />
      </div>
    );
  }

  return (
    <div className="relative flex items-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={controls}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.2 }}
      >
        <IconButton
          onClick={handleMenuOpen}
          className="p-1 focus:outline-none"
          aria-label="Perfil"
        >
          <Avatar
            src={fotoPerfil}
            alt={username}
            className="shadow-md border-2 border-blue-500 dark:border-blue-400 transition-all duration-200"
            sx={{
              bgcolor: !fotoPerfil ? "#3B82F6" : "transparent",
              color: "white",
              width: { xs: 36, sm: 40 },
              height: { xs: 36, sm: 40 },
              fontSize: { xs: "1rem", sm: "1.2rem" },
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
            "mt-2 bg-white dark:bg-gray-900 shadow-xl rounded-xl p-2 w-56 max-w-[90vw] transition-all duration-300",
          elevation: 0,
        }}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MenuItem
          onClick={handleMenuClose}
          component={Link}
          to="/cliente/perfil"
          className="hover:bg-gray-100 dark:hover:bg-gray-800 p-3 rounded-lg flex items-center transition-all duration-200"
        >
          <FontAwesomeIcon icon={faUser} className="mr-3 text-blue-500" />
          <span className="text-gray-700 dark:text-gray-200 font-medium text-sm">
            Mi Perfil
          </span>
        </MenuItem>

        <MenuItem
          onClick={handleMenuClose}
          component={Link}
          to="/cliente/historial-pedidos"
          className="hover:bg-gray-100 dark:hover:bg-gray-800 p-3 rounded-lg flex items-center transition-all duration-200"
        >
          <FontAwesomeIcon icon={faHistory} className="mr-3 text-green-500" />
          <span className="text-gray-700 dark:text-gray-200 font-medium text-sm">
            Historial de Pedidos
          </span>
        </MenuItem>

        <MenuItem
          onClick={handleMenuClose}
          component={Link}
          to="/cliente/notificaciones"
          className="hover:bg-gray-100 dark:hover:bg-gray-800 p-3 rounded-lg flex items-center transition-all duration-200"
        >
          <FontAwesomeIcon icon={faBell} className="mr-3 text-yellow-500" />
          <span className="text-gray-700 dark:text-gray-200 font-medium text-sm">
            Notificaciones
          </span>
        </MenuItem>

        <MenuItem
          onClick={handleMenuClose}
          component={Link}
          to="/cliente/comentarios"
          className="hover:bg-gray-100 dark:hover:bg-gray-800 p-3 rounded-lg flex items-center transition-all duration-200"
        >
          <FontAwesomeIcon icon={faComments} className="mr-3 text-purple-500" />
          <span className="text-gray-700 dark:text-gray-200 font-medium text-sm">
            Gestión de Comentarios
          </span>
        </MenuItem>

        <Divider className="my-2 border-gray-200 dark:border-gray-700" />

        <motion.div whileHover={{ scale: 1.03 }} transition={{ duration: 0.2 }}>
          <MenuItem
            onClick={handleLogout}
            className="hover:bg-red-50 dark:hover:bg-red-900/20 p-3 rounded-lg flex items-center transition-all duration-200"
          >
            <FontAwesomeIcon icon={faSignOutAlt} className="mr-3 text-red-500" />
            <span className="text-red-600 dark:text-red-400 font-medium text-sm">
              Cerrar Sesión
            </span>
          </MenuItem>
        </motion.div>
      </Menu>
    </div>
  );
};



export { LoginLink, IconoPerfil };
