import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
import ItineraryCard from '@/components/ItineraryCard';
import { planItinerary, type ItineraryTheme } from '@/services/itineraryPlanner';
import { api } from '@/services/api';
import type { ChatMessage, GeneratedItinerary } from '@/types';

const INITIAL_MESSAGE: ChatMessage = {
  id: 'ai-0',
  type: 'ai',
  content: "Dios Mabalos! 🗺️ I'm LakbAI, your Albay travel concierge. Pick a theme below — Heritage, Food, Nature, Adventure, or Beach — and I'll build you a complete day itinerary instantly!",
  timestamp: Date.now(),
};

// Quick replies map a label → curated itinerary theme
const QUICK_REPLIES: { label: string; theme: ItineraryTheme }[] = [
  { label: '🏛️ Heritage Trail', theme: 'heritage' },
  { label: '🌶️ Spicy Food Tour', theme: 'food' },
  { label: '🌿 Nature Escape', theme: 'nature' },
  { label: '🌋 Mayon Adventure', theme: 'adventure' },
  { label: '🏖️ Beach & Coast', theme: 'beach' },
];

const ITINERARY_KEYWORDS = /itinerary|plan|schedule|day trip|route|trip|tour|explore|visit|travel|adventure|heritage|food|nature|beach|hike|mayon/i;

// Track chat task completion across session
let chatTaskDone = false;

// ── Message bubble ────────────────────────────────────────────────────────────
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
    <View style={styles.msgRow}>
      <View style={styles.aiAvatar}>
        <Ionicons name="sparkles" size={14} color="#FFFFFF" />
      </View>
      <View style={[styles.bubble, styles.bubbleAI, { paddingVertical: 14 }]}>
        <ActivityIndicator size="small" color={COLOR_TEXT_MUTED} />
      </View>
    </View>
  );
}

// ── Itinerary message wrapper ─────────────────────────────────────────────────
function ItineraryMessage({
  message,
  onSaved,
}: {
  message: ChatMessage & { itinerary: GeneratedItinerary };
  onSaved: (id: string) => void;
}) {
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    try {
      await api.savedItineraries.save(message.itinerary);
      setSaved(true);
      onSaved(message.itinerary.id);
      Alert.alert('Saved! 🎉', 'Your itinerary has been saved. Tap "View & Edit" to reorder stops.');
    } catch {
      Alert.alert('Error', 'Could not save itinerary.');
    }
  };

  const handleView = () => {
    router.push(`/itinerary/${message.itinerary.id}` as never);
  };

  return (
    <View style={styles.itineraryWrapper}>
      <View style={styles.msgRow}>
        <View style={styles.aiAvatar}>
          <Ionicons name="sparkles" size={14} color="#FFFFFF" />
        </View>
        <Text style={styles.itineraryIntro}>Here's your personalized itinerary! ✨</Text>
      </View>
      <View style={styles.itineraryCardWrap}>
        <ItineraryCard
          itinerary={message.itinerary}
          onSave={handleSave}
          onView={handleView}
          saved={saved}
        />
      </View>
    </View>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────
type ExtendedMessage = ChatMessage & { itinerary?: GeneratedItinerary };

export default function ChatScreen() {
  const [messages, setMessages] = useState<ExtendedMessage[]>([INITIAL_MESSAGE]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const listRef = useRef<FlatList>(null);

  const sendMessage = useCallback(async (text: string, theme?: ItineraryTheme) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg: ExtendedMessage = {
      id: `u-${Date.now()}`,
      type: 'user',
      content: trimmed,
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setLoading(true);
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);

    // Complete daily task
    if (!chatTaskDone) {
      chatTaskDone = true;
      api.tasks.complete('chat').catch(() => {});
    }

    // Simulate a brief "thinking" delay for a natural feel
    await new Promise(r => setTimeout(r, 500));

    try {
      const isItineraryRequest = theme !== undefined || ITINERARY_KEYWORDS.test(trimmed);

      if (isItineraryRequest) {
        // Build a curated itinerary (theme from quick-reply, or detected from text)
        const itinerary: GeneratedItinerary = planItinerary(theme ?? trimmed);

        // Mark the "generate itinerary" daily task complete too
        api.tasks.complete('generate_itinerary').catch(() => {});

        const introMsg: ExtendedMessage = {
          id: `ai-${Date.now()}`,
          type: 'ai',
          content: `Here's a handpicked ${itinerary.title.replace(/^Day \d+:\s*/, '')} for you! 🌟 Tap "Save Itinerary" to keep it, then reorder or edit the stops anytime.`,
          timestamp: Date.now(),
        };
        const itinMsg: ExtendedMessage = {
          id: `itin-${Date.now()}`,
          type: 'ai',
          content: '',
          timestamp: Date.now(),
          itinerary,
        };
        setMessages(prev => [...prev, introMsg, itinMsg]);
      } else {
        // Regular chat response
        const res = await api.chat.send(trimmed);
        const aiMsg: ExtendedMessage = {
          id: `ai-${Date.now()}`,
          type: 'ai',
          content: res.message,
          timestamp: Date.now(),
        };
        setMessages(prev => [...prev, aiMsg]);
      }
    } catch (err) {
      const errMsg: ExtendedMessage = {
        id: `err-${Date.now()}`,
        type: 'ai',
        content: `Pasensya na! Something went wrong: ${err instanceof Error ? err.message : 'Unknown error'}. Please try again.`,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setLoading(false);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 200);
    }
  }, [loading]);

  const renderItem = ({ item }: { item: ExtendedMessage }) => {
    if (item.itinerary) {
      return (
        <ItineraryMessage
          message={item as ExtendedMessage & { itinerary: GeneratedItinerary }}
          onSaved={id => setSavedIds(prev => new Set(prev).add(id))}
        />
      );
    }
    return <MessageBubble message={item} />;
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={COLOR_TEXT} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>LakbAI</Text>
          <View style={styles.onlineDot} />
        </View>
        <View style={styles.avatarSmall}>
          <Ionicons name="sparkles" size={18} color={COLOR_PRIMARY} />
        </View>
      </View>

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
          renderItem={renderItem}
          ListFooterComponent={loading ? <TypingIndicator /> : null}
        />

        {/* Quick Replies */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickRepliesRow}
          style={styles.quickRepliesScroll}>
          {QUICK_REPLIES.map(reply => (
            <TouchableOpacity
              key={reply.theme}
              style={styles.quickReply}
              onPress={() => sendMessage(reply.label, reply.theme)}
              activeOpacity={0.75}>
              <Text style={styles.quickReplyText}>{reply.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Input Bar */}
        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.micBtn}>
            <Ionicons name="mic-outline" size={20} color={COLOR_TEXT_MUTED} />
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Ask for an itinerary or travel tip..."
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
              : <Ionicons name="send" size={16} color="#FFFFFF" />}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLOR_BG },
  flex: { flex: 1 },

  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: COLOR_BORDER,
    backgroundColor: COLOR_SURFACE,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: COLOR_BG, alignItems: 'center', justifyContent: 'center',
  },
  headerCenter: {
    flex: 1, alignItems: 'center', flexDirection: 'row',
    justifyContent: 'center', gap: 6,
  },
  headerTitle: { fontSize: 16, fontWeight: '900', color: COLOR_PRIMARY, letterSpacing: 1.5 },
  onlineDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#10B981' },
  avatarSmall: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(17,94,89,0.10)',
    alignItems: 'center', justifyContent: 'center',
  },

  apiBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#FEF3C7', paddingHorizontal: 14, paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: '#FDE68A',
  },
  apiBannerText: { fontSize: 11, color: '#92400E', flex: 1 },

  messagesList: { padding: 16, paddingBottom: 8, gap: 14 },

  msgRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, maxWidth: '85%' },
  msgRowUser: { alignSelf: 'flex-end', flexDirection: 'row-reverse' },
  aiAvatar: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: COLOR_PRIMARY,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  bubble: { borderRadius: RADIUS_ITEM, paddingHorizontal: 14, paddingVertical: 12, maxWidth: '100%' },
  bubbleAI: { backgroundColor: COLOR_SURFACE, borderBottomLeftRadius: 4, ...SHADOW_SM },
  bubbleUser: { backgroundColor: COLOR_PRIMARY, borderBottomRightRadius: 4 },
  bubbleText: { fontSize: 15, color: COLOR_TEXT, lineHeight: 22 },
  bubbleTextUser: { color: '#FFFFFF' },

  itineraryWrapper: { gap: 10, maxWidth: '95%' },
  itineraryIntro: { fontSize: 14, color: COLOR_TEXT_MUTED, fontStyle: 'italic', flex: 1 },
  itineraryCardWrap: { paddingLeft: 40 },

  quickRepliesScroll: {
    flexGrow: 0, flexShrink: 0,
    borderTopWidth: 1, borderTopColor: COLOR_BORDER,
  },
  quickRepliesRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 10, gap: 8,
  },
  quickReply: {
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: RADIUS_PILL, backgroundColor: COLOR_SURFACE,
    borderWidth: 1, borderColor: COLOR_PRIMARY,
    alignSelf: 'center', ...SHADOW_SM,
  },
  quickReplyText: { fontSize: 13, fontWeight: '600', color: COLOR_PRIMARY },

  inputContainer: {
    flexDirection: 'row', alignItems: 'flex-end',
    paddingHorizontal: 12, paddingVertical: 10,
    paddingBottom: Platform.OS === 'ios' ? 10 : 12,
    gap: 8, backgroundColor: COLOR_SURFACE,
    borderTopWidth: 1, borderTopColor: COLOR_BORDER,
  },
  micBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: COLOR_BG,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: COLOR_BORDER,
  },
  input: {
    flex: 1, fontSize: 15, color: COLOR_TEXT, backgroundColor: COLOR_BG,
    borderRadius: RADIUS_CARD, paddingHorizontal: 16, paddingVertical: 10,
    maxHeight: 100, borderWidth: 1, borderColor: COLOR_BORDER,
  },
  sendBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: COLOR_PRIMARY,
    alignItems: 'center', justifyContent: 'center', ...SHADOW_MD,
  },
  sendBtnDisabled: { opacity: 0.4 },
});
