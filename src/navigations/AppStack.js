import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import CustomHeader from '../components/CustomHeader';
import UserScreen from '../screens/UserScreeen';
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
    </Stack.Navigator>
  );
};

export default AppStack;
