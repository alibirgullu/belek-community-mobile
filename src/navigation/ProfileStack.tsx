import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Ekranları çağırıyoruz
import ProfileScreen from '../screens/ProfileScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import JoinedCommunitiesScreen from '../screens/JoinedCommunitiesScreen';
import AdminCommunitiesScreen from '../screens/AdminCommunitiesScreen';
import CommunityAdminDashboardScreen from '../screens/CommunityAdminDashboardScreen';
import EditCommunityScreen from '../screens/EditCommunityScreen';
import CreateEventScreen from '../screens/CreateEventScreen';

export type ProfileStackParamList = {
  ProfileMain: undefined;
  EditProfile: undefined;
  Settings: undefined;
  JoinedCommunities: undefined;
  AdminCommunities: undefined;
  CommunityAdminDashboard: { communityId: number; communityName: string };
  EditCommunity: { communityId: number };
  CreateEvent: { communityId: number, communityName?: string };
  CreateAnnouncement: { communityId: number, communityName?: string };
};

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export default function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* Profil ana ekranı */}
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
      {/* Kişisel Bilgileri Düzenleme ekranı */}
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="JoinedCommunities" component={JoinedCommunitiesScreen} />
      <Stack.Screen name="AdminCommunities" component={AdminCommunitiesScreen} />
      <Stack.Screen name="CommunityAdminDashboard" component={CommunityAdminDashboardScreen} />
      <Stack.Screen name="EditCommunity" component={EditCommunityScreen} />
      <Stack.Screen name="CreateEvent" component={CreateEventScreen} />
      <Stack.Screen name="CreateAnnouncement" component={require('../screens/CreateAnnouncementScreen').default} />
    </Stack.Navigator>
  );
}