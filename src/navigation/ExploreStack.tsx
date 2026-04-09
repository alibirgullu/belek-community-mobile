import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ExploreScreen from '../screens/ExploreScreen';
import CommunityDetailScreen from '../screens/CommunityDetailScreen';
import EventDetailScreen from '../screens/EventDetailScreen';
import Colors from '../theme/colors';
import { Event } from '../types';

export type ExploreStackParamList = {
  ExploreMain: undefined;
  CommunityDetail: { communityId: number; communityName: string };
  EventDetail: { event: Event };
};

const Stack = createNativeStackNavigator<ExploreStackParamList>();

export default function ExploreStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ExploreMain"
        component={ExploreScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CommunityDetail"
        component={CommunityDetailScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="EventDetail"
        component={EventDetailScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}