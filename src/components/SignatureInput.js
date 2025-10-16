import React, { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  Modal,
  Dimensions,
  TouchableWithoutFeedback,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import SignaturePad from './SignaturePad';
import SignatureOptionsModal from './SignatureOptionsModal';
import { takePhotoCompressed, pickFromGalleryCompressed } from '../utils/imageUtil';
import { requestCameraPermission, requestGalleryPermission } from '../utils/permissions';

const { width, height } = Dimensions.get('window');

const SignatureInput = forwardRef(({ error, onSignatureChange, existingSignatureUrl, onUpload, idUsuario, token }, ref) => {
  const [signature, setSignature] = useState(null);
  const [signatureSource, setSignatureSource] = useState(null);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [showDrawModal, setShowDrawModal] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [uploading, setUploading] = useState(false);
  const signaturePadRef = useRef();

  // Determinar si hay una firma (existente o nueva)
  const hasSignature = signature !== null || (existingSignatureUrl && !imageError);

  React.useEffect(() => {
    if (existingSignatureUrl) {
      setImageError(false);
    }
  }, [existingSignatureUrl]);

  const handleOpenOptions = () => {
    setShowOptionsModal(true);
  };

  const handleDrawSignature = () => {
    setShowOptionsModal(false);
    setShowDrawModal(true);
  };

  const handleTakePhoto = async () => {
    setShowOptionsModal(false);
    
    // Solicitar permiso de cámara
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      return;
    }

    try {
      setUploading(true);
      const result = await takePhotoCompressed();
      if (result) {
        // Subir inmediatamente al servidor si hay callback
        if (onUpload && idUsuario && token) {
          const uploadResult = await onUpload(idUsuario, result.uri, token);
          
          setSignature({
            source: 'camera',
            data: result.base64,
            bytes: result.bytes,
            uri: result.uri,
            uploaded: true,
            serverResponse: uploadResult,
          });
        } else {
          setSignature({
            source: 'camera',
            data: result.base64,
            bytes: result.bytes,
            uri: result.uri,
          });
        }
        setSignatureSource('camera');
        onSignatureChange?.({ source: 'camera', data: result.base64, uri: result.uri });
      }
    } catch (err) {
      console.error('Error en handleTakePhoto:', err);
      Alert.alert('Error', err.message);
    } finally {
      setUploading(false);
    }
  };

  const handlePickGallery = async () => {
    setShowOptionsModal(false);
    
    // Solicitar permiso de galería
    const hasPermission = await requestGalleryPermission();
    if (!hasPermission) {
      return;
    }

    try {
      setUploading(true);
      const result = await pickFromGalleryCompressed();
      if (result) {
        // Subir inmediatamente al servidor si hay callback
        if (onUpload && idUsuario && token) {
          const uploadResult = await onUpload(idUsuario, result.uri, token);
          
          setSignature({
            source: 'gallery',
            data: result.base64,
            bytes: result.bytes,
            uri: result.uri,
            uploaded: true,
            serverResponse: uploadResult,
          });
        } else {
          setSignature({
            source: 'gallery',
            data: result.base64,
            bytes: result.bytes,
            uri: result.uri,
          });
        }
        setSignatureSource('gallery');
        onSignatureChange?.({ source: 'gallery', data: result.base64, uri: result.uri });
      }
    } catch (err) {
      console.error('Error en handlePickGallery:', err);
      Alert.alert('Error', err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSaveDrawnSignature = async () => {
    if (signaturePadRef.current) {
      const hasDrawnSignature = signaturePadRef.current.hasSignature();
      if (hasDrawnSignature) {
        try {
          setUploading(true);
          
          // Capturar firma como JPG comprimido
          const jpgUri = await signaturePadRef.current.captureAsJPG();
          
          // Subir inmediatamente al servidor
          if (onUpload && idUsuario && token) {
            const uploadResult = await onUpload(idUsuario, jpgUri, token);
            
            setSignature({
              source: 'draw',
              uri: jpgUri,
              uploaded: true,
              serverResponse: uploadResult,
            });
            
            Alert.alert('Éxito', 'Firma guardada y subida correctamente');
          } else {
            // Si no hay callback, solo guardar localmente
            setSignature({
              source: 'draw',
              uri: jpgUri,
              uploaded: false,
            });
          }
          
          setSignatureSource('draw');
          setShowDrawModal(false);
          onSignatureChange?.({ source: 'draw', uri: jpgUri });
        } catch (err) {
          console.error('Error en handleSaveDrawnSignature:', err);
          Alert.alert('Error', err.message);
        } finally {
          setUploading(false);
        }
      } else {
        Alert.alert('Aviso', 'Por favor dibuje su firma');
      }
    }
  };

  const handleClearCanvas = () => {
    if (signaturePadRef.current) {
      signaturePadRef.current.clearSignature();
    }
  };

  useImperativeHandle(ref, () => ({
    getSignature: () => signature,
    hasSignature: () => signature !== null || (existingSignatureUrl && !imageError),
    clearSignature: () => {
      setSignature(null);
      setSignatureSource(null);
    },
  }));

  return (
    <View style={styles.container}>
      {/* Indicador de carga mientras se sube */}
      {uploading && (
        <View style={styles.uploadingOverlay}>
          <ActivityIndicator size="large" color="#1a1a7e" />
          <Text style={styles.uploadingText}>Subiendo firma...</Text>
        </View>
      )}
      
      {/* Contenedor de la firma con imagen de fondo si existe */}
      <View style={[styles.signatureContainer, error && styles.signatureContainerError]}>
        {/* Mostrar firma existente o nueva firma */}
        {hasSignature ? (
          <View style={styles.signaturePreview}>
            {/* Iconos pequeños arriba para actualizar */}
            <View style={styles.updateIconsRow}>
              <TouchableOpacity 
                style={[styles.smallIconButton, signatureSource === 'draw' && styles.smallIconButtonActive]}
                onPress={handleDrawSignature}
                activeOpacity={0.7}
              >
                <Text style={styles.smallIconText}>✏️</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.smallIconButton, (signatureSource === 'camera' || signatureSource === 'gallery') && styles.smallIconButtonActive]}
                onPress={handleOpenOptions}
                activeOpacity={0.7}
              >
                <Text style={styles.smallIconText}>📷</Text>
              </TouchableOpacity>
            </View>

            {/* Imagen de la firma */}
            <View style={styles.signatureImageContainer}>
              {signature ? (
                // Nueva firma capturada
                signatureSource === 'draw' ? (
                  <View style={styles.drawnPreview}>
                    <Text style={styles.drawnIcon}>✓</Text>
                    <Text style={styles.drawnText}>Firma actualizada</Text>
                  </View>
                ) : (
                  <Image
                    source={{ uri: signature.data }}
                    style={styles.signatureImage}
                    resizeMode="contain"
                  />
                )
              ) : (
                // Firma existente de la API
                <Image
                  source={{ uri: existingSignatureUrl }}
                  style={styles.signatureImage}
                  resizeMode="contain"
                  onError={() => {
                    setImageError(true);
                  }}
                  onLoad={() => {
                    setImageError(false);
                  }}
                />
              )}
            </View>
          </View>
        ) : (
          // Sin firma: mostrar iconos grandes para crear
          <TouchableOpacity 
            style={styles.placeholder}
            onPress={handleOpenOptions}
            activeOpacity={0.7}
          >
            <View style={styles.iconRow}>
              <View style={styles.iconButton}>
                <Text style={styles.iconText}>✏️</Text>
              </View>
              <View style={styles.iconButton}>
                <Text style={styles.iconText}>📷</Text>
              </View>
            </View>
            <Text style={styles.placeholderText}>Toca para agregar firma</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Modal de opciones */}
      <SignatureOptionsModal
        visible={showOptionsModal}
        onClose={() => setShowOptionsModal(false)}
        onDrawSignature={handleDrawSignature}
        onTakePhoto={handleTakePhoto}
        onPickGallery={handlePickGallery}
      />

      {/* Modal tipo diálogo centrado */}
      <Modal
        visible={showDrawModal}
        transparent={true}
        animationType="fade"
        statusBarTranslucent={true}
        onRequestClose={() => setShowDrawModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowDrawModal(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalDialog}>
                {/* Header */}
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Firma aquí</Text>
                  <TouchableOpacity 
                    onPress={handleClearCanvas}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Text style={styles.clearText}>Limpiar</Text>
                  </TouchableOpacity>
                </View>

                {/* Área del canvas */}
                <View style={styles.canvasArea}>
                  <SignaturePad ref={signaturePadRef} />
                </View>

                {/* Footer con botones */}
                <View style={styles.modalFooter}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => setShowDrawModal(false)}
                  >
                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.saveButton}
                    onPress={handleSaveDrawnSignature}
                  >
                    <Text style={styles.saveButtonText}>Guardar Firma</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    width: '100%',
    position: 'relative',
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    borderRadius: 8,
  },
  uploadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#1a1a7e',
    fontWeight: '500',
  },
  signatureContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
    height: 150,
    maxHeight: 150,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  signatureContainerError: {
    borderColor: '#ff4444',
  },
  placeholder: {
    flex: 1,
    width: '100%',
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  iconButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  iconText: {
    fontSize: 28,
  },
  placeholderText: {
    color: '#999',
    fontSize: 14,
  },
  signaturePreview: {
    width: '100%',
    height: 150,
    maxHeight: 150,
    position: 'relative',
  },
  updateIconsRow: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    zIndex: 10,
    gap: 8,
  },
  smallIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  smallIconButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  smallIconText: {
    fontSize: 20,
  },
  signatureImageContainer: {
    width: '100%',
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
  },
  signatureImage: {
    width: '100%',
    height: '100%',
  },
  drawnPreview: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  drawnIcon: {
    fontSize: 48,
    color: '#4CAF50',
    marginBottom: 8,
  },
  drawnText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: StatusBar.currentHeight || 0,
  },
  modalDialog: {
    width: width * 0.92,
    maxWidth: 500,
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    maxHeight: height * 0.85,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  clearText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  canvasArea: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 16,
    paddingVertical: 24,
    alignItems: 'center',
  },
  modalFooter: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d0d0d0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: '#1a1a7e',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
});

SignatureInput.displayName = 'SignatureInput';

export default SignatureInput;