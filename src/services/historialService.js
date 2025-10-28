import { HISTORIAL_ENDPOINTS } from "../config/api";

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
