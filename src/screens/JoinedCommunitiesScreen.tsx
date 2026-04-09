import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Colors from '../theme/colors';
import { CommonStyles, Typography, Spacing, Radii, Shadows } from '../theme/commonStyles';
import api from '../services/api';
import { Community } from '../types';
import { useTranslation } from 'react-i18next';

export default function JoinedCommunitiesScreen() {
    const { t } = useTranslation();
    const navigation = useNavigation<any>();
    const [communities, setCommunities] = useState<Community[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchJoinedCommunities();
    }, []);

    const fetchJoinedCommunities = async () => {
        try {
            
            const res = await api.get('/communities');
            setCommunities(res.data);
        } catch (error) {
            console.log('Topluluklar yüklenirken hata', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="chevron-back" size={28} color={Colors.primary} />
                    <Text style={styles.backText}>{t('common.back')}</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('joinedCommunities.title')}</Text>
                <View style={{ width: 70 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {isLoading ? (
                    <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
                ) : communities.length === 0 ? (
                    <EmptyState t={t} />
                ) : (
                    communities.map((item) => (
                        <TouchableOpacity
                            key={item.id}
                            style={styles.communityCard}
                            activeOpacity={0.8}
                            onPress={() => navigation.navigate('Topluluk', { screen: 'CommunityDetail', params: { communityId: item.id, communityName: item.name } })}
                        >
                            <View style={styles.cardHeader}>
                                <View style={styles.imagePlaceholder}>
                                    <Text style={styles.imagePlaceholderText}>{item.name.charAt(0)}</Text>
                                </View>
                                <View style={styles.cardInfo}>
                                    <Text style={styles.communityName} numberOfLines={1}>{item.name}</Text>
                                    <Text style={styles.communityDesc} numberOfLines={2}>{item.description}</Text>
                                </View>
                            </View>
                            <View style={styles.cardFooter}>
                                <View style={styles.tag}>
                                    <Ionicons name="people" size={12} color={Colors.primary} />
                                    <Text style={styles.tagText}>{t('joinedCommunities.member', { count: item.memberCount })}</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color={Colors.textTertiary} />
                            </View>
                        </TouchableOpacity>
                    ))
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const EmptyState = ({ t }: { t: any }) => (
    <View style={styles.emptyContainer}>
        <Ionicons name="planet-outline" size={64} color={Colors.borderDark} />
        <Text style={styles.emptyTitle}>{t('joinedCommunities.emptyTitle')}</Text>
        <Text style={styles.emptyDesc}>{t('joinedCommunities.emptyDesc')}</Text>
    </View>
);

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: Colors.background },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.sm,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: Colors.border,
        backgroundColor: Colors.background,
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
        fontSize: 17,
        fontWeight: '600',
        color: Colors.text,
    },
    scrollContent: {
        padding: Spacing.lg,
        paddingBottom: Spacing.xxl,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 100,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors.textSecondary,
        marginTop: Spacing.lg,
        textAlign: 'center',
    },
    emptyDesc: {
        fontSize: 14,
        color: Colors.textTertiary,
        marginTop: Spacing.xs,
        textAlign: 'center',
        paddingHorizontal: Spacing.xl,
    },
    communityCard: {
        backgroundColor: Colors.surface,
        borderRadius: Radii.xl,
        padding: Spacing.md,
        marginBottom: Spacing.md,
        ...Shadows.sm,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    imagePlaceholder: {
        width: 60,
        height: 60,
        borderRadius: Radii.md,
        backgroundColor: Colors.secondaryLight,
        justifyContent: 'center',
        alignItems: 'center',
    },
    imagePlaceholderText: {
        fontSize: 24,
        fontWeight: '800',
        color: '#rgba(0,0,0,0.1)',
    },
    cardInfo: {
        flex: 1,
        marginLeft: Spacing.md,
    },
    communityName: {
        fontSize: 17,
        fontWeight: '700',
        color: Colors.text,
        marginBottom: 4,
    },
    communityDesc: {
        fontSize: 13,
        color: Colors.textSecondary,
        lineHeight: 18,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: Spacing.md,
        paddingTop: Spacing.sm,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: Colors.border,
    },
    tag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.primaryLight + '20',
        paddingHorizontal: Spacing.sm,
        paddingVertical: 4,
        borderRadius: Radii.sm,
    },
    tagText: {
        fontSize: 12,
        fontWeight: '600',
        color: Colors.primary,
        marginLeft: 4,
    }
});
