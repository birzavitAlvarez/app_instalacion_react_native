import axios from 'axios';

const API_URL = 'https://phuyu-iot.com/NESTLE-API-TECNICOS/api/v1/instalaciones';
const UPDATE_GESTION_URL = 'https://phuyu-iot.com/NESTLE-API-TECNICOS/api/v1/logistica/appTecnicoUpdateOrRegisterGestionAndProduction';

export const postInstalacionNevera = async (data) => {
  try {
    const response = await axios.post(API_URL, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateGestionAndProduction = async (data) => {
  try {
    console.log('URL de actualización:', UPDATE_GESTION_URL);
    console.log('Datos enviados:', JSON.stringify(data, null, 2));
    
    const response = await axios.post(UPDATE_GESTION_URL, data, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Respuesta completa:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    // Crear un objeto de respuesta de error para manejar mejor en el componente
    const errorResponse = {
      status: 0,
      msg: error.response?.data?.msg || `Error ${error.response?.status || 500}: ${error.message || 'Error desconocido'}`
    };
    
    // Solo mostrar en consola si es un error NO esperado (no 400)
    if (error.response?.status !== 400) {
      console.error('Error en updateGestionAndProduction:', error);
      console.error('Detalles del error:', error.response ? JSON.stringify(error.response.data, null, 2) : 'No hay detalles adicionales');
      console.error('Status:', error.response ? error.response.status : 'No hay status');
    }
    
    return errorResponse; // Devolver un objeto de error en lugar de lanzar la excepción
  }
};
