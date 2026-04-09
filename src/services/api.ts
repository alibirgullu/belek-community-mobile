import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';


const BASE_URL = 'http://10.0.2.2:5267/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// İSTEK ARAYA GİRİCİSİ (REQUEST INTERCEPTOR)
api.interceptors.request.use(
  async (config) => {
    // Cihaz hafızasındaki token'ı oku
    const token = await AsyncStorage.getItem('userToken');

    // Eğer token varsa, isteğin Header kısmına Authorization: Bearer <token> formatında ekle
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
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