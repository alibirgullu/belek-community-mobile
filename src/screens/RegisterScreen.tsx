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
  ScrollView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { authService } from '../services/authService';

export default function RegisterScreen() {
  const navigation = useNavigation<any>();
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegister = async () => {
    if (!firstName || !lastName || !email || !password) {
      Alert.alert('Eksik Bilgi', 'Lütfen tüm alanları doldurun.');
      return;
    }

    // Basit bir e-posta kontrolü (Sadece Belek uzantılı maillere izin vermek istersen burayı açabilirsin)
    /*
    if (!email.endsWith('@ogr.belek.edu.tr')) {
      Alert.alert('Geçersiz E-posta', 'Sadece @ogr.belek.edu.tr uzantılı e-posta adresleri ile kayıt olabilirsiniz.');
      return;
    }
    */

    setIsSubmitting(true);
    try {
      const response = await authService.register(firstName, lastName, email, password);
      
      // Kayıt başarılıysa, kullanıcının e-postasını da alarak Doğrulama (Verify) ekranına yönlendir
      Alert.alert('Başarılı', response.Message || 'Doğrulama kodu e-postanıza gönderildi.', [
        { 
          text: 'Tamam', 
          onPress: () => navigation.navigate('VerifyEmail', { email: email }) 
        }
      ]);
    } catch (error: any) {
      Alert.alert('Kayıt Başarısız', error.response?.data?.Message || 'Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>

        <View style={styles.headerContainer}>
          <View style={styles.logoPlaceholder}>
            <Text style={styles.logoText}>BU</Text>
          </View>
          <Text style={styles.title}>Aramıza Katıl</Text>
          <Text style={styles.subtitle}>Kampüsün dijital haline adım at.</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.row}>
            <TextInput 
              style={[styles.input, styles.halfInput]}
              placeholder="Adınız" 
              placeholderTextColor="#A0AEC0"
              value={firstName}
              onChangeText={setFirstName}
            />
            <TextInput 
              style={[styles.input, styles.halfInput]}
              placeholder="Soyadınız" 
              placeholderTextColor="#A0AEC0"
              value={lastName}
              onChangeText={setLastName}
            />
          </View>

          <TextInput 
            style={styles.input}
            placeholder="Öğrenci No (@ogr.belek.edu.tr)" 
            placeholderTextColor="#A0AEC0"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          
          <TextInput 
            style={styles.input}
            placeholder="Şifre Belirleyin" 
            placeholderTextColor="#A0AEC0"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity 
            style={[styles.button, isSubmitting && styles.buttonDisabled]} 
            onPress={handleRegister}
            disabled={isSubmitting}
          >
            <Text style={styles.buttonText}>
              {isSubmitting ? 'Kayıt Yapılıyor...' : 'Kayıt Ol'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>Zaten hesabın var mı? </Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.loginText}>Giriş Yap</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  backButton: { position: 'absolute', top: Platform.OS === 'ios' ? 50 : 20, left: 20, zIndex: 10, width: 40, height: 40, justifyContent: 'center' },
  headerContainer: { alignItems: 'center', marginBottom: 30, marginTop: 40 },
  logoPlaceholder: { width: 70, height: 70, backgroundColor: '#D32F2F', borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 16, shadowColor: '#D32F2F', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 },
  logoText: { color: '#FFFFFF', fontSize: 30, fontWeight: '900', letterSpacing: 2 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 8 },
  subtitle: { fontSize: 15, color: '#666666', fontWeight: '500' },
  formContainer: { backgroundColor: '#FFFFFF', padding: 24, borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 5 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  halfInput: { width: '48%' },
  input: { backgroundColor: '#F7FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, padding: 16, fontSize: 15, marginBottom: 16, color: '#1A1A1A' },
  button: { backgroundColor: '#D32F2F', padding: 16, borderRadius: 10, alignItems: 'center', marginTop: 8, shadowColor: '#D32F2F', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 5, elevation: 4 },
  buttonDisabled: { backgroundColor: '#E57373' },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', letterSpacing: 0.5 },
  footerContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  footerText: { color: '#666666', fontSize: 15 },
  loginText: { color: '#D32F2F', fontSize: 15, fontWeight: 'bold' }
});