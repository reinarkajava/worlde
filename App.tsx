//Põhifail kus kõik ekraanid on
//Imporditud funktsioonid ja komponentid
import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { supabase } from './src/lib/supabase';
import { AuthScreen } from './src/screens/AuthScreen';
import { ForgotPasswordScreen } from './src/screens/ForgotPasswordScreen';
import { ResetPasswordScreen } from './src/screens/ResetPasswordScreen';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'; // bottom-tabs + vector-icons sobivad ka webiga
import { Ionicons } from '@expo/vector-icons';

import { DailyScreen } from './src/screens/DailyScreen';
import { PracticeScreen } from './src/screens/PracticeScreen';
import { StatsScreen } from './src/screens/StatsScreen';
import { FriendsScreen } from './src/screens/FriendsScreen';
import { Colors } from './src/theme/colors';
import { UserProvider, useUser } from './src/context/UserContext';

const Tab = createBottomTabNavigator();
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
        tabBarStyle: { height: 60, paddingBottom: 10 },
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

  if (authView === 'reset-password') {
    return (
      <ResetPasswordScreen
        onComplete={async () => {
          await supabase.auth.signOut();
          setSession(null);
          setAuthView('login');
        }}
      />
    );
  }

  //Sisselogimine, registreerimine ja passwd recovery vaade siis kui kasutaja pole sees
  if (!session) {
    if (authView === 'forgot-password') {
      return <ForgotPasswordScreen onBack={() => setAuthView('login')} />;
    }

    return <AuthScreen onForgotPassword={() => setAuthView('forgot-password')} />;
  }

  // KUI ON SISSE LOGITUD, NÄITAME kõike muuid asju ka
  return (
    <UserProvider>
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: any; // Lisatud 'any' tüübi vea vältimiseks
            if (route.name === 'Igapäevane') iconName = focused ? 'calendar' : 'calendar-outline';
            else if (route.name === 'Harjutamine') iconName = focused ? 'barbell' : 'barbell-outline';
            else if (route.name === 'Statistika') iconName = focused ? 'trophy' : 'trophy-outline';
            else if (route.name === 'Sõbrad') iconName = focused ? 'people' : 'people-outline';
            
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#7C4DFF',
          tabBarInactiveTintColor: 'gray',
          tabBarStyle: { height: 60, paddingBottom: 10 },
          headerShown: false,
        })}
      >
        <Tab.Screen name="Igapäevane" component={DailyScreen} />
        <Tab.Screen name="Harjutamine" component={PracticeScreen} />
        <Tab.Screen name="Statistika" component={StatsScreen} />
        <Tab.Screen name="Sõbrad" component={FriendsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
    </UserProvider>
  );
}
