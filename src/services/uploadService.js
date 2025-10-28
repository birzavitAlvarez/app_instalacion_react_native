import axios from 'axios';
import * as FileSystem from 'react-native-fs';

const BASE_URL = 'https://phuyu-iot.com/NESTLE-API-TECNICOS/api/v1/instalaciones';


export const uploadImageToServer = async (imageUri, codNevera) => {
  try {
    console.log('📤 Subiendo imagen:', { imageUri, codNevera });
    
    // Leer la imagen y convertirla a base64
    const base64Image = await FileSystem.readFile(imageUri, 'base64');
    
    console.log('✅ Imagen convertida a base64, tamaño:', base64Image.length);
    
    // Nota: NO incluimos el prefijo "data:image/jpeg;base64," 
    // solo enviamos el string base64 puro
    
    const response = await axios.post(
      `${BASE_URL}/uploadImageInstalacionNeveraBase64`,
      {
        file: base64Image,
        cod_nevera: codNevera,
      }
    );
    
    console.log('📥 Respuesta del servidor:', response.data);
    
    // Extraer filename de la respuesta
    // La respuesta puede ser: { fileName: "..." } o { filename: "..." }
    const filename = response.data?.fileName || response.data?.filename;
    
    if (filename) {
      console.log('✅ Filename recibido:', filename);
      return filename;
    }
    
    throw new Error('No se recibió el nombre del archivo en la respuesta');
  } catch (error) {
    console.error('❌ Error subiendo imagen:', error);
    throw error;
  }
};


export const uploadMultipleImages = async (images, codNevera) => {
  try {
    const uploadPromises = images.map(async (image) => {
      if (image.uri) {
        const filename = await uploadImageToServer(image.uri, codNevera);
        return { fieldName: image.fieldName, filename };
      }
      return { fieldName: image.fieldName, filename: null };
    });
    
    const results = await Promise.all(uploadPromises);
    
    // Convertir array a objeto
    const filenames = {};
    results.forEach(result => {
      if (result.filename) {
        filenames[result.fieldName] = result.filename;
      }
    });
    
    return filenames;
  } catch (error) {
    console.error('Error subiendo múltiples imágenes:', error);
    throw error;
  }
};
