import React, { useState } from 'react';
import { NativeModules, Alert } from 'react-native';

const { GoogleVoice } = NativeModules;

/**
 * Hook para usar el Dictado de Google
 * Mucho más simple y efectivo que el módulo custom
 */
export const useGoogleVoice = () => {
  const [isRecording, setIsRecording] = useState(false);

  const startVoiceRecognition = async (locale = 'es-ES') => {
    try {
      setIsRecording(true);
      
      // Abre el dictado nativo de Google
      const result = await GoogleVoice.startVoiceRecognition(locale);
      
      setIsRecording(false);
      return result.text; // Texto sin espacios en mayúsculas
      
    } catch (error) {
      setIsRecording(false);
      
      if (error.code === 'CANCELLED') {
        // Usuario canceló, no mostrar error
        return null;
      }
      
      Alert.alert('Error', error.message || 'No se pudo reconocer la voz');
      return null;
    }
  };

  return {
    isRecording,
    startVoiceRecognition,
  };
};

// Ejemplo de uso en un componente:
/*
const MyComponent = () => {
  const { isRecording, startVoiceRecognition } = useGoogleVoice();
  const [codigo, setCodigo] = useState('');

  const handleVoiceInput = async () => {
    const text = await startVoiceRecognition('es-ES');
    if (text) {
      setCodigo(text); // "1234ABC" sin espacios
    }
  };

  return (
    <TouchableOpacity onPress={handleVoiceInput}>
      <Icon name="mic" />
    </TouchableOpacity>
  );
};
*/
