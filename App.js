import React from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { UserProvider } from './context/UserContext';
import { SignsStackScreen } from './screens/Signs/SignsStack';
import { GuideStackScreen } from './screens/Guide/GuideStack';
import { MockStackScreen } from './screens/MockTests/MockStack';



const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator 
        initialRouteName="Guide" 
        screenOptions={{
          headerShown: false, 
          tabBarActiveTintColor: '#1976d2', 
          tabBarInactiveTintColor: '#888',
          tabBarStyle: { 
            backgroundColor: '#f9f9f9', 
            borderTopWidth: 0.5, 
            borderTopColor: '#ddd' 
          }
        }}
      >
        <Tab.Screen 
          name="Signs" 
          component={SignsStackScreen} 
          options={{
            tabBarLabel: 'Sign', 
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="road-variant" color={color} size={size} />
            )
          }} 
        />
        <Tab.Screen 
          name="Guide" 
          component={GuideStackScreen} 
          options={{
            tabBarLabel: 'Study', 
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="book-open-page-variant" color={color} size={size} />
            )
          }} 
        />
        <Tab.Screen 
          name="MockTests" 
          component={MockStackScreen} 
          options={{
            tabBarLabel: 'Mock Tests', 
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="clipboard-check-outline" color={color} size={size} />
            )
          }} 
        />
      </Tab.Navigator>
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <UserProvider>
        <NavigationContainer>
          <MainTabs />
        </NavigationContainer>
      </UserProvider>
    </SafeAreaProvider>
  );
}
