import React from 'react';
import { View, Text, Dimensions, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { styles } from '../styles/styles';
import { ProgressBar } from './ProgressBar';

const { width } = Dimensions.get('window');

export function Carousel({ dailyGoal, setDailyGoal, progress }) {
  const scrollX = React.useRef(new Animated.Value(0)).current;
  const slides = [
    { type: 'performance', title: 'Performance Summary', text: 'Keep going – you are improving every day!', icon: 'chart-line' },
    { type: 'progress', title: 'Progress', icon: 'progress-check' },
    { type: 'calendar', title: 'Practice Calendar', icon: 'calendar-month' },
  ];

  return (
    <View style={styles.carouselContainer}>
      <Animated.FlatList
        data={slides}
        keyExtractor={(_, i) => String(i)}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: false })}
        renderItem={({ item }) => (
          <View style={styles.carouselItem}>
            <MaterialCommunityIcons name={item.icon} size={36} color="#1976d2" style={{ marginBottom: 8 }} />
            <Text style={styles.carouselTitle}>{item.title}</Text>
            {item.type === 'performance' && <Text style={styles.carouselText}>{item.text}</Text>}
            {item.type === 'progress' && (
              <View style={{ width: '100%', alignItems: 'center' }}>
                <ProgressBar progress={progress} />
                <Text style={{ marginTop: 8 }}>You've completed {Math.round(progress * 100)}% of sign cards.</Text>
              </View>
            )}
            {item.type === 'calendar' && <Text style={{ marginTop: 6 }}>Track your practice streak here.</Text>}
          </View>
        )}
      />
      <View style={styles.carouselDotRow}>
        {slides.map((_, i) => {
          const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
          const dotSize = scrollX.interpolate({ inputRange, outputRange: [8, 16, 8], extrapolate: 'clamp' });
          return <Animated.View key={i} style={[styles.carouselDot, { width: dotSize, height: dotSize }]} />;
        })}
      </View>
    </View>
  );
}