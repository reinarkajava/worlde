import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Modal } from 'react-native';
import { Colors } from '../theme/colors';

interface EndModalProps {
  isVisible: boolean;
  didWin: boolean;
  solution: string;
  onReset: () => void;
  onClose: () => void;
}

export const EndModal = ({ isVisible, didWin, solution, onReset, onClose }: EndModalProps) => {
  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={[styles.modalTitle, { color: didWin ? Colors.correct : '#FF3B30' }]}>
            {didWin ? "VÕIT! 🎉" : "KAOTUS 🌙"}
          </Text>
          
          <Text style={styles.modalBody}>
            {didWin 
              ? "Arvasid sõna ära!" 
              : `Õige sõna oli: ${solution.toUpperCase()}`}
          </Text>
          
          <View style={styles.modalButtons}>
            <TouchableOpacity 
              style={[styles.modalButton, { backgroundColor: Colors.absent }]} 
              onPress={onClose}
            >
              <Text style={styles.buttonText}>Vaata tulemust</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.modalButton, { backgroundColor: Colors.correct }]} 
              onPress={onReset}
            >
              <Text style={styles.buttonText}>Uus mäng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
    width: '80%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalBody: {
    fontSize: 18,
    marginBottom: 25,
    textAlign: 'center',
    color: '#333',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 15,
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});