import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Colors from '../theme/colors';
import { CommonStyles, Typography, Spacing, Radii, Shadows } from '../theme/commonStyles';
import { useTranslation } from 'react-i18next';

import { useTheme } from '../context/ThemeContext';

export default function SettingsScreen() {
    const navigation = useNavigation();
    const { t, i18n } = useTranslation();
    const { colors, themeType, setThemeType, isDark } = useTheme();
    const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);

    const styles = React.useMemo(() => getStyles(colors), [colors]);

    const toggleLanguage = () => {
        const newLang = i18n.language === 'tr' ? 'en' : 'tr';
        i18n.changeLanguage(newLang);
    };

    const toggleTheme = () => {
        const nextThemeMap: any = { system: 'light', light: 'dark', dark: 'system' };
        setThemeType(nextThemeMap[themeType]);
    };

    const getThemeText = () => {
        if (themeType === 'dark') return t('settings.themeDark', { defaultValue: 'Koyu' });
        if (themeType === 'light') return t('settings.themeLight', { defaultValue: 'Açık' });
        return t('settings.themeSystem', { defaultValue: 'Sistem' });
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={colors.background} />

            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="chevron-back" size={28} color={colors.primary} />
                    <Text style={styles.backText}>{t('common.back')}</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('settings.title')}</Text>
                <View style={{ width: 70 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                <View style={styles.section}>
                    <Text style={styles.sectionHeader}>{t('settings.preferences')}</Text>
                    <View style={styles.cardGroup}>

                        <View style={styles.menuItem}>
                            <View style={styles.menuLeft}>
                                <View style={[styles.menuIconCircle, { backgroundColor: colors.warning }]}>
                                    <Ionicons name="notifications-outline" size={18} color={'#FFF'} />
                                </View>
                                <Text style={styles.menuTitle}>{t('settings.notifications')}</Text>
                            </View>
                            <Switch
                                value={notificationsEnabled}
                                onValueChange={setNotificationsEnabled}
                                trackColor={{ false: colors.border, true: colors.primary }}
                                thumbColor={'#FFF'}
                            />
                        </View>

                        <TouchableOpacity
                            style={styles.menuItem}
                            activeOpacity={0.7}
                            onPress={toggleLanguage}
                        >
                            <View style={styles.menuLeft}>
                                <View style={[styles.menuIconCircle, { backgroundColor: colors.info }]}>
                                    <Ionicons name="globe-outline" size={18} color={'#FFF'} />
                                </View>
                                <Text style={styles.menuTitle}>{t('settings.language')}</Text>
                            </View>
                            <View style={styles.menuRight}>
                                <Text style={styles.menuValue}>
                                    {i18n.language === 'tr' ? t('settings.turkish') : t('settings.english')}
                                </Text>
                                <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.menuItem, { borderBottomWidth: 0 }]}
                            activeOpacity={0.7}
                            onPress={toggleTheme}
                        >
                            <View style={styles.menuLeft}>
                                <View style={[styles.menuIconCircle, { backgroundColor: colors.secondary }]}>
                                    <Ionicons name={isDark ? "moon-outline" : "sunny-outline"} size={18} color={'#FFF'} />
                                </View>
                                <Text style={styles.menuTitle}>{t('settings.themeLabel', { defaultValue: 'Tema' })}</Text>
                            </View>
                            <View style={styles.menuRight}>
                                <Text style={styles.menuValue}>
                                    {getThemeText()}
                                </Text>
                                <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
                            </View>
                        </TouchableOpacity>

                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionHeader}>{t('settings.about')}</Text>
                    <View style={styles.cardGroup}>

                        <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
                            <View style={styles.menuLeft}>
                                <View style={[styles.menuIconCircle, { backgroundColor: colors.textSecondary }]}>
                                    <Ionicons name="document-text-outline" size={18} color={'#FFF'} />
                                </View>
                                <Text style={styles.menuTitle}>{t('settings.terms')}</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.menuItem, { borderBottomWidth: 0 }]} activeOpacity={0.7}>
                            <View style={styles.menuLeft}>
                                <View style={[styles.menuIconCircle, { backgroundColor: colors.textSecondary }]}>
                                    <Ionicons name="shield-checkmark-outline" size={18} color={'#FFF'} />
                                </View>
                                <Text style={styles.menuTitle}>{t('settings.privacy')}</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
                        </TouchableOpacity>

                    </View>
                </View>

                <View style={styles.versionContainer}>
                    <Text style={styles.versionText}>Belek Topluluk Mobil</Text>
                    <Text style={styles.versionText}>Sürüm 1.0.0</Text>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

const getStyles = (colors: any) => StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.background },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.sm,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: colors.border,
        backgroundColor: colors.background,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        width: 70,
    },
    backText: {
        fontSize: 17,
        color: colors.primary,
        marginLeft: -4,
    },
    headerTitle: {
        fontSize: 17,
        fontWeight: '600',
        color: colors.text,
    },
    scrollContent: {
        padding: Spacing.lg,
        paddingBottom: Spacing.xxl,
    },
    section: {
        marginBottom: Spacing.xl,
    },
    sectionHeader: {
        fontSize: 13,
        fontWeight: '600',
        color: colors.textTertiary,
        marginLeft: Spacing.sm,
        marginBottom: Spacing.xs,
        letterSpacing: 0.5,
    },
    cardGroup: {
        backgroundColor: colors.surface,
        borderRadius: Radii.lg,
        ...Shadows.sm,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.md,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: colors.border,
    },
    menuLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    menuIconCircle: {
        width: 32,
        height: 32,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
    },
    menuTitle: {
        fontSize: 17,
        fontWeight: '500',
        color: colors.text,
    },
    menuRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    menuValue: {
        fontSize: 16,
        color: colors.textSecondary,
        marginRight: Spacing.xs,
    },
    versionContainer: {
        alignItems: 'center',
        marginTop: Spacing.lg,
        marginBottom: Spacing.xxl,
    },
    versionText: {
        fontSize: 13,
        color: colors.textTertiary,
        marginBottom: 4,
    }
});
