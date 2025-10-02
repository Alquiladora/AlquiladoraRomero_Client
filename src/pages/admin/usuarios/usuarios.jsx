import React, { useEffect, useState } from "react";
import api from "../../../utils/AxiosConfig";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle, faSearch, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../../../hooks/ContextAuth";
import { toast } from "react-toastify";
import CustomLoading from "../../../components/spiner/SpinerGlobal";
const roleOptions = [
  { value: "administrador", label: "Administrador" },
  { value: "cliente", label: "Cliente" },
  { value: "repartidor", label: "Repartidor" },
];

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const { user, logout, csrfToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUserSessions, setSelectedUserSessions] = useState([]);
  const [selectedUserName, setSelectedUserName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [currentAdminId, setCurrentAdminId] = useState(null);
  const [updatingUserId, setUpdatingUserId] = useState(null);
  const usersPerPage = 8;

  useEffect(() => {
    fetchUsuarios();
    const fetchCurrentAdmin = async () => {
      try {
        const response = await api.get("/api/usuarios/current", {
          withCredentials: true,
        });
        setCurrentAdminId(response.data.idUsuarios);
      } catch (error) {
        console.error("Error fetching current admin:", error);
      }
    };
    fetchCurrentAdmin();
  }, []);

  const fetchUsuarios = async () => {
    try {
      const response = await api.get("/api/usuarios/lista", {
        withCredentials: true,
      });
      setUsuarios(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
      setError(true);
      setLoading(false);
    }
  };

  const handleOpenDialog = async (usuario) => {
    setSelectedUserName(
      `${usuario.nombre} ${usuario.apellidoP} ${usuario.apellidoM}`
    );
    try {
      const response = await api.get(
        `/api/usuarios/${usuario.idUsuarios}/sesiones`,
        {
          withCredentials: true,
          timeout: 10000,
        }
      );
      setSelectedUserSessions(response.data);
    } catch (error) {
      console.error("Error al obtener detalles de sesiones:", error);
      setSelectedUserSessions([]);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUserSessions([]);
    setSelectedUserName("");
  };

  const handleRoleChange = async (userId, newRole) => {
    if (userId === currentAdminId) {
      toast.error("No puedes cambiar tu propio rol.");
      return;
    }
    setUpdatingUserId(userId);

    try {
      const response = await api.put(
        `/api/usuarios/${userId}/rol`,
        { rol: newRole },
        {
          withCredentials: true,
          headers: { "X-CSRF-Token": csrfToken },
        }
      );

      setUsuarios((prev) =>
        prev.map((u) =>
          u.idUsuarios === userId ? { ...u, rol: newRole } : u
        )
      );
      toast.success(response.data.message || "Rol actualizado correctamente");
    } catch (err) {
      console.error("Error actualizando rol:", err);
      if (err.response && err.response.data && err.response.data.message) {
        toast.error(err.response.data.message);
      } else if (err.request) {
        toast.error("No hay respuesta del servidor. Intenta de nuevo.");
      } else {
        toast.error("Error al actualizar el rol. Intenta más tarde.");
      }
    } finally {
      setTimeout(() => {
        setUpdatingUserId(null);
      }, 500); // Delay to ensure spinner is visible for a short time
    }
  };

  const administradores = usuarios.filter(
    (usuario) => usuario.rol === "administrador"
  );
  const clientes = usuarios.filter((usuario) => usuario.rol === "cliente");
  const repartidores = usuarios.filter(
    (usuario) => usuario.rol === "repartidor"
  );

  const filterBySearchAndRole = (array) =>
    array.filter((usuario) => {
      const termMatch =
        usuario.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        usuario.correo.toLowerCase().includes(searchTerm.toLowerCase());
      if (!termMatch) return false;
      return filterRole === "all" || usuario.rol === filterRole;
    });

  const filteredAdministradores = filterBySearchAndRole(administradores);
  const filteredClientes = filterBySearchAndRole(clientes);
  const filteredRepartidores = filterBySearchAndRole(repartidores);

  const [currentPageAdmin, setCurrentPageAdmin] = useState(1);
  const [currentPageClient, setCurrentPageClient] = useState(1);
  const [currentPageRepartidor, setCurrentPageRepartidor] = useState(1);

  const indexOfLastAdmin = currentPageAdmin * usersPerPage;
  const indexOfFirstAdmin = indexOfLastAdmin - usersPerPage;
  const paginatedAdministradores = filteredAdministradores.slice(
    indexOfFirstAdmin,
    indexOfLastAdmin
  );
  const totalPagesAdmin = Math.ceil(
    filteredAdministradores.length / usersPerPage
  );

  const indexOfLastClient = currentPageClient * usersPerPage;
  const indexOfFirstClient = indexOfLastClient - usersPerPage;
  const paginatedClientes = filteredClientes.slice(
    indexOfFirstClient,
    indexOfLastClient
  );
  const totalPagesClients = Math.ceil(filteredClientes.length / usersPerPage);

  const indexOfLastRepartidor = currentPageRepartidor * usersPerPage;
  const indexOfFirstRepartidor = indexOfLastRepartidor - usersPerPage;
  const paginatedRepartidores = filteredRepartidores.slice(
    indexOfFirstRepartidor,
    indexOfLastRepartidor
  );
  const totalPagesRepartidores = Math.ceil(
    filteredRepartidores.length / usersPerPage
  );

  const paginateAdmin = (pageNumber) => setCurrentPageAdmin(pageNumber);
  const paginateClient = (pageNumber) => setCurrentPageClient(pageNumber);
  const paginateRepartidor = (pageNumber) =>
    setCurrentPageRepartidor(pageNumber);

  const noResults =
    filteredAdministradores.length === 0 &&
    filteredClientes.length === 0 &&
    filteredRepartidores.length === 0;

  if (loading) {
    return (
       <CustomLoading/>

    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-4">
        <div className="p-4 bg-red-50 text-red-700 rounded-lg shadow-md">
          No se pudo obtener la lista de usuarios.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes slideIn {
            from { transform: translateX(-20px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
          .fadeIn {
            animation: fadeIn 0.5s ease-out forwards;
          }
          .slideIn {
            animation: slideIn 0.5s ease-out forwards;
          }
          .scrollbar-thin {
            scrollbar-width: thin;
            scrollbar-color: #d1d5db transparent;
          }
          .scrollbar-thin::-webkit-scrollbar {
            width: 8px;
          }
          .scrollbar-thin::-webkit-scrollbar-track {
            background: transparent;
          }
          .scrollbar-thin::-webkit-scrollbar-thumb {
            background: #d1d5db;
            border-radius: 4px;
          }
          .scrollbar-thin::-webkit-scrollbar-thumb:hover {
            background: #9ca3af;
          }
        `}
      </style>

      <div className="mb-6 text-center fadeIn">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-gray-100">
          Gestión de Usuarios
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          Administra los roles y sesiones de los usuarios
        </p>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between fadeIn">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Buscar por nombre o correo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-yellow-500 focus:outline-none bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 text-sm sm:text-base transition-all"
          />
          <FontAwesomeIcon
            icon={faSearch}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
          />
        </div>
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="w-full sm:w-48 py-2 px-4 rounded-full border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-yellow-500 focus:outline-none bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 text-sm sm:text-base transition-all"
        >
          <option value="all">Todos los roles</option>
          {roleOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 space-y-8">
        {noResults ? (
          <div className="text-center py-8 fadeIn">
            <p className="text-xl font-medium text-gray-600 dark:text-gray-400">
              No se encontraron resultados
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
              Intenta ajustar los filtros o la búsqueda.
            </p>
          </div>
        ) : (
          <>
            {filteredAdministradores.length > 0 && (
              <section className="fadeIn">
                <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-gray-700 dark:text-gray-200">
                  Administradores
                </h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-100 dark:bg-gray-700">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">
                          Nombre
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">
                          Veces Bloqueado
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">
                          Cambios de Contraseña
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">
                          Rol
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">
                          Inicios de Sesión
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {paginatedAdministradores.map((usuario, index) => (
                        <tr
                          key={usuario.idUsuarios}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors slideIn"
                          style={{ animationDelay: `${index * 100}ms` }}
                        >
                          <td className="px-4 py-3">
                            <div className="flex flex-col">
                              <span className="font-bold text-gray-800 dark:text-gray-100 text-sm">
                                {usuario.correo}
                              </span>
                              <span className="text-xs text-gray-600 dark:text-gray-400">
                                {`${usuario.nombre} ${usuario.apellidoP} ${usuario.apellidoM}`}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-200">
                            {usuario.veces_bloqueado}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-200">
                            {usuario.cambios_contrasena}
                          </td>
                          <td className="px-4 py-3">
                            <div className="relative">
                              <select
                                disabled={
                                  updatingUserId === usuario.idUsuarios ||
                                  usuario.idUsuarios === user?.idUsuarios ||
                                  usuario.idUsuarios === user?.id
                                }
                                value={usuario.rol}
                                onChange={(e) =>
                                  handleRoleChange(
                                    usuario.idUsuarios,
                                    e.target.value
                                  )
                                }
                                className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-yellow-500 focus:outline-none disabled:opacity-50 appearance-none pr-8"
                                title={
                                  usuario.idUsuarios === user?.idUsuarios ||
                                  usuario.idUsuarios === user?.id
                                    ? "No puedes cambiar tu propio rol"
                                    : ""
                                }
                              >
                                {roleOptions.map(({ value, label }) => (
                                  <option key={value} value={value}>
                                    {label}
                                  </option>
                                ))}
                              </select>
                              {updatingUserId === usuario.idUsuarios && (
                                <FontAwesomeIcon
                                  icon={faSpinner}
                                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-yellow-500 animate-spin"
                                />
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-200">
                            {usuario.veces_sesion}
                            <button
                              onClick={() => handleOpenDialog(usuario)}
                              className="ml-2 text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-300 transition-colors"
                            >
                              <FontAwesomeIcon icon={faInfoCircle} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {totalPagesAdmin > 1 && (
                  <div className="mt-4 flex justify-center gap-2">
                    {Array.from({ length: totalPagesAdmin }, (_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => paginateAdmin(i + 1)}
                        className={`px-3 py-1 rounded-full text-sm ${
                          currentPageAdmin === i + 1
                            ? "bg-yellow-500 text-white"
                            : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                        } transition-colors`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                )}
              </section>
            )}

            {filteredClientes.length > 0 && (
              <section className="fadeIn">
                <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-gray-700 dark:text-gray-200">
                  Clientes
                </h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-100 dark:bg-gray-700">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">
                          Nombre
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">
                          Veces Bloqueado
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">
                          Cambios de Contraseña
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">
                          Rol
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">
                          Inicios de Sesión
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {paginatedClientes.map((usuario, index) => (
                        <tr
                          key={usuario.idUsuarios}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors slideIn"
                          style={{ animationDelay: `${index * 100}ms` }}
                        >
                          <td className="px-4 py-3">
                            <div className="flex flex-col">
                              <span className="font-bold text-gray-800 dark:text-gray-100 text-sm">
                                {usuario.correo}
                              </span>
                              <span className="text-xs text-gray-600 dark:text-gray-400">
                                {`${usuario.nombre} ${usuario.apellidoP} ${usuario.apellidoM}`}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-200">
                            {usuario.veces_bloqueado}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-200">
                            {usuario.cambios_contrasena}
                          </td>
                          <td className="px-4 py-3">
                            <div className="relative">
                              <select
                                disabled={updatingUserId === usuario.idUsuarios}
                                value={usuario.rol}
                                onChange={(e) =>
                                  handleRoleChange(
                                    usuario.idUsuarios,
                                    e.target.value
                                  )
                                }
                                className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-yellow-500 focus:outline-none appearance-none pr-8"
                              >
                                {roleOptions.map(({ value, label }) => (
                                  <option key={value} value={value}>
                                    {label}
                                  </option>
                                ))}
                              </select>
                              {updatingUserId === usuario.idUsuarios && (
                                <FontAwesomeIcon
                                  icon={faSpinner}
                                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-yellow-500 animate-spin"
                                />
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-200">
                            {usuario.veces_sesion}
                            <button
                              onClick={() => handleOpenDialog(usuario)}
                              className="ml-2 text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-300 transition-colors"
                            >
                              <FontAwesomeIcon icon={faInfoCircle} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {totalPagesClients > 1 && (
                  <div className="mt-4 flex justify-center gap-2">
                    {Array.from({ length: totalPagesClients }, (_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => paginateClient(i + 1)}
                        className={`px-3 py-1 rounded-full text-sm ${
                          currentPageClient === i + 1
                            ? "bg-yellow-500 text-white"
                            : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                        } transition-colors`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                )}
              </section>
            )}

            {filteredRepartidores.length > 0 && (
              <section className="fadeIn">
                <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-gray-700 dark:text-gray-200">
                  Repartidores
                </h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-100 dark:bg-gray-700">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">
                          Nombre
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">
                          Veces Bloqueado
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">
                          Cambios de Contraseña
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">
                          Rol
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">
                          Inicios de Sesión
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {paginatedRepartidores.map((usuario, index) => (
                        <tr
                          key={usuario.idUsuarios}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors slideIn"
                          style={{ animationDelay: `${index * 100}ms` }}
                        >
                          <td className="px-4 py-3">
                            <div className="flex flex-col">
                              <span className="font-bold text-gray-800 dark:text-gray-100 text-sm">
                                {usuario.correo}
                              </span>
                              <span className="text-xs text-gray-600 dark:text-gray-400">
                                {`${usuario.nombre} ${usuario.apellidoP} ${usuario.apellidoM}`}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-200">
                            {usuario.veces_bloqueado}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-200">
                            {usuario.cambios_contrasena}
                          </td>
                          <td className="px-4 py-3">
                            <div className="relative">
                              <select
                                disabled={updatingUserId === usuario.idUsuarios}
                                value={usuario.rol}
                                onChange={(e) =>
                                  handleRoleChange(
                                    usuario.idUsuarios,
                                    e.target.value
                                  )
                                }
                                className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-yellow-500 focus:outline-none appearance-none pr-8"
                              >
                                {roleOptions.map(({ value, label }) => (
                                  <option key={value} value={value}>
                                    {label}
                                  </option>
                                ))}
                              </select>
                              {updatingUserId === usuario.idUsuarios && (
                                <FontAwesomeIcon
                                  icon={faSpinner}
                                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-yellow-500 animate-spin"
                                />
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-200">
                            {usuario.veces_sesion}
                            <button
                              onClick={() => handleOpenDialog(usuario)}
                              className="ml-2 text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-300 transition-colors"
                            >
                              <FontAwesomeIcon icon={faInfoCircle} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {totalPagesRepartidores > 1 && (
                  <div className="mt-4 flex justify-center gap-2">
                    {Array.from({ length: totalPagesRepartidores }, (_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => paginateRepartidor(i + 1)}
                        className={`px-3 py-1 rounded-full text-sm ${
                          currentPageRepartidor === i + 1
                            ? "bg-yellow-500 text-white"
                            : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                        } transition-colors`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                )}
              </section>
            )}
          </>
        )}
      </div>

      {openDialog && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/70 backdrop-blur-sm p-4 fadeIn">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                    Historial de Sesiones
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedUserName}
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseDialog}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-all"
                aria-label="Cerrar diálogo"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto max-h-[70vh] scrollbar-thin p-4 sm:p-6">
              {selectedUserSessions.length > 0 ? (
                <>
                  <div className="hidden md:block">
                    <table className="w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0 z-10">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                            Inicio de Sesión
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                            Fin de Sesión
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                            Dirección IP
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                            Dispositivo
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {selectedUserSessions.map((sesion, index) => (
                          <tr
                            key={sesion.id}
                            className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors slideIn"
                            style={{ animationDelay: `${index * 50}ms` }}
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                              {sesion.horaInicio
                                ? new Date(
                                    sesion.horaInicio
                                  ).toLocaleDateString("es-ES", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })
                                : "N/A"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {sesion.horaFin ? (
                                new Date(sesion.horaFin).toLocaleDateString(
                                  "es-ES",
                                  {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1.5 animate-pulse"></span>
                                  Sesión Activa
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm font-mono text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                                {sesion.direccionIP || "N/A"}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-8 w-8">
                                  {sesion.tipoDispositivo
                                    ?.toLowerCase()
                                    .includes("mobile") ? (
                                    <div className="h-8 w-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                                      <svg
                                        className="w-4 h-4 text-blue-600 dark:text-blue-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                                        />
                                      </svg>
                                    </div>
                                  ) : (
                                    <div className="h-8 w-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                                      <svg
                                        className="w-4 h-4 text-purple-600 dark:text-purple-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 22"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                        />
                                      </svg>
                                    </div>
                                  )}
                                </div>
                                <div className="ml-3 text-sm text-gray-900 dark:text-gray-100">
                                  {sesion.tipoDispositivo || "Desconocido"}
                                </div>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="md:hidden space-y-4">
                    {selectedUserSessions.map((sesion, index) => (
                      <div
                        key={sesion.id}
                        className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600 slideIn"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            {sesion.tipoDispositivo
                              ?.toLowerCase()
                              .includes("mobile") ? (
                              <div className="h-6 w-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                                <svg
                                  className="w-4 h-4 text-blue-600 dark:text-blue-400"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                                  />
                                </svg>
                              </div>
                            ) : (
                              <div className="h-6 w-6 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                                <svg
                                  className="w-4 h-4 text-purple-600 dark:text-purple-400"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                  />
                                </svg>
                              </div>
                            )}
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {sesion.tipoDispositivo || "Desconocido"}
                            </span>
                          </div>
                          {!sesion.horaFin && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                              <span className="w-1 h-1 bg-green-400 rounded-full mr-1 animate-pulse"></span>
                              Activa
                            </span>
                          )}
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">
                              Inicio:
                            </span>
                            <span className="text-gray-900 dark:text-gray-100 font-medium">
                              {sesion.horaInicio
                                ? new Date(
                                    sesion.horaInicio
                                  ).toLocaleDateString("es-ES", {
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })
                                : "N/A"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">
                              Fin:
                            </span>
                            <span className="text-gray-900 dark:text-gray-100 font-medium">
                              {sesion.horaFin
                                ? new Date(sesion.horaFin).toLocaleDateString(
                                    "es-ES",
                                    {
                                      month: "short",
                                      day: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    }
                                  )
                                : "En curso"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">
                              IP:
                            </span>
                            <span className="text-gray-900 dark:text-gray-100 font-mono text-xs bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                              {sesion.direccionIP || "N/A"}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-center p-8">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                    <svg
                      className="w-8 h-8 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Sin sesiones registradas
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    No hay historial de sesiones disponible para este usuario.
                  </p>
                </div>
              )}
            </div>

            <div className="p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-b-2xl">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedUserSessions.length > 0 &&
                    `${selectedUserSessions.length} sesión${
                      selectedUserSessions.length !== 1 ? "es" : ""
                    } encontrada${
                      selectedUserSessions.length !== 1 ? "s" : ""
                    }`}
                </span>
                <button
                  onClick={handleCloseDialog}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-sm font-medium rounded-lg transition-all shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Usuarios;