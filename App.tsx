import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'; // PARANDATUD
import { Ionicons } from '@expo/vector-icons'; // PARANDATUD BRAUSERI JAOKS

import { DailyScreen } from './src/screens/DailyScreen';
import { GameScreen } from './src/screens/GameScreen'; 
import { StatsScreen } from './src/screens/StatsScreen';
import { FriendsScreen } from './src/screens/FriendsScreen';
import { Colors } from './src/theme/colors';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
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
        <Tab.Screen name="Practice" component={GameScreen} />
        <Tab.Screen name="Stats" component={StatsScreen} />
        <Tab.Screen name="Friends" component={FriendsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}