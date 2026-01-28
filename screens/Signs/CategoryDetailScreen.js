import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, TextInput } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { styles } from '../../styles/styles';
import { useCategories } from '../../hooks/useData.js';

export function CategoryDetailScreen({ route, navigation }) {
  const { categoryId } = route.params;
  const [categories, loading] = useCategories();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [showSearch, setShowSearch] = React.useState(false);
  
  if (loading) return <ActivityIndicator size="large" color="#1976d2" style={{ marginTop: 80 }} />;
  
  const category = categories.find((c) => String(c.id) === String(categoryId) || c.key === String(categoryId));
  if (!category) return <View style={styles.center}><Text>Category not found.</Text></View>;

  // Filter cards based on search query
  let filteredCards = category.cards;
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase().trim();
    filteredCards = category.cards.filter(card => 
      card.title.toLowerCase().includes(query)
    );
  }

  return (
    <ScrollView style={{ backgroundColor: '#fff' }}>
      <View style={styles.section}>
        <TouchableOpacity 
          style={styles.startFlashcardsBtn} 
          onPress={() => navigation.navigate('FlashcardSession', { cards: category.cards })}
        >
          <MaterialCommunityIcons name="cards" size={24} color="#fff" />
          <Text style={styles.startFlashcardsBtnText}>Start Flashcards ({category.cards.length} cards)</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12, justifyContent: 'space-between' }}>
          <Text style={[styles.sectionTitle, { margin: 0 }]}>All Signs in {category.title}</Text>
          <TouchableOpacity 
            style={{ padding: 8 }}
            onPress={() => {
              setShowSearch(!showSearch);
              setSearchQuery('');
            }}
          >
            <MaterialCommunityIcons 
              name={showSearch ? 'close' : 'magnify'} 
              size={24} 
              color="#1976d2" 
            />
          </TouchableOpacity>
        </View>

        {showSearch && (
          <View style={{ marginBottom: 16 }}>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: '#1976d2',
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingVertical: 10,
                fontSize: 16,
                color: '#222',
              }}
              placeholder="Search by sign name..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
          </View>
        )}

        {filteredCards.length === 0 ? (
          <View style={{ alignItems: 'center', paddingVertical: 40 }}>
            <MaterialCommunityIcons 
              name="magnify-off" 
              size={64} 
              color="#ccc" 
            />
            <Text style={{ color: '#999', textAlign: 'center', marginTop: 16, fontSize: 16 }}>
              No signs found matching "{searchQuery}"
            </Text>
          </View>
        ) : (
          filteredCards.map((card) => (
            <View key={card.id} style={styles.signCardDetail}>
              {card.img ? (
                <Image 
                  source={{ uri: card.img }} 
                  style={styles.signImgDetail}
                  resizeMode="contain"
                />
              ) : (
                <View style={[styles.signImgDetail, { backgroundColor: '#e3f2fd', alignItems: 'center', justifyContent: 'center' }]}>
                  <MaterialCommunityIcons name="image-off" size={32} color="#999" />
                </View>
              )}
              <View style={styles.signCardDetailContent}>
                <Text style={styles.signCardDetailTitle}>{card.title}</Text>
                <Text style={styles.signCardDetailDesc}>{card.desc || 'No description available'}</Text>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}