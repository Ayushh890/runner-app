import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider as PaperProvider } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import MapScreen from './screens/MapScreen';
import RoutePlannerScreen from './screens/RoutePlannerScreen';
import MatchConnectScreen from './screens/MatchConnectScreen';
import ScheduleScreen from './screens/ScheduleScreen';
import LiveRunScreen from './screens/LiveRunScreen';
import CommunityScreen from './screens/CommunityScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <PaperProvider>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName: keyof typeof Ionicons.glyphMap;

              if (route.name === 'Map') {
                iconName = focused ? 'map' : 'map-outline';
              } else if (route.name === 'Routes') {
                iconName = focused ? 'navigate' : 'navigate-outline';
              } else if (route.name === 'Connect') {
                iconName = focused ? 'people' : 'people-outline';
              } else if (route.name === 'Schedule') {
                iconName = focused ? 'calendar' : 'calendar-outline';
              } else if (route.name === 'Live Run') {
                iconName = focused ? 'play' : 'play-outline';
              } else if (route.name === 'Community') {
                iconName = focused ? 'heart' : 'heart-outline';
              } else {
                iconName = 'help-outline';
              }

              return <Ionicons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: 'tomato',
            tabBarInactiveTintColor: 'gray',
          })}
        >
          <Tab.Screen name="Map" component={MapScreen} />
          <Tab.Screen name="Routes" component={RoutePlannerScreen} />
          <Tab.Screen name="Connect" component={MatchConnectScreen} />
          <Tab.Screen name="Schedule" component={ScheduleScreen} />
          <Tab.Screen name="Live Run" component={LiveRunScreen} />
          <Tab.Screen name="Community" component={CommunityScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}
