import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Platform, View, StyleSheet } from 'react-native';

// Daha önce oluşturduğumuz ekranlar
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
// Not: Keşfet menüsü içinde detay sayfasına da gidildiği için buraya ExploreScreen yerine ExploreStack'i veriyoruz
import ExploreStack from './ExploreStack'; 

const Tab = createBottomTabNavigator();

export default function MainTab() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false, // Header'ları (kırmızı kavisli alanları) her ekranın kendi içinde tasarladığımız için buradaki standart header'ı kapatıyoruz
        tabBarIcon: ({ focused, color }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';

          if (route.name === 'Ana Sayfa') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Keşfet') {
            iconName = focused ? 'compass' : 'compass-outline';
          } else if (route.name === 'Profil') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return (
            <View style={styles.iconContainer}>
              <Ionicons 
                name={iconName} 
                size={focused ? 26 : 24} // Seçiliyken ikon hafifçe büyür
                color={color} 
              />
              {/* Seçili olan sekmenin altına minik ve şık bir kırmızı nokta koyuyoruz */}
              {focused && <View style={styles.activeDot} />}
            </View>
          );
        },
        tabBarActiveTintColor: '#D32F2F', // Belek Kırmızısı
        tabBarInactiveTintColor: '#8E8E93', // Pasif sekmeler için standart gri
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarHideOnKeyboard: true, // Klavye açıldığında menünün klavyenin üstüne çıkmasını engeller
      })}
    >
      <Tab.Screen name="Ana Sayfa" component={HomeScreen} />
      <Tab.Screen name="Keşfet" component={ExploreStack} />
      <Tab.Screen name="Profil" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute', // Ekranın üzerine binmesini sağlar (Floating effect)
    bottom: Platform.OS === 'ios' ? 24 : 16, // Alt kısımdan boşluk
    left: 20,
    right: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 24, // Tam yuvarlak köşeler
    height: 70,
    elevation: 8, // Android için gölge
    shadowColor: '#000', // iOS için gölge
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    borderTopWidth: 0, // Varsayılan ince gri çizgiyi kaldırır
    paddingHorizontal: 10,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: Platform.OS === 'ios' ? 0 : 8,
    marginTop: -4,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Platform.OS === 'ios' ? 12 : 8,
    height: 32,
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D32F2F',
    position: 'absolute',
    bottom: -10,
  }
});