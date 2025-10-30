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
    const { latitude, longitude, isLoading: locationLoading, error: locationError, getCurrentLocation } = useLocation();

    useEffect(() => {
        if (!idUsuario) return;

        let interval = null;

        const startAutoUpdate = async () => {
            try {
                await getCurrentLocation();

                Toast.show({
                    type: "info",
                    text1: "Ubicación activa",
                    text2: "Iniciando envío automático de coordenadas...",
                    position: "bottom",
                    visibilityTime: 2500,
                });

                interval = setInterval(async () => {
                    try {
                        await getCurrentLocation();

                        if (latitude && longitude) {
                            const data = {
                                id: idUsuario,
                                latitud: latitude.toString(),
                                longitud: longitude.toString(),
                            };

                            const res = await actualizarCoordenadasUsuario(data);

                            if (res.status === 1) {
                                console.log("✅ Coordenadas actualizadas:", latitude, longitude);
                                Toast.show({
                                    type: "success",
                                    text1: "Coordenadas enviadas",
                                    text2: `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`,
                                    position: "bottom",
                                    visibilityTime: 1500,
                                });
                            } else {
                                console.warn("⚠️ Error en actualización:", res.msg);
                                Toast.show({
                                    type: "error",
                                    text1: "Error en actualización",
                                    text2: res.msg || "No se pudo enviar coordenadas",
                                    position: "bottom",
                                    visibilityTime: 3000,
                                });
                            }
                        } else {
                            Toast.show({
                                type: "info",
                                text1: "Sin coordenadas válidas",
                                text2: "Esperando ubicación GPS...",
                                position: "bottom",
                                visibilityTime: 2000,
                            });
                        }
                    } catch (err) {
                        console.error("Error obteniendo ubicación:", err);
                        Toast.show({
                            type: "error",
                            text1: "Error GPS",
                            text2: "No se pudo obtener ubicación actual",
                            position: "bottom",
                            visibilityTime: 3000,
                        });
                    }
                }, 10000);
            } catch (error) {
                console.error("Error inicializando tracking:", error);
                Toast.show({
                    type: "error",
                    text1: "Error inicializando tracking",
                    text2: "Verifica permisos de ubicación",
                    position: "bottom",
                });
            }
        };

        startAutoUpdate();

        return () => {
            if (interval) clearInterval(interval);
            Toast.show({
                type: "info",
                text1: "Tracking detenido",
                text2: "Se detuvo el envío de coordenadas",
                position: "bottom",
                visibilityTime: 2000,
            });
        };
    }, [idUsuario, latitude, longitude]);


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

    return (
        <View style={styles.container}>
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