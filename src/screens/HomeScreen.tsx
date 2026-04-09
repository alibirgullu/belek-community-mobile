import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  StatusBar,
  Image,
  Dimensions,
  Animated,
  RefreshControl,
  Platform,
  PanResponder
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { notificationService } from '../services/api';
import api from '../services/api';
import { Event } from '../types';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

LocaleConfig.locales['en'] = {
  monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  monthNamesShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  dayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  dayNamesShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  today: 'Today'
};
LocaleConfig.locales['tr'] = {
  monthNames: ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'],
  monthNamesShort: ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'],
  dayNames: ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'],
  dayNamesShort: ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'], // 0th index MUST be Sunday ('Paz')
  today: 'Bugün'
};
LocaleConfig.defaultLocale = 'tr';

import Skeleton from '../components/Skeleton';

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const { user } = React.useContext(AuthContext);
  const { t, i18n } = useTranslation();
  const { colors, isDark } = useTheme();

  const styles = React.useMemo(() => getStyles(colors, isDark), [colors, isDark]);

  const [events, setEvents] = useState<Event[]>([]);
  const [markedDates, setMarkedDates] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [announcements, setAnnouncements] = useState<any[]>([]);

  const fetchData = async () => {
    try {
      // 1. Fetch Events
      const response = await api.get('/events');
      const fetchedEvents: Event[] = response.data;
      setEvents(fetchedEvents);

      const marks: any = {};
      fetchedEvents.forEach(event => {
        const dateKey = event.startDate.split('T')[0];
        marks[dateKey] = { marked: true, dotColor: colors.primary };
      });
      // Highlight today
      const todayString = new Date().toISOString().split('T')[0];
      marks[todayString] = { ...marks[todayString], selected: true, selectedColor: colors.primary };
      setMarkedDates(marks);

      // 2. Fetch Unread Count
      const countRes = await notificationService.getUnreadCount();
      if (countRes && countRes.data) {
        setUnreadCount(countRes.data.unreadCount || 0);
      }

      // 3. Fetch Global Announcements
      const notifRes = await notificationService.getMyNotifications();
      if (notifRes && notifRes.data && Array.isArray(notifRes.data)) {
        const sysNotifs = notifRes.data.filter(n => n.type === 'GlobalAnnouncement');
        setAnnouncements(sysNotifs.slice(0, 5));
      }
    } catch (error) {
      console.log('Veri çekme hatası:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    const unsubscribe = navigation.addListener('focus', () => {
      fetchData();
    });
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    LocaleConfig.defaultLocale = i18n.language === 'en' ? 'en' : 'tr';
  }, [i18n.language]);

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchData();
  };

  const renderAnnouncementCard = ({ item, index }: { item: any, index: number }) => {
    const isNew = index === 0;

    return (
      <TouchableOpacity activeOpacity={0.9} onPress={() => navigation.navigate('Notifications')}>
        <LinearGradient
          colors={isDark ? ['#991515', '#B03500'] : ['#E02020', '#FF5A00']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={styles.announcementCard}
        >
          {isNew && (
            <View style={styles.badgeContainer}>
              <Text style={styles.badgeText}>{t('home.newBadge')}</Text>
            </View>
          )}
          <View style={styles.announcementIconWrap}>
            <Ionicons name="filter-outline" size={20} color="#FFF" />
          </View>
          <Text style={styles.announcementTitle}>{item.title}</Text>
          <Text style={styles.announcementText} numberOfLines={2}>{item.message}</Text>
          <View style={styles.announcementDateRow}>
            <Ionicons name="calendar-outline" size={14} color="#FFF" />
            <Text style={styles.announcementDateText}> {new Date(item.createdAt).toLocaleDateString(i18n.language === 'en' ? 'en-US' : 'tr-TR')} </Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name.charAt(0).toUpperCase();
  };

  const renderHomeSkeletons = () => (
    <View style={styles.container}>
      {/* Header Skeleton */}
      <View style={styles.headerContent}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Skeleton width={48} height={48} borderRadius={24} style={{ marginRight: 12 }} />
          <View>
            <Skeleton width={80} height={12} borderRadius={6} style={{ marginBottom: 6 }} />
            <Skeleton width={120} height={16} borderRadius={8} />
          </View>
        </View>
        <Skeleton width={40} height={40} borderRadius={20} />
      </View>
      <View style={{ paddingHorizontal: 20 }}>
        <Skeleton width={100} height={20} borderRadius={8} style={{ marginBottom: 12 }} />
        <Skeleton width={'100%'} height={160} borderRadius={20} style={{ marginBottom: 30 }} />
        <Skeleton width={180} height={20} borderRadius={8} style={{ marginBottom: 12 }} />
        <Skeleton width={'100%'} height={80} borderRadius={16} style={{ marginBottom: 12 }} />
        <Skeleton width={'100%'} height={80} borderRadius={16} style={{ marginBottom: 12 }} />
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        {renderHomeSkeletons()}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={colors.background} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {/* Header Section */}
        <View style={styles.headerContent}>
          <View style={styles.headerLeftControls}>
            <TouchableOpacity activeOpacity={0.8} onPress={() => navigation.navigate('Profil')} style={styles.avatarContainer}>
              {user?.profileImageUrl ? (
                <Image source={{ uri: user.profileImageUrl }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarFallback}>
                  <Text style={styles.avatarInitial}>{getInitials(user?.firstName)}</Text>
                </View>
              )}
            </TouchableOpacity>
            <View style={styles.headerTextContainer}>
              <Text style={styles.welcomeText}>{t('home.welcome')}</Text>
              <Text style={styles.userNameText}>{user?.firstName || t('profile.student')}</Text>
            </View>
          </View>

          <View style={styles.headerRightControls}>
            <TouchableOpacity style={styles.notificationButton} activeOpacity={0.8} onPress={() => navigation.navigate('Notifications')}>
              <Ionicons name="notifications-outline" size={26} color={colors.text} />
              {unreadCount > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Duyurular Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>{t('home.announcements')}</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Notifications')}>
              <Text style={styles.seeAllText}>{t('home.seeAll')}</Text>
            </TouchableOpacity>
          </View>

          {announcements.length > 0 ? (
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={announcements}
              keyExtractor={(item) => item.id}
              renderItem={renderAnnouncementCard}
              contentContainerStyle={{ paddingHorizontal: 20 }}
              snapToInterval={width * 0.85 + 16}
              decelerationRate="fast"
            />
          ) : (
            <View style={{ paddingHorizontal: 20, paddingVertical: 16 }}>
              <Text style={{ color: colors.textTertiary, fontSize: 14 }}>{t('home.announcementEmpty')}</Text>
            </View>
          )}
        </View>

        {/* Yaklaşan Etkinlikler Section (Vertical) */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>{t('home.upcomingEvents')}</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Topluluk')}>
              <Text style={styles.seeAllText}>{t('home.seeAll')}</Text>
            </TouchableOpacity>
          </View>

          <View style={{ paddingHorizontal: 20 }}>
            {(() => {
              const upcomingEvents = events.filter(e => new Date(e.startDate).getTime() >= new Date().setHours(0, 0, 0, 0));

              if (upcomingEvents.length === 0) {
                return <Text style={styles.emptyText}>{t('home.upcomingEventsEmpty')}</Text>;
              }

              return upcomingEvents.slice(0, 3).map((item) => {
                const dateObj = new Date(item.startDate);
                const formattedTime = dateObj.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
                const monthName = LocaleConfig.locales[i18n.language === 'en' ? 'en' : 'tr'].monthNamesShort[dateObj.getMonth()].toUpperCase();
                const dayStr = dateObj.getDate().toString().padStart(2, '0');

                return (
                  <TouchableOpacity
                    key={item.id.toString()}
                    style={styles.verticalEventCard}
                    activeOpacity={0.8}
                    onPress={() => navigation.navigate('EventDetail', { event: item })}
                  >
                    <View style={styles.eventDateBox}>
                      <Text style={styles.eventMonthText}>{monthName}</Text>
                      <Text style={styles.eventDayText}>{dayStr}</Text>
                    </View>
                    <View style={styles.verticalEventInfo}>
                      <View style={styles.eventTitleRow}>
                        <Text style={styles.verticalEventTitle} numberOfLines={1}>{item.title}</Text>
                        <View style={styles.redDotOutline} />
                      </View>
                      <View style={styles.locationRow}>
                        <Ionicons name="time-outline" size={14} color={colors.textTertiary} />
                        <Text style={styles.communityNameHorizontal} numberOfLines={1}> {formattedTime} · {item.community?.name || t('home.campus')}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              });
            })()}
          </View>
        </View>

        {/* Takvim Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>{t('home.calendar')}</Text>
          </View>
          <View style={styles.calendarContainer}>
            <Calendar
              firstDay={1}
              markedDates={markedDates}
              theme={{
                backgroundColor: colors.surface,
                calendarBackground: colors.surface,
                textSectionTitleColor: colors.textTertiary,
                selectedDayBackgroundColor: colors.primary,
                selectedDayTextColor: '#FFF',
                todayTextColor: colors.primary,
                dayTextColor: colors.text,
                textDisabledColor: colors.borderDark,
                dotColor: colors.primary,
                selectedDotColor: '#FFF',
                arrowColor: colors.text,
                monthTextColor: colors.text,
                textMonthFontWeight: '800',
                textDayFontWeight: '600',
                textDayHeaderFontWeight: '500',
                textDayFontSize: 14,
                textMonthFontSize: 16,
                textDayHeaderFontSize: 12,
              } as any}
            />
          </View>
        </View>
      </ScrollView>

      {/* Draggable Belek AI Bubble */}
      <DraggableAIFAB navigation={navigation} t={t} colors={colors} isDark={isDark} />
    </SafeAreaView>
  );
}

const DraggableAIFAB = ({ navigation, t, colors, isDark }: any) => {
  const pan = useRef(new Animated.ValueXY()).current;
  const [showSpeechBubble, setShowSpeechBubble] = useState(true);
  const styles = React.useMemo(() => getStyles(colors, isDark), [colors, isDark]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (e, gestureState) => {
        // Drag if moved more than 5px
        return Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5;
      },
      onPanResponderGrant: () => {
        pan.setOffset({
          x: (pan.x as any)._value,
          y: (pan.y as any)._value
        });
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: Animated.event(
        [null, { dx: pan.x, dy: pan.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: () => {
        pan.flattenOffset();
      }
    })
  ).current;

  return (
    <Animated.View
      style={[
        {
          transform: [{ translateX: pan.x }, { translateY: pan.y }],
          position: 'absolute',
          bottom: 24,
          right: 24,
          zIndex: 999,
          alignItems: 'flex-end', // Revert to flex-end so button stays at right: 24
        }
      ]}
      {...panResponder.panHandlers}
    >
      {showSpeechBubble && (
        <View style={styles.speechBubble}>
          <Text style={styles.speechText}>{t('home.aiGreeting')}</Text>
          <View style={styles.speechBubbleTriangle} />
        </View>
      )}
      <TouchableOpacity
        style={styles.aiCircle}
        activeOpacity={0.8}
        onPress={() => {
          navigation.navigate('AiChat');
        }}
      >
        <View style={styles.aiInnerCircle}>
          <Text style={styles.aiText}>BU</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const getStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background, // Light/Dark premium background
  },
  scrollContent: {
    paddingBottom: 40,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  headerLeftControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarFallback: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '800',
  },
  headerTextContainer: {
    justifyContent: 'center',
  },
  welcomeText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  userNameText: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
  },
  headerRightControls: {
    justifyContent: 'center',
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  notificationBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  notificationBadgeText: {
    display: 'none', // Sadece kırmızı nokta olarak göster.
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  seeAllText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  announcementCard: {
    width: width * 0.85,
    padding: 20,
    borderRadius: 20,
    marginRight: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  announcementIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  badgeContainer: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 14,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '800',
  },
  announcementTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 6,
  },
  announcementText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
    marginBottom: 16,
  },
  announcementDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  announcementDateText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },

  // Vertical Event Cards
  verticalEventCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    flexDirection: 'row',
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: isDark ? 0.3 : 0.04,
    shadowRadius: 10,
    elevation: 2,
    alignItems: 'center',
  },
  eventDateBox: {
    width: 56,
    height: 60,
    backgroundColor: colors.primary,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventMonthText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 11,
    fontWeight: '800',
  },
  eventDayText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '900',
  },
  verticalEventInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'space-between',
    height: 44,
  },
  eventTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  verticalEventTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
    flex: 1,
  },
  redDotOutline: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  communityNameHorizontal: {
    fontSize: 12,
    color: colors.textTertiary,
    fontWeight: '500',
  },
  emptyText: {
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  calendarContainer: {
    marginHorizontal: 20,
    backgroundColor: colors.surface,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: isDark ? 0.3 : 0.04,
    shadowRadius: 10,
    elevation: 2,
    padding: 10,
  },
  aiCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: isDark ? 0.4 : 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  aiInnerCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  speechBubble: {
    position: 'absolute',
    bottom: 76,
    right: -10, // Overhang right a bit
    backgroundColor: isDark ? '#2C2C2E' : '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: isDark ? 0.4 : 0.1,
    shadowRadius: 10,
    elevation: 8,
    width: 200,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
  },
  speechText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 18,
  },
  speechBubbleTriangle: {
    position: 'absolute',
    bottom: -10,
    right: 32, // Pin it directly above the center of the 64px button
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 12,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: isDark ? '#2C2C2E' : '#FFFFFF',
  }
});