import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { Camera, CameraType } from 'react-native-camera-kit';
import Icon from 'react-native-vector-icons/MaterialIcons';

/**
 * Componente para escanear códigos de barras usando react-native-camera-kit
 * 
 * @param {function} onCodeScanned - Callback con el código escaneado
 * @param {function} onClose - Callback para cerrar el escáner
 */
const BarcodeScanner = ({ onCodeScanned, onClose }) => {
  const [scanned, setScanned] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);

  const handleBarCodeRead = (event) => {
    console.log('📷 Evento de lectura de código:', event);
    console.log('📷 nativeEvent:', event.nativeEvent);
    console.log('📷 codeStringValue:', event.nativeEvent?.codeStringValue);
    
    if (!scanned && event.nativeEvent?.codeStringValue) {
      setScanned(true);
      const code = event.nativeEvent.codeStringValue;
      console.log('✅ Código escaneado:', code);
      onCodeScanned(code);
      // Pequeño delay antes de cerrar para feedback visual
      setTimeout(() => {
        onClose();
      }, 300);
    } else {
      console.log('⚠️ No se pudo leer el código o ya fue escaneado');
    }
  };

  const handleManualSubmit = () => {
    if (manualInput.trim()) {
      console.log('✅ Código manual ingresado:', manualInput);
      onCodeScanned(manualInput.trim());
      onClose();
    }
  };

  return (
    <View style={styles.container}>
      <Camera
        style={StyleSheet.absoluteFill}
        cameraType={CameraType.Back}
        scanBarcode={true}
        onReadCode={handleBarCodeRead}
        showFrame={true}
        laserColor="rgba(255, 255, 255, 0.5)"
        frameColor="rgba(255, 255, 255, 0.5)"
      />
      
      {/* Overlay con instrucciones */}
      <View style={styles.overlay}>
        <View style={styles.topOverlay}>
          <Text style={styles.instructionText}>
            Apunta la cámara al código de barras
          </Text>
        </View>
        
        <View style={styles.middleRow}>
          <View style={styles.sideOverlay} />
          <View style={styles.scanFrame} />
          <View style={styles.sideOverlay} />
        </View>
        
        <View style={styles.bottomOverlay} />
      </View>

      {/* Botón cerrar */}
      <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
        <Icon name="close" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Botón de entrada manual */}
      <TouchableOpacity 
        style={styles.manualBtn} 
        onPress={() => setShowManualInput(!showManualInput)}
      >
        <Icon name="keyboard" size={24} color="#fff" />
        <Text style={styles.manualBtnText}>Ingresar manualmente</Text>
      </TouchableOpacity>

      {/* Input manual */}
      {showManualInput && (
        <View style={styles.manualInputContainer}>
          <TextInput
            style={styles.manualInput}
            value={manualInput}
            onChangeText={setManualInput}
            placeholder="Ingrese el código aquí"
            placeholderTextColor="#999"
            keyboardType="default"
            autoFocus
          />
          <TouchableOpacity 
            style={styles.submitBtn} 
            onPress={handleManualSubmit}
          >
            <Icon name="check" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  topOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  middleRow: {
    flexDirection: 'row',
    height: 250,
  },
  sideOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  scanFrame: {
    width: 250,
    height: 250,
  },
  bottomOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  instructionText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 12,
    borderRadius: 8,
  },
  closeBtn: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 8,
    zIndex: 999,
  },
  manualBtn: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(43, 74, 139, 0.9)',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  manualBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  manualInputContainer: {
    position: 'absolute',
    bottom: 120,
    left: 20,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 999,
  },
  manualInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  submitBtn: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 12,
    marginLeft: 8,
  },
});

export default BarcodeScanner;
