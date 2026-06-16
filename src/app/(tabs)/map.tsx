import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';

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
import type { Place } from '@/types';

const MAP_STOPS = [
  { id: 'p2', x: 120, y: 220, label: 'Cagsawa\nRuins' },
  { id: 'p1', x: 240, y: 130, label: 'Kusina\nni Lola' },
  { id: 'p3', x: 310, y: 80, label: 'Daraga\nChurch' },
];

const PATH_D = 'M 120 220 C 160 180 200 155 240 130 C 270 112 290 95 310 80';

export default function MapScreen() {
  const [showWeather, setShowWeather] = useState(false);
  const [places, setPlaces] = useState<Place[]>([]);
  const [nextStop, setNextStop] = useState<Place | null>(null);
  const [navigating, setNavigating] = useState(false);

  useEffect(() => {
    api.places.getAll()
      .then(data => {
        setPlaces(data);
        const kusina = data.find(p => p.id === 'p1');
        if (kusina) setNextStop(kusina);
      })
      .catch(() => {});
  }, []);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuBtn} onPress={() => router.back()}>
          <Ionicons name="menu-outline" size={22} color={COLOR_TEXT} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ALBAY GO</Text>
        <TouchableOpacity style={styles.avatarBtn}>
          <Ionicons name="person" size={18} color={COLOR_PRIMARY} />
        </TouchableOpacity>
      </View>

      {/* ── Mock Map ── */}
      <View style={styles.mapContainer}>
        {/* Grid lines for map effect */}
        <View style={styles.mapGrid}>
          {[...Array(8)].map((_, i) => (
            <View key={`h${i}`} style={[styles.gridLineH, { top: i * 60 }]} />
          ))}
          {[...Array(6)].map((_, i) => (
            <View key={`v${i}`} style={[styles.gridLineV, { left: i * 80 }]} />
          ))}
        </View>

        {/* SVG Route Path */}
        <Svg style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
          <Path
            d={PATH_D}
            stroke={COLOR_SECONDARY}
            strokeWidth={3}
            fill="none"
            strokeDasharray="8,4"
          />
          {MAP_STOPS.map((stop, i) => (
            <Circle
              key={stop.id}
              cx={stop.x}
              cy={stop.y}
              r={i === 1 ? 14 : 10}
              fill={i === 1 ? COLOR_ACCENT : COLOR_PRIMARY}
              stroke="#fff"
              strokeWidth={2}
            />
          ))}
        </Svg>

        {/* Stop Labels */}
        {MAP_STOPS.map((stop, i) => (
          <View
            key={stop.id}
            style={[
              styles.stopLabel,
              { top: stop.y - 44, left: stop.x - 36 },
              i === 1 && styles.stopLabelActive,
            ]}>
            <Text style={[styles.stopLabelText, i === 1 && styles.stopLabelTextActive]}>
              {stop.label}
            </Text>
          </View>
        ))}

        {/* Stop Numbers */}
        {MAP_STOPS.map((stop, i) => (
          <View
            key={`n${stop.id}`}
            style={[styles.stopNumber, { top: stop.y - 8, left: stop.x - 8 }]}>
            <Text style={styles.stopNumberText}>{i + 1}</Text>
          </View>
        ))}

        {/* Weather Toggle — top right */}
        <TouchableOpacity
          style={styles.weatherBtn}
          onPress={() => setShowWeather(v => !v)}
          activeOpacity={0.85}>
          <Ionicons
            name={showWeather ? 'sunny' : 'partly-sunny-outline'}
            size={20}
            color={showWeather ? COLOR_ACCENT : COLOR_TEXT}
          />
          {showWeather && (
            <View style={styles.weatherPopup}>
              <Text style={styles.weatherLine}>☀️  28°C  Clear</Text>
              <Text style={styles.weatherLine}>💨  Wind: 12 km/h</Text>
              <Text style={styles.weatherLine}>💧  Humidity: 72%</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Current Location dot */}
        <View style={styles.locationDot}>
          <View style={styles.locationDotInner} />
          <View style={styles.locationPulse} />
        </View>

        {/* Map Attribution */}
        <View style={styles.attribution}>
          <Text style={styles.attributionText}>Albay Province, Philippines</Text>
        </View>
      </View>

      {/* ── Bottom Info Sheet ── */}
      <View style={styles.sheet}>
        {nextStop ? (
          <>
            <View style={styles.sheetRow}>
              <View style={styles.sheetLeft}>
                <Text style={styles.sheetLabel}>Next Stop</Text>
                <Text style={styles.sheetTitle}>{nextStop.name}</Text>
                <Text style={styles.sheetTime}>10:30 AM</Text>
              </View>
              <View style={styles.sheetChip}>
                <Ionicons name="time-outline" size={12} color={COLOR_TEXT_MUTED} />
                <Text style={styles.sheetChipText}>15 min</Text>
              </View>
            </View>

            <View style={styles.sheetMeta}>
              <Ionicons name="bicycle-outline" size={14} color={COLOR_TEXT_MUTED} />
              <Text style={styles.sheetMetaText}>
                via Tricycle  •  Est. {nextStop.transportCost ?? '₱50'}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.navBtn}
              activeOpacity={0.88}
              onPress={() => setNavigating(v => !v)}>
              <Ionicons name={navigating ? 'stop-circle' : 'navigate'} size={16} color="#fff" />
              <Text style={styles.navBtnText}>
                {navigating ? 'Stop Navigation' : '▲ Start Navigation'}
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <ActivityIndicator color={COLOR_PRIMARY} />
        )}
      </View>

      {/* Bottom padding for floating nav */}
      <View style={{ height: SCREEN_BOTTOM_PADDING - 20 }} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLOR_BG },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLOR_SURFACE,
    borderBottomWidth: 1,
    borderBottomColor: COLOR_BORDER,
  },
  menuBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: COLOR_BG,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16, fontWeight: '900', color: COLOR_PRIMARY, letterSpacing: 1.5,
  },
  avatarBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(17,94,89,0.10)',
    alignItems: 'center', justifyContent: 'center',
  },

  // Map
  mapContainer: {
    flex: 1,
    backgroundColor: '#E8F4E8',
    position: 'relative',
    overflow: 'hidden',
  },
  mapGrid: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  gridLineH: {
    position: 'absolute', left: 0, right: 0,
    height: 1, backgroundColor: 'rgba(17,94,89,0.08)',
  },
  gridLineV: {
    position: 'absolute', top: 0, bottom: 0,
    width: 1, backgroundColor: 'rgba(17,94,89,0.08)',
  },

  stopLabel: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    width: 72,
    ...SHADOW_SM,
  },
  stopLabelActive: { backgroundColor: COLOR_ACCENT + 'EE' },
  stopLabelText: { fontSize: 10, fontWeight: '600', color: COLOR_TEXT, textAlign: 'center' },
  stopLabelTextActive: { color: '#FFFFFF' },
  stopNumber: {
    position: 'absolute',
    width: 16, height: 16, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
  },
  stopNumberText: { fontSize: 9, fontWeight: '800', color: '#FFFFFF' },

  weatherBtn: {
    position: 'absolute',
    top: 16, right: 16,
    backgroundColor: COLOR_SURFACE,
    width: 44, height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW_MD,
  },
  weatherPopup: {
    position: 'absolute',
    top: 50, right: 0,
    backgroundColor: COLOR_SURFACE,
    borderRadius: RADIUS_ITEM,
    padding: 12,
    width: 160,
    gap: 4,
    ...SHADOW_MD,
  },
  weatherLine: { fontSize: 13, color: COLOR_TEXT },

  locationDot: {
    position: 'absolute',
    bottom: 80, left: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationDotInner: {
    width: 16, height: 16, borderRadius: 8,
    backgroundColor: COLOR_SECONDARY,
    borderWidth: 3, borderColor: '#fff',
    zIndex: 2,
  },
  locationPulse: {
    position: 'absolute',
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: COLOR_SECONDARY + '30',
  },

  attribution: {
    position: 'absolute', bottom: 8, right: 12,
  },
  attributionText: { fontSize: 10, color: COLOR_TEXT_MUTED },

  // Bottom Sheet
  sheet: {
    backgroundColor: COLOR_SURFACE,
    borderTopLeftRadius: RADIUS_CARD,
    borderTopRightRadius: RADIUS_CARD,
    padding: 20,
    paddingBottom: 16,
    ...SHADOW_LG,
  },
  sheetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  sheetLeft: { flex: 1 },
  sheetLabel: { fontSize: 11, color: COLOR_TEXT_MUTED, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 3 },
  sheetTitle: { fontSize: 20, fontWeight: '800', color: COLOR_TEXT },
  sheetTime: { fontSize: 13, color: COLOR_TEXT_MUTED, marginTop: 2 },
  sheetChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: COLOR_BG,
    borderRadius: RADIUS_PILL,
    paddingHorizontal: 10, paddingVertical: 5,
    borderWidth: 1, borderColor: COLOR_BORDER,
  },
  sheetChipText: { fontSize: 12, fontWeight: '600', color: COLOR_TEXT_MUTED },
  sheetMeta: {
    flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16,
  },
  sheetMetaText: { fontSize: 13, color: COLOR_TEXT_MUTED },
  navBtn: {
    backgroundColor: COLOR_ACCENT,
    borderRadius: RADIUS_ITEM,
    paddingVertical: 15,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    ...SHADOW_MD,
  },
  navBtnText: { fontSize: 16, fontWeight: '800', color: '#FFFFFF' },
});
