import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
import type { Place, Review } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ── Star Rating Display ───────────────────────────────────────────────────────
function Stars({ rating, size = 14, color = COLOR_ACCENT }: { rating: number; size?: number; color?: string }) {
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <Ionicons
          key={i}
          name={i <= Math.round(rating) ? 'star' : 'star-outline'}
          size={size}
          color={i <= Math.round(rating) ? color : COLOR_BORDER}
        />
      ))}
    </View>
  );
}

// ── Star Selector (interactive) ───────────────────────────────────────────────
function StarSelector({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <View style={{ flexDirection: 'row', gap: 6 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <TouchableOpacity key={i} onPress={() => onChange(i)} activeOpacity={0.7}>
          <Ionicons
            name={i <= value ? 'star' : 'star-outline'}
            size={32}
            color={i <= value ? COLOR_ACCENT : COLOR_BORDER}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ── Review Card ───────────────────────────────────────────────────────────────
function ReviewCard({ review }: { review: Review }) {
  const date = new Date(review.timestamp);
  const label = `${date.toLocaleString('default', { month: 'short' })} ${date.getDate()}, ${date.getFullYear()}`;
  return (
    <View style={rv.card}>
      <View style={rv.header}>
        <View style={rv.avatar}>
          <Text style={rv.avatarText}>{review.userName[0].toUpperCase()}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={rv.name}>{review.userName}</Text>
          <Text style={rv.date}>{label}</Text>
        </View>
        <Stars rating={review.rating} size={13} />
      </View>
      <Text style={rv.comment}>{review.comment}</Text>
    </View>
  );
}

const rv = StyleSheet.create({
  card: {
    backgroundColor: COLOR_SURFACE,
    borderRadius: RADIUS_ITEM,
    padding: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: COLOR_BORDER,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: COLOR_PRIMARY + '22',
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  avatarText: { fontSize: 15, fontWeight: '800', color: COLOR_PRIMARY },
  name: { fontSize: 14, fontWeight: '700', color: COLOR_TEXT },
  date: { fontSize: 11, color: COLOR_TEXT_MUTED, marginTop: 1 },
  comment: { fontSize: 14, color: COLOR_TEXT, lineHeight: 20 },
});

// ── Info Chip ─────────────────────────────────────────────────────────────────
function InfoChip({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  return (
    <View style={ic.wrap}>
      <View style={ic.iconWrap}>
        <Ionicons name={icon} size={18} color={COLOR_PRIMARY} />
      </View>
      <View>
        <Text style={ic.label}>{label}</Text>
        <Text style={ic.value}>{value}</Text>
      </View>
    </View>
  );
}

const ic = StyleSheet.create({
  wrap: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: COLOR_BG, borderRadius: RADIUS_ITEM, padding: 12,
    borderWidth: 1, borderColor: COLOR_BORDER,
  },
  iconWrap: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: COLOR_PRIMARY + '14',
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  label: { fontSize: 10, color: COLOR_TEXT_MUTED, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  value: { fontSize: 13, fontWeight: '700', color: COLOR_TEXT, marginTop: 1 },
});

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function PlaceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [place, setPlace] = useState<Place | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('Traveler');

  // Review form state
  const [myRating, setMyRating] = useState(0);
  const [myComment, setMyComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const didCompleteTask = useRef(false);

  useEffect(() => {
    if (!id) return;
    AsyncStorage.getItem('userName').then(n => { if (n) setUserName(n); });

    Promise.all([
      api.places.getById(id),
      api.reviews.getForPlace(id),
    ]).then(([p, r]) => {
      setPlace(p);
      setReviews(r);
    }).catch(() => {
      Alert.alert('Error', 'Could not load place details.');
      router.back();
    }).finally(() => setLoading(false));

    // Complete the "view_place" daily task once
    if (!didCompleteTask.current) {
      didCompleteTask.current = true;
      api.tasks.complete('view_place').catch(() => {});
    }
  }, [id]);

  const handleSubmitReview = async () => {
    if (!place || myRating === 0 || !myComment.trim()) return;
    setSubmitting(true);
    try {
      const newReview = await api.reviews.submit({
        placeId: place.id,
        userName,
        rating: myRating,
        comment: myComment.trim(),
      });
      setReviews(prev => [newReview, ...prev]);
      setMyRating(0);
      setMyComment('');
      await api.tasks.complete('write_review');
    } catch {
      Alert.alert('Error', 'Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator color={COLOR_PRIMARY} size="large" />
      </View>
    );
  }

  if (!place) return null;

  const avgRating = reviews.length > 0
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : place.rating;

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: SCREEN_BOTTOM_PADDING }}>

        {/* ── Hero ── */}
        <View style={styles.hero}>
          <Image
            source={{ uri: place.image }}
            style={styles.heroImage}
            contentFit="cover"
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.72)']}
            style={styles.heroGradient}
          />

          {/* Back button */}
          <SafeAreaView style={styles.heroTop} edges={['top']}>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.85}>
              <Ionicons name="chevron-back" size={20} color="#fff" />
            </TouchableOpacity>
          </SafeAreaView>

          {/* Hero bottom info */}
          <View style={styles.heroBottom}>
            {place.isVerified && (
              <View style={styles.verifiedPill}>
                <Ionicons name="checkmark-circle" size={11} color="#fff" />
                <Text style={styles.verifiedText}>Verified Local</Text>
              </View>
            )}
            <Text style={styles.heroName}>{place.name}</Text>
            <View style={styles.heroMeta}>
              <Stars rating={avgRating} size={15} color={COLOR_ACCENT} />
              <Text style={styles.heroRating}>{avgRating.toFixed(1)}</Text>
              <Text style={styles.heroReviewCount}>({reviews.length} reviews)</Text>
              <View style={styles.dot} />
              <Text style={styles.heroCategory}>{place.category}</Text>
            </View>
          </View>
        </View>

        {/* ── Tags ── */}
        <View style={styles.tagsRow}>
          {place.tags.map(tag => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>

        {/* ── Description ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.description}>{place.description}</Text>
        </View>

        {/* ── Info Grid ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Details</Text>
          <View style={styles.infoGrid}>
            <InfoChip icon="location-outline" label="Location" value={place.location} />
            <InfoChip icon="pricetag-outline" label="Entry" value={place.price} />
          </View>
          <View style={[styles.infoGrid, { marginTop: 8 }]}>
            <InfoChip icon="car-outline" label="Transport" value={place.transport ?? 'Walk'} />
            <InfoChip icon="cash-outline" label="Fare" value={place.transportCost ?? 'Free'} />
          </View>
        </View>

        {/* ── Reviews Header ── */}
        <View style={styles.section}>
          <View style={styles.reviewsHeader}>
            <Text style={styles.sectionTitle}>Reviews</Text>
            <View style={styles.avgRatingPill}>
              <Ionicons name="star" size={13} color={COLOR_ACCENT} />
              <Text style={styles.avgRatingText}>{avgRating.toFixed(1)}</Text>
              <Text style={styles.avgReviewCount}> · {reviews.length}</Text>
            </View>
          </View>

          {/* Write a review */}
          <View style={styles.reviewForm}>
            <Text style={styles.reviewFormTitle}>Share your experience</Text>
            <StarSelector value={myRating} onChange={setMyRating} />
            {myRating > 0 && (
              <Text style={styles.ratingLabel}>
                {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][myRating]}
              </Text>
            )}
            <TextInput
              style={styles.reviewInput}
              value={myComment}
              onChangeText={setMyComment}
              placeholder="What did you enjoy about this place?"
              placeholderTextColor={COLOR_TEXT_MUTED}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
            <TouchableOpacity
              style={[
                styles.submitBtn,
                (myRating === 0 || !myComment.trim() || submitting) && styles.submitBtnDisabled,
              ]}
              onPress={handleSubmitReview}
              disabled={myRating === 0 || !myComment.trim() || submitting}
              activeOpacity={0.85}>
              {submitting
                ? <ActivityIndicator color="#fff" size="small" />
                : (
                  <View style={styles.submitRow}>
                    <Ionicons name="send-outline" size={15} color="#fff" />
                    <Text style={styles.submitText}>Post Review  +100 pts</Text>
                  </View>
                )}
            </TouchableOpacity>
          </View>

          {/* Reviews list */}
          {reviews.length === 0 ? (
            <View style={styles.emptyReviews}>
              <Text style={styles.emptyEmoji}>💬</Text>
              <Text style={styles.emptyText}>Be the first to review this place!</Text>
            </View>
          ) : (
            <View style={styles.reviewsList}>
              {reviews.map(r => <ReviewCard key={r.id} review={r} />)}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLOR_BG },
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLOR_BG },

  // Hero
  hero: { height: 300, position: 'relative' },
  heroImage: { width: '100%', height: '100%' },
  heroGradient: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: 160,
  },
  heroTop: {
    position: 'absolute', top: 0, left: 0, right: 0,
    paddingHorizontal: 16, paddingTop: 4,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center', justifyContent: 'center',
  },
  heroBottom: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: 20, gap: 6,
  },
  verifiedPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: COLOR_PRIMARY, borderRadius: RADIUS_PILL,
    paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start',
  },
  verifiedText: { fontSize: 10, fontWeight: '700', color: '#fff' },
  heroName: { fontSize: 26, fontWeight: '900', color: '#fff', letterSpacing: -0.3 },
  heroMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  heroRating: { fontSize: 14, fontWeight: '700', color: '#fff' },
  heroReviewCount: { fontSize: 12, color: 'rgba(255,255,255,0.7)' },
  dot: { width: 3, height: 3, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.5)' },
  heroCategory: { fontSize: 13, color: 'rgba(255,255,255,0.85)', fontWeight: '500' },

  // Tags
  tagsRow: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 8,
    paddingHorizontal: 20, paddingTop: 16,
  },
  tag: {
    backgroundColor: COLOR_PRIMARY + '14', borderRadius: RADIUS_PILL,
    paddingHorizontal: 12, paddingVertical: 5, borderWidth: 1, borderColor: COLOR_PRIMARY + '30',
  },
  tagText: { fontSize: 12, fontWeight: '600', color: COLOR_PRIMARY },

  // Sections
  section: { paddingHorizontal: 20, paddingTop: 24, gap: 12 },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: COLOR_TEXT },
  description: { fontSize: 15, color: COLOR_TEXT_MUTED, lineHeight: 22 },

  // Info grid
  infoGrid: { flexDirection: 'row', gap: 8 },

  // Reviews
  reviewsHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  avgRatingPill: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: '#FEF3C7', borderRadius: RADIUS_PILL,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  avgRatingText: { fontSize: 13, fontWeight: '800', color: '#92400E' },
  avgReviewCount: { fontSize: 12, color: '#B45309' },

  reviewForm: {
    backgroundColor: COLOR_SURFACE, borderRadius: RADIUS_CARD,
    padding: 18, gap: 12, ...SHADOW_SM,
    borderWidth: 1, borderColor: COLOR_BORDER,
  },
  reviewFormTitle: { fontSize: 14, fontWeight: '700', color: COLOR_TEXT },
  ratingLabel: { fontSize: 13, fontWeight: '600', color: COLOR_ACCENT, marginTop: -4 },
  reviewInput: {
    backgroundColor: COLOR_BG, borderRadius: RADIUS_ITEM,
    borderWidth: 1.5, borderColor: COLOR_BORDER,
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 14, color: COLOR_TEXT, minHeight: 80, paddingTop: 12,
  },
  submitBtn: {
    backgroundColor: COLOR_PRIMARY, borderRadius: RADIUS_ITEM,
    paddingVertical: 13, alignItems: 'center', ...SHADOW_MD,
  },
  submitBtnDisabled: { opacity: 0.4 },
  submitRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  submitText: { fontSize: 14, fontWeight: '800', color: '#fff' },

  emptyReviews: { alignItems: 'center', paddingVertical: 24, gap: 8 },
  emptyEmoji: { fontSize: 32 },
  emptyText: { fontSize: 14, color: COLOR_TEXT_MUTED },

  reviewsList: { gap: 10 },
});
