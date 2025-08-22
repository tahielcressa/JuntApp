// screens/EditGroupScreen.js

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, Platform, ScrollView, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import AsyncStorage from '@react-native-async-storage/async-storage';

const pastelColors = {
  background: '#fef6e4',
  primary: '#8bd3dd',
  accent: '#f582ae',
  text: '#001858',
  buttonText: '#fff',
  inputBorder: '#f582ae',
  backButtonText: '#001858',
};

const STATUS_BAR_HEIGHT = Platform.OS === 'ios' ? getStatusBarHeight(true) : 0;
const HEADER_TOP_OFFSET_EDIT = STATUS_BAR_HEIGHT + 20;

export default function EditGroupScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { groupId } = route.params || {};

  const [groupName, setGroupName] = useState('');
  const [gatheringDate, setGatheringDate] = useState('');
  const [gatheringLocation, setGatheringLocation] = useState(''); // NUEVO: Estado para la dirección
  const [loading, setLoading] = useState(true);

  // Función para formatear la fecha automáticamente
  const formatAndSetGatheringDate = (text) => {
    let cleaned = text.replace(/\D/g, '');
    if (cleaned.length > 2 && cleaned.length <= 4) {
      cleaned = `${cleaned.substring(0, 2)}/${cleaned.substring(2)}`;
    } else if (cleaned.length > 4) {
      cleaned = `${cleaned.substring(0, 2)}/${cleaned.substring(2, 4)}/${cleaned.substring(4, 8)}`;
    }
    setGatheringDate(cleaned);
  };

  const loadGroupDetails = useCallback(async () => {
    if (!groupId) {
      Alert.alert('Error', 'ID de grupo no proporcionado para editar.');
      navigation.goBack();
      return;
    }
    try {
      const storedGroups = await AsyncStorage.getItem('groups');
      const groupsArray = storedGroups ? JSON.parse(storedGroups) : [];
      const foundGroup = groupsArray.find(g => g.id === groupId);

      if (foundGroup) {
        setGroupName(foundGroup.name);
        setGatheringDate(foundGroup.gatheringDate || '');
        setGatheringLocation(foundGroup.gatheringLocation || ''); // NUEVO: Cargar la dirección existente
      } else {
        Alert.alert('Error', 'Grupo no encontrado para editar.');
        navigation.goBack();
      }
    } catch (error) {
      console.error("Error loading group for edit:", error);
      Alert.alert('Error', 'No se pudo cargar el grupo para editar.');
    } finally {
      setLoading(false);
    }
  }, [groupId, navigation]);

  useFocusEffect(
    useCallback(() => {
      loadGroupDetails();
    }, [loadGroupDetails])
  );

  const handleSaveGroupName = async () => {
    if (!groupName.trim()) {
      Alert.alert('Error', 'El nombre del grupo no puede estar vacío.');
      return;
    }

    if (gatheringDate.trim() && !/^\d{2}\/\d{2}\/\d{4}$/.test(gatheringDate.trim())) {
      Alert.alert('Error', 'Por favor, ingresa la fecha en formato DD/MM/YYYY.');
      return;
    }

    try {
      const storedGroups = await AsyncStorage.getItem('groups');
      const groupsArray = storedGroups ? JSON.parse(storedGroups) : [];

      const nameExists = groupsArray.some(g => g.id !== groupId && g.name.toLowerCase() === groupName.trim().toLowerCase());
      if (nameExists) {
        Alert.alert('Error', 'Ya existe otro grupo con este nombre. Por favor, elige uno diferente.');
        return;
      }

      const updatedGroups = groupsArray.map(g => {
        if (g.id === groupId) {
          return {
            ...g,
            name: groupName.trim(),
            gatheringDate: gatheringDate.trim() || null,
            gatheringLocation: gatheringLocation.trim() || null, // NUEVO: Guardar la dirección editada
          };
        }
        return g;
      });
      await AsyncStorage.setItem('groups', JSON.stringify(updatedGroups));
      Alert.alert('Éxito', 'Grupo actualizado correctamente.');
      navigation.goBack();
    } catch (error) {
      console.error("Error saving group name:", error);
      Alert.alert('Error', 'No se pudo actualizar el grupo.');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Cargando grupo...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? HEADER_TOP_OFFSET_EDIT + 40 : 80}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
          {/* Encabezado con botón de volver */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Text style={styles.backButtonText}>← Volver</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Editar Grupo</Text>
            <View style={styles.placeHolderButton}></View>
          </View>

          <View style={styles.contentCentered}>
            <Text style={styles.label}>Nombre del Grupo:</Text>
            <TextInput
              style={styles.input}
              placeholder="Nuevo nombre del grupo"
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
              returnKeyType="next"
            />

            {/* NUEVO: Campo para editar la dirección */}
            <Text style={styles.label}>Lugar de la Juntada (opcional):</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: Calle Falsa 123, Ciudad"
              placeholderTextColor="#a0a0a0"
              value={gatheringLocation}
              onChangeText={setGatheringLocation}
              onSubmitEditing={handleSaveGroupName} // Este es el último campo antes de guardar
              returnKeyType="done"
            />

            <TouchableOpacity style={styles.saveButton} onPress={handleSaveGroupName}>
              <Text style={styles.saveButtonText}>Guardar Cambios</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
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
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: HEADER_TOP_OFFSET_EDIT + 60,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
    position: 'absolute',
    top: HEADER_TOP_OFFSET_EDIT,
    left: 0, right: 0,
    paddingBottom: 10,
    backgroundColor: pastelColors.background,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    zIndex: 1,
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
  contentCentered: {
    width: '100%',
    alignItems: 'center',
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    color: pastelColors.text,
    marginBottom: 8,
    alignSelf: 'flex-start',
    marginTop: 15,
  },
  input: {
    backgroundColor: '#fff',
    borderColor: pastelColors.inputBorder,
    borderWidth: 1,
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    color: pastelColors.text,
    width: '90%',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  saveButton: {
    backgroundColor: pastelColors.primary,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    width: '90%',
    alignItems: 'center',
    marginTop: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 8,
  },
  saveButtonText: {
    color: pastelColors.buttonText,
    fontWeight: 'bold',
    fontSize: 18,
  },
});
