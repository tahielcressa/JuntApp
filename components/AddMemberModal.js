// components/AddMemberModal.js

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, Dimensions, KeyboardAvoidingView, Platform, Alert } from 'react-native';

const { height } = Dimensions.get('window');

const pastelColors = {
  background: '#fef6e4', // Color de fondo general
  modalBackground: '#fff', // Fondo del modal
  primary: '#8bd3dd', // Botón Agregar
  accent: '#f582ae', // Botón Cancelar
  text: '#001858', // Texto principal
  buttonText: '#fff', // Texto de botones
  inputBorder: '#8bd3dd', // Borde del input
};

export default function AddMemberModal({ isVisible, onClose, onAddMember }) {
  const [memberName, setMemberName] = useState('');

  // Reinicia el input cuando el modal se abre/cierra
  React.useEffect(() => {
    if (isVisible) {
      setMemberName('');
    }
  }, [isVisible]);

  const handleAdd = () => {
    if (memberName.trim() === '') {
      Alert.alert('Error', 'Por favor, ingresa un nombre para el miembro.');
      return;
    }
    onAddMember(memberName.trim()); // Llama a la función pasada por props
    onClose(); // Cierra el modal
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose} // Permite cerrar el modal con el botón de retroceso de Android
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.centeredView}
      >
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Nuevo Miembro</Text>
          <TextInput
            style={styles.input}
            placeholder="Nombre del Miembro"
            placeholderTextColor="#aaa"
            value={memberName}
            onChangeText={setMemberName}
            onSubmitEditing={handleAdd} // Permite agregar con la tecla Enter/Done
            returnKeyType="done"
          />
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={styles.buttonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.addButton]}
              onPress={handleAdd}
            >
              <Text style={styles.buttonText}>Agregar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)', // Fondo semitransparente
  },
  modalView: {
    margin: 20,
    backgroundColor: pastelColors.modalBackground,
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
    width: '85%', // Ancho del modal
    maxHeight: height * 0.7, // Altura máxima
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: pastelColors.text,
    marginBottom: 20,
  },
  input: {
    width: '100%',
    backgroundColor: pastelColors.modalBackground,
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
    color: pastelColors.text,
    borderWidth: 1,
    borderColor: pastelColors.inputBorder,
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    elevation: 2,
    flex: 1, // Para que ocupen el mismo espacio
    marginHorizontal: 5,
    alignItems: 'center',
  },
  addButton: {
    backgroundColor: pastelColors.primary,
  },
  cancelButton: {
    backgroundColor: pastelColors.accent,
  },
  buttonText: {
    color: pastelColors.buttonText,
    fontWeight: 'bold',
    fontSize: 16,
  },
});
