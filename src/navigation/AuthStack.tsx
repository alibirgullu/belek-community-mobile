import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Mevcut Giriş ve Kayıt Ekranları
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import VerifyScreen from '../screens/VerifyScreen';

// Yeni Eklenen Şifre Sıfırlama Ekranları
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import ResetPasswordScreen from '../screens/ResetPasswordScreen';

// Sayfalar arası geçişlerde hangi verilerin taşınacağını (TypeScript tiplerini) belirliyoruz
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  VerifyEmail: { email: string }; 
  ForgotPassword: undefined;
  ResetPassword: { email: string }; 
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* İlk açılacak ekran Login */}
      <Stack.Screen name="Login" component={LoginScreen} />
      
      {/* Kayıt Süreci Ekranları */}
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="VerifyEmail" component={VerifyScreen} />
      
      {/* Şifre Sıfırlama Süreci Ekranları */}
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
    </Stack.Navigator>
  );
}