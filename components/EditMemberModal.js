// components/EditMemberModal.js

import React, { useState, useEffect } from 'react';
import {
  Modal, View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, ScrollView
} from 'react-native';

const pastelColors = {
  background: '#fef6e4',
  primary: '#8bd3dd',
  accent: '#f582ae',
  text: '#001858',
  buttonText: '#fff',
  cardBackground: '#fff',
  inputBorder: '#f582ae',
  modalBackground: 'rgba(0, 0, 0, 0.5)', // Fondo semitransparente para el modal
};

/**
 * Modal para editar un miembro existente.
 * Permite modificar el nombre de un miembro.
 *
 * @param {object} props - Las propiedades del componente.
 * @param {boolean} props.isVisible - Controla la visibilidad del modal.
 * @param {function} props.onClose - Función para cerrar el modal.
 * @param {function} props.onSaveMember - Función que se llama al guardar los cambios del miembro.
 * @param {object | null} props.memberToEdit - El objeto de miembro a editar. Si es null, el modal no se precargará.
 */
export default function EditMemberModal({ isVisible, onClose, onSaveMember, memberToEdit }) {
  const [memberName, setMemberName] = useState('');

  // Efecto para precargar el nombre del miembro cuando el modal se hace visible
  // o cuando memberToEdit cambia.
  useEffect(() => {
    if (isVisible && memberToEdit) {
      setMemberName(memberToEdit.name);
    } else if (isVisible) {
      // Si el modal se abre sin un miembro para editar, resetear el campo
      setMemberName('');
    }
  }, [isVisible, memberToEdit]);

  const handleSave = () => {
    if (!memberName.trim()) {
      Alert.alert('Error', 'Por favor, ingresa un nombre para el miembro.');
      return;
    }
    // Llama a la función onSaveMember pasando el ID original y el nuevo nombre
    onSaveMember({ id: memberToEdit.id, name: memberName.trim() });
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
              <Text style={styles.modalTitle}>Editar Miembro</Text>

              <TextInput
                style={styles.modalInput}
                placeholder="Nuevo nombre del miembro"
                placeholderTextColor="#a0a0a0"
                value={memberName}
                onChangeText={setMemberName}
                returnKeyType="done"
                onSubmitEditing={handleSave}
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity style={[styles.modalButton, styles.buttonCancel]} onPress={onClose}>
                  <Text style={styles.buttonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalButton, styles.buttonSave]} onPress={handleSave}>
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
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
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
});
