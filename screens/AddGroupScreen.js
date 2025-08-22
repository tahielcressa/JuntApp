// screens/AddGroupScreen.js
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert,
  Platform, KeyboardAvoidingView, ScrollView, TouchableWithoutFeedback, Keyboard,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import { getStatusBarHeight } from 'react-native-status-bar-height';

const pastelColors = {
  background: '#fef6e4',
  primary: '#8bd3dd',
  accent: '#f582ae',
  text: '#001858',
  buttonText: '#fff',
  buttonBg: '#8bd3dd',
  inputBorder: '#f582ae',
  backButtonText: '#001858',
};

const STATUS_BAR_HEIGHT = Platform.OS === 'ios' ? getStatusBarHeight(true) : 0;
const HEADER_TOP_OFFSET = STATUS_BAR_HEIGHT + 20;

export default function AddGroupScreen() {
  const navigation = useNavigation();
  const [groupName, setGroupName] = useState('');
  const [gatheringDate, setGatheringDate] = useState('');
  const [gatheringLocation, setGatheringLocation] = useState(''); 

  
  const formatAndSetGatheringDate = (text) => {
    
    let cleaned = text.replace(/\D/g, '');

    
    if (cleaned.length > 2 && cleaned.length <= 4) {
      cleaned = `${cleaned.substring(0, 2)}/${cleaned.substring(2)}`;
    } else if (cleaned.length > 4) {
      cleaned = `${cleaned.substring(0, 2)}/${cleaned.substring(2, 4)}/${cleaned.substring(4, 8)}`;
    }
    setGatheringDate(cleaned);
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      Alert.alert('Error', 'Por favor, ingresa un nombre para el grupo.');
      return;
    }

    if (gatheringDate.trim() && !/^\d{2}\/\d{2}\/\d{4}$/.test(gatheringDate.trim())) {
      Alert.alert('Error', 'Por favor, ingresa la fecha en formato DD/MM/YYYY.');
      return;
    }

    try {
      const newGroup = {
        id: uuidv4(),
        name: groupName.trim(),
        members: [],
        expenses: [],
        createdAt: new Date().toISOString(),
        gatheringDate: gatheringDate.trim() || null,
        gatheringLocation: gatheringLocation.trim() || null, // NUEVO: Guardar la dirección
      };

      const storedGroups = await AsyncStorage.getItem('groups');
      const currentGroups = storedGroups ? JSON.parse(storedGroups) : [];

      const groupExists = currentGroups.some(
        group => group.name.toLowerCase() === newGroup.name.toLowerCase()
      );
      if (groupExists) {
        Alert.alert('Error', `Ya existe un grupo llamado "${newGroup.name}". Por favor, elige otro nombre.`);
        return;
      }

      const updatedGroups = [...currentGroups, newGroup];
      await AsyncStorage.setItem('groups', JSON.stringify(updatedGroups));

      setGroupName('');
      setGatheringDate('');
      setGatheringLocation(''); // Limpiar el campo de dirección
      Alert.alert('Éxito', `Grupo "${newGroup.name}" creado correctamente.`);

      navigation.replace('Home', { newGroupId: newGroup.id });

    } catch (error) {
      console.error('Error al crear grupo:', error);
      Alert.alert('Error', 'No se pudo crear el grupo. Inténtalo de nuevo.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? HEADER_TOP_OFFSET + 40 : 80}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Text style={styles.backButtonText}>← Volver</Text>
            </TouchableOpacity>
            <View style={styles.placeHolderButton}></View>
          </View>

          <View style={styles.contentCentered}>
            <Text style={styles.title}>Crear Nuevo Grupo 👋</Text>
            
            <Text style={styles.label}>Nombre del Grupo:</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: Amigos del Fútbol"
              placeholderTextColor="#a0a0a0"
              value={groupName}
              onChangeText={setGroupName}
              onSubmitEditing={() => { /* No enviar, solo pasar al siguiente campo */ }}
              returnKeyType="next"
            />

            <Text style={styles.label}>Fecha de la Juntada (opcional):</Text>
            <TextInput
              style={styles.input}
              placeholder="DD/MM/YYYY"
              placeholderTextColor="#a0a0a0"
              value={gatheringDate}
              onChangeText={formatAndSetGatheringDate}
              keyboardType="numeric"
              maxLength={10}
              returnKeyType="next" // Cambiado a next para ir al siguiente campo
            />

            {/* NUEVO: Campo para la dirección */}
            <Text style={styles.label}>Lugar de la Juntada (opcional):</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: Calle Falsa 123, Ciudad"
              placeholderTextColor="#a0a0a0"
              value={gatheringLocation}
              onChangeText={setGatheringLocation}
              onSubmitEditing={handleCreateGroup} // Ahora este es el último campo antes de crear
              returnKeyType="done"
            />

            <TouchableOpacity style={styles.createButton} onPress={handleCreateGroup}>
              <Text style={styles.createButtonText}>Crear Grupo</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: pastelColors.background },
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: pastelColors.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: HEADER_TOP_OFFSET + 60,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    width: '100%', paddingHorizontal: 20,
    position: 'absolute',
    top: HEADER_TOP_OFFSET,
    left: 0, right: 0,
    paddingBottom: 20, backgroundColor: pastelColors.background, borderBottomWidth: 1,
    borderBottomColor: '#eee',
    zIndex: 1,
  },
  backButton: { padding: 5, width: 60, alignItems: 'flex-start' },
  backButtonText: { color: pastelColors.backButtonText, fontSize: 16, fontWeight: 'bold' },
  placeHolderButton: { width: 60 },
  contentCentered: {
    width: '100%',
    alignItems: 'center',
  },
  title: { fontSize: 26, fontWeight: 'bold', color: pastelColors.text, marginBottom: 30, textAlign: 'center' },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    color: pastelColors.text,
    marginBottom: 8,
    alignSelf: 'flex-start',
    marginTop: 15,
  },
  input: {
    backgroundColor: '#fff', borderColor: pastelColors.inputBorder, borderWidth: 1,
    borderRadius: 10, padding: 15, fontSize: 16, color: pastelColors.text,
    width: '90%', marginBottom: 15, elevation: 3,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3,
  },
  createButton: {
    backgroundColor: pastelColors.buttonBg, paddingVertical: 15, paddingHorizontal: 30,
    borderRadius: 30, width: '90%', alignItems: 'center', elevation: 8,
    marginTop: 30,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 5,
  },
  createButtonText: { color: pastelColors.buttonText, fontWeight: 'bold', fontSize: 18 },
});
