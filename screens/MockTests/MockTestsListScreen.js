import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { styles } from '../../styles/styles.js';
import { MockTestsContext } from './MockTestsContext.js';

export function MockTestsListScreen({ navigation }) {
  const { tests, loadingTests } = React.useContext(MockTestsContext);
  
  if (loadingTests) {
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
        {tests.map((t, index) => (
          <View key={t.id} style={styles.mockTestCard}>
            <View style={styles.mockTestCardHeader}>
              <View style={styles.mockTestNumberBadge}>
                <Text style={styles.mockTestNumberText}>{index + 1}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.mockTestTitle}>{t.title}</Text>
                <Text style={{ color: '#666', fontSize: 13, marginTop: 4 }}>
                  {t.description}
                </Text>
              </View>
            </View>
            <View style={styles.mockTestCardFooter}>
              <View style={styles.mockTestInfoRow}>
                <MaterialCommunityIcons name="clipboard-text" size={18} color="#666" />
                <Text style={{ fontSize: 13, color: '#666', marginLeft: 6 }}>
                  {t.questions.length} Questions
                </Text>
              </View>
              <TouchableOpacity 
                style={styles.startMockTestBtn} 
                onPress={() => navigation.navigate('TestSession', { test: t })}
              >
                <Text style={styles.startMockTestBtnText}>Start Test</Text>
                <MaterialCommunityIcons name="arrow-right" size={18} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
    </View>
  );
}