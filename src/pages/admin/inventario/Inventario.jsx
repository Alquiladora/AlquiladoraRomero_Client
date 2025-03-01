import React, { useState } from "react";

const Inventory = () => {
  const [inventoryData, setInventoryData] = useState([
    {
      idProducto: 32,
      idBodega: 58,
      stockReal: 1,
      stock: 0,
      stockReservado: 0,
      estado: "active",
      notas: "Registro inicial",
      fechaRegistro: "2025-02-25 12:28:17",
    },
    // Agrega más datos según sea necesario
  ]);

  const handleChange = (idProducto, field, value) => {
    setInventoryData((prevData) =>
      prevData.map((item) =>
        item.idProducto === idProducto ? { ...item, [field]: value } : item
      )
    );
  };

  return (
    <div className="p-4 space-y-8">
      {/* Sección: Inventario General */}
      <section className="space-y-4">
        <h2 className="text-3xl font-bold text-center text-yellow-600">
          Inventario General
        </h2>

        {/* Tabla de Inventario General */}
        <div className="overflow-x-auto shadow-lg border border-gray-200 rounded-lg">
          <table className="min-w-full bg-white">
            <thead className="bg-yellow-100">
              <tr>
                <th className="py-3 px-4 border-b text-left font-semibold">ID Producto</th>
                <th className="py-3 px-4 border-b text-left font-semibold">ID Bodega</th>
                <th className="py-3 px-4 border-b text-left font-semibold">Stock Real</th>
                <th className="py-3 px-4 border-b text-left font-semibold">Stock</th>
                <th className="py-3 px-4 border-b text-left font-semibold">Stock Reservado</th>
                <th className="py-3 px-4 border-b text-left font-semibold">Estado</th>
                <th className="py-3 px-4 border-b text-left font-semibold">Notas</th>
                <th className="py-3 px-4 border-b text-left font-semibold">Fecha de Registro</th>
              </tr>
            </thead>
            <tbody>
              {inventoryData.map((item) => (
                <tr key={item.idProducto} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b">{item.idProducto}</td>
                  <td className="py-2 px-4 border-b">{item.idBodega}</td>
                  <td className="py-2 px-4 border-b">{item.stockReal}</td>
                  <td className="py-2 px-4 border-b">{item.stock}</td>
                  <td className="py-2 px-4 border-b">{item.stockReservado}</td>
                  <td className="py-2 px-4 border-b">
                    <select
                      value={item.estado}
                      onChange={(e) =>
                        handleChange(item.idProducto, "estado", e.target.value)
                      }
                      className={`p-1 rounded ${
                        item.estado === "active"
                          ? "bg-green-200 text-green-800"
                          : "bg-red-200 text-red-800"
                      }`}
                    >
                      <option value="active">Activo</option>
                      <option value="inactive">Inactivo</option>
                    </select>
                  </td>
                  <td className="py-2 px-4 border-b">
                    <input
                      type="text"
                      value={item.notas}
                      onChange={(e) =>
                        handleChange(item.idProducto, "notas", e.target.value)
                      }
                      className="p-1 border rounded w-full"
                    />
                  </td>
                  <td className="py-2 px-4 border-b">{item.fechaRegistro}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Sección: Inventario por Bodega */}
      <section className="space-y-4">
  <h2 className="text-3xl font-bold text-center text-yellow-600">
    Inventario por Bodega
  </h2>

  {/* Layout de cuadrícula responsiva */}
  <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
    {[58, 59, 60].map((bodegaId) => (
      <div
        key={bodegaId}
        className="bg-white border border-gray-200 p-4 rounded-lg shadow-md"
      >
        <h3 className="text-xl font-semibold text-yellow-700 mb-2">
          Bodega {bodegaId}
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-yellow-50">
              <tr>
                <th className="py-2 px-4 border-b text-left font-semibold">
                  ID Producto
                </th>
                <th className="py-2 px-4 border-b text-left font-semibold">
                  Stock Real
                </th>
                <th className="py-2 px-4 border-b text-left font-semibold">
                  Stock
                </th>
                <th className="py-2 px-4 border-b text-left font-semibold">
                  Stock Reservado
                </th>
                <th className="py-2 px-4 border-b text-left font-semibold">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody>
              {inventoryData
                .filter((item) => item.idBodega === bodegaId)
                .map((item) => (
                  <tr key={item.idProducto} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b">{item.idProducto}</td>
                    <td className="py-2 px-4 border-b">{item.stockReal}</td>
                    <td className="py-2 px-4 border-b">{item.stock}</td>
                    <td className="py-2 px-4 border-b">{item.stockReservado}</td>
                    <td className="py-2 px-4 border-b">
                      <span
                        className={`p-1 rounded ${
                          item.estado === "active"
                            ? "bg-green-200 text-green-800"
                            : "bg-red-200 text-red-800"
                        }`}
                      >
                        {item.estado === "active" ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    ))}
  </div>
</section>


    </div>
  );
};

export default Inventory;
