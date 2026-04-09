import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Image
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import Colors from '../theme/colors';
import { Radii, Shadows, Spacing } from '../theme/commonStyles';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

type TabType = 'Members' | 'Pending';

export default function CommunityAdminDashboardScreen() {
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const { user } = React.useContext(AuthContext);
    const navigation = useNavigation<any>();
    const route = useRoute<RouteProp<any, any>>();
    const { communityId, communityName } = route.params as { communityId: number, communityName: string };

    const [activeTab, setActiveTab] = useState<TabType>('Members');
    const [members, setMembers] = useState<any[]>([]);
    const [pendingMembers, setPendingMembers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useFocusEffect(
        React.useCallback(() => {
            fetchData();
        }, [communityId])
    );

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [membersRes, pendingRes] = await Promise.all([
                api.get(`/communities/${communityId}/members`),
                api.get(`/communities/${communityId}/members/pending`)
            ]);
            setMembers(membersRes.data);
            setPendingMembers(pendingRes.data);
        } catch (error) {
            console.log('Üyeler yüklenirken hata:', error);
            Alert.alert('Hata', 'Üye listesi alınamadı.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleApprove = async (platformUserId: number) => {
        try {
            await api.put(`/communities/${communityId}/members/${platformUserId}/approve`);
            Alert.alert('Başarılı', 'Üye onaylandı.');
            fetchData();
        } catch (error) {
            console.log('Onaylanırken hata:', error);
            Alert.alert('Hata', 'Onaylama işlemi başarısız.');
        }
    };

    const handleReject = async (platformUserId: number) => {
        try {
            await api.put(`/communities/${communityId}/members/${platformUserId}/reject`);
            Alert.alert('Başarılı', 'Üyelik isteği reddedildi.');
            fetchData();
        } catch (error) {
            console.log('Reddedilirken hata:', error);
            Alert.alert('Hata', 'Reddetme işlemi başarısız.');
        }
    };

    const handleRemoveMember = async (platformUserId: number, roleName: string) => {
        if (roleName === 'Admin' || roleName === 'Başkan') {
            Alert.alert('Uyarı', 'Kendinizi veya başka bir yöneticiyi bu ekrandan çıkaramazsınız.');
            return;
        }

        Alert.alert(
            'Üyeyi Çıkar',
            'Bu üyeyi topluluktan çıkarmak istediğinize emin misiniz?',
            [
                { text: 'Vazgeç', style: 'cancel' },
                {
                    text: 'Çıkar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await api.delete(`/communities/${communityId}/members/${platformUserId}`);
                            Alert.alert('Başarılı', 'Üye çıkarıldı.');
                            fetchData();
                        } catch (error) {
                            console.log('Çıkarılırken hata:', error);
                            Alert.alert('Hata', 'Çıkarma işlemi başarısız.');
                        }
                    }
                }
            ]
        );
    };

    const handleAssignRole = async (platformUserId: number, currentRole: string) => {
        const newRole = currentRole === 'Admin' ? 'Üye' : 'Admin';
        Alert.alert(
            'Rolü Değiştir',
            `Bu kullanıcının rolünü "${newRole}" yapmak istediğinize emin misiniz?`,
            [
                { text: 'Vazgeç', style: 'cancel' },
                {
                    text: 'Değiştir',
                    onPress: async () => {
                        try {
                            await api.put(`/communities/${communityId}/members/${platformUserId}/role/${newRole}`);
                            Alert.alert('Başarılı', 'Kullanıcı rolü güncellendi.');
                            fetchData();
                        } catch (error: any) {
                            console.log('Rol değişirken hata:', error);
                            Alert.alert('Hata', error.response?.data?.message || 'Rol değiştirme işlemi başarısız.');
                        }
                    }
                }
            ]
        );
    };

    const renderMember = ({ item }: { item: any }) => (
        <View style={styles.memberCard}>
            <View style={styles.memberInfo}>
                {item.profileImageUrl ? (
                    <Image source={{ uri: item.profileImageUrl }} style={styles.avatar} />
                ) : (
                    <View style={styles.avatarPlaceholder}>
                        <Text style={styles.avatarText}>{item.fullName?.[0] || 'U'}</Text>
                    </View>
                )}
                <View style={styles.memberTextContainer}>
                    <Text style={styles.memberName}>{item.fullName}</Text>
                    <Text style={styles.memberRole}>{item.roleName}</Text>
                </View>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {item.roleName !== 'Başkan' && item.userId !== (user as any)?.id && (
                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: item.roleName === 'Admin' ? Colors.secondary : Colors.primary, marginRight: 8 }]}
                        onPress={() => handleAssignRole(item.userId, item.roleName)}
                    >
                        <Text style={styles.actionButtonText}>
                            {item.roleName === 'Admin' ? t('adminDashboard.makeMember') : t('adminDashboard.makeAdmin')}
                        </Text>
                    </TouchableOpacity>
                )}
                {item.roleName !== 'Başkan' && item.roleName !== 'Admin' && item.userId !== (user as any)?.id && (
                    <TouchableOpacity
                        style={styles.actionButtonDestructive}
                        onPress={() => handleRemoveMember(item.userId, item.roleName)}
                    >
                        <Text style={styles.actionButtonTextDestructive}>{t('adminDashboard.remove')}</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );

    const renderPending = ({ item }: { item: any }) => (
        <View style={styles.memberCard}>
            <View style={styles.memberInfo}>
                <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarText}>{item.fullName?.[0] || 'U'}</Text>
                </View>
                <View style={styles.memberTextContainer}>
                    <Text style={styles.memberName}>{item.fullName}</Text>
                    <Text style={styles.memberRole}>Onay Bekliyor</Text>
                </View>
            </View>
            <View style={styles.actionsContainer}>
                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: Colors.success }]}
                    onPress={() => handleApprove(item.userId)}
                >
                    <Text style={styles.actionButtonText}>{t('adminDashboard.approve')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: Colors.error, marginLeft: 8 }]}
                    onPress={() => handleReject(item.userId)}
                >
                    <Text style={styles.actionButtonText}>{t('adminDashboard.reject')}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="chevron-back" size={28} color={Colors.primary} />
                    <Text style={styles.backText}>{t('common.back')}</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle} numberOfLines={1}>
                    {t('adminDashboard.title', { name: communityName })}
                </Text>
                <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => navigation.navigate('EditCommunity', { communityId })}
                >
                    <Ionicons name="settings-outline" size={24} color={Colors.primary} />
                </TouchableOpacity>
            </View>

            {/* Tabs */}
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'Members' && styles.activeTab]}
                    onPress={() => setActiveTab('Members')}
                >
                    <Text style={[styles.tabText, activeTab === 'Members' && styles.activeTabText]}>
                        {t('adminDashboard.members', { count: members.length })}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'Pending' && styles.activeTab]}
                    onPress={() => setActiveTab('Pending')}
                >
                    <Text style={[styles.tabText, activeTab === 'Pending' && styles.activeTabText]}>
                        {t('adminDashboard.pending', { count: pendingMembers.length })}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Content */}
            {isLoading ? (
                <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
            ) : (
                <View style={{ flex: 1 }}>
                    <FlatList
                        data={activeTab === 'Members' ? members : pendingMembers}
                        keyExtractor={(item) => item.userId.toString()}
                        renderItem={activeTab === 'Members' ? renderMember : renderPending}
                        contentContainerStyle={styles.listContent}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyText}>{t('adminDashboard.emptyMembers')}</Text>
                            </View>
                        }
                    />
                </View>
            )}

            {/* Footer Buttons */}
            <View style={[styles.footerContainer, { paddingBottom: Math.max(insets.bottom, 20) + 70 }]}>
                <View style={styles.footerRow}>
                    <TouchableOpacity
                        style={[styles.actionSquareButton, { marginRight: Spacing.sm }]}
                        onPress={() => {
                            navigation.navigate('CreateAnnouncement', { communityId, communityName });
                        }}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="megaphone-outline" size={24} color="#FFF" style={{ marginBottom: 4 }} />
                        <Text style={styles.actionSquareText}>{t('adminDashboard.shareAnnouncement')}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionSquareButton, { marginLeft: Spacing.sm }]}
                        onPress={() => {
                            navigation.navigate('CreateEvent', { communityId, communityName });
                        }}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="calendar-outline" size={24} color="#FFF" style={{ marginBottom: 4 }} />
                        <Text style={styles.actionSquareText}>{t('adminDashboard.createEvent')}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FAFCFC' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.md,
        backgroundColor: '#FAFCFC',
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        width: 70,
    },
    backText: {
        fontSize: 17,
        color: Colors.primary,
        marginLeft: -4,
    },
    headerTitle: {
        flex: 1,
        fontSize: 17,
        fontWeight: '700',
        color: '#0A2540',
        textAlign: 'center',
    },
    editButton: {
        width: 70,
        alignItems: 'flex-end',
        paddingRight: 4,
    },
    tabContainer: {
        flexDirection: 'row',
        paddingHorizontal: Spacing.lg,
        marginBottom: Spacing.md,
    },
    tab: {
        flex: 1,
        paddingVertical: Spacing.sm,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
        alignItems: 'center',
    },
    activeTab: {
        borderBottomColor: Colors.primary,
    },
    tabText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#8B95A5',
    },
    activeTabText: {
        color: Colors.primary,
    },
    listContent: {
        paddingHorizontal: Spacing.lg,
        paddingBottom: 20,
    },
    memberCard: {
        backgroundColor: '#FFF',
        padding: Spacing.md,
        borderRadius: Radii.lg,
        marginBottom: Spacing.sm,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        ...Shadows.sm,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.02)',
    },
    memberInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        marginRight: Spacing.md,
    },
    avatarPlaceholder: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: Colors.secondary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
    },
    avatarText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '700',
    },
    memberTextContainer: {
        flex: 1,
    },
    memberName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#0A2540',
        marginBottom: 2,
    },
    memberRole: {
        fontSize: 13,
        color: '#8B95A5',
    },
    actionButtonDestructive: {
        backgroundColor: Colors.error + '1A',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: Radii.md,
    },
    actionButtonTextDestructive: {
        color: Colors.error,
        fontWeight: '700',
        fontSize: 13,
    },
    actionsContainer: {
        flexDirection: 'row',
    },
    actionButton: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: Radii.md,
    },
    actionButtonText: {
        color: '#FFF',
        fontWeight: '700',
        fontSize: 13,
    },
    emptyContainer: {
        paddingVertical: 40,
        alignItems: 'center',
    },
    emptyText: {
        color: '#8B95A5',
        fontSize: 15,
    },
    footerContainer: {
        padding: Spacing.lg,
        backgroundColor: '#FAFCFC',
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
    },
    footerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    actionSquareButton: {
        flex: 1,
        backgroundColor: Colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: Radii.lg,
        ...Shadows.md,
    },
    actionSquareText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '700',
    }
});
