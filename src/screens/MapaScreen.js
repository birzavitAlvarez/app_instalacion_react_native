import React, { useEffect, useState, useContext } from "react";
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from "react-native";
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from "react-native-maps";
import Toast from "react-native-toast-message";
import { GOOGLE_MAPS_API_KEY, DEFAULT_REGION } from "../config/maps";
import { AuthContext } from "../context/AuthContext";
import { getUsuarioPersonalArea, listaItemsRutaByTecnico, actualizarCoordenadasUsuario } from "../services/logisticaService";
import { useLocation } from "../hooks/useLocation";
const MapaScreen = () => {
    const { userInfo } = useContext(AuthContext);
    const idUsuario = userInfo?.idUsuario;
    const [markers, setMarkers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [location, setLocation] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const { latitude, longitude, isLoading: locationLoading, error: locationError, getCurrentLocation } = useLocation();

    useEffect(() => {
        if (!idUsuario) return;

        let interval = null;

        const startAutoUpdate = async () => {
            try {
                const loc = await getCurrentLocation();

                if (loc?.latitude && loc?.longitude) {
                    const data = {
                        id: idUsuario,
                        latitud: loc.latitude.toString(),
                        longitud: loc.longitude.toString(),
                    };
                    const res = await actualizarCoordenadasUsuario(data);
                    setIsConnected(res?.status === 1);
                }

                interval = setInterval(async () => {
                    try {
                        const newLoc = await getCurrentLocation();

                        if (newLoc?.latitude && newLoc?.longitude) {
                            const data = {
                                id: idUsuario,
                                latitud: newLoc.latitude.toString(),
                                longitud: newLoc.longitude.toString(),
                            };
                            const res = await actualizarCoordenadasUsuario(data);
                            setIsConnected(res?.status === 1);
                        } else {
                            setIsConnected(false);
                        }
                    } catch (err) {
                        console.log("Error actualizando coordenadas:", err);
                        setIsConnected(false);
                    }
                }, 300000);
            } catch (err) {
                console.log("Error inicial en GPS:", err);
                setIsConnected(false);
            }
        };

        startAutoUpdate();

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [idUsuario]);





    useEffect(() => {
        const cargarDataMapa = async () => {
            try {
                if (!idUsuario) {
                    Toast.show({
                        type: "error",
                        text1: "Error de sesión",
                        text2: "No se encontró el ID del usuario",
                        position: "bottom",
                    });
                    return;
                }

                const usuarioRes = await getUsuarioPersonalArea(idUsuario);
                const dni = 73526408;

                const rutaRes = await listaItemsRutaByTecnico(dni);
                if (rutaRes.status === 1 && Array.isArray(rutaRes.data)) {
                    const formatted = rutaRes.data
                        .filter((item) => item.latitud && item.longitud)
                        .map((item, index) => ({
                            id: index,
                            latitude: parseFloat(item.latitud),
                            longitude: parseFloat(item.longitud),
                            title: item.cliente,
                            direccion: item.direccion,
                            vendedor: item.vendedor,
                            codigo: item.codigo_nevera,
                            color: item.color || "red",
                        }));
                    setMarkers(formatted);
                } else {
                    Toast.show({
                        type: "info",
                        text1: "Sin resultados",
                        text2: "No hay rutas para este técnico",
                        position: "bottom",
                    });
                }
            } catch (error) {
                console.error("Error mapa:", error);
                Toast.show({
                    type: "error",
                    text1: "Error al cargar mapa",
                    text2: "Verifica tu conexión o API",
                    position: "bottom",
                });
            } finally {
                setLoading(false);
            }
        };
        cargarDataMapa();
    }, [idUsuario]);

    if (GOOGLE_MAPS_API_KEY === 'API_KEY') {
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

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text>Cargando mapa...</Text>
            </View>
        );
    }

    if (!latitude || !longitude) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text>Cargando ubicación...</Text>
            </View>
        );
    }


    return (
        <View style={styles.container}>
            <View style={styles.statusContainer}>
                <View
                    style={[
                        styles.statusDot,
                        { backgroundColor: isConnected ? "#4CAF50" : "#F44336" },
                    ]}
                />
            </View>
            <MapView
                provider={PROVIDER_GOOGLE}
                style={styles.map}
                initialRegion={DEFAULT_REGION}
                showsUserLocation
                showsCompass
            >
                {markers.map((marker) => (
                    <Marker
                        key={marker.id}
                        coordinate={{
                            latitude: marker.latitude,
                            longitude: marker.longitude,
                        }}
                        pinColor={marker.color}
                    >
                        <Callout tooltip>
                            <View style={styles.callout}>
                                <Text style={styles.title}>{marker.title}</Text>
                                <Text style={styles.text}>{marker.direccion}</Text>
                                <Text style={styles.text}>Nevera: {marker.codigo}</Text>
                                <Text style={styles.text}>Vendedor: {marker.vendedor}</Text>

                                <TouchableOpacity
                                    style={styles.button}
                                    onPress={() => Toast.show({
                                        type: "success",
                                        text1: "Acción",
                                        text2: `Ver detalles de ${marker.title}`,
                                        position: "bottom",
                                    })}
                                >
                                </TouchableOpacity>
                            </View>
                        </Callout>
                    </Marker>
                ))}
            </MapView>
            <Toast />
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
    callout: {
        backgroundColor: "white",
        borderRadius: 10,
        padding: 10,
        width: 200,
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 4,
    },
    statusContainer: {
        position: "absolute",
        top: 15,
        left: 15,
        zIndex: 999,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(255,255,255,0.9)",
        paddingVertical: 5,
        paddingHorizontal: 5,
        borderRadius: 20,
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 3,
    },
    statusDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    statusText: {
        fontSize: 14,
        color: "#333",
        fontWeight: "500",
    },
    title: { fontWeight: "bold", fontSize: 16, marginBottom: 5 },
    text: { fontSize: 13, marginBottom: 3 },
    button: {
        marginTop: 8,
        backgroundColor: "#007AFF",
        paddingVertical: 6,
        borderRadius: 6,
    },
    buttonText: { color: "white", textAlign: "center", fontWeight: "600" },
});

export default MapaScreen;