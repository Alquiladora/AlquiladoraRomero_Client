import React, { useEffect, useState } from "react";
import api from "../../../../utils/AxiosConfig";
import { 
  FaUserCircle, 
  FaClock, 
  FaDesktop, 
  FaCheckCircle, 
  FaExclamationCircle, 
  FaExclamationTriangle, 
  FaInfoCircle 
} from "react-icons/fa";
import { useAuth } from "../../../../hooks/ContextAuth";

const Auditoria = () => {
  const [auditorias, setAuditorias] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const [loading, setLoading] = useState(false);

  const { csrfToken } = useAuth();


  const currentYear = new Date().getFullYear();
  const years = [];
  for (let y = 2024; y <= currentYear; y++) {
    years.push(y);
  }

  const fetchAuditorias = async (pageNumber = 1, month = "", year = "") => {
    setLoading(true);
    try { 
      const limit = 10;
      const params = {
        page: pageNumber,
        limit,
      };
      if (year) params.year = year;
      if (month !== "") params.month = month;
      const response = await api.get("/api/auditoria/auditoria/lista", {
        params,
        withCredentials: true,
        headers: { "X-CSRF-Token": csrfToken },
      });
      setAuditorias(response.data.data);
      setTotalPages(response.data.totalPages);
      setPage(response.data.currentPage);
    } catch (error) {
      console.error("Error al obtener registros de auditoría:", error);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchAuditorias(1, selectedMonth, selectedYear);
   
  }, [csrfToken]);

  useEffect(() => {
    fetchAuditorias(1, selectedMonth, selectedYear);

  }, [selectedMonth, selectedYear]);

 
  const handlePreviousPage = () => {
    if (page > 1) {
      fetchAuditorias(page - 1, selectedMonth, selectedYear);
    }
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      fetchAuditorias(page + 1, selectedMonth, selectedYear);
    }
  };


  const getChipProps = (accion) => {
    const act = accion.toLowerCase();
    if (act.includes("error")) {
      return { color: "red", icon: <FaExclamationCircle className="inline mr-1" /> };
    } else if (act.includes("éxito") || act.includes("correcto") || act.includes("inicio de sesión exitoso")) {
      return { color: "green", icon: <FaCheckCircle className="inline mr-1" /> };
    } else if (act.includes("advertencia")) {
      return { color: "yellow", icon: <FaExclamationTriangle className="inline mr-1" /> };
    } else {
      return { color: "blue", icon: <FaInfoCircle className="inline mr-1" /> };
    }
  };

  return (
    <div className="p-4 max-w-3xl mx-auto dark:bg-gray-900 dark:text-gray-100">
      <h1 className="text-3xl font-bold text-center mb-6">Registro de Auditoría</h1>

    
      <div className="flex flex-col sm:flex-row justify-center gap-4 mb-6">
        <div className="flex flex-col">
          <label className="mb-1 font-semibold">Filtrar por mes</label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
          >
            <option value="">Todos los meses</option>
            {Array.from({ length: 12 }, (_, index) => (
              <option key={index} value={index}>
                {new Date(0, index).toLocaleString("default", {
                  month: "long",
                })}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col">
          <label className="mb-1 font-semibold">Filtrar por año</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="flex flex-col items-center">
         
            <div className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-sm text-gray-700 dark:text-gray-300">
              Cargando auditoría...
            </p>
          </div>
        </div>
      ) : (
        <div className="max-h-[70vh] overflow-auto p-4 bg-gray-50 dark:bg-gray-800 rounded shadow">
          {auditorias.length === 0 ? (
            <div className="text-center p-4">
              <div className="bg-blue-100 text-blue-800 p-2 rounded">
                No hay registros de auditoría para el filtro seleccionado.
              </div>
            </div>
          ) : (
            <ul className="space-y-4">
              {auditorias.map((auditoria) => (
                <li
                  key={auditoria.id}
                  className="p-4 bg-white dark:bg-gray-700 rounded shadow hover:shadow-lg transition transform hover:scale-105"
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="p-2 bg-primary-500 rounded-full">
                      <FaUserCircle className="text-white text-xl" />
                    </div>
                    <div>
                      <p className="text-lg font-bold">
                        {auditoria.usuario || "Usuario desconocido"} - {auditoria.correo}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {new Date(auditoria.fecha_hora).toLocaleString("es-MX", {
                          dateStyle: "short",
                          timeStyle: "short",
                          hour12: true,
                        })}
                      </p>
                    </div>
                  </div>
                 
                  <div className="flex flex-wrap gap-2 items-center">
                    {(() => {
                      const chipProps = getChipProps(auditoria.accion);
                      return (
                        <span
                          className={`inline-block px-3 py-1 text-xs font-semibold text-${chipProps.color}-800 bg-${chipProps.color}-100 rounded-full flex items-center`}
                        >
                          {chipProps.icon}
                          {auditoria.accion}
                        </span>
                      );
                    })()}

                    <span className="inline-block px-3 py-1 text-xs font-semibold text-gray-800 bg-gray-200 rounded-full flex items-center">
                      <FaClock className="mr-1" />{" "}
                      {new Date(auditoria.fecha_hora).toLocaleString("es-MX", {
                        dateStyle: "short",
                        timeStyle: "short",
                        hour12: true,
                      })}
                    </span>
                    <span className="inline-block px-3 py-1 text-xs font-semibold text-blue-800 bg-blue-100 rounded-full flex items-center">
                      <FaDesktop className="mr-1" /> {auditoria.ip}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                    {auditoria.detalles}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="flex justify-center items-center mt-4 space-x-4">
        <button
          onClick={handlePreviousPage}
          disabled={page <= 1}
          className="px-3 py-1 bg-yellow-500 text-white rounded disabled:opacity-50"
        >
          Anterior
        </button>
        <span>Página {page} de {totalPages}</span>
        <button
          onClick={handleNextPage}
          disabled={page >= totalPages}
          className="px-3 py-1 bg-yellow-500 text-white rounded disabled:opacity-50"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
};

export default Auditoria;
