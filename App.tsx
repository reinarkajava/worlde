import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

// Impordime seaded ja komponendid
import { Colors } from './src/theme/colors';
import { globalStyles } from './src/theme/globalStyles';
import { getCellStyle } from './src/utils/gameLogic';
import { Keyboard } from './src/components/Keyboard';

const ROWS = 6;
const COLS = 5;

export default function App() {
  const [board, setBoard] = useState<string[][]>(
    Array(ROWS).fill(null).map(() => Array(COLS).fill(""))
  );
  const [currentRow, setCurrentRow] = useState(0);
  const [currentCol, setCurrentCol] = useState(0);
  
  const solution = "TREPP"; // Mängu lahendus

  const handleKeyPress = (key: string) => {
    if (key === 'ENTER') {
      if (currentCol === COLS) {
        setCurrentRow(currentRow + 1);
        setCurrentCol(0);
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
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <Text style={globalStyles.title}>SÕNALA</Text>

        <View style={styles.grid}>
          {board.map((row, i) => (
            <View key={`row-${i}`} style={styles.row}>
              {row.map((cell, j) => (
                <View 
                  key={`cell-${i}-${j}`} 
                  style={[
                    styles.cell, 
                    getCellStyle(i, currentRow, cell, j, solution)
                  ]}
                >
                  <Text style={[styles.cellText, { color: cell ? Colors.tileText : Colors.border }]}>
                    {cell}
                  </Text>
                </View>
              ))}
            </View>
          ))}
        </View>

        {/* Klaviatuur on nüüd ainus sisestusviis jalamis */}
        <View style={styles.footer}>
          <Keyboard onKeyPress={handleKeyPress} />
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    paddingTop: 20,
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
  }
});