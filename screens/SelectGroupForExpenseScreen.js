import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, Alert, RefreshControl } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getStatusBarHeight } from 'react-native-status-bar-height';

const pastelColors = {
    background: '#fef6e4',
    primary: '#8bd3dd',
    accent: '#f582ae', // Este es el rosa pastel para las tarjetas aquí
    text: '#001858',
    cardBackground: '#f582ae', // Fondo rosa pastel para las tarjetas
    shadow: '#000',
    backButtonText: '#001858',
};

// Ajuste para el padding superior del header
const STATUS_BAR_HEIGHT = Platform.OS === 'ios' ? getStatusBarHeight(true) : 0;
// Aumentamos el padding para bajar más el header y el título
const HEADER_VERTICAL_PADDING = STATUS_BAR_HEIGHT + 30; // Aumentado de 20 a 30

export default function SelectGroupForExpenseScreen() {
    const navigation = useNavigation();
    const [groups, setGroups] = useState([]);
    const [refreshing, setRefreshing] = useState(false);

    // Función para cargar los grupos desde AsyncStorage
    const loadGroups = useCallback(async () => {
        try {
            setRefreshing(true);
            const storedGroups = await AsyncStorage.getItem('groups');
            if (storedGroups) {
                setGroups(JSON.parse(storedGroups));
            } else {
                setGroups([]);
            }
        } catch (error) {
            console.error("Error loading groups for expense selection:", error);
            Alert.alert('Error', 'No se pudieron cargar los grupos.');
        } finally {
            setRefreshing(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadGroups();
        }, [loadGroups])
    );

    const handleSelectGroup = (groupId, groupName) => {
        navigation.navigate('GroupDetails', { groupId, groupName, openAddExpenseModal: true });
    };

    return (
        <View style={styles.container}>
            {/* Encabezado con botón de volver */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Text style={styles.backButtonText}>← Volver</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Selecciona un Grupo para el Gasto</Text>
                {/* Placeholder para alinear el título:
                    Aseguramos que tenga el mismo ancho que el backButton para un mejor centrado. */}
                <View style={styles.placeHolderButton}></View>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollViewContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={loadGroups} />
                }
            >
                {groups.length === 0 ? (
                    <Text style={styles.emptyListText}>No tienes grupos. ¡Crea uno para añadir gastos!</Text>
                ) : (
                    groups.map(group => (
                        <TouchableOpacity
                            key={group.id}
                            style={styles.groupCard}
                            onPress={() => handleSelectGroup(group.id, group.name)}
                        >
                            <Text style={styles.groupName}>{group.name}</Text>
                            <Text style={styles.groupArrow}>›</Text>
                        </TouchableOpacity>
                    ))
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: pastelColors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        paddingHorizontal: 20,
        paddingTop: HEADER_VERTICAL_PADDING, // Usamos la variable ajustada aquí
        paddingBottom: 10,
        backgroundColor: pastelColors.background,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    backButton: {
        padding: 5,
        // Podemos dar un ancho fijo para que el placeholder lo iguale
        width: 60, // Ajusta este valor si el texto "Volver" es más largo o más corto
        alignItems: 'flex-start', // Alinea el texto a la izquierda dentro del botón
    },
    backButtonText: {
        fontSize: 16,
        color: pastelColors.backButtonText,
        fontWeight: 'bold',
    },
    headerTitle: {
        fontSize: 22, // Mantengo el tamaño del título un poco más pequeño para que quepa bien
        fontWeight: 'bold',
        color: pastelColors.text,
        textAlign: 'center',
        flex: 1, // Permite que el título ocupe el espacio restante y se centre
        marginHorizontal: 10, // Espacio para que no choque con los botones
    },
    placeHolderButton: {
        width: 60, // Mismo ancho que el backButton para centrar el título
    },
    scrollViewContent: {
        flexGrow: 1,
        paddingHorizontal: 15,
        paddingTop: 10,
        paddingBottom: 10,
    },
    emptyListText: {
        fontSize: 16,
        color: '#999',
        textAlign: 'center',
        fontStyle: 'italic',
        marginTop: 20,
        marginBottom: 30,
    },
    groupCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: pastelColors.cardBackground,
        borderRadius: 15,
        paddingVertical: 15,
        paddingHorizontal: 20,
        marginBottom: 10,
        shadowColor: pastelColors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    groupName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: pastelColors.buttonText,
        flex: 1,
    },
    groupArrow: {
        fontSize: 18,
        color: pastelColors.buttonText,
        fontWeight: 'bold',
        marginLeft: 10,
    },
});
