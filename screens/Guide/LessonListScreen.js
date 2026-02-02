import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
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
  const [completedLessons, setCompletedLessons] = React.useState({});
  const [loadingLessons, setLoadingLessons] = React.useState(true);
  const [chapterId, setChapterId] = React.useState(null);

  // Get chapter_progress ID
  React.useEffect(() => {
    const getChapterId = async () => {
      if (!supabase || !userId || !topicId) return;

      try {
        const { data, error } = await supabase
          .from('chapter_progress')
          .select('id')
          .eq('user_id', userId)
          .eq('topic_id', topicId)
          .maybeSingle();

        if (!error && data) {
          setChapterId(data.id);
          console.log(`✅ Found chapter_id: ${data.id}`);
        } else if (error) {
          console.error('Error fetching chapter_id:', error);
        }
      } catch (err) {
        console.error('Exception getting chapter_id:', err);
      }
    };

    getChapterId();
  }, [userId, topicId]);

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

  // Memoized function to load completed lessons
  const loadCompletedLessons = React.useCallback(async () => {
    if (!supabase || !userId || !chapterId || !lessons || lessons.length === 0) {
      console.log('⏳ Waiting for data to load completed lessons');
      setLoadingLessons(false);
      return;
    }

    console.log(`📚 Loading completed lessons for chapter_id: ${chapterId}`);
    setLoadingLessons(true);

    try {
      // Query lessons_progress for this user + chapter
      const { data: completedData, error } = await supabase
        .from('lessons_progress')
        .select('lesson_id')
        .eq('user_id', userId)
        .eq('chapter_id', chapterId);

      if (error) {
        console.error('Error loading completed lessons:', error);
        setLoadingLessons(false);
        return;
      }

      // Create a map of completed lesson IDs
      const completedMap = {};
      completedData?.forEach(record => {
        completedMap[record.lesson_id] = true;
      });

      console.log('✅ Completed lessons loaded:', Object.keys(completedMap));
      setCompletedLessons(completedMap);
      setLoadingLessons(false);
    } catch (error) {
      console.error('Error in loadCompletedLessons:', error);
      setLoadingLessons(false);
    }
  }, [userId, chapterId, lessons]);

  // Load completed lessons on mount
  React.useEffect(() => {
    loadCompletedLessons();
  }, [loadCompletedLessons]);

  // Refresh completed lessons when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      console.log('🔄 LessonListScreen focused - refreshing completed lessons');
      loadCompletedLessons();
    }, [loadCompletedLessons])
  );

  if (loading || loadingQuiz || userLoading || loadingLessons) {
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
        {lessons.map((l) => {
          const isCompleted = completedLessons[l.id] || false;
          
          return (
            <View key={l.id} style={{ position: 'relative', marginBottom: 8 }}>
              <TouchableOpacity 
                style={styles.lessonCardLarge} 
                onPress={() => navigation.navigate('LessonReader', { lessonId: l.id })}
              >
                <Text 
                  style={[
                    styles.lessonTitleLarge,
                    {
                      paddingRight: isCompleted ? 50 : 0,
                      flexWrap: 'wrap'
                    }
                  ]}
                >
                  {l.order}. {l.title}
                </Text>
              </TouchableOpacity>
              
              {/* Checkmark badge for completed lessons - centered and right positioned */}
              {isCompleted && (
                <View style={{
                  position: 'absolute',
                  top: '50%',
                  right: 12,
                  marginTop: -22,
                  backgroundColor: '#4caf50',
                  borderRadius: 20,
                  width: 36,
                  height: 36,
                  justifyContent: 'center',
                  alignItems: 'center',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.25,
                  shadowRadius: 3.84,
                  elevation: 5,
                }}>
                  <MaterialCommunityIcons name="check-circle" size={32} color="#fff" />
                </View>
              )}
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}
