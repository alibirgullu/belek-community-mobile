import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  ActivityIndicator, 
  TouchableOpacity 
} from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import { Event } from '../types';

// Takvimi Türkçe yapmak için ufak bir ayar
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

  // Sayfa açıldığında verileri çekecek fonksiyon
  const fetchEvents = async () => {
    try {
      // Backend'deki EventsController -> GetAll metoduna istek atıyoruz
      const response = await api.get('/events');
      const fetchedEvents: Event[] = response.data;
      
      setEvents(fetchedEvents);

      // Takvim için tarihleri { '2026-03-15': { marked: true, dotColor: '#C62828' } } formatına çeviriyoruz
      const marks: any = {};
      fetchedEvents.forEach(event => {
        // "2026-03-15T14:30:00" stringinden sadece "2026-03-15" kısmını alıyoruz
        const dateKey = event.startDate.split('T')[0];
        marks[dateKey] = { marked: true, dotColor: '#C62828' };
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

  // Tekil bir etkinlik kartı tasarımı
  const renderEventCard = ({ item }: { item: Event }) => {
    // Tarihi daha okunaklı formata (GG.AA.YYYY HH:MM) çeviriyoruz
    const dateObj = new Date(item.startDate);
    const formattedDate = dateObj.toLocaleDateString('tr-TR');
    const formattedTime = dateObj.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

    return (
      <TouchableOpacity style={styles.eventCard}>
        <View style={styles.eventHeader}>
          <Text style={styles.eventTitle}>{item.title}</Text>
          <Text style={styles.communityName}>{item.community?.name || 'Topluluk'}</Text>
        </View>
        
        <View style={styles.eventDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={16} color="#C62828" />
            <Text style={styles.detailText}>{formattedDate} - {formattedTime}</Text>
          </View>
          
          {item.location && (
            <View style={styles.detailRow}>
              <Ionicons name="location-outline" size={16} color="#C62828" />
              <Text style={styles.detailText}>{item.location}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#C62828" />
        <Text style={{ marginTop: 10, color: '#666' }}>Etkinlikler yükleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* TAKVİM BÖLÜMÜ */}
      <Calendar
        markedDates={markedDates}
        theme={{
          backgroundColor: '#ffffff',
          calendarBackground: '#ffffff',
          textSectionTitleColor: '#1A1A1A',
          selectedDayBackgroundColor: '#C62828',
          selectedDayTextColor: '#ffffff',
          todayTextColor: '#C62828',
          dayTextColor: '#2d4150',
          textDisabledColor: '#d9e1e8',
          dotColor: '#C62828',
          selectedDotColor: '#ffffff',
          arrowColor: '#C62828',
          monthTextColor: '#1A1A1A',
          textMonthFontWeight: 'bold',
        }}
        style={styles.calendar}
      />

      {/* ETKİNLİK LİSTESİ BÖLÜMÜ */}
      <View style={styles.listContainer}>
        <Text style={styles.listTitle}>Yaklaşan Etkinlikler</Text>
        
        {events.length === 0 ? (
          <Text style={styles.emptyText}>Şu an planlanmış bir etkinlik bulunmuyor.</Text>
        ) : (
          <FlatList
            data={events}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderEventCard}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  calendar: {
    marginBottom: 10,
    elevation: 4, // Android gölge
    shadowColor: '#000', // iOS gölge
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  listTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  emptyText: {
    color: '#6c757d',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 20,
  },
  eventCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#C62828', // Kırmızı vurgu şeridi
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  eventHeader: {
    marginBottom: 10,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  communityName: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 2,
    fontWeight: '600',
  },
  eventDetails: {
    gap: 6,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 14,
    color: '#495057',
  }
});