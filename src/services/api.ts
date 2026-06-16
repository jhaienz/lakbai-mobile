/**
 * Local data service — no network required.
 * Persisted via AsyncStorage; shared across Tourist, Business, and LGU roles.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

import { BADGES, CHAT_RESPONSES, ITINERARIES, LEADERBOARD, PLACES, SEED_APPLICATIONS } from '@/data/mockData';
import type {
  ApplicationStatus, Badge, BusinessApplication,
  ChatResponse, DailyTask, DailyTaskType, GeneratedItinerary,
  Itinerary, LeaderboardEntry, Place, Review, UserProfile,
} from '@/types';

// ── AsyncStorage keys ─────────────────────────────────────────────────────────
const KEYS = {
  USER_PROFILE: 'userProfile',
  APPLICATIONS: 'businessApplications',
  CUSTOM_PLACES: 'customPlaces',
  DATA_SEEDED: 'dataSeeded',
  REVIEWS: 'placeReviews',
  DAILY_TASKS_PREFIX: 'dailyTasks_',
} as const;

// ── One-time seed ─────────────────────────────────────────────────────────────
export async function seedIfNeeded(): Promise<void> {
  const done = await AsyncStorage.getItem(KEYS.DATA_SEEDED);
  if (done) return;
  await AsyncStorage.setItem(KEYS.APPLICATIONS, JSON.stringify(SEED_APPLICATIONS));
  await AsyncStorage.setItem(KEYS.DATA_SEEDED, 'true');
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const DEFAULT_USER: UserProfile = {
  id: 'u4', name: 'Explorer', vibes: [], points: 0, level: 'Newcomer',
  contributions: 0, rank: 99, mobility: 'Vehicle', budget: 'Mid-Range', interests: [],
};

async function loadUser(): Promise<UserProfile> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.USER_PROFILE);
    if (raw) return JSON.parse(raw) as UserProfile;
  } catch { /* ignore */ }
  return { ...DEFAULT_USER };
}

async function persistUser(user: UserProfile): Promise<UserProfile> {
  await AsyncStorage.setItem(KEYS.USER_PROFILE, JSON.stringify(user));
  return user;
}

async function loadApplications(): Promise<BusinessApplication[]> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.APPLICATIONS);
    if (raw) return JSON.parse(raw) as BusinessApplication[];
  } catch { /* ignore */ }
  return [];
}

async function saveApplications(apps: BusinessApplication[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.APPLICATIONS, JSON.stringify(apps));
}

async function loadCustomPlaces(): Promise<Place[]> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.CUSTOM_PLACES);
    if (raw) return JSON.parse(raw) as Place[];
  } catch { /* ignore */ }
  return [];
}

async function saveCustomPlaces(places: Place[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.CUSTOM_PLACES, JSON.stringify(places));
}

async function loadReviews(): Promise<Review[]> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.REVIEWS);
    if (raw) return JSON.parse(raw) as Review[];
  } catch { /* ignore */ }
  return [];
}

async function saveReviews(reviews: Review[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.REVIEWS, JSON.stringify(reviews));
}

function todayDateKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const DAILY_TASKS_TEMPLATE: Array<Omit<DailyTask, 'completed'>> = [
  { id: 'dt1', title: 'Discover a Spot',     description: 'Open any place detail page',      icon: '🗺️', points: 50,  type: 'view_place' },
  { id: 'dt2', title: 'Leave a Review',       description: 'Write a review for any place',    icon: '✍️', points: 100, type: 'write_review' },
  { id: 'dt3', title: 'Chat with LakbAI',  description: 'Send a message to the AI guide',  icon: '💬', points: 30,  type: 'chat' },
  { id: 'dt4', title: 'Plan Your Trip',       description: 'Generate an AI itinerary',        icon: '📋', points: 80,  type: 'generate_itinerary' },
  { id: 'dt5', title: 'Explore a Category',  description: 'Filter places by any category',   icon: '🏷️', points: 20,  type: 'explore_category' },
];

async function loadTodayTasks(): Promise<DailyTask[]> {
  const key = `${KEYS.DAILY_TASKS_PREFIX}${todayDateKey()}`;
  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw) return JSON.parse(raw) as DailyTask[];
  } catch { /* ignore */ }
  const fresh = DAILY_TASKS_TEMPLATE.map(t => ({ ...t, completed: false }));
  await AsyncStorage.setItem(key, JSON.stringify(fresh));
  return fresh;
}

function applicationToPlace(app: BusinessApplication): Place {
  return {
    id: `biz_${app.id}`,
    name: app.businessName,
    category: app.category,
    description: app.description,
    image: app.imageUrl || 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400',
    rating: 4.5,
    price: 'Contact for pricing',
    location: app.location,
    lat: 13.14,
    lng: 123.74,
    isVerified: true,
    tags: [app.category, 'Local Business'],
    transport: 'Tricycle',
    transportCost: 'Varies',
  };
}

function classifyMessage(msg: string): keyof typeof CHAT_RESPONSES {
  const s = msg.toLowerCase();
  if (/food|eat|bicolano|spicy|pinangat|bicol express|kain|restaurant|lunch|dinner/.test(s)) return 'food';
  if (/nature|green|hills|park|eco|environment|forest/.test(s)) return 'nature';
  if (/hike|hiking|trek|mayon|volcano|climb|mountain/.test(s)) return 'hiking';
  if (/heritage|history|church|ruins|museum|culture|historic/.test(s)) return 'heritage';
  return 'default';
}

function delay<T>(value: T, ms = 300): Promise<T> {
  return new Promise(resolve => setTimeout(() => resolve(value), ms));
}

// ── Public API ────────────────────────────────────────────────────────────────
export const api = {

  // ── Tourist: User ──────────────────────────────────────────────────────────
  user: {
    get: (): Promise<UserProfile> => loadUser(),

    create: async (data: { name: string; vibes: string[] }): Promise<UserProfile> => {
      const user: UserProfile = {
        ...DEFAULT_USER,
        id: `u_${Date.now()}`,
        name: data.name,
        vibes: data.vibes,
        interests: data.vibes,
      };
      return persistUser(user);
    },

    update: async (data: Partial<UserProfile>): Promise<UserProfile> => {
      const current = await loadUser();
      return persistUser({ ...current, ...data });
    },
  },

  // ── Tourist: Places (includes LGU-approved businesses) ────────────────────
  places: {
    getAll: async (): Promise<Place[]> => {
      const custom = await loadCustomPlaces();
      return delay([...PLACES, ...custom]);
    },

    getFeatured: async (): Promise<Place[]> => {
      const custom = await loadCustomPlaces();
      return delay([...PLACES.filter(p => p.isVerified), ...custom]);
    },

    getById: async (id: string): Promise<Place> => {
      const found = PLACES.find(p => p.id === id);
      if (found) return delay(found);
      const custom = await loadCustomPlaces();
      const customFound = custom.find(p => p.id === id);
      if (customFound) return delay(customFound);
      return Promise.reject(new Error(`Place ${id} not found`));
    },
  },

  // ── Tourist: Itinerary ─────────────────────────────────────────────────────
  itinerary: {
    generate: async ({ vibes, budget, days }: { vibes: string[]; budget: string; days: number }): Promise<Itinerary> => {
      const custom = await loadCustomPlaces();
      const all = [...PLACES, ...custom];
      const pool = vibes.length > 0
        ? all.filter(p => p.tags.some(t => vibes.includes(t)))
        : all;
      const selected = pool.slice(0, Math.min(3, pool.length));
      const times = ['08:00 AM', '10:30 AM', '12:00 PM', '02:30 PM'];
      const label = vibes.length > 0 ? vibes.slice(0, 2).join(' & ') : 'Heritage & Spice';
      const itinerary: Itinerary = {
        id: `gen_${Date.now()}`,
        title: `Day ${days}: ${label}`,
        subtitle: 'Your personalized journey through Legaspi.',
        day: days,
        totalBudget: budget === 'Budget' ? '₱80' : budget === 'Premium' ? '₱250' : '₱130',
        stops: selected.map((place, i) => ({
          time: times[i],
          place,
          transport: place.transport ?? 'Tricycle',
          transportCost: place.transportCost ?? '₱40',
          duration: '1.5 hours',
          notes: place.description,
        })),
      };
      return delay(itinerary, 600);
    },

    getAll: (): Promise<Itinerary[]> => delay([...ITINERARIES]),
  },

  // ── Tourist: Chat ──────────────────────────────────────────────────────────
  chat: {
    send: (_message: string, _history?: string[]): Promise<ChatResponse> =>
      delay({ ...CHAT_RESPONSES[classifyMessage(_message)] }, 600),
  },

  // ── Tourist: Leaderboard & Badges ─────────────────────────────────────────
  leaderboard: {
    get: (): Promise<LeaderboardEntry[]> => delay([...LEADERBOARD]),
  },

  badges: {
    getAll: (): Promise<Badge[]> => delay([...BADGES]),
    getUserBadges: (): Promise<Badge[]> => delay(BADGES.filter(b => b.unlocked)),
  },

  // ── Business role ──────────────────────────────────────────────────────────
  business: {
    getMyApplications: async (ownerName: string): Promise<BusinessApplication[]> => {
      const apps = await loadApplications();
      return delay(apps.filter(a => a.ownerName.toLowerCase() === ownerName.toLowerCase()));
    },

    submit: async (data: Omit<BusinessApplication, 'id' | 'status' | 'submittedAt'>): Promise<BusinessApplication> => {
      const apps = await loadApplications();
      const newApp: BusinessApplication = {
        ...data,
        id: `app_${Date.now()}`,
        status: 'pending',
        submittedAt: Date.now(),
      };
      await saveApplications([...apps, newApp]);
      return delay(newApp, 400);
    },
  },

  // ── LGU role ───────────────────────────────────────────────────────────────
  lgu: {
    getAllApplications: async (): Promise<BusinessApplication[]> => {
      const apps = await loadApplications();
      return delay([...apps].sort((a, b) => b.submittedAt - a.submittedAt));
    },

    getByStatus: async (status: ApplicationStatus): Promise<BusinessApplication[]> => {
      const apps = await loadApplications();
      return delay(apps.filter(a => a.status === status));
    },

    approve: async (id: string): Promise<BusinessApplication> => {
      const apps = await loadApplications();
      const idx = apps.findIndex(a => a.id === id);
      if (idx === -1) throw new Error('Application not found');

      apps[idx] = { ...apps[idx], status: 'approved', reviewedAt: Date.now() };
      await saveApplications(apps);

      // Convert to Place and persist
      const newPlace = applicationToPlace(apps[idx]);
      const existing = await loadCustomPlaces();
      const alreadyAdded = existing.some(p => p.id === newPlace.id);
      if (!alreadyAdded) {
        await saveCustomPlaces([...existing, newPlace]);
      }

      return delay(apps[idx], 300);
    },

    reject: async (id: string, reviewNotes: string): Promise<BusinessApplication> => {
      const apps = await loadApplications();
      const idx = apps.findIndex(a => a.id === id);
      if (idx === -1) throw new Error('Application not found');

      apps[idx] = { ...apps[idx], status: 'rejected', reviewedAt: Date.now(), reviewNotes };
      await saveApplications(apps);
      return delay(apps[idx], 300);
    },
  },

  // ── Tourist: Reviews ──────────────────────────────────────────────────────
  reviews: {
    getForPlace: async (placeId: string): Promise<Review[]> => {
      const all = await loadReviews();
      return delay(all.filter(r => r.placeId === placeId).sort((a, b) => b.timestamp - a.timestamp));
    },

    submit: async (data: Omit<Review, 'id' | 'timestamp'>): Promise<Review> => {
      const all = await loadReviews();
      const newReview: Review = { ...data, id: `rv_${Date.now()}`, timestamp: Date.now() };
      await saveReviews([...all, newReview]);
      return delay(newReview, 300);
    },

    getAverage: async (placeId: string): Promise<number> => {
      const all = await loadReviews();
      const mine = all.filter(r => r.placeId === placeId);
      if (mine.length === 0) return 0;
      return mine.reduce((sum, r) => sum + r.rating, 0) / mine.length;
    },
  },

  // ── Tourist: Daily Tasks ───────────────────────────────────────────────────
  tasks: {
    getToday: async (): Promise<DailyTask[]> => delay(await loadTodayTasks()),

    complete: async (type: DailyTaskType): Promise<void> => {
      const key = `${KEYS.DAILY_TASKS_PREFIX}${todayDateKey()}`;
      const tasks = await loadTodayTasks();
      const idx = tasks.findIndex(t => t.type === type && !t.completed);
      if (idx === -1) return;
      tasks[idx] = { ...tasks[idx], completed: true };
      await AsyncStorage.setItem(key, JSON.stringify(tasks));
      try {
        const user = await loadUser();
        await persistUser({ ...user, points: user.points + tasks[idx].points });
      } catch { /* no profile yet */ }
    },
  },

  // ── Saved Itineraries ──────────────────────────────────────────────────────
  savedItineraries: {
    getAll: async (): Promise<GeneratedItinerary[]> => {
      try {
        const raw = await AsyncStorage.getItem('savedItineraries');
        if (raw) return JSON.parse(raw) as GeneratedItinerary[];
      } catch { /* ignore */ }
      return [];
    },

    getById: async (id: string): Promise<GeneratedItinerary | null> => {
      try {
        const raw = await AsyncStorage.getItem('savedItineraries');
        if (raw) {
          const all = JSON.parse(raw) as GeneratedItinerary[];
          return all.find(it => it.id === id) ?? null;
        }
      } catch { /* ignore */ }
      return null;
    },

    save: async (itinerary: GeneratedItinerary): Promise<void> => {
      const raw = await AsyncStorage.getItem('savedItineraries');
      const all: GeneratedItinerary[] = raw ? JSON.parse(raw) : [];
      const exists = all.findIndex(it => it.id === itinerary.id);
      const toSave = { ...itinerary, savedAt: Date.now() };
      if (exists >= 0) {
        all[exists] = toSave;
      } else {
        all.unshift(toSave);
      }
      await AsyncStorage.setItem('savedItineraries', JSON.stringify(all));
    },

    update: async (id: string, stops: GeneratedItinerary['stops']): Promise<void> => {
      const raw = await AsyncStorage.getItem('savedItineraries');
      const all: GeneratedItinerary[] = raw ? JSON.parse(raw) : [];
      const idx = all.findIndex(it => it.id === id);
      if (idx >= 0) {
        all[idx] = { ...all[idx], stops };
        await AsyncStorage.setItem('savedItineraries', JSON.stringify(all));
      }
    },

    delete: async (id: string): Promise<void> => {
      const raw = await AsyncStorage.getItem('savedItineraries');
      const all: GeneratedItinerary[] = raw ? JSON.parse(raw) : [];
      await AsyncStorage.setItem(
        'savedItineraries',
        JSON.stringify(all.filter(it => it.id !== id)),
      );
    },
  },

  health: {
    check: (): Promise<{ status: string }> => Promise.resolve({ status: 'ok' }),
  },
};
