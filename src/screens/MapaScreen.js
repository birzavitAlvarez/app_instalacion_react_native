import React, { useEffect, useState, useContext } from "react";
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Platform } from "react-native";
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from "react-native-maps";
import Toast from "react-native-toast-message";
import { GOOGLE_MAPS_API_KEY, DEFAULT_REGION } from "../config/maps";
import { AuthContext } from "../context/AuthContext";
import { getUsuarioPersonalArea, listaItemsRutaByTecnico, actualizarCoordenadasUsuario } from "../services/logisticaService";
import { useLocation } from "../hooks/useLocation";
import { BlurView } from "@react-native-community/blur";
import GPSRequiredModal from "../components/GPSRequiredModal";
import Icon from 'react-native-vector-icons/FontAwesome';
import { SvgXml } from "react-native-svg";

const svgNevera = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor">
  <path fill-rule="evenodd" d="m11.54 22.351.07.04.028.016a.76.76 0 0 0 .723 0l.028-.015.071-.041a16.975 16.975 0 0 0 1.144-.742 19.58 19.58 0 0 0 2.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 0 0-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 0 0 2.682 2.282 16.975 16.975 0 0 0 1.145.742ZM12 13.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" clip-rule="evenodd" />
</svg>
`;


const MapaScreen = () => {
    const { userInfo } = useContext(AuthContext);
    const idUsuario = userInfo?.idUsuario;
    const [markers, setMarkers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [location, setLocation] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const { latitude, longitude, isLoading: locationLoading, error: locationError, getCurrentLocation, checkGPSStatus, isGPSEnabled, startGPSMonitoring, stopGPSMonitoring } = useLocation();
    const [showGPSModal, setShowGPSModal] = useState(false);
    const [isCheckingGPS, setIsCheckingGPS] = useState(false);
    useEffect(() => {
        const verifyGPS = async () => {
            setIsCheckingGPS(true);
            try {
                const isEnabled = await checkGPSStatus();
                if (!isEnabled) {
                    setShowGPSModal(true);
                } else {
                    setShowGPSModal(false);
                }
            } catch (error) {
                console.log('Error verificando GPS:', error);
                setShowGPSModal(true);
            } finally {
                setIsCheckingGPS(false);
            }
        };

        verifyGPS();

        const monitoringInterval = startGPSMonitoring((isEnabled) => {
            if (!isEnabled) {
                setShowGPSModal(true);
                Toast.show({
                    type: 'error',
                    text1: 'GPS Desactivado',
                    text2: 'Por favor, activa el GPS para continuar',
                    position: 'bottom',
                    visibilityTime: 3000,
                });
            }
        });

        return () => {
            if (monitoringInterval) {
                clearInterval(monitoringInterval);
            }
            stopGPSMonitoring();
        };
    }, [checkGPSStatus, startGPSMonitoring, stopGPSMonitoring]);

    const handleRetryGPS = async () => {
        setIsCheckingGPS(true);
        try {
            const isEnabled = await checkGPSStatus();
            if (isEnabled) {
                setShowGPSModal(false);
                Toast.show({
                    type: 'success',
                    text1: 'GPS Activado',
                    text2: 'Ahora puedes usar el mapa',
                    position: 'bottom',
                    visibilityTime: 2000,
                });
            } else {
                Toast.show({
                    type: 'error',
                    text1: 'GPS aún desactivado',
                    text2: 'Por favor, activa el GPS en la configuración',
                    position: 'bottom',
                    visibilityTime: 3000,
                });
            }
        } catch (error) {
            console.log('Error reintentando GPS:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'No se pudo verificar el estado del GPS',
                position: 'bottom',
                visibilityTime: 3000,
            });
        } finally {
            setIsCheckingGPS(false);
        }
    };

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
                const dni = usuarioRes.dni;
                const rutaRes = await listaItemsRutaByTecnico(dni);

                console.log("📦 Datos crudos de la API:", rutaRes);

                if (rutaRes.status === 1 && Array.isArray(rutaRes.data)) {
                    const grouped = Object.values(
                        rutaRes.data.reduce((acc, item) => {
                            const key = `${item.latitud},${item.longitud},${item.cliente},${item.vendedor},${item.direccion}`;
                            if (!acc[key]) {
                                acc[key] = {
                                    ...item,
                                    neveras: [],
                                };
                            }
                            acc[key].neveras.push(item.codigo_nevera);
                            return acc;
                        }, {})
                    );

                    const formatted = grouped.map((item, index) => ({
                        id: index,
                        latitude: parseFloat(item.latitud),
                        longitude: parseFloat(item.longitud),
                        title: item.cliente,
                        direccion: item.direccion,
                        vendedor: item.vendedor,
                        neveras: item.neveras,
                        color: item.color || "red",
                    }));

                    console.log("📍 Markers formateados:", formatted);

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
                console.error("❌ Error mapa:", error);
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
                zoomEnabled={true}
                zoomControlEnabled={true}
                rotateEnabled={true}
                pitchEnabled={true}
                showsBuildings={true}
                showsTraffic={false}
                showsIndoors={true}
            >
                {markers.map((marker) => (
                    <Marker
                        key={marker.id}
                        coordinate={{
                            latitude: marker.latitude,
                            longitude: marker.longitude,
                        }}
                    >
                        <SvgXml xml={svgNevera} color={marker.color || "#3F51B5"} stroke={"#ffff"} strokeWidth={0.5} width={36} height={36} />
                        {/* <Icon name="map-marker" size={32} color={marker.color || "#3F51B5"}  /> */}
                        <Callout tooltip>
                            <View style={styles.callout}>
                                <Text style={styles.title}>{marker.title}</Text>
                                <Text style={styles.text}>{marker.direccion}</Text>
                                <Text style={styles.text}>Vendedor: {marker.vendedor}</Text>
                                <Text style={[styles.text, { marginTop: 6, fontWeight: "bold" }]}>
                                    Neveras:
                                </Text>
                                {marker.neveras.map((n, i) => (
                                    <Text key={i} style={styles.text}>
                                        • {n}
                                    </Text>
                                ))}

                                {marker.desplazado && (
                                    <Text style={{ color: "orange", marginTop: 4, fontSize: 12 }}>
                                        Posición ajustada para evitar superposición
                                    </Text>
                                )}
                                <View style={{ position: "absolute", bottom: 0, right: 0, padding: 2 }}>
                                    <Text style={{ fontSize: 10, color: "#adadadff" }}>{marker.color}</Text>
                                </View>
                            </View>
                        </Callout>
                    </Marker>
                ))}
            </MapView>

            {(loading || !latitude || !longitude) && (
                <View style={styles.loadingOverlay}>
                    {Platform.OS === "ios" ? (
                        <BlurView style={styles.blurView} blurType="light" blurAmount={8} />
                    ) : (
                        <View style={styles.blurFallback} />
                    )}
                    <View style={styles.loadingContent}>
                        <ActivityIndicator size="large" color="#007AFF" />
                        <Text style={styles.loadingText}>
                            {loading ? "Cargando mapa..." : "Obteniendo ubicación..."}
                        </Text>
                    </View>
                </View>
            )}

            <GPSRequiredModal
                visible={showGPSModal}
                onRetry={handleRetryGPS}
                isChecking={isCheckingGPS}
            />

            <Toast />
        </View>
    );
};
const styles = StyleSheet.create({
    container: {
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
        position: "relative",
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
        bottom: 15,
        right: 15,
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
    map: {
        ...StyleSheet.absoluteFillObject,
    },

    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: "center",
        alignItems: "center",
        zIndex: 20,
    },
    blurView: {
        ...StyleSheet.absoluteFillObject,
    },
    loadingContent: {
        borderRadius: 12,
        padding: 20,
        alignItems: "center",
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        fontWeight: "500",
        color: "#fff",
    },
    callout: {
        backgroundColor: "#fff",
        borderRadius: 8,
        padding: 10,
        width: 180,
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowRadius: 5,
    },
    title: {
        fontWeight: "bold",
    },
    blurFallback: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(31, 31, 31, 0.6)",
    },
});

export default MapaScreen;