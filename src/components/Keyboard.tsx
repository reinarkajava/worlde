import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Colors } from '../theme/colors';
const SCREEN_WIDTH = Dimensions.get('window').width;

const ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', 'Ü', 'Õ'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ö', 'Ä'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '⌫'],
];
const MAX_KEYS_IN_ROW = 12; // Eesti tähestiku ülemine rida (Q-Õ)
const GAP = 4; // Vahe nuppude vahel

// Arvutame täpse nupu laiuse, et see mahuks alati ekraanile
const KEY_WIDTH = (SCREEN_WIDTH - (MAX_KEYS_IN_ROW + 1) * GAP) / MAX_KEYS_IN_ROW;

interface KeyboardProps {
  onKeyPress: (key: string) => void;
}

export const Keyboard = ({ onKeyPress }: KeyboardProps) => {
  return (
    <View style={styles.keyboard}>
      {ROWS.map((row, i) => (
        <View key={`row-${i}`} style={styles.row}>
          {row.map((key) => (
            <TouchableOpacity
              key={key}
              style={[
                styles.key,
                key === 'ENTER' || key === '⌫' ? styles.wideKey : null
              ]}
              onPress={() => onKeyPress(key)}
            >
              <Text style={styles.keyText}>{key}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  keyboard: {
    alignSelf: 'stretch',
    marginTop: 'auto',
    marginBottom: 20,
    paddingHorizontal: 5,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 8,
  },
  key: {
    backgroundColor: '#d3d6da',
    margin: GAP / 2, // Pool vahet kummalgi pool nuppu
    borderRadius: 4,
    width: KEY_WIDTH, // Kasutame täpset laiust, mitte minWidth
    height: 55,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wideKey: {
    width: KEY_WIDTH * 1.5,
  },
  keyText: {
    fontSize: 15,
    fontWeight: 'bold',
  },
});