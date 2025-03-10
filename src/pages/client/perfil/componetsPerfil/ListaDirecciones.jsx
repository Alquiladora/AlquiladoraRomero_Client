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

function ListaDirecciones({ idUsuarios }) {
  const { csrfToken } = useAuth();
  const [direcciones, setDirecciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    cargarDirecciones();
  }, []);

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

  // Estados del modal y wizard
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

  // Para detectar si el usuario cambió el CP en edición
  const [originalCP, setOriginalCP] = useState("");
  const [userHasChangedCP, setUserHasChangedCP] = useState(false);

  // Errores de validación
  const [nombreError, setNombreError] = useState("");
  const [apellidoError, setApellidoError] = useState("");
  const [telefonoError, setTelefonoError] = useState("");
  const [postalCodeError, setPostalCodeError] = useState("");

  useEffect(() => {
    if (nombre.trim().length > 0 && nombre.trim().length < 3) {
      setNombreError("El nombre debe tener al menos 3 caracteres.");
    } else {
      setNombreError("");
    }
  }, [nombre]);

  useEffect(() => {
    if (apellido.trim().length > 0 && apellido.trim().length < 3) {
      setApellidoError("El apellido debe tener al menos 3 caracteres.");
    } else {
      setApellidoError("");
    }
  }, [apellido]);

  useEffect(() => {
    if (telefono.trim().length > 0 && !/^\d{10}$/.test(telefono.trim())) {
      setTelefonoError("El teléfono debe contener exactamente 10 dígitos.");
    } else {
      setTelefonoError("");
    }
  }, [telefono]);

  useEffect(() => {
    if (postalCode.trim().length > 0 && !/^\d{5}$/.test(postalCode.trim())) {
      setPostalCodeError("El código postal debe tener 5 dígitos.");
    } else {
      setPostalCodeError("");
    }
  }, [postalCode]);

  const handleOpenModal = (direccionId = null) => {
    setCurrentStep(1);
    if (direccionId) {
      
      setIsEditing(true);
      setEditId(direccionId);
      const dirToEdit = direcciones.find(
        (dir) => dir.idDireccion === direccionId
      );
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
  };

  
  const handleValidatePostalCode = () => {
    const cp = postalCode.trim();
    if (!/^\d{5}$/.test(cp)) {
      alert("El código postal debe contener 5 dígitos numéricos.");
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

        setEstadosData(uniqueEstados);
        setMunicipios(uniqueMunicipios);
        setLocalidades(uniqueLocalidades);
        console.log("datos de localidda", uniqueLocalidades)

        // Asignar valores por defecto obtenidos de la API
        setEstado(uniqueEstados[0] || "");
        setMunicipioInput(uniqueMunicipios[0] || "");
        setSelectedLocalidad(uniqueLocalidades[0] || "");
        setCiudad(uniqueLocalidades[0] || uniqueMunicipios[0] || "");
      } else {
        alert("Código postal no encontrado.");
        setIsPostalCodeValidated(false);
        setHasFetchedData(false);
      }
    } catch (error) {
      alert("Error al consultar el código postal.");
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
      apellido.trim().length >= 3 &&
      telefono.trim().length === 10
    );
  };
  const isFormValidStep2 = () => {
    return postalCode.trim().length === 5 && isPostalCodeValidated;
  };
  const isFormValidStep3 = () => {
    return calleNumero.trim().length > 0;
  };
  const isFormValidFinal = () => {
    return (
      isFormValidStep1() &&
      isFormValidStep2() &&
      isFormValidStep3() &&
      ((manualLocalidad && manualLocalidadValue.trim().length > 0) ||
        (!manualLocalidad && selectedLocalidad.trim().length > 0)) &&
      estado.trim().length > 0 &&
      municipioInput.trim().length > 0
    );
  };

 
  const handleSave = async (e) => {
    e.preventDefault();
    if (!isFormValidFinal()) {
      toast.warning("Por favor completa todos los campos obligatorios.");
      return;
    }
    const dataParaEnviar = {
      idUsuario: idUsuarios,
      nombre,
      apellido,
      telefono: telefono.trim(),
      codigoPostal: postalCode.trim(),
      pais: "México",
      estado: estado.trim(),
      municipio: municipioInput.trim(),
      localidad: manualLocalidad
        ? manualLocalidadValue.trim()
        : selectedLocalidad.trim(),
      direccion: calleNumero.trim(),
      referencias: referencias.trim() || null,
      predeterminado: esPredeterminada,
    };
    setSaving(true);
    try {
      let response;
      if (isEditing) {
        
        response = await api.put("/api/direccion/actualizar", 
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
          isEditing
            ? "Dirección actualizada correctamente"
            : "Dirección creada correctamente"
        );
        cargarDirecciones();
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
          withCredentials: true
        });
        if (response.status === 200) {
          toast.success("Dirección eliminada correctamente");
          cargarDirecciones();
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
  
  const handleSetPredeterminada = (id) => {
    setDirecciones((prev) =>
      prev.map((dir) => ({
        ...dir,
        predeterminada: dir.id === id,
      }))
    );
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
      {/* Nombre */}
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
      {/* Teléfono */}
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
      {/* Código Postal */}
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
        {postalCodeError && (
          <p className="text-xs text-red-500">{postalCodeError}</p>
        )}
      </div>

      {isPostalCodeValidated && (
        <>
          {/* País */}
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
          {/* Estado (Deshabilitado) */}
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
          </div>
          {/* Municipio */}
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
          </div>
          {/* Localidad/Colonia */}
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
      {/* Calle y Número */}
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
      </div>
      {/* Referencias */}
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
      </div>
      {/* Predeterminado */}
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

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      default:
        return null;
    }
  };

 

  const renderModal = () => {
    if (!showModal) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
        <div className="bg-white dark:bg-gray-800 w-full max-w-lg rounded shadow-lg relative">
          <div className="bg-yellow-400 h-2 w-full rounded-t"></div>
          <button
            className="absolute top-2 right-2 text-gray-600 dark:text-gray-300 hover:text-red-600 transition"
            onClick={handleCloseModal}
          >
            <FontAwesomeIcon icon={faTimes} size="lg" />
          </button>
          <div className="p-6">
         
            <div className="flex justify-between items-center mb-4">
              <div className="flex space-x-4">
                {/* Paso 1 */}
                <div
                  className={`flex flex-col items-center ${
                    currentStep === 1 ? "text-blue-600" : "text-gray-400"
                  }`}
                >
                  <div
                    className={`h-8 w-8 flex items-center justify-center rounded-full border-2 ${
                      currentStep >= 1 ? "border-blue-600" : "border-gray-400"
                    }`}
                  >
                    <FontAwesomeIcon icon={faAddressCard} size="sm" />
                  </div>
                  <span className="text-xs mt-1">Datos</span>
                </div>
                {/* Paso 2 */}
                <div
                  className={`flex flex-col items-center ${
                    currentStep === 2 ? "text-blue-600" : "text-gray-400"
                  }`}
                >
                  <div
                    className={`h-8 w-8 flex items-center justify-center rounded-full border-2 ${
                      currentStep >= 2 ? "border-blue-600" : "border-gray-400"
                    }`}
                  >
                    <FontAwesomeIcon icon={faLocationArrow} size="sm" />
                  </div>
                  <span className="text-xs mt-1">Ubicación</span>
                </div>
                {/* Paso 3 */}
                <div
                  className={`flex flex-col items-center ${
                    currentStep === 3 ? "text-blue-600" : "text-gray-400"
                  }`}
                >
                  <div
                    className={`h-8 w-8 flex items-center justify-center rounded-full border-2 ${
                      currentStep >= 3 ? "border-blue-600" : "border-gray-400"
                    }`}
                  >
                    <FontAwesomeIcon icon={faHome} size="sm" />
                  </div>
                  <span className="text-xs mt-1">Dirección</span>
                </div>
                {/* Paso 4 */}
                <div
                  className={`flex flex-col items-center ${
                    currentStep === 4 ? "text-blue-600" : "text-gray-400"
                  }`}
                >
                  <div
                    className={`h-8 w-8 flex items-center justify-center rounded-full border-2 ${
                      currentStep >= 4 ? "border-blue-600" : "border-gray-400"
                    }`}
                  >
                    <FontAwesomeIcon icon={faClipboardCheck} size="sm" />
                  </div>
                  <span className="text-xs mt-1">Confirmación</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
              {renderStep()}

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
                    className={`px-4 py-2 rounded ${
                      canGoNext()
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-gray-400 text-gray-200 cursor-not-allowed"
                    } transition`}
                    disabled={!canGoNext()}
                  >
                    Siguiente
                  </button>
                )}
                {currentStep === totalSteps && (
                  <button
                    type="submit"
                    className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 transition"
                    disabled={saving}
                  >
                    {saving ? (
                      <div className="flex items-center space-x-2">
                        <FontAwesomeIcon icon={faSpinner} spin />
                        <span>{isEditing ? "Actualizando..." : "Guardando..."}</span>
                      </div>
                    ) : (
                      isEditing ? "Actualizar" : "Guardar"
                    )}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
          MI LIBRETA DE DIRECCIONES
        </h1>
  
        <button
          onClick={() => handleOpenModal(null)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded shadow hover:bg-blue-700 transition-all"
        >
          + AÑADIR DIRECCIÓN NUEVA
        </button>
  
        {loading ? (
          <div className="flex justify-center items-center py-6 text-blue-600">
            <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
            Cargando direcciones...
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {direcciones.map((dir) => (
              <div
                key={dir.idDireccion}
                className="border border-gray-200 dark:border-gray-600 rounded-md p-4 bg-white dark:bg-gray-700 shadow-sm hover:shadow-md transition"
              >
                <div className="text-lg font-semibold text-gray-700 dark:text-gray-100 mb-2">
                  {dir.nombre} {dir.apellido}
                  {dir.telefono && (
                    <span className="ml-2 text-sm text-gray-600 dark:text-gray-300">
                      <FontAwesomeIcon icon={faPhone} className="mr-1" />
                      {dir.telefono}
                    </span>
                  )}
                </div>
  
                {dir.referencias && (
                  <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                    {dir.referencias}
                  </div>
                )}
  
                <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                  {dir.localidad}, {dir.municipio}, {dir.estado}, {dir.pais}
                </div>
  
                <div className="text-sm text-gray-500 mb-2">
                  <FontAwesomeIcon icon={faMapPin} className="mr-1 text-gray-400" />
                  <strong>CP:</strong> {dir.codigoPostal || "N/A"}
                </div>
  
                {dir.predeterminado === 1 && (
                  <div className="flex items-center text-green-600 text-sm mb-2">
                    <FontAwesomeIcon icon={faCheckCircle} className="mr-1" />
                    <span>Predeterminada</span>
                  </div>
                )}
  
                <div className="flex items-center space-x-2 text-sm">
                  <button
                    onClick={() => handleDelete(dir.idDireccion)}
                    className="text-red-500 hover:underline"
                  >
                    Eliminar
                  </button>
                  <button
                    onClick={() => handleOpenModal(dir.idDireccion)}
                    className="text-blue-500 hover:underline"
                  >
                    Editar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
  
      {renderModal()}
    </div>
  );
}

export default ListaDirecciones;


//NOTA ----10/03/ ----FALTA VALIDACIONES A INSERAR Y ACTUALIZAR 