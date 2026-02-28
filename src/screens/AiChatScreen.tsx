import React, { useState, useRef, useEffect } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  FlatList, KeyboardAvoidingView, Platform, ActivityIndicator 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { aiService } from '../services/aiService';

// Mesaj tipimiz
interface Message {
  id: string;
  text: string;
  isUser: boolean;
}

export default function AiChatScreen() {
  const navigation = useNavigation();
  const flatListRef = useRef<FlatList>(null);
  
  // İlk açılışta AI'dan gelen bir selamlama mesajı
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: 'Merhaba! Ben Belek AI. Üniversitemizdeki topluluklar ve yaklaşan etkinlikler hakkında sana nasıl yardımcı olabilirim?', isUser: false }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), text: inputText, isUser: true };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      const data = await aiService.askQuestion(userMsg.text);
      
      const botMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        // Backend'deki DTO'na göre response ya data.response ya da data.Response olarak gelir
        text: data.Response || data.response || "Üzgünüm, bir cevap alamadım.", 
        isUser: false 
      };
      
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      const errorMsg: Message = { id: (Date.now() + 1).toString(), text: "Bağlantı hatası oluştu. Lütfen tekrar dene.", isUser: false };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  // Yeni mesaj geldiğinde otomatik en alta kaydır
  useEffect(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 200);
  }, [messages, isTyping]);

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[styles.messageBubble, item.isUser ? styles.userBubble : styles.aiBubble]}>
      {!item.isUser && <Ionicons name="sparkles" size={16} color="#D32F2F" style={{ marginRight: 6, marginTop: 2 }} />}
      <Text style={[styles.messageText, item.isUser ? styles.userText : styles.aiText]}>
        {item.text}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Üst Bar */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-down" size={28} color="#1A1A1A" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Ionicons name="hardware-chip-outline" size={24} color="#D32F2F" />
          <Text style={styles.headerTitle}>Belek AI Asistan</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView 
        style={styles.chatContainer} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
        />

        {isTyping && (
          <View style={styles.typingIndicator}>
            <ActivityIndicator size="small" color="#D32F2F" />
            <Text style={styles.typingText}>Belek AI düşünüyor...</Text>
          </View>
        )}

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Etkinlikleri veya toplulukları sor..."
            placeholderTextColor="#999"
            value={inputText}
            onChangeText={setInputText}
            multiline
          />
          <TouchableOpacity 
            style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]} 
            onPress={sendMessage}
            disabled={!inputText.trim() || isTyping}
          >
            <Ionicons name="send" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  backButton: { width: 40, height: 40, justifyContent: 'center' },
  headerTitleContainer: { flexDirection: 'row', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1A1A1A', marginLeft: 8 },
  chatContainer: { flex: 1 },
  messageList: { padding: 16, paddingBottom: 20 },
  messageBubble: { maxWidth: '85%', padding: 14, borderRadius: 20, marginBottom: 12, flexDirection: 'row' },
  userBubble: { alignSelf: 'flex-end', backgroundColor: '#D32F2F', borderBottomRightRadius: 4 },
  aiBubble: { alignSelf: 'flex-start', backgroundColor: '#FFF', borderBottomLeftRadius: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  messageText: { fontSize: 15, lineHeight: 22, flexShrink: 1 },
  userText: { color: '#FFF' },
  aiText: { color: '#1A1A1A' },
  typingIndicator: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 10 },
  typingText: { marginLeft: 8, color: '#666', fontSize: 13, fontStyle: 'italic' },
  inputContainer: { flexDirection: 'row', padding: 12, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#E2E8F0', alignItems: 'flex-end' },
  input: { flex: 1, backgroundColor: '#F7FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 20, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12, fontSize: 15, maxHeight: 100, color: '#1A1A1A' },
  sendButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#D32F2F', justifyContent: 'center', alignItems: 'center', marginLeft: 12, marginBottom: 2 },
  sendButtonDisabled: { backgroundColor: '#E57373' }
});