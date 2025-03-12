import React, { useEffect, useState } from "react";
import { Plus, Edit, Trash, Search, Eye, X } from "lucide-react";
import { toast } from "react-toastify";
import api from "../../../utils/AxiosConfig";
import apiImagen from "../../../utils/AxiosImagen";
import { useAuth } from "../../../hooks/ContextAuth";
import { validateProduct } from "./ValidateProducts";
import TiltImage from "./Imagen3D";

function ProductTable() {
  const { csrfToken, user } = useAuth();
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [subcategorias, setSubcategorias] = useState([]);
  const [coloresObtenidos, setColoresObtenidos] = useState([]);
  const [bodegas, setBodegas] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [imagenesEliminar, setImagenesEliminar] = useState([]);
  const [uploadError, setUploadError] = useState("");
  const [nuevasImagenes, setNuevasImagenes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Para manejo de múltiples colores
  const [selectedColorsArray, setSelectedColorsArray] = useState([]);
  const [tempColor, setTempColor] = useState("");

  useEffect(() => {
    fetchProductos();
    fetchSubcategorias();
    fetchColors();
  }, []);

  // ===================== OBTENER PRODUCTOS =====================
  const fetchProductos = async () => {
    try {
      const response = await api.get("/api/productos/products", {
        withCredentials: true,
        headers: { "X-CSRF-Token": csrfToken },
      });
      const productosConImagenes = response.data.products.map((prod) => ({
        idProducto: prod.idProducto,
        nombre: prod.NombreProducto,
        detalles: prod.DetallesProducto,
        categoria: prod.NombreCategoria,
        color: prod.ColorProducto,
        material: prod.MaterialProducto,
        ImagenesProducto: prod.ImagenesProducto
          ? prod.ImagenesProducto.split(",").filter((img) => img !== "")
          : [],
        FechaCreacionProducto: prod.FechaCreacionProducto,
        NombreSubCategoria: prod.NombreSubCategoria,
        NombreUsuario: prod.NombreUsuario,
        EmailUsuario: prod.EmailUsuario,
        BodegasProducto: prod.BodegasProducto,
      }));
      setProducts(productosConImagenes);
      console.log("Obtenemos productos", productosConImagenes);
    } catch (error) {
      console.error("Error al obtener productos:", error);
      // toast.error("Error al cargar productos");
    }
  };

  // ===================== OBTENER SUBCATEGORÍAS =====================
  const fetchSubcategorias = async () => {
    try {
      const response = await api.get("/api/productos/subcategorias", {
        withCredentials: true,
        headers: { "X-CSRF-Token": csrfToken },
      });
      setSubcategorias(response.data.subcategories);
      console.log("Subcategorías ", response.data.subcategories);
    } catch (error) {
      console.error("Error al obtener subcategorías:", error);
      // toast.error("Error al cargar subcategorías");
    }
  };

  // ===================== OBTENER COLORES =====================
  const fetchColors = async () => {
    try {
      const response = await api.get("/api/productos/colores", {
        withCredentials: true,
        headers: { "X-CSRF-Token": csrfToken },
      });
      setColoresObtenidos(response.data.colores);
      console.log("Colores ", response.data.colores);
    } catch (error) {
      console.error("Error al obtener colores:", error);
      // toast.error("Error al cargar Colores");
    }
  };

  useEffect(() => {
    if (products.length || subcategorias.length || bodegas.length) {
      setLoading(false);
    }
  }, [products, subcategorias, bodegas]);

  // ===================== SUBIDA DE IMAGEN =====================
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const validatedFiles = [];

    for (let file of files) {
      if (
        ![
          "image/png",
          "image/jpeg",
          "image/jpg",
          "image/gif",
          "image/webp",
          "image/svg+xml",
        ].includes(file.type)
      ) {
        toast.error(
          `Formato de imagen inválido para ${file.name}. Usa PNG/JPG/GIF/WEBP/SVG.`
        );
        continue;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`La imagen ${file.name} excede 10MB.`);
        continue;
      }
      const duplicate = selectedProduct.ImagenesProducto.some((url) =>
        url.includes(file.name)
      );
      if (duplicate) {
        toast.error(`La imagen ${file.name} ya ha sido subida.`);
        continue;
      }
      const totalImagesCount =
        selectedProduct.ImagenesProducto.length + validatedFiles.length;
      if (totalImagesCount > 6) {
        toast.error("No puedes agregar más de 6 imágenes a un producto.");
        break;
      }
      validatedFiles.push(file);
    }

    if (validatedFiles.length === 0) return;

    subirImagen(validatedFiles);
  };

  const subirImagen = async (files) => {
    setIsUploading(true);
    setUploadProgress(0);
    setUploadStatus("Subiendo imagen: 0%");
    setUploadError("");

    const formData = new FormData();
    files.forEach((file) => formData.append("imagenes", file));

    try {
      const response = await apiImagen.post("/api/imagenes/upload-multiple", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          "X-CSRF-Token": csrfToken,
        },
        withCredentials: true,

        onUploadProgress: (progressEvent) => {
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percent);
          setUploadStatus(`Subiendo: ${percent}%`);
          console.log("Progreso de la subida de la imagen", percent);
        },
      });

      setUploadProgress(100);
      console.log("Progreso de la subida de la imagen", 100);
      setUploadStatus("Subiendo: 100% (procesando en servidor...)");
      const newUrls = response.data.urls;
      toast.success("Imágenes subidas correctamente");
      setNuevasImagenes((prev) => [...prev, ...newUrls]);
      console.log("Nuevas URLs obtenidas:", newUrls);
    } catch (error) {
      console.error("Error subiendo imagen:", error);

      if (error.code === "ECONNABORTED") {
        setUploadError(
          "La conexión está muy lenta o el servidor tardó demasiado. Verifica tu conexión e inténtalo de nuevo."
        );
      } else {
        setUploadError("Error al subir la imagen. Intenta nuevamente.");
      }
    } finally {
      setIsUploading(false);
      setUploadStatus("");
    }
  };

  // ================== ELIMINAR UNA IMAGEN DEL ESTADO ==================
  const handleDeleteImage = (url) => {
    if (!window.confirm("¿Deseas eliminar esta imagen?")) return;
    setImagenesEliminar((prev) => [...prev, url]);
    setSelectedProduct((prev) => ({
      ...prev,
      ImagenesProducto: prev.ImagenesProducto.filter((img) => img !== url),
    }));
  };

  // ===================== CAMBIO DE CAMPOS CON VALIDACIÓN =====================
  const handleChangeField = (field, value) => {
    setSelectedProduct((prev) => ({ ...prev, [field]: value }));
    const tempProduct = { ...selectedProduct, [field]: value };
    const allErrors = validateProduct(tempProduct);
    let newErrors = { ...formErrors, [field]: allErrors[field] || "" };
    if (!allErrors[field]) delete newErrors[field];
    setFormErrors(newErrors);
  };

  // ===================== ABRIR MODAL PARA AGREGAR =====================
  const handleOpenAddModal = () => {
    setSelectedProduct({
      idProducto: "",
      nombre: "",
      detalles: "",
      categoria: "",
      color: "",
      material: "",
      ImagenesProducto: [],
      foto: "",
      idSubcategoria: "",
    });
    setFormErrors({});
    setImagenesEliminar([]);
    setIsEditMode(true);
    setIsAddModalOpen(true);
    setIsModalOpen(true);
    setNuevasImagenes([]);

    // Inicializamos array de colores y el tempColor
    setSelectedColorsArray([]);
    setTempColor("");
  };

  // ===================== EDITAR =====================
  const handleEdit = (product) => {
    setSelectedProduct(product);
    setFormErrors({});
    setImagenesEliminar([]);
    setIsEditMode(true);
    setIsAddModalOpen(false);
    setIsModalOpen(true);
    setNuevasImagenes([]);

    // Si el producto ya tiene colores, los separamos por comas
    const existingColors = product.color
      ? product.color.split(",").map((c) => c.trim())
      : [];
    setSelectedColorsArray(existingColors);
    setTempColor("");
  };

  // ===================== VER DETALLES =====================
  const handleViewMore = (product) => {
    setSelectedProduct(product);
    setIsEditMode(false);
    setIsAddModalOpen(false);
    setIsModalOpen(true);
  };

  // ===================== ELIMINAR =====================
  const handleDelete = async (id) => {
    if (!window.confirm("¿Deseas eliminar este producto?")) return;
    try {
      const response = await api.delete(`/api/productos/products/delete/${id}`, {
        withCredentials: true,
        headers: { "X-CSRF-Token": csrfToken },
      });
      if (response.data.success) {
        setProducts((prev) => prev.filter((p) => p.idProducto !== id));
        handleCloseModal();
        toast.success("Producto eliminado correctamente");
      } else {
        toast.error(response.data.message || "Error al eliminar producto");
      }
    } catch (error) {
      console.error("Error al eliminar producto:", error);
      toast.error("Error interno al eliminar producto");
    }
  };

  // ===================== AGREGAR COLOR =====================
  const handleAddColor = () => {
    if (tempColor && !selectedColorsArray.includes(tempColor)) {
      const updatedArray = [...selectedColorsArray, tempColor];
      setSelectedColorsArray(updatedArray);

      // Actualizamos el color en selectedProduct directamente
      setSelectedProduct((prev) => ({
        ...prev,
        color: updatedArray.join(", "),
      }));

      // Limpiamos el select temporal
      setTempColor("");
    }
  };

  // ===================== REMOVER COLOR =====================
  const handleRemoveColor = (colorToRemove) => {
    // OJO: Se usa solo en modo Agregar
    // (no mostramos el botón en modo Editar para no permitir eliminar colores)
    const updatedArray = selectedColorsArray.filter((c) => c !== colorToRemove);
    setSelectedColorsArray(updatedArray);
    // Actualizamos el color en selectedProduct
    setSelectedProduct((prev) => ({
      ...prev,
      color: updatedArray.join(", "),
    }));
  };

  // ===================== GUARDAR CAMBIOS =====================
  const handleSave = async () => {
    // Recalcamos el total de imágenes (antiguas + nuevas)
    const totalImagesCount =
      selectedProduct.ImagenesProducto.length + nuevasImagenes.length;

    // Validación final antes de guardar
    const allErrors = validateProduct(selectedProduct, totalImagesCount);
    if (Object.keys(allErrors).length > 0) {
      setFormErrors(allErrors);
      toast.error("Corrige los errores antes de guardar");
      return;
    }

    const updateData = {
      ...selectedProduct,
      idUsuarios: user?.idUsuarios || null,
      imagenes: nuevasImagenes.length > 0 ? nuevasImagenes.join(",") : "",
      imagenesEliminar,
    };

    try {
      const response = await api.put(
        `/api/productos/products/${selectedProduct.idProducto}`,
        updateData,
        {
          headers: { "X-CSRF-Token": csrfToken },
          withCredentials: true,
        }
      );
      if (response.data.success) {
        toast.success("Producto actualizado correctamente");
        handleCloseModal();
        fetchProductos();
      } else {
        toast.error(response.data.message || "Error al actualizar producto");
      }
    } catch (error) {
      console.error("Error al actualizar producto:", error);
      toast.error("Error interno al actualizar producto");
    }
  };

  // ===================== AGREGAR NUEVO PRODUCTO =====================
  const handleAddProduct = async () => {
    const totalImagesCount =
      selectedProduct.ImagenesProducto.length + nuevasImagenes.length;

    const allErrors = validateProduct(selectedProduct, totalImagesCount);

    if (Object.keys(allErrors).length > 0) {
      setFormErrors(allErrors);
      toast.error("Corrige los errores antes de agregar");
      return;
    }

    if (isUploading) {
      toast.warning("Espera a que termine la subida de la imagen");
      return;
    }

    try {
      const newProductData = {
        nombre: selectedProduct.nombre,
        detalles: selectedProduct.detalles,
        idSubcategoria: selectedProduct.idSubcategoria,
        foto: selectedProduct.ImagenesProducto[0] || "",
        imagenes: [
          ...selectedProduct.ImagenesProducto,
          ...nuevasImagenes,
        ].join(","),
        color: selectedProduct.color, // Aquí ya viene como "Azul, Verde" etc.
        material: selectedProduct.material,
        idUsuarios: user?.idUsuarios || null,
      };

      const response = await api.post("/api/productos/products", newProductData, {
        withCredentials: true,
        headers: { "X-CSRF-Token": csrfToken },
      });

      if (response.data.success) {
        toast.success("Producto agregado con éxito");
        handleCloseModal();
        fetchProductos();
      } else {
        console.error("Error al insertar producto:", response.data.message);
        toast.error(response.data.message || "Error al insertar producto");
      }
    } catch (error) {
      console.error("Error al insertar producto:", error);
      if (error.response && error.response.data && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Error interno al insertar producto");
      }
    }
  };

  // ===================== CERRAR MODAL =====================
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsAddModalOpen(false);
    setIsEditMode(false);
    setSelectedProduct(null);
    setImagenesEliminar([]);
    setFormErrors({});
    setUploadProgress(0);
    setUploadStatus("");
    setIsUploading(false);
    setUploadError("");
    setNuevasImagenes([]);
    setSelectedColorsArray([]);
    setTempColor("");
  };

  // ===================== FILTRO DE PRODUCTOS =====================
  const filteredProducts = products.filter((p) => {
    const matchSearch = p.nombre
      ? p.nombre.toLowerCase().includes(search.toLowerCase())
      : false;
    const matchCategory = filterCategory ? p.categoria === filterCategory : true;
    return matchSearch && matchCategory;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-xl text-gray-700 dark:text-gray-200">
          Cargando...
        </p>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* ENCABEZADO */}
      <div className="mb-6">
        <div className="mt-4">
          <h2 className="text-center text-3xl font-bold text-gray-800">
            Productos
          </h2>
        </div>
        <br />
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* SELECT CATEGORIAS */}
          <div className="flex items-center w-full md:w-1/3">
            <select
              className="border px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 transition duration-300"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="">Todas las Categorías</option>
              {subcategorias.map((group) => (
                <option key={group.categoryName} value={group.categoryName}>
                  {group.categoryName}
                </option>
              ))}
            </select>
          </div>

          {/* BUSCADOR */}
          <div className="flex justify-center w-full md:w-1/3">
            <div className="relative w-full">
              <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar producto..."
                className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* BOTÓN AGREGAR */}
          <div className="flex justify-end w-full md:w-1/3">
            <button
              onClick={handleOpenAddModal}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition duration-300"
            >
              <Plus className="w-5 h-5" />
              Agregar Producto
            </button>
          </div>
        </div>
      </div>

      {/* GRID DE PRODUCTOS */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((product) => (
            <div
              key={product.idProducto}
              className="bg-white rounded-lg shadow-sm hover:shadow-md 
              transition-shadow duration-300 overflow-hidden 
              transform hover:scale-[1.02] transition-transform 
              duration-200 ease-in-out"
            >
              {/* IMAGEN PRINCIPAL */}
              {product.ImagenesProducto.length > 0 ? (
                <TiltImage
                  src={product.ImagenesProducto[0]}
                  alt={product.nombre}
                  className="h-40 w-full object-cover rounded-md"
                />
              ) : (
                <div className="h-40 bg-gray-300 flex items-center justify-center text-gray-500 rounded-md">
                  Sin imagen
                </div>
              )}

              {/* TÍTULO Y CATEGORÍA */}
              <div className="p-4 text-center">
                <h3 className="text-lg font-semibold text-gray-900 truncate max-w-[200px] mx-auto">
                  {product.nombre}
                </h3>
                <p className="text-xs text-gray-600 mt-1">
                  {product.categoria}
                </p>
              </div>

              {/* COLOR Y MATERIAL */}
              <div className="px-4 text-center text-gray-700">
                <p className="mb-1 text-sm">
                  <strong className="text-gray-800">Color:</strong>{" "}
                  {product.color}
                </p>
                <p className="mb-3 text-sm">
                  <strong className="text-gray-800">Material:</strong>{" "}
                  {product.material}
                </p>
              </div>

              {/* BOTONES */}
              <div className="flex justify-between items-center p-4 bg-gray-50">
                <button
                  onClick={() => handleViewMore(product)}
                  className="bg-blue-600 text-white px-3 py-1.5 rounded-md 
                    hover:bg-blue-700 transition-all duration-200 
                    ease-in-out flex items-center gap-1.5 
                    hover:gap-2 text-sm"
                >
                  <Eye className="w-4 h-4" /> Ver más
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(product)}
                    className="bg-yellow-500 text-white px-3 py-1.5 
                      rounded-md hover:bg-yellow-600 
                      transition-all duration-200 ease-in-out"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(product.idProducto)}
                    className="bg-red-600 text-white px-3 py-1.5 rounded-md 
                      hover:bg-red-700 transition-all duration-200 
                      ease-in-out"
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-16 h-16 text-yellow-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 7l9-4 9 4v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"
            />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 22V12h6v10" />
          </svg>
          <p className="mt-4 text-xl text-yellow-600 font-semibold">
            {search
              ? "Lo sentimos, no existe ningún producto con ese nombre."
              : "Lo sentimos, no se ha registrado ningún producto."}
          </p>
        </div>
      )}

      {/* MODAL: EDITAR O AGREGAR */}
      {isModalOpen && selectedProduct && isEditMode && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50 p-4">
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-8 rounded-xl shadow-2xl w-full max-w-lg transform transition-all duration-300 ease-out">
            <h3 className="text-3xl font-bold mb-6 text-gray-800">
              {isEditMode
                ? isAddModalOpen
                  ? "Agregar Producto"
                  : "Editar Producto"
                : "Detalles del Producto"}
            </h3>
            <div className="space-y-6 max-h-[60vh] overflow-auto pr-3">
              {/* NOMBRE */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Nombre:
                </label>
                {isEditMode ? (
                  <>
                    <input
                      type="text"
                      value={selectedProduct.nombre}
                      onChange={(e) => handleChangeField("nombre", e.target.value)}
                      className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      placeholder="Nombre del producto"
                    />
                    {formErrors.nombre && (
                      <p className="text-red-500 text-sm mt-1">
                        {formErrors.nombre}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="bg-gray-100 p-3 rounded-lg">
                    {selectedProduct.nombre}
                  </p>
                )}
              </div>

              {/* DETALLES */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Detalles:
                </label>
                {isEditMode ? (
                  <>
                    <textarea
                      value={selectedProduct.detalles}
                      onChange={(e) => handleChangeField("detalles", e.target.value)}
                      className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      rows={3}
                      maxLength={500}
                      placeholder="Descripción del producto"
                    />
                    <div className="text-right text-sm text-gray-500">
                      {`${selectedProduct.detalles?.length || 0}/500`}
                    </div>
                    {formErrors.detalles && (
                      <p className="text-red-500 text-sm mt-1">
                        {formErrors.detalles}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="bg-gray-100 p-3 rounded-lg">
                    {selectedProduct.detalles}
                  </p>
                )}
              </div>

              {/* SUBCATEGORÍA */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Subcategoría:
                </label>
                {isEditMode ? (
                  <>
                    <select
                      value={selectedProduct.idSubcategoria || ""}
                      onChange={(e) =>
                        handleChangeField("idSubcategoria", e.target.value)
                      }
                      className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    >
                      <option value="">-- Seleccionar Subcategoría --</option>
                      {subcategorias.map((group) => (
                        <optgroup
                          key={group.categoryName}
                          label={group.categoryName}
                        >
                          {group.subcats.map((subcat) => (
                            <option key={subcat.id} value={subcat.id}>
                              {subcat.label}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                    {formErrors.idSubcategoria && (
                      <p className="text-red-500 text-sm mt-1">
                        {formErrors.idSubcategoria}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="bg-gray-100 p-3 rounded-lg">
                    {selectedProduct.idSubcategoria}
                  </p>
                )}
              </div>

              {/* IMÁGENES */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Imágenes (máx. 6):
                </label>
                {isEditMode ? (
                  <>
                    {/* Mostrar imágenes actuales */}
                    <div className="grid grid-cols-3 gap-2">
                      {selectedProduct.ImagenesProducto.map((img, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={img}
                            alt={`Imagen ${index + 1}`}
                            className="w-full h-20 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 text-xs opacity-0 group-hover:opacity-100 transition"
                            onClick={() => handleDeleteImage(img)}
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      {/* Mostrar imágenes nuevas */}
                      {nuevasImagenes.map((img, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={img}
                            alt={`Nueva Imagen ${index + 1}`}
                            className="w-full h-20 object-cover rounded-lg border-2 border-yellow-500"
                          />
                          <button
                            type="button"
                            className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 text-xs opacity-0 group-hover:opacity-100 transition"
                            onClick={() => {
                              // Elimina la imagen nueva del estado
                              setNuevasImagenes((prev) =>
                                prev.filter((url) => url !== img)
                              );
                            }}
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <input
                      type="file"
                      name="imagenes"
                      accept="image/*"
                      multiple
                      onChange={handleFileChange}
                      disabled={
                        isUploading ||
                        selectedProduct.ImagenesProducto.length +
                          nuevasImagenes.length >=
                          6
                      }
                      className="mt-2 block w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                    {uploadError && (
                      <p className="text-red-500 text-sm mt-1">{uploadError}</p>
                    )}
                    {selectedProduct.ImagenesProducto.length +
                      nuevasImagenes.length >=
                      6 && (
                      <p className="text-red-500 text-sm">
                        Has alcanzado el máximo de 6 imágenes.
                      </p>
                    )}
                    {isUploading && (
                      <p className="text-blue-600 text-sm">{uploadStatus}</p>
                    )}
                  </>
                ) : (
                  // Modo lectura
                  <>
                    {selectedProduct.ImagenesProducto?.length > 0 ? (
                      <div className="grid grid-cols-3 gap-2">
                        {selectedProduct.ImagenesProducto.map((img, index) => (
                          <img
                            key={index}
                            src={img}
                            alt={`Imagen ${index + 1}`}
                            className="w-full h-20 object-cover rounded-lg"
                          />
                        ))}
                      </div>
                    ) : (
                      <p className="bg-gray-100 p-3 rounded-lg">
                        Sin imágenes
                      </p>
                    )}
                  </>
                )}
                {formErrors.ImagenesProducto && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.ImagenesProducto}
                  </p>
                )}
              </div>

              {/* COLOR Y MATERIAL */}
              <div className="grid grid-cols-2 gap-4">
                {/* =============== SECCIÓN COLOR (MULTI-SELECT) =============== */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Color:
                  </label>
                  {isEditMode ? (
                    <>
                      {/* Mostrar listado de colores seleccionados */}
                      <div className="flex flex-wrap gap-2 mb-2">
                        {selectedColorsArray.map((col) => (
                          <div
                            key={col}
                            className="bg-gray-200 rounded-full px-3 py-1 flex items-center gap-2"
                          >
                            <span className="text-gray-800 text-sm">{col}</span>

                            {/* Botón para eliminar color (solo se muestra cuando estamos agregando un producto) */}
                            {isAddModalOpen && (
                              <button
                                type="button"
                                className="text-red-600 hover:text-red-800"
                                onClick={() => handleRemoveColor(col)}
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Select de color + botón "+" */}
                      <div className="flex items-center gap-2">
                        <select
                          className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                          value={tempColor}
                          onChange={(e) => setTempColor(e.target.value)}
                        >
                          <option value="">-- Selecciona un color --</option>
                          {coloresObtenidos
                            .filter(
                              (c) => !selectedColorsArray.includes(c.color)
                            )
                            .map((colorItem) => (
                              <option
                                key={colorItem.idColores}
                                value={colorItem.color}
                              >
                                {colorItem.color}
                              </option>
                            ))}
                        </select>

                        <button
                          type="button"
                          onClick={handleAddColor}
                          className="bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition-all duration-200"
                          disabled={!tempColor}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Posibles errores de validación */}
                      {formErrors.color && (
                        <p className="text-red-500 text-sm mt-1">
                          {formErrors.color}
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="bg-gray-100 p-3 rounded-lg">
                      {selectedProduct.color}
                    </p>
                  )}
                </div>

                {/* MATERIAL */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Material:
                  </label>
                  {isEditMode ? (
                    <>
                      <input
                        type="text"
                        value={selectedProduct.material}
                        onChange={(e) => handleChangeField("material", e.target.value)}
                        className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        placeholder="Material del producto"
                      />
                      {formErrors.material && (
                        <p className="text-red-500 text-sm mt-1">
                          {formErrors.material}
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="bg-gray-100 p-3 rounded-lg">
                      {selectedProduct.material}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* BOTONES DEL MODAL */}
            <div className="flex justify-end gap-4 mt-8">
              <button
                onClick={() => setIsModalOpen(false)}
                disabled={isUploading}
                className={`px-6 py-2 rounded-lg transition-all duration-200 ${
                  isUploading
                    ? "bg-gray-300 text-white cursor-not-allowed"
                    : "bg-gray-300 hover:bg-gray-400"
                }`}
              >
                {isEditMode ? "Cancelar" : "Cerrar"}
              </button>
              {isEditMode && (
                <button
                  disabled={isUploading}
                  onClick={isAddModalOpen ? handleAddProduct : handleSave}
                  className={`px-6 py-2 rounded-lg text-white transition-all duration-200 ${
                    isUploading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {isAddModalOpen ? "Agregar" : "Guardar Cambios"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: DETALLES (SOLO VISTA) */}
      {isModalOpen && selectedProduct && !isEditMode && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50 p-4">
          <div
            className="relative bg-white w-full max-w-md mx-auto rounded-lg shadow-lg overflow-hidden 
              transition-transform duration-300 transform hover:-translate-y-1"
          >
            {/* Barra amarilla superior */}
            <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-4"></div>

            {/* Contenido principal */}
            <div className="p-6 space-y-4">
              {/* Título del producto */}
              <h3 className="text-2xl font-bold text-gray-800">
                {selectedProduct.nombre}
              </h3>

              {/* Carrusel / scroll horizontal de imágenes */}
              {selectedProduct.ImagenesProducto &&
              selectedProduct.ImagenesProducto.length > 0 ? (
                <div className="relative w-full overflow-x-auto flex gap-2 p-2 bg-gray-50 rounded shadow-inner snap-x snap-mandatory">
                  {selectedProduct.ImagenesProducto.map((img, index) => (
                    <div
                      key={index}
                      className="flex-shrink-0 w-56 h-56 snap-center hover:scale-105 transform transition-transform duration-300 ease-in-out"
                    >
                      <img
                        src={img}
                        alt={`Imagen ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center">
                  No hay imágenes disponibles
                </p>
              )}

              {/* Datos del producto */}
              <div className="text-sm text-gray-700 space-y-1">
                {selectedProduct.detalles && (
                  <p>
                    <strong>Detalles:</strong> {selectedProduct.detalles}
                  </p>
                )}
                <p>
                  <strong>Categoría:</strong> {selectedProduct.categoria}
                </p>
                <p>
                  <strong>Subcategoría:</strong>{" "}
                  {selectedProduct.NombreSubCategoria}
                </p>
                <p>
                  <strong>Color:</strong> {selectedProduct.color}
                </p>
                <p>
                  <strong>Material:</strong> {selectedProduct.material}
                </p>
                <p>
                  <strong>Bodega:</strong> {selectedProduct.BodegasProducto}
                </p>
                <p>
                  <strong>Creado por:</strong>{" "}
                  {selectedProduct.NombreUsuario}
                </p>
                <p>
                  <strong>Correo del creador:</strong>{" "}
                  {selectedProduct.EmailUsuario}
                </p>
                <p>
                  <strong>Fecha Creación:</strong>{" "}
                  {new Date(selectedProduct.FechaCreacionProducto).toLocaleDateString(
                    "es-ES",
                    {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    }
                  )}
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-4"></div>

            {/* Botón cerrar */}
            <button
              onClick={handleCloseModal}
              className="absolute top-2 right-2 text-gray-800 hover:text-red-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductTable;
