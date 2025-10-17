import React from 'react';
import {
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets
} from 'react-native-safe-area-context';
import {
  Provider as PaperProvider,
  DefaultTheme,
} from 'react-native-paper';
import { NavigationContainer, DefaultTheme as NavigationDefaultTheme } from '@react-navigation/native';
import { AuthProvider } from './src/context/AuthContext';
import { LocationProvider } from './src/context/LocationContext';
import RootNavigator from './src/navigations/RootNavigator';
import { navigationRef } from './src/services/NavigationService';
import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';

const toastConfig = {
  success: (props: any) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: '#27ae60', backgroundColor: '#fff' }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 15,
        fontWeight: '600',
        color: '#000',
      }}
      text2Style={{
        fontSize: 13,
        color: '#666',
      }}
    />
  ),
  error: (props: any) => (
    <ErrorToast
      {...props}
      style={{ borderLeftColor: '#e74c3c', backgroundColor: '#fff' }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 15,
        fontWeight: '600',
        color: '#000',
      }}
      text2Style={{
        fontSize: 13,
        color: '#666',
      }}
    />
  ),
};

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <PaperProvider theme={DefaultTheme}>
        <NavigationContainer theme={NavigationDefaultTheme} ref={navigationRef}>
          <AuthProvider>
            <LocationProvider>
              <AppContent />
            </LocationProvider>
          </AuthProvider>
        </NavigationContainer>
      </PaperProvider>
      <Toast config={toastConfig} />
    </SafeAreaProvider>
  );
}

function AppContent() {
  const safeAreaInsets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: safeAreaInsets.top }]}>
      <RootNavigator />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff', 
  },
  crashButtonContainer: {
    position: 'absolute',
    bottom: 30,
    right: 20,
  },
});
