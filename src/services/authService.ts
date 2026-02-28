import api from './api';

export const authService = {
  login: async (email: string, password: string) => {
    try {
      const response = await api.post('/users/login', { email, password });
      return response.data;
    } catch (error) {
      console.error("Login API Hatası:", error);
      throw error; 
    }
  },

  register: async (firstName: string, lastName: string, email: string, password: string) => {
    try {
      // Backend UserType'ı da bekleyebilir, şimdilik varsayılan 'Student' geçiyoruz
      const response = await api.post('/users/register', {
        firstName,
        lastName,
        email,
        password,
        userType: 'Student' 
      });
      return response.data;
    } catch (error) {
      console.error("Register API Hatası:", error);
      throw error;
    }
  },
forgotPassword: async (email: string) => {
    try {
      const response = await api.post('/users/forgot-password', { email });
      return response.data;
    } catch (error) {
      console.error("Forgot Password API Hatası:", error);
      throw error;
    }
  },

  resetPassword: async (email: string, token: string, newPassword: string) => {
    try {
      const response = await api.post('/users/reset-password', { email, token, newPassword });
      return response.data;
    } catch (error) {
      console.error("Reset Password API Hatası:", error);
      throw error;
    }
  },
  
  verifyEmail: async (email: string, code: string) => {
    try {
      const response = await api.post('/users/verify-email', { email, code });
      return response.data;
    } catch (error) {
      console.error("Verify API Hatası:", error);
      throw error;
    }
  }
  
};