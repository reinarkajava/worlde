import React, { useCallback, useState } from 'react';
import { supabase } from '../lib/supabase';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useUser } from '../context/UserContext';
import { DetailedStatsView } from '../components/DetailedStatsView'; // Veendu, et import on õige

const StatItem = ({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) => (
  <View style={styles.statBox}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
    {hint ? <Text style={styles.statHint}>{hint}</Text> : null}
  </View>
);

type ProfileStats = {
  played_count: number;
  wins: number;
  win_percentage: number;
  current_streak: number;
  total_points: number;
};

export const StatsScreen = () => {
  const { userEmail } = useUser(); // Kasutame globaalset emaili

  const [isDetailedViewVisible, setIsDetailedViewVisible] = useState(false);

  const [stats, setStats] = useState<ProfileStats>({
    played_count: 0,
    wins: 0,
    win_percentage: 0,
    current_streak: 0,
    total_points: 0,
  });

  const fetchStats = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.log('Viga andmete laadimisel:', error.message);
        return;
    }
    if (data) {
        const row = data as ProfileStats;
        setStats({
          played_count: row.played_count ?? 0,
          wins: row.wins ?? 0,
          win_percentage: row.win_percentage ?? 0,
          current_streak: row.current_streak ?? 0,
          total_points: row.total_points ?? 0,
        });
      } else {
        // Kui andmeid ei leitud (uus kasutaja), võime siin vajadusel 
        // profiili luua või jätta vaikimisi nullid (nagu sul state-is on).
        console.log('Profiili ei leitud, kasutame vaikeväärtusi.');
      }
    }
  };

useFocusEffect(
  useCallback(() => {
    fetchStats();
  }, [])
);

  // 2. VÄLJALOGIMISE FUNKTSIOON
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) Alert.alert('Viga', error.message);
  };

  const played = stats.played_count ?? 0;
  const wins = stats.wins ?? 0;
  /** Võitude % = võidud / mängitud mänge (sama loogika mis salvestamisel). */
  const winPercent =
    played > 0 ? Math.round((wins / played) * 100) : 0;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Wordle</Text>
        <View style={styles.headerIcons}>
          <Text style={styles.initials}>{userEmail.substring(0, 2).toLowerCase()}</Text>
          <TouchableOpacity onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.mainCard}>
          <Text style={styles.cardTitle}>Sinu statistika</Text>
          
          <View style={styles.statsRow}>
            <StatItem label="Mängud" value={played} />
            <StatItem
              label="Võitude %"
              value={`${winPercent}%`}
            />
            <StatItem
              label="Streak"
              value={stats.current_streak}
            />
            <StatItem label="Võite kokku" value={wins} />
          </View>

          <View style={[styles.infoCard, { backgroundColor: '#7C4DFF' }]}>
            <View>
              <Text style={styles.infoCardLabel}>Kogu punktisumma</Text>
              <Text style={styles.infoCardValue}>{stats.total_points}</Text>
            </View>
            <Ionicons name="trophy-outline" size={40} color="rgba(255,255,255,0.6)" />
          </View>

          <View style={[styles.infoCard, { backgroundColor: '#FF5722' }]}>
            <View>
              <Text style={styles.infoCardLabel}>Kogunenud punktid</Text>
              <Text style={styles.infoCardValue}>{stats.total_points}</Text>
            </View>
            <Ionicons name="barbell-outline" size={40} color="rgba(255,255,255,0.6)" />
          </View>

          <TouchableOpacity 
            style={styles.detailButton}
            onPress={() => setIsDetailedViewVisible(true)}
          >
            <Text style={styles.detailButtonText}>Vaata detailsemat statistikat</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* See komponent hüppab nüüd nupu vajutamisel Modalina lahti */}
      <DetailedStatsView 
        isVisible={isDetailedViewVisible} 
        onClose={() => setIsDetailedViewVisible(false)}
        userStats={stats} // Saada päris andmed edasi
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFF' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: 'white',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  headerTitle: { fontSize: 24, fontWeight: 'bold' },
  headerIcons: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  initials: { color: '#666', fontSize: 16 },
  content: { padding: 20 },
  mainCard: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 25,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 25, color: '#1A1C1E' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  statBox: { alignItems: 'center', flex: 1 },
  statValue: { fontSize: 28, fontWeight: 'bold', color: '#1A1C1E' },
  statLabel: { fontSize: 13, color: '#666', marginTop: 4, textAlign: 'center' },
  statHint: {
    fontSize: 10,
    color: '#888',
    marginTop: 4,
    textAlign: 'center',
    paddingHorizontal: 2,
  },
  infoCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    marginBottom: 15,
  },
  infoCardLabel: { color: 'white', fontSize: 14, opacity: 0.9 },
  infoCardValue: { color: 'white', fontSize: 32, fontWeight: 'bold', marginTop: 5 },
  detailButton: {
    backgroundColor: '#4D4DFF',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  detailButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
});