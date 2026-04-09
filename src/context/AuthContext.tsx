import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { User } from '../types';
import api from '../services/api';

// Handle incoming notifications while app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Helper function to register for push notifications
async function registerForPushNotificationsAsync() {
  // Expo Go check (SDK 53+ blocks getting push tokens in Expo Go)
  if (Constants.appOwnership === 'expo') {
      console.log('🚧 Push Bildirimleri (Remote) Expo Go (SDK 53+) desteklenmemektedir.');
      console.log('Test etmek için "npx expo run:android" veya EAS Build Development Client gereklidir.');
      return null; // Token alınmamasını sağlar, app'i çökertmez.
  }

  let token;
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      console.log('Push bildirim izni verilmedi!');
      return null;
    }
    
    // Explicitly ask for Expo push token
    try {
        const tokenData = await Notifications.getExpoPushTokenAsync();
        token = tokenData.data;
    } catch (e) {
        console.log("ExpoPushToken Error:", e);
    }
  } else {
    console.log('Push bildirimleri sadece fiziksel mobil cihazlarda çalışır.');
  }

  return token;
}

// Context içinde tutacağımız verilerin tipleri
interface AuthContextData {
  userToken: string | null;
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  isLoading: boolean;
  login: (token: string, userData?: User) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [userToken, setUserToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Uygulama ilk açıldığında hafızada token var mı diye bakar
  const checkToken = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const userData = await AsyncStorage.getItem('userData');

      if (token) {
        setUserToken(token);
        try {
          // Token var ise güncel kullanıcı verisini API'den çek
          const response = await api.get('/users/me');
          setUser(response.data);
          await AsyncStorage.setItem('userData', JSON.stringify(response.data));

          // Sync Push Token with Backend silently
          try {
             const pushToken = await registerForPushNotificationsAsync();
             if (pushToken) {
                await api.post('/users/devices', {
                   deviceToken: pushToken,
                   deviceType: Platform.OS,
                   deviceName: Device.modelName || 'Device'
                });
             }
          } catch (syncError) {
             console.log('CheckToken: Cihaz tokeni sunucuya iletilemedi', syncError);
          }

        } catch (apiError) {
          console.log('API Kullanıcı verisi çekme hatası (checkToken):', apiError);
          // İnternet veya sunucu kaynaklı hataysa eski datayı kullan
          if (userData) {
            setUser(JSON.parse(userData));
          }
        }
      }
    } catch (e) {
      console.log('Token veya Kullanıcı okuma hatası:', e);
    } finally {
      // Delay so splash screen animation completes smoothly
      setTimeout(() => {
        setIsLoading(false);
      }, 1500);
    }
  };

  useEffect(() => {
    checkToken();
  }, []);

  const login = async (token: string, userData?: User) => {
    setIsLoading(true);
    try {
      await AsyncStorage.setItem('userToken', token);
      setUserToken(token);

      // Token hafızaya ve state'e yazıldıktan sonra doğrudan profil verisini güncel olarak çek
      try {
        const response = await api.get('/users/me');
        const freshUser = response.data;
        setUser(freshUser);
        await AsyncStorage.setItem('userData', JSON.stringify(freshUser));

        // Sync Push Token with Backend on Login
        try {
           const pushToken = await registerForPushNotificationsAsync();
           if (pushToken) {
              await api.post('/users/devices', {
                 deviceToken: pushToken,
                 deviceType: Platform.OS,
                 deviceName: Device.modelName || 'Device'
              });
           }
        } catch (syncError) {
           console.log('Login: Cihaz tokeni sunucuya iletilemedi', syncError);
        }

      } catch (apiError) {
        console.log('Login esnasında API Kullanıcı bilgisi hatası:', apiError);
        // Fallback olarak login metodundan dönen veriyi kayıt et
        if (userData) {
          await AsyncStorage.setItem('userData', JSON.stringify(userData));
          setUser(userData);
        }
      }

    } catch (e) {
      console.log('Token kaydetme hatası:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
      setUserToken(null);
      setUser(null);
    } catch (e) {
      console.log('Token silme hatası:', e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ userToken, user, setUser, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};