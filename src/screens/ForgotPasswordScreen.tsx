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
import Colors from '../theme/colors';
import { CommonStyles, Typography, Spacing, Radii } from '../theme/commonStyles';

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
    <SafeAreaView style={CommonStyles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color={Colors.text} />
        </TouchableOpacity>

        <View style={styles.headerContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="key-outline" size={40} color={Colors.primary} />
          </View>
          <Text style={Typography.h2}>Şifremi Unuttum</Text>
          <Text style={[Typography.body, { textAlign: 'center', marginTop: Spacing.sm }]}>
            Hesabınıza bağlı e-posta adresini girin, size 6 haneli bir kurtarma kodu gönderelim.
          </Text>
        </View>

        <View style={CommonStyles.card}>
          <TextInput
            style={[CommonStyles.input, { marginBottom: Spacing.xl }]}
            placeholder="Öğrenci No (@ogr.belek.edu.tr)"
            placeholderTextColor={Colors.textTertiary}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TouchableOpacity
            style={[CommonStyles.button, isSubmitting && CommonStyles.buttonDisabled]}
            onPress={handleSendCode}
            disabled={isSubmitting}
            activeOpacity={0.8}
          >
            <Text style={Typography.buttonText}>
              {isSubmitting ? 'Gönderiliyor...' : 'Kodu Gönder'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 10 : 30,
    left: Spacing.lg,
    zIndex: 10,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: Radii.round,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  }
});