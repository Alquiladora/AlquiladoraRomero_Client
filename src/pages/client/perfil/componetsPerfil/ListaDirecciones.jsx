import React, { useState } from "react";

function ListaDirecciones() {
  // Lista de direcciones en el estado
  const [direcciones, setDirecciones] = useState([
    {
      id: 1,
      nombre: "Editberto",
      apellido: "Hernandez Ramirez",
      telefono: "7726585207",
      descripcion: "porque probablemente cerca de un pozo azul",
      direccionCompleta:
        "Parque de Poblamiento Solidaridad Huejutla de reyes Hidalgo México 43000",
      predeterminada: true,
    },
  ]);

  // Estados para controlar la apertura del modal y si es edición o nueva dirección
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  // Campos del formulario (coincidiendo con la estructura del modal)
  const [ubicacion, setUbicacion] = useState("México");
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [telefono, setTelefono] = useState("");
  const [calleNumero, setCalleNumero] = useState("");
  const [referencias, setReferencias] = useState("");
  const [codigoPostal, setCodigoPostal] = useState("");
  const [estado, setEstado] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [tipoCertificado, setTipoCertificado] = useState("");
  const [esPredeterminada, setEsPredeterminada] = useState(false);

  // Función para abrir el modal (nuevo o edición)
  const handleOpenModal = (direccionId = null) => {
    if (direccionId) {
      // Editar
      setIsEditing(true);
      setEditId(direccionId);
      // Cargar datos de la dirección a editar
      const dirToEdit = direcciones.find((dir) => dir.id === direccionId);
      if (dirToEdit) {
        setUbicacion("México"); // valor fijo como en la captura
        setNombre(dirToEdit.nombre);
        setApellido(dirToEdit.apellido);
        setTelefono(dirToEdit.telefono);
        setCalleNumero(""); // aquí podrías parsear la "calle y número" si lo guardas separado
        setReferencias(dirToEdit.descripcion);
        setCodigoPostal(""); // si lo guardas en la dirección, se podría parsear
        setEstado("");
        setCiudad("");
        setTipoCertificado("");
        setEsPredeterminada(dirToEdit.predeterminada);
      }
    } else {
      // Nuevo
      setIsEditing(false);
      setEditId(null);
      // Limpia campos
      setUbicacion("México");
      setNombre("");
      setApellido("");
      setTelefono("");
      setCalleNumero("");
      setReferencias("");
      setCodigoPostal("");
      setEstado("");
      setCiudad("");
      setTipoCertificado("");
      setEsPredeterminada(false);
    }
    setShowModal(true);
  };

  // Función para cerrar el modal
  const handleCloseModal = () => {
    setShowModal(false);
  };

  // Guardar cambios (crear o editar)
  const handleSave = (e) => {
    e.preventDefault();

    if (isEditing) {
      // Actualizar dirección existente
      setDirecciones((prev) =>
        prev.map((dir) =>
          dir.id === editId
            ? {
                ...dir,
                nombre,
                apellido,
                telefono,
                descripcion: referencias,
                // Actualiza la dirección completa según tus campos
                direccionCompleta: `${calleNumero}, ${estado}, ${ciudad}, CP: ${codigoPostal}`,
                predeterminada: esPredeterminada,
              }
            : dir
        )
      );
    } else {
      // Crear nueva dirección
      const nuevaDireccion = {
        id: Date.now(),
        nombre,
        apellido,
        telefono,
        descripcion: referencias,
        direccionCompleta: `${calleNumero}, ${estado}, ${ciudad}, CP: ${codigoPostal}`,
        predeterminada: esPredeterminada,
      };
      setDirecciones((prev) => [...prev, nuevaDireccion]);
    }

    // Cerrar modal
    handleCloseModal();
  };

  // Eliminar dirección
  const handleDelete = (id) => {
    const confirmDelete = window.confirm("¿Deseas eliminar esta dirección?");
    if (confirmDelete) {
      setDirecciones(direcciones.filter((dir) => dir.id !== id));
    }
  };

  // Marcar como predeterminada (opcional si quieres botón directo)
  const handleSetPredeterminada = (id) => {
    setDirecciones((prev) =>
      prev.map((dir) => ({
        ...dir,
        predeterminada: dir.id === id, // Solo una puede ser predeterminada
      }))
    );
  };

  return (
    <div className="">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
          MI LIBRETA DE DIRECCIONES
        </h1>

        {/* Botón para añadir dirección nueva */}
        <button
          onClick={() => handleOpenModal(null)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded shadow hover:bg-blue-700 transition-all"
        >
          + AÑADIR DIRECCIÓN NUEVA
        </button>

        {/* Lista de direcciones */}
        <div className="mt-6 space-y-4">
          {direcciones.map((dir) => (
            <div
              key={dir.id}
              className="border border-gray-200 rounded-md p-4 relative shadow-sm bg-white dark:bg-gray-700 dark:border-gray-600"
            >
              {/* Nombre y teléfono */}
              <div className="text-lg font-semibold text-gray-700 dark:text-gray-100 mb-1">
                {dir.nombre} {dir.apellido} {dir.telefono && ` ${dir.telefono}`}
              </div>
              {/* Descripción / referencia adicional */}
              {dir.descripcion && (
                <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                  {dir.descripcion}
                </div>
              )}
              {/* Dirección completa */}
              <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                {dir.direccionCompleta}
              </div>
              {/* Botones */}
              <div className="flex items-center space-x-2 text-sm">
                {dir.predeterminada && (
                  <span className="border border-green-500 text-green-500 px-2 py-1 rounded-full">
                    Dirección Predeterminada
                  </span>
                )}
                <button
                  onClick={() => handleDelete(dir.id)}
                  className="text-red-500 hover:underline"
                >
                  Borrar
                </button>
                <button
                  onClick={() => handleOpenModal(dir.id)}
                  className="text-blue-500 hover:underline"
                >
                  Editar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 w-full max-w-lg rounded shadow-lg p-6 relative">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
              Dirección de envío
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              {/* Ubicación */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Ubicación
                </label>
                <input
                  type="text"
                  value={ubicacion}
                  onChange={(e) => setUbicacion(e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              {/* Nombre y Apellido */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Nombre*
                  </label>
                  <input
                    type="text"
                    placeholder="Tal cual figure en el IFE"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    required
                    className="mt-1 block w-full border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Apellido*
                  </label>
                  <input
                    type="text"
                    value={apellido}
                    onChange={(e) => setApellido(e.target.value)}
                    required
                    className="mt-1 block w-full border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
              </div>

              {/* Teléfono */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Número de Teléfono
                </label>
                <div className="flex items-center space-x-2">
                  <span className="px-3 py-2 bg-gray-100 border border-gray-300 text-gray-700 dark:bg-gray-600 dark:text-white dark:border-gray-500">
                    MX +52
                  </span>
                  <input
                    type="text"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    className="flex-1 border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
              </div>

              {/* Dirección (Calle y número) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Dirección
                </label>
                <input
                  type="text"
                  placeholder="Calle y Número (ejm: Jose Vasconcelos 105)"
                  value={calleNumero}
                  onChange={(e) => setCalleNumero(e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              {/* Referencias */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Referencias
                </label>
                <input
                  type="text"
                  placeholder="Appartement, suite, etc. (opcional)"
                  value={referencias}
                  onChange={(e) => setReferencias(e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              {/* Código Postal */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Código postal
                </label>
                <input
                  type="text"
                  placeholder="ejm: 12345"
                  value={codigoPostal}
                  onChange={(e) => setCodigoPostal(e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              {/* Estado/Provincia y Ciudad */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Estado/Provincia
                  </label>
                  <input
                    type="text"
                    placeholder="Selecciona Estado/Provincia"
                    value={estado}
                    onChange={(e) => setEstado(e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Ciudad
                  </label>
                  <input
                    type="text"
                    placeholder="Por favor elige su ciudad"
                    value={ciudad}
                    onChange={(e) => setCiudad(e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
              </div>

              {/* Tipo de certificado */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Tipo de certificado
                </label>
                <input
                  type="text"
                  value={tipoCertificado}
                  onChange={(e) => setTipoCertificado(e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              {/* Hacer predeterminado */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={esPredeterminada}
                  onChange={(e) => setEsPredeterminada(e.target.checked)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label className="text-sm text-gray-700 dark:text-gray-300">
                  Hacer predeterminado
                </label>
              </div>

              {/* Botones de acción */}
              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 transition dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
                >
                  Guardar
                </button>
              </div>

              {/* Seguridad y privacidad (enlace o texto de ejemplo) */}
              <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                <a href="#" className="underline hover:text-blue-600">
                  Seguridad y privacidad
                </a>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ListaDirecciones;
