import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faInfoCircle,
  faStar,
  faSpinner,
  faToggleOn,
  faToggleOff,
  faChartPie,
  faHistory, 
  faBoxes, 
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import api from "../../../utils/AxiosConfig";
import { useAuth } from "../../../hooks/ContextAuth";


const statusColors = {
  procesando: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  confirmado: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  enviando: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  en_alquiler: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  devuelto: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
  incompleto: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  incidente: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  cancelado: "bg-black text-white dark:bg-black dark:text-white",
  finalizado: "bg-green-200 text-green-900 dark:bg-green-800 dark:text-green-100",
};





const staticResenas = {
  1: [
    {
      calificacion: 5,
      comentario: "Excelente servicio, muy puntual.",
      clienteNombre: "Lucía Torres",
      fecha: "2025-06-01",
    },
    {
      calificacion: 4,
      comentario: "Bueno, pero podría mejorar la comunicación.",
      clienteNombre: "Pedro Ramírez",
      fecha: "2025-06-02",
    },
  ],
  2: [
    {
      calificacion: 4,
      comentario: "Rápida entrega, muy amable.",
      clienteNombre: "Diego Morales",
      fecha: "2025-06-01",
    },
  ],
  3: [],
  4: [
    {
      calificacion: 5,
      comentario: "Todo perfecto, gran repartidor.",
      clienteNombre: "Clara Ortiz",
      fecha: "2025-06-04",
    },
  ],
};

const GestionRepartidores = () => {

  const [searchTerm, setSearchTerm] = useState("");
  const { user, logout, csrfToken } = useAuth();
  const [openDialog, setOpenDialog] = useState(null);
  const [selectedRepartidor, setSelectedRepartidor] = useState(null);
  const [repartidorData, setRepartidorData] = useState({});
  const [updatingStatusId, setUpdatingStatusId] = useState(null);
  const [expandedOrders, setExpandedOrders] = useState({}); 
  const repartidoresPerPage = 8;
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [repartidores, setRepartidores]=useState([]);
  const [historalPedidos, setHistorialPedidos]=useState([])


 
  useEffect(() => {
   
    AxiosRepartidores();
   
  }, []);

  //Funcion para obtener los repartidores
  const AxiosRepartidores = async()=>{
    try{
    const response = await api.get("api/repartidor/administrar/repartidores",{
      withCredentials: true,
      headers: { "X-CSRF-Token": csrfToken },
    });
    setRepartidores(response.data.data)
     setLoading(false);
    console.log("Datos obtenidos de componente de gestion repartidores", response.data.data)
  }catch(error){
    console.error("Error al obtener repartidores", error)
    setError(true);
    setLoading(false);
  }

  }

const AxiosHistorialPedidos = async (repartidorId) => {
  try {
    const response = await api.get(
      `api/repartidor/repartidores/${repartidorId}/historial`,
      {
        withCredentials: true,
        headers: { "X-CSRF-Token": csrfToken },
      }
    );

    const historial = response.data.data; 

    return historial;
  } catch (error) {
    console.error("Error al obtener historial", error);
    toast.error("Error al cargar historial");
    return [];
  }
};
   

  const handleToggleStatus = async (repartidorId, currentStatus) => {
  setUpdatingStatusId(repartidorId);
  const newActivo = currentStatus === "activo" ? 0 : 1;
  try {
    const response = await api.patch(
      `api/repartidor/administrar/repartidores/${repartidorId}/estado`,
      { activo: newActivo }, 
      {
        withCredentials: true,
        headers: { "X-CSRF-Token": csrfToken },
      }
    );
    setRepartidores(prev =>
      prev.map(r =>
        r.idRepartidor === repartidorId
          ? {
              ...r,
              estado: response.data.estado, 
              fechaBaja: response.data.fechaBaja, 
            }
          : r
      )
    );
    toast.success(
      `Repartidor ${response.data.estado === "activo" ? "activado" : "desactivado"} correctamente`
    );
  } catch (error) {
    toast.error("Error al cambiar el estado del repartidor");
    console.error(error);
  } finally {
    setUpdatingStatusId(null);
  }
};



  


  const fetchRepartidorDetails = async(repartidorId) => {
     const historial = await AxiosHistorialPedidos(repartidorId);
    setRepartidorData({
      details: repartidores.find((r) => r.idRepartidor === repartidorId),
      history: historial,
      reviews: staticResenas[repartidorId] || [],
    });
  };

  const handleOpenDialog = (repartidor, dialogType) => {
    setSelectedRepartidor(repartidor);
    setOpenDialog(dialogType);
    fetchRepartidorDetails(repartidor.idRepartidor);
    setExpandedOrders({}); 
  };

  const handleCloseDialog = () => {
    setOpenDialog(null);
    setSelectedRepartidor(null);
    setRepartidorData({});
    setExpandedOrders({});
  };

  const handleToggleOrderExpansion = (orderId) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  const filteredRepartidores = repartidores.filter((repartidor) =>
    (repartidor.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      repartidor.correo.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const topPerformers = [...repartidores]
    .sort((a, b) => (b.pedidosCompletados || 0) - (a.pedidosCompletados || 0))
    .slice(0, 3);

  const indexOfLastRepartidor = currentPage * repartidoresPerPage;
  const indexOfFirstRepartidor = indexOfLastRepartidor - repartidoresPerPage;
  const paginatedRepartidores = filteredRepartidores.slice(
    indexOfFirstRepartidor,
    indexOfLastRepartidor
  );
  const totalPages = Math.ceil(filteredRepartidores.length / repartidoresPerPage);

  
  const getStatusCounts = (history) => {
    return history.reduce(
      (acc, pedido) => ({
        ...acc,
        [pedido.estadoActual]: (acc[pedido.estadoActual] || 0) + 1,
      }),
      {}
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8  dark:bg-gray-900 min-h-screen">
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
          .fadeIn { animation: fadeIn 0.5s ease-out forwards; }
          .slideIn { animation: slideIn 0.5s ease-out forwards; }
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
          .dialog-enter {
            opacity: 0;
            transform: scale(0.95);
          }
          .dialog-enter-active {
            opacity: 1;
            transform: scale(1);
            transition: opacity 0.2s ease-out, transform 0.2s ease-out;
          }
          .dialog-exit {
            opacity: 1;
            transform: scale(1);
          }
          .dialog-exit-active {
            opacity: 0;
            transform: scale(0.95);
            transition: opacity 0.2s ease-in, transform 0.2s ease-in;
          }
        `}
      </style>

      {/* Header */}
      <div className="mb-8 text-center fadeIn">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-800 dark:text-gray-100 bg-clip-text text-transparent bg-gradient-to-r from-[#fcb900] to-[#fcb900cc]">
          Gestión de Repartidores
        </h1>

        <p className="text-md text-gray-600 dark:text-gray-400 mt-3">
          Administra tus repartidores con facilidad y monitorea su rendimiento
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-8 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between fadeIn">
        <div className="relative flex-1 max-w-lg">
          <input
            type="text"
            placeholder="Buscar por nombre o correo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-sm sm:text-base shadow-sm transition-all duration-300"
          />
          <FontAwesomeIcon
            icon={faSearch}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500"
          />
        </div>
      </div>

      {/* Top Performers Dashboard */}
      <div className="mb-12 fadeIn">
        <h2 className="text-2xl sm:text-3xl font-semibold mb-6 text-gray-700 dark:text-gray-200">
          Mejores Repartidores
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {topPerformers.map((repartidor, index) => (
            <div
              key={repartidor.idRepartidor}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 flex flex-col gap-4 hover:shadow-2xl transition-shadow duration-300 slideIn border border-gray-200 dark:border-gray-700"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center gap-4">
                {repartidor.fotoPerfil ? (
                  <img
                    src={repartidor.fotoPerfil}
                    alt={`Foto de ${repartidor.nombre}`}
                    className="w-16 h-16 rounded-full object-cover border-2 border-[#fcb900] shadow-sm"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gradient-to-br from-[#fcb900] to-[#fcb900cc] rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {repartidor.nombre?.charAt(0) || "?"}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 truncate">
                    {repartidor.nombre}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                    Pedidos Completados:{" "}
                    <span className="font-medium">
                      {repartidor.pedidosCompletados || 0}
                    </span>
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1 truncate">
                    Calificación:{" "}
                    <span className="font-medium text-[#fcb900]">
                      {repartidor.calificacionPromedio || "N/A"}
                    </span>
                    <FontAwesomeIcon icon={faStar} className="text-[#fcb900]" />
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleOpenDialog(repartidor, "details")}
                className="px-4 py-1.5 max-w-fit mx-auto bg-gradient-to-r from-[#fcb900] to-[#fcb900cc] text-white rounded-lg hover:brightness-110 transition-all text-sm font-medium shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#fcb900]"
              >
                Ver Detalles
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Repartidores Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8 fadeIn border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl sm:text-3xl font-semibold mb-6 text-gray-700 dark:text-gray-200">
          Lista de Repartidores
        </h2>
        {filteredRepartidores.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl font-medium text-gray-600 dark:text-gray-400">
              No se encontraron repartidores
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
              Intenta ajustar la búsqueda.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto rounded-lg">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Nombre
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Pedidos Completados
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Calificación
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {paginatedRepartidores.map((repartidor, index) => (
                    <tr
                      key={repartidor.idRepartidor}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors slideIn"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-800 dark:text-gray-100 text-sm">
                            {repartidor.correo}
                          </span>
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            {`${repartidor.nombre}  `}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-200">
                        {repartidor.pedidosCompletados || 0}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-200">
                        <div className="flex items-center gap-1">
                          {repartidor.calificacionPromedio || "N/A"}
                          <FontAwesomeIcon
                            icon={faStar}
                            className="text-yellow-500"
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="relative">
                          <button
                            disabled={
                              updatingStatusId === repartidor.idRepartidor
                            }
                            onClick={() =>
                              handleToggleStatus(
                                repartidor.idRepartidor,
                                repartidor.estado
                              )
                            }
                            className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                              repartidor.estado === "activo"
                                ? "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400 hover:bg-green-200"
                                : "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400 hover:bg-red-200"
                            }`}
                          >
                            {repartidor.estado === "activo" ? (
                              <>
                                <FontAwesomeIcon icon={faToggleOn} />
                                Activo
                              </>
                            ) : (
                              <>
                                <FontAwesomeIcon icon={faToggleOff} />
                                Inactivo
                              </>
                            )}
                            {updatingStatusId === repartidor.idRepartidor && (
                              <FontAwesomeIcon
                                icon={faSpinner}
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-yellow-500 animate-spin"
                              />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-200">
                        <div className="flex gap-3">
                          <button
                            onClick={() =>
                              handleOpenDialog(repartidor, "details")
                            }
                            className="text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-300 transition-colors"
                            title="Detalles"
                          >
                            <FontAwesomeIcon
                              icon={faInfoCircle}
                              className="text-lg"
                            />
                          </button>
                          <button
                            onClick={() =>
                              handleOpenDialog(repartidor, "history")
                            }
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                            title="Historial de Pedidos"
                          >
                            <FontAwesomeIcon
                              icon={faHistory}
                              className="text-lg"
                            />
                          </button>
                          <button
                            onClick={() =>
                              handleOpenDialog(repartidor, "reviews")
                            }
                            className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 transition-colors"
                            title="Reseñas"
                          >
                            <FontAwesomeIcon
                              icon={faStar}
                              className="text-lg"
                            />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="mt-6 flex justify-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      currentPage === i + 1
                        ? "bg-blue-500 text-white shadow-md"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Dialog for Details, History, Reviews */}
      {openDialog && selectedRepartidor && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/70 backdrop-blur-sm p-4 dialog-enter dialog-enter-active">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-gray-200 dark:border-gray-700 transform scale-100 transition-all duration-300 ease-out">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-white"
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
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100">
                    {openDialog === "details" && "Detalles del Repartidor"}
                    {openDialog === "history" && "Historial de Pedidos"}
                    {openDialog === "reviews" && "Reseñas del Repartidor"}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {`${selectedRepartidor.nombre} `}
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

            {/* Dialog Content Tabs/Sections */}
            <div className="p-4 sm:px-6 sm:pt-6 flex-shrink-0">
              <div className="flex border-b border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setOpenDialog("details")}
                  className={`py-2 px-4 text-sm font-medium ${
                    openDialog === "details"
                      ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                  } transition-colors`}
                >
                  Detalles
                </button>
                <button
                  onClick={() => setOpenDialog("history")}
                  className={`py-2 px-4 text-sm font-medium ${
                    openDialog === "history"
                      ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                  } transition-colors`}
                >
                  Historial de Pedidos
                </button>
                <button
                  onClick={() => setOpenDialog("reviews")}
                  className={`py-2 px-4 text-sm font-medium ${
                    openDialog === "reviews"
                      ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                  } transition-colors`}
                >
                  Reseñas
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto max-h-[calc(90vh-160px)] scrollbar-thin p-4 sm:p-6">
              {openDialog === "details" && repartidorData.details && (
                <div className="space-y-6 fadeIn">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                        Correo:
                      </p>
                      <p className="text-gray-800 dark:text-gray-100 text-lg">
                        {repartidorData.details.correo}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                        Teléfono:
                      </p>
                      <p className="text-gray-800 dark:text-gray-100 text-lg">
                        {repartidorData.details.telefono || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                        Fecha de Registro:
                      </p>
                      <p className="text-gray-800 dark:text-gray-100 text-lg">
                        {new Date(
                          repartidorData.details.fechaCreacion
                        ).toLocaleDateString("es-MX", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                        Estado:
                      </p>
                      <p
                        className={`text-lg font-medium ${
                          repartidorData.details.estado === "activo"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {repartidorData.details.estado === "activo"
                          ? "Activo"
                          : "Inactivo"}
                      </p>
                    </div>
                  </div>
                  <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                    <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">
                      Estadísticas de Pedidos
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {Object.entries(
                        getStatusCounts(repartidorData.history)
                      ).map(([status, count]) => (
                        <div
                          key={status}
                          className={`p-3 rounded-lg ${statusColors[status]} text-center flex flex-col items-center justify-center`}
                        >
                          <p className="text-sm font-medium capitalize">
                            {status.replace("_", " ")}
                          </p>
                          <p className="text-2xl font-bold">{count}</p>
                        </div>
                      ))}
                      {Object.keys(getStatusCounts(repartidorData.history))
                        .length === 0 && (
                        <div className="col-span-full text-center text-gray-600 dark:text-gray-400">
                          No hay pedidos para mostrar estadísticas.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}










          {openDialog === "history" && repartidorData.history && (
  <div className="space-y-4 fadeIn">
    {repartidorData.history.length > 0 ? (
      <div className="space-y-4">
        {repartidorData.history.map((pedido, index) => (
          <div
            key={pedido.idAsignacion} // Use idAsignacion as the unique key
            className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600 shadow-sm transition-all duration-200 ease-in-out hover:shadow-md"
          >
            <div
              className="flex justify-between items-center cursor-pointer"
              onClick={() => handleToggleOrderExpansion(pedido.idAsignacion)}
            >
              <div className="flex items-center gap-3">
                <FontAwesomeIcon
                  icon={faHistory}
                  className="text-blue-500 text-lg"
                />
                <div>
                  <h4 className="font-semibold text-gray-800 dark:text-gray-100">
                    Pedido #{pedido.idPedido} (Rastreo: {pedido.idRastreo})
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date(pedido.fechaPedido).toLocaleDateString("es-MX", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                  statusColors[pedido.estadoActual.toLowerCase()] || "bg-gray-100 text-gray-800"
                }`}
              >
                {pedido.estadoActual.charAt(0).toUpperCase() +
                  pedido.estadoActual.slice(1).toLowerCase()}
              </span>
            </div>

         {expandedOrders[pedido.idAsignacion] && (
  <div className="p-4 space-y-4 border-t border-gray-200 dark:border-gray-700">
    {/* Products Section */}
    <div>
      <h5 className="text-md font-semibold text-gray-700 dark:text-gray-200 mb-2 flex items-center gap-2">
        <FontAwesomeIcon icon={faBoxes} /> Productos del Pedido:
      </h5>
      {pedido.productos && pedido.productos.length > 0 ? (
        <ul className="space-y-3">
          {pedido.productos.map((product, pIndex) => (
            <li
              key={pIndex}
              className="flex justify-between items-start bg-gray-50 dark:bg-gray-700 p-3 rounded-md border border-gray-100 dark:border-gray-600"
            >
              <div className="flex-1">
                <span className="text-gray-800 dark:text-gray-100 font-medium">
                  {product.nombreProducto}
                </span>
                {product.colorProducto || product.detallesProducto ? (
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {product.colorProducto && `Color: ${product.colorProducto}`}
                    {product.colorProducto && product.detallesProducto && " | "}
                    {product.detallesProducto}
                  </p>
                ) : null}
              </div>
              <div className="text-right ml-4">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Cant: {product.cantidad}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Precio: ${parseFloat(product.precioUnitario).toFixed(2)}
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
                  Subtotal: ${parseFloat(product.subtotal).toFixed(2)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-600 dark:text-gray-400 text-sm italic">
          No hay productos registrados para este pedido.
        </p>
      )}
    </div>

    {/* Client and Order Details (unchanged) */}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
      <div>
        <p className="text-gray-600 dark:text-gray-400">Cliente:</p>
        <p className="font-medium text-gray-800 dark:text-gray-100">
          {pedido.cliente.nombre}
        </p>
      </div>
      <div>
        <p className="text-gray-600 dark:text-gray-400">Correo:</p>
        <p className="font-medium text-gray-800 dark:text-gray-100">
          {pedido.cliente.correo}
        </p>
      </div>
      <div>
        <p className="text-gray-600 dark:text-gray-400">Total a Pagar:</p>
        <p className="font-medium text-gray-800 dark:text-gray-100">
          ${parseFloat(pedido.totalPagar).toFixed(2)}
        </p>
      </div>
      <div>
        <p className="text-gray-600 dark:text-gray-400">Tipo de Pedido:</p>
        <p className="font-medium text-gray-800 dark:text-gray-100">
          {pedido.tipoPedido}
        </p>
      </div>
    </div>
  </div>
)}
          </div>
        ))}
      </div>
    ) : (
      <div className="flex flex-col items-center justify-center h-64 text-center p-8">
        <FontAwesomeIcon
          icon={faHistory}
          className="text-4xl text-gray-400 mb-4"
        />
        <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Sin pedidos registrados
        </p>
        <p className="text-gray-600 dark:text-gray-400">
          No hay historial de pedidos para este repartidor.
        </p>
      </div>
    )}
  </div>
)}












              {openDialog === "reviews" && repartidorData.reviews && (
                <div className="space-y-4 fadeIn">
                  {repartidorData.reviews.length > 0 ? (
                    repartidorData.reviews.map((review, index) => (
                      <div
                        key={index}
                        className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600 shadow-sm transition-all duration-200 ease-in-out hover:shadow-md"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <FontAwesomeIcon
                                key={i}
                                icon={faStar}
                                className={
                                  i < review.calificacion
                                    ? "text-yellow-500"
                                    : "text-gray-300 dark:text-gray-600"
                                }
                              />
                            ))}
                          </div>
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            {new Date(review.fecha).toLocaleDateString(
                              "es-ES",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              }
                            )}
                          </span>
                        </div>
                        <p className="text-sm text-gray-900 dark:text-gray-100">
                          "{review.comentario}"
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          Por:{" "}
                          <span className="font-medium">
                            {review.clienteNombre}
                          </span>
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center h-64 text-center p-8">
                      <FontAwesomeIcon
                        icon={faStar}
                        className="text-4xl text-gray-400 mb-4"
                      />
                      <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                        Sin reseñas registradas
                      </p>
                      <p className="text-gray-600 dark:text-gray-400">
                        No hay reseñas disponibles para este repartidor.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-b-2xl flex justify-end">
              <button
                onClick={handleCloseDialog}
                className="px-6 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white text-base font-medium rounded-lg transition-all shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-red-500"
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

export default GestionRepartidores;