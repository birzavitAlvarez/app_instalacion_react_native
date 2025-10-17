import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import EnhancedInput from './EnhancedInput';

const DatosGenerales = ({
  formData,
  onChangeField,
  onBarcodeScan,
  onVoiceInput,
  errors = {},
}) => {
  return (
    <View style={styles.container}>
      {/* Código de Nevera */}
      <View style={styles.section}>
        <Text style={styles.label}>Código de Nevera</Text>
        <EnhancedInput
          value={formData.codigoNevera}
          onChangeText={(value) => onChangeField('codigoNevera', value)}
          placeholder="Buscar por código"
          showBarcode={true}
          showMicrophone={true}
          onBarcodePress={() => onBarcodeScan('codigoNevera')}
          onMicrophonePress={() => onVoiceInput('Código de Nevera')}
          error={errors.codigoNevera}
        />
      </View>

      {/* Modelo */}
      <View style={styles.section}>
        <EnhancedInput
          value={formData.modelo}
          onChangeText={(value) => onChangeField('modelo', value)}
          placeholder="MODELO"
          error={errors.modelo}
        />
      </View>

      {/* Distribuidor */}
      <View style={styles.section}>
        <EnhancedInput
          value={formData.distribuidor}
          onChangeText={(value) => onChangeField('distribuidor', value)}
          placeholder="DISTRIBUIDOR"
          error={errors.distribuidor}
        />
      </View>

      {/* Cliente */}
      <View style={styles.section}>
        <EnhancedInput
          value={formData.cliente}
          onChangeText={(value) => onChangeField('cliente', value)}
          placeholder="CLIENTE"
          error={errors.cliente}
        />
      </View>

      {/* RUC/DNI */}
      <View style={styles.section}>
        <EnhancedInput
          value={formData.rucDni}
          onChangeText={(value) => onChangeField('rucDni', value)}
          placeholder="RUC/DNI"
          keyboardType="numeric"
          error={errors.rucDni}
        />
      </View>

      {/* Departamento */}
      <View style={styles.section}>
        <EnhancedInput
          value={formData.departamento}
          onChangeText={(value) => onChangeField('departamento', value)}
          placeholder="DEPARTAMENTO"
          error={errors.departamento}
        />
      </View>

      {/* Provincia */}
      <View style={styles.section}>
        <EnhancedInput
          value={formData.provincia}
          onChangeText={(value) => onChangeField('provincia', value)}
          placeholder="PROVINCIA"
          error={errors.provincia}
        />
      </View>

      {/* Distrito */}
      <View style={styles.section}>
        <EnhancedInput
          value={formData.distrito}
          onChangeText={(value) => onChangeField('distrito', value)}
          placeholder="DISTRITO"
          error={errors.distrito}
        />
      </View>

      {/* Dirección */}
      <View style={styles.section}>
        <EnhancedInput
          value={formData.direccion}
          onChangeText={(value) => onChangeField('direccion', value)}
          placeholder="DIRECCION"
          error={errors.direccion}
        />
      </View>

      {/* ICCID CHIP */}
      <View style={styles.section}>
        <EnhancedInput
          value={formData.iccidChip}
          onChangeText={(value) => onChangeField('iccidChip', value)}
          placeholder="ICCID CHIP"
          keyboardType="numeric"
          showBarcode={true}
          showMicrophone={true}
          onBarcodePress={() => onBarcodeScan('iccidChip')}
          onMicrophonePress={() => onVoiceInput('ICCID CHIP')}
          error={errors.iccidChip}
        />
      </View>

      {/* IMEI */}
      <View style={styles.section}>
        <EnhancedInput
          value={formData.imei}
          onChangeText={(value) => onChangeField('imei', value)}
          placeholder="BUSCAR POR IMEI"
          keyboardType="numeric"
          showBarcode={true}
          showMicrophone={true}
          onBarcodePress={() => onBarcodeScan('imei')}
          onMicrophonePress={() => onVoiceInput('IMEI')}
          error={errors.imei}
        />
      </View>

      {/* Otro */}
      <View style={styles.section}>
        <EnhancedInput
          value={formData.otro}
          onChangeText={(value) => onChangeField('otro', value)}
          placeholder="OTRO"
          error={errors.otro}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  section: {
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    color: '#2b4a8b',
    marginBottom: 8,
    fontWeight: '500',
  },
});

export default DatosGenerales;
