import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
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
  COLOR_BG,
  COLOR_BORDER,
  COLOR_PRIMARY,
  COLOR_SURFACE,
  COLOR_TEXT,
  COLOR_TEXT_MUTED,
  RADIUS_CARD,
  RADIUS_ITEM,
  RADIUS_PILL,
  SHADOW_LG,
  SHADOW_MD,
} from '@/constants/design';
import { api } from '@/services/api';
import type { ApplicationStatus, BusinessApplication } from '@/types';

// ── Tab filter ────────────────────────────────────────────────────────────────
const TABS: { key: ApplicationStatus | 'all'; label: string; color: string }[] = [
  { key: 'all',      label: 'All',      color: COLOR_PRIMARY },
  { key: 'pending',  label: 'Pending',  color: '#F59E0B' },
  { key: 'approved', label: 'Approved', color: '#10B981' },
  { key: 'rejected', label: 'Rejected', color: '#EF4444' },
];

// ── Reject modal ──────────────────────────────────────────────────────────────
function RejectModal({
  visible,
  onClose,
  onConfirm,
}: {
  visible: boolean;
  onClose: () => void;
  onConfirm: (notes: string) => void;
}) {
  const [notes, setNotes] = useState('');
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={rm.overlay}>
        <View style={rm.card}>
          <Text style={rm.title}>Reject Application</Text>
          <Text style={rm.subtitle}>Provide a reason so the applicant can improve their submission.</Text>
          <TextInput
            style={rm.input}
            value={notes}
            onChangeText={setNotes}
            placeholder="e.g. Missing business permit, incomplete description..."
            placeholderTextColor={COLOR_TEXT_MUTED}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            autoFocus
          />
          <View style={rm.actions}>
            <TouchableOpacity style={rm.cancelBtn} onPress={onClose} activeOpacity={0.8}>
              <Text style={rm.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[rm.confirmBtn, !notes.trim() && rm.confirmBtnDisabled]}
              onPress={() => notes.trim() && onConfirm(notes.trim())}
              activeOpacity={0.85}>
              <Text style={rm.confirmText}>Reject</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
const rm = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', padding: 24 },
  card: { backgroundColor: COLOR_SURFACE, borderRadius: RADIUS_CARD, padding: 24, gap: 16, ...SHADOW_LG },
  title: { fontSize: 20, fontWeight: '800', color: COLOR_TEXT },
  subtitle: { fontSize: 14, color: COLOR_TEXT_MUTED, marginTop: -10 },
  input: {
    backgroundColor: COLOR_BG, borderRadius: RADIUS_ITEM,
    borderWidth: 1.5, borderColor: COLOR_BORDER,
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 14, color: COLOR_TEXT, minHeight: 80, paddingTop: 12,
  },
  actions: { flexDirection: 'row', gap: 12 },
  cancelBtn: {
    flex: 1, borderWidth: 1.5, borderColor: COLOR_BORDER,
    borderRadius: RADIUS_ITEM, paddingVertical: 13, alignItems: 'center',
  },
  cancelText: { fontSize: 14, fontWeight: '700', color: COLOR_TEXT_MUTED },
  confirmBtn: {
    flex: 1, backgroundColor: '#EF4444',
    borderRadius: RADIUS_ITEM, paddingVertical: 13, alignItems: 'center',
  },
  confirmBtnDisabled: { opacity: 0.4 },
  confirmText: { fontSize: 14, fontWeight: '800', color: '#fff' },
});

// ── Application card ──────────────────────────────────────────────────────────
function AppCard({
  app,
  onApprove,
  onReject,
}: {
  app: BusinessApplication;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}) {
  const pending = app.status === 'pending';
  return (
    <View style={card.wrap}>
      {/* Status stripe */}
      <View style={[
        card.stripe,
        app.status === 'approved' && { backgroundColor: '#10B981' },
        app.status === 'rejected' && { backgroundColor: '#EF4444' },
        app.status === 'pending'  && { backgroundColor: '#F59E0B' },
      ]} />

      <View style={card.body}>
        {/* Top row */}
        <View style={card.topRow}>
          <View style={card.iconWrap}>
            <Text style={card.iconEmoji}>🏪</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={card.name}>{app.businessName}</Text>
            <View style={card.categoryRow}>
              <View style={card.categoryPill}>
                <Text style={card.categoryText}>{app.category}</Text>
              </View>
            </View>
          </View>
          <View style={[
            card.statusBadge,
            app.status === 'approved' && { backgroundColor: '#D1FAE5' },
            app.status === 'rejected' && { backgroundColor: '#FEE2E2' },
            app.status === 'pending'  && { backgroundColor: '#FEF3C7' },
          ]}>
            <Text style={[
              card.statusText,
              app.status === 'approved' && { color: '#065F46' },
              app.status === 'rejected' && { color: '#991B1B' },
              app.status === 'pending'  && { color: '#92400E' },
            ]}>
              {app.status.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Description */}
        <Text style={card.desc} numberOfLines={2}>{app.description}</Text>

        {/* Meta */}
        <View style={card.metaGrid}>
          <View style={card.metaItem}>
            <Ionicons name="person-outline" size={13} color={COLOR_TEXT_MUTED} />
            <Text style={card.metaText}>{app.ownerName}</Text>
          </View>
          <View style={card.metaItem}>
            <Ionicons name="location-outline" size={13} color={COLOR_TEXT_MUTED} />
            <Text style={card.metaText}>{app.location}</Text>
          </View>
          <View style={card.metaItem}>
            <Ionicons name="call-outline" size={13} color={COLOR_TEXT_MUTED} />
            <Text style={card.metaText}>{app.contact}</Text>
          </View>
          <View style={card.metaItem}>
            <Ionicons name="time-outline" size={13} color={COLOR_TEXT_MUTED} />
            <Text style={card.metaText}>{new Date(app.submittedAt).toLocaleDateString()}</Text>
          </View>
        </View>

        {/* Review notes */}
        {app.reviewNotes && (
          <View style={card.notes}>
            <Ionicons name="chatbubble-outline" size={13} color={COLOR_TEXT_MUTED} />
            <Text style={card.notesText}>{app.reviewNotes}</Text>
          </View>
        )}

        {/* Actions — only for pending */}
        {pending && (
          <View style={card.actions}>
            <TouchableOpacity
              style={card.rejectBtn}
              onPress={() => onReject(app.id)}
              activeOpacity={0.85}>
              <Ionicons name="close" size={15} color="#EF4444" />
              <Text style={card.rejectText}>Reject</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={card.approveBtn}
              onPress={() => onApprove(app.id)}
              activeOpacity={0.85}>
              <Ionicons name="checkmark" size={15} color="#fff" />
              <Text style={card.approveText}>Approve</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const card = StyleSheet.create({
  wrap: {
    backgroundColor: COLOR_SURFACE,
    borderRadius: RADIUS_CARD,
    overflow: 'hidden',
    flexDirection: 'row',
    ...SHADOW_MD,
  },
  stripe: { width: 5, backgroundColor: COLOR_PRIMARY },
  body: { flex: 1, padding: 16, gap: 10 },
  topRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  iconWrap: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: '#EDE9FE', alignItems: 'center', justifyContent: 'center',
  },
  iconEmoji: { fontSize: 22 },
  name: { fontSize: 16, fontWeight: '800', color: COLOR_TEXT, flex: 1 },
  categoryRow: { flexDirection: 'row', marginTop: 4 },
  categoryPill: {
    backgroundColor: '#F1F5F9', borderRadius: RADIUS_PILL,
    paddingHorizontal: 8, paddingVertical: 2,
  },
  categoryText: { fontSize: 11, fontWeight: '600', color: COLOR_TEXT_MUTED },
  statusBadge: {
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: RADIUS_PILL,
    backgroundColor: '#FEF3C7',
  },
  statusText: { fontSize: 10, fontWeight: '800', color: '#92400E' },
  desc: { fontSize: 13, color: COLOR_TEXT_MUTED, lineHeight: 18 },
  metaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4, flexBasis: '48%' },
  metaText: { fontSize: 12, color: COLOR_TEXT_MUTED, flex: 1 },
  notes: {
    flexDirection: 'row', gap: 6, backgroundColor: '#FEF3C7',
    borderRadius: RADIUS_ITEM, padding: 10, alignItems: 'flex-start',
  },
  notesText: { flex: 1, fontSize: 12, color: '#78350F', lineHeight: 16 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 4 },
  rejectBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    borderWidth: 1.5, borderColor: '#FCA5A5', borderRadius: RADIUS_ITEM, paddingVertical: 10,
    backgroundColor: '#FFF1F2',
  },
  rejectText: { fontSize: 13, fontWeight: '700', color: '#EF4444' },
  approveBtn: {
    flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: '#10B981', borderRadius: RADIUS_ITEM, paddingVertical: 10,
  },
  approveText: { fontSize: 13, fontWeight: '800', color: '#fff' },
});

// ── Main LGU Screen ───────────────────────────────────────────────────────────
export default function LGUScreen() {
  const [adminName, setAdminName] = useState('Admin');
  const [allApps, setAllApps] = useState<BusinessApplication[]>([]);
  const [activeTab, setActiveTab] = useState<ApplicationStatus | 'all'>('pending');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectTarget, setRejectTarget] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const name = (await AsyncStorage.getItem('lguAdminName')) ?? 'Admin';
    setAdminName(name);
    const apps = await api.lgu.getAllApplications();
    setAllApps(apps);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = activeTab === 'all' ? allApps : allApps.filter(a => a.status === activeTab);
  const counts: Record<string, number> = {
    all: allApps.length,
    pending: allApps.filter(a => a.status === 'pending').length,
    approved: allApps.filter(a => a.status === 'approved').length,
    rejected: allApps.filter(a => a.status === 'rejected').length,
  };

  const handleApprove = async (id: string) => {
    Alert.alert('Approve Application', 'This business will be added to the tourist map. Confirm?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Approve', style: 'default',
        onPress: async () => {
          setActionLoading(id);
          try {
            await api.lgu.approve(id);
            await load();
          } catch {
            Alert.alert('Error', 'Failed to approve. Please try again.');
          } finally {
            setActionLoading(null);
          }
        },
      },
    ]);
  };

  const handleRejectConfirm = async (notes: string) => {
    if (!rejectTarget) return;
    setActionLoading(rejectTarget);
    setRejectTarget(null);
    try {
      await api.lgu.reject(rejectTarget, notes);
      await load();
    } catch {
      Alert.alert('Error', 'Failed to reject. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSignOut = async () => {
    await AsyncStorage.multiRemove(['userRole', 'userName', 'lguAdminName']);
    router.replace('/login');
  };

  return (
    <LinearGradient
      colors={['#0C4A6E', '#0369A1', '#0284C7']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0.6 }}
      style={styles.bg}>
      <SafeAreaView style={styles.safe}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.headerBadge}>
              <Text style={styles.headerBadgeText}>🏛️ LGU</Text>
            </View>
            <View>
              <Text style={styles.headerRole}>Admin Panel</Text>
              <Text style={styles.headerName}>{adminName}</Text>
            </View>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={load} style={styles.iconBtn} activeOpacity={0.8}>
              <Ionicons name="refresh-outline" size={18} color="rgba(255,255,255,0.8)" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSignOut} style={styles.iconBtn} activeOpacity={0.8}>
              <Ionicons name="log-out-outline" size={18} color="rgba(255,255,255,0.8)" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats strip */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNum}>{counts.pending}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNum}>{counts.approved}</Text>
            <Text style={styles.statLabel}>Approved</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNum}>{counts.rejected}</Text>
            <Text style={styles.statLabel}>Rejected</Text>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Tab filter */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabScroll}
            style={styles.tabBar}>
            {TABS.map(t => (
              <TouchableOpacity
                key={t.key}
                style={[styles.tabBtn, activeTab === t.key && { backgroundColor: t.color }]}
                onPress={() => setActiveTab(t.key)}
                activeOpacity={0.85}>
                <Text style={[styles.tabText, activeTab === t.key && styles.tabTextActive]}>
                  {t.label}
                  {counts[t.key] > 0 ? ` (${counts[t.key]})` : ''}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {loading ? (
            <ActivityIndicator color={COLOR_PRIMARY} size="large" style={{ marginTop: 60 }} />
          ) : (
            <ScrollView
              contentContainerStyle={styles.list}
              showsVerticalScrollIndicator={false}>
              {filtered.length === 0 ? (
                <View style={styles.empty}>
                  <Text style={styles.emptyEmoji}>📭</Text>
                  <Text style={styles.emptyTitle}>No Applications</Text>
                  <Text style={styles.emptyText}>
                    {activeTab === 'pending'
                      ? 'All pending applications have been reviewed.'
                      : `No ${activeTab} applications yet.`}
                  </Text>
                </View>
              ) : (
                filtered.map(app => (
                  actionLoading === app.id
                    ? (
                      <View key={app.id} style={styles.loadingCard}>
                        <ActivityIndicator color={COLOR_PRIMARY} />
                        <Text style={styles.loadingText}>Processing...</Text>
                      </View>
                    )
                    : (
                      <AppCard
                        key={app.id}
                        app={app}
                        onApprove={handleApprove}
                        onReject={id => setRejectTarget(id)}
                      />
                    )
                ))
              )}
            </ScrollView>
          )}
        </View>
      </SafeAreaView>

      <RejectModal
        visible={!!rejectTarget}
        onClose={() => setRejectTarget(null)}
        onConfirm={handleRejectConfirm}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  safe: { flex: 1 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 16,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12, paddingHorizontal: 10, paddingVertical: 6,
  },
  headerBadgeText: { fontSize: 14, fontWeight: '700', color: '#fff' },
  headerRole: { fontSize: 11, color: 'rgba(255,255,255,0.70)', fontWeight: '600', letterSpacing: 0.8, textTransform: 'uppercase' },
  headerName: { fontSize: 18, fontWeight: '800', color: '#fff' },
  headerActions: { flexDirection: 'row', gap: 8 },
  iconBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },

  statsRow: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: RADIUS_ITEM,
    paddingVertical: 12,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statNum: { fontSize: 22, fontWeight: '900', color: '#fff' },
  statLabel: { fontSize: 11, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.25)' },

  content: {
    flex: 1,
    backgroundColor: COLOR_BG,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
  },

  tabBar: { flexGrow: 0 },
  tabScroll: { flexDirection: 'row', gap: 8, paddingHorizontal: 20, paddingVertical: 14 },
  tabBtn: {
    paddingHorizontal: 16, paddingVertical: 7,
    borderRadius: RADIUS_PILL,
    backgroundColor: '#E2E8F0',
  },
  tabText: { fontSize: 13, fontWeight: '700', color: COLOR_TEXT_MUTED },
  tabTextActive: { color: '#fff' },

  list: { padding: 16, gap: 14, paddingBottom: 40 },

  empty: { alignItems: 'center', paddingTop: 60, gap: 10 },
  emptyEmoji: { fontSize: 44 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: COLOR_TEXT },
  emptyText: { fontSize: 14, color: COLOR_TEXT_MUTED, textAlign: 'center' },

  loadingCard: {
    backgroundColor: COLOR_SURFACE,
    borderRadius: RADIUS_CARD,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    ...SHADOW_MD,
  },
  loadingText: { fontSize: 14, color: COLOR_TEXT_MUTED },
});
