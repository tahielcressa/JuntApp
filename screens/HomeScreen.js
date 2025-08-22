// screens/HomeScreen.js

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  Platform,
  RefreshControl,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import AsyncStorage from '@react-native-async-storage/async-storage';

const pastelColors = {
  background: '#fef6e4',
  primary: '#8bd3dd',
  accent: '#f582ae',
  text: '#001858',
  buttonText: '#fff',
  cardBackground: '#8bd3dd',
  shadow: '#000',
  deleteButton: '#e74c3c',
  backButtonText: '#001858',
};

const STATUS_BAR_HEIGHT = Platform.OS === 'ios' ? getStatusBarHeight(true) : 0;
const HEADER_VERTICAL_PADDING = STATUS_BAR_HEIGHT + 30;

export default function HomeScreen() {
  const navigation = useNavigation();
  const [groups, setGroups] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadGroups = useCallback(async () => {
    try {
      setRefreshing(true);
      const storedGroups = await AsyncStorage.getItem('groups');
      setGroups(storedGroups ? JSON.parse(storedGroups) : []);
    } catch (error) {
      console.error("Error loading groups:", error);
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

  const handleDeleteGroup = async (groupIdToDelete) => {
    Alert.alert(
      'Eliminar Grupo',
      '¿Estás seguro de que quieres eliminar este grupo?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          onPress: async () => {
            try {
              const updatedGroups = groups.filter(group => group.id !== groupIdToDelete);
              await AsyncStorage.setItem('groups', JSON.stringify(updatedGroups));
              setGroups(updatedGroups);
              Alert.alert('Éxito', 'Grupo eliminado correctamente.');
            } catch (error) {
              console.error("Error deleting group:", error);
              Alert.alert('Error', 'No se pudo eliminar el grupo.');
            }
          },
        },
      ]
    );
  };

  const navigateToAddGroup = () => {
    navigation.navigate('AddGroup');
  };

  const handleMassDeleteGroups = () => {
    Alert.alert(
      'Eliminar Todos los Grupos',
      '¿Estás seguro de que quieres eliminar TODOS tus grupos?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar Todo',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('groups');
              setGroups([]);
              Alert.alert('Éxito', 'Todos los grupos han sido eliminados.');
            } catch (error) {
              console.error("Error deleting all groups:", error);
              Alert.alert('Error', 'No se pudieron eliminar todos los grupos.');
            }
          },
        },
      ]
    );
  };

  const renderGroupItem = ({ item: group }) => (
    <TouchableOpacity
      style={styles.groupCard}
      onPress={() => navigation.navigate('GroupDetails', { groupId: group.id, groupName: group.name })}
    >
      <Text style={styles.groupName}>{group.name}</Text>
      <TouchableOpacity onPress={() => handleDeleteGroup(group.id)} style={styles.deleteButton}>
        <Text style={styles.deleteButtonText}>X</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Encabezado */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tus Grupos</Text>
        <View style={styles.placeHolderButton}></View>
      </View>

      {groups.length === 0 ? (
        <Text style={styles.emptyListText}>No tienes grupos. ¡Crea uno para empezar!</Text>
      ) : (
        <FlatList
          data={groups}
          renderItem={renderGroupItem}
          keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadGroups} />}
          style={{ flex: 1 }}
          contentContainerStyle={styles.flatListContent}
          bounces={false}
        />
      )}

      {/* Botones inferiores */}
      <View style={styles.bottomButtonsContainer}>
        <TouchableOpacity style={styles.createGroupButton} onPress={navigateToAddGroup}>
          <Text style={styles.createGroupButtonText}>+ Crear Nuevo Grupo</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteMassButton} onPress={handleMassDeleteGroups}>
          <Text style={styles.deleteMassButtonText}>Eliminar Grupos</Text>
        </TouchableOpacity>
      </View>
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
  flatListContent: {
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 10,
  },
  emptyListText: {
    fontSize: 16,
    color: pastelColors.text,
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
  deleteButton: {
    backgroundColor: pastelColors.accent,
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  deleteButtonText: {
    color: pastelColors.buttonText,
    fontWeight: 'bold',
    fontSize: 16,
  },
  bottomButtonsContainer: {
    paddingHorizontal: 15,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
    backgroundColor: pastelColors.background,
    alignItems: 'center',
  },
  createGroupButton: {
    backgroundColor: pastelColors.primary,
    width: '100%',
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  createGroupButtonText: {
    color: pastelColors.buttonText,
    fontSize: 18,
    fontWeight: 'bold',
  },
  deleteMassButton: {
    backgroundColor: pastelColors.accent,
    width: '100%',
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  deleteMassButtonText: {
    color: pastelColors.buttonText,
    fontSize: 18,
    fontWeight: 'bold',
  },
});