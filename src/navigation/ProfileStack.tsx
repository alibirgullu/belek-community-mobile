import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Ekranları çağırıyoruz
import ProfileScreen from '../screens/ProfileScreen';
import EditProfileScreen from '../screens/EditProfileScreen';

export type ProfileStackParamList = {
  ProfileMain: undefined;
  EditProfile: undefined;
};

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export default function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* Profil ana ekranı */}
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
      {/* Kişisel Bilgileri Düzenleme ekranı */}
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
    </Stack.Navigator>
  );
}