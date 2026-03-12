import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-gifted-charts';

const screenWidth = Dimensions.get('window').width;

// 1. Dummy andmed graafiku jaoks
const DUMMY_DATA = {
  me: [{ value: 100, label: '2/10' }, { value: 150, label: '2/15' }, { value: 250, label: '2/20' }, { value: 380, label: '3/7' }],
  emma: [{ value: 120, label: '2/10' }, { value: 200, label: '2/15' }, { value: 350, label: '2/20' }, { value: 520, label: '3/7' }],
  sarah: [{ value: 80, label: '2/10' }, { value: 130, label: '2/15' }, { value: 280, label: '2/20' }, { value: 450, label: '3/7' }],
};

export const DetailedStatsView = ({ isVisible, onClose, userStats }: { 
  isVisible: boolean, 
  onClose: () => void,
  userStats: any 
}) => {
  const [showChart, setShowChart] = useState(false);
  const [activeFriends, setActiveFriends] = useState(['me', 'emma', 'sarah']);

  const toggleFriend = (id: string) => {
    setActiveFriends(prev => 
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  return (
    <Modal visible={isVisible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        {/* MODAL CONTENT: Lisasime flex: 1 või kindla kõrguse, et see ei oleks tühi valge riba */}
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Statistics</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={28} color="black" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
            {/* ANDMETE SIDUMINE: Kasutame userStats väärtusi */}
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statVal}>{userStats.played_count}</Text>
                <Text style={styles.statLabel}>Played</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statVal}>{userStats.win_percentage}%</Text>
                <Text style={styles.statLabel}>Win %</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statVal}>{userStats.current_streak}</Text>
                <Text style={styles.statLabel}>Current</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statVal}>{userStats.total_points}</Text>
                <Text style={styles.statLabel}>Max</Text>
              </View>
            </View>

            <View style={styles.pointsCard}>
                <View>
                    <Text style={styles.pointsLabel}>Total Points</Text>
                    <Text style={styles.pointsValue}>{userStats.total_points}</Text>
                </View>
                <Ionicons name="trending-up" size={30} color="white" />
            </View>

            <TouchableOpacity style={styles.chartToggleBtn} onPress={() => setShowChart(!showChart)}>
              <Ionicons name="stats-chart" size={18} color="white" />
              <Text style={styles.chartToggleText}>{showChart ? 'Hide Progress Chart' : 'View Progress Chart'}</Text>
            </TouchableOpacity>

            {showChart && (
  <View style={styles.chartContainer}>
    <Text style={styles.chartTitle}>30-Day Points Progress</Text>
    
    <View style={{ height: 200, alignItems: 'center', justifyContent: 'center' }}>
      {/* Kui ühtegi sõpra pole valitud, näitame teksti, et vältida graafiku krahhi */}
      {activeFriends.length === 0 ? (
        <View style={{ height: 180, justifyContent: 'center' }}>
          <Text style={{ color: '#999', fontStyle: 'italic' }}>Select a user to view progress</Text>
        </View>
      ) : (
        <LineChart
          /* Kasutame .filter() ja .map() et hoida andmed puhtad */
          data={activeFriends.includes('me') ? DUMMY_DATA.me : DUMMY_DATA.me.map(d => ({...d, value: 0, hideDataPoint: true}))}
          data2={activeFriends.includes('emma') ? DUMMY_DATA.emma : undefined}
          data3={activeFriends.includes('sarah') ? DUMMY_DATA.sarah : undefined}
          
          height={180}
          width={screenWidth * 0.7}
          initialSpacing={20}
          
          /* Värvid: kui pole aktiivne, pane läbipaistvaks */
          color1={activeFriends.includes('me') ? "#4D4DFF" : "transparent"}
          color2={activeFriends.includes('emma') ? "#FF4D4D" : "transparent"}
          color3={activeFriends.includes('sarah') ? "#4DFF88" : "transparent"}
          
          /* Graafiku stabiilsus */
          thickness={3}
          hideRules={false} 
          rulesColor="#F0F0F0"
          yAxisThickness={0} 
          xAxisThickness={1}
          xAxisColor="#CCC"
          yAxisTextStyle={{color: '#999', fontSize: 10}}
          curved
          animateOnDataChange
          
          /* See on kriitiline: hoiab teljed paigal */
          maxValue={600} 
          noOfSections={5}
          
          /* Väldib "Invalid Pattern" viga null-väärtuste puhul */
          areaChart={false} 
        />
      )}
    </View>

    <View style={styles.friendsToggleRow}>
      {Object.keys(DUMMY_DATA).map((friend) => {
        const isActive = activeFriends.includes(friend);
        const dotColor = friend === 'me' ? '#4D4DFF' : friend === 'emma' ? '#FF4D4D' : '#4DFF88';
        return (
          <TouchableOpacity 
            key={friend} 
            onPress={() => toggleFriend(friend)}
            style={[
              styles.friendBtn, 
              !isActive && styles.disabledBtn, 
              isActive && { borderColor: dotColor }
            ]}
          >
            <View style={[styles.dot, { backgroundColor: isActive ? dotColor : '#CCC' }]} />
            <Text style={styles.friendName}>{friend === 'me' ? 'Me' : friend.charAt(0).toUpperCase() + friend.slice(1)}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  </View>
)}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: { 
  flex: 1, 
  backgroundColor: 'rgba(0,0,0,0.5)', 
  justifyContent: 'center', // See võib sisu kokku suruda, kui sisu on flexita
  alignItems: 'center' 
},
modalContent: { 
  backgroundColor: 'white', 
  borderRadius: 30, 
  padding: 25, 
  width: '92%', 
  maxHeight: '85%',
  minHeight: 300 // Lisa see rida, et vältida "valget riba"
},
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold' },
  closeBtn: { padding: 5 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  statItem: { alignItems: 'center', flex: 1 },
  statVal: { fontSize: 22, fontWeight: 'bold' },
  statLabel: { fontSize: 12, color: '#666' },
  pointsCard: { backgroundColor: '#8A56FF', borderRadius: 20, padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  pointsLabel: { color: 'white', opacity: 0.8 },
  pointsValue: { color: 'white', fontSize: 32, fontWeight: 'bold' },
  chartToggleBtn: { backgroundColor: '#5D3FD3', flexDirection: 'row', padding: 16, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  chartToggleText: { color: 'white', fontWeight: 'bold', marginLeft: 10 },
  chartContainer: { marginTop: 20, backgroundColor: '#F8F9FB', padding: 15, borderRadius: 20 },
  chartTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 15 },
  friendsToggleRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  friendBtn: { flex: 1, padding: 8, alignItems: 'center', borderRadius: 12, marginHorizontal: 4, borderWidth: 1, borderColor: '#EEE', backgroundColor: 'white' },
  disabledBtn: { opacity: 0.4 },
  dot: { width: 8, height: 8, borderRadius: 4, marginBottom: 4 },
  friendName: { fontSize: 11, fontWeight: 'bold' },
  friendPts: { fontSize: 10, color: '#888' }
});