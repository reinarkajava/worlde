import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const FriendsScreen = () => { // Veendu, et siin on 'export const FriendsScreen'
  return (
    <View style={styles.container}>
      <Text>Friends Screen Coming Soon</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});