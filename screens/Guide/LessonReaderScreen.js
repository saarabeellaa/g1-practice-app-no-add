import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { styles } from '../../styles/styles';
import { useLesson, useLessonSigns, useLessonQuiz } from '../../hooks/useData';
import { supabase } from '../../supabase';

export function LessonReaderScreen({ route, navigation }) {
  const { lessonId } = route.params;
  const [lesson, loading] = useLesson(lessonId);
  const [signs, loadingSigns] = useLessonSigns(lessonId);
  const [quiz, loadingQuiz] = useLessonQuiz(lessonId);

  const hideQuiz = React.useMemo(() => {
    if (!lesson) return true;
    return lesson.topic_id === 1 && lesson.order <= 2;
  }, [lesson]);

  if (loading || loadingSigns) {
    return <ActivityIndicator size="large" color="#1976d2" style={{ marginTop: 80 }} />;
  }
  
  if (!lesson) {
    return <View style={styles.center}><Text>Lesson not found.</Text></View>;
  }

  const goToNextLesson = async () => {
    if (!supabase) {
      console.error("Supabase not initialized");
      navigation.pop();
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('study_lessons')
        .select('id')
        .eq('topic_id', lesson.topic_id)
        .order('"order"', { ascending: true });

      if (error || !data) {
        console.warn('Error fetching next lesson', error);
        return;
      }
      
      const orderList = data.map((d) => d.id);
      const idx = orderList.indexOf(lesson.id);
      
      if (idx >= 0 && idx + 1 < orderList.length) {
        navigation.replace('LessonReader', { lessonId: orderList[idx + 1] });
      } else {
        navigation.pop();
      }
    } catch (err) {
      console.error('Exception fetching next lesson:', err);
      navigation.pop();
    }
  };

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

      <TouchableOpacity 
        style={[styles.startBtn, { backgroundColor: '#1976d2', marginTop: 12, marginBottom: 20 }]} 
        onPress={goToNextLesson}
      >
        <Text style={styles.startBtnText}>Next Lesson</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}