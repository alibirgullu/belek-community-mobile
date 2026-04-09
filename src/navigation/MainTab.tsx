import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Platform, View, StyleSheet, Text } from 'react-native';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import Colors from '../theme/colors';
import { Spacing, Radii } from '../theme/commonStyles';
import { useTranslation } from 'react-i18next';

import HomeStack from './HomeStack';
import ProfileStack from './ProfileStack';
import ExploreStack from './ExploreStack'; // We use ExploreStack for Topluluk

import CustomTabBar from '../components/CustomTabBar';

const Tab = createBottomTabNavigator();

export default function MainTab() {
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={({ route }) => {
        const routeName = getFocusedRouteNameFromRoute(route) ?? '';
        return {
          headerShown: false,
          tabBarHideOnKeyboard: true,
          tabBarStyle: routeName === 'AiChat' ? { display: 'none' } : undefined,
        };
      }}
    >
      <Tab.Screen name="Ana Sayfa" component={HomeStack} />
      <Tab.Screen name="Topluluk" component={ExploreStack} />
      <Tab.Screen name="Profil" component={ProfileStack} />
    </Tab.Navigator>
  );
}