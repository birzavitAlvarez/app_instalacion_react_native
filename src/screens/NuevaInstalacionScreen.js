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
import { takePhotoCompressed } from '../utils/imageUtil';
import { requestCameraPermission } from '../utils/permissions';
import { LocationContext } from '../context/LocationContext';
import { getDataByCodNevera, validateNeveraStatus, validateTechnicianSync } from '../services/neveraService';
import { uploadImageToServer } from '../services/uploadService';

// Suprimir warning de VirtualizedList en ScrollView
LogBox.ignoreLogs([
  'VirtualizedLists should never be nested',
]);

const NuevaInstalacionScreen = ({ navigation }) => {
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
  const { location, getCurrentLocation } = useContext(LocationContext);

  // Control de pasos (1-5: Datos Generales, Funcionamiento Equipo, Observaciones, Firma Cliente, Vista Previa)
  const [currentStep, setCurrentStep] = useState(4);

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
    transmisionRedCelular: null,
    alertaDesconexion: null,
    alertaReconexion: null,
    transmisionGps: null,
    
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

  // Manejar cambio de campo - Paso 1
  const handleChangeFieldStep1 = (fieldName, value) => {
    setFormDataStep1({ ...formDataStep1, [fieldName]: value });
  };

  // Manejar actualización del ICCID desde el autocompletado de IMEI
  const handleIccidUpdate = (iccidValue) => {
    console.log('📝 Actualizando ICCID desde IMEI:', iccidValue);
    setFormDataStep1({ ...formDataStep1, iccidChip: iccidValue });
  };

  // Autocompletar datos cuando el código de nevera tiene >= 10 caracteres
  useEffect(() => {
    const fetchNeveraData = async () => {
      const codigoNevera = formDataStep1.codigoNevera.trim();
      
      // Solo consultar si tiene EXACTAMENTE 10 o más caracteres y no está vacío
      if (codigoNevera.length >= 10) {
        setLoading(true);
        
        try {
          console.log('🔍 Consultando datos para código:', codigoNevera);
          const data = await getDataByCodNevera(codigoNevera);
          
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
            imei: data.imei_dispositivo || prev.imei,
          }));
          
          Toast.show({
            type: 'success',
            text1: 'Datos autocompletados',
            text2: `Nevera: ${codigoNevera}`,
            position: 'bottom',
            visibilityTime: 2000,
          });
          
          console.log('Datos autocompletados:', data);
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
    };

    // Debounce para evitar consultas mientras escribe
    const timeoutId = setTimeout(fetchNeveraData, 800);
    
    return () => clearTimeout(timeoutId);
  }, [formDataStep1.codigoNevera]);

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

  // Manejar cambio de firma
  const handleSignatureChange = (signatureData) => {
    if (signatureData && signatureData.uri) {
      setFormDataStep4({ ...formDataStep4, fotoFirma: signatureData.uri });
      Toast.show({
        type: 'success',
        text1: 'Firma guardada',
        position: 'bottom',
      });
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
  const handleTakePhoto = async (fieldName) => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;

    try {
      setLoading(true);
      const result = await takePhotoCompressed();
      if (result) {
        if (currentStep === 2) {
          setFormDataStep2({ ...formDataStep2, [fieldName]: result.uri });
        } else if (currentStep === 3) {
          setFormDataStep3({ ...formDataStep3, [fieldName]: result.uri });
        }
        Toast.show({
          type: 'success',
          text1: 'Foto capturada',
          position: 'bottom',
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'No se pudo tomar la foto',
        position: 'bottom',
      });
    } finally {
      setLoading(false);
    }
  };

  // Manejar eliminación de fotos - Pasos 2 y 3
  const handleDeletePhoto = (fieldName) => {
    if (currentStep === 2) {
      setFormDataStep2({ ...formDataStep2, [fieldName]: null });
    } else if (currentStep === 3) {
      setFormDataStep3({ ...formDataStep3, [fieldName]: null });
    }
    Toast.show({
      type: 'info',
      text1: 'Foto eliminada',
      position: 'bottom',
    });
  };

  // Validar y mostrar modal (Paso 1 → Paso 2)
  const handleNext = async () => {
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
      console.error('Error en validación:', error);
      
      Toast.show({
        type: 'error',
        text1: 'Error de validación',
        text2: error.response?.data?.msg || 'No se pudo validar los datos',
        position: 'bottom',
        visibilityTime: 3000,
      });
    }
  };

  // Volver al paso anterior
  const handleBack = () => {
    if (currentStep === 2) {
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

      console.log('Estado de nevera validado (Paso 2):', statusResponse);

      // Paso 2: Obtener ubicación y validar sincronización
      const currentLocation = await getCurrentLocation();
      const currentDateTime = formatDateTime(new Date());
      
      console.log('Validando sincronización (Paso 2) con:', {
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
      
      Toast.show({
        type: 'error',
        text1: 'Error de validación',
        text2: error.response?.data?.msg || 'No se pudo validar los datos',
        position: 'bottom',
        visibilityTime: 3000,
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
      console.log('Guardando datos del Paso 4 (Firma Cliente)');
      
      // Actualizar instalacionData con los datos del Paso 4
      const updatedInstalacionData = {
        ...instalacionData,
        // Firma del cliente
        clienteRespFirmaPath: formDataStep4.fotoFirma,
        clienteRespNombreApellido: formDataStep4.nombresApellidos,
        clienteRespDni: formDataStep4.dniCliente,
      };
      
      setInstalacionData(updatedInstalacionData);
      
      console.log('Datos del Paso 4 guardados');
      console.log('Subiendo imágenes al servidor...');
      
      // Preparar array de imágenes a subir
      const imagesToUpload = [];
      
      // Foto inspección previa
      if (updatedInstalacionData.iprevFotoPath) {
        imagesToUpload.push({
          uri: updatedInstalacionData.iprevFotoPath,
          fieldName: 'iprevFoto'
        });
      }
      
      // Fotos de instalación
      if (updatedInstalacionData.fotoDispInstaCajaMetalicaAbiertaPath) {
        imagesToUpload.push({
          uri: updatedInstalacionData.fotoDispInstaCajaMetalicaAbiertaPath,
          fieldName: 'fotoDispInstaCajaMetalicaAbierta'
        });
      }
      if (updatedInstalacionData.fotoEmpalmeCablePath) {
        imagesToUpload.push({
          uri: updatedInstalacionData.fotoEmpalmeCablePath,
          fieldName: 'fotoEmpalmeCable'
        });
      }
      if (updatedInstalacionData.fotoDispInstaCajaMetalicaCerradaPath) {
        imagesToUpload.push({
          uri: updatedInstalacionData.fotoDispInstaCajaMetalicaCerradaPath,
          fieldName: 'fotoDispInstaCajaMetalicaCerrada'
        });
      }
      if (updatedInstalacionData.fotoFachadeNeveraPath) {
        imagesToUpload.push({
          uri: updatedInstalacionData.fotoFachadeNeveraPath,
          fieldName: 'fotoFachadaNevera'
        });
      }
      
      // Fotos de observaciones
      if (updatedInstalacionData.fotoObservacion1Path) {
        imagesToUpload.push({
          uri: updatedInstalacionData.fotoObservacion1Path,
          fieldName: 'fotoObservacion1'
        });
      }
      if (updatedInstalacionData.fotoObservacion2Path) {
        imagesToUpload.push({
          uri: updatedInstalacionData.fotoObservacion2Path,
          fieldName: 'fotoObservacion2'
        });
      }
      
      // Firma del cliente
      if (updatedInstalacionData.clienteRespFirmaPath) {
        imagesToUpload.push({
          uri: updatedInstalacionData.clienteRespFirmaPath,
          fieldName: 'clienteRespFirma'
        });
      }

      // Subir imágenes y obtener filenames
      console.log(`📸 Subiendo ${imagesToUpload.length} imágenes...`);
      
      for (const image of imagesToUpload) {
        try {
          const filename = await uploadImageToServer(image.uri, updatedInstalacionData.codigo);
          console.log(`Imagen subida: ${image.fieldName} -> ${filename}`);
          
          // Actualizar el filename en instalacionData
          updatedInstalacionData[image.fieldName] = filename;
        } catch (error) {
          console.error(`Error subiendo ${image.fieldName}:`, error);
          Toast.show({
            type: 'error',
            text1: 'Error subiendo imagen',
            text2: `No se pudo subir ${image.fieldName}`,
            position: 'bottom',
          });
        }
      }
      
      // Actualizar el estado con los filenames
      setInstalacionData(updatedInstalacionData);
      
      console.log('Todas las imágenes subidas');
      console.log('Datos de instalación completos:', updatedInstalacionData);
      
      // TODO: Integrar con el endpoint real para generar el PDF
      // Por ahora, simulamos la generación del PDF
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // URL de ejemplo (reemplazar con la URL real del backend)
      setPdfUrl('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');
      
      setCurrentStep(5);
      Toast.show({
        type: 'success',
        text1: 'Vista previa generada',
        text2: 'Revise el documento antes de finalizar',
        position: 'bottom',
      });
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

      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('Datos completos enviados:', {
        ...formDataStep1,
        ...formDataStep2,
        ...formDataStep3,
        ...formDataStep4,
        pdfUrl,
      });
      
      Toast.show({
        type: 'success',
        text1: 'Instalación completada',
        text2: 'Los datos han sido enviados correctamente',
        position: 'bottom',
        visibilityTime: 2000,
      });
      
      // Navegar a la pantalla de éxito
      navigation.replace('SuccessScreen');
    } catch (error) {
      console.error('Error finalizando instalación:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'No se pudo completar la instalación',
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
        // Actualizar instalacionData con los datos del Paso 1
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
          imeiDispositivo: formDataStep1.imei,
          otro: formDataStep1.otro,
          latitud: validationData.coordenadas?.split(',')[0]?.trim() || '',
          longitud: validationData.coordenadas?.split(',')[1]?.trim() || '',
          transmisionRedCelular: validationData.senalCelular?.toString() || '',
          transmisionGps: validationData.senalGPS?.toString() || '',
          alertaDesconexion: validationData.ultimasAlertas?.desconectado || '',
          alertaReconexion: validationData.ultimasAlertas?.conectado || '',
        }));

        // Paso 1 → Paso 2: Avanzar a Funcionamiento Equipo
        Toast.show({
          type: 'success',
          text1: 'Validación exitosa',
          text2: 'Datos sincronizados correctamente',
          position: 'bottom',
        });
        setCurrentStep(2);
      } else if (currentStep === 2) {
        // Actualizar instalacionData con los datos del Paso 2
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

        // Paso 2 → Paso 3: Avanzar a Observaciones
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
});

export default NuevaInstalacionScreen;