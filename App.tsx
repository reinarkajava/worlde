//Põhifail kus kõik ekraanid on
//Imporditud funktsioonid ja komponentid
import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from './src/lib/supabase';
import { AuthScreen } from './src/screens/AuthScreen';
import { ForgotPasswordScreen } from './src/screens/ForgotPasswordScreen';
import { ResetPasswordScreen } from './src/screens/ResetPasswordScreen';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'; // bottom-tabs + vector-icons sobivad ka webiga
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { DailyScreen } from './src/screens/DailyScreen';
import { PracticeScreen } from './src/screens/PracticeScreen';
import { RandomTestScreen } from './src/screens/RandomTestScreen';
import { RandomTestScreen as DailyWordProtoScreen } from './src/screens/Daily/DailyWordProto';
import { RandomTestScreen as Practice4LetterScreen } from './src/screens/Practice/Practice4Letter';
import { RandomTestScreen as Practice5LetterScreen } from './src/screens/Practice/Practice5Letter';
import { RandomTestScreen as Practice6LetterScreen } from './src/screens/Practice/Practice6Letter';
import { StatsScreen } from './src/screens/StatsScreen';
import { FriendsScreen } from './src/screens/FriendsScreen';
import { UserProvider, useUser } from './src/context/UserContext';
import type { RootStackParamList } from './src/navigation/types';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator<RootStackParamList>();
type AuthView = 'login' | 'forgot-password' | 'reset-password';

// Sõprade ikooni nurga punane täpp: UserContext `redButton` = mitu sulle suunatud ootel kutset on.
// Valge ääris: kui tab bar kunagi tumedaks läheb, ring ei kao taustasse.
const friendsTabRedDot = {
  position: 'absolute' as const,
  top: 1,
  right: 2,
  width: 10,
  height: 10,
  borderRadius: 5,
  backgroundColor: '#DC2626',
  borderWidth: 2,
  borderColor: '#fff',
};

function AppTabs() {
  const { redButton } = useUser();
  const insets = useSafeAreaInsets();
  const tabBarBottom = Math.max(insets.bottom, 10);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          if (route.name === 'Sõbrad') {
            const iconName = focused ? 'people' : 'people-outline';
            return (
              <View
                style={{
                  width: size + 4,
                  height: size + 2,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Ionicons name={iconName} size={size} color={color} />
                {redButton > 0 ? <View style={friendsTabRedDot} /> : null}
              </View>
            );
          }

          let iconName: any;
          if (route.name === 'Igapäevane') iconName = focused ? 'calendar' : 'calendar-outline';
          else if (route.name === 'Harjutamine') iconName = focused ? 'barbell' : 'barbell-outline';
          else if (route.name === 'Statistika') iconName = focused ? 'trophy' : 'trophy-outline';
          else iconName = 'help';

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#7C4DFF',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          paddingTop: 6,
          paddingBottom: tabBarBottom,
          minHeight: 48 + tabBarBottom,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Igapäevane" component={DailyScreen} />
      <Tab.Screen name="Harjutamine" component={PracticeScreen} />
      <Tab.Screen name="Statistika" component={StatsScreen} />
      <Tab.Screen name="Sõbrad" component={FriendsScreen} />
    </Tab.Navigator>
  );
}

function LoggedInStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="MainTabs" component={AppTabs} options={{ headerShown: false }} />
      <Stack.Screen
        name="RandomTest"
        component={RandomTestScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="DailyPuzzle" component={DailyWordProtoScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Practice4" component={Practice4LetterScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Practice5" component={Practice5LetterScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Practice6" component={Practice6LetterScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [authView, setAuthView] = useState<AuthView>('login');

  useEffect(() => {
    // Sisselogimise kontroll
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    //  sisselogimise/väljalogimise sündmuste kuulamine
    supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);

      if (event === 'PASSWORD_RECOVERY') {
        setAuthView('reset-password');
      }
    });
  }, []);

  return (
    <SafeAreaProvider>
      {authView === 'reset-password' ? (
        <ResetPasswordScreen
          onComplete={async () => {
            await supabase.auth.signOut();
            setSession(null);
            setAuthView('login');
          }}
        />
      ) : !session ? (
        authView === 'forgot-password' ? (
          <ForgotPasswordScreen onBack={() => setAuthView('login')} />
        ) : (
          <AuthScreen onForgotPassword={() => setAuthView('forgot-password')} />
        )
      ) : (
        <UserProvider>
          <NavigationContainer>
            <LoggedInStack />
          </NavigationContainer>
        </UserProvider>
      )}
    </SafeAreaProvider>
  );
}
