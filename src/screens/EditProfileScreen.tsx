import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  KeyboardAvoidingView, 
  Platform,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';

export default function EditProfileScreen() {
  const navigation = useNavigation<any>();
  const [department, setDepartment] = useState('');
  const [phone, setPhone] = useState('');
  const [biography, setBiography] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchCurrentProfile = async () => {
      try {
        const response = await api.get('/users/me');
        const data = response.data;
        if (data.department) setDepartment(data.department);
        if (data.phone) setPhone(data.phone);
        if (data.biography) setBiography(data.biography);
      } catch (error) {
        console.log('Profil getirilemedi:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCurrentProfile();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // DİKKAT: 404 hatasını aldığımız yer burası. 
      // Geçici olarak bu adrese istek atıyor, backend'e göre değiştireceğiz.
      await api.put('/users/me', {
        department,
        phone,
        biography
      });
      Alert.alert('Başarılı', 'Profil bilgilerin başarıyla güncellendi!', [
        { text: 'Tamam', onPress: () => navigation.goBack() }
      ]);
    } catch (error: any) {
      Alert.alert('Hata', 'Bilgiler güncellenirken bir sorun oluştu (404).');
      console.log(error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#D32F2F" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardFlex}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={26} color="#1A1A1A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Kişisel Bilgilerim</Text>
          <View style={styles.spacer} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.formContainer}>
          <Text style={styles.infoText}>
            Profilini zenginleştirerek diğer öğrencilerin seni daha iyi tanımasını sağlayabilirsin.
          </Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Bölümünüz</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="school-outline" size={20} color="#6c757d" style={styles.inputIcon} />
              <TextInput 
                style={styles.input}
                placeholder="Örn: Yazılım Mühendisliği" 
                placeholderTextColor="#A0AEC0"
                value={department}
                onChangeText={setDepartment}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Telefon Numarası</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="call-outline" size={20} color="#6c757d" style={styles.inputIcon} />
              <TextInput 
                style={styles.input}
                placeholder="05XX XXX XX XX" 
                placeholderTextColor="#A0AEC0"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Hakkımda (Biyografi)</Text>
            <View style={[styles.inputWrapper, styles.bioWrapper]}>
              <Ionicons name="information-circle-outline" size={20} color="#6c757d" style={styles.inputIcon} />
              <TextInput 
                style={styles.bioInput}
                placeholder="Kendinden biraz bahset..." 
                placeholderTextColor="#A0AEC0"
                value={biography}
                onChangeText={setBiography}
                multiline
                numberOfLines={4}
              />
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.saveButton, isSaving ? styles.saveButtonDisabled : null]} 
            onPress={handleSave}
            disabled={isSaving}
          >
            <Text style={styles.saveButtonText}>
              {isSaving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  keyboardFlex: { flex: 1 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1A1A1A' },
  spacer: { width: 40 },
  formContainer: { padding: 24 },
  infoText: { fontSize: 14, color: '#6c757d', marginBottom: 24, lineHeight: 20 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 8, marginLeft: 4 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, paddingHorizontal: 12, height: 50 },
  bioWrapper: { height: 100, alignItems: 'flex-start', paddingTop: 10 },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, color: '#1A1A1A' },
  bioInput: { flex: 1, fontSize: 15, color: '#1A1A1A', height: 80, textAlignVertical: 'top' },
  saveButton: { backgroundColor: '#D32F2F', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 10, shadowColor: '#D32F2F', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 5, elevation: 4 },
  saveButtonDisabled: { backgroundColor: '#E57373' },
  saveButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' }
});