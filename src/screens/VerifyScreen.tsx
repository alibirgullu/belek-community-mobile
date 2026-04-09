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
import Colors from '../theme/colors';
import { CommonStyles, Typography, Spacing, Radii } from '../theme/commonStyles';

type ParamList = {
  VerifyEmail: { email: string };
};

export default function VerifyScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<ParamList, 'VerifyEmail'>>();

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
          onPress: () => navigation.navigate('Login')
        }
      ]);
    } catch (error: any) {
      Alert.alert('Doğrulama Başarısız', error.response?.data?.Message || 'Kod hatalı veya süresi dolmuş.');
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
            <Ionicons name="mail-open-outline" size={40} color={Colors.primary} />
          </View>
          <Text style={Typography.h2}>E-postanı Doğrula</Text>
          <Text style={[Typography.body, { textAlign: 'center', marginTop: Spacing.sm }]}>
            <Text style={{ fontWeight: 'bold' }}>{userEmail}</Text> adresine gönderdiğimiz 6 haneli doğrulama kodunu aşağıya giriniz.
          </Text>
        </View>

        <View style={CommonStyles.card}>
          <TextInput
            style={[CommonStyles.input, styles.codeInput]}
            placeholder="000000"
            placeholderTextColor={Colors.textTertiary}
            value={code}
            onChangeText={setCode}
            keyboardType="number-pad"
            maxLength={6}
            textAlign="center"
          />

          <TouchableOpacity
            style={[CommonStyles.button, isSubmitting && CommonStyles.buttonDisabled]}
            onPress={handleVerify}
            disabled={isSubmitting}
            activeOpacity={0.8}
          >
            <Text style={Typography.buttonText}>
              {isSubmitting ? 'Doğrulanıyor...' : 'Doğrula ve Tamamla'}
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
  },
  codeInput: {
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 8,
    borderWidth: 2,
    marginBottom: Spacing.xl,
  }
});