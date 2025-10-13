import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const NuevaInstalacionFallidaScreen = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>EFE</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    text: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#ff0000',
    },
});

export default NuevaInstalacionFallidaScreen;