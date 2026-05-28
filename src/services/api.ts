import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';


// Android emülatöründen host PC'ye erişim için 10.0.2.2 kullanılır (emülatörün özel loopback'i).
// Fiziksel cihaz testi için PC'nin Wi-Fi IP'si ile değiştirilmeli (örn: 10.63.12.124).
const BASE_URL = 'http://10.0.2.2:5267/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Oturum-yalnız (Beni Hatırla = kapalı) modda token'lar disk yerine bellekte tutulur,
// böylece uygulama kapandığında oturum sona erer.
let memAccessToken: string | null = null;
let memRefreshToken: string | null = null;
let persistTokens: boolean = true;

export const setAuthTokens = (accessToken: string | null, refreshToken: string | null, persist: boolean = true) => {
  memAccessToken = accessToken;
  memRefreshToken = refreshToken;
  persistTokens = persist;
};

export const clearAuthTokensMemory = () => {
  memAccessToken = null;
  memRefreshToken = null;
};

const readAccessToken = async (): Promise<string | null> => {
  if (memAccessToken) return memAccessToken;
  return await AsyncStorage.getItem('userToken');
};

const readRefreshToken = async (): Promise<string | null> => {
  if (memRefreshToken) return memRefreshToken;
  return await AsyncStorage.getItem('refreshToken');
};

// İSTEK ARAYA GİRİCİSİ (REQUEST INTERCEPTOR)
api.interceptors.request.use(
  async (config) => {
    const token = await readAccessToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// YANIT ARAYA GİRİCİSİ — 401 alındığında refresh token ile sessiz yenileme
// Aynı anda birden fazla istek 401 alırsa, hepsi tek bir refresh çağrısını bekler.
let refreshPromise: Promise<string | null> | null = null;
let onLogout: (() => Promise<void>) | null = null;

export const setOnLogoutHandler = (handler: () => Promise<void>) => {
  onLogout = handler;
};

const performRefresh = async (): Promise<string | null> => {
  const refreshToken = await readRefreshToken();
  if (!refreshToken) return null;

  try {
    // Interceptor'sız ayrı bir axios çağrısı — yoksa kendi 401'i tekrar refresh tetikler.
    const response = await axios.post(`${BASE_URL}/users/refresh`, { refreshToken });
    const { accessToken, refreshToken: newRefresh } = response.data;

    if (!accessToken || !newRefresh) return null;

    memAccessToken = accessToken;
    memRefreshToken = newRefresh;
    if (persistTokens) {
      await AsyncStorage.setItem('userToken', accessToken);
      await AsyncStorage.setItem('refreshToken', newRefresh);
    }
    return accessToken;
  } catch (err) {
    clearAuthTokensMemory();
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('refreshToken');
    if (onLogout) {
      try { await onLogout(); } catch (_) { /* yutuyoruz */ }
    }
    return null;
  }
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as (AxiosRequestConfig & { _retry?: boolean }) | undefined;

    // 401 değilse veya zaten bir kez denediysek, doğrudan reddet.
    if (
      !originalRequest ||
      error.response?.status !== 401 ||
      originalRequest._retry ||
      originalRequest.url?.includes('/users/refresh') ||
      originalRequest.url?.includes('/users/login')
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (!refreshPromise) {
      refreshPromise = performRefresh().finally(() => {
        refreshPromise = null;
      });
    }

    const newToken = await refreshPromise;

    if (!newToken) {
      return Promise.reject(error);
    }

    originalRequest.headers = originalRequest.headers ?? {};
    (originalRequest.headers as any).Authorization = `Bearer ${newToken}`;
    return api(originalRequest);
  }
);

export const notificationService = {
  getMyNotifications: async () => {
    return api.get('/notifications');
  },
  getUnreadCount: async () => {
    return api.get('/notifications/unread-count');
  },
  markAsRead: async (id: number) => {
    return api.put(`/notifications/${id}/read`);
  },
  markAllAsRead: async () => {
    return api.put('/notifications/read-all');
  },
  clearAll: async () => {
    return api.delete('/notifications/clear-all');
  },
  deleteNotification: async (id: number) => {
    return api.delete(`/notifications/${id}`);
  }
};

export const eventService = {
  updateEvent: async (id: number, data: any) => {
    return api.put(`/events/${id}`, data);
  },
  cancelEvent: async (id: number) => {
    return api.put(`/events/${id}/cancel`);
  },
  createAnnouncement: async (communityId: number, data: any) => {
    return api.post(`/communities/${communityId}/announcements`, data);
  }
};

export const communityService = {
  joinCommunity: async (communityId: number) => {
    return api.post(`/communities/${communityId}/members/join`);
  },
  leaveCommunity: async (communityId: number, platformUserId: number) => {
    return api.delete(`/communities/${communityId}/members/${platformUserId}`);
  }
};

export default api;
