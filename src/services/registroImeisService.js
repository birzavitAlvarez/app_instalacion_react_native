import axios from 'axios';

const BASE_URL = 'https://phuyu-iot.com/NESTLE-API-TECNICOS/api/v1/logistica';

export const registrarControlDispositivo = async (data) => {
  try {
    console.log('Enviando registro de control de dispositivos:', data);
    
    const response = await axios.post(
      `${BASE_URL}/sp_control_dispositivo_insertar`,
      data
    );
    
    console.log('Respuesta del servidor:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error registrando control de dispositivos:', error);
    throw error;
  }
};
