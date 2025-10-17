import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';

const ValidationModal = ({ visible, onClose, validationData }) => {
  const {
    conexion,
    coordenadas,
    ubicacion,
    senalGPS,
    senalCelular,
    conectado,
    desconectado,
    sinEvento,
    sincronizado,
  } = validationData || {};

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Título de Conexión */}
          <View style={styles.row}>
            <Text style={styles.label}>Conexión:</Text>
            <Text style={styles.value}>{conexion || 'N/A'}</Text>
          </View>

          {/* Coordenadas */}
          <View style={styles.row}>
            <Text style={styles.label}>Coordenadas:</Text>
            <Text style={styles.value}>{coordenadas || 'N/A'}</Text>
          </View>

          {/* Ubicación */}
          <View style={styles.row}>
            <Text style={styles.label}>Ubicación:</Text>
            <Text style={styles.value}>{ubicacion || 'No Sincronizado'}</Text>
          </View>

          {/* Señal GPS */}
          <View style={styles.row}>
            <Text style={styles.label}>Señal GPS:</Text>
            <Text style={styles.value}>{senalGPS || '0'}</Text>
          </View>

          {/* Señal Celular */}
          <View style={styles.row}>
            <Text style={styles.label}>Señal Celular:</Text>
            <Text style={styles.value}>{senalCelular || '0.0'}</Text>
          </View>

          {/* Últimas Alertas */}
          <Text style={styles.sectionTitle}>Últimas Alertas</Text>

          {/* Conectado */}
          {conectado && (
            <View style={styles.row}>
              <Text style={styles.label}>Conectado:</Text>
              <Text style={styles.value}>{conectado}</Text>
            </View>
          )}

          {/* Desconectado */}
          <View style={styles.row}>
            <Text style={styles.label}>Desconectado:</Text>
            <Text style={styles.value}>{desconectado || 'N/A'}</Text>
          </View>

          {/* Sin Evento */}
          {sinEvento !== undefined && (
            <View style={styles.row}>
              <Text style={styles.label}>Sin Evento:</Text>
              <Text style={styles.value}>{sinEvento ? 'Sí' : 'No'}</Text>
            </View>
          )}

          {/* Botón de Estado */}
          <TouchableOpacity
            style={[
              styles.statusButton,
              sincronizado ? styles.statusButtonSync : styles.statusButtonNoSync,
            ]}
            onPress={onClose}
          >
            <Text style={styles.statusButtonText}>
              {sincronizado ? 'SINCRONIZADO' : 'NO SINCRONIZADO'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
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
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  value: {
    fontSize: 14,
    color: '#333',
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
    padding: 12,
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
