import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { styles } from '../../styles/styles';
import { useLessonQuiz } from '../../hooks/useData';

export function MiniQuizScreen({ route, navigation }) {
  const { lessonId } = route.params;
  const [quiz, loadingQuiz] = useLessonQuiz(lessonId);
  const [current, setCurrent] = React.useState(0);
  const [selected, setSelected] = React.useState(null);
  const [score, setScore] = React.useState(0);

  React.useEffect(() => {
    setCurrent(0);
    setSelected(null);
    setScore(0);
  }, [lessonId]);

  if (loadingQuiz) {
    return <ActivityIndicator size="large" color="#1976d2" style={{ marginTop: 80 }} />;
  }
  
  if (!quiz || quiz.length === 0) {
    return <View style={styles.center}><Text>No quiz available for this lesson.</Text></View>;
  }

  const q = quiz[current];
  
  const handleSelect = (idx) => {
    setSelected(idx);
    const correct = idx === q.correct;
    if (correct) setScore((s) => s + 1);
    
    setTimeout(() => {
      setSelected(null);
      if (current + 1 < quiz.length) {
        setCurrent((c) => c + 1);
      } else {
        navigation.replace('QuizResult', { total: quiz.length, score: correct ? score + 1 : score });
      }
    }, 700);
  };

  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: '#fff' }}>
      <Text style={{ fontSize: 18, color: '#1976d2', marginBottom: 6 }}>Mini Quiz</Text>
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