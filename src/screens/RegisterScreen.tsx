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
  ScrollView,
  Animated,
  ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { authService } from '../services/authService';
import { useTranslation } from 'react-i18next';
import { Spacing } from '../theme/commonStyles';
import { SafeAreaView } from 'react-native-safe-area-context';

const GlowingOrb = ({ positionStyle }: { positionStyle: any }) => {
  const pulseAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        })
      ])
    ).start();
  }, []);

  const scale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.2],
  });

  const opacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.7, 1],
  });

  return (
    <Animated.View style={[styles.orbContainer, positionStyle, { transform: [{ scale }], opacity }]}>
      <View style={[styles.orbLayer, { width: 400, height: 400, borderRadius: 200, opacity: 0.03 }]} />
      <View style={[styles.orbLayer, { width: 320, height: 320, borderRadius: 160, opacity: 0.05 }]} />
      <View style={[styles.orbLayer, { width: 240, height: 240, borderRadius: 120, opacity: 0.08 }]} />
      <View style={[styles.orbLayer, { width: 160, height: 160, borderRadius: 80, opacity: 0.12 }]} />
      <View style={[styles.orbLayer, { width: 80, height: 80, borderRadius: 40, opacity: 0.18 }]} />
    </Animated.View>
  );
};

export default function RegisterScreen() {
  const navigation = useNavigation<any>();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t } = useTranslation();

  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(50)).current;

  React.useEffect(() => {
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

  const handleRegister = async () => {
    if (!firstName || !lastName || !email || !password) {
      Alert.alert(t('register.missingAlertTitle'), t('register.missingAlertMsg'));
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await authService.register(firstName, lastName, email, password);

      Alert.alert(t('register.successTitle'), response.Message || t('register.successDefaultMsg'), [
        {
          text: t('register.okButton'),
          onPress: () => navigation.navigate('VerifyEmail', { email: email })
        }
      ]);
    } catch (error: any) {
      Alert.alert(t('register.errorTitle'), error.response?.data?.Message || t('register.errorDefaultMsg'));
      setIsSubmitting(false);
    }
  };

  return (
    <LinearGradient colors={['#1A0000', '#2D0505']} style={styles.gradientBackground}>
      {/* Background Orbs */}
      <GlowingOrb positionStyle={{ top: -150, right: -150 }} />
      <GlowingOrb positionStyle={{ bottom: -50, left: -200 }} />

      <SafeAreaView style={styles.transparentSafeArea} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

            {/* Top Header - Sadece geri dön oku */}
            <View style={styles.topHeader}>
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>

            <Animated.View style={[{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>

              <View style={styles.headerContainer}>
                <Text style={styles.titleWhite}>Kayıt Ol</Text>
                <Text style={styles.subtitleGray}>TOPLULUĞA KATILIN</Text>
              </View>

              <View style={styles.formContainer}>
                {/* İsim Soyisim */}
                <View style={styles.row}>
                  <View style={[styles.inputContainer, styles.halfInput]}>
                    <TextInput
                      style={styles.inputStyleWithoutIcon}
                      placeholder="Adınız"
                      placeholderTextColor="#8A8A8A"
                      value={firstName}
                      onChangeText={setFirstName}
                    />
                  </View>
                  <View style={[styles.inputContainer, styles.halfInput]}>
                    <TextInput
                      style={styles.inputStyleWithoutIcon}
                      placeholder="Soyadınız"
                      placeholderTextColor="#8A8A8A"
                      value={lastName}
                      onChangeText={setLastName}
                    />
                  </View>
                </View>

                {/* Email */}
                <View style={styles.inputContainer}>
                  <FontAwesome5 name="user" size={18} color="#8A8A8A" style={styles.inputIcon} />
                  <TextInput
                    style={styles.inputStyle}
                    placeholder="Öğrenci No (örn: 241234567@ogr...)"
                    placeholderTextColor="#8A8A8A"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                {/* Parola */}
                <View style={styles.inputContainer}>
                  <Ionicons name="lock-closed-outline" size={20} color="#8A8A8A" style={styles.inputIcon} />
                  <TextInput
                    style={styles.inputStyle}
                    placeholder="Hesap Şifresi Belirleyin"
                    placeholderTextColor="#8A8A8A"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!isPasswordVisible}
                  />
                  <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)} style={styles.eyeIcon}>
                    <Ionicons name={isPasswordVisible ? 'eye-outline' : 'eye-off-outline'} size={20} color="#8A8A8A" />
                  </TouchableOpacity>
                </View>

                {/* Kayıt Butonu */}
                <TouchableOpacity
                  style={[styles.registerButton, isSubmitting && styles.registerButtonDisabled]}
                  onPress={handleRegister}
                  disabled={isSubmitting}
                  activeOpacity={0.8}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="#FFF" />
                  ) : (
                    <Text style={styles.registerButtonText}>Hesap Oluştur</Text>
                  )}
                </TouchableOpacity>

                {/* Hesabın Var Mı */}
                <View style={styles.bottomLinksContainer}>
                  <Text style={styles.footerText}>Zaten hesabınız var mı?</Text>
                  <TouchableOpacity style={styles.loginLinkContainer} onPress={() => navigation.goBack()}>
                    <Text style={styles.loginLinkText}>Giriş Yap <Ionicons name="arrow-forward" size={14} color="#E02020" /></Text>
                  </TouchableOpacity>
                </View>
              </View>

            </Animated.View>

            {/* Footer */}
            <View style={styles.appFooterContainer}>
              <Text style={styles.appFooterText}>v2.2 © Belek University IT Services</Text>
            </View>

          </ScrollView>
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
    zIndex: 1,
  },
  orbContainer: {
    position: 'absolute',
    width: 400,
    height: 400,
    justifyContent: 'center',
    alignItems: 'center',
  },
  orbLayer: {
    position: 'absolute',
    backgroundColor: '#E02020',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 10,
  },
  titleWhite: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  subtitleGray: {
    fontSize: 12,
    color: '#9E8B8B',
    marginTop: Spacing.sm,
    textAlign: 'center',
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  formContainer: {
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
    marginBottom: Spacing.md,
    height: 60,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
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
  inputStyleWithoutIcon: {
    flex: 1,
    color: '#FFF',
    fontSize: 15,
    height: '100%',
    paddingHorizontal: 16,
  },
  eyeIcon: {
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  registerButton: {
    backgroundColor: '#E02020',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.lg,
    shadowColor: '#E02020',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
  },
  registerButtonDisabled: {
    opacity: 0.7,
  },
  registerButtonText: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  bottomLinksContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
    paddingHorizontal: 4,
  },
  footerText: {
    fontSize: 14,
    color: '#8A7A7A',
    fontWeight: '600',
    marginRight: 8,
  },
  loginLinkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loginLinkText: {
    color: '#E02020',
    fontSize: 14,
    fontWeight: '700',
  },
  appFooterContainer: {
    marginTop: Spacing.xxl,
    alignItems: 'center',
    paddingBottom: Spacing.md,
  },
  appFooterText: {
    color: '#4A3030',
    fontSize: 11,
    fontWeight: '600',
  },
});