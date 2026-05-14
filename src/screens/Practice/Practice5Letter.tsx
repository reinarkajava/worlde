// src/screens/RandomTestScreen - Igapäevase sõna prototüüp.
import { supabase } from '../../lib/supabase';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';
import { Keyboard } from '../../components/Keyboard';
import { Grid } from '../../components/Grid';
import { getKeyStatuses } from '../../utils/gameLogic';
import { EndModal } from '../../components/EndModal';
import { useUser } from '../../context/UserContext';

// Sõna kättesaamine db-st — tabeli sonad rida ja täieliku nimekirja päring (teised ekraanid võivad kasutada).
/** `public.sonad` —  Supabase veerud: id, sona, sona_pikkus. */
export type SonadRow = {
  id: string;
  sona: string;
  sona_pikkus: number;
};

export async function fetchSonadRows(): Promise<SonadRow[]> {
  const { data, error } = await supabase
    .from('sonad')
    .select('id, sona, sona_pikkus');
  if (error) throw error;
  return (data ?? []) as SonadRow[];
}

const ROWS = 6;
const COLS = 5;


export const RandomTestScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { userEmail } = useUser();
  const [board, setBoard] = useState<string[][]>(
    Array(ROWS).fill(null).map(() => Array(COLS).fill(""))
  );
  const [currentRow, setCurrentRow] = useState(0);
  const [currentCol, setCurrentCol] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [didWin, setDidWin] = useState(false);
  // Sõna kättesaamine db-st — lahendussõna, laadimise ja vea olek
  const [solution, setSolution] = useState('');
  const [solutionLoading, setSolutionLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Sõna kättesaamine db-st — juhuslik sõna tabelist sonad (pikkus = COLS), valikuline eelmise sõna välistamine
  const pickRandomSolution = useCallback(async (excludeNormalized?: string) => {
    setSolutionLoading(true);
    setLoadError(null);
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(), 25_000);
    try {
      const { data, error } = await supabase
        .from('sonad')
        .select('sona')
        .eq('sona_pikkus', COLS)
        .abortSignal(abortController.signal);

      if (error) {
        setLoadError(error.message);
        return;
      }

      const normalized = (data ?? [])
        .map((row) => (row.sona ?? '').trim().toUpperCase())
        .filter((w) => w.length === COLS);

      if (normalized.length === 0) {
        const rawCount = (data ?? []).length;
        setLoadError(
          rawCount === 0
            ? 'Ühtegi sõna ei leitud (kontrolli tabelit sonad ja RLS õigusi).'
            : 'Sõnad ei vasta pikkusele pärast töötlemist — veerud sona / sona_pikkus ei klapi.'
        );
        return;
      }

      let pool =
        excludeNormalized && excludeNormalized.length === COLS
          ? normalized.filter((w) => w !== excludeNormalized)
          : normalized;

      if (pool.length === 0) {
        pool = normalized;
      }

      setSolution(pool[Math.floor(Math.random() * pool.length)]);
    } catch (e) {
      if (e instanceof Error && e.name === 'AbortError') {
        setLoadError('Päring aegus. Kontrolli võrku või proovi uuesti.');
      } else {
        setLoadError(e instanceof Error ? e.message : 'Tundmatu viga');
      }
    } finally {
      clearTimeout(timeoutId);
      setSolutionLoading(false);
    }
  }, []);

  // Sõna kättesaamine db-st — lae esimene sõna ekraani avamisel
  useEffect(() => {
    void pickRandomSolution();
  }, [pickRandomSolution]);

  //Funktsioon statistika saatmiseks Supabase'i
  const updatePlayerStats = async (isWin: boolean, attempts: number) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Küsime profiili andmed
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profile) {
      const newPlayedCount = (profile.played_count || 0) + 1;
      const newWins = isWin ? (profile.wins || 0) + 1 : (profile.wins || 0);
      const newWinPercentage = Math.round((newWins / newPlayedCount) * 100);
      
      // Punktide arvutus: võidu puhul (7 - katsed) * 10 punkti
      const earnedPoints = isWin ? (7 - attempts) * 10 : 0;
      const newTotalPoints = (profile.total_points || 0) + earnedPoints;

      await supabase
        .from('profiles')
        .update({
          played_count: newPlayedCount,
          wins: newWins,
          win_percentage: newWinPercentage,
          current_streak: isWin ? (profile.current_streak || 0) + 1 : 0,
          total_points: newTotalPoints,
        })
        .eq('id', user.id);
    }
  };

  const resetGame = () => {
    const previous =
      solution.length === COLS ? solution.toUpperCase() : undefined;
    setBoard(Array(ROWS).fill(null).map(() => Array(COLS).fill("")));
    setCurrentRow(0);
    setCurrentCol(0);
    setIsGameOver(false);
    setDidWin(false);
    setShowModal(false);
    // Sõna kättesaamine db-st — uus juhuslik sõna pärast „Uus mäng“
    void pickRandomSolution(previous);
  };

  const handleKeyPress = (key: string) => {
    // Sõna kättesaamine db-st — klaviatuur lukus kuni sõna on laetud ja kehtiv
    if (solutionLoading || solution.length !== COLS) {
      return;
    }

    // 1. Kui mäng on läbi, reageeri ainult ENTERile
    if (isGameOver) {
      if (key === 'ENTER') {
        setShowModal(true);
      }
      return;
    }

    // 2. ENTER loogika
    if (key === 'ENTER') {
      if (currentCol === COLS) {
        const currentGuess = board[currentRow].join("").toUpperCase();
        const targetSolution = solution.toUpperCase();

        if (currentGuess === targetSolution) {
            setCurrentRow(currentRow + 1);
          setDidWin(true);
          setIsGameOver(true);
          setShowModal(true);
          updatePlayerStats(true, currentRow + 1); // ✅ Salvesta võit
        } else if (currentRow === ROWS - 1) {
            setCurrentRow(currentRow + 1);
          setDidWin(false);
          setIsGameOver(true);
          setShowModal(true);
          updatePlayerStats(false, 6); // ✅ Salvesta kaotus
        } else {
          setCurrentRow(currentRow + 1);
          setCurrentCol(0);
        }
      }
      return;
    }

    // 3. Kustutamine ja kirjutamine
    if (key === '⌫') {
      if (currentCol > 0) {
        const newBoard = [...board.map(row => [...row])];
        newBoard[currentRow][currentCol - 1] = "";
        setBoard(newBoard);
        setCurrentCol(currentCol - 1);
      }
    } else if (currentCol < COLS && currentRow < ROWS) {
        const newBoard = [...board.map(row => [...row])];
        newBoard[currentRow][currentCol] = key;
        setBoard(newBoard);
        setCurrentCol(currentCol + 1);
      }
  };

  const keyStatuses = getKeyStatuses(board, currentRow, solution);

  return (
    <View style={styles.container}>
      {/* ✅ 2. Header on puhas ja ühel real */}
      <View style={[styles.header, { paddingTop: 12 + insets.top }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={styles.headerBack}
          accessibilityRole="button"
          accessibilityLabel="Tagasi"
        >
          <Ionicons name="chevron-back" size={26} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Random test</Text>
        <Text style={styles.initials}>
          {userEmail.substring(0, 2).toLowerCase()}
        </Text>
      </View>

      {__DEV__ && solution.length === COLS && (
        <View style={styles.debug} accessibilityLabel="Debug: correct word visible">
          <Text style={styles.debugLabel}>Debug — solution</Text>
          <Text style={styles.debugsona}>{solution.toUpperCase()}</Text>
        </View>
      )}

      {/* 1. RUUDUSTIK */}
      <Grid board={board} currentRow={currentRow} solution={solution} />

      {/* 2. KLAVIATUUR — sõna kättesaamine db-st: laadimine / viga / klaviatuur */}
      <View style={styles.footer}>
        {solutionLoading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#7C4DFF" />
            <Text style={styles.loadingText}>Laen sõna…</Text>
          </View>
        ) : solution.length === COLS ? (
          <Keyboard onKeyPress={handleKeyPress} keyStatuses={keyStatuses} />
        ) : (
          <View style={styles.loadErrorBox}>
            <Text style={styles.loadErrorText}>
              {loadError ?? 'Sõna ei laadinud.'}
            </Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => void pickRandomSolution()}
              accessibilityRole="button"
              accessibilityLabel="Proovi sõna uuesti laadida"
            >
              <Text style={styles.retryButtonText}>Proovi uuesti</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* 3. LÕPUMODAL */}
      <EndModal 
        isVisible={showModal}
        didWin={didWin}
        solution={solution}
        onReset={resetGame}
        onClose={() => setShowModal(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 12,
    paddingBottom: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  headerBack: {
    width: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 24, fontWeight: 'bold' },
  initials: { 
    color: '#666', 
    fontSize: 16, 
    fontWeight: 'bold',
    backgroundColor: '#F0F0F0',
    padding: 8,
    borderRadius: 20,
    overflow: 'hidden'
  },
  debug: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#FFF8E1',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#FFB300',
  },
  debugLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6D4C41',
  },
  debugsona: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 3,
    color: '#1B5E20',
  },
  footer: {
    marginTop: 'auto',
    width: '100%',
    paddingBottom: 12,
  },
  loadingBox: {
    minHeight: 140,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  loadErrorBox: {
    minHeight: 140,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 24,
  },
  loadErrorText: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#7C4DFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});