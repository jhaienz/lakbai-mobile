export interface UserProfile {
  id: string;
  name: string;
  vibes: string[];
  points: number;
  level: string;
  contributions: number;
  rank: number;
  mobility: string;
  budget: string;
  interests: string[];
}

export interface Place {
  id: string;
  name: string;
  category: string;
  description: string;
  image: string;
  rating: number;
  price: string;
  location: string;
  lat: number;
  lng: number;
  isVerified: boolean;
  tags: string[];
  transport?: string;
  transportCost?: string;
}

export interface ItineraryStop {
  time: string;
  place: Place;
  transport: string;
  transportCost: string;
  duration: string;
  notes: string;
}

export interface Itinerary {
  id: string;
  title: string;
  subtitle: string;
  day: number;
  totalBudget: string;
  stops: ItineraryStop[];
}

export interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: number;
}

export interface ChatResponse {
  message: string;
  quickReplies: string[];
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  points: number;
  avatar: string | null;
  weeklyGain?: number;
  isCurrentUser?: boolean;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  category: string;
  totalVotes?: number;
  currentVotes?: number;
}
