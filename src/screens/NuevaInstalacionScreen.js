import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  LogBox,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { postInstalacionNevera, updateGestionAndProduction } from '../services/instalacionService';
import { useAuth } from '../hooks/useAuth';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DatosGenerales from '../components/DatosGenerales';
import FuncionamientoEquipo from '../components/FuncionamientoEquipo';
import Observaciones from '../components/Observaciones';
import FirmaCliente from '../components/FirmaCliente';
import VistaPrevia from '../components/VistaPrevia';
import BarcodeScanner from '../components/BarcodeScanner';
import ValidationModal from '../components/ValidationModal';
import ConfirmationModal from '../components/ConfirmationModal';
import VoiceInput from '../components/VoiceInput';
import GPSRequiredModal from '../components/GPSRequiredModal';
import { takePhotoCompressed, pickFromGalleryCompressed } from '../utils/imageUtil';
import { requestCameraPermission, requestGalleryPermission } from '../utils/permissions';
import { LocationContext } from '../context/LocationContext';
import { getDataByCodNevera, validateNeveraStatus, validateTechnicianSync } from '../services/neveraService';
import { uploadImageToServer } from '../services/uploadService';

// Suprimir warning de VirtualizedList en ScrollView
LogBox.ignoreLogs([
  'VirtualizedLists should never be nested',
]);

const NuevaInstalacionScreen = ({ navigation }) => {
  // Obtener usuario autenticado
  const { idUsuario } = useAuth();

  // Función helper para formatear fecha en formato YYYY-MM-DD HH:MM:SS
  const formatDateTime = (date) => {
    const d = new Date(date);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const mi = String(d.getMinutes()).padStart(2, '0');
    const ss = String(d.getSeconds()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
  };

  // Obtener ubicación desde el contexto
  const { location, getCurrentLocation, checkGPSStatus, startGPSMonitoring, stopGPSMonitoring } = useContext(LocationContext);

  // Estados para verificación de GPS
  const [showGPSModal, setShowGPSModal] = useState(false);
  const [isCheckingGPS, setIsCheckingGPS] = useState(false);

  // Control de pasos (1-5: Datos Generales, Funcionamiento Equipo, Observaciones, Firma Cliente, Vista Previa)
  const [currentStep, setCurrentStep] = useState(1);

  // Estado del formulario - Paso 1
  const [formDataStep1, setFormDataStep1] = useState({
    codigoNevera: '',
    modelo: '',
    distribuidor: '',
    cliente: '',
    rucDni: '',
    departamento: '',
    provincia: '',
    distrito: '',
    direccion: '',
    iccidChip: '',
    imei: '',
    otro: '',
  });

  // Estado del formulario - Paso 2
  const [formDataStep2, setFormDataStep2] = useState({
    // Lugar de Instalación (nuevo)
    lugarInstalacion: '',

    // Inspección Previa
    neveraEnergizadaPrev: false,
    compresorEnciendePrev: false,
    termostatoOperativoPrev: false,
    cableadoBuenasCondPrev: false,
    comentario: '',
    fotoInspeccionPrevia: null,

    // Fotos de instalación
    fotoCajaMetalicaAbierta: null,
    fotoEmpalmeCable: null,
    fotoCajaMetalicaCerrada: null,
    fotoFachadaNevera: null,

    // Reinspección Posterior
    neveraEnergizadaPost: false,
    compresorPost: false,
    termostatoPost: false,
    cableadoElectricoPost: false,
    cierreRejilla: false,
  });

  // Estado del formulario - Paso 3
  const [formDataStep3, setFormDataStep3] = useState({
    observacion1: '',
    fotoObservacion1: null,
    observacion2: '',
    fotoObservacion2: null,
    showObservacion2: false, // Controla si se muestra la segunda observación
  });

  // Estado del formulario - Paso 4
  const [formDataStep4, setFormDataStep4] = useState({
    fotoFirma: null,
    nombresApellidos: '',
    dniCliente: '',
  });

  // Estado para PDF - Paso 5
  const [pdfUrl, setPdfUrl] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  // Estados para modales
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [currentScanField, setCurrentScanField] = useState(null);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [validationData, setValidationData] = useState(null);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showVoiceInput, setShowVoiceInput] = useState(false);
  const [currentVoiceField, setCurrentVoiceField] = useState(null);
  const [currentVoiceFieldLabel, setCurrentVoiceFieldLabel] = useState('');
  const [loading, setLoading] = useState(false);
  const [showImageSourceModal, setShowImageSourceModal] = useState(false);
  const [currentPhotoField, setCurrentPhotoField] = useState(null);

  // Persistencia de datos de instalación
  const [instalacionData, setInstalacionData] = useState({
    // Datos generales
    codigo: '',
    modelo: '',
    distribuidor: '',
    clienteNombres: '',
    rucDni: '',
    departamento: '',
    provincia: '',
    distrito: '',
    direccion: '',
    iccidChip: '',
    imeiDispositivo: '',
    otro: '',

    // Inspección previa
    iprevNeveraEnergizada: 'NO',
    iprevCompresorEnciende: 'NO',
    iprevTermostatoOp: 'NO',
    iprevEstaCableElec: 'NO',
    iprevComentario: '',
    iprevFoto: '',
    iprevFotoPath: '',

    // Coordenadas
    latitud: '',
    longitud: '',

    // Fotos de instalación
    fotoDispInstaCajaMetalicaAbierta: '',
    fotoDispInstaCajaMetalicaAbiertaPath: '',
    fotoEmpalmeCable: '',
    fotoEmpalmeCablePath: '',
    fotoDispInstaCajaMetalicaCerrada: '',
    fotoDispInstaCajaMetalicaCerradaPath: '',
    fotoFachadaNevera: '',
    fotoFachadeNeveraPath: '',

    // Datos de validación
    transmisionRedCelular: "SI",
    alertaDesconexion: "SI",
    alertaReconexion: "SI",
    transmisionGps: "SI",

    // Inspección posterior
    cierreRejilla: 'NO',
    ipostNeveraEnergizada: 'NO',
    ipostCompresorEnciende: 'NO',
    ipostTermostatoOp: 'NO',
    ipostEstaCableElec: 'NO',

    // Observaciones
    observacion1: '',
    fotoObservacion1: '',
    fotoObservacion1Path: '',
    observacion2: '',
    fotoObservacion2: '',
    fotoObservacion2Path: '',

    // Firma del técnico (Step 4)
    tecnicoFirma: null,
    tecnicoFirmaPath: null,
    tecnicoNombreApellido: null,
    tecnicoDni: null,

    // Firma del cliente
    clienteRespFirma: '',
    clienteRespFirmaPath: '',
    clienteRespNombreApellido: '',
    clienteRespDni: '',

    idNevera: null,
    idCliente: null,
    idUsuario: null,

    // PDF
    pdfPath: '',
  });

  // Función helper para convertir boolean a "SI"/"NO"
  const booleanToSiNo = (value) => {
    return value ? 'SI' : 'NO';
  };

  // Función helper para mostrar Toast de forma segura
  const showToast = (config) => {
    // Ocultar cualquier Toast anterior
    Toast.hide();
    
    // Mostrar el nuevo Toast con un pequeño delay
    setTimeout(() => {
      Toast.show({
        ...config,
        autoHide: true, // Siempre auto-ocultar
      });
    }, 100);
  };

  // Manejar cambio de campo - Paso 1
  const handleChangeFieldStep1 = (fieldName, value) => {
    setFormDataStep1({ ...formDataStep1, [fieldName]: value });
  };

  // Verificar GPS al montar el componente
  useEffect(() => {
    const verifyGPS = async () => {
      setIsCheckingGPS(true);
      try {
        const isEnabled = await checkGPSStatus();
        if (!isEnabled) {
          setShowGPSModal(true);
        } else {
          setShowGPSModal(false);
        }
      } catch (error) {
        console.log('Error verificando GPS:', error);
        setShowGPSModal(true);
      } finally {
        setIsCheckingGPS(false);
      }
    };

    verifyGPS();

    // Iniciar monitoreo continuo del GPS
    const monitoringInterval = startGPSMonitoring((isEnabled) => {
      if (!isEnabled) {
        setShowGPSModal(true);
        Toast.show({
          type: 'error',
          text1: 'GPS Desactivado',
          text2: 'Por favor, activa el GPS para continuar',
          position: 'bottom',
          visibilityTime: 3000,
        });
      }
    });

    // Cleanup: detener monitoreo al desmontar
    return () => {
      if (monitoringInterval) {
        clearInterval(monitoringInterval);
      }
      stopGPSMonitoring();
    };
  }, [checkGPSStatus, startGPSMonitoring, stopGPSMonitoring]);

  // Reintentar verificación de GPS
  const handleRetryGPS = async () => {
    setIsCheckingGPS(true);
    try {
      const isEnabled = await checkGPSStatus();
      if (isEnabled) {
        setShowGPSModal(false);
        Toast.show({
          type: 'success',
          text1: 'GPS Activado',
          text2: 'Ahora puedes continuar con la instalación',
          position: 'bottom',
          visibilityTime: 2000,
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'GPS aún desactivado',
          text2: 'Por favor, activa el GPS en la configuración',
          position: 'bottom',
          visibilityTime: 3000,
        });
      }
    } catch (error) {
      console.log('Error reintentando GPS:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'No se pudo verificar el estado del GPS',
        position: 'bottom',
        visibilityTime: 3000,
      });
    } finally {
      setIsCheckingGPS(false);
    }
  };

  // Manejar actualización del ICCID desde el autocompletado de IMEI
  const handleIccidUpdate = (iccidValue) => {
    console.log('📝 Actualizando ICCID desde IMEI:', iccidValue);
    setFormDataStep1({ ...formDataStep1, iccidChip: iccidValue });
  };

  // Autocompletar datos cuando el código de nevera tiene >= 10 caracteres
  useEffect(() => {
    // Agregar una bandera para controlar si ya se consultó este código
    const codigoNevera = formDataStep1.codigoNevera.trim();

    // Solo consultar si tiene EXACTAMENTE 10 o más caracteres, no está vacío y no se ha consultado antes
    if (codigoNevera.length >= 10) {
      // Verificar si ya consultamos este código antes
      if (instalacionData.codigo === codigoNevera) {
        console.log('Este código ya fue consultado anteriormente, no se volverá a consultar');
        return;
      }

      setLoading(true);

      try {
        console.log('🔍 Consultando datos para código:', codigoNevera);
        const fetchNeveraData = async () => {
          const data = await getDataByCodNevera(codigoNevera);

          // Guardar el IMEI actual antes de actualizar
          const currentImei = formDataStep1.imei;
          const isManualImei = currentImei && currentImei !== 'sin imei' && currentImei.length > 0;

          // Autocompletar campos solo si vienen datos
          setFormDataStep1(prev => ({
            ...prev,
            modelo: data.modelo || prev.modelo,
            distribuidor: data.distribuidor || prev.distribuidor,
            cliente: data.cliente || prev.cliente,
            rucDni: data.ruc_dni || prev.ruc_dni,
            departamento: data.departamento || prev.departamento,
            distrito: data.distrito || prev.distrito,
            direccion: data.direccion || prev.direccion,
            iccidChip: data.iccid_chip || prev.iccidChip,
            // Preservar el IMEI si ya fue ingresado manualmente
            imei: isManualImei ? currentImei : (data.imei_dispositivo || prev.imei),
          }));

          // Marcar este código como ya consultado
          setInstalacionData(prev => ({
            ...prev,
            codigo: codigoNevera
          }));

          Toast.show({
            type: 'success',
            text1: 'Datos autocompletados',
            text2: `Nevera: ${codigoNevera}`,
            position: 'bottom',
            visibilityTime: 2000,
          });

          console.log('Datos autocompletados:', data);
        };

        // Ejecutar la consulta
        fetchNeveraData();

      } catch (error) {
        console.error('Error obteniendo datos de nevera:', error);
        // Silenciar error 400 (código no encontrado o incompleto)
        if (error.response?.status === 400) {
          console.log('Código no encontrado o incompleto');
        } else {
          // Solo mostrar toast para otros errores
          Toast.show({
            type: 'error',
            text1: 'Error de conexión',
            text2: 'No se pudo consultar los datos',
            position: 'bottom',
            visibilityTime: 2000,
          });
        }
      } finally {
        setLoading(false);
      }
    }

    // Debounce para evitar consultas mientras escribe
    const timeoutId = setTimeout(() => {}, 800);

    return () => clearTimeout(timeoutId);
  }, [formDataStep1.codigoNevera, formDataStep1.imei, instalacionData.codigo]);

  // Manejar cambio de campo - Paso 2
  const handleChangeFieldStep2 = (fieldName, value) => {
    setFormDataStep2({ ...formDataStep2, [fieldName]: value });
  };

  // Manejar cambio de campo - Paso 3
  const handleChangeFieldStep3 = (fieldName, value) => {
    setFormDataStep3({ ...formDataStep3, [fieldName]: value });
  };

  // Manejar cambio de campo - Paso 4
  const handleChangeFieldStep4 = (fieldName, value) => {
    setFormDataStep4({ ...formDataStep4, [fieldName]: value });
  };

  // Manejar entrada por voz
  const handleVoiceInput = (fieldName, fieldLabel = '') => {
    console.log('Iniciando entrada por voz para:', fieldName, fieldLabel);

    // Determinar el paso actual para actualizar el formData correcto
    let voiceField = fieldName;
    let voiceLabel = fieldLabel || fieldName;

    // Para paso 1 (DatosGenerales)
    if (currentStep === 1) {
      setCurrentVoiceField(fieldName);
      setCurrentVoiceFieldLabel(voiceLabel);
      setShowVoiceInput(true);
    }
    // Para paso 3 (Observaciones)
    else if (currentStep === 3) {
      setCurrentVoiceField(fieldName);
      setCurrentVoiceFieldLabel(voiceLabel);
      setShowVoiceInput(true);
    }
    // Para paso 4 (FirmaCliente)
    else if (currentStep === 4) {
      setCurrentVoiceField(fieldName);
      setCurrentVoiceFieldLabel(voiceLabel);
      setShowVoiceInput(true);
    }
  };

  // Manejar resultado de voz
  const handleVoiceResult = (text) => {
    console.log('Texto de voz recibido:', text);
    console.log('Campo destino:', currentVoiceField);
    console.log('Paso actual:', currentStep);

    // Actualizar el formData según el paso actual
    if (currentStep === 1 && currentVoiceField) {
      setFormDataStep1({ ...formDataStep1, [currentVoiceField]: text });
      console.log('FormDataStep1 actualizado con voz');
    } else if (currentStep === 3 && currentVoiceField) {
      setFormDataStep3({ ...formDataStep3, [currentVoiceField]: text });
      console.log('FormDataStep3 actualizado con voz');
    } else if (currentStep === 4 && currentVoiceField) {
      setFormDataStep4({ ...formDataStep4, [currentVoiceField]: text });
      console.log('FormDataStep4 actualizado con voz');
    }

    // Mostrar toast de confirmación
    Toast.show({
      type: 'success',
      text1: 'Texto reconocido',
      text2: text,
      position: 'bottom',
      visibilityTime: 2000,
    });

    // Resetear estados
    setCurrentVoiceField(null);
    setCurrentVoiceFieldLabel('');
  };

  // Manejar cambio de firma - subir inmediatamente al servidor
  const handleSignatureChange = async (signatureData) => {
    if (signatureData && signatureData.uri) {
      try {
        setLoading(true);

        // Subir firma al servidor
        console.log('📤 Subiendo firma del cliente al servidor...');
        const filename = await uploadImageToServer(signatureData.uri, instalacionData.codigo);
        console.log('✅ Firma subida:', filename);

        // Construir URL de previsualización
        const previewUrl = `https://phuyu-iot.com/NESTLE-API-TECNICOS/public/${filename}`;

        // Guardar URL de previsualización y filename
        setFormDataStep4({
          ...formDataStep4,
          fotoFirma: previewUrl,
          fotoFirmaFileName: filename
        });

        Toast.show({
          type: 'success',
          text1: 'Firma guardada y subida',
          text2: 'Firma guardada en el servidor',
          position: 'bottom',
        });
      } catch (error) {
        console.error('Error subiendo firma:', error);
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: error.message || 'No se pudo subir la firma',
          position: 'bottom',
        });
      } finally {
        setLoading(false);
      }
    }
  };

  // Manejar escaneo de código de barras
  const handleBarcodeScan = (fieldName) => {
    console.log('Iniciando escaneo para campo:', fieldName);
    setCurrentScanField(fieldName);
    setShowBarcodeScanner(true);
  };

  // Manejar código escaneado
  const handleCodeScanned = (code) => {
    console.log('Código recibido:', code);
    console.log('Campo actual:', currentScanField);
    console.log('FormData antes:', formDataStep1);

    setFormDataStep1({ ...formDataStep1, [currentScanField]: code });
    setShowBarcodeScanner(false);
    setCurrentScanField(null);

    console.log('FormData actualizado');

    Toast.show({
      type: 'success',
      text1: 'Código Escaneado',
      text2: code,
      position: 'bottom',
      visibilityTime: 2000,
    });
  };

  // Manejar toma de fotos - Pasos 2 y 3
  const handleTakePhoto = (fieldName) => {
    setCurrentPhotoField(fieldName);
    setShowImageSourceModal(true);
  };

  // Mapeo de claves para Paso 2: nombre corto -> campo de estado con prefijo 'foto'
  const mapStep2PhotoKey = (key) => {
    switch (key) {
      case 'inspeccionPrevia':
        return 'fotoInspeccionPrevia';
      case 'cajaMetalicaAbierta':
        return 'fotoCajaMetalicaAbierta';
      case 'empalmeCable':
        return 'fotoEmpalmeCable';
      case 'cajaMetalicaCerrada':
        return 'fotoCajaMetalicaCerrada';
      case 'fachadaNevera':
        return 'fotoFachadaNevera';
      default:
        return key; // Para Paso 3 viene ya como 'fotoObservacionX'
    }
  };

  // Tomar foto desde cámara
  const handleTakeFromCamera = async () => {
    setShowImageSourceModal(false);

    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;

    try {
      setLoading(true);
      const result = await takePhotoCompressed();
      if (result) {
        // Subir imagen al servidor
        console.log('📤 Subiendo imagen al servidor...');
        const filename = await uploadImageToServer(result.uri, instalacionData.codigo);
        console.log('✅ Imagen subida:', filename);

        // Construir URL de previsualización
        const previewUrl = `https://phuyu-iot.com/NESTLE-API-TECNICOS/public/${filename}`;

        // Guardar tanto la URL de previsualización como el filename
        if (currentStep === 2) {
          const stateKey = mapStep2PhotoKey(currentPhotoField);
          setFormDataStep2({
            ...formDataStep2,
            [stateKey]: previewUrl,
            [`${stateKey}FileName`]: filename
          });
        } else if (currentStep === 3) {
          const stateKey = currentPhotoField; // Ya viene como 'fotoObservacion1|2'
          setFormDataStep3({
            ...formDataStep3,
            [stateKey]: previewUrl,
            [`${stateKey}FileName`]: filename
          });
        }

        Toast.show({
          type: 'success',
          text1: 'Foto capturada y subida',
          text2: 'Imagen guardada en el servidor',
          position: 'bottom',
        });
      }
    } catch (error) {
      console.error('Error en handleTakeFromCamera:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'No se pudo tomar la foto',
        position: 'bottom',
      });
    } finally {
      setLoading(false);
      setCurrentPhotoField(null);
    }
  };

  // Seleccionar foto desde galería
  const handlePickFromGallery = async () => {
    setShowImageSourceModal(false);

    const hasPermission = await requestGalleryPermission();
    if (!hasPermission) return;

    try {
      setLoading(true);
      const result = await pickFromGalleryCompressed();
      if (result) {
        // Subir imagen al servidor
        console.log('📤 Subiendo imagen al servidor...');
        const filename = await uploadImageToServer(result.uri, instalacionData.codigo);
        console.log('✅ Imagen subida:', filename);

        // Construir URL de previsualización
        const previewUrl = `https://phuyu-iot.com/NESTLE-API-TECNICOS/public/${filename}`;

        // Guardar tanto la URL de previsualización como el filename
        if (currentStep === 2) {
          const stateKey = mapStep2PhotoKey(currentPhotoField);
          setFormDataStep2({
            ...formDataStep2,
            [stateKey]: previewUrl,
            [`${stateKey}FileName`]: filename
          });
        } else if (currentStep === 3) {
          const stateKey = currentPhotoField;
          setFormDataStep3({
            ...formDataStep3,
            [stateKey]: previewUrl,
            [`${stateKey}FileName`]: filename
          });
        }

        Toast.show({
          type: 'success',
          text1: 'Imagen seleccionada y subida',
          text2: 'Imagen guardada en el servidor',
          position: 'bottom',
        });
      }
    } catch (error) {
      console.error('Error en handlePickFromGallery:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'No se pudo seleccionar la imagen',
        position: 'bottom',
      });
    } finally {
      setLoading(false);
      setCurrentPhotoField(null);
    }
  };

  // Manejar eliminación de fotos - Pasos 2 y 3
  const handleDeletePhoto = (fieldName) => {
    if (currentStep === 2) {
      setFormDataStep2({
        ...formDataStep2,
        [fieldName]: null,
        [`${fieldName}FileName`]: null
      });
    } else if (currentStep === 3) {
      setFormDataStep3({
        ...formDataStep3,
        [fieldName]: null,
        [`${fieldName}FileName`]: null
      });
    }
    Toast.show({
      type: 'info',
      text1: 'Foto eliminada',
      text2: 'Puede tomar una nueva foto',
      position: 'bottom',
    });
  };

  // Validar y mostrar modal (Paso 1 → Paso 2)
  const handleNext = async () => {
    // Validar que el código de nevera no esté vacío
    const codigoNevera = formDataStep1.codigoNevera?.trim();
    if (!codigoNevera || codigoNevera === '') {
      Toast.show({
        type: 'error',
        text1: 'Código de nevera requerido',
        text2: 'Debes ingresar el código de nevera antes de continuar.',
        position: 'bottom',
        visibilityTime: 3500,
      });
      return;
    }

    // Validar que el IMEI no esté vacío y no sea "sin imei"
    const imei = formDataStep1.imei?.trim().toLowerCase();
    if (!imei || imei === '' || imei === 'sin imei') {
      Toast.show({
        type: 'error',
        text1: 'IMEI requerido',
        text2: 'Debes ingresar o escanear el IMEI del dispositivo antes de continuar.',
        position: 'bottom',
        visibilityTime: 3500,
      });
      return;
    }

    setLoading(true);

    try {
      // Paso 1: Validar estado de la nevera
      console.log('Validando estado de nevera:', formDataStep1.codigoNevera);
      const statusResponse = await validateNeveraStatus(formDataStep1.codigoNevera);

      if (statusResponse.status !== 1) {
        setLoading(false);
        Toast.show({
          type: 'error',
          text1: 'Error de validación',
          text2: statusResponse.msg || 'No se pudo validar el estado de la nevera',
          position: 'bottom',
          visibilityTime: 3000,
        });
        return;
      }

      console.log('Estado de nevera validado:', statusResponse);

      // Paso 2: Obtener ubicación y validar sincronización
      const currentLocation = await getCurrentLocation();
      const currentDateTime = formatDateTime(new Date());

      console.log('Validando sincronización con:', {
        fecha: currentDateTime,
        latitud: currentLocation.latitude,
        longitud: currentLocation.longitude,
        imei: formDataStep1.imei,
      });

      const syncResponse = await validateTechnicianSync(
        currentDateTime,
        currentLocation.latitude,
        currentLocation.longitude,
        formDataStep1.imei,
        2
      );

      console.log('Respuesta de sincronización:', syncResponse);

      // Verificar si al menos uno de los eventos es "Conectado" o "Desconectado"
      let hasSyncEvent = false;
      let conectadoFecha = null;
      let desconectadoFecha = null;

      if (Array.isArray(syncResponse) && syncResponse.length > 0) {
        for (const item of syncResponse) {
          if (item.evento === 'Conectado') {
            hasSyncEvent = true;
            conectadoFecha = item.fecha;
          } else if (item.evento === 'Desconectado') {
            hasSyncEvent = true;
            desconectadoFecha = item.fecha;
          }
        }
      }

      // Obtener señal GPS y señal celular del primer elemento
      const primeraRespuesta = syncResponse[0] || {};
      const senalGPS = primeraRespuesta.gps || 0;
      const senalCelular = primeraRespuesta.senial || 0.0;

      // Preparar datos para el modal
      const deviceData = {
        sincronizado: hasSyncEvent,
        conexion: currentDateTime,
        coordenadas: `${currentLocation.latitude.toFixed(6)}, ${currentLocation.longitude.toFixed(6)}`,
        ubicacion: hasSyncEvent ? 'Sincronizado' : 'No Sincronizado',
        senalGPS: senalGPS,
        senalCelular: senalCelular,
        ultimasAlertas: {
          conectado: conectadoFecha || 'N/A',
          desconectado: desconectadoFecha || 'N/A',
        },
      };

      console.log('Datos del modal:', deviceData);

      setValidationData(deviceData);
      setShowValidationModal(true);
      setLoading(false);

    } catch (error) {
      setLoading(false);
      
      // Determinar el mensaje de error específico
      let errorTitle = 'Error de validación';
      let errorMessage = 'No se pudo validar los datos';
      
      if (error.status === 400 || error.isValidationError) {
        // Error 400 o error de validación con mensaje personalizado
        errorMessage = error.message;
        
        // Personalizar el título según el tipo de error
        if (error.message.includes('Nevera')) {
          errorTitle = 'Nevera no disponible';
        } else if (error.message.includes('IMEI')) {
          errorTitle = 'IMEI no disponible';
        }
      } else if (error.response?.status === 400) {
        // Error 400 de axios sin procesar
        errorMessage = error.response?.data?.msg || 
                      error.response?.data?.message || 
                      'Los datos ingresados no son válidos. Verifica el código de nevera y el IMEI.';
      } else if (error.message) {
        // Otro tipo de error con mensaje
        errorMessage = error.message;
      }
      
      // Solo mostrar error completo en consola si NO es un error de validación
      if (!error.isValidationError) {
        console.error('Error en validación:', error);
      }
      
      // Mostrar Toast de error de forma segura
      showToast({
        type: 'error',
        text1: errorTitle,
        text2: errorMessage,
        position: 'bottom',
        visibilityTime: 5000,
        topOffset: 30,
        bottomOffset: 40,
      });
    }
  };

  // Volver al paso anterior
  const handleBack = () => {
    if (currentStep === 2) {
      // Al volver al paso 1, actualizar formDataStep1 con los datos de instalacionData
      setFormDataStep1(prev => ({
        ...prev,
        imei: instalacionData.imeiDispositivo || prev.imei
      }));
      setCurrentStep(1);
    } else if (currentStep === 3) {
      setCurrentStep(2);
    } else if (currentStep === 4) {
      setCurrentStep(3);
    } else if (currentStep === 5) {
      setCurrentStep(4);
    }
  };

  // Avanzar paso 2 → Paso 3 (con validación igual que paso 1 → 2)
  const handleNextStep2 = async () => {
    // Validar que se haya seleccionado un lugar de instalación
    if (!formDataStep2.lugarInstalacion) {
      Toast.show({
        type: 'error',
        text1: 'LUGAR DE INSTALACIÓN REQUERIDOestos campos',
        text2: 'Debe seleccionar un lugar de instalación',
        position: 'bottom',
        visibilityTime: 3000,
      });
      return;
    }

    setLoading(true);

    try {
      // Paso 1: Validar estado de la nevera
      console.log('Validando estado de nevera (Paso 2):', formDataStep1.codigoNevera);
      const statusResponse = await validateNeveraStatus(formDataStep1.codigoNevera);

      if (statusResponse.status !== 1) {
        setLoading(false);
        Toast.show({
          type: 'error',
          text1: 'Error de validación',
          text2: statusResponse.msg || 'No se pudo validar el estado de la nevera',
          position: 'bottom',
          visibilityTime: 3000,
        });
        return;
      }

      // Validar IMEI antes de sincronización
      const imei = formDataStep1.imei;
      if (!imei || imei.trim() === '' || imei === 'sin imei') {
        setLoading(false);
        Toast.show({
          type: 'error',
          text1: 'Falta el IMEI',
          text2: 'Debes ingresar o escanear el IMEI del dispositivo antes de continuar.',
          position: 'bottom',
          visibilityTime: 3500,
        });
        return;
      }

      console.log('Estado de nevera validado (Paso 2):', statusResponse);

      // Paso 2: Obtener ubicación y validar sincronización
      const currentLocation = await getCurrentLocation();
      const currentDateTime = formatDateTime(new Date());

      console.log('Validando sincronización (Paso 2) con:', {
        fecha: currentDateTime,
        latitud: currentLocation.latitude,
        longitud: currentLocation.longitude,
        imei,
      });

      const syncResponse = await validateTechnicianSync(
        currentDateTime,
        currentLocation.latitude,
        currentLocation.longitude,
        imei,
        2
      );

      console.log('Respuesta de sincronización (Paso 2):', syncResponse);

      // Verificar si al menos uno de los eventos es "Conectado" o "Desconectado"
      let hasSyncEvent = false;
      let conectadoFecha = null;
      let desconectadoFecha = null;

      if (Array.isArray(syncResponse) && syncResponse.length > 0) {
        for (const item of syncResponse) {
          if (item.evento === 'Conectado') {
            hasSyncEvent = true;
            conectadoFecha = item.fecha;
          } else if (item.evento === 'Desconectado') {
            hasSyncEvent = true;
            desconectadoFecha = item.fecha;
          }
        }
      }

      // Obtener señal GPS y señal celular del primer elemento
      const primeraRespuesta = syncResponse[0] || {};
      const senalGPS = primeraRespuesta.gps || 0;
      const senalCelular = primeraRespuesta.senial || 0.0;

      // Preparar datos para el modal
      const deviceData = {
        sincronizado: hasSyncEvent,
        conexion: currentDateTime,
        coordenadas: `${currentLocation.latitude.toFixed(6)}, ${currentLocation.longitude.toFixed(6)}`,
        ubicacion: hasSyncEvent ? 'Sincronizado' : 'No Sincronizado',
        senalGPS: senalGPS,
        senalCelular: senalCelular,
        ultimasAlertas: {
          conectado: conectadoFecha || 'N/A',
          desconectado: desconectadoFecha || 'N/A',
        },
      };

      console.log('Datos del modal (Paso 2):', deviceData);

      setValidationData(deviceData);
      setShowValidationModal(true);
      setLoading(false);

    } catch (error) {
      setLoading(false);
      console.error('Error en validación (Paso 2):', error);
      
      // Mostrar Toast de error de forma segura
      showToast({
        type: 'error',
        text1: 'Error de validación',
        text2: error.response?.data?.msg || error.message || 'No se pudo validar los datos',
        position: 'bottom',
        visibilityTime: 5000,
        topOffset: 30,
        bottomOffset: 40,
      });
    }
  };

  // Avanzar paso 3 → Paso 4 (sin validación, solo avanza)
  const handleNextStep3 = () => {
    console.log('Guardando datos del Paso 3 (Observaciones)');

    // Actualizar instalacionData con los datos del Paso 3
    setInstalacionData(prev => ({
      ...prev,
      observacion1: formDataStep3.observacion1,
      fotoObservacion1Path: formDataStep3.fotoObservacion1,
      observacion2: formDataStep3.observacion2,
      fotoObservacion2Path: formDataStep3.fotoObservacion2,
    }));

    console.log('Datos del Paso 3 guardados, avanzando al Paso 4 (Firma Cliente)');
    Toast.show({
      type: 'success',
      text1: 'Datos guardados',
      text2: 'Avanzando a firma del cliente',
      position: 'bottom',
      visibilityTime: 1500,
    });

    setCurrentStep(4);
  };

  // Generar PDF y avanzar al Paso 5 (Vista Previa)
  const handleGeneratePDF = async () => {
    setPdfLoading(true);
    try {
      // Consolidar datos para el DTO
      const firmaFileName = formDataStep4.fotoFirmaFileName || null;
      const now = new Date();
      const createdAt = now.toISOString().slice(0, 19); // yyyy-MM-ddTHH:mm:ss
      // Mapear body exactamente como el ejemplo proporcionado
      const updatedInstalacionData = {
        codigo: formDataStep1.codigoNevera,
        modelo: formDataStep1.modelo,
        distribuidor: formDataStep1.distribuidor,
        clienteNombres: formDataStep1.cliente,
        departamento: formDataStep1.departamento,
        provincia: formDataStep1.provincia,
        distrito: formDataStep1.distrito,
        direccion: formDataStep1.direccion,
        iccidChip: formDataStep1.iccidChip,
        imeiDispositivo: formDataStep1.imei,
        otro: formDataStep1.otro,
        iprevNeveraEnergizada: booleanToSiNo(formDataStep2.neveraEnergizadaPrev),
        iprevCompresorEnciende: booleanToSiNo(formDataStep2.compresorEnciendePrev),
        iprevTermostatoOp: booleanToSiNo(formDataStep2.termostatoOperativoPrev),
        iprevEstaCableElec: booleanToSiNo(formDataStep2.cableadoBuenasCondPrev),
        iprevComentario: formDataStep2.comentario || null,
        iprevFoto: formDataStep2.fotoInspeccionPreviaFileName ? 'OK' : null,
        iprevFotoPath: formDataStep2.fotoInspeccionPreviaFileName || null,
        latitud: instalacionData.latitud || '',
        longitud: instalacionData.longitud || '',
        fotoDispInstaCajaMetalicaAbierta: formDataStep2.fotoCajaMetalicaAbiertaFileName ? 'OK' : null,
        fotoDispInstaCajaMetalicaAbiertaPath: formDataStep2.fotoCajaMetalicaAbiertaFileName || null,
        fotoEmpalmeCable: formDataStep2.fotoEmpalmeCableFileName ? 'OK' : null,
        fotoEmpalmeCablePath: formDataStep2.fotoEmpalmeCableFileName || null,
        fotoDispInstaCajaMetalicaCerrada: formDataStep2.fotoCajaMetalicaCerradaFileName ? 'OK' : null,
        fotoDispInstaCajaMetalicaCerradaPath: formDataStep2.fotoCajaMetalicaCerradaFileName || null,
        fotoFachadaNevera: formDataStep2.fotoFachadaNeveraFileName ? 'OK' : null,
        fotoFachadeNeveraPath: formDataStep2.fotoFachadaNeveraFileName || null,
        transmisionRedCelular: 'SI',
        alertaDesconexion: 'SI',
        alertaReconexion: 'SI',
        transmisionGps: 'SI',
        cierreRejilla: booleanToSiNo(formDataStep2.cierreRejilla),
        ipostNeveraEnergizada: booleanToSiNo(formDataStep2.neveraEnergizadaPost),
        ipostCompresorEnciende: booleanToSiNo(formDataStep2.compresorPost),
        ipostTermostatoOp: booleanToSiNo(formDataStep2.termostatoPost),
        ipostEstaCableElec: booleanToSiNo(formDataStep2.cableadoElectricoPost),
        observacion1: formDataStep3.observacion1 || null,
        fotoObservacion1: formDataStep3.fotoObservacion1FileName ? 'OK' : null,
        fotoObservacion1Path: formDataStep3.fotoObservacion1FileName || null,
        observacion2: formDataStep3.observacion2 || null,
        fotoObservacion2: formDataStep3.fotoObservacion2FileName ? 'OK' : null,
        fotoObservacion2Path: formDataStep3.fotoObservacion2FileName || null,
        tecnicoFirma: null,
        tecnicoFirmaPath: null,
        tecnicoNombreApellido: null,
        tecnicoDni: null,
        clienteRespFirma: formDataStep4.fotoFirmaFileName ? 'OK' : null,
        clienteRespFirmaPath: formDataStep4.fotoFirmaFileName || null,
        clienteRespNombreApellido: formDataStep4.nombresApellidos,
        clienteRespDni: formDataStep4.dniCliente,
        idNevera: null,
        idCliente: null,
        idUsuario: idUsuario || null,
        pdfPath: '',
        createdAt,
      };
      setInstalacionData(updatedInstalacionData);
      // Log del body que se enviará
      console.log(JSON.stringify(updatedInstalacionData, null, 2));
      // Enviar POST al endpoint real
      const response = await postInstalacionNevera(updatedInstalacionData);
      // Log de la respuesta completa
      console.log('RESPUESTA:', JSON.stringify(response, null, 2));

      // Si viene pdfPath, mostrar el PDF en el WebView y avanzar al paso 5
      if (response && response.pdfPath) {
        const url = `https://phuyu-iot.com/NESTLE-API-TECNICOS/public/${response.pdfPath}`;
        setPdfUrl(url);
        // Actualizar instalacionData con el pdfPath recibido
        setInstalacionData(prev => ({
          ...prev,
          pdfPath: response.pdfPath
        }));
        setCurrentStep(5);
        Toast.show({
          type: 'success',
          text1: 'Vista previa generada',
          text2: 'Revise el documento antes de finalizar',
          position: 'bottom',
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'No se recibió el PDF de la instalación',
          position: 'bottom',
        });
      }
    } catch (error) {
      console.error('Error generando PDF:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'No se pudo generar la vista previa',
        position: 'bottom',
      });
    } finally {
      setPdfLoading(false);
    }
  };

  // Mostrar modal de confirmación antes de finalizar
  const handleShowConfirmation = () => {
    setShowConfirmationModal(true);
  };

  // Finalizar desde Paso 5 (Enviar todo al backend)
  const handleFinish = async () => {
    // Cerrar el modal de confirmación
    setShowConfirmationModal(false);
    setLoading(true);

    try {
      // Obtener fecha y hora actual
      const now = new Date();
      const fecha = now.toISOString().split('T')[0]; // YYYY-MM-DD
      const hora = now.toTimeString().split(' ')[0]; // HH:MM:SS

      // Construir observación concatenada: "lugarInstalacion // observacion1 // observacion2"
      let observacionConcatenada = formDataStep2.lugarInstalacion;

      if (formDataStep3.observacion1 && formDataStep3.observacion1.trim() !== '') {
        observacionConcatenada += ' // ' + formDataStep3.observacion1.trim();
      }

      if (formDataStep3.observacion2 && formDataStep3.observacion2.trim() !== '') {
        observacionConcatenada += ' // ' + formDataStep3.observacion2.trim();
      }

      // Preparar datos para el endpoint de actualización
      const updateData = {
        cod_nevera: formDataStep1.codigoNevera,
        tecnico: String(idUsuario),
        fecha: fecha,
        hora: hora,
        status: 2,
        imei: formDataStep1.imei,
        informe: instalacionData.pdfPath,
        motivos: "",
        observacion: observacionConcatenada
      };

      console.log('Enviando datos de actualización:', updateData);

      // Realizar la solicitud POST
      const response = await updateGestionAndProduction(updateData);

      console.log('Respuesta de actualización:', response);

      // Verificar si la respuesta tiene status 0 (error)
      if (response.status === 0) {
        Toast.show({
          type: 'error',
          text1: 'No se puede completar',
          text2: response.msg || 'La nevera ya fue instalada',
          position: 'top',
          visibilityTime: 5000,
          autoHide: true,
          topOffset: 30,
        });
        setLoading(false);
        return; // Detener el proceso aquí
      }

      // Mostrar mensaje de éxito
      if (response.status === 1) {
        Toast.show({
          type: 'success',
          text1: 'Éxito',
          text2: response.msg || 'Instalación completada correctamente',
          position: 'top',
          visibilityTime: 3000,
          topOffset: 30,
        });

        // Navegar a la pantalla de éxito
        navigation.replace('SuccessScreen');
      }
    } catch (error) {
      console.error('Error finalizando instalación:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.msg || 'No se pudo completar la instalación',
        position: 'bottom',
      });
    } finally {
      setLoading(false);
    }
  };

  // Cerrar modal de validación (diferente según el paso)
  const handleCloseValidationModal = () => {
    // Solo avanzar si está sincronizado
    if (validationData?.sincronizado) {
      setShowValidationModal(false);
      if (currentStep === 1) {
        // Guardar el IMEI actual antes de actualizar
        const currentImei = formDataStep1.imei;
        const isManualImei = currentImei && currentImei !== 'sin imei' && currentImei.length > 0;

        // Actualizar instalacionData con los datos del Paso 1, pero NO tocar los campos de transmisión ni alerta
        setInstalacionData(prev => ({
          ...prev,
          codigo: formDataStep1.codigoNevera,
          modelo: formDataStep1.modelo,
          distribuidor: formDataStep1.distribuidor,
          clienteNombres: formDataStep1.cliente,
          rucDni: formDataStep1.rucDni,
          departamento: formDataStep1.departamento,
          provincia: formDataStep1.provincia,
          distrito: formDataStep1.distrito,
          direccion: formDataStep1.direccion,
          iccidChip: formDataStep1.iccidChip,
          // Usar el IMEI manual si existe
          imeiDispositivo: isManualImei ? currentImei : formDataStep1.imei,
          otro: formDataStep1.otro,
          latitud: validationData.coordenadas?.split(',')[0]?.trim() || '',
          longitud: validationData.coordenadas?.split(',')[1]?.trim() || '',
        }));
        Toast.show({
          type: 'success',
          text1: 'Validación exitosa',
          text2: 'Datos sincronizados correctamente',
          position: 'bottom',
        });
        setCurrentStep(2);
      } else if (currentStep === 2) {
        setInstalacionData(prev => ({
          ...prev,
          // Inspección previa
          iprevNeveraEnergizada: booleanToSiNo(formDataStep2.neveraEnergizadaPrev),
          iprevCompresorEnciende: booleanToSiNo(formDataStep2.compresorEnciendePrev),
          iprevTermostatoOp: booleanToSiNo(formDataStep2.termostatoOperativoPrev),
          iprevEstaCableElec: booleanToSiNo(formDataStep2.cableadoBuenasCondPrev),
          iprevComentario: formDataStep2.comentario,
          iprevFotoPath: formDataStep2.fotoInspeccionPrevia,
          // Fotos de instalación (URIs locales)
          fotoDispInstaCajaMetalicaAbiertaPath: formDataStep2.fotoCajaMetalicaAbierta,
          fotoEmpalmeCablePath: formDataStep2.fotoEmpalmeCable,
          fotoDispInstaCajaMetalicaCerradaPath: formDataStep2.fotoCajaMetalicaCerrada,
          fotoFachadeNeveraPath: formDataStep2.fotoFachadaNevera,
          // Inspección posterior
          cierreRejilla: booleanToSiNo(formDataStep2.cierreRejilla),
          ipostNeveraEnergizada: booleanToSiNo(formDataStep2.neveraEnergizadaPost),
          ipostCompresorEnciende: booleanToSiNo(formDataStep2.compresorPost),
          ipostTermostatoOp: booleanToSiNo(formDataStep2.termostatoPost),
          ipostEstaCableElec: booleanToSiNo(formDataStep2.cableadoElectricoPost),
        }));
        Toast.show({
          type: 'success',
          text1: 'Validación exitosa',
          text2: 'Datos sincronizados correctamente',
          position: 'bottom',
        });
        setCurrentStep(3);
      }
    } else {
      setShowValidationModal(false);
      Toast.show({
        type: 'info',
        text1: 'No sincronizado',
        text2: 'El equipo no está sincronizado. Verifica la conexión.',
        position: 'bottom',
        visibilityTime: 3000,
      });
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      keyboardShouldPersistTaps="handled"
      nestedScrollEnabled={true}
    >
      {/* Título Principal */}
      <Text style={styles.title}>INSTALACIÓN EQUIPO</Text>
      <Text style={styles.subtitle}>
        {currentStep === 1 && 'DATOS GENERALES'}
        {currentStep === 2 && 'FUNCIONAMIENTO EQUIPO'}
        {currentStep === 3 && 'OBSERVACIONES'}
        {currentStep === 4 && 'OBSERVACIONES'}
        {currentStep === 5 && 'VISTA PREVIA'}
      </Text>

      {/* Línea decorativa */}
      <View style={[
        styles.divider,
        currentStep === 2 && styles.dividerLong,
        (currentStep === 3 || currentStep === 4 || currentStep === 5) && styles.dividerExtraLong
      ]} />

      {/* Renderizar componente según el paso */}
      {currentStep === 1 && (
        <DatosGenerales
          formData={formDataStep1}
          onChangeField={handleChangeFieldStep1}
          onBarcodeScan={handleBarcodeScan}
          onVoiceInput={handleVoiceInput}
          onIccidUpdate={handleIccidUpdate}
        />
      )}

      {currentStep === 2 && (
        <FuncionamientoEquipo
          formData={formDataStep2}
          onChangeField={handleChangeFieldStep2}
          onTakePhoto={handleTakePhoto}
          onDeletePhoto={handleDeletePhoto}
          onBack={handleBack}
        />
      )}

      {currentStep === 3 && (
        <Observaciones
          formData={formDataStep3}
          onChangeField={handleChangeFieldStep3}
          onTakePhoto={handleTakePhoto}
          onDeletePhoto={handleDeletePhoto}
          onVoiceInput={handleVoiceInput}
        />
      )}

      {currentStep === 4 && (
        <FirmaCliente
          formData={formDataStep4}
          onChangeField={handleChangeFieldStep4}
          onVoiceInput={handleVoiceInput}
          onSignatureChange={handleSignatureChange}
        />
      )}

      {currentStep === 5 && (
        <VistaPrevia
          pdfUrl={pdfUrl}
          loading={pdfLoading}
        />
      )}

      {/* Botones de Navegación */}
      <View style={styles.navigationContainer}>
        {(currentStep === 2 || currentStep === 3 || currentStep === 4 || currentStep === 5) && (
          <TouchableOpacity
            style={styles.btnBack}
            onPress={handleBack}
            disabled={loading}
          >
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
        )}

        <View style={styles.spacer} />

        <TouchableOpacity
          style={[styles.btnNext, (currentStep === 4 || currentStep === 5) && styles.btnWide]}
          onPress={
            currentStep === 1 ? handleNext :
              currentStep === 2 ? handleNextStep2 :
                currentStep === 3 ? handleNextStep3 :
                  currentStep === 4 ? handleGeneratePDF :
                    handleShowConfirmation
          }
          disabled={loading || pdfLoading}
        >
          {(loading || pdfLoading) ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (currentStep === 4 || currentStep === 5) ? (
            <View style={styles.btnContent}>
              <Text style={styles.btnText}>
                {currentStep === 4 ? 'Vista Previa' : 'Finalizar'}
              </Text>
              <Icon name="arrow-forward" size={24} color="#fff" style={styles.btnIcon} />
            </View>
          ) : (
            <Icon name="arrow-forward" size={24} color="#fff" />
          )}
        </TouchableOpacity>
      </View>

      {/* Modal de Escáner de Código de Barras */}
      <Modal
        visible={showBarcodeScanner}
        animationType="slide"
        onRequestClose={() => setShowBarcodeScanner(false)}
      >
        <BarcodeScanner
          onCodeScanned={handleCodeScanned}
          onClose={() => {
            setShowBarcodeScanner(false);
            setCurrentScanField(null);
          }}
        />
      </Modal>

      {/* Modal de Validación */}
      <ValidationModal
        visible={showValidationModal}
        onClose={handleCloseValidationModal}
        validationData={validationData}
      />

      {/* Modal de Confirmación */}
      <ConfirmationModal
        visible={showConfirmationModal}
        onClose={() => setShowConfirmationModal(false)}
        onConfirm={handleFinish}
        title="¿Estás seguro que deseas finalizar?"
      />

      {/* Modal de Entrada por Voz */}
      <VoiceInput
        visible={showVoiceInput}
        onClose={() => {
          setShowVoiceInput(false);
          setCurrentVoiceField(null);
          setCurrentVoiceFieldLabel('');
        }}
        onResult={handleVoiceResult}
        fieldLabel={currentVoiceFieldLabel}
        removeSpaces={currentVoiceField === 'codigoNevera'}
      />

      {/* Modal de Selección de Fuente de Imagen */}
      <Modal
        visible={showImageSourceModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setShowImageSourceModal(false);
          setCurrentPhotoField(null);
        }}
      >
        <TouchableOpacity
          style={styles.imageSourceOverlay}
          activeOpacity={1}
          onPress={() => {
            setShowImageSourceModal(false);
            setCurrentPhotoField(null);
          }}
        >
          <View style={styles.imageSourceModal}>
            <Text style={styles.imageSourceTitle}>Seleccionar imagen</Text>

            <TouchableOpacity
              style={styles.imageSourceButton}
              onPress={handleTakeFromCamera}
              activeOpacity={0.7}
            >
              <Icon name="camera-alt" size={24} color="#1a1a7e" />
              <Text style={styles.imageSourceButtonText}>Tomar Foto</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.imageSourceButton}
              onPress={handlePickFromGallery}
              activeOpacity={0.7}
            >
              <Icon name="photo-library" size={24} color="#1a1a7e" />
              <Text style={styles.imageSourceButtonText}>Galería</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.imageSourceButton, styles.cancelButton]}
              onPress={() => {
                setShowImageSourceModal(false);
                setCurrentPhotoField(null);
              }}
              activeOpacity={0.7}
            >
              <Icon name="close" size={24} color="#666" />
              <Text style={[styles.imageSourceButtonText, styles.cancelButtonText]}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Modal de GPS Requerido */}
      <GPSRequiredModal
        visible={showGPSModal}
        onRetry={handleRetryGPS}
        isChecking={isCheckingGPS}
      />

      {/* Toast Messages */}
      <Toast />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginTop: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#000',
    textAlign: 'center',
    marginTop: 4,
  },
  divider: {
    width: 100,
    height: 2,
    backgroundColor: '#3F51B5',
    marginTop: 8,
    marginBottom: 16,
  },
  dividerLong: {
    width: 200,
  },
  dividerExtraLong: {
    width: 300,
  },
  navigationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    paddingHorizontal: 10,
  },
  spacer: {
    flex: 2,
  },
  btnBack: {
    flex: 1,
    backgroundColor: '#2b4a8b',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
    marginRight: 8,
  },
  btnNext: {
    flex: 1,
    backgroundColor: '#2b4a8b',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  btnWide: {
    flex: 2,
  },
  btnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginRight: 8,
  },
  btnIcon: {
    marginLeft: 4,
  },
  // Estilos para el modal de selección de fuente de imagen
  imageSourceOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageSourceModal: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxWidth: 320,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  imageSourceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a7e',
    textAlign: 'center',
    marginBottom: 20,
  },
  imageSourceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  imageSourceButtonText: {
    fontSize: 16,
    color: '#1a1a7e',
    fontWeight: '500',
    marginLeft: 12,
  },
  cancelButton: {
    backgroundColor: '#fff',
    borderColor: '#ccc',
    marginTop: 8,
  },
  cancelButtonText: {
    color: '#666',
  },
});

export default NuevaInstalacionScreen;