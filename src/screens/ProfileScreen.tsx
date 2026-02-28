import React, { useState, useEffect, useContext } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator, 
  TouchableOpacity,
  StatusBar,
  Image,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; 
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

// Backend'den gelecek profil veri tipi (Biyografi ve Telefon eklendi)
interface UserProfile {
  fullName: string;
  email: string;
  profileImageUrl?: string;
  department?: string; 
  biography?: string;
  phone?: string;
}

export default function ProfileScreen() {
  const navigation = useNavigation<any>(); 
  const { logout } = useContext(AuthContext);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/users/me');
      setProfile(response.data);
    } catch (error) {
      console.log('Profil bilgileri çekilirken hata:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    
    // EditProfileScreen'den geri dönüldüğünde verilerin anında güncellenmesi için
    const unsubscribe = navigation.addListener('focus', () => {
      fetchProfile();
    });

    return unsubscribe;
  }, [navigation]);

  const handleLogout = () => {
    Alert.alert(
      "Çıkış Yap",
      "Hesabınızdan çıkış yapmak istediğinize emin misiniz?",
      [
        { text: "İptal", style: "cancel" },
        { 
          text: "Çıkış Yap", 
          style: "destructive", 
          onPress: async () => {
            await logout();
          } 
        }
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#D32F2F" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#B71C1C" />
      
      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        {/* Üst Kırmızı Gradient Kapak */}
        <LinearGradient
          colors={['#640000', '#D32F2F']} 
          style={styles.headerCover}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <SafeAreaView>
            <Text style={styles.headerTitle}>Profilim</Text>
          </SafeAreaView>
        </LinearGradient>

        {/* Profil Bilgi Kartı */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            {profile?.profileImageUrl ? (
              <Image source={{ uri: profile.profileImageUrl }} style={styles.avatar} />
            ) : (
              <Text style={styles.avatarText}>
                {profile?.fullName ? profile.fullName.substring(0, 2).toUpperCase() : 'BU'}
              </Text>
            )}
            <TouchableOpacity style={styles.editAvatarButton}>
              <Ionicons name="camera" size={16} color="#FFF" />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.userName}>{profile?.fullName || 'Öğrenci'}</Text>
          <Text style={styles.userEmail}>{profile?.email || 'ogrenci@ogr.belek.edu.tr'}</Text>
          
          {/* Bölüm Rozeti */}
          {profile?.department ? (
            <View style={styles.departmentBadge}>
              <Ionicons name="school" size={14} color="#D32F2F" />
              <Text style={styles.departmentText}>{profile.department}</Text>
            </View>
          ) : null}

          {/* Telefon Numarası */}
          {profile?.phone ? (
            <View style={styles.phoneContainer}>
              <Ionicons name="call" size={14} color="#6c757d" />
              <Text style={styles.phoneText}>{profile.phone}</Text>
            </View>
          ) : null}

          {/* Biyografi Alanı */}
          {profile?.biography ? (
            <View style={styles.bioContainer}>
              <Text style={styles.bioText}>{profile.biography}</Text>
            </View>
          ) : null}
          
        </View>

        {/* Menü Seçenekleri */}
        <View style={styles.menuContainer}>
          
          <Text style={styles.sectionTitle}>Hesap Yönetimi</Text>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <View style={styles.menuIconCircle}>
              <Ionicons name="person-outline" size={22} color="#D32F2F" />
            </View>
            <Text style={styles.menuText}>Kişisel Bilgilerim</Text>
            <Ionicons name="chevron-forward" size={20} color="#CCC" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIconCircle}>
              <Ionicons name="people-outline" size={22} color="#D32F2F" />
            </View>
            <Text style={styles.menuText}>Üye Olduğum Topluluklar</Text>
            <Ionicons name="chevron-forward" size={20} color="#CCC" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIconCircle}>
              <Ionicons name="calendar-outline" size={22} color="#D32F2F" />
            </View>
            <Text style={styles.menuText}>Katıldığım Etkinlikler</Text>
            <Ionicons name="chevron-forward" size={20} color="#CCC" />
          </TouchableOpacity>

          <Text style={styles.sectionTitle}>Uygulama</Text>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIconCircle}>
              <Ionicons name="settings-outline" size={22} color="#6c757d" />
            </View>
            <Text style={styles.menuText}>Ayarlar</Text>
            <Ionicons name="chevron-forward" size={20} color="#CCC" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
            <View style={[styles.menuIconCircle, { backgroundColor: '#FFF0F0' }]}>
              <Ionicons name="log-out-outline" size={22} color="#D32F2F" />
            </View>
            <Text style={[styles.menuText, { color: '#D32F2F', fontWeight: 'bold' }]}>Çıkış Yap</Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FAFAFA' },
  headerCover: { height: 180, paddingHorizontal: 16, paddingTop: 20, alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFF', marginTop: 10 },
  profileCard: { 
    backgroundColor: '#FFF', 
    marginHorizontal: 16, 
    marginTop: -60,
    borderRadius: 20, 
    padding: 24, 
    alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 10, elevation: 5 
  },
  avatarContainer: { 
    width: 100, height: 100, borderRadius: 50, backgroundColor: '#FFF0F0', 
    justifyContent: 'center', alignItems: 'center', 
    marginTop: -50, 
    borderWidth: 4, borderColor: '#FFF',
    marginBottom: 12,
    position: 'relative'
  },
  avatar: { width: 92, height: 92, borderRadius: 46 },
  avatarText: { fontSize: 36, fontWeight: '900', color: '#D32F2F' },
  editAvatarButton: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#D32F2F', width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#FFF' },
  userName: { fontSize: 22, fontWeight: '900', color: '#1A1A1A', marginBottom: 4 },
  userEmail: { fontSize: 14, color: '#6c757d', marginBottom: 12, fontWeight: '500' },
  
  // Rozet, Telefon ve Biyografi Stilleri
  departmentBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF0F0', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  departmentText: { fontSize: 13, color: '#D32F2F', marginLeft: 6, fontWeight: '700' },
  phoneContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  phoneText: { fontSize: 13, color: '#6c757d', marginLeft: 6, fontWeight: '500' },
  bioContainer: { marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#F0F0F0', width: '100%', alignItems: 'center' },
  bioText: { fontSize: 14, color: '#4A5568', textAlign: 'center', lineHeight: 20, fontStyle: 'italic' },
  
  menuContainer: { padding: 16, paddingBottom: 40, marginTop: 10 },
  sectionTitle: { fontSize: 15, fontWeight: 'bold', color: '#6c757d', marginBottom: 12, marginLeft: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  menuItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 16, borderRadius: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 4, elevation: 2 },
  menuIconCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#F8F9FA', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  menuText: { flex: 1, fontSize: 16, fontWeight: '600', color: '#1A1A1A' }
});