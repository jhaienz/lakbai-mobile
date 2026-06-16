/**
 * Curated itinerary planner — no external AI required.
 * Pre-built, demo-ready itineraries keyed by travel theme.
 * Heritage is the MVP showcase route.
 */
import type { GeneratedItinerary } from '@/types';

export type ItineraryTheme = 'heritage' | 'food' | 'nature' | 'adventure' | 'beach';

// ── Theme detection from free text ────────────────────────────────────────────
export function detectTheme(message: string): ItineraryTheme {
  const s = message.toLowerCase();
  if (/heritage|history|historic|church|ruins|museum|culture|cultural/.test(s)) return 'heritage';
  if (/food|eat|bicolano|spicy|pinangat|bicol express|kain|restaurant|culinary|cuisine/.test(s)) return 'food';
  if (/hike|hiking|trek|mayon|volcano|climb|mountain|adventure|atv|zipline/.test(s)) return 'adventure';
  if (/beach|coast|island|sea|swim|snorkel|sunset/.test(s)) return 'beach';
  if (/nature|eco|green|forest|falls|spring|park/.test(s)) return 'nature';
  return 'heritage';
}

// ── Curated itinerary templates (ids stamped at request time) ─────────────────
type Template = Omit<GeneratedItinerary, 'id'>;

const TEMPLATES: Record<ItineraryTheme, Template> = {
  // ── HERITAGE — MVP SHOWCASE ROUTE ──
  heritage: {
    title: 'Day 1: Albay Heritage Trail',
    subtitle: 'A journey through Albay\'s colonial churches, ruins & living history.',
    totalBudget: '₱150',
    transportSummary: 'Estimated for 3 tricycle rides and 1 jeepney fare',
    stops: [
      {
        id: 's1',
        time: '08:00 AM',
        name: 'Cagsawa Ruins',
        category: 'Heritage',
        description: 'Begin at the iconic Cagsawa Ruins — the bell tower of an 18th-century church buried by Mayon\'s 1814 eruption. Arrive early to catch the volcano framed behind the ruins before the clouds roll in. Best photo spot in all of Albay.',
        tags: ['Historical', 'Outdoor', 'Heritage'],
        transport: 'Tricycle',
        transportCost: '₱40',
        duration: '1.5 hours',
      },
      {
        id: 's2',
        time: '10:00 AM',
        name: 'Daraga Church (Nuestra Señora de la Porteria)',
        category: 'Heritage',
        description: 'Climb to this 1773 baroque church built of volcanic stone atop Santa Maria hill. Marvel at the intricately carved facade and enjoy sweeping views of Mayon and the town below. A declared National Cultural Treasure.',
        tags: ['Heritage', 'Cultural', 'Historical'],
        transport: 'Tricycle',
        transportCost: '₱35',
        duration: '1 hour',
      },
      {
        id: 's3',
        time: '11:30 AM',
        name: 'Kusina ni Lola',
        category: 'Food',
        description: 'Refuel with authentic Bicolano heritage cuisine. Try the original Pinangat (taro leaves in coconut milk) and Bicol Express — recipes passed down through generations. A true taste of Albay\'s culinary history.',
        tags: ['Food', 'Spicy', 'Local'],
        transport: 'Jeepney',
        transportCost: '₱20',
        duration: '1.5 hours',
      },
      {
        id: 's4',
        time: '02:00 PM',
        name: 'Albay Cathedral (St. Gregory the Great)',
        category: 'Heritage',
        description: 'End your trail at the seat of the Diocese of Legazpi, first built in 1587. Walk through centuries of faith and admire the restored interiors. Cap the day at nearby Peñaranda Park, the city\'s historic civic heart.',
        tags: ['Heritage', 'Cultural', 'Historical'],
        transport: 'Tricycle',
        transportCost: '₱45',
        duration: '1.5 hours',
      },
    ],
  },

  // ── FOOD ──
  food: {
    title: 'Day 1: Bicolano Spice Trail',
    subtitle: 'Taste your way through Albay\'s fiery, coconut-rich cuisine.',
    totalBudget: '₱120',
    transportSummary: 'Estimated for 2 tricycle rides and 1 walk',
    stops: [
      {
        id: 's1',
        time: '08:00 AM',
        name: 'Kusina ni Lola',
        category: 'Food',
        description: 'Start with a hearty Bicolano breakfast. Their Pinangat and Bicol Express follow the original family recipe — the perfect spicy welcome to Albay flavors.',
        tags: ['Food', 'Spicy'],
        transport: 'Tricycle',
        transportCost: '₱50',
        duration: '1.5 hours',
      },
      {
        id: 's2',
        time: '10:30 AM',
        name: 'Legazpi Public Market',
        category: 'Food',
        description: 'Wander the vibrant morning market. Buy pili nut treats, native delicacies, and fresh seafood straight from Albay Gulf. Sample street snacks as you go.',
        tags: ['Food', 'Local'],
        transport: 'Walk',
        transportCost: 'Free',
        duration: '1 hour',
      },
      {
        id: 's3',
        time: '12:30 PM',
        name: '1st Colonial Grill',
        category: 'Food',
        description: 'Famous for the daring "sili ice cream" and creative Bicol-fusion dishes. A must-stop for adventurous foodies wanting Albay\'s signature spicy-sweet experience.',
        tags: ['Food', 'Spicy', 'Local'],
        transport: 'Tricycle',
        transportCost: '₱40',
        duration: '1.5 hours',
      },
    ],
  },

  // ── NATURE ──
  nature: {
    title: 'Day 1: Albay Nature Escape',
    subtitle: 'Springs, falls, and green spaces beneath Mayon\'s gaze.',
    totalBudget: '₱160',
    transportSummary: 'Estimated for 3 tricycle rides',
    stops: [
      {
        id: 's1',
        time: '08:00 AM',
        name: 'Sumlang Lake',
        category: 'Nature',
        description: 'Glide across this serene lake on a bamboo raft with a postcard-perfect Mayon reflection. Cool morning air and birdlife make it the calmest start to your day.',
        tags: ['Nature', 'Outdoor', 'Eco-Friendly'],
        transport: 'Tricycle',
        transportCost: '₱60',
        duration: '1.5 hours',
      },
      {
        id: 's2',
        time: '10:30 AM',
        name: 'Vera Falls (Malinao)',
        category: 'Nature',
        description: 'Trek a short forest trail to a refreshing multi-tier waterfall. Take a dip in the natural pools surrounded by lush greenery — a hidden gem away from the crowds.',
        tags: ['Nature', 'Outdoor', 'Eco-Friendly'],
        transport: 'Tricycle',
        transportCost: '₱50',
        duration: '2 hours',
      },
      {
        id: 's3',
        time: '01:30 PM',
        name: 'Mayon Skyline (Buyuan Trail viewpoint)',
        category: 'Nature',
        description: 'Wind up to a panoramic viewpoint for an unobstructed look at the world\'s most perfect cone. Bring a snack and soak in the scenery before heading back.',
        tags: ['Nature', 'Outdoor'],
        transport: 'Tricycle',
        transportCost: '₱50',
        duration: '1.5 hours',
      },
    ],
  },

  // ── ADVENTURE ──
  adventure: {
    title: 'Day 1: Mayon Adventure Day',
    subtitle: 'ATV trails, ziplines, and adrenaline at the foot of Mayon.',
    totalBudget: '₱180',
    transportSummary: 'Estimated for 2 tricycle rides and 1 van transfer',
    stops: [
      {
        id: 's1',
        time: '07:30 AM',
        name: 'Mayon ATV Adventure',
        category: 'Adventure',
        description: 'Kick off with a guided ATV ride over lava-rock trails toward Mayon\'s base. Cross streams and rugged terrain for the closest legal approach to the active volcano.',
        tags: ['Adventure', 'Outdoor'],
        transport: 'Van',
        transportCost: '₱80',
        duration: '2.5 hours',
      },
      {
        id: 's2',
        time: '11:00 AM',
        name: 'Cagsawa Ruins',
        category: 'Heritage',
        description: 'Cool down with a dose of history. Photograph the famous bell tower against Mayon and learn the story of the 1814 eruption that shaped the landscape you just rode through.',
        tags: ['Historical', 'Outdoor'],
        transport: 'Tricycle',
        transportCost: '₱40',
        duration: '1 hour',
      },
      {
        id: 's3',
        time: '01:00 PM',
        name: 'Embarcadero Zipline (Legazpi)',
        category: 'Adventure',
        description: 'Finish with a coastal zipline and harbor views at Embarcadero de Legazpi. Grab a late lunch by the bay and watch boats drift across Albay Gulf.',
        tags: ['Adventure', 'Outdoor', 'Local'],
        transport: 'Tricycle',
        transportCost: '₱50',
        duration: '2 hours',
      },
    ],
  },

  // ── BEACH ──
  beach: {
    title: 'Day 1: Albay Coast & Islands',
    subtitle: 'Black-sand shores, island hops, and golden sunsets.',
    totalBudget: '₱200',
    transportSummary: 'Estimated for 2 tricycle rides and 1 boat fare',
    stops: [
      {
        id: 's1',
        time: '08:00 AM',
        name: 'Sogod Beach (Bacacay)',
        category: 'Nature',
        description: 'Start on a quiet stretch of sand with calm waters perfect for a morning swim. A laid-back local favorite away from the tourist rush.',
        tags: ['Nature', 'Outdoor', 'Local'],
        transport: 'Tricycle',
        transportCost: '₱70',
        duration: '2 hours',
      },
      {
        id: 's2',
        time: '11:00 AM',
        name: 'San Miguel Island Hop',
        category: 'Adventure',
        description: 'Take a short banca ride to explore hidden coves and snorkeling spots around San Miguel Island, with Mayon looming on the horizon.',
        tags: ['Adventure', 'Outdoor', 'Eco-Friendly'],
        transport: 'Van',
        transportCost: '₱80',
        duration: '3 hours',
      },
      {
        id: 's3',
        time: '03:30 PM',
        name: 'Embarcadero de Legazpi',
        category: 'Cultural',
        description: 'Wrap up at the waterfront complex for shopping, local eats, and a spectacular sunset over the bay with the lighthouse as your backdrop.',
        tags: ['Local', 'Cultural', 'Food'],
        transport: 'Tricycle',
        transportCost: '₱50',
        duration: '2 hours',
      },
    ],
  },
};

let counter = 0;
function nextId(): string {
  counter += 1;
  return `itin_${Date.now()}_${counter}`;
}

/** Build a curated itinerary for the detected (or explicit) theme. */
export function planItinerary(messageOrTheme: string): GeneratedItinerary {
  const theme: ItineraryTheme =
    (['heritage', 'food', 'nature', 'adventure', 'beach'] as ItineraryTheme[])
      .includes(messageOrTheme as ItineraryTheme)
      ? (messageOrTheme as ItineraryTheme)
      : detectTheme(messageOrTheme);

  const template = TEMPLATES[theme];
  return {
    ...template,
    id: nextId(),
    stops: template.stops.map(s => ({ ...s })),
  };
}
