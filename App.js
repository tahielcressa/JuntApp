// App.js

import 'react-native-gesture-handler'; // Asegúrate de que esta importación sea correcta

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Importa todas las pantallas de tu aplicación
import SplashScreen from './screens/SplashScreen';
import LoginScreen from './screens/LoginScreen';
import MainMenuScreen from './screens/MainMenuScreen';
import HomeScreen from './screens/HomeScreen';
import GroupDetailsScreen from './screens/GroupDetailsScreen';
import AddGroupScreen from './screens/AddGroupScreen';
import EditGroupScreen from './screens/EditGroupScreen';
import RandomPickerScreen from './screens/RandomPickerScreen';
import SettingsScreen from './screens/SettingsScreen';
import SelectGroupForExpenseScreen from './screens/SelectGroupForExpenseScreen';
import ReportsScreen from './screens/ReportsScreen'; // Asegúrate de que esta importación sea correcta

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      {/*
        Stack.Navigator define el contenedor de navegación principal.
        initialRouteName="Splash" establece la pantalla inicial.
        screenOptions={{ headerShown: false }} oculta el encabezado predeterminado
        para que cada pantalla pueda tener su propio encabezado personalizado.
      */}
      <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
        {/* Definición de cada pantalla en la pila de navegación */}
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="MainMenu" component={MainMenuScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="GroupDetails" component={GroupDetailsScreen} />
        <Stack.Screen name="AddGroup" component={AddGroupScreen} />
        <Stack.Screen name="EditGroup" component={EditGroupScreen} />
        <Stack.Screen name="RandomPicker" component={RandomPickerScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="SelectGroupForExpense" component={SelectGroupForExpenseScreen} />
        <Stack.Screen name="Reports" component={ReportsScreen} />
        {/*
          Nota: Los modales como AddMemberModal o AddExpenseModal no se registran aquí
          porque se renderizan como componentes dentro de otras pantallas (ej. GroupDetailsScreen).
        */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}