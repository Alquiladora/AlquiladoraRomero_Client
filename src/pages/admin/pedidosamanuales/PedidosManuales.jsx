// WizardAlquiler.jsx
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

// Importamos nuestros 4 pasos
import StepOne from "./StepOne";
import StepTwo from "./StepTwo";
import StepThree from "./StepThree";
import StepFour from "./StepFour";

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
  // --------------------------------------------
  // Manejo general del Wizard
  // --------------------------------------------
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

  // Manejo submodal correo
  const [showSubmodalCorreo, setShowSubmodalCorreo] = useState(false);
  const [emailParaVerificar, setEmailParaVerificar] = useState("");
  const [cargandoVerificacion, setCargandoVerificacion] = useState(false);
  const [esClienteExistente, setEsClienteExistente] = useState(false);

  // Direcciones si es cliente
  const [direccionesCliente, setDireccionesCliente] = useState([]);
  const [selectedDireccionId, setSelectedDireccionId] = useState(null);

  // --------------------------------------------
  // Paso 2: Ubicación (si no es cliente)
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

  // --------------------------------------------
  // Paso 3: Productos
  // --------------------------------------------
  const [producto, setProducto] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaEntrega, setFechaEntrega] = useState("");
  const [horaAlquiler, setHoraAlquiler] = useState("");

  const [stock, setStock] = useState("");
  const [precio, setPrecio] = useState("");
  const [subPrecio, setSubPrecio] = useState("");
  const [formaPago, setFormaPago] = useState("");
  const [detallesPago, setDetallesPago] = useState("");

  // Unidades a rentar en el producto principal
  const [unitsToRent, setUnitsToRent] = useState("");

  // Productos adicionales
  const [productosAdicionales, setProductosAdicionales] = useState([]);

  // --------------------------------------------
  // Efecto para resetear CP cuando cambia
  // --------------------------------------------
  useEffect(() => {
    setCpValido(false);
    setPais("");
    setEstado("");
    setMunicipio("");
    setLocalidad("");
    setLocalidadesDisponibles([]);
  }, [codigoPostal]);

  // --------------------------------------------
  // Funciones para abrir/cerrar Wizard
  // --------------------------------------------
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
    setEstadosData([]);
    setMunicipiosData([]);
    setLocalidadesData([]);
    setStock("");
    setPrecio("");
    setSubPrecio("");
    setFormaPago("");
    setDetallesPago("");
    setUnitsToRent("");
    setProductosAdicionales([]);
  };

  // --------------------------------------------
  // Submodal para verificar correo
  // --------------------------------------------
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
  // Validar CP (SEPOMEX)
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
        setEstado(uniqueEstados[0] || "");
        setMunicipio(uniqueMunicipios[0] || "");
        setLocalidad(uniqueLocalidades[0] || "");
        setEstadosData(uniqueEstados);
        setMunicipiosData(uniqueMunicipios);
        setLocalidadesData(uniqueLocalidades);

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
  // Navegación
  // --------------------------------------------
  const nextStep = () => {
    if (currentStep < totalSteps) setCurrentStep((prev) => prev + 1);
  };
  const prevStep = () => {
    if (currentStep > 1) setCurrentStep((prev) => prev - 1);
  };

  // --------------------------------------------
  // Validaciones
  // --------------------------------------------
  const paso1Valido = () =>
    nombre.trim().length >= 3 &&
    apellido.trim().length >= 3 &&
    telefono.trim().length === 10;

  const paso2Valido = () => {
    if (esClienteExistente) {
      return selectedDireccionId !== null;
    } else {
      return cpValido && direccion.trim().length >= 5;
    }
  };

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
  // Cotizar (Paso 3)
  // --------------------------------------------
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

  // Productos adicionales
  const agregarProductoAdicional = () => {
    const nuevo = {
      id: Date.now(),
      producto: "",
      stock: "",
      precio: "",
      subPrecio: "",
      units: "",
    };
    setProductosAdicionales((prev) => [...prev, nuevo]);
  };

  const actualizarProductoAdicional = (id, field, value) => {
    setProductosAdicionales((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

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
  // Al enviar (Paso 4)
  // --------------------------------------------
  const handleSubmitWizard = (e) => {
    e.preventDefault();
    toast.success("¡Pedido de alquiler creado (simulado)!");
    handleCerrarWizard();
  };

  // --------------------------------------------
  // Render de cada paso
  // --------------------------------------------
  const renderPaso1 = () => (
    <StepOne
      nombre={nombre}
      setNombre={setNombre}
      apellido={apellido}
      setApellido={setApellido}
      telefono={telefono}
      setTelefono={setTelefono}
      correo={correo}
      setCorreo={setCorreo}
      handleAbrirSubmodalCorreo={handleAbrirSubmodalCorreo}
    />
  );

  const renderPaso2 = () => (
    <StepTwo
      esClienteExistente={esClienteExistente}
      direccionesCliente={direccionesCliente}
      selectedDireccionId={selectedDireccionId}
      setSelectedDireccionId={setSelectedDireccionId}
      codigoPostal={codigoPostal}
      setCodigoPostal={setCodigoPostal}
      handleValidarCP={handleValidarCP}
      cargandoCP={cargandoCP}
      cpValido={cpValido}
      pais={pais}
      setPais={setPais}
      estado={estado}
      setEstado={setEstado}
      municipio={municipio}
      setMunicipio={setMunicipio}
      localidad={localidad}
      setLocalidad={setLocalidad}
      modoLocalidad={modoLocalidad}
      setModoLocalidad={setModoLocalidad}
      localidadesDisponibles={localidadesDisponibles}
      direccion={direccion}
      setDireccion={setDireccion}
    />
  );

  const renderPaso3 = () => (
    <StepThree
      producto={producto}
      setProducto={setProducto}
      fechaInicio={fechaInicio}
      setFechaInicio={setFechaInicio}
      fechaEntrega={fechaEntrega}
      setFechaEntrega={setFechaEntrega}
      horaAlquiler={horaAlquiler}
      setHoraAlquiler={setHoraAlquiler}
      stock={stock}
      setStock={setStock}
      precio={precio}
      setPrecio={setPrecio}
      subPrecio={subPrecio}
      setSubPrecio={setSubPrecio}
      formaPago={formaPago}
      setFormaPago={setFormaPago}
      detallesPago={detallesPago}
      setDetallesPago={setDetallesPago}
      unitsToRent={unitsToRent}
      setUnitsToRent={setUnitsToRent}
      handleCotizarPrincipal={handleCotizarPrincipal}
      agregarProductoAdicional={agregarProductoAdicional}
      productosAdicionales={productosAdicionales}
      actualizarProductoAdicional={actualizarProductoAdicional}
      cotizarProductoAdicional={cotizarProductoAdicional}
    />
  );

  const renderPaso4 = () => (
    <StepFour
      nombre={nombre}
      apellido={apellido}
      telefono={telefono}
      correo={correo}
      esClienteExistente={esClienteExistente}
      direccionesCliente={direccionesCliente}
      selectedDireccionId={selectedDireccionId}
      codigoPostal={codigoPostal}
      pais={pais}
      estado={estado}
      municipio={municipio}
      localidad={localidad}
      direccion={direccion}
      producto={producto}
      fechaInicio={fechaInicio}
      fechaEntrega={fechaEntrega}
      horaAlquiler={horaAlquiler}
      stock={stock}
      precio={precio}
      subPrecio={subPrecio}
      formaPago={formaPago}
      detallesPago={detallesPago}
      productosAdicionales={productosAdicionales}
    />
  );

  // Decide qué paso renderizar
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
  // Render Principal
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
                        currentStep === step ? "text-yellow-600" : "text-gray-400"
                      }`}
                    >
                      <div
                        className={`h-8 w-8 flex items-center justify-center rounded-full border-2 ${
                          currentStep >= step
                            ? "border-yellow-500"
                            : "border-gray-400"
                        }`}
                      >
                        {step === 1 && <FontAwesomeIcon icon={faAddressCard} size="sm" />}
                        {step === 2 && <FontAwesomeIcon icon={faLocationArrow} size="sm" />}
                        {step === 3 && <FontAwesomeIcon icon={faHome} size="sm" />}
                        {step === 4 && <FontAwesomeIcon icon={faClipboardCheck} size="sm" />}
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
