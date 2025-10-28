import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Toast from 'react-native-toast-message';
import { searchImeiByCode, getDataByImei } from '../services/neveraService';


const AutocompleteImei = ({ 
  value, 
  onChangeText, 
  onSelectImei,
  onBarcodeScan,
  onVoiceInput,
  onIccidUpdate,
  editable = true
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceTimer = useRef(null);
  const lastValidatedImei = useRef('');

  // Buscar sugerencias cuando el texto cambia
  useEffect(() => {
    const searchSuggestions = async () => {
      const trimmedValue = value.trim();
      
      // Solo buscar sugerencias si tiene entre 5 y 9 caracteres
      if (trimmedValue.length >= 5 && trimmedValue.length < 10) {
        setLoading(true);
        
        try {
          const results = await searchImeiByCode(trimmedValue);
          setSuggestions(results);
          setShowDropdown(results.length > 0);
        } catch (error) {
          console.error('Error buscando sugerencias de IMEI:', error);
          setSuggestions([]);
          setShowDropdown(false);
        } finally {
          setLoading(false);
        }
      } 
      // Cuando tiene 10 o más caracteres, validar y obtener datos completos
      else if (trimmedValue.length >= 10 && trimmedValue !== lastValidatedImei.current) {
        setLoading(true);
        setShowDropdown(false);
        setSuggestions([]);
        
        try {
          const data = await getDataByImei(trimmedValue);
          lastValidatedImei.current = trimmedValue;
          
          // Si no tiene ICCID o está vacío, mostrar error
          if (!data || !data.iccid || data.iccid === '' || data.iccid === '000') {
            Toast.show({
              type: 'error',
              text1: 'IMEI no válido',
              text2: `El IMEI ${trimmedValue}, inexistente o en uso, verifique si el código es correcto!`,
              position: 'bottom',
              visibilityTime: 4000,
            });
            
            // Actualizar ICCID a 0000
            if (onIccidUpdate) {
              onIccidUpdate('0000');
            }
          } else {
            // IMEI válido, actualizar ICCID con el valor recibido
            Toast.show({
              type: 'success',
              text1: 'IMEI válido',
              text2: `ICCID: ${data.iccid}`,
              position: 'bottom',
              visibilityTime: 2000,
            });
            
            if (onIccidUpdate) {
              onIccidUpdate(data.iccid);
            }
          }
          
          // Notificar al componente padre si tiene callback
          if (onSelectImei) {
            onSelectImei(data);
          }
        } catch (error) {
          console.error('Error obteniendo datos de IMEI:', error);
          lastValidatedImei.current = trimmedValue;
          
          Toast.show({
            type: 'error',
            text1: 'IMEI no válido',
            text2: `El IMEI ${trimmedValue}, inexistente o en uso, verifique si el código es correcto!`,
            position: 'bottom',
            visibilityTime: 4000,
          });
          
          // Actualizar ICCID a 0000
          if (onIccidUpdate) {
            onIccidUpdate('0000');
          }
        } finally {
          setLoading(false);
        }
      } else {
        setSuggestions([]);
        setShowDropdown(false);
      }
    };

    // Debounce para evitar muchas peticiones
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(searchSuggestions, 500);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [value, onIccidUpdate, onSelectImei]);

  // Resetear el último IMEI validado cuando el valor cambia significativamente
  useEffect(() => {
    if (value.length < 10) {
      lastValidatedImei.current = '';
    }
  }, [value]);

  // Manejar selección de sugerencia
  const handleSelectSuggestion = (item) => {
    onChangeText(item.imei);
    setShowDropdown(false);
    setSuggestions([]);
    Keyboard.dismiss();
  };

  // Renderizar item de sugerencia
  const renderSuggestionItem = ({ item }) => (
    <TouchableOpacity
      style={styles.suggestionItem}
      onPress={() => handleSelectSuggestion(item)}
    >
      <Text style={styles.suggestionCode}>{item.imei}</Text>
      <Icon name="chevron-right" size={20} color="#999" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Input con iconos */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder="BUSCAR POR IMEI"
          placeholderTextColor="#999"
          editable={editable}
          keyboardType="numeric"
          maxLength={15}
        />
        
        {/* Indicador de carga */}
        {loading && (
          <ActivityIndicator 
            size="small" 
            color="#3F51B5" 
            style={styles.loadingIndicator}
          />
        )}
        
        {/* Botón de voz */}
        <TouchableOpacity
          style={styles.iconButton}
          onPress={onVoiceInput}
        >
          <Icon name="mic" size={24} color="#3F51B5" />
        </TouchableOpacity>
        
        {/* Botón de escáner */}
        <TouchableOpacity
          style={styles.iconButton}
          onPress={onBarcodeScan}
        >
          <Icon name="qr-code-scanner" size={24} color="#3F51B5" />
        </TouchableOpacity>
      </View>

      {/* Dropdown de sugerencias */}
      {showDropdown && suggestions.length > 0 && (
        <View style={styles.dropdownContainer}>
          <View style={styles.dropdownHeader}>
            <Text style={styles.dropdownTitle}>
              {suggestions.length} IMEI{suggestions.length !== 1 ? 's' : ''} encontrado{suggestions.length !== 1 ? 's' : ''}
            </Text>
            <TouchableOpacity
              onPress={() => setShowDropdown(false)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Icon name="close" size={20} color="#666" />
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={suggestions}
            renderItem={renderSuggestionItem}
            keyExtractor={(item, index) => `${item.imei}-${index}`}
            style={styles.suggestionsList}
            keyboardShouldPersistTaps="handled"
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    zIndex: 999,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    height: 50,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    paddingVertical: 8,
  },
  loadingIndicator: {
    marginHorizontal: 8,
  },
  iconButton: {
    padding: 8,
    marginLeft: 4,
  },
  dropdownContainer: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderTopWidth: 0,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    maxHeight: 350,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#f8f8f8',
  },
  dropdownTitle: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  suggestionsList: {
    maxHeight: 300,
  },
  suggestionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  suggestionCode: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
});

export default AutocompleteImei;
