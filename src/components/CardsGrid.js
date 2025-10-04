import { View, Text, Dimensions } from "react-native";
import { Entypo, AntDesign } from "@expo/vector-icons";

const { width } = Dimensions.get("window"); 

export default function CardsGrid() {
  return (
    <View
      style={{
        flex: 1,
        paddingHorizontal: 20,
        paddingVertical: 30,
        backgroundColor: "#f2f2f2",
      }}
    >
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap", 
          justifyContent: "center", 
          gap: 12,
        }}
      >
        <Card
          icon={<Entypo name="install" size={24} color="#8F9392" />}
          title="Instalación"
          text="Instala nuevo equipo."
        />
        <Card
          icon={<AntDesign name="history" size={24} color="#8F9392" />}
          title="Historial"
          text="Ver historial completo."
        />
        <Card
          icon={<Entypo name="tools" size={24} color="#8F9392" />}
          title="Mantenimiento"
          text="Revisa los equipos instalados."
        />
        <Card
          icon={<AntDesign name="setting" size={24} color="#8F9392" />}
          title="Configuración"
          text="Ajusta parámetros del sistema."
        />
      </View>
    </View>
  );
}

function Card({ icon, title, text }) {
  const cardWidth = width * 0.42;

  return (
    <View
      style={{
        backgroundColor: "#fff",
        borderRadius: 20,
        padding: 15,
        alignItems: "center",
        justifyContent: "center",
        width: cardWidth,
        height: 130,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
      }}
    >
      <View style={{ paddingVertical: 10 }}>{icon}</View>
      <Text style={{ fontSize: 18, fontWeight: "700", textAlign: "center" }}>{title}</Text>
      <Text style={{ textAlign: "center", color: "#555", fontSize: 14 }}>{text}</Text>
    </View>
  );
}
