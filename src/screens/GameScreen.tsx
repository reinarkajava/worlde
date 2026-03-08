// src/screens/GameScreen.tsx
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors';
import { Keyboard } from '../components/Keyboard';
import { Grid } from '../components/Grid';
import { getKeyStatuses } from '../utils/gameLogic';
import { EndModal } from '../components/EndModal';

const ROWS = 6;
const COLS = 5;

export const GameScreen = () => {
  const [board, setBoard] = useState<string[][]>(
    Array(ROWS).fill(null).map(() => Array(COLS).fill(""))
  );
  const [currentRow, setCurrentRow] = useState(0);
  const [currentCol, setCurrentCol] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [didWin, setDidWin] = useState(false);

  const solution = "TREPP";

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
          setDidWin(true);
          setIsGameOver(true);
          setShowModal(true);
          setCurrentRow(currentRow + 1);
        } else if (currentRow === ROWS - 1) {
          setDidWin(false);
          setIsGameOver(true);
          setShowModal(true);
          setCurrentRow(currentRow + 1);
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
    } else {
      if (currentCol < COLS && currentRow < ROWS) {
        const newBoard = [...board.map(row => [...row])];
        newBoard[currentRow][currentCol] = key;
        setBoard(newBoard);
        setCurrentCol(currentCol + 1);
      }
    }
  };

  const keyStatuses = getKeyStatuses(board, currentRow, solution);

  return (
    <View style={styles.container}>
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
  footer: {
    marginTop: 'auto',
    width: '100%',
    paddingBottom: 20,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});