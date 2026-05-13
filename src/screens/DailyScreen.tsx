import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { useUser } from '../context/UserContext';
import { supabase } from '../lib/supabase';

const CHALLENGES = [
  { id: '1', title: '4 Täheline', subtitle: '4 täheline sõna', icon: '4' },
  { id: '2', title: '5 Täheline #1', subtitle: '5 täheline sõna', icon: '5' },
  { id: '3', title: '5 Täheline #2', subtitle: '5 täheline sõna', icon: '5' },
  { id: '4', title: '5 Täheline #3', subtitle: '5 täheline sõna', icon: '5' },
  { id: '5', title: '6 Täheline', subtitle: '6 täheline sõna', icon: '6' },
];

export const DailyScreen = () => {

    const { userEmail } = useUser();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) Alert.alert('Viga', error.message);
  };

  const renderItem = ({ item }: { item: typeof CHALLENGES[0] }) => (
    <TouchableOpacity style={styles.card}>
      <View style={styles.cardLeft}>
        <View style={styles.iconCircle}>
          <Text style={styles.iconText}>{item.icon}</Text>
        </View>
        <View>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
        </View>
      </View>
      <Ionicons name="arrow-forward" size={20} color="#7C4DFF" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Ülemine "Wordle" päis */}
      <View style={styles.topHeader}>
        <Text style={styles.headerTitle}>Wordle</Text>
        <View style={styles.topIcons}>
          <Text style={styles.initials}>{userEmail.substring(0, 2).toLowerCase()}</Text>
          <TouchableOpacity onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Daily Challenges peakaart */}
      <View style={styles.mainHeaderCard}>
        <View style={styles.mainHeaderRow}>
          <View style={styles.mainTitleContainer}>
             <Ionicons name="calendar" size={24} color="#7C4DFF" style={{marginRight: 8}} />
             <Text style={styles.mainHeaderText}>Igapäevane Sõna</Text>
          </View>
          <View style={styles.trophyBadge}>
            <Ionicons name="trophy" size={18} color="white" />
            <Text style={styles.trophyText}>0</Text>
          </View>
        </View>
        
        <Text style={styles.progressText}>0/5 päevaväljakutset tehtud</Text>
        <View style={styles.progressBarBackground}>
          <View style={[styles.progressBarFill, { width: '0%' }]} />
        </View>
      </View>

      {/* Väljakutsete nimekiri */}
      <FlatList
        data={CHALLENGES}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FE' },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#1A1C1E' },
  topIcons: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  initials: { fontSize: 16, color: '#666' },
  
  mainHeaderCard: {
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  mainHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  mainTitleContainer: { flexDirection: 'row', alignItems: 'center' },
  mainHeaderText: { fontSize: 20, fontWeight: 'bold' },
  trophyBadge: { 
    flexDirection: 'row', 
    backgroundColor: '#FFB800', 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 20, 
    alignItems: 'center',
    gap: 5
  },
  trophyText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  progressText: { color: '#666', marginBottom: 10 },
  progressBarBackground: { height: 8, backgroundColor: '#E0E0E0', borderRadius: 4 },
  progressBarFill: { height: 8, backgroundColor: '#E0E0E0', borderRadius: 4 }, // Alguses tühi

  listContainer: { paddingHorizontal: 20, paddingBottom: 20 },
  card: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0FF',
  },
  cardLeft: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  iconCircle: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#F0E6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: { color: '#7C4DFF', fontSize: 20, fontWeight: 'bold' },
  cardTitle: { fontSize: 18, fontWeight: 'bold' },
  cardSubtitle: { color: '#666', fontSize: 14 },
});