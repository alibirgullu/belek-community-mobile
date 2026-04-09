import React, { useState, useEffect } from 'react';
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
    Alert,
    Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import Colors from '../theme/colors';
import { Radii, Shadows, Spacing } from '../theme/commonStyles';
import api from '../services/api';

export default function EditCommunityScreen() {
    const navigation = useNavigation();
    const route = useRoute<RouteProp<any, any>>();
    const { communityId } = route.params as { communityId: number };

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [logoUrl, setLogoUrl] = useState<string | null>(null);
    const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);

    
    const [categoryId, setCategoryId] = useState<number | null>(null);
    const [status, setStatus] = useState<string>('Active');

    useEffect(() => {
        fetchCommunityDetails();
    }, []);

    const fetchCommunityDetails = async () => {
        try {
            setIsLoading(true);
            const res = await api.get(`/communities/${communityId}`);
            if (res.data) {
                setName(res.data.name || '');
                setDescription(res.data.description || '');
                setLogoUrl(res.data.logoUrl || null);
                setCoverImageUrl(res.data.coverImageUrl || null);
                
                if (res.data.categoryId) {
                    setCategoryId(res.data.categoryId);
                }
                setStatus(res.data.status || 'Active');
            }
        } catch (error) {
            console.log('Topluluk bilgileri çekilirken hata:', error);
            Alert.alert('Hata', 'Topluluk bilgileri alınamadı.');
            navigation.goBack();
        } finally {
            setIsLoading(false);
        }
    };

    const pickImage = async (type: 'logo' | 'cover') => {
        try {
            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: type === 'logo' ? [1, 1] : [16, 9],
                quality: 0.8,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const selectedAsset = result.assets[0];
                await uploadImage(selectedAsset.uri, type);
            }
        } catch (error) {
            console.log('Resim seçme hatası:', error);
            Alert.alert('Hata', 'Resim seçilirken bir sorun oluştu.');
        }
    };

    const uploadImage = async (uri: string, type: 'logo' | 'cover') => {
        setIsSaving(true);
        try {
            const filename = uri.split('/').pop() || 'image.jpg';
            const match = /\.(\w+)$/.exec(filename);
            const mimeType = match ? `image/${match[1]}` : 'image/jpeg';

            const formData = new FormData();
            formData.append('file', {
                uri: Platform.OS === 'ios' ? uri.replace('file://', '') : uri,
                name: filename,
                type: mimeType,
            } as any);

            const folder = type === 'logo' ? 'community_logos' : 'community_covers';
            formData.append('folder', folder);

            const uploadResponse = await api.post('/files/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            const url = uploadResponse.data.url || uploadResponse.data.Url;

            if (url) {
                if (type === 'logo') setLogoUrl(url);
                else setCoverImageUrl(url);
                Alert.alert('Başarılı', `${type === 'logo' ? 'Logo' : 'Kapak fotoğrafı'} yüklendi. Değişiklikleri kaydetmeyi unutmayın.`);
            }
        } catch (error) {
            console.log('Upload error (Community):', error);
            Alert.alert('Hata', 'Fotoğraf yüklenemedi.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert('Hata', 'Topluluk adı boş olamaz.');
            return;
        }

        setIsSaving(true);
        try {
            await api.put(`/communities/${communityId}`, {
                categoryId: categoryId || 1, 
                name,
                description,
                logoUrl,
                coverImageUrl,
                status,
            });

            Alert.alert('Başarılı', 'Topluluk bilgileri güncellendi.', [
                { text: 'Tamam', onPress: () => navigation.goBack() }
            ]);
        } catch (error: any) {
            console.log('Kaydetme hatası:', error.response?.data || error);
            Alert.alert('Hata', error.response?.data?.message || 'Bilgiler kaydedilirken bir hata oluştu.');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="chevron-back" size={28} color={Colors.primary} />
                    <Text style={styles.backText}>Geri</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Profili Düzenle</Text>
                <View style={{ width: 70 }} />
            </View>

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    {/* Photos Section */}
                    <View style={styles.photosSection}>
                        {/* Cover Image */}
                        <TouchableOpacity
                            style={styles.coverImageContainer}
                            activeOpacity={0.8}
                            onPress={() => pickImage('cover')}
                        >
                            {coverImageUrl ? (
                                <Image source={{ uri: coverImageUrl }} style={styles.coverImage} />
                            ) : (
                                <View style={[styles.coverImage, styles.placeholderCover]}>
                                    <Ionicons name="image-outline" size={40} color="#8B95A5" />
                                    <Text style={styles.uploadText}>Kapak Fotoğrafı Ekle</Text>
                                </View>
                            )}
                            <View style={styles.editIconBadge}>
                                <Ionicons name="pencil" size={16} color="#FFF" />
                            </View>
                        </TouchableOpacity>

                        {/* Logo */}
                        <View style={styles.logoWrapper}>
                            <TouchableOpacity
                                style={styles.logoContainer}
                                activeOpacity={0.8}
                                onPress={() => pickImage('logo')}
                            >
                                {logoUrl ? (
                                    <Image source={{ uri: logoUrl }} style={styles.logoImage} />
                                ) : (
                                    <View style={[styles.logoImage, styles.placeholderLogo]}>
                                        <Ionicons name="people" size={32} color={Colors.textLight} />
                                    </View>
                                )}
                                <View style={styles.logoEditBadge}>
                                    <Ionicons name="camera" size={14} color="#FFF" />
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Form Fields */}
                    <View style={styles.formSection}>
                        <Text style={styles.label}>Topluluk Adı</Text>
                        <View style={styles.inputContainer}>
                            <Ionicons name="text-outline" size={20} color={Colors.primary} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                value={name}
                                onChangeText={setName}
                                placeholder="Örn: Yazılım Topluluğu"
                                placeholderTextColor="#A0AEC0"
                            />
                        </View>

                        <Text style={styles.label}>Hakkında</Text>
                        <View style={[styles.inputContainer, styles.textAreaContainer]}>
                            <TextInput
                                style={styles.textArea}
                                value={description}
                                onChangeText={setDescription}
                                placeholder="Topluluğunuzu anlatan kısa bir yazı..."
                                placeholderTextColor="#A0AEC0"
                                multiline
                                textAlignVertical="top"
                            />
                        </View>
                    </View>

                    {/* Save Button */}
                    <TouchableOpacity
                        style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
                        disabled={isSaving}
                        onPress={handleSave}
                        activeOpacity={0.8}
                    >
                        {isSaving ? (
                            <ActivityIndicator color="#FFF" />
                        ) : (
                            <Text style={styles.saveButtonText}>Değişiklikleri Kaydet</Text>
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
    photosSection: {
        marginBottom: Spacing.xl,
        alignItems: 'center',
    },
    coverImageContainer: {
        width: '100%',
        height: 180,
        backgroundColor: '#E2E8F0',
        position: 'relative',
    },
    coverImage: {
        width: '100%',
        height: '100%',
    },
    placeholderCover: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    uploadText: {
        color: '#8B95A5',
        marginTop: 8,
        fontWeight: '500',
    },
    editIconBadge: {
        position: 'absolute',
        bottom: 12,
        right: 12,
        backgroundColor: 'rgba(0,0,0,0.6)',
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoWrapper: {
        marginTop: -40,
        alignItems: 'center',
        ...Shadows.md,
    },
    logoContainer: {
        position: 'relative',
    },
    logoImage: {
        width: 90,
        height: 90,
        borderRadius: 45,
        borderWidth: 4,
        borderColor: '#FAFCFC',
        backgroundColor: Colors.secondary,
    },
    placeholderLogo: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoEditBadge: {
        position: 'absolute',
        bottom: 0,
        right: -4,
        backgroundColor: Colors.primary,
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FAFCFC',
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
        height: 55,
        ...Shadows.sm,
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#0A2540',
    },
    textAreaContainer: {
        height: 120,
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
        marginTop: Spacing.lg,
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
