import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Image, StatusBar, ScrollView } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const SelectRoleScreen = () => {
    const { userInfo, setSelectedRole } = useContext(AuthContext);
    const handleRoleSelection = (role) => {
        setSelectedRole(role);
    };
    return (
        <>
            <StatusBar
                backgroundColor="#1E187B"
                barStyle="light-content"
            />
            <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1, paddingBottom: 20 }}>
                <View style={styles.container}>
                    <View style={{ flexDirection: 'column', gap: 10 }}>
                        <View>
                            <Image
                                source={{ uri: fotoToShow }}
                                style={styles.fotoPerfil}
                            />
                        </View>
                        {/* <Text style={{ fontSize: 40, color: '#2D2D2D' }}>Hola, <Text style={{ fontSize: 40, fontWeight: 'bold', color: '#1E187B' }}>{user?.user_name}</Text></Text>
                        <Text style={{ fontSize: 15, color: '#2D2D2D' }}><Text style={{ fontSize: 15, fontWeight: 'bold', color: '#929292' }}>{user?.user_email}</Text></Text> */}
                    </View>
                    <Text style={{ marginVertical: 20 }}>Seleccione un rol para continuar</Text>

                    <View style={styles.cardContainer}>
                        {userInfo?.roles.map((role) => (
                            <TouchableOpacity
                                key={role}
                                style={styles.card}
                                onPress={() => handleRoleSelection(role)}
                            >
                                <Icon name={IconRoles[role.toLowerCase()]} size={40} color="#1E187B" />
                                <Text style={{ fontSize: 15, fontWeight: 'bold', color: '#1E187B', marginTop: 10 }}>
                                    {handleRoleSpanish(role.toLowerCase())}
                                </Text>

                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </ScrollView>
        </>
    );
};

export default SelectRoleScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#EDF3FB',
        justifyContent: 'flex-start',
        paddingTop: 50,
        alignItems: 'flex-start',
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1E187B',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: '#6b7280',
        marginBottom: 30,
        textAlign: 'center',
    },
    cardContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        width: '100%',
    },
    card: {
        backgroundColor: 'white',
        width: '48%',
        paddingVertical: 20,
        paddingHorizontal: 15,
        borderRadius: 15,
        marginBottom: 15,
        elevation: 1,
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    cardText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#1E187B',
        textAlign: 'center',
        textTransform: 'capitalize',
    },
    fotoPerfil: {
        width: 60,
        height: 60,
        borderRadius: 100,
        borderColor: '#1E187B',
        borderWidth: 2,
    },
});
