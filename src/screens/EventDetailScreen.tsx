import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, StatusBar, Dimensions, ActivityIndicator, Alert, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import ConfettiCannon from 'react-native-confetti-cannon';
import api, { eventService } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { Spacing, Shadows, Radii } from '../theme/commonStyles';
import { Event } from '../types';

const { width } = Dimensions.get('window');


interface EventDetailRouteParams {
    event: Event;
}

export default function EventDetailScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute();
    const { event } = route.params as EventDetailRouteParams;
    const { colors, isDark } = useTheme();

    const styles = React.useMemo(() => getStyles(colors, isDark), [colors, isDark]);

    const [isParticipating, setIsParticipating] = React.useState(false);
    const [isCommunityMember, setIsCommunityMember] = React.useState(false);
    const [isCommunityAdmin, setIsCommunityAdmin] = React.useState(false);
    const [isLoadingParticipation, setIsLoadingParticipation] = React.useState(true);
    const [isToggling, setIsToggling] = React.useState(false);
    const [showConfetti, setShowConfetti] = React.useState(false);

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

    const [timeLeft, setTimeLeft] = React.useState({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: false });

    React.useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date().getTime();
            const distance = new Date(event.startDate).getTime() - now;

            if (distance < 0) {
                clearInterval(interval);
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true });
            } else {
                setTimeLeft({
                    days: Math.floor(distance / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                    minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
                    seconds: Math.floor((distance % (1000 * 60)) / 1000),
                    isPast: false
                });
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [event.startDate]);

    React.useEffect(() => {
        const checkParticipation = async () => {
            try {
                const response = await api.get('/users/me');
                const upcomingEvents = response.data.upcomingEvents || [];
                const myCommunities = response.data.myCommunities || [];

                const isGoing = upcomingEvents.some((e: any) => e.eventId === event.id);
                const isMember = myCommunities.some((c: any) => c.communityId === event.communityId || c.communityName === event.community?.name);
                const isAdmin = myCommunities.some((c: any) => (c.communityId === event.communityId || c.communityName === event.community?.name) && c.roleName === 'Admin');

                setIsParticipating(isGoing);
                setIsCommunityMember(isMember);
                setIsCommunityAdmin(isAdmin);
            } catch (error) {
                console.log('Katılım durumu kontrol edilemedi', error);
            } finally {
                setIsLoadingParticipation(false);
            }
        };

        const unsubscribe = navigation.addListener('focus', () => {
            checkParticipation();
        });

        checkParticipation();

        return unsubscribe;
    }, [event.id, navigation]);

    const handleCancelEvent = () => {
        Alert.alert(
            'Etkinliği İptal Et',
            'Bu etkinliği iptal etmek istediğinize emin misiniz? Tüm katılımcılara e-posta gönderilecektir. Bu işlem geri alınamaz.',
            [
                { text: 'Vazgeç', style: 'cancel' },
                {
                    text: 'Evet, İptal Et',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await eventService.cancelEvent(event.id);
                            Alert.alert('Başarılı', 'Etkinlik iptal edildi.', [
                                { text: 'Tamam', onPress: () => navigation.goBack() }
                            ]);
                        } catch (error) {
                            Alert.alert('Hata', 'İptal işlemi başarısız oldu.');
                        }
                    }
                }
            ]
        );
    };

    const handleToggleParticipation = async () => {
        setIsToggling(true);
        try {
            await api.post(`/events/${event.id}/participate`);
            
            if (!isParticipating) {
                // Katıl denildiği an konfeti patlat
                setShowConfetti(true);
                setTimeout(() => setShowConfetti(false), 5000); // 5 saniye sonra ekrandan kaldır
            }

            setIsParticipating(!isParticipating);
        } catch (error) {
            console.log('Katılım durumu değiştirilemedi', error);
            alert('İşlem sırasında bir hata oluştu.');
        } finally {
            setIsToggling(false);
        }
    };

    const dateObj = new Date(event.startDate);
    const formattedDate = dateObj.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
    const formattedTime = dateObj.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            <Animated.ScrollView
                showsVerticalScrollIndicator={false}
                bounces={true}
                scrollEventThrottle={16}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: true }
                )}
            >
                {/* Poster Image Section */}
                <View style={[styles.posterContainer, { overflow: 'hidden' }]}>
                    <Animated.View style={[StyleSheet.absoluteFillObject, { transform: [{ scale: headerScale }, { translateY: headerTranslateY }] }]}>
                        {event.posterUrl ? (
                            <Image
                                source={{ uri: event.posterUrl }}
                                style={[styles.posterImage, { height: '100%', width: '100%' }]}
                                resizeMode="cover"
                            />
                        ) : (
                            <View style={[styles.posterImage, styles.placeholderPoster, { height: '100%', width: '100%' }]}>
                                <Ionicons name="image-outline" size={60} color="rgba(255,255,255,0.5)" />
                            </View>
                        )}
                    </Animated.View>

                    <LinearGradient
                        colors={['rgba(0,0,0,0.6)', 'transparent', isDark ? colors.background : 'rgba(0,0,0,0.8)']}
                        style={styles.posterGradient}
                    />

                    <SafeAreaView edges={['top']} style={styles.headerControls}>
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => navigation.goBack()}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="chevron-back" size={24} color="#FFF" />
                        </TouchableOpacity>

                        {isCommunityAdmin && (
                            <View style={styles.adminActionsRow}>
                                <TouchableOpacity
                                    style={styles.adminActionButton}
                                    onPress={() => navigation.navigate('EditEvent', { event })}
                                >
                                    <Ionicons name="pencil" size={20} color="#FFF" />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.adminActionButton, { backgroundColor: 'rgba(255,59,48,0.8)' }]}
                                    onPress={handleCancelEvent}
                                >
                                    <Ionicons name="trash" size={20} color="#FFF" />
                                </TouchableOpacity>
                            </View>
                        )}
                    </SafeAreaView>
                </View>

                {/* Content Section */}
                <View style={styles.contentContainer}>
                    <View style={styles.titleSection}>
                        <Text style={styles.title}>{event.title}</Text>
                        <View style={styles.communityBadge}>
                            <Text style={styles.communityBadgeText}>{event.community?.name || (event as any).communityName || 'Kampüs'}</Text>
                        </View>
                    </View>

                    {/* Info Cards Row */}
                    <View style={styles.infoCardsRow}>
                        <View style={styles.infoCard}>
                            <View style={[styles.iconWrap, { backgroundColor: 'rgba(255, 30, 30, 0.1)' }]}>
                                <Ionicons name="calendar" size={20} color="#FF1E1E" />
                            </View>
                            <View>
                                <Text style={styles.infoCardLabel}>Tarih</Text>
                                <Text style={styles.infoCardValue}>{formattedDate}</Text>
                            </View>
                        </View>

                        <View style={styles.infoCard}>
                            <View style={[styles.iconWrap, { backgroundColor: 'rgba(52, 199, 89, 0.1)' }]}>
                                <Ionicons name="time" size={20} color="#34C759" />
                            </View>
                            <View>
                                <Text style={styles.infoCardLabel}>Saat</Text>
                                <Text style={styles.infoCardValue}>{formattedTime}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Location Card */}
                    <View style={styles.locationCard}>
                        <View style={[styles.iconWrap, { backgroundColor: 'rgba(10, 37, 64, 0.1)' }]}>
                            <Ionicons name="location" size={20} color="#0A2540" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.infoCardLabel}>Konum</Text>
                            <Text style={styles.infoCardValue} numberOfLines={2}>
                                {event.location || 'Konum belirtilmemiş'}
                            </Text>
                        </View>
                    </View>

                    {/* Countdown Timer */}
                    {!timeLeft.isPast && (
                        <View style={styles.countdownCard}>
                            <View style={styles.countdownHeaderRow}>
                                <Ionicons name="timer-outline" size={20} color={colors.primary} />
                                <Text style={styles.countdownTitle}>Başlamasına Kalan Süre</Text>
                            </View>
                            <View style={styles.countdownGrid}>
                                <View style={styles.countdownBox}>
                                    <Text style={styles.countdownNum}>{timeLeft.days.toString().padStart(2, '0')}</Text>
                                    <Text style={styles.countdownLabel}>GÜN</Text>
                                </View>
                                <Text style={styles.countdownSeparator}>:</Text>
                                <View style={styles.countdownBox}>
                                    <Text style={styles.countdownNum}>{timeLeft.hours.toString().padStart(2, '0')}</Text>
                                    <Text style={styles.countdownLabel}>SAAT</Text>
                                </View>
                                <Text style={styles.countdownSeparator}>:</Text>
                                <View style={styles.countdownBox}>
                                    <Text style={styles.countdownNum}>{timeLeft.minutes.toString().padStart(2, '0')}</Text>
                                    <Text style={styles.countdownLabel}>DAK</Text>
                                </View>
                                <Text style={styles.countdownSeparator}>:</Text>
                                <View style={styles.countdownBox}>
                                    <Text style={styles.countdownNum}>{timeLeft.seconds.toString().padStart(2, '0')}</Text>
                                    <Text style={styles.countdownLabel}>SAN</Text>
                                </View>
                            </View>
                        </View>
                    )}

                    {/* Description */}
                    <View style={styles.descriptionSection}>
                        <Text style={styles.sectionTitle}>Hakkında</Text>
                        <Text style={styles.descriptionText}>
                            {event.description || 'Bu etkinlik için herhangi bir açıklama girilmemiş.'}
                        </Text>
                    </View>

                    <View style={styles.bottomSpacer} />
                </View>
            </Animated.ScrollView>

            {/* Sticky Bottom Action Bar */}
            <View style={styles.bottomActionBar}>
                {isLoadingParticipation ? (
                    <ActivityIndicator size="small" color={colors.primary} />
                ) : isCommunityMember ? (
                    <TouchableOpacity
                        style={[
                            styles.joinButton,
                            isParticipating ? styles.leaveButton : {}
                        ]}
                        activeOpacity={0.8}
                        onPress={handleToggleParticipation}
                        disabled={isToggling}
                    >
                        <Text style={[
                            styles.joinButtonText,
                            isParticipating ? styles.leaveButtonText : {}
                        ]}>
                            {isToggling
                                ? 'İşleniyor...'
                                : (isParticipating ? 'Katılımdan Vazgeç' : 'Etkinliğe Katıl')}
                        </Text>
                    </TouchableOpacity>
                ) : (
                    <View style={styles.nonMemberWarning}>
                        <Ionicons name="lock-closed" size={20} color={colors.textTertiary} style={{ marginRight: 8 }} />
                        <Text style={styles.nonMemberText}>Etkinliğe katılmak için önce topluluğa üye olmalısınız.</Text>
                    </View>
                )}
            </View>

            {/* Confetti Explosion Layer */}
            {showConfetti && (
                <ConfettiCannon
                    count={200}
                    origin={{x: width / 2, y: -20}}
                    autoStart={true}
                    fadeOut={true}
                    fallSpeed={3000}
                />
            )}
        </View>
    );
}

const getStyles = (colors: any, isDark: boolean) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    posterContainer: {
        width: '100%',
        height: width * 0.75,
        position: 'relative',
    },
    posterImage: {
        width: '100%',
        height: '100%',
    },
    placeholderPoster: {
        backgroundColor: '#A6B3A4',
        justifyContent: 'center',
        alignItems: 'center',
    },
    posterGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'space-between',
    },
    headerControls: {
        position: 'absolute',
        top: 50,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.lg,
        paddingTop: Spacing.sm,
        zIndex: 10,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    adminActionsRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    adminActionButton: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: Spacing.sm,
    },
    contentContainer: {
        flex: 1,
        backgroundColor: colors.background,
        marginTop: -40,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        paddingHorizontal: Spacing.lg,
        paddingTop: 32,
        minHeight: 500,
    },
    titleSection: {
        marginBottom: Spacing.xl,
    },
    title: {
        fontSize: 24,
        fontWeight: '900',
        color: colors.text,
        marginBottom: Spacing.sm,
    },
    communityBadge: {
        alignSelf: 'flex-start',
        backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(10, 37, 64, 0.05)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    communityBadgeText: {
        fontSize: 13,
        fontWeight: '700',
        color: isDark ? '#FFF' : '#0A2540',
    },
    infoCardsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: Spacing.lg,
    },
    infoCard: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        padding: Spacing.md,
        borderRadius: Radii.lg,
        marginRight: Spacing.sm,
        ...Shadows.sm,
    },
    iconWrap: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    infoCardLabel: {
        fontSize: 11,
        color: colors.textTertiary,
        fontWeight: '600',
        marginBottom: 2,
        textTransform: 'uppercase',
    },
    infoCardValue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: colors.text,
    },
    locationCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        padding: Spacing.md,
        borderRadius: Radii.lg,
        marginBottom: Spacing.xl,
        ...Shadows.sm,
    },
    countdownCard: {
        backgroundColor: colors.surface,
        padding: Spacing.md,
        borderRadius: Radii.lg,
        marginBottom: Spacing.xl,
        ...Shadows.sm,
        borderWidth: 1,
        borderColor: colors.border, // Subtle primary border
    },
    countdownHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.md,
        justifyContent: 'center',
    },
    countdownTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.text,
        marginLeft: 6,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    countdownGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.sm,
    },
    countdownBox: {
        flex: 1,
        backgroundColor: colors.inputBackground,
        paddingVertical: 10,
        borderRadius: Radii.md,
        alignItems: 'center',
    },
    countdownNum: {
        fontSize: 22,
        fontWeight: '900',
        color: colors.primary,
        marginBottom: 2,
    },
    countdownLabel: {
        fontSize: 10,
        fontWeight: '800',
        color: colors.textTertiary,
        letterSpacing: 1,
    },
    countdownSeparator: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.textTertiary,
        marginHorizontal: 8,
        paddingBottom: 15,
    },
    descriptionSection: {
        marginBottom: Spacing.xl,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: colors.text,
        marginBottom: Spacing.md,
    },
    descriptionText: {
        fontSize: 15,
        lineHeight: 24,
        color: colors.textSecondary,
        fontWeight: '500',
    },
    bottomSpacer: {
        height: 140, // Increased to ensure content clears the fixed bottom bar
    },
    bottomActionBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: Spacing.lg,
        paddingTop: Spacing.md,
        paddingBottom: Spacing.xl + (StatusBar.currentHeight || 20),
        backgroundColor: isDark ? 'rgba(28,28,30,0.95)' : 'rgba(255, 255, 255, 0.95)',
        borderTopWidth: 1,
        borderTopColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
        ...Shadows.lg, // Stronger shadow so it pops above content
    },
    joinButton: {
        width: '100%',
        height: 56,
        borderRadius: Radii.round,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        ...Shadows.glow(colors.primaryDark),
    },
    joinButtonText: {
        fontSize: 18,
        fontWeight: '800',
        color: '#FFF',
        letterSpacing: 0.5,
    },
    leaveButton: {
        backgroundColor: colors.surface,
        borderWidth: 2,
        borderColor: colors.border,
        shadowOpacity: 0,
    },
    leaveButtonText: {
        color: colors.textTertiary,
    },
    nonMemberWarning: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.surface,
        padding: Spacing.md,
        borderRadius: Radii.lg,
        borderWidth: 1,
        borderColor: colors.border,
    },
    nonMemberText: {
        fontSize: 13,
        fontWeight: '600',
        color: colors.textTertiary,
        flex: 1,
    }
});
