import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import SignatureInput from '../components/SignatureInput';
import { useAuth } from '../hooks/useAuth';
import { getUsuario, updateUsuario, uploadFirma } from '../services/userService';

export default function UserScreen() {
  const { idUsuario, userToken } = useAuth();
  
  const [nombres, setNombres] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [dni, setDni] = useState('');
  const [celular, setCelular] = useState('');
  const [email, setEmail] = useState('');
  const [firmaUrl, setFirmaUrl] = useState(null);
  const [firmaOriginal, setFirmaOriginal] = useState(null);
  const [firmaPathOriginal, setFirmaPathOriginal] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  const signatureRef = useRef();

  // Cargar datos del usuario al montar el componente
  useEffect(() => {
    const loadUserData = async () => {
      if (!idUsuario || !userToken) {
        setLoadingData(false);
        return;
      }

      try {
        setLoadingData(true);
        const userData = await getUsuario(idUsuario, userToken);
        
        // Llenar los campos con los datos obtenidos
        // Mapear los campos de la API a los del formulario
        setNombres(userData.nombre || '');  // API usa "nombre" (singular)
        setApellidos(userData.apellido || '');  // API usa "apellido" (singular)
        setDni(userData.dni || '');
        setCelular(userData.numero || '');  // API usa "numero" no "celular"
        setEmail(userData.email || '');  // Guardar el email
        
        // Guardar valores originales de firma
        setFirmaOriginal(userData.firma || null);
        setFirmaPathOriginal(userData.firmaPath || null);
        
        // Cargar URL de la firma si existe
        if (userData.firmaPath) {
          const fullFirmaUrl = `https://phuyu-iot.com/NESTLE-API-TECNICOS/public/${userData.firmaPath}`;
          setFirmaUrl(fullFirmaUrl);
        }
      } catch (error) {
        console.error('Error al cargar datos del usuario:', error);
        Alert.alert('Error', 'No se pudieron cargar los datos del usuario');
      } finally {
        setLoadingData(false);
      }
    };

    loadUserData();
  }, [idUsuario, userToken]);

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
  const handleSave = async () => {
    if (!validateAllFields()) {
      Alert.alert('Error', 'Por favor corrija los errores antes de guardar');
      return;
    }

    try {
      setLoading(true);

      // Obtener firma si hay una nueva capturada
      const signature = signatureRef.current?.getSignature();
      
      // Obtener el fileName del servidor si hay firma subida
      let firmaPathServer = firmaPathOriginal;
      
      if (signature && signature.uploaded && signature.serverResponse && signature.serverResponse.fileName) {
        firmaPathServer = signature.serverResponse.fileName;
      }
      
      // Preparar datos del usuario
      const usuarioData = {
        nombre: nombres,
        apellido: apellidos,
        dni: dni,
        email: email,
        numero: celular,
        firma: signature ? 'FIRMAOK' : (firmaOriginal || null),
        firmaPath: signature ? firmaPathServer : firmaPathOriginal,
      };

      // Actualizar datos del usuario
      await updateUsuario(idUsuario, usuarioData, userToken);

      Alert.alert('Éxito', 'Datos guardados correctamente');
    } catch (error) {
      console.error('Error al guardar datos:', error);
      Alert.alert(
        'Error', 
        'No se pudieron guardar los datos. Por favor intente nuevamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>MI PERFIL</Text>
        <Text style={styles.subtitle}>Complete sus datos personales</Text>

        {/* Mostrar indicador de carga mientras se obtienen los datos */}
        {loadingData ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1a1a7e" />
            <Text style={styles.loadingText}>Cargando datos...</Text>
          </View>
        ) : (
          <>
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
            existingSignatureUrl={firmaUrl}
            onUpload={uploadFirma}
            idUsuario={idUsuario}
            token={userToken}
          />
          {errors.signature ? <Text style={styles.errorText}>{errors.signature}</Text> : null}
        </View>

        {/* Botón Guardar */}
        <TouchableOpacity 
          style={[styles.saveButton, loading && styles.saveButtonDisabled]} 
          onPress={handleSave} 
          activeOpacity={0.8}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>GUARDAR</Text>
          )}
        </TouchableOpacity>
          </>
        )}
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
    padding: 24,
    paddingBottom: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 6,
    color: '#000',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 13,
    textAlign: 'center',
    color: '#666',
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 13,
    color: '#333',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 14,
    fontSize: 15,
    backgroundColor: '#fff',
    color: '#000',
  },
  inputError: {
    borderColor: '#ff4444',
  },
  errorText: {
    color: '#ff4444',
    fontSize: 12,
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  saveButton: {
    backgroundColor: '#1a1a7e',
    borderRadius: 8,
    padding: 18,
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 40,
    shadowColor: '#1a1a7e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonDisabled: {
    backgroundColor: '#9999cc',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});