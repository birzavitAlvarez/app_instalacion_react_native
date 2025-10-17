import React, { createContext, useState, useEffect, useCallback } from 'react';
import Geolocation from '@react-native-community/geolocation';
import { PermissionsAndroid, Platform, AppState, Alert } from 'react-native';

export const LocationContext = createContext();

export const LocationProvider = ({ children }) => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [watchId, setWatchId] = useState(null);

  // Solicitar permisos de ubicación
  const requestPermission = useCallback(async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Permiso de Ubicación',
            message: 'La aplicación necesita acceso a tu ubicación GPS',
            buttonPositive: 'Aceptar',
            buttonNegative: 'Cancelar',
          }
        );
        
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          return true;
        } else {
          setError('Permiso de ubicación denegado');
          setIsLoading(false);
          Alert.alert(
            'Permiso Requerido',
            'Se necesita acceso a la ubicación para usar esta función. Por favor, habilita el permiso en la configuración de la app.'
          );
          return false;
        }
      } catch (err) {
        console.error('Error solicitando permiso:', err);
        setError('Error al solicitar permisos');
        setIsLoading(false);
        return false;
      }
    }
    return true; // iOS maneja permisos automáticamente
  }, []);

  // Obtener ubicación actual de forma inmediata
  const getCurrentLocation = useCallback(() => {
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
          timeout: 20000,
          maximumAge: 1000
        }
      );
    });
  }, []);

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
        timeout: 20000,
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

  // Inicializar al montar
  useEffect(() => {
    const init = async () => {
      const hasPermission = await requestPermission();
      if (hasPermission) {
        // Primero obtener ubicación inmediata
        try {
          await getCurrentLocation();
          // Luego iniciar tracking
          startTracking();
        } catch (err) {
          console.error('Error obteniendo ubicación inicial:', err);
          // Intentar tracking aunque falle la primera
          startTracking();
        }
      } else {
        setError('Permiso de ubicación denegado');
        setIsLoading(false);
        Alert.alert(
          'Permiso Requerido',
          'Se necesita acceso a la ubicación para usar esta función'
        );
      }
    };
    init();
    
    return () => {
      stopTracking();
    };
  }, []); // Solo ejecutar una vez al montar

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
