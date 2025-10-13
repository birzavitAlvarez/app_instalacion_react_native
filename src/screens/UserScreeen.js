import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import SignatureInput from '../components/SignatureInput';

export default function UserScreen() {
  const [nombres, setNombres] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [dni, setDni] = useState('');
  const [celular, setCelular] = useState('');
  const [errors, setErrors] = useState({});

  const signatureRef = useRef();

  // Validaciones
  const validateNombres = (value) => {
    if (!value.trim()) return 'El nombre es requerido';
    if (value.trim().length < 2) return 'El nombre debe tener al menos 2 caracteres';
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) return 'El nombre solo debe contener letras';
    return '';
  };

  const validateApellidos = (value) => {
    if (!value.trim()) return 'El apellido es requerido';
    if (value.trim().length < 2) return 'El apellido debe tener al menos 2 caracteres';
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) return 'El apellido solo debe contener letras';
    return '';
  };

  const validateDni = (value) => {
    if (!value.trim()) return 'El DNI es requerido';
    if (!/^\d+$/.test(value)) return 'El DNI solo debe contener números';
    if (value.length < 7 || value.length > 8) return 'El DNI debe tener entre 7 y 8 dígitos';
    return '';
  };

  const validateCelular = (value) => {
    if (!value.trim()) return 'El celular es requerido';
    if (!/^\d+$/.test(value)) return 'El celular solo debe contener números';
    if (value.length < 9 || value.length > 10) return 'El celular debe tener entre 9 y 10 dígitos';
    return '';
  };

  // Manejadores
  const handleNombresChange = (value) => {
    setNombres(value);
    setErrors(prev => ({ ...prev, nombres: validateNombres(value) }));
  };

  const handleApellidosChange = (value) => {
    setApellidos(value);
    setErrors(prev => ({ ...prev, apellidos: validateApellidos(value) }));
  };

  const handleDniChange = (value) => {
    setDni(value);
    setErrors(prev => ({ ...prev, dni: validateDni(value) }));
  };

  const handleCelularChange = (value) => {
    setCelular(value);
    setErrors(prev => ({ ...prev, celular: validateCelular(value) }));
  };

  const handleSignatureChange = (signature) => {
    setErrors(prev => ({ ...prev, signature: signature ? '' : 'La firma es requerida' }));
  };

  // Validar todo
  const validateAllFields = () => {
    const newErrors = {
      nombres: validateNombres(nombres),
      apellidos: validateApellidos(apellidos),
      dni: validateDni(dni),
      celular: validateCelular(celular),
      signature: signatureRef.current?.hasSignature() ? '' : 'La firma es requerida',
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== '');
  };

  // Guardar
  const handleSave = () => {
    if (validateAllFields()) {
      const signature = signatureRef.current?.getSignature();
      
      Alert.alert('Éxito', 'Datos guardados correctamente', [
        {
          text: 'OK',
          onPress: () => {
            console.log('Datos guardados:', {
              nombres,
              apellidos,
              dni,
              celular,
              signature: signature ? `Firma ${signature.source}` : 'Sin firma',
            });
          },
        },
      ]);
    } else {
      Alert.alert('Error', 'Por favor corrija los errores antes de guardar');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>MI PERFIL</Text>
        <Text style={styles.subtitle}>Complete sus datos personales</Text>

        {/* Nombres */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Nombres</Text>
          <TextInput
            style={[styles.input, errors.nombres && styles.inputError]}
            value={nombres}
            onChangeText={handleNombresChange}
            placeholder="Ingrese sus nombres"
            placeholderTextColor="#999"
          />
          {errors.nombres ? <Text style={styles.errorText}>{errors.nombres}</Text> : null}
        </View>

        {/* Apellidos */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Apellidos</Text>
          <TextInput
            style={[styles.input, errors.apellidos && styles.inputError]}
            value={apellidos}
            onChangeText={handleApellidosChange}
            placeholder="Ingrese sus apellidos"
            placeholderTextColor="#999"
          />
          {errors.apellidos ? <Text style={styles.errorText}>{errors.apellidos}</Text> : null}
        </View>

        {/* DNI */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>DNI</Text>
          <TextInput
            style={[styles.input, errors.dni && styles.inputError]}
            value={dni}
            onChangeText={handleDniChange}
            placeholder="Ingrese su DNI"
            placeholderTextColor="#999"
            keyboardType="numeric"
            maxLength={8}
          />
          {errors.dni ? <Text style={styles.errorText}>{errors.dni}</Text> : null}
        </View>

        {/* Celular */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Celular</Text>
          <TextInput
            style={[styles.input, errors.celular && styles.inputError]}
            value={celular}
            onChangeText={handleCelularChange}
            placeholder="Ingrese su celular"
            placeholderTextColor="#999"
            keyboardType="phone-pad"
            maxLength={10}
          />
          {errors.celular ? <Text style={styles.errorText}>{errors.celular}</Text> : null}
        </View>

        {/* Firma */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Firma del técnico</Text>
          <SignatureInput
            ref={signatureRef}
            error={errors.signature}
            onSignatureChange={handleSignatureChange}
          />
          {errors.signature ? <Text style={styles.errorText}>{errors.signature}</Text> : null}
        </View>

        {/* Botón Guardar */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSave} activeOpacity={0.8}>
          <Text style={styles.saveButtonText}>GUARDAR</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#000',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    color: '#666',
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  inputError: {
    borderColor: '#ff4444',
  },
  errorText: {
    color: '#ff4444',
    fontSize: 12,
    marginTop: 4,
  },
  saveButton: {
    backgroundColor: '#1a1a7e',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});