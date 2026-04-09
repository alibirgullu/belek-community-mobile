import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StatusBar,
  Alert,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import Colors from '../theme/colors';
import { CommonStyles, Typography, Spacing, Radii, Shadows } from '../theme/commonStyles';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

export default function EditProfileScreen() {
  const navigation = useNavigation();
  const { setUser } = React.useContext(AuthContext); 

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [department, setDepartment] = useState('');
  const [phone, setPhone] = useState('');
  const [biography, setBiography] = useState('');
  const [email, setEmail] = useState('ogrenci@belek.edu.tr');
  const [profileImageUrl, setProfileImageUrl] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [isPhotoUploading, setIsPhotoUploading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  React.useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/users/me');
      if (response.data) {
        setFirstName(response.data.firstName || '');
        setLastName(response.data.lastName || '');
        setEmail(response.data.email || 'ogrenci@belek.edu.tr');
        setDepartment(response.data.department || '');
        setPhone(response.data.phone || '');
        setBiography(response.data.biography || '');
        setProfileImageUrl(response.data.profileImageUrl || '');
      }
    } catch (error) {
      console.log('Profil yüklenirken hata:', error);
      Alert.alert('Hata', 'Profil bilgileri yüklenemedi.');
    } finally {
      setIsFetching(false);
    }
  };

  const handlePickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Uyarı', 'Galeriye erişim izni gerekiyor.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        uploadProfileImage(result.assets[0]);
      }
    } catch (error) {
      console.log('Resim seçerken hata:', error);
    }
  };

  const uploadProfileImage = async (asset: ImagePicker.ImagePickerAsset) => {
    try {
      setIsPhotoUploading(true);

      const formData = new FormData();
      formData.append('file', {
        uri: asset.uri,
        name: asset.uri.split('/').pop() || 'profile.jpg',
        type: 'image/jpeg',
      } as any);
      formData.append('folder', 'profiles');

      const uploadRes = await api.post('/files/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const newUrl = uploadRes.data?.url || uploadRes.data?.Url;
      console.log("Upload Response Data: ", uploadRes.data);
      if (newUrl) {
        setProfileImageUrl(newUrl);
      } else {
        throw new Error('Resim URLsi alınamadı');
      }
    } catch (error) {
      console.log('Fotoğraf yüklenirken hata:', error);
      Alert.alert('Hata', 'Fotoğraf yüklenemedi.');
    } finally {
      setIsPhotoUploading(false);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const response = await api.put('/users/me', {
        firstName, 
        lastName,
        department,
        phone,
        biography,
        profileImageUrl
      });

      if (response.data) {
        setUser(response.data); 
        setSuccessMsg('Profilin başarıyla güncellendi!');
        setTimeout(() => (navigation as any).navigate('ProfileMain'), 1500);
      }
    } catch (error: any) {
      setErrorMsg(error.response?.data?.message || 'Profil güncellenirken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => (navigation as any).navigate('ProfileMain')}>
          <Ionicons name="chevron-back" size={28} color={Colors.primary} />
          <Text style={styles.backText}>Geri</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Düzenle</Text>
        <View style={{ width: 70 }} />
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

          {isFetching ? (
            <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
          ) : (
            <>
              <View style={styles.avatarSection}>
                <TouchableOpacity onPress={handlePickImage} disabled={isPhotoUploading} activeOpacity={0.8} style={styles.avatarContainer}>
                  {profileImageUrl ? (
                    <Image source={{ uri: profileImageUrl }} style={styles.avatarImage} />
                  ) : (
                    <Text style={styles.avatarText}>
                      {firstName?.[0] || 'T'}{lastName?.[0] || 'U'}
                    </Text>
                  )}
                  {isPhotoUploading && (
                    <View style={styles.uploadingOverlay}>
                      <ActivityIndicator color="#FFF" />
                    </View>
                  )}
                  <View style={styles.editIconBadge}>
                    <Ionicons name="camera" size={14} color={Colors.textLight} />
                  </View>
                </TouchableOpacity>
                <Text style={styles.avatarSubText}>Fotoğrafı Değiştir</Text>
              </View>

              {errorMsg ? (
                <View style={[styles.messageBox, { backgroundColor: Colors.error + '1A', borderColor: Colors.error }]}>
                  <Ionicons name="alert-circle" size={20} color={Colors.error} />
                  <Text style={[styles.messageText, { color: Colors.error }]}>{errorMsg}</Text>
                </View>
              ) : null}

              {successMsg ? (
                <View style={[styles.messageBox, { backgroundColor: Colors.success + '1A', borderColor: Colors.success }]}>
                  <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
                  <Text style={[styles.messageText, { color: Colors.success }]}>{successMsg}</Text>
                </View>
              ) : null}

              <View style={styles.formGroup}>
                <Text style={styles.label}>AD</Text>
                <View style={[styles.inputWrapper, { backgroundColor: Colors.gray[100] }]}>
                  <TextInput
                    style={[styles.input, { color: Colors.textTertiary }]}
                    value={firstName}
                    editable={false}
                    placeholder="Adın"
                    placeholderTextColor={Colors.textTertiary}
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>SOYAD</Text>
                <View style={[styles.inputWrapper, { backgroundColor: Colors.gray[100] }]}>
                  <TextInput
                    style={[styles.input, { color: Colors.textTertiary }]}
                    value={lastName}
                    editable={false}
                    placeholder="Soyadın"
                    placeholderTextColor={Colors.textTertiary}
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>BÖLÜM ADI</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    value={department}
                    onChangeText={setDepartment}
                    placeholder="Örn: Bilgisayar Mühendisliği"
                    placeholderTextColor={Colors.textTertiary}
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>TELEFON NUMARASI</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    value={phone}
                    onChangeText={setPhone}
                    placeholder="Örn: 0555 555 55 55"
                    keyboardType="phone-pad"
                    placeholderTextColor={Colors.textTertiary}
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>BİYOGRAFİ</Text>
                <View style={[styles.inputWrapper, { height: 100 }]}>
                  <TextInput
                    style={[styles.input, { height: 100, paddingTop: Spacing.md, textAlignVertical: 'top' }]}
                    value={biography}
                    onChangeText={setBiography}
                    placeholder="Kendinden bahset..."
                    multiline
                    placeholderTextColor={Colors.textTertiary}
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>E-POSTA ADRESİ</Text>
                <View style={[styles.inputWrapper, { backgroundColor: Colors.gray[100] }]}>
                  <TextInput
                    style={[styles.input, { color: Colors.textTertiary }]}
                    value={email}
                    editable={false}
                  />
                </View>
                <Text style={styles.helperText}>Okul e-posta adresi değiştirilemez.</Text>
              </View>
            </>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              CommonStyles.button,
              styles.saveButton,
              isLoading && CommonStyles.buttonDisabled
            ]}
            onPress={handleSave}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color={Colors.textLight} />
            ) : (
              <Text style={Typography.buttonText}>Değişiklikleri Kaydet</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView >
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  keyboardView: { flex: 1 },
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
  avatarSection: {
    alignItems: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.xl,
  },
  avatarContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.sm,
  },
  avatarText: {
    fontSize: 32,
    color: Colors.textLight,
    fontWeight: '800',
  },
  avatarImage: {
    width: 88,
    height: 88,
    borderRadius: 44,
  },
  uploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editIconBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.primary,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.background,
  },
  avatarSubText: {
    marginTop: Spacing.sm,
    color: Colors.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  formGroup: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginLeft: Spacing.sm,
    marginBottom: Spacing.xs,
    letterSpacing: 0.5,
  },
  inputWrapper: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.borderDark,
    overflow: 'hidden',
  },
  input: {
    height: 50,
    paddingHorizontal: Spacing.md,
    fontSize: 17, 
    color: Colors.text,
  },
  helperText: {
    fontSize: 13,
    color: Colors.textTertiary,
    marginLeft: Spacing.sm,
    marginTop: Spacing.xs,
  },
  footer: {
    padding: Spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? 34 : Spacing.lg,
    backgroundColor: Colors.background,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border,
  },
  saveButton: {
    width: '100%',
  },
  messageBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radii.md,
    marginBottom: Spacing.lg,
    borderWidth: 1,
  },
  messageText: {
    marginLeft: Spacing.sm,
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  }
});