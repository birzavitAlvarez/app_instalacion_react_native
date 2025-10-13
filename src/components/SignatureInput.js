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
} from 'react-native';
import SignaturePad from './SignaturePad';
import SignatureOptionsModal from './SignatureOptionsModal';
import { takePhotoCompressed, pickFromGalleryCompressed } from '../utils/imageUtil';

const { width, height } = Dimensions.get('window');

const SignatureInput = forwardRef(({ error, onSignatureChange }, ref) => {
  const [signature, setSignature] = useState(null);
  const [signatureSource, setSignatureSource] = useState(null);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [showDrawModal, setShowDrawModal] = useState(false);
  const signaturePadRef = useRef();

  const handleOpenOptions = () => {
    setShowOptionsModal(true);
  };

  const handleDrawSignature = () => {
    setShowOptionsModal(false);
    setShowDrawModal(true);
  };

  const handleTakePhoto = async () => {
    setShowOptionsModal(false);
    try {
      const result = await takePhotoCompressed();
      if (result) {
        setSignature({
          source: 'camera',
          data: result.base64,
          bytes: result.bytes,
          uri: result.uri,
        });
        setSignatureSource('camera');
        onSignatureChange?.({ source: 'camera', data: result.base64 });
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handlePickGallery = async () => {
    setShowOptionsModal(false);
    try {
      const result = await pickFromGalleryCompressed();
      if (result) {
        setSignature({
          source: 'gallery',
          data: result.base64,
          bytes: result.bytes,
          uri: result.uri,
        });
        setSignatureSource('gallery');
        onSignatureChange?.({ source: 'gallery', data: result.base64 });
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleSaveDrawnSignature = () => {
    if (signaturePadRef.current) {
      const hasSignature = signaturePadRef.current.hasSignature();
      if (hasSignature) {
        const signatureData = signaturePadRef.current.getSignatureData();
        setSignature({
          source: 'draw',
          data: signatureData,
        });
        setSignatureSource('draw');
        setShowDrawModal(false);
        onSignatureChange?.({ source: 'draw', data: signatureData });
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

  const handleRemoveSignature = () => {
    Alert.alert(
      'Confirmar',
      '¿Está seguro que desea eliminar la firma?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            setSignature(null);
            setSignatureSource(null);
            onSignatureChange?.(null);
          },
        },
      ]
    );
  };

  useImperativeHandle(ref, () => ({
    getSignature: () => signature,
    hasSignature: () => signature !== null,
    clearSignature: () => {
      setSignature(null);
      setSignatureSource(null);
    },
  }));

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.signatureContainer, error && styles.signatureContainerError]}
        onPress={signature ? null : handleOpenOptions}
        activeOpacity={signature ? 1 : 0.7}
      >
        {signature ? (
          <View style={styles.signaturePreview}>
            {signatureSource === 'draw' ? (
              <View style={styles.drawnPreview}>
                <Text style={styles.drawnIcon}>✓</Text>
                <Text style={styles.drawnText}>Firma capturada</Text>
                <Text style={styles.drawnSubtext}>Firma dibujada exitosamente</Text>
              </View>
            ) : (
              <Image
                source={{ uri: signature.data }}
                style={styles.signatureImage}
                resizeMode="contain"
              />
            )}
          </View>
        ) : (
          <View style={styles.placeholder}>
            <View style={styles.iconRow}>
              <View style={styles.iconButton}>
                <Text style={styles.iconText}>✏️</Text>
              </View>
              <View style={styles.iconButton}>
                <Text style={styles.iconText}>📷</Text>
              </View>
            </View>
            <Text style={styles.placeholderText}>Toca para agregar firma</Text>
          </View>
        )}
      </TouchableOpacity>

      {signature && (
        <TouchableOpacity style={styles.removeButton} onPress={handleRemoveSignature}>
          <Text style={styles.removeButtonText}>Eliminar firma</Text>
        </TouchableOpacity>
      )}

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
  },
  signatureContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
    minHeight: 200,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  signatureContainerError: {
    borderColor: '#ff4444',
  },
  placeholder: {
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
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signatureImage: {
    width: '100%',
    height: '100%',
  },
  drawnPreview: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  drawnIcon: {
    fontSize: 60,
    color: '#4CAF50',
    marginBottom: 10,
  },
  drawnText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  drawnSubtext: {
    fontSize: 14,
    color: '#666',
  },
  removeButton: {
    marginTop: 8,
    alignSelf: 'center',
  },
  removeButtonText: {
    color: '#ff4444',
    fontSize: 14,
  },

  // Estilos del modal tipo diálogo
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