import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
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
  SHADOW_LG,
  SHADOW_MD,
} from '@/constants/design';
import { api, seedIfNeeded } from '@/services/api';
import type { UserRole } from '@/types';

// ── Role definitions ──────────────────────────────────────────────────────────
const ROLES: Record<UserRole, { label: string; icon: string; desc: string; color: string }> = {
  tourist: {
    label: 'Tourist',
    icon: '🗺️',
    desc: 'Explore Albay & discover local gems',
    color: COLOR_PRIMARY,
  },
  business: {
    label: 'Business Owner',
    icon: '🏪',
    desc: 'Register your SME & get verified',
    color: '#7C3AED',
  },
  lgu: {
    label: 'LGU Admin',
    icon: '🏛️',
    desc: 'Review & approve business listings',
    color: '#0369A1',
  },
};

const LGU_PIN = '2024';

// ── Dropdown component ────────────────────────────────────────────────────────
function RoleDropdown({
  value,
  onChange,
}: {
  value: UserRole | null;
  onChange: (r: UserRole) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = value ? ROLES[value] : null;

  return (
    <View style={dd.wrapper}>
      <TouchableOpacity
        style={[dd.button, open && dd.buttonOpen]}
        onPress={() => setOpen(v => !v)}
        activeOpacity={0.85}>
        {selected ? (
          <View style={dd.selectedRow}>
            <Text style={dd.selectedIcon}>{selected.icon}</Text>
            <Text style={dd.selectedLabel}>{selected.label}</Text>
          </View>
        ) : (
          <Text style={dd.placeholder}>Select your role...</Text>
        )}
        <Ionicons
          name={open ? 'chevron-up' : 'chevron-down'}
          size={16}
          color={COLOR_TEXT_MUTED}
        />
      </TouchableOpacity>

      {open && (
        <View style={dd.menu}>
          {(Object.entries(ROLES) as [UserRole, typeof ROLES[UserRole]][]).map(([key, role]) => (
            <TouchableOpacity
              key={key}
              style={[dd.item, value === key && dd.itemActive]}
              onPress={() => { onChange(key); setOpen(false); }}
              activeOpacity={0.8}>
              <View style={[dd.itemIconWrap, { backgroundColor: role.color + '18' }]}>
                <Text style={dd.itemIcon}>{role.icon}</Text>
              </View>
              <View style={dd.itemText}>
                <Text style={[dd.itemLabel, value === key && { color: role.color, fontWeight: '800' }]}>
                  {role.label}
                </Text>
                <Text style={dd.itemDesc}>{role.desc}</Text>
              </View>
              {value === key && (
                <Ionicons name="checkmark-circle" size={18} color={role.color} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

// ── Main Login Screen ─────────────────────────────────────────────────────────
export default function LoginScreen() {
  const [role, setRole] = useState<UserRole | null>(null);
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState(false);
  const [loading, setLoading] = useState(false);

  const canContinue = !!role && !!name.trim() && (role !== 'lgu' || pin.length === 4);

  const handleContinue = async () => {
    if (!role || !name.trim()) return;

    if (role === 'lgu' && pin !== LGU_PIN) {
      setPinError(true);
      return;
    }
    setPinError(false);
    setLoading(true);

    try {
      await seedIfNeeded();
      await AsyncStorage.multiSet([
        ['userRole', role],
        ['userName', name.trim()],
      ]);

      if (role === 'tourist') {
        await api.user.create({ name: name.trim(), vibes: [] });
        await AsyncStorage.setItem('onboarded', 'true');
        router.replace('/home');
      } else if (role === 'business') {
        await AsyncStorage.setItem('businessOwnerName', name.trim());
        router.replace('/business' as never);
      } else {
        await AsyncStorage.setItem('lguAdminName', name.trim());
        router.replace('/lgu' as never);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={[COLOR_PRIMARY, '#0D3B38', '#0F172A']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.bg}>
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.kav}>
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>

            {/* Branding */}
            <View style={styles.brand}>
              <View style={styles.logoRing}>
                <Text style={styles.logoEmoji}>🗺️</Text>
              </View>
              <Text style={styles.appName}>LakbAI</Text>
              <Text style={styles.tagline}>Smart Tourism · Albay Province</Text>
            </View>

            {/* Card */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Welcome Back</Text>
              <Text style={styles.cardSubtitle}>Choose your role to continue</Text>

              {/* Name input */}
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Your Name</Text>
                <View style={styles.inputWrap}>
                  <Ionicons name="person-outline" size={16} color={COLOR_TEXT_MUTED} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                    placeholder="Enter your full name"
                    placeholderTextColor={COLOR_TEXT_MUTED}
                    autoCapitalize="words"
                    returnKeyType="next"
                  />
                </View>
              </View>

              {/* Role dropdown */}
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>I am a</Text>
                <RoleDropdown value={role} onChange={r => { setRole(r); setPinError(false); }} />
              </View>

              {/* Selected role highlight */}
              {role && (
                <View style={[styles.roleHighlight, { borderColor: ROLES[role].color + '40', backgroundColor: ROLES[role].color + '0C' }]}>
                  <Text style={styles.roleHighlightIcon}>{ROLES[role].icon}</Text>
                  <Text style={[styles.roleHighlightText, { color: ROLES[role].color }]}>
                    {ROLES[role].desc}
                  </Text>
                </View>
              )}

              {/* PIN for LGU */}
              {role === 'lgu' && (
                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>Admin PIN</Text>
                  <View style={[styles.inputWrap, pinError && styles.inputWrapError]}>
                    <Ionicons name="lock-closed-outline" size={16} color={pinError ? '#EF4444' : COLOR_TEXT_MUTED} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      value={pin}
                      onChangeText={t => { setPin(t); setPinError(false); }}
                      placeholder="Enter 4-digit PIN"
                      placeholderTextColor={COLOR_TEXT_MUTED}
                      keyboardType="number-pad"
                      secureTextEntry
                      maxLength={4}
                    />
                  </View>
                  {pinError && (
                    <Text style={styles.pinError}>Incorrect PIN. Please try again.</Text>
                  )}
                  <Text style={styles.pinHint}>Demo PIN: 2024</Text>
                </View>
              )}

              {/* CTA */}
              <TouchableOpacity
                style={[
                  styles.ctaBtn,
                  role && { backgroundColor: ROLES[role].color },
                  (!canContinue || loading) && styles.ctaDisabled,
                ]}
                onPress={handleContinue}
                disabled={!canContinue || loading}
                activeOpacity={0.88}>
                {loading
                  ? <ActivityIndicator color="#fff" />
                  : (
                    <View style={styles.ctaInner}>
                      <Text style={styles.ctaText}>Continue</Text>
                      <Ionicons name="arrow-forward" size={18} color="#fff" />
                    </View>
                  )}
              </TouchableOpacity>
            </View>

            {/* Footer note */}
            <Text style={styles.footer}>
              Albay Province LGU-Partnered Platform
            </Text>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

// ── Dropdown styles ───────────────────────────────────────────────────────────
const dd = StyleSheet.create({
  wrapper: { position: 'relative', zIndex: 10 },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLOR_BG,
    borderRadius: RADIUS_ITEM,
    borderWidth: 1.5,
    borderColor: COLOR_BORDER,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  buttonOpen: { borderColor: COLOR_PRIMARY, borderBottomLeftRadius: 0, borderBottomRightRadius: 0 },
  selectedRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  selectedIcon: { fontSize: 18 },
  selectedLabel: { fontSize: 15, fontWeight: '700', color: COLOR_TEXT },
  placeholder: { fontSize: 15, color: COLOR_TEXT_MUTED },
  menu: {
    backgroundColor: COLOR_SURFACE,
    borderWidth: 1.5,
    borderTopWidth: 0,
    borderColor: COLOR_PRIMARY,
    borderBottomLeftRadius: RADIUS_ITEM,
    borderBottomRightRadius: RADIUS_ITEM,
    overflow: 'hidden',
    ...SHADOW_MD,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: COLOR_BORDER,
  },
  itemActive: { backgroundColor: COLOR_BG },
  itemIconWrap: {
    width: 40, height: 40, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  itemIcon: { fontSize: 20 },
  itemText: { flex: 1 },
  itemLabel: { fontSize: 14, fontWeight: '700', color: COLOR_TEXT },
  itemDesc: { fontSize: 12, color: COLOR_TEXT_MUTED, marginTop: 1 },
});

// ── Screen styles ─────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  bg: { flex: 1 },
  safe: { flex: 1 },
  kav: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24, gap: 24 },

  brand: { alignItems: 'center', gap: 8 },
  logoRing: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.25)',
  },
  logoEmoji: { fontSize: 36 },
  appName: { fontSize: 32, fontWeight: '900', color: '#FFFFFF', letterSpacing: -0.5 },
  tagline: { fontSize: 13, color: 'rgba(255,255,255,0.70)', letterSpacing: 0.5 },

  card: {
    backgroundColor: COLOR_SURFACE,
    borderRadius: RADIUS_CARD,
    padding: 24,
    gap: 18,
    ...SHADOW_LG,
  },
  cardTitle: { fontSize: 22, fontWeight: '800', color: COLOR_TEXT },
  cardSubtitle: { fontSize: 14, color: COLOR_TEXT_MUTED, marginTop: -12 },

  field: { gap: 8 },
  fieldLabel: {
    fontSize: 11, fontWeight: '700', color: COLOR_TEXT_MUTED,
    textTransform: 'uppercase', letterSpacing: 0.8,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLOR_BG,
    borderRadius: RADIUS_ITEM,
    borderWidth: 1.5,
    borderColor: COLOR_BORDER,
    paddingHorizontal: 12,
    gap: 8,
  },
  inputWrapError: { borderColor: '#EF4444' },
  inputIcon: { flexShrink: 0 },
  input: { flex: 1, fontSize: 15, color: COLOR_TEXT, paddingVertical: 13 },

  roleHighlight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: RADIUS_ITEM,
    borderWidth: 1,
    marginTop: -8,
  },
  roleHighlightIcon: { fontSize: 20 },
  roleHighlightText: { fontSize: 13, fontWeight: '600', flex: 1, lineHeight: 18 },

  pinError: { fontSize: 12, color: '#EF4444', marginTop: -4 },
  pinHint: { fontSize: 11, color: COLOR_TEXT_MUTED },

  ctaBtn: {
    backgroundColor: COLOR_PRIMARY,
    borderRadius: RADIUS_ITEM,
    paddingVertical: 16,
    alignItems: 'center',
    ...SHADOW_MD,
  },
  ctaDisabled: { opacity: 0.45 },
  ctaInner: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  ctaText: { fontSize: 16, fontWeight: '800', color: '#FFFFFF' },

  footer: { textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.50)' },
});
