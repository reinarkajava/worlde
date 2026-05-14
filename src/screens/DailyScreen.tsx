import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../context/UserContext';
import { supabase } from '../lib/supabase';
import type { RootStackParamList } from '../navigation/types';

export const DailyScreen = () => {
  const navigation = useNavigation();
  const { userEmail } = useUser();

  const openDailyPuzzle = () => {
    navigation
      .getParent<NativeStackNavigationProp<RootStackParamList>>()
      ?.navigate('DailyPuzzle');
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) Alert.alert('Viga', error.message);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.topHeader}>
        <Text style={styles.headerTitle}>Wordle</Text>
        <View style={styles.topIcons}>
          <Text style={styles.initials}>{userEmail.substring(0, 2).toLowerCase()}</Text>
          <TouchableOpacity onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.mainHeaderCard}>
        <View style={styles.mainTitleContainer}>
          <Ionicons name="calendar" size={24} color="#7C4DFF" style={{ marginRight: 8 }} />
          <Text style={styles.mainHeaderText}>Igapäevane sõna</Text>
        </View>
        <Text style={styles.hint}>
          Sama sõna kõigile mängijatele. Üks katse päevas.
        </Text>
      </View>

      <View style={styles.buttonWrap}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={openDailyPuzzle}
          accessibilityRole="button"
          accessibilityLabel="Ava tänane igapäevane sõnamäng"
        >
          <Ionicons name="play" size={22} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.primaryButtonText}>Arva tänane sõna</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FE' },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#1A1C1E' },
  topIcons: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  initials: { fontSize: 16, color: '#666' },

  mainHeaderCard: {
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  mainTitleContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  mainHeaderText: { fontSize: 20, fontWeight: 'bold' },
  hint: { color: '#666', fontSize: 14, lineHeight: 20 },

  buttonWrap: { paddingHorizontal: 20, marginTop: 8 },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7C4DFF',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 14,
  },
  primaryButtonText: { color: '#fff', fontSize: 18, fontWeight: '700' },
});
