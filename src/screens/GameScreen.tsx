// src/screens/GameScreen.tsx
import React, { useState } from 'react';
import { View, StyleSheet, Text, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../theme/colors';
import { globalStyles } from '../theme/globalStyles';
import { getCellStyle } from '../utils/gameLogic';
import { Keyboard } from '../components/Keyboard';

const ROWS = 6;
const COLS = 5;

const getKeyStatuses = (board: string[][], currentRow: number, solution: string) => {
  // Implement the logic to determine key statuses
const statuses: { [key: string]: string } = {};
  const solUpper = solution.toUpperCase();
  const solutionCharCounts: { [key: string]: number } = {};

  for (const char of solUpper) {
    solutionCharCounts[char] = (solutionCharCounts[char] || 0) + 1;
  }

  const foundCorrectPositions = new Set<string>();
  for (let i = 0; i < currentRow; i++) {
    const row = board[i];
    row.forEach((letter, j) => {
      const upLetter = letter.toUpperCase();
      if (upLetter && upLetter === solUpper[j]) {
        foundCorrectPositions.add(`${upLetter}-${j}`);
      }
    });
  }

  for (let i = 0; i < currentRow; i++) {
    const row = board[i];
    row.forEach((letter) => {
      const upLetter = letter.toUpperCase();
      if (!upLetter) return;

      const correctDiscoveries = Array.from(foundCorrectPositions)
        .filter(pos => pos.startsWith(`${upLetter}-`)).length;

      if (correctDiscoveries > 0 && correctDiscoveries === solutionCharCounts[upLetter]) {
        statuses[upLetter] = 'all_correct';
      } else if (correctDiscoveries > 0) {
        statuses[upLetter] = 'partially_correct';
      } else if (solUpper.includes(upLetter)) {
        statuses[upLetter] = 'present';
      } else {
        if (!statuses[upLetter]) statuses[upLetter] = 'absent';
      }
    });
  }
  return statuses;
};

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
      {/* ... (Gridi osa on sul õige) ... */}
      <View style={styles.grid}>
        {board.map((row, i) => (
          <View key={`row-${i}`} style={styles.row}>
            {row.map((cell: string, j: number) => (
              <View key={`cell-${i}-${j}`} style={[styles.cell, getCellStyle(i, currentRow, cell, j, solution)]}>
                <Text style={styles.cellText}>{cell}</Text>
              </View>
            ))}
          </View>
        ))}
      </View>

      <View style={styles.footer}>
        <Keyboard onKeyPress={handleKeyPress} keyStatuses={keyStatuses} />
      </View>

      {showModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={[styles.modalTitle, { color: didWin ? Colors.correct : '#FF3B30' }]}>
              {didWin ? "VÕIT! 🎉" : "KAOTUS ÕHTUL 🌙"}
            </Text>
            <Text style={styles.modalBody}>
              {didWin ? "Arvasid sõna ära!" : `Õige sõna oli: ${solution.toUpperCase()}`}
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalButton, { backgroundColor: Colors.absent }]} onPress={() => setShowModal(false)}>
                <Text style={styles.buttonText}>Vaata tulemust</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, { backgroundColor: Colors.correct }]} onPress={resetGame}>
                <Text style={styles.buttonText}>Uus mäng</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
  },
  grid: {
    padding: 10,
    marginTop: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  cell: {
    borderWidth: 2,
    width: 60,
    height: 60,
    margin: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellText: {
    fontSize: 28,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  footer: {
    marginTop: 'auto',
    width: '100%',
    paddingBottom: 20,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)', // Poolläbipaistev taust
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000, // Toob modaali kõige ette
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
    width: '80%',
    elevation: 5,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalBody: {
    fontSize: 18,
    marginBottom: 25,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 15,
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});