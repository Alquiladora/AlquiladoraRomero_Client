export function buildGroupedData(productosDisponibles) {
  const grouped = {};

  productosDisponibles.forEach((p) => {
    if (
      p.estado !== 'activo' ||
      !p.precioAlquiler ||
      parseFloat(p.precioAlquiler) <= 0
    )
      return;
    const catId = p.idcategoria;
    if (!grouped[catId]) {
      grouped[catId] = {
        idCategoria: catId,
        nombreCategoria: p.nombreCategoria,
        productos: {},
      };
    }

    const prodId = p.idProducto;
    if (!grouped[catId].productos[prodId]) {
      grouped[catId].productos[prodId] = {
        productId: prodId,
        productName: p.nombre,
        details: p.detalles,
        price: parseFloat(p.precioAlquiler),
        colorMap: {},
      };
    }

    const colorKey = p.color || 'Sin color';

    if (!grouped[catId].productos[prodId].colorMap[colorKey]) {
      grouped[catId].productos[prodId].colorMap[colorKey] = {
        idProductoColores: p.idProductoColores,
        stock: 0,
      };
    }

    // Sumamos el stock para ese color
    grouped[catId].productos[prodId].colorMap[colorKey].stock +=
      parseInt(p.stock, 10) || 0;
  });

  return Object.values(grouped).map((cat) => {
    const productosArray = Object.values(cat.productos).map((prod) => {
      const colorOptions = Object.entries(prod.colorMap).map(
        ([color, data]) => ({
          color,
          stock: data.stock,
          idProductoColores: data.idProductoColores,
        })
      );
      return {
        ...prod,
        colorOptions,
      };
    });

    return {
      ...cat,
      productos: productosArray,
    };
  });
}
