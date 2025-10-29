import React, { useState, useEffect, useCallback } from "react";

import Swal from "sweetalert2";
import { FaLock, FaLockOpen, FaUserTag } from "react-icons/fa";
import { useAuth } from "../../../../hooks/ContextAuth";
import api from "../../../../utils/AxiosConfig";
import { FaUserSecret } from "react-icons/fa";
import '../../../../style/global/StyleSpiderAdmini.css'

const UsuariosSospechosos = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [minIntentosReales, setMinIntentosReales] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user, csrfToken } = useAuth();
  const [debouncedMinIntentos, setDebouncedMinIntentos] = useState(minIntentosReales);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedMinIntentos(minIntentosReales);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [minIntentosReales]);

  const fetchUsuariosSospechosos = useCallback(async () => {
    if (!csrfToken) return;
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(
        `/api/usuarios/usuarios-sospechosos?minIntentos=${debouncedMinIntentos}`,
        {
          headers: { "X-CSRF-Token": csrfToken },
          withCredentials: true,
          timeout: 10000,
        }
      );
      setUsuarios(response.data);
    } catch (err) {
      console.error("Error al obtener usuarios sospechosos:", err);
      setError("Error al obtener usuarios sospechosos.");
    } finally {
      setLoading(false);
    }
  }, [csrfToken, debouncedMinIntentos]);

  useEffect(() => {
    fetchUsuariosSospechosos();
  }, [csrfToken, debouncedMinIntentos, fetchUsuariosSospechosos]);

  
  const handleToggleBlock = async (idUsuario, bloqueado) => {
    if (user && user.idUsuarios === idUsuario) {
      Swal.fire({
        icon: "info",
        title: "Esta es tu cuenta actual.",
        showConfirmButton: false,
        timer: 1500,
      });
      return;
    }
    const url = bloqueado
      ? `/api/usuarios/desbloquear/${idUsuario}`
      : `/api/usuarios/bloquear/${idUsuario}`;
    try {
      await api.post(
        url,
        {},
        {
          headers: { "X-CSRF-Token": csrfToken },
          withCredentials: true,
          timeout: 10000,
        }
      );
      Swal.fire({
        icon: "success",
        title: bloqueado ? "Usuario desbloqueado" : "Usuario bloqueado",
        showConfirmButton: false,
        timer: 1500,
      });
      // Refrescar lista
      fetchUsuariosActualizados();
    } catch (err) {
      console.error("Error al cambiar el estado de bloqueo:", err);
      Swal.fire({
        icon: "error",
        title: "Error al cambiar el estado de bloqueo",
        text: err.response?.data?.message || "Intenta de nuevo",
      });
    }
  };

  const fetchUsuariosActualizados = async () => {
    if (!csrfToken) return;
    try {
      const response = await api.get(
        `/api/usuarios/usuarios-sospechosos?minIntentos=${debouncedMinIntentos}`,
        {
          headers: { "X-CSRF-Token": csrfToken },
          withCredentials: true,
          timeout: 10000,
        }
      );
      setUsuarios(response.data);
    } catch (err) {
      console.error("Error al actualizar usuarios sospechosos:", err);
      setError("Error al actualizar usuarios sospechosos.");
    }
  };


  const handleChangeMinIntentosReales = (event) => {
    const value = parseInt(event.target.value);
    setMinIntentosReales(isNaN(value) || value < 0 ? 0 : value);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center mt-8">
        <FaUserSecret className="text-yellow-500 text-6xl animate-fade" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-4 p-4 bg-red-100 text-red-700 rounded text-center">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      <h1 className="text-center text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">
        Usuarios Sospechosos
      </h1>
  
      {/* Filtro de Intentos Reales */}
      <div className="flex justify-center mb-6">
        <input
          type="number"
          min="0"
          value={minIntentosReales}
          onChange={handleChangeMinIntentosReales}
          placeholder="Min. Intentos Reales"
          className="w-48 p-2 border border-gray-300 dark:border-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-yellow-500 dark:bg-gray-900 dark:text-gray-100"
        />
      </div>
  
      {/* Contenedor responsivo de la tabla */}
      <div className="overflow-x-auto shadow-lg rounded-lg my-4">
        <table className="w-full min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-200 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Nombre
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Teléfono
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Correo
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Intentos Realizados
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Rol
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Acción
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {usuarios.length > 0 ? (
              usuarios.map((usuario) => (
                <tr
                  key={usuario.idUsuarios}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="text-sm font-bold text-gray-800 dark:text-gray-100">
                      {usuario.nombre}
                    </p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                    {usuario.telefono}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                    {usuario.correo}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="inline-block px-2 py-1 text-xs font-medium text-red-800 bg-red-100 rounded-full">
                      {usuario.IntentosReales}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <FaUserTag className="text-gray-500 dark:text-gray-300" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {usuario.rol}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {user && user.idUsuarios === usuario.idUsuarios ? (
                      <button
                        className="flex items-center justify-center gap-1 px-4 py-2 rounded-full bg-gray-400 text-white cursor-not-allowed"
                        disabled
                      >
                        Cuenta actual
                      </button>
                    ) : (
                      <button
                        className={`flex items-center justify-center gap-1 px-4 py-2 rounded-full transition-colors ${
                          usuario.bloqueado
                            ? "bg-green-500 hover:bg-green-600 text-white"
                            : "bg-red-500 hover:bg-red-600 text-white"
                        }`}
                        onClick={() =>
                          handleToggleBlock(usuario.idUsuarios, usuario.bloqueado)
                        }
                      >
                        {usuario.bloqueado ? (
                          <>
                            <FaLockOpen />
                            Desbloquear
                          </>
                        ) : (
                          <>
                            <FaLock />
                            Bloquear
                          </>
                        )}
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={6}
                  className="text-center py-6 text-sm text-gray-700 dark:text-gray-300"
                >
                  No hay usuarios sospechosos.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
  
};

export default UsuariosSospechosos;
