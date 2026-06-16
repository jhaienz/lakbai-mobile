import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
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
  SHADOW_MD,
  SHADOW_SM,
} from '@/constants/design';
import { api } from '@/services/api';
import type { Place } from '@/types';

const CATEGORIES = ['All', 'Food', 'Heritage', 'Nature', 'Adventure', 'Tech'];

export default function HomeScreen() {
  const [userName, setUserName] = useState('Explorer');
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    AsyncStorage.getItem('userName').then(n => { if (n) setUserName(n); });
    api.places.getFeatured()
      .then(setPlaces)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let result = places;
    if (activeCategory !== 'All') {
      result = result.filter(p => p.tags.includes(activeCategory));
    }
    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q),
      );
    }
    return result;
  }, [places, activeCategory, searchText]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: SCREEN_BOTTOM_PADDING }}
        showsVerticalScrollIndicator={false}>

        {/* ── Header ── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Dios Mabalos, {userName}! 👋</Text>
            <Text style={styles.subGreeting}>Ready to explore Albay today?</Text>
          </View>
          <TouchableOpacity
            style={styles.avatar}
            onPress={() => router.push('/profile' as never)}>
            <Ionicons name="person" size={22} color={COLOR_PRIMARY} />
          </TouchableOpacity>
        </View>

        {/* ── Search Bar ── */}
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color={COLOR_TEXT_MUTED} style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Where to?"
            placeholderTextColor={COLOR_TEXT_MUTED}
            value={searchText}
            onChangeText={setSearchText}
          />
          <TouchableOpacity>
            <Ionicons name="mic-outline" size={18} color={COLOR_TEXT_MUTED} />
          </TouchableOpacity>
        </View>

        {/* ── Hero AI Planner Card ── */}
        <LinearGradient
          colors={[COLOR_PRIMARY, '#0D4A46']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}>
          <View style={styles.heroBadge}>
            <Ionicons name="sparkles" size={12} color={COLOR_ACCENT} />
            <Text style={styles.heroBadgeText}>AI Planner</Text>
          </View>
          <Text style={styles.heroTitle}>Design your perfect{'\n'}Albay day.</Text>
          <TouchableOpacity
            style={styles.heroBtn}
            activeOpacity={0.88}
            onPress={() => router.push('/chat' as never)}>
            <Text style={styles.heroBtnText}>✨ Generate Itinerary with AI</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* ── Category Pills ── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesRow}
          style={styles.categoriesScroll}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat}
              style={[styles.catPill, activeCategory === cat && styles.catPillActive]}
              onPress={() => setActiveCategory(cat)}
              activeOpacity={0.75}>
              <Text style={[styles.catText, activeCategory === cat && styles.catTextActive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ── Recommendations ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Hidden Gems{' '}
            <Text style={styles.sectionBadge}>(Low Crowd)</Text>
          </Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator color={COLOR_PRIMARY} style={{ marginTop: 24 }} />
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={item => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.placesList}
            renderItem={({ item }) => <PlaceCard place={item} />}
          />
        )}

        {/* ── Quick Access Tiles ── */}
        <Text style={[styles.sectionTitle, { marginHorizontal: 20, marginTop: 24, marginBottom: 14 }]}>
          Quick Access
        </Text>
        <View style={styles.quickGrid}>
          <QuickTile icon="map" label="Smart Map" color={COLOR_SECONDARY} onPress={() => router.push('/map' as never)} />
          <QuickTile icon="trophy" label="Leaderboard" color={COLOR_ACCENT} onPress={() => router.push('/impact' as never)} />
          <QuickTile icon="chatbubble-ellipses" label="ALBAY GO" color={COLOR_PRIMARY} onPress={() => router.push('/chat' as never)} />
          <QuickTile icon="ribbon" label="Badges" color="#8B5CF6" onPress={() => router.push('/impact' as never)} />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

function PlaceCard({ place }: { place: Place }) {
  return (
    <TouchableOpacity style={styles.placeCard} activeOpacity={0.9}>
      <Image
        source={{ uri: place.image }}
        style={styles.placeImage}
        contentFit="cover"
      />
      {place.isVerified && (
        <View style={styles.verifiedPill}>
          <Ionicons name="checkmark-circle" size={11} color="#fff" />
          <Text style={styles.verifiedText}>Verified Local</Text>
        </View>
      )}
      {!place.isVerified && (
        <View style={[styles.verifiedPill, { backgroundColor: COLOR_SECONDARY }]}>
          <Ionicons name="leaf" size={11} color="#fff" />
          <Text style={styles.verifiedText}>Eco-Friendly</Text>
        </View>
      )}
      <View style={styles.placeInfo}>
        <Text style={styles.placeName} numberOfLines={1}>{place.name}</Text>
        <View style={styles.placeRatingRow}>
          <Ionicons name="star" size={12} color={COLOR_ACCENT} />
          <Text style={styles.placeRating}>{place.rating.toFixed(1)}</Text>
          <Text style={styles.placeCategory}>  {place.category}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function QuickTile({ icon, label, color, onPress }: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.quickTile} onPress={onPress} activeOpacity={0.85}>
      <View style={[styles.quickIcon, { backgroundColor: color + '18' }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={styles.quickLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLOR_BG },
  scroll: { flex: 1 },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  greeting: { fontSize: 22, fontWeight: '800', color: COLOR_TEXT, letterSpacing: -0.3 },
  subGreeting: { fontSize: 14, color: COLOR_TEXT_MUTED, marginTop: 2 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(17,94,89,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: COLOR_PRIMARY + '30',
  },

  // Search
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLOR_SURFACE,
    borderRadius: RADIUS_ITEM,
    marginHorizontal: 20,
    marginBottom: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: COLOR_BORDER,
    ...SHADOW_SM,
  },
  searchInput: { flex: 1, fontSize: 15, color: COLOR_TEXT },

  // Hero Card
  heroCard: {
    marginHorizontal: 20,
    borderRadius: RADIUS_CARD,
    padding: 24,
    marginBottom: 20,
    ...SHADOW_MD,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(245,158,11,0.18)',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS_PILL,
    marginBottom: 12,
  },
  heroBadgeText: { fontSize: 11, fontWeight: '700', color: COLOR_ACCENT },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 34,
    marginBottom: 20,
    letterSpacing: -0.5,
  },
  heroBtn: {
    backgroundColor: COLOR_ACCENT,
    borderRadius: RADIUS_ITEM,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  heroBtnText: { fontSize: 15, fontWeight: '800', color: '#FFFFFF' },

  // Categories
  categoriesScroll: { marginBottom: 20 },
  categoriesRow: { paddingHorizontal: 20, gap: 8 },
  catPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: RADIUS_PILL,
    backgroundColor: COLOR_SURFACE,
    borderWidth: 1,
    borderColor: COLOR_BORDER,
  },
  catPillActive: { backgroundColor: COLOR_PRIMARY, borderColor: COLOR_PRIMARY },
  catText: { fontSize: 13, fontWeight: '600', color: COLOR_TEXT_MUTED },
  catTextActive: { color: '#FFFFFF' },

  // Section Header
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: COLOR_TEXT },
  sectionBadge: { fontSize: 13, fontWeight: '500', color: COLOR_TEXT_MUTED },
  seeAll: { fontSize: 13, fontWeight: '600', color: COLOR_PRIMARY },

  // Place Cards
  placesList: { paddingLeft: 20, paddingRight: 8, gap: 12 },
  placeCard: {
    width: 180,
    backgroundColor: COLOR_SURFACE,
    borderRadius: RADIUS_CARD,
    overflow: 'hidden',
    ...SHADOW_MD,
  },
  placeImage: { width: '100%', height: 130 },
  verifiedPill: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLOR_PRIMARY,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS_PILL,
  },
  verifiedText: { fontSize: 10, fontWeight: '700', color: '#FFFFFF' },
  placeInfo: { padding: 12 },
  placeName: { fontSize: 14, fontWeight: '700', color: COLOR_TEXT, marginBottom: 4 },
  placeRatingRow: { flexDirection: 'row', alignItems: 'center' },
  placeRating: { fontSize: 12, fontWeight: '600', color: COLOR_TEXT, marginLeft: 3 },
  placeCategory: { fontSize: 11, color: COLOR_TEXT_MUTED },

  // Quick Tiles
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
  },
  quickTile: {
    width: '47%',
    backgroundColor: COLOR_SURFACE,
    borderRadius: RADIUS_ITEM,
    padding: 18,
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: COLOR_BORDER,
    ...SHADOW_SM,
  },
  quickIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  quickLabel: { fontSize: 13, fontWeight: '700', color: COLOR_TEXT },
});
