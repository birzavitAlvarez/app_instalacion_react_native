import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const SuccessScreen = ({ navigation }) => {
  const handleGoHome = () => {
    // Navegar a la pantalla principal (Home)
    navigation.reset({
      index: 0,
      routes: [{ name: 'Home' }],
    });
  };

  return (
    <View style={styles.container}>
      {/* Ícono de éxito */}
      <View style={styles.iconContainer}>
        <View style={styles.iconCircle}>
          <Icon name="check" size={80} color="#fff" />
        </View>
      </View>

      {/* Mensaje de éxito */}
      <Text style={styles.title}>Se completó el formulario</Text>

      {/* Botón de inicio */}
      <TouchableOpacity style={styles.homeButton} onPress={handleGoHome}>
        <Icon name="home" size={32} color="#fff" />
        <Text style={styles.homeButtonText}>Inicio</Text>
      </TouchableOpacity>

      {/* Mensaje adicional */}
      <View style={styles.footer}>
        <Icon name="check-circle" size={20} color="#4CAF50" />
        <Text style={styles.footerText}>Finalizaste el Proceso con éxito!</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  iconContainer: {
    marginBottom: 40,
  },
  iconCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#4FC3F7',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginBottom: 60,
  },
  homeButton: {
    backgroundColor: '#2b4a8b',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 12,
    minWidth: 140,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  homeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 60,
    backgroundColor: '#f5f5f5',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  footerText: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
});

export default SuccessScreen;
