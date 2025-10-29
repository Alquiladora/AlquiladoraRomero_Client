import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSearch,
  faChevronLeft,
  faChevronRight,
  faExclamationTriangle,
  faCheckCircle,
  faQuestionCircle,
  faBrain,
  faPercentage,
  faSort,
  faSortUp,
  faSortDown,
} from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import api from '../../../utils/AxiosConfig';
import { useAuth } from '../../../hooks/ContextAuth';
import CustomLoading from '../../../components/spiner/SpinerGlobal';

// Componente para la barra de probabilidad
const ProbabilityBar = ({ probability }) => {
  console.log('dATOS RECIBIDOS DE PROBABILIDAD', probability);
  const percentage = (probability * 100).toFixed(2);
  let barColor = 'bg-green-500';
  if (probability > 0.85) {
    barColor = 'bg-red-500';
  } else {
    barColor = 'bg-yellow-500';
  }

  return (
    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 relative">
      <div
        className={`h-4 rounded-full transition-all duration-500 ${barColor}`}
        style={{ width: `${percentage}%` }}
      ></div>
      <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white mix-blend-difference">
        {percentage}%
      </span>
    </div>
  );
};

const PedidosConPrediccion = () => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({
    key: 'probabilidad',
    direction: 'descending',
  });
  const { csrfToken } = useAuth();
  const ordersPerPage = 10;

  useEffect(() => {
    const fetchPedidosConPrediccion = async () => {
      try {
        setLoading(true);
        const response = await api.get(
          '/api/pedidos/predecir-pedidos-activos',
          {
            headers: { 'X-CSRF-Token': csrfToken },
            withCredentials: true,
          }
        );
        const result = response.data;
        console.log('rESULATFF', response);

        if (result.success) {
          setPedidos(result.data);
        } else {
          toast.error('Error al cargar las predicciones de los pedidos');
        }
      } catch (error) {
        toast.error('Error de conexión al servidor de predicciones');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchPedidosConPrediccion();
  }, [csrfToken]);

  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedPedidos = React.useMemo(() => {
    let sortableItems = [...pedidos];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        let valA, valB;
        if (sortConfig.key === 'probabilidad') {
          valA = a.prediccion?.probabilidad_de_cancelacion ?? -1;
          valB = b.prediccion?.probabilidad_de_cancelacion ?? -1;
        } else {
          valA = a[sortConfig.key];
          valB = b[sortConfig.key];
        }

        if (valA < valB) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (valA > valB) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [pedidos, sortConfig]);

  const filteredPedidos = sortedPedidos.filter((pedido) => {
    const search = searchTerm.toLowerCase();
    return (
      pedido.idRastreo?.toLowerCase().includes(search) ||
      pedido.nombreCliente?.toLowerCase().includes(search) ||
      pedido.estadoActual?.toLowerCase().includes(search)
    );
  });

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentPedidos = filteredPedidos.slice(
    indexOfFirstOrder,
    indexOfLastOrder
  );
  const totalPages = Math.ceil(filteredPedidos.length / ordersPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return faSort;
    }
    if (sortConfig.direction === 'ascending') {
      return faSortUp;
    }
    return faSortDown;
  };

  return (
    <div className="min-h-screen dark:from-gray-900 dark:to-gray-800 p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-extrabold text-gray-800 dark:text-gray-100 mb-8 flex items-center justify-center">
          <FontAwesomeIcon icon={faBrain} className="mr-3 text-purple-500" />
          Análisis Predictivo de Cancelaciones
        </h2>

        {loading ? (
          <CustomLoading />
        ) : (
          <>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md mb-6">
              <div className="flex items-center space-x-3 w-full">
                <FontAwesomeIcon icon={faSearch} className="text-purple-500" />
                <input
                  type="text"
                  placeholder="Buscar por ID, cliente o estado..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="p-2 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 w-full focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200"
                />
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl shadow-lg">
              <table className="min-w-full bg-white dark:bg-gray-800">
                <thead className="bg-gradient-to-r from-purple-600 to-indigo-600">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-tight text-white">
                      ID Rastreo
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-tight text-white">
                      Cliente
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-tight text-white">
                      Estado Actual
                    </th>
                    <th
                      className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-tight text-white cursor-pointer"
                      onClick={() => handleSort('probabilidad')}
                    >
                      <FontAwesomeIcon icon={faPercentage} className="mr-1" />
                      Prob. Cancelación
                      <FontAwesomeIcon
                        icon={getSortIcon('probabilidad')}
                        className="ml-2"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-tight text-white">
                      Predicción
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentPedidos.map((pedido, index) => {
                    const prob = pedido.prediccion?.probabilidad_de_cancelacion;
                    let rowClass = '';
                    if (prob > 0.75) rowClass = 'bg-red-100 dark:bg-red-900/30';
                    else if (prob > 0.4)
                      rowClass = 'bg-yellow-100 dark:bg-yellow-900/30';

                    return (
                      <tr
                        key={pedido.idPedido}
                        className={`border-b dark:border-gray-700 transition-all duration-200 ${rowClass} hover:bg-gray-100 dark:hover:bg-gray-700`}
                      >
                        <td className="px-4 py-3 text-sm font-medium text-gray-800 dark:text-gray-200">
                          {pedido.idRastreo}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-800 dark:text-gray-200">
                          {pedido.nombreCliente || 'No especificado'}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold shadow-sm bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                            {pedido.estadoActual}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-800 dark:text-gray-200">
                          {pedido.prediccion && !pedido.prediccion.error ? (
                            <ProbabilityBar probability={prob} />
                          ) : (
                            <span className="text-xs text-gray-500 italic">
                              No disponible
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {pedido.prediccion && !pedido.prediccion.error ? (
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                                prob > 0.5
                                  ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                                  : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                              }`}
                            >
                              <FontAwesomeIcon
                                icon={
                                  prob > 0.5
                                    ? faExclamationTriangle
                                    : faCheckCircle
                                }
                                className="mr-1"
                              />
                              {pedido.prediccion.prediccion_texto}
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300">
                              <FontAwesomeIcon
                                icon={faQuestionCircle}
                                className="mr-1"
                              />
                              Error
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Mostrando {indexOfFirstOrder + 1} -{' '}
                {Math.min(indexOfLastOrder, filteredPedidos.length)} de{' '}
                {filteredPedidos.length} pedidos
              </p>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded-l-lg ${
                    currentPage === 1
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-600'
                      : 'bg-purple-500 text-white hover:bg-purple-600 dark:hover:bg-purple-600 transition-all duration-200'
                  }`}
                >
                  <FontAwesomeIcon icon={faChevronLeft} />
                </button>
                <span className="text-sm text-gray-700 dark:text-gray-200">
                  Página {currentPage} de {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded-r-lg ${
                    currentPage === totalPages
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-600'
                      : 'bg-purple-500 text-white hover:bg-purple-600 dark:hover:bg-purple-600 transition-all duration-200'
                  }`}
                >
                  <FontAwesomeIcon icon={faChevronRight} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PedidosConPrediccion;
