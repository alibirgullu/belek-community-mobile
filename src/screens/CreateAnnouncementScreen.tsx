import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    ActivityIndicator,
    Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import Colors from '../theme/colors';
import { Radii, Shadows, Spacing } from '../theme/commonStyles';
import api from '../services/api';

export default function CreateAnnouncementScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute<RouteProp<any, any>>();
    const { communityId, communityName } = route.params as { communityId: number, communityName?: string };

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        if (!title.trim() || !content.trim()) {
            Alert.alert('Eksik Bilgi', 'Lütfen başlık ve içerik alanlarını doldurun.');
            return;
        }

        setIsSaving(true);
        try {
            
            await api.post(`/communities/${communityId}/announcements`, {
                title,
                content,
                targetAudience: 'MembersOnly'
            });

            Alert.alert('Başarılı', 'Duyuru başarıyla oluşturuldu ve üyelere bildirildi.', [
                {
                    text: 'Tamam',
                    onPress: () => {
                        navigation.goBack();
                    }
                },
            ]);
        } catch (error: any) {
            console.log('Duyuru oluşturma hatası:', error.response?.data || error);
            Alert.alert('Hata', error.response?.data?.message || 'Duyuru paylaşılırken bir hata oluştu.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="chevron-back" size={28} color={Colors.primary} />
                    <Text style={styles.backText}>Geri</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Yeni Duyuru Paylaş</Text>
                <View style={{ width: 70 }} />
            </View>

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    <View style={styles.infoBox}>
                        <Ionicons name="information-circle" size={24} color={Colors.primary} style={{ marginRight: Spacing.sm }} />
                        <Text style={styles.infoText}>
                            Bu duyuru sadece <Text style={{ fontWeight: 'bold' }}>{communityName || 'topluluğunuzun'}</Text> üyelerine gönderilecektir. Genel tüm üniversiteye yapılacak duyurular SKS Admin Paneli aracılığıyla yapılır.
                        </Text>
                    </View>

                    <View style={styles.formSection}>
                        <Text style={styles.label}>Duyuru Başlığı *</Text>
                        <View style={styles.inputContainer}>
                            <Ionicons name="megaphone-outline" size={20} color={Colors.primary} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                value={title}
                                onChangeText={setTitle}
                                placeholder="Örn: Haftalık Toplantı İptali"
                                placeholderTextColor="#A0AEC0"
                                maxLength={100}
                            />
                        </View>

                        <Text style={styles.label}>İçerik *</Text>
                        <View style={[styles.inputContainer, styles.textAreaContainer]}>
                            <TextInput
                                style={styles.textArea}
                                value={content}
                                onChangeText={setContent}
                                placeholder="Duyurunuzun tüm detaylarını buraya yazabilirsiniz..."
                                placeholderTextColor="#A0AEC0"
                                multiline
                                textAlignVertical="top"
                            />
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
                        disabled={isSaving}
                        onPress={handleSave}
                        activeOpacity={0.8}
                    >
                        {isSaving ? (
                            <ActivityIndicator color="#FFF" />
                        ) : (
                            <Text style={styles.saveButtonText}>Duyuruyu Yayınla</Text>
                        )}
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FAFCFC',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.sm,
        backgroundColor: '#FAFCFC',
        zIndex: 10,
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
    scrollContent: {
        paddingBottom: Spacing.xl * 2,
    },
    infoBox: {
        flexDirection: 'row',
        backgroundColor: Colors.primary + '10', 
        padding: Spacing.md,
        marginHorizontal: Spacing.lg,
        borderRadius: Radii.lg,
        marginTop: Spacing.md,
        marginBottom: Spacing.lg,
        alignItems: 'center'
    },
    infoText: {
        flex: 1,
        color: Colors.textSecondary,
        fontSize: 13,
        lineHeight: 18,
    },
    formSection: {
        paddingHorizontal: Spacing.lg,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#0A2540',
        marginBottom: 8,
        marginLeft: 4,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderRadius: Radii.lg,
        paddingHorizontal: Spacing.md,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
        marginBottom: Spacing.md,
        ...Shadows.sm,
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        height: 55,
        fontSize: 16,
        color: '#0A2540',
    },
    textAreaContainer: {
        height: 180,
        alignItems: 'flex-start',
        paddingVertical: Spacing.sm,
    },
    textArea: {
        flex: 1,
        fontSize: 16,
        color: '#0A2540',
        width: '100%',
    },
    saveButton: {
        backgroundColor: Colors.primary,
        marginHorizontal: Spacing.lg,
        marginTop: Spacing.xl,
        height: 56,
        borderRadius: Radii.lg,
        justifyContent: 'center',
        alignItems: 'center',
        ...Shadows.md,
    },
    saveButtonDisabled: {
        opacity: 0.7,
    },
    saveButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700',
    },
});
