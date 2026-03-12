// src/screens/PracticeScreen.tsx
import { supabase } from '../lib/supabase';
import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors';
import { Keyboard } from '../components/Keyboard';
import { Grid } from '../components/Grid';
import { getKeyStatuses } from '../utils/gameLogic';
import { EndModal } from '../components/EndModal';
import { useUser } from '../context/UserContext';

const ROWS = 6;
const COLS = 5;

export const PracticeScreen = () => {
  const { userEmail } = useUser();
  const [board, setBoard] = useState<string[][]>(
    Array(ROWS).fill(null).map(() => Array(COLS).fill(""))
  );
  const [currentRow, setCurrentRow] = useState(0);
  const [currentCol, setCurrentCol] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [didWin, setDidWin] = useState(false);

  const solution = "TREPP";

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
          win_percentage: newWinPercentage,
          current_streak: isWin ? (profile.current_streak || 0) + 1 : 0,
          total_points: newTotalPoints,
        })
        .eq('id', user.id);
    }
  };

  const resetGame = () => {
    setBoard(Array(ROWS).fill(null).map(() => Array(COLS).fill("")));
    setCurrentRow(0);
    setCurrentCol(0);
    setIsGameOver(false);
    setDidWin(false);
    setShowModal(false); // Sulgeme ka akna
  };

  const handleKeyPress = (key: string) => {
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
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Practice</Text>
        <Text style={styles.initials}>
          {userEmail.substring(0, 2).toLowerCase()}
        </Text>
      </View>

      {/* 1. RUUDUSTIK */}
      <Grid board={board} currentRow={currentRow} solution={solution} />

      {/* 2. KLAVIATUUR */}
      <View style={styles.footer}>
        <Keyboard onKeyPress={handleKeyPress} keyStatuses={keyStatuses} />
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
    width: '100%',
    padding: 20,
    backgroundColor: 'white',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  headerTitle: { fontSize: 24, fontWeight: 'bold' },
  initials: { 
    color: '#666', 
    fontSize: 16, 
    fontWeight: 'bold',
    backgroundColor: '#F0F0F0',
    padding: 8,
    borderRadius: 20,
    overflow: 'hidden'
  },
  footer: {
    marginTop: 'auto',
    width: '100%',
    paddingBottom: 20,
  },
});