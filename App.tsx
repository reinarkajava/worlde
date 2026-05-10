import React, { useState, useEffect } from 'react';
import { supabase } from './src/lib/supabase';
import { AuthScreen } from './src/screens/AuthScreen';
import { ForgotPasswordScreen } from './src/screens/ForgotPasswordScreen';
import { ResetPasswordScreen } from './src/screens/ResetPasswordScreen';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'; // PARANDATUD
import { Ionicons } from '@expo/vector-icons'; // PARANDATUD BRAUSERI JAOKS

import { DailyScreen } from './src/screens/DailyScreen';
import { PracticeScreen } from './src/screens/PracticeScreen'; 
import { StatsScreen } from './src/screens/StatsScreen';
import { FriendsScreen } from './src/screens/FriendsScreen';
import { Colors } from './src/theme/colors';
import { UserProvider } from './src/context/UserContext';

const Tab = createBottomTabNavigator();
type AuthView = 'login' | 'forgot-password' | 'reset-password';

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [authView, setAuthView] = useState<AuthView>('login');

  useEffect(() => {
    // Kontrollime, kas kasutaja on juba sisse logitud
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Kuulame sisselogimise/väljalogimise sündmusi
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

  // KUI KASUTAJA POLE SISSE LOGITUD, NÄITAME AUTH VAADET
  if (!session) {
    if (authView === 'forgot-password') {
      return <ForgotPasswordScreen onBack={() => setAuthView('login')} />;
    }

    return <AuthScreen onForgotPassword={() => setAuthView('forgot-password')} />;
  }

  // KUI ON SISSE LOGITUD, NÄITAME PÄRIS ÄPPI
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