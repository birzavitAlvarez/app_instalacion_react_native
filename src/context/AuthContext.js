import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../config/api';
import { parseJwt } from '../utils/jwt';
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [userToken, setUserToken] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [userInfo, setUserInfo] = useState(null);
    const [selectedRole, setSelectedRole] = useState(null);


    const signIn = async ({ username, password }) => {
        try {
            const response = await fetch(`${BASE_URL}/auth/authenticate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ dni: username, password }),
            });

            const data = await response.json();
            console.log("Respuesta del login:", data);

            if (response.ok) {
                const { token } = data;

                if (!token) {
                    throw new Error("No se recibió token desde el servidor");
                }

                await AsyncStorage.setItem('userToken', token);
                setUserToken(token);

                const userData = parseJwt(token);
                setUserInfo(userData);

                if (userData.roles?.length === 1) {
                    const onlyRole = userData.roles[0];
                    setAndStoreSelectedRole(onlyRole);
                }

            } else {
                alert('Credenciales inválidas');
            }

        } catch (error) {
            console.error('Login error:', error);
            alert('Error en el servidor');
        }
    };


    const refreshAccessToken = async () => {
        try {
            const refreshToken = await AsyncStorage.getItem('refreshToken');
            if (!refreshToken) throw new Error("No hay refresh token");

            const response = await fetch(`${BASE_URL}/auth/refresh-token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token_refresh: refreshToken }),
            });

            const data = await response.json();

            if (response.ok) {
                const { token } = data;
                await AsyncStorage.setItem('userToken', token);
                setUserToken(token);

                const userData = parseJwt(token);
                setUserInfo(userData);

                return token;
            } else {
                console.error("Error al refrescar el token:", data);
                signOut();
                return null;
            }
        } catch (error) {
            console.error("Error al refrescar token:", error);
            signOut();
            return null;
        }
    };


    const signOut = async () => {
        await AsyncStorage.removeItem('userToken');
        await AsyncStorage.removeItem('refreshToken');
        await AsyncStorage.removeItem('selectedRole');
        setUserToken(null);
        setUserInfo(null);
        setSelectedRole(null);
    };

    const isLoggedIn = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            const savedRole = await AsyncStorage.getItem('selectedRole');

            setUserToken(token);

            if (token) {
                const userData = parseJwt(token);
                setUserInfo(userData);

                if (!savedRole && userData.roles?.length === 1) {
                    const onlyRole = userData.roles[0];
                    setAndStoreSelectedRole(onlyRole);
                }
            }

            if (savedRole) {
                setSelectedRole(savedRole);
            }
        } catch (e) {
            console.log(e);
        } finally {
            setIsLoading(false);
        }
    };



    const setAndStoreSelectedRole = async (role) => {
        setSelectedRole(role);
        await AsyncStorage.setItem('selectedRole', role);
    };

    useEffect(() => {
        isLoggedIn();
    }, []);


    return (
        <AuthContext.Provider value={{
            userToken,
            signIn,
            signOut,
            isLoading,
            userInfo,
            selectedRole,
            setSelectedRole: setAndStoreSelectedRole,
            refreshAccessToken
        }}>
            {children}
        </AuthContext.Provider>
    );
};
