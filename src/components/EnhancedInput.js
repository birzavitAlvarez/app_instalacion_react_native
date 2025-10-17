import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

/**
 * Componente de input mejorado con iconos opcionales
 * 
 * @param {string} value - Valor del input
 * @param {function} onChangeText - Callback cuando cambia el texto
 * @param {string} placeholder - Texto placeholder
 * @param {string} keyboardType - Tipo de teclado ('default', 'numeric', 'email-address', etc.)
 * @param {boolean} showBarcode - Mostrar icono de código de barras
 * @param {boolean} showMicrophone - Mostrar icono de micrófono
 * @param {function} onBarcodePress - Callback cuando se presiona el icono de código de barras
 * @param {function} onMicrophonePress - Callback cuando se presiona el icono de micrófono
 * @param {boolean} editable - Si el input es editable (default: true)
 * @param {boolean} multiline - Si es multilinea (default: false)
 * @param {number} numberOfLines - Número de líneas para multiline
 * @param {object} style - Estilos adicionales para el contenedor
 * @param {object} inputStyle - Estilos adicionales para el TextInput
 * @param {string} iconColor - Color de los iconos (default: '#2b4a8b')
 * @param {number} iconSize - Tamaño de los iconos (default: 24)
 */
const EnhancedInput = ({
  value,
  onChangeText,
  placeholder = '',
  keyboardType = 'default',
  showBarcode = false,
  showMicrophone = false,
  onBarcodePress,
  onMicrophonePress,
  editable = true,
  multiline = false,
  numberOfLines = 1,
  style,
  inputStyle,
  iconColor = '#2b4a8b',
  iconSize = 24,
}) => {
  return (
    <View style={[styles.container, style]}>
      <TextInput
        style={[
          styles.input,
          multiline && styles.multilineInput,
          !editable && styles.disabledInput,
          inputStyle,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#888"
        keyboardType={keyboardType}
        editable={editable}
        multiline={multiline}
        numberOfLines={multiline ? numberOfLines : 1}
        textAlignVertical={multiline ? 'top' : 'center'}
      />
      
      {/* Contenedor de iconos */}
      <View style={styles.iconsContainer}>
        {/* Icono de código de barras */}
        {showBarcode && (
          <TouchableOpacity
            style={styles.iconButton}
            onPress={onBarcodePress}
            disabled={!onBarcodePress}
          >
            <Icon name="qr-code-scanner" size={iconSize} color={iconColor} />
          </TouchableOpacity>
        )}
        
        {/* Icono de micrófono */}
        {showMicrophone && (
          <TouchableOpacity
            style={styles.iconButton}
            onPress={onMicrophonePress}
            disabled={!onMicrophonePress}
          >
            <Icon name="mic" size={iconSize} color={iconColor} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 8,
  },
  input: {
    flex: 1,
    padding: 12,
    fontSize: 14,
    color: '#000',
  },
  multilineInput: {
    minHeight: 100,
    paddingTop: 12,
  },
  disabledInput: {
    backgroundColor: '#f5f5f5',
    color: '#666',
  },
  iconsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default EnhancedInput;
