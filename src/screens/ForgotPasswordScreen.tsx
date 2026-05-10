import React, { useState } from 'react';
import { View, TextInput, Button, Text, Alert, StyleSheet } from 'react-native';
import { supabase } from '../lib/supabase';

interface ForgotPasswordScreenProps {
  onBack: () => void;
}

const RESET_INSTRUCTIONS =
  'Saatsime parooli taastamiseks juhise e-postile. Juhul, kui kiri ei jõudnud sinu e-posti siis kontot ei ole veel selle e-mailiga seotud või sisestasid kogemata vale e-posti aadressi';

export const ForgotPasswordScreen = ({ onBack }: ForgotPasswordScreenProps) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState('');

  async function sendResetLink() {
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      Alert.alert('Viga', 'Palun sisesta e-posti aadress.');
      return;
    }

    setResetMessage(RESET_INSTRUCTIONS);
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
      redirectTo: 'com.heiloreinar.sonala://reset-password',
    });

    setLoading(false);

    if (error) {
      Alert.alert('Viga', error.message);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Parooli taastamine</Text>

      <TextInput
        style={styles.input}
        placeholder="Sinu e-post"
        value={email}
        onChangeText={(value) => {
          setEmail(value);
          setResetMessage('');
        }}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        autoComplete="email"
      />

      <View style={styles.buttonContainer}>
        <Button
          title={loading ? 'Saadan...' : 'Saada taastamise link'}
          onPress={sendResetLink}
          disabled={loading}
          color="#7C4DFF"
        />
      </View>

      {resetMessage ? <Text style={styles.resetMessage}>{resetMessage}</Text> : null}

      <Button
        title="Tagasi sisselogimise juurde"
        onPress={onBack}
        color="gray"
        disabled={loading}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  buttonContainer: {
    marginBottom: 10,
  },
  resetMessage: {
    color: '#333',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 15,
    textAlign: 'center',
  },
});
