import AsyncStorage from '@react-native-async-storage/async-storage';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  ImageBackground,
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
  COLOR_BORDER,
  COLOR_PRIMARY,
  COLOR_SURFACE,
  COLOR_TEXT,
  COLOR_TEXT_MUTED,
  RADIUS_CARD,
  RADIUS_ITEM,
  RADIUS_PILL,
  SHADOW_LG,
} from '@/constants/design';
import { api } from '@/services/api';

const VIBES = ['Tech', 'Heritage', 'Food', 'Nature', 'Adventure', 'Local Crafts'];
const { height } = Dimensions.get('window');

export default function OnboardingScreen() {
  const [name, setName] = useState('');
  const [selectedVibes, setSelectedVibes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const toggleVibe = (vibe: string) => {
    setSelectedVibes(prev =>
      prev.includes(vibe) ? prev.filter(v => v !== vibe) : [...prev, vibe],
    );
  };

  const handleStart = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      await api.user.create({ name: name.trim(), vibes: selectedVibes });
    } catch {
      // backend optional for demo
    } finally {
      await AsyncStorage.multiSet([
        ['onboarded', 'true'],
        ['userName', name.trim()],
        ['userVibes', JSON.stringify(selectedVibes)],
      ]);
      router.replace('/home');
    }
  };

  return (
    <ImageBackground
      source={require('@/assets/images/splash-icon.png')}
      style={styles.background}
      resizeMode="cover">
      <LinearGradient
        colors={['rgba(17,94,89,0.82)', 'rgba(17,94,89,0.55)', 'rgba(15,23,42,0.75)']}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      />
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.kav}>
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>

            {/* Logo Badge */}
            <View style={styles.logoBadge}>
              <Text style={styles.logoText}>🗺️ LakbAI</Text>
            </View>

            {/* Glass Card */}
            <BlurView intensity={60} tint="light" style={styles.card}>
              <Text style={styles.heading}>Welcome to LakbAI</Text>
              <Text style={styles.subtext}>
                Tell us a bit about yourself to get started.
              </Text>

              {/* Name Input */}
              <View style={styles.section}>
                <Text style={styles.label}>What's your name?</Text>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter your name"
                  placeholderTextColor={COLOR_TEXT_MUTED}
                  autoCapitalize="words"
                  returnKeyType="done"
                />
              </View>

              {/* Vibes Selection */}
              <View style={styles.section}>
                <Text style={styles.label}>Select your vibes</Text>
                <View style={styles.vibesWrap}>
                  {VIBES.map(vibe => {
                    const active = selectedVibes.includes(vibe);
                    return (
                      <TouchableOpacity
                        key={vibe}
                        style={[styles.pill, active && styles.pillActive]}
                        onPress={() => toggleVibe(vibe)}
                        activeOpacity={0.75}>
                        <Text style={[styles.pillText, active && styles.pillTextActive]}>
                          {vibe}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* CTA */}
              <TouchableOpacity
                style={[styles.ctaButton, (!name.trim() || loading) && styles.ctaDisabled]}
                onPress={handleStart}
                disabled={!name.trim() || loading}
                activeOpacity={0.88}>
                {loading
                  ? <ActivityIndicator color={COLOR_SURFACE} />
                  : <Text style={styles.ctaText}>Start Exploring →</Text>
                }
              </TouchableOpacity>
            </BlurView>

          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: COLOR_PRIMARY,
  },
  safeArea: { flex: 1 },
  kav: { flex: 1 },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
    minHeight: height * 0.85,
  },
  logoBadge: {
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: RADIUS_PILL,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  card: {
    borderRadius: RADIUS_CARD,
    padding: 28,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.88)',
    ...SHADOW_LG,
  },
  heading: {
    fontSize: 30,
    fontWeight: '800',
    color: COLOR_PRIMARY,
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  subtext: {
    fontSize: 15,
    color: COLOR_TEXT_MUTED,
    marginBottom: 28,
    lineHeight: 22,
  },
  section: { marginBottom: 24 },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: COLOR_TEXT_MUTED,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
  },
  input: {
    backgroundColor: COLOR_SURFACE,
    borderRadius: RADIUS_ITEM,
    borderWidth: 1.5,
    borderColor: COLOR_BORDER,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: COLOR_TEXT,
  },
  vibesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  pill: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: RADIUS_PILL,
    backgroundColor: '#E2E8F0',
  },
  pillActive: { backgroundColor: COLOR_PRIMARY },
  pillText: { fontSize: 14, fontWeight: '600', color: COLOR_TEXT },
  pillTextActive: { color: '#FFFFFF' },
  ctaButton: {
    backgroundColor: COLOR_ACCENT,
    borderRadius: RADIUS_ITEM,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 4,
  },
  ctaDisabled: { opacity: 0.5 },
  ctaText: { fontSize: 17, fontWeight: '800', color: '#FFFFFF', letterSpacing: 0.3 },
});
