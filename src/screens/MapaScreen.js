import React from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { GOOGLE_MAPS_API_KEY, DEFAULT_REGION } from '../config/maps';

const MapaScreen = () => {
    // Marcadores de instalaciones (puedes conectar con tu API)
    const markers = [
        // {
        //     id: 1,
        //     latitude: -12.0464,
        //     longitude: -77.0428,
        //     title: 'Instalación 1',
        //     description: 'Cliente: Juan Pérez',
        // },
    ];

    // Manejar cuando se presiona un marcador
    const onMarkerPress = (marker) => {
        Alert.alert(
            marker.title,
            marker.description,
            [
                { text: 'Ver detalles', onPress: () => console.log('Ver detalles:', marker.id) },
                { text: 'Cerrar', style: 'cancel' },
            ]
        );
    };

    // Verificar si la API Key está configurada
    if (GOOGLE_MAPS_API_KEY === 'TU_GOOGLE_MAPS_API_KEY_AQUI') {
        return (
            <View style={styles.warningContainer}>
                <Text style={styles.warningTitle}>⚠️ API Key no configurada</Text>
                <Text style={styles.warningText}>
                    Por favor configura tu Google Maps API Key en:
                </Text>
                <Text style={styles.warningPath}>
                    src/config/maps.js
                </Text>
                <Text style={styles.warningText}>
                    {'\n'}Instrucciones:{'\n'}
                    1. Ve a https://console.cloud.google.com/{'\n'}
                    2. Habilita Maps SDK for Android/iOS{'\n'}
                    3. Crea una API Key{'\n'}
                    4. Pégala en el archivo maps.js
                </Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <MapView
                provider={PROVIDER_GOOGLE}
                style={styles.map}
                initialRegion={DEFAULT_REGION}
                showsUserLocation={true}
                showsMyLocationButton={true}
                showsCompass={true}
                showsScale={true}
                loadingEnabled={true}
            >
                {/* Renderizar marcadores */}
                {markers.map((marker) => (
                    <Marker
                        key={marker.id}
                        coordinate={{
                            latitude: marker.latitude,
                            longitude: marker.longitude,
                        }}
                        title={marker.title}
                        description={marker.description}
                        onPress={() => onMarkerPress(marker)}
                        pinColor="red"
                    />
                ))}
            </MapView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        flex: 1,
    },
    warningContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#FFF3CD',
    },
    warningTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#856404',
        marginBottom: 20,
        textAlign: 'center',
    },
    warningText: {
        fontSize: 16,
        color: '#856404',
        textAlign: 'center',
        marginBottom: 10,
    },
    warningPath: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#856404',
        backgroundColor: '#fff',
        padding: 10,
        borderRadius: 5,
        marginVertical: 10,
    },
});

export default MapaScreen;