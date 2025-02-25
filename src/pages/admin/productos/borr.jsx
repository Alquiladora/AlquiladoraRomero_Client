import React, { useEffect, useState, useRef } from "react";
import { Plus, Edit, Trash, Search, Eye, Palette, X } from "lucide-react";
import api from "../../../utils/AxiosConfig";
import { useAuth } from "../../../hooks/ContextAuth";
import { validateProduct } from "./ValidateProducts";
import TiltImage from "./Imagen3D";

function ColorTagInput({ selectedProduct, setLocalColor, formErrors }) {
  const [tagInputValue, setTagInputValue] = useState("");
  const [colorTags, setColorTags] = useState([]);
  const inputRef = useRef(null);

  useEffect(() => {
    if (selectedProduct?.color) {
      const initialColors = selectedProduct.color
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean);
      setColorTags(initialColors);
    } else {
      setColorTags([]);
    }
    setTagInputValue("");
  }, [selectedProduct]);

  useEffect(() => {
    // Notificamos al padre los colores locales
    setLocalColor(colorTags);
  }, [colorTags, setLocalColor]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addColorTag();
    }
  };

  const addColorTag = () => {
    const newColor = tagInputValue.trim();
    if (newColor && !colorTags.includes(newColor)) {
      setColorTags([...colorTags, newColor]);
    }
    setTagInputValue("");
  };

  const removeColor = (color) => {
    setColorTags(colorTags.filter((c) => c !== color));
  };

  const handleContainerClick = () => {
    inputRef.current?.focus();
  };

  return (
    <div className="space-y-2">
      <div
        className="flex items-center flex-wrap gap-2 p-2 rounded-lg 
                   border border-gray-300 bg-white relative 
                   focus-within:ring-2 focus-within:ring-blue-500 
                   transition-all cursor-text"
        onClick={handleContainerClick}
      >
        <Palette className="text-gray-400 w-5 h-5 ml-1" />
        {/* Chips */}
        {colorTags.map((color) => (
          <div
            key={color}
            className="flex items-center bg-blue-100 text-blue-700 
                       px-2 py-1 rounded-full text-sm"
          >
            <span>{color}</span>
            <button
              type="button"
              className="ml-2 text-red-500 hover:text-red-700"
              onClick={() => removeColor(color)}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}

        {/* Input interno */}
        <input
          ref={inputRef}
          type="text"
          className="flex-1 min-w-[60px] border-none focus:outline-none 
                     text-sm placeholder-gray-400"
          placeholder={colorTags.length === 0 ? "Ej: Rojo, Azul, Verde" : ""}
          value={tagInputValue}
          onChange={(e) => setTagInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={addColorTag}
        />
      </div>

      <p className="text-xs text-gray-500">
        Agrega varios colores presionando <em>Enter</em> o <em>,</em>.
      </p>

      {formErrors.color && (
        <p className="text-red-500 text-sm mt-1">{formErrors.color}</p>
      )}
    </div>
  );
}

const ProductTable = () => {
  const { csrfToken, user } = useAuth();
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subcategorias, setSubcategorias] = useState([]);
  const [bodegas, setBodegas] = useState([]);

  // Subida de imagen
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // Errores
  const [formErrors, setFormErrors] = useState({});

  const [localColorTags, setLocalColorTags] = useState([]);

  useEffect(() => {
    fetchProductos();
    fetchSubcategorias();
    fetchBodegas();
  }, []);

  const fetchProductos = async () => {
    try {
      const response = await api.get("/api/productos/products", {
        withCredentials: true,
        headers: { "X-CSRF-Token": csrfToken },
      });
      setProducts(response.data.products);
      setLoading(false);
    } catch (error) {
      console.error("Error al obtener productos:", error);
      setLoading(false);
    }
  };

  const fetchBodegas = async () => {
    try {
      const response = await api.get("/api/productos/bodegas", {
        withCredentials: true,
        headers: { "X-CSRF-Token": csrfToken },
      });
      setBodegas(response.data.bodegas);
      setLoading(false);
    } catch (error) {
      console.error("Error al obtener bodegas:", error);
      setLoading(false);
    }
  };

  const fetchSubcategorias = async () => {
    try {
      const response = await api.get("/api/productos/subcategorias", {
        withCredentials: true,
        headers: { "X-CSRF-Token": csrfToken },
      });
      setSubcategorias(response.data.subcategories);
    } catch (error) {
      console.error("Error al obtener subcategorías:", error);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

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
      console.log("Formato de imagen inválido");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      console.log("El tamaño de la imagen debe ser menor a 2MB.");
      return;
    }

    handleImageChange(file);
  };

  const handleImageChange = async (file) => {
    const formData = new FormData();
    formData.append("imagen", file);

    setIsUploading(true);
    try {
      const response = await api.post("/api/imagenes/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          "X-CSRF-Token": csrfToken,
        },
        withCredentials: true,
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        },
      });
      const imageUrl = response.data.url;
      setSelectedProduct((prev) => ({ ...prev, foto: imageUrl }));
      setIsUploading(false);
    } catch (error) {
      console.error("Error al subir imagen:", error);
      setIsUploading(false);
    }
  };

  const handleViewMore = (product) => {
    setSelectedProduct(product);
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  const handleEdit = (product) => {
    setSelectedProduct(product);
    setIsEditMode(true);
    setIsModalOpen(true);
    setIsAddModalOpen(false);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
    setIsEditMode(false);
    setIsAddModalOpen(false);
    setFormErrors({});
  };

  const handleSave = () => {
    const finalColorString = localColorTags.join(", ");
    const updatedProd = { ...selectedProduct, color: finalColorString };

    const errors = validateProduct(updatedProd);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setProducts((prev) =>
      prev.map((p) =>
        p.idProducto === updatedProd.idProducto ? updatedProd : p
      )
    );

    handleCloseModal();
  };

  const handleDelete = (id) => {
    setProducts((prev) => prev.filter((p) => p.idProducto !== id));
  };

  const handleOpenAddModal = () => {
    setSelectedProduct({
      idProducto: products.length + 1,
      nombre: "",
      detalles: "",
      idSubcategoria: "",
      foto: "https://via.placeholder.com/150",
      color: "",
      material: "",
      fechaCreacion: new Date().toISOString().split("T")[0],
      fechaActualizacion: new Date().toISOString().split("T")[0],
      precio: "0.00",
      status: "Activo",
      idBodega: "",
    });
    setIsEditMode(true);
    setIsAddModalOpen(true);
    setIsModalOpen(true);
  };

  const handleAddProduct = async () => {
    const finalColorString = localColorTags.join(", ");
    const newProd = { ...selectedProduct, color: finalColorString };

    // Validar
    const errors = validateProduct(newProd);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      const response = await api.post("/api/productos/products", newProd, {
        withCredentials: true,
        headers: { "X-CSRF-Token": csrfToken },
      });

      if (response.data.success) {
        const nuevoProductoConID = {
          ...newProd,
          idProducto: response.data.idProducto,
        };
        setProducts((prev) => [...prev, nuevoProductoConID]);
        handleCloseModal();
      } else {
        console.error("Error al insertar producto:", response.data.message);
      }
    } catch (error) {
      console.error("Error al insertar producto:", error);
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.nombre
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesCategory = filterCategory
      ? product.categoria === filterCategory
      : true;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return <p className="p-4">Cargando...</p>;
  }

  return (
    <div className="p-4">
    
      <div className="mb-6">
        <div className="mt-4">
          <h2 className="text-center text-3xl font-bold text-gray-800">
            Productos
          </h2>
        </div>
        <br />
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
       
          <div className="flex items-center w-full md:w-1/3">
            <select
              className="border px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 
                         transition duration-300"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="">Todas las Categorías</option>
              <option value="Sillas de lujo">Sillas de lujo</option>
              <option value="Mesas de evento">Mesas de evento</option>
              <option value="Carpas">Carpas</option>
            </select>
          </div>

       
          <div className="flex justify-center w-full md:w-1/3">
            <div className="relative w-full">
              <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              <input
                type="text"
                className="pl-10 pr-3 py-2 w-full border border-gray-300 
                           rounded-lg focus:outline-none focus:ring-2 
                           focus:ring-blue-500 transition duration-300"
                placeholder="Buscar producto..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

         
          <div className="flex justify-end w-full md:w-1/3">
            <button
              onClick={handleOpenAddModal}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg 
                         flex items-center gap-2 hover:bg-blue-700 
                         transition duration-300"
            >
              <Plus className="w-5 h-5" /> Agregar Producto
            </button>
          </div>
        </div>
      </div>

   
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.map((product) => (
          <div
            key={product.idProducto}
            className="bg-white rounded-lg shadow-sm hover:shadow-md 
                       transition-shadow duration-300 overflow-hidden 
                       transform hover:scale-[1.02] transition-transform 
                       duration-200 ease-in-out"
          >
           
            <TiltImage
              src={product.foto}
              alt={product.nombre}
              className="h-28"
              options={{
                max: 25, 
                speed: 600, 
                glare: false, 
              }}
            />

            {/* NOMBRE Y CATEGORÍA */}
            <div className="p-4 text-center">
              <h3 className="text-lg font-semibold text-gray-900 truncate max-w-[200px] mx-auto">
                {product.nombre}
              </h3>
              <p className="text-xs text-gray-600 mt-1">{product.categoria}</p>
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

      {/* MODAL DE DETALLES/EDICIÓN */}
      {isModalOpen && selectedProduct && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50 p-4">
          <div
            className="bg-gradient-to-br from-gray-50 to-gray-100 p-8 
                       rounded-xl shadow-2xl w-full max-w-lg transform 
                       transition-all duration-300 ease-out"
          >
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
                      onChange={(e) =>
                        setSelectedProduct((prev) => ({
                          ...prev,
                          nombre: e.target.value,
                        }))
                      }
                      className="w-full border border-gray-300 px-4 py-2 
                                 rounded-lg focus:outline-none focus:ring-2 
                                 focus:ring-blue-500 focus:border-transparent 
                                 transition-all"
                    />
                    {formErrors.nombre && (
                      <p className="text-red-500 text-sm">
                        {formErrors.nombre}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-gray-700 bg-gray-100 p-3 rounded-lg">
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
                      onChange={(e) =>
                        setSelectedProduct((prev) => ({
                          ...prev,
                          detalles: e.target.value,
                        }))
                      }
                      className="w-full border border-gray-300 px-4 py-2 
                                 rounded-lg focus:outline-none focus:ring-2 
                                 focus:ring-blue-500 focus:border-transparent 
                                 transition-all"
                      rows={3}
                      maxLength={500}
                    />
                    <div className="text-right text-sm text-gray-500">
                      {`${selectedProduct.detalles.length || 0}/500`}
                    </div>
                    {formErrors.detalles && (
                      <p className="text-red-500 text-sm">
                        {formErrors.detalles}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-gray-700 bg-gray-100 p-3 rounded-lg">
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
                        setSelectedProduct((prev) => ({
                          ...prev,
                          idSubcategoria: parseInt(e.target.value) || null,
                        }))
                      }
                      className="w-full border border-gray-300 px-4 py-2 
                                 rounded-lg focus:outline-none focus:ring-2 
                                 focus:ring-blue-500 focus:border-transparent 
                                 transition-all"
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
                      <p className="text-red-500 text-sm">
                        {formErrors.idSubcategoria}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-gray-700 bg-gray-100 p-3 rounded-lg">
                    {selectedProduct.idSubcategoria}
                  </p>
                )}
              </div>

              {/* BODEGA */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Bodega:
                </label>
                {isEditMode ? (
                  <>
                    <select
                      value={selectedProduct.idBodega || ""}
                      onChange={(e) =>
                        setSelectedProduct((prev) => ({
                          ...prev,
                          idBodega: parseInt(e.target.value) || null,
                        }))
                      }
                      className="w-full border border-gray-300 px-4 py-2 
                                 rounded-lg focus:outline-none focus:ring-2 
                                 focus:ring-blue-500 focus:border-transparent 
                                 transition-all"
                    >
                      <option value="">-- Seleccionar Bodega --</option>
                      {bodegas.map((bodega) => (
                        <option key={bodega.idBodega} value={bodega.idBodega}>
                          {bodega.nombre}
                        </option>
                      ))}
                    </select>
                    {formErrors.idBodega && (
                      <p className="text-red-500 text-sm">
                        {formErrors.idBodega}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-gray-700 bg-gray-100 p-3 rounded-lg">
                    {selectedProduct.idBodega}
                  </p>
                )}
              </div>

              {/* FOTO */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Foto (1 sola):
                </label>
                {isEditMode ? (
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="w-full border border-gray-300 px-4 py-2 
                               rounded-lg focus:outline-none focus:ring-2 
                               focus:ring-blue-500 focus:border-transparent 
                               transition-all"
                  />
                ) : (
                  <img
                    src={selectedProduct.foto}
                    alt="Foto del producto"
                    className="w-20 h-20 object-cover rounded-lg shadow-sm"
                  />
                )}
              </div>

              {/* COLOR y MATERIAL */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Colores:
                  </label>
                  {isEditMode ? (
                    <ColorTagInput
                      selectedProduct={selectedProduct}
                      setLocalColor={(arr) => setLocalColorTags(arr)}
                      formErrors={formErrors}
                    />
                  ) : (
                    <p className="text-gray-700 bg-gray-100 p-3 rounded-lg">
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
                        onChange={(e) =>
                          setSelectedProduct((prev) => ({
                            ...prev,
                            material: e.target.value,
                          }))
                        }
                        className="w-full border border-gray-300 px-4 py-2 
                                   rounded-lg focus:outline-none focus:ring-2 
                                   focus:ring-blue-500 focus:border-transparent 
                                   transition-all"
                      />
                      {formErrors.material && (
                        <p className="text-red-500 text-sm">
                          {formErrors.material}
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="text-gray-700 bg-gray-100 p-3 rounded-lg">
                      {selectedProduct.material}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* BOTONES DE ACCIÓN */}
            <div className="flex justify-end gap-4 mt-8">
              <button
                onClick={handleCloseModal}
                className="bg-gray-300 px-6 py-2 rounded-lg 
                           hover:bg-gray-400 transition-all duration-200"
              >
                {isEditMode ? "Cancelar" : "Cerrar"}
              </button>
              {isEditMode && (
                <button
                  onClick={isAddModalOpen ? handleAddProduct : handleSave}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg 
                             hover:bg-blue-700 transition-all duration-200"
                >
                  {isAddModalOpen ? "Agregar" : "Guardar Cambios"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductTable;
