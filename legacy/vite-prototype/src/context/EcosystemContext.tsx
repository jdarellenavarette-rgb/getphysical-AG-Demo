import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  EcosystemPortal,
  UserProfile,
  Facility,
  VIPCardPass,
  LedgerTransaction,
  SodiaPost,
  SodiaStory,
  PRChallenge,
  ActiveExercise,
  FoodLogItem,
  BracketMatch,
  CoachClient,
  VerifiedStamp,
  UserRole
} from '../types';
import { loadPersistentItem, savePersistentItem, clearDatabase } from '../db/storage';
import { dbService, authService, supabase } from '../lib/supabase';

interface EcosystemContextType {
  // Navigation & Role
  portal: EcosystemPortal;
  setPortal: (p: EcosystemPortal) => void;
  sodiaTab: 'sodia' | 'discover' | 'cards' | 'track' | 'profile';
  setSodiaTab: (t: 'sodia' | 'discover' | 'cards' | 'track' | 'profile') => void;
  currentUser: UserProfile;
  setCurrentUser: React.Dispatch<React.SetStateAction<UserProfile>>;
  postAsRole: 'individual' | 'facility' | 'coach';
  setPostAsRole: (r: 'individual' | 'facility' | 'coach') => void;
  switchRole: (role: UserRole) => void;

  // Facilities & Registry
  facilities: Facility[];
  selectedFacility: Facility | null;
  setSelectedFacility: (f: Facility | null) => void;
  bookCourtSlot: (facilityId: string, courtName: string, slot: string) => void;

  // Passes & Wallet
  passes: VIPCardPass[];
  activePassIndex: number;
  setActivePassIndex: (i: number) => void;
  isQRFlapped: boolean;
  setIsQRFlapped: (b: boolean) => void;
  qrCountdown: number;
  isOfflineMode: boolean;
  setIsOfflineMode: (b: boolean) => void;
  sendPassToFriend: (passId: string, friendUsername: string) => boolean;

  // Universal Checkout
  isCheckoutOpen: boolean;
  checkoutItem: {
    facility: Facility;
    itemType: 'Day Pass' | 'Monthly Pro' | 'Court Booking';
    price: number;
    extraDetails?: string;
  } | null;
  openCheckout: (facility: Facility, itemType: 'Day Pass' | 'Monthly Pro' | 'Court Booking', price: number, extra?: string) => void;
  closeCheckout: () => void;
  processCheckoutPayment: (asGift?: boolean, recipientName?: string) => void;

  // Ledger (Append-Only)
  ledger: LedgerTransaction[];
  addLedgerEntry: (entry: Omit<LedgerTransaction, 'id' | 'timestamp' | 'referenceNo'>) => void;
  voidOrRefundTransaction: (txId: string, managerPin: string) => boolean;

  // Sodia Social
  posts: SodiaPost[];
  stories: SodiaStory[];
  challenges: PRChallenge[];
  toggleLikePost: (postId: string) => void;
  createPost: (content: string, mediaUrl: string, facilityTag?: any, stamp?: VerifiedStamp) => void;
  acceptChallenge: (challengeId: string) => void;
  submitChallengeEntry: (challengeId: string, value: number, proofVideo?: string) => { success: boolean; underReview?: boolean; message: string };

  // Track Engines
  activeLiftWorkout: {
    title: string;
    durationSeconds: number;
    isActive: boolean;
    exercises: ActiveExercise[];
  };
  startLiftWorkout: (title?: string) => void;
  toggleLiftSet: (exerciseIndex: number, setIndex: number) => void;
  addLiftSet: (exerciseIndex: number) => void;
  addLiftExercise: (exerciseName: string, targetMuscle: string) => void;
  finishLiftWorkout: () => VerifiedStamp;
  discardLiftWorkout: () => void;
  
  // Rest Timer
  restTimer: {
    secondsRemaining: number;
    isActive: boolean;
  };
  adjustRestTimer: (deltaSeconds: number) => void;
  skipRestTimer: () => void;

  // Move Tracker
  activeMoveSession: {
    type: string;
    isActive: boolean;
    isPaused: boolean;
    duration: number;
    distanceKm: number;
    currentPace: string;
    isCourtMode: boolean;
    opponentUsername?: string;
  };
  startMoveSession: (type: string, courtMode?: boolean) => void;
  pauseMoveSession: () => void;
  resumeMoveSession: () => void;
  finishMoveSession: (matchResult?: 'win' | 'loss', score?: string, opponent?: string) => VerifiedStamp;

  // Food Tracker
  foodLogs: FoodLogItem[];
  hydrationLiters: number;
  addHydration: (liters: number) => void;
  logFoodItem: (item: Omit<FoodLogItem, 'id' | 'timestamp'>) => void;
  parseNutritionixQuery: (query: string) => Array<{ name: string; cal: number; p: number; c: number; f: number }>;

  // GymDash Tablet State
  isStaffClockedIn: boolean;
  staffSelfieUrl: string | null;
  clockInStaffWithSelfie: () => void;
  isRegisterFloatUnlocked: boolean;
  registerFloatAmount: number;
  unlockRegisterWithFloat: (pin: string, amount: number) => boolean;
  liveInsideCount: number;
  scannedHistory: Array<{
    id: string;
    name: string;
    avatar: string;
    status: 'cleared' | 'denied' | 'coach_dual_auth';
    reason?: string;
    timestamp: string;
  }>;
  simulateGateScan: (userType: 'valid' | 'expired' | 'coach_client' | 'squatter') => void;
  overrideDeniedScan: (scanId: string, managerPin: string) => boolean;
  
  // Quickdash POS Cart
  posCart: Array<{ id: string; name: string; price: number; type: 'access' | 'store' }>;
  addToPosCart: (item: { id: string; name: string; price: number; type: 'access' | 'store' }) => void;
  removeFromPosCart: (id: string) => void;
  clearPosCart: () => void;
  tenderPosCart: (method: 'cash' | 'external_terminal' | 'app', buyerType: string) => { success: boolean; message: string; claimQr?: string };

  // Clubdash & Organizer Pro
  bracketMatches: BracketMatch[];
  recordMatchScore: (matchId: string, scoreA: number, scoreB: number) => void;
  createTournamentEvent: (sport: string, format: string, venue: string, price: number) => void;

  // CoachDash State
  coachClients: CoachClient[];
  triggerClientNudge: (clientId: string) => void;
  injectMacrocycleProgram: (clientId: string, programName: string) => void;

  // Notification Toast
  toastMessage: string | null;
  showToast: (msg: string) => void;

  // Master Testbench Runner
  runMasterFlowchartDeepDive: (diveNumber: number) => void;
}

const EcosystemContext = createContext<EcosystemContextType | null>(null);

export const EcosystemProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Navigation
  const [portal, setPortal] = useState<EcosystemPortal>('sodia');
  const [sodiaTab, setSodiaTab] = useState<'sodia' | 'discover' | 'cards' | 'track' | 'profile'>('sodia');
  const [postAsRole, setPostAsRole] = useState<'individual' | 'facility' | 'coach'>('individual');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => (prev === msg ? null : prev));
    }, 4000);
  };

  // User Profile with Absolute Truth persistence
  const [currentUser, setCurrentUser] = useState<UserProfile>(() =>
    loadPersistentItem<UserProfile>('user_profile', {
      id: 'usr_adam_01',
      name: 'Adam Arête',
      username: 'adamarete',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
      bio: 'Strength & Conditioning athlete. Manila. Road to 250kg deadlift. 🏋️‍♂️',
      dob: '1998-04-12',
      homeLocation: 'BGC, Taguig City, Philippines',
      roles: ['individual', 'staff', 'coach', 'organizer', 'facility_owner'],
      currentRole: 'individual',
      isPrivate: false,
      streakWeeks: 5,
      streakGoal: 3,
      streakFreezeAvailable: true,
      activeRoster: [
        {
          id: 'rost_1',
          facilityId: 'fac_twins',
          name: 'Twins Fitness BGC',
          badge: 'Monthly Pro',
          type: 'sub',
          validUntil: 'Nov 30, 2026'
        },
        {
          id: 'rost_2',
          facilityId: 'fac_metro_arena',
          name: 'Metro Sports Arena',
          badge: 'Court Club Tier 0',
          type: 'club',
          validUntil: 'Dec 31, 2026'
        }
      ],
      weights: {
        weightlifting: 1.6,
        running: 1.2,
        pickleball: 1.4,
        general: 1.0
      },
      metrics: {
        followers: 842,
        following: 310,
        activeChallenges: 2
      }
    })
  );

  useEffect(() => {
    savePersistentItem('user_profile', currentUser);
  }, [currentUser]);

  const switchRole = (newRole: UserRole) => {
    setCurrentUser(prev => ({ ...prev, currentRole: newRole }));
    if (newRole === 'staff' || newRole === 'facility_owner') {
      setPortal('gymdash-tablet');
    } else if (newRole === 'coach') {
      setPortal('coachdash');
    } else if (newRole === 'organizer') {
      setPortal('clubdash');
    } else {
      setPortal('sodia');
    }
    showToast(`Switched active profile context to ${newRole.toUpperCase()}`);
  };

  // Facilities Database (Registry A & B)
  const [facilities, setFacilities] = useState<Facility[]>([
    {
      id: 'fac_twins',
      name: 'Twins Fitness BGC',
      registry: 'A',
      category: 'Commercial Gym & Powerlifting',
      logo: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=150&q=80',
      coverImage: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=900&q=80',
      address: '26th Street, Bonifacio Global City, Taguig',
      distance: '0.8 km',
      coords: { lat: 14.549, lng: 121.050 },
      liveCapacity: { current: 42, max: 100 },
      isOpen: true,
      hours: '05:00 AM - 11:00 PM',
      amenities: ['Eleiko Plates', 'Sauna', 'Cold Plunge', 'Chalk Allowed', 'Recovery Lounge'],
      dayPassPrice: 250,
      monthlySubPrice: 1500,
      rating: 4.9,
      reviewCount: 388,
      hasActiveChallenge: true,
      challengeTitle: 'Heaviest Deadlift in Makati & BGC',
      friendsCheckedIn: ['John Doe', 'Sarah Lin', 'Coach Marcus']
    },
    {
      id: 'fac_metro_arena',
      name: 'Metro Sports Arena',
      registry: 'B',
      category: 'Pickleball, Basketball & Multi-Court',
      logo: 'https://images.unsplash.com/photo-1519766304817-4f37bda74a29?auto=format&fit=crop&w=150&q=80',
      coverImage: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=900&q=80',
      address: 'Pasig Boulevard, Metro Manila',
      distance: '2.1 km',
      coords: { lat: 14.565, lng: 121.068 },
      liveCapacity: { current: 18, max: 60 },
      isOpen: true,
      hours: '06:00 AM - Midnight',
      amenities: ['Hardwood Courts', 'Pro Pickleball Nets', 'Shower Rooms', 'Floodlights'],
      dayPassPrice: 180,
      courtHourlyPrice: 200,
      rating: 4.8,
      reviewCount: 219,
      hasActiveChallenge: false,
      friendsCheckedIn: ['Alex R.', 'Miguel K.'],
      spatialAssets: {
        parentId: 'court_bb_1',
        parentName: 'Full Gymnasium Main Court 1 (Basketball)',
        isParentLocked: false,
        bufferMinutes: 15,
        children: [
          { id: 'sub_pickle_a', name: 'Pickleball Court A', isLocked: false },
          { id: 'sub_pickle_b', name: 'Pickleball Court B', isLocked: false },
          { id: 'sub_pickle_c', name: 'Pickleball Court C', isLocked: false }
        ]
      }
    },
    {
      id: 'fac_iron_vault',
      name: 'Iron Vault Athletic Club',
      registry: 'A',
      category: 'Olympic Weightlifting & CrossFit',
      logo: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=150&q=80',
      coverImage: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=900&q=80',
      address: 'Poblacion, Makati City',
      distance: '3.4 km',
      coords: { lat: 14.562, lng: 121.031 },
      liveCapacity: { current: 28, max: 50 },
      isOpen: true,
      hours: '06:00 AM - 10:00 PM',
      amenities: ['Lifting Platforms', 'Rogue Racks', 'Calibrated KG Plates'],
      dayPassPrice: 300,
      monthlySubPrice: 1800,
      rating: 4.9,
      reviewCount: 145
    }
  ]);

  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(facilities[0]);

  // Passes & Wallet with Absolute Truth persistence
  const [passes, setPasses] = useState<VIPCardPass[]>(() =>
    loadPersistentItem<VIPCardPass[]>('passes', [
      {
        id: 'pass_twins_vip_01',
        facilityId: 'fac_twins',
        facilityName: 'Twins Fitness BGC',
        facilityLogo: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=150&q=80',
        facilityRegistry: 'A',
        passType: 'Monthly Pro',
        validUntil: 'Nov 30, 2026',
        status: 'active',
        memberId: 'M-882109',
        memberName: 'Darelle Navarette',
        dynamicHash: 'GP-TWIN-87a912f-AUTH',
        offlineTotp: '482-911',
        qrExpiresInSeconds: 60
      },
      {
        id: 'pass_metro_court_02',
        facilityId: 'fac_metro_arena',
        facilityName: 'Metro Sports Arena',
        facilityLogo: 'https://images.unsplash.com/photo-1519766304817-4f37bda74a29?auto=format&fit=crop&w=150&q=80',
        facilityRegistry: 'B',
        passType: 'Court Booking',
        validUntil: 'Today • 04:00 PM',
        status: 'active',
        memberId: 'CRT-5510',
        memberName: 'Darelle Navarette',
        dynamicHash: 'GP-METRO-41c09e-AUTH',
        offlineTotp: '739-204',
        qrExpiresInSeconds: 60,
        courtDetails: {
          courtName: 'Pickleball Court A',
          slot: '04:00 PM - 05:00 PM',
          players: 4
        }
      }
    ])
  );

  useEffect(() => {
    savePersistentItem('passes', passes);
  }, [passes]);

  const [activePassIndex, setActivePassIndex] = useState(0);
  const [isQRFlapped, setIsQRFlapped] = useState(false);
  const [qrCountdown, setQrCountdown] = useState(60);

  // 60-second ticking dynamic hash QR countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setQrCountdown(prev => {
        if (prev <= 1) {
          // Regenerate hash
          const newRandomHash = 'GP-' + Math.random().toString(36).substring(2, 9).toUpperCase();
          const newTotp = Math.floor(100000 + Math.random() * 900000).toString().replace(/(\d{3})(\d{3})/, '$1-$2');
          setPasses(oldPasses =>
            oldPasses.map(p => ({
              ...p,
              dynamicHash: newRandomHash,
              offlineTotp: newTotp
            }))
          );
          return 60;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Universal Checkout State
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutItem, setCheckoutItem] = useState<{
    facility: Facility;
    itemType: 'Day Pass' | 'Monthly Pro' | 'Court Booking';
    price: number;
    extraDetails?: string;
  } | null>(null);

  const openCheckout = (facility: Facility, itemType: 'Day Pass' | 'Monthly Pro' | 'Court Booking', price: number, extra?: string) => {
    setCheckoutItem({
      facility,
      itemType,
      price,
      extraDetails: extra
    });
    setIsCheckoutOpen(true);
  };

  const closeCheckout = () => {
    setIsCheckoutOpen(false);
    setCheckoutItem(null);
  };

  // Append-only Ledger Transactions with Absolute Truth persistence
  const [ledger, setLedger] = useState<LedgerTransaction[]>(() =>
    loadPersistentItem<LedgerTransaction[]>('ledger', [
      {
        id: 'tx_sprout_01',
        action: 'Check-in: Today, 01:32PM',
        facilityName: 'Sprout Pickleball Club',
        timestamp: 'Today, 01:32PM',
        amount: 0,
        serviceFee: 0,
        status: 'completed',
        type: 'access',
        paymentMethod: 'Pass Tier Active',
        referenceNo: 'PHP 999'
      },
      {
        id: 'tx_amp_02',
        action: 'Membership: Yesterday, 11:01AM',
        facilityName: 'AMP FITNESS SJDM',
        timestamp: 'Yesterday, 11:01AM',
        amount: 799,
        serviceFee: 15,
        status: 'completed',
        type: 'payment',
        paymentMethod: 'Monthly Membership',
        referenceNo: 'PHP 799'
      },
      {
        id: 'tx_gp_plus_03',
        action: 'Subscription: Yesterday, 06:48AM',
        facilityName: 'GetPhysical+',
        timestamp: 'Yesterday, 06:48AM',
        amount: 149,
        serviceFee: 10,
        status: 'completed',
        type: 'payment',
        paymentMethod: 'Monthly Subscription',
        referenceNo: 'PHP 149'
      }
    ])
  );

  useEffect(() => {
    savePersistentItem('ledger', ledger);
  }, [ledger]);

  const addLedgerEntry = (entry: Omit<LedgerTransaction, 'id' | 'timestamp' | 'referenceNo'>) => {
    const newTx: LedgerTransaction = {
      ...entry,
      id: 'tx_' + Date.now().toString(),
      timestamp: 'Just now',
      referenceNo: 'XND-' + Math.floor(10000 + Math.random() * 90000) + '-PH'
    };
    setLedger(prev => [newTx, ...prev]);

    // Persist to Supabase Financial Ledger
    dbService.recordLedgerTransaction({
      reference_no: newTx.referenceNo,
      type: newTx.type === 'access' ? 'day_pass' : newTx.type === 'refund' ? 'refund' : 'monthly_sub',
      amount: newTx.amount,
      description: newTx.action,
      facility_name: newTx.facilityName,
      method: (newTx.paymentMethod || 'card').toLowerCase().includes('cash') ? 'cash' : 'card',
      status: newTx.status === 'refunded' ? 'refunded' : 'settled',
      metadata: { serviceFee: newTx.serviceFee, splitDetails: newTx.splitDetails }
    }).catch(err => console.warn('[Supabase Ledger Sync Error]:', err));
  };

  const voidOrRefundTransaction = (txId: string, managerPin: string): boolean => {
    if (managerPin !== '1234') {
      showToast('Manager PIN incorrect (use 1234)');
      return false;
    }
    const target = ledger.find(t => t.id === txId);
    if (!target) return false;

    // Append-Only Law: Transactions are NEVER deleted. A reversing entry is appended!
    const reversalTx: LedgerTransaction = {
      id: 'tx_rev_' + Date.now(),
      action: `REVERSAL / REFUND • ${target.facilityName}`,
      facilityName: target.facilityName,
      timestamp: 'Just now (Manager Override)',
      amount: -Math.abs(target.amount),
      serviceFee: -Math.abs(target.serviceFee),
      status: 'refunded',
      type: 'refund',
      paymentMethod: target.paymentMethod,
      referenceNo: 'REV-' + target.referenceNo,
      isReversal: true
    };

    setLedger(prev => [reversalTx, ...prev]);
    showToast(`Appended reversing refund ledger row for ${target.action}`);
    return true;
  };

  // Process payment from Universal Checkout
  const processCheckoutPayment = (asGift = false, recipientName?: string) => {
    if (!checkoutItem) return;
    const { facility, itemType, price, extraDetails } = checkoutItem;
    // Hybrid Fee Calculation (Appendix E)
    // One-time passes: fixed ₱15; recurring subs: flat 5%
    const serviceFee = itemType === 'Monthly Pro' ? Math.round(price * 0.05) : 15;
    const totalAmount = price + serviceFee;

    // Append to immutable ledger
    addLedgerEntry({
      action: `${asGift ? 'Gift to ' + (recipientName || 'Friend') : itemType} • ${facility.name}`,
      facilityName: facility.name,
      amount: totalAmount,
      serviceFee,
      status: 'completed',
      type: 'payment',
      paymentMethod: 'Xendit xenPlatform (Maya / GCash)',
      splitDetails: {
        facilityPayout: price,
        platformCut: serviceFee
      }
    });

    if (asGift) {
      showToast(`🎁 Gift Pass successfully purchased and delivered to ${recipientName || 'friend'}!`);
      closeCheckout();
      return;
    }

    // Inject Pass into Cards Hub
    const newPass: VIPCardPass = {
      id: 'pass_' + Date.now(),
      facilityId: facility.id,
      facilityName: facility.name,
      facilityLogo: facility.logo,
      facilityRegistry: facility.registry,
      passType: itemType,
      validUntil: itemType === 'Day Pass' ? 'Today • 11:59 PM' : '30 Days Active',
      status: 'active',
      memberId: 'M-' + Math.floor(100000 + Math.random() * 900000),
      memberName: currentUser.name,
      dynamicHash: 'GP-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
      offlineTotp: Math.floor(100000 + Math.random() * 900000).toString().replace(/(\d{3})(\d{3})/, '$1-$2'),
      qrExpiresInSeconds: 60,
      courtDetails: itemType === 'Court Booking' ? {
        courtName: extraDetails || 'Court A',
        slot: 'Reserved 1 Hour',
        players: 4
      } : undefined
    };

    setPasses(prev => [newPass, ...prev]);
    setActivePassIndex(0);
    closeCheckout();
    showToast(`You're in! ${itemType} active in your VIP Cards wallet.`);
  };

  const sendPassToFriend = (passId: string, friendUsername: string): boolean => {
    const pass = passes.find(p => p.id === passId);
    if (!pass) return false;

    // Ledger entries for both sender and recipient
    addLedgerEntry({
      action: `Gift Sent (${pass.passType}) ➔ @${friendUsername}`,
      facilityName: pass.facilityName,
      amount: 0,
      serviceFee: 0,
      status: 'completed',
      type: 'payment',
      paymentMethod: 'Pass Transfer'
    });

    // Remove from user stack (transfers owner_id in DB)
    setPasses(prev => prev.filter(p => p.id !== passId));
    setActivePassIndex(0);
    showToast(`Pass transferred to @${friendUsername}. Removed from your active stack.`);
    return true;
  };

  // Spatial Sub-Division & Court Booking
  const bookCourtSlot = (facilityId: string, courtName: string, slot: string) => {
    setFacilities(prev =>
      prev.map(fac => {
        if (fac.id === facilityId && fac.spatialAssets) {
          // If booking a sub-pickleball court, parent basketball court is locked!
          const updatedChildren = fac.spatialAssets.children.map(ch =>
            ch.name === courtName ? { ...ch, isLocked: true, currentBooking: slot } : ch
          );
          return {
            ...fac,
            spatialAssets: {
              ...fac.spatialAssets,
              isParentLocked: true,
              lockedReason: `Reserved: ${courtName} active (${slot}) + 15m buffer`,
              children: updatedChildren
            }
          };
        }
        return fac;
      })
    );
    showToast(`Reserved ${courtName}! Parent Gymnasium locked with 15m changeover buffer.`);
  };

  // Sodia Social Feed & Stories
  const [stories, setStories] = useState<SodiaStory[]>([
    {
      id: 'story_mine',
      authorId: 'usr_darelle_01',
      authorName: 'Your Story',
      authorAvatar: currentUser.avatar,
      hasUnseen: false,
      expiresInHours: 24,
      mediaUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80',
      locationTag: {
        facilityId: 'fac_twins',
        name: 'Twins Fitness BGC',
        actionCTA: 'Drop In'
      }
    },
    {
      id: 'story_sarah',
      authorId: 'usr_sarah',
      authorName: 'Sarah Lin',
      authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=250&q=80',
      hasUnseen: true,
      expiresInHours: 19,
      mediaUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=80',
      locationTag: {
        facilityId: 'fac_twins',
        name: 'Twins Fitness BGC',
        actionCTA: 'Drop In'
      },
      stamp: {
        id: 'stmp_1',
        type: 'lift',
        timestamp: 'Today 06:45 AM',
        title: 'VERIFIED PR',
        primaryMetric: '140 KG x 5',
        subMetrics: ['RPE 9.0', 'Volume: 4,200 kg'],
        isVerified: true,
        isPR: true,
        facilityName: 'Twins Fitness BGC'
      }
    },
    {
      id: 'story_marcus',
      authorId: 'usr_marcus',
      authorName: 'Coach Marcus',
      authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
      hasUnseen: true,
      expiresInHours: 12,
      mediaUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=600&q=80',
      locationTag: {
        facilityId: 'fac_metro_arena',
        name: 'Metro Sports Arena',
        actionCTA: 'Book Court'
      }
    }
  ]);

  const [posts, setPosts] = useState<SodiaPost[]>([
    {
      id: 'post_moe_01',
      authorId: 'usr_moe_01',
      authorName: 'Moe Tuscano',
      authorUsername: 'mowtuscano',
      authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
      authorType: 'individual',
      facilityTag: {
        id: 'fac_twins',
        name: 'Twins Fitness BGC',
        registry: 'A',
        actionCTA: 'Drop In (₱250)',
        price: 250
      },
      content: 'Ending the day with some glute sessions.',
      mediaUrl: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=1200&q=80',
      mediaType: 'image',
      stamp: {
        id: 'stmp_moe_01',
        type: 'lift',
        timestamp: 'Today • 08:30 PM',
        title: 'GLUTE HYPERTROPHY',
        primaryMetric: '120 KG HIP THRUST',
        subMetrics: ['4 Sets x 12 Reps', 'RPE 8.5'],
        isVerified: true,
        isPR: false,
        facilityName: 'Twins Fitness BGC'
      },
      likes: 1420,
      hasLiked: false,
      commentsCount: 88,
      repostsCount: 34,
      createdAt: '1h ago',
      comments: [
        {
          id: 'c_moe_1',
          author: 'adam_arete',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
          text: 'Form looking locked in! 🔥',
          time: '32m ago'
        }
      ]
    },
    {
      id: 'post_1',
      authorId: 'usr_sarah',
      authorName: 'Sarah Lin',
      authorUsername: 'sarah_lifts',
      authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=250&q=80',
      authorType: 'individual',
      facilityTag: {
        id: 'fac_twins',
        name: 'Twins Fitness BGC',
        registry: 'A',
        actionCTA: 'Drop In (₱250)',
        price: 250
      },
      content: 'Early 6 AM deadlift wave at Twins. Hit a clean 140kg x 5 lockout feeling fast! Big thanks to the morning crew. 🔥',
      mediaUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
      mediaType: 'image',
      stamp: {
        id: 'stmp_sarah_1',
        type: 'lift',
        timestamp: 'Oct 28 • 06:45 AM',
        title: 'VERIFIED PR',
        primaryMetric: '140 KG x 5',
        subMetrics: ['Estimated 1RM: 162.5 KG', 'Eleiko Calibrated Bar'],
        isVerified: true,
        isPR: true,
        facilityName: 'Twins Fitness BGC'
      },
      likes: 68,
      hasLiked: false,
      commentsCount: 12,
      repostsCount: 4,
      createdAt: '2 hours ago',
      comments: [
        {
          id: 'c1',
          author: 'coach_marcus',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
          text: 'Bar speed was immaculate! Great hip drive.',
          time: '1h ago',
          isPinned: true
        }
      ]
    },
    {
      id: 'post_wre_discovery',
      authorId: 'fac_twins',
      authorName: 'Twins Fitness BGC',
      authorUsername: 'twinsfitness',
      authorAvatar: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=150&q=80',
      authorType: 'facility',
      isDiscoveryCard: true,
      discoveryTag: 'Suggested based on your 3 heavy lift sessions this week',
      facilityTag: {
        id: 'fac_twins',
        name: 'Twins Fitness BGC',
        registry: 'A',
        actionCTA: 'Get Pass (₱250)',
        price: 250
      },
      content: '🔥 Dead-Hour Flash Pass: Today 11:00 AM - 02:00 PM. Drop in for only ₱250 with full platform and recovery zone access. 3 of your friends are currently checked in!',
      mediaUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80',
      mediaType: 'image',
      likes: 124,
      commentsCount: 18,
      repostsCount: 15,
      createdAt: 'Sponsored / WRE Match'
    },
    {
      id: 'post_2',
      authorId: 'usr_darelle_01',
      authorName: 'Darelle Navarette',
      authorUsername: 'darelle',
      authorAvatar: currentUser.avatar,
      authorType: 'individual',
      facilityTag: {
        id: 'fac_metro_arena',
        name: 'Metro Sports Arena',
        registry: 'B',
        actionCTA: 'Book Court (₱200/hr)',
        price: 200
      },
      content: 'Fast 11-8 match against @alex_r on Court A! The court grip here is unmatched. Ready for the weekend 3v3 bracket!',
      mediaUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=800&q=80',
      mediaType: 'image',
      stamp: {
        id: 'stmp_court_win',
        type: 'move',
        timestamp: 'Oct 27 • 05:15 PM',
        title: 'RIVALRY VERIFIED',
        primaryMetric: 'WIN: 11 - 8',
        subMetrics: ['Pickleball Singles', 'Vs @alex_r (Confirmed)'],
        isVerified: true,
        facilityName: 'Metro Sports Arena'
      },
      likes: 45,
      hasLiked: true,
      commentsCount: 7,
      repostsCount: 2,
      createdAt: '1 day ago'
    }
  ]);

  const toggleLikePost = (postId: string) => {
    setPosts(prev =>
      prev.map(p => {
        if (p.id === postId) {
          const nextLiked = !p.hasLiked;
          return {
            ...p,
            hasLiked: nextLiked,
            likes: nextLiked ? p.likes + 1 : p.likes - 1
          };
        }
        return p;
      })
    );
  };

  const createPost = (content: string, mediaUrl: string, facilityTag?: any, stamp?: VerifiedStamp) => {
    const authorType = postAsRole;
    const authorName = authorType === 'facility' ? 'Twins Fitness BGC' : authorType === 'coach' ? 'Coach Darelle' : currentUser.name;
    const authorAvatar = authorType === 'facility' ? facilities[0].logo : currentUser.avatar;

    const newPost: SodiaPost = {
      id: 'post_' + Date.now(),
      authorId: currentUser.id,
      authorName,
      authorUsername: currentUser.username,
      authorAvatar,
      authorType,
      facilityTag: facilityTag || {
        id: 'fac_twins',
        name: 'Twins Fitness BGC',
        registry: 'A',
        actionCTA: 'Drop In (₱250)',
        price: 250
      },
      content,
      mediaUrl: mediaUrl || 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
      mediaType: 'image',
      stamp,
      likes: 1,
      hasLiked: true,
      commentsCount: 0,
      repostsCount: 0,
      createdAt: 'Just now'
    };

    setPosts(prev => [newPost, ...prev]);
    showToast('Post published to Sodia feed!');

    // Persist to Supabase Cloud
    dbService.createPost({
      author_name: authorName,
      author_avatar: authorAvatar,
      author_role: authorType,
      content,
      media_url: newPost.mediaUrl,
      facility_tag: newPost.facilityTag,
      stamp: newPost.stamp
    }).catch(err => console.warn('[Supabase Post Sync Error]:', err));
  };

  // PR Challenges
  const [challenges, setChallenges] = useState<PRChallenge[]>([
    {
      id: 'chal_deadlift_01',
      title: 'Heaviest Deadlift in Makati & BGC',
      type: 'lift',
      metric: 'Max 1RM Deadlift (KG)',
      creatorName: 'Twins Fitness BGC',
      facilityName: 'Twins Fitness BGC',
      isLocationLocked: true,
      participantsCount: 38,
      endsIn: '3 days left',
      isAccepted: true,
      myEntry: {
        score: '225 KG',
        rank: 3,
        isUnderReview: false
      },
      leaderboard: [
        { rank: 1, username: 'marcus_power', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80', score: '260 KG', verified: true },
        { rank: 2, username: 'juan_iron', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80', score: '240 KG', verified: true },
        { rank: 3, username: 'darelle', avatar: currentUser.avatar, score: '225 KG', verified: true }
      ]
    },
    {
      id: 'chal_5k_speed',
      title: 'BGC High Street 5K Dash',
      type: 'move',
      metric: 'Fastest 5K Time (Minutes)',
      creatorName: 'Manila Striders Club',
      isLocationLocked: false,
      participantsCount: 112,
      endsIn: '5 days left',
      isAccepted: false,
      leaderboard: [
        { rank: 1, username: 'ken_runner', avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=250&q=80', score: '18:42 min', verified: true },
        { rank: 2, username: 'patricia_m', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80', score: '19:15 min', verified: true }
      ]
    }
  ]);

  const acceptChallenge = (challengeId: string) => {
    setChallenges(prev =>
      prev.map(c => (c.id === challengeId ? { ...c, isAccepted: true, participantsCount: c.participantsCount + 1 } : c))
    );
    setCurrentUser(u => ({
      ...u,
      metrics: { ...u.metrics, activeChallenges: u.metrics.activeChallenges + 1 }
    }));
    showToast('Challenge accepted! Bounty injected into Lift/Move Tracker.');
  };

  // Submit Challenge Entry with Anti-Cheat Threshold (>15% jump check)
  const submitChallengeEntry = (challengeId: string, value: number, proofVideo?: string) => {
    const targetChallenge = challenges.find(c => c.id === challengeId);
    if (!targetChallenge) return { success: false, message: 'Challenge not found' };

    // Anti-Cheat Logic: If lift jumps > 15% from historical 1RM (e.g. historical = 225kg, max allowed jump = 258kg)
    const historicalBest = 225;
    const percentJump = ((value - historicalBest) / historicalBest) * 100;
    const isSuspicious = percentJump > 15;

    const entryScore = `${value} KG`;
    const newEntry = {
      rank: isSuspicious ? targetChallenge.leaderboard.length + 1 : 1,
      username: currentUser.username,
      avatar: currentUser.avatar,
      score: entryScore,
      verified: !isSuspicious,
      isUnderReview: isSuspicious
    };

    setChallenges(prev =>
      prev.map(c => {
        if (c.id === challengeId) {
          // Rule: Duplicate entries replace user's previous attempt to keep leaderboard clean
          const filteredLb = c.leaderboard.filter(item => item.username !== currentUser.username);
          const updatedLb = isSuspicious ? [...filteredLb, newEntry] : [newEntry, ...filteredLb];
          return {
            ...c,
            myEntry: {
              score: entryScore,
              rank: 1,
              isUnderReview: isSuspicious
            },
            leaderboard: updatedLb
          };
        }
        return c;
      })
    );

    if (isSuspicious) {
      showToast(`⚠️ PR jump of ${percentJump.toFixed(1)}% exceeds 15% threshold! Flagged as [Under Review] by admin.`);
      return { success: true, underReview: true, message: 'Entry flagged for admin video review due to >15% jump.' };
    }

    showToast(`🎉 Verified PR logged: ${entryScore}! Pinned to top of leaderboard.`);
    return { success: true, underReview: false, message: 'Verified entry posted!' };
  };

  // Lift Active Workout Engine
  const [activeLiftWorkout, setActiveLiftWorkout] = useState<{
    title: string;
    durationSeconds: number;
    isActive: boolean;
    exercises: ActiveExercise[];
  }>({
    title: 'Heavy Lower Body & Deadlift Wave',
    durationSeconds: 0,
    isActive: false,
    exercises: [
      {
        id: 'ex_1',
        name: 'Barbell Deadlift (Conventional)',
        targetMuscle: 'Hamstrings & Back',
        sets: [
          { setNumber: 1, type: 'warmup', prevWeight: 140, prevReps: 10, weight: 140, reps: 10, isCompleted: true },
          { setNumber: 2, type: 'working', prevWeight: 180, prevReps: 6, weight: 180, reps: 6, isCompleted: true },
          { setNumber: 3, type: 'working', prevWeight: 220, prevReps: 4, weight: 225, reps: 4, isCompleted: true, isPR: true },
          { setNumber: 4, type: 'failure', prevWeight: 230, prevReps: 1, weight: 235, reps: 1, isCompleted: false }
        ]
      },
      {
        id: 'ex_2',
        name: 'Barbell Back Squat',
        targetMuscle: 'Quadriceps & Glutes',
        sets: [
          { setNumber: 1, type: 'warmup', prevWeight: 100, prevReps: 8, weight: 100, reps: 8, isCompleted: false },
          { setNumber: 2, type: 'working', prevWeight: 140, prevReps: 6, weight: 140, reps: 6, isCompleted: false }
        ]
      }
    ]
  });

  // Rest Timer
  const [restTimer, setRestTimer] = useState({
    secondsRemaining: 0,
    isActive: false
  });

  useEffect(() => {
    if (!restTimer.isActive || restTimer.secondsRemaining <= 0) return;
    const interval = setInterval(() => {
      setRestTimer(prev => {
        if (prev.secondsRemaining <= 1) {
          showToast('🔔 Rest timer complete! Ready for next set.');
          return { secondsRemaining: 0, isActive: false };
        }
        return { ...prev, secondsRemaining: prev.secondsRemaining - 1 };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [restTimer.isActive, restTimer.secondsRemaining]);

  const adjustRestTimer = (delta: number) => {
    setRestTimer(prev => ({
      ...prev,
      secondsRemaining: Math.max(0, prev.secondsRemaining + delta),
      isActive: true
    }));
  };

  const skipRestTimer = () => {
    setRestTimer({ secondsRemaining: 0, isActive: false });
  };

  const startLiftWorkout = (title?: string) => {
    setActiveLiftWorkout(prev => ({
      ...prev,
      title: title || 'Quick Start Workout',
      durationSeconds: 0,
      isActive: true
    }));
    showToast('Active Lift Workout started! Timer running.');
  };

  const toggleLiftSet = (exerciseIndex: number, setIndex: number) => {
    setActiveLiftWorkout(prev => {
      const updatedExercises = [...prev.exercises];
      const targetSet = updatedExercises[exerciseIndex].sets[setIndex];
      const nextStatus = !targetSet.isCompleted;
      targetSet.isCompleted = nextStatus;

      // When set completed, start 90s floating rest timer!
      if (nextStatus) {
        setRestTimer({ secondsRemaining: 90, isActive: true });
        showToast('Set checked! 90s Rest Timer running.');
      }
      return { ...prev, exercises: updatedExercises };
    });
  };

  const addLiftSet = (exerciseIndex: number) => {
    setActiveLiftWorkout(prev => {
      const updatedExercises = [...prev.exercises];
      const ex = updatedExercises[exerciseIndex];
      const lastSet = ex.sets[ex.sets.length - 1];
      ex.sets.push({
        setNumber: ex.sets.length + 1,
        type: 'working',
        prevWeight: lastSet ? lastSet.weight : 100,
        prevReps: lastSet ? lastSet.reps : 5,
        weight: lastSet ? lastSet.weight : 100,
        reps: lastSet ? lastSet.reps : 5,
        isCompleted: false
      });
      return { ...prev, exercises: updatedExercises };
    });
  };

  const addLiftExercise = (exerciseName: string, targetMuscle: string) => {
    setActiveLiftWorkout(prev => ({
      ...prev,
      exercises: [
        ...prev.exercises,
        {
          id: 'ex_' + Date.now(),
          name: exerciseName,
          targetMuscle,
          sets: [
            { setNumber: 1, type: 'warmup', prevWeight: 60, prevReps: 10, weight: 60, reps: 10, isCompleted: false },
            { setNumber: 2, type: 'working', prevWeight: 80, prevReps: 8, weight: 80, reps: 8, isCompleted: false }
          ]
        }
      ]
    }));
    showToast(`Added ${exerciseName} to workout.`);
  };

  const finishLiftWorkout = (): VerifiedStamp => {
    const stamp: VerifiedStamp = {
      id: 'stmp_lift_' + Date.now(),
      type: 'lift',
      timestamp: 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      title: 'VERIFIED LIFT SESSION',
      primaryMetric: '235 KG Deadlift • 4 Sets',
      subMetrics: ['Total Volume: 8,420 KG', 'PR Hit on Set #3', 'Twins Fitness BGC'],
      isVerified: true,
      isPR: true,
      facilityName: 'Twins Fitness BGC'
    };

    setActiveLiftWorkout(prev => ({ ...prev, isActive: false }));
    showToast('🏆 Workout Completed! Verified Lift Stamp generated.');
    return stamp;
  };

  const discardLiftWorkout = () => {
    setActiveLiftWorkout(prev => ({ ...prev, isActive: false }));
    showToast('Workout discarded.');
  };

  // Move Tracker Engine
  const [activeMoveSession, setActiveMoveSession] = useState<{
    type: string;
    isActive: boolean;
    isPaused: boolean;
    duration: number;
    distanceKm: number;
    currentPace: string;
    isCourtMode: boolean;
    opponentUsername?: string;
  }>({
    type: 'Outdoor Run',
    isActive: false,
    isPaused: false,
    duration: 0,
    distanceKm: 0,
    currentPace: '5:12 /km',
    isCourtMode: false
  });

  const startMoveSession = (type: string, courtMode = false) => {
    setActiveMoveSession({
      type,
      isActive: true,
      isPaused: false,
      duration: 0,
      distanceKm: 0,
      currentPace: courtMode ? 'N/A (Court HR)' : '5:15 /km',
      isCourtMode: courtMode
    });
    showToast(`${type} started! ${courtMode ? 'Heart Rate pulsing.' : 'Live GPS tracking trail.'}`);
  };

  const pauseMoveSession = () => {
    setActiveMoveSession(prev => ({ ...prev, isPaused: true }));
  };

  const resumeMoveSession = () => {
    setActiveMoveSession(prev => ({ ...prev, isPaused: false }));
  };

  const finishMoveSession = (matchResult?: 'win' | 'loss', score?: string, opponent?: string): VerifiedStamp => {
    const stamp: VerifiedStamp = {
      id: 'stmp_move_' + Date.now(),
      type: 'move',
      timestamp: 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      title: activeMoveSession.isCourtMode ? 'VERIFIED COURT MATCH' : 'VERIFIED MOVE SESSION',
      primaryMetric: activeMoveSession.isCourtMode
        ? `${matchResult?.toUpperCase() || 'MATCH'}: ${score || '11 - 8'}`
        : `${activeMoveSession.distanceKm.toFixed(2)} KM in ${Math.floor(activeMoveSession.duration / 60)}m`,
      subMetrics: activeMoveSession.isCourtMode
        ? [`Opponent: @${opponent || 'alex_r'}`, 'Metro Sports Arena', 'Z3 Heart Rate Avg 148 BPM']
        : ['Avg Pace: 5:12 /km', 'HR Zones: 65% Z3 / 25% Z4', 'Elevation: +45m'],
      isVerified: true,
      facilityName: activeMoveSession.isCourtMode ? 'Metro Sports Arena' : undefined
    };

    setActiveMoveSession(prev => ({ ...prev, isActive: false }));
    showToast('Session finished! Verified Move Stamp created.');
    return stamp;
  };

  // Food Tracker Engine with Absolute Truth persistence
  const [hydrationLiters, setHydrationLiters] = useState(() =>
    loadPersistentItem<number>('hydration_liters', 1.75)
  );

  useEffect(() => {
    savePersistentItem('hydration_liters', hydrationLiters);
  }, [hydrationLiters]);

  const [foodLogs, setFoodLogs] = useState<FoodLogItem[]>(() =>
    loadPersistentItem<FoodLogItem[]>('food_logs', [
      {
        id: 'food_1',
        name: 'Oatmeal with Whey & Peanut Butter',
        serving: '1 bowl (80g oats, 30g whey)',
        calories: 480,
        protein: 36,
        carbs: 58,
        fats: 12,
        mealType: 'breakfast',
        timestamp: '07:15 AM'
      },
      {
        id: 'food_2',
        name: 'Chicken Breast with Jasmine Rice & Broccoli',
        serving: '200g chicken, 1 cup rice',
        calories: 620,
        protein: 52,
        carbs: 65,
        fats: 8,
        mealType: 'lunch',
        timestamp: '01:00 PM'
      }
    ])
  );

  useEffect(() => {
    savePersistentItem('food_logs', foodLogs);
  }, [foodLogs]);

  const addHydration = (liters: number) => {
    setHydrationLiters(prev => Math.max(0, parseFloat((prev + liters).toFixed(2))));
    showToast(`Hydration updated: +${liters > 0 ? (liters * 1000) + 'ml' : liters}L`);
  };

  const logFoodItem = (item: Omit<FoodLogItem, 'id' | 'timestamp'>) => {
    const newItem: FoodLogItem = {
      ...item,
      id: 'food_' + Date.now(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setFoodLogs(prev => [newItem, ...prev]);
    showToast(`Logged ${item.name} (${item.calories} kcal)`);
  };

  const parseNutritionixQuery = (query: string) => {
    // Deterministic parser simulation for natural language
    const lower = query.toLowerCase();
    const items: Array<{ name: string; cal: number; p: number; c: number; f: number }> = [];

    if (lower.includes('egg')) {
      items.push({ name: '2 Hard Boiled Eggs', cal: 156, p: 13, c: 1, f: 11 });
    }
    if (lower.includes('rice')) {
      items.push({ name: '1 Cup Cooked White Rice', cal: 206, p: 4, c: 45, f: 0.4 });
    }
    if (lower.includes('chicken') || lower.includes('breast')) {
      items.push({ name: 'Grilled Chicken Breast (150g)', cal: 247, p: 46, c: 0, f: 5 });
    }
    if (lower.includes('banana') || lower.includes('shake')) {
      items.push({ name: 'Protein Fruit Smoothie', cal: 290, p: 25, c: 38, f: 3 });
    }
    if (items.length === 0) {
      items.push({ name: query, cal: 320, p: 22, c: 35, f: 9 });
    }
    return items;
  };

  // GymDash Tablet State (Registry A)
  const [isStaffClockedIn, setIsStaffClockedIn] = useState(true);
  const [staffSelfieUrl, setStaffSelfieUrl] = useState<string | null>(
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'
  );
  const [isRegisterFloatUnlocked, setIsRegisterFloatUnlocked] = useState(true);
  const [registerFloatAmount, setRegisterFloatAmount] = useState(2000);
  const [liveInsideCount, setLiveInsideCount] = useState(42);

  const clockInStaffWithSelfie = () => {
    setIsStaffClockedIn(true);
    setStaffSelfieUrl('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80');
    showToast('Staff Geofenced Mobile Selfie Clock-In verified! Shift started.');
  };

  const unlockRegisterWithFloat = (pin: string, amount: number): boolean => {
    if (pin !== '1234') {
      showToast('Invalid Staff PIN (use 1234)');
      return false;
    }
    setIsRegisterFloatUnlocked(true);
    setRegisterFloatAmount(amount);
    showToast(`Float Gate passed! ₱${amount.toLocaleString()} opening cash bound to Shift.`);
    return true;
  };

  const [scannedHistory, setScannedHistory] = useState<Array<{
    id: string;
    name: string;
    avatar: string;
    status: 'cleared' | 'denied' | 'coach_dual_auth';
    reason?: string;
    timestamp: string;
  }>>([
    {
      id: 'sc_1',
      name: 'Darelle Navarette',
      avatar: currentUser.avatar,
      status: 'cleared',
      timestamp: '06:15 AM'
    },
    {
      id: 'sc_2',
      name: 'Sarah Lin',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=250&q=80',
      status: 'cleared',
      timestamp: '06:40 AM'
    },
    {
      id: 'sc_3',
      name: 'Guest User (Pass Expired)',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80',
      status: 'denied',
      reason: 'Expired 2 days ago',
      timestamp: '07:10 AM'
    }
  ]);

  const simulateGateScan = (userType: 'valid' | 'expired' | 'coach_client' | 'squatter') => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (userType === 'valid') {
      setLiveInsideCount(c => c + 1);
      setScannedHistory(prev => [
        {
          id: 'sc_' + Date.now(),
          name: 'Miguel Torres',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80',
          status: 'cleared',
          timestamp
        },
        ...prev
      ]);
      showToast('Gate Scan: CLEARED (Active Pass). Capacity +1');
    } else if (userType === 'expired') {
      setScannedHistory(prev => [
        {
          id: 'sc_' + Date.now(),
          name: 'Carlos Mendoza',
          avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=250&q=80',
          status: 'denied',
          reason: 'Pass Expired Yesterday',
          timestamp
        },
        ...prev
      ]);
      showToast('Gate Scan: DENIED (Pass Expired). Tap Manager Override to resolve.');
    } else if (userType === 'coach_client') {
      setLiveInsideCount(c => c + 1);
      setScannedHistory(prev => [
        {
          id: 'sc_' + Date.now(),
          name: 'Patricia Wu (Coach Session)',
          avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=250&q=80',
          status: 'coach_dual_auth',
          reason: 'Coach Session Active (Floor Fee Split ₱150)',
          timestamp
        },
        ...prev
      ]);
      // Update coach client status to 'in_building'
      setCoachClients(prev =>
        prev.map(cl => (cl.name.includes('Patricia') ? { ...cl, status: 'in_building' } : cl))
      );
      showToast('Gate Scan: DUAL-AUTH CLEARED! ₱150 Floor Fee routed to Gym.');
    } else if (userType === 'squatter') {
      // 14 scans on 10-person booking
      showToast('🚨 SQUATTER DETECTION: Capacity Breach on Court 1! (14/10 users scanned)');
    }
  };

  const overrideDeniedScan = (scanId: string, managerPin: string): boolean => {
    if (managerPin !== '1234') {
      showToast('Invalid Manager PIN (use 1234)');
      return false;
    }
    setScannedHistory(prev =>
      prev.map(s => (s.id === scanId ? { ...s, status: 'cleared', reason: 'Manager Overridden (Audit Logged)' } : s))
    );
    setLiveInsideCount(c => c + 1);
    showToast('Manager Override successful! User admitted with audit log.');
    return true;
  };

  // GymDash POS Cart
  const [posCart, setPosCart] = useState<Array<{ id: string; name: string; price: number; type: 'access' | 'store' }>>([
    { id: 'sku_day_pass', name: 'Walk-in Day Pass', price: 250, type: 'access' }
  ]);

  const addToPosCart = (item: { id: string; name: string; price: number; type: 'access' | 'store' }) => {
    setPosCart(prev => [...prev, item]);
    showToast(`Added ${item.name} to POS Till.`);
  };

  const removeFromPosCart = (id: string) => {
    setPosCart(prev => prev.filter(i => i.id !== id));
  };

  const clearPosCart = () => {
    setPosCart([]);
  };

  const tenderPosCart = (method: 'cash' | 'external_terminal' | 'app', buyerType: string) => {
    const hasAccess = posCart.some(i => i.type === 'access');
    const hasStore = posCart.some(i => i.type === 'store');

    // Rule: Mixed cart tendering disables app-pay to protect ledger routing
    if (hasAccess && hasStore && method === 'app') {
      showToast('❌ Mixed Cart Conflict: Cart contains both Access & Store SKUs. Pay via App disabled. Use Cash or Card Terminal.');
      return { success: false, message: 'Pay via App is disabled for mixed carts.' };
    }

    const total = posCart.reduce((acc, curr) => acc + curr.price, 0);

    // Append to ledger
    addLedgerEntry({
      action: `POS Sale (${buyerType}) • ${posCart.map(i => i.name).join(', ')}`,
      facilityName: 'Twins Fitness BGC',
      amount: total,
      serviceFee: hasAccess ? 15 : 0,
      status: 'completed',
      type: 'payment',
      paymentMethod: method === 'cash' ? 'Cash Till' : method === 'app' ? 'Sodia App Pay' : 'Card Terminal'
    });

    const isQuickCashWalkin = buyerType === 'Quick Cash / Walk-in';
    const claimQr = isQuickCashWalkin ? 'CLAIM-QR-' + Math.floor(100000 + Math.random() * 900000) : undefined;

    clearPosCart();
    showToast(`✅ Payment settled: ₱${total.toLocaleString()} via ${method.toUpperCase()}`);
    return {
      success: true,
      message: 'Transaction completed and ledger written.',
      claimQr
    };
  };

  // Clubdash & Organizer Pro
  const [bracketMatches, setBracketMatches] = useState<BracketMatch[]>([
    {
      id: 'm_1',
      round: 1,
      courtName: 'Court 1',
      teamA: { name: 'Manila Smashers', score: 21, seed: 1, isWinner: true },
      teamB: { name: 'BGC Pickle Kings', score: 18, seed: 8, isWinner: false },
      status: 'completed'
    },
    {
      id: 'm_2',
      round: 1,
      courtName: 'Court 2',
      teamA: { name: 'Pasig Aces', score: 19, seed: 4, isWinner: false },
      teamB: { name: 'Makati Drop Shots', score: 21, seed: 5, isWinner: true },
      status: 'completed'
    },
    {
      id: 'm_semis_1',
      round: 2,
      courtName: 'Center Court',
      teamA: { name: 'Manila Smashers', seed: 1 },
      teamB: { name: 'Makati Drop Shots', seed: 5 },
      status: 'live'
    }
  ]);

  const recordMatchScore = (matchId: string, scoreA: number, scoreB: number) => {
    const isAWinner = scoreA > scoreB;
    setBracketMatches(prev =>
      prev.map(m => {
        if (m.id === matchId) {
          return {
            ...m,
            teamA: { ...m.teamA, score: scoreA, isWinner: isAWinner },
            teamB: { ...m.teamB, score: scoreB, isWinner: !isAWinner },
            status: 'completed'
          };
        }
        return m;
      })
    );
    showToast(`Bracket Score Finalized: ${scoreA} - ${scoreB}. Winner advanced! Push notification sent.`);
    dbService.updateMatchScore(matchId, scoreA, scoreB).catch(err => console.warn('[Supabase Match Sync Error]:', err));
  };

  const createTournamentEvent = (sport: string, format: string, venue: string, price: number) => {
    showToast(`🏆 Tournament Created: ${sport} (${format}) at ${venue}. Published to Sodia Discovery Feed with Dynamic Scarcity Surge.`);
  };

  // CoachDash State (Registry C)
  const [coachClients, setCoachClients] = useState<CoachClient[]>([
    {
      id: 'cl_1',
      name: 'Patricia Wu',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=250&q=80',
      goal: 'Hyrox & Strength',
      status: 'in_building',
      scheduledTime: '08:00 AM Today',
      plannedMacros: { protein: 130, carbs: 200, fats: 55, calories: 1850 },
      actualMacros: { protein: 125, carbs: 195, fats: 50, calories: 1800 },
      missedDays: 0,
      currentProgram: 'Block 2: Hypertrophy & Work Capacity',
      remainingSessions: 6
    },
    {
      id: 'cl_2',
      name: 'Gabriel Santos',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80',
      goal: 'Fat Loss & 100kg Bench',
      status: 'at_risk',
      plannedMacros: { protein: 160, carbs: 180, fats: 50, calories: 2000 },
      actualMacros: { protein: 90, carbs: 110, fats: 40, calories: 1200 },
      missedDays: 3, // Triggers automated nudge rule!
      currentProgram: 'Strength Wave 1',
      remainingSessions: 2
    },
    {
      id: 'cl_3',
      name: 'Bea Ramirez',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
      goal: 'Mobility & Hypertrophy',
      status: 'expected',
      scheduledTime: '10:30 AM Today',
      plannedMacros: { protein: 120, carbs: 170, fats: 45, calories: 1600 },
      actualMacros: { protein: 118, carbs: 165, fats: 44, calories: 1580 },
      missedDays: 1,
      currentProgram: 'Postural Reset V2',
      remainingSessions: 8
    }
  ]);

  const triggerClientNudge = (clientId: string) => {
    const client = coachClients.find(c => c.id === clientId);
    if (!client) return;
    showToast(`📩 Automated Nudge sent to @${client.name}'s Sodia inbox: "Hey! Noticed you missed targets for 3 days. Let's adjust training volume today."`);
  };

  const injectMacrocycleProgram = (clientId: string, programName: string) => {
    setCoachClients(prev =>
      prev.map(c => (c.id === clientId ? { ...c, currentProgram: programName } : c))
    );
    showToast(`Injected ${programName} into client's planned_track! Sodia app updated.`);
  };

  // Master Flowchart Simulator (Executes any of the 34 Deep Dives!)
  const runMasterFlowchartDeepDive = (diveNumber: number) => {
    switch (diveNumber) {
      case 1:
        showToast('Deep Dive 1: Auth Landing & SMS OTP auto-verified. JWT issued to Secure Enclave.');
        break;
      case 2:
        openCheckout(facilities[0], 'Day Pass', 250);
        showToast('Deep Dive 2: "Drop In" pill tapped on Discovery Card -> Universal Checkout bottom sheet mounted.');
        break;
      case 3:
        setSodiaTab('discover');
        showToast('Deep Dive 3: Discover Mapbox search for "Pickleball" -> panned to Metro Sports Arena.');
        break;
      case 4:
        setSodiaTab('cards');
        setIsQRFlapped(true);
        showToast('Deep Dive 4: Tapped center VIP card -> flipped 180° with ticking 60s QR code hash.');
        break;
      case 5:
        setSodiaTab('track');
        startLiftWorkout('Deep Dive 5 Bench Session');
        break;
      case 6:
        setSodiaTab('track');
        startMoveSession('Pickleball', true);
        break;
      case 7:
        setSodiaTab('track');
        logFoodItem({
          name: '2 Boiled Eggs & 1 Cup Rice',
          serving: 'NLP Parsed Meal',
          calories: 362,
          protein: 17,
          carbs: 45,
          fats: 11.4,
          mealType: 'lunch'
        });
        break;
      case 9:
        setPortal('gymdash-tablet');
        simulateGateScan('valid');
        break;
      case 10:
        setPortal('coachdash');
        triggerClientNudge('cl_2');
        break;
      case 11:
        showToast('Deep Dive 11 (Waitlist Sniper): Slot filled. User A placed on waitlist with pre-auth hold. Slot auto-captured when cleared!');
        break;
      case 12:
        setPortal('gymdash-tablet');
        simulateGateScan('squatter');
        break;
      case 13:
        const stamp = finishLiftWorkout();
        createPost('Verified workout session!', '', facilities[0], stamp);
        break;
      case 14:
        setPortal('gymdash-os');
        showToast('Deep Dive 14: Predictive Attrition CRM evaluated. 2 dormant members identified. 20% discount offer queued!');
        break;
      case 15:
        showToast('Deep Dive 15: Account deletion blocked: 1 active Monthly Subscription found. Cancel first or Deactivate.');
        break;
      case 17:
        setIsOfflineMode(true);
        setSodiaTab('cards');
        showToast('Deep Dive 17 (Offline Sync): No network. Fallback 6-digit TOTP (482-911) generated on screen!');
        break;
      case 18:
        setPortal('gymdash-tablet');
        simulateGateScan('coach_client');
        break;
      case 21:
        setPortal('clubdash');
        bookCourtSlot('fac_metro_arena', 'Pickleball Court A', '08:00 AM - 05:00 PM');
        break;
      case 22:
        setPortal('gymdash-tablet');
        showToast('Deep Dive 22: Scan #51 for a 50-person event! Flashes RED: Enforce Tier 0 Base Waiver & Micro-Fee.');
        break;
      case 23:
        setPortal('clubdash');
        recordMatchScore('m_semis_1', 21, 15);
        break;
      case 26:
        showToast('Deep Dive 26: Tournament cancelled due to rain. Stripe cascading split-clawback initiated: Organizer profit + venue rental fee refunded to all 16 teams.');
        break;
      case 30:
        setPortal('gymdash-tablet');
        addToPosCart({ id: 'sku_water', name: 'Bottled Electrolyte Water', price: 60, type: 'store' });
        showToast('Deep Dive 30 (Mixed Cart Tendering): Access + Store SKU in cart. "Pay via App" disabled to protect ledger routing.');
        break;
      case 31:
        showToast('Deep Dive 31: Immutability Guardrail: Editing pass price duplicates record to "Monthly Sub V2 - ₱1,700". V1 preserved for existing subscribers.');
        break;
      case 33:
        showToast('Deep Dive 33: B2B Staff Handshake card accepted! 4-Digit POS PIN issued (1234). Float Gate access unlocked.');
        break;
      case 34:
        setPortal('coachdash');
        injectMacrocycleProgram('cl_1', 'Wave 3: Peaking & Power');
        break;
      default:
        showToast(`Executed Deep Dive Scenario #${diveNumber}`);
    }
  };

  // ─── SUPABASE PROD BACKEND HYDRATION & REALTIME ───
  useEffect(() => {
    // 1. Fetch live facilities
    dbService.getFacilities().then(cloudFacilities => {
      if (cloudFacilities && cloudFacilities.length > 0) {
        setFacilities(cloudFacilities.map((f: any) => ({
          id: f.id,
          name: f.name,
          registry: f.registry,
          category: f.category,
          logo: f.logo,
          coverImage: f.cover_image,
          address: f.address,
          distance: f.distance || '0.8 km',
          coords: f.coords || { lat: 14.549, lng: 121.05 },
          liveCapacity: f.live_capacity || { current: 42, max: 100 },
          isOpen: f.is_open ?? true,
          hours: f.hours || '05:00 AM - 11:00 PM',
          amenities: f.amenities || [],
          dayPassPrice: Number(f.day_pass_price) || 250,
          monthlySubPrice: f.monthly_sub_price ? Number(f.monthly_sub_price) : undefined,
          courtHourlyPrice: f.court_hourly_price ? Number(f.court_hourly_price) : undefined,
          rating: Number(f.rating) || 4.9,
          reviewCount: f.review_count || 100,
          hasActiveChallenge: f.has_active_challenge ?? false,
          challengeTitle: f.challenge_title,
          spatialAssets: f.spatial_assets
        })));
      }
    });

    // 2. Fetch live tournament matches
    dbService.getTournamentMatches().then(cloudMatches => {
      if (cloudMatches && cloudMatches.length > 0) {
        setBracketMatches(cloudMatches.map((m: any) => ({
          id: m.id,
          round: m.round === 'Grand Finals' ? 3 : m.round.includes('Semi') ? 2 : 1,
          courtName: m.court_slot || 'Center Court',
          teamA: { name: m.player_a, score: m.score_a, seed: 1, isWinner: m.score_a > m.score_b },
          teamB: { name: m.player_b, score: m.score_b, seed: 2, isWinner: m.score_b > m.score_a },
          status: m.status as any
        })));
      }
    });

    // 3. Supabase Auth listener
    const { data: authListener } = authService.onAuthStateChange(user => {
      if (user) {
        dbService.getProfile(user.id).then(profile => {
          if (profile) {
            setCurrentUser(prev => ({
              ...prev,
              id: profile.id,
              name: profile.name || prev.name,
              username: profile.username || prev.username,
              avatar: profile.avatar || prev.avatar,
              bio: profile.bio || prev.bio
            }));
          }
        });
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  return (
    <EcosystemContext.Provider
      value={{
        portal,
        setPortal,
        sodiaTab,
        setSodiaTab,
        currentUser,
        setCurrentUser,
        postAsRole,
        setPostAsRole,
        switchRole,
        facilities,
        selectedFacility,
        setSelectedFacility,
        bookCourtSlot,
        passes,
        activePassIndex,
        setActivePassIndex,
        isQRFlapped,
        setIsQRFlapped,
        qrCountdown,
        isOfflineMode,
        setIsOfflineMode,
        sendPassToFriend,
        isCheckoutOpen,
        checkoutItem,
        openCheckout,
        closeCheckout,
        processCheckoutPayment,
        ledger,
        addLedgerEntry,
        voidOrRefundTransaction,
        posts,
        stories,
        challenges,
        toggleLikePost,
        createPost,
        acceptChallenge,
        submitChallengeEntry,
        activeLiftWorkout,
        startLiftWorkout,
        toggleLiftSet,
        addLiftSet,
        addLiftExercise,
        finishLiftWorkout,
        discardLiftWorkout,
        restTimer,
        adjustRestTimer,
        skipRestTimer,
        activeMoveSession,
        startMoveSession,
        pauseMoveSession,
        resumeMoveSession,
        finishMoveSession,
        foodLogs,
        hydrationLiters,
        addHydration,
        logFoodItem,
        parseNutritionixQuery,
        isStaffClockedIn,
        staffSelfieUrl,
        clockInStaffWithSelfie,
        isRegisterFloatUnlocked,
        registerFloatAmount,
        unlockRegisterWithFloat,
        liveInsideCount,
        scannedHistory,
        simulateGateScan,
        overrideDeniedScan,
        posCart,
        addToPosCart,
        removeFromPosCart,
        clearPosCart,
        tenderPosCart,
        bracketMatches,
        recordMatchScore,
        createTournamentEvent,
        coachClients,
        triggerClientNudge,
        injectMacrocycleProgram,
        toastMessage,
        showToast,
        runMasterFlowchartDeepDive
      }}
    >
      {children}
    </EcosystemContext.Provider>
  );
};

export const useEcosystem = () => {
  const context = useContext(EcosystemContext);
  if (!context) {
    throw new Error('useEcosystem must be used within an EcosystemProvider');
  }
  return context;
};
