import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { styles } from '../../styles/styles.js';
import { useLessons, useTopicQuiz } from '../../hooks/useData.js';
import { supabase } from '../../supabase.js';
import { useUserId } from '../../context/UserContext';

export function LessonListScreen({ route, navigation }) {
  const { userId, loading: userLoading } = useUserId();
  const { topicId, title } = route.params;
  const [lessons, loading] = useLessons(topicId);
  const [quiz, loadingQuiz] = useTopicQuiz(topicId);

  // Update last accessed when screen loads
  React.useEffect(() => {
    async function updateLastAccessed() {
      if (!supabase || !topicId || !userId) {
        console.log('⏳ Waiting for userId in LessonList:', userId);
        return;
      }

      console.log('📝 Updating last accessed for topic:', topicId, 'userId:', userId);

      try {
        const { data: existing } = await supabase
          .from('chapter_progress')
          .select('*')
          .eq('user_id', userId)
          .eq('topic_id', topicId)
          .maybeSingle();

        if (existing) {
          await supabase
            .from('chapter_progress')
            .update({ last_accessed: new Date().toISOString() })
            .eq('id', existing.id);
          console.log('✅ Updated last_accessed');
        } else {
          await supabase
            .from('chapter_progress')
            .insert({
              user_id: userId,
              topic_id: topicId,
              completed_lessons: 0,
              last_accessed: new Date().toISOString()
            });
          console.log('✅ Created new chapter_progress record');
        }
      } catch (error) {
        console.error('Error updating last accessed:', error);
      }
    }

    updateLastAccessed();
  }, [topicId, userId]);

  if (loading || loadingQuiz || userLoading) {
    return <ActivityIndicator size="large" color="#1976d2" style={{ marginTop: 80 }} />;
  }
  
  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={styles.section}>
        <Text style={styles.title}>{title}</Text>
        <Text style={{ color: '#555', marginBottom: 12 }}>Select a lesson to read in full.</Text>
        
        {quiz && quiz.length > 0 && (
          <TouchableOpacity 
            style={styles.chapterTestBtn} 
            onPress={() => navigation.navigate('ChapterTest', { 
              topicId: topicId, 
              title: `${title} - Chapter Test`,
              quiz: quiz 
            })}
          >
            <MaterialCommunityIcons name="book-check" size={24} color="#fff" />
            <Text style={styles.chapterTestBtnText}>
              Take Chapter Test ({quiz.length} questions)
            </Text>
          </TouchableOpacity>
        )}
      </View>
      
      <View style={{ padding: 16 }}>
        {lessons.map((l) => (
          <TouchableOpacity 
            key={l.id} 
            style={styles.lessonCardLarge} 
            onPress={() => navigation.navigate('LessonReader', { lessonId: l.id })}
          >
            <Text style={styles.lessonTitleLarge}>{l.order}. {l.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}