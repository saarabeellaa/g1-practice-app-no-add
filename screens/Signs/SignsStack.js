import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SignsScreen } from './SignsScreen';
import { CategoryDetailScreen } from './CategoryDetailScreen';
import { FlashcardSessionScreen } from './FlashcardSessionScreen';

const SignsStack = createNativeStackNavigator();

export function SignsStackScreen() {
  return (
    <SignsStack.Navigator>
      <SignsStack.Screen 
        name="SignsHome" 
        component={SignsScreen} 
        options={{ title: 'Signs', headerShown: false }} 
      />
      <SignsStack.Screen 
        name="CategoryDetail" 
        component={CategoryDetailScreen} 
        options={{ title: 'Category' }} 
      />
      <SignsStack.Screen 
        name="FlashcardSession" 
        component={FlashcardSessionScreen} 
        options={{ title: 'Flashcards' }} 
      />
    </SignsStack.Navigator>
  );
}