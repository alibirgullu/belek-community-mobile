import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import AiChatScreen from '../screens/AiChatScreen';
import EventDetailScreen from '../screens/EventDetailScreen';
import NotificationsScreen from '../screens/NotificationsScreen'; // newly added import
import EditEventScreen from '../screens/EditEventScreen'; // newly added import
import { Event } from '../types';

export type HomeStackParamList = {
  HomeMain: undefined;
  AiChat: undefined;
  EventDetail: { event: Event };
  Notifications: undefined;
  EditEvent: { event: Event };
};

const Stack = createNativeStackNavigator<HomeStackParamList>();

export default function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="AiChat" component={AiChatScreen} />
      <Stack.Screen name="EventDetail" component={EventDetailScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="EditEvent" component={EditEventScreen} />
    </Stack.Navigator>
  );
}