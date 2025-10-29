/* eslint-disable */
import React, { useMemo, useContext } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  ResponsiveContainer,
} from 'recharts';
import { Package, DollarSign, Clock, AlertTriangle, Box } from 'lucide-react';
import { ThemeContext } from '@emotion/react';

const DashboardPedidos = ({ orders = [] }) => {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';

  const ordersData = orders || [];

  const statusColorsLight = {
    procesando: '#F97316', // naranja (orange-500)
    confirmado: '#10B981', // verde (emerald-500)
    enviando: '#3B82F6', // azul (blue-500)
    'en alquiler': '#8B5CF6', // morado (violet-500)
    devuelto: '#D1D5DB', // gris claro (gray-300)
    incompleto: '#FBBF24', // amarillo (yellow-400)
    incidente: '#EF4444', // rojo (red-500)
  };

  const statusColorsDark = {
    procesando: '#FDBA74',
    confirmado: '#6EE7B7',
    enviando: '#93C5FD',
    'en alquiler': '#C4B5FD',
    devuelto: '#F3F4F6',
    incompleto: '#FDE68A',
    incidente: '#FCA5A5',
  };

  const paymentColorsLight = {
    tarjeta: '#8B5CF6',
    efectivo: '#10B981',
    transferencia: '#3B82F6',
    paypal: '#F59E0B',
    desconocido: '#6B7280',
  };

  const paymentColorsDark = {
    tarjeta: '#C4B5FD',
    efectivo: '#6EE7B7',
    transferencia: '#93C5FD',
    paypal: '#FBBF24',
    desconocido: '#9CA3AF',
  };

  const statusColors = isDark ? statusColorsDark : statusColorsLight;
  const paymentColors = isDark ? paymentColorsDark : paymentColorsLight;

  const pedidosPendientesPago = useMemo(() => {
    return ordersData.filter((o) => {
      const totalPagado = Number(o.pago?.totalPagado ?? 0);
      const totalPagar = Number(o.totalPagar ?? 0);

      return totalPagar > 0 && totalPagado < totalPagar;
    });
  }, [ordersData]);
  const totalDeudaPendiente = useMemo(() => {
    return pedidosPendientesPago.reduce((sum, o) => {
      const totalPagado = Number(o.pago?.totalPagado ?? 0);
      const totalPagar = Number(o.totalPagar ?? 0);
      return sum + (totalPagar - totalPagado);
    }, 0);
  }, [pedidosPendientesPago]);

  const metrics = useMemo(() => {
    const total = ordersData.length;
    const pending = ordersData.filter((o) =>
      ['Confirmado', 'En alquiler'].includes(o.estado?.toLowerCase())
    ).length;
    const totalRevenue = ordersData.reduce(
      (sum, o) => sum + (Number(o.pago?.totalPagado) || 0),
      0
    );
    return { total, pending, totalRevenue };
  }, [ordersData]);

  const statusData = useMemo(() => {
    const counts = {};
    ordersData.forEach((o) => {
      const s = o.estado || 'Sin estado';
      counts[s] = (counts[s] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({
      name,
      value,
      color: statusColors[name.toLowerCase()] || '#6B7280',
    }));
  }, [ordersData]);

  const paymentMethodData = useMemo(() => {
    const counts = {};
    ordersData.forEach((o) => {
      const method = o.pago?.formaPago || 'Desconocido';
      counts[method] = (counts[method] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
      color: paymentColors[name.toLowerCase()] || '#6B7280',
    }));
  }, [ordersData]);

  const dailyRevenueData = useMemo(() => {
    const today = new Date();
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayRevenue = ordersData
        .filter(
          (o) =>
            o.fechas?.inicio &&
            new Date(o.fechas.inicio).toISOString().split('T')[0] === dateStr
        )
        .reduce((sum, o) => sum + (Number(o.pago?.totalPagado) || 0), 0);
      last7Days.push({
        date: date.toLocaleDateString('es-ES', {
          weekday: 'short',
          day: 'numeric',
        }),
        revenue: dayRevenue,
      });
    }
    return last7Days;
  }, [ordersData]);

  const topProducts = useMemo(() => {
    const counts = {};
    ordersData.forEach((o) => {
      if (Array.isArray(o.productos)) {
        o.productos.forEach((p) => {
          const name = p.nombre || 'Producto sin nombre';
          if (!counts[name]) counts[name] = { count: 0, revenue: 0 };
          counts[name].count += p.cantidad || 0;
          counts[name].revenue += p.subtotal || 0;
        });
      }
    });
    return Object.entries(counts)
      .map(([name, data]) => ({
        name,
        cantidad: data.count,
        ingresos: data.revenue,
      }))
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 5);
  }, [ordersData]);

  // Top clientes
  const topClients = useMemo(() => {
    const counts = {};
    ordersData.forEach((o) => {
      const name = o.cliente?.nombre || 'Desconocido';
      counts[name] = (counts[name] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([cliente, cantidad]) => ({ cliente, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 5);
  }, [ordersData]);

  const MetricCard = ({
    icon: Icon,
    title,
    value,
    subtitle,
    color = 'blue',
  }) => (
    <div
      className={`bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md flex items-center space-x-4 hover:shadow-xl transition-transform transform hover:-translate-y-1`}
    >
      <Icon className={`text-${color}-500 w-10 h-10`} />
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
        <p className="text-3xl font-bold text-gray-900 dark:text-white">
          {value}
        </p>
        {subtitle && <p className="text-sm text-gray-400">{subtitle}</p>}
      </div>
    </div>
  );

  // Tooltip gráfico
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded shadow-lg border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">
          <p className="font-bold mb-1">{label}</p>
          {payload.map((entry, i) => (
            <p key={i} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 max-w-7xl mx-auto">
      <h1 className="text-4xl font-extrabold mb-10 text-gray-900 dark:text-white flex items-center gap-3">
        <Box className="text-yellow-500 w-12 h-12" />
        Dashboard Pedidos Activos
      </h1>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
        <MetricCard
          icon={Package}
          title="Total Pedidos Activos"
          value={metrics.total}
          color="yellow"
        />
        <MetricCard
          icon={AlertTriangle}
          title="Pedidos con Pagos Pendientes"
          value={pedidosPendientesPago.length}
          color="red"
        />
        <MetricCard
          icon={DollarSign}
          title="Ingresos Totales"
          value={`$${metrics.totalRevenue.toLocaleString()}`}
          color="green"
        />
        <MetricCard
          icon={Clock}
          title="Potencial Ingresos (Total Deuda)"
          value={`$${totalDeudaPendiente.toLocaleString()}`}
          color="amber"
        />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Estado pedidos */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Estado de Pedidos Activos
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                paddingAngle={5}
                dataKey="value"
                label
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="bottom" />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Métodos pago */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Métodos de Pago
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={paymentMethodData}
              margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {paymentMethodData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pedidos por cliente */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Pedidos por Cliente (Top 5)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={topClients}
              margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="cliente"
                tick={{ fontSize: 12 }}
                interval={0}
                angle={-30}
                textAnchor="end"
              />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="cantidad" fill="#3B82F6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Ingresos últimos 7 días y productos top */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-10">
        {/* Ingresos últimos 7 días */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Ingresos Últimos 7 Días
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart
              data={dailyRevenueData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: undefined }} />
              <YAxis tick={{ fontSize: 12, fill: undefined }} />
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#10B981"
                fill="url(#colorRevenue)"
                strokeWidth={3}
                activeDot={{ r: 6 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Productos top 5 */}
        <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Productos Más Rentados
          </h3>
          <div className="space-y-4 max-h-[320px] overflow-y-auto">
            {topProducts.map((product, i) => (
              <div
                key={i}
                className="flex justify-between items-center bg-white dark:bg-gray-800 rounded-lg p-4"
              >
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {product.name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Cantidad: {product.cantidad}
                  </p>
                </div>
                <div className="text-right font-semibold text-gray-900 dark:text-white">
                  ${product.ingresos}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabla pedidos recientes */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 mt-12 max-w-7xl mx-auto">
        <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          Pedidos Recientes
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Método Pago
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {ordersData.slice(0, 5).map((order) => (
                <tr
                  key={order.idPedido}
                  className="hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    #{order.idPedido}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {order.cliente?.nombre || 'Sin nombre'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                      style={{
                        backgroundColor:
                          (statusColors[order.estado?.toLowerCase()] ||
                            '#6B7280') + '20', // transparencia
                        color:
                          statusColors[order.estado?.toLowerCase()] ||
                          '#6B7280',
                      }}
                    >
                      {order.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {order.pago?.formaPago || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    ${Number(order.pago?.totalPagado || 0).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardPedidos;
