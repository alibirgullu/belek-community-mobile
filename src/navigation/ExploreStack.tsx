import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ExploreScreen from '../screens/ExploreScreen';
import CommunityDetailScreen from '../screens/CommunityDetailScreen';

export type ExploreStackParamList = {
  ExploreMain: undefined;
  CommunityDetail: { communityId: number; communityName: string };
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
        options={({ route }) => ({ 
          title: route.params.communityName,
          headerTintColor: '#C62828',
          headerTitleStyle: { color: '#1A1A1A' }
        })} 
      />
    </Stack.Navigator>
  );
}