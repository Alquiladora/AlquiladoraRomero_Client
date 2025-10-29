/* eslint-disable */
import React, { useMemo, useState, useEffect, useReducer } from "react";
import {
  Search,
  Package,
  Check,
  X,
  User,
  CheckCircle,
  Clock,
  MapPin,
  Eye,
  Loader2,
  RefreshCw,
  Printer,
  Download,
  Filter,
  AlertCircle,
  Phone,
  CircleDollarSign,
  Wallet,
  ShieldCheck,
  MessageCircle,
  AlertTriangle,
  Truck,
  Navigation,
} from "lucide-react";
import api from "../../../utils/AxiosConfig";
import { useAuth } from "../../../hooks/ContextAuth";
import { toast } from "react-toastify";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  AiFillCheckCircle,
  AiOutlineCar,
  AiOutlineShoppingCart,
  AiOutlineUndo,
  AiOutlineWarning,
  AiFillExclamationCircle,
  AiOutlineCloseCircle,
  AiOutlineQuestionCircle,
} from "react-icons/ai";
import CustomLoading from "../../../components/spiner/SpinerGlobal";

// Tooltip Component
const Tooltip = ({ content, children }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
      >
        {children}
      </div>
      {show && (
        <div className="absolute z-10 w-48 p-2 text-xs text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg bottom-full mb-2">
          {content}
        </div>
      )}
    </div>
  );
};

// Loading Component
const Loading = () => (
  <div className="flex items-center justify-center p-4">
    <Loader2 className="h-8 w-8 animate-spin text-indigo-600 dark:text-indigo-400" />
    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
      Cargando...
    </span>
  </div>
);

// Notification Component
const Notification = ({ message, type, onClose }) => (
  <div
    className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg ${
      type === "success"
        ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
        : "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"
    }`}
  >
    <div className="flex justify-between items-center">
      <span className="text-sm">{message}</span>
      <button onClick={onClose} className="ml-4 text-lg">
        ×
      </button>
    </div>
  </div>
);

// Error Component
const ErrorDisplay = ({ message }) => (
  <div className="flex items-center justify-center p-4 bg-red-50 dark:bg-red-900 rounded-xl border-2 border-red-200 dark:border-red-700">
    <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400 mr-2" />
    <span className="text-sm text-red-700 dark:text-red-300">{message}</span>
  </div>
);

// No Data Component
const NoDataDisplay = ({ message }) => (
  <div className="flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700">
    <span className="text-sm text-gray-600 dark:text-gray-400">{message}</span>
  </div>
);

// StatCard Component
const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
    <div
      className="p-3 rounded-full mr-4"
      style={{ backgroundColor: `${color}1A` }}
    >
      <Icon className="h-6 w-6" style={{ color }} />
    </div>
    <div>
      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
        {label}
      </p>
      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        {value}
      </p>
    </div>
  </div>
);

const SummaryCard = ({ totalPedidos, totalRepartidores, assignedPedidos }) => {
  const accentColor = "#ffb300";

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          icon={Package}
          label="Pedidos Totales"
          value={totalPedidos}
          color={accentColor}
        />
        <StatCard
          icon={User}
          label="Repartidores"
          value={totalRepartidores}
          color="#3b82f6"
        />
        <StatCard
          icon={CheckCircle}
          label="Pedidos Asignados"
          value={assignedPedidos}
          color="#22c55e"
        />
      </div>
    </div>
  );
};

// FilterPanel Component
const FilterPanel = ({ onFilterChange, totalsByLocation }) => {
  const initialFilterState = { estado: "", municipio: "", localidad: "" };
  const [filters, setFilters] = useState(initialFilterState);
  const [availableMunicipios, setAvailableMunicipios] = useState([]);
  const [availableLocalidades, setAvailableLocalidades] = useState([]);

  useEffect(() => {
    if (filters.estado && totalsByLocation) {
      const municipios = [
        ...new Set(
          totalsByLocation
            .filter((loc) => loc.estado === filters.estado)
            .map((loc) => loc.municipio)
        ),
      ].sort();
      setAvailableMunicipios(municipios);
      setAvailableLocalidades([]);
      setFilters((prevFilters) => ({
        ...prevFilters,
        municipio: "",
        localidad: "",
      }));
    } else {
      setAvailableMunicipios([]);
      setAvailableLocalidades([]);
      setFilters((prevFilters) => ({
        ...prevFilters,
        municipio: "",
        localidad: "",
      }));
    }
  }, [filters.estado, totalsByLocation]);

  useEffect(() => {
    if (filters.municipio && totalsByLocation) {
      const localidades = [
        ...new Set(
          totalsByLocation
            .filter(
              (loc) =>
                loc.estado === filters.estado &&
                loc.municipio === filters.municipio
            )
            .map((loc) => loc.localidad)
        ),
      ].sort();
      setAvailableLocalidades(localidades);
      setFilters((prevFilters) => ({ ...prevFilters, localidad: "" }));
    } else {
      setAvailableLocalidades([]);
      setFilters((prevFilters) => ({ ...prevFilters, localidad: "" }));
    }
  }, [filters.municipio, totalsByLocation]);

  const handleApply = () => {
    onFilterChange(filters);
  };

  const handleClear = () => {
    setFilters(initialFilterState);
    onFilterChange(initialFilterState);
  };

  const accentColor = "#ffb300";

  const estados = totalsByLocation
    ? [...new Set(totalsByLocation.map((loc) => loc.estado))].sort()
    : [];

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-md mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center">
          <Filter className="h-5 w-5 mr-2" style={{ color: accentColor }} />
          Filtros de Búsqueda
        </h3>
        <button
          onClick={handleClear}
          className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center gap-1"
        >
          <X className="h-4 w-4" />
          Limpiar
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <select
          value={filters.estado}
          onChange={(e) => setFilters({ ...filters, estado: e.target.value })}
          className="w-full p-3 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:ring-2 focus:border-transparent transition"
          style={{ "--tw-ring-color": accentColor }}
        >
          <option value="">Seleccionar Estado</option>
          {estados.map((estado) => (
            <option key={estado} value={estado}>
              {estado}
            </option>
          ))}
        </select>

        <select
          value={filters.municipio}
          onChange={(e) =>
            setFilters({ ...filters, municipio: e.target.value })
          }
          disabled={!filters.estado}
          className="w-full p-3 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:ring-2 focus:border-transparent transition disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ "--tw-ring-color": accentColor }}
        >
          <option value="">Seleccionar Municipio</option>
          {availableMunicipios.map((municipio) => (
            <option key={municipio} value={municipio}>
              {municipio}
            </option>
          ))}
        </select>

        <select
          value={filters.localidad}
          onChange={(e) =>
            setFilters({ ...filters, localidad: e.target.value })
          }
          disabled={!filters.municipio}
          className="w-full p-3 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:ring-2 focus:border-transparent transition disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ "--tw-ring-color": accentColor }}
        >
          <option value="">Seleccionar Localidad</option>
          {availableLocalidades.map((localidad) => (
            <option key={localidad} value={localidad}>
              {localidad}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={handleApply}
          className="px-6 py-2.5 text-black text-sm font-bold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:opacity-90"
          style={{ backgroundColor: accentColor }}
        >
          <Check className="h-5 w-5" />
          Aplicar Filtros
        </button>
      </div>
    </div>
  );
};

// RepartidorCard Component
const RepartidorCard = ({
  repartidor,
  seleccionado,
  onSelect,
  pedidosAsignados,
}) => {
  const avatarSrc = repartidor?.fotoPerfil;
  const hasAvatar = !!avatarSrc;

  return (
    <div
      onClick={() => onSelect(repartidor.id)}
      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors duration-200
        ${
          seleccionado
            ? "bg-[#F5B800]/20 border-[#F5B800]"
            : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
        }`}
    >
      <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-300 dark:border-gray-600 flex items-center justify-center bg-gray-100 dark:bg-gray-700">
        {hasAvatar ? (
          <img
            src={avatarSrc}
            alt={`Avatar de ${repartidor.nombre}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <User className="w-6 h-6 text-gray-500 dark:text-gray-300" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
          {repartidor.nombre}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
          {repartidor.correo || "Sin correo"}
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500">
          {pedidosAsignados?.length || 0} pedidos asignados
        </p>
      </div>
    </div>
  );
};

// Format Date Function
const formatDate = (dateString) => {
  if (!dateString) return "Fecha no disponible";
  const options = { year: "numeric", month: "short", day: "numeric" };
  return new Date(dateString).toLocaleDateString("es-MX", options);
};

// Format Phone Number for WhatsApp
const formatPhoneNumberForWhatsApp = (phone) => {
  if (!phone) return null;
  let cleanPhone = phone.toString().replace(/\D/g, "");
  if (cleanPhone.length === 10) {
    cleanPhone = "52" + cleanPhone;
  }
  return cleanPhone;
};

// PedidoCard Component
const PedidoCard = ({ pedido, seleccionado, onToggle }) => {
  const totalAPagar = parseFloat(pedido.totalPagar) || 0;
  const totalPagado = parseFloat(pedido.totalPagado) || 0;
  const isFullyPaid = totalAPagar > 0 && totalAPagar === totalPagado;
  const displayDate = formatDate(
    pedido.tipo === "entrega"
      ? pedido.fechaEntrega
      : pedido.entregaReal || pedido.fechaInicio
  );
  const whatsAppNumber = formatPhoneNumberForWhatsApp(pedido.telefono);
  const message = encodeURIComponent(
    `Alquiladora Romero, hola te contacto sobre tu pedido ${pedido.idRastreo}.`
  );
  const whatsAppLink = `https://wa.me/${whatsAppNumber}?text=${message}`;
  const paymentProgress =
    totalAPagar > 0 ? (totalPagado / totalAPagar) * 100 : 0;

  const [isCanceling, setIsCanceling] = useState(false);
  const { csrfToken } = useAuth();

  const handleCancel = async () => {
    if (isCanceling) return;
    setIsCanceling(true);
    try {
      const response = await api.put(
        `/api/repartidor/pedidos/${pedido.id}`,
        { estadoActual: "Cancelado" },
        {
          headers: { "X-CSRF-Token": csrfToken },
          withCredentials: true,
        }
      );
      toast.success(response.data.message || "Pedido cancelado exitosamente.");
      onToggle(pedido.id);
      window.dispatchEvent(
        new CustomEvent("updatePedidos", { detail: { id: pedido.id } })
      );
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Error al cancelar el pedido. Inténtalo de nuevo.";
      console.error("Error al cancelar el pedido:", error);
      toast.error(errorMessage);
    } finally {
      setIsCanceling(false);
    }
  };

  return (
    <div
      onClick={() => onToggle(pedido.id)}
      className={`
        group relative rounded-lg cursor-pointer transition-all duration-200 
        bg-white dark:bg-gray-800 border overflow-hidden
        min-h-[120px] sm:min-h-[140px] hover:shadow-lg hover:scale-[1.01]
        ${
          seleccionado
            ? "border-amber-400 ring-2 ring-amber-100 dark:ring-amber-900/50 shadow-lg bg-gradient-to-br from-amber-50 to-white dark:from-amber-900/10 dark:to-gray-800"
            : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
        }
        ${pedido.atrasado ? "border-red-200 dark:border-red-800" : ""}
      `}
    >
      <div
        className={`absolute left-0 top-0 bottom-0 w-2 ${
          pedido.atrasado
            ? "bg-gradient-to-b from-red-400 to-red-600"
            : pedido.tipo === "entrega"
            ? "bg-gradient-to-b from-green-400 to-green-600"
            : "bg-gradient-to-b from-orange-400 to-orange-600"
        }`}
      />

      {(pedido.isUrgent || pedido.atrasado) && (
        <div className="absolute -top-1 -right-1 z-10">
          <div
            className={`bg-${
              pedido.atrasado ? "red" : "red"
            }-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md animate-pulse`}
          >
            {pedido.atrasado ? "ATRASADO" : "URGENTE"}
          </div>
        </div>
      )}

      {pedido.sameDay && (
        <div className="absolute top-1.5 right-1.5 z-10">
          <div className="bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
            HOY
          </div>
        </div>
      )}

      <div className="p-3 sm:p-4 h-full flex flex-col text-xs sm:text-sm">
        <div className="flex items-start gap-2 mb-2">
          <div className="flex-shrink-0 pt-1">
            {seleccionado ? (
              <div className="relative">
                <CheckCircle className="h-5 w-5 text-amber-500" />
                <div className="absolute inset-0 bg-amber-400 rounded-full animate-ping opacity-25" />
              </div>
            ) : (
              <div className="h-5 w-5 rounded-full border-2 border-gray-300 dark:border-gray-600 group-hover:border-amber-400 transition-colors" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 mb-1">
              <span
                className={`inline-flex items-center px-2 py-1 rounded-full text-[11px] font-semibold
                ${
                  pedido.atrasado
                    ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                    : pedido.tipo === "entrega"
                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400"
                }`}
              >
                {pedido.atrasado ? (
                  <>
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Atrasado
                  </>
                ) : pedido.tipo === "entrega" ? (
                  <>
                    <Truck className="h-3 w-3 mr-1" />
                    Entrega
                  </>
                ) : (
                  <>
                    <Package className="h-3 w-3 mr-1" />
                    Recogida
                  </>
                )}
              </span>

              <span className="text-[11px] font-mono text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                #{pedido.idRastreo || pedido.id}
              </span>
            </div>

            <p className="font-semibold text-sm text-gray-900 dark:text-gray-100 line-clamp-2">
              {pedido.descripcion}
            </p>
          </div>
        </div>

        <div className="mb-2">
          {isFullyPaid ? (
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <ShieldCheck className="h-4 w-4" />
              <span className="font-bold text-sm">PAGADO COMPLETO</span>
              <span className="text-[11px] bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-full">
                ${totalAPagar.toFixed(2)}
              </span>
            </div>
          ) : (
            <div className="space-y-1">
              <div className="flex justify-between text-[12px]">
                <span className="text-gray-600 dark:text-gray-400">Pago</span>
                <span className="font-bold text-gray-900 dark:text-gray-100">
                  ${totalPagado.toFixed(2)} / ${totalAPagar.toFixed(2)}
                </span>
              </div>

              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(paymentProgress, 100)}%` }}
                />
              </div>

              <div className="flex items-center gap-2 text-[12px]">
                <span className="flex items-center text-gray-600 dark:text-gray-400">
                  <CircleDollarSign className="h-3 w-3 mr-1" />$
                  {totalAPagar.toFixed(2)}
                </span>
                <span className="flex items-center text-blue-600 dark:text-blue-400">
                  <Wallet className="h-3 w-3 mr-1" />
                  {paymentProgress.toFixed(1)}%
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 space-y-1 text-[12px] text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <MapPin className="h-3 w-3 text-gray-500" />
            <span className="truncate font-medium">{pedido.localidad}</span>
            {pedido.municipio !== pedido.localidad && (
              <span className="text-gray-400 hidden sm:inline">
                • {pedido.municipio}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3 text-gray-500" />
            <span className="font-medium">{displayDate}</span>
          </div>

          {pedido.direccion && (
            <div className="flex items-start gap-1">
              <Navigation className="h-3 w-3 text-gray-500 mt-0.5" />
              <span className="line-clamp-2 text-gray-500">
                {pedido.direccion}
              </span>
            </div>
          )}
        </div>

        <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCancel();
              }}
              disabled={isCanceling || pedido.status === "Cancelado"}
              className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-500 hover:bg-red-600 text-white text-[11px] font-semibold rounded-full transition-all duration-200 hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isCanceling ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <>
                  <X className="h-3 w-3" />
                  <span className="hidden sm:inline">Cancelar</span>
                  <span className="sm:hidden">X</span>
                </>
              )}
            </button>

            {whatsAppNumber && (
              <a
                href={whatsAppLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-500 hover:bg-green-600 text-white text-[11px] font-semibold rounded-full transition-all duration-200 hover:scale-105"
              >
                <MessageCircle className="h-3 w-3" />
                <span className="hidden sm:inline">WhatsApp</span>
                <span className="sm:hidden">WA</span>
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </div>
  );
};

// Pagination Component
const Pagination = ({ currentPage, totalPages, onPageChange, localityKey }) => {
  const maxVisiblePages = 90;
  const halfVisible = Math.floor(maxVisiblePages / 2);
  let startPage = Math.max(1, currentPage - halfVisible);
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  if (endPage - startPage < maxVisiblePages - 1) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  const pages = Array.from(
    { length: endPage - startPage + 1 },
    (_, i) => startPage + i
  );

  return (
    <div className="flex items-center justify-center gap-2 mt-4">
      <button
        onClick={() => onPageChange(localityKey, currentPage - 1)}
        disabled={currentPage === 1}
        className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors duration-200 ${
          currentPage === 1
            ? "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
            : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700"
        }`}
      >
        Anterior
      </button>
      {startPage > 1 && (
        <span className="px-3 py-1 text-sm text-gray-500 dark:text-gray-400">
          ...
        </span>
      )}
      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(localityKey, page)}
          className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors duration-200 ${
            currentPage === page
              ? "bg-indigo-600 dark:bg-indigo-700 text-white"
              : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700"
          }`}
        >
          {page}
        </button>
      ))}
      {endPage < totalPages && (
        <span className="px-3 py-1 text-sm text-gray-500 dark:text-gray-400">
          ...
        </span>
      )}
      <button
        onClick={() => onPageChange(localityKey, currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors duration-200 ${
          currentPage === totalPages
            ? "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
            : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700"
        }`}
      >
        Siguiente
      </button>
    </div>
  );
};

const HistorialCard = ({ repartidor, pedidos, onViewDetails }) => {
  const entregaCount = pedidos.filter(
    (p) => p.tipoPedidoEstado === "Enviando"
  ).length;
  const recogidaCount = pedidos.filter(
    (p) => p.tipoPedidoEstado === "Recogiendo"
  ).length;
  const tipos = [];
  if (entregaCount > 0) tipos.push("Enviando");
  if (recogidaCount > 0) tipos.push("Recogiendo");

  const stateStyles = {
    confirmado: {
      color: "text-green-500",
      icon: <AiFillCheckCircle className="h-4 w-4" />,
    },
    enviando: {
      color: "text-blue-500",
      icon: <AiOutlineCar className="h-4 w-4" />,
    },
    "en alquiler": {
      color: "text-purple-500",
      icon: <AiOutlineCar className="h-4 w-4" />,
    },
    recogiendo: {
      color: "text-yellow-500",
      icon: <AiOutlineShoppingCart className="h-4 w-4" />,
    },
    devuelto: {
      color: "text-gray-300",
      icon: <AiOutlineUndo className="h-4 w-4" />,
    },
    incompleto: {
      color: "text-yellow-600",
      icon: <AiOutlineWarning className="h-4 w-4" />,
    },
    incidente: {
      color: "text-red-500",
      icon: <AiFillExclamationCircle className="h-4 w-4" />,
    },
    cancelado: {
      color: "text-gray-800",
      icon: <AiOutlineCloseCircle className="h-4 w-4" />,
    },
    finalizado: {
      color: "text-green-800",
      icon: <AiFillCheckCircle className="h-4 w-4" />,
    },
  };

  const firstPedidoState =
    pedidos?.[0]?.tipoPedidoEstado?.toLowerCase() || "desconocido";
  const stateStyle = stateStyles[firstPedidoState] || {
    color: "text-gray-500",
    icon: <AiOutlineQuestionCircle className="h-4 w-4" />,
  };
  const avatarSrc = pedidos?.[0]?.repartidor?.fotoPerfil || null;
  const hasAvatar = !!avatarSrc;

  return (
    <div className="group relative w-full max-w-[95%] sm:max-w-sm mx-auto rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 p-3 sm:p-4 overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div className="flex items-center gap-3">
          <div className="shrink-0">
            {hasAvatar ? (
              <img
                src={avatarSrc}
                alt="Perfil"
                className="w-10 h-10 rounded-full object-cover border border-gray-300 dark:border-gray-600"
              />
            ) : (
              <User className="w-10 h-10 text-gray-400 dark:text-gray-500" />
            )}
          </div>
          <div className="text-sm overflow-hidden">
            <p className={`font-semibold ${stateStyle.color} truncate`}>
              {pedidos[0]?.repartidor?.nombre || "Desconocido"}
            </p>
            <p className="text-gray-500 text-xs truncate">
              {pedidos[0]?.repartidor?.correo || "Sin correo"}
            </p>
            <p className="text-gray-500 text-xs truncate">
              {tipos.join(" y ") || "Sin asignación"} (
              {entregaCount + recogidaCount})
            </p>
          </div>
        </div>

        <div className="flex justify-end sm:justify-center">
          <button
            onClick={() => onViewDetails(repartidor?.id)}
            className="flex items-center gap-1 bg-indigo-600 text-white text-xs px-2 py-1 rounded hover:bg-indigo-700 transition disabled:opacity-50"
            disabled={!repartidor?.id}
          >
            <Eye className="w-3.5 h-3.5" />
            Ver
          </button>
        </div>
      </div>

      <div className="mt-3 border-t pt-2 border-gray-200 dark:border-gray-700 flex items-center gap-2">
        {stateStyle.icon}
        <span className={`text-sm font-medium ${stateStyle.color} truncate`}>
          {firstPedidoState.charAt(0).toUpperCase() + firstPedidoState.slice(1)}
        </span>
      </div>
    </div>
  );
};

const Modal = ({
  isOpen,
  onClose,
  pedidos,
  pedidoDetalles,
  selectedLocation,
}) => {
  // Salir si no está abierto
  if (!isOpen) return null;

  const repartidorData =
    pedidos.length > 0
      ? pedidos[0].repartidor
      : {
          nombre: "Desconocido",
          correo: "Sin correo",
        };

  const formatPhoneNumberForWhatsApp = (phone) => {
    if (!phone) return null;
    let cleanPhone = phone.toString().replace(/\D/g, "");
    if (cleanPhone.length === 10) cleanPhone = "52" + cleanPhone;
    return cleanPhone;
  };

  const whatsappNumber = formatPhoneNumberForWhatsApp(repartidorData.telefono);
  const whatsappMessage = encodeURIComponent(
    `Hola ${repartidorData.nombre}, te contacto sobre tus pedidos asignados.`
  );
  const whatsappLink = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`
    : null;

  
  const handlePrint = () => window.print();

  const handleExportCSV = () => {
    const csv = [
      [
        "ID",
        "Rastreo",
        "Fecha Asignación",
        "Estado",
        "Municipio",
        "Total a Pagar",
        "Monto Pagado",
        "Productos",
      ],
      ...pedidos.map((p) => {
        const detalles = pedidoDetalles[p.idPedido] || {
          productos: [],
          montoPagado: "0.00",
          totalPagar: p.totalPagar || "0.00",
        };
        return [
          p.idPedido,
          p.idRastreo,
          p.fechaAsignacion,
          p.tipoPedidoEstado,
          p.municipio,
          detalles.totalPagar,
          detalles.montoPagado,
          detalles.productos
            .map(
              (prod) =>
                `${prod.nombreProducto} (${prod.cantidad} x $${prod.precioUnitario}, Subtotal: $${prod.subtotal}, Color: ${prod.color})`
            )
            .join(", ") || "Sin productos",
        ];
      }),
    ]
      .map((row) => row.join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `repartidor_${repartidorData.nombre.replace(
      " ",
      "_"
    )}_pedidos.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };


  const totalGeneral = pedidos.reduce((sum, p) => {
    const detalles = pedidoDetalles[p.idPedido] || { totalPagar: "0.00" };
    return sum + (parseFloat(detalles.totalPagar) || 0);
  }, 0);

  const totalPagado = pedidos.reduce((sum, p) => {
    const detalles = pedidoDetalles[p.idPedido] || { montoPagado: "0.00" };
    return sum + (parseFloat(detalles.montoPagado) || 0);
  }, 0);

  // 4. Estilos y Íconos por Estado
  const stateStyles = {
    confirmado: {
      color: "text-emerald-700",
      bg: "bg-emerald-50",
      icon: <AiFillCheckCircle className="h-4 w-4" />,
    },
    enviando: {
      color: "text-blue-700",
      bg: "bg-blue-50",
      icon: <AiOutlineCar className="h-4 w-4" />,
    },
    "en alquiler": {
      color: "text-purple-700",
      bg: "bg-purple-50",
      icon: <AiOutlineCar className="h-4 w-4" />,
    },
    recogiendo: {
      color: "text-amber-700",
      bg: "bg-amber-50",
      icon: <AiOutlineShoppingCart className="h-4 w-4" />,
    },
    devuelto: {
      color: "text-gray-700",
      bg: "bg-gray-50",
      icon: <AiOutlineUndo className="h-4 w-4" />,
    },
    incompleto: {
      color: "text-orange-700",
      bg: "bg-orange-50",
      icon: <AiOutlineWarning className="h-4 w-4" />,
    },
    incidente: {
      color: "text-red-700",
      bg: "bg-red-50",
      icon: <AiFillExclamationCircle className="h-4 w-4" />,
    },
    cancelado: {
      color: "text-gray-700",
      bg: "bg-gray-100",
      icon: <AiOutlineCloseCircle className="h-4 w-4" />,
    },
    finalizado: {
      color: "text-emerald-700",
      bg: "bg-emerald-100",
      icon: <AiFillCheckCircle className="h-4 w-4" />,
    },
  };

  return (
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 md:p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-7xl h-[95vh] shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden transform transition-all duration-300 hover:shadow-2xl flex flex-col">
        {/* Header - Fijo */}
        <div className="bg-gradient-to-r from-[#F59E0B] to-[#FBBF24] px-6 py-4 border-b border-[#F59E0B]/20 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-5">
              <div className="p-2.5 bg-white/30 rounded-xl">
                <User className="h-7 w-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {repartidorData.nombre}
                </h2>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-1">
                  <p className="text-sm text-yellow-100">
                    {repartidorData.correo}
                  </p>
                  {whatsappLink && (
                    <a
                      href={whatsappLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-sm text-yellow-100 hover:text-white transition-colors"
                    >
                      <MessageCircle className="h-4 w-4 mr-1" />
                      {repartidorData.telefono}
                    </a>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-xl transition-colors"
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>
        </div>

        {/* Resumen - Fijo */}
        <div className="bg-gray-50 dark:bg-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="bg-white dark:bg-gray-700 p-3 rounded-lg">
              <p className="text-xs text-gray-600 dark:text-gray-400 uppercase font-medium">
                Pedidos
              </p>
              <p className="text-2xl font-bold text-[#F59E0B] mt-1">
                {pedidos.length}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-700 p-3 rounded-lg">
              <p className="text-xs text-gray-600 dark:text-gray-400 uppercase font-medium">
                Ubicación
              </p>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mt-1">
                {selectedLocation?.localidad}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-700 p-3 rounded-lg">
              <p className="text-xs text-gray-600 dark:text-gray-400 uppercase font-medium">
                Total
              </p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                ${totalGeneral.toFixed(2)}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-700 p-3 rounded-lg">
              <p className="text-xs text-gray-600 dark:text-gray-400 uppercase font-medium">
                Pagado
              </p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">
                ${totalPagado.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Contenido Principal - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {pedidos.length > 0 ? (
              <div className="space-y-6">
                {pedidos.map((p) => {
                  const detalles = pedidoDetalles[p.idPedido] || {
                    productos: [],
                    montoPagado: "0.00",
                    totalPagar: p.totalPagar || "0.00",
                  };
                  const totalAPagar = parseFloat(detalles.totalPagar) || 0;
                  const totalPagado = parseFloat(detalles.montoPagado) || 0;
                  const isFullyPaid =
                    totalAPagar > 0 && totalAPagar === totalPagado;
                  const paymentProgress =
                    totalAPagar > 0 ? (totalPagado / totalAPagar) * 100 : 0;
                  const stateStyle = stateStyles[
                    p.tipoPedidoEstado.toLowerCase()
                  ] || {
                    color: "text-gray-500",
                    bg: "bg-gray-50",
                    icon: <AiOutlineQuestionCircle className="h-4 w-4" />,
                  };

                  return (
                    <div
                      key={p.idPedido}
                      className="border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 hover:shadow-lg transition-all duration-200 overflow-hidden"
                    >
                      {/* Encabezado del Pedido */}
                      <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 border-b border-gray-200 dark:border-gray-600">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-[#F59E0B]/10 dark:bg-[#F59E0B]/20 rounded-lg">
                              <Package className="h-5 w-5 text-[#F59E0B] dark:text-amber-400" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-lg">
                                Pedido #{p.idRastreo || p.idPedido}
                              </h4>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {formatDate(p.fechaAsignacion)}
                              </p>
                            </div>
                          </div>
                          <span
                            className={`px-3 py-1 text-sm font-medium rounded-full flex items-center gap-1 ${stateStyle.color} ${stateStyle.bg}`}
                          >
                            {stateStyle.icon}
                            {p.tipoPedidoEstado}
                          </span>
                        </div>
                      </div>

                      <div className="p-4 space-y-4">
                        {/* Información General */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium mb-1">
                              Municipio
                            </p>
                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                              {p.municipio}
                            </p>
                          </div>
                          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium mb-1">
                              Tipo
                            </p>
                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                              {detalles.tipoPedido || "N/A"}
                            </p>
                          </div>
                          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium mb-1">
                              Días Alquiler
                            </p>
                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                              {detalles.diasAlquiler || "N/A"}
                            </p>
                          </div>
                        </div>

                        {/* Estado de Pago */}
                        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                              Estado de Pago
                            </span>
                            <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                              ${totalPagado.toFixed(2)} / $
                              {totalAPagar.toFixed(2)}
                            </span>
                          </div>

                          {isFullyPaid ? (
                            <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                              <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                              <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                                Pago Completado
                              </span>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3">
                                <div
                                  className="bg-gradient-to-r from-[#F59E0B] to-[#FBBF24] h-3 rounded-full transition-all duration-500"
                                  style={{
                                    width: `${Math.min(paymentProgress, 100)}%`,
                                  }}
                                />
                              </div>
                              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                                <span className="font-medium">
                                  {paymentProgress.toFixed(1)}% completado
                                </span>
                                <span className="font-medium">
                                  Pendiente: $
                                  {(totalAPagar - totalPagado).toFixed(2)}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Productos */}
                        {detalles.productos.length > 0 && (
                          <div className="border-t border-gray-300 dark:border-gray-700 pt-4">
                            <h5 className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-3 flex items-center">
                              <Package className="h-5 w-5 mr-2 text-[#F59E0B]" />
                              Productos ({detalles.productos.length})
                            </h5>

                            <div className="space-y-3">
                              {detalles.productos.map((prod, index) => (
                                <div
                                  key={index}
                                  className="p-4 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                  <div className="flex justify-between items-center mb-1">
                                    <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
                                      {prod.nombreProducto}
                                    </p>
                                    <p className="text-lg font-bold text-green-700 dark:text-green-300">
                                      ${prod.subtotal.toFixed(2)}
                                    </p>
                                  </div>

                                  <p className="text-sm text-gray-700 dark:text-gray-300">
                                    <span className="mr-4">
                                      <strong>Color:</strong> {prod.color}
                                    </span>
                                    <span className="mr-4">
                                      <strong>Cantidad:</strong> {prod.cantidad}
                                    </span>
                                    <span>
                                      <strong>Precio :</strong> $
                                      {prod.precioUnitario}
                                    </span>
                                  </p>

                                  {(prod.observaciones ||
                                    prod.estadoProducto) && (
                                    <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600 text-sm text-gray-600 dark:text-gray-400 space-y-1">
                                      {prod.observaciones && (
                                        <p>
                                          <strong>Observaciones:</strong>{" "}
                                          {prod.observaciones}
                                        </p>
                                      )}
                                      {prod.estadoProducto && (
                                        <p>
                                          <strong>Estado:</strong>{" "}
                                          {prod.estadoProducto}
                                        </p>
                                      )}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                  <Package className="h-10 w-10 text-gray-400 dark:text-gray-600" />
                </div>
                <p className="text-xl text-gray-500 dark:text-gray-400">
                  No hay pedidos asignados
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                  en {selectedLocation?.localidad}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer - Fijo */}
        <div className="bg-gray-50 dark:bg-gray-800 px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center flex-shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
          >
            Cerrar
          </button>
          <div className="flex gap-3">
            <button
              onClick={handlePrint}
              className="px-5 py-2 bg-[#F59E0B] text-white rounded-lg hover:bg-[#D97706] transition-colors text-sm font-medium flex items-center gap-2"
            >
              <Printer className="h-4 w-4" />
              Imprimir
            </button>
            <button
              onClick={handleExportCSV}
              className="px-5 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Exportar CSV
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const initialState = {
  pedidos: [],
  repartidores: [],
  pedidosError: null,
  repartidoresError: null,
  pedidosEmpty: false,
  repartidoresEmpty: false,
  repartidorSel: null,
  pedidosSel: [],
  busquedaRep: "",
  filtroDia: "hoy",
  pagination: {},
  modalOpen: false,
  selectedRepartidorId: null,
  historialPage: 1,
  isLoading: true,
  filters: { estado: "", municipio: "", localidad: "" },
  notification: null,
  days: [],
  totals: { totalPedidos: 0, totalRepartidores: 0, totalPedidosAsignados: 0 },
  totalsByLocation: [],
  historialPedidos: [],
  pedidoDetalles: {},
};

const reducer = (state, action) => {
  switch (action.type) {
    case "SET_DATA":
      return {
        ...state,
        pedidos: action.pedidos || [],
        repartidores: action.repartidores || [],
        pedidosError: action.pedidosError || null,
        repartidoresError: action.repartidoresError || null,
        pedidosEmpty: action.pedidosEmpty || false,
        repartidoresEmpty: action.repartidoresEmpty || false,
        days: action.days || [],
        totals: action.totals || {
          totalPedidos: 0,
          totalRepartidores: 0,
          totalPedidosAsignados: 0,
        },
        totalsByLocation: action.totalsByLocation || [],
        isLoading: false,
      };
    case "SET_REPARTIDOR_SEL":
      return { ...state, repartidorSel: action.id };
    case "TOGGLE_PEDIDO":
      return {
        ...state,
        pedidosSel: state.pedidosSel.includes(action.id)
          ? state.pedidosSel.filter((x) => x !== action.id)
          : [...state.pedidosSel, action.id],
      };
    case "ASIGNAR_PEDIDOS":
      return {
        ...state,
        pedidos: state.pedidos.map((p) =>
          state.pedidosSel.includes(p.id)
            ? { ...p, repartidorId: state.repartidorSel }
            : p
        ),
        pedidosSel: [],
        repartidorSel: null,
        totals: {
          ...state.totals,
          totalPedidosAsignados:
            state.totals.totalPedidosAsignados + state.pedidosSel.length,
        },
      };
    case "SET_BUSQUEDA_REP":
      return { ...state, busquedaRep: action.value };
    case "SET_FILTRO_DIA":
      console.log("Reductor: Actualizando filtroDia a", action.filtroDia);
      return { ...state, filtroDia: action.filtroDia };
    case "SET_PAGINATION":
      return {
        ...state,
        pagination: { ...state.pagination, [action.key]: action.page },
      };
    case "SET_MODAL":
      return {
        ...state,
        modalOpen: action.open,
        selectedRepartidorId: action.id || null,
        selectedLocation: action.selectedLocation || null,
        filteredPedidos: action.filteredPedidos || [], 
      };
    case "SET_HISTORIAL_PAGE":
      return { ...state, historialPage: action.page };
    case "SET_FILTERS":
      return { ...state, filters: action.filters };
    case "CLEAR_FILTERS":
      return {
        ...state,
        repartidorSel: null,
        pedidosSel: [],
        busquedaRep: "",
        filtroDia: "hoy",
        pagination: {},
        historialPage: 1,
        filters: { estado: "", municipio: "", localidad: "" },
      };
    case "SET_NOTIFICATION":
      return { ...state, notification: action.notification };
    case "SET_HISTORIAL":
      return { ...state, historialPedidos: action.historial || [] };
    case "SET_DETALLES_PEDIDO":
      return {
        ...state,
        pedidoDetalles: {
          ...state.pedidoDetalles,
          [action.idPedido]: action.detalles,
        },
      };
    case "UPDATE_PEDIDO":
      return {
        ...state,
        pedidos: state.pedidos.filter((p) => p.id !== action.id),
      };
    default:
      return state;
  }
};

const now = new Date();
now.setHours(0, 0, 0, 0);
const today = now.toISOString().split("T")[0];
const tomorrow = new Date(now);
tomorrow.setDate(now.getDate() + 1);
const tomorrowStr = tomorrow.toISOString().split("T")[0];

const AsignacionPedidosGeo = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { csrfToken } = useAuth();
  const [isAssigning, setIsAssigning] = useState(false);
  const [selectedDate, setSelectedDate] = useState(now);
  const [isLoadingHistorial, setIsLoadingHistorial] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      let pedidos = [];
      let repartidores = [];
      let pedidosError = null;
      let repartidoresError = null;
      let pedidosEmpty = false;
      let repartidoresEmpty = false;
      let days = [];
      let totals = {
        totalPedidos: 0,
        totalRepartidores: 0,
        totalPedidosAsignados: 0,
      };
      let totalsByLocation = [];

      try {
        const repartidoresRes = await api.get(
          "/api/repartidor/administrar/activos/repartidores",
          {
            headers: { "X-CSRF-Token": csrfToken },
            withCredentials: true,
          }
        );

        console.log("repar", repartidoresRes);

        repartidores = repartidoresRes.data.data.map((r) => ({
          id: r.idRepartidor || null,
          nombre: r.nombre || "Desconocido",
          correo: r.correo || "Sin correo",
          estado: r.estado || "activo",
          foto: r.fotoPerfil || "",
        }));

        console.log("Datos oh", repartidores);
        if (repartidores.length === 0) {
          repartidoresEmpty = true;
        }
      } catch (error) {
        console.error("Error al obtener repartidores:", error);
        repartidoresError =
          "Error al cargar repartidores. Se está corrigiendo este error.";
      }

      try {
        const pedidosRes = await api.get("/api/repartidor/pedidos", {
          headers: { "X-CSRF-Token": csrfToken },
          withCredentials: true,
        });
        console.log("Resultado de pedidos desde API---", pedidosRes.data);

        if (!pedidosRes.data.success) {
          throw new Error("API returned success: false");
        }

        days = pedidosRes.data.days || [];
        totals = {
          totalPedidos: pedidosRes.data.totalPedidos || 0,
          totalRepartidores: pedidosRes.data.totalRepartidores || 0,
          totalPedidosAsignados: pedidosRes.data.totalPedidosAsignados || 0,
        };
        totalsByLocation = pedidosRes.data.totalsByLocation || [];

        pedidos = [
          ...(pedidosRes.data.deliveries || []).map((p) => ({
            id: p.idPedido || null,
            descripcion: p.nombre
              ? `${p.nombre} ${p.apellido || ""}`
              : `Pedido #${p.idPedido || "Desconocido"}`,
            fechaInicio: p.fechaInicio
              ? new Date(p.fechaInicio).toISOString().split("T")[0]
              : new Date().toISOString().split("T")[0],
            fechaEntrega: p.fechaEntrega
              ? new Date(p.fechaEntrega).toISOString().split("T")[0]
              : new Date().toISOString().split("T")[0],
            estado: p.direccionEstado || "Desconocido",
            idRastreo: p.idRastreo || "null",
            municipio: p.municipio || "Desconocido",
            localidad: p.localidad || "Desconocido",
            repartidorId: null,
            idUsuarios: p.idUsuarios === null ? p.idNoClientes : p.idUsuarios,
            tipo: "entrega",
            status: p.estadoActual || "Confirmado",
            direccion: p.direccion || "",
            telefono: p.telefono || "",
            referencias: p.referencias || "",
            totalPagar: p.totalPagar || "0.00",
            totalPagado: p.totalPagado || "0.00",
            entregaReal: p.entregaReal || null,
            isUrgent: p.isUrgent || false,
            sameDay: p.sameDay || false,
            atrasado: p.atrasado || false,
          })),
          ...(pedidosRes.data.lateDeliveries || []).map((p) => ({
            id: p.idPedido || null,
            descripcion: p.nombre
              ? `${p.nombre} ${p.apellido || ""}`
              : `Pedido #${p.idPedido || "Desconocido"}`,
            fechaInicio: p.fechaInicio
              ? new Date(p.fechaInicio).toISOString().split("T")[0]
              : new Date().toISOString().split("T")[0],
            fechaEntrega: p.fechaEntrega
              ? new Date(p.fechaEntrega).toISOString().split("T")[0]
              : new Date().toISOString().split("T")[0],
            estado: p.direccionEstado || "Desconocido",
            municipio: p.municipio || "Desconocido",
            localidad: p.localidad || "Desconocido",
            repartidorId: null,
            totalPagado: p.totalPagado || "0.00",
            idRastreo: p.idRastreo || "null",
            tipo: "entrega",
            telefono: p.telefono || "",
            status: p.estadoActual || "Confirmado",
            direccion: p.direccion || "",
            referencias: p.referencias || "",
            totalPagar: p.totalPagar || "0.00",
            entregaReal: p.entregaReal || null,
            isUrgent: p.isUrgent || false,
            sameDay: p.sameDay || false,
            atrasado: p.atrasado || true,
          })),
          ...(pedidosRes.data.pickups || []).map((p) => ({
            id: p.idPedido || null,
            descripcion: p.nombre
              ? `${p.nombre} ${p.apellido || ""}`
              : `Pedido #${p.idPedido || "Desconocido"}`,
            fechaInicio: p.fechaInicio
              ? new Date(p.fechaInicio).toISOString().split("T")[0]
              : new Date().toISOString().split("T")[0],
            fechaEntrega: p.fechaEntrega
              ? new Date(p.fechaEntrega).toISOString().split("T")[0]
              : new Date().toISOString().split("T")[0],
            estado: p.direccionEstado || "Desconocido",
            municipio: p.municipio || "Desconocido",
            localidad: p.localidad || "Desconocido",
            repartidorId: null,
            totalPagado: p.totalPagado || "0.00",
            idRastreo: p.idRastreo || "null",
            tipo: "recogida",
            telefono: p.telefono || "",
            status: p.estadoActual || "Confirmado",
            direccion: p.direccion || "",
            referencias: p.referencias || "",
            totalPagar: p.totalPagar || "0.00",
            entregaReal: p.fechaRecogidaReal || null,
            isUrgent: p.isUrgent || false,
            sameDay: p.sameDay || false,
          })),
        ];

        console.log("Pedidos procesados---", pedidos);
        if (pedidos.length === 0) {
          pedidosEmpty = true;
        }
      } catch (error) {
        console.error("Error al obtener pedidos:", error);
        pedidosError =
          "Error al cargar pedidos. Se está corrigiendo este error.";
      }

      // Fetch historial de pedidos asignados con la fecha seleccionada
      try {
        setIsLoadingHistorial(true);
        const dateStr = selectedDate.toISOString().split("T")[0];
        console.log("Fecha seleccionada para historial:", dateStr);
        const historialRes = await api.get(
          "/api/repartidor/repartidores/historial",
          {
            headers: { "X-CSRF-Token": csrfToken },
            withCredentials: true,
            params: { fecha: dateStr },
          }
        );
        console.log("datos de historialres", historialRes);

        if (historialRes.data.success) {
          dispatch({
            type: "SET_HISTORIAL",
            historial: historialRes.data.data,
          });
        }
      } catch (error) {
        console.error("Error al obtener historial:", error);
      } finally {
        setIsLoadingHistorial(false);
      }

      dispatch({
        type: "SET_DATA",
        pedidos,
        repartidores,
        pedidosError,
        repartidoresError,
        pedidosEmpty,
        repartidoresEmpty,
        days,
        totals,
        totalsByLocation,
      });
    };

    fetchData();

    const handleUpdatePedidos = (event) => {
      dispatch({ type: "UPDATE_PEDIDO", id: event.detail.id });
    };

    window.addEventListener("updatePedidos", handleUpdatePedidos);
    return () =>
      window.removeEventListener("updatePedidos", handleUpdatePedidos);
  }, [csrfToken, selectedDate]);

  const dayLabels = useMemo(() => {
    const labels = [];
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay() + 1);
    for (let i = 0; i < 6; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      const dateStr = date.toISOString().split("T")[0];
      labels.push({
        date: dateStr,
        label:
          dateStr === today
            ? "Hoy"
            : date.toLocaleDateString("es-MX", { weekday: "long" }),
        dayOfWeek: date.getDay(),
      });
    }
    return labels;
  }, [today]);

  const filteredPedidos = useMemo(() => {
    return state.pedidos.filter((p) => {
      const matchesEstado =
        !state.filters.estado || p.estado === state.filters.estado;
      const matchesMunicipio =
        !state.filters.municipio || p.municipio === state.filters.municipio;
      const matchesLocalidad =
        !state.filters.localidad || p.localidad === state.filters.localidad;
      return matchesEstado && matchesMunicipio && matchesLocalidad;
    });
  }, [state.pedidos, state.filters]);

  const pedidosEntrega = useMemo(() => {
    let filterDate = today;

    if (state.filtroDia === "hoy") {
      filterDate = today;
    } else if (state.filtroDia === "mañana") {
      filterDate = tomorrowStr;
    } else {
      const index = parseInt(state.filtroDia, 10);
      filterDate = dayLabels[index]?.date || today;
    }

    console.log("Filtro aplicado:", state.filtroDia, "Fecha:", filterDate);

    const filtered = filteredPedidos
      .filter(
        (p) =>
          p.tipo === "entrega" &&
          (p.repartidorId === null || p.repartidorId === undefined) &&
          ((p.entregaReal && p.entregaReal.split("T")[0] === filterDate) ||
            (p.atrasado && p.fechaInicio.split("T")[0] === filterDate))
      )
      .sort((a, b) => a.descripcion.localeCompare(b.descripcion));

    console.log("Pedidos entrega filtrados:", filtered);
    return filtered;
  }, [filteredPedidos, state.filtroDia, dayLabels, today, tomorrowStr]);

  const pedidosRecogida = useMemo(() => {
    const todayDate = new Date(today + "T00:00:00-06:00");
    console.log("Today Date for Recogida:", todayDate);

    const recogida = filteredPedidos
      .filter(
        (p) =>
          p.tipo === "recogida" &&
          (p.repartidorId === null || p.repartidorId === undefined)
      )
      .map((p) => {
        const entregaDate = new Date(p.entregaReal + "T00:00:00-06:00");
        console.log(
          `Pedido ${p.id} - entregaReal: ${
            p.entregaReal
          }, Date: ${entregaDate}, Comparación: ${entregaDate <= todayDate}`
        );
        return p;
      })
      .sort(
        (a, b) =>
          new Date(b.entregaReal + "T00:00:00-06:00") -
          new Date(a.entregaReal + "T00:00:00-06:00")
      );

    console.log("Pedidos Recogida filtrados:", recogida);
    return recogida;
  }, [filteredPedidos, today]);

  const pedidosAtrasados = useMemo(() => {
    return filteredPedidos
      .filter(
        (p) =>
          p.tipo === "entrega" &&
          p.atrasado &&
          (p.repartidorId === null || p.repartidorId === undefined)
      )
      .sort((a, b) => a.descripcion.localeCompare(b.descripcion));
  }, [filteredPedidos]);

  const allPedidos = useMemo(() => {
    const uniquePedidos = [
      ...new Set(
        [...pedidosEntrega, ...pedidosRecogida, ...pedidosAtrasados].map((p) =>
          JSON.stringify(p)
        )
      ),
    ].map((p) => JSON.parse(p));
    return uniquePedidos;
  }, [pedidosEntrega, pedidosRecogida, pedidosAtrasados]);

  const treePedidos = useMemo(() => {
    return allPedidos.reduce((acc, p) => {
      acc[p.estado] = acc[p.estado] || {};
      acc[p.estado][p.municipio] = acc[p.estado][p.municipio] || {};
      acc[p.estado][p.municipio][p.localidad] = acc[p.estado][p.municipio][
        p.localidad
      ] || {
        entrega: [],
        recogida: [],
        atrasados: [],
      };
      acc[p.estado][p.municipio][p.localidad][
        p.atrasado ? "atrasados" : p.tipo
      ].push(p);
      return acc;
    }, {});
  }, [allPedidos]);

  const repartidoresActivos = useMemo(
    () =>
      Array.isArray(state.repartidores)
        ? state.repartidores
            .filter((r) => r.estado === "activo")
            .filter(
              (r) =>
                (r.nombre
                  .toLowerCase()
                  .includes(state.busquedaRep.toLowerCase()) ||
                  r.correo
                    .toLowerCase()
                    .includes(state.busquedaRep.toLowerCase())) &&
                (state.pedidos.filter((p) => p.repartidorId === r.id).length ===
                  0 ||
                  r.id === state.repartidorSel)
            )
            .map((r) => ({
              ...r,
              pedidosAsignados: state.pedidos.filter(
                (p) => p.repartidorId === r.id
              ).length,
            }))
        : [],
    [state.repartidores, state.busquedaRep, state.pedidos, state.repartidorSel]
  );

  const historialRepartidor = useMemo(() => {
    const historial = {};
    if (Array.isArray(state.historialPedidos)) {
      state.historialPedidos.forEach((p) => {
        const repartidor = p.repartidor || {
          id: null,
          nombre: "Desconocido",
          correo: "Sin correo",
        };
        const repartidorId = repartidor.id;
        if (repartidorId) {
          historial[repartidorId] = historial[repartidorId] || [];
          historial[repartidorId].push({
            ...p,
            idPedido: p.idPedido,
            idRastreo: p.idRastreo,
            fechaAsignacion: p.fechaAsignacion,
            tipoPedidoEstado: p.tipoPedidoEstado,
            estado: p.estado,
            municipio: p.municipio,
            totalPagar: p.totalPagar || "0.00",
            estadoActual: p.estadoActual || "Desconocido",
            repartidor, // Incluimos el objeto repartidor completo
          });
        }
      });
    }
    console.log("Historial de repartidor:", historial);
    return historial;
  }, [state.historialPedidos]);

  const treeHistorial = useMemo(() => {
    const historial = {};
    Object.values(historialRepartidor).forEach((pedidos) => {
      pedidos.forEach((p) => {
        const repartidor = p.repartidor || {
          id: null,
          nombre: "Desconocido",
          correo: "Sin correo",
        };
        historial[p.estado] = historial[p.estado] || {};
        historial[p.estado][p.municipio] =
          historial[p.estado][p.municipio] || {};
        historial[p.estado][p.municipio][p.localidad] =
          historial[p.estado][p.municipio][p.localidad] || {};
        historial[p.estado][p.municipio][p.localidad][repartidor.id] =
          historial[p.estado][p.municipio][p.localidad][repartidor.id] || [];
        historial[p.estado][p.municipio][p.localidad][repartidor.id].push(p);
      });
    });
    console.log("Tree Historial:", historial);
    return historial;
  }, [historialRepartidor]);

 

  const asignarPedidos = async () => {
    if (!state.repartidorSel || state.pedidosSel.length === 0) {
      toast.error("Seleccione un repartidor y pedidos");
      return;
    }

    setIsAssigning(true);

    try {
      await api.post(
        "/api/repartidor/pedidos/asignar",
        {
          repartidorId: state.repartidorSel,
          pedidosIds: state.pedidosSel,
        },
        {
          headers: { "X-CSRF-Token": csrfToken },
          withCredentials: true,
        }
      );
      dispatch({ type: "ASIGNAR_PEDIDOS" });
      toast.success("Pedidos asignados con éxito");

      // Actualizar el historial después de asignar
      setIsLoadingHistorial(true);
      const dateStr = selectedDate.toISOString().split("T")[0];
      const historialRes = await api.get(
        "/api/repartidor/repartidores/historial",
        {
          headers: { "X-CSRF-Token": csrfToken },
          withCredentials: true,
          params: { fecha: dateStr },
        }
      );

      if (historialRes.data.success) {
        dispatch({
          type: "SET_HISTORIAL",
          historial: historialRes.data.data,
        });
      }
    } catch (error) {
      console.error("Error al asignar pedidos:", error);
      toast.error("Error al asignar pedidos. Se está corrigiendo este error.");
    } finally {
      setIsAssigning(false);
      setIsLoadingHistorial(false);
    }
  };

  const togglePedido = (id) => {
    dispatch({ type: "TOGGLE_PEDIDO", id });
  };

  const handlePageChange = (key, page) => {
    dispatch({ type: "SET_PAGINATION", key, page });
  };

  const handleViewDetails = async (
    repartidorId,
    estado,
    municipio,
    localidad
  ) => {
    console.log("view", repartidorId, estado, municipio, localidad);

    const pedidos =
      treeHistorial[estado]?.[municipio]?.[localidad]?.[repartidorId] || [];

    if (pedidos.length > 0) {
      await Promise.all(pedidos.map((p) => fetchPedidoDetalles(p.idPedido)));
    }

    dispatch({
      type: "SET_MODAL",
      open: true,
      id: repartidorId,
      selectedLocation: { estado, municipio, localidad },
      filteredPedidos: pedidos, // Usar los pedidos obtenidos directamente
    });
  };

  const handleCloseModal = () => {
    dispatch({ type: "SET_MODAL", open: false });
  };

  const resetFilters = () => {
    dispatch({ type: "CLEAR_FILTERS" });
  };

  const handleFilterChange = (filters) => {
    dispatch({ type: "SET_FILTERS", filters });
  };

  const fetchPedidoDetalles = async (idPedido) => {
    try {
      const response = await api.get(
        `/api/repartidor/repartidores/historial/${idPedido}/detalles`,
        {
          headers: { "X-CSRF-Token": csrfToken },
          withCredentials: true,
        }
      );

      console.log("Datos recibidos de pedidos detalles", response);
      if (response.data.success) {
        dispatch({
          type: "SET_DETALLES_PEDIDO",
          idPedido,
          detalles: response.data.data,
        });
      }
    } catch (error) {
      console.error("Error al obtener detalles del pedido:", error);
    }
  };

  const totalPedidos = state.totals.totalPedidos;
  const totalRepartidoresActivos = state.totals.totalRepartidores;
  const assignedPedidos = state.totals.totalPedidosAsignados;

  if (state.isLoading) return < CustomLoading />;
  console.log("State completo:", state);

  // Paginación del historial
  const itemsPerPageHistorial = 2;
  const totalHistorialPages = Math.ceil(
    state.historialPedidos.length / itemsPerPageHistorial
  );
  const currentHistorialPage = Math.min(
    state.historialPage,
    totalHistorialPages
  );
  const startHistorialIndex =
    (currentHistorialPage - 1) * itemsPerPageHistorial;
  const endHistorialIndex = startHistorialIndex + itemsPerPageHistorial;
  const paginatedHistorial = state.historialPedidos.slice(
    startHistorialIndex,
    endHistorialIndex
  );

 return (
  <div className="max-w-7xl mx-auto p-4 sm:p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
    {(state.pedidos.length > 0 || state.repartidores.length > 0) && (
      <SummaryCard
        totalPedidos={totalPedidos}
        totalRepartidores={totalRepartidoresActivos}
        assignedPedidos={assignedPedidos}
        className="mb-6 shadow-lg border border-gray-200 dark:border-gray-700 rounded-xl"
      />
    )}
    <FilterPanel
      onFilterChange={handleFilterChange}
      totalsByLocation={state.totalsByLocation}
      className="mb-6 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md border border-gray-200 dark:border-gray-700"
    />
    {state.notification && (
      <Notification
        message={state.notification.message}
        type={state.notification.type}
        onClose={() =>
          dispatch({ type: "SET_NOTIFICATION", notification: null })
        }
      />
    )}

    <div className="flex flex-col lg:flex-row gap-6">
      {/* Panel de Repartidores */}
      <div className="w-full lg:w-1/3 bg-white dark:bg-gray-800 rounded-xl p-5 shadow-lg border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-xl">
        <div className="flex justify-between items-center mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
          <h2 className="text-2xl font-semibold flex items-center text-gray-900 dark:text-gray-100">
            <User className="h-6 w-6 mr-3 text-[#ffb300] dark:text-[#ffca4b]" />
            Repartidores Activos
          </h2>
          <Tooltip content="Restablecer todos los filtros">
            <button
              onClick={resetFilters}
              className="px-3 py-2 bg-[#ffb300]/20 dark:bg-[#ffca4b]/20 text-[#ffb300] dark:text-[#ffca4b] rounded-full hover:bg-[#ffb300]/30 dark:hover:bg-[#ffca4b]/30 transition-colors duration-200"
            >
              <RefreshCw className="h-5 w-5" />
            </button>
          </Tooltip>
        </div>

        <div className="relative mb-5">
          <Search className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          <input
            value={state.busquedaRep}
            onChange={(e) =>
              dispatch({ type: "SET_BUSQUEDA_REP", value: e.target.value })
            }
            placeholder="Buscar por nombre o correo..."
            className="w-full pl-10 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:outline-none text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-600"
          />
        </div>
        {state.repartidoresError ? (
          <ErrorDisplay message={state.repartidoresError} />
        ) : state.repartidoresEmpty ? (
          <NoDataDisplay message="Sin repartidores disponibles" />
        ) : (
          <div className="space-y-4 max-h-[calc(50vh-120px)] overflow-y-auto">
            {repartidoresActivos.map((r) => (
              <RepartidorCard
                key={r.id}
                repartidor={r}
                seleccionado={state.repartidorSel === r.id}
                onSelect={(id) => dispatch({ type: "SET_REPARTIDOR_SEL", id })}
                pedidosAsignados={r.pedidosAsignados}
              />
            ))}
          </div>
        )}
        {state.repartidorSel &&
          !state.repartidoresError &&
          !state.repartidoresEmpty && <></>}
      </div>

      {/* Panel de Pedidos (Separado) */}
      <div className="w-full lg:w-2/3 bg-white dark:bg-gray-800 rounded-xl p-5 shadow-lg border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-xl mb-6 lg:mb-0">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
          <h2 className="text-2xl font-semibold flex items-center text-gray-900 dark:text-gray-100">
            <Package className="h-6 w-6 mr-3 text-[#ffb300] dark:text-[#ffca4b]" />
            Pedidos
          </h2>
          {state.repartidorSel &&
            state.pedidosSel.length > 0 &&
            !state.pedidosError &&
            !state.pedidosEmpty && (
              <button
                onClick={asignarPedidos}
                className="w-full sm:w-auto px-3 sm:px-2 py-2 sm:py-1.5 bg-gradient-to-r from-[#ffb300] to-[#ffca4b] dark:from-[#e59400] text-white text-sm sm:text-base font-medium rounded-lg hover:from-[#e59400] hover:to-[#ffca4b] dark:hover:from-[#d07d00] dark:hover:to-[#ffca4b] transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#ffb300]/50 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
              >
                <span className="flex items-center justify-center gap-1 sm:gap-2 whitespace-nowrap">
                  {isAssigning ? (
                    <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                  ) : (
                    <>
                      <svg
                        className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                      <span className="hidden sm:inline">Asignar</span>
                      <span className="font-semibold">
                        ({state.pedidosSel.length})
                      </span>
                      <span className="hidden sm:inline">
                        {state.pedidosSel.length === 1 ? "Pedido" : "Pedidos"}
                      </span>
                    </>
                  )}
                </span>
              </button>
            )}
        </div>

        <div className="flex flex-wrap gap-3 mb-4 sm:mb-6">
          <div className="flex items-center">
            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gradient-to-br from-green-400 to-green-600 dark:from-green-500 dark:to-green-700 rounded-full mr-1 sm:mr-2"></div>
            <span className="text-xs sm:text-sm text-gray-900 dark:text-gray-100 font-medium">
              Entrega
            </span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gradient-to-br from-orange-400 to-orange-600 dark:from-orange-500 dark:to-orange-700 rounded-full mr-1 sm:mr-2"></div>
            <span className="text-xs sm:text-sm text-gray-900 dark:text-gray-100 font-medium">
              Recogida
            </span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gradient-to-br from-red-400 to-red-600 dark:from-red-500 dark:to-red-700 rounded-full mr-1 sm:mr-2"></div>
            <span className="text-xs sm:text-sm text-gray-900 dark:text-gray-100 font-medium">
              Atrasados
            </span>
          </div>
        </div>

        <div className="flex gap-1.5 sm:gap-2 mb-4 sm:mb-5 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
          {dayLabels.map((dia, idx) => (
            <button
              key={idx}
              onClick={() => {
                console.log("Botón pulsado, filtroDia:", idx.toString());
                dispatch({
                  type: "SET_FILTRO_DIA",
                  filtroDia: idx.toString(),
                });
              }}
              className={`
                flex-shrink-0 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium 
                transition-all duration-200 whitespace-nowrap border
                ${
                  state.filtroDia === idx.toString()
                    ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500"
                }
              `}
            >
              {dia.label}
            </button>
          ))}
        </div>

        {state.pedidosError ? (
          <ErrorDisplay message={state.pedidosError} />
        ) : state.pedidosEmpty ? (
          <NoDataDisplay message="Sin pedidos disponibles" />
        ) : (
          <div className="space-y-3">
            {Object.keys(treePedidos).length === 0 ? (
              <NoDataDisplay message="No hay pedidos de entrega para esta fecha." />
            ) : (
              Object.entries(treePedidos).map(([estado, municipios]) => (
                <details
                  key={estado}
                  className="group dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <summary className="list-none cursor-pointer flex justify-between items-center font-semibold text-base text-gray-900 dark:text-gray-100 p-4 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    <span>
                      {estado} (
                      {Object.values(municipios)
                        .flatMap(Object.values)
                        .flat()
                        .reduce(
                          (sum, loc) =>
                            sum +
                            loc.entrega.length +
                            loc.recogida.length +
                            loc.atrasados.length,
                          0
                        )}
                      )
                    </span>
                    <span className="text-indigo-600 dark:text-indigo-400 transition-transform duration-200 group-open:rotate-180 ml-2">
                      ▼
                    </span>
                  </summary>

                  <div className="px-4 pb-4 space-y-3 dark:bg-gray-750 dark:border-gray-600">
                    {Object.entries(municipios).map(
                      ([municipio, localidades]) => (
                        <details
                          key={municipio}
                          className="group dark:bg-gray-750 rounded-lg border border-gray-100 dark:border-gray-600"
                        >
                          <summary className="list-none cursor-pointer flex justify-between items-center font-medium text-sm text-gray-700 dark:text-gray-300 p-3 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors">
                            <span>
                              {municipio} (
                              {Object.values(localidades)
                                .flat()
                                .reduce(
                                  (sum, loc) =>
                                    sum +
                                    loc.entrega.length +
                                    loc.recogida.length +
                                    loc.atrasados.length,
                                  0
                                )}
                              )
                            </span>
                            <span className="text-indigo-600 dark:text-indigo-400 transition-transform duration-200 group-open:rotate-180 ml-2">
                              ▼
                            </span>
                          </summary>

                          <div className="px-3 pb-3 space-y-2">
                            {Object.entries(localidades).map(
                              ([
                                localidad,
                                { entrega, recogida, atrasados },
                              ]) => {
                                const itemsPerPage = 6;
                                const totalEntregaPages = Math.ceil(
                                  entrega.length / itemsPerPage
                                );
                                const totalRecogidaPages = Math.ceil(
                                  recogida.length / itemsPerPage
                                );
                                const totalAtrasadosPages = Math.ceil(
                                  atrasados.length / itemsPerPage
                                );

                                const currentEntregaPage =
                                  state.pagination[
                                    `${estado}-${municipio}-${localidad}-entrega`
                                  ] || 1;
                                const currentRecogidaPage =
                                  state.pagination[
                                    `${estado}-${municipio}-${localidad}-recogida`
                                  ] || 1;
                                const currentAtrasadosPage =
                                  state.pagination[
                                    `${estado}-${municipio}-${localidad}-atrasados`
                                  ] || 1;

                                const startEntregaIndex =
                                  (currentEntregaPage - 1) * itemsPerPage;
                                const startRecogidaIndex =
                                  (currentRecogidaPage - 1) * itemsPerPage;
                                const startAtrasadosIndex =
                                  (currentAtrasadosPage - 1) * itemsPerPage;

                                const paginatedEntrega = entrega
                                  .slice(
                                    startEntregaIndex,
                                    startEntregaIndex + itemsPerPage
                                  )
                                  .sort((a, b) =>
                                    a.descripcion.localeCompare(b.descripcion)
                                  );
                                const paginatedRecogida = recogida
                                  .slice(
                                    startRecogidaIndex,
                                    startRecogidaIndex + itemsPerPage
                                  )
                                  .sort((a, b) =>
                                    a.descripcion.localeCompare(b.descripcion)
                                  );
                                const paginatedAtrasados = atrasados
                                  .slice(
                                    startAtrasadosIndex,
                                    startAtrasadosIndex + itemsPerPage
                                  )
                                  .sort((a, b) =>
                                    a.descripcion.localeCompare(b.descripcion)
                                  );

                                return (
                                  <div key={localidad} className="space-y-3">
                                    {(paginatedEntrega.length > 0 ||
                                      paginatedRecogida.length > 0 ||
                                      paginatedAtrasados.length > 0) && (
                                      <h3 className="text-md font-semibold text-gray-900 dark:text-gray-100 px-2">
                                        {localidad} (
                                        {entrega.length +
                                          recogida.length +
                                          atrasados.length}
                                        )
                                      </h3>
                                    )}

                                    {paginatedEntrega.length > 0 && (
                                      <div>
                                        <h4 className="text-sm font-medium text-green-700 dark:text-green-400 px-2 mb-1">
                                          Entregas
                                        </h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                          {paginatedEntrega.map((p) => (
                                            <PedidoCard
                                              key={p.id}
                                              pedido={p}
                                              seleccionado={state.pedidosSel.includes(
                                                p.id
                                              )}
                                              onToggle={togglePedido}
                                            />
                                          ))}
                                        </div>
                                        {totalEntregaPages > 1 && (
                                          <Pagination
                                            currentPage={currentEntregaPage}
                                            totalPages={totalEntregaPages}
                                            onPageChange={(page) =>
                                              handlePageChange(
                                                `${estado}-${municipio}-${localidad}-entrega`,
                                                page
                                              )
                                            }
                                            localityKey={`${estado}-${municipio}-${localidad}-entrega`}
                                          />
                                        )}
                                      </div>
                                    )}

                                    {paginatedRecogida.length > 0 && (
                                      <div>
                                        <h4 className="text-sm font-medium text-orange-700 dark:text-orange-400 px-2 mb-1">
                                          Recogidas
                                        </h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                          {paginatedRecogida.map((p) => (
                                            <PedidoCard
                                              key={p.id}
                                              pedido={p}
                                              seleccionado={state.pedidosSel.includes(
                                                p.id
                                              )}
                                              onToggle={togglePedido}
                                            />
                                          ))}
                                        </div>
                                        {totalRecogidaPages > 1 && (
                                          <Pagination
                                            currentPage={currentRecogidaPage}
                                            totalPages={totalRecogidaPages}
                                            onPageChange={(page) =>
                                              handlePageChange(
                                                `${estado}-${municipio}-${localidad}-recogida`,
                                                page
                                              )
                                            }
                                            localityKey={`${estado}-${municipio}-${localidad}-recogida`}
                                          />
                                        )}
                                      </div>
                                    )}

                                    {paginatedAtrasados.length > 0 && (
                                      <div>
                                        <h4 className="text-sm font-medium text-red-700 dark:text-red-400 px-2 mb-1">
                                          Atrasados
                                        </h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                          {paginatedAtrasados.map((p) => (
                                            <PedidoCard
                                              key={p.id}
                                              pedido={p}
                                              seleccionado={state.pedidosSel.includes(
                                                p.id
                                              )}
                                              onToggle={togglePedido}
                                            />
                                          ))}
                                        </div>
                                        {totalAtrasadosPages > 1 && (
                                          <Pagination
                                            currentPage={currentAtrasadosPage}
                                            totalPages={totalAtrasadosPages}
                                            onPageChange={(page) =>
                                              handlePageChange(
                                                `${estado}-${municipio}-${localidad}-atrasados`,
                                                page
                                              )
                                            }
                                            localityKey={`${estado}-${municipio}-${localidad}-atrasados`}
                                          />
                                        )}
                                      </div>
                                    )}
                                  </div>
                                );
                              }
                            )}
                          </div>
                        </details>
                      )
                    )}
                  </div>
                </details>
              ))
            )}
          </div>
        )}
      </div>
    </div>

    {/* Panel de Historial de Asignaciones (Separado) */}
    <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl p-5 shadow-lg border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-xl">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2">
        <h2 className="text-xl font-bold flex items-center text-gray-900 dark:text-gray-100">
          <Clock className="h-5 w-5 mr-2 text-indigo-600 dark:text-indigo-400" />
          Historial de Asignaciones
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Selecciona fecha:
          </span>
          <DatePicker
            selected={selectedDate}
            onChange={(date) => setSelectedDate(date)}
            dateFormat="dd/MM/yyyy"
            className="p-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 text-sm w-full sm:w-auto"
            minDate={new Date("2023-01-01")}
            maxDate={new Date()}
          />
        </div>
      </div>

      {isLoadingHistorial ? (
        <Loading />
      ) : state.historialPedidos.length > 0 ? (
        <div className="space-y-3">
          {Object.entries(treeHistorial).map(([estado, municipios]) => {
            const total = Object.values(municipios)
              .flatMap(Object.values)
              .flatMap(Object.values)
              .reduce((sum, loc) => sum + Object.values(loc).flat().length, 0);
            const itemsPerPage = 3; // Número de municipios por página
            const totalMunicipios = Object.keys(municipios).length;
            const totalPages = Math.ceil(totalMunicipios / itemsPerPage);
            const currentPage = state.pagination[`${estado}`] || 1;
            const startIndex = (currentPage - 1) * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;
            const paginatedMunicipios = Object.entries(municipios)
              .slice(startIndex, endIndex)
              .reduce((acc, [key, value]) => {
                acc[key] = value;
                return acc;
              }, {});

            return (
              <details
                key={estado}
                className="group rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                <summary className="list-none cursor-pointer flex justify-between items-center font-semibold text-base text-gray-900 dark:text-gray-100 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <span className="truncate max-w-[80%]">
                    {estado} ({total})
                  </span>
                  <span className="text-indigo-600 dark:text-indigo-400 transition-transform duration-200 group-open:rotate-180 ml-2">
                    ▼
                  </span>
                </summary>

                <div className="px-4 pb-4 space-y-3">
                  {Object.entries(municipios).map(([municipio, localidades]) => {
                    const totalMunicipio = Object.values(localidades)
                      .flat()
                      .reduce(
                        (sum, loc) => sum + Object.values(loc).flat().length,
                        0
                      );

                    return (
                      <details
                        key={municipio}
                        className="group rounded-md border border-gray-100 dark:border-gray-600 bg-white dark:bg-gray-750 overflow-hidden"
                      >
                        <summary className="list-none cursor-pointer flex justify-between items-center font-medium text-sm text-gray-700 dark:text-gray-300 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                          <span className="truncate max-w-[80%]">
                            {municipio} ({totalMunicipio})
                          </span>
                          <span className="text-indigo-600 dark:text-indigo-400 transition-transform duration-200 group-open:rotate-180 ml-2">
                            ▼
                          </span>
                        </summary>

                        <div className="px-3 pb-3 space-y-3">
                          {Object.entries(localidades).map(
                            ([localidad, repartidores]) => (
                              <div key={localidad} className="space-y-2 px-2">
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                                  {localidad} (
                                  {Object.values(repartidores).flat().length})
                                </h3>
                                <div className="space-y-2">
                                  {Object.entries(repartidores).map(
                                    ([repartidorId, pedidos]) => {
                                      const repartidor =
                                        state.repartidores.find(
                                          (r) =>
                                            r.id === parseInt(repartidorId)
                                        ) || {
                                          id: repartidorId,
                                          nombre: "Desconocido",
                                          correo: "Sin correo",
                                        };
                                      return (
                                        <div
                                          className="w-full overflow-hidden"
                                          key={repartidorId}
                                        >
                                          <HistorialCard
                                            repartidor={repartidor}
                                            pedidos={pedidos}
                                            onViewDetails={() =>
                                              handleViewDetails(
                                                repartidor.id,
                                                estado,
                                                municipio,
                                                localidad
                                              )
                                            }
                                          />
                                        </div>
                                      );
                                    }
                                  )}
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </details>
                    );
                  })}

                  {/* {totalPages > 1 && (
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={(page) =>
                        dispatch({
                          type: "SET_PAGINATION",
                          key: `${estado}`,
                          page,
                        })
                      }
                      localityKey={`${estado}`}
                    />
                  )} */}
                </div>
              </details>
            );
          })}
        </div>
      ) : (
        <NoDataDisplay message="No hay historial para la fecha seleccionada." />
      )}
    </div>

    <Modal
      isOpen={state.modalOpen}
      onClose={handleCloseModal}
      pedidos={state.filteredPedidos}
      pedidoDetalles={state.pedidoDetalles}
      selectedLocation={state.selectedLocation}
    />
  </div>
);


};

export default AsignacionPedidosGeo;
