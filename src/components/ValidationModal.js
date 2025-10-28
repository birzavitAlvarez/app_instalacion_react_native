import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';

const ValidationModal = ({ visible, onClose, validationData }) => {
  if (!validationData) return null;

  const {
    conexion,
    coordenadas,
    ubicacion,
    senalGPS,
    senalCelular,
    ultimasAlertas = {},
    sincronizado,
  } = validationData;

  const { conectado, desconectado } = ultimasAlertas;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableWithoutFeedback>
          <View style={styles.modalContainer}>
          {/* Título de Conexión */}
          <View style={styles.row}>
            <Text style={styles.label}>Conexión:</Text>
            <Text style={styles.value}>{conexion || 'N/A'}</Text>
          </View>

          {/* Coordenadas */}
          <View style={styles.row}>
            <Text style={styles.label}>Coordenadas:</Text>
            <Text style={styles.valueSmall}>{coordenadas || 'N/A'}</Text>
          </View>

          {/* Ubicación */}
          <View style={styles.row}>
            <Text style={styles.label}>Ubicación:</Text>
            <Text style={styles.value}>{ubicacion || 'No Sincronizado'}</Text>
          </View>

          {/* Señal GPS */}
          <View style={styles.row}>
            <Text style={styles.label}>Señal GPS:</Text>
            <Text style={styles.value}>{senalGPS !== undefined ? senalGPS : '0'}</Text>
          </View>

          {/* Señal Celular */}
          <View style={styles.row}>
            <Text style={styles.label}>Señal Celular:</Text>
            <Text style={styles.value}>{senalCelular !== undefined ? senalCelular : '0.0'}</Text>
          </View>

          {/* Últimas Alertas */}
          <Text style={styles.sectionTitle}>Últimas Alertas</Text>

          {/* Conectado */}
          <View style={styles.row}>
            <Text style={styles.label}>Conectado:</Text>
            <Text style={styles.value}>{conectado || 'N/A'}</Text>
          </View>

          {/* Desconectado */}
          <View style={styles.row}>
            <Text style={styles.label}>Desconectado:</Text>
            <Text style={styles.value}>{desconectado || 'N/A'}</Text>
          </View>

          {/* Botón de Estado */}
          <TouchableOpacity
            style={[
              styles.statusButton,
              sincronizado ? styles.statusButtonSync : styles.statusButtonNoSync,
            ]}
            onPress={sincronizado ? onClose : undefined}
            disabled={!sincronizado}
            activeOpacity={sincronizado ? 0.7 : 1}
          >
            <Text style={styles.statusButtonText}>
              {sincronizado ? 'SINCRONIZADO' : 'NO SINCRONIZADO'}
            </Text>
          </TouchableOpacity>
          </View>
        </TouchableWithoutFeedback>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    flex: 1,
  },
  value: {
    fontSize: 14,
    color: '#333',
    flex: 1,
    textAlign: 'right',
  },
  valueSmall: {
    fontSize: 12,
    color: '#333',
    flex: 1,
    textAlign: 'right',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 12,
  },
  statusButton: {
    marginTop: 20,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  statusButtonSync: {
    backgroundColor: '#27ae60',
  },
  statusButtonNoSync: {
    backgroundColor: '#95a5a6',
  },
  statusButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default ValidationModal;
