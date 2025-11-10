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
import { searchNeverasByCodigo } from '../services/neveraService';

/**
 * Componente de autocompletado para código de nevera
 * Muestra sugerencias cuando el texto tiene >= 4 caracteres
 */
const AutocompleteNevera = ({ 
  value, 
  onChangeText, 
  onSelectNevera,
  onBarcodeScan,
  onVoiceInput,
  editable = true
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceTimer = useRef(null);

  // Buscar sugerencias cuando el texto cambia
  useEffect(() => {
    const searchSuggestions = async () => {
      // Solo buscar si tiene 4 o más caracteres y menos de 10
      if (value.length >= 4 && value.length < 10) {
        setLoading(true);
        
        try {
          const results = await searchNeverasByCodigo(value);
          setSuggestions(results);
          setShowDropdown(results.length > 0);
        } catch (error) {
          console.error('Error buscando sugerencias:', error);
          setSuggestions([]);
          setShowDropdown(false);
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
  }, [value]);

  // Manejar selección de sugerencia
  const handleSelectSuggestion = (item) => {
    onChangeText(item.codigo);
    setShowDropdown(false);
    setSuggestions([]);
    Keyboard.dismiss();
    
    // Notificar al componente padre
    if (onSelectNevera) {
      onSelectNevera(item);
    }
  };

  // Renderizar item de sugerencia
  const renderSuggestionItem = ({ item }) => (
    <TouchableOpacity
      style={styles.suggestionItem}
      onPress={() => handleSelectSuggestion(item)}
    >
      <Text style={styles.suggestionCode}>{item.codigo}</Text>
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
          placeholder="Código de nevera"
          placeholderTextColor="#999"
          editable={editable}
          autoCapitalize="characters"
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
              {suggestions.length} nevera{suggestions.length !== 1 ? 's' : ''} encontrada{suggestions.length !== 1 ? 's' : ''}
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
            keyExtractor={(item) => item.id.toString()}
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
    zIndex: 1000,
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

export default AutocompleteNevera;
