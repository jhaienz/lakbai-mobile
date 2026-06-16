import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
  SHADOW_LG,
  SHADOW_MD,
} from '@/constants/design';
import { api } from '@/services/api';
import type { BusinessApplication } from '@/types';

// ── Status badge ──────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  pending:  { color: '#F59E0B', bg: '#FEF3C7', icon: 'time-outline',        label: 'Under Review' },
  approved: { color: '#10B981', bg: '#D1FAE5', icon: 'checkmark-circle',    label: 'Approved' },
  rejected: { color: '#EF4444', bg: '#FEE2E2', icon: 'close-circle-outline', label: 'Rejected' },
} as const;

function StatusPill({ status }: { status: BusinessApplication['status'] }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <View style={[sp.pill, { backgroundColor: cfg.bg }]}>
      <Ionicons name={cfg.icon as any} size={13} color={cfg.color} />
      <Text style={[sp.label, { color: cfg.color }]}>{cfg.label}</Text>
    </View>
  );
}
const sp = StyleSheet.create({
  pill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: RADIUS_PILL },
  label: { fontSize: 12, fontWeight: '700' },
});

// ── Application status card ───────────────────────────────────────────────────
function ApplicationCard({ app, onReapply }: { app: BusinessApplication; onReapply: () => void }) {
  return (
    <View style={ac.card}>
      <View style={ac.header}>
        <View style={ac.iconWrap}>
          <Text style={ac.icon}>🏪</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={ac.name}>{app.businessName}</Text>
          <Text style={ac.category}>{app.category}</Text>
        </View>
        <StatusPill status={app.status} />
      </View>

      <View style={ac.divider} />

      <View style={ac.row}>
        <Ionicons name="location-outline" size={14} color={COLOR_TEXT_MUTED} />
        <Text style={ac.meta}>{app.location}</Text>
      </View>
      <View style={ac.row}>
        <Ionicons name="calendar-outline" size={14} color={COLOR_TEXT_MUTED} />
        <Text style={ac.meta}>Submitted {new Date(app.submittedAt).toLocaleDateString()}</Text>
      </View>

      {app.status === 'pending' && (
        <View style={ac.notice}>
          <Ionicons name="information-circle-outline" size={16} color='#F59E0B' />
          <Text style={[ac.noticeText, { color: '#92400E' }]}>
            Your application is being reviewed by our LGU admin team. Usually takes 1–2 business days.
          </Text>
        </View>
      )}

      {app.status === 'approved' && (
        <View style={[ac.notice, { backgroundColor: '#D1FAE5', borderColor: '#6EE7B7' }]}>
          <Ionicons name="checkmark-circle" size={16} color='#10B981' />
          <Text style={[ac.noticeText, { color: '#065F46' }]}>
            Congratulations! Your business is now live on LakbAI and visible to tourists.
          </Text>
        </View>
      )}

      {app.status === 'rejected' && (
        <>
          {app.reviewNotes && (
            <View style={[ac.notice, { backgroundColor: '#FEE2E2', borderColor: '#FCA5A5' }]}>
              <Ionicons name="alert-circle-outline" size={16} color='#EF4444' />
              <Text style={[ac.noticeText, { color: '#991B1B' }]}>
                Reason: {app.reviewNotes}
              </Text>
            </View>
          )}
          <TouchableOpacity style={ac.reapplyBtn} onPress={onReapply} activeOpacity={0.85}>
            <Ionicons name="refresh-outline" size={16} color={COLOR_PRIMARY} />
            <Text style={ac.reapplyText}>Submit New Application</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const ac = StyleSheet.create({
  card: {
    backgroundColor: COLOR_SURFACE,
    borderRadius: RADIUS_CARD,
    padding: 20,
    gap: 12,
    ...SHADOW_MD,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconWrap: {
    width: 48, height: 48, borderRadius: 14,
    backgroundColor: '#EDE9FE', alignItems: 'center', justifyContent: 'center',
  },
  icon: { fontSize: 24 },
  name: { fontSize: 16, fontWeight: '800', color: COLOR_TEXT },
  category: { fontSize: 12, color: COLOR_TEXT_MUTED, marginTop: 2 },
  divider: { height: 1, backgroundColor: COLOR_BORDER },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  meta: { fontSize: 13, color: COLOR_TEXT_MUTED },
  notice: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: '#FEF3C7', borderWidth: 1, borderColor: '#FDE68A',
    borderRadius: RADIUS_ITEM, padding: 12,
  },
  noticeText: { flex: 1, fontSize: 13, lineHeight: 18 },
  reapplyBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderWidth: 1.5, borderColor: COLOR_PRIMARY, borderRadius: RADIUS_ITEM, paddingVertical: 12,
  },
  reapplyText: { fontSize: 14, fontWeight: '700', color: COLOR_PRIMARY },
});

// ── Submission form ───────────────────────────────────────────────────────────
const CATEGORIES = ['Food & Dining', 'Local Crafts', 'Adventure', 'Heritage', 'Eco-Tourism', 'Accommodation', 'Retail'];

function SubmitForm({ ownerName, onSubmitted }: { ownerName: string; onSubmitted: () => void }) {
  const [form, setForm] = useState({
    businessName: '',
    category: '',
    description: '',
    location: '',
    contact: '',
  });
  const [loading, setLoading] = useState(false);
  const [catOpen, setCatOpen] = useState(false);

  const set = (key: keyof typeof form) => (val: string) => setForm(prev => ({ ...prev, [key]: val }));
  const canSubmit = Object.values(form).every(v => v.trim().length > 0);

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setLoading(true);
    try {
      await api.business.submit({
        ...form,
        ownerName,
        imageUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400',
      });
      onSubmitted();
    } catch {
      Alert.alert('Error', 'Failed to submit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={sf.card}>
      <Text style={sf.title}>Register Your Business</Text>
      <Text style={sf.subtitle}>Fill in details to get listed on LakbAI</Text>

      <View style={sf.field}>
        <Text style={sf.label}>Business Name</Text>
        <TextInput
          style={sf.input}
          value={form.businessName}
          onChangeText={set('businessName')}
          placeholder="e.g. Kusina ni Mama Rosa"
          placeholderTextColor={COLOR_TEXT_MUTED}
        />
      </View>

      <View style={sf.field}>
        <Text style={sf.label}>Category</Text>
        <TouchableOpacity
          style={[sf.input, sf.catButton]}
          onPress={() => setCatOpen(v => !v)}
          activeOpacity={0.85}>
          <Text style={form.category ? sf.catSelected : sf.catPlaceholder}>
            {form.category || 'Select a category...'}
          </Text>
          <Ionicons name={catOpen ? 'chevron-up' : 'chevron-down'} size={14} color={COLOR_TEXT_MUTED} />
        </TouchableOpacity>
        {catOpen && (
          <View style={sf.catMenu}>
            {CATEGORIES.map(cat => (
              <TouchableOpacity
                key={cat}
                style={[sf.catItem, form.category === cat && sf.catItemActive]}
                onPress={() => { set('category')(cat); setCatOpen(false); }}>
                <Text style={[sf.catItemText, form.category === cat && { color: COLOR_PRIMARY, fontWeight: '700' }]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      <View style={sf.field}>
        <Text style={sf.label}>Description</Text>
        <TextInput
          style={[sf.input, sf.textarea]}
          value={form.description}
          onChangeText={set('description')}
          placeholder="Describe your business, products, or services..."
          placeholderTextColor={COLOR_TEXT_MUTED}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
      </View>

      <View style={sf.field}>
        <Text style={sf.label}>Location</Text>
        <TextInput
          style={sf.input}
          value={form.location}
          onChangeText={set('location')}
          placeholder="e.g. Legaspi City, Albay"
          placeholderTextColor={COLOR_TEXT_MUTED}
        />
      </View>

      <View style={sf.field}>
        <Text style={sf.label}>Contact Number</Text>
        <TextInput
          style={sf.input}
          value={form.contact}
          onChangeText={set('contact')}
          placeholder="+63 9XX XXX XXXX"
          placeholderTextColor={COLOR_TEXT_MUTED}
          keyboardType="phone-pad"
        />
      </View>

      <TouchableOpacity
        style={[sf.btn, (!canSubmit || loading) && sf.btnDisabled]}
        onPress={handleSubmit}
        disabled={!canSubmit || loading}
        activeOpacity={0.88}>
        {loading
          ? <ActivityIndicator color="#fff" />
          : (
            <View style={sf.btnRow}>
              <Ionicons name="send-outline" size={16} color="#fff" />
              <Text style={sf.btnText}>Submit Application</Text>
            </View>
          )}
      </TouchableOpacity>
    </View>
  );
}

const sf = StyleSheet.create({
  card: {
    backgroundColor: COLOR_SURFACE,
    borderRadius: RADIUS_CARD,
    padding: 24,
    gap: 16,
    ...SHADOW_MD,
  },
  title: { fontSize: 20, fontWeight: '800', color: COLOR_TEXT },
  subtitle: { fontSize: 14, color: COLOR_TEXT_MUTED, marginTop: -10 },
  field: { gap: 6 },
  label: {
    fontSize: 11, fontWeight: '700', color: COLOR_TEXT_MUTED,
    textTransform: 'uppercase', letterSpacing: 0.8,
  },
  input: {
    backgroundColor: COLOR_BG,
    borderRadius: RADIUS_ITEM,
    borderWidth: 1.5,
    borderColor: COLOR_BORDER,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: COLOR_TEXT,
  },
  textarea: { minHeight: 80, paddingTop: 12 },
  catButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  catSelected: { fontSize: 14, color: COLOR_TEXT },
  catPlaceholder: { fontSize: 14, color: COLOR_TEXT_MUTED },
  catMenu: {
    backgroundColor: COLOR_SURFACE,
    borderRadius: RADIUS_ITEM,
    borderWidth: 1.5,
    borderColor: COLOR_PRIMARY,
    overflow: 'hidden',
    marginTop: -8,
    ...SHADOW_MD,
  },
  catItem: { paddingHorizontal: 14, paddingVertical: 11, borderTopWidth: 1, borderTopColor: COLOR_BORDER },
  catItemActive: { backgroundColor: COLOR_BG },
  catItemText: { fontSize: 14, color: COLOR_TEXT },
  btn: {
    backgroundColor: '#7C3AED',
    borderRadius: RADIUS_ITEM,
    paddingVertical: 15,
    alignItems: 'center',
    ...SHADOW_MD,
  },
  btnDisabled: { opacity: 0.45 },
  btnRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  btnText: { fontSize: 15, fontWeight: '800', color: '#fff' },
});

// ── Main Business Screen ──────────────────────────────────────────────────────
export default function BusinessScreen() {
  const [ownerName, setOwnerName] = useState('Business Owner');
  const [applications, setApplications] = useState<BusinessApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const name = (await AsyncStorage.getItem('businessOwnerName')) ?? 'Business Owner';
    setOwnerName(name);
    const apps = await api.business.getMyApplications(name);
    setApplications(apps);
    setShowForm(apps.length === 0 || apps.every(a => a.status === 'rejected'));
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSignOut = async () => {
    await AsyncStorage.multiRemove(['userRole', 'userName', 'businessOwnerName']);
    router.replace('/login');
  };

  return (
    <LinearGradient
      colors={['#4C1D95', '#7C3AED', '#6D28D9']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0.6 }}
      style={styles.bg}>
      <SafeAreaView style={styles.safe}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerGreeting}>Business Portal</Text>
            <Text style={styles.headerName}>Welcome, {ownerName}</Text>
          </View>
          <TouchableOpacity onPress={handleSignOut} style={styles.signOutBtn} activeOpacity={0.8}>
            <Ionicons name="log-out-outline" size={18} color="rgba(255,255,255,0.8)" />
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>

            {loading ? (
              <ActivityIndicator color={COLOR_PRIMARY} size="large" style={{ marginTop: 60 }} />
            ) : (
              <>
                {/* Status banner */}
                {applications.length > 0 && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Your Applications</Text>
                    {applications.map(app => (
                      <ApplicationCard
                        key={app.id}
                        app={app}
                        onReapply={() => setShowForm(true)}
                      />
                    ))}
                  </View>
                )}

                {/* Form */}
                {showForm && (
                  <View style={styles.section}>
                    {applications.length > 0 && (
                      <Text style={styles.sectionTitle}>New Application</Text>
                    )}
                    <SubmitForm
                      ownerName={ownerName}
                      onSubmitted={() => { setShowForm(false); load(); }}
                    />
                  </View>
                )}

                {/* Info card if no form and no pending */}
                {!showForm && applications.length > 0 && applications.some(a => a.status === 'pending') && (
                  <View style={styles.infoCard}>
                    <Text style={styles.infoEmoji}>⏳</Text>
                    <Text style={styles.infoTitle}>Application Submitted</Text>
                    <Text style={styles.infoText}>
                      Our LGU admin team will review your application. Once approved, your business will appear on the tourist map.
                    </Text>
                    <TouchableOpacity
                      style={styles.refreshBtn}
                      onPress={load}
                      activeOpacity={0.85}>
                      <Ionicons name="refresh-outline" size={16} color={COLOR_PRIMARY} />
                      <Text style={styles.refreshText}>Check Status</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
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
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 20,
  },
  headerGreeting: { fontSize: 12, color: 'rgba(255,255,255,0.70)', fontWeight: '600', letterSpacing: 0.8, textTransform: 'uppercase' },
  headerName: { fontSize: 22, fontWeight: '800', color: '#fff', marginTop: 2 },
  signOutBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  scroll: { flex: 1, backgroundColor: COLOR_BG, borderTopLeftRadius: 28, borderTopRightRadius: 28 },
  scrollContent: { padding: 20, gap: 20, paddingBottom: 40 },
  section: { gap: 12 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: COLOR_TEXT_MUTED, textTransform: 'uppercase', letterSpacing: 0.8, paddingLeft: 4 },

  infoCard: {
    backgroundColor: COLOR_SURFACE,
    borderRadius: RADIUS_CARD,
    padding: 28,
    alignItems: 'center',
    gap: 10,
    ...SHADOW_MD,
  },
  infoEmoji: { fontSize: 40 },
  infoTitle: { fontSize: 18, fontWeight: '800', color: COLOR_TEXT },
  infoText: { fontSize: 14, color: COLOR_TEXT_MUTED, textAlign: 'center', lineHeight: 20 },
  refreshBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginTop: 6, borderWidth: 1.5, borderColor: COLOR_PRIMARY,
    borderRadius: RADIUS_ITEM, paddingHorizontal: 20, paddingVertical: 10,
  },
  refreshText: { fontSize: 14, fontWeight: '700', color: COLOR_PRIMARY },
});
