import axios from 'axios';

const BASE_URL = 'https://phuyu-iot.com/NESTLE-VCA/api/Consultas';
const TOKEN = '$2a$10$c9JOB_7GMt.QtBgvKMPB4c.I8KgUy8TioiwJJydKJMBXXPhFwODtpqx2-z3';

export const searchNeverasByCodigo = async (code) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/search/cod-nevera/${code}/${TOKEN}/`
    );

    console.log('Neveras encontradas:', response.data);
    return response.data || [];
  } catch (error) {
    console.error('Error buscando neveras:', error);
    throw error;
  }
};

export const getDataByCodNevera = async (codNevera) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/request1/${TOKEN}`,
      null,
      {
        params: {
          _cod_nevera: codNevera
        }
      }
    );

    console.log('Datos de nevera obtenidos:', response.data);

    if (response.data.status && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'No se encontraron datos');
  } catch (error) {
    // Solo mostrar el error en consola si NO es un error 400
    // El error 400 es esperado cuando el código no existe o está incompleto
    if (error.response?.status !== 400) {
      console.error('Error obteniendo datos de nevera:', error);
    }
    throw error;
  }
};

/**
 * Buscar IMEIs por código (autocompletado)
 * Se activa cuando el código tiene >= 5 caracteres
 */
export const searchImeiByCode = async (code) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/search/imei/${code}/${TOKEN}/`
    );

    console.log('IMEIs encontrados:', response.data);
    return response.data || [];
  } catch (error) {
    console.error('Error buscando IMEIs:', error);
    throw error;
  }
};

/**
 * Obtener datos completos por IMEI
 * Se activa cuando el código tiene >= 10 caracteres
 */
export const getDataByImei = async (imei) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/search/imei/${imei}/${TOKEN}/`
    );

    console.log('Datos de IMEI obtenidos:', response.data);

    // La API devuelve un array, buscamos el que coincida exactamente
    if (Array.isArray(response.data) && response.data.length > 0) {
      const exactMatch = response.data.find(item => item.imei === imei);

      if (exactMatch) {
        return exactMatch;
      }

      // Si no hay coincidencia exacta pero hay resultados, devolver el primero
      return response.data[0];
    }

    // Si la respuesta está vacía o no es válida, devolver null
    return null;
  } catch (error) {
    console.error('Error obteniendo datos de IMEI:', error);
    throw error;
  }
};

/**
 * Validar el estado de la nevera para el técnico
 * Primera validación antes de verificar sincronización
 */
export const validateNeveraStatus = async (codigoNevera) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/validarNeveraStatus4Tecnico`,
      {
        params: {
          _nevera: codigoNevera
        }
      }
    );

    console.log('Estado de nevera validado:', response.data);
    return response.data;
  } catch (error) {
    // Para errores 400, solo loguear el mensaje sin el stack trace completo
    if (error.response?.status === 400) {
      const errorMessage = error.response?.data?.msg || 
                          error.response?.data?.message || 
                          'El código de nevera no existe o no es válido';
      
      console.log('⚠️ Validación de nevera:', errorMessage);
      
      // NO mostrar Toast aquí - dejamos que el componente lo maneje
      const enhancedError = new Error(errorMessage);
      enhancedError.status = 400;
      enhancedError.isValidationError = true;
      enhancedError.originalError = error;
      throw enhancedError;
    }
    
    // Para otros errores, sí mostrar el log completo
    console.error('Error validando estado de nevera:', error);
    throw error;
  }
};

/**
 * Validar sincronización del dispositivo técnico con la nevera
 * Segunda validación después de validar el estado de la nevera
 */
export const validateTechnicianSync = async (fecha, latitud, longitud, imei, tipo = 2) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/validarAppTecnicoSincronizacion`,
      {
        _fecha: fecha,
        _latitud: latitud,
        _longitud: longitud,
        _imei: imei,
        _tipo: tipo
      }
    );

    console.log('Sincronización validada:', response.data);
    return response.data;
  } catch (error) {
    // Para errores 400, solo loguear el mensaje sin el stack trace completo
    if (error.response?.status === 400) {
      const errorMessage = error.response?.data?.msg || 
                          error.response?.data?.message || 
                          'El IMEI ya está registrado o no es válido para esta operación';
      
      console.log('⚠️ Validación de sincronización:', errorMessage);
      
      const enhancedError = new Error(errorMessage);
      enhancedError.status = 400;
      enhancedError.isValidationError = true;
      enhancedError.originalError = error;
      throw enhancedError;
    }
    
    // Para otros errores, sí mostrar el log completo
    console.error('Error validando sincronización:', error);
    throw error;
  }
};


export const searchNeverasByCodigo2 = async (codigo) => {
  try {
    const response = await fetch(
      `${BASE_URL}/search/cod-nevera2-fallidas?cod_nevera=${codigo}`
    );
    const data = await response.json();

    if (data.status === 0) {
      throw new Error(data.error || "Nevera no registrada");
    }

    if (Array.isArray(data)) return data;

    if (data && typeof data === "object") return [data];

    return [];
  } catch (error) {
    throw error;
  }
};
