// screens/SplashScreen.js

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, Animated, Easing, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getStatusBarHeight } from 'react-native-status-bar-height';

// Definimos el padding superior para asegurar que el contenido esté debajo del notch/barra de estado
const STATUS_BAR_HEIGHT = Platform.OS === 'ios' ? getStatusBarHeight(true) : 0;

export default function SplashScreen() {
  const navigation = useNavigation();
  // fadeAnim controlará la opacidad de la animación (de 0 a 1)
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Inicia la animación de aparición
    Animated.timing(
      fadeAnim,
      {
        toValue: 1,         // Opacidad final: 1 (completamente visible)
        duration: 1500,     // Duración de la animación en milisegundos
        easing: Easing.ease, // Tipo de curva de animación
        useNativeDriver: true, // Usa el driver nativo para mejor rendimiento
      }
    ).start(); // Inicia la animación

    // Después de un tiempo, navega a la pantalla de Login
    const timer = setTimeout(() => {
      // 'replace' evita que el usuario pueda volver a la pantalla de Splash
      navigation.replace('Login');
    }, 3500); // Muestra el splash por 3.5 segundos

    // Función de limpieza para cancelar el temporizador si el componente se desmonta
    return () => clearTimeout(timer);
  }, [navigation, fadeAnim]); // Dependencias del useEffect

  return (
    <View style={styles.container}>
      {/* Contenedor animado para el logo y el título */}
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/*
          Tu imagen del logo. Asegúrate de que 'app_logo.png' exista en la carpeta 'assets'.
          Si tu archivo tiene otro nombre, cámbialo aquí.
        */}
        <Image
          source={require('../assets/app_logo.png')}
          style={styles.logo}
        />
        <Text style={styles.title}>JuntApp</Text>
        <Text style={styles.developedBy}>Developed by TAapp</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center', // Centra el contenido verticalmente
    alignItems: 'center',     // Centra el contenido horizontalmente
    backgroundColor: '#fef6e4', // Color de fondo pastel
    paddingTop: STATUS_BAR_HEIGHT, // Ajuste para el notch/barra de estado
  },
  content: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 250, // Ancho del logo
    height: 250, // Alto del logo
    resizeMode: 'contain', // Asegura que la imagen se ajuste sin cortarse
    marginBottom: 20, // Espacio debajo del logo
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#001858', // Color de texto principal
    marginBottom: 10,
  },
  developedBy: {
    fontSize: 18,
    color: '#8bd3dd', // Color pastel para este texto
    fontStyle: 'italic',
  },
});
