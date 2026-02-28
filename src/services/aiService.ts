import api from './api';

export const aiService = {
  askQuestion: async (message: string) => {
    try {
      // Backend'deki modelle (AiChatRequest.cs) tam uyum için "Message" olarak gönderiyoruz
      const response = await api.post('/aichat/ask', { Message: message });
      return response.data;
    } catch (error) {
      console.error("AI API Hatası:", error);
      throw error;
    }
  }
};