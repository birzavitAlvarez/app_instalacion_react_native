import { HISTORIAL_ENDPOINTS } from "../config/api";
import Toast from "react-native-toast-message";
const API_URL = "https://phuyu-iot.com/NESTLE-API-TECNICOS/api/v1/logistica/gestionGetVersionApp";
/**
 * @param {number|string} idUsuario 
 * @returns {Promise<{efectivas: Array, fallidas: Array}>}
 */
export const fetchHistorialInstalaciones = async (idUsuario) => {
  try {
    const efectivasUrl = HISTORIAL_ENDPOINTS.INSTALACIONES_EFECTIVAS(idUsuario);
    const fallidasUrl = HISTORIAL_ENDPOINTS.INSTALACIONES_FALLIDAS(idUsuario);

    const [resEfectivas, resFallidas] = await Promise.all([
      fetch(efectivasUrl),
      fetch(fallidasUrl),
    ]);

    if (!resEfectivas.ok || !resFallidas.ok) {
      const errText1 = await resEfectivas.text();
      const errText2 = await resFallidas.text();
      console.error("Error detalle efectivas:", errText1);
      console.error("Error detalle fallidas:", errText2);
      throw new Error("Error al obtener historial de instalaciones");
    }

    const dataEfectivas = await resEfectivas.json();
    const dataFallidas = await resFallidas.json();

    return { efectivas: dataEfectivas, fallidas: dataFallidas };
  } catch (error) {
    console.error("🚨 Error en fetchHistorialInstalaciones:", error);
    throw error;
  }
};

export const getAppVersion = async () => {
  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      const errText = await response.text();
      console.error("Detalle del error:", errText);

      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Error al obtener la versión de la aplicación",
        position: "bottom",
        visibilityTime: 3000,
      });

      throw new Error("Error al obtener la versión de la aplicación");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("🚨 Error en getAppVersion:", error);

    Toast.show({
      type: "error",
      text1: "Error",
      text2: "No se pudo conectar con el servidor de versión",
      position: "bottom",
      visibilityTime: 3000,
    });

    throw error;
  }
};

