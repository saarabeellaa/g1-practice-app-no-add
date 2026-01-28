import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ChaptersScreen } from './ChaptersScreen';
import { LessonListScreen } from './LessonListScreen.js';
import { LessonReaderScreen } from './LessonReaderScreen.js';
import { MiniQuizScreen } from './MiniQuizScreen.js';
import { QuizResultScreen } from './QuizResultScreen.js';
import { ChapterTestScreen } from './ChapterTestScreen.js';

const GuideStack = createNativeStackNavigator();

export function GuideStackScreen() {
  return (
    <GuideStack.Navigator>
      <GuideStack.Screen 
        name="Chapters" 
        component={ChaptersScreen} 
        options={{ headerShown: false }} 
      />
      <GuideStack.Screen 
        name="LessonList" 
        component={LessonListScreen} 
        options={({ route }) => ({ title: route.params?.title || 'Lessons' })} 
      />
      <GuideStack.Screen 
        name="LessonReader" 
        component={LessonReaderScreen} 
        options={{ title: 'Lesson' }} 
      />
      <GuideStack.Screen 
        name="MiniQuiz" 
        component={MiniQuizScreen} 
        options={{ title: 'Mini Quiz' }} 
      />
      <GuideStack.Screen 
        name="QuizResult" 
        component={QuizResultScreen} 
        options={{ title: 'Results' }} 
      />
      <GuideStack.Screen 
        name="ChapterTest" 
        component={ChapterTestScreen} 
        options={({ route }) => ({ title: route.params?.title || 'Chapter Test' })} 
      />
    </GuideStack.Navigator>
  );
}