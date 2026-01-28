import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { styles } from '../../styles/styles';

export function TestSessionScreen({ route, navigation }) {
  const { test } = route.params;
  const [current, setCurrent] = React.useState(0);
  const total = test ? test.questions.length : 0;
  const [answers, setAnswers] = React.useState(Array(total).fill(null));
  const [showResults, setShowResults] = React.useState(false);

  React.useEffect(() => {
    setCurrent(0);
    setAnswers(Array(total).fill(null));
    setShowResults(false);
  }, [test, total]);

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

    return (
      <ScrollView style={{ flex: 1, backgroundColor: '#fff', padding: 16 }}>
        <View style={{ alignItems: 'center', marginBottom: 20 }}>
          <MaterialCommunityIcons 
            name={passed ? "check-circle-outline" : "close-circle-outline"} 
            size={80} 
            color={passed ? '#43a047' : '#e53935'} 
          />
          <Text style={[styles.title, { marginTop: 12 }]}>Test Complete</Text>
          <Text style={{ fontSize: 32, fontWeight: 'bold', marginTop: 8, color: passed ? '#43a047' : '#e53935' }}>
            {correctCount} / {total}
          </Text>
          <Text style={{ fontSize: 18, color: '#888', marginTop: 6 }}>
            {percentage}% - {passed ? '✅ PASSED' : '❌ FAILED'}
          </Text>
          {!passed && (
            <Text style={{ color: '#666', marginTop: 8, textAlign: 'center' }}>
              You need 32+ correct answers to pass (80%)
            </Text>
          )}
          <View style={{ flexDirection: 'row', marginTop: 20 }}>
            <TouchableOpacity 
              style={[styles.startBtn, { marginRight: 8, backgroundColor: '#1976d2', width: '50%' }]} 
              onPress={() => {
                setCurrent(0);
                setAnswers(Array(total).fill(null));
                setShowResults(false);
              }}
            >
              <Text style={styles.startBtnText}>Retry Test</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.startBtn, { marginLeft: 8 , width: '50%' }]} 
              onPress={() => navigation.popToTop()}
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