import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TOP_PLAYERS } from '../constants/data';

const screenWidth = Dimensions.get('window').width;

export const LeaderboardModal = ({ isVisible, onClose }: { isVisible: boolean, onClose: () => void }) => {
  const [activeTab, setActiveTab] = useState<'points' | 'streaks'>('points');
const sortedData = [...TOP_PLAYERS].sort((a, b) => 
    activeTab === 'points' ? b.score - a.score : b.streak - a.streak
  );
  const iconName = activeTab === 'points' ? 'trophy' : 'flame';
  const activeColor = activeTab === 'points' ? '#2563EB' : '#FF6B00';

  return (
    <Modal visible={isVisible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <Ionicons name="people-outline" size={24} color="#333" />
              <Text style={styles.title}>Friends</Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={28} color="black" />
            </TouchableOpacity>
          </View>

          {/* Tabbing system */}
          <View style={styles.tabContainer}>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'points' && { backgroundColor: '#2563EB' }]}
              onPress={() => setActiveTab('points')}
            >
              <Ionicons name="trophy-outline" size={18} color={activeTab === 'points' ? 'white' : '#666'} />
              <Text style={[styles.tabText, activeTab === 'points' && styles.activeTabText]}>Points</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.tab, activeTab === 'streaks' && { backgroundColor: '#FF6B00' }]}
              onPress={() => setActiveTab('streaks')}
            >
              <Ionicons name="flame-outline" size={18} color={activeTab === 'streaks' ? 'white' : '#666'} />
              <Text style={[styles.tabText, activeTab === 'streaks' && styles.activeTabText]}>Practice Streaks</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.rankInfo}>Your rank: #6</Text>

          {/* List */}
          <ScrollView showsVerticalScrollIndicator={false} style={styles.list}>
            {sortedData.map((player, index) => {
              const rank = index + 1;
              let cardBorderColor = '#EEE'; // Default border color}
              if (index === 0) cardBorderColor = '#FFD700'; // 1. koht - Kuld
              else if (index === 1) cardBorderColor = '#C0C0C0'; // 2. koht - Hõbe
              else if (index === 2) cardBorderColor = '#CD7F32'; // 3. koht - Pronks

                return (
                <View key={player.id} style={[styles.card, { borderColor: cardBorderColor }]}>
                
                <View style={styles.rankBadge}>
                  <Text style={styles.rankText}>{rank}</Text>
                </View>
                
                <View style={[styles.avatar, { backgroundColor: player.color}]}>
                  <Text style={styles.avatarText}>{player.name.charAt(0)}</Text>
                </View>

                <View style={styles.info}>
                  <Text style={styles.name}>{player.name}</Text>
                  <Text style={styles.subtext}>{player.subtext}</Text>
                </View>

                {/* kolmikoperaator*/}
                <View style={styles.valueRow}>
                  <Ionicons name={iconName} size={16} color={activeColor} />
                  <Text style={[styles.value, { color: activeColor }]}>
                    {activeTab === 'points' ? player.score : player.streak}
                    </Text>
                </View>
              </View>
                );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { 
    backgroundColor: 'white', 
    borderTopLeftRadius: 30, 
    borderTopRightRadius: 30, 
    padding: 20, 
    height: '85%' 
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  headerTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  title: { fontSize: 24, fontWeight: 'bold' },
  tabContainer: { 
    flexDirection: 'row', 
    backgroundColor: '#F1F5F9', 
    borderRadius: 15, 
    padding: 5,
    marginBottom: 15 
  },
  tab: { 
    flex: 1, 
    flexDirection: 'row', 
    paddingVertical: 12, 
    borderRadius: 12, 
    justifyContent: 'center', 
    alignItems: 'center',
    gap: 8
  },
  tabText: { fontWeight: '600', color: '#666' },
  activeTabText: { color: 'white' },
  rankInfo: { marginBottom: 15, color: '#666', fontSize: 14 },
  list: { flex: 1 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 2,
    // Varjud
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  rankBadge: { 
    width: 30, 
    height: 30, 
    borderRadius: 15, 
    backgroundColor: '#F8FAFC', 
    justifyContent: 'center', 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  rankText: { fontWeight: 'bold', fontSize: 12 },
  avatar: { 
    width: 45, 
    height: 45, 
    borderRadius: 22.5, 
    backgroundColor: '#A5B4FC', 
    marginHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center'
  },
  avatarText: { color: 'white', fontWeight: 'bold', fontSize: 18 },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: 'bold' },
  subtext: { fontSize: 12, color: '#94A3B8' },
  valueRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  value: { fontSize: 18, fontWeight: 'bold' }
});