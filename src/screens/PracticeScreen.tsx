import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../context/UserContext';
import { supabase } from '../lib/supabase';
import type { RootStackParamList } from '../navigation/types';

type PracticePuzzleRoute = keyof Pick<RootStackParamList, 'Practice4' | 'Practice5' | 'Practice6'>;

const CHALLENGES: {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  routeName: PracticePuzzleRoute;
}[] = [
  { id: '1', title: '4 Täheline', subtitle: 'Harjuta 4-tähelist sõna', icon: '4', routeName: 'Practice4' },
  { id: '2', title: '5 Täheline', subtitle: 'Harjuta 5-tähelist sõna', icon: '5', routeName: 'Practice5' },
  { id: '3', title: '6 Täheline', subtitle: 'Harjuta 6-tähelist sõna', icon: '6', routeName: 'Practice6' },
];

export const PracticeScreen = () => {
  const navigation = useNavigation();
  const { userEmail } = useUser();

  const openPracticePuzzle = (routeName: PracticePuzzleRoute) => {
    navigation
      .getParent<NativeStackNavigationProp<RootStackParamList>>()
      ?.navigate(routeName);
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) Alert.alert('Viga', error.message);
  };

  const renderItem = ({ item }: { item: (typeof CHALLENGES)[number] }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => openPracticePuzzle(item.routeName)}
      accessibilityRole="button"
      accessibilityLabel={item.title}
    >
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

      {/* Harjutamisrežiimi peakaart */}
      <View style={styles.mainHeaderCard}>
        <View style={styles.mainHeaderRow}>
          <View style={styles.mainTitleContainer}>
            <Ionicons name="barbell" size={24} color="#7C4DFF" style={{ marginRight: 8 }} />
            <Text style={styles.mainHeaderText}>Harjutamine</Text>
          </View>
        </View>

        <Text style={styles.practiceHint}>
          Iga mäng kasutab juhuslikku sõna. Uut mängu saad alustada valides endale sobiva tähtede arvuga sõna.
          Päevast limiiti siin pole, harjuta nii palju kui soovid.
        </Text>
      </View>

      {/* Valikud tähtede arvu järgi */}
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
  mainHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  mainTitleContainer: { flexDirection: 'row', alignItems: 'center' },
  mainHeaderText: { fontSize: 20, fontWeight: 'bold' },
  practiceHint: { color: '#666', fontSize: 14, lineHeight: 20 },

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