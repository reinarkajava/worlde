// src/screens/FriendsScreen.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../context/UserContext';
import { LeaderboardModal } from '../components/LeaderboardModal';
import { TOP_PLAYERS } from '../constants/data';

export const FriendsScreen = () => {

  const { userEmail } = useUser();
  const [leaderboardVisible, setLeaderboardVisible] = useState(false);
  const topThree = TOP_PLAYERS.slice(0, 3);

  return (
    <SafeAreaView style={styles.container}>
      {/* Päis (sama mis teistel vaadetel) */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Wordle</Text>
        <View style={styles.headerIcons}>
          <Text style={styles.initials}>{userEmail.substring(0, 2).toLowerCase()}</Text>
          <Ionicons name="log-out-outline" size={24} color="#333" />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.mainCard}>
          {/* Sõprade ikoon ja pealkiri */}
          <View style={styles.titleRow}>
            <Ionicons name="people-outline" size={28} color="#4D4DFF" />
            <Text style={styles.mainTitle}>Friends</Text>
          </View>

          {/* Sinine nupp */}
          <TouchableOpacity style={styles.leaderboardButton}
          onPress={() => setLeaderboardVisible(true)}
          >
            <Text style={styles.buttonText}>View Full Leaderboard</Text>
          </TouchableOpacity>

          <LeaderboardModal 
        isVisible={leaderboardVisible} 
        onClose={() => setLeaderboardVisible(false)} 
      />

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Top Players</Text>
          

          {/* Mängijate nimekiri */}
          {topThree.map((player) => (
            <TouchableOpacity 
              key={player.id} 
              style={[styles.playerCard, { backgroundColor: player.bgColor, borderColor: player.borderColor }]}
            >
              <View style={styles.playerLeft}>
                <View style={styles.rankCircle}>
                  <Text style={styles.rankText}>{player.id}</Text>
                </View>
                <View style={[styles.avatar, { backgroundColor: player.color }]}>
                  <Text style={styles.avatarText}>{player.initials}</Text>
                </View>
                <View>
                  <Text style={styles.playerName}>{player.name}</Text>
                  <Text style={styles.playerStreak}>Practice Streak: {player.streak}</Text>
                </View>
              </View>
              
              <View style={styles.scoreContainer}>
                <Ionicons name="trophy-outline" size={18} color="#D97706" />
                <Text style={styles.scoreText}>{player.score}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
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
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
  mainTitle: { fontSize: 22, fontWeight: 'bold' },
  
  leaderboardButton: {
    backgroundColor: '#1D4ED8',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  
  divider: { height: 1, backgroundColor: '#EEE', marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },

  playerCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 2,
  },
  playerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  rankCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#DDD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankText: { fontWeight: 'bold', fontSize: 14 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  playerName: { fontSize: 16, fontWeight: 'bold' },
  playerStreak: { fontSize: 12, color: '#666' },
  
  scoreContainer: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  scoreText: { fontSize: 18, fontWeight: 'bold', color: '#D97706' },
});