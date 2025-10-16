import { Platform, PermissionsAndroid, Alert } from 'react-native';

/**
 * Solicita permisos de cámara en Android
 * En iOS los permisos se manejan automáticamente al usar la cámara
 */
export const requestCameraPermission = async () => {
  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Permiso de Cámara',
          message: 'La aplicación necesita acceso a tu cámara para tomar fotos de la firma',
          buttonNeutral: 'Preguntar después',
          buttonNegative: 'Cancelar',
          buttonPositive: 'Aceptar',
        }
      );

      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('Permiso de cámara concedido');
        return true;
      } else {
        console.log('Permiso de cámara denegado');
        Alert.alert(
          'Permiso denegado',
          'Necesitas habilitar el permiso de cámara en la configuración para usar esta función'
        );
        return false;
      }
    } catch (err) {
      console.warn('Error al solicitar permiso de cámara:', err);
      return false;
    }
  }
  // En iOS, retornar true (se maneja automáticamente)
  return true;
};

/**
 * Solicita permisos de galería/almacenamiento en Android
 * En iOS los permisos se manejan automáticamente al usar la galería
 */
export const requestGalleryPermission = async () => {
  if (Platform.OS === 'android') {
    try {
      // Para Android 13+ (API 33+) usar READ_MEDIA_IMAGES
      // Para versiones anteriores usar READ_EXTERNAL_STORAGE
      const androidVersion = Platform.Version;
      
      let permission;
      let permissionName;
      
      if (androidVersion >= 33) {
        permission = PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES;
        permissionName = 'READ_MEDIA_IMAGES';
      } else {
        permission = PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;
        permissionName = 'READ_EXTERNAL_STORAGE';
      }

      const granted = await PermissionsAndroid.request(
        permission,
        {
          title: 'Permiso de Galería',
          message: 'La aplicación necesita acceso a tus fotos para seleccionar una imagen de la firma',
          buttonNeutral: 'Preguntar después',
          buttonNegative: 'Cancelar',
          buttonPositive: 'Aceptar',
        }
      );

      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log(`Permiso de galería (${permissionName}) concedido`);
        return true;
      } else {
        console.log(`Permiso de galería (${permissionName}) denegado`);
        Alert.alert(
          'Permiso denegado',
          'Necesitas habilitar el permiso de galería en la configuración para usar esta función'
        );
        return false;
      }
    } catch (err) {
      console.warn('Error al solicitar permiso de galería:', err);
      return false;
    }
  }
  // En iOS, retornar true (se maneja automáticamente)
  return true;
};

/**
 * Verifica si el permiso de cámara está concedido
 */
export const checkCameraPermission = async () => {
  if (Platform.OS === 'android') {
    try {
      const result = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.CAMERA
      );
      return result;
    } catch (err) {
      console.warn('Error al verificar permiso de cámara:', err);
      return false;
    }
  }
  return true;
};

/**
 * Verifica si el permiso de galería está concedido
 */
export const checkGalleryPermission = async () => {
  if (Platform.OS === 'android') {
    try {
      const androidVersion = Platform.Version;
      
      let permission;
      if (androidVersion >= 33) {
        permission = PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES;
      } else {
        permission = PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;
      }

      const result = await PermissionsAndroid.check(permission);
      return result;
    } catch (err) {
      console.warn('Error al verificar permiso de galería:', err);
      return false;
    }
  }
  return true;
};
