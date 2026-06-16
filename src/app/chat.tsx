import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  COLOR_BG,
  COLOR_BORDER,
  COLOR_PRIMARY,
  COLOR_SURFACE,
  COLOR_TEXT,
  COLOR_TEXT_MUTED,
  RADIUS_CARD,
  RADIUS_ITEM,
  RADIUS_PILL,
  SHADOW_MD,
  SHADOW_SM,
} from '@/constants/design';
import { api } from '@/services/api';
import type { ChatMessage } from '@/types';

const INITIAL_MESSAGE: ChatMessage = {
  id: 'ai-0',
  type: 'ai',
  content:
    "Dios Mabalos, Jake! I'm your AI travel concierge. Tell me, what's the vibe for your Albay adventure? Are you looking for spicy food, hidden nature spots, or historic ruins?",
  timestamp: Date.now(),
};

const QUICK_REPLIES = [
  '🌶️ Spicy Food Tour',
  '🌋 Mayon Hiking',
  '🏛️ Heritage Trail',
  '🌿 Eco-Adventure',
  '🏖️ Beach & Coast',
];

export default function ChatScreen() {
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const listRef = useRef<FlatList>(null);

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      type: 'user',
      content: trimmed,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      const res = await api.chat.send(trimmed);
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        type: 'ai',
        content: res.message,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        type: 'ai',
        content: "Pasensya na! I couldn't reach the server. Please make sure the backend is running and try again.",
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [loading]);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={COLOR_TEXT} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>ALBAY GO</Text>
          <View style={styles.onlineDot} />
        </View>
        <TouchableOpacity style={styles.avatarSmall}>
          <Ionicons name="person" size={18} color={COLOR_PRIMARY} />
        </TouchableOpacity>
      </View>

      {/* ── Chat List ── */}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          renderItem={({ item }) => <MessageBubble message={item} />}
          ListFooterComponent={loading ? <TypingIndicator /> : null}
        />

        {/* ── Quick Replies ── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickRepliesRow}
          style={styles.quickRepliesScroll}>
          {QUICK_REPLIES.map(reply => (
            <TouchableOpacity
              key={reply}
              style={styles.quickReply}
              onPress={() => sendMessage(reply)}
              activeOpacity={0.75}>
              <Text style={styles.quickReplyText}>{reply}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ── Input Bar ── */}
        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.micBtn}>
            <Ionicons name="mic-outline" size={20} color={COLOR_TEXT_MUTED} />
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type your vibe..."
            placeholderTextColor={COLOR_TEXT_MUTED}
            multiline
            maxLength={500}
            returnKeyType="send"
            onSubmitEditing={() => sendMessage(inputText)}
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!inputText.trim() || loading) && styles.sendBtnDisabled]}
            onPress={() => sendMessage(inputText)}
            disabled={!inputText.trim() || loading}
            activeOpacity={0.85}>
            {loading
              ? <ActivityIndicator size="small" color="#fff" />
              : <Ionicons name="send" size={16} color="#FFFFFF" />
            }
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isAI = message.type === 'ai';
  return (
    <View style={[styles.msgRow, !isAI && styles.msgRowUser]}>
      {isAI && (
        <View style={styles.aiAvatar}>
          <Ionicons name="sparkles" size={14} color="#FFFFFF" />
        </View>
      )}
      <View style={[styles.bubble, isAI ? styles.bubbleAI : styles.bubbleUser]}>
        <Text style={[styles.bubbleText, !isAI && styles.bubbleTextUser]}>
          {message.content}
        </Text>
      </View>
    </View>
  );
}

function TypingIndicator() {
  return (
    <View style={[styles.msgRow]}>
      <View style={styles.aiAvatar}>
        <Ionicons name="sparkles" size={14} color="#FFFFFF" />
      </View>
      <View style={[styles.bubble, styles.bubbleAI, { paddingVertical: 14 }]}>
        <ActivityIndicator size="small" color={COLOR_TEXT_MUTED} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLOR_BG },
  flex: { flex: 1 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLOR_BORDER,
    backgroundColor: COLOR_SURFACE,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLOR_BG,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: COLOR_PRIMARY,
    letterSpacing: 1.5,
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  avatarSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(17,94,89,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Messages
  messagesList: {
    padding: 16,
    paddingBottom: 8,
    gap: 14,
  },
  msgRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    maxWidth: '85%',
  },
  msgRowUser: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
  },
  aiAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLOR_PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  bubble: {
    borderRadius: RADIUS_ITEM,
    paddingHorizontal: 14,
    paddingVertical: 12,
    maxWidth: '100%',
  },
  bubbleAI: {
    backgroundColor: COLOR_SURFACE,
    borderBottomLeftRadius: 4,
    ...SHADOW_SM,
  },
  bubbleUser: {
    backgroundColor: COLOR_PRIMARY,
    borderBottomRightRadius: 4,
  },
  bubbleText: { fontSize: 15, color: COLOR_TEXT, lineHeight: 22 },
  bubbleTextUser: { color: '#FFFFFF' },

  // Quick Replies
  quickRepliesScroll: { borderTopWidth: 1, borderTopColor: COLOR_BORDER },
  quickRepliesRow: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  quickReply: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: RADIUS_PILL,
    backgroundColor: COLOR_SURFACE,
    borderWidth: 1,
    borderColor: COLOR_PRIMARY,
    ...SHADOW_SM,
  },
  quickReplyText: { fontSize: 13, fontWeight: '600', color: COLOR_PRIMARY },

  // Input
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 10,
    paddingBottom: Platform.OS === 'ios' ? 10 : 12,
    gap: 8,
    backgroundColor: COLOR_SURFACE,
    borderTopWidth: 1,
    borderTopColor: COLOR_BORDER,
  },
  micBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLOR_BG,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLOR_BORDER,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: COLOR_TEXT,
    backgroundColor: COLOR_BG,
    borderRadius: RADIUS_CARD,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: COLOR_BORDER,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLOR_PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW_MD,
  },
  sendBtnDisabled: { opacity: 0.4 },
});
