import React, { createContext, useState, useEffect, useCallback } from 'react';
import Geolocation from '@react-native-community/geolocation';
import { PermissionsAndroid, Platform, AppState } from 'react-native';

export const LocationContext = createContext();

export const LocationProvider = ({ children }) => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [watchId, setWatchId] = useState(null);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [permissionChecked, setPermissionChecked] = useState(false);

  // Solicitar permisos de ubicación
  const requestPermission = useCallback(async () => {
    if (permissionChecked) {
      return permissionGranted;
    }
    
    if (Platform.OS === 'android') {
      try {
        // Verificar que el contexto de Android esté disponible
        if (!PermissionsAndroid) {
          console.warn('PermissionsAndroid no disponible');
          setPermissionChecked(true);
          setPermissionGranted(false);
          return false;
        }
        
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Permiso de Ubicación',
            message: 'La aplicación necesita acceso a tu ubicación GPS',
            buttonPositive: 'Aceptar',
            buttonNegative: 'Cancelar',
          }
        );
        
        const hasPermission = granted === PermissionsAndroid.RESULTS.GRANTED;
        
        if (hasPermission) {
          console.log('Permiso de ubicación concedido');
        } else {
          console.log('Permiso de ubicación denegado');
          setError('Permiso de ubicación denegado');
        }
        
        setPermissionChecked(true);
        setPermissionGranted(hasPermission);
        setIsLoading(false);
        return hasPermission;
      } catch (err) {
        console.error('Error solicitando permiso:', err);
        setError('Error al solicitar permisos');
        setPermissionChecked(true);
        setPermissionGranted(false);
        setIsLoading(false);
        return false;
      }
    }
    
    // iOS maneja permisos automáticamente
    setPermissionChecked(true);
    setPermissionGranted(true);
    return true;
  }, [permissionChecked, permissionGranted]);

  // Obtener ubicación actual de forma inmediata
  const getCurrentLocation = useCallback(async () => {
    // Solicitar permisos si aún no se han verificado
    if (!permissionChecked) {
      const hasPermission = await requestPermission();
      if (!hasPermission) {
        throw new Error('Permiso de ubicación denegado');
      }
    } else if (!permissionGranted) {
      throw new Error('Permiso de ubicación denegado');
    }
    
    setIsLoading(true);
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        (position) => {
          const loc = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          };
          setLocation(loc);
          setError(null);
          setIsLoading(false);
          resolve(loc);
        },
        (err) => {
          console.error('Error obteniendo ubicación:', err);
          setError(err.message);
          setIsLoading(false);
          reject(err);
        },
        { 
          enableHighAccuracy: true, 
          timeout: 60000,
          maximumAge: 1000
        }
      );
    });
  }, [permissionChecked, permissionGranted, requestPermission]);

  // Iniciar tracking de ubicación
  const startTracking = useCallback(() => {
    const id = Geolocation.watchPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
        setError(null);
        setIsLoading(false);
      },
      (err) => {
        console.error('Error en watchPosition:', err);
        setError(err.message);
        setIsLoading(false);
      },
      {
        enableHighAccuracy: true,
        distanceFilter: 10,
        interval: 10000,
        timeout: 60000,
        maximumAge: 1000,
      }
    );
    setWatchId(id);
  }, []);

  // Detener tracking
  const stopTracking = useCallback(() => {
    if (watchId !== null) {
      Geolocation.clearWatch(watchId);
      setWatchId(null);
    }
  }, [watchId]);

  // Limpiar tracking al desmontar
  useEffect(() => {
    return () => {
      stopTracking();
    };
  }, [stopTracking]);

  // Manejar cambios de estado de la app
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active' && watchId === null) {
        startTracking();
      } else if (nextAppState === 'background') {
        stopTracking();
      }
    });
    return () => subscription.remove();
  }, [startTracking, stopTracking, watchId]);

  const value = {
    location,
    latitude: location?.latitude,
    longitude: location?.longitude,
    accuracy: location?.accuracy,
    error,
    isLoading,
    getCurrentLocation,
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
};
