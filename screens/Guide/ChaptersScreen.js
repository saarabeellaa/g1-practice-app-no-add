import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { styles } from '../../styles/styles.js';
import { useTopics } from '../../hooks/useData.js';
import { supabase } from '../../supabase.js';
import { useUserId } from '../../context/UserContext';

export function ChaptersScreen({ navigation }) {
  const { userId, loading: userLoading } = useUserId();
  const [topics, loading] = useTopics();
  const [chapterData, setChapterData] = React.useState({});
  const [loadingData, setLoadingData] = React.useState(true);

  // Chapter icons
  const chapterIcons = {
    1: 'book-open-variant',
    2: 'road-variant',
    3: 'traffic-light',
    4: 'car',
    5: 'shield-check',
    6: 'alert-circle',
    7: 'weather-cloudy',
    8: 'account-group',
  };

  // Card background colors
  const cardColors = [
    '#fff',
    '#fff',
    '#fff',
    '#fff',
  ];

  React.useEffect(() => {
    let mounted = true;
    
    async function loadChapterData() {
      // Wait for userId to be ready
      if (!supabase || !userId || topics.length === 0) {
        console.log('⏳ Waiting for data... userId:', userId, 'topics:', topics.length);
        if (mounted) setLoadingData(false);
        return;
      }

      console.log('📊 Loading chapter data with userId:', userId);
      setLoadingData(true);

      try {
        const dataMap = {};
        
        for (const topic of topics) {
          const { data: lessons } = await supabase
            .from('study_lessons')
            .select('id')
            .eq('topic_id', topic.id);
          
          const totalLessons = lessons?.length || 0;
          
          try {
            const { data: progressData } = await supabase
              .from('chapter_progress')
              .select('*')
              .eq('user_id', userId)
              .eq('topic_id', topic.id)
              .maybeSingle();
            
            console.log(`📖 Topic ${topic.id} progress:`, progressData);
            
            dataMap[topic.id] = {
              totalLessons,
              completedLessons: progressData?.completed_lessons || 0,
              lastAccessed: progressData?.last_accessed || null,
              isCompleted: progressData?.completed_lessons === totalLessons && totalLessons > 0,
              isStarted: (progressData?.completed_lessons || 0) > 0,
              estimatedMinutes: totalLessons * 8
            };
          } catch (err) {
            console.error('Error fetching progress for topic', topic.id, err);
            dataMap[topic.id] = {
              totalLessons,
              completedLessons: 0,
              lastAccessed: null,
              isCompleted: false,
              isStarted: false,
              estimatedMinutes: totalLessons * 8
            };
          }
        }
        
        if (mounted) {
          setChapterData(dataMap);
          setLoadingData(false);
          console.log('✅ Chapter data loaded:', dataMap);
        }
      } catch (error) {
        console.error('Error loading chapter data:', error);
        if (mounted) setLoadingData(false);
      }
    }

    loadChapterData();
    return () => { mounted = false; };
  }, [topics, userId]); // Re-run when userId arrives

  const formatLastAccessed = (timestamp) => {
    if (!timestamp) return null;
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  if (loading || loadingData || userLoading) {
    return <ActivityIndicator size="large" color="#1976d2" style={{ marginTop: 80 }} />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      <View style={styles.fixedHeader}>
        <Text style={styles.headerTitle}>Study Guide</Text>
        <Text style={styles.headerSubtitle}>Master your G1 knowledge chapter by chapter</Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingTop: 8 }}>
        <View style={styles.chapterGrid}>
        {topics.map((topic, index) => {
          const data = chapterData[topic.id] || {
            totalLessons: 0,
            completedLessons: 0,
            lastAccessed: null,
            isCompleted: false,
            isStarted: false,
            estimatedMinutes: 0
          };
          
          const cardColor = cardColors[index % cardColors.length];
          const lastAccessedText = formatLastAccessed(data.lastAccessed);
          const buttonText = data.isCompleted ? 'Review' : data.isStarted ? 'Continue' : 'Start';
          const icon = chapterIcons[topic.id] || 'book-open-variant';
          const completionPercent = data.totalLessons > 0 ? (data.completedLessons / data.totalLessons) * 100 : 0;

          return (
            <TouchableOpacity
              key={topic.id}
              style={styles.enhancedChapterCard}
              onPress={() => navigation.navigate('LessonList', { topicId: topic.id, title: topic.title })}
              activeOpacity={0.8}
            >
              <View style={[styles.enhancedChapterGradient, { backgroundColor: cardColor }]} />

              {data.isCompleted && (
                <View style={styles.enhancedCompletedBadge}>
                  <MaterialCommunityIcons name="check-circle" size={32} color="#4caf50" />
                </View>
              )}

              <View style={styles.enhancedChapterContent}>
                <View style={styles.enhancedChapterTopRow}>
                  <View style={styles.enhancedChapterBadge}>
                    <Text style={styles.enhancedChapterBadgeText}>{index + 1}</Text>
                  </View>
                  <MaterialCommunityIcons name={icon} size={24} color="#1976d2" style={{ marginLeft: 10 }} />

                  <Text style={styles.enhancedChapterTitle}>{topic.title}</Text>
                </View>

                <View style={styles.enhancedMetaRow}>
                  <View style={styles.enhancedMetaItem}>
                    <MaterialCommunityIcons name="book-outline" size={14} color="#666" />
                    <Text style={styles.enhancedMetaText}>
                      {data.completedLessons}/{data.totalLessons} lessons
                    </Text>
                  </View>
                  <View style={styles.enhancedMetaItem}>
                    <MaterialCommunityIcons name="clock-outline" size={14} color="#666" />
                    <Text style={styles.enhancedMetaText}>
                      ~{data.estimatedMinutes} min
                    </Text>
                  </View>
                </View>

                <View style={styles.enhancedProgressContainer}>
                  <View style={styles.enhancedProgressBar}>
                    <View style={[styles.enhancedProgressFill, { width: `${completionPercent}%` }]} />
                  </View>
                  <Text style={styles.enhancedProgressText}>
                    {Math.round(completionPercent)}% complete
                  </Text>
                </View>

                {lastAccessedText && (
                  <Text style={styles.enhancedLastAccessed}>
                    Last accessed {lastAccessedText}
                  </Text>
                )}

                <View style={styles.enhancedActionButton}>
                  <Text style={styles.enhancedActionButtonText}>{buttonText}</Text>
                  <MaterialCommunityIcons name="arrow-right" size={18} color="#FFF" />
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}
