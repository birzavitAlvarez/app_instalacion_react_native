import React, { useEffect, useState, useContext, useCallback, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Alert,
  Linking,
  Share
} from "react-native";
import { AuthContext } from "../context/AuthContext";
import { fetchHistorialInstalaciones } from "../services/historialService";
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from "@react-native-async-storage/async-storage";

const PdfIcon = { component: MaterialIcons, name: 'picture-as-pdf', color: '#fff', size: 20 };
const ShareIcon = { component: MaterialIcons, name: 'share', color: '#fff', size: 20 };

const CARD_HEIGHT = 90;

const Historial = () => {
  const { userInfo } = useContext(AuthContext);
  const idUsuario = userInfo?.idUsuario;

  const [efectivas, setEfectivas] = useState([]);
  const [fallidas, setFallidas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState("efectivas");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!idUsuario) return;

    const loadHistorial = async () => {
      try {
        const data = await fetchHistorialInstalaciones(idUsuario);
        setEfectivas(data.efectivas);
        setFallidas(data.fallidas);
      } catch (error) {
        Alert.alert("Error", "No se pudo cargar el historial.");
      } finally {
        setLoading(false);
      }
    };

    loadHistorial();
  }, [idUsuario]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const data = await fetchHistorialInstalaciones(idUsuario);
      setEfectivas(data.efectivas);
      setFallidas(data.fallidas);

      await AsyncStorage.setItem("historial_cache", JSON.stringify(data));
    } catch (e) {
      Alert.alert("Error", "No se pudo refrescar el historial");
    }
    setRefreshing(false);
  }, [idUsuario]);

  const handleVerPDF = useCallback(async (path) => {
    const url = `https://phuyu-iot.com/NESTLE-API-TECNICOS/public/${path}`;
    const supported = await Linking.canOpenURL(url);
    supported ? Linking.openURL(url) :
      Alert.alert("Error", "No se puede abrir el enlace.");
  }, []);

  const handleCompartir = useCallback(async (path) => {
    try {
      const url = `https://phuyu-iot.com/NESTLE-API-TECNICOS/public/${path}`;
      await Share.share({
        message: `Aquí tienes el enlace del acta:\n${url}`,
        url,
        title: "Compartir acta",
      });
    } catch {
      Alert.alert("Error", "No se pudo compartir.");
    }
  }, []);

  const RenderItem = useCallback(({ item, color }) => (
    <View style={[styles.card, { borderLeftColor: color }]}>
      <View style={{ flex: 1 }}>
        <Text style={styles.nombre}>{item.pdfPath || "Sin nombre"}</Text>
        <Text style={styles.fecha}>
          Fecha: {new Date(item.createdAt).toLocaleString("es-PE")}
        </Text>
      </View>

      <View style={styles.buttons}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: "#8F9392" }]}
          onPress={() => handleVerPDF(item.pdfPath)}
        >
          <PdfIcon.component name={PdfIcon.name} size={PdfIcon.size} color={PdfIcon.color} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: "#53617cff" }]}
          onPress={() => handleCompartir(item.pdfPath)}
        >
          <ShareIcon.component name={ShareIcon.name} size={ShareIcon.size} color={ShareIcon.color} />
        </TouchableOpacity>
      </View>
    </View>
  ), [handleVerPDF, handleCompartir]);

  const data = useMemo(() => (
    selectedTab === "efectivas" ? efectivas : fallidas
  ), [selectedTab, efectivas, fallidas]);

  const color = selectedTab === "efectivas" ? "#22C55E" : "#EF4444";

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2b4a8b" />
        <Text style={styles.loadingText}>Cargando historial...</Text>
      </View>
    );

  return (
    <View style={styles.container}>
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === "efectivas" && styles.activeTab]}
          onPress={() => setSelectedTab("efectivas")}
        >
          <Text style={[styles.tabText, selectedTab === "efectivas" && styles.activeTabText]}>
            Efectivas
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, selectedTab === "fallidas" && styles.activeTab]}
          onPress={() => setSelectedTab("fallidas")}
        >
          <Text style={[styles.tabText, selectedTab === "fallidas" && styles.activeTabText]}>
            Fallidas
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={data}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <RenderItem item={item} color={color} />}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        refreshing={refreshing}
        onRefresh={onRefresh}
        windowSize={7}
        getItemLayout={(d, index) => ({
          length: CARD_HEIGHT,
          offset: CARD_HEIGHT * index,
          index,
        })}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            No hay instalaciones {selectedTab} registradas.
          </Text>
        }
      />
    </View>
  );
};

export default Historial;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#F9FAFB",
  },
  tabsContainer: {
    flexDirection: "row",
    marginBottom: 16,
    backgroundColor: "#E5E7EB",
    borderRadius: 10,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 10,
  },
  activeTab: {
    backgroundColor: "#2b4a8b",
  },
  tabText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },
  activeTabText: {
    color: "#fff",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  nombre: {
    fontWeight: "600",
    fontSize: 14,
  },
  fecha: {
    color: "#6B7280",
    fontSize: 13,
  },
  buttons: {
    flexDirection: "row",
    gap: 6,
    marginLeft: 10,
  },
  button: {
    padding: 8,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 13,
  },
  emptyText: {
    color: "#6B7280",
    fontStyle: "italic",
    textAlign: "center",
    marginVertical: 10,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 8,
    color: "#374151",
  },
});
