import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const Observaciones = ({
  formData,
  onChangeField,
  onTakePhoto,
  onDeletePhoto,
  onVoiceInput,
}) => {
  return (
    <View style={styles.container}>
      {/* Observación 1 */}
      <Text style={styles.label}>Observación 1</Text>
      <View style={styles.textAreaContainer}>
        <TextInput
          style={styles.textArea}
          placeholder="Escriba su observación aquí"
          value={formData.observacion1}
          onChangeText={(value) => onChangeField('observacion1', value)}
          multiline
          numberOfLines={7}
          maxLength={250}
          textAlignVertical="top"
        />
        <TouchableOpacity
          style={styles.micButton}
          onPress={() => onVoiceInput('observacion1')}
        >
          <Icon name="mic" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Foto Observación 1 */}
      <TouchableOpacity
        style={styles.photoContainer}
        onPress={() => onTakePhoto('fotoObservacion1')}
      >
        {formData.fotoObservacion1 ? (
          <Image source={{ uri: formData.fotoObservacion1 }} style={styles.photo} />
        ) : (
          <View style={styles.photoPlaceholder}>
            <Icon name="camera-alt" size={40} color="#999" />
          </View>
        )}
      </TouchableOpacity>

      {formData.fotoObservacion1 && (
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => onDeletePhoto('fotoObservacion1')}
        >
          <Icon name="delete" size={20} color="#e74c3c" />
          <Text style={styles.deleteText}>Eliminar foto Observación 1</Text>
        </TouchableOpacity>
      )}

      {/* Observación 2 */}
      <Text style={[styles.label, styles.labelMarginTop]}>Observación 2</Text>
      <View style={styles.textAreaContainer}>
        <TextInput
          style={styles.textArea}
          placeholder="Escriba su observación aquí"
          value={formData.observacion2}
          onChangeText={(value) => onChangeField('observacion2', value)}
          multiline
          numberOfLines={7}
          maxLength={250}
          textAlignVertical="top"
        />
        <TouchableOpacity
          style={styles.micButton}
          onPress={() => onVoiceInput('observacion2')}
        >
          <Icon name="mic" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Foto Observación 2 */}
      <TouchableOpacity
        style={styles.photoContainer}
        onPress={() => onTakePhoto('fotoObservacion2')}
      >
        {formData.fotoObservacion2 ? (
          <Image source={{ uri: formData.fotoObservacion2 }} style={styles.photo} />
        ) : (
          <View style={styles.photoPlaceholder}>
            <Icon name="camera-alt" size={40} color="#999" />
          </View>
        )}
      </TouchableOpacity>

      {formData.fotoObservacion2 && (
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => onDeletePhoto('fotoObservacion2')}
        >
          <Icon name="delete" size={20} color="#e74c3c" />
          <Text style={styles.deleteText}>Eliminar foto Observación 2</Text>
        </TouchableOpacity>
      )}
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
  labelMarginTop: {
    marginTop: 30,
  },
  textAreaContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
    padding: 12,
    position: 'relative',
    minHeight: 150,
  },
  textArea: {
    fontSize: 16,
    color: '#000',
    paddingRight: 40,
    minHeight: 120,
  },
  micButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    padding: 8,
  },
  photoContainer: {
    marginTop: 10,
    height: 150,
    borderWidth: 2,
    borderColor: '#00BCD4',
    borderStyle: 'dashed',
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  photoPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  photo: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  deleteText: {
    fontSize: 11,
    color: '#e74c3c',
    marginLeft: 8,
  },
});

export default Observaciones;
