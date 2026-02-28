import React, { useState } from 'react';
import { 
  View, 
  TextInput, 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  Alert, 
  KeyboardAvoidingView, 
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { authService } from '../services/authService';

export default function ForgotPasswordScreen() {
  const navigation = useNavigation<any>();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSendCode = async () => {
    if (!email) {
      Alert.alert('Uyarı', 'Lütfen kayıtlı e-posta adresinizi girin.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await authService.forgotPassword(email);
      
      Alert.alert('Başarılı', response.Message || 'Şifre sıfırlama kodu e-postanıza gönderildi.', [
        { 
          text: 'Tamam', 
          // Kod başarıyla gittiyse, Yeni Şifre ekranına geç (E-postayı da yanında parametre olarak götür)
          onPress: () => navigation.navigate('ResetPassword', { email: email }) 
        }
      ]);
    } catch (error: any) {
      Alert.alert('Hata', error.response?.data?.Message || 'Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#1A1A1A" />
        </TouchableOpacity>

        <View style={styles.headerContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="key-outline" size={40} color="#D32F2F" />
          </View>
          <Text style={styles.title}>Şifremi Unuttum</Text>
          <Text style={styles.subtitle}>
            Hesabınıza bağlı e-posta adresini girin, size 6 haneli bir kurtarma kodu gönderelim.
          </Text>
        </View>

        <View style={styles.formContainer}>
          <TextInput 
            style={styles.input}
            placeholder="Öğrenci No (@ogr.belek.edu.tr)" 
            placeholderTextColor="#A0AEC0"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TouchableOpacity 
            style={[styles.button, isSubmitting && styles.buttonDisabled]} 
            onPress={handleSendCode}
            disabled={isSubmitting}
          >
            <Text style={styles.buttonText}>
              {isSubmitting ? 'Gönderiliyor...' : 'Kodu Gönder'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  keyboardView: { flex: 1, padding: 24, justifyContent: 'center' },
  backButton: { position: 'absolute', top: Platform.OS === 'ios' ? 10 : 30, left: 20, zIndex: 10 },
  headerContainer: { alignItems: 'center', marginBottom: 40 },
  iconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#FFF0F0', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 12 },
  subtitle: { fontSize: 15, color: '#666666', textAlign: 'center', lineHeight: 22, paddingHorizontal: 10 },
  formContainer: { backgroundColor: '#FFFFFF', padding: 24, borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 5 },
  input: { backgroundColor: '#F7FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, padding: 16, fontSize: 15, marginBottom: 20, color: '#1A1A1A' },
  button: { backgroundColor: '#D32F2F', paddingVertical: 16, borderRadius: 10, alignItems: 'center', shadowColor: '#D32F2F', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 5, elevation: 4 },
  buttonDisabled: { backgroundColor: '#E57373' },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', letterSpacing: 0.5 }
});