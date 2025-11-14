import { View, Text, TouchableOpacity, ScrollView, Alert, Linking, ActivityIndicator } from "react-native";
import { AppState } from "react-native";
import { useContext, useEffect, useState } from "react"
import { AuthContext } from "../context/AuthContext"
import { LocationContext } from "../context/LocationContext"
// import Entypo from '@expo/vector-icons/Entypo';
// import AntDesign from '@expo/vector-icons/AntDesign';
// import FontAwesome from '@expo/vector-icons/FontAwesome';
// import Feather from '@expo/vector-icons/Feather';
// import MaterialIcons from '@expo/vector-icons/MaterialIcons';
// import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from "@react-navigation/native";
import MenuCard from "../components/MenuCard";
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Toast from 'react-native-toast-message';
import { getAppVersion } from "../services/historialService";

const CURRENT_BUILD_CODE = "AppTecnicosV2.2.17";
const HomeScreen = () => {
  const navigation = useNavigation();
  const { signOut, userInfo } = useContext(AuthContext)
  const { checkGPSStatus } = useContext(LocationContext)

  const [isChecking, setIsChecking] = useState(true);
  const [blocked, setBlocked] = useState(false);

  const InstaIcon = { component: FontAwesome, name: 'th-list', color: '#8F9392', size: 24 };
  const HistoryIcon = { component: FontAwesome, name: 'history', color: '#8F9392', size: 24 };
  const UserIcon = { component: FontAwesome, name: 'user', color: '#8F9392', size: 24 };
  const HelpIcon = { component: MaterialIcons, name: 'live-help', color: '#8F9392', size: 24 };
  const MapIcon = { component: Ionicons, name: 'map', color: '#8F9392', size: 24 };
  const LogoutIcon = { component: MaterialIcons, name: 'logout', color: 'red', size: 24 };
  const AddIcon = { component: Ionicons, name: 'add', color: '#fff', size: 30 };


  const checkGPS = async () => {
    try {
      const isEnabled = await checkGPSStatus();
      if (!isEnabled) {
        Toast.show({
          type: 'info',
          text1: 'GPS Desactivado',
          text2: 'Por favor, activa el GPS para usar todas las funciones de la app',
          position: 'bottom',
          visibilityTime: 5000,
        });
      }
    } catch (error) {
      console.log('Error verificando GPS:', error);
    }
  };

  const checkForUpdates = async () => {
    try {
      const data = await getAppVersion();

      if (data?.version !== CURRENT_BUILD_CODE) {
        setBlocked(true);
        Alert.alert(
          "Actualización requerida",
          `Se detectó una nueva versión (${data.version}). Debes actualizar antes de continuar.`,
          [
            {
              text: "Actualizar ahora",
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
          ],
          { cancelable: false }
        );
      } else {
        console.log("App actualizada correctamente");
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
    } finally {
      setIsChecking(false);
    }
  };


  useEffect(() => {
    checkForUpdates();
    checkGPS();

    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        checkForUpdates();
      }
    });

    return () => subscription.remove();
  }, []);


  if (isChecking) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#F1F3F2",
        }}
      >
        <ActivityIndicator size="large" color="#2b4a8b" />
        <Text style={{ marginTop: 10, color: "#2b4a8b", fontWeight: "bold" }}>
          Verificando actualizaciones...
        </Text>
      </View>
    );
  }

  if (blocked) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#F1F3F2",
          paddingHorizontal: 20,
        }}
      >
        <ActivityIndicator size="large" color="#2b4a8b" />
        <Text
          style={{
            marginTop: 15,
            color: "#2b4a8b",
            fontWeight: "bold",
            textAlign: "center",
          }}
        >
          Debes actualizar la aplicación antes de continuar.
        </Text>        
      </View>
    );
  }




  return (
    <View style={{ flex: 1, backgroundColor: "#F1F3F2", paddingHorizontal: 20, }}>
      {/* <View style={{ paddingVertical: 40 }}>
        <Text style={{ fontSize: 35, fontWeight: 600, color: "#8F9392", }} >Hola {userInfo?.idUsuario},</Text>
        <Text style={{ fontSize: 35, fontWeight: 600, color: "#060807", }} >Cómo puedo ayudarte hoy?</Text>
      </View> */}
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 10, }}>
        <View style={{ flexDirection: "row", gap: 10 }}>
          <MenuCard
            Icon={InstaIcon}
            iconName="install"
            title="Instalación"
            description="Instala nuevo equipo."
            onPress={() => navigation.navigate("Instalacion")}
          />
          <MenuCard
            Icon={HistoryIcon}
            iconName="history"
            title="Historial"
            description="Ver historial."
            onPress={() => navigation.navigate("Historial")}
          />
        </View>

        <View style={{ flexDirection: "row", gap: 6 }}>
          <MenuCard
            Icon={UserIcon}
            iconName="user"
            title="Perfil"
            description="Gestione su perfil."
            onPress={() => navigation.navigate("User")}
          />
          <MenuCard
            Icon={HelpIcon}
            iconName="help-circle"
            title="Soporte"
            description="¿Necesita ayuda?"
            onPress={() => Linking.openURL('tel:+51991587659')}
          />
        </View>

        <View style={{ flexDirection: "row", gap: 6 }}>
          <MenuCard
            Icon={MapIcon}
            iconName="map"
            title="Mapa"
            description="Ver en mapa."
            onPress={() => navigation.navigate("Mapa")}
          />
          <MenuCard
            Icon={LogoutIcon}
            iconName="logout"
            iconColor="red"
            title="Salir"
            titleColor="red"
            description="Cerrar sesión."
            onPress={signOut}
          />
        </View>
      </View>
      {/* <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginVertical: 20, }}>
        <View style={{ flexDirection: "row", gap: 5, backgroundColor: "#1E187B", padding: 10, borderRadius: 50 }}>
          <TouchableOpacity style={{ width: 50, height: 50, justifyContent: "center", alignItems: "center", borderRadius: "100%", backgroundColor: "#fff" }}>
            <Entypo name="map" size={24} color="#060807" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate("User")} style={{ width: 50, height: 50, justifyContent: "center", alignItems: "center", borderRadius: "100%", backgroundColor: "#ffffff49" }}>
            <Text>
              <FontAwesome name="user" size={24} color="#fff" />
            </Text>
          </TouchableOpacity>
        </View>
        <View style={{ flexDirection: "row", gap: 5, backgroundColor: "#1E187B", padding: 10, borderRadius: 50 }}>
          <TouchableOpacity style={{ width: 50, height: 50, justifyContent: "center", alignItems: "center", borderRadius: 100, borderWidth: 1, borderRadius: 50, borderColor: "white" }}>
            <AddIcon.component name={AddIcon.name} size={AddIcon.size} color={AddIcon.color} />
          </TouchableOpacity>
        </View>
      </View> */}
      <Toast />
    </View>
  )
}

export default HomeScreen