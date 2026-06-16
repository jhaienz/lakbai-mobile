import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
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
import type { UserProfile } from '@/types';

const VIBES_ALL = ['Tech', 'Heritage', 'Food', 'Nature', 'Adventure', 'Local Crafts'];
const MOBILITY_OPTIONS = ['Vehicle', 'Motorcycle', 'Tricycle', 'Walk'];
const BUDGET_OPTIONS = ['Budget', 'Mid-Range', 'Premium'];

const DEFAULT_USER: UserProfile = {
  id: 'u4',
  name: 'Jake Roi',
  vibes: ['Food', 'Heritage'],
  points: 9850,
  level: 'Urban Explorer & Local Supporter',
  contributions: 2400,
  rank: 4,
  mobility: 'Vehicle',
  budget: 'Mid-Range',
  interests: ['Tech', 'Heritage', 'Food'],
};

export default function ProfileScreen() {
  const [user, setUser] = useState<UserProfile>(DEFAULT_USER);
  const [loading, setLoading] = useState(true);
  const [editModal, setEditModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editMobility, setEditMobility] = useState('');
  const [editBudget, setEditBudget] = useState('');
  const [editInterests, setEditInterests] = useState<string[]>([]);

  useEffect(() => {
    Promise.all([
      api.user.get().catch(() => null),
      AsyncStorage.getItem('userName'),
    ]).then(([apiUser, storedName]) => {
      if (apiUser) {
        if (storedName) apiUser.name = storedName;
        setUser(apiUser);
      } else if (storedName) {
        setUser(prev => ({ ...prev, name: storedName }));
      }
    }).finally(() => setLoading(false));
  }, []);

  const openEdit = () => {
    setEditName(user.name);
    setEditMobility(user.mobility);
    setEditBudget(user.budget);
    setEditInterests(user.interests);
    setEditModal(true);
  };

  const saveEdit = async () => {
    const updated = { ...user, name: editName, mobility: editMobility, budget: editBudget, interests: editInterests };
    setUser(updated);
    await AsyncStorage.setItem('userName', editName);
    try { await api.user.update(updated); } catch { /* offline */ }
    setEditModal(false);
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.multiRemove(['onboarded', 'userName', 'userVibes']);
          router.replace('/onboarding');
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLOR_BG }}>
        <ActivityIndicator color={COLOR_PRIMARY} size="large" />
      </View>
    );
  }

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
          <TouchableOpacity style={styles.settingsBtn}>
            <Ionicons name="settings-outline" size={20} color={COLOR_TEXT} />
          </TouchableOpacity>
        </View>

        {/* ── Hero Profile ── */}
        <LinearGradient
          colors={[COLOR_PRIMARY + '14', COLOR_BG]}
          style={styles.heroSection}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarLargeText}>{user.name[0]?.toUpperCase()}</Text>
            <View style={styles.onlineBadge} />
          </View>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userLevel}>{user.level}</Text>
          <View style={styles.rankBadge}>
            <Ionicons name="trophy" size={12} color={COLOR_ACCENT} />
            <Text style={styles.rankBadgeText}>Rank #{user.rank} •{' '}
              <Text style={{ color: COLOR_ACCENT }}>{user.points.toLocaleString()} pts</Text>
            </Text>
          </View>
        </LinearGradient>

        {/* ── Impact Summary Banner ── */}
        <View style={styles.impactCard}>
          <View style={styles.impactHeader}>
            <Ionicons name="trending-up" size={16} color={COLOR_PRIMARY} />
            <Text style={styles.impactLabel}>IMPACT SUMMARY</Text>
          </View>
          <Text style={styles.impactAmount}>
            ₱{user.contributions.toLocaleString()}
          </Text>
          <Text style={styles.impactSubtext}>Total Contributed to Local Verified micro-SMEs</Text>
          <View style={styles.impactDivider} />
          <View style={styles.impactStats}>
            <StatItem icon="location" label="Places Visited" value="12" />
            <StatItem icon="star" label="Reviews Given" value="8" />
            <StatItem icon="heart" label="SMEs Supported" value="5" />
          </View>
        </View>

        {/* ── Preferences Bento Grid ── */}
        <Text style={styles.sectionTitle}>Your Preferences</Text>
        <View style={styles.bentoGrid}>
          <BentoTile
            icon="bicycle"
            label="Mobility"
            value={user.mobility}
            color={COLOR_SECONDARY}
            style={{ flex: 1 }}
          />
          <BentoTile
            icon="wallet"
            label="Budget"
            value={user.budget}
            color={COLOR_ACCENT}
            style={{ flex: 1 }}
          />
        </View>
        <View style={styles.bentoGrid}>
          <View style={styles.bentoInterests}>
            <View style={styles.bentoInterestHeader}>
              <Ionicons name="sparkles" size={14} color={COLOR_PRIMARY} />
              <Text style={styles.bentoLabel}>Interests</Text>
            </View>
            <View style={styles.interestPills}>
              {user.interests.map(interest => (
                <View key={interest} style={styles.interestPill}>
                  <Text style={styles.interestPillText}>{interest}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* ── Actions ── */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.editBtn} onPress={openEdit} activeOpacity={0.85}>
            <Ionicons name="create-outline" size={16} color={COLOR_PRIMARY} />
            <Text style={styles.editBtnText}>Edit Preferences</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
            <Ionicons name="log-out-outline" size={16} color={COLOR_TEXT_MUTED} />
            <Text style={styles.logoutBtnText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* ── Edit Modal ── */}
      <Modal visible={editModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalSafe}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setEditModal(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Edit Preferences</Text>
            <TouchableOpacity onPress={saveEdit}>
              <Text style={styles.modalSave}>Save</Text>
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.modalContent}>
            <Text style={styles.modalLabel}>Your Name</Text>
            <TextInput
              style={styles.modalInput}
              value={editName}
              onChangeText={setEditName}
              placeholder="Enter name"
            />
            <Text style={styles.modalLabel}>Mobility</Text>
            <View style={styles.optionRow}>
              {MOBILITY_OPTIONS.map(opt => (
                <TouchableOpacity
                  key={opt}
                  style={[styles.optionPill, editMobility === opt && styles.optionPillActive]}
                  onPress={() => setEditMobility(opt)}>
                  <Text style={[styles.optionText, editMobility === opt && styles.optionTextActive]}>
                    {opt}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.modalLabel}>Budget Range</Text>
            <View style={styles.optionRow}>
              {BUDGET_OPTIONS.map(opt => (
                <TouchableOpacity
                  key={opt}
                  style={[styles.optionPill, editBudget === opt && styles.optionPillActive]}
                  onPress={() => setEditBudget(opt)}>
                  <Text style={[styles.optionText, editBudget === opt && styles.optionTextActive]}>
                    {opt}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.modalLabel}>Interests</Text>
            <View style={styles.optionRow}>
              {VIBES_ALL.map(v => {
                const active = editInterests.includes(v);
                return (
                  <TouchableOpacity
                    key={v}
                    style={[styles.optionPill, active && styles.optionPillActive]}
                    onPress={() => setEditInterests(prev =>
                      active ? prev.filter(i => i !== v) : [...prev, v])}>
                    <Text style={[styles.optionText, active && styles.optionTextActive]}>{v}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

function StatItem({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  return (
    <View style={styles.statItem}>
      <Ionicons name={icon} size={16} color={COLOR_PRIMARY} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function BentoTile({ icon, label, value, color, style }: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  color: string;
  style?: object;
}) {
  return (
    <View style={[styles.bentoTile, style]}>
      <View style={[styles.bentoIconWrap, { backgroundColor: color + '18' }]}>
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <Text style={styles.bentoLabel}>{label}</Text>
      <Text style={styles.bentoValue}>{value}</Text>
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
  settingsBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: COLOR_SURFACE,
    alignItems: 'center', justifyContent: 'center',
    ...SHADOW_SM,
  },

  // Hero
  heroSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 28,
    paddingTop: 12,
  },
  avatarLarge: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: COLOR_PRIMARY + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    borderWidth: 3,
    borderColor: COLOR_PRIMARY + '30',
    position: 'relative',
  },
  avatarLargeText: { fontSize: 36, fontWeight: '800', color: COLOR_PRIMARY },
  onlineBadge: {
    position: 'absolute',
    bottom: 4, right: 4,
    width: 16, height: 16, borderRadius: 8,
    backgroundColor: '#10B981',
    borderWidth: 2, borderColor: '#fff',
  },
  userName: { fontSize: 26, fontWeight: '800', color: COLOR_TEXT, marginBottom: 4 },
  userLevel: { fontSize: 14, color: COLOR_TEXT_MUTED, marginBottom: 10 },
  rankBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: COLOR_SURFACE,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS_PILL,
    ...SHADOW_SM,
  },
  rankBadgeText: { fontSize: 13, fontWeight: '600', color: COLOR_TEXT },

  // Impact Card
  impactCard: {
    marginHorizontal: 20,
    backgroundColor: COLOR_SURFACE,
    borderRadius: RADIUS_CARD,
    padding: 20,
    marginBottom: 24,
    ...SHADOW_MD,
  },
  impactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  impactLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLOR_TEXT_MUTED,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  impactAmount: { fontSize: 36, fontWeight: '800', color: COLOR_PRIMARY },
  impactSubtext: { fontSize: 13, color: COLOR_TEXT_MUTED, marginTop: 2, marginBottom: 16 },
  impactDivider: { height: 1, backgroundColor: COLOR_BORDER, marginBottom: 16 },
  impactStats: { flexDirection: 'row', justifyContent: 'space-around' },
  statItem: { alignItems: 'center', gap: 3 },
  statValue: { fontSize: 20, fontWeight: '800', color: COLOR_TEXT },
  statLabel: { fontSize: 11, color: COLOR_TEXT_MUTED, textAlign: 'center' },

  // Bento Grid
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLOR_TEXT,
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  bentoGrid: {
    flexDirection: 'row',
    marginHorizontal: 20,
    gap: 12,
    marginBottom: 12,
  },
  bentoTile: {
    backgroundColor: COLOR_SURFACE,
    borderRadius: RADIUS_ITEM,
    padding: 16,
    ...SHADOW_SM,
    borderWidth: 1,
    borderColor: COLOR_BORDER,
  },
  bentoInterests: {
    flex: 1,
    backgroundColor: COLOR_SURFACE,
    borderRadius: RADIUS_ITEM,
    padding: 16,
    ...SHADOW_SM,
    borderWidth: 1,
    borderColor: COLOR_BORDER,
  },
  bentoInterestHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 10,
  },
  bentoIconWrap: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 10,
  },
  bentoLabel: { fontSize: 11, fontWeight: '700', color: COLOR_TEXT_MUTED, textTransform: 'uppercase', letterSpacing: 0.5 },
  bentoValue: { fontSize: 16, fontWeight: '800', color: COLOR_TEXT, marginTop: 3 },
  interestPills: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  interestPill: {
    backgroundColor: COLOR_PRIMARY + '14',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS_PILL,
  },
  interestPillText: { fontSize: 12, fontWeight: '600', color: COLOR_PRIMARY },

  // Actions
  actions: { paddingHorizontal: 20, gap: 10, marginTop: 4 },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: RADIUS_ITEM,
    paddingVertical: 15,
    borderWidth: 1.5,
    borderColor: COLOR_PRIMARY,
    backgroundColor: COLOR_SURFACE,
  },
  editBtnText: { fontSize: 15, fontWeight: '700', color: COLOR_PRIMARY },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  logoutBtnText: { fontSize: 14, color: COLOR_TEXT_MUTED },

  // Edit Modal
  modalSafe: { flex: 1, backgroundColor: COLOR_BG },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLOR_BORDER,
    backgroundColor: COLOR_SURFACE,
  },
  modalCancel: { fontSize: 15, color: COLOR_TEXT_MUTED },
  modalTitle: { fontSize: 17, fontWeight: '700', color: COLOR_TEXT },
  modalSave: { fontSize: 15, fontWeight: '700', color: COLOR_PRIMARY },
  modalContent: { padding: 20, gap: 6 },
  modalLabel: {
    fontSize: 11, fontWeight: '700', color: COLOR_TEXT_MUTED,
    textTransform: 'uppercase', letterSpacing: 0.8, marginTop: 14, marginBottom: 8,
  },
  modalInput: {
    backgroundColor: COLOR_SURFACE,
    borderRadius: RADIUS_ITEM,
    borderWidth: 1.5,
    borderColor: COLOR_BORDER,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: COLOR_TEXT,
  },
  optionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  optionPill: {
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: RADIUS_PILL,
    backgroundColor: '#E2E8F0',
  },
  optionPillActive: { backgroundColor: COLOR_PRIMARY },
  optionText: { fontSize: 14, fontWeight: '600', color: COLOR_TEXT },
  optionTextActive: { color: '#FFFFFF' },
});
