import React, { useState, useEffect, useRef } from 'react';
import { View, FlatList, Text, TouchableOpacity, StyleSheet } from 'react-native';
import EnhancedInput from './EnhancedInput';
import { buscarNeveraPorCodigo } from '../services/instalacionesFallidasService';

const AutocompleteNeveraInput = ({
  value,
  onChangeText,
  onBarcodePress,
  onMicrophonePress
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const isSelectingRef = useRef(false);

  useEffect(() => {
    if (isSelectingRef.current) {
      isSelectingRef.current = false;
      return;
    }

    if (value.length >= 3) {
      fetchSuggestions(value);
    } else {
      setSuggestions([]);
      setShowDropdown(false);
    }
  }, [value]);

  const fetchSuggestions = async (query) => {
  try {
    const data = await buscarNeveraPorCodigo(query);
    if (query.length >= 3 && query === value.trim()) {
      setSuggestions(data);
      setShowDropdown(data.length > 0);
    } else {
      setSuggestions([]);
      setShowDropdown(false);
    }
  } catch (error) {
    console.error('Error al buscar neveras:', error);
    setSuggestions([]);
    setShowDropdown(false);
  }
};


  const handleSelectSuggestion = (item) => {
    isSelectingRef.current = true;
    onChangeText(item.codigo);
    setShowDropdown(false);
  };

  return (
    <View style={{ zIndex: 10 }}>
      <EnhancedInput
        value={value}
        onChangeText={onChangeText}
        placeholder="Buscar por código"
        showBarcode={true}
        showMicrophone={true}
        onBarcodePress={onBarcodePress}
        onMicrophonePress={onMicrophonePress}
      />

      {showDropdown && value.length >= 3 && (
        <View style={styles.dropdown}>
          <FlatList
            data={suggestions}
            keyExtractor={(item) => item.codigo}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.suggestionItem}
                onPress={() => handleSelectSuggestion(item)}
              >
                <Text>{item.codigo}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  dropdown: {
    position: 'absolute',
    top: 55,
    width: '100%',
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 4,
    maxHeight: 200,
  },
  suggestionItem: {
    padding: 10,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },
});

export default AutocompleteNeveraInput;
