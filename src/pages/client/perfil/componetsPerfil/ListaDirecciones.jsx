/* eslint-disable */
import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faMapMarkerAlt,
  faUser,
  faPhone,
  faRoad,
  faFileSignature,
  faMapPin,
  faSpinner,
  faCheckCircle,
  faAddressCard,
  faLocationArrow,
  faHome,
  faClipboardCheck,
} from "@fortawesome/free-solid-svg-icons";
import api from "../../../../utils/AxiosConfig";
import { useAuth } from "../../../../hooks/ContextAuth";
import { toast } from "react-toastify";

const ListaDirecciones = ({ idUsuarios, isOpen, onClose, onAddressUpdated, showList = true, editAddressId}) => {
  const { csrfToken } = useAuth();
  const [direcciones, setDirecciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
 console.log("Dato recibido de dirreciones", editAddressId)

  const [showModal, setShowModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  const [ubicacion, setUbicacion] = useState("México");
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [telefono, setTelefono] = useState("");
  const [calleNumero, setCalleNumero] = useState("");
  const [referencias, setReferencias] = useState("");
  const [referencesCount, setReferencesCount] = useState(0);
  const [postalCode, setPostalCode] = useState("");
  const [estado, setEstado] = useState("");
  const [municipioInput, setMunicipioInput] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [esPredeterminada, setEsPredeterminada] = useState(false);

  const [isPostalCodeValidated, setIsPostalCodeValidated] = useState(false);
  const [hasFetchedData, setHasFetchedData] = useState(false);
  const [cpLoading, setCpLoading] = useState(false);
  const [estadosData, setEstadosData] = useState([]);
  const [municipios, setMunicipios] = useState([]);
  const [localidades, setLocalidades] = useState([]);
  const [selectedLocalidad, setSelectedLocalidad] = useState("");
  const [manualLocalidad, setManualLocalidad] = useState(false);
  const [manualLocalidadValue, setManualLocalidadValue] = useState("");

 
  const [originalCP, setOriginalCP] = useState("");
  const [userHasChangedCP, setUserHasChangedCP] = useState(false);

 
  const [nombreError, setNombreError] = useState("");
  const [apellidoError, setApellidoError] = useState("");
  const [telefonoError, setTelefonoError] = useState("");
  const [postalCodeError, setPostalCodeError] = useState("");
  const [calleNumeroError, setCalleNumeroError] = useState("");
  const [referenciasError, setReferenciasError] = useState("");
  const [localidadError, setLocalidadError] = useState("");
  const [municipioError, setMunicipioError] = useState("");
  const [estadoError, setEstadoError] = useState("");

 
 
 useEffect(() => {
  cargarDirecciones();
}, []);


 
 useEffect(() => {
  if (isOpen) {
    setShowModal(true);
    if (editAddressId) {
     
      handleOpenModal(editAddressId);
    } else {
     
      handleOpenModal(null);
    }
  }
}, [isOpen, editAddressId]);


  useEffect(() => {
    
    if (nombre.trim().length > 0) {
      if (nombre.trim().length < 3) {
        setNombreError("El nombre debe tener al menos 3 caracteres.");
      } else if (!/^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]+$/.test(nombre.trim())) {
        setNombreError("El nombre solo puede contener letras, espacios y caracteres especiales como tildes o diéresis.");
      } else {
        setNombreError("");
      }
    } else {
      setNombreError("");
    }
  }, [nombre]);
  
  useEffect(() => {
   
    if (apellido.trim().length > 0) {
      if (apellido.trim().length < 3) {
        setApellidoError("El apellido debe tener al menos 3 caracteres.");
      } else if (!/^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]+$/.test(apellido.trim())) {
        setApellidoError("El apellido solo puede contener letras, espacios y caracteres especiales como tildes o diéresis.");
      } else {
        setApellidoError("");
      }
    } else {
      setApellidoError("");
    }
  }, [apellido]);
  


  useEffect(() => {
   
    if (telefono.trim().length > 0) {
      if (!/^\d{10}$/.test(telefono.trim())) {
        setTelefonoError("El teléfono debe contener exactamente 10 dígitos.");
      } else {
        setTelefonoError("");
      }
    } else {
      setTelefonoError("");
    }
  }, [telefono]);

  useEffect(() => {
  
    if (postalCode.trim().length > 0) {
      if (!/^\d{5}$/.test(postalCode.trim())) {
        setPostalCodeError("El código postal debe tener 5 dígitos.");
      } else {
        setPostalCodeError("");
      }
    } else {
      setPostalCodeError("");
    }
  }, [postalCode]);

  useEffect(() => {
    // Validación de Calle y Número
    if (calleNumero.trim().length > 0) {
      if (calleNumero.trim().length < 5) {
        setCalleNumeroError("La dirección debe tener al menos 5 caracteres.");
      } else {
        setCalleNumeroError("");
      }
    } else {
      setCalleNumeroError("");
    }
  }, [calleNumero]);

  useEffect(() => {
    // Validación de Referencias
    if (referencias.trim().length > 0) {
      if (referencias.length > 50) {
        setReferenciasError("Las referencias no pueden exceder 50 caracteres.");
      } else if (/[<>{}]/g.test(referencias)) {
        setReferenciasError("Las referencias no pueden contener caracteres como <, >, {, }.");
      } else {
        setReferenciasError("");
      }
    } else {
      setReferenciasError("");
    }
  }, [referencias]);

  useEffect(() => {
    // Validación de Localidad
    const localidadValue = manualLocalidad ? manualLocalidadValue : selectedLocalidad;
    if (isPostalCodeValidated && (!localidadValue || localidadValue.trim().length === 0)) {
      setLocalidadError("La localidad/colonia es obligatoria.");
    } else {
      setLocalidadError("");
    }
  }, [manualLocalidad, manualLocalidadValue, selectedLocalidad, isPostalCodeValidated]);

  useEffect(() => {
  
    if (isPostalCodeValidated && (!municipioInput || municipioInput.trim().length === 0)) {
      setMunicipioError("El municipio es obligatorio.");
    } else {
      setMunicipioError("");
    }
  }, [municipioInput, isPostalCodeValidated]);


  useEffect(() => {
   
    if (isPostalCodeValidated && (!estado || estado.trim().length === 0)) {
      setEstadoError("El estado es obligatorio.");
    } else {
      setEstadoError("");
    }
  }, [estado, isPostalCodeValidated]);

  const cargarDirecciones = async () => {
    try {
      if (!idUsuarios) {
        console.warn("⚠️ ID de usuario no disponible");
        return;
      }
      setLoading(true);
      const response = await api.get("/api/direccion/listar", {
        params: { idUsuarios: idUsuarios },
        headers: { "X-CSRF-Token": csrfToken },
        withCredentials: true,
      });
      console.log("Direcciones obtenidas:", response.data);
      setDirecciones(response.data);
     
    } catch (error) {
      console.error("Error al cargar las direcciones:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (direccionId = null) => {
    setCurrentStep(1);
    if (direccionId) {
      setIsEditing(true);
      setEditId(direccionId);
      const dirToEdit = direcciones.find((dir) => dir.idDireccion === direccionId);
      console.log("Datos a editar:", dirToEdit);
      if (dirToEdit) {
        setUbicacion("México");
        setNombre(dirToEdit.nombre);
        setApellido(dirToEdit.apellido);
        setTelefono(dirToEdit.telefono);
        setCalleNumero(dirToEdit.direccion);
        setReferencias(dirToEdit.referencias || "");
        setPostalCode(dirToEdit.codigoPostal || "");
        setOriginalCP(dirToEdit.codigoPostal || "");
        setUserHasChangedCP(false);
  
        if (dirToEdit.localidad) {
          setManualLocalidad(false);
          setSelectedLocalidad(dirToEdit.localidad);
          setCiudad(dirToEdit.localidad);
          setManualLocalidadValue(dirToEdit.localidad);
        } else {
          setSelectedLocalidad("");
          setManualLocalidadValue("");
        }
        if (dirToEdit.codigoPostal && /^\d{5}$/.test(dirToEdit.codigoPostal)) {
          setIsPostalCodeValidated(true);
          setEstado(dirToEdit.estado || "");
          setMunicipioInput(dirToEdit.municipio || "");
        } else {
          setIsPostalCodeValidated(false);
          setEstado("");
          setMunicipioInput("");
        }
        setEsPredeterminada(dirToEdit.predeterminado);
  
        setEstadosData([]);
        setMunicipios([]);
        setLocalidades([]);
        setHasFetchedData(false);
  
        if (dirToEdit.codigoPostal && /^\d{5}$/.test(dirToEdit.codigoPostal)) {
          setCpLoading(true);
          fetchPostalData(dirToEdit.codigoPostal);
        }
      }
    } else {
      setIsEditing(false);
      setEditId(null);
      setUbicacion("México");
      setNombre("");
      setApellido("");
      setTelefono("");
      setCalleNumero("");
      setReferencias("");
      setPostalCode("");
      setOriginalCP("");
      setUserHasChangedCP(false);
      setIsPostalCodeValidated(false);
      setEstado("");
      setMunicipioInput("");
      setCiudad("");
      setEsPredeterminada(false);
      setEstadosData([]);
      setMunicipios([]);
      setLocalidades([]);
      setSelectedLocalidad("");
      setHasFetchedData(false);
      setManualLocalidad(false);
      setManualLocalidadValue("");
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    if (onClose) {
      onClose(); 
    }
  };

  const handleValidatePostalCode = () => {
    const cp = postalCode.trim();
    if (!/^\d{5}$/.test(cp)) {
      toast.error("El código postal debe contener 5 dígitos numéricos.");
      setIsPostalCodeValidated(false);
      return;
    }
    setCpLoading(true);
    if (!hasFetchedData) {
      fetchPostalData(cp);
    } else {
      setCpLoading(false);
    }
    setIsPostalCodeValidated(true);
  };

  const fetchPostalData = async (cp) => {
    setHasFetchedData(true);
    try {
      const url = `https://sepomex.icalialabs.com/api/v1/zip_codes?zip_code=${cp}&per_page=100`;
      const response = await axios.get(url);
      if (response.data && response.data.zip_codes && response.data.zip_codes.length > 0) {
        const uniqueEstados = [...new Set(response.data.zip_codes.map((item) => item.d_estado))];
        const uniqueMunicipios = [...new Set(response.data.zip_codes.map((item) => item.d_mnpio))];
        const uniqueLocalidades = [...new Set(response.data.zip_codes.map((item) => item.d_asenta))];

        setEstadosData(uniqueEstados);
        setMunicipios(uniqueMunicipios);
        setLocalidades(uniqueLocalidades);
        console.log("datos de localidad", uniqueLocalidades);

        setEstado(uniqueEstados[0] || "");
        setMunicipioInput(uniqueMunicipios[0] || "");
        setSelectedLocalidad(uniqueLocalidades[0] || "");
        setCiudad(uniqueLocalidades[0] || uniqueMunicipios[0] || "");
      } else {
        toast.error("Código postal no encontrado.");
        setIsPostalCodeValidated(false);
        setHasFetchedData(false);
      }
    } catch (error) {
      toast.error("Error al consultar el código postal.");
      setIsPostalCodeValidated(false);
      setHasFetchedData(false);
    } finally {
      setCpLoading(false);
    }
  };

  const groupLocalidades = (arr) => {
    const groups = {};
    arr.forEach((item) => {
      const letter = item[0].toUpperCase();
      if (!groups[letter]) groups[letter] = [];
      groups[letter].push(item);
    });
    Object.keys(groups).forEach((letter) => groups[letter].sort());
    const sortedLetters = Object.keys(groups).sort();
    return sortedLetters.map((letter) => ({
      letter,
      options: groups[letter],
    }));
  };

  const handleReferencesChange = (e) => {
    const text = e.target.value;
    if (text.length <= 50) {
      setReferencias(text);
      setReferencesCount(text.length);
    }
  };

  const isFormValidStep1 = () => {
    return (
      nombre.trim().length >= 3 &&
      /^[a-zA-Z\s]+$/.test(nombre.trim()) &&
      apellido.trim().length >= 3 &&
      /^[a-zA-Z\s]+$/.test(apellido.trim()) &&
      telefono.trim().length === 10 &&
      /^\d{10}$/.test(telefono.trim())
    );
  };

  const isFormValidStep2 = () => {
    const localidadValue = manualLocalidad ? manualLocalidadValue : selectedLocalidad;
    return (
      postalCode.trim().length === 5 &&
      isPostalCodeValidated &&
      estado.trim().length > 0 &&
      municipioInput.trim().length > 0 &&
      localidadValue.trim().length > 0
    );
  };

  const isFormValidStep3 = () => {
    return (
      calleNumero.trim().length >= 5 &&
      (!referencias || (referencias.length <= 50 && !/[<>{}]/g.test(referencias)))
    );
  };

  const isFormValidFinal = () => {
    const localidadValue = manualLocalidad ? manualLocalidadValue : selectedLocalidad;
    return (
      isFormValidStep1() &&
      isFormValidStep2() &&
      isFormValidStep3() &&
      localidadValue.trim().length > 0 &&
      estado.trim().length > 0 &&
      municipioInput.trim().length > 0
    );
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!isFormValidFinal()) {
      toast.warning("Por favor completa todos los campos obligatorios correctamente.");
      return;
    }

    const dataParaEnviar = {
      idUsuario: idUsuarios,
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      telefono: telefono.trim(),
      codigoPostal: postalCode.trim(),
      pais: "México",
      estado: estado.trim(),
      municipio: municipioInput.trim(),
      localidad: manualLocalidad ? manualLocalidadValue.trim() : selectedLocalidad.trim(),
      direccion: calleNumero.trim(),
      referencias: referencias.trim() || null,
      predeterminado: esPredeterminada,
    };

    setSaving(true);
    try {
      let response;
      if (isEditing) {
        response = await api.put(
          "/api/direccion/actualizar",
          { idDireccion: editId, ...dataParaEnviar },
          {
            headers: { "X-CSRF-Token": csrfToken },
            withCredentials: true,
          }
        );
      } else {
        response = await api.post("/api/direccion/crear", dataParaEnviar, {
          headers: { "X-CSRF-Token": csrfToken },
          withCredentials: true,
        });
      }

      if ((isEditing && response.status === 200) || (!isEditing && response.status === 201)) {
        console.log(isEditing ? "Dirección actualizada:" : "Dirección creada:", response.data);
        toast.success(
          isEditing ? "Dirección actualizada correctamente" : "Dirección creada correctamente"
        );
        if (showList) {
          cargarDirecciones();
        }
        if (onAddressUpdated) {
          onAddressUpdated();
        }
        handleCloseModal();
      }
    } catch (error) {
      console.error("Error al guardar la dirección:", error);
      if (error.response && error.response.data && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("No se pudo guardar la dirección. Revisa la consola para más detalles.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Deseas eliminar esta dirección?")) {
      try {
        const response = await api.delete("/api/direccion/eliminar", {
          data: { idDireccion: id, idUsuario: idUsuarios },
          headers: { "X-CSRF-Token": csrfToken },
          withCredentials: true,
        });
        if (response.status === 200) {
          toast.success("Dirección eliminada correctamente");
          cargarDirecciones();
          if (onAddressUpdated) {
            onAddressUpdated(); // Notificar al componente padre (DetallesPago)
          }
        }
      } catch (error) {
        console.error("Error al eliminar la dirección:", error);
        if (error.response && error.response.data && error.response.data.message) {
          toast.error(error.response.data.message);
        } else {
          toast.error("No se pudo eliminar la dirección. Revisa la consola para más detalles.");
        }
      }
    }
  };


  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const canGoNext = () => {
    if (currentStep === 1) return isFormValidStep1();
    if (currentStep === 2) return isFormValidStep2();
    if (currentStep === 3) return isFormValidStep3();
    return false;
  };

  const renderStep1 = () => (
    <div className="space-y-4">
    <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
      <FontAwesomeIcon icon={faAddressCard} className="mr-2 text-blue-600" />
      Paso 1: Datos Personales
    </h2>
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Nombre* (mínimo 3 caracteres)
        </label>
        <div className="mt-1 relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            <FontAwesomeIcon icon={faUser} />
          </span>
          <input
            type="text"
            placeholder="Tal cual figure en el IFE"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
            className="pl-9 block w-full py-2 border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>
        {nombreError && <p className="text-xs text-red-500">{nombreError}</p>}
      </div>
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Apellido* (mínimo 3 caracteres)
        </label>
        <div className="mt-1 relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            <FontAwesomeIcon icon={faUser} />
          </span>
          <input
            type="text"
            value={apellido}
            onChange={(e) => setApellido(e.target.value)}
            required
            className="pl-9 block w-full py-2 border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>
        {apellidoError && <p className="text-xs text-red-500">{apellidoError}</p>}
      </div>
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Número de Teléfono (10 dígitos)
        </label>
        <div className="mt-1 relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            <FontAwesomeIcon icon={faPhone} />
          </span>
          <input
            type="text"
            value={telefono}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "");
              setTelefono(val);
            }}
            maxLength={10}
            className="pl-9 block w-full py-2 border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>
        {telefonoError && <p className="text-xs text-red-500">{telefonoError}</p>}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
        <FontAwesomeIcon icon={faLocationArrow} className="mr-2 text-blue-600" />
        Paso 2: Ubicación
      </h2>
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Código Postal (5 dígitos)
        </label>
        <div className="mt-1 flex items-center space-x-2">
          <div className="relative w-full">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              <FontAwesomeIcon icon={faMapPin} />
            </span>
            <input
              type="text"
              value={postalCode}
              onChange={(e) => {
                const cp = e.target.value.replace(/\D/g, "").slice(0, 5);
                setPostalCode(cp);
                setIsPostalCodeValidated(false);
                setHasFetchedData(false);
                setUserHasChangedCP(cp !== originalCP);
              }}
              placeholder="Ej: 12345"
              className="pl-9 block w-full py-2 border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          {postalCode.trim().length === 5 && !isPostalCodeValidated && (
            <button
              type="button"
              onClick={handleValidatePostalCode}
              className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition flex items-center"
            >
              {cpLoading ? <FontAwesomeIcon icon={faSpinner} spin /> : "Validar"}
            </button>
          )}
        </div>
        {postalCodeError && <p className="text-xs text-red-500">{postalCodeError}</p>}
      </div>

      {isPostalCodeValidated && (
        <>
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              País
            </label>
            <div className="mt-1 relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <FontAwesomeIcon icon={faMapPin} />
              </span>
              <input
                type="text"
                value={ubicacion}
                readOnly
                className="pl-9 block w-full py-2 bg-gray-100 border-gray-300 rounded"
              />
            </div>
          </div>
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Estado
            </label>
            <div className="mt-1 relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <FontAwesomeIcon icon={faFileSignature} />
              </span>
              <input
                type="text"
                disabled
                value={estado}
                onChange={(e) => setEstado(e.target.value)}
                className="pl-9 block w-full py-2 bg-gray-100 border-gray-300 rounded"
              />
            </div>
            {estadoError && <p className="text-xs text-red-500">{estadoError}</p>}
          </div>
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Municipio
            </label>
            <div className="mt-1 relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <FontAwesomeIcon icon={faMapPin} />
              </span>
              <input
                type="text"
                value={municipioInput}
                onChange={(e) => setMunicipioInput(e.target.value)}
                className="pl-9 block w-full py-2 border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            {municipioError && <p className="text-xs text-red-500">{municipioError}</p>}
          </div>
          {(isEditing && isPostalCodeValidated && !userHasChangedCP) ? (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Localidad/Colonia (Valor actual)
              </label>
              <div className="mt-1 relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <FontAwesomeIcon icon={faMapPin} />
                </span>
                <input
                  type="text"
                  placeholder="Ingresa la localidad/colonia"
                  value={manualLocalidadValue}
                  onChange={(e) => setManualLocalidadValue(e.target.value)}
                  className="pl-9 block w-full py-2 border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              {localidadError && <p className="text-xs text-red-500">{localidadError}</p>}
            </div>
          ) : (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Localidad/Colonia
              </label>
              <div className="flex items-center space-x-2 mt-1">
                <label className="flex items-center space-x-1">
                  <input
                    type="radio"
                    name="localidadType"
                    checked={!manualLocalidad}
                    onChange={() => setManualLocalidad(false)}
                  />
                  <span className="text-sm">Seleccionar</span>
                </label>
                <label className="flex items-center space-x-1">
                  <input
                    type="radio"
                    name="localidadType"
                    checked={manualLocalidad}
                    onChange={() => setManualLocalidad(true)}
                  />
                  <span className="text-sm">Manual</span>
                </label>
              </div>
              {manualLocalidad ? (
                <div className="mt-1 relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                    <FontAwesomeIcon icon={faMapPin} />
                  </span>
                  <input
                    type="text"
                    placeholder="Ingresa la localidad/colonia"
                    value={manualLocalidadValue}
                    onChange={(e) => setManualLocalidadValue(e.target.value)}
                    className="pl-9 block w-full py-2 border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
              ) : (
                <div className="mt-1 relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                    <FontAwesomeIcon icon={faMapPin} />
                  </span>
                  <select
                    className="pl-9 block w-full py-2 border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={selectedLocalidad}
                    onChange={(e) => {
                      setSelectedLocalidad(e.target.value);
                      setCiudad(e.target.value);
                    }}
                  >
                    {groupLocalidades(localidades).map((group) => (
                      <optgroup key={group.letter} label={group.letter}>
                        {group.options.map((item, idx) => (
                          <option key={idx} value={item}>
                            {item}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>
              )}
              {localidadError && <p className="text-xs text-red-500">{localidadError}</p>}
            </div>
          )}
        </>
      )}
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
        <FontAwesomeIcon icon={faHome} className="mr-2 text-blue-600" />
        Paso 3: Detalles de Dirección
      </h2>
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Dirección (Calle y Número)
        </label>
        <div className="mt-1 relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            <FontAwesomeIcon icon={faRoad} />
          </span>
          <input
            type="text"
            placeholder="Calle y Número"
            value={calleNumero}
            onChange={(e) => setCalleNumero(e.target.value)}
            className="pl-9 block w-full py-2 border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>
        {calleNumeroError && <p className="text-xs text-red-500">{calleNumeroError}</p>}
      </div>
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Referencias (máx. 50 caracteres)
        </label>
        <textarea
          placeholder="Apartamento, suite, etc."
          value={referencias}
          onChange={handleReferencesChange}
          className="mt-1 pl-3 pt-2 block w-full border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          rows="3"
        />
        <div className="text-xs text-gray-500 mt-1">
          {referencesCount} / 50 caracteres
        </div>
        {referenciasError && <p className="text-xs text-red-500">{referenciasError}</p>}
      </div>
      <div className="flex items-center space-x-2 mt-2">
        <input
          type="checkbox"
          checked={esPredeterminada}
          onChange={(e) => setEsPredeterminada(e.target.checked)}
          className="h-4 w-4"
          disabled={isEditing && esPredeterminada}
        />
        <label className="text-sm text-gray-700 dark:text-gray-300">
          Hacer predeterminada (opcional)
        </label>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
        <FontAwesomeIcon icon={faClipboardCheck} className="mr-2 text-blue-600" />
        Paso 4: Confirmación
      </h2>
      <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md">
        <p className="text-sm text-gray-800 dark:text-gray-100 mb-2">
          <strong>Nombre:</strong> {nombre} {apellido}
        </p>
        <p className="text-sm text-gray-800 dark:text-gray-100 mb-2">
          <strong>Teléfono:</strong> {telefono}
        </p>
        <p className="text-sm text-gray-800 dark:text-gray-100 mb-2">
          <strong>Código Postal:</strong> {postalCode}
        </p>
        <p className="text-sm text-gray-800 dark:text-gray-100 mb-2">
          <strong>Estado:</strong> {estado}
        </p>
        <p className="text-sm text-gray-800 dark:text-gray-100 mb-2">
          <strong>Municipio:</strong> {municipioInput}
        </p>
        <p className="text-sm text-gray-800 dark:text-gray-100 mb-2">
          <strong>Localidad:</strong>{" "}
          {manualLocalidad ? manualLocalidadValue : selectedLocalidad}
        </p>
        <p className="text-sm text-gray-800 dark:text-gray-100 mb-2">
          <strong>Dirección:</strong> {calleNumero}
        </p>
        <p className="text-sm text-gray-800 dark:text-gray-100 mb-2">
          <strong>Referencias:</strong> {referencias}
        </p>
        {esPredeterminada && (
          <p className="text-sm text-green-600 dark:text-green-300">
            <FontAwesomeIcon icon={faCheckCircle} /> Será la dirección predeterminada
          </p>
        )}
      </div>
    </div>
  );






  return (
    <>
      <div className="px-4 sm:px-6 lg:px-8 py-4">
        {showList && (
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 sm:mb-0">
                MI LIBRETA DE DIRECCIONES
              </h1>
              {direcciones.length < 6 && (
                <button
                  onClick={() => handleOpenModal(null)}
                  className="inline-flex items-center px-4 py-2 bg-yellow-600 text-white text-sm font-semibold rounded shadow hover:bg-yellow-700 transition-all"
                >
                  + AÑADIR DIRECCIÓN NUEVA
                </button>
              )}
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-6 text-yellow-600">
                <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                Cargando direcciones...
              </div>
            ) : direcciones.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-400 text-center">
                No tienes direcciones registradas.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {direcciones.map((dir) => (
                  <div
                    key={dir.idDireccion}
                    className="border border-gray-200 dark:border-gray-600 rounded-lg p-5 bg-white dark:bg-gray-700 shadow-sm hover:shadow-md transition-all"
                  >
                    <div className="flex flex-col space-y-2">
                      <div className="text-lg font-semibold text-gray-700 dark:text-gray-100 flex items-center justify-between">
                        <span>{dir.nombre} {dir.apellido}</span>
                        {dir.telefono && (
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            <FontAwesomeIcon icon={faPhone} className="mr-1" />
                            {dir.telefono}
                          </span>
                        )}
                      </div>

                      {dir.referencias && (
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          {dir.referencias}
                        </div>
                      )}

                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        {dir.localidad}, {dir.municipio}, {dir.estado}, {dir.pais}
                      </div>

                      <div className="text-sm text-gray-500">
                        <FontAwesomeIcon icon={faMapPin} className="mr-1 text-gray-400" />
                        <strong>CP:</strong> {dir.codigoPostal || "N/A"}
                      </div>

                      {dir.predeterminado === 1 && (
                        <div className="flex items-center text-green-600 text-sm">
                          <FontAwesomeIcon icon={faCheckCircle} className="mr-1" />
                          <span>Predeterminada</span>
                        </div>
                      )}

                      <div className="flex items-center space-x-4 text-sm pt-2">
                        <button
                          onClick={() => handleDelete(dir.idDireccion)}
                          className="text-red-500 hover:text-red-600 font-medium transition-colors"
                        >
                          Eliminar
                        </button>
                        <button
                          onClick={() => handleOpenModal(dir.idDireccion)}
                          className="text-yellow-500 hover:text-yellow-600 font-medium transition-colors"
                        >
                          Editar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-lg p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
            >
              <FontAwesomeIcon icon={faTimes} size="lg" />
            </button>

            <div className="mb-6">
              <div className="flex justify-between items-center">
                {Array.from({ length: totalSteps }, (_, index) => (
                  <div key={index} className="flex-1 text-center">
                    <div
                      className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center ${
                        currentStep > index + 1
                          ? "bg-green-500 text-white"
                          : currentStep === index + 1
                          ? "bg-yellow-600 text-white"
                          : "bg-gray-300 text-gray-600"
                      }`}
                    >
                      {currentStep > index + 1 ? (
                        <FontAwesomeIcon icon={faCheckCircle} />
                      ) : (
                        index + 1
                      )}
                    </div>
                    <p className="text-xs mt-1 text-gray-600 dark:text-gray-300">
                      {index === 0
                        ? "Datos Personales"
                        : index === 1
                        ? "Ubicación"
                        : index === 2
                        ? "Detalles"
                        : "Revisión"}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-2 h-1 bg-gray-200 dark:bg-gray-600 rounded">
                <div
                  className="h-1 bg-yellow-600 rounded transition-all duration-300"
                  style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                />
              </div>
            </div>

            <form onSubmit={handleSave}>
              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}
              {currentStep === 3 && renderStep3()}
              {currentStep === 4 && renderStep4()}

              <div className="mt-6 flex justify-between">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition"
                  >
                    Anterior
                  </button>
                )}
                {currentStep < totalSteps ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    disabled={!canGoNext()}
                    className={`px-4 py-2 rounded transition ${
                      canGoNext()
                        ? "bg-yellow-600 text-white hover:bg-yellow-700"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    Siguiente
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={saving || !isFormValidFinal()}
                    className={`px-4 py-2 rounded transition flex items-center ${
                      saving || !isFormValidFinal()
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-green-600 text-white hover:bg-green-700"
                    }`}
                  >
                    {saving ? (
                      <>
                        <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                        Guardando...
                      </>
                    ) : (
                      "Guardar Dirección"
                    )}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default ListaDirecciones;