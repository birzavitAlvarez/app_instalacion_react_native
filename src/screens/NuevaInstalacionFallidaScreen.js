import React, { useState, useEffect, useContext, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  Linking,
  ActivityIndicator,
  Modal,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { useLocation } from '../hooks/useLocation';
import SignatureInput from '../components/SignatureInput';
import EnhancedInput from '../components/EnhancedInput';
import BarcodeScanner from '../components/BarcodeScanner';
import VoiceInput from '../components/VoiceInput';
import GPSRequiredModal from '../components/GPSRequiredModal';
import { takePhotoCompressed, pickFromGalleryCompressed, convertImageToBase64 } from '../utils/imageUtil';
import { requestCameraPermission, requestGalleryPermission } from '../utils/permissions';
import AutocompleteNeveraInput from '../components/AutocompleteNeveraInput';
import AutocompleteNevera from '../components/AutocompleteNevera';
import { uploadImageBase64, crearInstalacionFallida, registrarGestionFallida, validarActaFallidaPorDia } from '../services/instalacionesFallidasService';
import { AuthContext } from '../context/AuthContext';
import { searchNeverasByCodigo2 } from "../services/neveraService";

const NuevaInstalacionFallidaScreen = () => {
  // Estados
  const { signOut, userInfo } = useContext(AuthContext)
  const [codigoNevera, setCodigoNevera] = useState('');
  const [ubicacionConfirmada, setUbicacionConfirmada] = useState(false);
  const [causasFallo, setCausasFallo] = useState({
    direccionNoExiste: false,
    establecimientoCerrado: false,
    noSePermitioIngreso: false,
    puntoYaInstalado: false,
    congeladoraAveriada: false,
    noCorrespondeModelo: false,
    imposibilidadAccesoElectrico: false,
    congeladoraNoDisponible: false,
    sinCoberturaCelular: false,
    sinCoberturaGPS: false,
    faltaEspacio: false,
    excedioTiempoEspera: false,
    neveraPropiaCliente: false,
  });
  const [lugarInstalacion, setLugarInstalacion] = useState({
    pdvNeveraOperativa: false,
    pdvNeveraSinUso: false,
    patioDistribuidor: false,
    patioFrioHielos: false,
  });
  const [observacion, setObservacion] = useState('');
  const [foto, setFoto] = useState(null);
  const [fotoBase64, setFotoBase64] = useState(null);
  const [signature, setSignature] = useState(null);
  const [nombreApellidos, setNombreApellidos] = useState('');
  const [dni, setDni] = useState('');
  const [loading, setLoading] = useState(false);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const signatureRef = useRef(null);

  // Estados para entrada por voz
  const [showVoiceInput, setShowVoiceInput] = useState(false);
  const [currentVoiceField, setCurrentVoiceField] = useState(null);
  const [currentVoiceFieldLabel, setCurrentVoiceFieldLabel] = useState('');

  // Ubicación GPS
  const { latitude, longitude, isLoading: locationLoading, error: locationError, getCurrentLocation, checkGPSStatus, startGPSMonitoring, stopGPSMonitoring } = useLocation();

  // Estados para verificación de GPS
  const [showGPSModal, setShowGPSModal] = useState(false);
  const [isCheckingGPS, setIsCheckingGPS] = useState(false);

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
  }, []);

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
          text2: 'Ahora puedes continuar con la instalación fallida',
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

  // Mostrar mensaje de GPS activado al entrar
  useEffect(() => {
    if (!locationLoading && latitude && longitude) {
      Toast.show({
        type: 'success',
        text1: 'GPS Activado',
        text2: 'Ubicación obtenida correctamente',
        position: 'bottom',
        visibilityTime: 2000,
      });
    }
  }, [locationLoading, latitude, longitude]);

  // Manejar cambio de checkbox
  const toggleCausa = (causa) => {
    setCausasFallo({ ...causasFallo, [causa]: !causasFallo[causa] });
  };

  const toggleLugarInstalacion = (lugar) => {
    const nuevosValores = Object.keys(lugarInstalacion).reduce((acc, key) => {
      acc[key] = key === lugar ? !lugarInstalacion[lugar] : false;
      return acc;
    }, {});
    setLugarInstalacion(nuevosValores);
  };


  // Manejar escaneo de código de barras
  const handleBarcodeScan = () => {
    setShowBarcodeScanner(true);
  };

  // Manejar código escaneado
  const handleCodeScanned = (code) => {
    setCodigoNevera(code);
    setShowBarcodeScanner(false);
    Toast.show({
      type: 'success',
      text1: 'Código Escaneado',
      text2: `Código: ${code}`,
      position: 'bottom',
      visibilityTime: 2000,
    });
  };

  // Manejar entrada por voz
  const handleVoiceInput = (field, label) => {
    console.log('Abriendo modal de voz para campo:', field, 'con label:', label);
    setCurrentVoiceField(field);
    setCurrentVoiceFieldLabel(label);
    setShowVoiceInput(true);
  };

  // Manejar resultado de voz
  const handleVoiceResult = (text) => {
    console.log('Texto de voz recibido:', text, 'para campo:', currentVoiceField);

    // Actualizar el campo correspondiente según el nombre del campo
    switch (currentVoiceField) {
      case 'codigoNevera':
        setCodigoNevera(text);
        break;
      case 'observacion':
        setObservacion(text);
        break;
      case 'nombreApellidos':
        setNombreApellidos(text);
        break;
      case 'dni':
        setDni(text);
        break;
      default:
        console.warn('⚠️ Campo desconocido:', currentVoiceField);
    }

    // Mostrar toast de confirmación
    Toast.show({
      type: 'success',
      text1: 'Texto reconocido',
      text2: text,
      position: 'bottom',
      visibilityTime: 2000,
    });

    // Limpiar estados
    setShowVoiceInput(false);
    setCurrentVoiceField(null);
    setCurrentVoiceFieldLabel('');
  };

  // Confirmar ubicación
  const handleConfirmarUbicacion = async () => {
    if (!latitude || !longitude) {
      // Intentar obtener ubicación manualmente
      try {
        setLoading(true);
        await getCurrentLocation();
        Toast.show({
          type: 'success',
          text1: 'Éxito',
          text2: 'Ubicación obtenida correctamente',
          position: 'bottom',
        });
      } catch (error) {
        Toast.show({
          type: 'error',
          text1: 'Error de GPS',
          text2: 'Asegúrate de tener GPS activado y buena señal',
          position: 'bottom',
          visibilityTime: 4000,
        });
      } finally {
        setLoading(false);
      }
      return;
    }
    setUbicacionConfirmada(true);
    Toast.show({
      type: 'success',
      text1: 'Ubicación Confirmada',
      text2: `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`,
      position: 'bottom',
      visibilityTime: 3000,
    });
  };

  // Tomar foto
  const handleTakePhoto = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;

    try {
      setLoading(true);
      const result = await takePhotoCompressed();
      if (result) {
        setFoto(result.uri);
        // Convertir a base64
        const base64 = await convertImageToBase64(result.uri);
        setFotoBase64(base64);
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'No se pudo tomar la foto',
        position: 'bottom',
      });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Seleccionar de galería
  const handlePickGallery = async () => {
    const hasPermission = await requestGalleryPermission();
    if (!hasPermission) return;

    try {
      setLoading(true);
      const result = await pickFromGalleryCompressed();
      if (result) {
        setFoto(result.uri);
        // Convertir a base64
        const base64 = await convertImageToBase64(result.uri);
        setFotoBase64(base64);
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'No se pudo seleccionar la foto',
        position: 'bottom',
      });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Eliminar foto
  const handleEliminarFoto = () => {
    setFoto(null);
    setFotoBase64(null);
  };

  // Manejar guardado de firma
  const handleSignatureChange = (sig) => {
    setSignature(sig);
  };

  // Crear instalación fallida
  const handleCrearInstalacionFallida = async () => {
    // Validaciones
    if (!codigoNevera.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Campo requerido',
        text2: 'Ingresa el código de nevera',
        position: 'bottom',
      });
      return;
    }

    if (!ubicacionConfirmada) {
      Toast.show({
        type: 'error',
        text1: 'Ubicación requerida',
        text2: 'Debes confirmar la ubicación',
        position: 'bottom',
      });
      return;
    }

    const causasSeleccionadas = Object.values(causasFallo).filter(Boolean).length;
    if (causasSeleccionadas === 0) {
      Toast.show({
        type: 'error',
        text1: 'Causa requerida',
        text2: 'Selecciona al menos una causa de fallo',
        position: 'bottom',
      });
      return;
    }

    const lugarSeleccionado = Object.values(lugarInstalacion).filter(Boolean).length;
    if (lugarSeleccionado === 0) {
      Toast.show({
        type: 'error',
        text1: 'Lugar requerido',
        text2: 'Selecciona al menos un lugar de instalación',
        position: 'bottom',
      });
      return;
    }

    if (!observacion.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Campo requerido',
        text2: 'Ingresa una observación',
        position: 'bottom',
      });
      return;
    }

    if (!foto) {
      Toast.show({
        type: 'error',
        text1: 'Foto requerida',
        text2: 'Debes tomar o seleccionar una foto',
        position: 'bottom',
      });
      return;
    }

    try {
      setLoading(true);

      const resultados = await searchNeverasByCodigo2(codigoNevera);
      console.log("Resultados de búsqueda:", resultados);

      if (!resultados || resultados.length > 1) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "El código ingresado no existe.",
          position: "bottom",
          visibilityTime: 4000,
        });

        setCodigoNevera("");
        setLoading(false);
        return;
      }

      const fechaHoy = new Date().toISOString().slice(0, 10);

      const validacion = await validarActaFallidaPorDia(codigoNevera, fechaHoy);
      console.log("Validación de nevera:", validacion);

      if (validacion.status === 0) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: validacion.msg || "Ya tiene registrada una instalación fallida hoy.",
          position: "bottom",
          visibilityTime: 4000,
        });
        setLoading(false);
        return;
      }

      let fotoPath = "";
      if (fotoBase64) {
        console.log("Subiendo foto...");
        const resFoto = await uploadImageBase64(fotoBase64, codigoNevera);

        if (resFoto?.fileName) {
          fotoPath = resFoto.fileName;
          console.log("Foto subida:", fotoPath);
        } else {
          console.error("⚠️ El backend no devolvió fileName para la foto.");
          Toast.show({
            type: "error",
            text1: "Error",
            text2: "No se pudo obtener la ruta de la foto desde el servidor.",
            position: "bottom",
            visibilityTime: 4000,
          });
          setLoading(false);
          return;
        }
      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Debes tomar o subir una foto antes de continuar.",
          position: "bottom",
          visibilityTime: 4000,
        });
        setLoading(false);
        return;
      }

      let firmaPath = "";
      if (signature) {
        let firmaBase64 = "";

        if (signature.data?.startsWith("data:image")) {
          firmaBase64 = signature.data;
        } else if (signature.uri) {
          console.log("Convirtiendo firma desde URI a base64...");
          firmaBase64 = await convertImageToBase64(signature.uri);
        }

        if (firmaBase64) {
          console.log("Subiendo firma...");
          const resFirma = await uploadImageBase64(firmaBase64, codigoNevera);
          if (resFirma?.fileName) {
            firmaPath = resFirma.fileName;
            console.log("Firma subida:", firmaPath);
          } else {
            console.warn("⚠️ El backend no devolvió fileName para la firma.");
          }
        } else {
          console.warn("No se encontró base64 de la firma.");
        }
      }

      const {
        direccionNoExiste,
        establecimientoCerrado,
        noSePermitioIngreso,
        puntoYaInstalado,
        congeladoraAveriada,
        noCorrespondeModelo,
        imposibilidadAccesoElectrico,
        congeladoraNoDisponible,
        sinCoberturaCelular,
        sinCoberturaGPS,
        faltaEspacioInstalacion,
        excedioTiempoMaxEspera,
      } = causasFallo;

      const payload = {
        codigo: codigoNevera,
        latitud: String(latitude),
        longitud: String(longitude),
        direccionNoExiste: direccionNoExiste ? "SI" : "NO",
        establecimientoCerrado: establecimientoCerrado ? "SI" : "NO",
        noPermitioIngreso: noSePermitioIngreso ? "SI" : "NO",
        puntoYaInstalado: puntoYaInstalado ? "SI" : "NO",
        congeladoraReportadaAveriada: congeladoraAveriada ? "SI" : "NO",
        noCorrespAlModelo: noCorrespondeModelo ? "SI" : "NO",
        imposibilidadAcceso: imposibilidadAccesoElectrico ? "SI" : "NO",
        congeladoraNoDisp: congeladoraNoDisponible ? "SI" : "NO",
        sinCoberturaCelular: sinCoberturaCelular ? "SI" : "NO",
        sinCoberturaGps: sinCoberturaGPS ? "SI" : "NO",
        faltaEspacioInstalacion: faltaEspacioInstalacion ? "SI" : "NO",
        excedioTiempoMaxEspera: excedioTiempoMaxEspera ? "SI" : "NO",
        observacion1: observacion,
        fotoObservacion1: "foto.jpg",
        fotoObservacion1Path: fotoPath,
        idNevera: 0,
        idUsuario: userInfo?.idUsuario,
        clienteRespFirmaPath: firmaPath || "-",
        clienteRespNombreApellido: nombreApellidos,
        clienteRespDni: dni,
        pdfPath: "",
      };

      console.log("Payload listo para enviar:", JSON.stringify(payload, null, 2));

      const res = await crearInstalacionFallida(payload);
      console.log("Instalación fallida creada:", res);

      const causasSeleccionadas = Object.entries(causasFallo)
        .filter(([_, valor]) => valor === true)
        .map(([clave]) => clave)
        .join(",");

      const lugarSeleccionado = Object.entries(lugarInstalacion)
        .filter(([_, valor]) => valor === true)
        .map(([clave]) => clave)
        .join(",");

      const observacionFinal = [causasSeleccionadas, lugarSeleccionado]
        .filter(Boolean)
        .join(" // ");

      const payloadGestion = {
        cod_nevera: codigoNevera,
        tecnico: userInfo?.idUsuario,
        fecha: new Date().toISOString().slice(0, 10),
        hora: new Date().toLocaleTimeString("es-PE", { hour12: false }),
        status: 3,
        imei: "",
        informe: res?.pdfPath || "",
        motivos: causasSeleccionadas,
        observacion: observacionFinal || "",
      };

      console.log("Payload gestión listo:", payloadGestion);

      const resGestion = await registrarGestionFallida(payloadGestion);
      console.log("Gestión fallida registrada:", resGestion);

      if (resGestion?.status === 0) {
        Toast.show({
          type: "error",
          text1: "Aviso",
          text2: resGestion?.msg || "Esta nevera ya está instalada",
          position: "bottom",
          visibilityTime: 4000,
        });
        return;
      }

      Toast.show({
        type: "success",
        text1: "✓ Éxito",
        text2: "Instalación fallida registrada correctamente",
        position: "bottom",
        visibilityTime: 3000,
      });

      setCodigoNevera("");
      setFotoBase64(null);
      setSignature(null);
      setObservacion("");
      setNombreApellidos("");
      setDni("");
      setFoto(null);

      setCausasFallo(Object.keys(causasFallo).reduce((acc, key) => ({ ...acc, [key]: false }), {}));
      setLugarInstalacion(Object.keys(lugarInstalacion).reduce((acc, key) => ({ ...acc, [key]: false }), {}));

      if (signatureRef.current) signatureRef.current.clearSignature();

    } catch (error) {
      console.error("Error en instalación o gestión fallida:", error);

      if (error?.response?.data && typeof error.response.data === "object") {
        const mensajes = Object.values(error.response.data).join("\n");
        Toast.show({
          type: "error",
          text1: "Errores de validación",
          text2: mensajes,
          position: "bottom",
          visibilityTime: 5000,
        });
      } else {
        const backendMsg =
          error?.message ||
          error?.response?.data?.msg ||
          "Error desconocido en el servidor";

        Toast.show({
          type: "error",
          text1: "Error",
          text2: backendMsg,
          position: "bottom",
          visibilityTime: 4000,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const causasLabels = {
    direccionNoExiste: 'Dirección no existe',
    establecimientoCerrado: 'Establecimiento cerrado',
    noSePermitioIngreso: 'No se permitió ingreso',
    puntoYaInstalado: 'El punto ya fue instalado en fecha previa',
    congeladoraAveriada: 'Congeladora reportada como averiada',
    noCorrespondeModelo: 'No corresponde al modelo contemplado',
    imposibilidadAccesoElectrico: 'Imposibilidad de acceso a la parte eléctrica',
    congeladoraNoDisponible: 'Congeladora no disponible',
    sinCoberturaCelular: 'Sin cobertura celular',
    sinCoberturaGPS: 'Sin cobertura GPS',
    faltaEspacio: 'Falta de espacio despejado para la instalación',
    excedioTiempoEspera: 'Excedió tiempo máximo de espera 10 minutos',
    neveraPropiaCliente: 'Nevera propia del cliente',
  };
  const lugarInstalacionLabels = {
    pdvNeveraOperativa: 'PDV con nevera operativa',
    pdvNeveraSinUso: 'PDV con nevera sin uso',
    patioDistribuidor: 'Patio distribuidor',
    patioFrioHielos: 'Patio frío de hielos',
  };
  const handleGoogleMaps = async () => {
    const url = `https://maps.google.com/?q=${latitude},${longitude}`;
    const supported = await Linking.canOpenURL(url);
    if (supported) await Linking.openURL(url);
    else Alert.alert("Error", "No se puede abrir el enlace.");
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>INSTALACIÓN FALLIDA</Text>

      <View style={styles.section}>
        <Text style={styles.label}>Código de Nevera</Text>
        <AutocompleteNeveraInput
          value={codigoNevera}
          onChangeText={setCodigoNevera}
          onBarcodeScan={handleBarcodeScan}
          onVoiceInput={() => handleVoiceInput('codigoNevera', 'Código de Nevera')}
        />
      </View>

      {/* Ubicación */}
      <View style={styles.section}>
        <View style={styles.ubicacionRow}>
          <TouchableOpacity
            style={[styles.btnCargarUbicacion, ubicacionConfirmada && styles.btnUbicacionConfirmada]}
            onPress={handleConfirmarUbicacion}
            disabled={loading}
          >
            <Text style={styles.btnCargarUbicacionText}>
              {loading ? 'Obteniendo...' :
                locationLoading ? 'Obteniendo...' :
                  'Cargar Ubicación'}
            </Text>
          </TouchableOpacity>

          <TextInput
            style={[ubicacionConfirmada ? styles.inputUbicacionConfirmed : styles.inputUbicacion]}
            placeholder="Ubicación"
            value={latitude && longitude ? `${latitude}, ${longitude}` : ''}
            editable={false}
          />
        </View>
        <TouchableOpacity onPress={handleGoogleMaps} disabled={!latitude || !longitude}>
          <Text style={{ color: '#007AFF', marginTop: 8, fontSize: 12 }}>https://maps.google.com/?q={latitude},{longitude}</Text>
        </TouchableOpacity>
        {locationError && !latitude && (
          <Text style={styles.errorText}>{locationError}</Text>
        )}
      </View>

      {/* Causas de Fallo */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Causas de fallo</Text>
        {Object.keys(causasFallo).map((causa) => (
          <TouchableOpacity
            key={causa}
            style={styles.checkboxContainer}
            onPress={() => toggleCausa(causa)}
          >
            <View style={[styles.checkbox, causasFallo[causa] && styles.checkboxChecked]}>
              {causasFallo[causa] && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.checkboxLabel}>{causasLabels[causa]}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Lugar de Instalación</Text>
        {Object.keys(lugarInstalacion).map((lugar) => (
          <TouchableOpacity
            key={lugar}
            style={styles.checkboxContainer}
            onPress={() => toggleLugarInstalacion(lugar)}
          >
            <View style={[styles.checkbox, lugarInstalacion[lugar] && styles.checkboxChecked]}>
              {lugarInstalacion[lugar] && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.checkboxLabel}>{lugarInstalacionLabels[lugar]}</Text>
          </TouchableOpacity>
        ))}
      </View>


      {/* Observación */}
      <View style={styles.section}>
        <Text style={styles.label}>Observación</Text>
        <EnhancedInput
          value={observacion}
          onChangeText={setObservacion}
          placeholder="Escriba su observación aquí"
          keyboardType="default"
          showMicrophone={true}
          onMicrophonePress={() => handleVoiceInput('observacion', 'Observación')}
          multiline={true}
          numberOfLines={4}
        />
      </View>

      {/* Foto */}
      <View style={styles.section}>
        <Text style={styles.label}>Foto</Text>
        {!foto ? (
          <View style={styles.fotoContainer}>
            <TouchableOpacity style={styles.fotoPlaceholder} onPress={handleTakePhoto}>
              <Text style={styles.fotoIcon}>📷</Text>
              <Text style={styles.fotoText}>Tomar foto</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.fotoPlaceholder} onPress={handlePickGallery}>
              <Text style={styles.fotoIcon}>🖼️</Text>
              <Text style={styles.fotoText}>Galería</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.fotoPreview}>
            <Image source={{ uri: foto }} style={styles.fotoImage} />
            <TouchableOpacity style={styles.btnEliminarFoto} onPress={handleEliminarFoto}>
              <Text style={styles.btnEliminarFotoText}>🗑️ Eliminar foto</Text>
            </TouchableOpacity>
          </View>
        )}
        {loading && <ActivityIndicator size="large" color="#2b4a8b" style={styles.loader} />}
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Firma del cliente</Text>
        <SignatureInput
          ref={signatureRef}
          onSignatureChange={handleSignatureChange}
          error={null}
        />
        <TouchableOpacity style={styles.btnEliminarFoto} onPress={() => {
          if (signatureRef.current) signatureRef.current.clearSignature();
          setSignature(null);
        }}>
          <Text style={styles.btnEliminarFotoText}>🗑️ Eliminar firma</Text>
        </TouchableOpacity>
      </View>

      {/* Nombres y Apellidos */}
      <View style={styles.section}>
        <Text style={styles.label}>Nombres y Apellidos</Text>
        <EnhancedInput
          value={nombreApellidos}
          onChangeText={setNombreApellidos}
          placeholder="Nombres y Apellidos"
          keyboardType="default"
          showMicrophone={true}
          onMicrophonePress={() => handleVoiceInput('nombreApellidos', 'Nombres y Apellidos')}
        />
      </View>

      {/* DNI */}
      <View style={styles.section}>
        <Text style={styles.label}>DNI</Text>
        <TextInput
          style={styles.input}
          placeholder="DNI"
          value={dni}
          onChangeText={setDni}
          keyboardType="numeric"
        />
      </View>

      {/* Botón Crear */}
      <TouchableOpacity
        style={styles.btnCrear}
        onPress={handleCrearInstalacionFallida}
        disabled={loading}
      >
        <Text style={styles.btnCrearText}>CREAR INSTALACIÓN FALLIDA</Text>
      </TouchableOpacity>

      {/* Modal de Escáner de Código de Barras */}
      <Modal
        visible={showBarcodeScanner}
        animationType="slide"
        onRequestClose={() => setShowBarcodeScanner(false)}
      >
        <BarcodeScanner
          onCodeScanned={handleCodeScanned}
          onClose={() => setShowBarcodeScanner(false)}
        />
      </Modal>

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
        removeSpaces={true}
      />

      {/* Modal de GPS Requerido */}
      <GPSRequiredModal
        visible={showGPSModal}
        onRetry={handleRetryGPS}
        isChecking={isCheckingGPS}
      />
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
    padding: 20,
    paddingBottom: 100,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#000',
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#000',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#fff',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#fff',
    minHeight: 100,
  },
  ubicacionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  btnCargarUbicacion: {
    flex: 1,
    backgroundColor: '#2b4a8b',
    padding: 13,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnUbicacionConfirmada: {
    backgroundColor: '#27ae60',
  },
  btnCargarUbicacionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  inputUbicacion: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 13,
    fontSize: 14,
    backgroundColor: '#fff',
    color: '#000',
  },
  inputUbicacionConfirmed: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#27ae60',
    borderRadius: 8,
    padding: 13,
    fontSize: 14,
    backgroundColor: '#eafaf1',
    color: '#000',
  },
  confirmadoText: {
    marginTop: 8,
    fontSize: 12,
    color: '#27ae60',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  errorText: {
    marginTop: 8,
    fontSize: 12,
    color: '#e74c3c',
    textAlign: 'center',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#2b4a8b',
    borderRadius: 4,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  checkboxChecked: {
    backgroundColor: '#2b4a8b',
  },
  checkmark: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  fotoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  fotoPlaceholder: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#2b4a8b',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  fotoIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  fotoText: {
    fontSize: 12,
    color: '#2b4a8b',
    fontWeight: '500',
  },
  fotoPreview: {
    alignItems: 'center',
  },
  fotoImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  btnEliminarFoto: {
    marginTop: 10,
    backgroundColor: '#e74c3c',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnEliminarFotoText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  loader: {
    marginTop: 10,
  },
  btnCrear: {
    backgroundColor: '#2b4a8b',
    padding: 18,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  btnCrearText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default NuevaInstalacionFallidaScreen;