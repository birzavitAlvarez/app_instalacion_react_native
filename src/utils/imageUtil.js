import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import * as FileSystem from 'react-native-fs';
import ImageResizer from '@bam.tech/react-native-image-resizer';

const BYTES_LIMIT = 30 * 1024; // 30 KB

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
    
    let quality = 100; // Comenzar con máxima calidad
    let width = 1024; // Ancho inicial
    let height = 1024; // Alto inicial
    let compressedUri = uri;
    let attempt = 0;
    const maxAttempts = 15; // Máximo 15 intentos

    while (attempt < maxAttempts) {
      attempt++;
      
      // Comprimir imagen con los parámetros actuales
      const resized = await ImageResizer.createResizedImage(
        compressedUri,
        width,
        height,
        'JPEG', // Siempre convertir a JPEG
        quality,
        0, // rotación
        undefined, // outputPath (auto)
        false, // keepMeta
        { mode: 'contain', onlyScaleDown: true }
      );

      compressedUri = resized.uri;
      
      // Leer el tamaño del archivo
      const fileInfo = await FileSystem.stat(compressedUri);
      const fileSize = fileInfo.size;
      
      console.log(`🔄 Intento ${attempt}: ${(fileSize / 1024).toFixed(2)} KB (quality: ${quality}, size: ${width}x${height})`);

      // Si el tamaño es menor o igual a 30 KB, terminar
      if (fileSize <= BYTES_LIMIT) {
        console.log(`✅ Compresión exitosa: ${(fileSize / 1024).toFixed(2)} KB`);
        return compressedUri;
      }

      // Ajustar parámetros para siguiente intento
      if (quality > 50) {
        // Primero reducir calidad
        quality -= 10;
      } else if (width > 400 || height > 400) {
        // Si la calidad ya es baja, reducir dimensiones
        width = Math.floor(width * 0.8);
        height = Math.floor(height * 0.8);
        quality = 70; // Resetear calidad un poco
      } else {
        // Última opción: reducir calidad agresivamente
        quality = Math.max(10, quality - 10);
      }
    }

    console.warn('⚠️ No se pudo reducir la imagen a 30 KB después de 15 intentos');
    return compressedUri; // Retornar la última versión comprimida
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
