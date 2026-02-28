import React, { useState } from 'react';
import { 
  View, 
  TextInput, 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  Alert, 
  KeyboardAvoidingView, 
  Platform,
  SafeAreaView
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { authService } from '../services/authService';

// Route'dan gelecek parametrelerin tipini belirliyoruz (E-posta adresi buraya gelecek)
type ParamList = {
  Verify: { email: string };
};

export default function VerifyScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<ParamList, 'Verify'>>();
  
  // Register ekranından gönderilen e-posta adresi
  const userEmail = route.params?.email || '';

  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleVerify = async () => {
    if (!code || code.length !== 6) {
      Alert.alert('Uyarı', 'Lütfen e-postanıza gelen 6 haneli kodu eksiksiz girin.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await authService.verifyEmail(userEmail, code);
      
      Alert.alert('Tebrikler!', response.Message || 'Hesabınız başarıyla doğrulandı. Artık giriş yapabilirsiniz.', [
        { 
          text: 'Giriş Yap', 
          onPress: () => navigation.navigate('Login') // Doğrulama bitince Login'e geri yolla
        }
      ]);
    } catch (error: any) {
      Alert.alert('Doğrulama Başarısız', error.response?.data?.Message || 'Kod hatalı veya süresi dolmuş.');
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
            <Ionicons name="mail-open-outline" size={40} color="#D32F2F" />
          </View>
          <Text style={styles.title}>E-postanı Doğrula</Text>
          <Text style={styles.subtitle}>
            <Text style={{ fontWeight: 'bold' }}>{userEmail}</Text> adresine gönderdiğimiz 6 haneli doğrulama kodunu aşağıya giriniz.
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

          <TouchableOpacity 
            style={[styles.button, isSubmitting && styles.buttonDisabled]} 
            onPress={handleVerify}
            disabled={isSubmitting}
          >
            <Text style={styles.buttonText}>
              {isSubmitting ? 'Doğrulanıyor...' : 'Doğrula ve Tamamla'}
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
  subtitle: { fontSize: 15, color: '#666666', textAlign: 'center', lineHeight: 22, paddingHorizontal: 20 },
  formContainer: { backgroundColor: '#FFFFFF', padding: 30, borderRadius: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 5, alignItems: 'center' },
  codeInput: { backgroundColor: '#F7FAFC', borderWidth: 2, borderColor: '#E2E8F0', borderRadius: 12, padding: 16, fontSize: 32, fontWeight: 'bold', letterSpacing: 10, color: '#1A1A1A', width: '100%', marginBottom: 24 },
  button: { backgroundColor: '#D32F2F', paddingVertical: 16, borderRadius: 12, width: '100%', alignItems: 'center', shadowColor: '#D32F2F', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 5, elevation: 4 },
  buttonDisabled: { backgroundColor: '#E57373' },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', letterSpacing: 0.5 }
});