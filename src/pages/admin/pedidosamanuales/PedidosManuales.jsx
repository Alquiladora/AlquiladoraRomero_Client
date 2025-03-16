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
import api from "../../../utils/AxiosConfig";
import { useAuth } from "../../../hooks/ContextAuth";

import StepOne from "./StepOne";
import StepTwo from "./StepTwo";
import StepThree from "./StepThree";
import StepFour from "./StepFour";

function WizardAlquiler() {
  const { csrfToken, user } = useAuth();
  const [showWizard, setShowWizard] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [telefono, setTelefono] = useState("");
  const [correo, setCorreo] = useState("");

  const [showSubmodalCorreo, setShowSubmodalCorreo] = useState(false);
  const [emailParaVerificar, setEmailParaVerificar] = useState("");
  const [cargandoVerificacion, setCargandoVerificacion] = useState(false);
  const [esClienteExistente, setEsClienteExistente] = useState(false);

  const [direccionesCliente, setDireccionesCliente] = useState([]);
  const [selectedDireccionId, setSelectedDireccionId] = useState(null);

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
  const [unitsToRent, setUnitsToRent] = useState("");

  const [productosAdicionales, setProductosAdicionales] = useState([]);
  const [productosDisponibles, setProductosDisponibles] = useState([]);
  const [referencia, setReferencia] = useState("");
   const [trackingId, setTrackingId] = useState("");

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
    setReferencia("");
  };

  const handleAbrirSubmodalCorreo = () => {
    setEmailParaVerificar("");
    setShowSubmodalCorreo(true);
  };

  const handleCerrarSubmodalCorreo = () => {
    setShowSubmodalCorreo(false);
  };

  const handleVerificarCorreo = async () => {
    setCargandoVerificacion(true);

    try {
      const correoParam = emailParaVerificar.trim().toLowerCase();
      const response = await api.get(
        `/api/pedidos/pedidosmanuales/${correoParam}`,
        {
          withCredentials: true,
          headers: { "X-CSRF-Token": csrfToken },
        }
      );

      if (response.data && response.data.length > 0) {
        const cliente = response.data[0];
        if (cliente.rol === "administrador") {
          toast.info("Este usuario es administrador.");
          return;
        } else {
          console.log("Cliente encontrado", cliente);
          setEsClienteExistente(true);
          setNombre(cliente.nombre);
          setApellido(`${cliente.apellidoP} ${cliente.apellidoM}`);
          setTelefono(cliente.telefono);
          setCorreo(cliente.correo);
          setDireccionesCliente(response.data);
          toast.success("¡Datos de cliente cargados!");
          setShowSubmodalCorreo(false);
        }
      } else {
        toast.error("Cliente no encontrado.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error al verificar el cliente.");
    } finally {
      setCargandoVerificacion(false);
    }
  };

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

  const nextStep = () => {
    if (currentStep < totalSteps) setCurrentStep((prev) => prev + 1);
  };
  const prevStep = () => {
    if (currentStep > 1) setCurrentStep((prev) => prev - 1);
  };

  const paso1Valido = () =>
    nombre.trim().length >= 3 &&
    apellido.trim().length >= 3 &&
    telefono.trim().length === 10;
  // /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim());

  const paso2Valido = () => {
    if (esClienteExistente) {
      const direccionesValidas =
        direccionesCliente &&
        direccionesCliente.filter((dir) => dir.codigoPostal !== null);
      if (direccionesValidas && direccionesValidas.length > 0) {
        return selectedDireccionId !== null;
      } else {
        return (
          codigoPostal.trim().length === 5 &&
          cpValido &&
          pais.trim().length > 0 &&
          estado.trim().length > 0 &&
          municipio.trim().length > 0 &&
          localidad.trim().length > 0 &&
          direccion.trim().length >= 5
        );
      }
    } else {
      return (
        codigoPostal.trim().length === 5 &&
        cpValido &&
        pais.trim().length > 0 &&
        estado.trim().length > 0 &&
        municipio.trim().length > 0 &&
        localidad.trim().length > 0 &&
        direccion.trim().length >= 5
      );
    }
  };

  const paso3Valido = () => {
    return step3Data.isValid;
  };

  const [step3Data, setStep3Data] = useState({
    isValid: false,
    selectedProducts: [],
    lineItems: [],
    ticketTotal: 0,
  });

  const handleStep3Change = (data) => {
    setStep3Data(data);
  };

  const canGoNext = () => {
    if (currentStep === 1) return paso1Valido();
    if (currentStep === 2) return paso2Valido();
    if (currentStep === 3) return paso3Valido();
    return false;
  };

  const handleSubmitWizard = async (e) => {
    e.preventDefault();
  
    
    const payload = {
     
      nombre,
      apellido,
      telefono,
      correo,
      esClienteExistente,
  
      selectedDireccionId,  
      codigoPostal,
      pais,
      estado,
      municipio,
      localidad,
      direccion,
      referencia,
  
      fechaInicio,
      fechaEntrega,
      horaAlquiler,
      formaPago,
      detallesPago,
    
      productosSeleccionados: step3Data.selectedProducts,
      lineItems: step3Data.lineItems,
      total: step3Data.ticketTotal,
  
      direccionesCliente,
      trackingId
    };


    console.log("Datos de playload", payload.productosSeleccionados)

   
    

  
    try {
     
      const response = await api.post("api/pedidos/crear-pedido-no-cliente", payload, {
        headers: {
          "X-CSRF-Token": csrfToken, 
        },
        withCredentials: true,
      });
  
      
      toast.success("¡Pedido creado con éxito!");
      
      
      handleCerrarWizard();
  

      console.log("Respuesta del servidor:", response.data);
  
    } catch (error) {
      if (
              error.response &&
              error.response.data &&
              error.response.data.message
            ) {
              toast.error(error.response.data.message);
            }
            else {
      console.error("Error al crear el pedido:", error);
      toast.error("Hubo un error al crear el pedido.");
    }
    }
  };
  

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const response = await api.get("/api/productos/pedidos-manual", {
          withCredentials: true,
          headers: { "X-CSRF-Token": csrfToken },
        });
        setProductosDisponibles(response.data);
        console.log("Datos recibidos", response.data);
      } catch (error) {
        console.error("Error al obtener productos disponibles:", error);
      }
    };

    fetchProductos();
  }, [csrfToken]);

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
      referencia={referencia}
      setReferencia={setReferencia}
    />
  );

  const renderPaso3 = () => (
    <StepThree
      fechaInicio={fechaInicio}
      setFechaInicio={setFechaInicio}
      fechaEntrega={fechaEntrega}
      setFechaEntrega={setFechaEntrega}
      horaAlquiler={horaAlquiler}
      setHoraAlquiler={setHoraAlquiler}
      formaPago={formaPago}
      setFormaPago={setFormaPago}
      detallesPago={detallesPago}
      setDetallesPago={setDetallesPago}
      productosDisponibles={productosDisponibles}
      onChangeData={handleStep3Change}
    />
  );

  const renderPaso4 = () => (
    <StepFour
      nombre={nombre}
      apellido={apellido}
      telefono={telefono}
      correo={correo}
      codigoPostal={codigoPostal}
      pais={pais}
      estado={estado}
      municipio={municipio}
      localidad={localidad}
      direccion={direccion}
      referencia={referencia}
      direccionesCliente={direccionesCliente}
      esClienteExistente={esClienteExistente}
      selectedDireccionId={selectedDireccionId}
      setSelectedDireccionId={setSelectedDireccionId}
      step3Data={step3Data}
      fechaInicio={fechaInicio}
      fechaEntrega={fechaEntrega}
      horaAlquiler={horaAlquiler}
      formaPago={formaPago}
      detallesPago={detallesPago}
      setTrackingId={ setTrackingId}
      trackingId={ trackingId}
    />
  );


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

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen dark:bg-gray-900 dark:text-white">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 dark:text-white">
        Alquiler de Productos (Ejemplo)
      </h1>
      <button
        onClick={handleAbrirWizard}
        className="px-4 py-2 rounded bg-yellow-500 text-white hover:bg-yellow-600 transition dark:bg-yellow-500 dark:hover:bg-yellow-600"
      >
        Realizar un Pedido
      </button>


      {showWizard && (
        <div
          className="
      fixed inset-0 z-50
      flex items-center justify-center
      bg-black bg-opacity-50
      p-4
      dark:bg-black dark:bg-opacity-70
      transition-colors
    "
        >
          <div
            className="
        w-full max-w-2xl
        bg-white dark:bg-gray-800
        rounded shadow-lg
        relative
        overflow-hidden
      "
          >
            {/* Barra superior amarilla */}
            <div className="bg-yellow-400 dark:bg-yellow-500 h-2 w-full rounded-t" />

            
            <button
              type="button"
              onClick={handleCerrarWizard}
              className="absolute top-2 right-2 text-gray-600 dark:text-gray-200 hover:text-red-600 transition"
            >
              <FontAwesomeIcon icon={faTimes} size="lg" />
            </button>

           
            <div className="p-6 max-h-[calc(100vh-8rem)] overflow-y-auto">
          
              <div className="flex justify-between items-center mb-4">
                <div className="flex space-x-4">
                  {[1, 2, 3, 4].map((step) => (
                    <div
                      key={step}
                      className={`flex flex-col items-center ${
                        currentStep === step
                          ? "text-yellow-600 dark:text-yellow-400"
                          : "text-gray-400 dark:text-gray-300"
                      }`}
                    >
                      <div
                        className={`h-8 w-8 flex items-center justify-center rounded-full border-2 ${
                          currentStep >= step
                            ? "border-yellow-500 dark:border-yellow-400"
                            : "border-gray-400 dark:border-gray-600"
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

              <form
                onSubmit={handleSubmitWizard}
                className="space-y-6 dark:text-gray-100"
              >
                {renderStepContent()}

                <div className="flex justify-between mt-6">
                  {currentStep > 1 && currentStep !== 3 && (
                    <button
                      type="button"
                      onClick={prevStep}
                      className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 transition dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                    >
                      Anterior
                    </button>
                  )}

                  {currentStep < totalSteps && (
                    <button
                      type="button"
                      onClick={nextStep}
                      disabled={!canGoNext()}
                      className={`px-4 py-2 rounded transition ${
                        canGoNext()
                          ? "bg-yellow-500 text-white hover:bg-yellow-600 dark:bg-yellow-500 dark:hover:bg-yellow-600"
                          : "bg-gray-400 text-gray-200 cursor-not-allowed dark:bg-gray-600"
                      }`}
                    >
                      Siguiente
                    </button>
                  )}
                  {currentStep === totalSteps && (
                    <button
                      type="submit"
                      className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 transition dark:bg-green-600 dark:hover:bg-green-700"
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

      {showSubmodalCorreo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 dark:bg-black dark:bg-opacity-70">
          <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded shadow-lg relative">
            <div className="bg-yellow-400 dark:bg-yellow-500 h-2 w-full rounded-t" />
            <button
              type="button"
              onClick={handleCerrarSubmodalCorreo}
              className="absolute top-2 right-2 text-gray-600 dark:text-gray-200 hover:text-red-600 transition"
            >
              <FontAwesomeIcon icon={faTimes} size="lg" />
            </button>
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-3 flex items-center">
                <FontAwesomeIcon
                  icon={faUser}
                  className="mr-2 text-yellow-500"
                />
                Verificar Correo de Cliente
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                Ingresa el correo electrónico con el que te registraste.
              </p>
              <div className="space-y-3">
                <input
                  type="email"
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded"
                  placeholder="email@ejemplo.com"
                  value={emailParaVerificar}
                  onChange={(e) => setEmailParaVerificar(e.target.value)}
                />
                <button
                  type="button"
                  onClick={handleVerificarCorreo}
                  disabled={!emailParaVerificar.trim()}
                  className={`px-4 py-2 rounded transition ${
                    emailParaVerificar.trim()
                      ? "bg-yellow-500 text-white hover:bg-yellow-600 dark:bg-yellow-500 dark:hover:bg-yellow-600"
                      : "bg-gray-400 text-gray-200 cursor-not-allowed dark:bg-gray-600"
                  }`}
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
