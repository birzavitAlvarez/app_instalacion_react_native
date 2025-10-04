import React, { useContext } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthContext } from '../context/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import AppStack from './AppStack';
import { ActivityIndicator, View } from 'react-native';
import SelectRoleScreen from '../home/SelectRoleScreen';


const Stack = createNativeStackNavigator();

const RootNavigator = () => {
  const { userToken, isLoading, userInfo, selectedRole } = useContext(AuthContext);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#1E187B" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!userToken ? (
        <Stack.Screen name="Login" component={LoginScreen} />
      ) : !selectedRole && userInfo?.roles?.length > 1 ? (
        <Stack.Screen name="SelectRole" component={SelectRoleScreen} />
      ) : (
        <Stack.Screen name="App" component={AppStack} />
      )}
    </Stack.Navigator>
  );
};

export default RootNavigator;
