import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import * as FileSystem from 'react-native-fs';
import { Image } from 'react-native-compressor';

/**
 * Devuelve tamaño en bytes de un base64
 */
const base64Size = (b64) => {
  const pure = b64.replace(/^data:\w+\/[a-zA-Z+.-]+;base64,/, '');
  const padding = (pure.endsWith('==') ? 2 : pure.endsWith('=') ? 1 : 0);
  return (pure.length * 3) / 4 - padding;
};

/**
 * Comprime imagen iterativamente hasta que sea menor o igual a 30 KB
 * Siempre convierte a formato JPEG
 */
async function compressImageTo30KB(uri) {
  try {
    console.log('📏 Iniciando compresión de imagen a 30 KB...');
    
    const targetSize = 30 * 1024; // 30 KB
    let currentQuality = 1.0; // Comenzar con máxima calidad (0-1)
    let currentWidth = 1024; // Ancho inicial
    let currentHeight = 1024; // Alto inicial
    let currentUri = uri;
    let attempts = 0;
    const maxAttempts = 15;

    while (attempts < maxAttempts) {
      attempts++;
      
      try {
        // Comprimir imagen con react-native-compressor
        const compressedUri = await Image.compress(currentUri, {
          compressionMethod: 'manual',
          maxWidth: currentWidth,
          maxHeight: currentHeight,
          quality: currentQuality,
          input: 'uri',
          output: 'jpg', // Siempre convertir a JPG
          returnableOutputType: 'uri',
          disablePngTransparency: true, // Convertir transparencias a blanco
        });

        // Obtener tamaño del archivo
        const filePath = compressedUri.replace('file://', '');
        const stats = await FileSystem.stat(filePath);
        const fileSize = parseInt(stats.size, 10);

        console.log(
          `🔄 Intento ${attempts}/${maxAttempts}: ` +
          `${(fileSize / 1024).toFixed(2)} KB ` +
          `(calidad: ${currentQuality.toFixed(2)}, ` +
          `dimensiones: ${currentWidth}x${currentHeight})`
        );

        // Si alcanzamos el objetivo, retornar
        if (fileSize <= targetSize) {
          console.log(`✅ Objetivo alcanzado: ${(fileSize / 1024).toFixed(2)} KB`);
          return compressedUri;
        }

        // Estrategia de ajuste progresivo
        if (currentQuality > 0.5) {
          // Fase 1: Reducir calidad moderadamente
          currentQuality -= 0.1;
        } else if (currentQuality > 0.3) {
          // Fase 2: Reducir calidad y dimensiones
          currentQuality -= 0.05;
          currentWidth = Math.floor(currentWidth * 0.9);
          currentHeight = Math.floor(currentHeight * 0.9);
        } else {
          // Fase 3: Reducción agresiva
          currentQuality = Math.max(0.1, currentQuality - 0.05);
          currentWidth = Math.floor(currentWidth * 0.8);
          currentHeight = Math.floor(currentHeight * 0.8);
        }

        // Límites mínimos
        currentQuality = Math.max(0.1, currentQuality);
        currentWidth = Math.max(200, currentWidth);
        currentHeight = Math.max(200, currentHeight);

        currentUri = compressedUri;

      } catch (compressionError) {
        console.error(`❌ Error en intento ${attempts}:`, compressionError);
        throw compressionError;
      }
    }

    console.warn(`⚠️ No se alcanzó el objetivo de 30 KB después de ${maxAttempts} intentos`);
    return currentUri; // Retornar la última versión comprimida
  } catch (error) {
    console.error('❌ Error comprimiendo imagen:', error);
    throw error;
  }
}

/**
 * Abre la galería y retorna imagen comprimida a 30 KB en formato JPEG
 */
export async function pickFromGalleryCompressed() {
  try {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      selectionLimit: 1,
    });

    if (result.didCancel) return null;
    if (result.errorCode) throw new Error(result.errorMessage || 'Error al abrir galería');

    const asset = result.assets?.[0];
    if (!asset || !asset.uri) throw new Error('No se pudo obtener la imagen');

    console.log('📸 Imagen seleccionada de galería:', asset.uri);
    
    // Comprimir imagen a 30 KB en formato JPEG
    const compressedUri = await compressImageTo30KB(asset.uri);
    
    // Convertir a base64
    const base64 = await FileSystem.readFile(compressedUri, 'base64');
    const base64WithHeader = `data:image/jpeg;base64,${base64}`;
    
    const size = base64Size(base64WithHeader);
    
    console.log(`✅ Imagen comprimida: ${(size / 1024).toFixed(2)} KB`);

    return {
      base64: base64WithHeader,
      bytes: size,
      uri: compressedUri,
    };
  } catch (error) {
    console.error('Error en pickFromGalleryCompressed:', error);
    throw error;
  }
}

/**
 * Abre la cámara y retorna foto comprimida a 30 KB en formato JPEG
 */
export async function takePhotoCompressed() {
  try {
    const result = await launchCamera({
      mediaType: 'photo',
      saveToPhotos: false,
    });

    if (result.didCancel) return null;
    if (result.errorCode) throw new Error(result.errorMessage || 'Error al abrir cámara');

    const asset = result.assets?.[0];
    if (!asset || !asset.uri) throw new Error('No se pudo capturar la imagen');

    console.log('📸 Foto capturada:', asset.uri);
    
    // Comprimir imagen a 30 KB en formato JPEG
    const compressedUri = await compressImageTo30KB(asset.uri);
    
    // Convertir a base64
    const base64 = await FileSystem.readFile(compressedUri, 'base64');
    const base64WithHeader = `data:image/jpeg;base64,${base64}`;
    
    const size = base64Size(base64WithHeader);
    
    console.log(`✅ Foto comprimida: ${(size / 1024).toFixed(2)} KB`);

    return {
      base64: base64WithHeader,
      bytes: size,
      uri: compressedUri,
    };
  } catch (error) {
    console.error('Error en takePhotoCompressed:', error);
    throw error;
  }
}

/**
 * Normaliza Base64 desde backend
 */
export function normalizeBase64FromBackend(value) {
  if (!value) return null;
  if (value.startsWith('data:')) return value;
  return `data:image/jpeg;base64,${value}`;
}

/**
 * Convierte una imagen URI a Base64 comprimida a 30 KB en formato JPEG
 */
export async function convertImageToBase64(uri) {
  try {
    console.log('🔄 Convirtiendo imagen a Base64 comprimida:', uri);
    
    // Comprimir imagen a 30 KB en formato JPEG
    const compressedUri = await compressImageTo30KB(uri);
    
    // Convertir a base64
    const base64 = await FileSystem.readFile(compressedUri, 'base64');
    const base64WithHeader = `data:image/jpeg;base64,${base64}`;
    
    const size = base64Size(base64WithHeader);
    console.log(`✅ Imagen convertida: ${(size / 1024).toFixed(2)} KB`);
    
    return base64WithHeader;
  } catch (error) {
    console.error('Error convirtiendo imagen a Base64:', error);
    throw error;
  }
}
