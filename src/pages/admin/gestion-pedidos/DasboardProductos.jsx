import React, { useState } from "react";
import Chart from "react-apexcharts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartBar, faChartLine, faChartPie, faFire, faTable, faChair
} from "@fortawesome/free-solid-svg-icons";

// Static data (as defined above)
const staticRentalData = [
  { id: 1, name: "Silla Plegable", category: "Mobiliario", rentals: [
    { month: "Ene", year: 2024, quantity: 300 },
    { month: "Feb", year: 2024, quantity: 250 },
    { month: "Mar", year: 2024, quantity: 280 },
    { month: "Abr", year: 2024, quantity: 320 },
    { month: "May", year: 2024, quantity: 350 },
    { month: "Jun", year: 2024, quantity: 400 },
    { month: "Jul", year: 2024, quantity: 380 },
    { month: "Ago", year: 2024, quantity: 360 },
    { month: "Sep", year: 2024, quantity: 340 },
    { month: "Oct", year: 2024, quantity: 370 },
    { month: "Nov", year: 2024, quantity: 390 },
    { month: "Dic", year: 2024, quantity: 420 },
  ]},
  { id: 2, name: "Mesa Rectangular", category: "Mobiliario", rentals: [
    { month: "Ene", year: 2024, quantity: 150 },
    { month: "Feb", year: 2024, quantity: 160 },
    { month: "Mar", year: 2024, quantity: 170 },
    { month: "Abr", year: 2024, quantity: 180 },
    { month: "May", year: 2024, quantity: 200 },
    { month: "Jun", year: 2024, quantity: 220 },
    { month: "Jul", year: 2024, quantity: 210 },
    { month: "Ago", year: 2024, quantity: 190 },
    { month: "Sep", year: 2024, quantity: 200 },
    { month: "Oct", year: 2024, quantity: 230 },
    { month: "Nov", year: 2024, quantity: 240 },
    { month: "Dic", year: 2024, quantity: 250 },
  ]},
  { id: 3, name: "Vaso de Cristal", category: "Vajilla", rentals: [
    { month: "Ene", year: 2024, quantity: 500 },
    { month: "Feb", year: 2024, quantity: 450 },
    { month: "Mar", year: 2024, quantity: 480 },
    { month: "Abr", year: 2024, quantity: 520 },
    { month: "May", year: 2024, quantity: 550 },
    { month: "Jun", year: 2024, quantity: 600 },
    { month: "Jul", year: 2024, quantity: 580 },
    { month: "Ago", year: 2024, quantity: 560 },
    { month: "Sep", year: 2024, quantity: 540 },
    { month: "Oct", year: 2024, quantity: 570 },
    { month: "Nov", year: 2024, quantity: 590 },
    { month: "Dic", year: 2024, quantity: 620 },
  ]},
  { id: 4, name: "Plato de Cerámica", category: "Vajilla", rentals: [
    { month: "Ene", year: 2024, quantity: 400 },
    { month: "Feb", year: 2024, quantity: 380 },
    { month: "Mar", year: 2024, quantity: 410 },
    { month: "Abr", year: 2024, quantity: 430 },
    { month: "May", year: 2024, quantity: 450 },
    { month: "Jun", year: 2024, quantity: 470 },
    { month: "Jul", year: 2024, quantity: 460 },
    { month: "Ago", year: 2024, quantity: 440 },
    { month: "Sep", year: 2024, quantity: 420 },
    { month: "Oct", year: 2024, quantity: 460 },
    { month: "Nov", year: 2024, quantity: 480 },
    { month: "Dic", year: 2024, quantity: 500 },
  ]},
  { id: 5, name: "Mantel Blanco", category: "Decoración", rentals: [
    { month: "Ene", year: 2024, quantity: 200 },
    { month: "Feb", year: 2024, quantity: 180 },
    { month: "Mar", year: 2024, quantity: 190 },
    { month: "Abr", year: 2024, quantity: 210 },
    { month: "May", year: 2024, quantity: 230 },
    { month: "Jun", year: 2024, quantity: 250 },
    { month: "Jul", year: 2024, quantity: 240 },
    { month: "Ago", year: 2024, quantity: 220 },
    { month: "Sep", year: 2024, quantity: 200 },
    { month: "Oct", year: 2024, quantity: 240 },
    { month: "Nov", year: 2024, quantity: 260 },
    { month: "Dic", year: 2024, quantity: 280 },
  ]},
  { id: 6, name: "Copa de Vino", category: "Vajilla", rentals: [
    { month: "Ene", year: 2024, quantity: 300 },
    { month: "Feb", year: 2024, quantity: 280 },
    { month: "Mar", year: 2024, quantity: 310 },
    { month: "Abr", year: 2024, quantity: 320 },
    { month: "May", year: 2024, quantity: 340 },
    { month: "Jun", year: 2024, quantity: 360 },
    { month: "Jul", year: 2024, quantity: 350 },
    { month: "Ago", year: 2024, quantity: 330 },
    { month: "Sep", year: 2024, quantity: 310 },
    { month: "Oct", year: 2024, quantity: 350 },
    { month: "Nov", year: 2024, quantity: 370 },
    { month: "Dic", year: 2024, quantity: 390 },
  ]},
  { id: 7, name: "Silla Tiffany", category: "Mobiliario", rentals: [
    { month: "Ene", year: 2024, quantity: 100 },
    { month: "Feb", year: 2024, quantity: 110 },
    { month: "Mar", year: 2024, quantity: 120 },
    { month: "Abr", year: 2024, quantity: 130 },
    { month: "May", year: 2024, quantity: 140 },
    { month: "Jun", year: 2024, quantity: 150 },
    { month: "Jul", year: 2024, quantity: 160 },
    { month: "Ago", year: 2024, quantity: 170 },
    { month: "Sep", year: 2024, quantity: 180 },
    { month: "Oct", year: 2024, quantity: 190 },
    { month: "Nov", year: 2024, quantity: 200 },
    { month: "Dic", year: 2024, quantity: 210 },
  ]},
  { id: 8, name: "Centro de Mesa", category: "Decoración", rentals: [
    { month: "Ene", year: 2024, quantity: 80 },
    { month: "Feb", year: 2024, quantity: 90 },
    { month: "Mar", year: 2024, quantity: 100 },
    { month: "Abr", year: 2024, quantity: 110 },
    { month: "May", year: 2024, quantity: 120 },
    { month: "Jun", year: 2024, quantity: 130 },
    { month: "Jul", year: 2024, quantity: 140 },
    { month: "Ago", year: 2024, quantity: 150 },
    { month: "Sep", year: 2024, quantity: 160 },
    { month: "Oct", year: 2024, quantity: 170 },
    { month: "Nov", year: 2024, quantity: 180 },
    { month: "Dic", year: 2024, quantity: 190 },
  ]},
  { id: 9, name: "Toldo 3x3", category: "Estructuras", rentals: [
    { month: "Ene", year: 2024, quantity: 20 },
    { month: "Feb", year: 2024, quantity: 25 },
    { month: "Mar", year: 2024, quantity: 30 },
    { month: "Abr", year: 2024, quantity: 35 },
    { month: "May", year: 2024, quantity: 40 },
    { month: "Jun", year: 2024, quantity: 45 },
    { month: "Jul", year: 2024, quantity: 50 },
    { month: "Ago", year: 2024, quantity: 55 },
    { month: "Sep", year: 2024, quantity: 60 },
    { month: "Oct", year: 2024, quantity: 65 },
    { month: "Nov", year: 2024, quantity: 70 },
    { month: "Dic", year: 2024, quantity: 75 },
  ]},
  { id: 10, name: "Cuchara de Acero", category: "Vajilla", rentals: [
    { month: "Ene", year: 2024, quantity: 200 },
    { month: "Feb", year: 2024, quantity: 210 },
    { month: "Mar", year: 2024, quantity: 220 },
    { month: "Abr", year: 2024, quantity: 230 },
    { month: "May", year: 2024, quantity: 240 },
    { month: "Jun", year: 2024, quantity: 250 },
    { month: "Jul", year: 2024, quantity: 260 },
    { month: "Ago", year: 2024, quantity: 270 },
    { month: "Sep", year: 2024, quantity: 280 },
    { month: "Oct", year: 2024, quantity: 290 },
    { month: "Nov", year: 2024, quantity: 300 },
    { month: "Dic", year: 2024, quantity: 310 },
  ]},
  { id: 11, name: "Servilleta de Tela", category: "Decoración", rentals: [
    { month: "Ene", year: 2024, quantity: 150 },
    { month: "Feb", year: 2024, quantity: 160 },
    { month: "Mar", year: 2024, quantity: 170 },
    { month: "Abr", year: 2024, quantity: 180 },
    { month: "May", year: 2024, quantity: 190 },
    { month: "Jun", year: 2024, quantity: 200 },
    { month: "Jul", year: 2024, quantity: 210 },
    { month: "Ago", year: 2024, quantity: 220 },
    { month: "Sep", year: 2024, quantity: 230 },
    { month: "Oct", year: 2024, quantity: 240 },
    { month: "Nov", year: 2024, quantity: 250 },
    { month: "Dic", year: 2024, quantity: 260 },
  ]},
];

const ProductosDashboard = () => {
  const [selectedMonth, setSelectedMonth] = useState("Ene");
  const [selectedYear, setSelectedYear] = useState(2024);

  const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  const years = [2024]; // Static for now, can be dynamic with real data

  // Top 10 Rental Products by Month
  const getTopProductsByMonth = (month, year) => {
    const productDemand = staticRentalData.map((product) => {
      const rental = product.rentals.find((r) => r.month === month && r.year === year);
      return { name: product.name, quantity: rental ? rental.quantity : 0 };
    });
    return productDemand
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);
  };

  const topProductsByMonth = getTopProductsByMonth(selectedMonth, selectedYear);
  const monthlyChartOptions = {
    chart: { type: "bar", height: 350, toolbar: { show: true } },
    xaxis: {
      categories: topProductsByMonth.map((p) => p.name),
      labels: { style: { colors: "#616161", fontSize: "12px", fontFamily: "inherit" } },
    },
    yaxis: { labels: { style: { colors: "#616161", fontSize: "12px", fontFamily: "inherit" } } },
    colors: ["#f59e0b"],
    title: { text: `Top 10 Productos Más Rentados en ${selectedMonth} ${selectedYear}`, style: { color: "#1f2937" } },
    dataLabels: { enabled: false },
    grid: { borderColor: "#dddddd", strokeDashArray: 5 },
    tooltip: { theme: "dark" },
  };

  const monthlyChartSeries = [{ name: "Cantidad Rentada", data: topProductsByMonth.map((p) => p.quantity) }];

  // Top 10 Rental Products by Year
  const getTopProductsByYear = (year) => {
    const productDemand = staticRentalData.map((product) => {
      const totalQuantity = product.rentals
        .filter((r) => r.year === year)
        .reduce((sum, r) => sum + r.quantity, 0);
      return { name: product.name, quantity: totalQuantity };
    });
    return productDemand
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);
  };

  const topProductsByYear = getTopProductsByYear(selectedYear);
  const yearlyChartOptions = {
    chart: { type: "bar", height: 350, toolbar: { show: true } },
    xaxis: {
      categories: topProductsByYear.map((p) => p.name),
      labels: { style: { colors: "#616161", fontSize: "12px", fontFamily: "inherit" } },
    },
    yaxis: { labels: { style: { colors: "#616161", fontSize: "12px", fontFamily: "inherit" } } },
    colors: ["#f59e0b"],
    title: { text: `Top 10 Productos Más Rentados en ${selectedYear}`, style: { color: "#1f2937" } },
    dataLabels: { enabled: false },
    grid: { borderColor: "#dddddd", strokeDashArray: 5 },
    tooltip: { theme: "dark" },
  };

  const yearlyChartSeries = [{ name: "Cantidad Rentada", data: topProductsByYear.map((p) => p.quantity) }];

  // Rental Trend of Top 5 Products Over the Year
  const top5Products = staticRentalData
    .map((product) => ({
      name: product.name,
      total: product.rentals.reduce((sum, r) => sum + r.quantity, 0),
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  const trendChartOptions = {
    chart: { type: "line", height: 350, toolbar: { show: true } },
    xaxis: {
      categories: months,
      labels: { style: { colors: "#616161", fontSize: "12px", fontFamily: "inherit" } },
    },
    yaxis: { labels: { style: { colors: "#616161", fontSize: "12px", fontFamily: "inherit" } } },
    colors: ["#f59e0b", "#10b981", "#ef4444", "#3b82f6", "#8b5cf6"],
    title: { text: "Tendencia de Renta de los Top 5 Productos en 2024", style: { color: "#1f2937" } },
    stroke: { curve: "smooth" },
    markers: { size: 5 },
    grid: { borderColor: "#dddddd", strokeDashArray: 5 },
    tooltip: { theme: "dark" },
  };

  const trendChartSeries = top5Products.map((product) => ({
    name: product.name,
    data: months.map((month) => {
      const rental = staticRentalData
        .find((p) => p.name === product.name)
        .rentals.find((r) => r.month === month && r.year === 2024);
      return rental ? rental.quantity : 0;
    }),
  }));

  // Rental Demand by Category
  const categoryDemand = staticRentalData.reduce((acc, product) => {
    const totalQuantity = product.rentals.reduce((sum, r) => sum + r.quantity, 0);
    acc[product.category] = (acc[product.category] || 0) + totalQuantity;
    return acc;
  }, {});

  const categoryChartOptions = {
    chart: { type: "pie", height: 350, toolbar: { show: true } },
    labels: Object.keys(categoryDemand),
    colors: ["#f59e0b", "#10b981", "#ef4444", "#3b82f6"],
    title: { text: "Distribución de Renta por Categoría", style: { color: "#1f2937" } },
    dataLabels: { enabled: true },
    legend: { position: "bottom" },
    tooltip: { theme: "dark" },
  };

  const categoryChartSeries = Object.values(categoryDemand);

  // Heatmap of Rental Demand for Top 5 Products by Month
  const heatmapChartOptions = {
    chart: { type: "heatmap", height: 350, toolbar: { show: true } },
    xaxis: {
      categories: months,
      labels: { style: { colors: "#616161", fontSize: "12px", fontFamily: "inherit" } },
    },
    yaxis: {
      categories: top5Products.map((p) => p.name),
      labels: { style: { colors: "#616161", fontSize: "12px", fontFamily: "inherit" } },
    },
    colors: ["#f59e0b"],
    title: { text: "Mapa de Calor de Renta de los Top 5 Productos por Mes", style: { color: "#1f2937" } },
    dataLabels: { enabled: false },
    tooltip: { theme: "dark" },
  };

  const heatmapChartSeries = top5Products.map((product) => ({
    name: product.name,
    data: months.map((month) => {
      const rental = staticRentalData
        .find((p) => p.name === product.name)
        .rentals.find((r) => r.month === month && r.year === 2024);
      return rental ? rental.quantity : 0;
    }),
  }));

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen dark:bg-gray-900 dark:text-white">
      <h1 className="text-2xl sm:text-3xl font-extrabold mb-8 text-gray-800 dark:text-white flex items-center">
        <FontAwesomeIcon icon={faChair} className="mr-3 text-yellow-500" />
        Dashboard de Productos de Alquiler
      </h1>

      <div className="space-y-12">
        {/* Top 10 Rental Products by Month */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-4 sm:space-y-0">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center">
              <FontAwesomeIcon icon={faChartBar} className="mr-3 text-yellow-500" />
              Top 10 Productos Más Rentados por Mes
            </h2>
            <div className="flex space-x-4">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
              >
                {months.map((month) => (
                  <option key={month} value={month}>
                    {month}
                  </option>
                ))}
              </select>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <Chart options={monthlyChartOptions} series={monthlyChartSeries} type="bar" height={350} />
          <table className="min-w-full mt-6">
            <thead className="bg-yellow-500 text-white">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">Producto</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Cantidad Rentada</th>
              </tr>
            </thead>
            <tbody>
              {topProductsByMonth.map((product, index) => (
                <tr
                  key={product.name}
                  className={`border-b dark:border-gray-700 ${
                    index % 2 === 0 ? "bg-gray-50 dark:bg-gray-900" : "bg-white dark:bg-gray-800"
                  } hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200`}
                >
                  <td className="px-6 py-4 text-sm dark:text-gray-200">{product.name}</td>
                  <td className="px-6 py-4 text-sm dark:text-gray-200">{product.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Top 10 Rental Products by Year */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center">
              <FontAwesomeIcon icon={faChartBar} className="mr-3 text-yellow-500" />
              Top 10 Productos Más Rentados por Año
            </h2>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
          <Chart options={yearlyChartOptions} series={yearlyChartSeries} type="bar" height={350} />
          <table className="min-w-full mt-6">
            <thead className="bg-yellow-500 text-white">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">Producto</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Cantidad Rentada</th>
              </tr>
            </thead>
            <tbody>
              {topProductsByYear.map((product, index) => (
                <tr
                  key={product.name}
                  className={`border-b dark:border-gray-700 ${
                    index % 2 === 0 ? "bg-gray-50 dark:bg-gray-900" : "bg-white dark:bg-gray-800"
                  } hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200`}
                >
                  <td className="px-6 py-4 text-sm dark:text-gray-200">{product.name}</td>
                  <td className="px-6 py-4 text-sm dark:text-gray-200">{product.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Rental Trend of Top 5 Products */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6 flex items-center">
            <FontAwesomeIcon icon={faChartLine} className="mr-3 text-yellow-500" />
            Tendencia de Renta de los Top 5 Productos
          </h2>
          <Chart options={trendChartOptions} series={trendChartSeries} type="line" height={350} />
        </div>

        {/* Rental Demand by Category */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6 flex items-center">
            <FontAwesomeIcon icon={faChartPie} className="mr-3 text-yellow-500" />
            Distribución de Renta por Categoría
          </h2>
          <Chart options={categoryChartOptions} series={categoryChartSeries} type="pie" height={350} />
        </div>

        {/* Heatmap of Rental Demand for Top 5 Products */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6 flex items-center">
            <FontAwesomeIcon icon={faFire} className="mr-3 text-yellow-500" />
            Mapa de Calor de Renta de los Top 5 Productos
          </h2>
          <Chart options={heatmapChartOptions} series={heatmapChartSeries} type="heatmap" height={350} />
        </div>
      </div>
    </div>
  );
};

export default ProductosDashboard;