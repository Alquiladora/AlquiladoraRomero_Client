import React, { useEffect, useState } from "react";
import api from "../../../utils/AxiosConfig";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle, faSearch } from "@fortawesome/free-solid-svg-icons";

const roleOptions = [
  { value: "all", label: "Todos los roles" },
  { value: "administrador", label: "Administradores" },
  { value: "cliente", label: "Clientes" },
  { value: "repartidor", label: "Repartidores" },
];

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUserSessions, setSelectedUserSessions] = useState([]);
  const [selectedUserName, setSelectedUserName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const usersPerPage = 8;

  useEffect(() => {
    fetchUsuarios();
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

  const administradores = usuarios.filter(
    (usuario) => usuario.rol === "administrador"
  );
  const clientes = usuarios.filter((usuario) => usuario.rol === "cliente");
  const repartidores = usuarios.filter((usuario) => usuario.rol === "repartidor");

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

  // Independent pagination states
  const [currentPageAdmin, setCurrentPageAdmin] = useState(1);
  const [currentPageClient, setCurrentPageClient] = useState(1);
  const [currentPageRepartidor, setCurrentPageRepartidor] = useState(1);

  // Pagination logic for each role
  const indexOfLastAdmin = currentPageAdmin * usersPerPage;
  const indexOfFirstAdmin = indexOfLastAdmin - usersPerPage;
  const paginatedAdministradores = filteredAdministradores.slice(
    indexOfFirstAdmin,
    indexOfLastAdmin
  );
  const totalPagesAdmin = Math.ceil(filteredAdministradores.length / usersPerPage);

  const indexOfLastClient = currentPageClient * usersPerPage;
  const indexOfFirstClient = indexOfLastClient - usersPerPage;
  const paginatedClientes = filteredClientes.slice(indexOfFirstClient, indexOfLastClient);
  const totalPagesClients = Math.ceil(filteredClientes.length / usersPerPage);

  const indexOfLastRepartidor = currentPageRepartidor * usersPerPage;
  const indexOfFirstRepartidor = indexOfLastRepartidor - usersPerPage;
  const paginatedRepartidores = filteredRepartidores.slice(
    indexOfFirstRepartidor,
    indexOfLastRepartidor
  );
  const totalPagesRepartidores = Math.ceil(filteredRepartidores.length / usersPerPage);

  // Pagination handlers
  const paginateAdmin = (pageNumber) => setCurrentPageAdmin(pageNumber);
  const paginateClient = (pageNumber) => setCurrentPageClient(pageNumber);
  const paginateRepartidor = (pageNumber) => setCurrentPageRepartidor(pageNumber);

  // Check if there are no results after filtering
  const noResults =
    filteredAdministradores.length === 0 &&
    filteredClientes.length === 0 &&
    filteredRepartidores.length === 0;

  if (loading) {
    return (
      <div className="flex justify-center mt-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-4 p-4 bg-red-100 text-red-700 rounded-lg shadow-sm">
        No se pudo obtener la lista de usuarios.
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-2 sm:p-4 md:p-6">
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .fadeIn {
            animation: fadeIn 0.5s ease-out forwards;
          }
          @keyframes slideIn {
            from { transform: translateX(-20px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
          .slideIn {
            animation: slideIn 0.5s ease-out forwards;
          }
        `}
      </style>

      {/* Header animado */}
      <div className="mb-4 sm:mb-6 text-center fadeIn">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-100">
          Gestión de Usuarios
        </h1>
      </div>

      {/* Filtros */}
      <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 fadeIn">
        <div className="relative w-full sm:max-w-md">
          <input
            type="text"
            placeholder="Buscar por nombre o correo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border border-gray-300 dark:border-gray-700 rounded-full py-1 sm:py-2 pl-8 sm:pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white dark:bg-gray-900 text-sm sm:text-base text-gray-800 dark:text-gray-200"
          />
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <FontAwesomeIcon icon={faSearch} className="text-gray-500 text-sm sm:text-base" />
          </div>
        </div>
        <div className="w-full sm:max-w-xs">
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="w-full border border-gray-300 dark:border-gray-700 rounded-full py-1 sm:py-2 pl-4 pr-2 focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white dark:bg-gray-900 text-sm sm:text-base text-gray-800 dark:text-gray-200"
          >
            {roleOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-2 sm:p-4 space-y-6">
        {/* No Results Message */}
        {noResults ? (
          <div className="text-center py-6 sm:py-8 fadeIn">
            <p className="text-lg sm:text-xl font-medium text-gray-600 dark:text-gray-400">
              No se encontraron resultados
            </p>
            <p className="text-sm sm:text-base text-gray-500 dark:text-gray-500 mt-2">
              Intenta ajustar los filtros o la búsqueda.
            </p>
          </div>
        ) : (
          <>
            {/* Tabla de Administradores */}
            {filteredAdministradores.length > 0 && (
              <section className="fadeIn">
                <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-4 text-gray-700 dark:text-gray-200">
                  Administradores
                </h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-100 dark:bg-gray-700">
                      <tr>
                        <th className="px-2 sm:px-4 py-1 sm:py-2 text-left text-xs font-medium text-gray-600 dark:text-gray-300">
                          Nombre
                        </th>
                        <th className="px-2 sm:px-4 py-1 sm:py-2 text-left text-xs font-medium text-gray-600 dark:text-gray-300">
                          Veces Bloqueado
                        </th>
                        <th className="px-2 sm:px-4 py-1 sm:py-2 text-left text-xs font-medium text-gray-600 dark:text-gray-300">
                          Cambios de Contraseña
                        </th>
                        <th className="px-2 sm:px-4 py-1 sm:py-2 text-left text-xs font-medium text-gray-600 dark:text-gray-300">
                          Inicios de Sesión
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {paginatedAdministradores.map((usuario, index) => (
                        <tr
                          key={usuario.idUsuarios}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors slideIn"
                          style={{ animationDelay: `${index * 100}ms` }}
                        >
                          <td className="px-2 sm:px-4 py-1 sm:py-2 whitespace-nowrap">
                            <div className="flex flex-col">
                              <span className="font-bold text-gray-800 dark:text-gray-100 text-xs sm:text-sm">
                                {usuario.correo}
                              </span>
                              <span className="text-xs text-gray-600 dark:text-gray-400">
                                {`${usuario.nombre} ${usuario.apellidoP} ${usuario.apellidoM}`}
                              </span>
                            </div>
                          </td>
                          <td className="px-2 sm:px-4 py-1 sm:py-2 whitespace-nowrap text-gray-700 dark:text-gray-200 text-xs sm:text-sm">
                            {usuario.veces_bloqueado}
                          </td>
                          <td className="px-2 sm:px-4 py-1 sm:py-2 whitespace-nowrap text-gray-700 dark:text-gray-200 text-xs sm:text-sm">
                            {usuario.cambios_contrasena}
                          </td>
                          <td className="px-2 sm:px-4 py-1 sm:py-2 whitespace-nowrap text-gray-700 dark:text-gray-200 text-xs sm:text-sm">
                            {usuario.veces_sesion}
                            <button
                              onClick={() => handleOpenDialog(usuario)}
                              className="ml-1 sm:ml-2 text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-300 transition-colors"
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
                  <div className="mt-4 flex justify-center gap-2 fadeIn">
                    {Array.from({ length: totalPagesAdmin }, (_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => paginateAdmin(i + 1)}
                        className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm ${
                          currentPageAdmin === i + 1
                            ? "bg-yellow-500 text-white"
                            : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* Tabla de Clientes */}
            {filteredClientes.length > 0 && (
              <section className="fadeIn">
                <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-4 text-gray-700 dark:text-gray-200">
                  Clientes
                </h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-100 dark:bg-gray-700">
                      <tr>
                        <th className="px-2 sm:px-4 py-1 sm:py-2 text-left text-xs font-medium text-gray-600 dark:text-gray-300">
                          Nombre
                        </th>
                        <th className="px-2 sm:px-4 py-1 sm:py-2 text-left text-xs font-medium text-gray-600 dark:text-gray-300">
                          Veces Bloqueado
                        </th>
                        <th className="px-2 sm:px-4 py-1 sm:py-2 text-left text-xs font-medium text-gray-600 dark:text-gray-300">
                          Cambios de Contraseña
                        </th>
                        <th className="px-2 sm:px-4 py-1 sm:py-2 text-left text-xs font-medium text-gray-600 dark:text-gray-300">
                          Inicios de Sesión
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {paginatedClientes.map((usuario, index) => (
                        <tr
                          key={usuario.idUsuarios}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors slideIn"
                          style={{ animationDelay: `${index * 100}ms` }}
                        >
                          <td className="px-2 sm:px-4 py-1 sm:py-2 whitespace-nowrap">
                            <div className="flex flex-col">
                              <span className="font-bold text-gray-800 dark:text-gray-100 text-xs sm:text-sm">
                                {usuario.Correo || usuario.correo}
                              </span>
                              <span className="text-xs text-gray-600 dark:text-gray-400">
                                {`${usuario.nombre} ${usuario.apellidoP} ${usuario.apellidoM}`}
                              </span>
                            </div>
                          </td>
                          <td className="px-2 sm:px-4 py-1 sm:py-2 whitespace-nowrap text-gray-700 dark:text-gray-200 text-xs sm:text-sm">
                            {usuario.veces_bloqueado}
                          </td>
                          <td className="px-2 sm:px-4 py-1 sm:py-2 whitespace-nowrap text-gray-700 dark:text-gray-200 text-xs sm:text-sm">
                            {usuario.cambios_contrasena}
                          </td>
                          <td className="px-2 sm:px-4 py-1 sm:py-2 whitespace-nowrap text-gray-700 dark:text-gray-200 text-xs sm:text-sm">
                            {usuario.veces_sesion}
                            <button
                              onClick={() => handleOpenDialog(usuario)}
                              className="ml-1 sm:ml-2 text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-300 transition-colors"
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
                  <div className="mt-2 sm:mt-4 flex justify-center gap-2 fadeIn">
                    {Array.from({ length: totalPagesClients }, (_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => paginateClient(i + 1)}
                        className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm ${
                          currentPageClient === i + 1
                            ? "bg-yellow-500 text-white"
                            : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* Tabla de Repartidores */}
            {filteredRepartidores.length > 0 && (
              <section className="fadeIn">
                <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-4 text-gray-700 dark:text-gray-200">
                  Repartidores
                </h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-100 dark:bg-gray-700">
                      <tr>
                        <th className="px-2 sm:px-4 py-1 sm:py-2 text-left text-xs font-medium text-gray-600 dark:text-gray-300">
                          Nombre
                        </th>
                        <th className="px-2 sm:px-4 py-1 sm:py-2 text-left text-xs font-medium text-gray-600 dark:text-gray-300">
                          Veces Bloqueado
                        </th>
                        <th className="px-2 sm:px-4 py-1 sm:py-2 text-left text-xs font-medium text-gray-600 dark:text-gray-300">
                          Cambios de Contraseña
                        </th>
                        <th className="px-2 sm:px-4 py-1 sm:py-2 text-left text-xs font-medium text-gray-600 dark:text-gray-300">
                          Inicios de Sesión
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {paginatedRepartidores.map((usuario, index) => (
                        <tr
                          key={usuario.idUsuarios}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors slideIn"
                          style={{ animationDelay: `${index * 100}ms` }}
                        >
                          <td className="px-2 sm:px-4 py-1 sm:py-2 whitespace-nowrap">
                            <div className="flex flex-col">
                              <span className="font-bold text-gray-800 dark:text-gray-100 text-xs sm:text-sm">
                                {usuario.correo}
                              </span>
                              <span className="text-xs text-gray-600 dark:text-gray-400">
                                {`${usuario.nombre} ${usuario.apellidoP} ${usuario.apellidoM}`}
                              </span>
                            </div>
                          </td>
                          <td className="px-2 sm:px-4 py-1 sm:py-2 whitespace-nowrap text-gray-700 dark:text-gray-200 text-xs sm:text-sm">
                            {usuario.veces_bloqueado}
                          </td>
                          <td className="px-2 sm:px-4 py-1 sm:py-2 whitespace-nowrap text-gray-700 dark:text-gray-200 text-xs sm:text-sm">
                            {usuario.cambios_contrasena}
                          </td>
                          <td className="px-2 sm:px-4 py-1 sm:py-2 whitespace-nowrap text-gray-700 dark:text-gray-200 text-xs sm:text-sm">
                            {usuario.veces_sesion}
                            <button
                              onClick={() => handleOpenDialog(usuario)}
                              className="ml-1 sm:ml-2 text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-300 transition-colors"
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
                  <div className="mt-2 sm:mt-4 flex justify-center gap-2 fadeIn">
                    {Array.from({ length: totalPagesRepartidores }, (_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => paginateRepartidor(i + 1)}
                        className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm ${
                          currentPageRepartidor === i + 1
                            ? "bg-yellow-500 text-white"
                            : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                        }`}
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

      {/* Modal de detalles de sesiones */}
      {openDialog && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 fadeIn">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full p-2 sm:p-4 md:p-6">
            <div className="flex justify-between items-center mb-2 sm:mb-4">
              <h3 className="text-sm sm:text-lg md:text-xl font-semibold text-gray-800 dark:text-gray-100">
                Detalles de Sesiones de {selectedUserName}
              </h3>
              <button
                onClick={handleCloseDialog}
                className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 text-xs sm:text-sm md:text-base"
              >
                Cerrar
              </button>
            </div>
            {selectedUserSessions.length > 0 ? (
              <div className="overflow-x-auto max-h-[300px] sm:max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-100 dark:scrollbar-track-gray-800">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-100 dark:bg-gray-700 sticky top-0">
                    <tr>
                      <th className="px-2 sm:px-3 md:px-4 py-1 sm:py-2 text-left text-xs font-medium text-gray-600 dark:text-gray-300">
                        Inicio de Sesión
                      </th>
                      <th className="px-2 sm:px-3 md:px-4 py-1 sm:py-2 text-left text-xs font-medium text-gray-600 dark:text-gray-300">
                        Fin de Sesión
                      </th>
                      <th className="px-2 sm:px-3 md:px-4 py-1 sm:py-2 text-left text-xs font-medium text-gray-600 dark:text-gray-300">
                        IP
                      </th>
                      <th className="px-2 sm:px-3 md:px-4 py-1 sm:py-2 text-left text-xs font-medium text-gray-600 dark:text-gray-300">
                        Dispositivo
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {selectedUserSessions.map((sesion, index) => (
                      <tr
                        key={sesion.id}
                        className="slideIn"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <td className="px-2 sm:px-3 md:px-4 py-1 sm:py-2 text-xs sm:text-sm">
                          {sesion.horaInicio
                            ? new Date(sesion.horaInicio).toLocaleString()
                            : "N/A"}
                        </td>
                        <td className="px-2 sm:px-3 md:px-4 py-1 sm:py-2 text-xs sm:text-sm">
                          {sesion.horaFin
                            ? new Date(sesion.horaFin).toLocaleString()
                            : "Sesión Activa"}
                        </td>
                        <td className="px-2 sm:px-3 md:px-4 py-1 sm:py-2 text-xs sm:text-sm">
                          {sesion.direccionIP || "N/A"}
                        </td>
                        <td className="px-2 sm:px-3 md:px-4 py-1 sm:py-2 text-xs sm:text-sm">
                          {sesion.tipoDispositivo || "N/A"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm">
                No hay sesiones disponibles.
              </p>
            )}
            <div className="mt-2 sm:mt-4 flex justify-end">
              <button
                onClick={handleCloseDialog}
                className="px-2 sm:px-4 py-1 sm:py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg text-xs sm:text-sm"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Usuarios;