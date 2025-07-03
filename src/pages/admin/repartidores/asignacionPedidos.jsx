import React, { useMemo, useState, useEffect, useReducer } from "react";
import {
  Search,
  Package,
  Check,
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
  Truck, Navigation
} from "lucide-react";
import api from "../../../utils/AxiosConfig";
import { useAuth, csrfToken } from "../../../hooks/ContextAuth";
import { toast } from "react-toastify";

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

//__________________________________________________---DISEÑO INICIAL DE REPARTIDORES TOTALES, PEDIDOS--------------------
const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
    <div
      className="p-3 rounded-full mr-4"
      style={{ backgroundColor: `${color}1A` }} // Use the color with low opacity for the background
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
  const accentColor = "#ffb300"; // Your specified color

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
          color="#3b82f6" // A distinct color for repartidores (blue)
        />
        <StatCard
          icon={CheckCircle}
          label="Pedidos Asignados"
          value={assignedPedidos}
          color="#22c55e" // A distinct color for assigned (green)
        />
      </div>
    </div>
  );
};

//__________________________________________________--- FILTRO DE PEDIDOS--------------------
const FilterPanel = ({ onFilterChange }) => {
  const [filters, setFilters] = useState({ status: "", type: "", direccionEstado: "", municipio: "" });

  const handleApply = () => {
    onFilterChange(filters);
  };

  const accentColor = "#ffb300";

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm mb-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex-grow flex flex-col sm:flex-row sm:items-center gap-4">
          <h3 className="text-md font-semibold text-gray-900 dark:text-gray-100 flex items-center shrink-0">
            <Filter className="h-5 w-5 mr-2" style={{ color: accentColor }} />
            Filtros
          </h3>
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <select
              value={filters.direccionEstado}
              onChange={(e) => setFilters({ ...filters, direccionEstado: e.target.value })}
              className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:ring-2 focus:border-transparent"
              style={{ "--tw-ring-color": accentColor }}
            >
              <option value="">Todos los estados</option>
              <option value="Hidalgo">Hidalgo</option>
              <option value="Veracruz">Veracruz</option>
              {/* Agrega más estados según tus datos */}
            </select>
            <select
              value={filters.municipio}
              onChange={(e) => setFilters({ ...filters, municipio: e.target.value })}
              className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:ring-2 focus:border-transparent"
              style={{ "--tw-ring-color": accentColor }}
            >
              <option value="">Todos los municipios</option>
              <option value="Huejutla de Reyes">Huejutla de Reyes</option>
              <option value="Pachuca">Pachuca</option>
              {/* Agrega más municipios según tus datos */}
            </select>
          </div>
        </div>
        <button
          onClick={handleApply}
          className="px-4 py-2 text-black text-sm font-bold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:opacity-90"
          style={{ backgroundColor: accentColor }}
        >
          <Check className="h-5 w-5" />
          Aplicar
        </button>
      </div>
    </div>
  );
};

//---------------------------------------------------CARD DE REPARTIDORES-----------------------------
const RepartidorCard = ({
  repartidor,
  seleccionado,
  onSelect,
  pedidosAsignados,
}) => (
  <div
    onClick={() => onSelect(repartidor.id)}
    className={`
      p-4 rounded-xl cursor-pointer transition-all duration-200 border
      flex items-center justify-between
      ${
        seleccionado
          ? "bg-amber-50 dark:bg-amber-900/20 border-amber-400 shadow-md"
          : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md"
      }
    `}
  >
    {/* Información del Repartidor */}
    <div className="flex items-center space-x-4">
      <User className="h-7 w-7 text-amber-500" />
      <div>
        <p className="font-bold text-md text-gray-900 dark:text-gray-100">
          {repartidor.nombre}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {repartidor.correo}
        </p>
      </div>
    </div>

    {/* Estado de Selección o Conteo de Pedidos */}
    <div>
      {seleccionado ? (
        <CheckCircle className="h-6 w-6 text-green-500" />
      ) : (
        <div className="flex items-center gap-2 text-sm font-semibold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-3 py-1 rounded-full">
          <Package className="h-4 w-4" />
          <span>{pedidosAsignados}</span>
        </div>
      )}
    </div>
  </div>
);



const formatDate = (dateString) => {
  if (!dateString || !/^\d{4}-\d{2}-\d{2}/.test(dateString)) {
    return "Fecha inválida";
  }
  const [year, month, day] = dateString.split("T")[0].split("-");
  return `${day}/${month}/${year}`;
};

//funcion de telefono
const formatPhoneNumberForWhatsApp = (phone) => {
  if (!phone) return null;

  let cleanPhone = phone.toString().replace(/\D/g, "");

  if (cleanPhone.length === 10) {
    cleanPhone = "52" + cleanPhone;
  }

  return cleanPhone;
};

//---------------------------------------------------CARD DE reocger o entregar-----------------------------

const PedidoCard = ({ pedido, seleccionado, onToggle }) => {
  const totalAPagar = parseFloat(pedido.totalPagar) || 0;
  const totalPagado = parseFloat(pedido.totalPagado) || 0;
  const isFullyPaid = totalAPagar > 0 && totalAPagar === totalPagado;
  const displayDate = formatDate(
    pedido.tipo === "entrega" ? pedido.fechaEntrega : pedido.entregaReal || pedido.fechaInicio
  );
  const whatsAppNumber = formatPhoneNumberForWhatsApp(pedido.telefono);
  const message = encodeURIComponent(
    `Alquiladora Romero, hola te contacto sobre tu pedido ${pedido.idRastreo}.`
  );
  const whatsAppLink = `https://wa.me/${whatsAppNumber}?text=${message}`;
  const paymentProgress = totalAPagar > 0 ? (totalPagado / totalAPagar) * 100 : 0;

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
      <div className={`absolute left-0 top-0 bottom-0 w-2 ${
        pedido.atrasado
          ? "bg-gradient-to-b from-red-400 to-red-600"
          : pedido.tipo === "entrega"
          ? "bg-gradient-to-b from-green-400 to-green-600"
          : "bg-gradient-to-b from-orange-400 to-orange-600"
      }`} />

      {(pedido.isUrgent || pedido.atrasado) && (
        <div className="absolute -top-1 -right-1 z-10">
          <div className={`bg-${pedido.atrasado ? "red" : "red"}-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md animate-pulse`}>
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
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-[11px] font-semibold
                ${pedido.atrasado
                  ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                  : pedido.tipo === "entrega"
                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400"}`}>
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

              <span className="text-[11px] font-mono text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
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
                  <CircleDollarSign className="h-3 w-3 mr-1" />
                  ${totalAPagar.toFixed(2)}
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
              <span className="text-gray-400 hidden sm:inline">• {pedido.municipio}</span>
            )}
          </div>

          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3 text-gray-500" />
            <span className="font-medium">{displayDate}</span>
          </div>

          {pedido.direccion && (
            <div className="flex items-start gap-1">
              <Navigation className="h-3 w-3 text-gray-500 mt-0.5" />
              <span className="line-clamp-2 text-gray-500">{pedido.direccion}</span>
            </div>
          )}
        </div>

        <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between gap-2">
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium
              ${pedido.status === "Confirmado"
                ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                : pedido.status === "En proceso"
                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"}`}>
              {pedido.status}
            </span>

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

// Historial Card Component
const HistorialCard = ({ repartidor, pedidos, onViewDetails }) => {
  const entregaCount = pedidos.filter((p) => p.tipo === "entrega").length;
  const recogidaCount = pedidos.filter((p) => p.tipo === "recogida").length;
  const tipos = [];
  if (entregaCount > 0) tipos.push("entrega");
  if (recogidaCount > 0) tipos.push("recogida");

  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl hover:border-indigo-300 dark:hover:border-indigo-600 transition-all duration-200">
      <div className="flex items-center space-x-3">
        <User className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
        <div>
          <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">
            {repartidor?.nombre || "Desconocido"}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {repartidor?.correo || "Sin correo"}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {tipos.join(" y ") || "Sin asignación"} (
            {entregaCount + recogidaCount} pedidos)
          </p>
        </div>
      </div>
      <Tooltip content="Ver detalles del repartidor y sus pedidos">
        <button
          onClick={() => onViewDetails(repartidor?.id)}
          className="px-3 py-1 bg-indigo-600 dark:bg-indigo-700 text-white text-sm rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-800 transition-colors duration-200 flex items-center disabled:opacity-50"
          disabled={!repartidor}
        >
          <Eye className="h-4 w-4 mr-1" /> Ver más detalles
        </button>
      </Tooltip>
    </div>
  );
};

// Modal Component
const Modal = ({ isOpen, onClose, repartidor, pedidos, repartidores }) => {
  if (!isOpen) return null;

  const repartidorData = Array.isArray(repartidores)
    ? repartidores.find((r) => r.id === repartidor?.id) || {
        nombre: "Desconocido",
        correo: "Sin correo",
      }
    : { nombre: "Desconocido", correo: "Sin correo" };
  const entregas = pedidos.filter((p) => p.tipo === "entrega");
  const recogidas = pedidos.filter((p) => p.tipo === "recogida");

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const csv = [
      [
        "ID",
        "Descripción",
        "Fecha",
        "Tipo",
        "Estado",
        "Municipio",
        "Localidad",
        "Status",
      ],
      ...pedidos.map((p) => [
        p.id,
        p.descripcion,
        p.tipo === "entrega" ? p.fechaEntrega : p.fechaInicio,
        p.tipo,
        p.estado,
        p.municipio,
        p.localidad,
        p.status,
      ]),
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-gray-900 dark:bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-full max-w-lg mx-4 sm:mx-auto shadow-2xl">
        <div className="flex items-center mb-4">
          <User className="h-8 w-8 text-indigo-600 dark:text-indigo-400 mr-3" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {repartidorData.nombre}
          </h2>
        </div>
        {entregas.length > 0 && (
          <div className="mb-4">
            <h3 className="font-medium text-md text-green-700 dark:text-green-400 mb-2">
              Entregas
            </h3>
            <ul className="space-y-2 max-h-60 overflow-y-auto">
              {entregas.map((p) => (
                <li
                  key={p.id}
                  className="p-3 bg-green-50 dark:bg-green-900 rounded-lg"
                >
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    #{p.id} – {p.descripcion}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Fecha: {p.fechaEntrega}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Estado: {p.status}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}
        {recogidas.length > 0 && (
          <div>
            <h3 className="font-medium text-md text-orange-700 dark:text-orange-400 mb-2">
              Recogidas
            </h3>
            <ul className="space-y-2 max-h-60 overflow-y-auto">
              {recogidas.map((p) => (
                <li
                  key={p.id}
                  className="p-3 bg-orange-50 dark:bg-orange-900 rounded-lg"
                >
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    #{p.id} – {p.descripcion}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Fecha: {p.fechaInicio}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Estado: {p.status}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="flex gap-2 mt-4">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-red-600 dark:bg-red-700 text-white text-sm rounded-lg hover:bg-red-700 dark:hover:bg-red-800 transition-colors duration-200"
          >
            Cerrar
          </button>
          <button
            onClick={handlePrint}
            className="w-full px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white text-sm rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors duration-200"
          >
            <Printer className="h-4 w-4 mr-1 inline" /> Imprimir
          </button>
          <button
            onClick={handleExportCSV}
            className="w-full px-4 py-2 bg-green-600 dark:bg-green-700 text-white text-sm rounded-lg hover:bg-green-700 dark:hover:bg-green-800 transition-colors duration-200"
          >
            <Download className="h-4 w-4 mr-1 inline" /> Exportar CSV
          </button>
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
 filters: { status: "", type: "", direccionEstado: "", municipio: "" }, // Añade estos cam
  notification: null,
  days: [],
  totals: { totalPedidos: 0, totalRepartidores: 0, totalPedidosAsignados: 0 },
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
       totals: action.totals || { totalPedidos: 0, totalRepartidores: 0, totalPedidosAsignados: 0 },
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
          totalPedidosAsignados: state.totals.totalPedidosAsignados + state.pedidosSel.length,
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
        filters: { status: "", type: "" },
      };
    case "SET_NOTIFICATION":
      return { ...state, notification: action.notification };
    default:
      return state;
  }
};




const AsignacionPedidosGeo = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { csrfToken } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      let pedidos = [];
      let repartidores = [];
      let pedidosError = null;
      let repartidoresError = null;
      let pedidosEmpty = false;
      let repartidoresEmpty = false;
      let days = [];
      let totals = { totalPedidos: 0, totalRepartidores: 0, totalPedidosAsignados: 0 };

      try {
        const repartidoresRes = await api.get(
          "/api/repartidor/administrar/activos/repartidores",
          {
            headers: { "X-CSRF-Token": csrfToken },
            withCredentials: true,
          }
        );
        repartidores = repartidoresRes.data.data.map((r) => ({
          id: r.idRepartidor || null,
          nombre: r.nombre || "Desconocido",
          correo: r.correo || "Sin correo",
          estado: r.estado || "activo",
        }));
        if (repartidores.length === 0) {
          repartidoresEmpty = true;
        }
      } catch (error) {
        console.error("Error al obtener repartidores:", error);
        repartidoresError = "Error al cargar repartidores. Se está corrigiendo este error.";
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

        pedidos = [
          ...(pedidosRes.data.deliveries || []).map((p) => ({
            id: p.idPedido || null,
            descripcion: p.nombre ? `${p.nombre} ${p.apellido || ""}` : `Pedido #${p.idPedido || "Desconocido"}`,
            fechaInicio: p.fechaInicio ? new Date(p.fechaInicio).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
            fechaEntrega: p.fechaEntrega ? new Date(p.fechaEntrega).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
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
            descripcion: p.nombre ? `${p.nombre} ${p.apellido || ""}` : `Pedido #${p.idPedido || "Desconocido"}`,
            fechaInicio: p.fechaInicio ? new Date(p.fechaInicio).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
            fechaEntrega: p.fechaEntrega ? new Date(p.fechaEntrega).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
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
            descripcion: p.nombre ? `${p.nombre} ${p.apellido || ""}` : `Pedido #${p.idPedido || "Desconocido"}`,
            fechaInicio: p.fechaInicio ? new Date(p.fechaInicio).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
            fechaEntrega: p.fechaEntrega ? new Date(p.fechaEntrega).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
            estado: p.direccionEstado || "Desconocido",
            municipio: p.municipio || "Desconocido",
            localidad: p.localidad || "Desconocido",
            repartidorId:  null,
            totalPagado: p.totalPagado || "0.00",
            idRastreo: p.idRastreo || "null",
            tipo: "recogida",
            telefono: p.telefono || "",
            status: p.estadoActual || "Confirmado",
            direccion: p.direccion || "",
            referencias: p.referencias || "",
            totalPagar: p.totalPagar || "0.00",
            entregaReal: p.fechaRecogidaReal, // Mantener formato original
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
        pedidosError = "Error al cargar pedidos. Se está corrigiendo este error.";
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
      });
    };

    fetchData();
  }, [csrfToken]);

  const now = new Date(); 
  now.setHours(0, 0, 0, 0); 
  const today = now.toISOString().split("T")[0]; 
  console.log("Today:", today, "Day of week:", now.getDay()); 
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split("T")[0]; 

  
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
        label: dateStr === today ? "Hoy" : date.toLocaleDateString("es-MX", { weekday: "long" }),
        dayOfWeek: date.getDay(),
      });
    }
    return labels;
  }, [today]);

  console.log("Day Labels:", dayLabels);

  
  const filteredPedidos = useMemo(() => {
    return state.pedidos.filter((p) => {
      const matchesStatus = !state.filters.status || p.status === state.filters.status;
      const matchesType = !state.filters.type || p.tipo === state.filters.type;
      const matchesEstado = !state.filters.direccionEstado || p.estado === state.filters.direccionEstado;
      const matchesMunicipio = !state.filters.municipio || p.municipio === state.filters.municipio;
      return matchesStatus && matchesType && matchesEstado && matchesMunicipio;
    });
  }, [state.pedidos, state.filters]);

  console.log("Filtered Pedidos:", filteredPedidos);

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
      .filter((p) =>
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

    const recogidaCandidates = filteredPedidos.filter(p => p.tipo === "recogida");
    console.log("Candidatos a recogida:", recogidaCandidates.map(p => ({ id: p.id, entregaReal: p.entregaReal, repartidorId: p.repartidorId, tipo: p.tipo })));

    const recogida = filteredPedidos
     .filter(
        (p) =>
          p.tipo === "recogida" &&
          (p.repartidorId === null || p.repartidorId === undefined) 
      )
      .map(p => {
        const entregaDate = new Date(p.entregaReal + "T00:00:00-06:00");
        console.log(`Pedido entrega reala ${p.id} - entregaReal: ${p.entregaReal}, Date: ${entregaDate}, Comparación: ${entregaDate <= todayDate}`);
        return p;
      })
      .sort((a, b) => new Date(b.entregaReal + "T00:00:00-06:00") - new Date(a.entregaReal + "T00:00:00-06:00"));

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
    const uniquePedidos = [...new Set([...pedidosEntrega, ...pedidosRecogida, ...pedidosAtrasados].map(p => JSON.stringify(p)))].map(p => JSON.parse(p));
    return uniquePedidos;
  }, [pedidosEntrega, pedidosRecogida, pedidosAtrasados]);

  console.log("All Pedidos:", allPedidos);
  console.log("Pedidos Recogida:", pedidosRecogida);

  const treePedidos = useMemo(() => {
    return allPedidos.reduce((acc, p) => {
      acc[p.estado] = acc[p.estado] || {};
      acc[p.estado][p.municipio] = acc[p.estado][p.municipio] || {};
      acc[p.estado][p.municipio][p.localidad] = acc[p.estado][p.municipio][p.localidad] || {
        entrega: [],
        recogida: [],
        atrasados: [],
      };
      acc[p.estado][p.municipio][p.localidad][p.atrasado ? "atrasados" : p.tipo].push(p);
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
    Array.isArray(state.repartidores) &&
      state.repartidores.forEach((r) => {
        historial[r.id] = state.pedidos.filter((p) => p.repartidorId === r.id);
      });
    return historial;
  }, [state.pedidos, state.repartidores]);

  const treeHistorial = useMemo(() => {
    const historial = {};
    Object.values(historialRepartidor).forEach((pedidos) => {
      pedidos.forEach((p) => {
        historial[p.estado] = historial[p.estado] || {};
        historial[p.estado][p.municipio] =
          historial[p.estado][p.municipio] || {};
        historial[p.estado][p.municipio][p.localidad] =
          historial[p.estado][p.municipio][p.localidad] || {};
        historial[p.estado][p.municipio][p.localidad][p.repartidorId] =
          historial[p.estado][p.municipio][p.localidad][p.repartidorId] || [];
        historial[p.estado][p.municipio][p.localidad][p.repartidorId].push(p);
      });
    });
    return historial;
  }, [historialRepartidor]);

  const asignarPedidos = async () => {
    if (!state.repartidorSel || state.pedidosSel.length === 0) {
      toast.error("Seleccione un repartidor y pedidos");
      return;
    }

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
      toast.success("Pedidos asignados con éxito", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (error) {
      console.error("Error al asignar pedidos:", error);
      toast.error("Error al asignar pedidos. Se está corrigiendo este error.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  const togglePedido = (id) => {
    dispatch({ type: "TOGGLE_PEDIDO", id });
  };

  const handlePageChange = (key, page) => {
    dispatch({ type: "SET_PAGINATION", key, page });
  };

  const handleViewDetails = (repartidorId) => {
    dispatch({ type: "SET_MODAL", open: true, id: repartidorId });
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


  const totalPedidos = state.totals.totalPedidos;
  const totalRepartidoresActivos = state.totals.totalRepartidores;
  const assignedPedidos = state.totals.totalPedidosAsignados;
  console.log("taotal de pedidos ", assignedPedidos)

  if (state.isLoading) return <Loading />;
  console.log("State completo:", state);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {(state.pedidos.length > 0 || state.repartidores.length > 0) && (
        <SummaryCard
          totalPedidos={totalPedidos}
          totalRepartidores={totalRepartidoresActivos}
          assignedPedidos={assignedPedidos}
        />
      )}
      <FilterPanel onFilterChange={handleFilterChange} />
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
        <div className="w-full lg:w-1/3 bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-xl border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-2xl font-bold flex items-center text-gray-900 dark:text-gray-100">
              <User className="h-6 w-6 mr-3 text-indigo-600 dark:text-indigo-400" />
              Repartidores Activos
            </h2>
            <Tooltip content="Restablecer todos los filtros">
              <button
                onClick={resetFilters}
                className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
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
                  onSelect={(id) =>
                    dispatch({ type: "SET_REPARTIDOR_SEL", id })
                  }
                  pedidosAsignados={r.pedidosAsignados}
                />
              ))}
            </div>
          )}
          {state.repartidorSel &&
            !state.repartidoresError &&
            !state.repartidoresEmpty && (
              <div className="mt-5">
                <h3 className="text-xl font-semibold mb-4 flex items-center text-gray-700 dark:text-gray-300">
                  <Package className="h-5 w-5 mr-3 text-indigo-600 dark:text-indigo-400" />
                  Historial (
                  {Array.isArray(state.repartidores)
                    ? state.repartidores.find(
                        (r) => r.id === state.repartidorSel
                      )?.nombre || "Desconocido"
                    : "Desconocido"}
                  )
                </h3>
                {historialRepartidor[state.repartidorSel]?.length === 0 ? (
                  <NoDataDisplay message="No hay pedidos asignados." />
                ) : (
                  <div className="space-y-3 max-h-48 overflow-y-auto">
                    {historialRepartidor[state.repartidorSel]?.map((p) => (
                      <div
                        key={p.id}
                        className="p-3 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600"
                      >
                        <p className="font-medium text-sm text-gray-900 dark:text-gray-100">
                          #{p.id} – {p.descripcion}
                        </p>
                        <div className="flex items-center text-xs space-x-2 mt-1">
                          <span className="flex items-center">
                            <Clock className="h-4 w-4 text-gray-600 dark:text-gray-400 mr-1" />
                            {p.fechaEntrega}
                          </span>
                          <span className="flex items-center">
                            <MapPin className="h-4 w-4 text-gray-600 dark:text-gray-400 mr-1" />
                            {p.localidad}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
        </div>

        <div className="w-full lg:w-2/3 bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-xl border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5 gap-4">
            <h2 className="text-2xl font-bold flex items-center text-gray-900 dark:text-gray-100">
              <Package className="h-6 w-6 mr-3 text-indigo-600 dark:text-indigo-400" />
              Pedidos
            </h2>
            {state.repartidorSel &&
              state.pedidosSel.length > 0 &&
              !state.pedidosError &&
              !state.pedidosEmpty && (
                <button
                  onClick={asignarPedidos}
                  className="px-4 py-2 bg-indigo-600 dark:bg-indigo-700 text-white text-sm rounded-xl hover:bg-indigo-700 dark:hover:bg-indigo-800 transition-colors duration-200"
                >
                  Asignar {state.pedidosSel.length} Pedidos
                </button>
              )}
          </div>

          <div className="flex gap-4 mb-5">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-100 dark:bg-green-900 mr-2"></div>
              <span className="text-sm text-gray-900 dark:text-gray-100">
                Entrega
              </span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-orange-100 dark:bg-orange-900 mr-2"></div>
              <span className="text-sm text-gray-900 dark:text-gray-100">
                Recogida
              </span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-red-100 dark:bg-red-900 mr-2"></div>
              <span className="text-sm text-gray-900 dark:text-gray-100">
                Atrasados
              </span>
            </div>
          </div>

          <div className="flex gap-2 mb-5 flex-wrap">
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
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200
                  ${state.filtroDia === idx.toString()
                    ? "bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-md ring-2 ring-blue-400"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 hover:shadow-sm"
                  }`}
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
            <div className="space-y-5">
              {Object.keys(treePedidos).length === 0 ? (
                <NoDataDisplay message="No hay pedidos de entrega para esta fecha." />
              ) : (
                Object.entries(treePedidos).map(([estado, municipios]) => (
                  <details
                    key={estado}
                    className="group dark:bg-gray-800 p-3 dark:border-gray-700"
                  >
                    <summary className="list-none cursor-pointer flex justify-between items-center font-bold text-lg text-gray-900 dark:text-gray-100 py-2">
                      {estado} (
                      {Object.values(municipios)
                        .flatMap(Object.values)
                        .flat()
                        .reduce(
                          (sum, loc) =>
                            sum + loc.entrega.length + loc.recogida.length + loc.atrasados.length,
                          0
                        )}
                      )
                      <span className="text-indigo-600 dark:text-indigo-400 transition-transform duration-200 group-open:rotate-180">
                        ▼
                      </span>
                    </summary>
                    {Object.entries(municipios).map(
                      ([municipio, localidades]) => (
                        <details
                          key={municipio}
                          className="ml-4 mt-2 group bg-white dark:bg-gray-800 rounded-xl p-3 border-2 border-gray-200 dark:border-gray-700 shadow-md"
                        >
                          <summary className="list-none cursor-pointer flex justify-between items-center font-medium text-md text-gray-700 dark:text-gray-300 py-2">
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
                            <span className="text-indigo-600 dark:text-indigo-400 transition-transform duration-200 group-open:rotate-180">
                              ▼
                            </span>
                          </summary>
                          {Object.entries(localidades).map(
                            ([localidad, { entrega, recogida, atrasados }]) => {
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
                              const paginatedEntrega = entrega.slice(
                                startEntregaIndex,
                                startEntregaIndex + itemsPerPage
                              );
                              const paginatedRecogida = recogida.slice(
                                startRecogidaIndex,
                                startRecogidaIndex + itemsPerPage
                              );
                              const paginatedAtrasados = atrasados.slice(
                                startAtrasadosIndex,
                                startAtrasadosIndex + itemsPerPage
                              );

                              return (
                                <details
                                  key={localidad}
                                  className="ml-4 mt-2 group dark:bg-gray-800 rounded-xl p-3 border-gray-200 dark:border-gray-700"
                                >
                                  <summary className="list-none cursor-pointer flex justify-between items-center font-medium text-sm text-gray-600 dark:text-gray-400 py-2">
                                    {localidad} (Entrega: {entrega.length},
                                    Recogida: {recogida.length}, Atrasados:{" "}
                                    {atrasados.length})
                                    <span className="text-indigo-600 dark:text-indigo-400 transition-transform duration-200 group-open:rotate-180">
                                      ▼
                                    </span>
                                  </summary>

                                  <div className="ml-4 space-y-4 mt-2">
                                    {entrega.length > 0 && (
                                      <div>
                                        <h6 className="text-sm font-medium text-green-700 dark:text-green-400 mb-2">
                                          Entrega
                                        </h6>
                                        <div className="px-4">
                                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
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
                                        </div>

                                        {totalEntregaPages > 1 && (
                                          <Pagination
                                            currentPage={currentEntregaPage}
                                            totalPages={totalEntregaPages}
                                            onPageChange={handlePageChange}
                                            localityKey={`${estado}-${municipio}-${localidad}-entrega`}
                                          />
                                        )}
                                      </div>
                                    )}
                                    {recogida.length > 0 && (
                                      <div>
                                        <h6 className="text-sm font-medium text-orange-700 dark:text-orange-400 mt-4 mb-2">
                                          Recogida
                                        </h6>
                                        <div className="px-4">
                                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
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
                                        </div>

                                        {totalRecogidaPages > 1 && (
                                          <Pagination
                                            currentPage={currentRecogidaPage}
                                            totalPages={totalRecogidaPages}
                                            onPageChange={handlePageChange}
                                            localityKey={`${estado}-${municipio}-${localidad}-recogida`}
                                          />
                                        )}
                                      </div>
                                    )}
                                    {atrasados.length > 0 && (
                                      <div>
                                        <h6 className="text-sm font-medium text-red-700 dark:text-red-400 mt-4 mb-2">
                                          Atrasados
                                        </h6>
                                        <div className="px-4">
                                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
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
                                        </div>

                                        {totalAtrasadosPages > 1 && (
                                          <Pagination
                                            currentPage={currentAtrasadosPage}
                                            totalPages={totalAtrasadosPages}
                                            onPageChange={handlePageChange}
                                            localityKey={`${estado}-${municipio}-${localidad}-atrasados`}
                                          />
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </details>
                              );
                            }
                          )}
                        </details>
                      )
                    )}
                  </details>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {(state.pedidos.length > 0 || state.repartidores.length > 0) && (
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-xl border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold mb-5 flex items-center text-gray-900 dark:text-gray-100">
            <Package className="h-6 w-6 mr-3 text-indigo-600 dark:text-indigo-400" />
            Historial Pedidos
          </h2>
          {Object.keys(treeHistorial).length === 0 ? (
            <NoDataDisplay message="No hay historial de pedidos." />
          ) : (
            Object.entries(treeHistorial).map(([estado, municipios]) => (
              <details
                key={estado}
                className="group bg-white dark:bg-gray-800 rounded-xl p-3 border-2 border-gray-200 dark:border-gray-700 shadow-md mb-2"
              >
                <summary className="list-none cursor-pointer flex justify-between items-center font-bold text-lg text-gray-900 dark:text-gray-100 py-2">
                  {estado}
                  <span className="text-indigo-600 dark:text-indigo-400 transition-transform duration-200 group-open:rotate-180">
                    ▼
                  </span>
                </summary>
                {Object.entries(municipios).map(([municipio, localidades]) => (
                  <details
                    key={municipio}
                    className="ml-4 mt-2 group bg-white dark:bg-gray-800 rounded-xl p-3 border-2 border-gray-200 dark:border-gray-700 shadow-md"
                  >
                    <summary className="list-none cursor-pointer flex justify-between items-center font-medium text-md text-gray-700 dark:text-gray-300 py-2">
                      {municipio}
                      <span className="text-indigo-600 dark:text-indigo-400 transition-transform duration-200 group-open:rotate-180">
                        ▼
                      </span>
                    </summary>
                    {Object.entries(localidades).map(
                      ([localidad, repartidores]) => {
                        const localityPedidos = Object.values(repartidores).flat();
                        const totalItems = localityPedidos.length;
                        const itemsPerPage = 2;
                        const totalPages = Math.ceil(totalItems / itemsPerPage);
                        const localityKey = `${estado}-${municipio}-${localidad}`;
                        const currentPage = state.pagination[localityKey] || 1;
                        const startIndex = (currentPage - 1) * itemsPerPage;
                        const endIndex = startIndex + itemsPerPage;
                        const paginatedPedidos = localityPedidos.slice(
                          startIndex,
                          endIndex
                        );

                        return (
                          <details
                            key={localidad}
                            className="ml-4 mt-2 group bg-white dark:bg-gray-800 rounded-xl p-3 border-2 border-gray-200 dark:border-gray-700 shadow-md"
                          >
                            <summary className="list-none cursor-pointer flex justify-between items-center font-medium text-sm text-gray-600 dark:text-gray-400 py-2">
                              {localidad} ({totalItems} pedidos)
                              <span className="text-indigo-600 dark:text-indigo-400 transition-transform duration-200 group-open:rotate-180">
                                ▼
                              </span>
                            </summary>
                            <div className="ml-4 space-y-3 mt-2">
                              {paginatedPedidos.map((p) => {
                                const repartidor = Array.isArray(state.repartidores)
                                  ? state.repartidores.find((r) => r.id === p.repartidorId) || {
                                      nombre: "Desconocido",
                                      correo: "Sin correo",
                                    }
                                  : {
                                      nombre: "Desconocido",
                                      correo: "Sin correo",
                                    };
                                return (
                                  <HistorialCard
                                    key={p.id}
                                    repartidor={repartidor}
                                    pedidos={[p]}
                                    onViewDetails={handleViewDetails}
                                  />
                                );
                              })}
                              {totalPages > 1 && (
                                <Pagination
                                  currentPage={currentPage}
                                  totalPages={totalPages}
                                  onPageChange={handlePageChange}
                                  localityKey={localityKey}
                                />
                              )}
                            </div>
                          </details>
                        );
                      }
                    )}
                  </details>
                ))}
              </details>
            ))
          )}
        </div>
      )}
      <Modal
        isOpen={state.modalOpen}
        onClose={handleCloseModal}
        repartidor={
          Array.isArray(state.repartidores)
            ? state.repartidores.find((r) => r.id === state.selectedRepartidorId) || {
                id: null,
                nombre: "Desconocido",
                correo: "Sin correo",
              }
            : { id: null, nombre: "Desconocido", correo: "Sin correo" }
        }
        pedidos={historialRepartidor[state.selectedRepartidorId] || []}
        repartidores={state.repartidores}
      />
    </div>
  );
};


export default AsignacionPedidosGeo;
