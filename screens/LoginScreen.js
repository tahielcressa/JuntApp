// screens/LoginScreen.js

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image, Platform, KeyboardAvoidingView, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getStatusBarHeight } from 'react-native-status-bar-height';

// Definición de colores pastel para consistencia
const pastelColors = {
  background: '#fef6e4',
  primary: '#8bd3dd',
  accent: '#f582ae',
  text: '#001858',
  buttonText: '#fff',
};

// Ajuste para el padding superior de la pantalla
const STATUS_BAR_HEIGHT = Platform.OS === 'ios' ? getStatusBarHeight(true) : 0;

export default function LoginScreen() {
  const navigation = useNavigation();
  const [username, setUsername] = useState('');
  // Animated.Value para animar el logo y el input al enfocar/desenfocar
  const logoScale = useRef(new Animated.Value(1)).current;
  const inputTranslateY = useRef(new Animated.Value(0)).current;

  // Efecto para animar el logo y el input cuando el teclado aparece/desaparece
  const handleFocus = () => {
    Animated.parallel([
      Animated.timing(logoScale, {
        toValue: 0.8, // Escala el logo a 80%
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(inputTranslateY, {
        toValue: Platform.OS === 'ios' ? -50 : -80, // Sube el input más en Android
        duration: 300,
        useNativeDriver: true,
      })
    ]).start();
  };

  const handleBlur = () => {
    Animated.parallel([
      Animated.timing(logoScale, {
        toValue: 1, // Vuelve el logo a su tamaño original
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(inputTranslateY, {
        toValue: 0, // Vuelve el input a su posición original
        duration: 300,
        useNativeDriver: true,
      })
    ]).start();
  };

  // Maneja el inicio de sesión: guarda el nombre y navega al menú principal
  const handleLogin = async () => {
    if (username.trim() === '') {
      Alert.alert('Error', 'Por favor, ingresa tu nombre.');
      return;
    }
    try {
      // CORRECCIÓN: Cambiado 'userName' a 'username' para que coincida con MainMenuScreen
      await AsyncStorage.setItem('username', username.trim());
      // 'replace' evita que el usuario pueda volver a la pantalla de Login
      navigation.replace('MainMenu');
    } catch (error) {
      console.error("Error saving username:", error);
      Alert.alert('Error', 'No se pudo guardar el nombre de usuario.');
    }
  };

  return (
    // KeyboardAvoidingView ajusta la vista cuando el teclado aparece
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : -50} // Ajusta si el teclado tapa
    >
      <Animated.Image
        source={require('../assets/app_logo.png')}
        style={[styles.logo, { transform: [{ scale: logoScale }] }]}
      />
      <Text style={styles.welcomeTitle}>¡Bienvenido a JuntApp!</Text>
      <Text style={styles.promptText}>Ingresa tu nombre para continuar</Text>
      {/* Contenedor animado para el input y el botón */}
      <Animated.View style={{ transform: [{ translateY: inputTranslateY }] }}>
        <TextInput
          style={styles.input}
          placeholder="Tu nombre"
          placeholderTextColor="#aaa"
          value={username}
          onChangeText={setUsername}
          onFocus={handleFocus} // Cuando el input gana foco
          onBlur={handleBlur}   // Cuando el input pierde foco
          onSubmitEditing={handleLogin} // Permite enviar con la tecla Enter/Done
          returnKeyType="done"
        />
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
        </TouchableOpacity>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: pastelColors.background,
    paddingHorizontal: 20,
    paddingTop: STATUS_BAR_HEIGHT,
  },
  logo: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
    marginBottom: 30,
  },
  welcomeTitle: {
    fontSize: 30,
    fontWeight: 'bold',
    color: pastelColors.text,
    marginBottom: 10,
  },
  promptText: {
    fontSize: 18,
    color: pastelColors.text,
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    width: 300,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    fontSize: 18,
    color: pastelColors.text,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: pastelColors.primary,
  },
  loginButton: {
    backgroundColor: pastelColors.primary,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
    alignSelf: 'center',
  },
  loginButtonText: {
    color: pastelColors.buttonText,
    fontSize: 18,
    fontWeight: 'bold',
  },
});

