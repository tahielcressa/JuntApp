// screens/MainMenuScreen.js

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform, Image, ScrollView } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getStatusBarHeight } from 'react-native-status-bar-height';

const pastelColors = {
  background: '#fef6e4',
  primary: '#8bd3dd',
  accent: '#f582ae',
  text: '#001858',
  buttonText: '#fff',
  logoutButton: '#e74c3c',
  // No necesitamos headerText aquí si el título de la app usa pastelColors.text
};

// Ajuste para el padding superior de la pantalla, incluyendo la barra de estado
const STATUS_BAR_HEIGHT = Platform.OS === 'ios' ? getStatusBarHeight(true) : 0;
const SCREEN_TOP_PADDING = STATUS_BAR_HEIGHT + 20;

export default function MainMenuScreen() {
  const navigation = useNavigation();
  const [userName, setUserName] = useState(null); // Mantener userName para el estado local

  // Carga el nombre de usuario desde AsyncStorage cuando la pantalla se enfoca
  const loadUserName = useCallback(async () => {
    try {
      // Usar 'username' para consistencia con SettingsScreen
      const storedUserName = await AsyncStorage.getItem('username'); 
      setUserName(storedUserName || 'Invitado');
    } catch (error) {
      console.error("Error loading username in MainMenu:", error);
      setUserName('Error');
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadUserName();
    }, [loadUserName]) // Se ejecuta cuando la pantalla se enfoca
  );

  // Maneja el cierre de sesión: elimina el nombre de usuario y navega al Login
  const handleLogout = async () => {
    Alert.alert(
      "Cerrar Sesión",
      "¿Estás seguro de que quieres cerrar sesión?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sí",
          onPress: async () => {
            try {
              // Usar 'username' para consistencia con SettingsScreen
              await AsyncStorage.removeItem('username'); 
              navigation.replace('Login'); // Vuelve a la pantalla de login
            } catch (error) {
              console.error("Error logging out:", error);
              Alert.alert('Error', 'No se pudo cerrar sesión.');
            }
          }
        }
      ]
    );
  };

  return (
    // El View principal ahora usa el color de fondo pastelColors.background
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {/* Imagen principal de JuntApp */}
        <Image
          source={require('../assets/app_logo.png')} // Asegúrate de que 'app_logo.png' exista
          style={styles.mainImage}
        />
        <Text style={styles.appTitle}>JuntApp</Text>

        {/* Saludo debajo del título de la app */}
        <Text style={styles.greetingText}>
          ¡Hola, {userName || 'Invitado'}!
        </Text>

        {/* Botones del menú */}
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => navigation.navigate('AddGroup')}
        >
          <Text style={styles.menuButtonText}>+ Crear Nuevo Grupo</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => navigation.navigate('Home')} 
        >
          <Text style={styles.menuButtonText}>📄 Ver Grupos / Gastos</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => navigation.navigate('SelectGroupForExpense')} // Navega a la pantalla para seleccionar grupo antes de añadir gasto
        >
          <Text style={styles.menuButtonText}>+ Crear nuevo gasto</Text>
        </TouchableOpacity>

        {/* ¡NUEVO BOTÓN PARA INFORMES Y ESTADÍSTICAS! */}
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => navigation.navigate('Reports')} // Navega a ReportsScreen
        >
          <Text style={styles.menuButtonText}>📊 Informes y Estadísticas</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => navigation.navigate('Settings')} // Navega a SettingsScreen
        >
          <Text style={styles.menuButtonText}>⚙️ Ajustes</Text>
        </TouchableOpacity>

        {/* Botón de cerrar sesión debajo de Ajustes */}
        <TouchableOpacity style={styles.logoutButtonAtBottom} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: pastelColors.background, // Usa el color de fondo pastel
  },
  scrollViewContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingBottom: 40,
    paddingTop: SCREEN_TOP_PADDING, // Ajusta este padding para el contenido general
    width: '100%', // Asegura que el contenido ocupe el ancho completo
  },
  mainImage: {
    width: 180, // Ajusta el tamaño si es necesario
    height: 180,
    resizeMode: 'contain',
    marginBottom: 15,
  },
  appTitle: {
    fontSize: 34,
    fontWeight: 'bold',
    color: pastelColors.text,
    marginBottom: 10,
  },
  greetingText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: pastelColors.text,
    marginBottom: 30, // Espacio entre el saludo y los botones
  },
  menuButton: {
    backgroundColor: pastelColors.primary,
    width: '80%',
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  menuButtonText: {
    color: pastelColors.buttonText,
    fontSize: 18,
    fontWeight: 'bold',
  },
  logoutButtonAtBottom: { // Estilo para el botón de cerrar sesión en la parte inferior
    backgroundColor: pastelColors.logoutButton,
    width: '80%', // Mismo ancho que los otros botones
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 20, // Espacio superior para separarlo de "Ajustes"
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  logoutButtonText: {
    color: pastelColors.buttonText,
    fontSize: 18,
    fontWeight: 'bold',
  },
});
