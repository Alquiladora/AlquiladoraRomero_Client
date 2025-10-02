import React, { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
} from "recharts";
import {
  Truck,
  Package,
  CheckCircle,
  Clock,
  BarChart2,
  Target,
} from "lucide-react";
import api from "../../../utils/AxiosConfig";
import { useAuth } from "../../../hooks/ContextAuth";
import CustomLoading from "../../../components/spiner/SpinerGlobal";
import GraficasRepartidor from "./DraficasRepartidor";

const InicioRepartidor = ({ datosRepartidor }) => {
  const [loading, setLoading] = useState(true);
  const [repartidor, setRepartidor] = useState({
    nombre: "",
    apellidoP: "",
    apellidoM: "",
    cuentaActiva: 0,
    fechaAlta: null,
    fechaBaja: null,
  });
  const [estadisticas, setEstadisticas] = useState({
    totalRecogiendo: 0,
    totalEnAlquiler: 0,
    totalEnviando: 0,
    totalFinalizado: 0,
    promedioValoracion: 0,
  });
  const [pedidosFinalizadosPorMes, setPedidosFinalizadosPorMes] = useState([]);
  const { user, logout, csrfToken } = useAuth();

  // Datos para el gráfico circular de distribución de pedidos
  const pieData = [
    { name: "Recogiendo", value: estadisticas.totalRecogiendo, color: "#2563EB" },
    { name: "En Alquiler", value: estadisticas.totalEnAlquiler, color: "#F59E0B" },
    { name: "Enviando", value: estadisticas.totalEnviando, color: "#DC2626" },
    { name: "Finalizado", value: estadisticas.totalFinalizado, color: "#065F46" },
  ];

  console.log("Datos recibidos desde el enpoit de datos de repartidor ", datosRepartidor)
  // Datos para el gráfico radial de rendimiento mensual
  const radialData = pedidosFinalizadosPorMes.map((item, index) => ({
    name: item.mes,
    value: item.completados || 0,
    fill: `hsl(${(index * 60) % 360}, 70%, 50%)`,
  }));

  // Datos para el gráfico radial de valoración
  const valoracionData = [
    {
      name: "Puntuación",
      value: estadisticas.promedioValoracion * 20,
      color: estadisticas.promedioValoracion >= 4 ? "#065F46" : "#DC2626",
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const response = await api.get("/api/repartidor/repartidor/datos", {
          withCredentials: true,
          headers: { "X-CSRF-Token": csrfToken },
        });

        console.log("Response:", response);
        if (response.data && response.status === 200) {
          const data = response.data;
          setRepartidor({
            nombre: data.nombre || "",
            apellidoP: data.apellidoP || "",
            apellidoM: data.apellidoM || "",
            cuentaActiva: data.cuentaActiva || 0,
            fechaAlta: data.fechaAlta || null,
            fechaBaja: data.fechaBaja || null,
          });

          setEstadisticas({
            totalRecogiendo: data.totalRecogiendo || 0,
            totalEnAlquiler: data.totalEnAlquiler || 0,
            totalEnviando: data.totalEnviando || 0,
            totalFinalizado: data.totalFinalizado || 0,
            promedioValoracion: parseFloat(data.promedioValoracion) || 0,
          });

          setPedidosFinalizadosPorMes(data.pedidosFinalizadosPorMes || []);
        } else {

        }
      } catch (error) {

        setRepartidor({
          nombre: user?.nombre || "Sin nombre",
          apellidoP: "",
          apellidoM: "",
          cuentaActiva: 0,
          fechaAlta: null,
          fechaBaja: null,
        });
        setEstadisticas({
          totalRecogiendo: 0,
          totalEnAlquiler: 0,
          totalEnviando: 0,
          totalFinalizado: 0,
          promedioValoracion: 0,
        });
        setPedidosFinalizadosPorMes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, csrfToken]);

  const hasDataForCharts =
    estadisticas.totalRecogiendo > 0 ||
    estadisticas.totalEnAlquiler > 0 ||
    estadisticas.totalEnviando > 0 ||
    estadisticas.totalFinalizado > 0 ||
    (pedidosFinalizadosPorMes && pedidosFinalizadosPorMes.length > 0) ||
    estadisticas.promedioValoracion > 0;

  if (loading) {
    return <CustomLoading />;
  }

  if (!datosRepartidor) {
    return <div>Cargando datos del repartidor...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white shadow-xl border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700 p-6 md:p-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex items-center space-x-6">

            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-700 to-blue-900 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                <img
                  src={
                    datosRepartidor.fotoPerfil ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      datosRepartidor.nombre ? datosRepartidor.nombre.charAt(0) : "D"
                    )}&background=0D6EFD&color=fff`
                  }
                  alt="Foto de Perfil"
                  className="h-19 w-19 rounded-full object-cover border-2 border-white dark:border-gray-300 hover:scale-105 transition-transform duration-200"
                />
              </div>
              <div
                className={`absolute -bottom-2 -right-2 w-6 h-6 rounded-full border-2 border-white dark:border-gray-800 ${repartidor.cuentaActiva ? "bg-emerald-500" : "bg-red-500"
                  }`}
              ></div>
            </div>

            <div>
              {/* El nombre se mantiene como el título principal */}
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 md:text-3xl">
                {repartidor.nombre} {repartidor.apellidoP} {repartidor.apellidoM}
              </h1>

              {/* Contenedor para la información secundaria con espaciado */}
              <div className="mt-2 flex flex-col items-start space-y-2">

                {/* 1. BADGE DE ESTADO CON INDICADOR DE COLOR (SIN ICONOS) */}
                <div
                  className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold
        ${repartidor.cuentaActiva
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                    }`}
                >
                  {/* Pequeño círculo de color que sustituye al icono */}
                  <span
                    className={`w-2 h-2 mr-2 rounded-full
          ${repartidor.cuentaActiva ? "bg-green-500" : "bg-gray-500"}`}
                  ></span>

                  {/* Texto del estado */}
                  <span>
                    {repartidor.cuentaActiva ? "Activo" : "Desactivado"}
                  </span>
                </div>

                {/* 2. FECHA CON FORMATO MEJORADO */}
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {repartidor.cuentaActiva
                    ? `Activado desde: ${new Date(repartidor.fechaAlta).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}`
                    : repartidor.fechaBaja
                      ? `Desactivado desde: ${new Date(repartidor.fechaBaja).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}`
                      : "Sin fecha de baja"}
                </p>

              </div>
            </div>

          </div>
        </div>
      </header>

    
       < GraficasRepartidor  estadisticas={estadisticas} />



    </div>
  );
};

export default InicioRepartidor;