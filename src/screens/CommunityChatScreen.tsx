import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
  Keyboard,
  Alert,
  ViewToken,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { chatService } from '../services/chatService';
import {
  CommunityMessage,
  TypingUser,
  PresencePayload,
  MessagesReadPayload,
  MessageDeletedPayload,
  UserTypingPayload,
} from '../types';
import * as signalR from '@microsoft/signalr';
import { Spacing, Shadows } from '../theme/commonStyles';
import api from '../services/api';

type CommunityChatRouteParams = {
  CommunityChat: { communityId: number; communityName: string };
};

const TYPING_DEBOUNCE_MS = 2000;

export default function CommunityChatScreen() {
  const route = useRoute<RouteProp<CommunityChatRouteParams, 'CommunityChat'>>();
  const navigation = useNavigation();
  const { communityId, communityName } = route.params;
  const { colors, isDark } = useTheme();

  const [messages, setMessages] = useState<CommunityMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [connection, setConnection] = useState<signalR.HubConnection | null>(null);

  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [onlineUserIds, setOnlineUserIds] = useState<Set<number>>(new Set());
  const [editingId, setEditingId] = useState<string | null>(null);

  const flatListRef = useRef<FlatList>(null);
  const typingDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingRef = useRef(false);
  const lastReadIdRef = useRef<string | null>(null);
  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const currentUserIdRef = useRef<number | null>(null);
  const senderNamesRef = useRef<Map<number, string>>(new Map());

  useEffect(() => {
    currentUserIdRef.current = currentUserId;
  }, [currentUserId]);

  useEffect(() => {
    for (const m of messages) {
      if (!senderNamesRef.current.has(m.senderId)) {
        senderNamesRef.current.set(m.senderId, m.senderName);
      }
    }
  }, [messages]);

  useEffect(() => {
    let currentConnection: signalR.HubConnection | null = null;

    const initChat = async () => {
      try {
        const userRes = await api.get('/users/me');
        setCurrentUserId(userRes.data.id);

        const messagesRes = await chatService.getCommunityMessages(communityId, 1, 100);
        setMessages(messagesRes.data.messages);

        currentConnection = await chatService.createHubConnection();
        connectionRef.current = currentConnection;

        currentConnection.on('ReceiveMessage', (message: CommunityMessage) => {
          setMessages(prev => [...prev, message]);
          setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
          }, 100);
        });

        currentConnection.on('MessagesRead', (payload: MessagesReadPayload) => {
          if (payload.communityId !== communityId) return;
          if (payload.userId === userRes.data.id) return;
          const readSet = new Set(payload.messageIds);
          setMessages(prev =>
            prev.map(m =>
              readSet.has(m.id) ? { ...m, readCount: (m.readCount ?? 0) + 1 } : m
            )
          );
        });

        currentConnection.on('UserTyping', (payload: UserTypingPayload) => {
          if (payload.communityId !== communityId) return;
          if (payload.userId === userRes.data.id) return;
          setTypingUsers(prev => {
            if (prev.some(u => u.userId === payload.userId)) return prev;
            const userName = senderNamesRef.current.get(payload.userId) ?? 'Biri';
            return [...prev, { userId: payload.userId, userName }];
          });
        });

        currentConnection.on('UserStoppedTyping', (payload: UserTypingPayload) => {
          if (payload.communityId !== communityId) return;
          setTypingUsers(prev => prev.filter(u => u.userId !== payload.userId));
        });

        currentConnection.on('UserOnline', (payload: PresencePayload) => {
          if (payload.communityId !== communityId) return;
          setOnlineUserIds(prev => {
            if (prev.has(payload.userId)) return prev;
            const next = new Set(prev);
            next.add(payload.userId);
            return next;
          });
        });

        currentConnection.on('UserOffline', (payload: PresencePayload) => {
          if (payload.communityId !== communityId) return;
          setOnlineUserIds(prev => {
            if (!prev.has(payload.userId)) return prev;
            const next = new Set(prev);
            next.delete(payload.userId);
            return next;
          });
          setTypingUsers(prev => prev.filter(u => u.userId !== payload.userId));
        });

        currentConnection.on('MessageEdited', (edited: CommunityMessage) => {
          setMessages(prev =>
            prev.map(m =>
              m.id === edited.id
                ? { ...m, ...edited, isEdited: true }
                : m
            )
          );
        });

        currentConnection.on('MessageDeleted', (payload: MessageDeletedPayload) => {
          if (payload.communityId !== communityId) return;
          setMessages(prev => prev.filter(m => m.id !== payload.messageId));
        });

        currentConnection.on('Error', (errorMsg: string) => {
          Alert.alert('Hata', errorMsg);
        });

        await currentConnection.start();
        await chatService.joinCommunity(currentConnection, communityId);
        setConnection(currentConnection);

      } catch (error) {
        console.log('Sohbet başlatılırken hata:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initChat();

    return () => {
      if (typingDebounceRef.current) {
        clearTimeout(typingDebounceRef.current);
        typingDebounceRef.current = null;
      }
      const conn = currentConnection;
      if (conn) {
        const cleanup = async () => {
          try {
            if (isTypingRef.current) {
              await chatService.stopTyping(conn, communityId).catch(() => {});
              isTypingRef.current = false;
            }
            await chatService.leaveCommunity(conn, communityId).catch(() => {});
          } finally {
            conn.stop().catch(() => {});
          }
        };
        cleanup();
      }
      connectionRef.current = null;
    };
  }, [communityId]);

  const sendTypingStart = useCallback(() => {
    const conn = connectionRef.current;
    if (!conn) return;
    if (!isTypingRef.current) {
      isTypingRef.current = true;
      chatService.startTyping(conn, communityId).catch(() => {
        isTypingRef.current = false;
      });
    }
  }, [communityId]);

  const sendTypingStop = useCallback(() => {
    const conn = connectionRef.current;
    if (!conn) return;
    if (isTypingRef.current) {
      isTypingRef.current = false;
      chatService.stopTyping(conn, communityId).catch(() => {});
    }
  }, [communityId]);

  const handleChangeText = (text: string) => {
    setInputText(text);

    if (text.trim().length === 0) {
      if (typingDebounceRef.current) {
        clearTimeout(typingDebounceRef.current);
        typingDebounceRef.current = null;
      }
      sendTypingStop();
      return;
    }

    sendTypingStart();
    if (typingDebounceRef.current) clearTimeout(typingDebounceRef.current);
    typingDebounceRef.current = setTimeout(() => {
      sendTypingStop();
    }, TYPING_DEBOUNCE_MS);
  };

  const handleSend = async () => {
    if (!inputText.trim() || !connection) return;

    const messageContent = inputText.trim();
    const currentEditingId = editingId;
    setInputText('');
    setEditingId(null);
    Keyboard.dismiss();

    if (typingDebounceRef.current) {
      clearTimeout(typingDebounceRef.current);
      typingDebounceRef.current = null;
    }
    sendTypingStop();

    try {
      if (currentEditingId) {
        await chatService.editMessage(connection, communityId, currentEditingId, messageContent);
      } else {
        await chatService.sendMessage(connection, communityId, messageContent);
      }
    } catch (error) {
      console.log('Mesaj gönderilemedi:', error);
      Alert.alert('Hata', currentEditingId ? 'Mesaj güncellenemedi.' : 'Mesaj gönderilemedi.');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setInputText('');
  };

  const handleLongPressMessage = (msg: CommunityMessage) => {
    if (msg.senderId !== currentUserId) return;
    Alert.alert(
      'Mesaj',
      undefined,
      [
        {
          text: 'Düzenle',
          onPress: () => {
            setEditingId(msg.id);
            setInputText(msg.content);
          },
        },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            if (!connection) return;
            console.log('[DeleteMessage] communityId:', communityId, 'messageId:', msg.id, 'typeof:', typeof msg.id);
            try {
              await chatService.deleteMessage(connection, communityId, msg.id);
            } catch (e: any) {
              console.log('Mesaj silinemedi:', e?.message ?? e);
              Alert.alert('Hata', 'Mesaj silinemedi.');
            }
          },
        },
        { text: 'İptal', style: 'cancel' },
      ],
      { cancelable: true }
    );
  };

  const handleViewableChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    const conn = connectionRef.current;
    if (!conn || viewableItems.length === 0) return;
    const lastVisible = viewableItems[viewableItems.length - 1].item as CommunityMessage | undefined;
    if (!lastVisible) return;
    if (lastVisible.senderId === currentUserIdRef.current) return;
    if (lastReadIdRef.current === lastVisible.id) return;
    lastReadIdRef.current = lastVisible.id;
    chatService.markAsRead(conn, communityId, [lastVisible.id]).catch(() => {});
  }).current;

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 60 }).current;

  const typingLabel = (() => {
    if (typingUsers.length === 0) return null;
    if (typingUsers.length === 1) return `${typingUsers[0].userName} yazıyor...`;
    if (typingUsers.length === 2)
      return `${typingUsers[0].userName} ve ${typingUsers[1].userName} yazıyor...`;
    return `${typingUsers[0].userName} ve ${typingUsers.length - 1} kişi yazıyor...`;
  })();

  const renderMessage = ({ item }: { item: CommunityMessage }) => {
    const isMe = item.senderId === currentUserId;

    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onLongPress={() => handleLongPressMessage(item)}
        style={[styles.messageWrapper, isMe ? styles.messageWrapperRight : styles.messageWrapperLeft]}
      >
        {!isMe && (
          <Image
            source={{ uri: item.senderProfileImageUrl || 'https://via.placeholder.com/40' }}
            style={styles.avatar}
          />
        )}
        <View style={isMe ? styles.messageBubbleContainerRight : styles.messageBubbleContainerLeft}>
          {!isMe && <Text style={[styles.senderName, { color: colors.textSecondary }]}>{item.senderName}</Text>}
          <View style={[
            styles.messageBubble,
            isMe ? { backgroundColor: colors.primary } : { backgroundColor: colors.surface }
          ]}>
            <Text style={[styles.messageText, isMe ? { color: '#FFF' } : { color: colors.text }]}>
              {item.content}
            </Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={[styles.timeText, { color: colors.textTertiary }]}>
              {new Date(item.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
            </Text>
            {item.isEdited && (
              <Text style={[styles.editedText, { color: colors.textTertiary }]}>· düzenlendi</Text>
            )}
            {isMe && (item.readCount ?? 0) > 0 && (
              <Ionicons
                name="checkmark-done"
                size={14}
                color={colors.primary}
                style={styles.readIcon}
              />
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const activeCount = onlineUserIds.size;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <View style={[styles.header, { borderBottomColor: colors.border, backgroundColor: colors.surface }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>{communityName}</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            {activeCount > 0 ? `${activeCount} aktif · Topluluk Sohbeti` : 'Topluluk Sohbeti'}
          </Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {isLoading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={item => item.id.toString()}
            renderItem={renderMessage}
            contentContainerStyle={styles.listContent}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
            onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
            onViewableItemsChanged={handleViewableChanged}
            viewabilityConfig={viewabilityConfig}
          />
        )}

        {typingLabel && (
          <View style={[styles.typingBar, { backgroundColor: colors.surface }]}>
            <Text style={[styles.typingText, { color: colors.textSecondary }]}>{typingLabel}</Text>
          </View>
        )}

        {editingId && (
          <View style={[styles.editBanner, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
            <Ionicons name="create-outline" size={16} color={colors.primary} />
            <Text style={[styles.editBannerText, { color: colors.text }]}>Mesaj düzenleniyor</Text>
            <TouchableOpacity onPress={handleCancelEdit}>
              <Text style={[styles.editCancel, { color: colors.primary }]}>İptal</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
          <TextInput
            style={[styles.textInput, { color: colors.text, backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7' }]}
            placeholder="Mesaj yazın..."
            placeholderTextColor={colors.textTertiary}
            value={inputText}
            onChangeText={handleChangeText}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendButton, { backgroundColor: inputText.trim() ? colors.primary : colors.border }]}
            onPress={handleSend}
            disabled={!inputText.trim()}
          >
            <Ionicons
              name={editingId ? 'checkmark' : 'send'}
              size={18}
              color="#FFF"
              style={editingId ? undefined : { marginLeft: 4 }}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    ...Shadows.sm,
    zIndex: 10,
  },
  backButton: {
    padding: Spacing.xs,
    width: 40,
    alignItems: 'center',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 12,
  },
  keyboardView: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  messageWrapper: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
    maxWidth: '85%',
  },
  messageWrapperLeft: {
    alignSelf: 'flex-start',
  },
  messageWrapperRight: {
    alignSelf: 'flex-end',
    justifyContent: 'flex-end',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: Spacing.sm,
    marginTop: 18,
  },
  messageBubbleContainerLeft: {
    alignItems: 'flex-start',
  },
  messageBubbleContainerRight: {
    alignItems: 'flex-end',
  },
  senderName: {
    fontSize: 11,
    marginBottom: 4,
    marginLeft: 4,
  },
  messageBubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    ...Shadows.sm,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginRight: 4,
  },
  timeText: {
    fontSize: 10,
  },
  editedText: {
    fontSize: 10,
    marginLeft: 4,
    fontStyle: 'italic',
  },
  readIcon: {
    marginLeft: 4,
  },
  typingBar: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
  },
  typingText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  editBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderTopWidth: 1,
  },
  editBannerText: {
    fontSize: 13,
    marginLeft: 6,
    flex: 1,
  },
  editCancel: {
    fontSize: 13,
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: Spacing.sm,
    alignItems: 'flex-end',
    borderTopWidth: 1,
  },
  textInput: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: Spacing.md,
    paddingTop: 12,
    paddingBottom: 12,
    minHeight: 40,
    maxHeight: 100,
    fontSize: 15,
    marginRight: Spacing.sm,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  }
});
