import React from 'react';
import { AuthProvider } from './src/context/AuthContext';
import RootNavigator from './src/navigations/RootNavigator';
import { navigationRef } from './src/services/NavigationService';
import { Provider as PaperProvider, DefaultTheme, DarkTheme } from 'react-native-paper';
import { useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';


export default function App() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? DarkTheme : DefaultTheme;
  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <NavigationContainer ref={navigationRef}>
          <AuthProvider>
            <RootNavigator />
          </AuthProvider>
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
