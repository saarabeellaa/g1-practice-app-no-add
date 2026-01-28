import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MockTestsProvider } from './MockTestsContext';
import { MockTestsListScreen } from './MockTestsListScreen';
import { TestSessionScreen } from './TestSessionScreen';

const MockStack = createNativeStackNavigator();

export function MockStackScreen() {
  return (
    <MockTestsProvider>
      <MockStack.Navigator>
        <MockStack.Screen 
          name="MockTestsList" 
          component={MockTestsListScreen} 
          options={{ headerShown: false }} 
        />
        <MockStack.Screen 
          name="TestSession" 
          component={TestSessionScreen} 
          options={{ title: 'Test Session' }} 
        />
      </MockStack.Navigator>
    </MockTestsProvider>
  );
}