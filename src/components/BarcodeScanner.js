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
    
    if (event.nativeEvent?.codeStringValue) {
      const code = event.nativeEvent.codeStringValue;
      console.log('✅ Código detectado:', code);
      
      if (!scanned) {
        setScanned(true);
        console.log('✅ Código escaneado exitosamente:', code);
        onCodeScanned(code);
        // Pequeño delay antes de cerrar para feedback visual
        setTimeout(() => {
          onClose();
        }, 500);
      }
    } else {
      console.log('⚠️ No se detectó código de barras en el evento');
    }
  };

  const handleManualSubmit = () => {
    if (manualInput.trim()) {
      console.log('✅ Código manual ingresado:', manualInput);
      onCodeScanned(manualInput.trim());
      onClose();
    }
  };

  const handleForceScan = () => {
    console.log('🔄 Forzando nuevo escaneo...');
    setScanned(false);
  };

  return (
    <View style={styles.container}>
      <Camera
        style={StyleSheet.absoluteFill}
        cameraType={CameraType.Back}
        scanBarcode={true}
        onReadCode={handleBarCodeRead}
        showFrame={true}
        laserColor="rgba(76, 175, 80, 0.8)"
        frameColor="rgba(76, 175, 80, 0.8)"
      />
      
      {/* Overlay con instrucciones */}
      <View style={styles.overlay}>
        <View style={styles.topOverlay}>
          <Text style={styles.instructionText}>
            Apunta la cámara al código de barras
          </Text>
          {scanned && (
            <Text style={styles.successText}>
              ✓ Código detectado
            </Text>
          )}
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

      {/* Botones de acción */}
      {!showManualInput && (
        <View style={styles.buttonsContainer}>
          {/* Botón ESCANEAR AHORA */}
          <TouchableOpacity 
            style={styles.scanBtn} 
            onPress={handleForceScan}
          >
            <Icon name="qr-code-scanner" size={28} color="#fff" />
            <Text style={styles.scanBtnText}>ESCANEAR AHORA</Text>
          </TouchableOpacity>

        </View>
      )}

      {/* Input manual */}
      {showManualInput && (
        <View style={styles.manualInputWrapper}>
          <TouchableOpacity 
            style={styles.backToScanBtn} 
            onPress={() => {
              setShowManualInput(false);
              setManualInput('');
            }}
          >
            <Icon name="arrow-back" size={24} color="#fff" />
            <Text style={styles.backBtnText}>Volver a escanear</Text>
          </TouchableOpacity>

          <View style={styles.manualInputContainer}>
            <Text style={styles.manualTitle}>Ingrese el código manualmente:</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.manualInput}
                value={manualInput}
                onChangeText={setManualInput}
                placeholder="Ej: 7750520000143"
                placeholderTextColor="#999"
                keyboardType="default"
                autoFocus
                onSubmitEditing={handleManualSubmit}
              />
              <TouchableOpacity 
                style={[
                  styles.submitBtn,
                  !manualInput.trim() && styles.submitBtnDisabled
                ]} 
                onPress={handleManualSubmit}
                disabled={!manualInput.trim()}
              >
                <Icon name="check" size={28} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
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
    fontSize: 18,
    textAlign: 'center',
    fontWeight: '600',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  successText: {
    color: '#4CAF50',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '600',
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  closeBtn: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 25,
    padding: 10,
    zIndex: 999,
  },
  buttonsContainer: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    zIndex: 999,
  },
  scanBtn: {
    backgroundColor: 'rgba(76, 175, 80, 0.95)',
    borderRadius: 12,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 7,
  },
  scanBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 12,
    letterSpacing: 1,
  },
  manualBtn: {
    backgroundColor: 'rgba(43, 74, 139, 0.9)',
    borderRadius: 8,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  manualBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
  },
  manualInputWrapper: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    zIndex: 1000,
    padding: 20,
    justifyContent: 'center',
  },
  backToScanBtn: {
    position: 'absolute',
    top: 40,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(43, 74, 139, 0.9)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    zIndex: 1001,
  },
  backBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  manualInputContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  manualTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 16,
    textAlign: 'center',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  manualInput: {
    flex: 1,
    fontSize: 18,
    color: '#000',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 2,
    borderColor: '#2b4a8b',
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  submitBtn: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 14,
    marginLeft: 12,
    minWidth: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnDisabled: {
    backgroundColor: '#ccc',
  },
});

export default BarcodeScanner;
