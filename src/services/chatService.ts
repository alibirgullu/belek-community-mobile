import api from './api';
import * as signalR from '@microsoft/signalr';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HUB_URL = 'http://10.0.2.2:5267/hubs/community-chat';

export const chatService = {
  getCommunityMessages: async (communityId: number, page: number = 1, pageSize: number = 50) => {
    return api.get(`/communities/${communityId}/messages`, {
      params: { page, pageSize }
    });
  },

  createHubConnection: async () => {
    const token = await AsyncStorage.getItem('userToken');

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(HUB_URL, {
        accessTokenFactory: () => token || ''
      })
      .withAutomaticReconnect()
      .build();

    return connection;
  },

  joinCommunity: (conn: signalR.HubConnection, communityId: number) =>
    conn.invoke('JoinCommunityGroup', communityId),

  leaveCommunity: (conn: signalR.HubConnection, communityId: number) =>
    conn.invoke('LeaveCommunityGroup', communityId),

  sendMessage: (conn: signalR.HubConnection, communityId: number, content: string) =>
    conn.invoke('SendMessageToCommunity', communityId, content),

  markAsRead: (conn: signalR.HubConnection, communityId: number, messageIds: string[]) =>
    conn.invoke('MarkAsRead', communityId, messageIds),

  startTyping: (conn: signalR.HubConnection, communityId: number) =>
    conn.invoke('StartTyping', communityId),

  stopTyping: (conn: signalR.HubConnection, communityId: number) =>
    conn.invoke('StopTyping', communityId),

  editMessage: (conn: signalR.HubConnection, communityId: number, messageId: string, newContent: string) =>
    conn.invoke('EditMessage', communityId, messageId, newContent),

  deleteMessage: (conn: signalR.HubConnection, communityId: number, messageId: string) =>
    conn.invoke('DeleteMessage', communityId, messageId),
};
