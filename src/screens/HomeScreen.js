import { View, Text, TouchableOpacity, ScrollView, Alert, Linking } from "react-native";
import { useContext, useEffect } from "react"
import { AuthContext } from "../context/AuthContext"
// import Entypo from '@expo/vector-icons/Entypo';
// import AntDesign from '@expo/vector-icons/AntDesign';
// import FontAwesome from '@expo/vector-icons/FontAwesome';
// import Feather from '@expo/vector-icons/Feather';
// import MaterialIcons from '@expo/vector-icons/MaterialIcons';
// import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from "@react-navigation/native";
import { getAppVersion } from "../services/historialService";
import MenuCard from "../components/MenuCard";

const CURRENT_BUILD_CODE = 1; 
const HomeScreen = () => {


  const navigation = useNavigation();
  const { signOut, userInfo } = useContext(AuthContext)

  useEffect(() => {
    checkForUpdates();
  }, []);

  const checkForUpdates = async () => {
    try {
      const data = await getAppVersion();
      console.log("Versión del servidor:", data);

      if (data?.code > CURRENT_BUILD_CODE) {
        Alert.alert(
          "Actualización disponible 🚀",
          `Se detectó una nueva versión (${data.version}). ¿Deseas actualizar ahora?`,
          [
            { text: "Más tarde", style: "cancel" },
            {
              text: "Actualizar",
              onPress: () => {
                if (data.link) {
                  Linking.openURL(data.link);
                } else {
                  Toast.show({
                    type: "error",
                    text1: "Error",
                    text2: "No se encontró el enlace de descarga.",
                    position: "bottom",
                    visibilityTime: 3000,
                  });
                }
              },
            },
          ]
        );
      } else {
        console.log("✅ App está actualizada.");
      }
    } catch (error) {
      console.error("Error verificando la versión:", error);

      Toast.show({
        type: "error",
        text1: "Error",
        text2: "No se pudo verificar la versión de la aplicación",
        position: "bottom",
        visibilityTime: 3000,
      });
    }
  };
  return (
    <View style={{ flex: 1, backgroundColor: "#F1F3F2", paddingHorizontal: 20, }}>
      <View style={{ paddingVertical: 40 }}>
        <Text style={{ fontSize: 35, fontWeight: 600, color: "#8F9392", }} >Hola {userInfo?.idUsuario},</Text>
        <Text style={{ fontSize: 35, fontWeight: 600, color: "#060807", }} >Cómo puedo ayudarte hoy?</Text>
      </View>
      <View style={{ flex: 1, flexDirection: "column", gap: 6, }}>
        <View style={{ flexDirection: "row", gap: 6 }}>
          <MenuCard
            // Icon={Entypo}
            iconName="install"
            title="Instalación"
            description="Instala nuevo equipo."
            onPress={() => navigation.navigate("Instalacion")}
          />
          <MenuCard
            // Icon={AntDesign}
            iconName="history"
            title="Historial"
            description="Ver historial."
            onPress={() => navigation.navigate("Historial")}
          />
        </View>

        <View style={{ flexDirection: "row", gap: 6 }}>
          <MenuCard
            // Icon={FontAwesome}
            iconName="user"
            title="Perfil"
            description="Gestione su perfil."
            onPress={() => navigation.navigate("User")}
          />
          <MenuCard
            // Icon={Feather}
            iconName="help-circle"
            title="Soporte"
            description="¿Necesita ayuda?"
          />
        </View>

        <View style={{ flexDirection: "row", gap: 6 }}>
          <MenuCard
            // Icon={Entypo}
            iconName="map"
            title="Mapa"
            description="Ver en mapa."
            onPress={() => navigation.navigate("Mapa")}
          />
          <MenuCard
            // Icon={MaterialIcons}
            iconName="logout"
            iconColor="red"
            title="Salir"
            titleColor="red"
            description="Cerrar sesión."
            onPress={signOut}
          />
        </View>
      </View>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginVertical: 20, }}>
        <View style={{ flexDirection: "row", gap: 5, backgroundColor: "#1E187B", padding: 10, borderRadius: 50 }}>
          <TouchableOpacity style={{ width: 50, height: 50, justifyContent: "center", alignItems: "center", borderRadius: "100%", backgroundColor: "#fff" }}>
            {/* <Entypo name="map" size={24} color="#060807" /> */}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate("User")} style={{ width: 50, height: 50, justifyContent: "center", alignItems: "center", borderRadius: "100%", backgroundColor: "#ffffff49" }}>
            <Text>
              {/* <FontAwesome name="user" size={24} color="#fff" /> */}
            </Text>
          </TouchableOpacity>
        </View>
        <View style={{ flexDirection: "row", gap: 5, backgroundColor: "#1E187B", padding: 10, borderRadius: 50 }}>
          <TouchableOpacity style={{ width: 50, height: 50, justifyContent: "center", alignItems: "center", borderRadius: 100, borderWidth: 1, borderRadius: 50, borderColor: "white" }}>
            {/* <Ionicons name="add" size={30} color="white" /> */}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

export default HomeScreen