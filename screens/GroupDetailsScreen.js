// screens/GroupDetailsScreen.js

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  RefreshControl,
  Image,
  Modal,
  Linking, // NUEVO: Importa Linking para abrir URLs (mapas)
} from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import * as ImagePicker from 'expo-image-picker';

// Importa los modales que creamos en la carpeta 'components'
import AddMemberModal from '../components/AddMemberModal';
import AddExpenseModal from '../components/AddExpenseModal';
import EditExpenseModal from '../components/EditExpenseModal';
import EditMemberModal from '../components/EditMemberModal';

const pastelColors = {
  background: '#fef6e4',
  primary: '#8bd3dd',
  accent: '#f582ae',
  text: '#001858',
  buttonText: '#fff',
  cardBackground: '#fff',
  shadow: '#000',
  deleteButton: '#e74c3c',
  editButtonColor: '#007bff',
  balancePositive: '#28a745',
  balanceNegative: '#dc3545',
  totalSpentColor: '#001858',
  eachShouldPayColor: '#8bd3dd',
  backButtonText: '#001858',
  receiptIconColor: '#555',
  paidStatusColor: '#28a745',
  unpaidStatusColor: '#6c757d',
  consequenceButton: '#f582ae',
  mapButtonColor: '#4CAF50', // Color para el botón del mapa
};

const STATUS_BAR_HEIGHT = Platform.OS === 'ios' ? getStatusBarHeight(true) : 0;
const HEADER_VERTICAL_PADDING = STATUS_BAR_HEIGHT + 40;

// Lista de consecuencias divertidas
const consequences = [
  "lavar todos los platos de la juntada.",
  "comprar la próxima ronda de bebidas.",
  "ser el DJ de la próxima juntada (sin quejas).",
  "limpiar el asador después de la próxima comida.",
  "contar un chiste malo cada 10 minutos por una hora.",
  "hacer un baile ridículo para todos.",
  "preparar los snacks para la próxima reunión.",
  "ser el chofer designado de la próxima salida.",
  "organizar la próxima juntada (¡todo incluido!).",
  "usar un sombrero ridículo por el resto del día.",
];

export default function GroupDetailsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { groupId, groupName: initialGroupName, openAddExpenseModal = false } = route.params || {};

  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isAddMemberModalVisible, setAddMemberModalVisible] = useState(false);
  const [isAddExpenseModalVisible, setAddExpenseModalVisible] = useState(false);
  const [isEditExpenseModalVisible, setEditExpenseModalVisible] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState(null);
  const [isEditMemberModalVisible, setEditMemberModalVisible] = useState(false);
  const [memberToEdit, setMemberToEdit] = useState(null);
  const [isImageViewerVisible, setImageViewerVisible] = useState(false);
  const [currentImageUri, setCurrentImageUri] = useState(null);
  const [mouseConsequence, setMouseConsequence] = useState('');

  const loadGroupDetails = useCallback(async () => {
    if (!groupId) {
      console.error("Error: Group ID is undefined when loading details.");
      Alert.alert("Error", "ID de grupo no proporcionado.");
      setLoading(false);
      navigation.goBack();
      return;
    }
    try {
      setRefreshing(true);
      const storedGroups = await AsyncStorage.getItem('groups');
      const groupsArray = storedGroups ? JSON.parse(storedGroups) : [];
      const foundGroup = groupsArray.find(g => g.id === groupId);

      if (foundGroup) {
        const membersWithPaidStatus = foundGroup.members.map(member => ({
          ...member,
          hasPaid: member.hasPaid === undefined ? false : member.hasPaid,
        }));
        setGroup({ ...foundGroup, members: membersWithPaidStatus });

        if (openAddExpenseModal) {
          setAddExpenseModalVisible(true);
          navigation.setParams({ openAddExpenseModal: false });
        }
      } else {
        Alert.alert('Error', 'Grupo no encontrado.');
        navigation.goBack();
      }
    } catch (error) {
      console.error("Error loading group details:", error);
      Alert.alert('Error', 'No se pudieron cargar los detalles del grupo.');
      navigation.goBack();
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [groupId, navigation, openAddExpenseModal]);

  useFocusEffect(
    useCallback(() => {
      loadGroupDetails();
    }, [loadGroupDetails])
  );

  const saveGroup = async (updatedGroup) => {
    try {
      const storedGroups = await AsyncStorage.getItem('groups');
      const groupsArray = storedGroups ? JSON.parse(storedGroups) : [];
      const updatedGroups = groupsArray.map(g =>
        g.id === updatedGroup.id ? updatedGroup : g
      );
      await AsyncStorage.setItem('groups', JSON.stringify(updatedGroups));
      setGroup(updatedGroup);
    } catch (error) {
      console.error("Error saving group:", error);
      Alert.alert('Error', 'No se pudieron guardar los cambios en el grupo.');
    }
  };

  const handleAddMember = async (newMemberName) => {
    if (group) {
      if (group.members.some(member => member.name.toLowerCase() === newMemberName.toLowerCase())) {
        Alert.alert('Duplicado', 'Este miembro ya existe en el grupo.');
        return;
      }
      const updatedGroup = { ...group };
      const newMember = { id: uuidv4(), name: newMemberName, hasPaid: false };
      updatedGroup.members.push(newMember);
      await saveGroup(updatedGroup);
      Alert.alert('Éxito', `${newMemberName} añadido al grupo.`);
    }
  };

  const handleEditMember = (member) => {
    setMemberToEdit(member);
    setEditMemberModalVisible(true);
  };

  const handleSaveEditedMember = async (updatedMemberData) => {
    if (group) {
      const updatedGroup = { ...group };
      
      updatedGroup.members = updatedGroup.members.map(m =>
        m.id === updatedMemberData.id ? { ...m, name: updatedMemberData.name } : m
      );

      updatedGroup.expenses = updatedGroup.expenses.map(expense => {
        if (expense.payerId === updatedMemberData.id) {
          return { ...expense, payerName: updatedMemberData.name };
        }
        return expense;
      });

      await saveGroup(updatedGroup);
      Alert.alert('Éxito', `Miembro "${updatedMemberData.name}" actualizado.`);
      setEditMemberModalVisible(false);
      setMemberToEdit(null);
    }
  };

  const handleDeleteMember = async (memberId) => {
    Alert.alert(
      "Eliminar Miembro",
      "¿Estás seguro de que quieres eliminar a este miembro? Sus gastos se reasignarán a 'Desconocido' y sus partes en los gastos se eliminarán.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          onPress: async () => {
            if (group) {
              const memberToDelete = group.members.find(m => m.id === memberId);
              if (!memberToDelete) return;

              const updatedGroup = { ...group };
              updatedGroup.members = updatedGroup.members.filter(m => m.id !== memberId);

              updatedGroup.expenses = updatedGroup.expenses.map(expense => {
                let newExpense = { ...expense };

                if (newExpense.payerId === memberId) {
                  newExpense.payerId = 'unknown';
                  newExpense.payerName = "Desconocido";
                }

                if (newExpense.participants && newExpense.participants.includes(memberId)) {
                  newExpense.participants = newExpense.participants.filter(id => id !== memberId);
                  
                  if (newExpense.shares) {
                    newExpense.shares = newExpense.shares.filter(s => s.memberId !== memberId);
                  }
                }
                if (newExpense.hasOwnProperty('individualShare')) {
                  delete newExpense.individualShare;
                }
                return newExpense;
              });
              await saveGroup(updatedGroup);
              Alert.alert('Éxito', `${memberToDelete.name} eliminado.`);
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  const handleAddExpense = async (newExpenseData) => {
    if (group) {
      const updatedGroup = { ...group };
      const newExpense = { ...newExpenseData, id: uuidv4() };
      updatedGroup.expenses.push(newExpense);
      await saveGroup(updatedGroup);
      Alert.alert('Éxito', `Gasto de $${newExpense.amount.toFixed(2)} añadido.`);
    }
  };

  const handleEditExpense = (expense) => {
    setExpenseToEdit(expense);
    setEditExpenseModalVisible(true);
  };

  const handleSaveEditedExpense = async (updatedExpenseData) => {
    if (group) {
      const updatedGroup = { ...group };
      updatedGroup.expenses = updatedGroup.expenses.map(exp =>
        exp.id === updatedExpenseData.id ? updatedExpenseData : exp
      );
      await saveGroup(updatedGroup);
      Alert.alert('Éxito', `Gasto de $${updatedExpenseData.amount.toFixed(2)} actualizado.`);
      setEditExpenseModalVisible(false);
      setExpenseToEdit(null);
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    Alert.alert(
      "Eliminar Gasto",
      "¿Estás seguro de que quieres eliminar este gasto?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          onPress: async () => {
            if (group) {
              const updatedGroup = { ...group };
              updatedGroup.expenses = updatedGroup.expenses.filter(exp => exp.id !== expenseId);
              await saveGroup(updatedGroup);
              Alert.alert('Éxito', 'Gasto eliminado.');
            }
          }
        }
      ]
    );
  };

  const handlePickReceiptImage = async (expenseId) => {
    Alert.alert(
      "Añadir/Editar Recibo",
      "¿Deseas seleccionar una imagen de la galería o tomar una foto nueva?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Galería",
          onPress: async () => await pickImage(expenseId, ImagePicker.MediaTypeOptions.Images),
        },
        {
          text: "Cámara",
          onPress: async () => await takePhoto(expenseId),
        },
      ]
    );
  };

  const pickImage = async (expenseId, mediaType) => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: mediaType,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const base64Image = result.assets[0].base64;
      await updateExpenseReceipt(expenseId, base64Image);
    }
  };

  const takePhoto = async (expenseId) => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Necesitamos permiso para acceder a la cámara para tomar fotos.');
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const base64Image = result.assets[0].base64;
      await updateExpenseReceipt(expenseId, base64Image);
    }
  };

  const updateExpenseReceipt = async (expenseId, base64Image) => {
    if (group) {
      const updatedGroup = { ...group };
      updatedGroup.expenses = updatedGroup.expenses.map(exp => {
        if (exp.id === expenseId) {
          return { ...exp, receiptImage: base64Image };
        }
        return exp;
      });
      await saveGroup(updatedGroup);
      Alert.alert('Éxito', 'Recibo añadido/actualizado.');
    }
  };

  const handleViewReceipt = (base64Image) => {
    setCurrentImageUri(`data:image/jpeg;base64,${base64Image}`);
    setImageViewerVisible(true);
  };

  const toggleMemberPaidStatus = async (memberId) => {
    if (group) {
      const updatedGroup = { ...group };
      updatedGroup.members = updatedGroup.members.map(member => {
        if (member.id === memberId) {
          return { ...member, hasPaid: !member.hasPaid };
        }
        return member;
      });
      await saveGroup(updatedGroup);
      Alert.alert('Estado Actualizado', `El estado de pago de ${updatedGroup.members.find(m => m.id === memberId)?.name} ha sido actualizado.`);
    }
  };

  const handleConsequenceForMouse = () => {
    const potentialMice = group.members.filter(member =>
      balances[member.id] < -0.01 && !member.hasPaid
    );

    if (potentialMice.length === 0) {
      Alert.alert(
        "¡No hay ratones hoy! 🎉",
        "Todos los miembros con deudas pendientes han saldado sus cuentas o no hay deudas significativas. ¡Felicidades!"
      );
      setMouseConsequence('');
      return;
    }

    potentialMice.sort((a, b) => balances[a.id] - balances[b.id]);
    const theMouse = potentialMice[0];
    const randomConsequence = consequences[Math.floor(Math.random() * consequences.length)];
    const message = `¡El ratón es ${theMouse.name}! Su consecuencia es: ${randomConsequence}`;
    setMouseConsequence(message);
    Alert.alert("¡Consequence para el Ratón! 🐭", message);
  };

  // NUEVO: Función para abrir la dirección en un mapa
  const openMap = async (address) => {
    const url = Platform.select({
      ios: `http://maps.apple.com/?q=${encodeURIComponent(address)}`,
      android: `geo:0,0?q=${encodeURIComponent(address)}`,
    });

    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'No se pudo abrir la aplicación de mapas. Asegúrate de tener una instalada.');
      }
    } catch (error) {
      console.error('Error al abrir el mapa:', error);
      Alert.alert('Error', 'Hubo un problema al intentar abrir el mapa.');
    }
  };

  const { totalSpent, eachShouldPay, balances } = useMemo(() => {
    if (!group || !group.members || group.members.length === 0) {
      return { totalSpent: 0, eachShouldPay: 0, balances: {} };
    }

    let totalSpentCalc = 0;
    const memberPayments = group.members.reduce((acc, member) => {
      acc[member.id] = 0;
      return acc;
    }, {});
    const memberDebts = group.members.reduce((acc, member) => {
      acc[member.id] = 0;
      return acc;
    }, {});

    group.expenses.forEach(expense => {
      totalSpentCalc += expense.amount;
      
      if (memberPayments.hasOwnProperty(expense.payerId)) {
        memberPayments[expense.payerId] += expense.amount;
      }

      if (expense.shares && expense.shares.length > 0) {
        expense.shares.forEach(shareEntry => {
          if (memberDebts.hasOwnProperty(shareEntry.memberId)) {
            memberDebts[shareEntry.memberId] += shareEntry.share;
          }
        });
      } else if (expense.participants && expense.participants.length > 0) {
        const sharePerParticipant = expense.amount / expense.participants.length;
        expense.participants.forEach(participantId => {
          if (memberDebts.hasOwnProperty(participantId)) {
            memberDebts[participantId] += sharePerParticipant;
          }
        });
      }
    });

    const calculatedBalances = {};
    group.members.forEach(member => {
      calculatedBalances[member.id] = memberPayments[member.id] - memberDebts[member.id];
    });

    const calculatedEachShouldPay = group.members.length > 0 ? totalSpentCalc / group.members.length : 0;

    return { totalSpent: totalSpentCalc, eachShouldPay: calculatedEachShouldPay, balances: calculatedBalances };
  }, [group]);

  const transactions = useMemo(() => {
    if (!group || !group.members || group.members.length === 0) {
      return [];
    }

    const debtors = [];
    const creditors = [];

    const balancesArray = Object.keys(balances).map(memberId => {
      const member = group.members.find(m => m.id === memberId);
      if (member && !member.hasPaid) {
        return {
          id: memberId,
          name: member.name,
          amount: balances[memberId],
        };
      }
      return null;
    }).filter(Boolean);

    balancesArray.forEach(member => {
      if (member.amount < 0) {
        debtors.push({ ...member, amount: Math.abs(member.amount) });
      } else if (member.amount > 0) {
        creditors.push(member);
      }
    });

    debtors.sort((a, b) => b.amount - a.amount);
    creditors.sort((a, b) => b.amount - a.amount);

    const calculatedTransactions = [];

    let i = 0;
    let j = 0;

    while (i < debtors.length && j < creditors.length) {
      const debtor = debtors[i];
      const creditor = creditors[j];

      const amountToTransfer = Math.min(debtor.amount, creditor.amount);

      if (amountToTransfer > 0.01) {
        calculatedTransactions.push({
          from: debtor.name,
          to: creditor.name,
          amount: amountToTransfer,
        });

        debtor.amount -= amountToTransfer;
        creditor.amount -= amountToTransfer;
      }

      if (debtor.amount <= 0.01) {
        i++;
      }
      if (creditor.amount <= 0.01) {
        j++;
      }
    }
    return calculatedTransactions;
  }, [group, balances]);

  if (loading || !group) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Cargando detalles del grupo...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Encabezado de la pantalla de detalles del grupo */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{group.name}</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('EditGroup', { groupId: group.id })}
          style={styles.editButton}
        >
          <Text style={styles.editButtonText}>✏️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollViewContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={loadGroupDetails} />
        }
      >
        {/* Sección: Información de la Juntada */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Información de la Juntada</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Fecha:</Text>
            <Text style={styles.infoValue}>
              {group.gatheringDate ? group.gatheringDate : 'No especificada'}
            </Text>
          </View>
          {/* NUEVO: Mostrar la dirección y botón de mapa si existe */}
          {group.gatheringLocation ? (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Lugar:</Text>
              <View style={styles.locationContainer}>
                <Text style={styles.infoValue}>{group.gatheringLocation}</Text>
                <TouchableOpacity
                  onPress={() => openMap(group.gatheringLocation)}
                  style={styles.mapButton}
                >
                  <Text style={styles.mapButtonText}>📍 Abrir Mapa</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Lugar:</Text>
              <Text style={styles.infoValue}>No especificado</Text>
            </View>
          )}
        </View>

        {/* Sección: Resumen de Gastos */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Resumen de Gastos</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Gastado:</Text>
            <Text style={styles.summaryValue}>${totalSpent.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Cada uno debería aportar (promedio):</Text>
            <Text style={[styles.summaryValue, styles.summaryValueFlex]}>${eachShouldPay.toFixed(2)}</Text>
          </View>
        </View>

        {/* Sección: Miembros */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Miembros</Text>
          {group.members.length === 0 ? (
            <Text style={styles.emptyText}>No hay miembros en este grupo.</Text>
          ) : (
            group.members.map(member => (
              <View key={member.id} style={styles.itemRow}>
                <Text style={styles.itemName}>{member.name}</Text>
                <View style={styles.memberActions}>
                  <TouchableOpacity onPress={() => handleEditMember(member)} style={styles.editItemButton}>
                    <Text style={styles.editItemButtonText}>✏️</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDeleteMember(member.id)} style={styles.deleteItemButton}>
                    <Text style={styles.deleteItemButtonText}>X</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
          <TouchableOpacity style={styles.addButton} onPress={() => setAddMemberModalVisible(true)}>
            <Text style={styles.addButtonText}>+ Añadir Miembro</Text>
          </TouchableOpacity>
        </View>

        {/* Sección: Gastos */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Gastos</Text>
          {group.expenses.length === 0 ? (
            <Text style={styles.emptyText}>No hay gastos registrados en este grupo.</Text>
          ) : (
            group.expenses.map(expense => (
              <View key={expense.id} style={styles.itemRow}>
                <View style={styles.expenseDetails}>
                  <Text style={styles.expenseDescription}>{expense.description}</Text>
                  <Text style={styles.expenseInfo}>Monto: ${expense.amount.toFixed(2)}</Text>
                  <Text style={styles.expenseInfo}>Pagado por: {expense.payerName}</Text>
                  {expense.category && (
                    <Text style={styles.expenseInfo}>Categoría: {expense.category}</Text>
                  )}
                  {expense.shares && expense.shares.length > 0 && (
                    <Text style={styles.expenseInfo}>
                      Aporte individual: ${expense.shares[0].share.toFixed(2)}
                    </Text>
                  )}
                </View>
                <View style={styles.expenseActions}>
                  <TouchableOpacity onPress={() => handlePickReceiptImage(expense.id)} style={styles.receiptButton}>
                    <Text style={styles.receiptButtonText}>🧾</Text>
                  </TouchableOpacity>
                  {expense.receiptImage && (
                    <TouchableOpacity onPress={() => handleViewReceipt(expense.receiptImage)}>
                      <Image
                        source={{ uri: `data:image/jpeg;base64,${expense.receiptImage}` }}
                        style={styles.receiptThumbnail}
                      />
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity onPress={() => handleEditExpense(expense)} style={styles.editItemButton}>
                    <Text style={styles.editItemButtonText}>✏️</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDeleteExpense(expense.id)} style={styles.deleteItemButton}>
                    <Text style={styles.deleteItemButtonText}>X</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
          <TouchableOpacity style={styles.addButton} onPress={() => setAddExpenseModalVisible(true)}>
            <Text style={styles.addButtonText}>+ Añadir Gasto</Text>
          </TouchableOpacity>
        </View>

        {/* Sección: Balances Individuales */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Balances Individuales</Text>
          {group.members.length === 0 ? (
            <Text style={styles.emptyText}>Añade miembros para ver los balances.</Text>
          ) : (
            group.members.map(member => (
              <View key={member.id} style={styles.balanceRow}>
                <Text style={styles.balanceName}>{member.name}:</Text>
                <Text style={[
                  styles.balanceAmount,
                  balances[member.id] < 0 ? styles.balanceNegative : styles.balancePositive
                ]}>
                  {Math.abs(balances[member.id]) < 0.01 ? '$0.00' : `${balances[member.id] < 0 ? '-$' : '$'}${Math.abs(balances[member.id]).toFixed(2)}`}
                </Text>
                <TouchableOpacity
                  onPress={() => toggleMemberPaidStatus(member.id)}
                  style={[
                    styles.paidStatusButton,
                    member.hasPaid ? styles.paidButton : styles.unpaidButton
                  ]}
                >
                  <Text style={styles.paidStatusButtonText}>
                    {member.hasPaid ? 'Pagado ✅' : 'Pendiente ⏳'}
                  </Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        {/* Sección: Cómo Saldo las Cuentas */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Cómo Saldo las Cuentas (Pendientes)</Text>
          {transactions.length === 0 ? (
            <Text style={styles.emptyText}>¡Las cuentas de los miembros pendientes están saldadas!</Text>
          ) : (
            transactions.map((t, index) => (
              <View key={index} style={styles.transactionRow}>
                <Text style={styles.transactionText}>
                  <Text style={styles.transactionDebtor}>{t.from}</Text> le debe <Text style={styles.transactionAmount}>${t.amount.toFixed(2)}</Text> a <Text style={styles.transactionCreditor}>{t.to}</Text>
                </Text>
              </View>
            ))
          )}
        </View>

        {/* Botón "¿Quién paga hoy?" para el random picker */}
        <TouchableOpacity
          style={styles.randomPickerButton}
          onPress={() => navigation.navigate('RandomPicker', { groupId: group.id })}
          disabled={group.members.length === 0}
        >
          <Text style={styles.randomPickerButtonText}>
            ¿Quién paga hoy? 🎲
          </Text>
        </TouchableOpacity>

        {/* Botón "Consecuencia para el Ratón" */}
        <TouchableOpacity
          style={[styles.randomPickerButton, styles.consequenceButton]}
          onPress={handleConsequenceForMouse}
          disabled={group.members.length === 0}
        >
          <Text style={styles.randomPickerButtonText}>
            Consecuencia para el Ratón 🐭
          </Text>
        </TouchableOpacity>

        {mouseConsequence ? (
          <View style={styles.consequenceDisplayCard}>
            <Text style={styles.consequenceText}>{mouseConsequence}</Text>
          </View>
        ) : null}

      </ScrollView>

      {/* Modales */}
      <AddMemberModal
        isVisible={isAddMemberModalVisible}
        onClose={() => setAddMemberModalVisible(false)}
        onAddMember={handleAddMember}
      />
      <AddExpenseModal
        isVisible={isAddExpenseModalVisible}
        onClose={() => setAddExpenseModalVisible(false)}
        onAddExpense={handleAddExpense}
        members={group.members}
      />
      <EditExpenseModal
        isVisible={isEditExpenseModalVisible}
        onClose={() => {
          setEditExpenseModalVisible(false);
          setExpenseToEdit(null);
        }}
        onSaveExpense={handleSaveEditedExpense}
        members={group.members}
        expenseToEdit={expenseToEdit}
      />
      <EditMemberModal
        isVisible={isEditMemberModalVisible}
        onClose={() => {
          setEditMemberModalVisible(false);
          setMemberToEdit(null);
        }}
        onSaveMember={handleSaveEditedMember}
        memberToEdit={memberToEdit}
      />
      <Modal
        visible={isImageViewerVisible}
        transparent={true}
        onRequestClose={() => setImageViewerVisible(false)}
      >
        <View style={styles.fullScreenImageViewer}>
          <TouchableOpacity style={styles.closeImageViewerButton} onPress={() => setImageViewerVisible(false)}>
            <Text style={styles.closeImageViewerButtonText}>X</Text>
          </TouchableOpacity>
          {currentImageUri && (
            <Image source={{ uri: currentImageUri }} style={styles.fullScreenImage} resizeMode="contain" />
          )}
        </View>
      </Modal>
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
  editButton: {
    padding: 5,
    width: 60,
    alignItems: 'flex-end',
  },
  editButtonText: {
    fontSize: 20,
    color: pastelColors.text,
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingHorizontal: 15,
    paddingTop: 10,
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
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    alignItems: 'center', // Alinea verticalmente los elementos en la fila
  },
  infoLabel: {
    fontSize: 16,
    color: pastelColors.text,
    fontWeight: 'bold',
  },
  infoValue: {
    fontSize: 16,
    color: pastelColors.text,
    flexShrink: 1, // Permite que el texto se encoja si es muy largo
  },
  locationContainer: { // NUEVO: Contenedor para la dirección y el botón del mapa
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  mapButton: { // NUEVO: Estilo para el botón del mapa
    backgroundColor: pastelColors.mapButtonColor,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 15,
    marginLeft: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  mapButtonText: { // NUEVO: Estilo para el texto del botón del mapa
    color: pastelColors.buttonText,
    fontSize: 14,
    fontWeight: 'bold',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  summaryLabel: {
    fontSize: 16,
    color: pastelColors.text,
    flexShrink: 1,
    marginRight: 10,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: pastelColors.totalSpentColor,
  },
  summaryValueFlex: {
    flexShrink: 0,
    flexWrap: 'wrap',
    textAlign: 'right',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 10,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  itemName: {
    fontSize: 16,
    color: pastelColors.text,
    flex: 1,
  },
  expenseDetails: {
    flex: 1,
  },
  expenseDescription: {
    fontSize: 16,
    fontWeight: 'bold',
    color: pastelColors.text,
  },
  expenseInfo: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  expenseActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  receiptButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: pastelColors.receiptIconColor,
    marginRight: 8,
  },
  receiptButtonText: {
    fontSize: 16,
    lineHeight: 20,
    color: pastelColors.buttonText,
  },
  receiptThumbnail: {
    width: 30,
    height: 30,
    borderRadius: 5,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  editItemButton: {
    backgroundColor: pastelColors.editButtonColor,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  editItemButtonText: {
    color: pastelColors.buttonText,
    fontSize: 14,
    fontWeight: 'bold',
  },
  deleteItemButton: {
    backgroundColor: pastelColors.deleteButton,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteItemButtonText: {
    color: pastelColors.buttonText,
    fontSize: 14,
    fontWeight: 'bold',
  },
  memberActions: {
    flexDirection: 'row',
    marginLeft: 10,
  },
  addButton: {
    backgroundColor: pastelColors.primary,
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  addButtonText: {
    color: pastelColors.buttonText,
    fontSize: 16,
    fontWeight: 'bold',
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  balanceName: {
    fontSize: 16,
    color: pastelColors.text,
    fontWeight: 'bold',
  },
  balanceAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  balanceNegative: {
    color: pastelColors.balanceNegative,
  },
  balancePositive: {
    color: pastelColors.balancePositive,
  },
  paidStatusButton: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 15,
    marginLeft: 10,
  },
  paidButton: {
    backgroundColor: pastelColors.paidStatusColor,
  },
  unpaidButton: {
    backgroundColor: pastelColors.unpaidStatusColor,
  },
  paidStatusButtonText: {
    color: pastelColors.buttonText,
    fontSize: 12,
    fontWeight: 'bold',
  },
  transactionRow: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  transactionText: {
    fontSize: 16,
    color: pastelColors.text,
  },
  transactionDebtor: {
    fontWeight: 'bold',
    color: pastelColors.balanceNegative,
  },
  transactionCreditor: {
    fontWeight: 'bold',
    color: pastelColors.balancePositive,
  },
  transactionAmount: {
    fontWeight: 'bold',
    color: pastelColors.text,
  },
  randomPickerButton: {
    backgroundColor: pastelColors.primary,
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 20,
    width: '90%',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 8,
  },
  randomPickerButtonText: {
    color: pastelColors.buttonText,
    fontWeight: 'bold',
    fontSize: 18,
  },
  consequenceButton: {
    backgroundColor: pastelColors.accent,
    marginTop: 10,
  },
  consequenceDisplayCard: {
    backgroundColor: pastelColors.cardBackground,
    borderRadius: 15,
    padding: 20,
    marginVertical: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    width: '90%',
    alignSelf: 'center',
    borderWidth: 2,
    borderColor: pastelColors.accent,
  },
  consequenceText: {
    fontSize: 16,
    color: pastelColors.text,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  fullScreenImageViewer: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: '100%',
    height: '100%',
  },
  closeImageViewerButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? STATUS_BAR_HEIGHT + 20 : 40,
    right: 20,
    zIndex: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeImageViewerButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
});
