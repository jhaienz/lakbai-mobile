export type UserRole = 'tourist' | 'business' | 'lgu';

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

// ── AI Itinerary ─────────────────────────────────────────────────────────────

export interface GeneratedItineraryStop {
  id: string;
  time: string;
  name: string;
  category: string;
  description: string;
  tags: string[];
  transport: string;
  transportCost: string;
  duration: string;
}

export interface GeneratedItinerary {
  id: string;
  title: string;
  subtitle: string;
  totalBudget: string;
  transportSummary: string;
  stops: GeneratedItineraryStop[];
  savedAt?: number;
}

// ── Reviews & Gamification ───────────────────────────────────────────────────

export interface Review {
  id: string;
  placeId: string;
  userName: string;
  rating: number;
  comment: string;
  timestamp: number;
}

export type DailyTaskType = 'view_place' | 'write_review' | 'chat' | 'generate_itinerary' | 'explore_category';

export interface DailyTask {
  id: string;
  title: string;
  description: string;
  icon: string;
  points: number;
  completed: boolean;
  type: DailyTaskType;
}

// ── Multi-role types ─────────────────────────────────────────────────────────

export type ApplicationStatus = 'pending' | 'approved' | 'rejected';

export interface BusinessApplication {
  id: string;
  businessName: string;
  category: string;
  description: string;
  location: string;
  ownerName: string;
  contact: string;
  imageUrl: string;
  status: ApplicationStatus;
  submittedAt: number;
  reviewedAt?: number;
  reviewNotes?: string;
}
