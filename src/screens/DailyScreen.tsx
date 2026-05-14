import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../context/UserContext';
import { supabase } from '../lib/supabase';
import type { RootStackParamList } from '../navigation/types';

/** Igapäevane ruudustik DailyWordProto-s on 4 tähte — puzzles.word peab klappima. */
const DAILY_WORD_LENGTH = 4;

function todayLocalDateString(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export const DailyScreen = () => {
  const navigation = useNavigation();
  const { userEmail } = useUser();
  const [dailyLoading, setDailyLoading] = useState(true);
  const [dailyError, setDailyError] = useState<string | null>(null);
  const [todayPuzzleId, setTodayPuzzleId] = useState<number | null>(null);

  const loadTodayDailyPuzzle = useCallback(async () => {
    setDailyLoading(true);
    setDailyError(null);
    setTodayPuzzleId(null);
    try {
      const dateStr = todayLocalDateString();
      const { data, error } = await supabase
        .from('puzzles')
        .select('id, word')
        .eq('puzzle_type', 'daily')
        .eq('puzzle_date', dateStr)
        .limit(1)
        .maybeSingle();

      if (error) {
        setDailyError(error.message);
        return;
      }

      if (!data) {
        setDailyError(
          'Tänase kuupäeva igapäevast mõistatust ei ole leitud. Proovi hiljem uuesti'
        );
        return;
      }

      const w = (data.word ?? '').trim().toUpperCase();
      if (w.length !== DAILY_WORD_LENGTH) {
        setDailyError(
          `Igapäevase sõna pikkus peab olema ${DAILY_WORD_LENGTH} tähte (praegu ${w.length}). Kontrolli puzzles.word.`
        );
        return;
      }

      setTodayPuzzleId(Number(data.id));
    } catch (e) {
      setDailyError(e instanceof Error ? e.message : 'Tundmatu viga');
    } finally {
      setDailyLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTodayDailyPuzzle();
  }, [loadTodayDailyPuzzle]);

  const openDailyPuzzle = () => {
    const parent =
      navigation.getParent<NativeStackNavigationProp<RootStackParamList>>();
    if (todayPuzzleId != null) {
      parent?.navigate('DailyPuzzle', { puzzleId: todayPuzzleId });
    } else {
      parent?.navigate('DailyPuzzle', {});
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) Alert.alert('Viga', error.message);
  };

  const canOpenOfficialDaily = todayPuzzleId != null && !dailyLoading && !dailyError;

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
          Igapäevane sõna Uus sõna iga päev 00.00 EEST.
        </Text>
      </View>

      {dailyLoading ? (
        <View style={styles.statusBox}>
          <ActivityIndicator size="large" color="#7C4DFF" />
          <Text style={styles.statusText}>Laen tänast mõistatust…</Text>
        </View>
      ) : dailyError ? (
        <View style={styles.statusBox}>
          <Text style={styles.errorText}>{dailyError}</Text>
          <TouchableOpacity style={styles.secondaryButton} onPress={() => void loadTodayDailyPuzzle()}>
            <Text style={styles.secondaryButtonText}>Proovi uuesti</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <View style={styles.buttonWrap}>
        <TouchableOpacity
          style={[styles.primaryButton, !canOpenOfficialDaily && styles.primaryButtonDisabled]}
          onPress={openDailyPuzzle}
          disabled={!canOpenOfficialDaily}
          accessibilityRole="button"
          accessibilityLabel="Ava tänane ametlik igapäevane sõnamäng"
        >
          <Ionicons name="play" size={22} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.primaryButtonText}>Lahenda tänane sõna</Text>
        </TouchableOpacity>
        {!canOpenOfficialDaily && !dailyLoading ? (
          <TouchableOpacity
            style={[styles.primaryButton, styles.fallbackButton, { marginTop: 12 }]}
            onPress={() =>
              navigation
                .getParent<NativeStackNavigationProp<RootStackParamList>>()
                ?.navigate('DailyPuzzle', {})
            }
            accessibilityRole="button"
            accessibilityLabel="Ava prototüüp juhusliku sõnaga sonad tabelist"
          >
            <Text style={styles.primaryButtonText}>Debug: Suvaline sõna tabelist (Harjutus)</Text>
          </TouchableOpacity>
        ) : null}
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
  mono: { fontFamily: 'monospace', color: '#444' },

  statusBox: {
    paddingHorizontal: 24,
    alignItems: 'center',
    gap: 12,
  },
  statusText: { fontSize: 15, color: '#666' },
  errorText: { fontSize: 14, color: '#B00020', textAlign: 'center', lineHeight: 20 },

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
  primaryButtonDisabled: { backgroundColor: '#C4B5FD' },
  fallbackButton: { backgroundColor: '#5C6BC0' },
  secondaryButton: {
    marginTop: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  secondaryButtonText: { color: '#7C4DFF', fontWeight: '600', fontSize: 16 },
  primaryButtonText: { color: '#fff', fontSize: 18, fontWeight: '700' },
});
