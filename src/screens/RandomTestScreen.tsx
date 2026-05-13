//Impordid
import { supabase } from '../lib/supabase';
import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../theme/colors';
import { Keyboard } from '../components/Keyboard';
import { Grid } from '../components/Grid';
import { getKeyStatuses } from '../utils/gameLogic';
import { EndModal } from '../components/EndModal';
import { useUser } from '../context/UserContext';



//Stiil
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
    paddingHorizontal: 20,
    paddingBottom: 12,
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
    paddingBottom: 12,
  },
});