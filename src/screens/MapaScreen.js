import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const MapaScreen = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Mapeta</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default MapaScreen;