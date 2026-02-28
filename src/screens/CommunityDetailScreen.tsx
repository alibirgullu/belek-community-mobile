import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator, 
  TouchableOpacity,
  StatusBar,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../services/api';
import { CommunityDetail } from '../types';
import { ExploreStackParamList } from '../navigation/ExploreStack';

type CommunityDetailRouteProp = RouteProp<ExploreStackParamList, 'CommunityDetail'>;

export default function CommunityDetailScreen() {
  const route = useRoute<CommunityDetailRouteProp>();
  const navigation = useNavigation<NativeStackNavigationProp<ExploreStackParamList>>();
  
  const { communityId } = route.params;
  
  const [community, setCommunity] = useState<CommunityDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCommunityDetails = async () => {
      try {
        const response = await api.get(`/communities/${communityId}`);
        setCommunity(response.data);
      } catch (error) {
        console.log('Topluluk detayı çekilirken hata:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCommunityDetails();
  }, [communityId]);

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#D32F2F" />
      </View>
    );
  }

  if (!community) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={60} color="#CCC" marginBottom={16} />
        <Text style={styles.errorText}>Topluluk bilgileri bulunamadı.</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color="#FFF" style={{ marginRight: 8 }} />
          <Text style={styles.backButtonText}>Geri Dön</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#B71C1C" />
      
      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        {/* Üst Kapak Alanı */}
        <LinearGradient
          colors={['#640000', '#D32F2F']} 
          style={styles.headerCover}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <SafeAreaView>
            <TouchableOpacity style={styles.headerBackButton} onPress={() => navigation.goBack()}>
              <Ionicons name="chevron-back" size={28} color="#FFF" />
            </TouchableOpacity>
          </SafeAreaView>
        </LinearGradient>

        {/* Topluluk Bilgi Kartı */}
        <View style={styles.infoCard}>
          <View style={styles.logoContainer}>
            {community.logoUrl ? (
              <Image source={{ uri: community.logoUrl }} style={styles.logo} />
            ) : (
              <Ionicons name="people" size={40} color="#D32F2F" />
            )}
          </View>
          
          <Text style={styles.title}>{community.name}</Text>
          
          <View style={styles.statsRow}>
            <View style={styles.statBadge}>
              <Ionicons name="person" size={14} color="#D32F2F" />
              <Text style={styles.statsText}>{community.memberCount} Üye</Text>
            </View>
            <View style={styles.statBadge}>
              <Ionicons name="star" size={14} color="#D32F2F" />
              <Text style={styles.statsText}>Resmi Topluluk</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.joinButton}>
            <Ionicons name="person-add" size={18} color="#FFF" style={{ marginRight: 8 }} />
            <Text style={styles.joinButtonText}>Topluluğa Katıl</Text>
          </TouchableOpacity>
        </View>

        {/* Alt İçerik Alanı */}
        <View style={styles.contentSection}>
          
          {/* Hakkında */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="information-circle" size={22} color="#D32F2F" />
              <Text style={styles.sectionTitle}>Hakkımızda</Text>
            </View>
            <Text style={styles.descriptionText}>
              {community.description || 'Bu topluluk henüz bir açıklama eklememiş.'}
            </Text>
          </View>

          {/* Yaklaşan Etkinlikler */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="calendar" size={22} color="#D32F2F" />
              <Text style={styles.sectionTitle}>Etkinlikler ({community.upcomingEvents?.length || 0})</Text>
            </View>
            
            {community.upcomingEvents && community.upcomingEvents.length > 0 ? (
              community.upcomingEvents.map(event => (
                <View key={event.id} style={styles.itemCard}>
                  <View style={styles.iconCircle}>
                    <Ionicons name="calendar-outline" size={24} color="#D32F2F" />
                  </View>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemTitle}>{event.title}</Text>
                    <View style={styles.itemDetailsRow}>
                      <Ionicons name="time-outline" size={14} color="#6c757d" />
                      <Text style={styles.itemSub}>{new Date(event.startDate).toLocaleDateString('tr-TR')}</Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#CCC" />
                </View>
              ))
            ) : (
              <View style={styles.emptyCard}>
                <Ionicons name="calendar-clear-outline" size={32} color="#CCC" />
                <Text style={styles.emptyText}>Planlanmış bir etkinlik yok.</Text>
              </View>
            )}
          </View>

          {/* Duyurular */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="megaphone" size={22} color="#D32F2F" />
              <Text style={styles.sectionTitle}>Son Duyurular ({community.recentAnnouncements?.length || 0})</Text>
            </View>

            {community.recentAnnouncements && community.recentAnnouncements.length > 0 ? (
              community.recentAnnouncements.map(announcement => (
                <View key={announcement.id} style={styles.itemCard}>
                  <View style={styles.iconCircle}>
                    <Ionicons name="notifications-outline" size={24} color="#D32F2F" />
                  </View>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemTitle}>{announcement.title}</Text>
                    <View style={styles.itemDetailsRow}>
                      <Ionicons name="time-outline" size={14} color="#6c757d" />
                      <Text style={styles.itemSub}>{new Date(announcement.createdAt).toLocaleDateString('tr-TR')}</Text>
                    </View>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyCard}>
                <Ionicons name="mic-off-outline" size={32} color="#CCC" />
                <Text style={styles.emptyText}>Henüz bir duyuru yayınlanmamış.</Text>
              </View>
            )}
          </View>

        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FAFAFA' },
  errorText: { fontSize: 16, color: '#1A1A1A', marginBottom: 20, fontWeight: '500' },
  backButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#D32F2F', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10 },
  backButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  headerCover: { height: 160, paddingHorizontal: 16, paddingTop: 10 },
  headerBackButton: { width: 40, height: 40, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  infoCard: { 
    backgroundColor: '#FFF', 
    marginHorizontal: 16, 
    marginTop: -40, 
    borderRadius: 20, 
    padding: 20, 
    alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 10, elevation: 5 
  },
  logoContainer: { 
    width: 84, height: 84, borderRadius: 42, backgroundColor: '#FFF0F0', 
    justifyContent: 'center', alignItems: 'center', 
    marginTop: -50, 
    borderWidth: 4, borderColor: '#FFF',
    marginBottom: 12
  },
  logo: { width: 76, height: 76, borderRadius: 38 },
  title: { fontSize: 22, fontWeight: '900', color: '#1A1A1A', textAlign: 'center', marginBottom: 12 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  statBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8F9FA', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#EAEAEA' },
  statsText: { fontSize: 13, color: '#1A1A1A', marginLeft: 6, fontWeight: '600' },
  joinButton: { flexDirection: 'row', backgroundColor: '#D32F2F', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 12, width: '100%', justifyContent: 'center', alignItems: 'center' },
  joinButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  contentSection: { padding: 16, paddingBottom: 40 },
  section: { marginBottom: 28 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#1A1A1A' },
  descriptionText: { fontSize: 15, color: '#495057', lineHeight: 24, backgroundColor: '#FFF', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#F0F0F0' },
  itemCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 16, borderRadius: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 2 },
  iconCircle: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#FFF0F0', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  itemInfo: { flex: 1 },
  itemTitle: { fontSize: 15, fontWeight: '700', color: '#1A1A1A', marginBottom: 6 },
  itemDetailsRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  itemSub: { fontSize: 13, color: '#6c757d', fontWeight: '500' },
  emptyCard: { alignItems: 'center', backgroundColor: '#FFF', padding: 24, borderRadius: 16, borderWidth: 1, borderColor: '#F0F0F0', borderStyle: 'dashed' },
  emptyText: { color: '#6c757d', fontWeight: '500', marginTop: 8 }
});