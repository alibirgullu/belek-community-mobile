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
    Alert,
    Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import Colors from '../theme/colors';
import { Radii, Shadows, Spacing } from '../theme/commonStyles';
import api, { eventService } from '../services/api';
import { Event } from '../types';

export default function EditEventScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute<RouteProp<any, any>>();
    const { event } = route.params as { event: Event };

    const [isSaving, setIsSaving] = useState(false);

    const [title, setTitle] = useState(event.title || '');
    const [description, setDescription] = useState(event.description || '');
    const [location, setLocation] = useState(event.location || '');
    const [posterUrl, setPosterUrl] = useState<string | null>(event.posterUrl || null);

    // Dates
    const [startDate, setStartDate] = useState(new Date(event.startDate));
    const [endDate, setEndDate] = useState(event.endDate ? new Date(event.endDate) : new Date(new Date(event.startDate).getTime() + 2 * 60 * 60 * 1000));

    // Pickers visibility
    const [showStartDate, setShowStartDate] = useState(false);
    const [showStartTime, setShowStartTime] = useState(false);
    const [showEndDate, setShowEndDate] = useState(false);
    const [showEndTime, setShowEndTime] = useState(false);

    const pickImage = async () => {
        try {
            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 5],
                quality: 0.8,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const selectedAsset = result.assets[0];
                await uploadImage(selectedAsset.uri);
            }
        } catch (error) {
            console.log('Resim seçme hatası:', error);
            Alert.alert('Hata', 'Resim seçilirken bir sorun oluştu.');
        }
    };

    const uploadImage = async (uri: string) => {
        setIsSaving(true);
        try {
            const filename = uri.split('/').pop() || 'poster.jpg';
            const match = /\.(\w+)$/.exec(filename);
            const mimeType = match ? `image/${match[1]}` : 'image/jpeg';

            const formData = new FormData();
            formData.append('file', {
                uri: Platform.OS === 'ios' ? uri.replace('file://', '') : uri,
                name: filename,
                type: mimeType,
            } as any);

            formData.append('folder', 'event_posters');

            const uploadResponse = await api.post('/files/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            const url = uploadResponse.data.url || uploadResponse.data.Url;

            if (url) {
                setPosterUrl(url);
            }
        } catch (error) {
            console.log('Upload error (Event Poster):', error);
            Alert.alert('Hata', 'Afiş yüklenemedi.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleSave = async () => {
        if (!title.trim()) {
            Alert.alert('Hata', 'Etkinlik adı boş olamaz.');
            return;
        }

        if (endDate <= startDate) {
            Alert.alert('Hata', 'Bitiş tarihi başlangıç tarihinden sonra olmalıdır.');
            return;
        }

        setIsSaving(true);
        try {
            await eventService.updateEvent(event.id, {
                title,
                description,
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString(),
                location,
                posterUrl,
            });

            const updatedEvent = {
                ...event,
                title,
                description,
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString(),
                location,
                posterUrl,
            };

            Alert.alert('Başarılı', 'Etkinlik başarıyla güncellendi.', [
                {
                    text: 'Tamam',
                    onPress: () => {
                        navigation.navigate({
                            name: 'EventDetail',
                            params: { event: updatedEvent },
                            merge: true,
                        });
                    }
                },
            ]);
        } catch (error: any) {
            console.log('Etkinlik güncelleme hatası:', error.response?.data || error);
            Alert.alert('Hata', error.response?.data?.message || 'Etkinlik güncellenirken bir hata oluştu.');
        } finally {
            setIsSaving(false);
        }
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="chevron-back" size={28} color={Colors.primary} />
                    <Text style={styles.backText}>Geri</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Etkinliği Düzenle</Text>
                <View style={{ width: 70 }} />
            </View>

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    {/* Poster Section */}
                    <View style={styles.posterSection}>
                        <TouchableOpacity
                            style={styles.posterContainer}
                            activeOpacity={0.8}
                            onPress={pickImage}
                        >
                            {posterUrl ? (
                                <Image source={{ uri: posterUrl }} style={styles.posterImage} />
                            ) : (
                                <View style={styles.placeholderPoster}>
                                    <Ionicons name="image-outline" size={48} color={Colors.primary + '80'} />
                                    <Text style={styles.uploadText}>Etkinlik Afişi Ekle</Text>
                                </View>
                            )}
                            <View style={styles.editIconBadge}>
                                <Ionicons name="camera" size={16} color="#FFF" />
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* Form Fields */}
                    <View style={styles.formSection}>
                        <Text style={styles.label}>Etkinlik Adı *</Text>
                        <View style={styles.inputContainer}>
                            <Ionicons name="document-text-outline" size={20} color={Colors.primary} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                value={title}
                                onChangeText={setTitle}
                                placeholder="Örn: Yapay Zeka Zirvesi 2026"
                                placeholderTextColor="#A0AEC0"
                            />
                        </View>

                        <Text style={styles.label}>Etkinlik Açıklaması</Text>
                        <View style={[styles.inputContainer, styles.textAreaContainer]}>
                            <TextInput
                                style={styles.textArea}
                                value={description}
                                onChangeText={setDescription}
                                placeholder="Etkinliğin detaylarını, amacını ve programını buraya yazın..."
                                placeholderTextColor="#A0AEC0"
                                multiline
                                textAlignVertical="top"
                            />
                        </View>

                        <Text style={styles.label}>Konum / Yer</Text>
                        <View style={styles.inputContainer}>
                            <Ionicons name="location-outline" size={20} color={Colors.primary} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                value={location}
                                onChangeText={setLocation}
                                placeholder="Örn: 1. Konferans Salonu"
                                placeholderTextColor="#A0AEC0"
                            />
                        </View>

                        {/* Dates Section */}
                        <Text style={styles.label}>Başlangıç Zamanı *</Text>
                        <View style={styles.dateTimeRow}>
                            <TouchableOpacity style={styles.datePickerButton} onPress={() => setShowStartDate(true)}>
                                <Ionicons name="calendar-outline" size={18} color={Colors.primary} />
                                <Text style={styles.datePickerText}>{formatDate(startDate)}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.timePickerButton} onPress={() => setShowStartTime(true)}>
                                <Ionicons name="time-outline" size={18} color={Colors.primary} />
                                <Text style={styles.datePickerText}>{formatTime(startDate)}</Text>
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.label}>Bitiş Zamanı *</Text>
                        <View style={styles.dateTimeRow}>
                            <TouchableOpacity style={styles.datePickerButton} onPress={() => setShowEndDate(true)}>
                                <Ionicons name="calendar-outline" size={18} color={Colors.primary} />
                                <Text style={styles.datePickerText}>{formatDate(endDate)}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.timePickerButton} onPress={() => setShowEndTime(true)}>
                                <Ionicons name="time-outline" size={18} color={Colors.primary} />
                                <Text style={styles.datePickerText}>{formatTime(endDate)}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Pickers (iOS and Android handling) */}
                    {showStartDate && (
                        <DateTimePicker
                            value={startDate}
                            mode="date"
                            display="default"
                            onChange={(event: any, selectedDate?: Date) => {
                                setShowStartDate(false);
                                if (selectedDate) {
                                    const newDate = new Date(startDate);
                                    newDate.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
                                    setStartDate(newDate);
                                }
                            }}
                        />
                    )}
                    {showStartTime && (
                        <DateTimePicker
                            value={startDate}
                            mode="time"
                            display="default"
                            onChange={(event: any, selectedDate?: Date) => {
                                setShowStartTime(false);
                                if (selectedDate) {
                                    const newDate = new Date(startDate);
                                    newDate.setHours(selectedDate.getHours(), selectedDate.getMinutes(), 0, 0);
                                    setStartDate(newDate);
                                }
                            }}
                        />
                    )}

                    {showEndDate && (
                        <DateTimePicker
                            value={endDate}
                            mode="date"
                            display="default"
                            minimumDate={startDate}
                            onChange={(event: any, selectedDate?: Date) => {
                                setShowEndDate(false);
                                if (selectedDate) {
                                    const newDate = new Date(endDate);
                                    newDate.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
                                    setEndDate(newDate);
                                }
                            }}
                        />
                    )}
                    {showEndTime && (
                        <DateTimePicker
                            value={endDate}
                            mode="time"
                            display="default"
                            onChange={(event: any, selectedDate?: Date) => {
                                setShowEndTime(false);
                                if (selectedDate) {
                                    const newDate = new Date(endDate);
                                    newDate.setHours(selectedDate.getHours(), selectedDate.getMinutes(), 0, 0);
                                    setEndDate(newDate);
                                }
                            }}
                        />
                    )}

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
    posterSection: {
        marginBottom: Spacing.lg,
        alignItems: 'center',
        marginTop: Spacing.md,
    },
    posterContainer: {
        width: 200,
        height: 250,
        backgroundColor: '#F1F5F9',
        borderRadius: Radii.lg,
        overflow: 'hidden',
        ...Shadows.md,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    posterImage: {
        width: '100%',
        height: '100%',
    },
    placeholderPoster: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    uploadText: {
        color: Colors.primary,
        marginTop: 12,
        fontWeight: '600',
        fontSize: 14,
    },
    editIconBadge: {
        position: 'absolute',
        bottom: 12,
        right: 12,
        backgroundColor: Colors.primary,
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFF',
        ...Shadows.sm,
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
    dateTimeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: Spacing.md,
    },
    datePickerButton: {
        flex: 0.6,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        height: 55,
        borderRadius: Radii.lg,
        paddingHorizontal: Spacing.md,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
        marginRight: Spacing.sm,
        ...Shadows.sm,
    },
    timePickerButton: {
        flex: 0.4,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        height: 55,
        borderRadius: Radii.lg,
        paddingHorizontal: Spacing.md,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
        ...Shadows.sm,
    },
    datePickerText: {
        fontSize: 15,
        color: '#0A2540',
        marginLeft: 8,
        fontWeight: '500',
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
