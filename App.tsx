import React from 'react';
import { NewAppScreen } from '@react-native/new-app-screen';
import { 
  StatusBar, 
  StyleSheet, 
  useColorScheme, 
  View, 
  Button 
} from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import crashlytics from '@react-native-firebase/crashlytics';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <AppContent />
    </SafeAreaProvider>
  );
}

function AppContent() {
  const safeAreaInsets = useSafeAreaInsets();

  const handleCrash = () => {
    // 🔥 Esto forzará un crash nativo intencional
    crashlytics().crash();
  };

  return (
    <View style={styles.container}>
      {/* <NewAppScreen
        templateFileName="App.tsx"
        safeAreaInsets={safeAreaInsets}
      /> */}

      {/* Botón para forzar el crash */}
      <View style={styles.buttonContainer}>
        <Button title="Forzar Crash" onPress={handleCrash} color="#FF3B30" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  buttonContainer: {
    margin: 20,
  },
});

export default App;