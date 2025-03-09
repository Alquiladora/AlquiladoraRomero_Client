import React, { useEffect, useState } from "react";
import api from "../../../utils/AxiosConfig";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle, faSearch } from "@fortawesome/free-solid-svg-icons";

const monthOptions = [
  { value: "all", label: "Todos los meses" },
  { value: "1", label: "Enero" },
  { value: "2", label: "Febrero" },
  { value: "3", label: "Marzo" },
  { value: "4", label: "Abril" },
  { value: "5", label: "Mayo" },
  { value: "6", label: "Junio" },
  { value: "7", label: "Julio" },
  { value: "8", label: "Agosto" },
  { value: "9", label: "Septiembre" },
  { value: "10", label: "Octubre" },
  { value: "11", label: "Noviembre" },
  { value: "12", label: "Diciembre" },
];

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUserSessions, setSelectedUserSessions] = useState([]);
  const [selectedUserName, setSelectedUserName] = useState("");


  const [searchTerm, setSearchTerm] = useState("");
  const [filterMonth, setFilterMonth] = useState("all");


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

  // Función auxiliar para filtrar por búsqueda y por mes (si la fecha existe)
  const filterBySearchAndMonth = (array) =>
    array.filter((usuario) => {
      const termMatch =
        usuario.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        usuario.correo.toLowerCase().includes(searchTerm.toLowerCase());
      if (!termMatch) return false;
      if (filterMonth === "all" || !usuario.fechaCreacion) return true;
      // Se asume que usuario.fechaCreacion es un string ISO
      const mes = new Date(usuario.fechaCreacion).getMonth() + 1;
      return mes === parseInt(filterMonth, 10);
    });

  const filteredAdministradores = filterBySearchAndMonth(administradores);
  const filteredClientes = filterBySearchAndMonth(clientes);
  const filteredRepartidores = filterBySearchAndMonth(repartidores);

  if (loading) {
    return (
      <div className="flex justify-center mt-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-4 p-4 bg-red-100 text-red-700 rounded">
        No se pudo obtener la lista de usuarios.
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      {/* Header animado */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 animate-bounce">
          Gestión de Usuarios
        </h1>
      </div>

      {/* Filtros */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="relative w-full sm:max-w-md">
          <input
            type="text"
            placeholder="Buscar por nombre o correo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border border-gray-300 dark:border-gray-700 rounded-full py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <FontAwesomeIcon icon={faSearch} className="text-gray-500" />
          </div>
        </div>
        <div className="w-full sm:max-w-xs">
          <select
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="w-full border border-gray-300 dark:border-gray-700 rounded-full py-2 pl-4 pr-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
          >
            {monthOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-10">
        {/* Tabla de Administradores */}
        {filteredAdministradores.length > 0 && (
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-700 dark:text-gray-200">
              Administradores
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">
                      Nombre
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">
                      Veces Bloqueado
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">
                      Cambios de Contraseña
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">
                      Inicios de Sesión
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredAdministradores.map((usuario) => (
                    <tr
                      key={usuario.idUsuarios}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-800 dark:text-gray-100">
                            {usuario.correo}
                          </span>
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            {`${usuario.nombre} ${usuario.apellidoP} ${usuario.apellidoM}`}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-200">
                        {usuario.veces_bloqueado}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-200">
                        {usuario.cambios_contrasena}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-200">
                        {usuario.veces_sesion}
                        <button
                          onClick={() => handleOpenDialog(usuario)}
                          className="ml-2 text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 transition-colors"
                        >
                          <FontAwesomeIcon icon={faInfoCircle} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Tabla de Clientes */}
        {filteredClientes.length > 0 && (
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-700 dark:text-gray-200">
              Clientes
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">
                      Nombre
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">
                      Veces Bloqueado
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">
                      Cambios de Contraseña
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">
                      Inicios de Sesión
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredClientes.map((usuario) => (
                    <tr
                      key={usuario.idUsuarios}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-800 dark:text-gray-100">
                            {usuario.Correo || usuario.correo}
                          </span>
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            {`${usuario.nombre} ${usuario.apellidoP} ${usuario.apellidoM}`}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-200">
                        {usuario.veces_bloqueado}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-200">
                        {usuario.cambios_contrasena}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-200">
                        {usuario.veces_sesion}
                        <button
                          onClick={() => handleOpenDialog(usuario)}
                          className="ml-2 text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 transition-colors"
                        >
                          <FontAwesomeIcon icon={faInfoCircle} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Tabla de Repartidores */}
        {filteredRepartidores.length > 0 && (
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-700 dark:text-gray-200">
              Repartidores
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">
                      Nombre
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">
                      Veces Bloqueado
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">
                      Cambios de Contraseña
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">
                      Inicios de Sesión
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredRepartidores.map((usuario) => (
                    <tr
                      key={usuario.idUsuarios}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-800 dark:text-gray-100">
                            {usuario.correo}
                          </span>
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            {`${usuario.nombre} ${usuario.apellidoP} ${usuario.apellidoM}`}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-200">
                        {usuario.veces_bloqueado}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-200">
                        {usuario.cambios_contrasena}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-200">
                        {usuario.veces_sesion}
                        <button
                          onClick={() => handleOpenDialog(usuario)}
                          className="ml-2 text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 transition-colors"
                        >
                          <FontAwesomeIcon icon={faInfoCircle} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>

      {/* Modal de detalles de sesiones */}
      {openDialog && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                Detalles de Sesiones de {selectedUserName}
              </h3>
              <button
                onClick={handleCloseDialog}
                className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
              >
                Cerrar
              </button>
            </div>
            {selectedUserSessions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-100 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 dark:text-gray-300">
                        Inicio de Sesión
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 dark:text-gray-300">
                        Fin de Sesión
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 dark:text-gray-300">
                        IP
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 dark:text-gray-300">
                        Dispositivo
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {selectedUserSessions.map((sesion) => (
                      <tr key={sesion.id}>
                        <td className="px-4 py-2">
                          {sesion.horaInicio
                            ? new Date(sesion.horaInicio).toLocaleString()
                            : "N/A"}
                        </td>
                        <td className="px-4 py-2">
                          {sesion.horaFin
                            ? new Date(sesion.horaFin).toLocaleString()
                            : "Sesión Activa"}
                        </td>
                        <td className="px-4 py-2">
                          {sesion.direccionIP || "N/A"}
                        </td>
                        <td className="px-4 py-2">
                          {sesion.tipoDispositivo || "N/A"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-700 dark:text-gray-300">
                No hay sesiones disponibles.
              </p>
            )}
            <div className="mt-4 flex justify-end">
              <button
                onClick={handleCloseDialog}
                className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded"
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
