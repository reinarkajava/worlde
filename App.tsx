import React, { useState, useEffect } from 'react';
import { supabase } from './src/lib/supabase';
import { AuthScreen } from './src/screens/AuthScreen';
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

export default function App() {
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    // Kontrollime, kas kasutaja on juba sisse logitud
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Kuulame sisselogimise/väljalogimise sündmusi
    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  // KUI KASUTAJA POLE SISSE LOGITUD, NÄITAME AUTH VAADET
  if (!session) {
    return <AuthScreen />;
  }

  // KUI ON SISSE LOGITUD, NÄITAME PÄRIS ÄPPI
  return (
    <UserProvider>
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: any; // Lisatud 'any' tüübi vea vältimiseks
            if (route.name === 'Daily') iconName = focused ? 'calendar' : 'calendar-outline';
            else if (route.name === 'Practice') iconName = focused ? 'barbell' : 'barbell-outline';
            else if (route.name === 'Stats') iconName = focused ? 'trophy' : 'trophy-outline';
            else if (route.name === 'Friends') iconName = focused ? 'people' : 'people-outline';
            
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#7C4DFF',
          tabBarInactiveTintColor: 'gray',
          tabBarStyle: { height: 60, paddingBottom: 10 },
          headerShown: false,
        })}
      >
        <Tab.Screen name="Daily" component={DailyScreen} />
        <Tab.Screen name="Practice" component={PracticeScreen} />
        <Tab.Screen name="Stats" component={StatsScreen} />
        <Tab.Screen name="Friends" component={FriendsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
    </UserProvider>
  );
}