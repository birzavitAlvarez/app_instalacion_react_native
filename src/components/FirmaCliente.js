import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import SignatureInput from './SignatureInput';

const FirmaCliente = ({
  formData,
  onChangeField,
  onVoiceInput,
  onSignatureChange,
}) => {
  return (
    <View style={styles.container}>
      {/* Firma del cliente */}
      <Text style={styles.label}>Firma del cliente</Text>
      <SignatureInput
        onSignatureChange={onSignatureChange}
        error={null}
      />

      {/* Nombres y Apellidos */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Nombres y Apellidos"
          value={formData.nombresApellidos}
          onChangeText={(value) => onChangeField('nombresApellidos', value)}
          maxLength={200}
        />
        <TouchableOpacity
          style={styles.inputIcon}
          onPress={() => onVoiceInput('nombresApellidos')}
        >
          <Icon name="mic" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      {/* DNI */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="DNI"
          value={formData.dniCliente}
          onChangeText={(value) => onChangeField('dniCliente', value)}
          maxLength={8}
          keyboardType="numeric"
        />
        <TouchableOpacity
          style={styles.inputIcon}
          onPress={() => onVoiceInput('dniCliente')}
        >
          <Icon name="mic" size={24} color="#666" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    color: '#2b4a8b',
    marginBottom: 8,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
    padding: 12,
    marginTop: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  inputIcon: {
    padding: 4,
  },
});

export default FirmaCliente;
