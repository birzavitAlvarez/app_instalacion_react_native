import React from 'react';
import {
  StatusBar,
  StyleSheet,
  useColorScheme,
  View,
  Button
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
import RootNavigator from './src/navigations/RootNavigator';
import { navigationRef } from './src/services/NavigationService';
import crashlytics from '@react-native-firebase/crashlytics';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <PaperProvider theme={DefaultTheme}>
        <NavigationContainer theme={NavigationDefaultTheme} ref={navigationRef}>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

function AppContent() {
  const safeAreaInsets = useSafeAreaInsets();

  const handleCrash = () => {
    crashlytics().crash();
  };

  return (
    <View style={[styles.container, { paddingTop: safeAreaInsets.top }]}>
      <RootNavigator />
      {/* <View style={styles.crashButtonContainer}>
        <Button title="Forzar Crash" onPress={handleCrash} color="#FF3B30" />
      </View> */}
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
