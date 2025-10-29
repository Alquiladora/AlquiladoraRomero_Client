import React, { useMemo, useState } from 'react';
import Chart from 'react-apexcharts';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChair,
  faChartBar,
  faChartPie,
  faChartLine,
  faUser,
} from '@fortawesome/free-solid-svg-icons';

// El componente recibe orders como prop
const ProductosDashboard = ({ orders = [] }) => {
  console.log('Dat', orders);
  // Detecta años disponibles
  const years = useMemo(
    () => [
      ...new Set(orders.map((p) => new Date(p.fechas.inicio).getFullYear())),
    ],
    [orders]
  );
  const [selectedYear, setSelectedYear] = useState(
    years.length > 0 ? years[years.length - 1] : new Date().getFullYear()
  );

  // Procesamiento de datos para gráficas
  const {
    productosIngresos,
    productosCantidades,
    meses,
    productosPorMes,
    tipoClienteDistribucion,
  } = useMemo(() => {
    const mapIngresos = {};
    const mapCantidades = {};
    const mesesSet = new Set();
    const mapMesProd = {};
    const mapTipoCliente = {};

    orders.forEach((p) => {
      const fecha = new Date(p.fechas.inicio);
      const mes = fecha
        .toLocaleString('es-MX', { month: 'short' })
        .replace('.', '')
        .replace(/^\w/, (c) => c.toUpperCase()); // Primer letra mayúscula
      const year = fecha.getFullYear();
      if (year !== selectedYear) return;

      mesesSet.add(mes);

      // Ingresos por tipo de cliente
      mapTipoCliente[p.cliente.tipoCliente] =
        (mapTipoCliente[p.cliente.tipoCliente] || 0) +
        Number(p.pago.total || 0);

      p.productos.forEach((prod) => {
        // Ingresos y cantidades globales
        mapIngresos[prod.nombre] =
          (mapIngresos[prod.nombre] || 0) + Number(prod.subtotal);
        mapCantidades[prod.nombre] =
          (mapCantidades[prod.nombre] || 0) + Number(prod.cantidad);

        // Ingresos por mes y producto
        if (!mapMesProd[prod.nombre]) mapMesProd[prod.nombre] = {};
        mapMesProd[prod.nombre][mes] =
          (mapMesProd[prod.nombre][mes] || 0) + Number(prod.subtotal);
      });
    });

    // Ordenación correcta de meses
    const ordenMeses = [
      'Ene',
      'Feb',
      'Mar',
      'Abr',
      'May',
      'Jun',
      'Jul',
      'Ago',
      'Sep',
      'Oct',
      'Nov',
      'Dic',
    ];
    const meses = Array.from(mesesSet).sort(
      (a, b) => ordenMeses.indexOf(a) - ordenMeses.indexOf(b)
    );

    // Gráfica productos por ingresos/cantidad
    const productosIngresos = Object.entries(mapIngresos)
      .map(([nombre, ingreso]) => ({ nombre, ingreso }))
      .sort((a, b) => b.ingreso - a.ingreso);

    const productosCantidades = Object.entries(mapCantidades)
      .map(([nombre, cantidad]) => ({ nombre, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad);

    // Serie de ingresos por producto y mes
    const productosPorMes = productosIngresos.map(({ nombre }) => ({
      name: nombre,
      data: meses.map((m) => mapMesProd[nombre]?.[m] || 0),
    }));

    const tipoClienteDistribucion = Object.entries(mapTipoCliente);

    return {
      productosIngresos,
      productosCantidades,
      meses,
      productosPorMes,
      tipoClienteDistribucion,
    };
  }, [orders, selectedYear]);

  // --- Opciones comunes para gráficos ---
  const isDark = () => document.documentElement.classList.contains('dark');
  const chartCommon = {
    chart: { toolbar: { show: true }, background: 'transparent' },
    dataLabels: { enabled: false },
    grid: { borderColor: '#dddddd', strokeDashArray: 5 },
    tooltip: { theme: isDark() ? 'dark' : 'light' },
    theme: { mode: isDark() ? 'dark' : 'light' },
    xaxis: { labels: { style: { colors: isDark() ? '#ccc' : '#222' } } },
    yaxis: { labels: { style: { colors: isDark() ? '#ccc' : '#222' } } },
    title: { style: { color: isDark() ? '#fff' : '#1f2937' } },
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen dark:bg-gray-900 dark:text-white transition-colors">
      <h1 className="text-2xl sm:text-3xl font-extrabold mb-8 flex items-center">
        <FontAwesomeIcon icon={faChair} className="mr-3 text-yellow-500" />
        Dashboard de Productos de Alquiler
      </h1>

      {/* Selector de año */}
      <div className="flex flex-wrap gap-4 mb-8">
        <label className="flex items-center gap-2 text-lg font-semibold">
          Año:
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="rounded px-3 py-2 dark:bg-gray-800 dark:text-white bg-gray-100"
          >
            {years.map((y) => (
              <option key={y}>{y}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top productos por ingresos */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl">
          <h2 className="text-xl font-semibold mb-6 flex items-center">
            <FontAwesomeIcon
              icon={faChartBar}
              className="mr-2 text-yellow-500"
            />
            Top Productos por Ingresos
          </h2>
          <Chart
            {...chartCommon}
            options={{
              ...chartCommon,
              xaxis: {
                categories: productosIngresos.map((p) => p.nombre),
                ...chartCommon.xaxis,
              },
              title: { text: 'Ingresos por Producto', ...chartCommon.title },
            }}
            series={[
              {
                name: 'Ingresos',
                data: productosIngresos.map((p) => p.ingreso),
              },
            ]}
            type="bar"
            height={340}
          />
        </div>

        {/* Top productos por cantidad */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl">
          <h2 className="text-xl font-semibold mb-6 flex items-center">
            <FontAwesomeIcon
              icon={faChartBar}
              className="mr-2 text-yellow-500"
            />
            Top Productos por Cantidad Rentada
          </h2>
          <Chart
            {...chartCommon}
            options={{
              ...chartCommon,
              xaxis: {
                categories: productosCantidades.map((p) => p.nombre),
                ...chartCommon.xaxis,
              },
              title: { text: 'Cantidad por Producto', ...chartCommon.title },
            }}
            series={[
              {
                name: 'Cantidad',
                data: productosCantidades.map((p) => p.cantidad),
              },
            ]}
            type="bar"
            height={340}
          />
        </div>

        {/* Tendencia mensual de ingresos por producto */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl lg:col-span-2">
          <h2 className="text-xl font-semibold mb-6 flex items-center">
            <FontAwesomeIcon
              icon={faChartLine}
              className="mr-2 text-yellow-500"
            />
            Tendencia Mensual de Ingresos por Producto
          </h2>
          <Chart
            {...chartCommon}
            options={{
              ...chartCommon,
              xaxis: { categories: meses, ...chartCommon.xaxis },
              title: { text: 'Ingresos Mensuales', ...chartCommon.title },
              stroke: { curve: 'smooth' },
            }}
            series={productosPorMes}
            type="line"
            height={370}
          />
        </div>

        {/* Pie: ingresos por producto */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl">
          <h2 className="text-xl font-semibold mb-6 flex items-center">
            <FontAwesomeIcon
              icon={faChartPie}
              className="mr-2 text-yellow-500"
            />
            Distribución de Ingresos por Producto
          </h2>
          <Chart
            {...chartCommon}
            options={{
              ...chartCommon,
              labels: productosIngresos.map((p) => p.nombre),
              legend: { position: 'bottom' },
              title: {
                text: 'Porcentaje de Ingresos por Producto',
                ...chartCommon.title,
              },
            }}
            series={productosIngresos.map((p) => p.ingreso)}
            type="pie"
            height={350}
          />
        </div>

        {/* Pie: ingresos por tipo de cliente */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl">
          <h2 className="text-xl font-semibold mb-6 flex items-center">
            <FontAwesomeIcon icon={faUser} className="mr-2 text-yellow-500" />
            Ingresos por Tipo de Cliente
          </h2>
          <Chart
            {...chartCommon}
            options={{
              ...chartCommon,
              labels: tipoClienteDistribucion.map(([tipo]) => tipo),
              legend: { position: 'bottom' },
              title: {
                text: 'Distribución de Ingresos por Tipo de Cliente',
                ...chartCommon.title,
              },
            }}
            series={tipoClienteDistribucion.map(([_, valor]) => valor)}
            type="pie"
            height={350}
          />
        </div>
      </div>
    </div>
  );
};

export default ProductosDashboard;
