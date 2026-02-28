import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import AiChatScreen from '../screens/AiChatScreen';

export type HomeStackParamList = {
  HomeMain: undefined;
  AiChat: undefined;
};

const Stack = createNativeStackNavigator<HomeStackParamList>();

export default function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="AiChat" component={AiChatScreen} />
    </Stack.Navigator>
  );
}