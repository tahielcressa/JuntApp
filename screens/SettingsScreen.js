// screens/SettingsScreen.js

import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Platform, TextInput,
  TouchableWithoutFeedback, Keyboard, Share
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import AsyncStorage from '@react-native-async-storage/async-storage';
// Eliminamos la importación de Picker ya que no se usará para el tema
// import { Picker } from '@react-native-picker/picker';

// Importaciones para exportar CSV
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';

// Definición de colores pastel (se mantiene como la única paleta)
const pastelColors = {
  background: '#fef6e4',
  primary: '#8bd3dd',
  accent: '#f582ae',
  text: '#001858',
  buttonText: '#fff',
  cardBackground: '#fff',
  backButtonText: '#001858',
  inputBorder: '#f582ae',
  buttonBg: '#8bd3dd',
  modalBackground: 'rgba(0, 0, 0, 0.5)',
  deleteButton: '#e74c3c', // Añadido para consistencia en resetDataText
};

const STATUS_BAR_HEIGHT = Platform.OS === 'ios' ? getStatusBarHeight(true) : 0;
const HEADER_VERTICAL_PADDING = STATUS_BAR_HEIGHT + 30;

const faqData = [
  {
    question: "¿Cómo creo un nuevo grupo?",
    answer: "Desde la pantalla principal, haz clic en el botón 'Crear Nuevo Grupo'. Ingresa un nombre y, opcionalmente, una fecha para la juntada. Luego, haz clic en 'Crear Grupo'."
  },
  {
    question: "¿Cómo añado miembros a un grupo?",
    answer: "Dentro de un grupo, ve a la sección 'Miembros' y haz clic en '+ Añadir Miembro'. Ingresa el nombre del miembro y guárdalo."
  },
  {
    question: "¿Cómo registro un gasto?",
    answer: "En la pantalla de detalles del grupo, ve a la sección 'Gastos' y haz clic en '+ Añadir Gasto'. Ingresa la descripción, el monto, selecciona quién pagó y, lo más importante, marca a todos los participantes que consumieron ese gasto."
  },
  {
    question: "¿Cómo se calculan los balances?",
    answer: "La aplicación calcula automáticamente cuánto ha pagado cada miembro y cuánto debería haber pagado por los gastos en los que participó. El balance final muestra la diferencia. Un número negativo significa que esa persona debe, y uno positivo que tiene a favor."
  },
  {
    question: "¿Qué significa 'Cada uno debería aportar (promedio)'?",
    answer: "Es el total de gastos del grupo dividido por el número total de miembros. Es una referencia general de cuánto le tocaría a cada uno si todos hubieran participado por igual en todos los gastos."
  },
  {
    question: "¿Cómo saldar las cuentas?",
    answer: "En la sección 'Balances', verás una subsección 'Cómo Saldo las Cuentas' que te indicará las transacciones mínimas necesarias para que todos queden en cero. Por ejemplo: 'Juan le debe $15.00 a María'."
  },
  {
    question: "¿Puedo exportar los datos de mis grupos?",
    answer: "Sí, en la pantalla de 'Ajustes', puedes seleccionar 'Exportar todos los grupos (CSV)' para guardar un archivo con todos tus gastos y balances."
  },
  {
    question: "¿Cómo cambio mi nombre de usuario?",
    answer: "En la pantalla de 'Ajustes', en la sección 'Cuenta', haz clic en 'Cambiar nombre de usuario' e introduce tu nuevo nombre."
  },
  {
    question: "¿Qué pasa si restablezco los datos de la aplicación?",
    answer: "Esta acción borrará TODOS tus grupos, miembros y gastos. Es irreversible. Úsala con precaución si quieres empezar de cero."
  },
];


export default function SettingsScreen() {
  const navigation = useNavigation();
  const [isChangeUserModalVisible, setChangeUserModalVisible] = useState(false);
  const [currentUsername, setCurrentUsername] = useState('Usuario JuntApp');
  const [newUsername, setNewUsername] = useState('');
  // Eliminamos el estado 'selectedTheme' si no se va a usar para nada más
  // const [selectedTheme, setSelectedTheme] = useState('pastel');

  const loadSettings = useCallback(async () => {
    try {
      const storedUsername = await AsyncStorage.getItem('username');
      if (storedUsername) {
        setCurrentUsername(storedUsername);
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadSettings();
    }, [loadSettings])
  );

  const handleChangeUser = () => {
    setNewUsername(currentUsername);
    setChangeUserModalVisible(true);
  };

  const handleSaveUsername = async () => {
    if (!newUsername.trim()) {
      Alert.alert('Error', 'El nombre de usuario no puede estar vacío.');
      return;
    }
    try {
      await AsyncStorage.setItem('username', newUsername.trim());
      setCurrentUsername(newUsername.trim());
      Alert.alert('Éxito', 'Nombre de usuario actualizado.');
      setChangeUserModalVisible(false);
      Keyboard.dismiss();
    } catch (error) {
      console.error("Error saving username:", error);
      Alert.alert('Error', 'No se pudo guardar el nombre de usuario.');
    }
  };

  const handlePrivacyPolicy = () => {
    const privacyText = `
    Política de Privacidad de JuntApp

    Fecha de entrada en vigor: 18 de julio de 2025

    Esta Política de Privacidad describe cómo JuntApp ("nosotros", "nuestro" o "la aplicación") recopila, utiliza y comparte su información cuando utiliza nuestra aplicación móvil.

    1. Información que Recopilamos
    JuntApp está diseñada para ayudarle a gestionar gastos compartidos en grupos. Toda la información que usted introduce en la aplicación (nombres de grupos, nombres de miembros, descripciones y montos de gastos) se almacena localmente en su dispositivo utilizando AsyncStorage. No recopilamos ni almacenamos esta información en nuestros servidores.

    2. Uso de la Información
    La información que usted introduce se utiliza exclusivamente para las funcionalidades de la aplicación:
    - Crear y gestionar grupos.
    - Añadir y eliminar miembros.
    - Registrar y dividir gastos.
    - Calcular balances entre miembros.
    - Seleccionar un miembro al azar para pagar.

    3. Compartir Información
    Dado que toda su información se almacena localmente en su dispositivo, no compartimos su información con terceros. Usted es el único responsable de la información que introduce y de cómo la gestiona en su dispositivo.

    4. Seguridad de los Datos
    Tomamos precauciones razonables para proteger la información almacenada en su dispositivo contra el acceso no autorizado. Sin embargo, tenga en cuenta que ningún método de transmisión por Internet o de almacenamiento electrónico es 100% seguro.

    5. Cambios a esta Política de Privacidad
    Podemos actualizar nuestra Política de Privacidad de vez en cuando. Le notificaremos cualquier cambio publicando la nueva Política de Privacidad en esta página. Se le aconseja revisar esta Política de Privacidad periódicamente para cualquier cambio.

    6. Contacto
    Si tiene alguna pregunta sobre esta Política de Privacidad, puede contactarnos a través de la sección de "Información" de la aplicación.
    `;
    Alert.alert('Políticas de Privacidad', privacyText);
  };

  const handleFAQ = () => {
    let faqContent = "";
    faqData.forEach(item => {
      faqContent += `\nQ: ${item.question}\n\nA: ${item.answer}\n---\n`;
    });
    Alert.alert('Ayuda y Preguntas Frecuentes', faqContent, [{ text: 'Entendido' }]);
  };


  const handleExportData = async () => {
    Alert.alert(
      "Exportar Datos",
      "¿Deseas exportar todos los datos de tus grupos a un archivo CSV?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Exportar",
          onPress: async () => {
            try {
              const storedGroups = await AsyncStorage.getItem('groups');
              const groups = storedGroups ? JSON.parse(storedGroups) : [];

              if (groups.length === 0) {
                Alert.alert('Info', 'No hay grupos para exportar.');
                return;
              }

              let csvContent = "Grupo,Miembro,Gasto,Monto,Pagador,Participantes,Aporte Individual,Fecha de Creación,Fecha de Juntada\n";

              groups.forEach(group => {
                const groupName = group.name;
                const gatheringDate = group.gatheringDate || 'N/A';

                if (group.expenses.length === 0) {
                  csvContent += `"${groupName}",N/A,N/A,0.00,N/A,N/A,0.00,${new Date(group.createdAt).toLocaleDateString()},"${gatheringDate}"\n`;
                } else {
                  group.expenses.forEach(expense => {
                    const participantsNames = expense.participants
                      .map(pId => group.members.find(m => m.id === pId)?.name || 'Desconocido')
                      .join(';');
                    
                    csvContent += `"${groupName}",`;
                    csvContent += `"${expense.payerName}",`;
                    csvContent += `"${expense.description}",`;
                    csvContent += `${expense.amount.toFixed(2)},`;
                    csvContent += `"${expense.payerName}",`;
                    csvContent += `"${participantsNames}",`;
                    csvContent += `${expense.individualShare ? expense.individualShare.toFixed(2) : '0.00'},`;
                    csvContent += `${new Date(group.createdAt).toLocaleDateString()},`;
                    csvContent += `"${gatheringDate}"\n`;
                  });
                }
              });

              const fileName = 'juntapp_gastos.csv';
              const fileUri = FileSystem.cacheDirectory + fileName;

              await FileSystem.writeAsStringAsync(fileUri, csvContent, { encoding: FileSystem.EncodingType.UTF8 });

              if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(fileUri, { mimeType: 'text/csv', UTI: 'public.csv' });
                Alert.alert('Éxito', 'Datos de grupos generados para compartir.');
              } else {
                Alert.alert('Error', 'La función de compartir no está disponible en este dispositivo.');
              }
            } catch (error) {
              console.error("Error exporting data:", error);
              Alert.alert('Error', 'No se pudieron exportar los datos.');
            }
          }
        }
      ]
    );
  };

  const handleResetData = () => {
    Alert.alert(
      "Restablecer Datos",
      "¿Estás seguro de que quieres borrar TODOS los grupos y gastos? Esta acción no se puede deshacer.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Borrar Todo",
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              setCurrentUsername('Usuario JuntApp');
              // Eliminamos el restablecimiento del tema si no hay cambio de tema
              // setSelectedTheme('pastel');
              Alert.alert('Éxito', 'Todos los datos han sido borrados.');
              navigation.replace('Home');
            } catch (error) {
              console.error("Error resetting data:", error);
              Alert.alert('Error', 'No se pudieron borrar los datos.');
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  // Eliminamos la función handleThemeChange ya que no se usará
  // const handleThemeChange = async (itemValue) => { ... };

  return (
    <View style={styles.container}>
      {/* Encabezado con botón de volver */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ajustes</Text>
        <View style={styles.placeHolderButton}></View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {/* Sección: Cuenta */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Cuenta</Text>
          <Text style={styles.currentUserText}>Usuario actual: {currentUsername}</Text>
          <TouchableOpacity style={styles.settingOption} onPress={handleChangeUser}>
            <Text style={styles.settingOptionText}>Cambiar nombre de usuario</Text>
          </TouchableOpacity>
        </View>

        {/* Sección: Datos */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Datos</Text>
          <TouchableOpacity style={styles.settingOption} onPress={handleExportData}>
            <Text style={styles.settingOptionText}>Exportar todos los grupos (CSV)</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingOption} onPress={handleResetData}>
            <Text style={[styles.settingOptionText, styles.resetDataText]}>Restablecer datos de la aplicación</Text>
          </TouchableOpacity>
        </View>

        {/* Sección: Apariencia - ¡Esta sección se elimina! */}
        {/*
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Apariencia</Text>
          <Text style={styles.label}>Tema de la aplicación:</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedTheme}
              onValueChange={(itemValue) => handleThemeChange(itemValue)}
              style={styles.picker}
              itemStyle={styles.pickerItem}
            >
              {themes.map(theme => (
                <Picker.Item key={theme.value} label={theme.name} value={theme.value} />
              ))}
            </Picker>
          </View>
        </View>
        */}

        {/* Sección: Información */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Información</Text>
          <TouchableOpacity style={styles.settingOption} onPress={handlePrivacyPolicy}>
            <Text style={styles.settingOptionText}>Políticas de privacidad</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingOption} onPress={handleFAQ}>
            <Text style={styles.settingOptionText}>Ayuda y Preguntas Frecuentes</Text>
          </TouchableOpacity>
          <View style={styles.appVersionContainer}>
            <Text style={styles.appVersionText}>Versión de la aplicación: 1.0.0</Text>
          </View> {/* ¡CORREGIDO AQUÍ! */}
        </View>
      </ScrollView>

      {/* Modal para cambiar usuario */}
      {isChangeUserModalVisible && (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Cambiar Nombre de Usuario</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Nuevo nombre de usuario"
                placeholderTextColor="#a0a0a0"
                value={newUsername}
                onChangeText={setNewUsername}
                returnKeyType="done"
                onSubmitEditing={handleSaveUsername} // Guarda al presionar "Done"
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity style={[styles.modalButton, styles.buttonCancel]} onPress={() => {setChangeUserModalVisible(false); Keyboard.dismiss();}}>
                  <Text style={styles.buttonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalButton, styles.buttonSave]} onPress={handleSaveUsername}>
                  <Text style={styles.buttonText}>Guardar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      )}
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
  scrollViewContent: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 40,
  },
  sectionCard: {
    backgroundColor: pastelColors.cardBackground,
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: pastelColors.text,
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 10,
  },
  currentUserText: {
    fontSize: 16,
    color: pastelColors.text,
    marginBottom: 10,
  },
  settingOption: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingOptionText: {
    fontSize: 16,
    color: pastelColors.text,
  },
  resetDataText: {
    color: pastelColors.deleteButton, // Color rojo para acción destructiva
    fontWeight: 'bold',
  },
  appVersionContainer: {
    marginTop: 15,
    alignItems: 'center',
  },
  appVersionText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
  // Estilos para el modal de cambio de usuario
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: pastelColors.modalBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: pastelColors.cardBackground,
    borderRadius: 15,
    padding: 25,
    width: '85%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: pastelColors.text,
    marginBottom: 20,
  },
  modalInput: {
    backgroundColor: '#fff',
    borderColor: pastelColors.inputBorder,
    borderWidth: 1,
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    color: pastelColors.text,
    width: '100%',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    borderRadius: 25,
    paddingVertical: 12,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  buttonCancel: {
    backgroundColor: pastelColors.accent,
  },
  buttonSave: {
    backgroundColor: pastelColors.primary,
  },
  buttonText: {
    color: pastelColors.buttonText,
    fontWeight: 'bold',
    fontSize: 16,
  },
  // Eliminamos estilos específicos del Picker si ya no se usa
  /*
  label: {
    fontSize: 16,
    color: pastelColors.text,
    alignSelf: 'flex-start',
    marginBottom: 5,
    marginTop: 10,
    fontWeight: 'bold',
  },
  pickerContainer: {
    borderColor: pastelColors.inputBorder,
    borderWidth: 1,
    borderRadius: 10,
    width: '100%',
    marginBottom: 15,
    overflow: 'hidden',
  },
  picker: {
    width: '100%',
    color: pastelColors.text,
  },
  pickerItem: {
    fontSize: 16,
    color: pastelColors.text,
  },
  */
});


