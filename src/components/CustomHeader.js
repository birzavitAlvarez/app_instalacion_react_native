import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, Image, StatusBar, TouchableOpacity } from 'react-native';
import Logo from '../../assets/images/logo-simple.png';
import { AuthContext } from '../context/AuthContext';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

const CustomHeader = () => {
    const { signOut, userInfo } = useContext(AuthContext)
    return (
        <>
            <StatusBar
                backgroundColor="#1E187B"
                barStyle="light-content"
            />
            <View style={styles.container}>
                <View style={{ alignItems: 'center', justifyContent: 'space-between', flexDirection: 'row' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Image
                            source={Logo}
                            style={styles.logo}
                            onError={(e) => console.log('Error al cargar imagen', e.nativeEvent)}
                        />
                        {/* 
                        <View style={[styles.roleContainer, { maxWidth: 100, backgroundColor: roleStyles.backgroundColor }]}>
                            <Text numberOfLines={1} ellipsizeMode='tail' style={[styles.role, { color: roleStyles.color }]}>{roleText}</Text>
                        </View> */}
                    </View>
                    <View style={{ alignItems: 'center', flexDirection: 'row', gap: 10 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                            <View style={{ maxWidth: 70 }}>
                                <Text
                                    style={{ color: 'white', fontWeight: '600', fontSize: 13 }}
                                    numberOfLines={1}
                                    ellipsizeMode='tail'
                                >
                                    {`Hola ${userInfo?.idUsuario}`}
                                </Text>
                            </View>
                            {/* 
                            {fotoToShow ? (
                                <Image
                                    source={{ uri: fotoToShow }}
                                    style={styles.fotoPerfil}
                                    onError={(e) => console.log('Error al cargar imagen', e.nativeEvent)}
                                />
                            ) : (
                                <Image source={photo} style={styles.fotoPerfil} />
                            )}
                                */}
                        </View>

                        <TouchableOpacity onPress={signOut}>
                            <MaterialIcons name="logout" size={24} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </>
    );
};

export default CustomHeader;

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#1E187B',
        borderBottomRightRadius: 20,
        borderBottomLeftRadius: 20,
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    fotoPerfil: {
        width: 30,
        height: 30,
        borderRadius: 20,
        borderColor: '#fff',
        borderWidth: 2,
    },
    logo: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    role: {
        fontSize: 12,
        fontWeight: '700',
    },
    roleContainer: {
        paddingVertical: 2,
        paddingHorizontal: 10,
        borderRadius: 40,
    }
});
