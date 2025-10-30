import axios from 'axios';
import * as FileSystem from 'react-native-fs';
import { Image } from 'react-native-compressor';

const BASE_URL = 'https://phuyu-iot.com/NESTLE-API-TECNICOS/api/v1/instalaciones';

/**
 * Comprime imagen a 30 KB antes de subir
 */
const compressImageTo30KB = async (uri) => {
  try {
    const targetSize = 30 * 1024; // 30 KB
    let currentQuality = 1.0;
    let currentWidth = 1024;
    let currentHeight = 1024;
    let currentUri = uri;
    let attempts = 0;
    const maxAttempts = 15;

    while (attempts < maxAttempts) {
      attempts++;
      
      const compressedUri = await Image.compress(currentUri, {
        compressionMethod: 'manual',
        maxWidth: currentWidth,
        maxHeight: currentHeight,
        quality: currentQuality,
        input: 'uri',
        output: 'jpg',
        returnableOutputType: 'uri',
        disablePngTransparency: true,
      });

      const filePath = compressedUri.replace('file://', '');
      const stats = await FileSystem.stat(filePath);
      const fileSize = parseInt(stats.size, 10);

      console.log(`🔄 Compresión intento ${attempts}/${maxAttempts}: ${(fileSize / 1024).toFixed(2)} KB`);

      if (fileSize <= targetSize) {
        console.log(`✅ Compresión exitosa: ${(fileSize / 1024).toFixed(2)} KB`);
        return compressedUri;
      }

      // Ajuste progresivo
      if (currentQuality > 0.5) {
        currentQuality -= 0.1;
      } else if (currentQuality > 0.3) {
        currentQuality -= 0.05;
        currentWidth = Math.floor(currentWidth * 0.9);
        currentHeight = Math.floor(currentHeight * 0.9);
      } else {
        currentQuality = Math.max(0.1, currentQuality - 0.05);
        currentWidth = Math.floor(currentWidth * 0.8);
        currentHeight = Math.floor(currentHeight * 0.8);
      }

      currentQuality = Math.max(0.1, currentQuality);
      currentWidth = Math.max(200, currentWidth);
      currentHeight = Math.max(200, currentHeight);

      currentUri = compressedUri;
    }

    console.warn(`⚠️ No se alcanzó 30 KB, usando última versión`);
    return currentUri;
  } catch (error) {
    console.error('❌ Error comprimiendo:', error);
    return uri; // Retornar original si falla
  }
};

export const uploadImageToServer = async (imageUri, codNevera) => {
  try {
    console.log('📤 Subiendo imagen:', { imageUri, codNevera });
    
    // 1. Comprimir imagen a 30 KB
    const compressedUri = await compressImageTo30KB(imageUri);
    console.log('✅ Imagen comprimida lista para subir');
    
    // 2. Leer la imagen comprimida y convertirla a base64
    const base64Image = await FileSystem.readFile(compressedUri, 'base64');
    
    console.log('✅ Imagen convertida a base64, tamaño:', base64Image.length, 'caracteres');
    console.log('📊 Peso estimado:', ((base64Image.length * 3) / 4 / 1024).toFixed(2), 'KB');
    
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
