import React, { useState, useEffect, useCallback, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Dimensions,
  RefreshControl,
  Animated,
  Alert,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ExploreStackParamList } from '../navigation/ExploreStack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import Skeleton from '../components/Skeleton';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

// Categories list. We will translate "Tümü" dynamically
const rawCategories = ['all', 'software', 'design', 'sports', 'general'];

// Define gradient colors based on category
const getGradientProps = (category: string) => {
  const cat = category?.toLowerCase() || 'genel';
  if (cat.includes('yazılım')) return { colors: ['#1A2035', '#242F4B'] as const, icon: 'laptop-outline' };
  if (cat.includes('tasarım')) return { colors: ['#8A2387', '#E94057'] as const, icon: 'color-palette-outline' };
  if (cat.includes('spor')) return { colors: ['#00B4DB', '#0083B0'] as const, icon: 'basketball-outline' };
  if (cat.includes('girişim')) return { colors: ['#4CB8C4', '#3CD3AD'] as const, icon: 'time-outline' };
  return { colors: ['#E02020', '#FF5A00'] as const, icon: 'people-outline' }; // Default Red
};

export default function ExploreScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ExploreStackParamList>>();
  const { userToken, user } = useContext(AuthContext);
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();

  const [communities, setCommunities] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Community Request State
  const [isRequestModalVisible, setIsRequestModalVisible] = useState(false);
  const [requestData, setRequestData] = useState({ name: '', description: '', advisorName: '', categoryName: 'Genel' });
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);

  // Debounced search query (400ms)
  const debouncedSearch = useDebounce(searchQuery, 400);

  const styles = React.useMemo(() => getStyles(colors, isDark), [colors, isDark]);

  const fetchCommunities = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setIsLoading(true);
    try {
      const categoryParam = activeCategory === 'all' ? '' : t(`explore.${activeCategory}`);
      const searchParam = debouncedSearch;

      const response = await api.get('/communities', {
        params: {
          category: categoryParam,
          search: searchParam
        }
      });
      // Ensure 'isJoined' exists or map it correctly if needed (assuming backend provides it)
      setCommunities(response.data);
    } catch (error) {
      console.log('Toplulukları çekerken hata:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [activeCategory, debouncedSearch]);

  // Refetch when filters change
  useEffect(() => {
    fetchCommunities();
  }, [fetchCommunities]);

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchCommunities(true);
  };

  const handleJoinToggle = async (community: any) => {
    // Optimistic UI update
    const wasJoined = community.isJoined;
    setCommunities(prev =>
      prev.map(c =>
        c.id === community.id ? { ...c, isJoined: !wasJoined, memberCount: wasJoined ? c.memberCount - 1 : c.memberCount + 1 } : c
      )
    );

    try {
      if (wasJoined) {
        // DELETE /api/communities/{communityId}/members/{userId}
        await api.delete(`/communities/${community.id}/members/${user?.id}`);
      } else {
        // POST /api/communities/{communityId}/members/join
        await api.post(`/communities/${community.id}/members/join`);
      }
    } catch (error: any) {
      console.log('Topluluk işlem hatası:', error);

      // Backend'den gelen spesifik (400) mesajı göster
      const errorMsg = error.response?.data?.message || 'İşlem gerçekleştirilemedi.';
      Alert.alert('Uyarı', errorMsg);

      // Revert Optimistic Update because the backend rejected it
      setCommunities(prev =>
        prev.map(c =>
          c.id === community.id ? { ...c, isJoined: wasJoined, memberCount: wasJoined ? c.memberCount + 1 : c.memberCount - 1 } : c
        )
      );
    }
  };

  const handleRequestCommunity = async () => {
    if (!requestData.name.trim() || !requestData.description.trim() || !requestData.advisorName.trim()) {
      Alert.alert(t('explore.alertMissingTitle'), t('explore.alertMissingDesc'));
      return;
    }

    setIsSubmittingRequest(true);
    try {
      await api.post('/communities/request', {
        name: requestData.name,
        description: requestData.description,
        advisorName: requestData.advisorName,
        categoryName: requestData.categoryName === 'all' ? 'Genel' : t(`explore.${requestData.categoryName}`)
      });

      Alert.alert(t('explore.alertSuccessTitle'), t('explore.alertSuccessDesc'));
      setIsRequestModalVisible(false);
      setRequestData({ name: '', description: '', advisorName: '', categoryName: 'general' });
    } catch (error: any) {
      console.log('Topluluk başvuru hatası:', error);
      Alert.alert(t('explore.alertErrorTitle'), error.response?.data?.Message || 'Başvurunuz onaylanırken bir hata oluştu.');
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  const renderCategoryChips = () => (
    <View style={styles.chipsContainer}>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={rawCategories}
        keyExtractor={(item) => item}
        renderItem={({ item }) => {
          const isActive = item === activeCategory;
          return (
            <TouchableOpacity
              activeOpacity={0.8}
              style={[
                styles.chip,
                isActive ? styles.chipActive : styles.chipInactive
              ]}
              onPress={() => setActiveCategory(item)}
            >
              <Text style={[
                styles.chipText,
                isActive ? styles.chipTextActive : styles.chipTextInactive
              ]}>
                {t(`explore.${item}`)}
              </Text>
            </TouchableOpacity>
          );
        }}
        contentContainerStyle={{ paddingHorizontal: 20 }}
      />
    </View>
  );

  const renderCommunityCard = ({ item }: { item: any }) => {
    const gradient = getGradientProps(item.categoryName || item.category || item.name);

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.95}
        onPress={() => navigation.navigate('CommunityDetail', { communityId: item.id, communityName: item.name })}
      >
        <LinearGradient
          colors={gradient.colors}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={styles.cardBanner}
        >
          {item.coverImageUrl ? (
            <Image source={{ uri: item.coverImageUrl }} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
          ) : (
            <View style={styles.heroPlaceholder}>
              <Ionicons name={gradient.icon as any} size={48} color="rgba(255,255,255,0.6)" />
            </View>
          )}

          {/* Top Left Badge */}
          <View style={styles.badgeTopLeft}>
            <Text style={styles.badgeText}>{t(`explore.${item.categoryName?.toLowerCase() || item.category?.toLowerCase() || 'general'}`, { defaultValue: item.categoryName || item.category || 'GENEL' }).toUpperCase()}</Text>
          </View>

          {/* Logo / Arma */}
          {item.logoUrl ? (
            <View style={styles.armaContainer}>
              <Image source={{ uri: item.logoUrl }} style={styles.armaImage} resizeMode="cover" />
            </View>
          ) : null}

          {/* Top Right Badge */}
          <View style={styles.badgeTopRight}>
            <Text style={styles.badgeText}>{t('explore.member', { count: item.memberCount || 0 })}</Text>
          </View>
        </LinearGradient>

        <View style={styles.cardBody}>
          <Text style={styles.communityName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.descriptionText} numberOfLines={1}>
            {item.description || t('community.noDescription')}
          </Text>

          <View style={[styles.cardFooter, { justifyContent: 'flex-end' }]}>
            {/* Action Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              style={[
                styles.actionButton,
                item.isJoined ? styles.actionButtonJoined : styles.actionButtonJoin
              ]}
              onPress={() => handleJoinToggle(item)}
            >
              <Text style={[
                styles.actionButtonText,
                item.isJoined ? styles.actionButtonTextJoined : styles.actionButtonTextJoin
              ]}>
                {item.isJoined ? t('explore.joined') : t('explore.join')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderSkeletons = () => (
    <View style={{ paddingHorizontal: 20 }}>
      <Skeleton width="100%" height={240} borderRadius={24} style={{ marginBottom: 20 }} />
      <Skeleton width="100%" height={240} borderRadius={24} style={{ marginBottom: 20 }} />
      <Skeleton width="100%" height={240} borderRadius={24} />
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{t('explore.title')}</Text>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color={colors.textTertiary} style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder={t('explore.searchPlaceholder')}
          placeholderTextColor={colors.textTertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={18} color={colors.textTertiary} />
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity
        style={styles.createBanner}
        activeOpacity={0.9}
        onPress={() => setIsRequestModalVisible(true)}
      >
        <LinearGradient
          colors={isDark ? ['#990000', '#CC2222'] : ['#CC0000', '#FF3333']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={styles.createBannerInside}
        >
          <View style={styles.createBannerContent}>
            <Ionicons name="rocket" size={22} color="#FFF" />
            <View style={{ marginLeft: 12 }}>
              <Text style={styles.createBannerTitle}>{t('explore.createCommunity')}</Text>
              <Text style={styles.createBannerSub}>{t('explore.createCommunitySub')}</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={24} color="rgba(255,255,255,0.6)" />
        </LinearGradient>
      </TouchableOpacity>

      <View style={{ height: 50, marginBottom: 12 }}>
        {renderCategoryChips()}
      </View>

      {isLoading && !isRefreshing ? (
        <View style={{ flex: 1, marginTop: 12 }}>
          {renderSkeletons()}
        </View>
      ) : (
        <FlatList
          data={communities}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderCommunityCard}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={64} color={colors.borderDark} />
              <Text style={styles.emptyText}>{t('explore.emptyList')}</Text>
            </View>
          }
        />
      )}

      {/* Request Community Modal */}
      <Modal visible={isRequestModalVisible} animationType="slide" transparent={true} onRequestClose={() => setIsRequestModalVisible(false)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('explore.modalTitle')}</Text>
              <TouchableOpacity onPress={() => setIsRequestModalVisible(false)} style={styles.modalCloseBtn}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScroll}>
              <Text style={styles.modalDesc}>
                {t('explore.modalDesc')}
              </Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t('explore.communityNameLabel')}</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Örn: Dağcılık ve Doğa Sporları"
                  placeholderTextColor={colors.textTertiary}
                  value={requestData.name}
                  onChangeText={(text) => setRequestData(prev => ({ ...prev, name: text }))}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t('explore.advisorLabel')}</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Örn: Dr. Öğr. Üye. Furkan Kayım"
                  placeholderTextColor={colors.textTertiary}
                  value={requestData.advisorName}
                  onChangeText={(text) => setRequestData(prev => ({ ...prev, advisorName: text }))}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t('explore.descriptionLabel')}</Text>
                <TextInput
                  style={[styles.modalInput, { height: 100, textAlignVertical: 'top' }]}
                  placeholder="Topluluğun kurulma amacı, planlanan etkinlik türleri..."
                  placeholderTextColor={colors.textTertiary}
                  multiline
                  value={requestData.description}
                  onChangeText={(text) => setRequestData(prev => ({ ...prev, description: text }))}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t('explore.categoryLabel')}</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 4, paddingBottom: 8 }}>
                  {rawCategories.filter(c => c !== 'all').map(cat => {
                    const isSelected = requestData.categoryName === cat;
                    return (
                      <TouchableOpacity
                        key={cat}
                        activeOpacity={0.8}
                        onPress={() => setRequestData(prev => ({ ...prev, categoryName: cat }))}
                        style={[
                          styles.chip,
                          isSelected ? styles.chipActive : styles.chipInactive,
                          { paddingVertical: 10, paddingHorizontal: 16, marginRight: 8, borderWidth: isSelected ? 0 : 1 }
                        ]}
                      >
                        <Text style={[
                          styles.chipText,
                          isSelected ? styles.chipTextActive : styles.chipTextInactive
                        ]}>
                          {t(`explore.${cat}`)}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

              <TouchableOpacity
                style={styles.submitBtn}
                activeOpacity={0.8}
                onPress={handleRequestCommunity}
                disabled={isSubmittingRequest}
              >
                {isSubmittingRequest ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.submitBtnText}>{t('explore.submitBtn')}</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

    </SafeAreaView>
  );
}

const getStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerRow: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.text,
    letterSpacing: -0.5,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    marginHorizontal: 20,
    marginBottom: 16,
    paddingHorizontal: 16,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: isDark ? colors.border : 'rgba(0,0,0,0.05)',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  chipsContainer: {
    marginBottom: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipActive: {
    backgroundColor: colors.primary,
  },
  chipInactive: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '700',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  chipTextInactive: {
    color: colors.textSecondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: isDark ? 0.3 : 0.05,
    shadowRadius: 15,
    elevation: 4,
    borderWidth: 1,
    borderColor: isDark ? colors.border : 'rgba(0,0,0,0.03)',
  },
  cardBanner: {
    height: 140,
    width: '100%',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroPlaceholder: {
    opacity: 0.9,
  },
  badgeTopLeft: {
    position: 'absolute',
    top: 14,
    left: 14,
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeTopRight: {
    position: 'absolute',
    top: 14,
    right: 14,
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  armaContainer: {
    position: 'absolute',
    bottom: -20,
    left: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFF',
    padding: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
    zIndex: 10,
  },
  armaImage: {
    width: '100%',
    height: '100%',
    borderRadius: 25,
  },
  cardBody: {
    padding: 18,
    paddingTop: 32,
  },
  communityName: {
    fontSize: 17,
    fontWeight: '900',
    color: colors.text,
    marginBottom: 4,
  },
  descriptionText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 18,
  },
  avatarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  actionButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonJoin: {
    backgroundColor: colors.primary,
  },
  actionButtonJoined: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '800',
  },
  actionButtonTextJoin: {
    color: '#FFFFFF',
  },
  actionButtonTextJoined: {
    color: colors.primary,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 12,
    color: colors.textTertiary,
    fontSize: 15,
    fontWeight: '600',
  },
  createBanner: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: isDark ? 0.5 : 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  createBannerInside: {
    paddingHorizontal: 20,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  createBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  createBannerTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  createBannerSub: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 24,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.text,
    letterSpacing: -0.5,
  },
  modalCloseBtn: {
    backgroundColor: isDark ? colors.inputBackground : '#F2F2F7',
    padding: 8,
    borderRadius: 20,
  },
  modalScroll: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  modalDesc: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
    lineHeight: 20,
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 8,
    marginLeft: 4,
  },
  modalInput: {
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.text,
    fontWeight: '500',
  },
  submitBtn: {
    backgroundColor: colors.primaryDark,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: isDark ? 0.6 : 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  }
});