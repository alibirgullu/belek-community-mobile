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
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { authService } from '../services/authService';

type ParamList = {
  ResetPassword: { email: string };
};

export default function ResetPasswordScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<ParamList, 'ResetPassword'>>();
  
  // Önceki sayfadan (Şifremi Unuttum) gelen e-posta adresini alıyoruz
  const userEmail = route.params?.email || '';

  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReset = async () => {
    if (!code || code.length !== 6 || !newPassword) {
      Alert.alert('Uyarı', 'Lütfen 6 haneli kodu ve yeni şifrenizi eksiksiz girin.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await authService.resetPassword(userEmail, code, newPassword);
      
      Alert.alert('Harika!', response.Message || 'Şifreniz başarıyla güncellendi.', [
        { 
          text: 'Giriş Yap', 
          onPress: () => navigation.navigate('Login') // İşlem bitince giriş ekranına yolla
        }
      ]);
    } catch (error: any) {
      Alert.alert('Hata', error.response?.data?.Message || 'Kod hatalı veya süresi dolmuş.');
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
            <Ionicons name="lock-closed-outline" size={40} color="#D32F2F" />
          </View>
          <Text style={styles.title}>Yeni Şifre Belirle</Text>
          <Text style={styles.subtitle}>
            <Text style={{ fontWeight: 'bold' }}>{userEmail}</Text> adresine gelen 6 haneli kodu ve yeni şifrenizi girin.
          </Text>
        </View>

        <View style={styles.formContainer}>
          <TextInput 
            style={styles.codeInput}
            placeholder="000000" 
            placeholderTextColor="#CCC"
            value={code}
            onChangeText={setCode}
            keyboardType="number-pad"
            maxLength={6}
            textAlign="center"
          />

          <TextInput 
            style={styles.input}
            placeholder="Yeni Şifre" 
            placeholderTextColor="#A0AEC0"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
          />

          <TouchableOpacity 
            style={[styles.button, isSubmitting && styles.buttonDisabled]} 
            onPress={handleReset}
            disabled={isSubmitting}
          >
            <Text style={styles.buttonText}>
              {isSubmitting ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}
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
  formContainer: { backgroundColor: '#FFFFFF', padding: 30, borderRadius: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 5, alignItems: 'center' },
  codeInput: { backgroundColor: '#F7FAFC', borderWidth: 2, borderColor: '#E2E8F0', borderRadius: 12, padding: 16, fontSize: 32, fontWeight: 'bold', letterSpacing: 10, color: '#1A1A1A', width: '100%', marginBottom: 16 },
  input: { backgroundColor: '#F7FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, padding: 16, fontSize: 15, marginBottom: 24, color: '#1A1A1A', width: '100%' },
  button: { backgroundColor: '#D32F2F', paddingVertical: 16, borderRadius: 12, width: '100%', alignItems: 'center', shadowColor: '#D32F2F', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 5, elevation: 4 },
  buttonDisabled: { backgroundColor: '#E57373' },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', letterSpacing: 0.5 }
});