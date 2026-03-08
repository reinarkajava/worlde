import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { getCellStyle } from '../utils/gameLogic';

interface GridProps {
  board: string[][];
  currentRow: number;
  solution: string;
}

export const Grid = ({ board, currentRow, solution }: GridProps) => {
  return (
    <View style={styles.grid}>
      {board.map((row, i) => (
        <View key={`row-${i}`} style={styles.row}>
          {row.map((cell: string, j: number) => (
            <View 
              key={`cell-${i}-${j}`} 
              style={[styles.cell, getCellStyle(i, currentRow, cell, j, solution)]}
            >
              <Text style={styles.cellText}>{cell}</Text>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
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
});