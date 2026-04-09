import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  StatusBar,
  Image,
  Dimensions,
  Animated
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation, RouteProp, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import api, { communityService } from '../services/api';
import { CommunityDetail } from '../types';
import { ExploreStackParamList } from '../navigation/ExploreStack';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { Spacing, Radii, Shadows } from '../theme/commonStyles';

const { width } = Dimensions.get('window');

type CommunityDetailRouteProp = RouteProp<ExploreStackParamList, 'CommunityDetail'>;

export default function CommunityDetailScreen() {
  const route = useRoute<CommunityDetailRouteProp>();
  const navigation = useNavigation<NativeStackNavigationProp<ExploreStackParamList>>();
  const { t } = useTranslation();
  const { communityId } = route.params;
  const { colors, isDark } = useTheme();

  const styles = React.useMemo(() => getStyles(colors, isDark), [colors, isDark]);

  const [community, setCommunity] = useState<CommunityDetail | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [membershipStatus, setMembershipStatus] = useState<'None' | 'Pending' | 'Active' | 'Admin'>('None');
  const [isLoading, setIsLoading] = useState(true);
  const [isToggling, setIsToggling] = useState(false);

  const scrollY = React.useRef(new Animated.Value(0)).current;

  const headerScale = scrollY.interpolate({
      inputRange: [-100, 0],
      outputRange: [1.5, 1],
      extrapolate: 'clamp',
  });
  const headerTranslateY = scrollY.interpolate({
      inputRange: [0, 300],
      outputRange: [0, 150],
      extrapolate: 'clamp',
  });

  useFocusEffect(
    React.useCallback(() => {
      const fetchCommunityDetails = async () => {
        try {
          const [communityRes, userRes] = await Promise.all([
            api.get(`/communities/${communityId}`),
            api.get('/users/me')
          ]);

          setCommunity(communityRes.data);
          setCurrentUser(userRes.data);

          const myCommunities = userRes.data.myCommunities || [];
          const memberRec = myCommunities.find((c: any) => c.communityId === communityId);

          if (memberRec) {
            if (memberRec.status === 'Pending') setMembershipStatus('Pending');
            else if (memberRec.roleName === 'Admin') setMembershipStatus('Admin');
            else setMembershipStatus('Active');
          } else {
            setMembershipStatus('None');
          }
        } catch (error) {
          console.log('Topluluk detayı çekilirken hata:', error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchCommunityDetails();
    }, [communityId])
  );

  const handleToggleMembership = async () => {
    if (!currentUser) return;
    setIsToggling(true);

    try {
      if (membershipStatus === 'None') {
        const res = await communityService.joinCommunity(communityId);
        alert(res.data?.message || 'Katılma isteği gönderildi.');
        setMembershipStatus('Pending');
      } else {
        const res = await communityService.leaveCommunity(communityId, currentUser.id);
        alert(res.data?.message || 'Topluluktan ayrıldınız.');
        setMembershipStatus('None');
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Bir hata oluştu.';
      alert(msg);
    } finally {
      setIsToggling(false);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!community) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <Ionicons name="alert-circle-outline" size={60} color={colors.textTertiary} style={{ marginBottom: Spacing.md }} />
        <Text style={[styles.h3, { color: colors.textSecondary, marginBottom: Spacing.xl }]}>{t('community.notFound')}</Text>
        <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <Text style={styles.primaryButtonText}>{t('community.goBack')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <Animated.ScrollView
          showsVerticalScrollIndicator={false}
          bounces={true}
          scrollEventThrottle={16}
          onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: scrollY } } }],
              { useNativeDriver: true }
          )}
      >
        <View style={[styles.heroImageContainer, { overflow: 'hidden' }]}>
          <Animated.View style={[StyleSheet.absoluteFillObject, { transform: [{ scale: headerScale }, { translateY: headerTranslateY }] }]}>
            {community.logoUrl ? (
              <Image source={{ uri: community.logoUrl }} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
            ) : (
              <View style={[StyleSheet.absoluteFillObject, { backgroundColor: colors.secondary }]} />
            )}
            <LinearGradient
              colors={['rgba(0,0,0,0.6)', 'transparent', isDark ? colors.background : 'rgba(10, 37, 64, 1)']} // Fade down
              style={StyleSheet.absoluteFillObject}
            />
          </Animated.View>

          <SafeAreaView edges={['top']} style={styles.safeAreaHeader}>
            <TouchableOpacity style={styles.blurBackButton} onPress={() => navigation.goBack()}>
              <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </SafeAreaView>

          <View style={styles.heroTextContent}>
            <Text style={styles.heroTitle} numberOfLines={2}>{community.name}</Text>
            <Text style={styles.heroSubtitle}>{t('community.members', { count: community.memberCount })} • {t('community.official')}</Text>
          </View>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[
              styles.joinButton,
              (membershipStatus === 'Pending' || membershipStatus === 'Active' || membershipStatus === 'Admin') && styles.leaveButton
            ]}
            activeOpacity={0.8}
            onPress={handleToggleMembership}
            disabled={isToggling}
          >
            {isToggling ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <Text style={styles.joinButtonText}>
                {membershipStatus === 'None' ? t('community.join') :
                  membershipStatus === 'Pending' ? 'İstek Gönderildi (İptal)' : 'Ayrıl'}
              </Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} activeOpacity={0.8}>
            <Ionicons name="share-outline" size={22} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} activeOpacity={0.8}>
            <Ionicons name="ellipsis-horizontal" size={22} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.contentSection}>
          <Text style={styles.sectionTitle}>{t('community.about')}</Text>
          <Text style={styles.descriptionText}>
            {community.description || t('community.noDescription')}
          </Text>

          <View style={styles.divider} />

          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Yönetim Kurulu</Text>
            <Text style={styles.countBadge}>{community.boardMembers?.length || 0}</Text>
          </View>

          {community.boardMembers && community.boardMembers.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
              {community.boardMembers.map(member => (
                <View key={member.userId} style={styles.boardMemberCard}>
                  {member.profileImageUrl ? (
                    <Image source={{ uri: member.profileImageUrl }} style={styles.boardMemberAvatar} />
                  ) : (
                    <View style={[styles.boardMemberAvatar, { backgroundColor: colors.primaryDark, justifyContent: 'center', alignItems: 'center' }]}>
                      <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 20 }}>
                        {member.fullName.charAt(0)}
                      </Text>
                    </View>
                  )}
                  <Text style={styles.boardMemberName} numberOfLines={1}>{member.fullName}</Text>
                  <Text style={styles.boardMemberRole} numberOfLines={1}>
                    {member.roleName === 'Admin' ? 'Topluluk Başkanı' :
                      member.roleName === 'Member' ? 'Üye' : member.roleName}
                  </Text>
                </View>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>Henüz yönetim kurulu üyesi bulunmuyor.</Text>
            </View>
          )}

          <View style={styles.divider} />

          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>{t('community.events')}</Text>
            <Text style={styles.countBadge}>{community.upcomingEvents?.length || 0}</Text>
          </View>

          {community.upcomingEvents && community.upcomingEvents.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
              {community.upcomingEvents.map(event => {
                const dateObj = new Date(event.startDate);
                return (
                  <TouchableOpacity
                    key={event.id}
                    style={styles.eventCard}
                    activeOpacity={0.9}
                    onPress={() => navigation.navigate('EventDetail', { event: event })}
                  >
                    <View style={styles.eventImagePlaceholder}>
                      {event.posterUrl ? (
                        <Image
                          source={{ uri: event.posterUrl }}
                          style={{ width: '100%', height: '100%' }}
                          resizeMode="cover"
                        />
                      ) : (
                        <Ionicons name="calendar" size={32} color={colors.textTertiary} />
                      )}
                    </View>
                    <View style={styles.eventInfo}>
                      <Text style={styles.eventDateText}>
                        {dateObj.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}
                      </Text>
                      <Text style={styles.eventTitle} numberOfLines={2}>{event.title}</Text>
                    </View>
                  </TouchableOpacity>
                )
              })}
            </ScrollView>
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>{t('community.noEvents')}</Text>
            </View>
          )}

          <View style={styles.divider} />

          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>{t('community.announcements')}</Text>
            <Text style={styles.countBadge}>{community.recentAnnouncements?.length || 0}</Text>
          </View>

          {community.recentAnnouncements && community.recentAnnouncements.length > 0 ? (
            community.recentAnnouncements.map(announcement => (
              <View key={announcement.id} style={styles.announcementCard}>
                <View style={styles.announcementDot} />
                <View style={styles.announcementContent}>
                  <Text style={styles.announcementTitle}>{announcement.title}</Text>
                  <Text style={styles.announcementDate}>
                    {new Date(announcement.createdAt).toLocaleDateString('tr-TR')}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>{t('community.noAnnouncements')}</Text>
            </View>
          )}
        </View>
      </Animated.ScrollView>
    </View>
  );
}

const getStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background }, 
  heroImageContainer: {
    width: '100%',
    height: 380,
    position: 'relative',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  h3: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: Radii.lg,
  },
  primaryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  safeAreaHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.md,
    zIndex: 10,
  },
  blurBackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  heroTextContent: {
    position: 'absolute',
    bottom: Spacing.xl,
    left: Spacing.lg,
    right: Spacing.lg,
  },
  heroTitle: {
    fontSize: 34,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: -1,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 15,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
  },
  actionRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    marginTop: -24, 
    marginBottom: Spacing.lg,
    gap: Spacing.md,
    zIndex: 11,
  },
  joinButton: {
    flex: 1,
    backgroundColor: colors.primary,
    height: 48,
    borderRadius: Radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
    ...Shadows.sm
  },
  leaveButton: {
    backgroundColor: colors.textSecondary,
  },
  joinButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.md,
  },
  contentSection: {
    backgroundColor: colors.background, 
    borderTopLeftRadius: Radii.xxl,
    borderTopRightRadius: Radii.xxl,
    paddingTop: Spacing.xl,
    paddingBottom: 100,
    minHeight: 500,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.5,
    paddingHorizontal: Spacing.lg, 
    marginBottom: Spacing.sm,
  },
  countBadge: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textTertiary,
    marginBottom: 4,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 22,
    paddingHorizontal: Spacing.lg,
    color: colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.xl,
  },
  horizontalScroll: {
    paddingLeft: Spacing.lg,
  },
  eventCard: {
    width: 200,
    backgroundColor: colors.surface,
    borderRadius: Radii.xl,
    marginRight: Spacing.lg,
    ...Shadows.sm,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  eventImagePlaceholder: {
    height: 80,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  boardMemberCard: {
    alignItems: 'center',
    width: 90,
    marginRight: Spacing.md,
  },
  boardMemberAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginBottom: Spacing.sm,
    backgroundColor: colors.surface,
    ...Shadows.sm,
  },
  boardMemberName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 2,
  },
  boardMemberRole: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '600',
    textAlign: 'center',
  },
  eventInfo: {
    padding: Spacing.md,
  },
  eventDateText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    lineHeight: 20,
  },
  announcementCard: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  announcementDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
    marginTop: 6,
    marginRight: Spacing.md,
  },
  announcementContent: {
    flex: 1,
  },
  announcementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  announcementDate: {
    fontSize: 13,
    color: colors.textTertiary,
  },
  emptyCard: {
    paddingHorizontal: Spacing.lg,
  },
  emptyText: {
    fontSize: 15,
    color: colors.textTertiary,
    fontStyle: 'italic',
  }
});