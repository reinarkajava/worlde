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
export const GameScreen = () => {
  const [board, setBoard] = useState<string[][]>(
    Array(ROWS).fill(null).map(() => Array(COLS).fill(""))
  );
  const [currentRow, setCurrentRow] = useState(0);
  const [currentCol, setCurrentCol] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);

  const solution = "TREPP"; // Mängu lahendus

  const resetGame = () => {
    setBoard(Array(ROWS).fill(null).map(() => Array(COLS).fill("")));
    setCurrentRow(0);
    setCurrentCol(0);
  };

const handleKeyPress = (key: string) => {
  if (key === 'ENTER') {
    // 1. KONTROLL: Kas mäng on juba võidetud ja kasutaja vajutab uuesti ENTER?
    if (currentRow > 0) {
      const lastGuess = board[currentRow - 1].join("").toUpperCase();
      if (lastGuess === solution.toUpperCase()) {
        setIsGameOver(true); // Avab uuesti modaali
        return;
      }
    }

    // 2. TAVALINE KONTROLL: Kui rida on täis ja mäng käib
    if (currentCol === COLS) {
      const currentGuess = board[currentRow].join("").toUpperCase();
      const targetSolution = solution.toUpperCase();

      console.log("Kontrollin sõna:", currentGuess, "Vastus:", targetSolution);

      if (currentGuess === targetSolution) {
  setCurrentRow(currentRow + 1);
  setCurrentCol(0); // Algseisustame veeru, et vältida vigu
  setTimeout(() => {
    setIsGameOver(true);
  }, 500);
  return;
} else if (currentRow === ROWS - 1) {
        Alert.alert("MÄNG LÄBI", `Õige sõna oli: ${targetSolution}`, [
          { text: "Proovi uuesti", onPress: resetGame }
        ]);
      } else {
        // Kui sõna valesti, liigume järgmisele reale
        setCurrentRow(currentRow + 1);
        setCurrentCol(0);
      }
    } else {
      console.log("Rida pole veel täis!");
    }
    } else if (key === '⌫') {
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

  return (
    <View style={styles.container}>
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
        <Keyboard onKeyPress={handleKeyPress} />
      </View>
      {isGameOver && (
  <View style={styles.modalOverlay}>
    <View style={styles.modalContent}>
      <Text style={styles.modalTitle}>VÕIT! 🎉</Text>
      <Text style={styles.modalBody}>Arvasid sõna ära!</Text>
      
      <View style={styles.modalButtons}>
        <TouchableOpacity 
          style={[styles.modalButton, { backgroundColor: Colors.absent }]} 
          onPress={() => setIsGameOver(false)}
        >
          <Text style={styles.buttonText}>Vaata tulemust</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.modalButton, { backgroundColor: Colors.correct }]} 
          onPress={() => {
            resetGame();
            setIsGameOver(false);
          }}
        >
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