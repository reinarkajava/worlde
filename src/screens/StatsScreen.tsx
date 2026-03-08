import { Ionicons } from '@expo/vector-icons';import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const StatsScreen = () => { // Veendu, et siin on 'export const StatsScreen'
  return (
    <View style={styles.container}>
      <Text>Statistics Screen Coming Soon</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});