import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Vibration,
} from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

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
import type { GeneratedItinerary, GeneratedItineraryStop } from '@/types';

const ITEM_HEIGHT = 120;
const DRAG_ACTIVATION_DISTANCE = 4;

const CATEGORY_COLORS: Record<string, string> = {
  Heritage: '#7C3AED', Food: '#DC2626', Nature: '#059669',
  Adventure: '#D97706', 'Eco-Tourism': '#10B981', Cultural: '#0284C7',
};

// ── Single draggable stop row ─────────────────────────────────────────────────
interface DragItemProps {
  stop: GeneratedItineraryStop;
  index: number;
  total: number;
  isDragging: boolean;
  onDragStart: (index: number) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  onDelete: (index: number) => void;
}

function DragItem({
  stop, index, total, isDragging,
  onDragStart, onMoveUp, onMoveDown, onDelete,
}: DragItemProps) {
  const accentColor = CATEGORY_COLORS[stop.category] ?? COLOR_PRIMARY;
  const scale = useSharedValue(1);
  const bgOpacity = useSharedValue(1);

  const longPress = Gesture.LongPress()
    .minDuration(350)
    .onStart(() => {
      scale.value = withSpring(1.03);
      bgOpacity.value = 0.9;
      runOnJS(Vibration.vibrate)(40);
      runOnJS(onDragStart)(index);
    })
    .onFinalize(() => {
      scale.value = withSpring(1);
      bgOpacity.value = 1;
    });

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: isDragging ? 0.6 : bgOpacity.value,
  }));

  return (
    <GestureDetector gesture={longPress}>
      <Animated.View style={[styles.stopRow, animStyle, isDragging && styles.stopRowDragging]}>
        {/* Colored left stripe */}
        <View style={[styles.stripe, { backgroundColor: accentColor }]} />

        {/* Content */}
        <View style={styles.stopContent}>
          <View style={styles.stopHeader}>
            <View style={[styles.timePill, { backgroundColor: accentColor + '18', borderColor: accentColor + '40' }]}>
              <Ionicons name="time-outline" size={10} color={accentColor} />
              <Text style={[styles.timeText, { color: accentColor }]}>{stop.time}</Text>
            </View>
            <View style={[styles.categoryPill, { backgroundColor: accentColor + '14' }]}>
              <Text style={[styles.categoryText, { color: accentColor }]}>{stop.category}</Text>
            </View>
          </View>

          <Text style={styles.stopName} numberOfLines={1}>{stop.name}</Text>
          <Text style={styles.stopDuration} numberOfLines={1}>
            <Ionicons name="time-outline" size={11} color={COLOR_TEXT_MUTED} /> {stop.duration} · {stop.transport} {stop.transportCost}
          </Text>
        </View>

        {/* Arrow controls */}
        <View style={styles.arrowCol}>
          <TouchableOpacity
            style={[styles.arrowBtn, index === 0 && styles.arrowBtnDisabled]}
            onPress={() => onMoveUp(index)}
            disabled={index === 0}>
            <Ionicons name="chevron-up" size={16} color={index === 0 ? COLOR_BORDER : COLOR_TEXT_MUTED} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.arrowBtn, index === total - 1 && styles.arrowBtnDisabled]}
            onPress={() => onMoveDown(index)}
            disabled={index === total - 1}>
            <Ionicons name="chevron-down" size={16} color={index === total - 1 ? COLOR_BORDER : COLOR_TEXT_MUTED} />
          </TouchableOpacity>
        </View>

        {/* Drag handle */}
        <View style={styles.dragHandle}>
          <Ionicons name="reorder-two-outline" size={20} color={COLOR_BORDER} />
        </View>

        {/* Delete */}
        <TouchableOpacity style={styles.deleteBtn} onPress={() => onDelete(index)}>
          <Ionicons name="trash-outline" size={16} color="#EF4444" />
        </TouchableOpacity>
      </Animated.View>
    </GestureDetector>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────
export default function ItineraryEditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [itinerary, setItinerary] = useState<GeneratedItinerary | null>(null);
  const [stops, setStops] = useState<GeneratedItineraryStop[]>([]);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const originalStopsRef = useRef<string>('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      const item = await api.savedItineraries.getById(id);
      if (!mounted) return;
      if (item) {
        setItinerary(item);
        setStops([...item.stops]);
        originalStopsRef.current = JSON.stringify(item.stops);
      }
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, [id]);

  const moveStop = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= stops.length) return;
    setStops(prev => {
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      setHasChanges(JSON.stringify(next) !== originalStopsRef.current);
      return next;
    });
  };

  const deleteStop = (index: number) => {
    Alert.alert('Remove Stop', `Remove "${stops[index].name}" from your itinerary?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove', style: 'destructive',
        onPress: () => {
          setStops(prev => {
            const next = prev.filter((_, i) => i !== index);
            setHasChanges(JSON.stringify(next) !== originalStopsRef.current);
            return next;
          });
        },
      },
    ]);
  };

  const saveChanges = async () => {
    if (!itinerary) return;
    setSaving(true);
    try {
      await api.savedItineraries.update(itinerary.id, stops);
      originalStopsRef.current = JSON.stringify(stops);
      setHasChanges(false);
      Alert.alert('Saved!', 'Your itinerary has been updated.');
    } catch {
      Alert.alert('Error', 'Could not save changes.');
    } finally {
      setSaving(false);
    }
  };

  const confirmBack = () => {
    if (!hasChanges) { router.back(); return; }
    Alert.alert('Unsaved Changes', 'You have unsaved changes. Discard them?', [
      { text: 'Keep Editing', style: 'cancel' },
      { text: 'Discard', style: 'destructive', onPress: () => router.back() },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centerMessage}>
          <Text style={styles.loadingText}>Loading itinerary...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!itinerary) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centerMessage}>
          <Ionicons name="alert-circle-outline" size={40} color={COLOR_TEXT_MUTED} />
          <Text style={styles.loadingText}>Itinerary not found.</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.backLinkBtn}>
            <Text style={styles.backLinkText}>Go back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* Header */}
      <LinearGradient
        colors={[COLOR_PRIMARY, '#0D4A46']}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
        style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={confirmBack}>
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle} numberOfLines={1}>{itinerary.title}</Text>
          <Text style={styles.headerSub}>{stops.length} stops · Tap arrows or hold to drag</Text>
        </View>
        {hasChanges && (
          <TouchableOpacity
            style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
            onPress={saveChanges}
            disabled={saving}>
            <Ionicons name="checkmark" size={18} color="#fff" />
            <Text style={styles.saveBtnText}>{saving ? 'Saving…' : 'Save'}</Text>
          </TouchableOpacity>
        )}
      </LinearGradient>

      {/* Info strip */}
      <View style={styles.infoStrip}>
        <View style={styles.infoChip}>
          <Ionicons name="car-outline" size={13} color={COLOR_TEXT_MUTED} />
          <Text style={styles.infoText}>{itinerary.totalBudget} total</Text>
        </View>
        <View style={styles.infoChip}>
          <Ionicons name="information-circle-outline" size={13} color={COLOR_TEXT_MUTED} />
          <Text style={styles.infoText}>Hold & drag to reorder</Text>
        </View>
      </View>

      {/* Instructions */}
      {draggingIndex !== null && (
        <View style={styles.dragHint}>
          <Ionicons name="swap-vertical-outline" size={14} color={COLOR_PRIMARY} />
          <Text style={styles.dragHintText}>Use the arrows to move stops up or down</Text>
        </View>
      )}

      {/* Stop list */}
      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}>
        {stops.map((stop, idx) => (
          <DragItem
            key={`${stop.id}-${idx}`}
            stop={stop}
            index={idx}
            total={stops.length}
            isDragging={draggingIndex === idx}
            onDragStart={setDraggingIndex}
            onMoveUp={i => moveStop(i, i - 1)}
            onMoveDown={i => moveStop(i, i + 1)}
            onDelete={deleteStop}
          />
        ))}

        {stops.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="map-outline" size={48} color={COLOR_BORDER} />
            <Text style={styles.emptyText}>No stops left.</Text>
            <TouchableOpacity onPress={() => router.back()} style={styles.backLinkBtn}>
              <Text style={styles.backLinkText}>Start over in chat</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Bottom summary */}
      <View style={styles.bottomBar}>
        <View style={styles.summaryRow}>
          <Ionicons name="navigate-circle-outline" size={16} color={COLOR_PRIMARY} />
          <Text style={styles.summaryText} numberOfLines={2}>{itinerary.transportSummary}</Text>
        </View>
        {hasChanges && (
          <TouchableOpacity
            style={[styles.bigSaveBtn, saving && styles.saveBtnDisabled]}
            onPress={saveChanges}
            disabled={saving}>
            <Ionicons name="save-outline" size={18} color="#fff" />
            <Text style={styles.bigSaveBtnText}>{saving ? 'Saving…' : 'Save Changes'}</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLOR_BG },

  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14, gap: 10,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  headerText: { flex: 1, gap: 2 },
  headerTitle: { fontSize: 17, fontWeight: '900', color: '#fff' },
  headerSub: { fontSize: 11, color: 'rgba(255,255,255,0.7)' },
  saveBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12,
    paddingVertical: 7, borderRadius: RADIUS_PILL,
  },
  saveBtnDisabled: { opacity: 0.5 },
  saveBtnText: { fontSize: 13, fontWeight: '700', color: '#fff' },

  infoStrip: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingVertical: 8,
    backgroundColor: COLOR_SURFACE, borderBottomWidth: 1, borderBottomColor: COLOR_BORDER,
  },
  infoChip: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  infoText: { fontSize: 12, color: COLOR_TEXT_MUTED },

  dragHint: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: COLOR_PRIMARY + '12', paddingHorizontal: 14, paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: COLOR_PRIMARY + '25',
  },
  dragHintText: { fontSize: 12, color: COLOR_PRIMARY, fontWeight: '600' },

  list: { flex: 1 },
  listContent: { padding: 12, gap: 8, paddingBottom: 20 },

  stopRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLOR_SURFACE, borderRadius: RADIUS_ITEM,
    overflow: 'hidden', minHeight: ITEM_HEIGHT,
    ...SHADOW_SM, borderWidth: 1, borderColor: COLOR_BORDER,
  },
  stopRowDragging: {
    ...SHADOW_MD, borderColor: COLOR_PRIMARY,
    shadowColor: COLOR_PRIMARY,
  },
  stripe: { width: 4, alignSelf: 'stretch' },
  stopContent: { flex: 1, padding: 12, gap: 5 },
  stopHeader: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  timePill: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    paddingHorizontal: 7, paddingVertical: 2,
    borderRadius: RADIUS_PILL, borderWidth: 1,
  },
  timeText: { fontSize: 10, fontWeight: '700' },
  categoryPill: {
    paddingHorizontal: 7, paddingVertical: 2,
    borderRadius: RADIUS_PILL,
  },
  categoryText: { fontSize: 10, fontWeight: '600' },
  stopName: { fontSize: 14, fontWeight: '800', color: COLOR_TEXT },
  stopDuration: { fontSize: 11, color: COLOR_TEXT_MUTED },

  arrowCol: { gap: 2, paddingRight: 2 },
  arrowBtn: {
    width: 30, height: 30, borderRadius: 15,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLOR_BG,
  },
  arrowBtnDisabled: { opacity: 0.3 },

  dragHandle: {
    width: 32, alignItems: 'center', justifyContent: 'center',
    borderLeftWidth: 1, borderLeftColor: COLOR_BORDER, alignSelf: 'stretch',
  },

  deleteBtn: {
    width: 40, alignItems: 'center', justifyContent: 'center',
    alignSelf: 'stretch', backgroundColor: '#FEF2F2',
    borderLeftWidth: 1, borderLeftColor: '#FCA5A5',
  },

  centerMessage: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { fontSize: 16, color: COLOR_TEXT_MUTED },
  backLinkBtn: {
    paddingHorizontal: 20, paddingVertical: 10,
    backgroundColor: COLOR_PRIMARY + '15', borderRadius: RADIUS_PILL,
  },
  backLinkText: { fontSize: 14, fontWeight: '700', color: COLOR_PRIMARY },

  emptyState: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyText: { fontSize: 16, color: COLOR_TEXT_MUTED },

  bottomBar: {
    padding: 16, gap: 10,
    backgroundColor: COLOR_SURFACE, borderTopWidth: 1, borderTopColor: COLOR_BORDER,
  },
  summaryRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  summaryText: { fontSize: 12, color: COLOR_TEXT_MUTED, flex: 1 },
  bigSaveBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: COLOR_PRIMARY, borderRadius: RADIUS_ITEM,
    paddingVertical: 13, ...SHADOW_MD,
  },
  bigSaveBtnText: { fontSize: 15, fontWeight: '800', color: '#fff' },
});
