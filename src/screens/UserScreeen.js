import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Alert,
    Modal,
    Dimensions,
} from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import SignaturePad from '../components/SignaturePad';

const { width } = Dimensions.get('window');

export default function UserScreen() {
  // Estados para los campos del formulario
  const [nombres, setNombres] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [dni, setDni] = useState('');
  const [celular, setCelular] = useState('');
  const [signature, setSignature] = useState(null);

  // Estados para validación
  const [errors, setErrors] = useState({});

  // Estados para modal de firma
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [showSignatureOptions, setShowSignatureOptions] = useState(false);
  const signatureRef = useRef();

  // Validaciones
  const validateNombres = (value) => {
    if (!value.trim()) {
      return 'El nombre es requerido';
    }
    if (value.trim().length < 2) {
      return 'El nombre debe tener al menos 2 caracteres';
    }
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) {
      return 'El nombre solo debe contener letras';
    }
    return '';
  };

  const validateApellidos = (value) => {
    if (!value.trim()) {
      return 'El apellido es requerido';
    }
    if (value.trim().length < 2) {
      return 'El apellido debe tener al menos 2 caracteres';
    }
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) {
      return 'El apellido solo debe contener letras';
    }
    return '';
  };

  const validateDni = (value) => {
    if (!value.trim()) {
      return 'El DNI es requerido';
    }
    if (!/^\d+$/.test(value)) {
      return 'El DNI solo debe contener números';
    }
    if (value.length < 7 || value.length > 8) {
      return 'El DNI debe tener entre 7 y 8 dígitos';
    }
    return '';
  };

  const validateCelular = (value) => {
    if (!value.trim()) {
      return 'El celular es requerido';
    }
    if (!/^\d+$/.test(value)) {
      return 'El celular solo debe contener números';
    }
    if (value.length < 9 || value.length > 10) {
      return 'El celular debe tener entre 9 y 10 dígitos';
    }
    return '';
  };

  const validateSignature = () => {
    if (!signature) {
      return 'La firma es requerida';
    }
    return '';
  };

  // Manejadores de cambio con validación en tiempo real
  const handleNombresChange = (value) => {
    setNombres(value);
    const error = validateNombres(value);
    setErrors(prev => ({ ...prev, nombres: error }));
  };

  const handleApellidosChange = (value) => {
    setApellidos(value);
    const error = validateApellidos(value);
    setErrors(prev => ({ ...prev, apellidos: error }));
  };

  const handleDniChange = (value) => {
    setDni(value);
    const error = validateDni(value);
    setErrors(prev => ({ ...prev, dni: error }));
  };

  const handleCelularChange = (value) => {
    setCelular(value);
    const error = validateCelular(value);
    setErrors(prev => ({ ...prev, celular: error }));
  };

  // Función para abrir opciones de firma
  const handleOpenSignatureOptions = () => {
    setShowSignatureOptions(true);
  };

  // Función para dibujar firma
  const handleDrawSignature = () => {
    setShowSignatureOptions(false);
    setShowSignatureModal(true);
  };

  // Función para tomar foto
  const handleTakePhoto = () => {
    setShowSignatureOptions(false);
    const options = {
      mediaType: 'photo',
      quality: 0.8,
      saveToPhotos: false,
    };

    launchCamera(options, (response) => {
      if (response.didCancel) {
        console.log('Usuario canceló la cámara');
      } else if (response.errorCode) {
        Alert.alert('Error', 'No se pudo acceder a la cámara');
      } else if (response.assets && response.assets[0]) {
        setSignature(response.assets[0].uri);
        setErrors(prev => ({ ...prev, signature: '' }));
      }
    });
  };

  // Función para seleccionar desde galería
  const handleSelectFromGallery = () => {
    setShowSignatureOptions(false);
    const options = {
      mediaType: 'photo',
      quality: 0.8,
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('Usuario canceló la selección');
      } else if (response.errorCode) {
        Alert.alert('Error', 'No se pudo acceder a la galería');
      } else if (response.assets && response.assets[0]) {
        setSignature(response.assets[0].uri);
        setErrors(prev => ({ ...prev, signature: '' }));
      }
    });
  };

  // Función para manejar la firma dibujada
  const handleSaveSignature = () => {
    if (signatureRef.current) {
      const hasSignature = signatureRef.current.hasSignature();
      if (hasSignature) {
        // Generamos un identificador único para la firma
        const signatureId = `signature_${Date.now()}`;
        const signatureData = signatureRef.current.getSignatureData();
        
        // Guardamos la firma como un objeto con los datos
        setSignature({
          id: signatureId,
          data: signatureData,
          timestamp: Date.now()
        });
        setShowSignatureModal(false);
        setErrors(prev => ({ ...prev, signature: '' }));
      } else {
        Alert.alert('Aviso', 'Por favor dibuje su firma');
      }
    }
  };

  // Función para limpiar firma en el canvas
  const handleClearSignature = () => {
    if (signatureRef.current) {
      signatureRef.current.clearSignature();
    }
  };

  // Función para limpiar imagen de firma
  const handleRemoveSignature = () => {
    Alert.alert(
      'Confirmar',
      '¿Está seguro que desea eliminar la firma?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            setSignature(null);
            setErrors(prev => ({ ...prev, signature: 'La firma es requerida' }));
          },
        },
      ]
    );
  };

  // Función para validar todos los campos
  const validateAllFields = () => {
    const newErrors = {
      nombres: validateNombres(nombres),
      apellidos: validateApellidos(apellidos),
      dni: validateDni(dni),
      celular: validateCelular(celular),
      signature: validateSignature(),
    };

    setErrors(newErrors);

    // Retorna true si no hay errores
    return !Object.values(newErrors).some(error => error !== '');
  };

  // Función para guardar
  const handleSave = () => {
    if (validateAllFields()) {
      Alert.alert(
        'Éxito',
        'Datos guardados correctamente',
        [
          {
            text: 'OK',
            onPress: () => {
              console.log('Datos guardados:', {
                nombres,
                apellidos,
                dni,
                celular,
                signature: signature ? 'Firma capturada' : 'Sin firma',
              });
            },
          },
        ]
      );
    } else {
      Alert.alert('Error', 'Por favor corrija los errores antes de guardar');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>MI PERFIL</Text>
        <Text style={styles.subtitle}>Complete sus datos personales</Text>

        {/* Campo Nombres */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Nombres</Text>
          <TextInput
            style={[styles.input, errors.nombres && styles.inputError]}
            value={nombres}
            onChangeText={handleNombresChange}
            placeholder="Ingrese sus nombres"
            placeholderTextColor="#999"
          />
          {errors.nombres ? (
            <Text style={styles.errorText}>{errors.nombres}</Text>
          ) : null}
        </View>

        {/* Campo Apellidos */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Apellidos</Text>
          <TextInput
            style={[styles.input, errors.apellidos && styles.inputError]}
            value={apellidos}
            onChangeText={handleApellidosChange}
            placeholder="Ingrese sus apellidos"
            placeholderTextColor="#999"
          />
          {errors.apellidos ? (
            <Text style={styles.errorText}>{errors.apellidos}</Text>
          ) : null}
        </View>

        {/* Campo DNI */}
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
          {errors.dni ? (
            <Text style={styles.errorText}>{errors.dni}</Text>
          ) : null}
        </View>

        {/* Campo Celular */}
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
          {errors.celular ? (
            <Text style={styles.errorText}>{errors.celular}</Text>
          ) : null}
        </View>

        {/* Campo Firma */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Firma del técnico</Text>
          <TouchableOpacity
            style={[
              styles.signatureContainer,
              errors.signature && styles.inputError
            ]}
            onPress={signature ? null : handleOpenSignatureOptions}
            activeOpacity={signature ? 1 : 0.7}
          >
            {signature ? (
              <View style={styles.signaturePreview}>
                {signature.data ? (
                  // Firma dibujada
                  <View style={styles.signatureDrawnPreview}>
                    <Text style={styles.signatureDrawnIcon}>✓</Text>
                    <Text style={styles.signatureDrawnText}>Firma capturada</Text>
                    <Text style={styles.signatureDrawnSubtext}>Firma dibujada exitosamente</Text>
                  </View>
                ) : (
                  // Firma por foto
                  <Image
                    source={{ uri: signature }}
                    style={styles.signatureImage}
                    resizeMode="contain"
                  />
                )}
              </View>
            ) : (
              <View style={styles.signaturePlaceholder}>
                <View style={styles.iconRow}>
                  <View style={styles.iconButton}>
                    <Text style={styles.iconText}>✏️</Text>
                  </View>
                  <View style={styles.iconButton}>
                    <Text style={styles.iconText}>📷</Text>
                  </View>
                </View>
                <Text style={styles.signaturePlaceholderText}>
                  Toca para agregar firma
                </Text>
              </View>
            )}
          </TouchableOpacity>
          {errors.signature ? (
            <Text style={styles.errorText}>{errors.signature}</Text>
          ) : null}
          
          {signature && (
            <TouchableOpacity
              style={styles.removeSignatureButton}
              onPress={handleRemoveSignature}
            >
              <Text style={styles.removeSignatureText}>Eliminar firma</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Botón Guardar */}
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          activeOpacity={0.8}
        >
          <Text style={styles.saveButtonText}>GUARDAR</Text>
        </TouchableOpacity>
      </View>

      {/* Modal de opciones de firma */}
      <Modal
        visible={showSignatureOptions}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSignatureOptions(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowSignatureOptions(false)}
        >
          <View style={styles.optionsModal}>
            <Text style={styles.optionsTitle}>Seleccione una opción</Text>
            
            <TouchableOpacity
              style={styles.optionButton}
              onPress={handleDrawSignature}
            >
              <Text style={styles.optionIcon}>✏️</Text>
              <Text style={styles.optionText}>Dibujar firma</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionButton}
              onPress={handleTakePhoto}
            >
              <Text style={styles.optionIcon}>📷</Text>
              <Text style={styles.optionText}>Tomar foto</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionButton}
              onPress={handleSelectFromGallery}
            >
              <Text style={styles.optionIcon}>🖼️</Text>
              <Text style={styles.optionText}>Seleccionar de galería</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.optionButton, styles.cancelButton]}
              onPress={() => setShowSignatureOptions(false)}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Modal para dibujar firma */}
      <Modal
        visible={showSignatureModal}
        animationType="slide"
        onRequestClose={() => setShowSignatureModal(false)}
      >
        <View style={styles.signatureModalContainer}>
          <View style={styles.signatureHeader}>
            <Text style={styles.signatureHeaderTitle}>Firma aquí</Text>
            <TouchableOpacity
              style={styles.clearButton}
              onPress={handleClearSignature}
            >
              <Text style={styles.clearButtonText}>Limpiar</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.signaturePadContainer}>
            <SignaturePad ref={signatureRef} />
          </View>

          <View style={styles.signatureFooter}>
            <TouchableOpacity
              style={[styles.signatureActionButton, styles.cancelSignatureButton]}
              onPress={() => setShowSignatureModal(false)}
            >
              <Text style={styles.cancelSignatureButtonText}>Cancelar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.signatureActionButton, styles.saveSignatureButton]}
              onPress={handleSaveSignature}
            >
              <Text style={styles.saveSignatureButtonText}>Guardar Firma</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  signaturePlaceholder: {
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
  signaturePlaceholderText: {
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
  signatureDrawnPreview: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signatureDrawnIcon: {
    fontSize: 60,
    color: '#4CAF50',
    marginBottom: 10,
  },
  signatureDrawnText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  signatureDrawnSubtext: {
    fontSize: 14,
    color: '#666',
  },
  removeSignatureButton: {
    marginTop: 8,
    alignSelf: 'center',
  },
  removeSignatureText: {
    color: '#ff4444',
    fontSize: 14,
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
  signatureModalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  signatureHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  signatureHeaderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  clearButton: {
    padding: 8,
  },
  clearButtonText: {
    color: '#1a1a7e',
    fontSize: 16,
  },
  signaturePadContainer: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signatureFooter: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    gap: 10,
  },
  signatureActionButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelSignatureButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cancelSignatureButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  saveSignatureButton: {
    backgroundColor: '#1a1a7e',
  },
  saveSignatureButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});