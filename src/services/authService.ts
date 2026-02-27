import api from './api';

export const authService = {
  login: async (email: string, password: string) => {
    try {
      // Endpoint '/auth/login' yerine backend'indeki gibi '/users/login' olarak güncellendi
      const response = await api.post('/users/login', { 
        email: email, 
        password: password 
      });
      return response.data;
    } catch (error) {
      console.error("Login API Hatası:", error);
      throw error; // Hatayı LoginScreen'e fırlat ki loading state'i false'a çekebilsin
    }
  },

  register: async (userData: any) => {
    const response = await api.post('/users/register', userData);
    return response.data;
  }
};