import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  NativeModules,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { requestMicrophonePermission } from '../utils/permissions';

const { GoogleVoice } = NativeModules;

/**
 * Componente para entrada de voz usando Google Voice
 * 
 * @param {boolean} visible - Controla la visibilidad del modal
 * @param {function} onClose - Callback para cerrar el modal
 * @param {function} onResult - Callback con el texto reconocido
 * @param {string} fieldLabel - Etiqueta del campo (para mostrar al usuario)
 * @param {boolean} removeSpaces - Si es true, elimina espacios del texto reconocido (útil para códigos). Default: false
 * @param {boolean} uppercase - Si es true, convierte el texto a mayúsculas. Default: false
 */
const VoiceInput = ({ 
  visible, 
  onClose, 
  onResult, 
  fieldLabel = 'campo',
  removeSpaces = false,
  uppercase = false,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const [error, setError] = useState('');
  const [pulseAnim] = useState(new Animated.Value(1));

  // Ya no necesitamos listeners de eventos porque Google Voice
  // abre su propia UI y devuelve el resultado directamente

  useEffect(() => {
    if (visible) {
      // Auto-iniciar escucha cuando se abre el modal
      startListening();
    } else {
      // Limpiar estado cuando se cierra
      setRecognizedText('');
      setError('');
      setIsListening(false);
    }
  }, [visible]);

  useEffect(() => {
    if (isListening) {
      // Animación de pulso
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.3,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isListening, pulseAnim]);

  const startListening = async () => {
    try {
      setRecognizedText('');
      setError('');
      setIsListening(true);
      
      // Solicitar permisos de micrófono antes de iniciar
      console.log('🎤 Solicitando permisos de micrófono...');
      const hasPermission = await requestMicrophonePermission();
      
      if (!hasPermission) {
        setError('Permiso de micrófono denegado');
        console.error('❌ Permiso de micrófono denegado por el usuario');
        setIsListening(false);
        return;
      }
      
      console.log('🎤 Iniciando dictado de Google...');
      
      // Usar Google Voice - abre la UI nativa de Google
      const result = await GoogleVoice.startVoiceRecognition('es-ES');
      
      // Procesar el texto según las opciones configuradas
      // Opciones disponibles del módulo nativo:
      // - result.raw: "uno dos tres" (original, minúsculas, con espacios)
      // - result.rawUpper: "UNO DOS TRES" (mayúsculas, con espacios)  
      // - result.text: "UNODOSTRES" (mayúsculas, sin espacios)
      
      let finalText = result.raw; // Por defecto usar el texto original (con espacios)
      
      if (removeSpaces) {
        // Para códigos: sin espacios, mayúsculas
        finalText = result.text;
      } else if (uppercase) {
        // Para nombres en mayúsculas: con espacios, mayúsculas
        finalText = result.rawUpper;
      }
      
      console.log('✅ Texto reconocido:', finalText);
      console.log('   - Original:', result.raw);
      console.log('   - Con espacios en mayúsculas:', result.rawUpper);
      console.log('   - Sin espacios:', result.text);
      console.log('   - removeSpaces:', removeSpaces);
      console.log('   - uppercase:', uppercase);
      
      setRecognizedText(finalText);
      setIsListening(false);
      
    } catch (err) {
      // Si el usuario canceló, no mostrar error
      if (err.code === 'CANCELLED') {
        console.log('ℹ️ Usuario canceló el dictado');
        setIsListening(false);
        return;
      }
      
      // Solo loguear error si NO es cancelación
      console.error('❌ Error iniciando reconocimiento de voz:', err);
      
      const errorMessage = err.message || 'Error al iniciar el micrófono';
      setError(errorMessage);
      setIsListening(false);
    }
  };

  const handleConfirm = () => {
    if (recognizedText) {
      onResult(recognizedText);
      onClose();
    }
  };

  const handleCancel = () => {
    onClose();
  };

  const handleRetry = () => {
    console.log('🔄 Reintentando reconocimiento...');
    setRecognizedText('');
    setError('');
    startListening();
  };

  // Ya no necesitamos handleStop porque Google Voice maneja su propia UI

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Botón cerrar */}
          <TouchableOpacity style={styles.closeBtn} onPress={handleCancel}>
            <Icon name="close" size={24} color="#2b4a8b" />
          </TouchableOpacity>

          {/* Título */}
          <Text style={styles.title}>Entrada por Voz</Text>
          <Text style={styles.subtitle}>
            Habla el valor para: <Text style={styles.fieldName}>{fieldLabel}</Text>
          </Text>

          {/* Ícono del micrófono con animación */}
          <View style={styles.micContainer}>
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <View style={[
                styles.micCircle,
                isListening && styles.micCircleActive,
                error && styles.micCircleError,
              ]}>
                <Icon 
                  name="mic" 
                  size={60} 
                  color={error ? '#f44336' : isListening ? '#4CAF50' : '#2b4a8b'} 
                />
              </View>
            </Animated.View>
          </View>

          {/* Estado */}
          {isListening && (
            <View style={styles.statusContainer}>
              <ActivityIndicator size="small" color="#4CAF50" />
              <Text style={styles.listeningText}>Escuchando...</Text>
            </View>
          )}

          {error && (
            <View style={styles.errorContainer}>
              <Icon name="error-outline" size={20} color="#f44336" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Texto reconocido */}
          {recognizedText && (
            <View style={styles.resultContainer}>
              <Text style={styles.resultLabel}>
                {isListening ? 'Reconociendo...' : 'Texto reconocido:'}
              </Text>
              <Text style={styles.resultText}>{recognizedText}</Text>
            </View>
          )}

          {/* Botones de acción */}
          <View style={styles.buttonsContainer}>
            {recognizedText && !isListening ? (
              <>
                <TouchableOpacity 
                  style={[styles.button, styles.retryButton]} 
                  onPress={handleRetry}
                >
                  <Icon name="refresh" size={20} color="#fff" />
                  <Text style={styles.buttonText}>Reintentar</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.button, styles.confirmButton]} 
                  onPress={handleConfirm}
                >
                  <Icon name="check" size={20} color="#fff" />
                  <Text style={styles.buttonText}>Confirmar</Text>
                </TouchableOpacity>
              </>
            ) : error ? (
              <TouchableOpacity 
                style={[styles.button, styles.retryButton, styles.fullWidth]} 
                onPress={handleRetry}
              >
                <Icon name="refresh" size={20} color="#fff" />
                <Text style={styles.buttonText}>Intentar de nuevo</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Ayuda */}
          <Text style={styles.helpText}>
            {isListening 
              ? 'Se abrirá el dictado de Google. Habla con claridad' 
              : recognizedText 
                ? 'Confirma o reintenta si no es correcto'
                : error
                  ? 'Intenta de nuevo cuando estés listo'
                  : 'Presiona el micrófono para comenzar'}
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '85%',
    maxWidth: 400,
    alignItems: 'center',
  },
  closeBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: 8,
    zIndex: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  fieldName: {
    fontWeight: '600',
    color: '#2b4a8b',
  },
  micContainer: {
    marginVertical: 20,
  },
  micCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#2b4a8b',
  },
  micCircleActive: {
    backgroundColor: '#e8f5e9',
    borderColor: '#4CAF50',
  },
  micCircleError: {
    backgroundColor: '#ffebee',
    borderColor: '#f44336',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  listeningText: {
    fontSize: 16,
    color: '#4CAF50',
    marginLeft: 8,
    fontWeight: '600',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffebee',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  errorText: {
    fontSize: 14,
    color: '#f44336',
    marginLeft: 8,
    flex: 1,
  },
  resultContainer: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    width: '100%',
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  resultLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  resultText: {
    fontSize: 18,
    color: '#000',
    fontWeight: '600',
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
    width: '100%',
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
  },
  fullWidth: {
    flex: 1,
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
  },
  retryButton: {
    backgroundColor: '#2b4a8b',
  },
  stopButton: {
    backgroundColor: '#f44336',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  helpText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 16,
    fontStyle: 'italic',
  },
});

export default VoiceInput;
