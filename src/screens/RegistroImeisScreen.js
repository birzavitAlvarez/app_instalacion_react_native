import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Modal,
  FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Toast from 'react-native-toast-message';
import { useAuth } from '../hooks/useAuth';
import { registrarControlDispositivo } from '../services/registroImeisService';
import { uploadImageToServer } from '../services/uploadService';
import { takePhotoCompressed, pickFromGalleryCompressed } from '../utils/imageUtil';
import { requestCameraPermission, requestGalleryPermission } from '../utils/permissions';
import BarcodeScanner from '../components/BarcodeScanner';
import VoiceInput from '../components/VoiceInput';

const RegistroImeisScreen = ({ navigation }) => {
  const { idUsuario } = useAuth();
  
  // Estados del formulario
  const [titulo, setTitulo] = useState('');
  const [fotoGuia, setFotoGuia] = useState(null);
  const [fotoGuiaFileName, setFotoGuiaFileName] = useState(null);
  const [imeiInput, setImeiInput] = useState('');
  const [listaImeis, setListaImeis] = useState([]);
  
  // Estados de modales
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [showVoiceInput, setShowVoiceInput] = useState(false);
  const [currentVoiceField, setCurrentVoiceField] = useState(null);
  const [showImageSourceModal, setShowImageSourceModal] = useState(false);
  
  // Estados de carga
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Manejar escaneo de código de barras para IMEI
  const handleBarcodeScan = () => {
    setShowBarcodeScanner(true);
  };

  // Manejar código escaneado
  const handleCodeScanned = (code) => {
    setImeiInput(code);
    setShowBarcodeScanner(false);
    
    Toast.show({
      type: 'success',
      text1: 'IMEI Escaneado',
      text2: code,
      position: 'bottom',
      visibilityTime: 2000,
    });
  };

  // Manejar entrada por voz
  const handleVoiceInput = (fieldName) => {
    setCurrentVoiceField(fieldName);
    setShowVoiceInput(true);
  };

  // Manejar resultado de voz
  const handleVoiceResult = (text) => {
    if (currentVoiceField === 'titulo') {
      setTitulo(text);
    } else if (currentVoiceField === 'imei') {
      // Para IMEI, remover espacios
      setImeiInput(text.replace(/\s/g, ''));
    }
    
    Toast.show({
      type: 'success',
      text1: 'Texto reconocido',
      text2: text,
      position: 'bottom',
      visibilityTime: 2000,
    });
  };

  // Agregar IMEI a la lista
  const handleAddImei = () => {
    const imeiTrimmed = imeiInput.trim();
    
    if (!imeiTrimmed) {
      Toast.show({
        type: 'error',
        text1: 'Campo vacío',
        text2: 'Ingrese un IMEI válido',
        position: 'bottom',
      });
      return;
    }

    if (listaImeis.includes(imeiTrimmed)) {
      Toast.show({
        type: 'error',
        text1: 'IMEI duplicado',
        text2: 'Este IMEI ya está en la lista',
        position: 'bottom',
      });
      return;
    }

    setListaImeis([...listaImeis, imeiTrimmed]);
    setImeiInput('');
    
    Toast.show({
      type: 'success',
      text1: 'IMEI agregado',
      text2: `Total: ${listaImeis.length + 1} IMEIs`,
      position: 'bottom',
    });
  };

  // Eliminar IMEI de la lista
  const handleRemoveImei = (imei) => {
    setListaImeis(listaImeis.filter(item => item !== imei));
    
    Toast.show({
      type: 'info',
      text1: 'IMEI eliminado',
      text2: `Total: ${listaImeis.length - 1} IMEIs`,
      position: 'bottom',
    });
  };

  // Manejar selección de fuente de imagen
  const handleTakePhoto = () => {
    setShowImageSourceModal(true);
  };

  // Tomar foto desde cámara
  const handleTakeFromCamera = async () => {
    setShowImageSourceModal(false);
    
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;

    try {
      setUploadingImage(true);
      const result = await takePhotoCompressed();
      
      if (result) {
        // Subir imagen al servidor usando un código temporal
        console.log('Subiendo imagen de guía...');
        const filename = await uploadImageToServer(result.uri, 'GUIA_REMISION');
        console.log('Imagen subida:', filename);
        
        // Construir URL de previsualización
        const previewUrl = `https://phuyu-iot.com/NESTLE-API-TECNICOS/public/${filename}`;
        
        setFotoGuia(previewUrl);
        setFotoGuiaFileName(filename);
        
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
      setUploadingImage(false);
    }
  };

  // Seleccionar foto desde galería
  const handlePickFromGallery = async () => {
    setShowImageSourceModal(false);
    
    const hasPermission = await requestGalleryPermission();
    if (!hasPermission) return;

    try {
      setUploadingImage(true);
      const result = await pickFromGalleryCompressed();
      
      if (result) {
        // Subir imagen al servidor
        console.log('Subiendo imagen de guía...');
        const filename = await uploadImageToServer(result.uri, 'GUIA_REMISION');
        console.log('Imagen subida:', filename);
        
        // Construir URL de previsualización
        const previewUrl = `https://phuyu-iot.com/NESTLE-API-TECNICOS/public/${filename}`;
        
        setFotoGuia(previewUrl);
        setFotoGuiaFileName(filename);
        
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
      setUploadingImage(false);
    }
  };

  // Eliminar foto
  const handleDeletePhoto = () => {
    setFotoGuia(null);
    setFotoGuiaFileName(null);
    
    Toast.show({
      type: 'info',
      text1: 'Foto eliminada',
      text2: 'Puede agregar una nueva foto',
      position: 'bottom',
    });
  };

  // Enviar datos al servidor
  const handleSubmit = async () => {
    // Validaciones
    if (!titulo.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Campo obligatorio',
        text2: 'Ingrese la guía de remisión',
        position: 'bottom',
      });
      return;
    }

    if (listaImeis.length === 0) {
      Toast.show({
        type: 'error',
        text1: 'Lista vacía',
        text2: 'Agregue al menos un IMEI a la lista',
        position: 'bottom',
      });
      return;
    }

    setLoading(true);
    
    try {
      const data = {
        titulo: titulo.trim(),
        foto_path: fotoGuiaFileName || '',
        lista_imeis: listaImeis,
        id_usuario: idUsuario,
      };
      
      console.log('Enviando registro de IMEIs:', data);
      
      const response = await registrarControlDispositivo(data);
      
      console.log('Respuesta del servidor:', response);
      
      Toast.show({
        type: 'success',
        text1: 'Registro exitoso',
        text2: `${listaImeis.length} IMEIs registrados correctamente`,
        position: 'bottom',
        visibilityTime: 3000,
      });
      
      // Limpiar formulario
      setTitulo('');
      setFotoGuia(null);
      setFotoGuiaFileName(null);
      setImeiInput('');
      setListaImeis([]);
      
      // Opcional: navegar a otra pantalla
      // navigation.goBack();
      
    } catch (error) {
      console.error('Error enviando registro:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.msg || 'No se pudo enviar el registro',
        position: 'bottom',
      });
    } finally {
      setLoading(false);
    }
  };

  // Renderizar item de IMEI en la lista
  const renderImeiItem = ({ item, index }) => (
    <View style={styles.imeiItem}>
      <View style={styles.imeiItemContent}>
        <Text style={styles.imeiItemNumber}>{index + 1}.</Text>
        <Text style={styles.imeiItemText}>{item}</Text>
      </View>
      <TouchableOpacity
        style={styles.deleteImeiButton}
        onPress={() => handleRemoveImei(item)}
      >
        <Icon name="close" size={20} color="#e74c3c" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Título de la pantalla */}
        <Text style={styles.title}>REGISTRO DE IMEIS</Text>
        <View style={styles.divider} />

        {/* Campo: Guía de Remisión */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Guía de remisión"
            value={titulo}
            onChangeText={setTitulo}
            maxLength={100}
          />
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => handleTakePhoto()}
          >
            <Icon name="camera-alt" size={24} color="#2b4a8b" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => handleVoiceInput('titulo')}
          >
            <Icon name="mic" size={24} color="#2b4a8b" />
          </TouchableOpacity>
        </View>

        {/* Foto de la guía (opcional) - Solo se muestra si hay foto o está subiendo */}
        {uploadingImage && (
          <View style={styles.photoContainer}>
            <ActivityIndicator size="large" color="#2b4a8b" />
            <Text style={styles.uploadingText}>Subiendo imagen...</Text>
          </View>
        )}
        
        {fotoGuia && !uploadingImage && (
          <>
            <TouchableOpacity
              style={styles.photoContainer}
              onPress={handleTakePhoto}
            >
              <Image source={{ uri: fotoGuia }} style={styles.photo} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deletePhotoButton}
              onPress={handleDeletePhoto}
            >
              <Icon name="delete" size={20} color="#e74c3c" />
              <Text style={styles.deletePhotoText}>Eliminar foto</Text>
            </TouchableOpacity>
          </>
        )}

        {/* Campo: Buscar por IMEI */}
        <View style={styles.imeiSection}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Ingrese IMEI"
              value={imeiInput}
              onChangeText={setImeiInput}
              keyboardType="numeric"
              maxLength={20}
            />
            <TouchableOpacity
              style={styles.iconButton}
              onPress={handleBarcodeScan}
            >
              <Icon name="qr-code-scanner" size={24} color="#2b4a8b" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => handleVoiceInput('imei')}
            >
              <Icon name="mic" size={24} color="#2b4a8b" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Botón: Agregar a Lista */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddImei}
          disabled={!imeiInput.trim()}
        >
          <Text style={styles.addButtonText}>AGREGAR A LISTA</Text>
        </TouchableOpacity>

        {/* Lista de IMEIs */}
        {listaImeis.length > 0 && (
          <View style={styles.listContainer}>
            <Text style={styles.listTitle}>
              IMEIs Agregados ({listaImeis.length})
            </Text>
            <FlatList
              data={listaImeis}
              renderItem={renderImeiItem}
              keyExtractor={(item, index) => `${item}-${index}`}
              scrollEnabled={false}
              style={styles.imeiList}
            />
          </View>
        )}

        {/* Botón: Mandar a Salida */}
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.submitButtonText}>FINALIZAR REGISTRO</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

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
        }}
        onResult={handleVoiceResult}
        fieldLabel={currentVoiceField === 'titulo' ? 'Guía de Remisión' : 'IMEI'}
        removeSpaces={currentVoiceField === 'imei'}
      />

      {/* Modal de Selección de Fuente de Imagen */}
      <Modal
        visible={showImageSourceModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowImageSourceModal(false)}
      >
        <TouchableOpacity 
          style={styles.imageSourceOverlay}
          activeOpacity={1}
          onPress={() => setShowImageSourceModal(false)}
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
              onPress={() => setShowImageSourceModal(false)}
              activeOpacity={0.7}
            >
              <Icon name="close" size={24} color="#666" />
              <Text style={[styles.imageSourceButtonText, styles.cancelButtonText]}>
                Cancelar
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  divider: {
    width: 200,
    height: 2,
    backgroundColor: '#3F51B5',
    alignSelf: 'center',
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    color: '#2b4a8b',
    marginBottom: 8,
    fontWeight: '500',
  },
  labelMarginTop: {
    marginTop: 24,
  },
  imeiSection: {
    marginTop: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    minHeight: 50,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    paddingVertical: 12,
  },
  iconButton: {
    padding: 8,
    marginLeft: 4,
  },
  photoContainer: {
    marginTop: 12,
    borderWidth: 2,
    borderColor: '#00BCD4',
    borderStyle: 'dashed',
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    width: '100%',
    aspectRatio: 4 / 3,
  },
  photo: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
    backgroundColor: '#fff',
  },
  uploadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  photoPlaceholder: {
    marginTop: 12,
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  photoPlaceholderText: {
    marginTop: 8,
    fontSize: 14,
    color: '#999',
  },
  deletePhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  deletePhotoText: {
    fontSize: 12,
    color: '#e74c3c',
    marginLeft: 4,
  },
  addButton: {
    backgroundColor: '#2b4a8b',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  listContainer: {
    marginTop: 24,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#f9f9f9',
  },
  listTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2b4a8b',
    marginBottom: 12,
  },
  imeiList: {
    maxHeight: 300,
  },
  imeiItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  imeiItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  imeiItemNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2b4a8b',
    marginRight: 8,
    minWidth: 30,
  },
  imeiItemText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  deleteImeiButton: {
    padding: 4,
  },
  submitButton: {
    backgroundColor: '#2b4a8b',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 32,
  },
  submitButtonDisabled: {
    backgroundColor: '#999',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
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

export default RegistroImeisScreen;