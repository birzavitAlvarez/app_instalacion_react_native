import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MenuCard from '../components/MenuCard';
import { useNavigation } from "@react-navigation/native";

const InstalacionScreen = () => {
    const navigation = useNavigation();

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.greeting}>Instalación,</Text>
                <Text style={styles.question}>¿Qué deseas hacer?</Text>
            </View>

            <View style={styles.content}>
                <View style={styles.row}>
                    <MenuCard
                        iconName="check"
                        title="Nueva Instalación"
                        description="Instala nuevo equipo."
                        onPress={() => {
                            navigation.navigate("NuevaInstalacion")
                        }}
                    />
                    <MenuCard
                        iconName="close"
                        iconColor="red"
                        title="Instalación Fallida"
                        titleColor="red"
                        description="Reportar fallo."
                        onPress={() => {
                            navigation.navigate("NuevaInstalacionFallida")
                        }}
                    />
                    
                </View>
                
                <View style={styles.row}>
                    <MenuCard
                        iconName="close"
                        iconColor="red"
                        title="Registro de IMEIS"
                        description="Registro de lista de IMEIS."
                        onPress={() => {
                            navigation.navigate("RegistroImeis")
                        }}
                    />
                </View>
                
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F1F3F2',
        paddingHorizontal: 20,
    },
    header: {
        paddingVertical: 40,
    },
    greeting: {
        fontSize: 35,
        fontWeight: '600',
        color: '#8F9392',
    },
    question: {
        fontSize: 35,
        fontWeight: '600',
        color: '#060807',
    },
    content: {
        flex: 1,
        flexDirection: 'column',
        gap: 6,
    },
    row: {
        flexDirection: 'row',
        gap: 6,
    },
});

export default InstalacionScreen;