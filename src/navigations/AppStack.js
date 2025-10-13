import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import CustomHeader from '../components/CustomHeader';
import UserScreen from '../screens/UserScreeen';
import InstalacionScreen from '../screens/InstalacionScreen';
import NuevaInstalacionScreen from '../screens/NuevaInstalacionScreen';
import NuevaInstalacionFallidaScreen from '../screens/NuevaInstalacionFallidaScreen';
import MapaScreen from '../screens/MapaScreen';
const Stack = createNativeStackNavigator();

const AppStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        header: () => <CustomHeader />,
        animation: 'none',
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name='User' component={UserScreen} />
      <Stack.Screen name='Instalacion' component={InstalacionScreen} />
      <Stack.Screen name='NuevaInstalacion' component={NuevaInstalacionScreen} />
      <Stack.Screen name='NuevaInstalacionFallida' component={NuevaInstalacionFallidaScreen} />
      <Stack.Screen name='Mapa' component={MapaScreen} />
    </Stack.Navigator>
  );
};

export default AppStack;
