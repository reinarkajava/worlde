//Sisaldab sõprade leidmise, kutsete saatmise, kutsetele vastamise ja sõbra eemaldamise loogikat.
//Kasutab meie Supabase'i andmebaasi sõprade andmete hankimiseks ja sõbrakutsete haldamiseks (Friends list tabel)
//src/components/DiagConfirm.tsx sisaldab sõbra eemaldamise kasti, mis käib kokku lehe stiiliga. Enne seda oli tavaline alertbox
//src/context/UserContext.tsx sisaldab kasutaja konteksti, mis hoiab e-posti päise ja sõbrakutsete teavituse punase täpi loendurit.
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { DiagConfirm } from '../components/DiagConfirm';
import { useUser } from '../context/UserContext';
import { supabase } from '../lib/supabase';
//tüübid sõprade andmete hankimiseks
type Profile = {
  id: string;
  email: string;
  current_streak?: number | null;
  total_points?: number | null;
};

type FriendRequest = {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: 'pending' | 'accepted' | 'rejected';
};
//Profiilipilt e-posti esimese kahe tähega
const getInitials = (email: string) => email.substring(0, 2).toLowerCase();

const showAlert = (title: string, message?: string) => {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    window.alert(message ? `${title}\n\n${message}` : title);
    return;
  }
  if (message !== undefined) Alert.alert(title, message);
  else Alert.alert(title);
};
//Loogika sõprade andmete hankimiseks
export const FriendsScreen = () => {
  const { userEmail } = useUser();
  const [currentUserId, setCurrentUserId] = useState('');
  const [searchEmail, setSearchEmail] = useState('');
  const [searchResult, setSearchResult] = useState<Profile | null>(null);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [profilesById, setProfilesById] = useState<Record<string, Profile>>({});
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [removePrompt, setRemovePrompt] = useState<{
    requestId: string;
    friendEmail: string;
  } | null>(null);
  const [removeBusy, setRemoveBusy] = useState(false);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) Alert.alert('Viga', error.message);
  };

  const fetchFriendData = useCallback(async (userId: string) => {
    setLoading(true);

    // Päringud sõprade andmete hankimiseks
    const selectCols = 'id, sender_id, receiver_id, status';
    const statusFilter = ['pending', 'accepted'] as const;

    const [asSender, asReceiver] = await Promise.all([
      supabase
        .from('friend_requests')
        .select(selectCols)
        .eq('sender_id', userId)
        .in('status', [...statusFilter]),
      supabase
        .from('friend_requests')
        .select(selectCols)
        .eq('receiver_id', userId)
        .in('status', [...statusFilter]),
    ]);

    const error = asSender.error || asReceiver.error;
    if (error) {
      setLoading(false);
      Alert.alert('Viga', error.message);
      return;
    }

    const byId = new Map<string, FriendRequest>();
    for (const row of [...(asSender.data || []), ...(asReceiver.data || [])]) {
      byId.set(row.id, row as FriendRequest);
    }
    const typedRequests = Array.from(byId.values());
    setFriendRequests(typedRequests);

    const profileIds = Array.from(
      new Set(
        typedRequests.flatMap((request) => [request.sender_id, request.receiver_id])
      )
    );

    if (profileIds.length === 0) {
      setProfilesById({});
      setLoading(false);
      return;
    }

    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, current_streak, total_points')
      .in('id', profileIds);

    if (profilesError) {
      setLoading(false);
      Alert.alert('Viga', profilesError.message);
      return;
    }

    const profileMap = ((profiles || []) as Profile[]).reduce<Record<string, Profile>>(
      (acc, profile) => {
        acc[profile.id] = profile;
        return acc;
      },
      {}
    );

    setProfilesById(profileMap);
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (!active) return;
        if (error) {
          Alert.alert('Viga', error.message);
          return;
        }
        if (!user) return;
        setCurrentUserId(user.id);
        fetchFriendData(user.id);
      })();
      return () => {
        active = false;
      };
    }, [fetchFriendData])
  );


  const existingRequestForProfile = (profileId: string) =>
    friendRequests.find((request) => {
      const isSamePair =
        (request.sender_id === currentUserId && request.receiver_id === profileId) ||
        (request.sender_id === profileId && request.receiver_id === currentUserId);

      return isSamePair && ['pending', 'accepted'].includes(request.status);
    });
//Kasutaja otsimine e-posti järgi. Kontroll kas kasutaja eksisteerib ja keelab iseenda sõbraks lisamist.

  const searchUser = async () => {
    const normalizedEmail = searchEmail.trim().toLowerCase();

    if (!normalizedEmail) {
      Alert.alert('Viga', 'Sisesta kasutaja e-posti aadress.');
      return;
    }

    setSearching(true);
    setSearchResult(null);

    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, current_streak, total_points')
      .eq('email', normalizedEmail)
      .maybeSingle();

    setSearching(false);

    if (error) {
      Alert.alert('Viga', error.message);
      return;
    }

    if (!data) {
      Alert.alert('Ei leitud', 'Selle e-postiga kasutajat ei leitud. Kontrolli kirjutatud aadressi uuesti');
      return;
    }

    if (data.id === currentUserId) {
      Alert.alert('Viga', 'Sa ei saa iseennast sõbraks lisada.');
      return;
    }

    setSearchResult(data as Profile);
  };



//Sõbrakutse saatmine
//Kontrollitakse ka kas sõbrakutse on juba olemas ja selle staatust

  const sendFriendRequest = async (receiverId: string) => {
    if (!currentUserId) return;

    const existingRequest = existingRequestForProfile(receiverId);

    if (existingRequest?.status === 'accepted') {
      Alert.alert('Info', 'See kasutaja on juba sinu sõber.');
      return;
    }

    if (existingRequest?.status === 'pending') {
      Alert.alert('Info', 'Selle kasutajaga on sõbrakutse juba ootel.');
      return;
    }

    const { error } = await supabase
      .from('friend_requests')
      .insert({
        sender_id: currentUserId,
        receiver_id: receiverId,
        status: 'pending',
      });

    if (error) {
      Alert.alert('Viga', error.message);
      return;
    }

    Alert.alert('Saadetud', 'Sõbrakutse saadeti.');
    setSearchResult(null);
    setSearchEmail('');
    fetchFriendData(currentUserId);
  };



//Sõbrakutse vastuse loogika
  const updateFriendRequest = async (
    requestId: string,
    status: 'accepted' | 'rejected'
  ) => {
    const { error } = await supabase
      .from('friend_requests')
      .update({ status })
      .eq('id', requestId);

    if (error) {
      Alert.alert('Viga', error.message);
      return;
    }

    fetchFriendData(currentUserId);
  };





//Sõbra eemaldamine
  const confirmRemoveFriend = async () => {
    if (!removePrompt || !currentUserId) return;
    const { requestId } = removePrompt;
    setRemoveBusy(true);

    const { data, error } = await supabase
      .from('friend_requests')
      .delete()
      .eq('id', requestId)
      .select('id');

    setRemoveBusy(false);

    if (error) {
      showAlert('Viga', error.message);
      return;
    }
    if (!data?.length) {
      showAlert('Viga', 'Sõpra ei õnnestunud eemaldada. Proovi uuesti.');
      return;
    }

    setRemovePrompt(null);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setCurrentUserId(user.id);
      fetchFriendData(user.id);
    }
  };




  const incomingRequests = friendRequests.filter(
    (request) => request.status === 'pending' && request.receiver_id === currentUserId
  );

  const outgoingRequests = friendRequests.filter(
    (request) => request.status === 'pending' && request.sender_id === currentUserId
  );

  const friends = friendRequests.filter((request) => request.status === 'accepted');



  const renderProfileRow = (
    profile: Profile,
    rightContent: React.ReactNode,
    subtitle?: string
  ) => (
    <View key={profile.id} style={styles.playerCard}>
      <View style={styles.playerLeft}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getInitials(profile.email)}</Text>
        </View>
        <View style={styles.playerText}>
          <Text style={styles.playerName} numberOfLines={1} ellipsizeMode="tail">
            {profile.email}
          </Text>
          <Text style={styles.playerStreak}>
            {subtitle || `Streak: ${profile.current_streak || 0}`}
          </Text>
        </View>
      </View>
      {rightContent}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Wordle</Text>
        <View style={styles.headerIcons}>
          <Text style={styles.initials}>{getInitials(userEmail)}</Text>
          <TouchableOpacity onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.mainCard}>
          <View style={styles.titleRow}>
            <Ionicons name="people-outline" size={28} color="#4D4DFF" />
            <Text style={styles.mainTitle}>Sõbrad</Text>
          </View>

          <Text style={styles.sectionTitle}>Leia kasutaja e-posti järgi</Text>
          <View style={styles.searchRow}>
            <TextInput
              style={styles.searchInput}
              placeholder="e-post siia"
              value={searchEmail}
              onChangeText={setSearchEmail}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
            />
            <TouchableOpacity
              style={[styles.searchButton, searching && styles.disabledButton]}
              onPress={searchUser}
              disabled={searching}
            >
              <Text style={styles.searchButtonText}>{searching ? 'Otsin' : 'Otsi'}</Text>
            </TouchableOpacity>
          </View>

          {searchResult
            ? renderProfileRow(
                searchResult,
                <TouchableOpacity
                  style={styles.smallButton}
                  onPress={() => sendFriendRequest(searchResult.id)}
                >
                  <Text style={styles.smallButtonText}>Lisa</Text>
                </TouchableOpacity>,
                'Leitud kasutaja(d)'
              )
            : null}

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Saabunud kutsed</Text>
          {loading ? <ActivityIndicator color="#7C4DFF" /> : null}
          {!loading && incomingRequests.length === 0 ? (
            <Text style={styles.emptyText}>Uusi sõbrakutseid ei ole.</Text>
          ) : null}
          {incomingRequests.map((request) => {
            const profile = profilesById[request.sender_id];
            if (!profile) return null;

            return renderProfileRow(
              profile,
              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={styles.acceptButton}
                  onPress={() => updateFriendRequest(request.id, 'accepted')}
                >
                  <Ionicons name="checkmark" size={18} color="white" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.rejectButton}
                  onPress={() => updateFriendRequest(request.id, 'rejected')}
                >
                  <Ionicons name="close" size={18} color="white" />
                </TouchableOpacity>
              </View>,
              'Soovib sind sõbraks lisada'
            );
          })}

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Sinu sõbrad</Text>
          {!loading && friends.length === 0 ? (
            <Text style={styles.emptyText}>Sul ei ole veel sõpru lisatud.</Text>
          ) : null}
          {friends.map((request) => {
            const friendId =
              request.sender_id === currentUserId ? request.receiver_id : request.sender_id;
            const profile = profilesById[friendId];
            if (!profile) return null;

            return renderProfileRow(
              profile,
              <View style={styles.friendActions}>
                <View style={styles.scoreContainer}>
                  <Ionicons name="trophy-outline" size={18} color="#D97706" />
                  <Text style={styles.scoreText}>{profile.total_points || 0}</Text>
                </View>
                <TouchableOpacity
                  style={styles.removeFriendButton}
                  onPress={() =>
                    setRemovePrompt({ requestId: request.id, friendEmail: profile.email })
                  }
                  accessibilityLabel="Eemalda sõber"
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="person-remove-outline" size={22} color="#B91C1C" />
                </TouchableOpacity>
              </View>
            );
          })}

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Saadetud kutsed</Text>
          {outgoingRequests.length === 0 ? (
            <Text style={styles.emptyText}>Ootel  kutseid ei ole.</Text>
          ) : null}
          {outgoingRequests.map((request) => {
            const profile = profilesById[request.receiver_id];
            if (!profile) return null;

            return renderProfileRow(profile, <Text style={styles.pendingText}>Ootel</Text>);
          })}
        </View>
      </ScrollView>


      <DiagConfirm
        visible={removePrompt !== null}
        title="Eemalda selle sõber?"
        message={
          removePrompt
            ? `${removePrompt.friendEmail} kaob sinu sõprade nimekirjast. Soovi korral saad alati uue kutse saata.`
            : ''
        }
        cancelLabel="Jäta sõbraks"
        confirmLabel="Jah, eemalda"
        tone="danger"
        busy={removeBusy}
        onCancel={() => {
          if (!removeBusy) setRemovePrompt(null);
        }}
        onConfirm={confirmRemoveFriend}
      />
    </SafeAreaView>
  );
};
// Ülevalolev kood saab DiagConfirmist stiili  prompt-i jaoks (Ei lasnud kommentaari õigesse kohta panna)

//Back-end koodi lõpp







//Stiilileht
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
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  searchRow: { flexDirection: 'row', gap: 10, marginBottom: 15 },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0FF',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    fontSize: 15,
  },
  searchButton: {
    backgroundColor: '#7C4DFF',
    borderRadius: 12,
    paddingHorizontal: 18,
    justifyContent: 'center',
  },
  searchButtonText: { color: 'white', fontWeight: 'bold' },
  disabledButton: { opacity: 0.6 },
  divider: { height: 1, backgroundColor: '#EEE', marginVertical: 20 },
  emptyText: { color: '#666', fontSize: 14, marginBottom: 8 },
  playerCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0FF',
    backgroundColor: '#F9FAFF',
  },
  playerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#7C4DFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  playerText: { flex: 1, flexShrink: 1, minWidth: 0 },
  playerName: { fontSize: 15, fontWeight: 'bold' },
  playerStreak: { fontSize: 12, color: '#666', marginTop: 2 },
  smallButton: {
    backgroundColor: '#1D4ED8',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  smallButtonText: { color: 'white', fontWeight: 'bold' },
  actionRow: { flexDirection: 'row', gap: 8 },
  acceptButton: {
    backgroundColor: '#2E7D32',
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rejectButton: {
    backgroundColor: '#D32F2F',
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  friendActions: { flexDirection: 'row', alignItems: 'center', gap: 10, flexShrink: 0 },
  scoreContainer: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  scoreText: { fontSize: 18, fontWeight: 'bold', color: '#D97706' },
  removeFriendButton: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: '#FEE2E2',
  },
  pendingText: { color: '#666', fontWeight: 'bold' },
});
