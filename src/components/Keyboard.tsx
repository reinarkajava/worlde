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

export const Keyboard = ({ onKeyPress, keyStatuses = {} }: any) => {
  const getButtonColor = (key: string) => {
    const status = keyStatuses[key.toUpperCase()];
    if (status === 'all_correct') return Colors.correct; // Täisroheline
    if (status === 'partially_correct' || status === 'present') return Colors.present; // Kollane
    if (status === 'absent') return '#3A3A3C';
    return '#D3D6DA';
  };

  const getTextColor = (key: string) => {
    const status = keyStatuses[key.toUpperCase()];
    return status ? 'white' : 'black'; // Valge tekst värvilistel nuppudel, must tavalistel
  };

  return (
    <View style={styles.keyboard}>
      {ROWS.map((row, i) => (
        <View key={i} style={styles.row}>
          {row.map((key) => {
            const status = keyStatuses[key.toUpperCase()];
            const isWide = key === 'ENTER' || key === '⌫';
            return (
              <TouchableOpacity
                key={key}
                style={[
                  styles.key, // Nimi peab ühtima styles.key-ga
                  isWide && styles.wideKey,
                  { backgroundColor: getButtonColor(key) }
                ]}
                onPress={() => onKeyPress(key)}
              >
                <Text style={[styles.keyText, { color: status ? 'white' : 'black' }]}>
                  {key}
                </Text>
                {/* SÄRATÄPP: Kuvame väikese rohelise täpi, kui osa tähti on leitud */}
                {status === 'partially_correct' && (
                  <View style={styles.dotIndicator} />
                )}
              </TouchableOpacity>
            );
          })}
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
    fontSize: SCREEN_WIDTH < 400 ? 10 : 13, // Väiksemal ekraanil (mobiil) tee tekst väiksemaks
    fontWeight: 'bold',
  },
  dotIndicator: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#6aaa64', // Roheline täpp
    borderWidth: 1,
    borderColor: 'white',
  }
});