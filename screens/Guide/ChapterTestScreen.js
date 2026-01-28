import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { styles } from '../../styles/styles';

export function ChapterTestScreen({ route, navigation }) {
  const { quiz, title } = route.params;
  const [current, setCurrent] = React.useState(0);
  const [selected, setSelected] = React.useState(null);
  const [answers, setAnswers] = React.useState(Array(quiz.length).fill(null));
  const [showResults, setShowResults] = React.useState(false);

  React.useEffect(() => {
    setCurrent(0);
    setSelected(null);
    setAnswers(Array(quiz.length).fill(null));
    setShowResults(false);
  }, [quiz]);

  if (!quiz || quiz.length === 0) {
    return <View style={styles.center}><Text>No quiz available.</Text></View>;
  }

  const q = quiz[current];

  const handleSelect = (idx) => {
    setSelected(idx);
    setAnswers((a) => { 
      const n = [...a]; 
      n[current] = idx; 
      return n; 
    });
    
    setTimeout(() => {
      setSelected(null);
      if (current + 1 < quiz.length) {
        setCurrent((c) => c + 1);
      } else {
        setShowResults(true);
      }
    }, 700);
  };

  if (showResults) {
    const correctCount = answers.reduce((acc, ans, i) => {
      if (ans === quiz[i].correct) return acc + 1;
      return acc;
    }, 0);
    const percentage = Math.round((correctCount / quiz.length) * 100);

    return (
      <ScrollView style={{ flex: 1, backgroundColor: '#fff', padding: 16 }}>
        <View style={{ alignItems: 'center', marginBottom: 16 }}>
          <MaterialCommunityIcons 
            name="check-circle-outline" 
            size={64} 
            color={percentage >= 80 ? '#43a047' : '#e53935'} 
          />
          <Text style={styles.title}>Chapter Test Complete</Text>
          <Text style={{ fontSize: 18, marginTop: 8 }}>{correctCount} / {quiz.length}</Text>
          <Text style={{ color: '#888', marginTop: 6 }}>
            {percentage >= 80 ? '✅ Passed' : '❌ Keep Studying'}
          </Text>
          <TouchableOpacity 
            style={[styles.startBtn, { marginTop: 12 }]} 
            onPress={() => navigation.popToTop()}
          >
            <Text style={styles.startBtnText}>Back to Chapters</Text>
          </TouchableOpacity>
        </View>

        <View>
          <Text style={{ fontWeight: 'bold', marginBottom: 10 }}>Review</Text>
          {quiz.map((qq, i) => (
            <View key={i} style={{ marginBottom: 12 }}>
              <Text style={{ fontSize: 14 }}>{i + 1}. {qq.question}</Text>
              <Text style={{ color: answers[i] === qq.correct ? '#43a047' : '#e53935', marginTop: 4 }}>
                {answers[i] === null ? 'No answer' : (answers[i] === qq.correct ? '✅ Correct' : '❌ Incorrect')}
              </Text>
              {answers[i] !== qq.correct && (
                <Text style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                  Correct Answer: {qq.options[qq.correct]}
                </Text>
              )}
            </View>
          ))}
        </View>
      </ScrollView>
    );
  }

  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: '#fff' }}>
      <Text style={{ fontSize: 18, color: '#1976d2', marginBottom: 6 }}>{title}</Text>
      <Text style={{ marginBottom: 10 }}>Question {current + 1} / {quiz.length}</Text>
      <Text style={{ fontWeight: 'bold', marginBottom: 12 }}>{q.question}</Text>
      {q.options.map((opt, idx) => (
        <TouchableOpacity 
          key={idx} 
          style={[
            styles.quizOption, 
            selected === idx && (idx === q.correct ? styles.quizOptionCorrect : styles.quizOptionIncorrect)
          ]} 
          onPress={() => handleSelect(idx)} 
          disabled={selected !== null}
        >
          <Text>{opt}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}