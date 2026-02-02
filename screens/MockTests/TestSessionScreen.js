import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { styles } from '../../styles/styles';
import { supabase } from '../../supabase';
import { useUserId } from '../../context/UserContext';
import { CircularProgress } from '../Guide/CircularProgress';

export function TestSessionScreen({ route, navigation }) {
  const { test } = route.params;
  const { userId } = useUserId();
  const [current, setCurrent] = React.useState(0);
  const total = test ? test.questions.length : 0;
  const [answers, setAnswers] = React.useState(Array(total).fill(null));
  const [showResults, setShowResults] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [resultsSaved, setResultsSaved] = React.useState(false);

  // ALL HOOKS MUST BE CALLED HERE - BEFORE ANY EARLY RETURNS
  React.useEffect(() => {
    setCurrent(0);
    setAnswers(Array(total).fill(null));
    setShowResults(false);
    setResultsSaved(false);
  }, [test, total]);

  // Save test result to database - wrapped in useCallback BEFORE early return
  const saveTestResult = React.useCallback(async (correctCount, percentage, passed) => {
    if (!supabase || !userId || !test || !test.id) {
      console.error('Missing required data for saving result');
      return;
    }

    try {
      setSaving(true);
      console.log(`💾 Saving test result: ${percentage}%`);

      const { error } = await supabase
        .from('mock_test_results')
        .insert({
          user_id: userId,
          mock_test_id: test.id,
          score: percentage,
          passed: passed,
          correct_answers: correctCount,
          total_questions: total,
          created_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error saving test result:', error);
      } else {
        console.log('✅ Test result saved successfully');
        setResultsSaved(true);
      }
    } catch (err) {
      console.error('Exception saving test result:', err);
    } finally {
      setSaving(false);
    }
  }, [userId, test, total]);

  // Save result when test is completed - CALLED BEFORE early return
  React.useEffect(() => {
    if (showResults && !resultsSaved && test && test.questions) {
      const correctCount = answers.reduce((acc, ans, i) => {
        if (ans === test.questions[i].correct) return acc + 1;
        return acc;
      }, 0);
      const percentage = Math.round((correctCount / total) * 100);
      const passed = correctCount >= 32;
      
      saveTestResult(correctCount, percentage, passed);
    }
  }, [showResults, resultsSaved, answers, total, test, saveTestResult]);

  // NOW WE CAN HAVE EARLY RETURNS - ALL HOOKS CALLED ABOVE
  if (!test) {
    return <View style={styles.center}><Text>Test not found.</Text></View>;
  }

  const q = test.questions[current];

  const handleAnswer = (idx) => {
    setAnswers((a) => { 
      const n = [...a]; 
      n[current] = idx; 
      return n; 
    });
    
    setTimeout(() => {
      if (current + 1 < total) {
        setCurrent((c) => c + 1);
      } else {
        setShowResults(true);
      }
    }, 400);
  };

  if (showResults) {
    const correctCount = answers.reduce((acc, ans, i) => {
      if (ans === test.questions[i].correct) return acc + 1;
      return acc;
    }, 0);
    const percentage = Math.round((correctCount / total) * 100);
    const passed = correctCount >= 32;

    // Determine performance label
    let performanceLabel = 'Poor';
    let performanceColor = '#e53935';

    if (percentage >= 80) {
      performanceLabel = 'Excellent';
      performanceColor = '#43a047';
    } else if (percentage >= 50) {
      performanceLabel = 'Good';
      performanceColor = '#1976d2';
    } else if (percentage >= 20) {
      performanceLabel = 'Needs Improvement';
      performanceColor = '#FFA500';
    }

    return (
      <ScrollView style={{ flex: 1, backgroundColor: '#fff', padding: 16 }}>
        <View style={{ alignItems: 'center', marginBottom: 20 }}>
          {/* Circular Progress with color-coded score */}
          <View style={{ marginBottom: 20 }}>
            <CircularProgress
              percentage={percentage}
              isCompleted={passed}
              showCheckmark={passed}
              size={100}
              colorScheme="test"
            />
          </View>

          <Text style={[styles.title, { marginTop: 12 }]}>Test Complete</Text>
          <Text style={{ fontSize: 20, color: '#666', marginTop: 8 }}>
            {correctCount} of {total} correct
          </Text>
          <Text
            style={{
              fontSize: 18,
              fontWeight: 'bold',
              marginTop: 6,
              color: performanceColor
            }}
          >
            {percentage}% • {performanceLabel}
          </Text>
          <Text
            style={{
              fontSize: 16,
              marginTop: 8,
              color: passed ? '#43a047' : '#e53935'
            }}
          >
            {passed ? '✓ PASSED' : '✗ NOT PASSED'}
          </Text>
          {!passed && (
            <Text style={{ color: '#666', marginTop: 8, textAlign: 'center' }}>
              You need 32+ correct answers to pass (80%)
            </Text>
          )}

          {/* Saving indicator */}
          {saving && (
            <View style={{ marginTop: 12, flexDirection: 'row', alignItems: 'center' }}>
              <ActivityIndicator size="small" color="#1976d2" />
              <Text style={{ marginLeft: 8, color: '#666' }}>Saving result...</Text>
            </View>
          )}

          <View style={{ flexDirection: 'row', marginTop: 20, width: '100%' }}>
            <TouchableOpacity 
              style={[styles.startBtn, { marginRight: 8, backgroundColor: '#1976d2', flex: 1 }]} 
              onPress={() => {
                setCurrent(0);
                setAnswers(Array(total).fill(null));
                setShowResults(false);
                setResultsSaved(false);
              }}
              disabled={saving}
            >
              <Text style={styles.startBtnText}>Retry Test</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.startBtn, { marginLeft: 8, flex: 1 }]} 
              onPress={() => navigation.popToTop()}
              disabled={saving}
            >
              <Text style={styles.startBtnText}>Back to Tests</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.testReviewSection}>
          <Text style={styles.testReviewTitle}>Review Your Answers</Text>
          {test.questions.map((qq, i) => {
            const isCorrect = answers[i] === qq.correct;
            return (
              <View 
                key={qq.id} 
                style={[
                  styles.reviewQuestionCard, 
                  isCorrect ? styles.reviewCorrect : styles.reviewIncorrect
                ]}
              >
                <View style={styles.reviewQuestionHeader}>
                  <Text style={styles.reviewQuestionNumber}>Q{i + 1}</Text>
                  <MaterialCommunityIcons 
                    name={isCorrect ? "check-circle" : "close-circle"} 
                    size={24} 
                    color={isCorrect ? '#43a047' : '#e53935'} 
                  />
                </View>
                <Text style={styles.reviewQuestionText}>{qq.question}</Text>
                {!isCorrect && answers[i] !== null && (
                  <View style={styles.reviewAnswerBlock}>
                    <Text style={styles.reviewYourAnswer}>
                      Your answer: {qq.options[answers[i]]}
                    </Text>
                  </View>
                )}
                <View style={styles.reviewAnswerBlock}>
                  <Text style={styles.reviewCorrectAnswer}>
                    Correct answer: {qq.options[qq.correct]}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    );
  }

  return (
    <View style={styles.testSessionContainer}>
      <View style={styles.testSessionHeader}>
        <Text style={styles.testSessionTitle}>{test.title}</Text>
        <View style={styles.testProgressBar}>
          <View style={[styles.testProgressFill, { width: `${((current + 1) / total) * 100}%` }]} />
        </View>
        <Text style={styles.testSessionProgress}>
          Question {current + 1} of {total}
        </Text>
      </View>
      
      <ScrollView style={{ flex: 1 }}>
        <Text style={styles.testQuestion}>{q.question}</Text>
        {q.options.map((opt, idx) => (
          <TouchableOpacity 
            key={idx} 
            style={[
              styles.testOption, 
              answers[current] === idx ? styles.testOptionSelected : null
            ]} 
            onPress={() => handleAnswer(idx)} 
            disabled={answers[current] !== null}
          >
            <View style={styles.testOptionContent}>
              <View style={[
                styles.testOptionCircle, 
                answers[current] === idx && styles.testOptionCircleSelected
              ]}>
                {answers[current] === idx && <View style={styles.testOptionCircleInner} />}
              </View>
              <Text style={styles.testOptionText}>{opt}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}
