import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  COLOR_ACCENT,
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
import type { GeneratedItinerary, GeneratedItineraryStop } from '@/types';

// ── Tag chip ──────────────────────────────────────────────────────────────────
function Tag({ label }: { label: string }) {
  return (
    <View style={tag.wrap}>
      <Text style={tag.text}>{label}</Text>
    </View>
  );
}
const tag = StyleSheet.create({
  wrap: {
    backgroundColor: COLOR_PRIMARY + '14', borderRadius: RADIUS_PILL,
    paddingHorizontal: 9, paddingVertical: 3,
    borderWidth: 1, borderColor: COLOR_PRIMARY + '30',
  },
  text: { fontSize: 11, fontWeight: '600', color: COLOR_PRIMARY },
});

// ── Transport connector ───────────────────────────────────────────────────────
function TransportConnector({ transport, cost }: { transport: string; cost: string }) {
  const icon = transport === 'Jeepney' ? 'bus-outline'
    : transport === 'Walk' ? 'walk-outline'
    : 'car-outline';
  return (
    <View style={tc.row}>
      <View style={tc.line} />
      <View style={tc.pill}>
        <Ionicons name={icon as any} size={12} color={COLOR_TEXT_MUTED} />
        <Text style={tc.text}>{transport} · {cost}</Text>
      </View>
      <View style={tc.line} />
    </View>
  );
}
const tc = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', marginVertical: 4 },
  line: { flex: 1, height: 1, backgroundColor: COLOR_BORDER },
  pill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: COLOR_BG, paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: RADIUS_PILL, borderWidth: 1, borderColor: COLOR_BORDER,
  },
  text: { fontSize: 11, color: COLOR_TEXT_MUTED },
});

// ── Stop card ─────────────────────────────────────────────────────────────────
const CATEGORY_COLORS: Record<string, string> = {
  Heritage: '#7C3AED', Food: '#DC2626', Nature: '#059669',
  Adventure: '#D97706', 'Eco-Tourism': '#10B981', Cultural: '#0284C7',
};

function StopCard({ stop, isFirst }: { stop: GeneratedItineraryStop; isFirst: boolean }) {
  const accentColor = CATEGORY_COLORS[stop.category] ?? COLOR_PRIMARY;
  return (
    <View style={sc.row}>
      {/* Timeline left column */}
      <View style={sc.timeline}>
        <View style={[sc.timeDot, { borderColor: accentColor }]}>
          <View style={[sc.timeDotInner, { backgroundColor: accentColor }]} />
        </View>
        <View style={sc.timelineVert} />
      </View>

      {/* Card */}
      <View style={[sc.card, SHADOW_SM]}>
        {/* Time + badge row */}
        <View style={sc.cardTop}>
          <View style={[sc.timePill, { backgroundColor: accentColor + '18', borderColor: accentColor + '40' }]}>
            <Ionicons name="time-outline" size={11} color={accentColor} />
            <Text style={[sc.timeText, { color: accentColor }]}>{stop.time}</Text>
          </View>
          {isFirst && (
            <View style={sc.currentBadge}>
              <View style={sc.currentDot} />
              <Text style={sc.currentText}>Current Stop</Text>
            </View>
          )}
        </View>

        {/* Name */}
        <Text style={sc.name}>{stop.name}</Text>
        <Text style={sc.desc} numberOfLines={3}>{stop.description}</Text>

        {/* Tags */}
        <View style={sc.tagsRow}>
          {stop.tags.map(t => <Tag key={t} label={t} />)}
          <View style={[sc.timePill, { backgroundColor: '#F1F5F9', borderColor: COLOR_BORDER }]}>
            <Ionicons name="time-outline" size={10} color={COLOR_TEXT_MUTED} />
            <Text style={[sc.timeText, { color: COLOR_TEXT_MUTED }]}>{stop.duration}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const sc = StyleSheet.create({
  row: { flexDirection: 'row', gap: 12, paddingHorizontal: 16 },
  timeline: { width: 20, alignItems: 'center', paddingTop: 36 },
  timeDot: {
    width: 18, height: 18, borderRadius: 9, borderWidth: 2,
    alignItems: 'center', justifyContent: 'center', backgroundColor: COLOR_SURFACE,
  },
  timeDotInner: { width: 8, height: 8, borderRadius: 4 },
  timelineVert: { flex: 1, width: 2, backgroundColor: COLOR_BORDER, marginTop: 4 },

  card: {
    flex: 1, backgroundColor: COLOR_SURFACE, borderRadius: RADIUS_ITEM,
    padding: 14, gap: 8, marginBottom: 4,
    borderWidth: 1, borderColor: COLOR_BORDER,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  timePill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: RADIUS_PILL, borderWidth: 1,
  },
  timeText: { fontSize: 11, fontWeight: '700' },
  currentBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: '#DCFCE7', paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: RADIUS_PILL,
  },
  currentDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#16A34A' },
  currentText: { fontSize: 10, fontWeight: '700', color: '#15803D' },
  name: { fontSize: 15, fontWeight: '800', color: COLOR_TEXT },
  desc: { fontSize: 13, color: COLOR_TEXT_MUTED, lineHeight: 18 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
});

// ── Main ItineraryCard ────────────────────────────────────────────────────────
interface Props {
  itinerary: GeneratedItinerary;
  onSave?: () => void;
  onView?: () => void;
  saved?: boolean;
}

export default function ItineraryCard({ itinerary, onSave, onView, saved }: Props) {
  return (
    <View style={styles.wrapper}>
      {/* Header gradient */}
      <LinearGradient
        colors={[COLOR_PRIMARY, '#0D4A46']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}>
        <Text style={styles.headerTitle}>{itinerary.title}</Text>
        <Text style={styles.headerSubtitle}>{itinerary.subtitle}</Text>
      </LinearGradient>

      {/* Transport Budget box */}
      <View style={styles.budgetBox}>
        <View style={styles.budgetRow}>
          <View style={styles.budgetBadge}>
            <Ionicons name="car-outline" size={11} color={COLOR_ACCENT} />
            <Text style={styles.budgetBadgeText}>TRANSPORT BUDGET</Text>
          </View>
        </View>
        <Text style={styles.budgetTotal}>
          {itinerary.totalBudget} Total Transport Today
        </Text>
        <Text style={styles.budgetSummary}>{itinerary.transportSummary}</Text>
        <TouchableOpacity style={styles.fareBtn} activeOpacity={0.8}>
          <Text style={styles.fareBtnText}>Check custom fare</Text>
        </TouchableOpacity>
      </View>

      {/* Stops */}
      <View style={styles.stopsContainer}>
        {itinerary.stops.map((stop, idx) => (
          <View key={stop.id}>
            <StopCard stop={stop} isFirst={idx === 0} />
            {idx < itinerary.stops.length - 1 && (
              <View style={styles.connectorWrap}>
                <TransportConnector
                  transport={itinerary.stops[idx + 1].transport}
                  cost={itinerary.stops[idx + 1].transportCost}
                />
              </View>
            )}
          </View>
        ))}
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        {saved ? (
          <TouchableOpacity style={styles.viewBtn} onPress={onView} activeOpacity={0.85}>
            <Ionicons name="eye-outline" size={16} color={COLOR_PRIMARY} />
            <Text style={styles.viewBtnText}>View & Edit Itinerary</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.saveBtn} onPress={onSave} activeOpacity={0.85}>
            <Ionicons name="bookmark-outline" size={16} color="#fff" />
            <Text style={styles.saveBtnText}>Save Itinerary</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: COLOR_SURFACE,
    borderRadius: RADIUS_CARD,
    overflow: 'hidden',
    ...SHADOW_MD,
    borderWidth: 1,
    borderColor: COLOR_BORDER,
  },

  header: { padding: 20, gap: 4 },
  headerTitle: { fontSize: 22, fontWeight: '900', color: '#fff', letterSpacing: -0.3 },
  headerSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.75)' },

  budgetBox: {
    backgroundColor: '#FFFBEB', borderBottomWidth: 1,
    borderBottomColor: '#FEF3C7', padding: 16, gap: 6,
  },
  budgetRow: { flexDirection: 'row', alignItems: 'center' },
  budgetBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#FEF3C7', paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: RADIUS_PILL,
  },
  budgetBadgeText: { fontSize: 10, fontWeight: '800', color: COLOR_ACCENT, letterSpacing: 0.5 },
  budgetTotal: { fontSize: 16, fontWeight: '800', color: COLOR_TEXT },
  budgetSummary: { fontSize: 12, color: COLOR_TEXT_MUTED },
  fareBtn: {
    borderWidth: 1.5, borderColor: COLOR_ACCENT, borderRadius: RADIUS_ITEM,
    paddingVertical: 8, alignItems: 'center', marginTop: 4,
  },
  fareBtnText: { fontSize: 13, fontWeight: '700', color: COLOR_ACCENT },

  stopsContainer: { paddingVertical: 16, gap: 4 },
  connectorWrap: { paddingHorizontal: 48, marginVertical: -2 },

  actions: { padding: 16, paddingTop: 8 },
  saveBtn: {
    backgroundColor: COLOR_PRIMARY, borderRadius: RADIUS_ITEM,
    paddingVertical: 13, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 8, ...SHADOW_SM,
  },
  saveBtnText: { fontSize: 14, fontWeight: '800', color: '#fff' },
  viewBtn: {
    borderWidth: 1.5, borderColor: COLOR_PRIMARY, borderRadius: RADIUS_ITEM,
    paddingVertical: 12, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 8,
  },
  viewBtnText: { fontSize: 14, fontWeight: '700', color: COLOR_PRIMARY },
});
