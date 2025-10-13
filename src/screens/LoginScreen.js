import React, { useContext, useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, Switch, Image, StatusBar } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LogoEntel from '../../assets/images/logoEntel.png'
// import AntDesign from '@expo/vector-icons/AntDesign';
// import Entypo from '@expo/vector-icons/Entypo';
// import MaterialIcons from '@expo/vector-icons/MaterialIcons';
// import ForgotPasswordModal from '../components/ForgotPasswordModal';
import Icon from 'react-native-vector-icons/MaterialIcons';


const LoginScreen = () => {
  const { signIn } = useContext(AuthContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const loadCredentials = async () => {
      try {
        const storedUsername = await AsyncStorage.getItem('username');
        const storedPassword = await AsyncStorage.getItem('password');
        const storedRememberMe = await AsyncStorage.getItem('rememberMe');

        if (storedRememberMe === 'true') {
          setUsername(storedUsername);
          setPassword(storedPassword);
          setRememberMe(true);
        }
      } catch (error) {
        console.error("Error loading stored credentials", error);
      }
    };

    loadCredentials();
  }, []);

  const handleLogin = async () => {
    signIn({ username, password });

    if (rememberMe) {
      await AsyncStorage.setItem('username', username);
      await AsyncStorage.setItem('password', password);
      await AsyncStorage.setItem('rememberMe', 'true');
    } else {
      await AsyncStorage.removeItem('username');
      await AsyncStorage.removeItem('password');
      await AsyncStorage.removeItem('rememberMe');
    }
  };

  return (
    <>
      <StatusBar
        backgroundColor="#1E187B"
        barStyle="light-content"
      />
      <View style={styles.container}>
        <View style={{ alignItems: 'center', justifyContent: 'center', backgroundColor: "#1C1D78" }}>
          <Image
            source={LogoEntel}
          />
        </View>
        <View style={{ backgroundColor: "#1C1D78" }}>
          <View style={{ alignItems: 'center', marginVertical: 60, }}>
            <Text style={{ fontSize: 24, fontWeight: 900, color: "#fff", }}>Bienvenido</Text>
            <Text style={{ color: "#dbdbdbff" }}>Entel Perú Siente el verdadero Power</Text>
          </View>
          <View style={styles.passwordContainer}>
            {/* <MaterialIcons name="email" size={24} color="#d6d4d4ff" /> */}
            <Icon name="lock" size={30} color="#000" />
            <TextInput
              placeholder="Correo"
              placeholderTextColor={"#fff"}
              style={styles.passwordInput}
              value={username}
              onChangeText={setUsername}
            />
          </View>
          <View style={styles.passwordContainer}>
            {/* <Entypo name="lock" size={24} color="#d6d4d4ff" /> */}
            <TextInput
              placeholder="Contraseña"
              placeholderTextColor={"#ffff"}
              style={styles.passwordInput}
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Text style={styles.toggle}>
                {showPassword ? <Text>SI</Text> : <Text>No</Text>}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.rememberMeContainer}>
            <Switch
              value={rememberMe}
              onValueChange={setRememberMe}
              trackColor={{ false: "#767577", true: "#81b0ff" }}
              thumbColor={rememberMe ? "#fff" : "#EFEFEF"}
              ios_backgroundColor="#3e3e3e"
            />
            <Text style={styles.rememberMeText}>Recordar contraseña</Text>
          </View>

          <View style={{ marginHorizontal: 40, }}>
            <TouchableOpacity style={{ alignItems: 'center', backgroundColor: "#fff", paddingVertical: 13, borderRadius: 100, }} onPress={handleLogin}>
              <Text style={{ color: "#1C1D78", fontWeight: 900 }}>
                Iniciar Sesion
              </Text>
            </TouchableOpacity>
            {/* <TouchableOpacity style={styles.forgotBtn} onPress={() => setModalVisible(true)}>
              <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
            </TouchableOpacity> */}
          </View>
        </View>
      </View>
      {/* <ForgotPasswordModal visible={modalVisible} onClose={() => setModalVisible(false)} /> */}
    </>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', backgroundColor: "#1e187b" },
  title: { fontSize: 24, marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 15, borderRadius: 5 },
  passwordContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 100,
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 5,
    marginHorizontal: 30,
    marginBottom: 15,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 10,
    color: '#ffff',
  },
  toggle: {
    fontSize: 18,
    paddingHorizontal: 10,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 40,
    marginBottom: 15,
  },
  rememberMeText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#fff"
  },
  forgotBtn: {
    marginVertical: 14,
    alignItems: 'center',

  },
  forgotText: {
    color: '#fff',
    fontSize: 14,
  },
});

export default LoginScreen;
