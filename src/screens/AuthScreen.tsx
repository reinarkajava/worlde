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
// Siia lisame hiljem Supabase kliendi impordi

export const AuthScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

const handleAuth = async () => {
  if (!email || !password) {
    Alert.alert("Viga", "Palun täida kõik väljad!");
    return;
  }

  setLoading(true);
  
  if (isSignUp) {
    // REGISTREERIMINE
    const { error } = await supabase.auth.signUp({
      email: email,
      password: password,
    });
    if (error) Alert.alert("Viga registreerimisel", error.message);
    else Alert.alert("Edu!", "Konto loodud! Kontrolli oma e-posti kinnituskirja jaoks.");
  } else {
    // SISSESELOGIMINE
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });
    if (error) Alert.alert("Viga sisselogimisel", error.message);
  }
  
  setLoading(false);
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
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput 
                style={styles.input}
                placeholder="Parool"
                value={password}
                onChangeText={setPassword}
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

            <TouchableOpacity 
              style={styles.switchButton} 
              onPress={() => setIsSignUp(!isSignUp)}
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
  
  switchButton: { marginTop: 20, alignItems: 'center' },
  switchText: { color: '#7C4DFF', fontSize: 14, fontWeight: '600' }
});