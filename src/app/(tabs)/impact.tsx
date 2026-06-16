import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  COLOR_ACCENT,
  COLOR_BG,
  COLOR_BORDER,
  COLOR_PRIMARY,
  COLOR_SECONDARY,
  COLOR_SURFACE,
  COLOR_TEXT,
  COLOR_TEXT_MUTED,
  RADIUS_CARD,
  RADIUS_ITEM,
  RADIUS_PILL,
  SCREEN_BOTTOM_PADDING,
  SHADOW_LG,
  SHADOW_MD,
  SHADOW_SM,
} from '@/constants/design';
import { api } from '@/services/api';
import type { Badge, LeaderboardEntry } from '@/types';

type Tab = 'leaderboard' | 'badges';

const MEDAL_COLORS = ['#F59E0B', '#94A3B8', '#CD7C3A'];
const MEDAL_ICONS: ['trophy', 'medal', 'medal'] = ['trophy', 'medal', 'medal'];
const PILLAR_HEIGHTS = [90, 60, 50];

export default function ImpactScreen() {
  const [activeTab, setActiveTab] = useState<Tab>('leaderboard');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.leaderboard.get(), api.badges.getAll()])
      .then(([lb, bd]) => { setLeaderboard(lb); setBadges(bd); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const top3 = useMemo(() => leaderboard.slice(0, 3), [leaderboard]);
  const rest = useMemo(() => leaderboard.slice(3), [leaderboard]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: SCREEN_BOTTOM_PADDING }}
        showsVerticalScrollIndicator={false}>

        {/* ── Header ── */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.menuBtn}>
            <Ionicons name="menu-outline" size={22} color={COLOR_TEXT} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>ALBAY GO</Text>
          <TouchableOpacity style={styles.avatarBtn}>
            <Ionicons name="person" size={18} color={COLOR_PRIMARY} />
          </TouchableOpacity>
        </View>

        <Text style={styles.pageTitle}>Albay Impact Hub</Text>

        {/* ── Tab Switcher ── */}
        <View style={styles.tabSwitcher}>
          <TouchableOpacity
            style={[styles.switchTab, activeTab === 'leaderboard' && styles.switchTabActive]}
            onPress={() => setActiveTab('leaderboard')}
            activeOpacity={0.85}>
            <Ionicons
              name="trophy"
              size={14}
              color={activeTab === 'leaderboard' ? '#FFFFFF' : COLOR_TEXT_MUTED}
            />
            <Text style={[styles.switchTabText, activeTab === 'leaderboard' && styles.switchTabTextActive]}>
              Leaderboard
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.switchTab, activeTab === 'badges' && styles.switchTabActive]}
            onPress={() => setActiveTab('badges')}
            activeOpacity={0.85}>
            <Ionicons
              name="medal"
              size={14}
              color={activeTab === 'badges' ? '#FFFFFF' : COLOR_TEXT_MUTED}
            />
            <Text style={[styles.switchTabText, activeTab === 'badges' && styles.switchTabTextActive]}>
              Badges
            </Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator color={COLOR_PRIMARY} style={{ marginTop: 48 }} />
        ) : activeTab === 'leaderboard' ? (
          <LeaderboardView top3={top3} rest={rest} />
        ) : (
          <BadgesView badges={badges} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Leaderboard ──────────────────────────────────────────────────────────────
function LeaderboardView({ top3, rest }: { top3: LeaderboardEntry[]; rest: LeaderboardEntry[] }) {
  const podiumOrder = [top3[1], top3[0], top3[2]].filter(Boolean);

  return (
    <View style={styles.section}>
      {/* Podium */}
      <View style={styles.podiumCard}>
        <View style={styles.podium}>
          {podiumOrder.map((entry, i) => {
            const isCenter = i === 1;
            const originalRank = entry.rank - 1;
            return (
              <View key={entry.userId} style={[styles.podiumItem, isCenter && styles.podiumItemCenter]}>
                {/* Avatar */}
                <View style={[
                  styles.podiumAvatar,
                  isCenter && { width: 64, height: 64, borderRadius: 32, borderWidth: 3, borderColor: COLOR_ACCENT },
                ]}>
                  <Text style={[styles.podiumAvatarText, isCenter && { fontSize: 24 }]}>
                    {entry.name[0]}
                  </Text>
                  {isCenter && (
                    <View style={styles.crownBadge}>
                      <Text style={{ fontSize: 14 }}>👑</Text>
                    </View>
                  )}
                </View>

                {/* Name & Points */}
                <Text style={[styles.podiumName, isCenter && { fontWeight: '800' }]} numberOfLines={1}>
                  {entry.name}
                </Text>
                <Text style={[styles.podiumPoints, isCenter && { color: COLOR_ACCENT }]}>
                  {(entry.points / 1000).toFixed(1)}k{isCenter ? ' pts' : ''}
                </Text>
                {isCenter && entry.points > 0 && (
                  <Text style={styles.podiumPtsLabel}>{entry.points.toLocaleString()} pts</Text>
                )}

                {/* Pillar */}
                <View style={[
                  styles.pillar,
                  {
                    height: PILLAR_HEIGHTS[originalRank],
                    backgroundColor: isCenter ? COLOR_PRIMARY : '#E2E8F0',
                  },
                ]}>
                  <Text style={[styles.pillarRank, isCenter && { color: '#fff' }]}>
                    {entry.rank}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>

      {/* Remaining rows */}
      {rest.map(entry => (
        <View key={entry.userId} style={[
          styles.rankRow,
          entry.isCurrentUser && styles.rankRowSelf,
        ]}>
          <Text style={styles.rankNum}>{entry.rank}</Text>
          <View style={[styles.rankAvatar, entry.isCurrentUser && { backgroundColor: COLOR_PRIMARY + '20' }]}>
            <Text style={[styles.rankAvatarText, entry.isCurrentUser && { color: COLOR_PRIMARY }]}>
              {entry.name[0]}
            </Text>
          </View>
          <View style={styles.rankInfo}>
            <Text style={styles.rankName}>
              {entry.name}{entry.isCurrentUser ? ' (You)' : ''}
            </Text>
            <Text style={styles.rankPts}>{entry.points.toLocaleString()} pts</Text>
          </View>
          {entry.weeklyGain && entry.weeklyGain > 0 && (
            <View style={[styles.gainChip, entry.isCurrentUser && { backgroundColor: COLOR_PRIMARY + '18' }]}>
              <Text style={[styles.gainText, entry.isCurrentUser && { color: COLOR_PRIMARY }]}>
                +{entry.weeklyGain} pts this week
              </Text>
            </View>
          )}
        </View>
      ))}
    </View>
  );
}

// ── Badges ───────────────────────────────────────────────────────────────────
function BadgesView({ badges }: { badges: Badge[] }) {
  return (
    <View style={styles.section}>
      {badges.map(badge => (
        <View key={badge.id} style={[styles.badgeRow, !badge.unlocked && styles.badgeRowLocked]}>
          <View style={[styles.badgeIconWrap, !badge.unlocked && { backgroundColor: '#E2E8F0' }]}>
            <Text style={styles.badgeIcon}>{badge.icon}</Text>
          </View>
          <View style={styles.badgeInfo}>
            <Text style={[styles.badgeName, !badge.unlocked && { color: COLOR_TEXT_MUTED }]}>
              {badge.name}
            </Text>
            <Text style={styles.badgeDesc}>{badge.description}</Text>
            {badge.totalVotes != null && (
              <View style={styles.progressBar}>
                <View style={[
                  styles.progressFill,
                  { width: `${((badge.currentVotes ?? 0) / badge.totalVotes) * 100}%` },
                ]} />
              </View>
            )}
            {badge.totalVotes != null && (
              <Text style={styles.progressLabel}>
                {badge.currentVotes}/{badge.totalVotes} Helpful Votes
              </Text>
            )}
          </View>
          <View style={[styles.badgeStatus, badge.unlocked && styles.badgeStatusUnlocked]}>
            <Ionicons
              name={badge.unlocked ? 'checkmark-circle' : 'lock-closed-outline'}
              size={16}
              color={badge.unlocked ? '#10B981' : COLOR_TEXT_MUTED}
            />
            <Text style={[styles.badgeStatusText, badge.unlocked && { color: '#10B981' }]}>
              {badge.unlocked ? 'Unlocked' : 'Locked'}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLOR_BG },
  scroll: { flex: 1 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  menuBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: COLOR_SURFACE,
    alignItems: 'center', justifyContent: 'center',
    ...SHADOW_SM,
  },
  headerTitle: { fontSize: 16, fontWeight: '900', color: COLOR_PRIMARY, letterSpacing: 1.5 },
  avatarBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(17,94,89,0.10)',
    alignItems: 'center', justifyContent: 'center',
  },

  pageTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: COLOR_TEXT,
    paddingHorizontal: 20,
    marginBottom: 20,
    letterSpacing: -0.5,
  },

  // Tab Switcher
  tabSwitcher: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 24,
    backgroundColor: COLOR_SURFACE,
    borderRadius: RADIUS_ITEM,
    padding: 4,
    ...SHADOW_SM,
    borderWidth: 1,
    borderColor: COLOR_BORDER,
  },
  switchTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: RADIUS_ITEM - 2,
  },
  switchTabActive: { backgroundColor: COLOR_PRIMARY },
  switchTabText: { fontSize: 14, fontWeight: '700', color: COLOR_TEXT_MUTED },
  switchTabTextActive: { color: '#FFFFFF' },

  section: { paddingHorizontal: 20, gap: 12 },

  // Podium
  podiumCard: {
    backgroundColor: COLOR_SURFACE,
    borderRadius: RADIUS_CARD,
    padding: 24,
    ...SHADOW_MD,
  },
  podium: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 220,
  },
  podiumItem: {
    alignItems: 'center',
    width: 90,
    gap: 4,
  },
  podiumItemCenter: { marginBottom: 0 },
  podiumAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLOR_PRIMARY + '20',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  podiumAvatarText: {
    fontSize: 20,
    fontWeight: '800',
    color: COLOR_PRIMARY,
  },
  crownBadge: {
    position: 'absolute',
    top: -18,
  },
  podiumName: { fontSize: 13, fontWeight: '600', color: COLOR_TEXT, textAlign: 'center' },
  podiumPoints: { fontSize: 12, fontWeight: '700', color: COLOR_TEXT_MUTED },
  podiumPtsLabel: { fontSize: 11, fontWeight: '700', color: COLOR_ACCENT, marginTop: -2 },
  pillar: {
    width: 56,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  pillarRank: { fontSize: 16, fontWeight: '900', color: COLOR_TEXT_MUTED },

  // Rank Rows
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLOR_SURFACE,
    borderRadius: RADIUS_ITEM,
    padding: 14,
    gap: 12,
    ...SHADOW_SM,
  },
  rankRowSelf: {
    borderWidth: 1.5,
    borderColor: COLOR_PRIMARY + '40',
    backgroundColor: COLOR_PRIMARY + '06',
  },
  rankNum: { fontSize: 16, fontWeight: '700', color: COLOR_TEXT_MUTED, width: 20 },
  rankAvatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#E2E8F0',
    alignItems: 'center', justifyContent: 'center',
  },
  rankAvatarText: { fontSize: 16, fontWeight: '700', color: COLOR_TEXT },
  rankInfo: { flex: 1 },
  rankName: { fontSize: 15, fontWeight: '700', color: COLOR_TEXT },
  rankPts: { fontSize: 12, color: COLOR_TEXT_MUTED, marginTop: 1 },
  gainChip: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS_PILL,
  },
  gainText: { fontSize: 11, fontWeight: '700', color: COLOR_SECONDARY },

  // Badges
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLOR_SURFACE,
    borderRadius: RADIUS_CARD,
    padding: 16,
    gap: 14,
    ...SHADOW_SM,
  },
  badgeRowLocked: { opacity: 0.72 },
  badgeIconWrap: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: COLOR_ACCENT + '20',
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  badgeIcon: { fontSize: 24 },
  badgeInfo: { flex: 1 },
  badgeName: { fontSize: 15, fontWeight: '800', color: COLOR_TEXT, marginBottom: 3 },
  badgeDesc: { fontSize: 13, color: COLOR_TEXT_MUTED, lineHeight: 18 },
  progressBar: {
    height: 4, backgroundColor: '#E2E8F0', borderRadius: 2, marginTop: 8,
  },
  progressFill: {
    height: 4, backgroundColor: COLOR_ACCENT, borderRadius: 2,
  },
  progressLabel: { fontSize: 11, color: COLOR_TEXT_MUTED, marginTop: 4 },
  badgeStatus: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    flexShrink: 0, paddingTop: 2,
  },
  badgeStatusUnlocked: {},
  badgeStatusText: { fontSize: 11, fontWeight: '700', color: COLOR_TEXT_MUTED },
});
