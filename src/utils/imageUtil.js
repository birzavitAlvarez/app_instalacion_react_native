import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import * as FileSystem from 'react-native-fs';

const BYTES_LIMIT = 30 * 1024;

/**
 * Devuelve tamaño en bytes de un base64
 */
const base64Size = (b64) => {
  const pure = b64.replace(/^data:\w+\/[a-zA-Z+.-]+;base64,/, '');
  const padding = (pure.endsWith('==') ? 2 : pure.endsWith('=') ? 1 : 0);
  return (pure.length * 3) / 4 - padding;
};

/**
 * Convierte URI a Base64
 */
async function uriToBase64(uri) {
  try {
    const base64 = await FileSystem.readFile(uri, 'base64');
    return `data:image/jpeg;base64,${base64}`;
  } catch (error) {
    console.error('Error converting URI to Base64:', error);
    throw error;
  }
}

/**
 * Abre la galería y retorna imagen comprimida
 */
export async function pickFromGalleryCompressed() {
  try {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      includeBase64: true,
      quality: 0.6,
      maxWidth: 800,
      maxHeight: 800,
      selectionLimit: 1,
    });

    if (result.didCancel) return null;
    if (result.errorCode) throw new Error(result.errorMessage || 'Error al abrir galería');

    const asset = result.assets?.[0];
    if (!asset) throw new Error('No se pudo obtener la imagen');

    let base64 = asset.base64;
    const base64WithHeader = base64?.startsWith('data:')
      ? base64
      : `data:image/jpeg;base64,${base64}`;

    const size = base64Size(base64WithHeader);

    return {
      base64: base64WithHeader,
      bytes: size,
      uri: asset.uri,
    };
  } catch (error) {
    console.error('Error en pickFromGalleryCompressed:', error);
    throw error;
  }
}

/**
 * Abre la cámara y retorna foto comprimida
 */
export async function takePhotoCompressed() {
  try {
    const result = await launchCamera({
      mediaType: 'photo',
      includeBase64: true,
      quality: 0.6,
      maxWidth: 800,
      maxHeight: 800,
      saveToPhotos: false,
    });

    if (result.didCancel) return null;
    if (result.errorCode) throw new Error(result.errorMessage || 'Error al abrir cámara');

    const asset = result.assets?.[0];
    if (!asset) throw new Error('No se pudo capturar la imagen');

    let base64 = asset.base64;
    const base64WithHeader = base64?.startsWith('data:')
      ? base64
      : `data:image/jpeg;base64,${base64}`;

    const size = base64Size(base64WithHeader);

    return {
      base64: base64WithHeader,
      bytes: size,
      uri: asset.uri,
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