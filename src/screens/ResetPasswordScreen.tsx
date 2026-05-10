import React, { useState } from 'react';
import { View, TextInput, Button, Text, Alert, StyleSheet } from 'react-native';
import { supabase } from '../lib/supabase';

interface ResetPasswordScreenProps {
  onComplete: () => void;
}

export const ResetPasswordScreen = ({ onComplete }: ResetPasswordScreenProps) => {
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function updatePassword() {
    if (newPassword.length < 6) {
      Alert.alert('Viga', 'Parool peab olema vähemalt 6 märki pikk.');
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password: newPassword });

    setLoading(false);

    if (error) {
      Alert.alert('Viga', error.message);
    } else {
      Alert.alert('Edukas!', 'Sinu parool on nüüd uuendatud.');
      onComplete();
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Määra uus parool</Text>
      <TextInput
        style={styles.input}
        placeholder="Uus parool"
        secureTextEntry
        value={newPassword}
        onChangeText={setNewPassword}
        autoFocus={true}
      />
      <Button
        title={loading ? 'Uuendan...' : 'Salvesta uus parool'}
        onPress={updatePassword}
        disabled={loading}
        color="#7C4DFF"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 12, borderRadius: 8, marginBottom: 15 },
});
