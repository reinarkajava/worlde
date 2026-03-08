import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors';

export const HomeScreen = ({ navigation }: any) => {
  return (
    <View style={styles.container}>
      <Text style={styles.welcome}>Tere tulemast!</Text>
      <TouchableOpacity 
        style={styles.button} 
        onPress={() => navigation.navigate('Game')}
      >
        <Text style={styles.buttonText}>UUS MÄNG</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  welcome: { fontSize: 24, marginBottom: 30 },
  button: { backgroundColor: Colors.correct, padding: 20, borderRadius: 10 },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 18 }
});