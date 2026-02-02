import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { styles } from '../../styles/styles';
import { supabase } from '../../supabase.js';
import { useUserId } from '../../context/UserContext';

export function FlashcardSessionScreen({ route, navigation }) {
  const { userId } = useUserId();
  const { cards, categoryId, isQuickPractice } = route.params || {};
  const [current, setCurrent] = React.useState(0);
  const [selectedAnswer, setSelectedAnswer] = React.useState(null);
  const [isCorrect, setIsCorrect] = React.useState(null);
  const [quizData, setQuizData] = React.useState([]);
  const [sessionStats, setSessionStats] = React.useState({
    correct: 0,
    incorrect: 0,
    newSigns: 0,
    learned: 0,
    mastered: 0
  });
  const [saving, setSaving] = React.useState(false);
  const [showResults, setShowResults] = React.useState(false);

  // Generate quiz questions with multiple choice options
  React.useEffect(() => {
    if (!cards || cards.length === 0) return;
    
    const generateQuizQuestions = () => {
      return cards.map(card => {
        const wrongAnswers = cards
          .filter(c => c.id !== card.id)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3)
          .map(c => c.title);
        
        const allOptions = [card.title, ...wrongAnswers].sort(() => Math.random() - 0.5);
        
        return {
          ...card,
          options: allOptions,
          correctAnswer: card.title
        };
      });
    };
    
    setQuizData(generateQuizQuestions());
    setCurrent(0);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setShowResults(false);
    setSessionStats({
      correct: 0,
      incorrect: 0,
      newSigns: 0,
      learned: 0,
      mastered: 0
    });
  }, [cards]);

  const saveProgress = async (signId, answerCorrect) => {
    if (!supabase) {
      console.error("Supabase not initialized");
      return;
    }
    
    try {
      setSaving(true);
      
      const { data: existing, error: fetchError } = await supabase
        .from('sign_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('sign_id', signId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching progress:', fetchError);
        setSaving(false);
        return;
      }

      if (existing) {
        const newCorrectCount = existing.correct_count + (answerCorrect ? 1 : 0);
        const newIncorrectCount = existing.incorrect_count + (answerCorrect ? 0 : 1);
        const newStreak = answerCorrect ? existing.streak + 1 : 0;
        const shouldMaster = newStreak >= 3;
        const wasMastered = existing.mastered;

        const { error: updateError } = await supabase
          .from('sign_progress')
          .update({
            correct_count: newCorrectCount,
            incorrect_count: newIncorrectCount,
            streak: newStreak,
            mastered: shouldMaster || existing.mastered,
            last_reviewed: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id);

        if (updateError) {
          console.error('Error updating progress:', updateError);
        }

        setSessionStats(prev => ({
          ...prev,
          correct: prev.correct + (answerCorrect ? 1 : 0),
          incorrect: prev.incorrect + (answerCorrect ? 0 : 1),
          mastered: prev.mastered + (shouldMaster && !wasMastered ? 1 : 0)
        }));
      } else {
        const { error: insertError } = await supabase
          .from('sign_progress')
          .insert({
            user_id: userId,
            sign_id: signId,
            correct_count: answerCorrect ? 1 : 0,
            incorrect_count: answerCorrect ? 0 : 1,
            streak: answerCorrect ? 1 : 0,
            mastered: false,
            last_reviewed: new Date().toISOString()
          });

        if (insertError) {
          console.error('Error inserting progress:', insertError);
        }

        setSessionStats(prev => ({
          ...prev,
          correct: prev.correct + (answerCorrect ? 1 : 0),
          incorrect: prev.incorrect + (answerCorrect ? 0 : 1),
          newSigns: prev.newSigns + 1
        }));
      }
      
      setSaving(false);
    } catch (error) {
      console.error('Error saving progress:', error);
      setSaving(false);
    }
  };

  const handleAnswer = async (answer) => {
    if (selectedAnswer !== null || saving) return;
    
    const currentQuestion = quizData[current];
    const correct = answer === currentQuestion.correctAnswer;
    
    setSelectedAnswer(answer);
    setIsCorrect(correct);
    
    await saveProgress(currentQuestion.id, correct);
  };

  const handleNext = () => {
    if (current + 1 < quizData.length) {
      setCurrent(c => c + 1);
      setSelectedAnswer(null);
      setIsCorrect(null);
    } else {
      setShowResults(true);
    }
  };

  if (!cards || cards.length === 0) {
    return <View style={styles.center}><Text>No signs available for this category.</Text></View>;
  }

  if (quizData.length === 0) {
    return <ActivityIndicator size="large" color="#1976d2" style={{ marginTop: 80 }} />;
  }

  if (showResults) {
    const totalAnswered = sessionStats.correct + sessionStats.incorrect;
    const accuracy = totalAnswered > 0 ? Math.round((sessionStats.correct / totalAnswered) * 100) : 0;

    return (
      <ScrollView style={{ flex: 1, backgroundColor: '#fff' }} contentContainerStyle={{ padding: 20 }}>
        <View style={{ alignItems: 'center', marginBottom: 30 }}>
          <MaterialCommunityIcons 
            name={accuracy >= 80 ? "trophy" : "target"} 
            size={80} 
            color={accuracy >= 80 ? "#FFD700" : "#1976d2"} 
          />
          <Text style={[styles.title, { marginTop: 16 }]}>
            {isQuickPractice ? 'Quick Practice Complete!' : 'Quiz Complete!'}
          </Text>
          <Text style={{ fontSize: 48, fontWeight: 'bold', color: '#1976d2', marginTop: 8 }}>
            {accuracy}%
          </Text>
          <Text style={{ fontSize: 16, color: '#666', marginTop: 4 }}>
            {sessionStats.correct} correct out of {totalAnswered}
          </Text>
        </View>

        <View style={styles.resultsStatsContainer}>
          <View style={[styles.resultStatCard, { backgroundColor: '#e8f5e9' }]}>
            <MaterialCommunityIcons name="check-circle" size={32} color="#43a047" />
            <Text style={styles.resultStatNumber}>{sessionStats.correct}</Text>
            <Text style={styles.resultStatLabel}>Correct</Text>
          </View>
          <View style={[styles.resultStatCard, { backgroundColor: '#ffebee' }]}>
            <MaterialCommunityIcons name="close-circle" size={32} color="#e53935" />
            <Text style={styles.resultStatNumber}>{sessionStats.incorrect}</Text>
            <Text style={styles.resultStatLabel}>Incorrect</Text>
          </View>
        </View>

        <View style={styles.resultsStatsContainer}>
          <View style={[styles.resultStatCard, { backgroundColor: '#e3f2fd' }]}>
            <MaterialCommunityIcons name="star-circle" size={32} color="#1976d2" />
            <Text style={styles.resultStatNumber}>{sessionStats.newSigns}</Text>
            <Text style={styles.resultStatLabel}>New Signs</Text>
          </View>
          <View style={[styles.resultStatCard, { backgroundColor: '#fff3e0' }]}>
            <MaterialCommunityIcons name="trophy" size={32} color="#ff9800" />
            <Text style={styles.resultStatNumber}>{sessionStats.mastered}</Text>
            <Text style={styles.resultStatLabel}>Mastered</Text>
          </View>
        </View>

        {accuracy >= 80 ? (
          <View style={styles.encouragementBox}>
            <Text style={styles.encouragementText}>
              {isQuickPractice 
                ? '🎉 Excellent work! You\'re mastering these signs!' 
                : '🎉 Great job! Keep up the amazing progress!'}
            </Text>
          </View>
        ) : (
          <View style={[styles.encouragementBox, { backgroundColor: '#fff3e0' }]}>
            <Text style={[styles.encouragementText, { color: '#e65100' }]}>
              💪 Keep practicing! Review the signs and try again.
            </Text>
          </View>
        )}

        {isQuickPractice ? (
          <>
            <TouchableOpacity 
              style={[styles.startBtn, { marginTop: 20, backgroundColor: '#ff6f00' }]} 
              onPress={() => navigation.goBack()}
            >
              <MaterialCommunityIcons name="lightning-bolt" size={20} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.startBtnText}>New Quick Practice</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.startBtn, { marginTop: 12, backgroundColor: '#43a047' }]} 
              onPress={() => navigation.popToTop()}
            >
              <Text style={styles.startBtnText}>Back to Signs</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity 
              style={[styles.startBtn, { marginTop: 20, backgroundColor: '#1976d2' }]} 
              onPress={() => {
                setCurrent(0);
                setSelectedAnswer(null);
                setIsCorrect(null);
                setShowResults(false);
                setSessionStats({ correct: 0, incorrect: 0, newSigns: 0, learned: 0, mastered: 0 });
                const regeneratedQuiz = cards.map(card => {
                  const wrongAnswers = cards
                    .filter(c => c.id !== card.id)
                    .sort(() => Math.random() - 0.5)
                    .slice(0, 3)
                    .map(c => c.title);
                  const allOptions = [card.title, ...wrongAnswers].sort(() => Math.random() - 0.5);
                  return { ...card, options: allOptions, correctAnswer: card.title };
                });
                setQuizData(regeneratedQuiz);
              }}
            >
              <Text style={styles.startBtnText}>Practice Again</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.startBtn, { marginTop: 12, backgroundColor: '#43a047' }]} 
              onPress={() => navigation.popToTop()}
            >
              <Text style={styles.startBtnText}>Back to Categories</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    );
  }

  const currentQuestion = quizData[current];
  const progress = ((current + 1) / quizData.length) * 100;

  return (
    <View style={styles.quizContainer}>
      <View style={styles.quizProgressContainer}>
        <View style={styles.quizProgressBar}>
          <View style={[styles.quizProgressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.quizProgressText}>
          Question {current + 1} of {quizData.length}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.quizContent}>
        <View style={styles.quizImageContainer}>
          {currentQuestion.img ? (
            <Image 
              source={{ uri: currentQuestion.img }} 
              style={styles.quizImage}
              resizeMode="contain"
            />
          ) : (
            <View style={[styles.quizImage, { backgroundColor: '#e3f2fd', alignItems: 'center', justifyContent: 'center' }]}>
              <MaterialCommunityIcons name="sign-caution" size={80} color="#1976d2" />
            </View>
          )}
        </View>

        <Text style={styles.quizQuestion}>What is this sign?</Text>

        <View style={styles.quizOptionsContainer}>
          {currentQuestion.options.map((option, index) => {
            let optionStyle = styles.quizOption;
            let optionTextStyle = styles.quizOptionText;
            let iconName = null;
            let iconColor = '#666';

            if (selectedAnswer !== null) {
              if (option === currentQuestion.correctAnswer) {
                optionStyle = [styles.quizOption, styles.quizOptionCorrect];
                optionTextStyle = [styles.quizOptionText, { color: '#43a047', fontWeight: 'bold' }];
                iconName = 'check-circle';
                iconColor = '#43a047';
              } else if (option === selectedAnswer) {
                optionStyle = [styles.quizOption, styles.quizOptionIncorrect];
                optionTextStyle = [styles.quizOptionText, { color: '#e53935', fontWeight: 'bold' }];
                iconName = 'close-circle';
                iconColor = '#e53935';
              }
            }

            return (
              <TouchableOpacity
                key={index}
                style={optionStyle}
                onPress={() => handleAnswer(option)}
                disabled={selectedAnswer !== null || saving}
              >
                <Text style={optionTextStyle}>{option}</Text>
                {iconName && (
                  <MaterialCommunityIcons name={iconName} size={24} color={iconColor} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {selectedAnswer !== null && (
          <View style={[styles.feedbackContainer, isCorrect ? styles.feedbackCorrect : styles.feedbackIncorrect]}>
            <MaterialCommunityIcons 
              name={isCorrect ? "check-circle" : "close-circle"} 
              size={28} 
              color={isCorrect ? "#43a047" : "#e53935"} 
            />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={[styles.feedbackTitle, { color: isCorrect ? "#43a047" : "#e53935" }]}>
                {isCorrect ? "Correct!" : "Incorrect"}
              </Text>
              {!isCorrect && (
                <Text style={styles.feedbackText}>
                  The correct answer is: {currentQuestion.correctAnswer}
                </Text>
              )}
              {currentQuestion.desc && (
                <Text style={styles.feedbackDescription}>{currentQuestion.desc}</Text>
              )}
            </View>
          </View>
        )}

        {saving && (
          <View style={{ alignItems: 'center', marginTop: 16 }}>
            <ActivityIndicator size="small" color="#1976d2" />
            <Text style={{ color: '#666', marginTop: 8 }}>Saving progress...</Text>
          </View>
        )}

        {selectedAnswer !== null && !saving && (
          <TouchableOpacity 
            style={styles.nextButton} 
            onPress={handleNext}
          >
            <Text style={styles.nextButtonText}>
              {current + 1 < quizData.length ? 'Next Question' : 'View Results'}
            </Text>
            <MaterialCommunityIcons name="arrow-right" size={20} color="#fff" />
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}
