import React, { createContext, useState, useEffect, useCallback, useRef } from 'react';
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
  const [isGPSEnabled, setIsGPSEnabled] = useState(true);
  const gpsCheckIntervalRef = useRef(null);

  // Solicitar permisos de ubicación
  const requestPermission = useCallback(async () => {
    if (permissionChecked) {
      return permissionGranted;
    }
    
    if (Platform.OS === 'android') {
      try {
        if (!PermissionsAndroid) {
          console.warn('PermissionsAndroid no disponible');
          setPermissionChecked(true);
          setPermissionGranted(false);
          return false;
        }
        
        // Solicitar ambos permisos (FINE y COARSE)
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
        ]);
        
        const hasPermission = 
          granted['android.permission.ACCESS_FINE_LOCATION'] === PermissionsAndroid.RESULTS.GRANTED ||
          granted['android.permission.ACCESS_COARSE_LOCATION'] === PermissionsAndroid.RESULTS.GRANTED;
        
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
    
    setPermissionChecked(true);
    setPermissionGranted(true);
    return true;
  }, [permissionChecked, permissionGranted]);

  // Obtener ubicación actual con reintentos
  const getCurrentLocation = useCallback(async () => {
    if (!permissionChecked) {
      const hasPermission = await requestPermission();
      if (!hasPermission) {
        throw new Error('Permiso de ubicación denegado');
      }
    } else if (!permissionGranted) {
      throw new Error('Permiso de ubicación denegado');
    }
    
    setIsLoading(true);
    
    // Primero intentar con baja precisión (más rápido)
    return new Promise((resolve, reject) => {
      let resolved = false;
      
      // Intento 1: Baja precisión, timeout corto
      Geolocation.getCurrentPosition(
        (position) => {
          if (!resolved) {
            resolved = true;
            const loc = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
            };
            setLocation(loc);
            setError(null);
            setIsGPSEnabled(true);
            setIsLoading(false);
            resolve(loc);
          }
        },
        (err) => {
          console.log('Intento con baja precisión falló, intentando alta precisión...', err);
          
          // Verificar si el error es por GPS desactivado
          if (err.code === 2) {
            setIsGPSEnabled(false);
          }
          
          // Intento 2: Alta precisión, timeout más largo
          Geolocation.getCurrentPosition(
            (position) => {
              if (!resolved) {
                resolved = true;
                const loc = {
                  latitude: position.coords.latitude,
                  longitude: position.coords.longitude,
                  accuracy: position.coords.accuracy,
                };
                setLocation(loc);
                setError(null);
                setIsGPSEnabled(true);
                setIsLoading(false);
                resolve(loc);
              }
            },
            (err2) => {
              if (!resolved) {
                resolved = true;
                console.error('Error obteniendo ubicación:', err2);
                
                // Verificar si el error es por GPS desactivado
                if (err2.code === 2) {
                  setIsGPSEnabled(false);
                  setError('GPS desactivado. Por favor, activa el GPS en la configuración de tu dispositivo.');
                } else {
                  setError(err2.message);
                }
                
                setIsLoading(false);
                reject(err2);
              }
            },
            { 
              enableHighAccuracy: true, 
              timeout: 30000,
              maximumAge: 10000,
              distanceFilter: 0,
              forceRequestLocation: true,
              showLocationDialog: true,
            }
          );
        },
        { 
          enableHighAccuracy: false, 
          timeout: 10000,
          maximumAge: 60000,
        }
      );
    });
  }, [permissionChecked, permissionGranted, requestPermission]);

  // Verificar si el GPS está habilitado
  const checkGPSStatus = useCallback(async () => {
    try {
      await new Promise((resolve, reject) => {
        Geolocation.getCurrentPosition(
          resolve,
          reject,
          { 
            enableHighAccuracy: true, 
            timeout: 5000,
            maximumAge: 0,
          }
        );
      });
      setIsGPSEnabled(true);
      return true;
    } catch (err) {
      console.log('Error verificando GPS:', err);
      if (err.code === 2) {
        setIsGPSEnabled(false);
        return false;
      }
      setIsGPSEnabled(true);
      return true;
    }
  }, []);

  // Iniciar monitoreo continuo del GPS
  const startGPSMonitoring = useCallback((callback) => {
    // Limpiar intervalo anterior si existe
    if (gpsCheckIntervalRef.current) {
      clearInterval(gpsCheckIntervalRef.current);
    }

    // Verificar GPS cada 5 segundos
    const interval = setInterval(async () => {
      const isEnabled = await checkGPSStatus();
      if (callback) {
        callback(isEnabled);
      }
    }, 5000);

    gpsCheckIntervalRef.current = interval;
    return interval;
  }, [checkGPSStatus]);

  // Detener monitoreo del GPS
  const stopGPSMonitoring = useCallback(() => {
    if (gpsCheckIntervalRef.current) {
      clearInterval(gpsCheckIntervalRef.current);
      gpsCheckIntervalRef.current = null;
    }
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
        timeout: 30000,
        maximumAge: 10000,
        forceRequestLocation: true,
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

  useEffect(() => {
    return () => {
      stopTracking();
    };
  }, [stopTracking]);

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
    isGPSEnabled,
    checkGPSStatus,
    startGPSMonitoring,
    stopGPSMonitoring,
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
};
