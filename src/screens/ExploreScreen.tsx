import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator,
  Image
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ExploreStackParamList } from '../navigation/ExploreStack';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import { Community } from '../types';

export default function ExploreScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ExploreStackParamList>>();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [filteredCommunities, setFilteredCommunities] = useState<Community[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchCommunities = async () => {
    try {
      const response = await api.get('/communities');
      setCommunities(response.data);
      setFilteredCommunities(response.data);
    } catch (error) {
      console.log('Toplulukları çekerken hata:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCommunities();
  }, []);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (text) {
      const filtered = communities.filter(c => 
        c.name.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredCommunities(filtered);
    } else {
      setFilteredCommunities(communities);
    }
  };

  const renderCommunityCard = ({ item }: { item: Community }) => (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => {
        console.log('Karta tıklandı, gidilen ID:', item.id); // TEST İÇİN LOG
        navigation.navigate('CommunityDetail', { 
          communityId: item.id, 
          communityName: item.name 
        });
      }}
    >
      <View style={styles.logoContainer}>
        {item.logoUrl ? (
          <Image source={{ uri: item.logoUrl }} style={styles.logo} />
        ) : (
          <Ionicons name="people" size={32} color="#C62828" />
        )}
      </View>
      
      <View style={styles.infoContainer}>
        <Text style={styles.communityName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.categoryText}>
          {item.categoryName || 'Genel Topluluk'}
        </Text>
        {item.description && (
          <Text style={styles.descriptionText} numberOfLines={2}>
            {item.description}
          </Text>
        )}
      </View>

      <Ionicons name="chevron-forward" size={24} color="#ccc" style={styles.arrowIcon} />
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#C62828" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#6c757d" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Topluluk ara..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={handleSearch}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => handleSearch('')}>
            <Ionicons name="close-circle" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={filteredCommunities}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderCommunityCard}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Sonuç bulunamadı.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8F9FA' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', margin: 16, paddingHorizontal: 12, borderRadius: 12, borderWidth: 1, borderColor: '#E0E0E0', height: 50, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 16, color: '#1A1A1A' },
  listContainer: { paddingHorizontal: 16, paddingBottom: 20 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  logoContainer: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#f1f3f5', justifyContent: 'center', alignItems: 'center', marginRight: 16, borderWidth: 1, borderColor: '#f8d7da' },
  logo: { width: 60, height: 60, borderRadius: 30 },
  infoContainer: { flex: 1 },
  communityName: { fontSize: 16, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 4 },
  categoryText: { fontSize: 12, color: '#C62828', fontWeight: '600', marginBottom: 4 },
  descriptionText: { fontSize: 13, color: '#6c757d' },
  arrowIcon: { marginLeft: 10 },
  emptyText: { textAlign: 'center', marginTop: 20, color: '#6c757d', fontStyle: 'italic' }
});