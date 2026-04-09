import './src/locales/i18n';
import React, { useContext } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Navigasyon Yığınlarımız
import AuthStack from './src/navigation/AuthStack';
import MainTab from './src/navigation/MainTab';

// Context (Global State)
import { AuthProvider, AuthContext } from './src/context/AuthContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import SplashScreen from './src/screens/SplashScreen';

// İçerdeki yönlendirmeyi yönetecek alt component
const AppNav = () => {
  const { isLoading, userToken } = useContext(AuthContext);
  const { isDark, colors } = useTheme();

  const CustomTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      primary: colors.primary,
      background: colors.background,
      card: colors.surface,
      text: colors.text,
      border: colors.border,
    },
  };

  // Uygulama ilk açılırken cihaz hafızasından token okunuyorsa spinner (yükleniyor) göster
  if (isLoading) {
    return <SplashScreen />;
  }

  // Token varsa ana uygulamaya (MainTab), yoksa giriş ekranına (AuthStack) yönlendir
  return (
    <NavigationContainer theme={CustomTheme}>
      {userToken !== null ? <MainTab /> : <AuthStack />}
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <AuthProvider>
          <AppNav />
        </AuthProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}