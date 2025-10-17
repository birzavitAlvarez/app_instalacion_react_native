import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
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
import { formatDateTime } from '../services/HourDate';

const NuevaInstalacionScreen = ({ navigation }) => {
  // Obtener ubicación desde el contexto
  const { location, getCurrentLocation } = useContext(LocationContext);

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

  // Manejar cambio de campo - Paso 1
  const handleChangeFieldStep1 = (fieldName, value) => {
    setFormDataStep1({ ...formDataStep1, [fieldName]: value });
  };

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
    console.log('🎤 Iniciando entrada por voz para:', fieldName, fieldLabel);
    
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
    console.log('🎤 Texto de voz recibido:', text);
    console.log('🎤 Campo destino:', currentVoiceField);
    console.log('🎤 Paso actual:', currentStep);
    
    // Actualizar el formData según el paso actual
    if (currentStep === 1 && currentVoiceField) {
      setFormDataStep1({ ...formDataStep1, [currentVoiceField]: text });
      console.log('✅ FormDataStep1 actualizado con voz');
    } else if (currentStep === 3 && currentVoiceField) {
      setFormDataStep3({ ...formDataStep3, [currentVoiceField]: text });
      console.log('✅ FormDataStep3 actualizado con voz');
    } else if (currentStep === 4 && currentVoiceField) {
      setFormDataStep4({ ...formDataStep4, [currentVoiceField]: text });
      console.log('✅ FormDataStep4 actualizado con voz');
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
    console.log('🔍 Iniciando escaneo para campo:', fieldName);
    setCurrentScanField(fieldName);
    setShowBarcodeScanner(true);
  };

  // Manejar código escaneado
  const handleCodeScanned = (code) => {
    console.log('📥 Código recibido:', code);
    console.log('📝 Campo actual:', currentScanField);
    console.log('📋 FormData antes:', formDataStep1);
    
    setFormDataStep1({ ...formDataStep1, [currentScanField]: code });
    setShowBarcodeScanner(false);
    setCurrentScanField(null);
    
    console.log('✅ FormData actualizado');
    
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
      // Obtener ubicación actual del dispositivo
      const currentLocation = await getCurrentLocation();
      
      // Obtener fecha y hora actual
      const currentDateTime = formatDateTime(new Date());

      // Simular llamada al endpoint (después será real)
      setTimeout(() => {
        // Datos obtenidos del dispositivo real
        const deviceData = {
          sincronizado: Math.random() > 0.5, // Esto vendrá del endpoint real
          conexion: currentDateTime,
          coordenadas: `${currentLocation.latitude.toFixed(5)}, ${currentLocation.longitude.toFixed(6)}`,
          ubicacion: 'Sincronizado', // Esto vendrá del endpoint real
          senalGPS: Math.floor(currentLocation.accuracy || 10), // Precisión GPS
          senalCelular: '15.0', // TODO: Obtener señal celular real si es posible
          ultimasAlertas: {
            conectado: currentDateTime,
            desconectado: null,
            sinEvento: null,
          },
        };

        setValidationData(deviceData);
        setShowValidationModal(true);
        setLoading(false);

        // TODO: Reemplazar con llamada real al endpoint
        // try {
        //   const response = await API.validarDatosGenerales({
        //     ...formDataStep1,
        //     latitud: currentLocation.latitude,
        //     longitud: currentLocation.longitude,
        //     fechaHora: currentDateTime,
        //   });
        //   setValidationData(response.data);
        //   setShowValidationModal(true);
        // } catch (error) {
        //   Toast.show({
        //     type: 'error',
        //     text1: 'Error',
        //     text2: 'No se pudo validar los datos',
        //     position: 'bottom',
        //   });
        // } finally {
        //   setLoading(false);
        // }
      }, 1500);
    } catch (error) {
      setLoading(false);
      Toast.show({
        type: 'error',
        text1: 'Error de ubicación',
        text2: 'No se pudo obtener la ubicación GPS',
        position: 'bottom',
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

  // Avanzar paso 2 → Paso 3 (con validación)
  const handleNextStep2 = async () => {
    setLoading(true);

    try {
      // Obtener ubicación actual del dispositivo
      const currentLocation = await getCurrentLocation();
      
      // Obtener fecha y hora actual
      const currentDateTime = formatDateTime(new Date());

      // Simular llamada al endpoint de validación (después será real)
      setTimeout(() => {
        // Datos obtenidos del dispositivo real
        const deviceData = {
          sincronizado: Math.random() > 0.3, // Esto vendrá del endpoint real
          conexion: currentDateTime,
          coordenadas: `${currentLocation.latitude.toFixed(5)}, ${currentLocation.longitude.toFixed(6)}`,
          ubicacion: 'Sincronizado', // Esto vendrá del endpoint real
          senalGPS: Math.floor(currentLocation.accuracy || 10), // Precisión GPS
          senalCelular: '15.0', // TODO: Obtener señal celular real si es posible
          ultimasAlertas: {
            conectado: currentDateTime,
            desconectado: null,
            sinEvento: null,
          },
        };

        setValidationData(deviceData);
        setShowValidationModal(true);
        setLoading(false);

        // TODO: Reemplazar con llamada real al endpoint
        // try {
        //   const response = await API.validarFuncionamientoEquipo({
        //     ...formDataStep1,
        //     ...formDataStep2,
        //     latitud: currentLocation.latitude,
        //     longitud: currentLocation.longitude,
        //     fechaHora: currentDateTime,
        //   });
        //   setValidationData(response.data);
        //   setShowValidationModal(true);
        // } catch (error) {
        //   Toast.show({
        //     type: 'error',
        //     text1: 'Error',
        //     text2: 'No se pudo validar los datos',
        //     position: 'bottom',
        //   });
        // } finally {
        //   setLoading(false);
        // }
      }, 1500);
    } catch (error) {
      setLoading(false);
      Toast.show({
        type: 'error',
        text1: 'Error de ubicación',
        text2: 'No se pudo obtener la ubicación GPS',
        position: 'bottom',
      });
    }
  };

  // Avanzar paso 3 → Paso 4 (sin validación, solo avanza)
  const handleNextStep3 = () => {
    setCurrentStep(4);
  };

  // Generar PDF y avanzar al Paso 5 (Vista Previa)
  const handleGeneratePDF = async () => {
    setPdfLoading(true);
    try {
      // TODO: Integrar con el endpoint real para generar el PDF
      // const response = await API.generateInstallationPDF({
      //   ...formDataStep1,
      //   ...formDataStep2,
      //   ...formDataStep3,
      //   ...formDataStep4,
      // });
      // setPdfUrl(response.pdfUrl);
      
      // Por ahora, simulamos la generación del PDF
      await new Promise(resolve => setTimeout(resolve, 2000));
      
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
      // TODO: Integrar con el endpoint real para enviar la confirmación final
      // const response = await API.submitInstallation({
      //   ...formDataStep1,
      //   ...formDataStep2,
      //   ...formDataStep3,
      //   ...formDataStep4,
      //   pdfUrl,
      // });
      
      // Simular llamada al endpoint
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
    setShowValidationModal(false);
    
    if (validationData?.sincronizado) {
      if (currentStep === 1) {
        // Paso 1 → Paso 2: Avanzar a Funcionamiento Equipo
        Toast.show({
          type: 'success',
          text1: 'Validación exitosa',
          text2: 'Datos sincronizados correctamente',
          position: 'bottom',
        });
        setCurrentStep(2);
      } else if (currentStep === 2) {
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
      // Si no está sincronizado, mostrar mensaje
      Toast.show({
        type: 'warning',
        text1: 'No sincronizado',
        text2: 'Revisa los datos e intenta de nuevo',
        position: 'bottom',
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