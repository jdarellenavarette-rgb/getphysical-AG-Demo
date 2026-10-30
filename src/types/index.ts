export type EcosystemPortal = 'sodia' | 'gymdash-tablet' | 'gymdash-os' | 'clubdash' | 'coachdash';

export type UserRole = 'individual' | 'staff' | 'coach' | 'organizer' | 'facility_owner';

export interface UserProfile {
  id: string;
  name: string;
  username: string;
  avatar: string;
  bio: string;
  dob: string;
  homeLocation: string;
  roles: UserRole[];
  currentRole: UserRole;
  isPrivate: boolean;
  streakWeeks: number;
  streakGoal: number; // e.g. 3/week
  streakFreezeAvailable: boolean;
  activeRoster: Array<{
    id: string;
    facilityId: string;
    name: string;
    badge: string;
    type: 'pass' | 'sub' | 'club';
    validUntil: string;
  }>;
  weights: {
    weightlifting: number;
    running: number;
    pickleball: number;
    general: number;
  };
  metrics: {
    followers: number;
    following: number;
    activeChallenges: number;
  };
}

export interface Facility {
  id: string;
  name: string;
  registry: 'A' | 'B'; // A: Commercial Gym, B: Courts & Clubs
  category: string;
  logo: string;
  coverImage: string;
  address: string;
  distance: string;
  coords: { lat: number; lng: number };
  liveCapacity: {
    current: number;
    max: number;
  };
  isOpen: boolean;
  hours: string;
  amenities: string[];
  dayPassPrice: number;
  monthlySubPrice?: number;
  courtHourlyPrice?: number;
  rating: number;
  reviewCount: number;
  hasActiveChallenge?: boolean;
  challengeTitle?: string;
  friendsCheckedIn?: string[];
  // For Registry B Spatial Sub-division
  spatialAssets?: {
    parentId: string;
    parentName: string;
    isParentLocked: boolean;
    lockedReason?: string;
    bufferMinutes: number;
    children: Array<{
      id: string;
      name: string;
      isLocked: boolean;
      currentBooking?: string;
    }>;
  };
}

export interface VIPCardPass {
  id: string;
  facilityId: string;
  facilityName: string;
  facilityLogo: string;
  facilityRegistry: 'A' | 'B';
  passType: 'Day Pass' | 'Monthly Pro' | 'Annual VIP' | 'Court Booking' | 'Gift Pass';
  validUntil: string;
  status: 'active' | 'expiring_soon' | 'expired' | 'paused' | 'used_today';
  memberId: string;
  memberName: string;
  dynamicHash: string;
  offlineTotp: string;
  qrExpiresInSeconds: number;
  giftedBy?: string;
  courtDetails?: {
    courtName: string;
    slot: string;
    players: number;
  };
}

export interface LedgerTransaction {
  id: string;
  action: string;
  facilityName: string;
  timestamp: string;
  amount: number;
  serviceFee: number;
  status: 'completed' | 'refunded' | 'failed' | 'pending';
  type: 'payment' | 'access' | 'expiry' | 'refund' | 'split' | 'floor_fee';
  paymentMethod: string;
  referenceNo: string;
  isReversal?: boolean;
  splitDetails?: {
    facilityPayout: number;
    platformCut: number;
    organizerPayout?: number;
    coachPayout?: number;
  };
}

export interface VerifiedStamp {
  id: string;
  type: 'lift' | 'move' | 'food';
  timestamp: string;
  title: string;
  primaryMetric: string;
  subMetrics: string[];
  isVerified: boolean;
  isPR?: boolean;
  hiddenFromPublic?: boolean;
  facilityName?: string;
}

export interface SodiaPost {
  id: string;
  authorId: string;
  authorName: string;
  authorUsername: string;
  authorAvatar: string;
  authorType: 'individual' | 'facility' | 'coach';
  facilityTag?: {
    id: string;
    name: string;
    registry: 'A' | 'B';
    actionCTA: string;
    price: number;
  };
  content: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  stamp?: VerifiedStamp;
  likes: number;
  hasLiked?: boolean;
  commentsCount: number;
  repostsCount: number;
  isDiscoveryCard?: boolean;
  discoveryTag?: string; // "Suggested for you"
  createdAt: string;
  comments?: Array<{
    id: string;
    author: string;
    avatar: string;
    text: string;
    time: string;
    isPinned?: boolean;
  }>;
}

export interface SodiaStory {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  hasUnseen: boolean;
  expiresInHours: number;
  mediaUrl: string;
  locationTag?: {
    facilityId: string;
    name: string;
    actionCTA: string;
  };
  stamp?: VerifiedStamp;
}

export interface PRChallenge {
  id: string;
  title: string;
  type: 'lift' | 'move' | 'court';
  metric: string; // e.g. "1RM Deadlift" or "Fastest 5K"
  creatorName: string;
  facilityName?: string;
  isLocationLocked: boolean;
  participantsCount: number;
  endsIn: string;
  leaderboard: Array<{
    rank: number;
    username: string;
    avatar: string;
    score: string;
    verified: boolean;
    isUnderReview?: boolean;
  }>;
  isAccepted?: boolean;
  myEntry?: {
    score: string;
    rank: number;
    isUnderReview?: boolean;
  };
}

export interface ActiveWorkoutSet {
  setNumber: number;
  type: 'warmup' | 'working' | 'drop' | 'failure';
  prevWeight: number;
  prevReps: number;
  weight: number;
  reps: number;
  isCompleted: boolean;
  isPR?: boolean;
}

export interface ActiveExercise {
  id: string;
  name: string;
  targetMuscle: string;
  sets: ActiveWorkoutSet[];
}

export interface FoodLogItem {
  id: string;
  name: string;
  serving: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  timestamp: string;
}

export interface BracketMatch {
  id: string;
  round: number; // 1 = quarters, 2 = semis, 3 = final
  teamA: { name: string; score?: number; seed: number; isWinner?: boolean };
  teamB: { name: string; score?: number; seed: number; isWinner?: boolean };
  courtName: string;
  status: 'upcoming' | 'live' | 'completed';
}

export interface CoachClient {
  id: string;
  name: string;
  avatar: string;
  goal: string;
  status: 'active' | 'at_risk' | 'in_building' | 'expected';
  scheduledTime?: string;
  plannedMacros: { protein: number; carbs: number; fats: number; calories: number };
  actualMacros: { protein: number; carbs: number; fats: number; calories: number };
  missedDays: number;
  currentProgram: string;
  remainingSessions: number;
}
