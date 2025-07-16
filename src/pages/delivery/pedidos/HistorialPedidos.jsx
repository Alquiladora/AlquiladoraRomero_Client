import React, { useState, useMemo } from 'react';
import { User, Clock, MapPin, CheckCircle, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { AiFillExclamationCircle } from 'react-icons/ai';

// Static data with completed orders
const staticOrders = [
  {
    id: 1,
    type: 'recogida',
    status: 'devuelto',
    description: 'Juan Pérez - Pedido #1001',
    locality: 'Centro',
    municipality: 'Monterrey',
    state: 'Nuevo León',
    deliveryDate: '2025-07-12',
    address: 'Av. Constitución 123',
    totalToPay: 1500.00,
    totalPaid: 1500.00,
    isUrgent: false,
    products: [
      { id: 1, name: 'Silla Blanco', quantity: 10, unitPrice: 100, subtotal: 1000, color: 'Blanco', status: 'OK' },
      { id: 2, name: 'Mesa Negro', quantity: 2, unitPrice: 250, subtotal: 500, color: 'Negro', status: 'OK' },
    ],
  },
  {
    id: 2,
    type: 'entrega',
    status: 'incidente',
    description: 'María García - Pedido #1002',
    locality: 'San Pedro',
    municipality: 'Monterrey',
    state: 'Nuevo León',
    deliveryDate: '2025-07-12',
    address: 'Río Bravo 456',
    totalToPay: 2000.00,
    totalPaid: 2000.00,
    isUrgent: true,
    observations: 'Daño en entrega por transporte',
    products: [
      { id: 3, name: 'Toldo Azul', quantity: 1, unitPrice: 2000, subtotal: 2000, color: 'Azul', status: 'incidente', issueQuantity: 1, observations: 'Toldo rasgado' },
    ],
  },
  {
    id: 3,
    type: 'recogida',
    status: 'devuelto',
    description: 'Carlos López - Pedido #1003',
    locality: 'Cumbres',
    municipality: 'Monterrey',
    state: 'Nuevo León',
    deliveryDate: '2025-07-11',
    address: 'Paseo de los Leones 789',
    totalToPay: 1800.00,
    totalPaid: 1800.00,
    isUrgent: false,
    products: [
      { id: 4, name: 'Silla Rojo', quantity: 15, unitPrice: 120, subtotal: 1800, color: 'Rojo', status: 'OK' },
    ],
  },
  {
    id: 4,
    type: 'entrega',
    status: 'incidente',
    description: 'Ana Martínez - Pedido #1004',
    locality: 'Guadalupe',
    municipality: 'Guadalupe',
    state: 'Nuevo León',
    deliveryDate: '2025-07-11',
    address: 'Av. Morones Prieto 321',
    totalToPay: 2500.00,
    totalPaid: 2000.00,
    isUrgent: true,
    observations: 'Problemas con entrega',
    products: [
      { id: 5, name: 'Silla Negro', quantity: 8, unitPrice: 150, subtotal: 1200, color: 'Negro', status: 'incidente', issueQuantity: 3, observations: '3 sillas dañadas' },
      { id: 6, name: 'Mesa Blanco', quantity: 3, unitPrice: 433.33, subtotal: 1300, color: 'Blanco', status: 'OK' },
    ],
  },
  {
    id: 5,
    type: 'recogida',
    status: 'devuelto',
    description: 'Luis Fernández - Pedido #1005',
    locality: 'Zona Centro',
    municipality: 'Saltillo',
    state: 'Coahuila',
    deliveryDate: '2025-07-10',
    address: 'Blvd. Venustiano Carranza 456',
    totalToPay: 2200.00,
    totalPaid: 2200.00,
    isUrgent: false,
    products: [
      { id: 7, name: 'Silla Azul', quantity: 12, unitPrice: 100, subtotal: 1200, color: 'Azul', status: 'OK' },
      { id: 8, name: 'Toldo Blanco', quantity: 1, unitPrice: 1000, subtotal: 1000, color: 'Blanco', status: 'OK' },
    ],
  },
  {
    id: 6,
    type: 'entrega',
    status: 'incidente',
    description: 'Sofía Ramírez - Pedido #1006',
    locality: 'Torreón Centro',
    municipality: 'Torreón',
    state: 'Coahuila',
    deliveryDate: '2025-07-10',
    address: 'Av. Hidalgo 789',
    totalToPay: 3000.00,
    totalPaid: 1500.00,
    isUrgent: true,
    observations: 'Daños en productos entregados',
    products: [
      { id: 9, name: 'Mesa Gris', quantity: 5, unitPrice: 300, subtotal: 1500, color: 'Gris', status: 'incidente', issueQuantity: 2, observations: '2 mesas rotas' },
      { id: 10, name: 'Silla Verde', quantity: 10, unitPrice: 150, subtotal: 1500, color: 'Verde', status: 'OK' },
    ],
  },
];

// No Data Component
const NoDataDisplay = ({ message }) => (
  <div className="flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700">
    <span className="text-sm text-gray-600 dark:text-gray-300">{message}</span>
  </div>
);

// Order History Component
const OrderHistory = () => {
  const [dateFilter, setDateFilter] = useState({ start: '', end: '' });
  const [currentPage, setCurrentPage] = useState({});
  const [expandedOrders, setExpandedOrders] = useState({});
  const ordersPerPage = 10;

  const statusStyles = {
    OK: { color: 'text-green-600', bg: 'bg-green-100', border: 'border-green-200' },
    incidente: { color: 'text-red-600', bg: 'bg-red-100', border: 'border-red-200' },
    faltante: { color: 'text-orange-600', bg: 'bg-orange-100', border: 'border-orange-200' },
    default: { color: 'text-gray-600', bg: 'bg-gray-100', border: 'border-gray-200' },
  };

  const groupedOrders = useMemo(() => {
    const filtered = staticOrders.filter((order) => {
      const isCompleted =
        (order.type === 'entrega' && order.status === 'incidente') ||
        (order.type === 'recogida' && order.status === 'devuelto');
      if (!isCompleted) return false;

      if (!dateFilter.start && !dateFilter.end) return true;
      const orderDate = new Date(order.deliveryDate);
      const startDate = dateFilter.start ? new Date(dateFilter.start) : null;
      const endDate = dateFilter.end ? new Date(dateFilter.end) : null;
      return (
        (!startDate || orderDate >= startDate) &&
        (!endDate || orderDate <= endDate)
      );
    });

    const groupedByState = filtered.reduce((acc, order) => {
      if (!acc[order.state]) acc[order.state] = {};
      if (!acc[order.state][order.municipality]) acc[order.state][order.municipality] = [];
      acc[order.state][order.municipality].push(order);
      return acc;
    }, {});

    Object.keys(groupedByState).forEach((state) => {
      Object.keys(groupedByState[state]).forEach((municipality) => {
        groupedByState[state][municipality].sort((a, b) => {
          if (a.isUrgent && !b.isUrgent) return -1;
          if (!a.isUrgent && b.isUrgent) return 1;
          return 0;
        });
      });
    });

    return groupedByState;
  }, [dateFilter]);

  const handleDateFilterChange = (e) => {
    const { name, value } = e.target;
    setDateFilter((prev) => ({ ...prev, [name]: value }));
    setCurrentPage({});
    setExpandedOrders({});
  };

  const toggleOrderDetails = (orderId) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  const getPaginatedOrders = (orders, state, municipality) => {
    const page = currentPage[`${state}-${municipality}`] || 1;
    const startIndex = (page - 1) * ordersPerPage;
    return orders.slice(startIndex, startIndex + ordersPerPage);
  };

  const getTotalPages = (orders) => Math.ceil(orders.length / ordersPerPage);

  const handlePageChange = (state, municipality, page) => {
    setCurrentPage((prev) => ({ ...prev, [`${state}-${municipality}`]: page }));
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <h2 className="text-2xl font-bold mb-6 flex items-center text-gray-900 dark:text-white">
        <User className="h-6 w-6 mr-2 text-indigo-600" />
        Historial de Pedidos Completados
      </h2>

      {/* Date Filter */}
      <div className="mb-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Filtrar por Fecha</h3>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Fecha Inicial</label>
            <div className="relative">
              <input
                type="date"
                name="start"
                value={dateFilter.start}
                onChange={handleDateFilterChange}
                className="w-full p-2 border rounded-lg text-sm bg-gray-50 dark:bg-gray-700 dark:text-white dark:border-gray-600"
              />
              <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
          </div>
          <div className="flex-1">
            <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Fecha Final</label>
            <div className="relative">
              <input
                type="date"
                name="end"
                value={dateFilter.end}
                onChange={handleDateFilterChange}
                className="w-full p-2 border rounded-lg text-sm bg-gray-50 dark:bg-gray-700 dark:text-white dark:border-gray-600"
              />
              <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {Object.keys(groupedOrders).length > 0 ? (
          Object.keys(groupedOrders).map((state) => (
            <div key={state}>
              <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">{state}</h3>
              {Object.keys(groupedOrders[state]).map((municipality) => (
                <div key={municipality} className="mb-6">
                  <h4 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">{municipality}</h4>
                  {groupedOrders[state][municipality].length > 0 ? (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {getPaginatedOrders(groupedOrders[state][municipality], state, municipality).map((order) => (
                          <div
                            key={order.id}
                            className="border rounded-lg p-4 bg-white dark:bg-gray-800 shadow-md"
                          >
                            {/* General Information Section */}
                            <div className="mb-4">
                              <h5 className="text-sm font-semibold text-gray-900 dark:text-white">Información General</h5>
                              <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">#{order.id}</span>
                                  {order.isUrgent && (
                                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">URGENTE</span>
                                  )}
                                </div>
                                <span
                                  className={`text-xs font-semibold px-2 py-1 rounded-full ${
                                    statusStyles[order.status]?.bg || statusStyles.default.bg
                                  } ${statusStyles[order.status]?.color || statusStyles.default.color}`}
                                >
                                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                </span>
                              </div>
                              <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">{order.description}</p>
                              <div className="space-y-1 text-xs text-gray-600 dark:text-gray-300 mt-2">
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  <span>{order.locality}, {order.municipality}, {order.state}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  <span>{new Date(order.deliveryDate).toLocaleDateString('es-MX')}</span>
                                </div>
                                <div className="flex items-start gap-1">
                                  <span className="line-clamp-2">{order.address}</span>
                                </div>
                              </div>
                            </div>

                            {/* Payment Section */}
                            <div className="mb-4">
                              <h5 className="text-sm font-semibold text-gray-900 dark:text-white">Estado de Pago</h5>
                              {order.totalToPay === order.totalPaid ? (
                                <div className="flex items-center gap-2 text-green-600">
                                  <CheckCircle className="h-4 w-4" />
                                  <span className="font-bold text-sm">PAGADO COMPLETO</span>
                                  <span className="text-xs bg-green-100 dark:bg-green-900 px-2 py-0.5 rounded-full">${order.totalToPay.toFixed(2)}</span>
                                </div>
                              ) : (
                                <div className="space-y-1">
                                  <div className="flex justify-between text-xs">
                                    <span>Pago</span>
                                    <span className="font-bold">${order.totalPaid.toFixed(2)} / ${order.totalToPay.toFixed(2)}</span>
                                  </div>
                                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                    <div
                                      className="bg-blue-500 h-2 rounded-full"
                                      style={{ width: `${Math.min((order.totalPaid / order.totalToPay) * 100, 100)}%` }}
                                    />
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Observations Section */}
                            {order.observations && (
                              <div className="mb-4">
                                <h5 className="text-sm font-semibold text-gray-900 dark:text-white">Observaciones</h5>
                                <p className="font-semibold bg-red-100 dark:bg-red-900 p-2 rounded-lg text-sm">{order.observations}</p>
                              </div>
                            )}

                            {/* Products Section with Collapsible Menu */}
                            <div>
                              <button
                                onClick={() => toggleOrderDetails(order.id)}
                                className="flex items-center justify-between w-full text-sm font-semibold text-gray-900 dark:text-white mb-2"
                              >
                                Productos
                                {expandedOrders[order.id] ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )}
                              </button>
                              {expandedOrders[order.id] && (
                                <div className="space-y-2">
                                  {order.products.map((product) => (
                                    <div
                                      key={product.id}
                                      className={`border rounded-lg p-2 ${
                                        statusStyles[product.status]?.border || statusStyles.default.border
                                      }`}
                                    >
                                      <div className="flex justify-between items-center mb-1">
                                        <p className="font-semibold text-sm text-gray-900 dark:text-white">{product.name}</p>
                                        <p className="text-green-600 font-bold text-sm">${product.subtotal.toFixed(2)}</p>
                                      </div>
                                      <div className="text-xs space-y-1 text-gray-600 dark:text-gray-300">
                                        <p>Cantidad: {product.quantity}</p>
                                        <p>Precio Unitario: ${product.unitPrice.toFixed(2)}</p>
                                        <p className="font-semibold text-gray-800 dark:text-gray-200">Color: {product.color}</p>
                                        <p>
                                          Estado:{' '}
                                          <span
                                            className={`${
                                              statusStyles[product.status]?.bg || statusStyles.default.bg
                                            } ${
                                              statusStyles[product.status]?.color || statusStyles.default.color
                                            } px-2 py-1 rounded-full font-semibold text-xs`}
                                          >
                                            {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                                          </span>
                                        </p>
                                        {(product.status === 'incidente' || product.status === 'faltante') && (
                                          <>
                                            <p>
                                              Cantidad Afectada: <span className="font-semibold">{product.issueQuantity || 0}</span>
                                            </p>
                                            <p>
                                              Observaciones: <span className="font-semibold">{product.observations || 'Ninguna'}</span>
                                            </p>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Pagination */}
                      {groupedOrders[state][municipality].length > ordersPerPage && (
                        <div className="flex justify-center mt-4">
                          <div className="flex items-center gap-2">
                            {Array.from({ length: getTotalPages(groupedOrders[state][municipality]) }, (_, i) => i + 1).map((page) => (
                              <button
                                key={page}
                                onClick={() => handlePageChange(state, municipality, page)}
                                className={`px-3 py-1 text-sm rounded-lg ${
                                  (currentPage[`${state}-${municipality}`] || 1) === page
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-indigo-100 dark:hover:bg-indigo-900'
                                }`}
                              >
                                {page}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <NoDataDisplay message={`No hay pedidos completados en ${municipality}`} />
                  )}
                </div>
              ))}
            </div>
          ))
        ) : (
          <NoDataDisplay message="No hay pedidos completados para mostrar" />
        )}
      </div>
    </div>
  );
};

export default OrderHistory;