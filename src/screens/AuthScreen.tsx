//Sisselogimise ja registreerimise fail (Front ja back-end kood)
import { supabase } from '../lib/supabase';
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  SafeAreaView, 
  KeyboardAvoidingView, 
  Platform,
  Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AuthScreenProps {
  onForgotPassword: () => void;
}

export const AuthScreen = ({ onForgotPassword }: AuthScreenProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState('');
//Kui  kasutaja on juba olemas siis antakse teade
  const isDuplicateEmailError = (message: string) => {
    const lowerMessage = message.toLowerCase();

    return (
      lowerMessage.includes('already registered') ||
      lowerMessage.includes('already exists') ||
      lowerMessage.includes('user already')
    );
  };
//Kontrollib, kas kõik väljad on täidetud ja kas kasutaja on juba olemas kui kasutaja olemas siis antakse teade
  const showDuplicateEmailAlert = () => {
    Alert.alert(
      'Konto on juba olemas',
      'Selle e-posti aadressiga konto on juba registreeritud. Palun logi sisse või taasta oma parool.'
    );
  };
//Sisselogimise ja registreerimise loogika

  const handleAuth = async () => {
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail || !password) {
      Alert.alert('Viga', 'Palun täida kõik väljad!');
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        setConfirmationMessage('');

        const { data, error } = await supabase.auth.signUp({
          email: trimmedEmail,
          password: password,
        });

        console.log('Registreerimise vastus:', {
          hasUser: Boolean(data.user),
          hasSession: Boolean(data.session),
          email: trimmedEmail,
        });

        if (error) {
          console.log('Registreerimise viga:', error.message);

          if (isDuplicateEmailError(error.message)) {
            showDuplicateEmailAlert();
          } else {
            Alert.alert('Viga registreerimisel', error.message);
          }

          return;
        }

        if (data.user?.identities?.length === 0) {
          showDuplicateEmailAlert();
          return;
        }

        if (!data.user) {
          Alert.alert('Viga registreerimisel', 'Supabase ei tagastanud uut kasutajat. Kontrolli Supabase Authentication seadeid.');
          return;
        }

        setConfirmationMessage('Teile on saadetud kinnitusmeil');
        setPassword('');

        if (data.session) {
          await supabase.auth.signOut();
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password: password,
        });

        if (error) Alert.alert('Viga sisselogimisel', error.message);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Tundmatu registreerimise viga.';
      console.log('Ootamatu auth viga:', message);
      Alert.alert('Viga', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <View style={styles.content}>
          {/* Logo/Ikoon osa */}
          <View style={styles.headerArea}>
            <View style={styles.iconCircle}>
              <Ionicons name="person-add" size={40} color="#7C4DFF" />
            </View>
            <Text style={styles.title}>{isSignUp ? 'Loo konto' : 'Tere tulemast tagasi'}</Text>
            <Text style={styles.subtitle}>
              {isSignUp ? 'Alusta oma teekonda Wordle meistrina' : 'Logi sisse, et jätkata sealt, kus pooleli jäid'}
            </Text>
          </View>

          {/* Vormi osa */}
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput 
                style={styles.input}
                placeholder="E-mail"
                value={email}
                onChangeText={(value) => {
                  setEmail(value);
                  setConfirmationMessage('');
                }}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput 
                style={styles.input}
                placeholder="Parool"
                value={password}
                onChangeText={(value) => {
                  setPassword(value);
                  setConfirmationMessage('');
                }}
                secureTextEntry
              />
            </View>

            <TouchableOpacity 
              style={[styles.mainButton, loading && styles.disabledButton]} 
              onPress={handleAuth}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Palun oota...' : (isSignUp ? 'Registreeru' : 'Logi sisse')}
              </Text>
            </TouchableOpacity>

            {isSignUp && confirmationMessage ? (
              <Text style={styles.confirmationText}>{confirmationMessage}</Text>
            ) : null}

            {!isSignUp && (
              <TouchableOpacity
                style={styles.forgotPasswordButton}
                onPress={onForgotPassword}
                disabled={loading}
              >
                <Text style={styles.forgotPasswordText}>Unustasid parooli?</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity 
              style={styles.switchButton} 
              onPress={() => {
                setIsSignUp(!isSignUp);
                setConfirmationMessage('');
              }}
              disabled={loading}
            >
              <Text style={styles.switchText}>
                {isSignUp ? 'Sul on juba konto? Logi sisse' : 'Pole kontot? Registreeru siin'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
//Back-end koodi lõpp


//Stiilileht


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFF' },
  flex: { flex: 1 },
  content: { flex: 1, padding: 30, justifyContent: 'center' },
  headerArea: { alignItems: 'center', marginBottom: 40 },
  iconCircle: { 
    width: 80, 
    height: 80, 
    borderRadius: 40, 
    backgroundColor: '#F3EFFF', 
    justifyContent: 'center', 
    alignItems: 'center',
    marginBottom: 20 
  },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1A1C1E', marginBottom: 10 },
  subtitle: { fontSize: 16, color: '#666', textAlign: 'center', paddingHorizontal: 20 },
  
  form: { width: '100%' },
  inputContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: 'white', 
    borderRadius: 12, 
    marginBottom: 15,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#E0E0FF',
    height: 55,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 16, color: '#333' },
  
  mainButton: { 
    backgroundColor: '#7C4DFF', 
    height: 55, 
    borderRadius: 12, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginTop: 10,
    shadowColor: '#7C4DFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  disabledButton: { opacity: 0.6 },
  buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  
  confirmationText: { color: '#2E7D32', fontSize: 14, fontWeight: '600', marginTop: 15, textAlign: 'center' },
  forgotPasswordButton: { marginTop: 15, alignItems: 'center' },
  forgotPasswordText: { color: '#666', fontSize: 14, fontWeight: '600' },
  switchButton: { marginTop: 20, alignItems: 'center' },
  switchText: { color: '#7C4DFF', fontSize: 14, fontWeight: '600' }
});