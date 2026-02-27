import api from './api';
import { Community, CommunityDetail } from '../types';

export const communityService = {
  // Tüm toplulukları listeleyen endpoint
  getAllCommunities: async (): Promise<Community[]> => {
    const response = await api.get('/communities');
    return response.data;
  },

  // Tek bir topluluğun detaylarını (etkinlikler, duyurular vb.) getiren endpoint
  getCommunityDetails: async (id: number): Promise<CommunityDetail> => {
    const response = await api.get(`/communities/${id}`);
    return response.data;
  }
};