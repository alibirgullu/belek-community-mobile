import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator, 
  Image, 
  TouchableOpacity,
  Alert,
  Dimensions
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ExploreStackParamList } from '../navigation/ExploreStack';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import { CommunityDetail } from '../types';

const { width } = Dimensions.get('window');

type Props = NativeStackScreenProps<ExploreStackParamList, 'CommunityDetail'>;

export default function CommunityDetailScreen({ route }: Props) {
  const { communityId } = route.params;
  const [detail, setDetail] = useState<CommunityDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const response = await api.get(`/communities/${communityId}`);
        setDetail(response.data);
      } catch (error) {
        console.log('Detay çekilemedi:', error);
        Alert.alert('Hata', 'Topluluk detayları yüklenirken bir sorun oluştu.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetail();
  }, [communityId]);

  const handleJoinRequest = async () => {
    setIsJoining(true);
    try {
      const response = await api.post(`/communities/${communityId}/members/join`);
      Alert.alert('Başarılı', response.data.message || 'Katılma isteğiniz gönderildi.');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'İstek gönderilemedi.';
      Alert.alert('Bilgi', errorMessage);
    } finally {
      setIsJoining(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#C62828" />
      </View>
    );
  }

  if (!detail) {
    return (
      <View style={styles.centerContainer}>
        <Text>Topluluk bulunamadı.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Kapak Fotoğrafı */}
      <View style={styles.coverContainer}>
        {detail.coverImageUrl ? (
          <Image source={{ uri: detail.coverImageUrl }} style={styles.coverImage} />
        ) : (
          <View style={[styles.coverImage, { backgroundColor: '#2C3E50' }]} />
        )}
      </View>

      {/* Profil Başlık Alanı */}
      <View style={styles.profileHeader}>
        <View style={styles.logoWrapper}>
          {detail.logoUrl ? (
             <Image source={{ uri: detail.logoUrl }} style={styles.logo} />
          ) : (
             <Ionicons name="people" size={45} color="#C62828" />
          )}
        </View>
        <Text style={styles.title}>{detail.name}</Text>
        <Text style={styles.memberCount}>{detail.memberCount} Üye</Text>
        
        <TouchableOpacity 
          style={styles.joinButton} 
          onPress={handleJoinRequest}
          disabled={isJoining}
        >
          {isJoining ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.joinButtonText}>Katılma İsteği Gönder</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.description}>
          {detail.description || 'Bu topluluk hakkında henüz bir açıklama eklenmemiş.'}
        </Text>
      </View>

      <View style={styles.divider} />

      {/* DUYURULAR BÖLÜMÜ */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="megaphone-outline" size={22} color="#C62828" />
          <Text style={styles.sectionTitle}>Son Duyurular</Text>
        </View>
        {detail.recentAnnouncements && detail.recentAnnouncements.length > 0 ? (
          detail.recentAnnouncements.map((ann) => (
            <View key={ann.id} style={styles.announcementCard}>
              <Text style={styles.announcementTitle}>{ann.title}</Text>
              <Text style={styles.announcementContent} numberOfLines={3}>{ann.content}</Text>
              <Text style={styles.dateText}>{new Date(ann.createdAt).toLocaleDateString('tr-TR')}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>Henüz duyuru yayınlanmamış.</Text>
        )}
      </View>

      {/* ETKİNLİKLER BÖLÜMÜ */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="calendar-outline" size={22} color="#C62828" />
          <Text style={styles.sectionTitle}>Yaklaşan Etkinlikler</Text>
        </View>
        {detail.upcomingEvents && detail.upcomingEvents.length > 0 ? (
          detail.upcomingEvents.map((evt) => (
            <TouchableOpacity key={evt.id} style={styles.eventCard}>
              <View style={styles.eventInfo}>
                <Text style={styles.eventTitle}>{evt.title}</Text>
                <Text style={styles.eventDate}>
                  {new Date(evt.startDate).toLocaleDateString('tr-TR')} - {new Date(evt.startDate).toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'})}
                </Text>
                {evt.location && <Text style={styles.eventLocation}>{evt.location}</Text>}
              </View>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.emptyText}>Planlanmış etkinlik bulunmuyor.</Text>
        )}
      </View>

      {/* YÖNETİM KURULU BÖLÜMÜ */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="ribbon-outline" size={22} color="#C62828" />
          <Text style={styles.sectionTitle}>Yönetim Kurulu</Text>
        </View>
        {detail.boardMembers && detail.boardMembers.length > 0 ? (
          detail.boardMembers.map((member) => (
            <View key={member.userId} style={styles.memberRow}>
              {member.profileImageUrl ? (
                <Image source={{ uri: member.profileImageUrl }} style={styles.memberAvatar} />
              ) : (
                <View style={styles.defaultAvatar}>
                  <Ionicons name="person" size={20} color="#666" />
                </View>
              )}
              <View style={styles.memberDetails}>
                <Text style={styles.memberName}>{member.fullName}</Text>
                <Text style={styles.memberRole}>{member.roleName}</Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>Yönetim bilgisi girilmemiş.</Text>
        )}
      </View>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  coverContainer: { height: 160, width: '100%' },
  coverImage: { width: '100%', height: '100%' },
  profileHeader: { paddingHorizontal: 20, alignItems: 'center', marginTop: -45 },
  logoWrapper: { 
    width: 90, 
    height: 90, 
    borderRadius: 45, 
    backgroundColor: '#fff', 
    justifyContent: 'center', 
    alignItems: 'center', 
    elevation: 6, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    borderWidth: 3, 
    borderColor: '#fff' 
  },
  logo: { width: 84, height: 84, borderRadius: 42 },
  title: { fontSize: 24, fontWeight: '900', color: '#1A1A1A', marginTop: 12, textAlign: 'center' },
  memberCount: { fontSize: 14, color: '#C62828', fontWeight: 'bold', marginTop: 4 },
  joinButton: { 
    backgroundColor: '#C62828', 
    width: '100%', 
    paddingVertical: 14, 
    borderRadius: 12, 
    alignItems: 'center', 
    marginTop: 20,
    elevation: 4
  },
  joinButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  description: { fontSize: 15, color: '#555', textAlign: 'center', marginTop: 15, lineHeight: 22 },
  divider: { height: 8, backgroundColor: '#F8F9FA', marginTop: 25 },
  section: { paddingHorizontal: 20, marginTop: 25 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, gap: 10 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#1A1A1A' },
  announcementCard: { backgroundColor: '#F8F9FA', padding: 15, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#EEE' },
  announcementTitle: { fontSize: 16, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 5 },
  announcementContent: { fontSize: 14, color: '#666', lineHeight: 20 },
  dateText: { fontSize: 12, color: '#999', marginTop: 8, textAlign: 'right' },
  eventCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#FFF', 
    padding: 15, 
    borderRadius: 12, 
    marginBottom: 10, 
    borderWidth: 1, 
    borderColor: '#EEE' 
  },
  eventInfo: { flex: 1 },
  eventTitle: { fontSize: 16, fontWeight: 'bold', color: '#1A1A1A' },
  eventDate: { fontSize: 13, color: '#C62828', marginTop: 3, fontWeight: '600' },
  eventLocation: { fontSize: 13, color: '#888', marginTop: 2 },
  memberRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, backgroundColor: '#F8F9FA', padding: 10, borderRadius: 10 },
  memberAvatar: { width: 44, height: 44, borderRadius: 22 },
  defaultAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#DDD', justifyContent: 'center', alignItems: 'center' },
  memberDetails: { marginLeft: 12 },
  memberName: { fontSize: 15, fontWeight: 'bold', color: '#1A1A1A' },
  memberRole: { fontSize: 13, color: '#666' },
  emptyText: { color: '#AAA', fontStyle: 'italic', textAlign: 'center', paddingVertical: 10 }
});