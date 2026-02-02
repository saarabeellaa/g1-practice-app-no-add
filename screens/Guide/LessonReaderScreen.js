import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { styles } from '../../styles/styles';
import { useLesson, useLessonSigns, useLessonQuiz } from '../../hooks/useData';
import { supabase } from '../../supabase';
import { useUserId } from '../../context/UserContext';

export function LessonReaderScreen({ route, navigation }) {
  const { lessonId } = route.params;
  const { userId } = useUserId();
  const [lesson, loading] = useLesson(lessonId);
  const [signs, loadingSigns] = useLessonSigns(lessonId);
  const [quiz, loadingQuiz] = useLessonQuiz(lessonId);
  const [marking, setMarking] = React.useState(false);
  const [isLastLesson, setIsLastLesson] = React.useState(false);
  const [nextTopicId, setNextTopicId] = React.useState(null);
  const [chapterId, setChapterId] = React.useState(null);

  const hideQuiz = React.useMemo(() => {
    if (!lesson) return true;
    return lesson.topic_id === 1 && lesson.order <= 2;
  }, [lesson]);

  // Get chapter_progress ID for the lesson's topic
  React.useEffect(() => {
    const getChapterId = async () => {
      if (!supabase || !userId || !lesson) return;

      try {
        const { data, error } = await supabase
          .from('chapter_progress')
          .select('id')
          .eq('user_id', userId)
          .eq('topic_id', lesson.topic_id)
          .maybeSingle();

        if (!error && data) {
          setChapterId(data.id);
          console.log(`✅ Found chapter_id: ${data.id} for topic ${lesson.topic_id}`);
        } else {
          console.error('Error fetching chapter_id:', error);
        }
      } catch (err) {
        console.error('Exception getting chapter_id:', err);
      }
    };

    getChapterId();
  }, [lesson, userId]);

  // Check if this is the last lesson in the chapter
  React.useEffect(() => {
    const checkIfLastLesson = async () => {
      if (!lesson || !supabase) return;

      try {
        const { data, error } = await supabase
          .from('study_lessons')
          .select('id')
          .eq('topic_id', lesson.topic_id)
          .order('order', { ascending: true });

        if (error || !data) {
          console.warn('Error checking last lesson:', error);
          return;
        }

        const lastLessonId = data[data.length - 1]?.id;
        setIsLastLesson(lesson.id === lastLessonId);

        // Get next topic for the "Next Chapter" button
        if (lesson.id === lastLessonId) {
          const { data: topics, error: topicError } = await supabase
            .from('topics')
            .select('id, title')
            .eq('id', lesson.topic_id + 1)
            .single();

          if (!topicError && topics) {
            setNextTopicId(topics.id);
          }
        }
      } catch (err) {
        console.error('Exception checking last lesson:', err);
      }
    };

    checkIfLastLesson();
  }, [lesson]);

  // Function to mark lesson as completed
  const markLessonAsCompleted = async (lessonToMark) => {
    if (!supabase || !userId || !lessonToMark || !chapterId) {
      console.log('❌ Missing required data:', {
        supabase: !!supabase,
        userId: !!userId,
        lessonId: lessonToMark?.id,
        chapterId
      });
      return false;
    }

    try {
      setMarking(true);
      console.log(`📝 Marking lesson ${lessonToMark.id} as completed`);

      // Step 1: Check if lesson is already marked
      console.log('Step 1: Checking if lesson already marked...');
      const { data: existing, error: checkError } = await supabase
        .from('lessons_progress')
        .select('id')
        .eq('user_id', userId)
        .eq('lesson_id', lessonToMark.id)
        .maybeSingle();

      if (checkError) {
        console.error('❌ Error checking lesson:', checkError);
        setMarking(false);
        return false;
      }

      if (existing) {
        console.log(`✅ Lesson ${lessonToMark.id} already marked, skipping`);
        setMarking(false);
        return true;
      }

      // Step 2: Insert into lessons_progress
      console.log('Step 2: Inserting into lessons_progress...');
      const { error: insertError } = await supabase
        .from('lessons_progress')
        .insert({
          user_id: userId,
          chapter_id: chapterId,
          lesson_id: lessonToMark.id,
          completed_at: new Date().toISOString()
        });

      if (insertError) {
        console.error('❌ Error inserting lesson:', insertError);
        setMarking(false);
        return false;
      }

      console.log(`✅ Inserted lesson ${lessonToMark.id} into lessons_progress`);

      // Step 3: Update chapter_progress counter
      console.log('Step 3: Updating chapter_progress...');
      const { data: currentProgress, error: fetchError } = await supabase
        .from('chapter_progress')
        .select('completed_lessons')
        .eq('id', chapterId)
        .single();

      if (fetchError) {
        console.error('❌ Error fetching current progress:', fetchError);
        setMarking(false);
        return false;
      }

      const newCount = (currentProgress?.completed_lessons || 0) + 1;
      console.log(`Incrementing completed_lessons from ${currentProgress?.completed_lessons || 0} to ${newCount}`);

      const { error: updateError } = await supabase
        .from('chapter_progress')
        .update({
          completed_lessons: newCount,
          updated_at: new Date().toISOString()
        })
        .eq('id', chapterId);

      if (updateError) {
        console.error('❌ Error updating chapter progress:', updateError);
        setMarking(false);
        return false;
      }

      console.log(`✅ Updated chapter_progress to ${newCount}`);
      setMarking(false);
      return true;

    } catch (error) {
      console.error('❌ Exception in markLessonAsCompleted:', error);
      setMarking(false);
      return false;
    }
  };

  const goToNextLesson = async () => {
    if (!supabase || !lesson) {
      console.error('❌ Supabase or lesson not initialized');
      navigation.pop();
      return;
    }

    console.log('🎯 goToNextLesson called');
    
    // Mark current lesson as completed
    const marked = await markLessonAsCompleted(lesson);
    console.log(`Lesson marked: ${marked}`);
    
    try {
      const { data, error } = await supabase
        .from('study_lessons')
        .select('id')
        .eq('topic_id', lesson.topic_id)
        .order('order', { ascending: true });

      if (error || !data) {
        console.warn('Error fetching next lesson:', error);
        return;
      }
      
      const orderList = data.map((d) => d.id);
      const idx = orderList.indexOf(lesson.id);
      
      if (idx >= 0 && idx + 1 < orderList.length) {
        console.log(`Navigating to next lesson: ${orderList[idx + 1]}`);
        navigation.replace('LessonReader', { lessonId: orderList[idx + 1] });
      } else {
        console.log('No more lessons, going back');
        navigation.pop();
      }
    } catch (err) {
      console.error('Exception fetching next lesson:', err);
      navigation.pop();
    }
  };

  const goToNextChapter = async () => {
    console.log('🎯 goToNextChapter called');
    
    // Mark current lesson as completed before moving to next chapter
    const marked = await markLessonAsCompleted(lesson);
    console.log(`Lesson marked: ${marked}`);
    
    if (nextTopicId) {
      console.log(`Navigating to next chapter: ${nextTopicId}`);
      navigation.navigate('LessonList', { topicId: nextTopicId, title: `Chapter ${nextTopicId}` });
    }
  };

  if (loading || loadingSigns) {
    return <ActivityIndicator size="large" color="#1976d2" style={{ marginTop: 80 }} />;
  }
  
  if (!lesson) {
    return <View style={styles.center}><Text>Lesson not found.</Text></View>;
  }

  return (
    <ScrollView 
      style={{ flex: 1, backgroundColor: '#fff' }}
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
    >
      <Text style={styles.lessonReaderTitle}>{lesson.title}</Text>
      <Text style={styles.lessonReaderText}>{lesson.content}</Text>

      {signs && signs.length > 0 && (
        <View style={styles.lessonSignsSection}>
          <Text style={styles.lessonSignsSectionTitle}>
            <MaterialCommunityIcons name="traffic-light" size={20} color="#1976d2" /> Road Signs in This Lesson
          </Text>
          {signs.map((sign) => (
            <View key={sign.id} style={styles.lessonSignCard}>
              <View style={styles.lessonSignImageContainer}>
                {sign.imageUrl ? (
                  <Image 
                    source={{ uri: sign.imageUrl }} 
                    style={styles.lessonSignImage}
                    resizeMode="contain"
                  />
                ) : (
                  <View style={[styles.lessonSignImage, { backgroundColor: '#e3f2fd', alignItems: 'center', justifyContent: 'center' }]}>
                    <MaterialCommunityIcons name="sign-caution" size={48} color="#1976d2" />
                  </View>
                )}
              </View>
              <View style={styles.lessonSignContent}>
                <Text style={styles.lessonSignTitle}>{sign.title}</Text>
                <Text style={styles.lessonSignDescription}>{sign.description}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {!hideQuiz && (
        <TouchableOpacity 
          style={styles.quizBtn} 
          onPress={() => navigation.navigate('MiniQuiz', { lessonId: lesson.id })}
        >
          <Text style={styles.quizBtnText}>Take Mini Quiz</Text>
        </TouchableOpacity>
      )}

      {isLastLesson && nextTopicId ? (
        <TouchableOpacity 
          style={[styles.startBtn, { backgroundColor: '#4caf50', marginTop: 12, marginBottom: 20 }]} 
          onPress={goToNextChapter}
          disabled={marking}
        >
          {marking ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.startBtnText}>Next Chapter →</Text>
          )}
        </TouchableOpacity>
      ) : (
        <TouchableOpacity 
          style={[styles.startBtn, { backgroundColor: '#1976d2', marginTop: 12, marginBottom: 20 }]} 
          onPress={goToNextLesson}
          disabled={marking}
        >
          {marking ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.startBtnText}>Next Lesson</Text>
          )}
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}
