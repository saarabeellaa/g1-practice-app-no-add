import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { styles } from '../../styles/styles';

export function QuizResultScreen({ route, navigation }) {
  const { total, score } = route.params || {};
  
  return (
    <View style={styles.center}>
      <MaterialCommunityIcons name="check-circle-outline" size={64} color="#43a047" />
      <Text style={styles.title}>Quiz Complete</Text>
      <Text style={{ fontSize: 18, marginTop: 8 }}>{score} / {total}</Text>
      <TouchableOpacity 
        style={[styles.startBtn, { marginTop: 20, width: '50%' }]} 
        onPress={() => navigation.popToTop()}
      >
        <Text style={styles.startBtnText}>Back to Lessons</Text>
      </TouchableOpacity>
    </View>
  );
}