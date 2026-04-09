import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Animated,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { authService } from '../services/authService';
import { useTranslation } from 'react-i18next';
import { Spacing } from '../theme/commonStyles';

type ParamList = {
  ResetPassword: { email: string };
};

export default function ResetPasswordScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<ParamList, 'ResetPassword'>>();
  const { t } = useTranslation();

  const userEmail = route.params?.email || '';

  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  const handleReset = async () => {
    if (!code || code.length !== 6 || !newPassword) {
      Alert.alert(t('common.warning'), 'Lütfen 6 haneli kodu ve yeni şifrenizi eksiksiz girin.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await authService.resetPassword(userEmail, code, newPassword);

      Alert.alert(t('common.success'), response.Message || 'Şifreniz başarıyla güncellendi.', [
        {
          text: t('login.loginButton'),
          onPress: () => navigation.navigate('Login')
        }
      ]);
    } catch (error: any) {
      Alert.alert(t('common.error'), error.response?.data?.Message || 'Kod hatalı veya süresi dolmuş.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <LinearGradient colors={['#7A162B', '#0A0F1D']} style={styles.gradientBackground}>
      <SafeAreaView style={styles.transparentSafeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
        >
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={28} color="#FFF" />
          </TouchableOpacity>

          <Animated.View style={[{ flex: 1, justifyContent: 'center' }, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <View style={styles.glassCard}>
              <View style={styles.headerContainer}>
                <View style={styles.logoRedContainer}>
                  <Ionicons name="lock-closed" size={32} color="#FFF" />
                </View>
                <Text style={styles.titleWhite}>Yeni Şifre Belirle</Text>
                <Text style={styles.subtitleGray}>
                  {userEmail} adresine gelen kodu ve yeni şifrenizi girin.
                </Text>
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="keypad" size={20} color="#54607B" style={styles.inputIcon} />
                <TextInput
                  style={[styles.inputStyle, { fontSize: 20, letterSpacing: 4 }]}
                  placeholder="000000"
                  placeholderTextColor="#54607B"
                  value={code}
                  onChangeText={setCode}
                  keyboardType="number-pad"
                  maxLength={6}
                />
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed" size={20} color="#54607B" style={styles.inputIcon} />
                <TextInput
                  style={styles.inputStyle}
                  placeholder="Yeni Şifre"
                  placeholderTextColor="#54607B"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry={!isPasswordVisible}
                />
                <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)} style={styles.eyeIcon}>
                  <Ionicons name={isPasswordVisible ? 'eye' : 'eye-off'} size={20} color="#54607B" />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.loginButton, isSubmitting && styles.loginButtonDisabled]}
                onPress={handleReset}
                disabled={isSubmitting}
                activeOpacity={0.8}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.loginButtonText}>
                    Şifreyi Güncelle
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </Animated.View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
  },
  transparentSafeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 10 : 30,
    left: Spacing.lg,
    zIndex: 10,
    padding: 8,
  },
  glassCard: {
    backgroundColor: 'rgba(30, 35, 50, 0.65)',
    borderRadius: 24,
    padding: Spacing.xl,
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.xl,
    marginHorizontal: Spacing.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 10,
    borderTopWidth: 1.5,
    borderLeftWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  logoRedContainer: {
    width: 72,
    height: 72,
    backgroundColor: '#E53E3E',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    shadowColor: '#FF5C5C',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 25,
    elevation: 15,
  },
  titleWhite: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  subtitleGray: {
    fontSize: 13,
    color: '#8B95A5',
    marginTop: Spacing.sm,
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 20,
    paddingHorizontal: Spacing.md,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161C2A',
    borderRadius: 14,
    marginBottom: Spacing.md,
    height: 56,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
  },
  inputIcon: {
    paddingHorizontal: 16,
  },
  inputStyle: {
    flex: 1,
    color: '#FFF',
    fontSize: 15,
    height: '100%',
  },
  eyeIcon: {
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  loginButton: {
    backgroundColor: '#D12525',
    height: 54,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.sm,
    shadowColor: '#D12525',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 5,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
