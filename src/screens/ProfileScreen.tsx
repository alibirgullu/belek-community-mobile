import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AuthContext } from '../context/AuthContext';

export default function ProfileScreen() {
  const { logout } = useContext(AuthContext);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profilim</Text>
      <Text style={{ marginBottom: 20 }}>Kullanıcı bilgileri burada yer alacak.</Text>
      
      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutText}>Çıkış Yap</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8F9FA' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 10 },
  logoutButton: { backgroundColor: '#C62828', paddingHorizontal: 30, paddingVertical: 12, borderRadius: 8 },
  logoutText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
});