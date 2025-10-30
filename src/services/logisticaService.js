import axios from "axios";

const BASE_URL = "https://phuyu-iot.com/NESTLE-API-TECNICOS/api/v1/logistica";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000, 
});

export const getUsuarioPersonalArea = async (id) => {
  try {
    const response = await api.get(`/getUsuarioPersonalArea?_id=${id}`);
    return response.data;
  } catch (error) {
    console.error("Error en getUsuarioPersonalArea:", error);
    throw error;
  }
};

export const listaItemsRutaByTecnico = async (tecnico) => {
  try {
    const response = await api.get(`/listaItemsRutaByTecnico?tecnico=${tecnico}`);
    return response.data;
  } catch (error) {
    console.error("Error en listaItemsRutaByTecnico:", error);
    throw error;
  }
};

export const actualizarCoordenadasUsuario = async (data) => {
  try {
    const response = await api.post(`/spActualizarCoordenadasUsuario`, data);
    return response.data;
  } catch (error) {
    console.error("Error en actualizarCoordenadasUsuario:", error);
    throw error;
  }
};

export default {
  getUsuarioPersonalArea,
  listaItemsRutaByTecnico,
  actualizarCoordenadasUsuario,
};
