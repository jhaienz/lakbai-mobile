import { Platform } from 'react-native';
import type {
  UserProfile, Place, Itinerary, ChatResponse,
  LeaderboardEntry, Badge,
} from '@/types';

const API_BASE_URL = Platform.select({
  android: 'http://10.0.2.2:3001/api',
  default: 'http://localhost:3001/api',
}) as string;

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`API ${response.status}: ${text}`);
  }
  return response.json() as Promise<T>;
}

export const api = {
  user: {
    get: () =>
      request<UserProfile>('/user'),
    create: (data: { name: string; vibes: string[] }) =>
      request<UserProfile>('/user', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (data: Partial<UserProfile>) =>
      request<UserProfile>('/user', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
  },

  places: {
    getAll: () => request<Place[]>('/places'),
    getFeatured: () => request<Place[]>('/places/featured'),
    getById: (id: string) => request<Place>(`/places/${id}`),
  },

  itinerary: {
    generate: (data: { vibes: string[]; budget: string; days: number }) =>
      request<Itinerary>('/itinerary/generate', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    getAll: () => request<Itinerary[]>('/itinerary'),
  },

  chat: {
    send: (message: string, history?: string[]) =>
      request<ChatResponse>('/chat', {
        method: 'POST',
        body: JSON.stringify({ message, history }),
      }),
  },

  leaderboard: {
    get: () => request<LeaderboardEntry[]>('/leaderboard'),
  },

  badges: {
    getAll: () => request<Badge[]>('/badges'),
    getUserBadges: () => request<Badge[]>('/badges/user'),
  },

  health: {
    check: () => request<{ status: string }>('/health'),
  },
};
