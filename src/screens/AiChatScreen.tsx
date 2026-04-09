import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StatusBar,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { aiService } from '../services/aiService';
import { useTranslation } from 'react-i18next';
import Colors from '../theme/colors';
import { CommonStyles, Typography, Spacing, Radii, Shadows } from '../theme/commonStyles';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
}

export default function AiChatScreen() {
  const navigation = useNavigation();
  const flatListRef = useRef<FlatList>(null);
  const { t } = useTranslation();

  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: t('aiChat.initialMessage'), isUser: false },
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
        text: data.Response || data.response || t('aiChat.defaultResponse'),
        isUser: false
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      const errorMsg: Message = { id: (Date.now() + 1).toString(), text: t('aiChat.errorResponse'), isUser: false };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 200);
  }, [messages, isTyping]);

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.isUser;
    return (
      <View style={[styles.bubbleWrapper, isUser ? styles.bubbleWrapperUser : styles.bubbleWrapperAI]}>
        {!isUser && (
          <View style={styles.aiAvatar}>
            <Image
              source={require('../../assets/antalya-belek-uni.png')}
              style={{ width: 16, height: 16 }}
              resizeMode="contain"
            />
          </View>
        )}
        <View style={[
          styles.messageBubble,
          isUser ? styles.userBubble : styles.aiBubble
        ]}>
          <Text style={[styles.messageText, isUser ? styles.userText : styles.aiText]}>
            {item.text}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton} activeOpacity={0.7}>
          <Text style={styles.headerButtonText}>{t('aiChat.close')}</Text>
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>{t('aiChat.title')}</Text>
        </View>
        <TouchableOpacity style={styles.headerButton} activeOpacity={0.7}>
          <Ionicons name="ellipsis-horizontal" size={24} color={Colors.primary} />
        </TouchableOpacity>
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
            <Text style={styles.typingText}>{t('aiChat.typing')}</Text>
          </View>
        )}

        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TouchableOpacity style={styles.attachButton}>
              <Ionicons name="add" size={28} color={Colors.textTertiary} />
            </TouchableOpacity>
            <TextInput
              style={styles.input}
              placeholder={t('aiChat.placeholder')}
              placeholderTextColor={Colors.textTertiary}
              value={inputText}
              onChangeText={setInputText}
              multiline
            />
            {inputText.trim().length > 0 && (
              <TouchableOpacity
                style={styles.sendButton}
                onPress={sendMessage}
                disabled={isTyping}
                activeOpacity={0.8}
              >
                <Ionicons name="arrow-up" size={20} color={Colors.textLight} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: 'rgba(248, 249, 250, 0.9)', 
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
    zIndex: 10,
  },
  headerButton: {
    minWidth: 60,
    height: 44,
    justifyContent: 'center'
  },
  headerButtonText: {
    color: Colors.primary,
    fontSize: 17,
    fontWeight: '500',
  },
  headerTitleContainer: {
    alignItems: 'center'
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.text
  },
  chatContainer: { flex: 1 },
  messageList: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg
  },
  bubbleWrapper: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
    maxWidth: '85%',
  },
  bubbleWrapperUser: {
    alignSelf: 'flex-end',
  },
  bubbleWrapperAI: {
    alignSelf: 'flex-start',
    alignItems: 'flex-end',
  },
  aiAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  messageBubble: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: 12,
  },
  userBubble: {
    backgroundColor: Colors.primary, 
    borderRadius: 18,
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: '#E9ECEF', 
    borderRadius: 18,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 17, 
    lineHeight: 22
  },
  userText: { color: Colors.textLight },
  aiText: { color: Colors.text },
  typingIndicator: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.md
  },
  typingText: {
    color: Colors.textTertiary,
    fontSize: 13,
    fontWeight: '500',
    marginLeft: Spacing.lg
  },
  inputContainer: {
    padding: Spacing.sm,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.background,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border,
    paddingBottom: Platform.OS === 'ios' ? Spacing.xl : Spacing.sm,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: '#D1D1D6', 
    borderRadius: 24,
    paddingLeft: Spacing.xs,
    paddingRight: 6,
    paddingVertical: 6,
  },
  attachButton: {
    width: 38,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  input: {
    flex: 1,
    fontSize: 17,
    maxHeight: 120,
    color: Colors.text,
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: Spacing.sm,
    marginRight: Spacing.sm,
  },
  sendButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4
  }
});