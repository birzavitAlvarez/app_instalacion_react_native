import { USER_ENDPOINTS } from '../config/api';
import RNFS from 'react-native-fs';

/**
 * Obtener información del usuario
 * @param {string} idUsuario - ID del usuario
 * @param {string} token - Token de autenticación
 * @returns {Promise<Object>} Datos del usuario
 */
export const getUsuario = async (idUsuario, token) => {
    try {
        const url = USER_ENDPOINTS.GET_USUARIO(idUsuario);
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                // 'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Error al obtener usuario: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error en getUsuario:', error);
        throw error;
    }
};

/**
 * Actualizar información del usuario
 * @param {string} idUsuario - ID del usuario
 * @param {Object} usuarioData - Datos del usuario a actualizar
 * @param {string} token - Token de autenticación
 * @returns {Promise<Object>} Usuario actualizado
 */
export const updateUsuario = async (idUsuario, usuarioData, token) => {
    try {
        const response = await fetch(USER_ENDPOINTS.UPDATE_USUARIO(idUsuario), {
            method: 'PUT',
            headers: {
                // 'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(usuarioData),
        });

        const responseText = await response.text();

        if (!response.ok) {
            throw new Error(`Error al actualizar usuario: ${response.status} - ${responseText}`);
        }

        const data = JSON.parse(responseText);
        return data;
    } catch (error) {
        console.error('Error en updateUsuario:', error);
        throw error;
    }
};

/**
 * Subir firma del usuario
 * @param {string} idUsuario - ID del usuario
 * @param {string} fileUri - URI del archivo JPG (file://)
 * @param {string} token - Token de autenticación
 * @returns {Promise<Object>} Respuesta del servidor
 */
export const uploadFirma = async (idUsuario, fileUri, token) => {
    try {
        const fileName = `firma_${idUsuario}.jpg`;
        const url = USER_ENDPOINTS.UPLOAD_FIRMA(idUsuario);
        
        if (!fileUri || !fileUri.startsWith('file://')) {
            throw new Error('URI de archivo inválida: ' + fileUri);
        }
        
        // Copiar el archivo temporal a una ubicación permanente
        const tempPath = fileUri.replace('file://', '');
        const permanentPath = `${RNFS.CachesDirectoryPath}/${fileName}`;
        
        await RNFS.copyFile(tempPath, permanentPath);
        
        // Crear FormData con el archivo permanente
        const formData = new FormData();
        formData.append('file', {
            uri: `file://${permanentPath}`,
            type: 'image/jpeg',
            name: fileName,
        });

        const uploadResponse = await fetch(url, {
            method: 'POST',
            body: formData,
        });

        const responseText = await uploadResponse.text();

        if (!uploadResponse.ok) {
            throw new Error(`Error al subir firma: ${uploadResponse.status} - ${responseText}`);
        }

        const data = JSON.parse(responseText);
        return data;
    } catch (error) {
        console.error('Error en uploadFirma:', error);
        throw error;
    }
};
