import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocation } from '../hooks/useLocation';

export const LocationDisplay = () => {
  const { latitude, longitude, accuracy, error, isLoading } = useLocation();

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="small" color="#0066CC" />
        <Text style={styles.text}>Obteniendo ubicación...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>❌ {error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>📍 Ubicación GPS</Text>
      <Text style={styles.text}>Lat: {latitude?.toFixed(6) || 'N/A'}</Text>
      <Text style={styles.text}>Lng: {longitude?.toFixed(6) || 'N/A'}</Text>
      {accuracy && (
        <Text style={styles.accuracy}>Precisión: ±{accuracy.toFixed(0)}m</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginVertical: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  text: {
    fontSize: 12,
    color: '#666',
    marginVertical: 2,
  },
  accuracy: {
    fontSize: 10,
    color: '#999',
    marginTop: 5,
  },
  errorText: {
    fontSize: 12,
    color: '#FF3B30',
  },
});
