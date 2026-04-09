import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    Platform,
    Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { notificationService } from '../services/api';
import { Notification } from '../types';
import { LinearGradient } from 'expo-linear-gradient';
import { Swipeable } from 'react-native-gesture-handler';
import Colors from '../theme/colors';
import { Spacing, Typography, Shadows, Radii } from '../theme/commonStyles';

export default function NotificationsScreen() {
    const navigation = useNavigation<any>();
    const { t } = useTranslation();

    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const response = await notificationService.getMyNotifications();
            setNotifications(response.data);
        } catch (error) {
            console.error('Bildirimler çekilemedi:', error);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    const handleRefresh = () => {
        setIsRefreshing(true);
        fetchNotifications();
    };

    const handleMarkAsRead = async (id: number) => {
        try {
            
            setNotifications(prev =>
                prev.map(notif => (notif.id === id ? { ...notif, isRead: true } : notif))
            );
            
            await notificationService.markAsRead(id);
        } catch (error) {
            console.error('Bildirim okundu işaretlenemedi:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
            await notificationService.markAllAsRead();
        } catch (error) {
            console.error('Tümü okundu işaretlenemedi:', error);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            // Optimistic UI updates
            setNotifications(prev => prev.filter(n => n.id !== id));
            await notificationService.deleteNotification(id);
        } catch (error) {
            console.error('Bildirim silinemedi:', error);
            // Re-fetch or revert in a robust app if it fails.
            fetchNotifications(); 
        }
    };

    const handleClearAll = () => {
        Alert.alert(
            "Bildirimleri Sil",
            "Tüm bildirimlerini silmek istediğine emin misin? Bu işlem geri alınamaz.",
            [
                { text: "İptal", style: "cancel" },
                { 
                    text: "Sil", 
                    style: "destructive", 
                    onPress: async () => {
                        try {
                            setNotifications([]);
                            await notificationService.clearAll();
                        } catch (error) {
                            console.error('Bildirimler silinemedi:', error);
                        }
                    }
                }
            ]
        );
    };

    const getIconForType = (type?: string) => {
        switch (type) {
            case 'Event':
                return { name: 'calendar', color: '#3A86FF', bg: 'rgba(58, 134, 255, 0.15)' };
            case 'CommunityAnnouncement':
                return { name: 'megaphone', color: '#FFBE0B', bg: 'rgba(255, 190, 11, 0.15)' };
            case 'System':
                return { name: 'information-circle', color: '#E53E3E', bg: 'rgba(229, 62, 62, 0.15)' };
            default:
                return { name: 'notifications', color: '#8B95A5', bg: 'rgba(139, 149, 165, 0.15)' };
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.round(diffMs / 60000);
        const diffHours = Math.round(diffMs / 3600000);
        const diffDays = Math.round(diffMs / 86400000);

        if (diffMins < 60) return `${diffMins} dk önce`;
        if (diffHours < 24) return `${diffHours} saat önce`;
        if (diffDays < 7) return `${diffDays} gün önce`;

        return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
    };

    const renderRightActions = (id: number) => {
        return (
            <TouchableOpacity 
                style={styles.deleteAction} 
                onPress={() => handleDelete(id)}
                activeOpacity={0.8}
            >
                <Ionicons name="trash-outline" size={24} color="#FFF" />
            </TouchableOpacity>
        );
    };

    const renderNotificationItem = ({ item }: { item: Notification }) => {
        const iconData = getIconForType(item.type);
        const isUnread = !item.isRead;

        return (
            <Swipeable
                renderRightActions={() => renderRightActions(item.id)}
                overshootRight={false}
                containerStyle={{ overflow: 'visible' }}
            >
                <TouchableOpacity
                    style={[styles.notificationCard, isUnread && styles.unreadCard]}
                    activeOpacity={0.8}
                    onPress={() => isUnread && handleMarkAsRead(item.id)}
                >
                    <View style={styles.contentRow}>
                        <View style={[styles.iconContainer, { backgroundColor: iconData.bg }]}>
                            <Ionicons name={iconData.name as any} size={22} color={iconData.color} />
                        </View>
                        <View style={styles.textContainer}>
                            <Text style={[styles.title, isUnread && styles.unreadTitle]}>{item.title}</Text>
                            <Text style={styles.message}>{item.message}</Text>
                            <Text style={styles.time}>{formatDate(item.createdAt)}</Text>
                        </View>
                        {isUnread && <View style={styles.unreadDot} />}
                    </View>
                </TouchableOpacity>
            </Swipeable>
        );
    };

    if (isLoading) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </SafeAreaView>
        );
    }

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <LinearGradient colors={['#FAFCFC', '#F3F6F8']} style={StyleSheet.absoluteFill} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={26} color="#0A2540" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('settings.notifications')}</Text>
                
                <View style={styles.headerRightControls}>
                    {unreadCount > 0 && (
                        <TouchableOpacity onPress={handleMarkAllAsRead} style={styles.iconButton}>
                            <Ionicons name="checkmark-done-outline" size={24} color={Colors.primary} />
                        </TouchableOpacity>
                    )}
                    
                    {notifications.length > 0 && (
                        <TouchableOpacity onPress={handleClearAll} style={[styles.iconButton, { marginLeft: 12 }]}>
                            <Ionicons name="trash-outline" size={22} color="#E53E3E" />
                        </TouchableOpacity>
                    )}
                    
                    {notifications.length === 0 && <View style={{ width: 40 }} />}
                </View>
            </View>

            {/* List */}
            <FlatList
                data={notifications}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderNotificationItem}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor={Colors.primary} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="notifications-off-outline" size={64} color="#D1D8E0" />
                        <Text style={styles.emptyTitle}>Henüz bildirim yok</Text>
                        <Text style={styles.emptySubtitle}>Buralar biraz sessiz. Yeni bir gelişme olduğunda sana haber vereceğiz.</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FAFCFC',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FAFCFC',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        backgroundColor: '#FAFCFC',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
        zIndex: 10,
    },
    backButton: {
        padding: Spacing.xs,
        marginLeft: -Spacing.xs,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#0A2540',
        letterSpacing: 0.2,
    },
    headerRightControls: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconButton: {
        width: 40,
        height: 40,
        backgroundColor: Colors.primary + '10',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        padding: Spacing.md,
        paddingBottom: Spacing.xxl,
    },
    notificationCard: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: Spacing.md,
        marginBottom: Spacing.md,
        ...Shadows.sm,
        borderLeftWidth: 4,
        borderLeftColor: 'transparent',
    },
    unreadCard: {
        backgroundColor: '#FDFEFE',
        borderLeftColor: Colors.primary,
        ...Shadows.md,
    },
    contentRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: '#4A5568',
        marginBottom: 4,
    },
    unreadTitle: {
        fontWeight: '700',
        color: '#0A2540',
    },
    message: {
        fontSize: 14,
        color: '#718096',
        lineHeight: 20,
        marginBottom: 8,
    },
    time: {
        fontSize: 12,
        color: '#A0AEC0',
        fontWeight: '500',
    },
    unreadDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: Colors.primary,
        marginLeft: Spacing.sm,
    },
    deleteAction: {
        backgroundColor: '#E53E3E',
        justifyContent: 'center',
        alignItems: 'center',
        width: 80,
        marginBottom: Spacing.md,
        borderRadius: 16,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 100,
        paddingHorizontal: Spacing.xl,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#4A5568',
        marginTop: Spacing.lg,
        marginBottom: Spacing.sm,
    },
    emptySubtitle: {
        fontSize: 15,
        color: '#A0AEC0',
        textAlign: 'center',
        lineHeight: 22,
    }
});
