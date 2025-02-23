import React, { useEffect, useState, useContext } from "react";
import { Plus, Edit, Trash, Search, Eye } from "lucide-react";
import api from "../../../utils/AxiosConfig";
import { useAuth } from "../../../hooks/ContextAuth";

const ProductTable = () => {
 const { csrfToken, user } = useAuth();
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true);
    const [subcategorias, setSubcategorias]=useState([]);
    const [bodegas, setBodegas]= useState([]);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(null);

   useEffect(() => {
     fetchProductos();
     fetchSubcategorias();
     fetchBodegas();
   }, []);

   const fetchProductos = async () => {
    try {
      const response = await api.get(
        "/api/productos/products",
        {
          withCredentials: true,
          headers: { "X-CSRF-Token": csrfToken },
        }
      );
      console.log("datos obtenidos de los productos", response.data.products)
      setProducts(response.data.products);
      setLoading(false);
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
      setLoading(false);
    }
  };

  const fetchBodegas = async () => {
    try {
      const response = await api.get(
        "/api/productos/bodegas",
        {
          withCredentials: true,
          headers: { "X-CSRF-Token": csrfToken },
        }
      );
      console.log("datos obtenidos de los bodegas", response.data.bodegas)
      setBodegas(response.data.bodegas);
      setLoading(false);
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
      setLoading(false);
    }
  };

  const fetchSubcategorias = async () => {
    try {
      const response = await api.get("/api/productos/subcategorias", {
        withCredentials: true,
        headers: { "X-CSRF-Token": csrfToken }
      });
      
    
      console.log("Datos de subcategorías:", response.data);
      setSubcategorias(response.data.subcategories); 
    } catch (error) {
      console.error("Error al obtener subcategorías:", error);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];  
  
    if (
      !["image/png", "image/jpeg", "image/jpg", "image/gif", "image/webp", "image/svg+xml"].includes(file.type)
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
          "X-CSRF-Token": csrfToken
        },
        withCredentials: true,
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });
      const imageUrl = response.data.url;
      console.log("URL de la imagen subida:", imageUrl);
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
  };

  // Cierra el modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
    setIsEditMode(false);
    setIsAddModalOpen(false);
  };

  // Guarda los cambios realizados al editar
  const handleSave = () => {
    setProducts((prev) =>
      prev.map((p) =>
        p.idProducto === selectedProduct.idProducto ? selectedProduct : p
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
      categoria: "",
      foto: "https://via.placeholder.com/150",
      color: "",
      material: "",
      fechaCreacion: new Date().toISOString().split("T")[0],
      fechaActualizacion: new Date().toISOString().split("T")[0],
      precio: "0.00",
      status: "Activo",
    });
    setIsEditMode(true);
    setIsAddModalOpen(true);
    setIsModalOpen(true);
  };

  // Agrega el nuevo producto (puedes reemplazar por lógica de backend)
  const handleAddProduct = async() => {
    try{
        const newProductData = {
            nombre: selectedProduct.nombre,
            detalles: selectedProduct.detalles,
            idSubcategoria: selectedProduct.idSubcategoria,
            foto: selectedProduct.foto,
            color: selectedProduct.color,
            material: selectedProduct.material,
            idBodega: selectedProduct.idBodega,
            idUsuarios: user.idUsuarios
          };
          const response = await api.post("/api/productos/products", newProductData, {
            withCredentials: true,
            headers: { "X-CSRF-Token": csrfToken }
          });
          if (response.data.success) {
            console.log("Producto agregado con éxito:", response.data);
            const nuevoProductoConID = {
                ...selectedProduct,
                idProducto: response.data.idProducto
              };
              setProducts((prev) => [...prev, nuevoProductoConID]);

              setIsAddModalOpen(false);
              setIsModalOpen(false);
              setSelectedProduct(null);
              setIsEditMode(false);
            } else {
                console.error("Error al insertar producto:", response.data.message);
               
              }

    }catch(error){

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



  

  return (
    <div className="p-4">
      <div className="mb-6">
        <div className="mt-4">
          <h2 className="text-center text-3xl font-bold text-gray-800">
            Productos
          </h2>
        </div>
        <br></br>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Búsqueda a la izquierda */}
          <div className="flex items-center w-full md:w-1/3">
            <select
              className="border px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 transition duration-300"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="">Todas las Categorías</option>
              <option value="Sillas de lujo">Sillas de lujo</option>
              <option value="Mesas de evento">Mesas de evento</option>
              <option value="Carpas">Carpas</option>
            </select>
          </div>

          {/* Filtro de categorías al centro */}
          <div className="flex justify-center w-full md:w-1/3">
            <div className="relative w-full">
              <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              <input
                type="text"
                className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
                placeholder="Buscar producto..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Botón Agregar a la derecha */}
          <div className="flex justify-end w-full md:w-1/3">
            <button
              onClick={handleOpenAddModal}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition duration-300"
            >
              <Plus className="w-5 h-5" /> Agregar Producto
            </button>
          </div>
        </div>
      </div>

      {/* Lista de productos en formato de tarjetas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.map((product, index) => (
          <div
            key={product.idProducto}
            className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden transform hover:scale-[1.02] transition-transform duration-200 ease-in-out"
          >
            <div className="flex flex-col items-center p-4">
              <img
                src={product.foto}
                alt={product.nombre}
                className="w-16 h-16 rounded-md object-cover mb-3"
              />
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 truncate max-w-[150px] mx-auto">
                  {product.nombre}
                </h3>
                <p className="text-xs text-gray-600 mt-1">
                  {product.categoria}
                </p>
              </div>
            </div>
            <div className="px-4 pb-4 text-center text-gray-700">
              <p className="mb-1 text-sm">
                <strong className="text-gray-800">Color:</strong>{" "}
                {product.color}
              </p>
              <p className="text-sm">
                <strong className="text-gray-800">Material:</strong>{" "}
                {product.material}
              </p>
            </div>
            <div className="flex justify-between items-center p-4 bg-gray-50">
              <button
                onClick={() => handleViewMore(product)}
                className="bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 transition-all duration-200 ease-in-out flex items-center gap-1.5 hover:gap-2 text-sm"
              >
                <Eye className="w-4 h-4" /> Ver más
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(product)}
                  className="bg-yellow-500 text-white px-3 py-1.5 rounded-md hover:bg-yellow-600 transition-all duration-200 ease-in-out"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(product.idProducto)}
                  className="bg-red-600 text-white px-3 py-1.5 rounded-md hover:bg-red-700 transition-all duration-200 ease-in-out"
                >
                  <Trash className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal para Ver/Editar/Agregar producto */}
        {/* Modal (Ver/Editar/Agregar) */}
        {isModalOpen && selectedProduct && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg transform transition-all duration-300">
            <h3 className="text-2xl font-semibold mb-4">
              {isEditMode
                ? isAddModalOpen
                  ? "Agregar Producto"
                  : "Editar Producto"
                : "Detalles del Producto"}
            </h3>

            <div className="space-y-4 max-h-[60vh] overflow-auto pr-2">
              {/* Nombre */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Nombre:</label>
                {isEditMode ? (
                  <input
                    type="text"
                    value={selectedProduct.nombre}
                    onChange={(e) =>
                      setSelectedProduct({ ...selectedProduct, nombre: e.target.value })
                    }
                    className="w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-700">{selectedProduct.nombre}</p>
                )}
              </div>

              {/* Detalles */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Detalles:</label>
                {isEditMode ? (
                  <textarea
                    value={selectedProduct.detalles}
                    onChange={(e) =>
                      setSelectedProduct({ ...selectedProduct, detalles: e.target.value })
                    }
                    className="w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                ) : (
                  <p className="text-gray-700">{selectedProduct.detalles}</p>
                )}
              </div>

              {/* Subcategoría (Select con optgroup) */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Subcategoría:</label>
                {isEditMode ? (
               <select
               value={selectedProduct.idSubcategoria || ""}
               onChange={(e) =>
                 setSelectedProduct({
                   ...selectedProduct,
                   idSubcategoria: parseInt(e.target.value) || null
                 })
               }
             >
               <option value="">-- Seleccionar Subcategoría --</option>
               {subcategorias.map((group) => (
                 <optgroup key={group.categoryName} label={group.categoryName}>
                   {group.subcats.map((subcat) => (
                     <option key={subcat.id} value={subcat.id}>
                       {subcat.label}
                     </option>
                   ))}
                 </optgroup>
               ))}
             </select>
             
                ) : (
                  <p className="text-gray-700">{selectedProduct.idSubcategoria}</p>
                )}
              </div>

            
              <div>
                <label className="block text-sm font-medium text-gray-700">Bodega:</label>
                {isEditMode ? (
                  <select
                    value={selectedProduct.idBodega || ""}
                    onChange={(e) =>
                      setSelectedProduct({
                        ...selectedProduct,
                        idBodega: parseInt(e.target.value) || null
                      })
                    }
                    className="w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Seleccionar Bodega --</option>
                    {bodegas.map((bodega) => (
                      <option key={bodega.idBodega} value={bodega.idBodega}>
                        {bodega.nombre}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-gray-700">{selectedProduct.idBodega}</p>
                )}
              </div>

              {/* Foto (Archivo) */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Foto:</label>
                {isEditMode ? (
                 <input
                 type="file"
                 onChange={handleFileChange}
                 className="w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
               />
                ) : (
                  <img
                    src={selectedProduct.foto}
                    alt="Foto del producto"
                    className="w-16 h-16 object-cover rounded-md"
                  />
                )}
              </div>

              {/* Color */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Color:</label>
                {isEditMode ? (
                  <input
                    type="text"
                    value={selectedProduct.color}
                    onChange={(e) =>
                      setSelectedProduct({ ...selectedProduct, color: e.target.value })
                    }
                    className="w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-700">{selectedProduct.color}</p>
                )}
              </div>

              {/* Material */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Material:</label>
                {isEditMode ? (
                  <input
                    type="text"
                    value={selectedProduct.material}
                    onChange={(e) =>
                      setSelectedProduct({ ...selectedProduct, material: e.target.value })
                    }
                    className="w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-700">{selectedProduct.material}</p>
                )}
              </div>

             
            </div>

           
            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={handleCloseModal}
                className="bg-gray-300 px-4 py-2 rounded-md hover:bg-gray-400 transition"
              >
                {isEditMode ? "Cancelar" : "Cerrar"}
              </button>
              {isEditMode && (
                <button
                  onClick={isAddModalOpen ? handleAddProduct : handleSave}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
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
