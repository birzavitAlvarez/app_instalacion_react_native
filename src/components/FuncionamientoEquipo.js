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

const FuncionamientoEquipo = ({
  formData,
  onChangeField,
  onTakePhoto,
  onDeletePhoto,
  onBack,
}) => {
  const lugaresInstalacion = [
    'PDV Nevera operativa',
    'PDV Nevera sin uso',
    'Patio Distribuidor',
    'Patio FrioHielos'
  ];

  return (
    <View style={styles.container}>
      

      {/* Sección de Inspección Previa */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>INSPECCION PREVIA DE NEVERA</Text>

        {/* Checkboxes */}
        <View style={styles.checkboxContainer}>
          <Text style={styles.checkboxLabel}>Nevera energizada</Text>
          <TouchableOpacity
            style={[styles.checkbox, formData.neveraEnergizadaPrev && styles.checkboxChecked]}
            onPress={() => onChangeField('neveraEnergizadaPrev', !formData.neveraEnergizadaPrev)}
          >
            {formData.neveraEnergizadaPrev && <Icon name="check" size={18} color="#fff" />}
          </TouchableOpacity>
        </View>

        <View style={styles.checkboxContainer}>
          <Text style={styles.checkboxLabel}>Compresor enciende</Text>
          <TouchableOpacity
            style={[styles.checkbox, formData.compresorEnciendePrev && styles.checkboxChecked]}
            onPress={() => onChangeField('compresorEnciendePrev', !formData.compresorEnciendePrev)}
          >
            {formData.compresorEnciendePrev && <Icon name="check" size={18} color="#fff" />}
          </TouchableOpacity>
        </View>

        <View style={styles.checkboxContainer}>
          <Text style={styles.checkboxLabel}>Termostato operativo</Text>
          <TouchableOpacity
            style={[styles.checkbox, formData.termostatoOperativoPrev && styles.checkboxChecked]}
            onPress={() => onChangeField('termostatoOperativoPrev', !formData.termostatoOperativoPrev)}
          >
            {formData.termostatoOperativoPrev && <Icon name="check" size={18} color="#fff" />}
          </TouchableOpacity>
        </View>

        <View style={styles.checkboxContainer}>
          <Text style={styles.checkboxLabel}>Estado de cableado eléctrico en buenas condiciones</Text>
          <TouchableOpacity
            style={[styles.checkbox, formData.cableadoBuenasCondPrev && styles.checkboxChecked]}
            onPress={() => onChangeField('cableadoBuenasCondPrev', !formData.cableadoBuenasCondPrev)}
          >
            {formData.cableadoBuenasCondPrev && <Icon name="check" size={18} color="#fff" />}
          </TouchableOpacity>
        </View>

        {/* Comentario */}
        <TextInput
          style={styles.input}
          placeholder="Comentario"
          value={formData.comentario}
          onChangeText={(value) => onChangeField('comentario', value)}
          maxLength={100}
          multiline
        />

        {/* Foto */}
        <TouchableOpacity
          style={styles.photoContainer}
          onPress={() => onTakePhoto('inspeccionPrevia')}
        >
          {formData.fotoInspeccionPrevia ? (
            <Image source={{ uri: formData.fotoInspeccionPrevia }} style={styles.photo} />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Icon name="camera-alt" size={40} color="#999" />
            </View>
          )}
        </TouchableOpacity>

        {formData.fotoInspeccionPrevia && (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => onDeletePhoto('fotoInspeccionPrevia')}
          >
            <Icon name="delete" size={20} color="#e74c3c" />
            <Text style={styles.deleteText}>Eliminar foto</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Sección de Ubicación (OCULTA por ahora - visibility gone) */}
      {/* Se puede activar después si es necesario */}

      {/* Dispositivo en Caja Metálica Abierta */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Icon name="help-outline" size={20} color="#2b4a8b" style={styles.helpIcon} />
          <Text style={styles.cardTitle}>DISPOSITIVO INSTALADO EN LA CAJA METÁLICA ABIERTA</Text>
        </View>

        <TouchableOpacity
          style={styles.photoContainer}
          onPress={() => onTakePhoto('cajaMetalicaAbierta')}
        >
          {formData.fotoCajaMetalicaAbierta ? (
            <Image source={{ uri: formData.fotoCajaMetalicaAbierta }} style={styles.photo} />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Icon name="camera-alt" size={40} color="#999" />
            </View>
          )}
        </TouchableOpacity>

        {formData.fotoCajaMetalicaAbierta && (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => onDeletePhoto('fotoCajaMetalicaAbierta')}
          >
            <Icon name="delete" size={20} color="#e74c3c" />
            <Text style={styles.deleteText}>Eliminar foto</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Empalme de Cable */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Icon name="help-outline" size={20} color="#2b4a8b" style={styles.helpIcon} />
          <Text style={styles.cardTitle}>EMPALME DE CABLE</Text>
        </View>

        <TouchableOpacity
          style={styles.photoContainer}
          onPress={() => onTakePhoto('empalmeCable')}
        >
          {formData.fotoEmpalmeCable ? (
            <Image source={{ uri: formData.fotoEmpalmeCable }} style={styles.photo} />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Icon name="camera-alt" size={40} color="#999" />
            </View>
          )}
        </TouchableOpacity>

        {formData.fotoEmpalmeCable && (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => onDeletePhoto('fotoEmpalmeCable')}
          >
            <Icon name="delete" size={20} color="#e74c3c" />
            <Text style={styles.deleteText}>Eliminar foto</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Caja Metálica Cerrada */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Icon name="help-outline" size={20} color="#2b4a8b" style={styles.helpIcon} />
          <Text style={styles.cardTitle}>
            DISPOSITIVO INSTALADO EN LA CAJA METÁLICA CERRADA Y TORNILLOS PUESTOS
          </Text>
        </View>

        <TouchableOpacity
          style={styles.photoContainer}
          onPress={() => onTakePhoto('cajaMetalicaCerrada')}
        >
          {formData.fotoCajaMetalicaCerrada ? (
            <Image source={{ uri: formData.fotoCajaMetalicaCerrada }} style={styles.photo} />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Icon name="camera-alt" size={40} color="#999" />
            </View>
          )}
        </TouchableOpacity>

        {formData.fotoCajaMetalicaCerrada && (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => onDeletePhoto('fotoCajaMetalicaCerrada')}
          >
            <Icon name="delete" size={20} color="#e74c3c" />
            <Text style={styles.deleteText}>Eliminar foto</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Fachada con Nevera */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Icon name="help-outline" size={20} color="#2b4a8b" style={styles.helpIcon} />
          <Text style={styles.cardTitle}>FACHADA CON NEVERA</Text>
        </View>

        <TouchableOpacity
          style={styles.photoContainer}
          onPress={() => onTakePhoto('fachadaNevera')}
        >
          {formData.fotoFachadaNevera ? (
            <Image source={{ uri: formData.fotoFachadaNevera }} style={styles.photo} />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Icon name="camera-alt" size={40} color="#999" />
            </View>
          )}
        </TouchableOpacity>

        {formData.fotoFachadaNevera && (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => onDeletePhoto('fotoFachadaNevera')}
          >
            <Icon name="delete" size={20} color="#e74c3c" />
            <Text style={styles.deleteText}>Eliminar foto</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Reinspección Posterior */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>REINSPECCIÓN DE NEVERA POSTERIOR INSTALACIÓN</Text>

        <View style={styles.checkboxContainer}>
          <Text style={styles.checkboxLabel}>Nevera energizada</Text>
          <TouchableOpacity
            style={[styles.checkbox, formData.neveraEnergizadaPost && styles.checkboxChecked]}
            onPress={() => onChangeField('neveraEnergizadaPost', !formData.neveraEnergizadaPost)}
          >
            {formData.neveraEnergizadaPost && <Icon name="check" size={18} color="#fff" />}
          </TouchableOpacity>
        </View>

        <View style={styles.checkboxContainer}>
          <Text style={styles.checkboxLabel}>Compresor enciende</Text>
          <TouchableOpacity
            style={[styles.checkbox, formData.compresorPost && styles.checkboxChecked]}
            onPress={() => onChangeField('compresorPost', !formData.compresorPost)}
          >
            {formData.compresorPost && <Icon name="check" size={18} color="#fff" />}
          </TouchableOpacity>
        </View>

        <View style={styles.checkboxContainer}>
          <Text style={styles.checkboxLabel}>Termostato operativo</Text>
          <TouchableOpacity
            style={[styles.checkbox, formData.termostatoPost && styles.checkboxChecked]}
            onPress={() => onChangeField('termostatoPost', !formData.termostatoPost)}
          >
            {formData.termostatoPost && <Icon name="check" size={18} color="#fff" />}
          </TouchableOpacity>
        </View>

        <View style={styles.checkboxContainer}>
          <Text style={styles.checkboxLabel}>Estado de cableado eléctrico en buenas condiciones</Text>
          <TouchableOpacity
            style={[styles.checkbox, formData.cableadoElectricoPost && styles.checkboxChecked]}
            onPress={() => onChangeField('cableadoElectricoPost', !formData.cableadoElectricoPost)}
          >
            {formData.cableadoElectricoPost && <Icon name="check" size={18} color="#fff" />}
          </TouchableOpacity>
        </View>

        <View style={styles.checkboxContainer}>
          <Icon name="grid-on" size={20} color="#2b4a8b" style={styles.checkboxIcon} />
          <Text style={[styles.checkboxLabel, styles.checkboxLabelWithIcon]}>CIERRE DE REJILLA</Text>
          <TouchableOpacity
            style={[styles.checkbox, formData.cierreRejilla && styles.checkboxChecked]}
            onPress={() => onChangeField('cierreRejilla', !formData.cierreRejilla)}
          >
            {formData.cierreRejilla && <Icon name="check" size={18} color="#fff" />}
          </TouchableOpacity>
        </View>
      </View>

      {/* Sección de Lugar de Instalación */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>LUGAR DE INSTALACIÓN</Text>
        
        {lugaresInstalacion.map((lugar, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.optionButton,
              formData.lugarInstalacion === lugar && styles.optionButtonSelected
            ]}
            onPress={() => onChangeField('lugarInstalacion', lugar)}
          >
            <View style={[
              styles.radioButton,
              formData.lugarInstalacion === lugar && styles.radioButtonSelected
            ]}>
              {formData.lugarInstalacion === lugar && (
                <View style={styles.radioButtonInner} />
              )}
            </View>
            <Text style={[
              styles.optionText,
              formData.lugarInstalacion === lugar && styles.optionTextSelected
            ]}>
              {lugar}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  card: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 16,
    marginBottom: 15,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  helpIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    flex: 1,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  checkboxLabelWithIcon: {
    marginLeft: 8,
  },
  checkboxIcon: {
    marginRight: 4,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#3F51B5',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  checkboxChecked: {
    backgroundColor: '#3F51B5',
  },
  input: {
    borderWidth: 1,
    borderColor: '#3F51B5',
    borderRadius: 8,
    padding: 10,
    marginTop: 8,
    fontSize: 14,
    color: '#000',
    minHeight: 60,
    textAlignVertical: 'top',
  },
  photoContainer: {
    marginTop: 10,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 8,
    borderStyle: 'dashed',
    overflow: 'hidden',
    width: '100%',
    aspectRatio: 4 / 3,
    backgroundColor: '#F5F5F5',
  },
  photoPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  photo: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
    backgroundColor: '#fff',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  deleteText: {
    fontSize: 11,
    color: '#e74c3c',
    marginLeft: 4,
  },
  // Estilos para Lugar de Instalación
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  optionButtonSelected: {
    borderColor: '#2b4a8b',
    backgroundColor: '#e8eef9',
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#3F51B5',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginRight: 12,
  },
  radioButtonSelected: {
    borderColor: '#2b4a8b',
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#2b4a8b',
  },
  optionText: {
    fontSize: 15,
    color: '#333',
    flex: 1,
  },
  optionTextSelected: {
    color: '#2b4a8b',
    fontWeight: '600',
  },
});

export default FuncionamientoEquipo;
