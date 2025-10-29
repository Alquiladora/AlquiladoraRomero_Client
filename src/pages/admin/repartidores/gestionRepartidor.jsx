/* eslint-disable */
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
  faChevronUp,
  faChevronDown,
  faUser,
  faCalendarAlt,
  faDollarSign,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import DatePicker from "react-datepicker";
import api from "../../../utils/AxiosConfig";
import { useAuth } from "../../../hooks/ContextAuth";
import CustomLoading from "../../../components/spiner/SpinerGlobal";

const statusColors = {
  procesando:
    "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  confirmado:
    "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  enviando: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  en_alquiler:
    "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  devuelto: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
  incompleto:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  incidente: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  cancelado: "bg-black text-white dark:bg-black dark:text-white",
  finalizado:
    "bg-green-200 text-green-900 dark:bg-green-800 dark:text-green-100",
  recogiendo:
    "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
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
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [repartidores, setRepartidores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("todos");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const repartidoresPerPage = 8;
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    AxiosRepartidores();
  }, []);

  const AxiosRepartidores = async () => {
    try {
      const response = await api.get(
        "api/repartidor/administrar/repartidores",
        {
          withCredentials: true,
          headers: { "X-CSRF-Token": csrfToken },
        }
      );
      const validRepartidores = response.data.data.filter(
        (repartidor) =>
          repartidor &&
          typeof repartidor.nombre === "string" &&
          typeof repartidor.correo === "string"
      );
      setRepartidores(validRepartidores);
      setLoading(false);
    } catch (error) {
      console.error("Error al obtener repartidores", error);
      setError(true);
      setLoading(false);
      toast.error("Error al cargar los repartidores");
    }
  };

  const AxiosHistorialPedidos = async (repartidorId, startDate, endDate) => {
    try {
      const params = {};
      if (startDate) params.startDate = startDate.toISOString().split("T")[0];
      if (endDate) params.endDate = endDate.toISOString().split("T")[0];
      const response = await api.get(
        `api/repartidor/repartidores/${repartidorId}/historial`,
        {
          params,
          withCredentials: true,
          headers: { "X-CSRF-Token": csrfToken },
        }
      );

      return Array.isArray(response.data.data) ? response.data.data : [];
    } catch (error) {
      console.error("Error al obtener historial", error);
      toast.error("Error al cargar historial");
      return [];
    }
  };

  const fetchRepartidorDetails = async (repartidorId) => {
    setDetailsLoading(true);
    try {
      const historial = await AxiosHistorialPedidos(
        repartidorId,
        startDate,
        endDate
      );
      const details = repartidores.find((r) => r.idRepartidor === repartidorId);
      setRepartidorData({
        details: details || { nombre: "Sin nombre", correo: "Sin correo" },
        history: historial,
        reviews: staticResenas[repartidorId] || [],
      });

      console.log("repartido---0 ", historial);
    } catch (error) {
      toast.error("Error al cargar los detalles del repartidor");
      setRepartidorData({
        details: { nombre: "Sin nombre", correo: "Sin correo" },
        history: [],
        reviews: [],
      });
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleToggleStatus = async (repartidorId, currentStatus) => {
    setUpdatingStatusId(repartidorId);
    const newActivo = currentStatus === "activo" ? 0 : 1;
    try {
      const response = await api.patch(
        `api/repartidor/administrar/repartidores/${repartidorId}/estado`,
        { activo: newActivo },
        { withCredentials: true, headers: { "X-CSRF-Token": csrfToken } }
      );
      setRepartidores((prev) =>
        prev.map((r) =>
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
        `Repartidor ${
          response.data.estado === "activo" ? "activado" : "desactivado"
        } correctamente`
      );
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Error al cambiar el estado del repartidor";
      toast.error(errorMessage);
      console.error(error);
    } finally {
      setUpdatingStatusId(null);
    }
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
    setDetailsLoading(false);
    setSelectedStatus("todos");
    setStartDate(null);
    setEndDate(null);
  };

  const handleToggleOrderExpansion = (orderId) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  const filteredRepartidores = repartidores.filter(
    (repartidor) =>
      (repartidor.nombre && typeof repartidor.nombre === "string"
        ? repartidor.nombre.toLowerCase().includes(searchTerm.toLowerCase())
        : false) ||
      (repartidor.correo && typeof repartidor.correo === "string"
        ? repartidor.correo.toLowerCase().includes(searchTerm.toLowerCase())
        : false)
  );

  const topPerformers = [...repartidores]
    .filter(
      (r) =>
        (r.pedidosFinalizados || 0) > 0 &&
        typeof r.calificacionPromedio === "number" &&
        !isNaN(r.calificacionPromedio)
    )
    .map((r) => ({
      ...r,
      score: r.pedidosFinalizados * r.calificacionPromedio,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  const indexOfLastRepartidor = currentPage * repartidoresPerPage;
  const indexOfFirstRepartidor = indexOfLastRepartidor - repartidoresPerPage;
  const paginatedRepartidores = filteredRepartidores.slice(
    indexOfFirstRepartidor,
    indexOfLastRepartidor
  );
  const totalPages = Math.ceil(
    filteredRepartidores.length / repartidoresPerPage
  );

  const getStatusCounts = (history) => {
    if (!Array.isArray(history)) return {};
    return history.reduce(
      (acc, pedido) => ({
        ...acc,
        [pedido.estadoActual.toLowerCase()]:
          (acc[pedido.estadoActual.toLowerCase()] || 0) + 1,
      }),
      {}
    );
  };

  const getRepartidorStats = (details) => {
    if (!details) return {};
    const stats = {
      cancelado: details.pedidosCancelado || 0,
      enviando: details.pedidosEnviando || 0,
      finalizado: details.pedidosFinalizados || 0,
      incidente: details.pedidosIncidente || 0,
      incompleto: details.pedidosIncompleto || 0,
      recogiendo: details.pedidosRecogiendo || 0,
    };
    return Object.fromEntries(
      Object.entries(stats).filter(([_, count]) => count > 0)
    );
  };

  // Group orders by status
  const groupOrdersByStatus = (history) => {
    if (!Array.isArray(history)) return {};
    const grouped = history.reduce((acc, pedido) => {
      const status = pedido.estadoActual.toLowerCase();
      if (!acc[status]) acc[status] = [];
      acc[status].push(pedido);
      return acc;
    }, {});
    return grouped;
  };

  // Filter orders by status and date
  const filteredHistory = () => {
    let history = repartidorData.history || [];
    if (selectedStatus !== "todos") {
      history = history.filter(
        (pedido) => pedido.estadoActual.toLowerCase() === selectedStatus
      );
    }
    if (startDate && endDate) {
      history = history.filter((pedido) => {
        const pedidoDate = new Date(pedido.fechaPedido);
        return pedidoDate >= startDate && pedidoDate <= endDate;
      });
    }
    return history;
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 dark:bg-gray-900 min-h-screen">
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
            transition: opacity 0.3s ease-out, transform 0.3s ease-out;
          }
          .dialog-exit {
            opacity: 1;
            transform: scale(1);
          }
          .dialog-exit-active {
            opacity: 0;
            transform: scale(0.95);
            transition: opacity 0.3s ease-in, transform 0.3s ease-in;
          }
          .spinner-container {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100%;
            min-height: 200px;
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
        {topPerformers.length === 0 ? (
          <div className="text-center py-10 bg-white dark:bg-gray-800 border border-dashed border-gray-300 dark:border-gray-600 rounded-xl">
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              🛵 Aún no hay repartidores destacados.
            </p>
            <p className="text-sm text-gray-400 mt-1">
              Se mostrarán aquí cuando tengan pedidos completados y
              calificaciones.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {topPerformers.map((repartidor, index) => {
              const medallas = ["🥇", "🥈", "🥉"];
              const posicion = medallas[index] || `#${index + 1}`;
              return (
                <div
                  key={repartidor.idRepartidor}
                  className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 flex flex-col gap-4 hover:shadow-2xl transition-shadow duration-300 slideIn border border-gray-200 dark:border-gray-700"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="absolute -top-3 -left-3 bg-white dark:bg-gray-800 rounded-full shadow-md px-3 py-1 text-sm font-semibold text-[#fcb900] border border-gray-200 dark:border-gray-600">
                    {posicion}
                  </div>
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
                          {repartidor.pedidosFinalizados || 0}
                        </span>
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1 truncate">
                        Calificación:{" "}
                        <span className="font-medium text-[#fcb900]">
                          {repartidor.calificacionPromedio || "N/A"}
                        </span>
                        <FontAwesomeIcon
                          icon={faStar}
                          className="text-[#fcb900]"
                        />
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
              );
            })}
          </div>
        )}
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
                      {repartidor.correo || "Sin correo"}
                    </span>
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      {repartidor.nombre || "Sin nombre"}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-200">
                  {repartidor.pedidosFinalizados || 0}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-200">
                  <div className="flex items-center gap-1">
                    {repartidor.calificacionPromedio || "N/A"}
                    <FontAwesomeIcon icon={faStar} className="text-yellow-500" />
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="relative">
                    {repartidor.rol === "repartidor" ? (
                      <button
                        disabled={updatingStatusId === repartidor.idRepartidor}
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
                    ) : (
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                        Dejó de ser repartidor
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-200">
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleOpenDialog(repartidor, "details")}
                      className="text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-300 transition-colors"
                      title="Detalles"
                    >
                      <FontAwesomeIcon icon={faInfoCircle} className="text-lg" />
                    </button>
                    <button
                      onClick={() => handleOpenDialog(repartidor, "history")}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                      title="Historial de Pedidos"
                    >
                      <FontAwesomeIcon icon={faHistory} className="text-lg" />
                    </button>
                    <button
                      onClick={() => handleOpenDialog(repartidor, "reviews")}
                      className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 transition-colors"
                      title="Reseñas"
                    >
                      <FontAwesomeIcon icon={faStar} className="text-lg" />
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

      {/* Modal for Details, History, Reviews */}
      {openDialog && selectedRepartidor && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/80 backdrop-blur-md p-4 sm:p-6 dialog-enter dialog-enter-active">
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col border border-gray-200 dark:border-gray-800 transform scale-100 transition-all duration-300 ease-out">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 sm:p-6 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-[#fcb900] to-[#fcb900cc] dark:from-[#fcb900] rounded-t-3xl">
              <div className="flex items-center gap-4">
                {selectedRepartidor.fotoPerfil ? (
                  <img
                    src={selectedRepartidor.fotoPerfil}
                    alt={`Foto de ${selectedRepartidor.nombre}`}
                    className="w-14 h-14 rounded-full object-cover border-2 border-[#fcb900] shadow-md"
                  />
                ) : (
                  <div className="w-14 h-14 bg-gradient-to-br from-[#fcb900] to-[#fcb900cc] rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-md">
                    {selectedRepartidor.nombre?.charAt(0) || "?"}
                  </div>
                )}
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white">
                    {openDialog === "details" && "Detalles del Repartidor"}
                    {openDialog === "history" && "Historial de Pedidos"}
                    {openDialog === "reviews" && "Reseñas del Repartidor"}
                  </h3>
                  <p className="text-sm text-gray-200">
                    {selectedRepartidor.nombre || "Sin nombre"}
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseDialog}
                className="p-2 text-white hover:bg-gray-700/50 rounded-full transition-all"
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

            {/* Tabs */}
            <div className="p-4 sm:p-6 flex-shrink-0 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800">
              <div className="flex gap-2 sm:gap-4">
                <button
                  onClick={() => setOpenDialog("details")}
                  className={`py-2 px-4 sm:px-6 text-sm font-semibold rounded-full transition-all ${
                    openDialog === "details"
                      ? "bg-[#fcb900] text-white shadow-md"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                  }`}
                >
                  Detalles
                </button>
                <button
                  onClick={() => setOpenDialog("history")}
                  className={`py-2 px-4 sm:px-6 text-sm font-semibold rounded-full transition-all ${
                    openDialog === "history"
                      ? "bg-[#fcb900] text-white shadow-md"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                  }`}
                >
                  Historial
                </button>
                {/* <button
                  onClick={() => setOpenDialog("reviews")}
                  className={`py-2 px-4 sm:px-6 text-sm font-semibold rounded-full transition-all ${
                    openDialog === "reviews"
                      ? "bg-[#fcb900] text-white shadow-md"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                  }`}
                >
                  Reseñas
                </button> */}
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto max-h-[calc(92vh-180px)] scrollbar-thin p-4 sm:p-6">
              {detailsLoading ? (
                <CustomLoading />
              ) : (
                <>
                  {openDialog === "details" && repartidorData.details && (
                    <div className="space-y-6 fadeIn">
                      <div className="flex items-center gap-4 bg-gray-100 dark:bg-gray-800 p-4 rounded-xl shadow-sm">
                        {repartidorData.details.fotoPerfil ? (
                          <img
                            src={repartidorData.details.fotoPerfil}
                            alt={`Foto de ${
                              repartidorData.details.nombre || "Sin nombre"
                            }`}
                            className="w-20 h-20 rounded-full object-cover border-2 border-[#fcb900] shadow-md"
                          />
                        ) : (
                          <div className="w-20 h-20 bg-gradient-to-br from-[#fcb900] to-[#fcb900cc] rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-md">
                            {repartidorData.details.nombre?.charAt(0) || "?"}
                          </div>
                        )}
                        <div>
                          <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                            {repartidorData.details.nombre || "Sin nombre"}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                            Calificación:{" "}
                            <span className="font-medium text-[#fcb900]">
                              {repartidorData.details.calificacionPromedio ||
                                "N/A"}
                            </span>
                            <FontAwesomeIcon
                              icon={faStar}
                              className="text-[#fcb900]"
                            />
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                            Correo
                          </p>
                          <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                            {repartidorData.details.correo || "Sin correo"}
                          </p>
                        </div>
                        <div className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                            Teléfono
                          </p>
                          <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                            {repartidorData.details.telefono || "N/A"}
                          </p>
                        </div>
                        <div className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                            Fecha de Registro
                          </p>
                          <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                            {repartidorData.details.fechaCreacion
                              ? new Date(
                                  repartidorData.details.fechaCreacion
                                ).toLocaleDateString("es-MX", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                })
                              : "N/A"}
                          </p>
                        </div>
                        <div className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                            Estado
                          </p>
                          <p
                            className={`text-lg font-semibold ${
                              repartidorData.details.estado === "activo"
                                ? "text-green-600 dark:text-green-400"
                                : "text-red-600 dark:text-red-400"
                            }`}
                          >
                            {repartidorData.details.estado === "activo"
                              ? "Activo"
                              : "Inactivo"}
                          </p>
                        </div>
                      </div>
                      <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
                        <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
                          <FontAwesomeIcon
                            icon={faChartPie}
                            className="text-[#fcb900]"
                          />
                          Estadísticas de Pedidos
                        </h4>
                        {Object.keys(getRepartidorStats(repartidorData.details))
                          .length === 0 ? (
                          <div className="flex flex-col items-center justify-center h-32 text-center">
                            <FontAwesomeIcon
                              icon={faChartPie}
                              className="text-4xl text-gray-400 mb-2"
                            />
                            <p className="text-gray-600 dark:text-gray-400">
                              No hay pedidos para mostrar estadísticas.
                            </p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {Object.entries(
                              getRepartidorStats(repartidorData.details)
                            ).map(([status, count]) => (
                              <div
                                key={status}
                                className={`p-4 rounded-xl ${
                                  statusColors[status] ||
                                  "bg-gray-100 text-gray-800"
                                } shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col items-center justify-center`}
                              >
                                <p className="text-sm font-semibold capitalize">
                                  {status.replace("_", " ")}
                                </p>
                                <p className="text-3xl font-bold mt-2">
                                  {count}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {openDialog === "history" && repartidorData.history && (
                    <div className="space-y-6 fadeIn">
                      {/* Filtros y Controles */}
                      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                            {/* Date Range Filter */}
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Filtrar por fecha:
                              </span>
                              <div className="flex gap-3 items-center flex-wrap">
                                {/* Desde */}
                                <div className="relative w-36">
                                  <DatePicker
                                    selected={startDate}
                                    onChange={(date) => setStartDate(date)}
                                    selectsStart
                                    startDate={startDate}
                                    endDate={endDate}
                                    placeholderText="Desde"
                                    dateFormat="dd/MM/yyyy"
                                    className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-sm shadow-sm focus:ring-2 focus:ring-[#fcb900] focus:outline-none"
                                  />
                                  <FontAwesomeIcon
                                    icon={faCalendarAlt}
                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                                  />
                                </div>
                                {/* Hasta */}
                                <div className="relative w-36">
                                  <DatePicker
                                    selected={endDate}
                                    onChange={(date) => setEndDate(date)}
                                    selectsEnd
                                    startDate={startDate}
                                    endDate={endDate}
                                    minDate={startDate}
                                    placeholderText="Hasta"
                                    dateFormat="dd/MM/yyyy"
                                    className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-sm shadow-sm focus:ring-2 focus:ring-[#fcb900] focus:outline-none"
                                  />
                                  <FontAwesomeIcon
                                    icon={faCalendarAlt}
                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                                  />
                                </div>
                                {/* Botón para limpiar filtro */}
                                {(startDate || endDate) && (
                                  <button
                                    onClick={() => {
                                      setStartDate(null);
                                      setEndDate(null);
                                    }}
                                    className="text-sm px-4 py-2 rounded-lg bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800 text-red-700 dark:text-red-300 transition-colors"
                                  >
                                    Limpiar filtro
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      {filteredHistory().length > 0 ? (
                        <div className="space-y-6">
                          {Object.entries(
                            groupOrdersByStatus(filteredHistory())
                          ).map(([status, pedidos]) => (
                            <div key={status} className="space-y-4">
                              <div
                                className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-800 rounded-xl cursor-pointer"
                                onClick={() =>
                                  handleToggleOrderExpansion(status)
                                }
                              >
                                <div className="flex items-center gap-2">
                                  <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                                    {status.charAt(0).toUpperCase() +
                                      status.slice(1).replace("_", " ")}
                                  </h4>
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status]}`}
                                  >
                                    {pedidos.length}
                                  </span>
                                </div>
                                <FontAwesomeIcon
                                  icon={
                                    expandedOrders[status]
                                      ? faChevronUp
                                      : faChevronDown
                                  }
                                  className="text-gray-400"
                                />
                              </div>
                              {expandedOrders[status] && (
                                <div className="space-y-4">
                                  {pedidos.map((pedido) => (
                                    <div
                                      key={pedido.idAsignacion}
                                      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
                                    >
                                      <div
                                        className="p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                        onClick={() =>
                                          handleToggleOrderExpansion(
                                            pedido.idAsignacion
                                          )
                                        }
                                      >
                                        <div className="flex justify-between items-start">
                                          <div className="flex items-start gap-4">
                                            <div className="flex-shrink-0 w-12 h-12 bg-[#fcb900] dark:bg-[#fcb900cc] rounded-lg flex items-center justify-center">
                                              <FontAwesomeIcon
                                                icon={faHistory}
                                                className="text-white dark:text-gray-800 text-lg"
                                              />
                                            </div>
                                            <div className="flex-1">
                                              <div className="flex items-center gap-2 mb-1">
                                                <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                                                  Pedido #{pedido.idPedido}
                                                </h4>
                                                <div className="hidden sm:block w-2 h-2 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                                                <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                                                  {pedido.idRastreo}
                                                </span>
                                              </div>
                                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                                {new Date(
                                                  pedido.fechaPedido
                                                ).toLocaleDateString("es-MX", {
                                                  year: "numeric",
                                                  month: "long",
                                                  day: "numeric",
                                                  hour: "2-digit",
                                                  minute: "2-digit",
                                                })}
                                              </p>
                                              <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                  {pedido.cliente?.nombre ||
                                                    "Sin cliente"}
                                                </span>
                                                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                                  $
                                                  {parseFloat(
                                                    pedido.totalPagar || 0
                                                  ).toFixed(2)}
                                                </span>
                                              </div>
                                            </div>
                                          </div>
                                          <div className="flex items-center gap-3">
                                            <span
                                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                                statusColors[
                                                  pedido.estadoActual.toLowerCase()
                                                ] || "bg-gray-100 text-gray-800"
                                              }`}
                                            >
                                              {pedido.estadoActual
                                                .charAt(0)
                                                .toUpperCase() +
                                                pedido.estadoActual
                                                  .slice(1)
                                                  .toLowerCase()}
                                            </span>
                                            <FontAwesomeIcon
                                              icon={
                                                expandedOrders[
                                                  pedido.idAsignacion
                                                ]
                                                  ? faChevronUp
                                                  : faChevronDown
                                              }
                                              className="text-gray-400 text-sm"
                                            />
                                          </div>
                                        </div>
                                      </div>

                                      {expandedOrders[pedido.idAsignacion] && (
                                        <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                                          <div className="p-6 space-y-6">
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                                                <h6 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                                                  <FontAwesomeIcon
                                                    icon={faUser}
                                                    className="text-[#fcb900]"
                                                  />
                                                  Información del Cliente
                                                </h6>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                                  <div>
                                                    <p className="text-gray-600 dark:text-gray-400">
                                                      Cliente:
                                                    </p>
                                                    <p className="font-medium text-gray-800 dark:text-gray-100">
                                                      {pedido.cliente?.nombre ||
                                                        "Sin cliente"}
                                                    </p>
                                                  </div>
                                                  <div>
                                                    <p className="text-gray-600 dark:text-gray-400">
                                                      Correo:
                                                    </p>
                                                    <p className="font-medium text-gray-800 dark:text-gray-100">
                                                      {pedido.cliente?.correo ||
                                                        "Sin correo"}
                                                    </p>
                                                  </div>
                                                  <div>
                                                    <p className="text-gray-600 dark:text-gray-400">
                                                      Tipo de Pedido:
                                                    </p>
                                                    <p className="font-medium text-gray-800 dark:text-gray-100">
                                                      {pedido.tipoPedido ||
                                                        "N/A"}
                                                    </p>
                                                  </div>
                                                </div>
                                                {/* Sección mejorada para Total a Pagar y Total a Pagado */}
                                                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                                  <div className="bg-[#fff3e0] dark:bg-gray-700 p-3 rounded-lg border border-[#fcb900]/20 shadow-sm">
                                                    <div className="flex items-center gap-2">
                                                      <FontAwesomeIcon
                                                        icon={faDollarSign}
                                                        className="text-[#fcb900]"
                                                      />
                                                      <h6 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                                        Total a Pagar
                                                      </h6>
                                                    </div>
                                                    <p className="text-xl font-bold text-gray-800 dark:text-gray-100 mt-1">
                                                      $
                                                      {parseFloat(
                                                        pedido.totalPagar || 0
                                                      ).toFixed(2)}
                                                    </p>
                                                  </div>
                                                  <div className="bg-[#e6f3ff] dark:bg-gray-600 p-3 rounded-lg border border-[#fcb900]/20 shadow-sm">
                                                    <div className="flex items-center gap-2">
                                                      <FontAwesomeIcon
                                                        icon={faCheck}
                                                        className="text-[#fcb900]"
                                                      />
                                                      <h6 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                                        Total a Pagado
                                                      </h6>
                                                    </div>
                                                    <p className="text-xl font-bold text-gray-800 dark:text-gray-100 mt-1">
                                                      $
                                                      {parseFloat(
                                                        pedido.totalPagado || 0
                                                      ).toFixed(2)}
                                                    </p>
                                                  </div>
                                                </div>
                                              </div>
                                              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                                                <h6 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                                                  <FontAwesomeIcon
                                                    icon={faBoxes}
                                                    className="text-[#fcb900]"
                                                  />
                                                  Productos del Pedido
                                                  <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded-full text-xs">
                                                    {pedido.productos?.length ||
                                                      0}
                                                  </span>
                                                </h6>
                                                {pedido.productos &&
                                                pedido.productos.length > 0 ? (
                                                  <div className="space-y-3 max-h-64 overflow-y-auto scrollbar-thin">
                                                    {pedido.productos.map(
                                                      (product, pIndex) => (
                                                        <div
                                                          key={pIndex}
                                                          className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg border border-gray-100 dark:border-gray-600"
                                                        >
                                                          <div className="flex justify-between items-start">
                                                            <div className="flex-1">
                                                              <h6 className="text-sm font-medium text-gray-800 dark:text-gray-100 mb-1">
                                                                {product.nombreProducto ||
                                                                  "Sin nombre"}
                                                              </h6>
                                                              <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                                                                {product.colorProducto && (
                                                                  <p>
                                                                    <span className="font-medium">
                                                                      Color:
                                                                    </span>{" "}
                                                                    {
                                                                      product.colorProducto
                                                                    }
                                                                  </p>
                                                                )}
                                                                {product.detallesProducto && (
                                                                  <p>
                                                                    <span className="font-medium">
                                                                      Detalles:
                                                                    </span>{" "}
                                                                    {
                                                                      product.detallesProducto
                                                                    }
                                                                  </p>
                                                                )}
                                                                <p>
                                                                  <span className="font-medium">
                                                                    Estado
                                                                    Producto:
                                                                  </span>{" "}
                                                                  {product.estadoProducto ===
                                                                  "N/A"
                                                                    ? "Aun no calificado"
                                                                    : product.estadoProducto}
                                                                </p>
                                                                {product.diasAlquiler >
                                                                  0 && (
                                                                  <p>
                                                                    <span className="font-medium">
                                                                      Días de
                                                                      alquiler:
                                                                    </span>{" "}
                                                                    {
                                                                      product.diasAlquiler
                                                                    }
                                                                  </p>
                                                                )}
                                                                {product.observaciones && (
                                                                  <p>
                                                                    <span className="font-medium">
                                                                      Observaciones:
                                                                    </span>{" "}
                                                                    {
                                                                      product.observaciones
                                                                    }
                                                                  </p>
                                                                )}
                                                              </div>
                                                            </div>
                                                            <div className="text-right ml-4 text-xs text-gray-600 dark:text-gray-300">
                                                              <p>
                                                                Cant:{" "}
                                                                {product.cantidad ||
                                                                  0}
                                                              </p>
                                                              <p>
                                                                Precio: $
                                                                {parseFloat(
                                                                  product.precioUnitario ||
                                                                    0
                                                                ).toFixed(2)}
                                                              </p>
                                                              <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
                                                                $
                                                                {parseFloat(
                                                                  product.subtotal ||
                                                                    0
                                                                ).toFixed(2)}
                                                              </p>
                                                            </div>
                                                          </div>
                                                        </div>
                                                      )
                                                    )}
                                                  </div>
                                                ) : (
                                                  <div className="text-center py-8">
                                                    <FontAwesomeIcon
                                                      icon={faBoxes}
                                                      className="text-2xl text-gray-400 mb-2"
                                                    />
                                                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                                                      No hay productos
                                                      registrados para este
                                                      pedido.
                                                    </p>
                                                  </div>
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                          <div className="flex flex-col items-center justify-center h-64 text-center p-8">
                            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                              <FontAwesomeIcon
                                icon={faHistory}
                                className="text-2xl text-gray-400"
                              />
                            </div>
                            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                              Sin pedidos registrados
                            </p>
                            <p className="text-gray-600 dark:text-gray-400">
                              No hay historial de pedidos para este repartidor.
                            </p>
                          </div>
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
                            className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm transition-all duration-200 hover:shadow-md"
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
                                        ? "text-[#fcb900]"
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
                            className="text-4xl text-[#fcb900] mb-4"
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
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-6 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 rounded-b-3xl flex justify-end">
              <button
                onClick={handleCloseDialog}
                className="px-6 py-2 bg-gradient-to-r from-[#fcb900] to-[#fcb900cc] hover:from-[#ffca1f] hover:to-[#fcb900cc] text-white text-base font-medium rounded-lg transition-all shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#fcb900]"
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
