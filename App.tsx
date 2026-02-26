import React, { useContext } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';

// Navigasyon Yığınlarımız
import AuthStack from './src/navigation/AuthStack';
import MainTab from './src/navigation/MainTab';

// Context (Global State)
import { AuthProvider, AuthContext } from './src/context/AuthContext';

// İçerdeki yönlendirmeyi yönetecek alt component
const AppNav = () => {
  const { isLoading, userToken } = useContext(AuthContext);

  // Uygulama ilk açılırken cihaz hafızasından token okunuyorsa spinner (yükleniyor) göster
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8F9FA' }}>
        <ActivityIndicator size="large" color="#C62828" />
      </View>
    );
  }

  // Token varsa ana uygulamaya (MainTab), yoksa giriş ekranına (AuthStack) yönlendir
  return (
    <NavigationContainer>
      {userToken !== null ? <MainTab /> : <AuthStack />}
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppNav />
    </AuthProvider>
  );
}