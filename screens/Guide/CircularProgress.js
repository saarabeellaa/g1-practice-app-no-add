import React from 'react';
import { View, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';

/**
 * CircularProgress Component - Enhanced Version
 * 
 * Displays progress as an animated circular indicator with:
 * - Blue circle that fills progressively (0-99%)
 * - Percentage number in center
 * - Green checkmark on white background when 100% complete
 * 
 * Supports two color schemes:
 * 1. "chapter" - Blue/Green for lesson progress
 * 2. "test" - Color-coded by performance (Red/Yellow/Blue/Green)
 * 
 * Uses design colors from styles.js:
 * - Progress: #1976d2 (primary blue)
 * - Completed: #43a047 (green)
 * - Background: #e0e0e0 (light gray)
 * 
 * @param {number} percentage - Progress percentage (0-100)
 * @param {boolean} isCompleted - Whether chapter is fully completed
 * @param {boolean} showCheckmark - Show checkmark instead of percentage
 * @param {number} size - Circle diameter in pixels (default: 90)
 * @param {string} colorScheme - 'chapter' or 'test' (default: 'chapter')
 */
export function CircularProgress({
  percentage = 0,
  isCompleted = false,
  showCheckmark = false,
  size = 90,
  colorScheme = 'chapter'
}) {
  // Design system colors matching styles.js
  const PRIMARY_BLUE = '#1976d2';
  const SUCCESS_GREEN = '#43a047';
  const LIGHT_GRAY = '#e0e0e0';
  
  // Get color based on color scheme
  const getTestColor = (percent) => {
    if (percent >= 80) return SUCCESS_GREEN;      // Green - Excellent
    if (percent >= 50) return PRIMARY_BLUE;       // Blue - Good
    if (percent >= 20) return '#FFA500';          // Yellow - Needs Improvement
    return '#e53935';                              // Red - Poor
  };
  
  const strokeColor = colorScheme === 'test' 
    ? getTestColor(percentage)
    : (isCompleted ? SUCCESS_GREEN : PRIMARY_BLUE);
  
  // Calculate circle dimensions
  const strokeWidth = 5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
  // Calculate stroke offset based on percentage
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <View
      style={{
        width: size,
        height: size,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative'
      }}
    >
      {/* SVG Circle Background */}
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        {/* Background gray circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke={LIGHT_GRAY}
          strokeWidth={strokeWidth}
        />
        
        {/* Animated progress circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={(isCompleted || showCheckmark) ? 0 : strokeDashoffset}
          strokeLinecap="round"
          rotation={-90}
          originX={size / 2}
          originY={size / 2}
          style={{
            transition: 'stroke-dashoffset 0.6s ease-in-out, stroke 0.3s ease-in-out'
          }}
        />
      </Svg>

      {/* Center Content - Percentage or Checkmark */}
      <View
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          width: size - 16,
          height: size - 16
        }}
      >
        {showCheckmark || isCompleted ? (
          // Checkmark when 100% or explicitly shown
          <MaterialCommunityIcons
            name="check"
            size={Math.round(size / 2.5)}
            color={strokeColor}
            style={{
              fontWeight: 'bold'
            }}
          />
        ) : (
          // Percentage text while in progress
          <Text
            style={{
              fontSize: Math.round(size / 3.5),
              fontWeight: 'bold',
              color: strokeColor
            }}
          >
            {Math.round(percentage)}%
          </Text>
        )}
      </View>
    </View>
  );
}

export default CircularProgress;