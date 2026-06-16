import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import type { DailyTask, Place } from '@/types';

const CATEGORIES = ['All', 'Food', 'Heritage', 'Nature', 'Adventure', 'Tech'];

// ── Daily Challenges card ─────────────────────────────────────────────────────
function DailyChallengesCard({ tasks }: { tasks: DailyTask[] }) {
  const done = tasks.filter(t => t.completed).length;
  const total = tasks.length;
  const progress = total > 0 ? done / total : 0;
  const totalPts = tasks.filter(t => t.completed).reduce((s, t) => s + t.points, 0);

  return (
    <View style={dc.card}>
      <View style={dc.header}>
        <View>
          <Text style={dc.title}>Daily Challenges 🎯</Text>
          <Text style={dc.subtitle}>Resets at midnight · Earn points</Text>
        </View>
        <View style={dc.scorePill}>
          <Text style={dc.scoreText}>{done}/{total}</Text>
        </View>
      </View>
      <View style={dc.progressBg}>
        <View style={[dc.progressFill, { width: `${progress * 100}%` as any }]} />
      </View>
      {totalPts > 0 && (
        <Text style={dc.earnedText}>+{totalPts} pts earned today</Text>
      )}
      <View style={dc.taskList}>
        {tasks.map(task => (
          <View key={task.id} style={[dc.taskRow, task.completed && dc.taskRowDone]}>
            <Text style={dc.taskIcon}>{task.icon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={[dc.taskTitle, task.completed && dc.taskTitleDone]}>{task.title}</Text>
              <Text style={dc.taskDesc}>{task.description}</Text>
            </View>
            <View style={[dc.ptsPill, task.completed && dc.ptsPillDone]}>
              {task.completed
                ? <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                : <Text style={dc.ptsText}>+{task.points}</Text>}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const dc = StyleSheet.create({
  card: {
    backgroundColor: COLOR_SURFACE, borderRadius: RADIUS_CARD,
    marginHorizontal: 20, padding: 18, gap: 12,
    ...SHADOW_MD, borderWidth: 1, borderColor: COLOR_BORDER,
  },
  header: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  title: { fontSize: 16, fontWeight: '800', color: COLOR_TEXT },
  subtitle: { fontSize: 11, color: COLOR_TEXT_MUTED, marginTop: 2 },
  scorePill: {
    backgroundColor: COLOR_PRIMARY + '18', borderRadius: RADIUS_PILL,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  scoreText: { fontSize: 13, fontWeight: '800', color: COLOR_PRIMARY },
  progressBg: {
    height: 6, backgroundColor: COLOR_BG, borderRadius: 3, overflow: 'hidden',
    borderWidth: 1, borderColor: COLOR_BORDER,
  },
  progressFill: { height: '100%', backgroundColor: COLOR_PRIMARY, borderRadius: 3 },
  earnedText: { fontSize: 11, color: '#10B981', fontWeight: '700', marginTop: -6 },
  taskList: { gap: 8 },
  taskRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: COLOR_BG, borderRadius: RADIUS_ITEM,
    padding: 10, borderWidth: 1, borderColor: COLOR_BORDER,
  },
  taskRowDone: { borderColor: '#D1FAE5', backgroundColor: '#F0FDF4' },
  taskIcon: { fontSize: 18, flexShrink: 0 },
  taskTitle: { fontSize: 13, fontWeight: '700', color: COLOR_TEXT },
  taskTitleDone: { color: '#6B7280', textDecorationLine: 'line-through' },
  taskDesc: { fontSize: 11, color: COLOR_TEXT_MUTED, marginTop: 1 },
  ptsPill: {
    backgroundColor: COLOR_ACCENT + '20', borderRadius: RADIUS_PILL,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  ptsPillDone: { backgroundColor: '#D1FAE5' },
  ptsText: { fontSize: 11, fontWeight: '700', color: COLOR_ACCENT },
});

// ── Search result row ─────────────────────────────────────────────────────────
function SearchResultRow({ place }: { place: Place }) {
  return (
    <TouchableOpacity
      style={sr.row}
      activeOpacity={0.8}
      onPress={() => router.push(`/place/${place.id}` as never)}>
      <Image source={{ uri: place.image }} style={sr.thumb} contentFit="cover" />
      <View style={sr.info}>
        <Text style={sr.name} numberOfLines={1}>{place.name}</Text>
        <Text style={sr.meta} numberOfLines={1}>
          {place.category} · {place.location}
        </Text>
        <View style={sr.ratingRow}>
          <Ionicons name="star" size={11} color={COLOR_ACCENT} />
          <Text style={sr.rating}>{place.rating.toFixed(1)}</Text>
          <Text style={sr.price}>  {place.price}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={16} color={COLOR_TEXT_MUTED} />
    </TouchableOpacity>
  );
}

const sr = StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: COLOR_BORDER,
    backgroundColor: COLOR_SURFACE,
  },
  thumb: {
    width: 56, height: 56, borderRadius: RADIUS_ITEM, flexShrink: 0,
  },
  info: { flex: 1, gap: 3 },
  name: { fontSize: 14, fontWeight: '700', color: COLOR_TEXT },
  meta: { fontSize: 12, color: COLOR_TEXT_MUTED },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  rating: { fontSize: 12, fontWeight: '600', color: COLOR_TEXT, marginLeft: 3 },
  price: { fontSize: 11, color: COLOR_TEXT_MUTED },
});

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const [userName, setUserName] = useState('Explorer');
  const [places, setPlaces] = useState<Place[]>([]);
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchText, setSearchText] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const isSearchActive = searchFocused || searchText.trim().length > 0;

  useEffect(() => {
    AsyncStorage.getItem('userName').then(n => { if (n) setUserName(n); });
    api.places.getAll()
      .then(setPlaces)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useFocusEffect(useCallback(() => {
    api.tasks.getToday().then(setTasks).catch(() => {});
  }, []));

  const searchResults = useMemo(() => {
    if (!searchText.trim()) return places;
    const q = searchText.toLowerCase();
    return places.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.location?.toLowerCase().includes(q) ||
      p.tags.some(t => t.toLowerCase().includes(q)),
    );
  }, [places, searchText]);

  const filteredPlaces = useMemo(() => {
    if (activeCategory === 'All') return places.filter(p => p.isVerified);
    return places.filter(p => p.isVerified && p.tags.includes(activeCategory));
  }, [places, activeCategory]);

  const cancelSearch = () => {
    setSearchText('');
    setSearchFocused(false);
    inputRef.current?.blur();
  };

  const handleCategorySelect = (cat: string) => {
    setActiveCategory(cat);
    if (cat !== 'All') {
      api.tasks.complete('explore_category').then(() =>
        api.tasks.getToday().then(setTasks),
      ).catch(() => {});
    }
  };

  const handleGenerateItinerary = () => {
    api.tasks.complete('generate_itinerary').then(() =>
      api.tasks.getToday().then(setTasks),
    ).catch(() => {});
    router.push('/chat' as never);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>

      {/* ── Sticky header + search (always visible) ── */}
      <View style={styles.topBar}>
        {!isSearchActive && (
          <View style={styles.headerRow}>
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
        )}

        <View style={[styles.searchBar, isSearchActive && styles.searchBarActive]}>
          <Ionicons name="search-outline" size={18} color={isSearchActive ? COLOR_PRIMARY : COLOR_TEXT_MUTED} />
          <TextInput
            ref={inputRef}
            style={styles.searchInput}
            placeholder="Search places, categories..."
            placeholderTextColor={COLOR_TEXT_MUTED}
            value={searchText}
            onChangeText={setSearchText}
            onFocus={() => setSearchFocused(true)}
            returnKeyType="search"
          />
          {isSearchActive && (
            <TouchableOpacity onPress={cancelSearch} style={styles.cancelBtn}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── Search results panel ── */}
      {isSearchActive ? (
        <View style={styles.searchPanel}>
          {searchText.trim().length === 0 ? (
            // Focused but no text yet — show suggestions
            <View style={styles.searchHint}>
              <Ionicons name="search-outline" size={40} color={COLOR_BORDER} />
              <Text style={styles.searchHintTitle}>Search Albay</Text>
              <Text style={styles.searchHintSub}>
                Try "Cagsawa", "Food", "Heritage", or a place name
              </Text>
              <View style={styles.suggestRow}>
                {['Mayon', 'Food Tour', 'Heritage', 'Beach', 'Nature'].map(s => (
                  <TouchableOpacity
                    key={s}
                    style={styles.suggestPill}
                    onPress={() => setSearchText(s)}>
                    <Text style={styles.suggestText}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : searchResults.length === 0 ? (
            <View style={styles.searchHint}>
              <Ionicons name="alert-circle-outline" size={40} color={COLOR_BORDER} />
              <Text style={styles.searchHintTitle}>No results for "{searchText}"</Text>
              <Text style={styles.searchHintSub}>Try a different keyword or category</Text>
            </View>
          ) : (
            <FlatList
              data={searchResults}
              keyExtractor={item => item.id}
              renderItem={({ item }) => <SearchResultRow place={item} />}
              ListHeaderComponent={
                <View style={styles.resultsHeader}>
                  <Text style={styles.resultsCount}>
                    {searchResults.length} place{searchResults.length !== 1 ? 's' : ''} found
                  </Text>
                </View>
              }
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: SCREEN_BOTTOM_PADDING }}
              keyboardShouldPersistTaps="handled"
            />
          )}
        </View>
      ) : (

        // ── Normal home content ──
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={{ paddingBottom: SCREEN_BOTTOM_PADDING }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">

          {/* Hero AI Planner Card */}
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
              onPress={handleGenerateItinerary}>
              <Text style={styles.heroBtnText}>✨ Generate Itinerary with AI</Text>
            </TouchableOpacity>
          </LinearGradient>

          {/* Daily Challenges */}
          {tasks.length > 0 && (
            <>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Daily Challenges</Text>
                <Text style={styles.seeAll}>Resets midnight</Text>
              </View>
              <DailyChallengesCard tasks={tasks} />
            </>
          )}

          {/* Category Pills */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesRow}
            style={styles.categoriesScroll}>
            {CATEGORIES.map(cat => (
              <TouchableOpacity
                key={cat}
                style={[styles.catPill, activeCategory === cat && styles.catPillActive]}
                onPress={() => handleCategorySelect(cat)}
                activeOpacity={0.75}>
                <Text style={[styles.catText, activeCategory === cat && styles.catTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Recommendations */}
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
              data={filteredPlaces}
              keyExtractor={item => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.placesList}
              renderItem={({ item }) => <PlaceCard place={item} />}
            />
          )}

          {/* Quick Access */}
          <Text style={[styles.sectionTitle, { marginHorizontal: 20, marginTop: 24, marginBottom: 14 }]}>
            Quick Access
          </Text>
          <View style={styles.quickGrid}>
            <QuickTile icon="map" label="Smart Map" color={COLOR_SECONDARY} onPress={() => router.push('/map' as never)} />
            <QuickTile icon="trophy" label="Leaderboard" color={COLOR_ACCENT} onPress={() => router.push('/impact' as never)} />
            <QuickTile icon="chatbubble-ellipses" label="LakbAI" color={COLOR_PRIMARY} onPress={() => router.push('/chat' as never)} />
            <QuickTile icon="ribbon" label="Badges" color="#8B5CF6" onPress={() => router.push('/impact' as never)} />
          </View>

        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function PlaceCard({ place }: { place: Place }) {
  return (
    <TouchableOpacity
      style={styles.placeCard}
      activeOpacity={0.9}
      onPress={() => router.push(`/place/${place.id}` as never)}>
      <Image source={{ uri: place.image }} style={styles.placeImage} contentFit="cover" />
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

  topBar: {
    backgroundColor: COLOR_SURFACE,
    borderBottomWidth: 1, borderBottomColor: COLOR_BORDER,
    paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12,
    gap: 10,
  },
  headerRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
  },
  greeting: { fontSize: 22, fontWeight: '800', color: COLOR_TEXT, letterSpacing: -0.3 },
  subGreeting: { fontSize: 14, color: COLOR_TEXT_MUTED, marginTop: 2 },
  avatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(17,94,89,0.10)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: COLOR_PRIMARY + '30',
  },

  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: COLOR_BG, borderRadius: RADIUS_ITEM,
    paddingHorizontal: 14, paddingVertical: 11,
    borderWidth: 1, borderColor: COLOR_BORDER, ...SHADOW_SM,
  },
  searchBarActive: { borderColor: COLOR_PRIMARY, borderWidth: 1.5 },
  searchInput: { flex: 1, fontSize: 15, color: COLOR_TEXT },
  cancelBtn: { paddingHorizontal: 4 },
  cancelText: { fontSize: 14, fontWeight: '600', color: COLOR_PRIMARY },

  // ── Search panel ──
  searchPanel: { flex: 1, backgroundColor: COLOR_BG },
  searchHint: {
    flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 32,
  },
  searchHintTitle: { fontSize: 18, fontWeight: '800', color: COLOR_TEXT },
  searchHintSub: { fontSize: 14, color: COLOR_TEXT_MUTED, textAlign: 'center' },
  suggestRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: 8 },
  suggestPill: {
    backgroundColor: COLOR_PRIMARY + '14', borderRadius: RADIUS_PILL,
    paddingHorizontal: 14, paddingVertical: 8,
    borderWidth: 1, borderColor: COLOR_PRIMARY + '30',
  },
  suggestText: { fontSize: 13, fontWeight: '600', color: COLOR_PRIMARY },
  resultsHeader: {
    paddingHorizontal: 20, paddingVertical: 10,
    backgroundColor: COLOR_BG,
    borderBottomWidth: 1, borderBottomColor: COLOR_BORDER,
  },
  resultsCount: { fontSize: 13, fontWeight: '600', color: COLOR_TEXT_MUTED },

  heroCard: {
    marginHorizontal: 20, borderRadius: RADIUS_CARD,
    padding: 24, marginBottom: 20, marginTop: 20, ...SHADOW_MD,
  },
  heroBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(245,158,11,0.18)', alignSelf: 'flex-start',
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: RADIUS_PILL, marginBottom: 12,
  },
  heroBadgeText: { fontSize: 11, fontWeight: '700', color: COLOR_ACCENT },
  heroTitle: {
    fontSize: 28, fontWeight: '800', color: '#FFFFFF',
    lineHeight: 34, marginBottom: 20, letterSpacing: -0.5,
  },
  heroBtn: {
    backgroundColor: COLOR_ACCENT, borderRadius: RADIUS_ITEM,
    paddingVertical: 14, paddingHorizontal: 20, alignItems: 'center',
  },
  heroBtnText: { fontSize: 15, fontWeight: '800', color: '#FFFFFF' },

  categoriesScroll: { marginBottom: 20, marginTop: 20 },
  categoriesRow: { paddingHorizontal: 20, gap: 8 },
  catPill: {
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: RADIUS_PILL, backgroundColor: COLOR_SURFACE,
    borderWidth: 1, borderColor: COLOR_BORDER,
  },
  catPillActive: { backgroundColor: COLOR_PRIMARY, borderColor: COLOR_PRIMARY },
  catText: { fontSize: 13, fontWeight: '600', color: COLOR_TEXT_MUTED },
  catTextActive: { color: '#FFFFFF' },

  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, marginBottom: 14,
  },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: COLOR_TEXT },
  sectionBadge: { fontSize: 13, fontWeight: '500', color: COLOR_TEXT_MUTED },
  seeAll: { fontSize: 13, fontWeight: '600', color: COLOR_PRIMARY },

  placesList: { paddingLeft: 20, paddingRight: 8, gap: 12 },
  placeCard: {
    width: 180, backgroundColor: COLOR_SURFACE,
    borderRadius: RADIUS_CARD, overflow: 'hidden', ...SHADOW_MD,
  },
  placeImage: { width: '100%', height: 130 },
  verifiedPill: {
    position: 'absolute', top: 10, left: 10,
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: COLOR_PRIMARY, paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: RADIUS_PILL,
  },
  verifiedText: { fontSize: 10, fontWeight: '700', color: '#FFFFFF' },
  placeInfo: { padding: 12 },
  placeName: { fontSize: 14, fontWeight: '700', color: COLOR_TEXT, marginBottom: 4 },
  placeRatingRow: { flexDirection: 'row', alignItems: 'center' },
  placeRating: { fontSize: 12, fontWeight: '600', color: COLOR_TEXT, marginLeft: 3 },
  placeCategory: { fontSize: 11, color: COLOR_TEXT_MUTED },

  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 20, gap: 12 },
  quickTile: {
    width: '47%', backgroundColor: COLOR_SURFACE,
    borderRadius: RADIUS_ITEM, padding: 18, alignItems: 'flex-start',
    borderWidth: 1, borderColor: COLOR_BORDER, ...SHADOW_SM,
  },
  quickIcon: {
    width: 44, height: 44, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center', marginBottom: 10,
  },
  quickLabel: { fontSize: 13, fontWeight: '700', color: COLOR_TEXT },
});
