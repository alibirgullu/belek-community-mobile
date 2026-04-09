import React, { useState, useContext, useEffect, useRef } from 'react';
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
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import { authService } from '../services/authService';
import { useTranslation } from 'react-i18next';
import { Spacing } from '../theme/commonStyles';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';

const GlowingOrb = ({ positionStyle }: { positionStyle: any }) => {
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
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

export default function LoginScreen() {
  const navigation = useNavigation<any>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t } = useTranslation();
  const { login } = useContext(AuthContext);

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

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert(t('login.warningTitle'), t('login.warningMsg'));
      return;
    }

    setIsSubmitting(true);
    try {
      const data = await authService.login(email, password);

      if (data && data.token) {

        await login(data.token, data.user);
      }
    } catch (error: any) {
      const serverMessage = error.response?.data?.message || error.response?.data?.Message || error.response?.data?.reason;
      Alert.alert(t('login.errorTitle'), serverMessage || t('login.defaultError'));
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <LinearGradient colors={['#1A0000', '#2D0505']} style={styles.gradientBackground}>
      {/* Multi-layered Animated Ambient Glowing Orbs */}
      <GlowingOrb positionStyle={{ top: -150, left: -150 }} />
      <GlowingOrb positionStyle={{ bottom: -150, right: -150 }} />

      <SafeAreaView style={styles.transparentSafeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
        >
          <Animated.View style={[{ flex: 1, justifyContent: 'center' }, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>

            <View style={styles.headerContainer}>
              <View style={styles.logoRedContainer}>
                <Ionicons name="layers" size={36} color="#FFF" />
              </View>
              <Text style={styles.titleWhite}>Belek Topluluk</Text>
              <Text style={styles.subtitleGray}>KAMPÜS HAYATINA BAĞLAN</Text>
            </View>

            <View style={styles.formContainer}>
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

              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color="#8A8A8A" style={styles.inputIcon} />
                <TextInput
                  style={styles.inputStyle}
                  placeholder="OBS / E-posta Şifresi"
                  placeholderTextColor="#8A8A8A"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!isPasswordVisible}
                />
                <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)} style={styles.eyeIcon}>
                  <Ionicons name={isPasswordVisible ? 'eye-outline' : 'eye-off-outline'} size={20} color="#8A8A8A" />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.loginButton, isSubmitting && styles.loginButtonDisabled]}
                onPress={handleLogin}
                disabled={isSubmitting}
                activeOpacity={0.8}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.loginButtonText}>Giriş Yap</Text>
                )}
              </TouchableOpacity>

              <View style={styles.bottomLinksContainer}>
                <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                  <Text style={styles.forgotPasswordText}>Şifremi Unuttum</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.registerLinkContainer} onPress={() => navigation.navigate('Register')}>
                  <Text style={styles.registerLinkText}>Kayıt Ol <Ionicons name="arrow-forward" size={14} color="#E02020" /></Text>
                </TouchableOpacity>
              </View>
            </View>

          </Animated.View>

          {/* Footer */}
          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>v2.2 © Belek University IT Services</Text>
          </View>
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
  container: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoRedContainer: {
    width: 80,
    height: 80,
    backgroundColor: '#E02020',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    shadowColor: '#E02020',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 15,
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
  eyeIcon: {
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  loginButton: {
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
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  bottomLinksContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 30,
    paddingHorizontal: 4,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#8A7A7A',
    fontWeight: '600',
  },
  registerLinkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  registerLinkText: {
    color: '#E02020',
    fontSize: 14,
    fontWeight: '700',
  },
  footerContainer: {
    paddingBottom: Spacing.lg,
    alignItems: 'center',
  },
  footerText: {
    color: '#4A3030',
    fontSize: 11,
    fontWeight: '600',
  },
});
