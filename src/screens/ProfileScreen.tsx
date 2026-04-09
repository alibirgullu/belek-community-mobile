import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Image,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../navigation/ProfileStack';
import { AuthContext } from '../context/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import api from '../services/api';
import { LinearGradient } from 'expo-linear-gradient';
import Skeleton from '../components/Skeleton';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';

const { width } = Dimensions.get('window');

export default function ProfileScreen() {

  const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();
  const { logout } = React.useContext(AuthContext);
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();

  const [userData, setUserData] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isUploading, setIsUploading] = React.useState(false);

  useFocusEffect(
    React.useCallback(() => {
      fetchUserProfile();
    }, [])
  );

  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);
      // Backend actually uses /users/me according to our existing structure
      const res = await api.get('/users/me');
      setUserData(res.data);
    } catch (e) {
      console.log('Profil yüklenirken hata:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      // Optional backend logout if implemented
      await api.post('/auth/logout').catch(() => null);
    } finally {
      await logout();
    }
  };

  const handlePickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        alert(t('common.warning') + ': ' + 'Galeriye erişim izni gerekiyor.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        uploadProfileImage(result.assets[0]);
      }
    } catch (error) {
      console.log('Resim seçerken hata:', error);
    }
  };

  const uploadProfileImage = async (asset: ImagePicker.ImagePickerAsset) => {
    try {
      setIsUploading(true);

      const formData = new FormData();
      formData.append('file', {
        uri: asset.uri,
        name: asset.uri.split('/').pop() || 'profile.jpg',
        type: 'image/jpeg',
      } as any);
      formData.append('folder', 'profiles');

      const uploadRes = await api.post('/files/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const newImageUrl = uploadRes.data?.url || uploadRes.data?.Url;

      if (!newImageUrl) {
        throw new Error('Resim URLsi sunucudan alınamadı.');
      }

      await api.put('/users/me', {
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
        department: userData.department,
        biography: userData.biography,
        profileImageUrl: newImageUrl
      });

      setUserData({ ...userData, profileImageUrl: newImageUrl });
    } catch (error) {
      console.log('Fotoğraf yüklenirken hata:', error);
      alert(t('common.error') + ': ' + 'Fotoğraf yüklenemedi.');
    } finally {
      setIsUploading(false);
    }
  };

  const hasAdminRole = userData?.myCommunities?.some((c: any) => {
    if (!c.roleName) return false;
    const roleLower = c.roleName.toLowerCase();
    return roleLower.includes('admin') || roleLower.includes('başkan') || roleLower.includes('yönetici');
  }) || false;

  const communityCount = userData?.myCommunities?.length || 0;
  const eventCount = userData?.upcomingEvents?.length || 0;

  const AccountRow = ({ icon, title, onPress }: any) => (
    <TouchableOpacity style={styles.accountRow} activeOpacity={0.7} onPress={onPress}>
      <View style={styles.accountRowLeft}>
        <View style={styles.accountRowIconWrap}>
          <Ionicons name={icon} size={18} color={colors.primary} />
        </View>
        <Text style={styles.accountRowTitle}>{title}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
    </TouchableOpacity>
  );

  const styles = React.useMemo(() => getStyles(colors, isDark), [colors, isDark]);

  const renderSkeletons = () => (
    <View style={styles.contentContainer}>
      <View style={styles.avatarWrapper}>
        <Skeleton width={120} height={120} borderRadius={60} style={{ borderWidth: 6, borderColor: colors.background }} />
      </View>
      <View style={{ alignItems: 'center', marginBottom: 24 }}>
        <Skeleton width={180} height={26} borderRadius={8} style={{ marginBottom: 8 }} />
        <Skeleton width={120} height={16} borderRadius={6} />
      </View>
      
      <View style={styles.statsContainer}>
        <Skeleton width={80} height={40} borderRadius={8} style={{ marginHorizontal: 16 }} />
        <Skeleton width={80} height={40} borderRadius={8} style={{ marginHorizontal: 16 }} />
      </View>

      <Skeleton width={"100%"} height={50} borderRadius={16} style={{ marginBottom: 32 }} />
      
      <Skeleton width={100} height={16} borderRadius={6} style={{ marginBottom: 16, marginLeft: 4 }} />
      <Skeleton width={"100%"} height={80} borderRadius={20} style={{ marginBottom: 24 }} />
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ScrollView showsVerticalScrollIndicator={false} bounces={false} style={{ flex: 1 }}>
        {/* Hero Header */}
        <LinearGradient
          colors={isDark ? ['#3A0000', '#B01010', '#D05A00'] : ['#1A0000', '#E02020', '#FF6A00']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroGradient}
        >
          <SafeAreaView edges={['top']} style={styles.heroHeaderRow}>
            <Text style={styles.headerTitle}>{t('profile.title')}</Text>
            <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} style={styles.menuIconCircle} onPress={() => navigation.navigate('Settings')}>
              <Ionicons name="settings-outline" size={20} color="#FFF" />
            </TouchableOpacity>
          </SafeAreaView>
        </LinearGradient>

        {/* Main Content (overlapping upwards) */}
        {isLoading ? (
          renderSkeletons()
        ) : (
          <View style={styles.contentContainer}>
            {/* Avatar Row */}
            <View style={styles.avatarWrapper}>
              <TouchableOpacity onPress={handlePickImage} disabled={isUploading} activeOpacity={0.8}>
                {userData?.profileImageUrl ? (
                  <Image source={{ uri: userData.profileImageUrl }} style={styles.avatarImage} />
                ) : (
                  <View style={styles.avatarRedBackground}>
                    <Text style={styles.avatarText}>
                      {`${userData?.firstName?.[0] || 'T'}`}
                    </Text>
                  </View>
                )}
                {isUploading && (
                  <View style={styles.uploadingOverlay}>
                    <ActivityIndicator color="#FFF" />
                  </View>
                )}
                <View style={styles.onlineDot} />
                <View style={styles.editBadge}>
                  <Ionicons name="scan-outline" size={14} color="#FFF" />
                </View>
              </TouchableOpacity>
            </View>

            {/* Profile Info */}
            <Text style={styles.nameText}>
              {`${userData?.firstName || ''} ${userData?.lastName || ''}`.trim() || t('profile.student')}
            </Text>
            {(userData?.department || userData?.phone) ? (
              <Text style={styles.departmentText}>
                {userData?.department || ''}
                {userData?.department && userData?.phone ? ' · ' : ''}
                {userData?.phone || ''}
              </Text>
            ) : null}

            {/* Stats Row */}
            <View style={styles.statsContainer}>
              <View style={[styles.statColumn, { flex: 1 }]}>
                <Text style={styles.statValue}>{communityCount}</Text>
                <Text style={styles.statLabel}>{t('profile.community')}</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={[styles.statColumn, { flex: 1 }]}>
                <Text style={styles.statValue}>{eventCount}</Text>
                <Text style={styles.statLabel}>{t('profile.event')}</Text>
              </View>
            </View>

            {/* Edit Button */}
            <TouchableOpacity
              style={styles.primaryButton}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('EditProfile')}
            >
              <Text style={styles.primaryButtonText}>{t('profile.editProfile')}</Text>
            </TouchableOpacity>

            {/* Biography */}
            <Text style={styles.sectionHeader}>{t('profile.biography').toUpperCase()}</Text>
            <View style={styles.card}>
              <Text style={styles.bioText}>
                {userData?.biography || t('profile.emptyBiography', { defaultValue: 'Henüz bir biyografi eklemediniz.' })}
              </Text>
            </View>

            {/* Account Settings */}
            <Text style={styles.sectionHeader}>{t('profile.account')}</Text>
            <View style={styles.card}>
              {hasAdminRole && (
                <>
                  <AccountRow
                    icon="star-outline"
                    title={t('profile.adminPanel')}
                    onPress={() => navigation.navigate('AdminCommunities')}
                  />
                  <View style={styles.rowDivider} />
                </>
              )}
              <AccountRow
                icon="infinite"
                title={t('profile.joinedCommunities')}
                onPress={() => navigation.navigate('JoinedCommunities')}
              />
              <View style={styles.rowDivider} />
              <AccountRow
                icon="lock-closed-outline"
                title={t('profile.privacyPolicy')}
                onPress={() => { }}
              />
            </View>

            {/* Logout Button */}
            <TouchableOpacity style={styles.logoutButton} activeOpacity={0.7} onPress={handleLogout}>
              <Text style={styles.logoutButtonText}>{t('profile.logout')}</Text>
            </TouchableOpacity>

          </View>
        )}
      </ScrollView>
    </View>
  );
}

const getStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  heroGradient: {
    height: 180,
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  heroHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: '900',
  },
  menuIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  avatarWrapper: {
    alignSelf: 'center',
    marginTop: -60, // Negative margin to overlap the gradient
    marginBottom: 16,
    position: 'relative'
  },
  avatarImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 6,
    borderColor: colors.background, // Match background color for cutout effect
  },
  avatarRedBackground: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primaryDark,
    borderWidth: 6,
    borderColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFF',
    fontSize: 50,
    fontWeight: '900',
  },
  uploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 6,
    borderColor: colors.background,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 12,
    left: 8,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.success,
    borderWidth: 2,
    borderColor: colors.background,
  },
  editBadge: {
    position: 'absolute',
    bottom: 8,
    right: 4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nameText: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  departmentText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textTertiary,
    textAlign: 'center',
    marginBottom: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  statColumn: {
    alignItems: 'center',
    paddingHorizontal: 16,
    minWidth: 80,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textTertiary,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.borderDark,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: isDark ? 0.6 : 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: '900',
    color: colors.text,
    marginBottom: 12,
    marginLeft: 4,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: isDark ? 0.3 : 0.03,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: isDark ? colors.border : 'rgba(0,0,0,0.02)',
  },
  bioText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
    fontWeight: '500',
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  accountRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accountRowIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: isDark ? colors.primaryLight : '#FFF0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  accountRowTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  rowDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 4,
  },
  logoutButton: {
    borderWidth: 1.5,
    borderColor: isDark ? '#AA2020' : '#FFC5C5',
    borderRadius: 16,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 30,
    backgroundColor: 'transparent'
  },
  logoutButtonText: {
    color: colors.error,
    fontSize: 16,
    fontWeight: '800',
  }
});