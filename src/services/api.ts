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

export default api;