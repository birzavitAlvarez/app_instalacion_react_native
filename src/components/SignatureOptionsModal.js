import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

const SignatureOptionsModal = ({ visible, onClose, onDrawSignature, onTakePhoto, onPickGallery }) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.optionsModal}>
          <Text style={styles.optionsTitle}>Seleccione una opción</Text>
          
          <TouchableOpacity style={styles.optionButton} onPress={onDrawSignature}>
            <Text style={styles.optionIcon}>✏️</Text>
            <Text style={styles.optionText}>Dibujar firma</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionButton} onPress={onTakePhoto}>
            <Text style={styles.optionIcon}>📷</Text>
            <Text style={styles.optionText}>Tomar foto</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionButton} onPress={onPickGallery}>
            <Text style={styles.optionIcon}>🖼️</Text>
            <Text style={styles.optionText}>Seleccionar de galería</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.optionButton, styles.cancelButton]}
            onPress={onClose}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionsModal: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: width * 0.85,
    maxWidth: 400,
  },
  optionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    marginBottom: 10,
  },
  optionIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  optionText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  cancelButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    marginTop: 10,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    flex: 1,
  },
});

export default SignatureOptionsModal;