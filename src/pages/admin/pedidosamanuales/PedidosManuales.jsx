import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faAddressCard,
  faDollarSign,
  faLocationArrow,
  faHome,
  faClipboardCheck,
  faSpinner,
  faMoneyCheckAlt,
  faUser,
  faEye,
  faMapMarkerAlt,
  faPhone,
  faEnvelope,
  faCalendarAlt,
  faClock,
  faCreditCard,
  faBox,
  faTruck,
  faCheckCircle,
  faBoxOpen,
  faUndo,
  faExclamationTriangle,
  faExclamationCircle,
  faBan,
  faQuestionCircle,
  faChartBar,
  faTasks,
  faFilter,
  faChevronLeft,
  faChevronRight,
  faCalendar,
  faHourglassStart,
  faShippingFast,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import api from "../../../utils/AxiosConfig";
import { useAuth } from "../../../hooks/ContextAuth";
import DashboardPedidos from "../dashboard/DashboardPedidos";
import StepOne from "./StepOne";
import StepTwo from "./StepTwo";
import StepThree from "./StepThree";
import StepFour from "./StepFour";
import PaymentModal from "./PaymentModal";
import CustomLoading from "../../../components/spiner/SpinerGlobal";

function WizardAlquiler({ onNavigate, setPedidos }) {
  const { csrfToken, user } = useAuth();
  const [useNewAddress, setUseNewAddress] = useState(false);
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

  const [showPaymentsModal, setShowPaymentsModal] = useState(false);

  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  const handleViewPayments = (order) => {
    setSelectedOrder(order);
    setShowPaymentsModal(true);
  };

  const handleClosePayments = () => {
    setShowPaymentsModal(false);
    setSelectedOrder(null);
  };

  const handlePaymentRegistered = () => {
    fetchOrders();
  };

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
        if (useNewAddress) {
          return (
            codigoPostal.trim().length === 5 &&
            cpValido &&
            pais.trim().length > 0 &&
            estado.trim().length > 0 &&
            municipio.trim().length > 0 &&
            localidad.trim().length > 0 &&
            direccion.trim().length >= 5
          );
        } else {
          return selectedDireccionId !== null;
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

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setIsLoadingOrders(true);
    try {
      const response = await api.get("/api/pedidos/pedidos-manuales", {
        withCredentials: true,
        headers: { "X-CSRF-Token": csrfToken },
      });
      if (response.data.success) {
        const sortedOrders = response.data.data.sort((a, b) => {
          const dateA = new Date(a.fechas.inicio);
          const dateB = new Date(b.fechas.inicio);
          return dateB - dateA; // Orden descendente (mayor a menor)
        });
    
        setOrders(sortedOrders);
        setPedidos(sortedOrders);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Error al cargar los pedidos");
   } finally {
    setIsLoadingOrders(false);
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
      fetchOrders(); // Actualiza la lista con el nuevo ordenamiento

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
      useNewAddress={useNewAddress}
      setUseNewAddress={setUseNewAddress}
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

  const filteredOrders =
    filterEstado === "Todos"
      ? orders
      : orders.filter((order) => order.estado === filterEstado);
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(
    indexOfFirstOrder,
    indexOfLastOrder
  );
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const estadosDisponibles = [
    "Todos",
    "Procesando",
    "Enviando",
    "Confirmado",
    "En alquiler",
    "Devuelto",
    "Incompleto",
    "Incidente",
    "Recogiendo",
  ];

  const renderOrdersTable = () => (
    <div className="mt-10 overflow-x-auto animate-fade-in-up rounded-xl dark:bg-gray-900 p-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 space-y-4 md:space-y-0">
        <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-2 sm:space-y-0">
          <button
            onClick={() => onNavigate("Gestion Pedidos")}
            className="flex items-center justify-center px-5 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <FontAwesomeIcon icon={faTasks} className="mr-2" />
            Gestionar Pedidos
          </button>
          <button
            onClick={() => onNavigate("Dashboard-pedidos")}
            className="flex items-center justify-center px-5 py-2 bg-purple-600 text-white rounded-lg shadow-md hover:bg-purple-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-purple-400"
          >
            <FontAwesomeIcon icon={faChartBar} className="mr-2" />
            Ver Dashboard
          </button>
        </div>

        <div className="flex items-center space-x-3">
          <FontAwesomeIcon icon={faFilter} className="text-yellow-500" />
          <select
            value={filterEstado}
            onChange={(e) => {
              setFilterEstado(e.target.value);
              setCurrentPage(1);
            }}
            className="p-2 border border-gray-300 rounded-md bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
          >
            {estadosDisponibles.map((estado) => (
              <option key={estado} value={estado}>
                {estado}
              </option>
            ))}
          </select>
        </div>
      </div>

      <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-5 flex items-center">
        <FontAwesomeIcon icon={faBox} className="mr-3 text-yellow-500" />
        Pedidos Activos Realizados
      </h2>
      {isLoadingOrders ? (
      <CustomLoading/>
    ) : (

      <div className="overflow-x-auto rounded-lg shadow-md">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-yellow-500 dark:bg-yellow-600 sticky top-0 z-10">
            <tr>
              {[
                "ID Rastreo",
                "Cliente",
                "Teléfono",
                "Dirección",
                "Días",
                "Pago",
                "Total",
                "Estado",
                "Acción",
              ].map((title, idx) => (
                <th
                  key={idx}
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-white select-none"
                >
                  {title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {currentOrders.map((order, index) => (
              <tr
                key={order.idPedido}
                className={`transition-colors duration-200 ${
                  index % 2 === 0
                    ? "bg-white dark:bg-gray-800"
                    : "bg-gray-50 dark:bg-gray-900"
                } hover:bg-yellow-100 dark:hover:bg-yellow-900`}
              >
                <td
                  className="px-4 py-3 text-sm dark:text-white whitespace-nowrap max-w-[120px] truncate"
                  title={order.idRastreo}
                >
                  {order.idRastreo}
                </td>
                <td
                  className="px-4 py-3 text-sm dark:text-white whitespace-nowrap max-w-[150px] truncate"
                  title={order.cliente.nombre}
                >
                  {order.cliente.nombre}
                </td>
                <td className="px-4 py-3 text-sm dark:text-white whitespace-nowrap">
                  {order.cliente.telefono}
                </td>
                <td
                  className="px-4 py-3 text-sm dark:text-white max-w-[200px] truncate"
                  title={order.cliente.direccion || "Sin dirección"}
                >
                  {order.cliente.direccion
                    ? order.cliente.direccion
                    : "Sin dirección"}
                </td>
                <td className="px-4 py-3 text-sm dark:text-white text-center">
                  {order.fechas.diasAlquiler}
                </td>
                <td
                  className="px-4 py-3 text-sm dark:text-white whitespace-nowrap max-w-[120px] truncate"
                  title={order.pago.estadoPago}
                >
                  {order.pago.estadoPago}
                </td>
                <td className="px-4 py-3 text-sm font-semibold text-green-700 dark:text-green-400 whitespace-nowrap">
                  ${order.totalPagar}
                </td>
                <td className="px-4 py-3 text-sm whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold select-none ${
                      order.estado === "Procesando"
                        ? "bg-orange-200 text-orange-800"
                        : order.estado === "Confirmado"
                        ? "bg-green-200 text-green-800"
                        : order.estado === "Enviando"
                        ? "bg-blue-200 text-blue-800"
                        : order.estado === "En alquiler"
                        ? "bg-purple-200 text-purple-800"
                        : order.estado === "Devuelto"
                        ? "bg-gray-200 text-gray-800"
                        : order.estado === "Incompleto"
                        ? "bg-yellow-200 text-yellow-800"
                        : order.estado === "Incidente"
                        ? "bg-red-200 text-red-800"
                        : order.estado === "Cancelado"
                        ? "bg-black text-white"
                        : order.estado === "Finalizado"
                        ? "bg-green-800 text-green-100"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    <FontAwesomeIcon icon={faCheckCircle} className="mr-1" />
                    {order.estado}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm flex space-x-2 justify-center text-blue-600 dark:text-blue-400">
                  <button
                    onClick={() => handleViewTicket(order)}
                    className="p-2 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    aria-label="Ver ticket"
                  >
                    <FontAwesomeIcon icon={faEye} size="lg" />
                  </button>
                  <button
                    onClick={() => handleViewPayments(order)}
                    className="p-2 rounded-full hover:bg-green-100 dark:hover:bg-green-900 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-400"
                    title="Ver pagos"
                    aria-label="Ver pagos"
                  >
                    <FontAwesomeIcon
                      icon={faDollarSign}
                      size="lg"
                      className="text-green-600 dark:text-green-400"
                    />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}

      {showPaymentsModal && selectedOrder && (
        <PaymentModal
          selectedOrder={selectedOrder}
          onClose={handleClosePayments}
          onPaymentRegistered={handlePaymentRegistered}
        />
      )}

      <div className="flex flex-col md:flex-row justify-between items-center mt-6 space-y-2 md:space-y-0">
        <p className="text-sm text-gray-700 dark:text-gray-300">
          Mostrando {indexOfFirstOrder + 1} -{" "}
          {Math.min(indexOfLastOrder, filteredOrders.length)} de{" "}
          {filteredOrders.length} pedidos
        </p>
        <div className="flex space-x-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-3 py-1 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 ${
              currentPage === 1
                ? "bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-600"
                : "bg-yellow-500 text-white hover:bg-yellow-600"
            }`}
            aria-label="Página anterior"
          >
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`px-3 py-1 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 ${
                currentPage === page
                  ? "bg-yellow-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200"
              }`}
              aria-label={`Página ${page}`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-3 py-1 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 ${
              currentPage === totalPages
                ? "bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-600"
                : "bg-yellow-500 text-white hover:bg-yellow-600"
            }`}
            aria-label="Página siguiente"
          >
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
        </div>
      </div>

      <div className="flex justify-center mt-6">
        <button
          onClick={() => onNavigate("pedidos-calendario")}
          className="flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg shadow-md hover:bg-teal-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-teal-400"
        >
          <FontAwesomeIcon icon={faCalendar} className="mr-2" />
          Organización de Pedidos Activos
        </button>
      </div>
    </div>
  );

  const renderTicketModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-2 sm:p-4 animate-fade-in">
      <div className="bg-white dark:bg-gray-900 w-full max-w-4xl rounded-2xl shadow-2xl max-h-[95vh] overflow-hidden relative border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-400 to-orange-500 dark:from-amber-600 dark:via-yellow-600 dark:to-orange-600 p-4 flex justify-between items-center sticky top-0 z-10 rounded-t-2xl">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 rounded-full p-2 sm:p-3">
              <FontAwesomeIcon
                icon={faClipboardCheck}
                className="text-white text-base sm:text-lg"
              />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white select-none">
              Ticket del Pedido
            </h2>
          </div>
          <button
            onClick={() => setShowTicketModal(false)}
            className="bg-white/20 hover:bg-white/30 rounded-full p-2 text-white transition-all duration-200 hover:scale-110"
            aria-label="Cerrar modal ticket"
          >
            <FontAwesomeIcon icon={faTimes} size="lg" />
          </button>
        </div>

        {/* Contenido con scroll */}
        <div className="overflow-y-auto max-h-[calc(95vh-72px)] scrollbar-thin scrollbar-thumb-yellow-500 scrollbar-track-gray-100 dark:scrollbar-thumb-yellow-600 dark:scrollbar-track-gray-800">
          <div className="p-5 space-y-6">
            {selectedOrder && (
              <>
                {/* Status Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-blue-100 rounded-xl p-4 border border-blue-300 dark:bg-blue-900/20 dark:border-blue-700 flex items-center space-x-3">
                    <div className="bg-blue-600 rounded-full p-2 sm:p-3">
                      <FontAwesomeIcon
                        icon={faTruck}
                        className="text-white text-xs sm:text-sm"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-800 dark:text-blue-400">
                        ID de Rastreo
                      </p>
                      <p className="font-bold text-lg text-blue-900 dark:text-white break-all">
                        {selectedOrder.idRastreo}
                      </p>
                    </div>
                  </div>

                  <div className="bg-green-100 rounded-xl p-4 border border-green-300 dark:bg-green-900/20 dark:border-green-700 flex items-center space-x-3 shadow-md">
                    <div
                      className={`rounded-full p-2 sm:p-3 transition-colors duration-300 ${
                        selectedOrder.estado === "Procesando"
                          ? "bg-orange-500"
                          : selectedOrder.estado === "Confirmado"
                          ? "bg-green-500"
                          : selectedOrder.estado === "Enviando"
                          ? "bg-blue-500"
                          : selectedOrder.estado === "En alquiler"
                          ? "bg-purple-500"
                          : selectedOrder.estado === "Devuelto"
                          ? "bg-gray-500"
                          : selectedOrder.estado === "Incompleto"
                          ? "bg-yellow-500"
                          : selectedOrder.estado === "Incidente"
                          ? "bg-red-500"
                          : selectedOrder.estado === "Cancelado"
                          ? "bg-black"
                          : selectedOrder.estado === "Finalizado"
                          ? "bg-green-800"
                          : "bg-gray-400"
                      }`}
                    >
                      <FontAwesomeIcon
                        icon={faCheckCircle}
                        className="text-white text-xs sm:text-sm"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 select-none">
                        Estado del Pedido
                      </p>
                      <p
                        className={`font-bold text-lg select-text transition-colors duration-300 ${
                          selectedOrder.estado === "Procesando"
                            ? "text-orange-600 dark:text-orange-400"
                            : selectedOrder.estado === "Confirmado"
                            ? "text-green-600 dark:text-green-400"
                            : selectedOrder.estado === "Enviando"
                            ? "text-blue-600 dark:text-blue-400"
                            : selectedOrder.estado === "En alquiler"
                            ? "text-purple-600 dark:text-purple-400"
                            : selectedOrder.estado === "Devuelto"
                            ? "text-gray-600 dark:text-gray-400"
                            : selectedOrder.estado === "Incompleto"
                            ? "text-yellow-600 dark:text-yellow-400"
                            : selectedOrder.estado === "Incidente"
                            ? "text-red-600 dark:text-red-400"
                            : selectedOrder.estado === "Cancelado"
                            ? "text-black dark:text-gray-300"
                            : selectedOrder.estado === "Finalizado"
                            ? "text-green-800 dark:text-green-600"
                            : "text-gray-600 dark:text-gray-400"
                        }`}
                      >
                        {selectedOrder.estado}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Información del Cliente */}
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-5 border border-gray-300 dark:border-gray-700">
                  <div className="flex items-center space-x-3 mb-5">
                    <div className="bg-purple-600 rounded-full p-2 sm:p-3">
                      <FontAwesomeIcon
                        icon={faUser}
                        className="text-white text-xs sm:text-sm"
                      />
                    </div>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white select-none">
                      Información del Cliente
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                        Nombre
                      </p>
                      <p className="font-semibold text-base sm:text-lg text-gray-900 dark:text-white break-words">
                        {selectedOrder.cliente.nombre}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 font-medium flex items-center">
                        <FontAwesomeIcon
                          icon={faPhone}
                          className="mr-2 text-purple-600 text-xs sm:text-sm"
                        />
                        Teléfono
                      </p>
                      <p className="font-semibold text-base sm:text-lg text-gray-900 dark:text-white break-words">
                        {selectedOrder.cliente.telefono}
                      </p>
                    </div>
                    <div className="sm:col-span-2 lg:col-span-1">
                      <p className="text-xs text-gray-600 dark:text-gray-400 font-medium flex items-center">
                        <FontAwesomeIcon
                          icon={faMapMarkerAlt}
                          className="mr-2 text-purple-600 text-xs sm:text-sm"
                        />
                        Dirección
                      </p>
                      <p className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white break-words leading-relaxed">
                        {selectedOrder.cliente.direccion ||
                          "Cliente sin dirección"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Fechas y Horarios */}
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-xl p-5 border border-indigo-200 dark:border-indigo-700">
                  <div className="flex items-center space-x-3 mb-5">
                    <div className="bg-indigo-600 rounded-full p-2">
                      <FontAwesomeIcon
                        icon={faCalendarAlt}
                        className="text-white text-xs"
                      />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white select-none">
                      Programación del Alquiler
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-300 dark:border-gray-600 text-center">
                      <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-1">
                        Fecha Inicio
                      </p>
                      <p className="font-bold text-gray-900 dark:text-white text-sm">
                        {new Date(
                          selectedOrder.fechas.inicio
                        ).toLocaleDateString("es-ES", {
                          weekday: "short",
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-300 dark:border-gray-600 text-center">
                      <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-1">
                        Fecha Entrega
                      </p>
                      <p className="font-bold text-gray-900 dark:text-white text-sm">
                        {new Date(
                          selectedOrder.fechas.entrega
                        ).toLocaleDateString("es-ES", {
                          weekday: "short",
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-300 dark:border-gray-600 text-center">
                      <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-1 flex items-center justify-center">
                        <FontAwesomeIcon
                          icon={faClock}
                          className="mr-1 text-indigo-600"
                        />
                        Hora
                      </p>
                      <p className="font-bold text-gray-900 dark:text-white text-sm">
                        {selectedOrder.fechas.horaAlquiler}
                      </p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-300 dark:border-gray-600 text-center">
                      <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-1">
                        Días Totales
                      </p>
                      <p className="font-bold text-gray-900 dark:text-white text-sm">
                        {selectedOrder.fechas.diasAlquiler} días
                      </p>
                    </div>
                  </div>
                </div>

                {/* Tabla Productos */}
                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 sm:p-6 border border-amber-200 dark:border-amber-700">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="bg-amber-600 rounded-full p-2">
                      <FontAwesomeIcon
                        icon={faBox}
                        className="text-white text-sm"
                      />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white select-none">
                      Productos del Pedido
                    </h3>
                  </div>

                  <div className="overflow-auto max-h-56 rounded-md border border-amber-300 dark:border-amber-700">
                    <table className="min-w-full divide-y divide-amber-300 dark:divide-amber-700 text-sm text-left">
                      <thead className="bg-amber-200 dark:bg-amber-700 sticky top-0 z-10">
                        <tr>
                          <th className="px-4 py-2 font-semibold text-gray-700 dark:text-amber-200">
                            Cantidad
                          </th>
                          <th className="px-4 py-2 font-semibold text-gray-700 dark:text-amber-200">
                            Nombre
                          </th>
                          <th className="px-4 py-2 font-semibold text-gray-700 dark:text-amber-200">
                            Color
                          </th>
                          <th className="px-4 py-2 font-semibold text-gray-700 dark:text-amber-200">
                            Precio Unitario
                          </th>
                          <th className="px-4 py-2 font-semibold text-gray-700 dark:text-amber-200">
                            Subtotal
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-amber-300 dark:divide-amber-700">
                        {selectedOrder.productos.map((producto, index) => (
                          <tr
                            key={index}
                            className={`${
                              index % 2 === 0
                                ? "bg-white dark:bg-gray-900"
                                : "bg-gray-50 dark:bg-gray-800"
                            }`}
                          >
                            <td className="px-4 py-3 text-gray-900 dark:text-white">
                              {producto.cantidad}
                            </td>
                            <td className="px-4 py-3 text-gray-900 dark:text-white">
                              {producto.nombre}
                            </td>
                            <td className="px-4 py-3 text-gray-900 dark:text-white">
                              {producto.color}
                            </td>
                            <td className="px-4 py-3 text-gray-900 dark:text-white">
                              ${producto.precioUnitario}
                            </td>
                            <td className="px-4 py-3 text-gray-900 dark:text-white">
                              ${producto.subtotal}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Información de Pago */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 rounded-xl p-4 sm:p-6 border border-green-200 dark:border-green-700">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="bg-green-600 rounded-full p-2">
                      <FontAwesomeIcon
                        icon={faCreditCard}
                        className="text-white text-sm"
                      />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white select-none">
                      Información de Pago
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-green-200 dark:border-green-600">
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-2">
                        Forma de Pago
                      </p>
                      <p
                        className="font-bold text-gray-900 dark:text-white"
                        title={selectedOrder.pago.formaPago}
                      >
                        {selectedOrder.pago.formaPago}
                      </p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-green-200 dark:border-green-600">
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-2 flex items-center">
                        <FontAwesomeIcon
                          icon={faDollarSign}
                          className="mr-2 text-green-500"
                        />
                        Total del Pedido
                      </p>
                      <p className="font-bold text-2xl text-green-600 dark:text-green-400">
                        ${selectedOrder.totalPagar}
                      </p>
                    </div>
                  </div>

                  {/* Resumen de Pagos */}
                  <div className="border-t border-green-200 dark:border-green-700 pt-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <FontAwesomeIcon
                        icon={faMoneyCheckAlt}
                        className="text-green-500"
                      />
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        Historial de Pagos
                      </h4>
                    </div>

                    {selectedOrder.pago.resumen &&
                    selectedOrder.pago.resumen.length > 0 ? (
                      <div className="space-y-2 max-h-32 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-green-500 scrollbar-track-green-100 dark:scrollbar-thumb-green-600 dark:scrollbar-track-green-900 mb-4">
                        {selectedOrder.pago.resumen.map((pagoStr, idx) => (
                          <div
                            key={idx}
                            className="bg-green-100 dark:bg-green-900/50 rounded-lg p-3 text-sm border border-green-200 dark:border-green-700"
                            title={pagoStr}
                          >
                            <span className="text-gray-800 dark:text-gray-200 break-words">
                              {pagoStr}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400 italic mb-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                        No hay pagos registrados aún.
                      </p>
                    )}

                    {/* Estado de Pago */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-green-200 dark:border-green-600">
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">
                          Total Pagado
                        </p>
                        <p className="text-lg font-bold text-green-600 dark:text-green-400">
                          ${selectedOrder.pago.totalPagado ?? 0}
                        </p>
                      </div>

                      <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-green-200 dark:border-green-600">
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">
                          Estado de Pago
                        </p>
                        <p
                          className={`text-lg font-bold capitalize ${
                            selectedOrder.pago.estadoPago === "completado"
                              ? "text-green-600 dark:text-green-400"
                              : selectedOrder.pago.estadoPago === "parcial"
                              ? "text-yellow-600 dark:text-yellow-400"
                              : "text-red-600 dark:text-red-400"
                          }`}
                        >
                          {selectedOrder.pago.estadoPago || "pendiente"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
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
                      disabled={isSubmitting}
                      className={`px-4 py-2 rounded transition flex items-center justify-center ${
                        isSubmitting
                          ? "bg-green-400 cursor-not-allowed dark:bg-green-500"
                          : "bg-green-600 text-white hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700"
                      }`}
                    >
                      {isSubmitting ? (
                        <>
                          <svg
                            className="animate-spin h-5 w-5 mr-2 text-white"
                            xmlns="http://www.w3/2000/svg"
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

      {showTicketModal && renderTicketModal()}
    </div>
  );
}

export default WizardAlquiler;