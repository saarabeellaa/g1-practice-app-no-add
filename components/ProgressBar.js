import React from 'react';
import { View, Text } from 'react-native';
import { styles } from '../styles/styles';

export function ProgressBar({ progress }) {
  return (
    <View style={styles.progressBarContainer}>
      <View style={[styles.progressBarFill, { width: `${Math.round(progress * 100)}%` }]} />
      <Text style={styles.progressBarText}>{Math.round(progress * 100)}% complete</Text>
    </View>
  );
}