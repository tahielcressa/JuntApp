// components/EditExpenseModal.js

import React, { useState, useEffect } from 'react';
import {
  Modal, View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, Alert, TouchableWithoutFeedback, Keyboard
} from 'react-native';
import { Picker } from '@react-native-picker/picker';

const pastelColors = {
  background: '#fef6e4',
  primary: '#8bd3dd',
  accent: '#f582ae',
  text: '#001858',
  buttonText: '#fff',
  cardBackground: '#fff',
  inputBorder: '#f582ae',
  modalBackground: 'rgba(0, 0, 0, 0.5)', // Fondo semitransparente para el modal
  checkboxBorder: '#ccc',
  checkboxChecked: '#8bd3dd',
  errorText: '#e74c3c',
};

// Categorías predefinidas para los gastos (debe coincidir con AddExpenseModal)
const expenseCategories = [
  'Comida',
  'Bebida',
  'Alcohol',
  'Carbon',
  'Transporte',
  'Alojamiento',
  'Entretenimiento',
  'Otros',
];

/**
 * Modal para editar un gasto existente.
 * Permite modificar la descripción, monto, pagador, participantes y categoría de un gasto.
 *
 * @param {object} props - Las propiedades del componente.
 * @param {boolean} props.isVisible - Controla la visibilidad del modal.
 * @param {function} props.onClose - Función para cerrar el modal.
 * @param {function} props.onSaveExpense - Función que se llama al guardar los cambios del gasto.
 * @param {Array<object>} props.members - Lista de miembros del grupo.
 * @param {object | null} props.expenseToEdit - El objeto de gasto a editar. Si es null, el modal no se precargará.
 */
export default function EditExpenseModal({ isVisible, onClose, onSaveExpense, members, expenseToEdit }) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [payerId, setPayerId] = useState('');
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [category, setCategory] = useState(expenseCategories[0]);

  // Efecto para precargar los datos del gasto cuando el modal se hace visible
  // o cuando expenseToEdit cambia.
  useEffect(() => {
    if (isVisible && expenseToEdit) {
      setDescription(expenseToEdit.description);
      setAmount(expenseToEdit.amount.toString()); // Convertir a string para TextInput
      setPayerId(expenseToEdit.payerId);
      setSelectedParticipants(expenseToEdit.participants || []); // Asegurarse de que sea un array
      setCategory(expenseToEdit.category || expenseCategories[0]); // Precargar categoría o la primera por defecto
    } else if (isVisible) {
      // Si el modal se abre sin un gasto para editar, resetear los campos
      setDescription('');
      setAmount('');
      setCategory(expenseCategories[0]);
      if (members && members.length > 0) {
        setPayerId(members[0].id);
        setSelectedParticipants(members.map(m => m.id));
      } else {
        setPayerId('');
        setSelectedParticipants([]);
      }
    }
  }, [isVisible, expenseToEdit, members]);

  // Función para alternar la selección de un participante
  const toggleParticipant = (memberId) => {
    setSelectedParticipants(prev => {
      if (prev.includes(memberId)) {
        return prev.filter(id => id !== memberId);
      } else {
        return [...prev, memberId];
      }
    });
  };

  // Manejador para guardar los cambios del gasto
  const handleSaveExpense = () => {
    const parsedAmount = parseFloat(amount);

    if (!description.trim() || isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Error', 'Por favor, ingresa una descripción y un monto válido.');
      return;
    }
    if (!payerId) {
      Alert.alert('Error', 'Por favor, selecciona quién pagó.');
      return;
    }
    if (selectedParticipants.length === 0) {
      Alert.alert('Error', 'Por favor, selecciona al menos un participante para este gasto.');
      return;
    }

    const payer = members.find(m => m.id === payerId);
    if (!payer) {
      Alert.alert('Error', 'Pagador no válido.');
      return;
    }

    // La división siempre será igual ahora (asumiendo que solo hay reparto igual)
    const individualShare = parsedAmount / selectedParticipants.length;
    const expenseShares = selectedParticipants.map(memberId => ({
      memberId,
      share: individualShare,
    }));

    const updatedExpense = {
      ...expenseToEdit, // Mantener el ID y otras propiedades existentes
      description: description.trim(),
      amount: parsedAmount,
      payerId: payer.id,
      payerName: payer.name,
      category: category,
      splitType: 'equal', // Asegurarse de que el tipo de división sea 'equal'
      participants: selectedParticipants,
      shares: expenseShares,
    };

    onSaveExpense(updatedExpense);
    onClose();
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.centeredView}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView contentContainerStyle={styles.modalScrollViewContent}>
            <View style={styles.modalView}>
              <Text style={styles.modalTitle}>Editar Gasto</Text>

              <TextInput
                style={styles.modalInput}
                placeholder="Descripción del gasto"
                placeholderTextColor="#a0a0a0"
                value={description}
                onChangeText={setDescription}
                returnKeyType="done"
                onSubmitEditing={Keyboard.dismiss}
              />
              <TextInput
                style={styles.modalInput}
                placeholder="Monto"
                placeholderTextColor="#a0a0a0"
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
                returnKeyType="done"
                onSubmitEditing={Keyboard.dismiss}
              />

              <Text style={styles.label}>Pagado por:</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={payerId}
                  onValueChange={(itemValue) => setPayerId(itemValue)}
                  style={styles.picker}
                  itemStyle={styles.pickerItem}
                >
                  {members.length > 0 ? (
                    members.map(member => (
                      <Picker.Item key={member.id} label={member.name} value={member.id} />
                    ))
                  ) : (
                    <Picker.Item label="No hay miembros" value="" />
                  )}
                </Picker>
              </View>

              {/* Selector de Categoría */}
              <Text style={styles.label}>Categoría:</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={category}
                  onValueChange={(itemValue) => setCategory(itemValue)}
                  style={styles.picker}
                  itemStyle={styles.pickerItem}
                >
                  {expenseCategories.map((cat, index) => (
                    <Picker.Item key={index} label={cat} value={cat} />
                  ))}
                </Picker>
              </View>

              <Text style={styles.label}>Participantes (quién consume):</Text>
              <ScrollView style={styles.participantsContainer}>
                {members.length === 0 ? (
                  <Text style={styles.emptyParticipantsText}>Añade miembros al grupo para seleccionarlos.</Text>
                ) : (
                  members.map(member => {
                    const isSelected = selectedParticipants.includes(member.id);
                    return (
                      <TouchableOpacity
                        key={member.id}
                        style={styles.checkboxRow}
                        onPress={() => toggleParticipant(member.id)}
                      >
                        <View style={[
                          styles.checkbox,
                          isSelected && styles.checkboxChecked
                        ]}>
                          {isSelected && <Text style={styles.checkboxText}>✓</Text>}
                        </View>
                        <Text style={styles.checkboxLabel}>{member.name}</Text>
                      </TouchableOpacity>
                    );
                  })
                )}
              </ScrollView>

              <View style={styles.modalButtons}>
                <TouchableOpacity style={[styles.modalButton, styles.buttonCancel]} onPress={onClose}>
                  <Text style={styles.buttonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalButton, styles.buttonSave]} onPress={handleSaveExpense}>
                  <Text style={styles.buttonText}>Guardar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: pastelColors.modalBackground,
  },
  modalScrollViewContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  modalView: {
    backgroundColor: pastelColors.cardBackground,
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '90%',
  },
  modalTitle: {
    fontSize: 24,
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
    marginBottom: 15,
  },
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
  participantsContainer: {
    width: '100%',
    maxHeight: 150,
    borderColor: pastelColors.inputBorder,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    justifyContent: 'flex-start',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: pastelColors.checkboxBorder,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  checkboxChecked: {
    backgroundColor: pastelColors.checkboxChecked,
    borderColor: pastelColors.checkboxChecked,
  },
  checkboxText: {
    color: pastelColors.buttonText,
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 16,
    color: pastelColors.text,
    flex: 1,
  },
  emptyParticipantsText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 10,
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
  buttonSave: { // Cambiado de buttonAdd a buttonSave
    backgroundColor: pastelColors.primary,
  },
  buttonText: {
    color: pastelColors.buttonText,
    fontWeight: 'bold',
    fontSize: 16,
  },
});