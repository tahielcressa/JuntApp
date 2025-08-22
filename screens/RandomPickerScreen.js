// screens/RandomPickerScreen.js

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import AsyncStorage from '@react-native-async-storage/async-storage';

const pastelColors = {
  background: '#fef6e4',
  primary: '#8bd3dd', // Azul pastel
  accent: '#f582ae', // Rosa pastel
  text: '#001858', // Azul oscuro casi negro
  buttonText: '#fff', // Blanco para el texto de los botones
  pickerResult: '#e74c3c', // Rojo para el resultado final
  backButtonText: '#001858',
};

// Ajuste para el padding superior del header
const STATUS_BAR_HEIGHT = Platform.OS === 'ios' ? getStatusBarHeight(true) : 0;
const HEADER_VERTICAL_PADDING = STATUS_BAR_HEIGHT + 30;

export default function RandomPickerScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { groupId } = route.params || {};

  const [members, setMembers] = useState([]);
  const [pickedMember, setPickedMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSpinning, setIsSpinning] = useState(false); // Estado para controlar la animación
  const [displayMember, setDisplayMember] = useState(null); // Miembro que se muestra durante la "animación"
  const animationIntervalRef = useRef(null); // Referencia para el intervalo de animación

  // Función para cargar los miembros del grupo específico
  const loadGroupMembers = useCallback(async () => {
    if (!groupId) {
      Alert.alert('Error', 'ID de grupo no proporcionado para el selector aleatorio.');
      navigation.goBack();
      return;
    }
    try {
      const storedGroups = await AsyncStorage.getItem('groups');
      const allGroups = storedGroups ? JSON.parse(storedGroups) : [];
      const foundGroup = allGroups.find(g => g.id === groupId);

      if (foundGroup && foundGroup.members && foundGroup.members.length > 0) {
        setMembers(foundGroup.members);
      } else {
        Alert.alert('Info', 'No hay miembros en este grupo para elegir. Por favor, añade algunos.');
        setMembers([]);
      }
    } catch (error) {
      console.error("Error loading group members for random picker:", error);
      Alert.alert('Error', 'No se pudieron cargar los miembros del grupo.');
    } finally {
      setLoading(false);
    }
  }, [groupId, navigation]);

  useFocusEffect(
    useCallback(() => {
      loadGroupMembers();
      // Limpiar cualquier intervalo pendiente al salir de la pantalla
      return () => {
        if (animationIntervalRef.current) {
          clearInterval(animationIntervalRef.current);
        }
      };
    }, [loadGroupMembers])
  );

  // Función para iniciar la animación de "ruleta de texto"
  const handlePickRandom = () => {
    if (isSpinning || members.length === 0) return;

    setIsSpinning(true);
    setPickedMember(null); // Limpiar el resultado anterior

    const totalMembers = members.length;
    let spinCount = 0;
    const maxSpins = 30; // Número de cambios de nombre para la animación
    const spinDuration = 50; // Duración de cada cambio de nombre en ms

    // Elegir el miembro final aleatorio
    const finalPickedIndex = Math.floor(Math.random() * totalMembers);
    const finalPickedName = members[finalPickedIndex].name;

    animationIntervalRef.current = setInterval(() => {
      if (spinCount < maxSpins) {
        // Muestra un nombre aleatorio mientras gira
        const randomIndex = Math.floor(Math.random() * totalMembers);
        setDisplayMember(members[randomIndex].name);
        spinCount++;
      } else {
        // Detener la animación y mostrar el miembro final
        clearInterval(animationIntervalRef.current);
        setIsSpinning(false);
        setPickedMember(finalPickedName);
        setDisplayMember(finalPickedName); // Asegura que el nombre final se muestre
      }
    }, spinDuration);
  };

  // Muestra un indicador de carga mientras se cargan los miembros
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Cargando miembros...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Encabezado con botón de volver */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>¿Quién paga hoy?</Text>
        {/* Placeholder para alinear el título */}
        <View style={styles.placeHolderButton}></View>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>¡Gira para Elegir! 🍕💸</Text>

        {members.length === 0 && !loading ? (
          <Text style={styles.emptyMembersText}>
            No hay miembros en este grupo para elegir. Por favor, añade algunos en los detalles del grupo.
          </Text>
        ) : (
          <>
            {/* Contenedor para el nombre que "gira" */}
            <View style={styles.spinningMemberContainer}>
              <Text style={styles.spinningMemberText}>
                {isSpinning ? displayMember : (pickedMember || 'Pulsa para empezar')}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.pickButton}
              onPress={handlePickRandom}
              disabled={isSpinning || members.length === 0}
            >
              <Text style={styles.pickButtonText}>
                {isSpinning ? 'Girando...' : 'Elegir al azar'}
              </Text>
            </TouchableOpacity>

            {pickedMember && !isSpinning && (
              <View style={styles.resultContainer}>
                <Text style={styles.resultLabel}>¡Hoy paga:</Text>
                <Text style={styles.resultMember}>{pickedMember}!</Text>
              </View>
            )}
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: pastelColors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: pastelColors.background,
  },
  loadingText: {
    fontSize: 18,
    color: pastelColors.text,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
    paddingTop: HEADER_VERTICAL_PADDING,
    paddingBottom: 10,
    backgroundColor: pastelColors.background,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 5,
    width: 60,
    alignItems: 'flex-start',
  },
  backButtonText: {
    fontSize: 16,
    color: pastelColors.backButtonText,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: pastelColors.text,
    textAlign: 'center',
    flex: 1,
    marginHorizontal: 10,
  },
  placeHolderButton: {
    width: 60,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: pastelColors.text,
    marginBottom: 40, // Más espacio para el título
    textAlign: 'center',
  },
  spinningMemberContainer: {
    backgroundColor: '#fff', // Fondo blanco para el área de texto giratorio
    borderRadius: 15,
    paddingVertical: 20,
    paddingHorizontal: 30,
    width: '90%',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100, // Altura mínima para que no salte
    marginBottom: 40, // Espacio entre el texto y el botón
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 8,
  },
  spinningMemberText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: pastelColors.text,
    textAlign: 'center',
  },
  pickButton: {
    backgroundColor: pastelColors.primary,
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
    marginBottom: 30,
  },
  pickButtonText: {
    color: pastelColors.buttonText,
    fontSize: 20,
    fontWeight: 'bold',
  },
  resultContainer: {
    backgroundColor: pastelColors.accent,
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    width: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  resultLabel: {
    fontSize: 20,
    color: pastelColors.buttonText,
    marginBottom: 5,
    fontWeight: 'bold',
  },
  resultMember: {
    fontSize: 36,
    fontWeight: 'bold',
    color: pastelColors.buttonText,
    textAlign: 'center',
  },
  emptyMembersText: {
    fontSize: 16,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 20,
    paddingHorizontal: 20,
  },
});
