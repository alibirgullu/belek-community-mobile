import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Image,
    RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../navigation/ProfileStack';
import Colors from '../theme/colors';
import { Radii, Shadows, Spacing } from '../theme/commonStyles';
import api from '../services/api';

export default function AdminCommunitiesScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();
    const [adminCommunities, setAdminCommunities] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchMyCommunities();
    }, []);

    const fetchMyCommunities = async () => {
        try {
            const response = await api.get('/users/me');
            if (response.data && response.data.myCommunities) {
                const managed = response.data.myCommunities.filter((c: any) => {
                    if (!c.roleName) return false;
                    const roleLower = c.roleName.toLowerCase();
                    return roleLower.includes('admin') || roleLower.includes('başkan') || roleLower.includes('yönetici');
                });
                setAdminCommunities(managed);
            }
        } catch (error) {
            console.log('Topluluklar çekilirken hata:', error);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchMyCommunities();
    };

    const renderCommunityItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.card}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('CommunityAdminDashboard', {
                communityId: item.communityId,
                communityName: item.communityName
            })}
        >
            <View style={styles.contentRow}>
                <View style={styles.imageContainer}>
                    {item.logoUrl ? (
                        <Image source={{ uri: item.logoUrl }} style={styles.logo} />
                    ) : (
                        <Ionicons name="people" size={24} color={Colors.textLight} />
                    )}
                </View>
                <View style={styles.textContainer}>
                    <Text style={styles.nameText} numberOfLines={1}>{item.communityName}</Text>
                    <Text style={styles.roleText}>{item.roleName} • {item.status}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#8B95A5" />
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="chevron-back" size={28} color={Colors.primary} />
                    <Text style={styles.backText}>Geri</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Yönetilen Topluluklar</Text>
                <View style={{ width: 70 }} />
            </View>

            {isLoading ? (
                <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
            ) : (
                <FlatList
                    data={adminCommunities}
                    keyExtractor={(item) => item.communityId.toString()}
                    renderItem={renderCommunityItem}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="shield-checkmark" size={60} color="#D1D5DB" />
                            <Text style={styles.emptyText}>Henüz yönettiğiniz bir topluluk yok.</Text>
                        </View>
                    }
                />
            )}
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
        paddingVertical: Spacing.sm,
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
        fontSize: 17,
        fontWeight: '700',
        color: '#0A2540',
    },
    listContent: {
        padding: Spacing.lg,
    },
    card: {
        backgroundColor: '#FFF',
        padding: Spacing.md,
        borderRadius: Radii.lg,
        marginBottom: Spacing.md,
        ...Shadows.sm,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.02)',
    },
    contentRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    imageContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: Colors.secondary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
        ...Shadows.sm,
    },
    logo: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    textContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    nameText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#0A2540',
        marginBottom: 4,
    },
    roleText: {
        fontSize: 13,
        color: Colors.primary,
        fontWeight: '600',
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 60,
    },
    emptyText: {
        marginTop: Spacing.md,
        fontSize: 16,
        color: '#8B95A5',
        textAlign: 'center',
    }
});
