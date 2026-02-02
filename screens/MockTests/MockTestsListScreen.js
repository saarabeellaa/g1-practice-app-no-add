import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { styles } from '../../styles/styles.js';
import { MockTestsContext } from './MockTestsContext.js';
import { supabase } from '../../supabase.js';
import { useUserId } from '../../context/UserContext';
import { CircularProgress } from '../Guide/CircularProgress';
import { useInterstitialAd } from '../../hooks/useInterstitialAd';
import { getInterstitialExtraTestId } from '../../config/adConfig';

export function MockTestsListScreen({ navigation }) {
  const { tests, loadingTests } = React.useContext(MockTestsContext);
  const { userId } = useUserId();
  const [testScores, setTestScores] = React.useState({});
  const [loadingScores, setLoadingScores] = React.useState(false);

  // Initialize interstitial ad for extra tests
  const { showAd, loaded } = useInterstitialAd(getInterstitialExtraTestId());

  // Memoized function to load test scores
  const loadTestScores = React.useCallback(async () => {
    if (!supabase || !userId || !tests || tests.length === 0) {
      console.log('⏳ Waiting for data to load test scores');
      setLoadingScores(false);
      return;
    }

    console.log(`📊 Loading test scores for user: ${userId}`);
    setLoadingScores(true);

    try {
      const scoresMap = {};

      // For each test, get the latest score
      for (const test of tests) {
        try {
          const { data, error } = await supabase
            .from('mock_test_results')
            .select('score, passed')
            .eq('user_id', userId)
            .eq('mock_test_id', test.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (!error && data) {
            scoresMap[test.id] = {
              score: data.score,
              passed: data.passed
            };
            console.log(`✅ Test ${test.id} score: ${data.score}%`);
          } else if (error) {
            console.log(`ℹ️ No scores yet for test ${test.id}`);
          }
        } catch (err) {
          console.error(`Error fetching score for test ${test.id}:`, err);
        }
      }

      setTestScores(scoresMap);
      setLoadingScores(false);
      console.log('✅ Test scores loaded:', scoresMap);
    } catch (error) {
      console.error('Error loading test scores:', error);
      setLoadingScores(false);
    }
  }, [userId, tests]);

  // Load scores on mount
  React.useEffect(() => {
    loadTestScores();
  }, [loadTestScores]);

  // Refresh scores when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      console.log('🔄 MockTestsListScreen focused - refreshing scores');
      loadTestScores();
    }, [loadTestScores])
  );
  
  if (loadingTests || loadingScores) {
    return <ActivityIndicator size="large" color="#1976d2" style={{ marginTop: 80 }} />;
  }
  
  if (!tests || tests.length === 0) {
    return <View style={styles.center}><Text>No mock tests available.</Text></View>;
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Fixed Header */}
      <View style={styles.fixedHeader}>
        <Text style={styles.headerTitle}>G1 Practice Tests</Text>
        <Text style={styles.headerSubtitle}>Full-length practice tests with 40 questions each</Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingTop: 8 }}>
        <View style={styles.section}>
          <View style={styles.mockTestInfoCard}>
            <MaterialCommunityIcons name="information" size={24} color="#1976d2" />
            <Text style={styles.mockTestInfoText}>
              Pass with 32+ correct answers (80%)
            </Text>
          </View>
        </View>
      
        <View style={{ padding: 16, paddingTop: 0 }}>
          {tests.map((t, index) => {
            const testScore = testScores[t.id];
            const hasScore = testScore !== undefined;
            const score = testScore?.score || 0;
            const isPassed = testScore?.passed || false;
            const showCheckmark = hasScore && isPassed;

            // Determine if this is an extra test (tests after the first 3 are "extra")
            // ADJUST THIS LOGIC based on your actual business rules
            const isExtraTest = index >= 3;

            // Determine performance label
            let performanceLabel = 'Not Attempted';
            let performanceColor = '#999';

            if (hasScore) {
              if (score >= 80) {
                performanceLabel = 'Excellent';
                performanceColor = '#43a047';
              } else if (score >= 50) {
                performanceLabel = 'Good';
                performanceColor = '#1976d2';
              } else if (score >= 20) {
                performanceLabel = 'Needs Improvement';
                performanceColor = '#FFA500';
              } else {
                performanceLabel = 'Poor';
                performanceColor = '#e53935';
              }
            }

            return (
              <View key={t.id} style={[styles.mockTestCard, { position: 'relative' }]}>
                {/* Extra Test Badge */}
                {isExtraTest && (
                  <View
                    style={{
                      position: 'absolute',
                      top: 8,
                      left: 8,
                      backgroundColor: '#FFA500',
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: 4,
                      zIndex: 10,
                    }}
                  >
                    <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>
                      PREMIUM
                    </Text>
                  </View>
                )}

                {/* Circular Progress Indicator - Top Right */}
                {hasScore && (
                  <View
                    style={{
                      position: 'absolute',
                      top: 16,
                      right: 16,
                      zIndex: 10
                    }}
                  >
                    <CircularProgress
                      percentage={score}
                      isCompleted={isPassed}
                      showCheckmark={showCheckmark}
                      size={70}
                      colorScheme="test"
                    />
                  </View>
                )}

                <View style={styles.mockTestCardHeader}>
                  <View style={styles.mockTestNumberBadge}>
                    <Text style={styles.mockTestNumberText}>{index + 1}</Text>
                  </View>
                  <View style={[{ flex: 1 }, hasScore && { marginRight: 80 }]}>
                    <Text style={styles.mockTestTitle}>{t.title}</Text>
                    <Text style={{ color: '#666', fontSize: 13, marginTop: 4 }}>
                      {t.description}
                    </Text>
                  </View>
                </View>

                {/* Score Information */}
                {hasScore && (
                  <View style={{ marginBottom: 12, marginLeft: 8 }}>
                    <Text
                      style={{
                        fontSize: 13,
                        color: performanceColor,
                        fontWeight: 'bold',
                        marginBottom: 4
                      }}
                    >
                      Latest Score: {score}% • {performanceLabel}
                    </Text>
                    <Text
                      style={{
                        fontSize: 12,
                        color: '#999',
                        fontStyle: 'italic'
                      }}
                    >
                      {isPassed ? '✓ Passed' : '✗ Not Passed'}
                    </Text>
                  </View>
                )}

                <View style={styles.mockTestCardFooter}>
                  <View style={styles.mockTestInfoRow}>
                    <MaterialCommunityIcons name="clipboard-text" size={18} color="#666" />
                    <Text style={{ fontSize: 13, color: '#666', marginLeft: 6 }}>
                      {t.questions.length} Questions
                    </Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.startMockTestBtn} 
                    onPress={() => {
                      if (isExtraTest) {
                        // Show interstitial ad before starting extra test
                        console.log('Starting extra test, showing ad...');
                        showAd(() => {
                          console.log('Ad closed, navigating to test');
                          navigation.navigate('TestSession', { test: t });
                        });
                      } else {
                        // No ad for regular tests
                        navigation.navigate('TestSession', { test: t });
                      }
                    }}
                  >
                    <Text style={styles.startMockTestBtnText}>
                      {hasScore ? 'Retake' : 'Start'}
                    </Text>
                    <MaterialCommunityIcons name="arrow-right" size={18} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}
