import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  ActivityIndicator, 
  TouchableOpacity,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient'; // Gradient kütüphanesi eklendi
import api from '../services/api';
import { Event } from '../types';

// Takvimi Türkçe yapmak için ayarlar (Senin yazdığın orijinal mantık korunuyor)
LocaleConfig.locales['tr'] = {
  monthNames: ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'],
  monthNamesShort: ['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'],
  dayNames: ['Pazar','Pazartesi','Salı','Çarşamba','Perşembe','Cuma','Cumartesi'],
  dayNamesShort: ['Paz','Pzt','Sal','Çar','Per','Cum','Cmt'],
  today: 'Bugün'
};
LocaleConfig.defaultLocale = 'tr';

export default function HomeScreen() {
  const [events, setEvents] = useState<Event[]>([]);
  const [markedDates, setMarkedDates] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);

  const fetchEvents = async () => {
    try {
      const response = await api.get('/events');
      const fetchedEvents: Event[] = response.data;
      
      setEvents(fetchedEvents);

      const marks: any = {};
      fetchedEvents.forEach(event => {
        const dateKey = event.startDate.split('T')[0];
        // Belek Kırmızısı (#D32F2F) ile işaretleme
        marks[dateKey] = { marked: true, dotColor: '#D32F2F' };
      });
      
      setMarkedDates(marks);
    } catch (error) {
      console.log('Etkinlikleri çekerken hata:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const renderEventCard = ({ item }: { item: Event }) => {
    const dateObj = new Date(item.startDate);
    const formattedTime = dateObj.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

    return (
      <TouchableOpacity style={styles.eventCard}>
        <View style={styles.eventDateBadge}>
          <Text style={styles.eventDateNumber}>{dateObj.getDate()}</Text>
          <Text style={styles.eventDateMonth}>{LocaleConfig.locales['tr'].monthNamesShort[dateObj.getMonth()]}</Text>
        </View>

        <View style={styles.eventInfo}>
          <Text style={styles.eventTitle} numberOfLines={2}>{item.title}</Text>
          <Text style={styles.communityName}>{item.community?.name || 'Topluluk'}</Text>
          
          <View style={styles.eventDetails}>
            <View style={styles.detailRow}>
              <Ionicons name="time-outline" size={14} color="#D32F2F" />
              <Text style={styles.detailText}>{formattedTime}</Text>
            </View>
            {item.location && (
              <View style={styles.detailRow}>
                <Ionicons name="location-outline" size={14} color="#D32F2F" />
                <Text style={styles.detailText} numberOfLines={1}>{item.location}</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#D32F2F" />
        <Text style={{ marginTop: 10, color: '#666' }}>Etkinlikler yükleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#B71C1C" />
      
      {/* Üst Kırmızı Gradient Karşılama Alanı */}
      <LinearGradient
        // Koyu Bordo -> Ana Belek Kırmızısı -> Parlak Kırmızı (3'lü geçiş)
        colors={['#640000', '#D32F2F', '#E53935']} 
        style={styles.header}
        start={{ x: 0, y: 0.5 }} // Tam soldan başla
        end={{ x: 1, y: 0.5 }}   // Tam sağa doğru git
      >
        <SafeAreaView>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.greeting}>Merhaba!</Text>
              <Text style={styles.subGreeting}>Kampüste bugün neler var?</Text>
            </View>
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>BU</Text>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <FlatList
        ListHeaderComponent={
          <>
            <View style={styles.calendarContainer}>
              <Calendar
                markedDates={markedDates}
                theme={{
                  backgroundColor: '#ffffff',
                  calendarBackground: '#ffffff',
                  textSectionTitleColor: '#1A1A1A',
                  selectedDayBackgroundColor: '#D32F2F',
                  selectedDayTextColor: '#ffffff',
                  todayTextColor: '#D32F2F',
                  dayTextColor: '#1A1A1A',
                  textDisabledColor: '#d9e1e8',
                  dotColor: '#D32F2F',
                  selectedDotColor: '#ffffff',
                  arrowColor: '#D32F2F',
                  monthTextColor: '#1A1A1A',
                  textMonthFontWeight: 'bold',
                  textDayFontWeight: '500',
                }}
              />
            </View>
            <Text style={styles.listTitle}>Yaklaşan Etkinlikler</Text>
          </>
        }
        data={events}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderEventCard}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Şu an planlanmış bir etkinlik bulunmuyor.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' }, // Biraz daha temiz bir gri tonu
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FAFAFA' },
  header: {
    // backgroundColor kaldırıldı, LinearGradient kullanılıyor
    paddingHorizontal: 24,
    paddingBottom: 40, // Mesafeyi açmak için alt padding artırıldı
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 15 },
  greeting: { fontSize: 28, fontWeight: 'bold', color: '#FFFFFF' },
  subGreeting: { fontSize: 15, color: '#FFCDD2', marginTop: 4, fontWeight: '500' },
  avatarPlaceholder: { width: 50, height: 50, backgroundColor: '#FFFFFF', borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#D32F2F', fontSize: 18, fontWeight: '900' },
  listContainer: { paddingBottom: 20 },
  calendarContainer: {
    margin: 16,
    marginTop: 20, // Kırmızı header'dan uzaklaştırmak için pozitif margin verildi
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  listTitle: { fontSize: 20, fontWeight: '800', color: '#1A1A1A', marginLeft: 16, marginBottom: 12 },
  emptyText: { color: '#6c757d', fontStyle: 'italic', textAlign: 'center', marginTop: 20 },
  eventCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
  },
  eventDateBadge: {
    backgroundColor: '#FFF0F0',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    width: 65,
  },
  eventDateNumber: { color: '#D32F2F', fontSize: 22, fontWeight: '900' },
  eventDateMonth: { color: '#D32F2F', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', marginTop: 2 },
  eventInfo: { flex: 1, justifyContent: 'center' },
  eventTitle: { fontSize: 16, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 4 },
  communityName: { fontSize: 13, color: '#6c757d', marginBottom: 8, fontWeight: '500' },
  eventDetails: { flexDirection: 'row', gap: 12 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  detailText: { fontSize: 12, color: '#495057', fontWeight: '500' }
});