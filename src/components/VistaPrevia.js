import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Platform,
  Dimensions, // Importamos Dimensions
} from 'react-native';
import { WebView } from 'react-native-webview';

// Obtenemos la altura de la pantalla
const windowHeight = Dimensions.get('window').height;

const VistaPrevia = ({ pdfUrl, loading }) => {
  const [webViewLoading, setWebViewLoading] = useState(true);

  // Determinar la URL a usar según la plataforma
  const viewerUrl = Platform.OS === 'android'
    ? `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(pdfUrl)}`
    : pdfUrl;

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2b4a8b" />
          <Text style={styles.loadingText}>Generando vista previa...</Text>
        </View>
      ) : pdfUrl ? (
        <>
          {/* Muestra un 'Cargando...' superpuesto mientras el WebView carga */}
          {webViewLoading && (
            <View style={styles.webViewLoadingContainer}>
              <ActivityIndicator size="large" color="#2b4a8b" />
              <Text style={styles.loadingText}>Cargando documento...</Text>
            </View>
          )}
          <WebView
            source={{ uri: viewerUrl }}
            style={styles.webview}
            onLoadStart={() => setWebViewLoading(true)}
            onLoadEnd={() => setWebViewLoading(false)}
            onError={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              console.error('WebView error: ', nativeEvent);
              setWebViewLoading(false); // Asegúrate de ocultar el loading si hay error
            }}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true} // Muestra el indicador de carga nativo
          />
        </>
      ) : (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No se pudo cargar la vista previa</Text>
          <Text style={styles.errorSubtext}>Por favor, intente nuevamente</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // La altura fija para que funcione dentro de ScrollView
    height: windowHeight * 0.75, 
    backgroundColor: '#fff',
  },
  loadingContainer: {
    // Contenedor para el estado de 'generando...'
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  webViewLoadingContainer: {
    // Contenedor para el estado de 'cargando...' del WebView
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    zIndex: 1000, // Se superpone por encima del WebView
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  webview: {
    flex: 1, // El WebView llena el 'container'
  },
  errorContainer: {
    // Contenedor para el estado de error
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#e74c3c',
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default VistaPrevia;