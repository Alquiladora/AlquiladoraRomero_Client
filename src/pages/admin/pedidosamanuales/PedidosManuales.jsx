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
  faEye,
  faMapMarkerAlt,
  faPhone,
  faEnvelope,
  faCalendarAlt,
  faClock,
  faCreditCard,
  faDollarSign,
  faBox,
  faTruck,
  faCheckCircle,
  faBoxOpen,
  faUndo,
  faExclamationTriangle,
  faExclamationCircle,
  faBan,
  faQuestionCircle,
  faChartBar, // Para dashboard
  faTasks, // Para gestionar pedidos
  faFilter, // Para filtros
  faChevronLeft, // Para paginación anterior
  faChevronRight, // Para paginación siguiente
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import api from "../../../utils/AxiosConfig";
import { useAuth } from "../../../hooks/ContextAuth";
import DashboardPedidos from "../dashboard/DashboardPedidos";

import StepOne from "./StepOne";
import StepTwo from "./StepTwo";
import StepThree from "./StepThree";
import StepFour from "./StepFour";

function WizardAlquiler({ onNavigate   ,setPedidos}) {
  const { csrfToken, user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showTicketModal, setShowTicketModal] = useState(false);

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

  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;
  const [filterEstado, setFilterEstado] = useState("Todos");

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
    telefono.trim().length === 10 &&
    (!correo.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim()));

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

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get("/api/pedidos/pedidos-manuales", {
        withCredentials: true,
        headers: { "X-CSRF-Token": csrfToken },
      });
      if (response.data.success) {
        setOrders(response.data.data);
        setPedidos(response.data.data)
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Error al cargar los pedidos");
    }
  };

  const handleViewTicket = (order) => {
    setSelectedOrder(order);
    setShowTicketModal(true);
  };

  const handleSubmitWizard = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
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
      trackingId,
    };
    try {
      const response = await api.post(
        "api/pedidos/crear-pedido-no-cliente",
        payload,
        {
          headers: {
            "X-CSRF-Token": csrfToken,
          },
          withCredentials: true,
        }
      );

      toast.success("¡Pedido creado con éxito!");
      fetchOrders();

      handleCerrarWizard();

      console.log("Respuesta del servidor:", response.data);
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        toast.error(error.response.data.message);
      } else {
        console.error("Error al crear el pedido:", error);
        toast.error("Hubo un error al crear el pedido.");
      }
    } finally {
      setIsSubmitting(false);
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
      setTrackingId={setTrackingId}
      trackingId={trackingId}
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

  // Filtrar y paginar los pedidos
  const filteredOrders = filterEstado === "Todos"
    ? orders
    : orders.filter((order) => order.estado === filterEstado);

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const estadosDisponibles = [
    "Todos",
    "Confirmado",
    "En alquiler",
    "Entregado",
    "Devuelto",
    "Incompleto",
    "Incidente",
    "Perdido",
    "Finalizado",
    "Cancelado",
  ];

  const renderOrdersTable = () => (
    <div className="mt-10 overflow-x-auto animate-fade-in-up rounded-xl dark:bg-gray-800 p-6">

      <div className="flex justify-between items-center mb-4">
        <div className="flex space-x-4">
          <button
            onClick={() => onNavigate("Gestion Pedidos")}
            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition dark:bg-blue-600 dark:hover:bg-blue-700"
          >
            <FontAwesomeIcon icon={faTasks} className="mr-2" />
            Gestionar Pedidos
          </button>
          <button
            onClick={() => onNavigate("Dashboard-pedidos")}
            className="flex items-center px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition dark:bg-purple-600 dark:hover:bg-purple-700"
          >
            <FontAwesomeIcon icon={faChartBar} className="mr-2" />
            Ver Dashboard
          </button>
        </div>

        {/* Filtro por estado */}
        <div className="flex items-center space-x-2">
          <FontAwesomeIcon icon={faFilter} className="text-yellow-500" />
          <select
            value={filterEstado}
            onChange={(e) => {
              setFilterEstado(e.target.value);
              setCurrentPage(1);
            }}
            className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
          >
            {estadosDisponibles.map((estado) => (
              <option key={estado} value={estado}>
                {estado}
              </option>
            ))}
          </select>
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-6 dark:text-white flex items-center">
        <FontAwesomeIcon icon={faBox} className="mr-3 text-yellow-500" />
        Pedidos Realizados Manuales
      </h2>

      <div className="border dark:border-gray-700 rounded-lg overflow-hidden">
        <table className="min-w-full bg-white dark:bg-gray-800">
          <thead className="bg-[#fcb900]">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-tight text-white">
                <FontAwesomeIcon icon={faTruck} className="mr-1 inline-block align-middle" />
                ID Rastreo
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-tight text-white">
                <FontAwesomeIcon icon={faUser} className="mr-1 inline-block align-middle" />
                Cliente
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-tight text-white">
                <FontAwesomeIcon icon={faPhone} className="mr-1 inline-block align-middle" />
                Teléfono
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-tight text-white">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-1 inline-block align-middle" />
                Dirección
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-tight text-white">
                <FontAwesomeIcon icon={faClock} className="mr-1 inline-block align-middle" />
                Días
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-tight text-white">
                <FontAwesomeIcon icon={faCreditCard} className="mr-1 inline-block align-middle" />
                Pago
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-tight text-white">
                <FontAwesomeIcon icon={faDollarSign} className="mr-1 inline-block align-middle" />
                Total
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-tight text-white">
                <FontAwesomeIcon icon={faCheckCircle} className="mr-1 inline-block align-middle" />
                Estado
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-tight text-white">
                <FontAwesomeIcon icon={faEye} className="mr-1 inline-block align-middle" />
                Acción
              </th>
            </tr>
          </thead>

          <tbody>
            {currentOrders.map((order, index) => (
              <tr
                key={order.idPedido}
                className={`border-b dark:border-gray-700 transition-all duration-200 ${index % 2 === 0
                    ? "bg-gray-50 dark:bg-gray-900"
                    : "bg-white dark:bg-gray-800"
                  } hover:bg-gray-100 dark:hover:bg-gray-700`}
              >
                <td className="px-6 py-4 text-sm font-medium dark:text-gray-200">
                  {order.idRastreo}
                </td>
                <td className="px-6 py-4 text-sm font-medium dark:text-gray-200">
                  {order.cliente.nombre}
                </td>
                <td className="px-6 py-4 text-sm font-medium dark:text-gray-200">
                  {order.cliente.telefono}
                </td>
                <td className="px-6 py-4 text-sm font-medium dark:text-gray-200">
                  {order.cliente.direccion ? order.cliente.direccion.slice(0, 30) : 'Sin direccion'}...
                </td>
                <td className="px-6 py-4 text-sm font-medium dark:text-gray-200">
                  {order.fechas.diasAlquiler}
                </td>
                <td className="px-6 py-4 text-sm font-medium dark:text-gray-200">
                  {order.pago.formaPago}
                </td>
                <td className="px-6 py-4 text-sm font-medium dark:text-gray-200">
                  <span className="text-green-600 dark:text-green-400">
                    ${order.pago.total}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm dark:text-gray-200">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${order.estado === "Confirmado"
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                        : order.estado === "En alquiler"
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                          : order.estado === "Entregado"
                            ? "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300"
                            : order.estado === "Devuelto"
                              ? "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
                              : order.estado === "Incompleto"
                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                                : order.estado === "Incidente"
                                  ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                                  : order.estado === "Perdido"
                                    ? "bg-red-200 text-red-800 dark:bg-red-800 dark:text-red-300"
                                    : order.estado === "Finalizado"
                                      ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
                                      : order.estado === "Cancelado"
                                        ? "bg-black-100 text-black-800 dark:bg-black-900 dark:text-black-300"
                                        : ""
                      }`}
                  >
                    <FontAwesomeIcon
                      icon={
                        order.estado === "Confirmado"
                          ? faCheckCircle
                          : order.estado === "En alquiler"
                            ? faTruck
                            : order.estado === "Entregado"
                              ? faBoxOpen
                              : order.estado === "Devuelto"
                                ? faUndo
                                : order.estado === "Incompleto"
                                  ? faExclamationTriangle
                                  : order.estado === "Incidente"
                                    ? faExclamationCircle
                                    : order.estado === "Perdido"
                                      ? faTimes
                                      : order.estado === "Finalizado"
                                        ? faCheckCircle
                                        : order.estado === "Cancelado"
                                          ? faBan
                                          : faQuestionCircle
                      }
                      className="mr-1"
                    />
                    {order.estado}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">
                  <button
                    onClick={() => handleViewTicket(order)}
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-all duration-200 p-2 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900"
                  >
                    <FontAwesomeIcon icon={faEye} size="lg" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="flex justify-between items-center mt-4">
        <p className="text-sm dark:text-gray-300">
          Mostrando {indexOfFirstOrder + 1} -{" "}
          {Math.min(indexOfLastOrder, filteredOrders.length)} de{" "}
          {filteredOrders.length} pedidos
        </p>
        <div className="flex space-x-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-3 py-1 rounded ${currentPage === 1
                ? "bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-600"
                : "bg-yellow-500 text-white hover:bg-yellow-600 dark:bg-yellow-500 dark:hover:bg-yellow-600"
              }`}
          >
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`px-3 py-1 rounded ${currentPage === page
                  ? "bg-yellow-600 text-white dark:bg-yellow-600"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                }`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-3 py-1 rounded ${currentPage === totalPages
                ? "bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-600"
                : "bg-yellow-500 text-white hover:bg-yellow-600 dark:bg-yellow-500 dark:hover:bg-yellow-600"
              }`}
          >
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
        </div>
      </div>
    </div>
  );

  const renderTicketModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 w-full max-w-3xl rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto relative">
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 dark:from-yellow-500 dark:to-yellow-700 p-4 rounded-t-xl flex justify-between items-center">
          <h2 className="text-xl font-bold text-white flex items-center">
            <FontAwesomeIcon icon={faClipboardCheck} className="mr-2" />
            Ticket del Pedido
          </h2>
          <button
            onClick={() => setShowTicketModal(false)}
            className="text-white hover:text-red-200 transition"
          >
            <FontAwesomeIcon icon={faTimes} size="lg" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {selectedOrder && (
            <>
              {/* Order Summary */}
              <div className="border-b dark:border-gray-700 pb-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                      <FontAwesomeIcon
                        icon={faTruck}
                        className="mr-2 text-yellow-500"
                      />
                      ID Rastreo
                    </p>
                    <p className="text-lg font-semibold dark:text-white">
                      {selectedOrder.idRastreo}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                      <FontAwesomeIcon
                        icon={faCheckCircle}
                        className="mr-2 text-yellow-500"
                      />
                      Estado
                    </p>
                    <p
                      className={`text-lg font-semibold ${selectedOrder.estado === "Confirmado"
                          ? "text-green-600 dark:text-green-400"
                          : selectedOrder.estado === "Pendiente"
                            ? "text-yellow-600 dark:text-yellow-400"
                            : "text-red-600 dark:text-red-400"
                        }`}
                    >
                      {selectedOrder.estado}
                    </p>
                  </div>
                </div>
              </div>

              {/* Customer Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                    <FontAwesomeIcon
                      icon={faUser}
                      className="mr-2 text-yellow-500"
                    />
                    Cliente
                  </p>
                  <p className="font-semibold dark:text-white">
                    {selectedOrder.cliente.nombre}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                    <FontAwesomeIcon
                      icon={faPhone}
                      className="mr-2 text-yellow-500"
                    />
                    Teléfono
                  </p>
                  <p className="font-semibold dark:text-white">
                    {selectedOrder.cliente.telefono}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                    <FontAwesomeIcon
                      icon={faMapMarkerAlt}
                      className="mr-2 text-yellow-500"
                    />
                    Dirección
                  </p>
                  <p className="font-semibold dark:text-white">
                    {selectedOrder.cliente.direccion || 'Cliente sin direccion' }
                  </p>
                </div>
              </div>

              {/* Dates and Times */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t dark:border-gray-700 pt-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                    <FontAwesomeIcon
                      icon={faCalendarAlt}
                      className="mr-2 text-yellow-500"
                    />
                    Fecha Inicio
                  </p>
                  <p className="font-semibold dark:text-white">
                    {new Date(selectedOrder.fechas.inicio).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                    <FontAwesomeIcon
                      icon={faCalendarAlt}
                      className="mr-2 text-yellow-500"
                    />
                    Fecha Entrega
                  </p>
                  <p className="font-semibold dark:text-white">
                    {new Date(
                      selectedOrder.fechas.entrega
                    ).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                    <FontAwesomeIcon
                      icon={faClock}
                      className="mr-2 text-yellow-500"
                    />
                    Hora Alquiler
                  </p>
                  <p className="font-semibold dark:text-white">
                    {selectedOrder.fechas.horaAlquiler}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                    <FontAwesomeIcon
                      icon={faClock}
                      className="mr-2 text-yellow-500"
                    />
                    Días de Alquiler
                  </p>
                  <p className="font-semibold dark:text-white">
                    {selectedOrder.fechas.diasAlquiler}
                  </p>
                </div>
              </div>

              {/* Products */}
              <div className="border-t dark:border-gray-700 pt-4">
                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center mb-2">
                  <FontAwesomeIcon
                    icon={faBox}
                    className="mr-2 text-yellow-500"
                  />
                  Productos
                </p>
                <ul className="list-disc list-inside dark:text-white space-y-1">
                  {selectedOrder.productos.map((producto, index) => (
                    <li key={index} className="text-sm">
                      {producto}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Payment */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t dark:border-gray-700 pt-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                    <FontAwesomeIcon
                      icon={faCreditCard}
                      className="mr-2 text-yellow-500"
                    />
                    Forma de Pago
                  </p>
                  <p className="font-semibold dark:text-white">
                    {selectedOrder.pago.formaPago}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                    <FontAwesomeIcon
                      icon={faDollarSign}
                      className="mr-2 text-yellow-500"
                    />
                    Total
                  </p>
                  <p className="font-semibold text-lg dark:text-white">
                    ${selectedOrder.pago.total}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen dark:bg-gray-900 dark:text-white">
      <button
        onClick={handleAbrirWizard}
        className="px-6 py-3 rounded-lg bg-yellow-500 text-white font-semibold hover:bg-yellow-600 transition-all shadow-md dark:bg-yellow-500 dark:hover:bg-yellow-600"
      >
        <FontAwesomeIcon icon={faClipboardCheck} className="mr-2" />
        Realizar un Pedido
      </button>

      {renderOrdersTable()}

      {showWizard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4 dark:bg-black dark:bg-opacity-70 transition-colors">
          <div className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-xl shadow-2xl relative overflow-hidden">
            {/* Barra superior amarilla */}
            <div className="bg-yellow-400 dark:bg-yellow-500 h-2 w-full rounded-t-xl" />
            <button
              type="button"
              onClick={handleCerrarWizard}
              className="absolute top-3 right-3 text-gray-600 dark:text-gray-200 hover:text-red-600 transition"
            >
              <FontAwesomeIcon icon={faTimes} size="lg" />
            </button>

            <div className="p-6 max-h-[calc(100vh-8rem)] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <div className="flex space-x-4">
                  {[1, 2, 3, 4].map((step) => (
                    <div
                      key={step}
                      className={`flex flex-col items-center ${currentStep === step
                          ? "text-yellow-600 dark:text-yellow-400"
                          : "text-gray-400 dark:text-gray-300"
                        }`}
                    >
                      <div
                        className={`h-8 w-8 flex items-center justify-center rounded-full border-2 ${currentStep >= step
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
                      className={`px-4 py-2 rounded transition ${canGoNext()
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
                      disabled={isSubmitting}
                      className={`px-4 py-2 rounded transition flex items-center justify-center ${isSubmitting
                          ? "bg-green-400 cursor-not-allowed dark:bg-green-500"
                          : "bg-green-600 text-white hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700"
                        }`}
                    >
                      {isSubmitting ? (
                        <>
                          <svg
                            className="animate-spin h-5 w-5 mr-2 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z"
                            />
                          </svg>
                          Procesando...
                        </>
                      ) : (
                        "Finalizar"
                      )}
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
                  className={`px-4 py-2 rounded transition ${emailParaVerificar.trim()
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

      {showTicketModal && renderTicketModal()}
    </div>
  );
}

export default WizardAlquiler;