// ============================================================================
// COMPLETE: screens/Signs/SignsScreen.js (FULLY UPDATED)
// ============================================================================

import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { styles } from '../../styles/styles.js';
import { useCategories } from '../../hooks/useData.js';
import { supabase } from '../../supabase.js';
import { useUserId } from '../../context/UserContext';

export function SignsScreen({ navigation }) {
  const { userId, loading: userLoading } = useUserId();
  const [categories, loadingCategories] = useCategories();
  const [progress, setProgress] = React.useState({
    new: 0,
    learning: 0,
    reviewing: 0,
    mastered: 0
  });
  const [categoryProgress, setCategoryProgress] = React.useState({});
  const [allSignsProgress, setAllSignsProgress] = React.useState({});
  const [loadingProgress, setLoadingProgress] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState('all');

  React.useEffect(() => {
    let mounted = true;
    async function loadProgress() {
      if (!supabase || !userId) {
        console.log('⏳ Waiting for userId:', userId);
        if (mounted) setLoadingProgress(false);
        return;
      }
      
      console.log('📊 Loading signs progress with userId:', userId);
      setLoadingProgress(true);

      try {
        const { data: allSigns, error: signsError } = await supabase
          .from('signs')
          .select('id, category_id');

        if (signsError) throw signsError;

        const { data: userProgress, error: progressError } = await supabase
          .from('sign_progress')
          .select('sign_id, correct_count, incorrect_count, mastered')
          .eq('user_id', userId);

        if (progressError) throw progressError;

        console.log('✅ Signs progress loaded:', userProgress?.length, 'records');

        if (!mounted) return;

        const progressMap = {};
        (userProgress || []).forEach(p => {
          progressMap[p.sign_id] = p;
        });

        let newCount = 0;
        let learningCount = 0;
        let reviewingCount = 0;
        let masteredCount = 0;

        const catProgress = {};

        (allSigns || []).forEach(sign => {
          const prog = progressMap[sign.id];
          
          if (!prog) {
            newCount++;
          } else if (prog.mastered) {
            masteredCount++;
          } else if (prog.correct_count > 0 && prog.incorrect_count > 0) {
            reviewingCount++;
          } else if (prog.correct_count > 0 || prog.incorrect_count > 0) {
            learningCount++;
          } else {
            newCount++;
          }

          if (sign.category_id) {
            if (!catProgress[sign.category_id]) {
              catProgress[sign.category_id] = { total: 0, mastered: 0, signs: {} };
            }
            catProgress[sign.category_id].total++;
            if (prog && prog.mastered) {
              catProgress[sign.category_id].mastered++;
            }
            catProgress[sign.category_id].signs[sign.id] = prog || null;
          }
        });

        setProgress({
          new: newCount,
          learning: learningCount,
          reviewing: reviewingCount,
          mastered: masteredCount
        });
        setCategoryProgress(catProgress);
        setAllSignsProgress(progressMap);
        setLoadingProgress(false);
      } catch (error) {
        console.error('Error loading progress:', error);
        if (mounted) setLoadingProgress(false);
      }
    }
    loadProgress();
    return () => { mounted = false; };
  }, [userId]);

  const filteredContent = React.useMemo(() => {
    if (activeTab === 'all') {
      return { type: 'categories', data: categories };
    }
    
    if (activeTab === 'mastered') {
      const masteredSigns = [];
      categories.forEach(cat => {
        cat.cards.forEach(card => {
          const signProgress = allSignsProgress[card.id];
          if (signProgress?.mastered === true) {
            masteredSigns.push({
              ...card,
              categoryTitle: cat.title,
              categoryIcon: cat.icon
            });
          }
        });
      });
      return { type: 'signs', data: masteredSigns };
    }
    
    if (activeTab === 'learning') {
      const learningSigns = [];
      categories.forEach(cat => {
        cat.cards.forEach(card => {
          const signProgress = allSignsProgress[card.id];
          if (signProgress && !signProgress.mastered && (signProgress.correct_count > 0 || signProgress.incorrect_count > 0)) {
            learningSigns.push({
              ...card,
              categoryTitle: cat.title,
              categoryIcon: cat.icon,
              progress: signProgress
            });
          }
        });
      });
      return { type: 'signs', data: learningSigns };
    }
    
    return { type: 'categories', data: [] };
  }, [categories, allSignsProgress, activeTab]);

  if (loadingCategories || loadingProgress || userLoading) {
    return <ActivityIndicator size="large" color="#1976d2" style={{ marginTop: 80 }} />;
  }

  const totalSigns = progress.new + progress.learning + progress.reviewing + progress.mastered;
  const overallProgress = totalSigns > 0 ? progress.mastered / totalSigns : 0;

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Fixed Header */}
      <View style={styles.fixedHeader}>
        <Text style={styles.headerTitle}>Ontario Road Signs</Text>
        <Text style={styles.headerSubtitle}>Master all road signs with interactive flashcards</Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingTop: 8 }}>

      <View style={[styles.section, { paddingTop: 0 }]}>
        <Text style={[styles.sectionTitle, { marginBottom: 12 }]}>Performance Summary</Text>
        <View style={styles.performanceGrid}>
          <View style={[styles.performanceCard, { backgroundColor: '#e3f2fd' }]}>
            <Text style={styles.performanceNumber}>{progress.new}</Text>
            <Text style={styles.performanceLabel}>New</Text>
          </View>
          <View style={[styles.performanceCard, { backgroundColor: '#e3f2fd' }]}>
            <Text style={styles.performanceNumber}>{progress.learning}</Text>
            <Text style={styles.performanceLabel}>Learning</Text>
          </View>
          <View style={[styles.performanceCard, { backgroundColor: '#e3f2fd' }]}>
            <Text style={styles.performanceNumber}>{progress.reviewing}</Text>
            <Text style={styles.performanceLabel}>Reviewing</Text>
          </View>
          <View style={[styles.performanceCard, { backgroundColor: '#e3f2fd' }]}>
            <Text style={styles.performanceNumber}>{progress.mastered}</Text>
            <Text style={styles.performanceLabel}>Mastered</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBarFill, { width: `${Math.round(overallProgress * 100)}%` }]} />
          <Text style={styles.progressBarText}>
            {Math.round(overallProgress * 100)}% Complete
          </Text>
        </View>
      </View>

      <View style={[styles.section, { paddingTop: 0 }]}>
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'all' && styles.tabActive]} 
            onPress={() => setActiveTab('all')}
          >
            <Text style={[styles.tabText, activeTab === 'all' && styles.tabTextActive]}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'learning' && styles.tabActive]} 
            onPress={() => setActiveTab('learning')}
          >
            <Text style={[styles.tabText, activeTab === 'learning' && styles.tabTextActive]}>Learning</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'mastered' && styles.tabActive]} 
            onPress={() => setActiveTab('mastered')}
          >
            <Text style={[styles.tabText, activeTab === 'mastered' && styles.tabTextActive]}>Mastered</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { marginBottom: 12 }]}>
          {activeTab === 'all' ? 'Sign Categories' : activeTab === 'mastered' ? 'Mastered Signs' : 'Learning Signs'}
        </Text>
        {filteredContent.data.length === 0 ? (
          <View style={{ alignItems: 'center', paddingVertical: 40 }}>
            <MaterialCommunityIcons 
              name={activeTab === 'mastered' ? 'trophy-outline' : 'school-outline'} 
              size={64} 
              color="#ccc" 
            />
            <Text style={{ color: '#999', textAlign: 'center', marginTop: 16, fontSize: 16 }}>
              {activeTab === 'mastered' 
                ? 'No mastered signs yet.\nStart practicing to master signs!' 
                : 'No signs in learning.\nStart flashcards to begin learning!'}
            </Text>
          </View>
        ) : filteredContent.type === 'categories' ? (
          filteredContent.data.map((cat) => {
            const catProg = categoryProgress[cat.id] || { total: cat.cards.length, mastered: 0 };
            const progressPercent = catProg.total > 0 ? (catProg.mastered / catProg.total) * 100 : 0;

            return (
              <TouchableOpacity 
                key={cat.id} 
                style={styles.categoryCardLarge} 
                onPress={() => navigation.navigate('CategoryDetail', { categoryId: cat.id })}
              >
                <View style={styles.categoryCardHeader}>
                  <View style={styles.categoryIconContainer}>
                    <MaterialCommunityIcons name={cat.icon || 'information'} size={32} color="#1976d2" />
                  </View>
                  <View style={styles.categoryCardContent}>
                    <Text style={styles.categoryCardTitle}>{cat.title}</Text>
                    <Text style={styles.categoryCardSubtitle}>
                      {cat.cards.length} Sign{cat.cards.length !== 1 ? 's' : ''}
                    </Text>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={24} color="#1976d2" />
                </View>
                
                <View style={styles.categoryProgressContainer}>
                  <View style={styles.categoryProgressBar}>
                    <View style={[styles.categoryProgressFill, { width: `${progressPercent}%` }]} />
                  </View>
                  <Text style={styles.categoryProgressText}>
                    {Math.round(progressPercent)}% mastered ({catProg.mastered}/{catProg.total})
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })
        ) : (
          filteredContent.data.map((sign) => (
            <View key={sign.id} style={styles.signCardDetail}>
              <View style={styles.signImageWrapper}>
                {sign.img ? (
                  <Image 
                    source={{ uri: sign.img }} 
                    style={styles.signImgDetail}
                    resizeMode="contain"
                  />
                ) : (
                  <View style={[styles.signImgDetail, { backgroundColor: '#e3f2fd', alignItems: 'center', justifyContent: 'center' }]}>
                    <MaterialCommunityIcons name="sign-caution" size={32} color="#1976d2" />
                  </View>
                )}
                {activeTab === 'mastered' && (
                  <View style={styles.masteredBadge}>
                    <MaterialCommunityIcons name="trophy" size={16} color="#fff" />
                  </View>
                )}
              </View>
              <View style={styles.signCardDetailContent}>
                <Text style={styles.signCardDetailTitle}>{sign.title}</Text>
                <Text style={styles.signCardDetailDesc}>
                  {sign.desc || 'No description available'}
                </Text>
                <View style={styles.signCategoryBadge}>
                  <MaterialCommunityIcons name={sign.categoryIcon || 'information'} size={14} color="#1976d2" />
                  <Text style={styles.signCategoryText}>{sign.categoryTitle}</Text>
                </View>
                {activeTab === 'learning' && sign.progress && (
                  <View style={styles.signProgressInfo}>
                    <Text style={styles.signProgressText}>
                      Streak: {sign.progress.streak} | 
                      Correct: {sign.progress.correct_count} | 
                      Incorrect: {sign.progress.incorrect_count}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          ))
        )}
      </View>

      <View style={[styles.section, { paddingBottom: 32 }]}>
        <TouchableOpacity 
          style={styles.quickPracticeBtn}
          onPress={async () => {
            const allSigns = categories.flatMap(cat => 
              cat.cards.map(card => ({
                ...card,
                categoryId: cat.id,
                categoryTitle: cat.title,
                categoryIcon: cat.icon
              }))
            );

            if (allSigns.length === 0) {
              alert('No signs available for practice');
              return;
            }

            const signsByPriority = allSigns.map(sign => {
              const prog = allSignsProgress[sign.id];
              
              if (!prog) {
                return { ...sign, priority: 1, score: Math.random() };
              } else if (!prog.mastered && prog.incorrect_count > prog.correct_count) {
                return { ...sign, priority: 2, score: Math.random() };
              } else if (!prog.mastered && prog.streak < 3) {
                return { ...sign, priority: 3, score: Math.random() };
              } else if (prog.mastered) {
                return { ...sign, priority: 4, score: Math.random() };
              }
              return { ...sign, priority: 3, score: Math.random() };
            });

            signsByPriority.sort((a, b) => {
              if (a.priority !== b.priority) return a.priority - b.priority;
              return a.score - b.score;
            });

            const selectedSigns = signsByPriority.slice(0, 20).map(({ priority, score, ...sign }) => sign);

            navigation.navigate('FlashcardSession', { 
              cards: selectedSigns,
              isQuickPractice: true 
            });
          }}
        >
          <MaterialCommunityIcons name="lightning-bolt" size={28} color="#fff" />
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text style={styles.quickPracticeTitle}>Quick Practice</Text>
            <Text style={styles.quickPracticeSubtitle}>20 random signs from all categories</Text>
          </View>
          <MaterialCommunityIcons name="arrow-right" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </ScrollView>
    </View>
  );
}
