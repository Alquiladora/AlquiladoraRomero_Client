import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faAddressCard,
  faLocationArrow,
  faHome,
  faClipboardCheck,
  faSpinner,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";

const DATOS_CLIENTE_SIMULADO = {
  email: "cliente@ejemplo.com",
  nombre: "Carlos",
  apellido: "Rodríguez",
  telefono: "1234567890",
  direcciones: [
    {
      idDir: 1,
      alias: "Casa Principal",
      calle: "Avenida Principal #789",
      cp: "43000",
      estado: "Hidalgo",
      municipio: "Huejutla de Reyes",
      localidad: "Huejutla Centro",
    },
    {
      idDir: 2,
      alias: "Oficina",
      calle: "Calle Secundaria #101",
      cp: "43010",
      estado: "Hidalgo",
      municipio: "Huejutla de Reyes",
      localidad: "Colonia Industrial",
    },
  ],
};

function WizardAlquiler() {
  const [unitsToRent, setUnitsToRent] = useState("");
  const [showWizard, setShowWizard] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  // --------------------------------------------
  // Estados del formulario (Paso 1)
  // --------------------------------------------
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [telefono, setTelefono] = useState("");
  const [correo, setCorreo] = useState("");

  // --------------------------------------------
  // Manejo de verificación cliente
  // --------------------------------------------
  const [showSubmodalCorreo, setShowSubmodalCorreo] = useState(false);
  const [emailParaVerificar, setEmailParaVerificar] = useState("");
  const [cargandoVerificacion, setCargandoVerificacion] = useState(false);
  const [esClienteExistente, setEsClienteExistente] = useState(false);

  // --------------------------------------------
  // Si es cliente, mostramos direcciones “del servidor”
  // --------------------------------------------
  const [direccionesCliente, setDireccionesCliente] = useState([]);
  const [selectedDireccionId, setSelectedDireccionId] = useState(null);

  // --------------------------------------------
  // Datos de ubicación (si NO es cliente)
  // --------------------------------------------
  const [codigoPostal, setCodigoPostal] = useState("");
  const [direccion, setDireccion] = useState("");


  const [estadosData, setEstadosData] = useState([]);
  const [municipiosData, setMunicipiosData] = useState([]);
  const [localidadesData, setLocalidadesData] = useState([]);

  const [pais, setPais] = useState("");
  const [estado, setEstado] = useState("");
  const [municipio, setMunicipio] = useState("");
  const [localidad, setLocalidad] = useState("");

 
  const [localidadesDisponibles, setLocalidadesDisponibles] = useState([]);

 
  const [cargandoCP, setCargandoCP] = useState(false);
  const [cpValido, setCpValido] = useState(false);


  const [modoLocalidad, setModoLocalidad] = useState("seleccionar");

 
  const [producto, setProducto] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaEntrega, setFechaEntrega] = useState("");
  const [horaAlquiler, setHoraAlquiler] = useState("");

 
  const [stock, setStock] = useState("");
  const [precio, setPrecio] = useState("");
  const [subPrecio, setSubPrecio] = useState("");
  const [formaPago, setFormaPago] = useState("");
  const [detallesPago, setDetallesPago] = useState("");


  const [productosAdicionales, setProductosAdicionales] = useState([]);


  useEffect(() => {
    setCpValido(false);
    setPais("");
    setEstado("");
    setMunicipio("");
    setLocalidad("");
    setLocalidadesDisponibles([]);
  }, [codigoPostal]);

  
  const handleAbrirWizard = () => {
    resetCampos();
    setShowWizard(true);
  };
  const handleCerrarWizard = () => {
    setShowWizard(false);
  };


  const resetCampos = () => {
    setCurrentStep(1);
    setNombre("");
    setApellido("");
    setTelefono("");
    setCorreo("");
    setEsClienteExistente(false);
    setDireccionesCliente([]);
    setSelectedDireccionId(null);
    setCodigoPostal("");
    setDireccion("");
    setPais("");
    setEstado("");
    setMunicipio("");
    setLocalidad("");
    setLocalidadesDisponibles([]);
    setProducto("");
    setFechaInicio("");
    setFechaEntrega("");
    setHoraAlquiler("");
    setCargandoCP(false);
    setCpValido(false);
    setModoLocalidad("seleccionar");

    // También reseteamos los arrays únicos
    setEstadosData([]);
    setMunicipiosData([]);
    setLocalidadesData([]);

    // Reseteamos los campos extras
    setStock("");
    setPrecio("");
    setSubPrecio("");
    setFormaPago("");
    setDetallesPago("");


    setProductosAdicionales([]);
  };


  const handleAbrirSubmodalCorreo = () => {
    setEmailParaVerificar("");
    setShowSubmodalCorreo(true);
  };
  const handleCerrarSubmodalCorreo = () => {
    setShowSubmodalCorreo(false);
  };

  const handleVerificarCorreo = () => {
    setCargandoVerificacion(true);
    setTimeout(() => {
      if (emailParaVerificar.trim().toLowerCase() === DATOS_CLIENTE_SIMULADO.email) {
        setEsClienteExistente(true);
        setNombre(DATOS_CLIENTE_SIMULADO.nombre);
        setApellido(DATOS_CLIENTE_SIMULADO.apellido);
        setTelefono(DATOS_CLIENTE_SIMULADO.telefono);
        setCorreo(DATOS_CLIENTE_SIMULADO.email);
        setDireccionesCliente(DATOS_CLIENTE_SIMULADO.direcciones);
        toast.success("¡Datos de cliente cargados!");
        setShowSubmodalCorreo(false);
      } else {
        toast.error("Correo no encontrado en la base simulada.");
      }
      setCargandoVerificacion(false);
    }, 1000);
  };

  // --------------------------------------------
  // Validar Código Postal
  // --------------------------------------------
  const handleValidarCP = async () => {
    try {
      setCargandoCP(true);
      const url = `https://sepomex.icalialabs.com/api/v1/zip_codes?zip_code=${codigoPostal}&per_page=100`;
      const response = await axios.get(url);

      if (
        response.data &&
        response.data.zip_codes &&
        response.data.zip_codes.length > 0
      ) {
        // Construye los arrays únicos
        const uniqueEstados = [
          ...new Set(response.data.zip_codes.map((item) => item.d_estado)),
        ];
        const uniqueMunicipios = [
          ...new Set(response.data.zip_codes.map((item) => item.d_mnpio)),
        ];
        const uniqueLocalidades = [
          ...new Set(response.data.zip_codes.map((item) => item.d_asenta)),
        ];

        setCpValido(true);
        setPais("México");

        // debug
        console.log("Datos del endpoint de código postal:", uniqueLocalidades);

        // Escoge el primero si deseas
        setEstado(uniqueEstados[0] || "");
        setMunicipio(uniqueMunicipios[0] || "");
        setLocalidad(uniqueLocalidades[0] || "");

        // Almacena estos arrays en tus estados para selects
        setEstadosData(uniqueEstados);
        setMunicipiosData(uniqueMunicipios);
        setLocalidadesData(uniqueLocalidades);

        // “localidadesDisponibles” para el <select> (modo “seleccionar”)
        setLocalidadesDisponibles(
          uniqueLocalidades.map((asenta) => ({ d_asenta: asenta }))
        );

        toast.success("Código Postal válido. Datos autocompletados.");
      } else {
        setCpValido(false);
        toast.error("No se encontró información para ese Código Postal.");
      }
    } catch (error) {
      console.error(error);
      setCpValido(false);
      toast.error("Error consultando el servicio de SEPOMEX.");
    } finally {
      setCargandoCP(false);
    }
  };

  // --------------------------------------------
  // Navegación Wizard
  // --------------------------------------------
  const nextStep = () => {
    if (currentStep < totalSteps) setCurrentStep((prev) => prev + 1);
  };
  const prevStep = () => {
    if (currentStep > 1) setCurrentStep((prev) => prev - 1);
  };

  // --------------------------------------------
  // Validaciones por paso
  // --------------------------------------------
  const paso1Valido = () =>
    nombre.trim().length >= 3 &&
    apellido.trim().length >= 3 &&
    telefono.trim().length === 10;
    
  const paso2Valido = () => {
    if (esClienteExistente) {
      return selectedDireccionId !== null;
    } else {
      // CP válido y calle con al menos 5 caracteres
      return cpValido && direccion.trim().length >= 5;
    }
  };


  // Ejemplo: si quieres validar si “productosAdicionales” no está vacío, 
  // podrías hacerlo también, pero de momento no lo forzamos.
  const paso3Valido = () =>
    producto &&
    fechaInicio &&
    fechaEntrega &&
    horaAlquiler &&
    stock.trim() !== "" &&
    precio.trim() !== "" &&
    formaPago.trim() !== "";

  const canGoNext = () => {
    if (currentStep === 1) return paso1Valido();
    if (currentStep === 2) return paso2Valido();
    if (currentStep === 3) return paso3Valido();
    return false;
  };

  // --------------------------------------------
  // Al enviar en Paso 4
  // --------------------------------------------
  const handleSubmitWizard = (e) => {
    e.preventDefault();
    toast.success("¡Pedido de alquiler creado (simulado)!");
    handleCerrarWizard();
  };

  // --------------------------------------------
  // Helpers de Paso 3
  // --------------------------------------------
  // Calcula días entre fechaInicio y fechaEntrega
  const calcularDiasAlquiler = () => {
    if (!fechaInicio || !fechaEntrega) return 0;
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaEntrega);
    if (fin <= inicio) return 0;
    const diffMs = fin - inicio;
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  };

 
  const handleCotizarPrincipal = () => {
    const dias = calcularDiasAlquiler();
    const precioNumber = parseFloat(precio) || 0;
    const unitsNumber = parseInt(unitsToRent) || 0;
    const total = dias * precioNumber * unitsNumber;
    setSubPrecio(total.toString());
    toast.success(`Cotización principal: $${total}`);
  };

  // ==================================================
  // Manejadores para “productosAdicionales”
  // ==================================================
  // Añade un nuevo producto al array
  const agregarProductoAdicional = () => {
    const nuevo = {
      id: Date.now(),     // un identificador
      producto: "",
      stock: "",
      precio: "",
      subPrecio: "",
      units: "",
    };
    setProductosAdicionales((prev) => [...prev, nuevo]);
  };

  // Actualiza un campo (e.g. producto, stock, etc.) de un producto adicional
  const actualizarProductoAdicional = (id, field, value) => {
    setProductosAdicionales((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  // Cotiza un producto adicional
  const cotizarProductoAdicional = (id) => {
    const dias = calcularDiasAlquiler();
    setProductosAdicionales((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const precioNumber = parseFloat(p.precio) || 0;
          const unitsNumber = parseInt(p.units) || 0;
          const total = dias * precioNumber * unitsNumber;
          toast.success(`Cotización adicional: $${total}`);
          return { ...p, subPrecio: total.toString() };
        }
        return p;
      })
    );
  };

  // --------------------------------------------
  // Renders de los pasos
  // --------------------------------------------
  const renderPaso1 = () => (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-800 flex items-center">
        <FontAwesomeIcon icon={faAddressCard} className="mr-2 text-yellow-500" />
        Paso 1: Datos Personales
      </h2>
      <p className="text-sm text-gray-500">
        ¿Ya eres cliente?{" "}
        <button
          onClick={handleAbrirSubmodalCorreo}
          className="text-blue-500 underline"
          type="button"
        >
          Verificar con correo
        </button>
      </p>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Nombre*
        </label>
        <input
          type="text"
          className="w-full p-2 border border-gray-300 rounded"
          placeholder="Ej: Juan"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Apellido*
        </label>
        <input
          type="text"
          className="w-full p-2 border border-gray-300 rounded"
          placeholder="Ej: Pérez"
          value={apellido}
          onChange={(e) => setApellido(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Teléfono (10 dígitos)*
        </label>
        <input
          type="text"
          className="w-full p-2 border border-gray-300 rounded"
          placeholder="1234567890"
          maxLength={10}
          value={telefono}
          onChange={(e) => setTelefono(e.target.value.replace(/\D/g, ""))}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Correo (opcional o auto)
        </label>
        <input
          type="email"
          className="w-full p-2 border border-gray-300 rounded"
          placeholder="tu_correo@ejemplo.com"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
        />
      </div>
    </div>
  );

  const renderPaso2 = () => (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-800 flex items-center">
        <FontAwesomeIcon icon={faLocationArrow} className="mr-2 text-yellow-500" />
        Paso 2: Ubicación
      </h2>

      {esClienteExistente ? (
        <div className="space-y-2">
          <p className="text-sm text-gray-500">
            Selecciona una de tus direcciones registradas:
          </p>
          {direccionesCliente.map((dir) => (
            <label
              key={dir.idDir}
              className="block border border-gray-300 p-2 rounded cursor-pointer hover:bg-gray-50"
            >
              <input
                type="radio"
                name="direccionSeleccionada"
                className="mr-2"
                checked={selectedDireccionId === dir.idDir}
                onChange={() => setSelectedDireccionId(dir.idDir)}
              />
              <span className="font-semibold">{dir.alias}:</span>{" "}
              {dir.calle}, {dir.localidad}, {dir.municipio}, {dir.estado}.
              CP: {dir.cp}
            </label>
          ))}
          {direccionesCliente.length === 0 && (
            <p className="text-sm text-red-500">
              No tienes direcciones registradas.
            </p>
          )}
        </div>
      ) : (
        <>
          {/* CP + botón Validar */}
          <div className="flex items-end space-x-2">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">
                Código Postal (5 dígitos)*
              </label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded"
                maxLength={5}
                placeholder="Ej: 12345"
                value={codigoPostal}
                onChange={(e) =>
                  setCodigoPostal(e.target.value.replace(/\D/g, ""))
                }
              />
            </div>
            <button
              type="button"
              onClick={handleValidarCP}
              disabled={codigoPostal.length < 5 || cargandoCP}
              className={`px-4 py-2 rounded ${
                codigoPostal.length === 5 && !cargandoCP
                  ? "bg-yellow-500 text-white hover:bg-yellow-600"
                  : "bg-gray-400 text-gray-200 cursor-not-allowed"
              } transition`}
            >
              {cargandoCP ? (
                <div className="flex items-center space-x-2">
                  <FontAwesomeIcon icon={faSpinner} spin />
                  <span>Validando...</span>
                </div>
              ) : (
                "Validar CP"
              )}
            </button>
          </div>

          {/* Campos autocompletados (deshabilitados si no es cpValido) */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              País
            </label>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded"
              value={pais}
              onChange={(e) => setPais(e.target.value)}
              disabled={!cpValido}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Estado
            </label>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded"
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
              disabled={!cpValido}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Municipio
            </label>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded"
              value={municipio}
              onChange={(e) => setMunicipio(e.target.value)}
              disabled={!cpValido}
            />
          </div>

          {/* Modo “Seleccionar” o “Manual” para la Localidad */}
          <fieldset className="space-y-2">
            <legend className="block text-sm font-medium text-gray-700">
              Localidad/Colonia
            </legend>
            <div className="flex items-center space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="modoLocalidad"
                  value="seleccionar"
                  className="mr-1"
                  checked={modoLocalidad === "seleccionar"}
                  onChange={() => setModoLocalidad("seleccionar")}
                  disabled={!cpValido}
                />
                Seleccionar
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="modoLocalidad"
                  value="manual"
                  className="mr-1"
                  checked={modoLocalidad === "manual"}
                  onChange={() => setModoLocalidad("manual")}
                  disabled={!cpValido}
                />
                Manual
              </label>
            </div>

            {modoLocalidad === "seleccionar" && (
              <select
                className="w-full p-2 border border-gray-300 rounded"
                value={localidad}
                onChange={(e) => setLocalidad(e.target.value)}
                disabled={!cpValido}
              >
                {localidadesDisponibles.map((item, idx) => {
                  const nombreColonia =
                    item.d_asenta || item.name || `Opción ${idx + 1}`;
                  return (
                    <option key={idx} value={nombreColonia}>
                      {nombreColonia}
                    </option>
                  );
                })}
              </select>
            )}

            {modoLocalidad === "manual" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 sr-only">
                  Localidad manual
                </label>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded"
                  placeholder="Ingresa tu colonia/localidad"
                  value={localidad}
                  onChange={(e) => setLocalidad(e.target.value)}
                  disabled={!cpValido}
                />
              </div>
            )}
          </fieldset>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Dirección (calle, número)*
            </label>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="Calle y número"
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
            />
          </div>
        </>
      )}
    </div>
  );

  // Paso 3 (Producto principal + múltiples productos)
  const renderPaso3 = () => {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center">
          <FontAwesomeIcon icon={faHome} className="mr-2 text-yellow-500" />
          Paso 3: Producto y Fechas
        </h2>

        {/* Producto principal */}
        {renderProductoPrincipal()}

        {/* Botón para agregar más productos */}
        <button
          type="button"
          onClick={agregarProductoAdicional}
          className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition"
        >
          + Agregar otro producto
        </button>

        {/* Renderizamos la lista de productos adicionales */}
        {productosAdicionales.map((p, index) => (
          <div
            key={p.id}
            className="border border-gray-300 p-3 rounded bg-gray-50 mt-2"
          >
            <h3 className="font-semibold text-gray-700 mb-2">
              Producto Adicional #{index + 1}
            </h3>

            <label className="block text-sm font-medium text-gray-700">
              Producto
            </label>
            <select
              className="w-full p-2 border border-gray-300 rounded mb-2"
              value={p.producto}
              onChange={(e) =>
                actualizarProductoAdicional(p.id, "producto", e.target.value)
              }
            >
              <option value="">-- Seleccionar --</option>
              <option value="Laptop">Laptop</option>
              <option value="Proyector">Proyector</option>
              <option value="Mueble">Mueble</option>
            </select>

            <label className="block text-sm font-medium text-gray-700">
              Stock
            </label>
            <input
              type="number"
              className="w-full p-2 border border-gray-300 rounded mb-2"
              placeholder="Ej: 10"
              value={p.stock}
              onChange={(e) =>
                actualizarProductoAdicional(p.id, "stock", e.target.value)
              }
            />

            <label className="block text-sm font-medium text-gray-700">
              Precio
            </label>
            <input
              type="number"
              className="w-full p-2 border border-gray-300 rounded mb-2"
              placeholder="Ej: 500"
              value={p.precio}
              onChange={(e) =>
                actualizarProductoAdicional(p.id, "precio", e.target.value)
              }
            />

            <label className="block text-sm font-medium text-gray-700">
              Unidades a rentar
            </label>
            <input
              type="number"
              className="w-full p-2 border border-gray-300 rounded mb-2"
              placeholder="Ej: 2"
              value={p.units}
              onChange={(e) =>
                actualizarProductoAdicional(p.id, "units", e.target.value)
              }
            />

            <label className="block text-sm font-medium text-gray-700">
              Subprecio (cotizado)
            </label>
            <input
              type="number"
              className="w-full p-2 border border-gray-300 rounded mb-2"
              placeholder="0"
              value={p.subPrecio}
              onChange={(e) =>
                actualizarProductoAdicional(p.id, "subPrecio", e.target.value)
              }
            />

            <button
              type="button"
              onClick={() => cotizarProductoAdicional(p.id)}
              className="px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700 transition"
            >
              Cotizar este producto
            </button>
          </div>
        ))}
      </div>
    );
  };

  // Producto principal (reutiliza la lógica original)


  const renderProductoPrincipal = () => {
    // Función local para cotizar el principal
    const handleCotizarPrincipal = () => {
      const dias = calcularDiasAlquiler();
      const precioNumber = parseFloat(precio) || 0;
      const unitsNumber = parseInt(unitsToRent) || 0;
      const total = dias * precioNumber * unitsNumber;
      setSubPrecio(total.toString());
      toast.success(`Cotización principal: $${total}`);
    };

    return (
      <div className="space-y-4 border border-gray-300 p-3 rounded bg-gray-50">
        <h3 className="font-semibold text-gray-700">Producto Principal</h3>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Producto a Alquilar*
          </label>
          <select
            className="w-full p-2 border border-gray-300 rounded"
            value={producto}
            onChange={(e) => setProducto(e.target.value)}
          >
            <option value="">-- Seleccionar --</option>
            <option value="Laptop">Laptop</option>
            <option value="Proyector">Proyector</option>
            <option value="Mueble">Mueble</option>
          </select>
        </div>

        {producto && (
          <p className="text-sm text-gray-600">
            Disponible: <strong>{stock || 0}</strong> unidades para {producto}.
          </p>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Unidades a rentar
          </label>
          <input
            type="number"
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="Ej: 2"
            value={unitsToRent}
            onChange={(e) => setUnitsToRent(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Fecha Inicio*
          </label>
          <input
            type="date"
            className="w-full p-2 border border-gray-300 rounded"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Fecha Entrega*
          </label>
          <input
            type="date"
            className="w-full p-2 border border-gray-300 rounded"
            value={fechaEntrega}
            onChange={(e) => setFechaEntrega(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Hora de Alquiler*
          </label>
          <input
            type="time"
            className="w-full p-2 border border-gray-300 rounded"
            value={horaAlquiler}
            onChange={(e) => setHoraAlquiler(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Stock (ej. total)
          </label>
          <input
            type="number"
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="Ej: 10"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Precio
          </label>
          <input
            type="number"
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="Ej: 500"
            value={precio}
            onChange={(e) => setPrecio(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Subprecio (se actualizará tras Cotizar)
          </label>
          <input
            type="number"
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="Ej: 450"
            value={subPrecio}
            onChange={(e) => setSubPrecio(e.target.value)}
          />
        </div>

        <button
          type="button"
          onClick={handleCotizarPrincipal}
          className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition"
        >
          Cotizar Producto Principal
        </button>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Forma de pago
          </label>
          <select
            className="w-full p-2 border border-gray-300 rounded"
            value={formaPago}
            onChange={(e) => setFormaPago(e.target.value)}
          >
            <option value="">-- Seleccionar --</option>
            <option value="Efectivo">Efectivo</option>
            <option value="Tarjeta">Tarjeta</option>
            <option value="Transferencia">Transferencia</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Detalles de pago
          </label>
          <textarea
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="Ej: número de tarjeta, etc."
            value={detallesPago}
            onChange={(e) => setDetallesPago(e.target.value)}
          />
        </div>
      </div>
    );
  };

  // Paso 4 (Confirmación)
  const renderPaso4 = () => (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-800 flex items-center">
        <FontAwesomeIcon icon={faClipboardCheck} className="mr-2 text-yellow-500" />
        Paso 4: Confirmación
      </h2>
      <div className="bg-gray-100 p-3 rounded text-sm text-gray-700 space-y-2">
        <p>
          <strong>Nombre:</strong> {nombre} {apellido}
        </p>
        <p>
          <strong>Teléfono:</strong> {telefono}
        </p>
        <p>
          <strong>Correo:</strong> {correo || "(No especificado)"}
        </p>

        {esClienteExistente ? (
          <>
            <p>
              <strong>Dirección elegida:</strong>
            </p>
            {direccionesCliente.map((dir) =>
              dir.idDir === selectedDireccionId ? (
                <p key={dir.idDir}>
                  {dir.alias}: {dir.calle}, {dir.localidad}, {dir.municipio},{" "}
                  {dir.estado}. CP: {dir.cp}
                </p>
              ) : null
            )}
          </>
        ) : (
          <>
            <p>
              <strong>Código Postal:</strong> {codigoPostal}
            </p>
            <p>
              <strong>País:</strong> {pais || "(Sin definir)"}
            </p>
            <p>
              <strong>Estado:</strong> {estado || "(Sin definir)"}
            </p>
            <p>
              <strong>Municipio:</strong> {municipio || "(Sin definir)"}
            </p>
            <p>
              <strong>Localidad:</strong> {localidad || "(Sin definir)"}
            </p>
            <p>
              <strong>Dirección:</strong> {direccion}
            </p>
          </>
        )}

        <p>
          <strong>Producto Principal:</strong> {producto}
        </p>
        <p>
          <strong>Fecha Inicio:</strong> {fechaInicio}
        </p>
        <p>
          <strong>Fecha Entrega:</strong> {fechaEntrega}
        </p>
        <p>
          <strong>Hora Alquiler:</strong> {horaAlquiler}
        </p>
        <p>
          <strong>Stock:</strong> {stock}
        </p>
        <p>
          <strong>Precio:</strong> {precio}
        </p>
        <p>
          <strong>Subprecio:</strong> {subPrecio}
        </p>
        <p>
          <strong>Forma de Pago:</strong> {formaPago || "(No especificada)"}
        </p>
        <p>
          <strong>Detalles de Pago:</strong> {detallesPago || "(Ninguno)"}
        </p>

        {/* Mostrar los productos adicionales en la confirmación */}
        {productosAdicionales.length > 0 && (
          <>
            <hr className="my-2" />
            <p className="font-semibold">Productos Adicionales:</p>
            {productosAdicionales.map((prod, idx) => (
              <div key={prod.id} className="ml-4 mb-2">
                <p>
                  #{idx + 1}: <strong>{prod.producto}</strong>{" "}
                  (Stock: {prod.stock || 0})
                </p>
                <p>
                  Precio: {prod.precio} - Unidades: {prod.units} - Subtotal:{" "}
                  {prod.subPrecio || 0}
                </p>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );

  // --------------------------------------------
  // Render según el paso actual
  // --------------------------------------------
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderPaso1();
      case 2:
        return renderPaso2();
      case 3:
        return renderPaso3();
      case 4:
        return renderPaso4();
      default:
        return null;
    }
  };

  // --------------------------------------------
  // UI principal
  // --------------------------------------------
  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Alquiler de Productos (Ejemplo)
      </h1>
      <button
        onClick={handleAbrirWizard}
        className="px-4 py-2 rounded bg-yellow-500 text-white hover:bg-yellow-600 transition"
      >
        Realizar un Pedido
      </button>

      {/* Wizard principal */}
      {showWizard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white w-full max-w-2xl rounded shadow-lg relative">
            {/* Barra superior amarilla */}
            <div className="bg-yellow-400 h-2 w-full rounded-t" />
            <button
              type="button"
              onClick={handleCerrarWizard}
              className="absolute top-2 right-2 text-gray-600 hover:text-red-600 transition"
            >
              <FontAwesomeIcon icon={faTimes} size="lg" />
            </button>

            <div className="p-6">
              {/* Encabezado de pasos */}
              <div className="flex justify-between items-center mb-4">
                <div className="flex space-x-4">
                  {[1, 2, 3, 4].map((step) => (
                    <div
                      key={step}
                      className={`flex flex-col items-center ${
                        currentStep === step
                          ? "text-yellow-600"
                          : "text-gray-400"
                      }`}
                    >
                      <div
                        className={`h-8 w-8 flex items-center justify-center rounded-full border-2 ${
                          currentStep >= step
                            ? "border-yellow-500"
                            : "border-gray-400"
                        }`}
                      >
                        {step === 1 && (
                          <FontAwesomeIcon icon={faAddressCard} size="sm" />
                        )}
                        {step === 2 && (
                          <FontAwesomeIcon icon={faLocationArrow} size="sm" />
                        )}
                        {step === 3 && (
                          <FontAwesomeIcon icon={faHome} size="sm" />
                        )}
                        {step === 4 && (
                          <FontAwesomeIcon icon={faClipboardCheck} size="sm" />
                        )}
                      </div>
                      <span className="text-xs mt-1">
                        {step === 1
                          ? "Datos"
                          : step === 2
                          ? "Ubicación"
                          : step === 3
                          ? "Producto"
                          : "Confirmación"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSubmitWizard} className="space-y-6">
                {renderStepContent()}

                {/* Botones de navegación */}
                <div className="flex justify-between mt-6">
                  {currentStep > 1 && (
                    <button
                      type="button"
                      onClick={prevStep}
                      className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
                    >
                      Anterior
                    </button>
                  )}
                  {currentStep < totalSteps && (
                    <button
                      type="button"
                      onClick={nextStep}
                      disabled={!canGoNext()}
                      className={`px-4 py-2 rounded ${
                        canGoNext()
                          ? "bg-yellow-500 text-white hover:bg-yellow-600"
                          : "bg-gray-400 text-gray-200 cursor-not-allowed"
                      } transition`}
                    >
                      Siguiente
                    </button>
                  )}
                  {currentStep === totalSteps && (
                    <button
                      type="submit"
                      className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 transition"
                    >
                      Finalizar
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Submodal para verificar correo */}
      {showSubmodalCorreo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white w-full max-w-md rounded shadow-lg relative">
            <div className="bg-yellow-400 h-2 w-full rounded-t" />
            <button
              type="button"
              onClick={handleCerrarSubmodalCorreo}
              className="absolute top-2 right-2 text-gray-600 hover:text-red-600 transition"
            >
              <FontAwesomeIcon icon={faTimes} size="lg" />
            </button>
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-3 flex items-center">
                <FontAwesomeIcon icon={faUser} className="mr-2 text-yellow-500" />
                Verificar Correo de Cliente
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Ingresa el correo electrónico con el que te registraste.
              </p>
              <div className="space-y-3">
                <input
                  type="email"
                  className="w-full p-2 border border-gray-300 rounded"
                  placeholder="email@ejemplo.com"
                  value={emailParaVerificar}
                  onChange={(e) => setEmailParaVerificar(e.target.value)}
                />
                <button
                  type="button"
                  onClick={handleVerificarCorreo}
                  disabled={!emailParaVerificar.trim()}
                  className={`px-4 py-2 rounded ${
                    emailParaVerificar.trim()
                      ? "bg-yellow-500 text-white hover:bg-yellow-600"
                      : "bg-gray-400 text-gray-200 cursor-not-allowed"
                  } transition`}
                >
                  {cargandoVerificacion ? (
                    <div className="flex items-center space-x-2">
                      <FontAwesomeIcon icon={faSpinner} spin />
                      <span>Validando...</span>
                    </div>
                  ) : (
                    "Validar"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default WizardAlquiler;
